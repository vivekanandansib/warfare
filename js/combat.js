class CombatEngine {
  constructor() {
    this.log = [];
    this.turn = 0;
    this.isPlayerTurn = false;
    this.targetingMode = null;
    this.selectedAction = null;
    this.combatEnded = false;
    this.momentum = 0;
    this.focusCount = 0;
    this.focusTarget = null;
    this.speed = 1;
    this.lastPlayerDamage = 0;
  }

  turnDelay(ms) {
    return Math.max(60, Math.round(ms / (this.speed || 1)));
  }

  initCombat(playerTeam, enemyTeam, options = {}) {
    const warm = (c, isPlayer) => ({
      ...c,
      currentHp: c.stats.hp,
      maxHp: c.stats.hp,
      energy: 100,
      maxEnergy: 100,
      buffs: [],
      debuffs: [],
      shield: 0,
      alive: true,
      isPlayer,
      perf: { dmg: 0, taken: 0, heal: 0, shield: 0, ctrl: 0, kills: 0 }
    });
    this.playerTeam = playerTeam.map(c => warm(c, true));
    this.enemyTeam = enemyTeam.map(c => warm(c, false));
    this.allUnits = [...this.playerTeam, ...this.enemyTeam];
    this.turn = 0;
    this.log = [];
    this.combatEnded = false;
    this.onLogUpdate = null;
    this.onCombatEnd = null;
    this.onTurnUpdate = null;
    this.onShapeUpdate = null;
    this.momentum = 0;
    this.focusCount = 0;
    this.focusTarget = null;
    this.morale = { player: 100, enemy: 100 };
    this.options = options;
    this.lastActingSide = null;
    this.lastPlayerDamage = 0;
    this._flavorIdx = 0;
    this.startTurn();
  }

  startTurn() {
    this.turn++;
    const alive = this.allUnits.filter(u => u.alive);
    if (alive.length === 0) { this.endCombat('draw'); return; }
    const alivePlayer = this.playerTeam.filter(u => u.alive);
    const aliveEnemy = this.enemyTeam.filter(u => u.alive);
    if (alivePlayer.length === 0) { this.endCombat('enemy'); return; }
    if (aliveEnemy.length === 0) { this.endCombat('player'); return; }

    let fastest;
    if (this.lastActingSide === null) {
      // opening move: fastest alive unit overall wins initiative
      fastest = this.allUnits.filter(u => u.alive).sort((a, b) => this.getEffectiveStat(b, 'spd') - this.getEffectiveStat(a, 'spd'))[0];
    } else {
      // otherwise alternate sides so the opponent always gets to act
      const nextSide = this.lastActingSide === 'player' ? aliveEnemy : alivePlayer;
      const otherSide = this.lastActingSide === 'player' ? alivePlayer : aliveEnemy;
      const pool = nextSide.length ? nextSide : otherSide;
      fastest = pool.sort((a, b) => this.getEffectiveStat(b, 'spd') - this.getEffectiveStat(a, 'spd'))[0];
    }
    this.lastActingSide = fastest.isPlayer ? 'player' : 'enemy';
    this.currentUnit = fastest;
    this.processBuffs(fastest);

    if (fastest.isPlayer) {
      this.isPlayerTurn = true;
      this.addLog(`--- Your Turn: ${fastest.name} ---`, 'info');
    } else {
      this.isPlayerTurn = false;
      this.addLog(`--- ${fastest.name}'s Turn ---`, 'info');
      setTimeout(() => this.enemyAI(fastest), this.turnDelay(800));
    }

    if (this.onTurnUpdate) this.onTurnUpdate(fastest);
  }

  processBuffs(unit) {
    unit.buffs = unit.buffs.filter(b => {
      b.remaining--;
      return b.remaining > 0;
    });
    unit.debuffs = unit.debuffs.filter(d => {
      d.remaining--;
      return d.remaining > 0;
    });
  }

  getEffectiveStat(unit, stat) {
    let base = unit.stats[stat] || 0;
    unit.buffs.forEach(b => { if (b.stat === stat) base += b.amount; });
    (unit.debuffs || []).forEach(d => { if (d.stat === stat) base -= d.amount; });

    if (unit.isPlayer && unit.talents) {
      if (stat === 'def' && this.talentRank(unit, 'unbreakable') && unit.currentHp < unit.maxHp * 0.3) {
        base *= (1 + this.talentVal(unit, 'unbreakable') / 100);
      }
    }
    return Math.max(1, base);
  }

  talentRank(unit, id) {
    return (unit && unit.talents && unit.talents[id]) || 0;
  }

  talentVals(id) {
    for (const key in ROLE_TREES) {
      const node = ROLE_TREES[key].nodes[id];
      if (node) return node.vals;
    }
    return [0, 0, 0];
  }

  talentVal(unit, id) {
    const rank = this.talentRank(unit, id);
    if (!rank) return 0;
    const vals = this.talentVals(id);
    return vals[rank - 1] || 0;
  }

  isDebuffed(unit) {
    return !!(unit.debuffs && unit.debuffs.length > 0);
  }

  applyDebuff(unit, target, debuff, fromPlayer = true) {
    if (!target || !target.alive || !unit) return;
    let d = { ...debuff };
    if (fromPlayer && unit.isPlayer && unit.talents) {
      d.remaining += this.talentVal(unit, 'deepen');
      if (unit.perf) unit.perf.ctrl++;
      const sap = this.talentVal(unit, 'sap');
      if (sap && target.energy) target.energy = Math.max(0, target.energy - sap);
      const dem = this.talentVal(unit, 'demoralize');
      if (dem) this.morale.enemy = Math.max(0, this.morale.enemy - dem);
      const hex = this.talentVal(unit, 'hex');
      if (hex) this.heal(unit, hex);
    }
    target.debuffs.push(d);
    return d;
  }

  calculateDamage(attacker, defender, multiplier = 1) {
    const atk = this.getEffectiveStat(attacker, 'atk');
    const def = this.getEffectiveStat(defender, 'def');
    let base = Math.max(1, (atk * 2 - def) * multiplier);
    const variance = base * 0.15;

    if (attacker.isPlayer && attacker.talents) {
      if (this.talentRank(attacker, 'executioner') && defender.currentHp < defender.maxHp * 0.3) {
        base *= (1 + this.talentVal(attacker, 'executioner') / 100);
      }
      if (this.talentRank(attacker, 'overwhelm') && defender.currentHp >= defender.maxHp) {
        base *= (1 + this.talentVal(attacker, 'overwhelm') / 100);
      }
      if (this.talentRank(attacker, 'adrenaline') && attacker.energy >= 80) {
        base *= (1 + this.talentVal(attacker, 'adrenaline') / 100);
      }
      if (this.talentRank(attacker, 'entangle') && this.isDebuffed(defender)) {
        base *= (1 + this.talentVal(attacker, 'entangle') / 100);
      }
    }

    if (attacker.isPlayer) {
      if (this.momentum > 0) base *= (1 + this.momentum * 0.05);
      if (this.focusTarget === defender && this.focusCount > 1) base *= (1 + (this.focusCount - 1) * 0.04);
    }

    return Math.round(base + (Math.random() * variance * 2 - variance));
  }

  buildShape(source, target) {
    if (this.focusTarget === target) {
      this.focusCount = Math.min(4, this.focusCount + 1);
    } else {
      this.focusTarget = target;
      this.focusCount = 1;
    }
    const before = this.momentum;
    this.momentum = Math.min(5, this.momentum + 1);
    if (this.momentum > before && this.momentum >= 3) {
      this.addLog(`⚡ ${source.name} rides a ${this.momentum}-hit rhythm, the next blow lands heavier!`, 'special');
    }
    this.emitShape();
  }

  breakShape(reason) {
    if (this.momentum > 0 || this.focusCount > 1) {
      this.momentum = 0;
      this.focusCount = 0;
      this.focusTarget = null;
      this.addLog(reason + ' Momentum reset.', 'miss');
      this.emitShape();
    }
  }

  emitShape() {
    if (this.onShapeUpdate) this.onShapeUpdate({ momentum: this.momentum, focusCount: this.focusCount });
  }

  calculateSpecialDamage(attacker, defender, multiplier = 1.5) {
    const spAtk = this.getEffectiveStat(attacker, 'spAtk');
    const def = this.getEffectiveStat(defender, 'def');
    let base = Math.max(1, (spAtk * 2.2 - def) * multiplier);
    const variance = base * 0.2;

    if (attacker.isPlayer && attacker.talents) {
      if (this.talentRank(attacker, 'executioner') && defender.currentHp < defender.maxHp * 0.3) {
        base *= (1 + this.talentVal(attacker, 'executioner') / 100);
      }
      if (this.talentRank(attacker, 'entangle') && this.isDebuffed(defender)) {
        base *= (1 + this.talentVal(attacker, 'entangle') / 100);
      }
    }
    return Math.round(base + (Math.random() * variance * 2 - variance));
  }

  getKingdomBonus(attacker, defender) {
    const attackerKingdom = attacker.kingdom || attacker.id;
    const defenderKingdom = defender.kingdom || defender.id;
    const kingdomData = KINGDOMS[attackerKingdom];
    if (kingdomData && kingdomData.bonusVs === defenderKingdom) return 1.2;
    return 1;
  }

applyDamage(target, damage, source) {
    if (target.mirrorImages > 0 && damage > 0) {
      target.mirrorImages--;
      this.addLog(`A mirror image of ${target.name} takes the blow, the real one is elsewhere!`, 'miss');
      if (source && source.perf) source.perf.dmg += damage;
      if (target.perf) target.perf.taken += damage;
      return 0;
    }
    let dmg = damage;
    // The perfected mirror hits like the Age itself, but never in one, unanswerable blow.
    if (source && source.isCrownBoss && target.maxHp) dmg = Math.min(dmg, Math.max(1, Math.round(target.maxHp * 0.75)));
    if (source && source.isPlayer && !target.isPlayer) {
      this.buildShape(source, target);
      this.lastPlayerDamage = dmg;
    }
    if (source && source.kingdom && target.kingdom && this.getKingdomBonus(source, target) === 1.2) {
      dmg = Math.round(dmg * 1.2);
    }
    if (target._dmgResist) {
      dmg = Math.max(1, Math.round(dmg * (1 - target._dmgResist)));
    }
    if (target.passives && target.passives.crisis && target.maxHp && (target.currentHp / target.maxHp) < 0.3) {
      const before = dmg;
      dmg = Math.max(1, Math.round(dmg * 0.75));
      if (dmg !== before) this.addLog(`${target.name}'s Crisis Armor holds, only ${dmg} damage gets through!`, 'info');
    }
    if (target.passives && target.passives.shardCharm && target.maxHp && (target.currentHp / target.maxHp) < 0.3) {
      const before = dmg;
      dmg = Math.max(1, Math.round(dmg * 0.85));
      if (dmg !== before) this.addLog(`${target.name}'s Warding Charm hums, only ${dmg} damage gets through!`, 'info');
    }
    if (target.shield > 0) {
      if (dmg <= target.shield) {
        target.shield -= dmg;
        this.addLog(`${target.name}'s shield absorbed ${dmg} damage!`, 'info');
        if (source && source.perf) source.perf.dmg += dmg;
        return 0;
      } else {
        dmg -= target.shield;
        this.addLog(`${target.name}'s shield absorbed ${target.shield} damage!`, 'info');
        target.shield = 0;
      }
    }
    target.currentHp = Math.max(0, target.currentHp - dmg);
    if (dmg > 0 && target.isPlayer && source && !source.isPlayer && !source.isTrainingDummy) {
      this.breakShape(`${source.name}'s blow breaks the rhythm!`);
    }
    if (source && source.perf) { source.perf.dmg += dmg; }
    if (target.perf) target.perf.taken += dmg;
    this.maybeBossTalk(target);
    if (target.currentHp <= 0) {
      const rebirther = this.findRebirther();
      if (target.isPlayer && rebirther) {
        this._rebirthUsedBy = rebirther.name;
        target.alive = true;
        target.currentHp = Math.max(1, Math.round(target.maxHp * this.talentVal(rebirther, 'rebirth') / 100));
        this.addLog(`${rebirther.name} calls ${target.name} back from the brink!`, 'heal');
      } else {
        target.alive = false;
        this.addLog(`${target.name} has fallen! ${this.flavor('fallen')}`, 'damage');
        if (source && source.perf) source.perf.kills++;
        if (source && source.isPlayer && source.talents && this.talentRank(source, 'bloodrush')) {
          const healAmt = Math.round(dmg * this.talentVal(source, 'bloodrush') / 100);
          this.heal(source, healAmt);
        }
      }
    }
    if (target.isPlayer && target.talents && this.talentRank(target, 'counter') && source && source.alive && source !== target) {
      const reflected = Math.round(dmg * this.talentVal(target, 'counter') / 100);
      if (reflected > 0) {
        source.currentHp = Math.max(0, source.currentHp - reflected);
        if (target.perf) target.perf.dmg += reflected;
        if (source.perf) source.perf.taken += reflected;
        this.addLog(`${target.name} reflects ${reflected} damage!`, 'special');
        if (source.currentHp <= 0) {
          source.alive = false;
          this.addLog(`${source.name} has fallen! ${this.flavor('fallen')}`, 'damage');
          if (target.perf) target.perf.kills++;
        }
      }
    }
    return dmg;
  }

  flavor(key) {
    const pool = COMBAT_FLAVOR[key];
    if (!pool || !pool.length) return '';
    return pool[this._flavorIdx++ % pool.length];
  }

  maybeBossTalk(target) {
    if (target.isPlayer || !target.alive || target._phaseSpoken) return;
    if (target.currentHp <= 0 || target.currentHp > target.maxHp * 0.5) return;
    target._phaseSpoken = true;
    const line = this.bossPhaseLine(target);
    if (line) this.addLog(line.replace(/\{N\}/g, target.name), 'boss');
  }

  bossPhaseLine(target) {
    const pick = (pool) => pool[this._flavorIdx++ % pool.length];
    if (target.isCrownBoss) return pick(COMBAT_FLAVOR.phaseCrown);
    if (target.isRift) return pick(COMBAT_FLAVOR.phaseRift);
    if (target.isDeception || target.kingdom === 'deception' || target.lastKing || target.isFinalBoss) return pick(COMBAT_FLAVOR.phaseDeception);
    return pick(COMBAT_FLAVOR.phaseGeneric);
  }

  heal(target, amount, caster = null) {
    let amt = amount;
    if (target._healMult) {
      amt = Math.round(amt * target._healMult);
    }
    let wasLow = target.currentHp < target.maxHp * 0.3;
    if (caster && caster.isPlayer && caster.talents && this.talentRank(caster, 'mend')) {
      amt = Math.round(amt * (1 + this.talentVal(caster, 'mend') / 100));
    }
    const healed = Math.min(amt, target.maxHp - target.currentHp);
    target.currentHp += healed;
    if (caster && caster.isPlayer && caster.perf) caster.perf.heal += healed;
    if (healed > 0) this.addLog(`${target.name} recovered ${healed} HP! ${this.flavor('heal')}`, 'heal');

    if (caster && caster.isPlayer && caster.talents) {
      if (this.talentRank(caster, 'sooth') && target.debuffs.length) {
        const removed = target.debuffs.splice(0, this.talentRank(caster, 'sooth'));
        this.addLog(`${target.name} is cleansed of ${removed.length} debuff(s)!`, 'heal');
      }
      if (this.talentRank(caster, 'polished') && healed < amt) {
        const overflow = amt - healed;
        const shieldAmt = Math.round(overflow * this.talentVal(caster, 'polished') / 100);
        if (shieldAmt > 0) {
          target.shield += shieldAmt;
          this.addLog(`${overflow} overflow becomes a shield for ${target.name}!`, 'heal');
        }
      }
      if (this.talentRank(caster, 'invigorate')) {
        const gained = this.talentVal(caster, 'invigorate');
        caster.energy = Math.min(caster.maxEnergy, caster.energy + gained);
      }
      if (this.talentRank(caster, 'grace') && wasLow && target.isPlayer) {
        target.buffs.push({ stat: 'atk', amount: this.talentVal(caster, 'grace'), remaining: 2 });
        this.addLog(`${target.name} surges with Warding Grace!`, 'heal');
      }
    }
    return healed;
  }

  findRebirther() {
    if (this._rebirthUsedBy) return null;
    return this.playerTeam.find(u => u.alive && u.isPlayer && u.talents && this.talentRank(u, 'rebirth'));
  }

  playerAction(action, targetIndex) {
    if (!this.isPlayerTurn || this.combatEnded) return;
    const unit = this.currentUnit;

    this.isPlayerTurn = false;

    switch (action) {
      case 'attack': {
        const target = this.enemyTeam[targetIndex];
        if (!target || !target.alive) { this.isPlayerTurn = true; return; }
        const critBoost = unit.buffs.find(b => b.stat === 'critBoost');
        let critChance = critBoost ? 1.0 : (0.1 + (this.getEffectiveStat(unit, 'spd') / 500));
        if (unit.talents) {
          critChance += this.talentVal(unit, 'keenedge') / 100;
          if (this.talentRank(unit, 'mystify') && this.isDebuffed(target)) {
            critChance += this.talentVal(unit, 'mystify') / 100;
          }
        }
        const isCrit = Math.random() < critChance;
        let critMult = isCrit ? 1.8 : 1;
        if (isCrit && unit.talents && this.talentRank(unit, 'precision')) {
          critMult += this.talentVal(unit, 'precision') / 100;
        }
        const damage = this.calculateDamage(unit, target, critMult);
        const actual = this.applyDamage(target, damage, unit);
        if (isCrit && actual > 0) {
          this.addLog(`CRITICAL HIT!`, 'special');
          this.addLog(`${unit.name} attacks ${target.name} for ${damage} damage! ${this.flavor('crit')}`, 'damage');
          particles.screenShake(8, 200);
          particles.flash('#e74c3c', 200);
        } else {
          this.addLog(`${unit.name} attacks ${target.name} for ${damage} damage! ${this.flavor('strikeAlly')}`, 'damage');
          particles.screenShake(3, 150);
        }
        this.showDamagePopup(target, damage, '#e74c3c');
        this.morale.player = Math.min(100, this.morale.player + 5);
        this.morale.enemy = Math.max(0, this.morale.enemy - 3);
        break;
      }
      case 'defend': {
        let shieldAmount = Math.round(this.getEffectiveStat(unit, 'def') * 0.8);
        if (unit.talents && this.talentRank(unit, 'bulwark')) {
          shieldAmount = Math.round(shieldAmount * (1 + this.talentVal(unit, 'bulwark') / 100));
        }
        unit.shield = shieldAmount;
        this.addLog(`${unit.name} raises their guard! (Shield: ${unit.shield}) ${this.flavor('guard')}`, 'info');
        unit.energy = Math.min(unit.maxEnergy, unit.energy + 20);
        if (unit.perf) unit.perf.shield += shieldAmount;
        if (unit.talents && this.talentRank(unit, 'aegis')) {
          const weak = this.playerTeam.filter(a => a.alive).reduce((a, b) => (a.currentHp / a.maxHp) <= (b.currentHp / b.maxHp) ? a : b, null);
          if (weak && weak !== unit) {
            const allyShield = Math.round(shieldAmount * this.talentVal(unit, 'aegis') / 100);
            weak.shield += allyShield;
            if (unit.perf) unit.perf.shield += allyShield;
            this.addLog(`${unit.name}'s Aegis shields ${weak.name} too!`, 'info');
          }
        }
        break;
      }
      case 'heal': {
        const allies = this.playerTeam.filter(a => a.alive && a.currentHp < a.maxHp);
        if (allies.length === 0) {
          this.addLog('No allies need healing! Using basic attack instead.', 'miss');
          const fallback = this.enemyTeam.find(e => e.alive);
          if (fallback) {
            const damage = this.calculateDamage(unit, fallback);
            this.applyDamage(fallback, damage, unit);
            this.showDamagePopup(fallback, damage, '#e74c3c');
          }
          break;
        }
        const weakest = allies.reduce((a, b) => (a.currentHp / a.maxHp) < (b.currentHp / b.maxHp) ? a : b);
        if (unit.energy < 25) {
          this.addLog('Not enough energy! Using basic attack instead.', 'miss');
          const fallback = this.enemyTeam.find(e => e.alive);
          if (fallback) {
            const damage = this.calculateDamage(unit, fallback);
            this.applyDamage(fallback, damage, unit);
            this.showDamagePopup(fallback, damage, '#e74c3c');
          }
          break;
        }
        unit.energy -= 25;
        const healAmount = Math.round(this.getEffectiveStat(unit, 'spAtk') * 0.8 + 15);
        this.heal(weakest, healAmount, unit);
        this.showDamagePopup(weakest, healAmount, '#2ecc71');
        break;
      }
      case 'special': {
        const target = this.enemyTeam[targetIndex];
        if (!target || !target.alive) { this.isPlayerTurn = true; return; }
        if (unit.energy < 30) {
          this.addLog('Not enough energy! Using basic attack instead.', 'miss');
          const damage = this.calculateDamage(unit, target);
          this.applyDamage(target, damage, unit);
          this.addLog(`${unit.name} attacks ${target.name} for ${damage}! ${this.flavor('strikeAlly')}`, 'damage');
        } else {
          unit.energy -= 30;
          this.executeSpecial(unit, target);
        }
        break;
      }
    }

    unit.energy = Math.min(unit.maxEnergy, unit.energy + 10);
    this.checkCombatEnd() || setTimeout(() => this.startTurn(), this.turnDelay(1000));
  }

  useBattleItem(item) {
    if (!this.isPlayerTurn || this.combatEnded) return;
    if (!item || !item.effect || (item.effect.type !== 'heal' && item.effect.type !== 'energy' && item.effect.type !== 'revive')) return;
    if (item.effect.type === 'revive') {
      const dead = this.playerTeam.find(u => !u.alive);
      if (!dead) return;
    }
    const unit = this.currentUnit;
    this.isPlayerTurn = false;
    let target = unit;
    if (item.effect.type === 'heal') {
      target = this.playerTeam
        .filter(a => a.alive)
        .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0];
      if (!target) return;
    }
    this.useItem(item, target);
    unit.energy = Math.min(unit.maxEnergy, unit.energy + 10);
    this.checkCombatEnd() || setTimeout(() => this.startTurn(), this.turnDelay(1000));
  }

  executeSpecial(unit, target) {
    if (unit.isPlayer && unit.talents && this.talentRank(unit, 'fortify')) {
      unit.buffs.push({ stat: 'def', amount: this.talentVal(unit, 'fortify'), remaining: 2 });
      this.addLog(`${unit.name} fortifies their defense!`, 'info');
    }

    const kingdomId = unit.kingdom || unit.id;
    const kingdom = KINGDOMS[kingdomId];
    if (!kingdom) {
      const damage = this.calculateSpecialDamage(unit, target);
      this.applyDamage(target, damage, unit);
      this.addLog(`${unit.name} uses a special attack for ${damage} damage! ${this.flavor('special')}`, 'special');
      return;
    }

    switch (kingdomId) {
      case 'altruism': {
        this.playerTeam.filter(u => u.alive).forEach(u => {
          this.heal(u, Math.round(this.getEffectiveStat(unit, 'spAtk') * 0.6), unit);
          u.shield += Math.round(u.maxHp * 0.15);
          if (unit.perf) unit.perf.shield += Math.round(u.maxHp * 0.15);
        });
        this.addLog(`${kingdom.specialMove}! All allies healed and shielded!`, 'special');
        particles.flash('#2ecc71', 400);
        break;
      }
      case 'accord': {
        const t = this.enemyTeam.find(e => e.alive);
        if (t) {
          this.applyDebuff(unit, t, { stat: 'atk', amount: 20, remaining: 2 });
          this.addLog(`${kingdom.specialMove}! ${t.name} is bound!`, 'special');
        }
        this.playerTeam.filter(u => u.alive).forEach(u => {
          u.buffs.push({ stat: 'atk', amount: 15, remaining: 2 });
        });
        break;
      }
      case 'rapport': {
        this.enemyTeam.filter(e => e.alive).forEach(e => {
          this.applyDebuff(unit, e, { stat: 'def', amount: Math.round(this.getEffectiveStat(e, 'def') * 0.3), remaining: 3 });
        });
        this.addLog(`${kingdom.specialMove}! All enemy defenses reduced!`, 'special');
        break;
      }
      case 'valor': {
        const damage = this.calculateSpecialDamage(unit, target, 2.5);
        this.applyDamage(target, damage, unit);
        this.addLog(`${kingdom.specialMove}! ${damage} devastating damage to ${target.name}!`, 'special');
        particles.screenShake(12, 300);
        particles.flash('#e74c3c', 300);
        this.showDamagePopup(target, damage, '#ff0000');
        if (Math.random() < 0.3) {
          this.applyDebuff(unit, target, { stat: 'spd', amount: 50, remaining: 1 });
          this.addLog(`${target.name} is stunned!`, 'special');
        }
        break;
      }
      case 'clement': {
        const missingRatio = 1 - (target.currentHp / target.maxHp);
        const damage = this.calculateSpecialDamage(unit, target, 1 + missingRatio * 2);
        this.applyDamage(target, damage, unit);
        this.addLog(`${kingdom.specialMove}! ${damage} damage (stronger against the weak)!`, 'special');
        break;
      }
      case 'vigilant': {
        this.playerTeam.filter(u => u.alive).forEach(u => {
          const s = Math.round(unit.maxHp * 0.4);
          u.shield += s;
          if (unit.perf) unit.perf.shield += s;
        });
        this.addLog(`${kingdom.specialMove}! Massive shield for the entire party!`, 'special');
        particles.flash('#95a5a6', 400);
        break;
      }
      case 'scrupulous': {
        unit.buffs.push({ stat: 'critBoost', amount: 100, remaining: 1 });
        const damage = this.calculateSpecialDamage(unit, target, 2.8);
        this.applyDamage(target, damage, unit);
        this.addLog(`${kingdom.specialMove}! TRUE SIGHT critical for ${damage}!`, 'special');
        particles.screenShake(10, 250);
        this.showDamagePopup(target, damage, '#ffffff');
        break;
      }
      case 'spunk': {
        const roll = Math.random();
        if (roll < 0.33) {
          const damage = this.calculateSpecialDamage(unit, target, 3);
          this.applyDamage(target, damage, unit);
          this.addLog(`${kingdom.specialMove}! WILD SURGE: ${damage} MASSIVE damage!`, 'special');
          particles.screenShake(15, 400);
          particles.flash('#e67e22', 300);
        } else if (roll < 0.66) {
          this.playerTeam.filter(u => u.alive).forEach(u => {
            this.heal(u, Math.round(u.maxHp * 0.3), unit);
          });
          this.addLog(`${kingdom.specialMove}! WILD SURGE: Healing wave!`, 'heal');
        } else {
          this.enemyTeam.filter(e => e.alive).forEach(e => {
            this.applyDebuff(unit, e, { stat: 'atk', amount: 20, remaining: 2 });
            this.applyDebuff(unit, e, { stat: 'def', amount: 20, remaining: 2 });
          });
          this.addLog(`${kingdom.specialMove}! WILD SURGE: Chaos debuff on all enemies!`, 'special');
        }
        break;
      }
      default: {
        const damage = this.calculateSpecialDamage(unit, target);
        this.applyDamage(target, damage, unit);
        this.addLog(`${unit.name} uses a special attack for ${damage}! ${this.flavor('special')}`, 'special');
      }
    }
  }

  enemyAI(unit) {
    if (this.combatEnded || !unit.alive) return;
    const alivePlayerTargets = this.playerTeam.filter(u => u.alive);
    const aliveEnemies = this.enemyTeam.filter(u => u.alive);
    if (alivePlayerTargets.length === 0) return;

    const shouldSpecial = unit.energy >= 30 && Math.random() < 0.35;
    if (shouldSpecial) {
      unit.energy -= 30;
      const target = alivePlayerTargets[Math.floor(Math.random() * alivePlayerTargets.length)];
      this.executeEnemySpecial(unit, target);
    } else if (Math.random() < 0.2 && unit.currentHp < unit.maxHp * 0.5) {
      unit.shield = Math.round(this.getEffectiveStat(unit, 'def') * 0.6);
      this.addLog(`${unit.name} raises their guard! ${this.flavor('guard')}`, 'info');
      unit.energy = Math.min(unit.maxEnergy, unit.energy + 15);
    } else {
      const target = alivePlayerTargets[Math.floor(Math.random() * alivePlayerTargets.length)];
      const damage = this.calculateDamage(unit, target);
      this.applyDamage(target, damage, unit);
      this.addLog(`${unit.name} attacks ${target.name} for ${damage} damage! ${this.flavor('strikeFoe')}`, 'damage');
      this.showDamagePopup(target, damage, '#e74c3c');
      particles.screenShake(3, 150);
    }

    unit.energy = Math.min(unit.maxEnergy, unit.energy + 10);
    this.checkCombatEnd() || setTimeout(() => this.startTurn(), this.turnDelay(600));
  }

  executeEnemySpecial(unit, target) {
    const id = unit.id || unit.kingdom;
    switch (id) {
      case 'lust': {
        if (Math.random() < 0.4) {
          const ally = this.playerTeam.filter(u => u.alive && u !== target)[Math.floor(Math.random() * Math.max(1, this.playerTeam.filter(u => u.alive && u !== target).length))];
          if (ally) {
            const damage = this.calculateDamage(target, ally);
            this.applyDamage(ally, damage, target);
            this.addLog(`${unit.name} charms ${target.name} into attacking ${ally.name} for ${damage}!`, 'special');
            return;
          }
        }
        const damage = this.calculateSpecialDamage(unit, target);
        this.applyDamage(target, damage, unit);
        this.addLog(`${unit.name} uses Charm on ${target.name} for ${damage}!`, 'special');
        break;
      }
      case 'lie': {
        unit.mirrorImages = 2;
        this.addLog(`${unit.name} creates two mirror images! The next strikes may find only glass.`, 'special');
        const damage = this.calculateSpecialDamage(unit, target, 0.8);
        this.applyDamage(target, damage, unit);
        this.addLog(`The real ${unit.name} cuts through the illusion of it, ${damage}!`, 'damage');
        break;
      }
      case 'greed': {
        const stolen = Math.round(target.currentHp * 0.3);
        this.applyDamage(target, stolen, unit);
        this.heal(unit, stolen);
        this.addLog(`${unit.name} siphons ${stolen} HP from ${target.name}!`, 'special');
        break;
      }
      case 'wrath': {
        this.playerTeam.filter(u => u.alive).forEach(u => {
          const damage = this.calculateSpecialDamage(unit, u, 1.2);
          this.applyDamage(u, damage, unit);
        });
        unit.stats.def = Math.max(1, unit.stats.def - 20);
        this.addLog(`${unit.name} goes on a RAMPAGE! All allies hit!`, 'special');
        particles.screenShake(15, 500);
        particles.flash('#ff1744', 400);
        break;
      }
      case 'envy': {
        const copied = this.lastPlayerDamage > 0 ? Math.round(this.lastPlayerDamage * 1.15) : null;
        const damage = copied !== null ? copied : this.calculateSpecialDamage(unit, target, 1.2);
        this.applyDamage(target, damage, unit);
        this.addLog(copied !== null
          ? `${unit.name} mimics the very blow your side landed last, ${damage} damage back at you!`
          : `${unit.name} mimics a special attack for ${damage}!`, 'special');
        break;
      }
      case 'pride': {
        const damage = this.calculateSpecialDamage(unit, target, 2.2);
        this.applyDamage(target, damage, unit);
        unit.debuffs.push({ stat: 'spd', amount: 100, remaining: 1 });
        this.addLog(`${unit.name} uses Imperial Decree for ${damage}! But is too arrogant to move next turn!`, 'special');
        particles.screenShake(12, 400);
        break;
      }
      case 'sloth': {
        this.playerTeam.filter(u => u.alive).forEach(u => {
          u.energy = Math.max(0, u.energy - 20);
          u.debuffs.push({ stat: 'spd', amount: Math.round(this.getEffectiveStat(u, 'spd') * 0.5), remaining: 3 });
        });
        this.addLog(`${unit.name} emits Despair Aura! All enemies weakened!`, 'special');
        break;
      }
      default: {
        const damage = this.calculateSpecialDamage(unit, target);
        this.applyDamage(target, damage, unit);
        this.addLog(`${unit.name} uses a special attack for ${damage}!`, 'special');
      }
    }
  }

  showDamagePopup(target, damage, color) {
    const popup = document.createElement('div');
    popup.className = 'damage-popup';
    popup.textContent = `-${damage}`;
    popup.style.color = color;
    popup.style.textShadow = `0 0 10px ${color}`;
    const el = document.querySelector(`[data-unit-id="${target.name}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      popup.style.left = `${rect.left + rect.width / 2 - 20}px`;
      popup.style.top = `${rect.top}px`;
    } else {
      popup.style.left = `${window.innerWidth / 2}px`;
      popup.style.top = `${window.innerHeight / 2}px`;
    }
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), this.turnDelay(1000));
  }

  addLog(message, type = 'info') {
    this.log.push({ message, type, turn: this.turn });
    if (this.onLogUpdate) this.onLogUpdate(this.log);
  }

  checkCombatEnd() {
    const alivePlayer = this.playerTeam.filter(u => u.alive);
    const aliveEnemy = this.enemyTeam.filter(u => u.alive);
    if (aliveEnemy.length === 0) {
      setTimeout(() => this.endCombat('player'), this.turnDelay(500));
      return true;
    }
    if (alivePlayer.length === 0) {
      setTimeout(() => this.endCombat('enemy'), this.turnDelay(500));
      return true;
    }
    return false;
  }

  endCombat(winner) {
    this.combatEnded = true;
    if (this.onCombatEnd) this.onCombatEnd(winner, this.playerTeam, this.enemyTeam);
  }

  useItem(item, target) {
    if (!target || !target.alive) return;
    switch (item.effect.type) {
      case 'heal':
        this.heal(target, item.effect.amount);
        this.addLog(`${target.name} used ${item.name} and recovered ${item.effect.amount} HP!`, 'heal');
        break;
      case 'energy':
        target.energy = Math.min(target.maxEnergy, target.energy + item.effect.amount);
        this.addLog(`${target.name} used ${item.name} and recovered ${item.effect.amount} Energy!`, 'heal');
        break;
      case 'revive': {
        const dead = this.playerTeam.find(u => !u.alive);
        if (dead) {
          dead.alive = true;
          dead.currentHp = Math.round(dead.maxHp * item.effect.amount);
          this.addLog(`${dead.name} has been revived!`, 'heal');
        }
        break;
      }
    }
  }
}

const combat = new CombatEngine();
