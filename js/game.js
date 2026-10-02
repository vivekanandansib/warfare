class Game {
  constructor() {
    this.state = null;
    this.currentScreen = 'title';
    this.storyIndex = 0;
    this.storyPhase = 'intro';
    this.selectedKingdom = null;
    this.selectedClass = null;
    this.competitionRound = 0;
    this.competitionQueue = [];
    this.saveSlots = ['warfare_save_s1', 'warfare_save_s2', 'warfare_save_s3'];
    this._skipPrologueOffer = false;
    this.combatSpeed = 1;
  }

  init() {
    this.bindEvents();
    particles.start('#f1c40f', 'stars');
    this.showScreen('title');
    this.startTitleCinematic();
    this.initAudio();
  }

  /* Lightweight procedural audio, always available, never loud. */
  initAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.audioFx = { ctx: null, master: null, ambient: null, muted: false };
      this.ensureAudio();
    } catch (e) { this.audioFx = null; }
  }

  ensureAudio() {
    if (!this.audioFx || this.audioFx.muted) return;
    try {
      if (!this.audioFx.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.audioFx.ctx = new AC();
        this.audioFx.master = this.audioFx.ctx.createGain();
        this.audioFx.master.gain.value = 0.35;
        this.audioFx.master.connect(this.audioFx.ctx.destination);
        this.startAmbientAudio();
      }
      if (this.audioFx.ctx.state === 'suspended') this.audioFx.ctx.resume();
    } catch (e) { /* audio is optional */ }
  }

  startAmbientAudio() {
    try {
      const ac = this.audioFx.ctx, master = this.audioFx.master;
      const g = ac.createGain(); g.gain.value = 0.02; g.connect(master);
      const o1 = ac.createOscillator(); o1.type = 'sine'; o1.frequency.value = 55;
      const o2 = ac.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 55.6;
      const o3 = ac.createOscillator(); o3.type = 'sine'; o3.frequency.value = 164.8;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260;
      o1.connect(lp); o2.connect(lp); o3.connect(lp); lp.connect(g);
      // slow breath
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.07;
      const lfoG = ac.createGain(); lfoG.gain.value = 0.012;
      lfo.connect(lfoG); lfoG.connect(g.gain);
      this.audioFx.ambient = { o1, o2, o3, lfo, lp, g };
      o1.start(); o2.start(); o3.start(); lfo.start();
    } catch (e) { /* noop */ }
  }

  toggleMute() {
    if (!this.audioFx) return;
    this.audioFx.muted = !this.audioFx.muted;
    if (this.audioFx.muted) {
      try { if (this.audioFx.ctx && this.audioFx.ctx.state === 'running') this.audioFx.ctx.suspend(); } catch (e) {}
    } else {
      this.ensureAudio();
    }
    const btn = document.getElementById('audio-toggle');
    if (btn) btn.textContent = this.audioFx.muted ? '🔇' : '🔊';
    this.save();
  }

  fxStinger(kind) {
    try {
      this.ensureAudio();
      if (!this.audioFx || !this.audioFx.ctx || this.audioFx.muted) return;
      const ac = this.audioFx.ctx, master = this.audioFx.master;
      const t = ac.currentTime;
      const notes = {
        crit: [440, 560, 720],
        special: [330, 440, 550, 660],
        kill: [523.25, 659.25],
        hurt: [196, 164.8],
        win: [261.6, 329.6, 392, 523.25],
        lose: [220, 174.6, 146.8],
        crown: [261.6, 329.6, 392, 523.25, 659.25, 783.99],
        decree: [392, 494]
      };
      const seq = notes[kind] || [440];
      seq.forEach((f, i) => {
        const o = ac.createOscillator(); o.type = kind === 'hurt' ? 'sawtooth' : 'triangle'; o.frequency.value = f;
        const gg = ac.createGain();
        const dur = kind === 'crown' ? 0.5 : 0.18;
        gg.gain.setValueAtTime(0.0001, t + i * 0.12);
        gg.gain.exponentialRampToValueAtTime(kind === 'hurt' ? 0.05 : 0.12, t + i * 0.12 + 0.02);
        gg.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + dur);
        o.connect(gg); gg.connect(master);
        o.start(t + i * 0.12); o.stop(t + i * 0.12 + dur + 0.05);
      });
    } catch (e) { /* noop */ }
  }

  startTitleCinematic() {
    try {
      storyScenes.init('title-scene-canvas');
      const titleRealmArt = new Image();
      titleRealmArt.src = 'assets/kingdoms/spunk.jpg';
      const loop = () => {
        if (this.currentScreen !== 'title') return;
        const t = Date.now();
        const ctx = storyScenes.ctx;
        const w = storyScenes.w;
        const h = storyScenes.h;
        storyScenes.updateEmbers(t);
        const bg = ctx.createRadialGradient(w/2, h*0.4, 0, w/2, h*0.4, w*0.6);
        bg.addColorStop(0, '#1a1a3e'); bg.addColorStop(1, '#050510');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
        if (titleRealmArt.complete && titleRealmArt.naturalWidth) {
          const scale = Math.max(w / titleRealmArt.width, h / titleRealmArt.height);
          const dw = titleRealmArt.width * scale, dh = titleRealmArt.height * scale;
          ctx.save();
          ctx.globalAlpha = 0.42;
          ctx.filter = 'brightness(.62) saturate(1.12)';
          ctx.drawImage(titleRealmArt, (w - dw) / 2, (h - dh) / 2, dw, dh);
          ctx.filter = 'none';
          const shade = ctx.createLinearGradient(0, 0, 0, h);
          shade.addColorStop(0, 'rgba(4,5,12,.5)');
          shade.addColorStop(.56, 'rgba(5,5,12,.16)');
          shade.addColorStop(1, 'rgba(5,5,12,.88)');
          ctx.globalAlpha = 1;
          ctx.fillStyle = shade;
          ctx.fillRect(0, 0, w, h);
          ctx.restore();
        }
        storyScenes.drawStars(ctx, t, 150);
        storyScenes.drawMountains(ctx, h*0.2, [0.3,0.5,0.65,0.5,0.4,0.55,0.45,0.35,0.45,0.55,0.45,0.3], '#0a0a18', Math.sin(t*0.0001)*5);
        storyScenes.drawMountains(ctx, h*0.13, [0.2,0.35,0.45,0.35,0.3,0.4,0.35,0.25,0.3,0.4,0.35,0.2], '#080815', Math.sin(t*0.0002)*8);
        storyScenes.drawCastle(ctx, w*0.3, h*0.55, 1, '#0d0d1a');
        storyScenes.drawCastle(ctx, w*0.7, h*0.52, 1.3, '#0d0d1a');
        storyScenes.drawCastle(ctx, w*0.5, h*0.48, 1.8, '#0d0d1a');
        const cols = ['#2ecc71','#3498db','#9b59b6','#e74c3c','#f1c40f','#95a5a6','#ecf0f1','#e67e22'];
        for (let i = 0; i < 8; i++) {
          const a = (i/8)*Math.PI*2 + t*0.0003;
          const d = 180 + Math.sin(t*0.0005+i)*20;
          const x = w/2 + Math.cos(a)*d;
          const y = h*0.4 + Math.sin(a)*d*0.4;
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 15);
          glow.addColorStop(0, cols[i]+'66'); glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI*2); ctx.fill();
        }
        storyScenes.drawEmbers(ctx, 0.6);
        storyScenes.drawFog(ctx, 0.4);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    } catch(e) { console.warn('Title scene failed:', e); }

    this.start3DCinematic();
  }

  start3DCinematic() {
    try {
      const ok = titleCinematic.init('title-cinematic-container', KINGDOMS, {
        overlayEl: document.getElementById('king-titlecard')
      });
      if (!ok) return;
      titleCinematic.onBeat = (king, isRift) => this.showKingTitleCard(king, isRift);
      const hint = document.getElementById('release-hint');
      if (hint) setTimeout(() => hint.classList.add('visible'), 3000);
    } catch(e) {
      console.warn('3D title cinematic failed:', e);
    }
  }

  showKingTitleCard(king, isRift) {
    const card = document.getElementById('king-titlecard');
    if (!card) return;
    const inner = document.getElementById('king-titlecard-inner');
    if (isRift) {
      const nameEl = document.getElementById('king-titlecard-name');
      const mottoEl = document.getElementById('king-titlecard-motto');
      const emEl = document.getElementById('king-titlecard-emblem');
      nameEl.textContent = 'DECEPTION';
      nameEl.style.color = '#ff5555';
      mottoEl.textContent = 'Seven sins. One shadow. It waits for the victor...';
      mottoEl.style.color = '#ffaaaa';
      emEl.innerHTML = '';
      emEl.style.setProperty('color', '#ff5555');
      card.classList.remove('rift');
      void card.offsetWidth;
      card.classList.add('rift');
      card.classList.add('show');
      return;
    }
    if (!king) return;
    const nameEl = document.getElementById('king-titlecard-name');
    const mottoEl = document.getElementById('king-titlecard-motto');
    const emEl = document.getElementById('king-titlecard-emblem');
    nameEl.textContent = king.name.toUpperCase();
    nameEl.style.color = king.color;
    mottoEl.textContent = king.motto;
    mottoEl.style.color = '';
    emEl.innerHTML = king.emblem;
    emEl.style.setProperty('color', king.color);
    card.classList.remove('rift');
    void card.offsetWidth;
    card.classList.add('show');
  }

  stopTitleCinematic() {
    try { titleCinematic.destroy(); } catch(e) {}
  }

  save() {
    if (!this.state) return;
    const slot = Math.max(1, Math.min(this.state.slot || 1, 3));
    this.state.slot = slot;
    const key = this.saveSlots[slot - 1];
    const data = JSON.stringify(this.state);
    localStorage.setItem(key, data);
    localStorage.setItem('warfare_save', data);
  }

  load(slot = 1) {
    const key = this.saveSlots[Math.max(0, Math.min(slot - 1, 2))];
    let data = localStorage.getItem(key);
    if (!data) data = localStorage.getItem('warfare_save');
    if (data) {
      this.state = JSON.parse(data);
      this.state.slot = slot;
      this.ensureRoleData();
      this.ensureAgeData();
      this.migrateGear();
      return true;
    }
    return false;
  }

  listSaves() {
    const out = [];
    for (let i = 0; i < 3; i++) {
      const raw = localStorage.getItem(this.saveSlots[i]);
      if (!raw) continue;
      try {
        const s = JSON.parse(raw);
        out.push({ slot: i + 1, data: s });
      } catch (e) { /* corrupt slot, ignore */ }
    }
    return out;
  }

  deleteSave(slot) {
    localStorage.removeItem(this.saveSlots[Math.max(0, Math.min(slot - 1, 2))]);
  }

  currentSaveSummary() {
    if (!this.state) return '';
    const age = this.currentAge ? this.currentAge() : null;
    return `Year ${this.state.year || 1}${age ? ' · ' + age.name : ''} · Level ${this.state.level || 1} · ${(this.state.party || []).length} champion(s)`;
  }

  showSaveManager() {
    const saves = this.listSaves();
    const overlay = document.getElementById('save-manager');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <div class="save-modal">
          <div class="save-modal-title">📜 The Chronicle</div>
          <p class="save-modal-sub">Three parchment slots. Each one a life the Mirror remembers.</p>
          <div class="save-slot-list">
            ${[1, 2, 3].map(slot => {
              const found = saves.find(s => s.slot === slot);
              return `
                <div class="save-slot ${found ? 'filled' : ''}">
                  <div class="save-slot-num">Slot ${slot}</div>
                  ${found ? `
                    <div class="save-slot-sum">${found.data.town ? `${found.data.town}` : 'A champion of the ring'}<br>
                      <small>${found.data.year ? 'Year ' + found.data.year : ''}${found.data.level ? ' · Level ' + found.data.level : ''}${found.data.dynasty ? ' · Dynasty ' + found.data.dynasty : ''} · ${(found.data.party || []).length} champion(s)</small></div>
                    <div class="save-slot-btns">
                      <button class="btn btn-small" onclick="game.loadSave(${slot})">Play</button>
                      <button class="btn btn-small btn-danger scrap-btn ${this._scrapArm === slot ? 'arming' : ''}" onclick="game.deleteSaveSlot(${slot})">${this._scrapArm === slot ? 'Confirm scrap?' : 'Scrap'}</button>
                    </div>`
                    : `<div class="save-slot-empty">Empty</div>`}
                </div>`;
            }).join('')}
          </div>
          <button class="btn btn-small" onclick="game.closeSaveManager()">Close</button>
        </div>`;
      return;
    }
    this.notify(['The chronicle cannot open right now.']);
  }

  loadSave(slot) {
    this.closeSaveManager();
    if (this.load(slot)) {
      this.stopTitleCinematic();
      this.showScreen('hub');
      this.renderHub();
      this.notify([`Slot ${slot}, the story resumes.`]);
    } else {
      this.notify(['That slot holds no story yet.']);
    }
  }

  deleteSaveSlot(slot) {
    if (this._scrapArm !== slot) {
      this._scrapArm = slot;
      this.showSaveManager();
      this.notify([`Click Scrap on Slot ${slot} once more to make the Mirror forget.`], '🕯️');
      return;
    }
    this._scrapArm = null;
    this.deleteSave(slot);
    this.showSaveManager();
    this.notify([`Slot ${slot} is scrubbed clean. The Mirror forgets.`], '🕯️');
  }

  closeSaveManager() {
    this._scrapArm = null;
    const overlay = document.getElementById('save-manager');
    if (overlay) overlay.style.display = 'none';
  }

  showPauseMenu() {
    const overlay = document.getElementById('save-manager');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <div class="save-modal">
          <div class="save-modal-title">☰ The Ledger's Door</div>
          <p class="save-modal-sub">Paused. The Age holds its breath.</p>
          <div class="pause-row">
            <button class="btn" onclick="game.showSaveManager()">Spin the Chronicle</button>
            <button class="btn btn-ghost" onclick="game.closeSaveManager()">Back to the Hall</button>
          </div>
          <div class="pause-row">
            <button class="btn btn-small" style="width:100%" onclick="game.gotoTitle()">Return to Title</button>
          </div>
          <p class="save-modal-sub" style="margin-top:10px">Progress saves to Slot ${this.state ? (this.state.slot || 1) : 1} automatically.</p>
        </div>`;
    }
  }

  gotoTitle() {
    this.save();
    this._skipPrologueOffer = true;
    this.killStoryCinematic();
    try { storyScenes.stop(); } catch (e) { /* noop */ }
    combat3d.destroy();
    this.closeSaveManager();
    this.showScreen('title');
    this.startTitleCinematic();
    this.notify(['The prologue stands ready to be skipped on your next journey.']);
  }

  notify(lines, icon = '🕯️') {
    if (typeof lines === 'string') lines = [lines];
    this._notifyQueue = this._notifyQueue || [];
    this._notifyQueue.push({ lines, icon });
    const el = document.getElementById('notify-toast');
    if (!el || !el.classList) return;
    if (typeof el.classList.contains === 'function' && el.classList.contains('show')) return;
    this.showNextNotify();
  }

  showNextNotify() {
    const el = document.getElementById('notify-toast');
    if (!el || !this._notifyQueue || !this._notifyQueue.length) return;
    const item = this._notifyQueue.shift();
    el.innerHTML = `<span class="notify-icon">${item.icon}</span><div class="notify-lines">${item.lines.map(l => `<div>${l}</div>`).join('')}</div>`;
    el.classList.add('show');
    clearTimeout(this._notifyTimer);
    this._notifyTimer = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => this.showNextNotify(), 250);
    }, 4200);
  }

  migrateGear() {
    if (!this.state) return;
    if (!this.state.inventory) this.state.inventory = {};
    const leader = this.state.party ? (this.state.party.find(p => p.isPlayer && p.stats) || this.state.party[0]) : null;
    if (!leader) return;
    Object.values(ITEMS).forEach(item => {
      if (!item.effect) return;
      const count = this.state.inventory[item.id] || 0;
      if (count < 1) return;
      if (item.effect.type === 'stat') {
        if (!leader.stats) return;
        leader.stats[item.effect.stat] = Math.round((leader.stats[item.effect.stat] || 0) + item.effect.amount * count);
        leader.boughtGear = leader.boughtGear || {};
        leader.boughtGear[item.id] = (leader.boughtGear[item.id] || 0) + count;
        delete this.state.inventory[item.id];
      } else if (item.effect.type === 'passive') {
        leader.passives = leader.passives || {};
        leader.passives[item.effect.id || item.id] = true;
        delete this.state.inventory[item.id];
      }
    });
    this.save();
  }

  currentAge() {
    const id = this.state.ageId || (this.state.kingdom && AGES[0].id);
    return AGES.find(a => a.id === id) || AGES[0];
  }

  ageName(age) {
    return ((age && age.name) || '').replace(/^The /, '');
  }

  ensureAgeData() {
    if (!this.state.ageId) this.state.ageId = AGES[Math.floor(Math.random() * AGES.length)].id;
    if (!this.state.town) {
      const age = this.currentAge();
      this.state.town = (age.towns && age.towns[this.state.kingdom]) || 'The Ring';
    }
    if (this.state.corruption == null) this.state.corruption = 0;
    if (this.state.shards == null) this.state.shards = 0;
    if (this.state.dynasty == null) this.state.dynasty = 0;
    if (!this.state.legacyPerks) this.state.legacyPerks = [];
    if (!this.state.rivals) this.state.rivals = {};
    if (!this.state.trophies) this.state.trophies = [];
    if (!this.state.decrees) this.state.decrees = {};
    if (this.state.woundState == null) this.state.woundState = null;
    if (this.state.questDoneAge == null) this.state.questDoneAge = null;
    if (this.state.lastKingLetter == null) this.state.lastKingLetter = null;
    if (this.state.crime == null) this.state.crime = 0;
    if (this.state.competitionWinsAge == null) this.state.competitionWinsAge = 0;
    if (this.state.huntState == null) this.state.huntState = { active: false, done: false };
    if (this.state.decreeTiers == null) this.state.decreeTiers = {};
    if (this.state.cycle == null) this.state.cycle = 1;
    if (this.state.trueEnding == null) this.state.trueEnding = false;
    if (this.state.finalWar == null) this.state.finalWar = null;
    if (this.state.corruptionCrisisDoneAge == null) this.state.corruptionCrisisDoneAge = null;
    if (this.state.crownBoons == null) this.state.crownBoons = {};
    if (this.state.codex == null) this.state.codex = {};
    if (this.state.affinity == null) this.state.affinity = {};
    if (this.state.corruptionMarks == null) this.state.corruptionMarks = {};
    if (this.state.eternalReforged == null) this.state.eternalReforged = false;
    if (this.state.regret == null) this.state.regret = null;
    if (this.state.unfinishedThing == null) this.state.unfinishedThing = null;
    if (this.state.townGrief == null) this.state.townGrief = {};
    if (this.state.relicOk == null) this.state.relicOk = {};       // relics found (per id)
    if (this.state.relicEquip == null) this.state.relicEquip = null;
    if (this.state.riftDone == null) this.state.riftDone = {};     // per-age rift cleared
    if (this.state.themeLies == null) this.state.themeLies = {};   // per-age lie/truth resolved
    if (this.state.rivalTitles == null) this.state.rivalTitles = {};
    if (this.state.corruptionScar == null) this.state.corruptionScar = false;
    if (this.state.townHonest == null) this.state.townHonest = 0;
    if (this.state.ledger == null) this.state.ledger = { truths: 0, lies: 0, shadows: 0, deals: 0 };
    if (this.state.fightStats == null) this.state.fightStats = { wins: 0, losses: 0 };
    if (this.state.dynastyTitles == null) this.state.dynastyTitles = [];
    if (this.state.riftsCleared == null) this.state.riftsCleared = 0;
    if (this.state.partyLog == null) this.state.partyLog = [];
    if (this.state.namedLies == null) this.state.namedLies = [];
    if (this.state.burials == null) this.state.burials = [];
    if (this.state.temptationDone == null) this.state.temptationDone = false;
    if (this.state.temptationRefused == null) this.state.temptationRefused = 0;
    if (this.state.firstTown == null) this.state.firstTown = this.state.town;
    if (this.state.loyalty == null) this.state.loyalty = {};              // crown-loyalty per companion name
    if (this.state.dynastyLetters == null) this.state.dynastyLetters = []; // per-death last words, shown in the Quiet Row
    if (this.state.desertions == null) this.state.desertions = [];
    if (this.state.usurper == null) this.state.usurper = null;
    if (this.state.reclaimed == null) this.state.reclaimed = 0;
    if (this.state.reckoningDone == null) this.state.reckoningDone = null;
    if (this.state.confessed == null) this.state.confessed = [];
    if (this.state.wrongedFamilies == null) this.state.wrongedFamilies = [];
    if (this.state.mirrorWhole == null) this.state.mirrorWhole = false;
    if (this.state.dealIntercepted == null) this.state.dealIntercepted = 0;
    if (this.state.truthDugOldLies == null) this.state.truthDugOldLies = 0;
    if (this.state.lieBoughtFuture == null) this.state.lieBoughtFuture = 0;
  }

  rivalTitle(grudge) {
    if (!grudge) return null;
    let chosen = null;
    for (const t of RIVAL_TITLES) {
      if (grudge >= t.min) chosen = t;
      else break;
    }
    return chosen;
  }

  recordRivalGrudge() {
    if (!this.bracket || !this.bracket.current) return;
    const kingdom = this.bracket.current.kingdom;
    const foe = this.bracket.current;
    const existing = this.state.rivals[kingdom] || { name: foe.name, grudge: 0, wins: 0 };
    existing.grudge = (existing.grudge || 0) + 1;
    existing.wins = (existing.wins || 0) + 1;
    existing.name = foe.name;
    this.state.rivals[kingdom] = existing;
    const title = this.rivalTitle(existing.grudge);
    if (title) this.state.rivalTitles[kingdom] = title.title;
    this.save();
  }

  legacyPerk(id) {
    return (this.state && this.state.legacyPerks && this.state.legacyPerks.includes(id)) || false;
  }

  hasAllLegacyPerks() {
    return LEGACY_PERKS.every(p => this.legacyPerk(p.id));
  }

  nextLegacyPerk() {
    if (this.hasAllLegacyPerks()) return null;
    return LEGACY_PERKS.find(p => !this.legacyPerk(p.id)) || null;
  }

  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`screen-${name}`);
    if (screen) {
      screen.classList.add('active');
      this.currentScreen = name;
    }
    this.updateBackground();
    this.updateScreenArtwork(name);
  }

  updateScreenArtwork(name) {
    const kingdomId = (this.state && this.state.kingdom) || this.selectedKingdom || 'spunk';
    const artwork = `url("assets/kingdoms/${kingdomId}.jpg")`;
    const storyOverlay = document.getElementById('story-overlay');
    if (storyOverlay) storyOverlay.style.setProperty('--story-art', artwork);
    const flyover = document.getElementById('kflyover-overlay');
    if (flyover) flyover.style.setProperty('--realm-art', artwork);
    document.body.dataset.gameScreen = name;
  }

  updateBackground() {
    if (!this.state) {
      particles.setColor('#f1c40f');
      particles.setType('stars');
      return;
    }
    const k = KINGDOMS[this.state.kingdom];
    if (k) {
      particles.setColor(k.color);
      switch (this.currentScreen) {
        case 'combat': particles.setType('embers'); break;
        case 'hub': particles.setType('embers'); break;
        default: particles.setType('stars'); break;
      }
    }
  }

  bindEvents() {
    document.getElementById('btn-start').addEventListener('click', () => {
      const skip = this._skipPrologueOffer && this.state && this.state.party && this.state.party.length > 0;
      this.startNewGame({ skipPrologue: skip });
    });
    document.getElementById('btn-load').addEventListener('click', () => {
      if (this.listSaves().length > 0) {
        this.showSaveManager();
      } else {
        this.notify(['Nothing is written yet. Begin your journey first.'], '🕯️');
      }
    });
    const cont = document.getElementById('kflyover-continue');
    if (cont) cont.addEventListener('click', () => this.endKingdomFlyover());
  }

  startNewGame(opts = {}) {
    this.stopTitleCinematic();
    this.state = {
      playerName: '',
      kingdom: null,
      playerClass: null,
      level: 1,
      exp: 0,
      gold: 100,
      party: [],
      inventory: { healthPotion: 1 },
      competitionWins: 0,
      totalBattles: 0,
      storyProgress: 0,
      year: 1,
      ageId: null,
      town: '',
      kingOfAge: false,
      crownWins: 0,
      lastKing: null,
      corruption: 0,
      shards: 0,
      dynasty: 0,
      legacyPerks: [],
      rivals: {},
      trophies: [],
      decrees: {},
      woundState: null,
      questDoneAge: null,
      lastKingLetter: null,
      crime: 0,
      competitionWinsAge: 0,
      rivalFacedFinal: null
    };
    this.audioFx = null;
    this.storyIndex = 0;
    if (opts.skipPrologue) {
      this._skipPrologueOffer = false;
      this.storyPhase = 'kingdom';
      storyScenes.stop();
      this.killStoryCinematic();
      this.showScreen('kingdom-select');
      this.renderKingdomSelect();
      this.notify(['The prologue you know is skipped, the Mirror\'s tale continues.'], '🪞');
      return;
    }
    this.storyPhase = 'intro';
    this.showScreen('story');
    this.startStoryCinematic();
    this.renderStory();
  }

  startStoryCinematic() {
    document.getElementById('story-cinematic-container');
    this.killStoryCinematic();
    try {
      storyCinematic3D.init('story-cinematic-container', KINGDOMS);
      storyCinematic3D.setPhase(0);
    } catch (e) { console.warn('Story cinematic unavailable:', e); }
  }

  killStoryCinematic() {
    try { storyCinematic3D.destroy(); } catch (e) { /* noop */ }
  }

  renderStory() {
    const container = document.getElementById('story-content');
    const lines = this.storyPhase === 'intro' ? STORY.intro : [STORY.kingdomIntros[this.state.kingdom]];
    const line = lines[this.storyIndex];

    if (!line) {
      storyScenes.stop();
      this.killStoryCinematic();
      if (this.storyPhase === 'intro') {
        this.storyPhase = 'kingdom';
        this.storyIndex = 0;
        this.showScreen('kingdom-select');
        this.renderKingdomSelect();
      } else if (this.storyPhase === 'kingdom') {
        this.storyPhase = 'class';
        this.storyIndex = 0;
        this.showScreen('class-select');
        this.renderClassSelect();
      } else if (this.storyPhase === 'class') {
        this.showScreen('hub');
        this.renderHub();
      }
      return;
    }

    const introScenes = ['convergence','peace','mirror','warlord','shatter','shatter','deception','kingdoms-rise','shatter','warlord'];
    const kingdomScenes = {
      altruism:'kingdom-altruism', accord:'kingdom-accord', rapport:'kingdom-rapport',
      valor:'kingdom-valor', clement:'kingdom-clement', vigilant:'kingdom-vigilant',
      scrupulous:'kingdom-scrupulous', spunk:'kingdom-spunk'
    };
    // Map story beats to 3D cinematic phases so the post-Begin prologue plays
    // as one continuous film with the title screen.
    const introPhaseMap = [0, 1, 1, 2, 3, 3, 4, 5, 4, 4];
    let cinematicPhase = this.storyPhase === 'kingdom' ? 6 : (introPhaseMap[this.storyIndex] != null ? introPhaseMap[this.storyIndex] : 0);
    try { storyCinematic3D.setPhase(cinematicPhase); } catch (e) { /* optional */ }

    try {
      storyScenes.init('story-scene-canvas');
      if (this.storyPhase === 'intro' && introScenes[this.storyIndex]) {
        storyScenes.play(introScenes[this.storyIndex], 5000);
      } else if (this.storyPhase === 'kingdom' && this.state.kingdom && kingdomScenes[this.state.kingdom]) {
        storyScenes.play(kingdomScenes[this.state.kingdom], 5000);
      }
    } catch(e) { console.warn('Scene failed:', e); }

    const introChapters = ['The Convergence','The Thousand-Year Peace','The Mirror of Truth','The Warlord','The Shattering','The Shattering','The Eight Kingdoms','Deception is Born','A Common Enemy','The Annual Competition'];
    const chapter = this.storyPhase === 'kingdom'
      ? `${KINGDOMS[this.state.kingdom].name}: The Call`
      : (introChapters[this.storyIndex] || 'Warfare');

    container.innerHTML = `<div class="story-chapter">${chapter}</div>
      <div class="story-text"><div class="line" style="animation-delay: 0.1s">${line}</div></div>
      <div class="story-continue" id="story-continue"><span class="cont-caret">&#9656;</span> Continue <span class="cont-caret">&#9666;</span></div>
      ${(this.storyPhase === 'intro' && this._skipPrologueOffer) ? `<div style="text-align:center;margin-top:14px"><button class="btn btn-small btn-ghost" id="story-skip">Skip the prologue, you know this tale</button></div>` : ''}`;

    document.getElementById('story-continue').addEventListener('click', () => this.nextStoryLine());
    const skipBtn = document.getElementById('story-skip');
    if (skipBtn) skipBtn.addEventListener('click', () => {
      this._skipPrologueOffer = false;
      this.storyIndex = STORY.intro.length;
      this.renderStory();
    });
  }

  nextStoryLine() {
    this.storyIndex++;
    this.renderStory();
  }

  renderKingdomSelect() {
    this.startKingdomSelectBG();
    const grid = document.getElementById('kingdom-grid');
    grid.innerHTML = '';
    Object.values(KINGDOMS).forEach(k => {
      const card = document.createElement('div');
      card.className = 'kingdom-game-card';
      card.style.setProperty('--kc', k.color);
      card.innerHTML = `
        <div class="kgc-art"><img src="assets/kingdoms/${k.id}.jpg" alt="${k.name} kingdom artwork" loading="lazy"><span class="kgc-art-vignette"></span></div>
        <div class="kgc-copy">
        <div class="kgc-emblem">${k.emblem}</div>
        <div class="kgc-name" style="color:${k.color}">${k.name}</div>
        <div class="kgc-motto">"${k.motto}"</div>
        <div class="kgc-style">${k.combatStyle}</div>
        <div class="kgc-stats">
          ${Object.entries(k.stats).map(([stat, val]) => `
            <div class="kgc-stat"><span class="kgc-stat-label">${stat.toUpperCase()}</span><span class="kgc-stat-val">${val}</span></div>
          `).join('')}
        </div>
        </div>
      `;
      card.addEventListener('click', () => this.selectKingdom(k.id));
      grid.appendChild(card);
    });
  }

  startKingdomSelectBG() {
    const bgDiv = document.getElementById('kingdom-select-bg');
    if (!bgDiv) return;
    bgDiv.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    bgDiv.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    const orbs = Object.values(KINGDOMS).map((k, i) => ({
      angle: (i / 8) * Math.PI * 2, radius: 100 + Math.random() * 80,
      speed: 0.0003 + Math.random() * 0.0002, color: k.color, size: 3 + Math.random() * 2
    }));
    const draw = () => {
      if (this.currentScreen !== 'kingdom-select') return;
      const t = Date.now();
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createRadialGradient(w/2, h*0.35, 0, w/2, h*0.35, w*0.6);
      bg.addColorStop(0, '#0e0e1a'); bg.addColorStop(1, '#060608');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 80; i++) {
        const x = (Math.sin(i*127.1)*0.5+0.5)*w, y = (Math.cos(i*311.7)*0.5+0.5)*h*0.7;
        const tw = Math.sin(t*0.001+i*2)*0.4+0.6;
        ctx.fillStyle = `rgba(255,255,240,${tw*0.4})`;
        ctx.beginPath(); ctx.arc(x, y, 0.5+tw*0.5, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = '#0a0a15'; ctx.beginPath(); ctx.moveTo(0, h);
      [0.3,0.5,0.6,0.55,0.45,0.6,0.5,0.35,0.45,0.55,0.45,0.35].forEach((p, i, a) => {
        ctx.lineTo((i/(a.length-1))*(w+200)-100, h-p*h*0.12);
      });
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      orbs.forEach(o => {
        o.angle += o.speed;
        const ox = w/2+Math.cos(o.angle)*o.radius, oy = h*0.4+Math.sin(o.angle)*o.radius*0.5;
        const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.size*4);
        glow.addColorStop(0, o.color+'44'); glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ox, oy, o.size*4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = o.color; ctx.beginPath(); ctx.arc(ox, oy, o.size, 0, Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  selectKingdom(id) {
    this.selectedKingdom = id;
    const k = KINGDOMS[id];
    document.querySelectorAll('.kingdom-game-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.kingdom-game-card[style*="${k.color}"]`)?.classList.add('selected');

    const overlay = document.getElementById('kingdom-detail-overlay');
    overlay.classList.add('visible');
    overlay.style.setProperty('--kc', k.color);
    overlay.innerHTML = `
      <div class="kdo-backdrop" onclick="game.closeKingdomDetail()"></div>
      <div class="kdo-panel">
        <button class="kdo-close" onclick="game.closeKingdomDetail()">&times;</button>
        <div class="kdo-art"><img src="assets/kingdoms/${k.id}.jpg" alt="${k.name} kingdom artwork"><div class="kdo-art-shade"></div><div class="kdo-art-caption">${k.name} <span>•</span> Kingdom of ${k.name}</div></div>
        <div class="kdo-copy">
        <div class="kdo-emblem">${k.emblem}</div>
        <h2 class="kdo-name" style="color:${k.color}">${k.name}</h2>
        <div class="kdo-motto">"${k.motto}"</div>
        <p class="kdo-desc">${k.description}</p>
        <div class="kdo-details">
          <div class="kdo-detail"><span class="kdo-detail-label">Combat Style</span><span class="kdo-detail-val">${k.combatStyle}</span></div>
          <div class="kdo-detail"><span class="kdo-detail-label">Specialty</span><span class="kdo-detail-val">${k.specialty}</span></div>
          <div class="kdo-detail"><span class="kdo-detail-label">Special Move</span><span class="kdo-detail-val" style="color:${k.color}">${k.specialMove}</span></div>
          <div class="kdo-detail"><span class="kdo-detail-label">Effect</span><span class="kdo-detail-val">${k.specialDesc}</span></div>
        </div>
        <div class="kdo-stats">
          ${Object.entries(k.stats).map(([stat, val]) => `
            <div class="kdo-stat-row">
              <span class="kdo-stat-label">${stat.toUpperCase()}</span>
              <div class="kdo-stat-bar"><div class="kdo-stat-fill" style="width:${val}%;background:${k.color}"></div></div>
              <span class="kdo-stat-num">${val}</span>
            </div>
          `).join('')}
        </div>
        <div class="kdo-matchup">
          <span style="color:#2ecc71">Strong vs ${KINGDOMS[k.bonusVs]?.name}</span>
          <span style="color:#e74c3c">Weak vs ${KINGDOMS[k.weaknessVs]?.name}</span>
        </div>
        <button class="btn btn-primary kdo-choose" onclick="game.confirmKingdom()" style="--btn-color:${k.color}">
          Choose ${k.name}
        </button>
        </div>
      </div>
    `;
  }

  closeKingdomDetail() {
    const overlay = document.getElementById('kingdom-detail-overlay');
    overlay.classList.remove('visible');
    document.querySelectorAll('.kingdom-game-card').forEach(c => c.classList.remove('selected'));
  }

  confirmKingdom() {
    if (!this.selectedKingdom) return;
    this.state.kingdom = this.selectedKingdom;
    this.ensureAgeData();
    const k = KINGDOMS[this.selectedKingdom];
    this.state.party = [{ ...this.createPlayerCharacter(), isLeader: true }];
    this.storyPhase = 'kingdom';
    this.storyIndex = 0;
    // Welcome the player to their realm with a living kingdom cinematic
    this.showScreen('kingdom-flyover');
    this.startKingdomFlyover(k);
  }

  startKingdomFlyover(k) {
    try { kingdomFlyover.destroy(); } catch (e) {}
    const container = document.getElementById('kingdom-flyover-container');
    const overlay = document.getElementById('kflyover-overlay');
    if (container) { container.innerHTML = ''; }
    if (overlay) {
      const emblem = document.getElementById('kflyover-emblem');
      const nameEl = document.getElementById('kflyover-name');
      const mottoEl = document.getElementById('kflyover-motto');
      const loreTitleEl = document.getElementById('kflyover-lore-title');
      const loreTextEl = document.getElementById('kflyover-lore-text');
      const theme = (typeof kingdomFlyover.themeFor === 'function') ? kingdomFlyover.themeFor(k) : null;
      if (emblem) { emblem.innerHTML = k.emblem; emblem.style.setProperty('color', k.color); }
      if (nameEl) { nameEl.textContent = k.name.toUpperCase(); nameEl.style.color = k.color; }
      if (mottoEl) { mottoEl.textContent = '"' + k.motto + '"'; }
      if (loreTitleEl) { loreTitleEl.textContent = 'The ' + (theme ? theme.label : 'Realm'); loreTitleEl.style.color = k.color; }
      if (loreTextEl) { loreTextEl.textContent = theme ? theme.origin : (k.description || ''); }
      overlay.classList.remove('show');
      overlay.style.setProperty('--kc', k.color);
      overlay.style.setProperty('--realm-art', `url("assets/kingdoms/${k.id}.jpg")`);
    }
    const ok = kingdomFlyover.init('kingdom-flyover-container', k);
    kingdomFlyover.onFinished = () => this.endKingdomFlyover();
    // reveal the name banner partway through the tour, then allow enter
    setTimeout(() => { if (overlay) overlay.classList.add('show'); }, 6000);
  }

  endKingdomFlyover() {
    if (this.flyoverEnded) return;
    this.flyoverEnded = true;
    try { kingdomFlyover.destroy(); } catch (e) {}
    if (this.currentScreen !== 'kingdom-flyover') return;
    this.showScreen('story');
    this.startStoryCinematic();
    this.renderStory();
  }

  createPlayerCharacter() {
    const k = KINGDOMS[this.state.kingdom];
    const kingdomClasses = KINGDOM_CLASSES[this.state.kingdom] || {};
    const classType = kingdomClasses[this.state.playerClass] || CLASS_TYPES[this.state.playerClass];
    const stats = { ...k.stats };
    if (classType) stats[classType.bonusStat] += classType.bonusAmount;
    return this.withRoleData({
      name: this.state.playerName || 'Hero',
      kingdom: this.state.kingdom,
      class: this.state.playerClass || Object.keys(kingdomClasses)[0],
      level: 1,
      stats,
      isPlayer: true
    });
  }

  withRoleData(p) {
    const archetype = CLASS_ROLE[p.class] || 'striker';
    return Object.assign({}, p, {
      archetype,
      roleLevel: p.roleLevel || 1,
      roleXp: p.roleXp || 0,
      rolePoints: p.rolePoints || 0,
      talents: p.talents || {}
    });
  }

  ensureRoleData() {
    if (!this.state) return;
    this.state.party = (this.state.party || []).map(p => this.withRoleData(p));
  }

  getClassInfo(classId, kingdom) {
    const kingdomClasses = KINGDOM_CLASSES[kingdom] || {};
    return kingdomClasses[classId] || CLASS_TYPES[classId] || null;
  }

  renderClassSelect() {
    this.startClassSelectBG();
    const kingdom = this.state.kingdom;
    const k = KINGDOMS[kingdom];
    const kingdomClasses = KINGDOM_CLASSES[kingdom] || {};
    const container = document.getElementById('class-select-content');
    if (!container) return;
    const classScreen = document.getElementById('screen-class-select');
    if (classScreen) classScreen.style.setProperty('--realm-art', `url("assets/kingdoms/${k.id}.jpg")`);

    container.innerHTML = `
      <div class="cs-header">
        <div class="cs-subtitle" style="color:${k.color}">${k.icon} ${k.name}</div>
        <h2 class="cs-title">CHOOSE YOUR CLASS</h2>
        <div class="cs-desc">Each realm trains its warriors differently. Select your path.</div>
      </div>
      <div class="cs-name-row">
        <input type="text" class="name-input" id="player-name-input" placeholder="Enter your name..." maxlength="20">
      </div>
      <div class="cs-grid" id="class-grid"></div>
      <div class="cs-regret-title">Before you are crowned, the Mirror asks one honest question: <i>what do you regret?</i></div>
      <div class="cs-regrets" id="regret-grid">
        ${REGRETS.map(r => `
          <div class="cs-reget-card regret-card" data-regret="${r.id}" style="--kc:${k.color}" onclick="game.selectRegret('${r.id}')">
            <div class="regret-ico">${r.icon}</div>
            <div class="regret-name">${r.name}</div>
            <div class="regret-desc">${r.desc}</div>
            <div class="regret-bonus">+${r.amt} ${r.stat.toUpperCase()}</div>
          </div>`).join('')}
      </div>
      <div class="cs-confirm">
        <button class="btn btn-primary cs-btn" onclick="game.confirmClass()" style="--btn-color:${k.color}">Begin as Champion</button>
      </div>
    `;

    const grid = document.getElementById('class-grid');
    Object.entries(kingdomClasses).forEach(([id, cls]) => {
      const card = document.createElement('div');
      card.className = 'cs-card';
      card.style.setProperty('--kc', k.color);
      card.innerHTML = `
        <div class="cs-card-avatar">${cls.avatar}</div>
        <div class="cs-card-name" style="color:${k.color}">${cls.name}</div>
        <div class="cs-card-desc">${cls.desc}</div>
        <div class="cs-card-bonus">+${cls.bonusAmount} ${cls.bonusStat.toUpperCase()}</div>
      `;
      card.addEventListener('click', () => {
        document.querySelectorAll('.cs-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedClass = id;
      });
      grid.appendChild(card);
    });
  }

  startClassSelectBG() {
    const bgDiv = document.getElementById('class-select-bg');
    if (!bgDiv) return;
    bgDiv.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    bgDiv.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    const k = KINGDOMS[this.state.kingdom];
    const color = k ? k.color : '#d4a847';
    const realmArt = new Image();
    realmArt.src = `assets/kingdoms/${k ? k.id : 'spunk'}.jpg`;
    const draw = () => {
      if (this.currentScreen !== 'class-select') return;
      const t = Date.now();
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createRadialGradient(w/2, h*0.35, 0, w/2, h*0.35, w*0.6);
      bg.addColorStop(0, '#0e0e1a'); bg.addColorStop(1, '#060608');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      if (realmArt.complete && realmArt.naturalWidth) {
        const scale = Math.max(w / realmArt.width, h / realmArt.height);
        const dw = realmArt.width * scale, dh = realmArt.height * scale;
        ctx.save();
        ctx.globalAlpha = 0.37;
        ctx.filter = 'brightness(.52) saturate(.9)';
        ctx.drawImage(realmArt, (w - dw) / 2, (h - dh) / 2, dw, dh);
        ctx.filter = 'none';
        const shade = ctx.createLinearGradient(0, 0, 0, h);
        shade.addColorStop(0, 'rgba(5,5,12,.42)');
        shade.addColorStop(.58, 'rgba(5,5,12,.2)');
        shade.addColorStop(1, 'rgba(5,5,12,.92)');
        ctx.globalAlpha = 1;
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
      for (let i = 0; i < 60; i++) {
        const x = (Math.sin(i*127.1)*0.5+0.5)*w, y = (Math.cos(i*311.7)*0.5+0.5)*h*0.7;
        const tw = Math.sin(t*0.001+i*2)*0.4+0.6;
        ctx.fillStyle = `rgba(255,255,240,${tw*0.3})`;
        ctx.beginPath(); ctx.arc(x, y, 0.5+tw*0.5, 0, Math.PI*2); ctx.fill();
      }
      for (let i = 0; i < 4; i++) {
        const a = (i/4)*Math.PI*2 + t*0.0004;
        const d = 150 + Math.sin(t*0.001+i)*30;
        const ox = w/2+Math.cos(a)*d, oy = h*0.4+Math.sin(a)*d*0.4;
        const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 25);
        glow.addColorStop(0, color+'33'); glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ox, oy, 25, 0, Math.PI*2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  selectRegret(id) {
    this.selectedRegret = id;
    document.querySelectorAll('.regret-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`.regret-card[data-regret="${id}"]`);
    if (card) card.classList.add('selected');
  }

  confirmClass() {
    if (!this.selectedClass) {
      console.warn('No class selected');
      return;
    }
    this.state.playerClass = this.selectedClass;

    const nameInput = document.getElementById('player-name-input');
    this.state.playerName = (nameInput && nameInput.value.trim()) || 'Hero';

    const regret = REGRETS.find(r => r.id === this.selectedRegret) || REGRETS[0];
    this.state.regret = regret.id;

    this.state.party = [{ ...this.createPlayerCharacter(), isLeader: true }];
    if (this.state.party[0] && regret) {
      const ps = this.state.party[0].stats;
      if (regret.stat === 'atk') ps.atk = (ps.atk || 0) + regret.amt;
      else if (regret.stat === 'spAtk') ps.spAtk = (ps.spAtk || 0) + regret.amt;
      else if (regret.stat === 'hp') ps.hp = (ps.hp || 0) + regret.amt;
    }

    this.save();
    this.storyPhase = 'class';
    this.storyIndex = 0;
    this.showScreen('hub');
    this.renderHub();
  }

  roleSummary() {
    if (!this.state || !this.state.party || !this.state.party.length) return 'No champions yet';
    return this.state.party.map(p => `${ROLE_ARCHETYPES[p.archetype]?.name || '?'} Lv${p.roleLevel || 1}`).join(' · ');
  }

  roleXpToast(lines) {
    const el = document.getElementById('role-xp-toast');
    if (el) {
      el.innerHTML = lines.map(l => `<div class="rxt-line">${l}</div>`).join('');
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 6000);
    }
  }

  /* ---------- Dynasty: death has stakes ---------- */
  crownLabel() {
    const age = this.currentAge();
    return this.state.kingOfAge
      ? `<span class="crown-label">👑 Crowned · ${KING_OF_THE_AGE_TITLE.replace('{AGE}', this.ageName(age))}</span>`
      : `<span class="crown-label pending">The Age is unwon</span>`;
  }

  // Called when the champion falls in a Crown Trial or loses the Competition.
fallToHeir(reason) {
    const leader = this.state.party.find(p => p.isPlayer) || this.state.party[0];
    this.state.dynasty = (this.state.dynasty || 0) + 1;
    // The dynasty buries its dead in The Quiet Row. The town reads the Row like a ledger.
    this.state.burials = this.state.burials || [];
    this.state.lastKingName = leader ? leader.name : this.state.lastKingName;
    if (leader && leader.name) {
      this.state.burials.push({ name: leader.name, atAge: this.currentAge().name, year: this.state.year || 1 });
      if (this.state.burials.length > 6) this.state.burials.shift();
    }
    this.notePartyWord('grieve');
    const n = this.state.dynasty;
    // The dead King leaves one unfinished thing in the heir's keeping. It can be picked up again.
    if (!this.state.unfinishedThing) {
      this.state.unfinishedThing = UNFINISHED_LETTERS[(this.state.dynasty - 1) % UNFINISHED_LETTERS.length];
    }
    // A death with a face: the King's last words come from what the King actually did.
    this.state.dynastyLetters = this.state.dynastyLetters || [];
    const deadWord = this.deathWordFor(leader);
    this.state.dynastyLetters.push({ name: leader ? leader.name : 'Herald', atAge: this.currentAge().name, year: this.state.year || 1, line: deadWord.letter });
    if (this.state.dynastyLetters.length > 6) this.state.dynastyLetters.shift();
    // If a rival's grudge outlived the King, they claim the dropped crown.
    const lostRival = this.bestRival();
    if (lostRival && lostRival.grudge >= 2) {
      this.state.usurper = { name: lostRival.name, kingdom: lostRival.kingdom, grudge: lostRival.grudge, atAge: this.currentAge().name };
    }
    // The town grieves a real death, the heir walks into a hall that held its breath.
    this.state.townGrief = this.state.townGrief || {};
    this.state.townGrief[this.currentAge().id] = (this.state.townGrief[this.currentAge().id] || 0) + 1;
    const heirName = leader ? `${leader.name} ${['II','III','IV','V','VI'][Math.min(n - 1, 4)]}` : 'Herald';
    const heir = leader ? { ...leader, name: heirName } : this.createPlayerCharacter();
    heir.stats = Object.assign({}, (leader && leader.stats) || {});
    Object.keys(heir.stats).forEach(s => heir.stats[s] = Math.max(10, Math.round(heir.stats[s] * 0.75)));
    heir.isPlayer = true;
    heir.foundTheName = true; // the heir already reached for the half-carved name
    this.state.party[this.state.party.indexOf(leader)] = heir;

    // The dynasty earns ONE enduring legacy perk with each heir.
    const perk = this.nextLegacyPerk();
    if (perk) this.state.legacyPerks.push(perk.id);
    this.save();

    this.showScreen('story');
    const container = document.getElementById('story-content');
    const memory = n >= 3 ? STORY.heirMemoryThree : STORY.heirMemory;
    const griefLine = TOWN_GRIEF[Math.floor(Math.random() * TOWN_GRIEF.length)].replace('${town}', this.state.town);
    const partyGrief = this.lastPartyWord();
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${reason}</div>
        <div class="line" style="animation-delay:0.5s">The champion of ${this.state.town} has fallen.</div>
        <div class="line" style="animation-delay:0.9s;color:#9b8aa5">${griefLine}</div>
        ${partyGrief ? `<div class="line party-voice-line" style="animation-delay:1.15s">🗣️ <b>${partyGrief.by}</b>, "${partyGrief.line}"</div>` : ''}
        <div class="line" style="animation-delay:1.3s">But a dynasty does not end, it is handed onward. <b>${heirName}</b>, heir of House ${(leader && leader.name) || 'the Fallen'}, takes up the blade, weathered, diminished... and <b>wiser</b>.</div>
        <div class="line" style="animation-delay:1.8s;color:#c9a961">${memory}</div>
        ${this.state.unfinishedThing ? `<div class="line" style="animation-delay:2.2s;color:#5aa77a">🗝️ ${this.state.unfinishedThing}</div>` : ''}
        <div class="line" style="animation-delay:2.45s;color:#9b8aa5">🕯️ The last thing they meant to say: "${deadWord.letter}."</div>
        ${this.state.usurper ? `<div class="line" style="animation-delay:2.55s;color:#d28a4a">And the news that broke the morning: <b>${this.state.usurper.name}</b> of ${this.state.usurper.kingdom} has claimed the crown your line dropped. It fits them the way a borrowed coat fits, which everyone pretends not to notice, which is exactly how they mean it to fit.</div>` : ''}
        ${perk ? `<div class="line" style="animation-delay:2.6s">The dynasty remembers: <b>${perk.icon} ${perk.name}</b>, ${perk.desc}</div>` : ''}
      </div>
      <div class="story-continue" id="story-continue">Rise, ${heirName}</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      this.save();
      this.renderHub();
      this.showScreen('hub');
    });
  }

  addCorruption(n) {
    const before = this.state.corruption || 0;
    this.state.corruption = Math.max(0, Math.min(10, (this.state.corruption || 0) + n));
    let crossed = false;
    const aId = this.currentAge().id;
    const marks = this.state.corruptionMarks || {};
    const prev = this.state.corruptionPrevThresh;
    if (this.state.corruption >= 4 && (before < 4) && !marks[4]) marks[4] = aId;
    if (this.state.corruption >= 7 && (before < 7) && !marks[7]) marks[7] = aId;
    this.state.corruptionMarks = marks;
    if (this.state.corruption === 10 && before < 10 && !this.state.corruptionCrisisDoneAge) {
      this.state.corruption = 10;
      this.save();
      return;
    }
    this.save();
    this.maybeCorruptionBeat();
  }

  // Story beat, the town's doubt grows at corruption 4 and 7, once per Age.
  maybeCorruptionBeat() {
    const aId = this.currentAge().id;
    const marks = this.state.corruptionMarks || {};
    const c = this.state.corruption || 0;
    let idx = null;
    if (c >= 7 && marks[7] === aId) idx = 1;
    else if (c >= 4 && marks[4] === aId) idx = 0;
    if (idx === null) return;
    if (this.state.corruptionBeatShownAge === aId && this.state.corruptionBeatShownIdx === idx) return;
    this.state.corruptionBeatShownAge = aId;
    this.state.corruptionBeatShownIdx = idx;
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s;color:#9b59b6">🩸 Corruption ${c}/10, ${this.corruptionWorldText().split('<br>')[0]}</div>
        <div class="line" style="animation-delay:0.5s">${STORY.corruptionBeats[idx]}</div>
      </div>
      <div class="story-continue" id="story-continue">Look away from the crowd</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      this.save();
      this.renderHub();
      this.showScreen('hub');
    });
  }

  /* ---------- Twin clocks: shards + Age goals ---------- */
  awardShards(amount) {
    const base = amount || 1;
    let total = base;
    if (this.legacyPerk('shards_instead')) total += 2;
    if ((this.state.decrees[this.currentAge().id] || '') === 'hoard_shards') total += 3 + (this.decreeTier('hoard_shards') - 1) * 2;
    this.state.shards = (this.state.shards || 0) + total;
    return total;
  }

  /* ---------- Founding decree ---------- */
  hasDecree() {
    if (!this.state || !this.state.decrees) return false;
    return !!(this.state.decrees[this.currentAge().id]);
  }

  decreeTier(id) {
    if (!this.state || !this.state.decrees) return 0;
    const id2 = id || this.state.decrees[this.currentAge().id];
    return (this.state.decreeTiers && this.state.decreeTiers[id2]) || 1;
  }

  // Difficulty climbs with each completed Eternal Cycle (NG+).
  difficultyMult() {
    return 1 + ((this.state.cycle || 1) - 1) * 0.18;
  }

  corruptionCrisisDue() {
    return (this.state.corruption || 0) === 10 && !this.state.corruptionCrisisDoneAge;
  }

  // Is the Eternal Cycle old enough that decrees are remembered too loudly?
  twistedDecrees() {
    return (this.state.cycle || 1) >= 2;
  }

  twistedDecreeFlavor(d) {
    if (!this.twistedDecrees() || !d) return '';
    switch (d.id) {
      case 'arena_tax': return ' The town pays it on time, every time, because it learned, generations ago, what happens to late payers.';
      case 'open_gates': return ' The gates are open so often now that no one locks their doors. The merchants like it. The seers do not.';
      case 'veil_of_mercy': return ' Mercy is a tradition here, thrice-remembered. The town is kind the way old things are kind, out of habit, and a little out of fear.';
      case 'iron_march': return ' The march is drilled into toddlers. They sing the cadence in their sleep. The kingdom is armed before it is grown.';
      case 'hoard_shards': return ' Shards are currency, memory, and teeth. The town hoards like it expects the light to be rationed.';
      default: return ' The town obeys the old decree the way it obeys weather: without thinking, and always ready.';
    }
  }

  showDecree() {
    if (this.hasDecree()) {
      this.showScreen('story');
      const container = document.getElementById('story-content');
      const d = DECREES.find(x => x.id === this.state.decrees[this.currentAge().id]);
      container.innerHTML = `
        <div class="story-text">
          <div class="line" style="animation-delay:0.1s">A decree is carved already, and the town obeys it without question:</div>
          <div class="line" style="animation-delay:0.5s"><b>${d ? d.icon + ' ' + d.name : 'An old decree'}</b>, ${d ? d.desc : ''}${d ? this.twistedDecreeFlavor(d) : ''}</div>
          ${this.twistedDecrees() ? '<div class="line" style="animation-delay:0.9s;color:#b07bd8">This is not a founding act anymore. It is a founding scar, carved, healed over, and carved again.</div>' : ''}
        </div>
        <div class="story-continue" id="story-continue">Return to the Hall</div>`;
      document.getElementById('story-continue').addEventListener('click', () => { this.renderHub(); this.showScreen('hub'); });
      return;
    }
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const age = this.currentAge();
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">Every Age begins with a choice, the founding act that shapes <b>${this.ageName(age)}</b>.</div>
        <div class="line" style="animation-delay:0.5s">Your town of ${this.state.town} waits: which decree shall <b>shape ${this.ageName(age)}?</b></div>
        ${this.twistedDecrees() ? '<div class="line" style="animation-delay:0.8s;color:#b07bd8">A warning itches under the choice: in this cycle, whatever you decree, the town will remember it <i>too well</i>.</div>' : ''}
      </div>
      <div class="decree-grid">
        ${DECREES.map(d => `
          <div class="decree-card" onclick="game.chooseDecree('${d.id}')" style="--dc:var(--gold)">
            <div class="decree-ico">${d.icon}</div>
            <div class="decree-name">${d.name}</div>
            <div class="decree-desc">${d.desc}</div>
            ${this.twistedDecrees() ? `<div class="decree-desc" style="color:#b07bd8;font-size:0.68rem">Twisted: it will be remembered too loudly.</div>` : ''}
          </div>`).join('')}
      </div>`;
  }

  chooseDecree(id) {
    const age = this.currentAge();
    this.state.decrees[age.id] = id;
    this.state.decreeTiers = this.state.decreeTiers || {};
    this.state.decreeTiers[id] = (this.state.decreeTiers[id] || 0) + 1;
    const d = DECREES.find(x => x.id === id);
    const t = this.state.decreeTiers[id];
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">The parchment is signed with the royal seal. The town chants the words as scribes copy them in triplicate:</div>
        <div class="line" style="animation-delay:0.5s"><b>${d.icon} ${d.name}</b>${t > 1 ? ` <span class="decree-tier-badge">Tier ${t}</span>` : ''}</div>
        <div class="line" style="animation-delay:1s">"${d.desc}"${t > 1 ? `<div class="decree-tier-note" style="margin-top:8px;color:var(--gold)">The decree is remembered, its blessing has grown with the dynasty.</div>` : ''}${this.twistedDecrees() ? `<div class="decree-tier-note" style="margin-top:8px;color:#b07bd8">In this cycle the decree is carved into memory itself.${this.twistedDecreeFlavor(d)}</div>` : ''}</div>
      </div>
      <div class="story-continue" id="story-continue">The Age begins</div>`;
    document.getElementById('story-continue').addEventListener('click', () => { this.renderHub(); this.showScreen('hub'); });
  }

  /* ---------- The previous King persists ---------- */
  showKingLetters() {
    const age = this.currentAge();
    const lk = this.state.lastKing;
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    const letters = KING_LETTERS;
    const letter = this.state.lastKingLetter || letters[(this.state.crownWins || 0) % letters.length];
    const sub = lk ? lk.name + ', the King of the previous age, sits in the shadow of the throne and does not bleed. The court whispers.' : 'The shadow-throne sits empty, but a chair that stands empty is not always unoccupied.';
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('🗝️', 'The Fallen Throne', sub, '#8e8ea8')}
        <div class="location-frame">
          <div class="event-banner" style="text-align:left">
            <div class="event-title">A letter, sealed with wax as black as a shard of the Mirror</div>
            <p style="margin-top:12px;line-height:1.9;font-style:italic;color:var(--text-dim)">"${letter}"</p>
            <p style="margin-top:14px;line-height:1.7">${lk ? `<b>${lk.name}</b> watches you from a doorway that is a little too dark to be a doorway. When you meet their eyes, they simply say: <i>"I was you before I was nothing. Outgrow the lesson."</i>` : 'No king has yet reigned, the fallen throne is empty, and somehow that is worse.'}</p>
            ${(this.state.corruption || 0) >= 2 && lk ? `<div class="shade-confession" style="margin-top:16px;padding:14px 16px;border:1px solid rgba(155,89,182,0.3);border-radius:8px;background:rgba(20,10,30,0.5)">
              <div style="color:#b07bd8;font-family:'Cinzel',serif;letter-spacing:.08em;font-size:.72rem;margin-bottom:8px">THE THRONE CONFESSES</div>
              <p style="line-height:1.8;color:var(--text-dim);font-size:.8rem">${lk.name} steps fully into the dark of the doorway. <i>"I want to tell you why I took Deception's deals, so you never have to wonder if I was stupid. Stupidity would have been easier. I took them because the town needed a King who could fix things, and the truth could not fix things. Truth is a fine lamp, heir, but the town did not need light. It needed someone who would carry it. Deception only ever said: <b>be the lie that lets them sleep.</b> I asked it how much it would cost. It said, <i>everything you cannot look at.</i> I paid in installments. Look at me, heir, look at what installment one looks like. Now decide, every crowned morning, whether you are a lamp or a carrier."</i></p>
              <p style="margin-top:10px;color:#5aa77a;font-size:.74rem;line-height:1.6">Somewhere in your own reign there was a day you almost understood him. The Mirror showed you a choice, once, and you chose the town's sleep over its sight. If that moment returns, remember: the lamp still burns. That is not nothing.</p>
            </div>` : ''}
            <div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-small" onclick="game.claimKingWisdom()" style="flex:1">⚡ Keep the crown's wisdom (+10 role XP)</button>
              <button class="btn btn-small" onclick="game.serveKingErrand()" style="flex:1">⚔️ Do the fallen King's errand (+25 gold, +corruption)</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  claimKingWisdom() {
    const leader = this.state.party.find(p => p.isPlayer) || this.state.party[0];
    if (leader) {
      leader.roleXp = (leader.roleXp || 0) + 10;
      this.awardRoleXp(this.state.party, 'kingwisdom');
    }
    this.state.lastKingLetter = KING_LETTERS[(this.state.crownWins || 0) % KING_LETTERS.length];
    this.state.ledger = this.state.ledger || { truths: 0, lies: 0, shadows: 0 };
    this.state.ledger.truths++;
    this.notePartyWord('approve');
    this.shiftPartyLoyalty(1);
    this.save();
    this.showKingLetters();
  }

  serveKingErrand() {
    this.state.gold += 25;
    this.state.lastKingLetter = KING_LETTERS[(this.state.crownWins || 0) % KING_LETTERS.length];
    this.state.ledger = this.state.ledger || { truths: 0, lies: 0, shadows: 0 };
    this.state.ledger.shadows++;
    this.addCorruption(1);
    this.notePartyWord('doubt');
    this.shiftPartyLoyalty(-1, ['mender', 'bulwark']);
    this.save();
    this.showKingLetters();
  }

  /* ---------- Scroll of the Age ---------- */
  /* ---------- First Steps, onboarding chain ---------- */
  firstSteps() {
    if (!this.state) return [];
    const leader = this.state.party.find(p => p.isPlayer) || this.state.party[0];
    const gearBought = leader && leader.boughtGear && Object.keys(leader.boughtGear).length;
    const carried = Object.values(this.state.inventory).reduce((a, b) => a + b, 0) > 0;
    return [
      { key: 'recruit', label: 'Swear a champion', icon: '🛡️', done: (this.state.party || []).length >= 2, doorAction: 'showRecruit' },
      { key: 'gear', label: 'Provision at the Quartermaster', icon: '⚗️', done: !!(gearBought || carried), doorAction: 'showShop' },
      { key: 'decree', label: 'Found the Age with a decree', icon: '📜', done: this.hasDecree(), doorAction: 'showDecree' },
      { key: 'battle', label: 'Win a bout at the Training Grounds', icon: '⚔️', done: !!((this.state.fightStats || {}).wins), doorAction: 'showTraining' },
      { key: 'compete', label: 'Sound the Competition horn', icon: '🏆', done: (this.state.competitionWins || 0) >= 1, doorAction: 'startCompetition' }
    ];
  }

  firstStepPending() {
    return this.firstSteps().find(s => !s.done) || null;
  }

  firstStepsAllDone() {
    return this.firstSteps().every(s => s.done);
  }

  onboardingStrip() {
    if (this.firstStepsAllDone()) return '';
    const steps = this.firstSteps();
    return `
      <div class="onboarding-strip">
        <div class="onboarding-title">· FIRST STEPS ·</div>
        <div class="onboarding-steps">
          ${steps.map(s => `
            <div class="onboarding-step ${s.done ? 'done' : ''}">
              <span class="onboarding-ico">${s.done ? '✅' : s.icon}</span>
              <span>${s.label}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }

  woundLoom() {
    return !!(this.state && this.woundLooms() && !this.wristWoundDue());
  }

  ageGoals() {
    const age = this.currentAge();
    return [
      { id: 'party', label: 'Stand with allies', icon: '👥', done: this.state.party.length >= 2, desc: 'Recruit at least one champion.' },
      { id: 'competition', label: 'Win the Competition', icon: '🏆', done: !!this.state.competitionWins, desc: 'Take a Competition victory.' },
      { id: 'decree', label: 'Found the Age', icon: '📜', done: this.hasDecree(), desc: 'Choose a founding decree.' },
      { id: 'level', label: 'Outgrow yourself', icon: '⚔️', done: this.state.level >= CROWN_TRIAL_REQ_LEVEL, desc: 'Reach Level ' + CROWN_TRIAL_REQ_LEVEL + '.' },
      { id: 'wound', label: 'Bind the wound', icon: '🩸', done: !!(this.state.woundState && this.state.woundState.done), desc: 'Repel the town wound.' },
      { id: 'crown', label: 'Take the crown', icon: '👑', done: !!this.state.kingOfAge, desc: 'Win the Crown Trial.' }
    ];
  }

  showAgeScroll() {
    const age = this.currentAge();
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    const goals = this.ageGoals();
    const done = goals.filter(g => g.done).length;
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('📜', 'The Scroll of the Age', `The wax on ${age.name} is still warm. Inscribe your legend and collect the Age's boons.`, k.color)}
        <div class="location-frame">
          <div class="scroll-goals ${done === goals.length ? 'all done' : ''}">
            <div class="scroll-progress"><div class="scroll-fill" style="width:${(done / goals.length) * 100}%"></div></div>
            <div class="scroll-caption">${done}/${goals.length} Ages set down. ${done === goals.length ? 'The Scroll is complete, the next will remember THIS fondly.' : 'Complete the Age and the crown is yours.'}</div>
            ${goals.map(g => `
              <div class="scroll-goal ${g.done ? 'done' : ''}">
                <div class="scroll-goal-ico">${g.done ? '✅' : g.icon}</div>
                <div class="scroll-goal-body">
                  <div class="scroll-goal-name">${g.label}</div>
                  <div class="scroll-goal-desc">${g.desc}</div>
                </div>
                ${g.done ? '<div class="scroll-goal-reward">Claimed</div>' : ''}
              </div>`).join('')}
          </div>
          <div class="ages-explainer">
            <div class="ages-explainer-title">🕰️ How the Ages Work</div>
            <ul class="ages-explainer-list">
              <li><b>One Age, one session.</b> Each Age is a full rise of every town, march, and Competition, won when the crown of the Arena falls to you.</li>
              <li><b>The Scroll guides you.</b> Complete every resolute above to hollow the crown: allies, a decree, a Competition win, Level ${CROWN_TRIAL_REQ_LEVEL}, and binding the town wound.</li>
              <li><b>The crown restarts the loop.</b> A crowned King dies when the Age ends, yet something of the line endures, and the world remembers what you did.</li>
              <li><b>Deception escalates.</b> Every cycle quickens the town wound and sharpens the shadow. Old gains, deeds and kept secrets carry into the next Age.</li>
              <li><b>The Competition wins a year; the crown wins an Age.</b> Win the year's tournament to secure your kingdom's standing, but only the Arena's mirror crowns a King.</li>
            </ul>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Trophy wall ---------- */
  showTrophyWall() {
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    const trophies = this.state.trophies || [];
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('🏛️', 'Hall of Champions', 'The trophies of your dynasty line the walls, each Age sealed in gold and remembered forever.', k.color)}
        <div class="location-frame">
          ${trophies.length === 0 ? '<p style="text-align:center;color:var(--text-dim)">No trophies yet, the Hall waits, dusted, for your first Age to fall.</p>' : ''}
          <div class="trophy-grid">
            ${trophies.map((t, i) => `
              <div class="trophy-card">
                <div class="trophy-top">${t.crowned ? '👑' : '🩸'} <span class="trophy-age">${t.ageName}</span></div>
                <div class="trophy-year">Year ${t.year} · ${t.title || '-'}</div>
                <div class="trophy-desc">${t.note || ''}</div>
                <div class="trophy-corruption" style="--tcor:${t.corruption > 5 ? '#e74c3c' : t.corruption > 2 ? '#f39c12' : '#2ecc71'}">corruption faded to ${t.corruption || 0}/10 after this Age</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  /* ---------- Ledger of Reigns: the full, unblinking accounting of the line ---------- */
  showLedger() {
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    const ledger = this.state.ledger || { truths: 0, lies: 0, shadows: 0 };
    const fs = this.state.fightStats || { wins: 0, losses: 0 };
    const nn = this.dynastyNickname();
    const nicknames = this.state.dynastyTitles || [];
    const relics = Object.keys(this.state.relicOk || {}).length;
    const wounds = Object.keys(this.state.townGrief || {}).length;
    const cell = (ico, label, val) => `<div class="ledger-cell"><div class="ledger-cell-ico">${ico}</div><div class="ledger-cell-label">${label}</div><div class="ledger-cell-val">${val}</div></div>`;
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('📖', 'Ledger of Reigns', 'The chronicler has stopped editing. Here is what your line has actually done, every battle, every truth, every shadow-shake.', '#8e8ea8')}
        <div class="location-frame">
          <div class="ledger-name-banner"><span class="ledger-name">${nn.title}</span><span class="ledger-reason">- ${nn.reason}</span></div>
          <div class="ledger-grid">
            ${cell('👤', 'Dynasty', `${this.state.dynasty || 0} heir(s)`)}
            ${cell('♾️', 'Cycle', `${this.state.cycle || 1}`)}
            ${cell('🗓️', 'Year', `${this.state.year || 1}`)}
            ${cell('👑', 'Crowns', `${this.state.crownWins || 0}`)}
            ${cell('🏆', 'Competitions', `${this.state.competitionWins || 0}`)}
            ${cell('🏛️', 'Ages sealed', `${(this.state.trophies || []).length}`)}
            ${cell('⚔️', 'Battles', `${fs.wins + fs.losses} (${fs.wins} won · ${fs.losses} lost)`)}
            ${cell('🪞', 'Truths', `${ledger.truths || 0}`)}
            ${cell('🕯️', 'Lies', `${ledger.lies || 0}`)}
            ${cell('🗝️', 'Shadow-errands', `${ledger.shadows || 0}`)}
            ${cell('🪑', 'Deals struck', `${ledger.deals || 0}`)}
            ${cell('🕊️', 'Temptations refused', `${this.state.temptationRefused || 0}`)}
            ${cell('🔥', 'Relics found', `${relics}/${RELICS.length}`)}
            ${cell('🌋', 'Rifts cleared', `${this.state.riftsCleared || 0}`)}
            ${cell('🩸', 'Wounds bound', `${wounds}`)}
            ${cell(this.state.eternalReforged ? '🧵' : '⚔️', 'Eternal Age', this.state.eternalReforged ? 'Reforged, Age of the Thread' : 'Kept, Age of the Sharp')}
            ${cell('⭐', 'Legacy perks', `${(this.state.legacyPerks || []).length}`)}
          </div>
          <div class="ledger-names">
            <div class="ledger-names-title">The names the world gave your line</div>
            ${nicknames.length === 0 ? '<p style="color:var(--text-dim)">None yet, the world is still deciding what to call you.</p>' : nicknames.map((n, i) => `
              <div class="ledger-names-row"><span class="ledger-names-age">${n.age}</span><b>${n.title}</b>, ${n.reason}</div>`).join('')}
          </div>
          <div class="ledger-names">
            <div class="ledger-names-title">The Stele of Heirs, those the line has buried</div>
            ${(this.state.burials || []).length === 0 ? '<p style="color:var(--text-dim)">None yet. The yard behind the hall is still empty grass, a mercy, not a monument.</p>' : this.state.burials.map(b => `
              <div class="ledger-names-row"><span class="ledger-names-age">${b.atAge} · Year ${b.year || '-'}</span><b>${b.name}</b>, lies in the yard behind the hall</div>`).join('')}
          </div>
          <div class="ledger-names">
            <div class="ledger-names-title">The lies your line let become families</div>
            ${(this.state.namedLies || []).length === 0 ? '<p style="color:var(--text-dim)">None. What the town believes is its own, so far.</p>' : this.state.namedLies.map(n => `
              <div class="ledger-names-row"><span class="ledger-names-age">${n.atAge} · Year ${n.year || '-'}</span><b>${n.name}</b>, a kept silence, given a festival</div>`).join('')}
          </div>
          <p style="text-align:center;margin-top:20px;font-style:italic;color:var(--text-dim);font-size:0.85rem">"The ledgers do not lie. They only wait.", the Chronicler</p>
        </div>
      </div>`;
  }

  /* ---------- The Quiet Row: the dynasty's dead, kept like a ledger ---------- */
  showQuietRow() {
    const k = KINGDOMS[this.state.kingdom];
    const burials = this.state.burials || [];
    const letters = this.state.dynastyLetters || [];
    const container = document.getElementById('hub-content');
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('🕯️', 'The Quiet Row', 'A careful line of small headstones behind the hall. The town keeps the grass short here, always, even when it has nothing else tidy.', '#9b8aa5')}
        <div class="location-frame">
          ${burials.length === 0 ? '<p style="text-align:center;color:var(--text-dim)">No names yet. The grass is still green and unmarked, a mercy.</p>' : `
            <div class="quiet-row">
              ${burials.slice().reverse().map((b, i) => {
                const note = letters.find(x => x.name === b.name);
                return `
                <div class="row-stone" style="animation-delay:${0.2 + i * 0.15}s">
                  <div class="row-stone-ico">${b.atAge.indexOf('Quiet') > -1 ? '🪕' : '🕯'}</div>
                  <div class="row-stone-name">${b.name}</div>
                  <div class="row-stone-age">${b.atAge} · Year ${b.year || '-'}</div>
                  ${note ? `<div class="row-stone-line">"${note.line}."</div>` : ''}
                </div>`;
              }).join('')}
            </div>
            <p style="text-align:center;font-style:italic;color:var(--text-dim);font-size:0.85rem">The town reads the Row the way it reads the Ledger, by looking at who still eats beside it.</p>`}
        </div>
      </div>`;
  }

  /* ---------- Town side quests ---------- */
  showSideQuest() {
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    if ((this.state.questDoneAge || null) === this.currentAge().id) {
      container.innerHTML = `${this.hallBackdrop()}
        <div class="hall-scene">
          ${this.locationBanner('🌼', 'A Stranger at the Gate', 'The stranger who needed a favor has gone, paid, thanked, and gone.', k.color)}
          <div class="location-frame">
            <p style="text-align:center;color:var(--text-dim)">Return next Age, the road always brings someone new.</p>
          </div>
        </div>`;
      return;
    }
    const quest = SIDE_QUESTS[Math.floor(Math.random() * SIDE_QUESTS.length)];
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('🧭', 'A Stranger at the Gate', 'Somewhere in the crowd, a hand reaches out and tugs your sleeve.', k.color)}
        <div class="location-frame">
          <div class="event-banner">
            <div class="event-title">${quest.title}</div>
            <p style="margin-top:12px;line-height:1.9;font-style:italic;color:var(--text-dim)">"${quest.prompt}"</p>
            <p style="margin-top:14px;line-height:1.7">It will take less than a half-minute of your time, and the thanks is small but real.</p>
            <div style="margin-top:18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
              <button class="btn btn-small" onclick="game.completeSideQuest()" style="flex:1">Do the favor (+${quest.reward.gold} gold, +${quest.reward.xp} xp, +${quest.reward.shards} shards)</button>
              <span style="font-size:0.75rem;color:var(--text-dim)">A half-minute of work.</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  completeSideQuest() {
    const quest = SIDE_QUESTS[Math.floor(Math.random() * SIDE_QUESTS.length)];
    this.state.questDoneAge = this.currentAge().id;
    this.state.gold += quest.reward.gold;
    this.state.exp += quest.reward.xp;
    this.awardShards(quest.reward.shards);
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">The stranger shakes your hand firmly, warm, calloused, human.</div>
        <div class="line" style="animation-delay:0.5s">"That's more than half a minute of kindness, friend. The road remembers the folk who stop."</div>
        <div class="line" style="animation-delay:1s">You found +${quest.reward.gold} gold, +${quest.reward.xp} xp, and +${quest.reward.shards} shards.</div>
      </div>
      <div class="story-continue" id="story-continue">Return to the Hall</div>`;
    document.getElementById('story-continue').addEventListener('click', () => { this.renderHub(); this.showScreen('hub'); });
  }

  /* ---------- The Mirror's Question: the player's own kingdom learns to lie ---------- */
  showThemeLie() {
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    if (this.state.themeLies && this.state.themeLies[this.currentAge().id]) {
      container.innerHTML = `${this.hallBackdrop()}
        <div class="hall-scene">
          ${this.locationBanner('🪞', 'The Mirror\'s Question', 'You answered the Mirror this Age. It remembers the answer.', '#8e8ea8')}
          <div class="location-frame">
            <p style="text-align:center;color:var(--text-dim)">The seam of the world still flexes, but not because of you. Not today.</p>
          </div>
        </div>`;
      return;
    }
    const lie = THEME_LIES[Math.floor(Math.random() * THEME_LIES.length)];
    this.state.pendingLie = lie.id;
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('🪞', 'The Mirror\'s Question', 'A truth you keep and a lie you live are about to meet in this town.', '#8e8ea8')}
        <div class="location-frame">
          <div class="event-banner" style="text-align:left">
            <div class="event-title">${lie.icon} The town is about to catch itself in a lie</div>
            <p style="margin-top:12px;line-height:1.9;font-style:italic;color:var(--text-dim)">"${lie.prompt.replace('${kingdom}', KINGDOMS[this.state.kingdom].name)}"</p>
            <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-small" onclick="game.answerThemeLie('lie')" style="flex:1">🕯️ Keep the lie, let the town sleep</button>
              <button class="btn btn-small" onclick="game.answerThemeLie('truth')" style="flex:1">🪞 Tell the truth, let the town see</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  answerThemeLie(choice) {
    const lie = THEME_LIES.find(l => l.id === this.state.pendingLie) || THEME_LIES[0];
    this.state.pendingLie = null;
    this.state.themeLies = this.state.themeLies || {};
    this.state.themeLies[this.currentAge().id] = choice;
    this.state.ledger = this.state.ledger || { truths: 0, lies: 0, shadows: 0 };
    this.state.ledger.lies += (choice === 'lie') ? 1 : 0;
    this.state.ledger.truths += (choice === 'truth') ? 1 : 0;
    const isLie = choice === 'lie';
    let gold = 0, corruption = 0, text = '';
    if (isLie) {
      gold = 40 + Math.floor(Math.random() * 40);
      corruption = 2;
      if ((this.state.decrees[this.currentAge().id] || '') === 'open_gates') corruption += 1;
      text = lie.lieGain[Math.floor(Math.random() * lie.lieGain.length)];
      this.state.corruption = Math.min(10, (this.state.corruption || 0) + corruption);
      // A lie, when the King is already in Deception's debt, buys a shard of the future it is financing.
      if ((this.state.deals || 0) > 0 || (this.state.ledger.shadows || 0) > 0) {
        this.awardShards(3);
        this.state.lieBoughtFuture = (this.state.lieBoughtFuture || 0) + 1;
      }
      this.shiftPartyLoyalty(1, ['striker', 'spunk', 'scrupulous']);
      this.shiftPartyLoyalty(-1, ['mender', 'bulwark']);
    } else {
      gold = -(30 + Math.floor(Math.random() * 30));
      text = lie.truthGain[Math.floor(Math.random() * lie.truthGain.length)];
      this.state.gold = Math.max(0, (this.state.gold || 0) + gold);
      // Telling the truth is remembered, the town trusts the crown a little more.
      this.state.townHonest = (this.state.townHonest || 0) + 1;
      // Teeth: when old lies live in the town, honesty costs the town its own face, and the debt is corruption.
      if ((this.state.namedLies || []).length >= 1) {
        this.state.corruption = Math.min(10, (this.state.corruption || 0) + 1);
        this.state.truthDugOldLies = (this.state.truthDugOldLies || 0) + 1;
      }
      this.shiftPartyLoyalty(-1, ['striker', 'spunk', 'scrupulous']);
      this.shiftPartyLoyalty(1, ['mender', 'bulwark']);
    }
    this.state.gold = Math.max(0, (this.state.gold || 0) + gold);
    if (isLie) {
      this.registerNamedLie();
      this.notePartyWord('disapprove');
    } else {
      this.notePartyWord('approve');
    }
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${isLie ? 'The lie settles like snow, soft, bright, and cold enough to numb.' : 'The truth settles like stone, heavy, honest, and finally quiet.'}</div>
        <div class="line" style="animation-delay:0.5s;color:${isLie ? '#c0392b' : '#5aa77a'}">${text}</div>
        <div class="line" style="animation-delay:1s">${isLie ? `Gold +${gold} · Corruption +${corruption}` : `Gold ${gold} · The town marks you honest (+1)`}.</div>
        <div class="line" style="animation-delay:1.4s;color:#8e8ea8">The Candle-Keeper, passing, nods once. Whatever you chose, someone counted it.</div>
      </div>
      <div class="story-continue" id="story-continue">Return to the Hall</div>`;
    document.getElementById('story-continue').addEventListener('click', () => { this.renderHub(); this.showScreen('hub'); });
  }

  /* ---------- Optional rift zones: one peril per Age, one relic inside ---------- */
  riftZone() {
    const a = this.currentAge();
    const rift = AGE_RIFTS[a.id];
    if (!rift) return null;
    if (this.state.riftDone && this.state.riftDone[a.id]) return null;
    return rift;
  }

  showRift() {
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    const rift = this.riftZone();
    if (!rift) {
      container.innerHTML = `${this.hallBackdrop()}
        <div class="hall-scene">
          ${this.locationBanner('🌋', 'A Closed Gate', 'The gate beyond the border is shut. Whatever lives beyond it is sleeping.', '#7a3b2a')}
          <div class="location-frame">
            <p style="text-align:center;color:var(--text-dim)">No peril waits this Age, or none you have earned.</p>
          </div>
        </div>`;
      return;
    }
    this.state.codex = Object.assign({}, this.state.codex || {}, { rift: true });
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner(rift.icon, rift.name, rift.note, '#7a3b2a')}
        <div class="location-frame">
          <div class="event-banner" style="text-align:left">
            <div class="event-title">The gate groans. Inside: ${rift.boss}.</div>
            <p style="margin-top:12px;line-height:1.9;font-style:italic;color:var(--text-dim)">"${rift.lore}"</p>
            <p style="margin-top:14px;line-height:1.7">Beyond the sand and the old applause, a relic waits in the heart of the rift. Beat <b>${rift.boss}</b> once, and carry it home.</p>
            <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-small" onclick="game.startRiftBattle()" style="flex:1">⚔️ Descend into the ${rift.name}</button>
              <button class="btn btn-small" onclick="game.renderHub();game.showScreen('hub')" style="flex:1">Walk away, the gate will still be here</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  startRiftBattle() {
    const rift = this.riftZone();
    if (!rift) { this.showRift(); return; }
    const age = this.currentAge();
    const lvl = this.state.level;
    const mult = this.difficultyMult();
    const bossStats = {
      hp: Math.round((120 + lvl * 20) * mult),
      atk: Math.round((60 + lvl * 8) * mult),
      def: Math.round((50 + lvl * 6) * mult),
      spd: Math.round((45 + lvl * 4) * mult),
      spAtk: Math.round((50 + lvl * 8) * mult)
    };
    const boss = { name: rift.boss, kingdom: 'rift', level: lvl, stats: bossStats, color: '#7a3b2a', isRift: true, signature: 'The rift\'s guardian hits with the weight of the place\'s unanswered question.' };
    // Two half-shadows keep the lone boss company.
    const shadows = [0, 1].map(i => ({ name: `Rift-Shadow ${i + 1}`, kingdom: 'rift', stats: { hp: Math.round((60 + lvl * 10) * mult), atk: Math.round((40 + lvl * 6) * mult), def: Math.round((30 + lvl * 4) * mult), spd: Math.round((40 + lvl * 3) * mult), spAtk: Math.round((30 + lvl * 5) * mult) } }));
    this.riftAgeId = age.id;
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">You step past the gate. The air here has not been breathed in a hundred years.</div>
        <div class="line" style="animation-delay:0.5s"><b>${rift.boss}</b> turns toward you, slowly, deliberately, and the rift remembers why it is dangerous.</div>
      </div>
      <div class="story-continue" id="story-continue">Fight the guardian</div>`;
    document.getElementById('story-continue').addEventListener('click', () => this.startBattle([boss, ...shadows], 'rift'));
  }

  // Depending on theft or triumph, the rift pays out a relic.
  riftReward() {
    const rift = this.riftZone();
    if (!rift) return;
    const found = RELICS[Math.floor(Math.random() * RELICS.length)];
    this.state.relicOk = this.state.relicOk || {};
    this.state.relicOk[found.id] = true;
    this.state.riftDone = this.state.riftDone || {};
    this.state.riftDone[this.currentAge().id] = true;
    this.state.gold = (this.state.gold || 0) + 80;
    this.awardShards(6);
    this.state.riftsCleared = (this.state.riftsCleared || 0) + 1;
    this.state.codex = Object.assign({}, this.state.codex || {}, { rift: true });
    this.save();
    return { rift, relic: found };
  }

  riftWin() {
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const packed = this.riftReward();
    if (!packed) { this.renderHub(); this.showScreen('hub'); return; }
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">The guardian falls, and does not rise. The rift settles like a held breath finally let go.</div>
        <div class="line" style="animation-delay:0.5s">Deep in the quiet heart of ${packed.rift.name}, you find what the place was guarding:</div>
        <div class="line" style="animation-delay:1s;color:#f1c40f"><b>${packed.relic.icon} ${packed.relic.name}</b>, +${packed.relic.amt} ${packed.relic.stat.toUpperCase()}.</div>
        <div class="line" style="animation-delay:1.4s;color:var(--text-dim)">"${packed.relic.desc}"</div>
        <div class="line" style="animation-delay:1.8s">Gold +80 · Shards +6 · The gate beyond the border stands open now, and empty.</div>
      </div>
      <div class="story-continue" id="story-continue">Carry the relic home</div>`;
    document.getElementById('story-continue').addEventListener('click', () => { this.renderHub(); this.showScreen('hub'); });
  }

  /* ---------- Corruption & lieutenants ---------- */
  corruptionMeter() {
    const c = this.state.corruption || 0;
    return `
      <div class="corruption-meter" style="--cm:${c * 10}%">
        <div class="corruption-head"><span>🌑 Deception</span><b>${c}/10</b></div>
        <div class="corruption-track"><div class="corruption-fill"></div></div>
        <div class="corruption-sub">${c === 0 ? 'The world is clean.' : c <= 2 ? 'A shadow in the corner of the eye.' : c <= 5 ? 'The towns whisper. Gold changes hands oddly.' : c <= 8 ? 'Lieutenants walk the roads openly now.' : 'Deception casts a long noon-dark. The Age rots.'}${this.state && (this.state.corruptionScar || false) ? ' <span style="color:#9b59b6">· The Cycle remembers every Age it has won.</span>' : ''}</div>
      </div>`;
  }

  corruptionWorldText() {
    const c = this.state.corruption || 0;
    if (c >= 8) return '🌑 Deception has a name in this Age: they are the WEATHER now.';
    if (c >= 5) return '🌑 Deception\'s lieutenants walk openly. Shadow bargains move through your town like coin.';
    if (c >= 3) return '🌗 Somewhere between two taverns, gold changes hands toward Deception.';
    return '🌕 The Age stands clean. Deception gnashes, far off, unheard.';
  }

  // Town condition, how the town itself carries corruption.
  townCondition() {
    const c = this.state.corruption || 0;
    if (c >= 8) return 'The streets are quiet in the wrong way. Bargains are struck at sunset, and the fountain runs black at moonrise.';
    if (c >= 5) return 'Candles burn in windows that used to be dark. The town speaks in half-sentences, watching who overhears.';
    if (c >= 3) return 'The town still opens its doors to you, but the doors are a shade narrower, and the greetings a shade shorter.';
    return 'The town is yours, warm and unguarded. Doors stand open; the smell of bread and wet cobble fills the yard.';
  }

  townConditionText() {
    const base = (() => {
      const variants = {
        god_kind: this.state.kingOfAge ? 'The Age crowns you, and the town wears festival garlands to prove it.' : 'The town believes in your crown, and in the age you are building toward.',
        fine: 'The town is in your stride: markets full, bells unhurried.'
      };
      const c = this.state.corruption || 0;
      if (c === 0) return variants.god_kind;
      return this.townCondition();
    })();
    return `${base} ${this.townVignette()}${this.townMemoryEcho()}`;
  }

  // One living vignette, a small, present, state-keyed moment on the streets.
  townVignette() {
    const s = this.state;
    const c = s.corruption || 0;
    if (s.kingOfAge) return 'Festival carts roll past stacked with wildflowers, and somebody has written your line\'s name on a banner with more love than letters.';
    if (s.usurper && !s.trueEnding) return `The crown your line dropped sits on <b>${s.usurper.name}</b>'s head now, and ${s.usurper.kingdom} wears it with a smile your town will not stop describing. The market prices are the only ones who talk about it, and they overcharge you to say so.`;
    if (s.finalWar && !s.trueEnding) return 'The eastern gate is barricaded with harvest wagons, stacked high as a small earthwork. Nobody says why; everybody looks east.';
    if (s.woundState) return 'The infirmary keeps a torchlit queue. The wounded nod to you as if you personally owned the weather that broke them.';
    if ((s.competitionWinsAge || 0) >= 3) return 'Kids in the yard re-enact your last duel with broom-swords, and the one playing you always wins by shouting the loudest.';
    if (c >= 5) return 'At dusk a lamplighter skips a streetlight near your hall, counts to ten, and relights it. You are fairly sure you are not meant to have seen that.';
    if (c >= 3) return 'A fruit vendor undercharges you by a copper and pretends not to, in exactly the way you pretend not to notice.';
    return 'A townswoman offers you the exact heel of last night\'s bread and grins as if it is the best joke in the world.';
  }

  // The town keeps a long memory. Naming one thing it refuses to forget, a trophy, a shade, a name.
  townMemoryEcho() {
    const s = this.state;
    const echoes = [];
    if (s.lastKing) {
      echoes.push(`The shade of ${s.lastKing.name} stands where the square's shadow falls furthest; the town walks a polite arc around him, the way you walk around a memory that isn't yours.`);
    }
    if ((s.trophies || []).length) {
      echoes.push(`A small square plaque marks your line's first trophy year, in handwriting someone never quite trusted to spell the names right.`);
    }
    const titles = s.dynastyTitles || [];
    if (titles.length) {
      const latest = titles[titles.length - 1];
      echoes.push(`Someone has painted <b>${latest.title}</b> on a market board and nailed it there. Nobody takes it down.`);
    }
    const lieEcho = this.lieMemoryEcho();
    if (lieEcho) echoes.push(lieEcho.trim());
    const burialEcho = this.burialEcho();
    if (burialEcho) echoes.push(burialEcho.trim());
    if (s.usurper) {
      echoes.push(`A market board now lists two prices for the day, yours, and the one <b>${s.usurper.name}</b> set. The town reads both, and shops slightly later, hoping the second one lowers.`);
    }
    if (s.firstTown && s.firstTown !== s.town) {
      echoes.push(`The oldest square still answers to the old name of <b>${s.firstTown}</b>, the town refuses to retire the word it was born under.`);
    }
    return echoes.length ? ` ${echoes.join(' ')}` : '';
  }

  // A glimpse east, each Age, into the thing that watches, Deception's own POV.
  deceptionInterlude() {
    const age = this.currentAge();
    const base = DECEPTION_INTERLUDES[age.id] || DECEPTION_INTERLUDES[AGES[0].id];
    const cycleTail = (this.state.cycle || 1) >= 2
      ? ' East of the world, the seam flexes and remembers this exact moment, from the last time, and the time before. Deception learns every loop it survives. This is its third year of happiness.'
      : '';
    return `<div class="interlude-label">East of the world</div>${base}${cycleTail}`;
  }

  // The world has started naming your line. The name is drawn from what you actually did.
  dynastyNickname() {
    const ledger = this.state.ledger || { truths: 0, lies: 0, shadows: 0 };
    const c = this.state.corruption || 0;
    if (c >= 8) return { title: 'the Moon-Crown', reason: 'the town sleeps when you rise, and dreams of what you bought' };
    if (this.state.usurper) return { title: 'the Unseated', reason: `it dropped the crown and ${this.state.usurper.name} picked it up, the town is still reading the prices the neighbour sets` };
    if ((this.state.reclaimed || 0) > 0) return { title: 'the Debt Collectors', reason: `it took the crown back ${this.state.reclaimed} time(s), by name, and the county keeps the receipts` };
    if (this.state.eternalReforged && (this.state.cycle || 1) >= 2) return { title: 'the Thread-Weavers', reason: 'you stitched the Mirror whole, one victory at a time' };
    if ((this.state.cycle || 1) >= 2) return { title: 'the Eternal Edge', reason: 'you kept the war-years sharp, Age after Age' };
    if ((ledger.shadows || 0) >= (ledger.truths || 0) && ledger.shadows > 1) return { title: 'the Excellent Customers', reason: 'the dead King endorsed them; the town wonders, quietly, what they bought' };
    if ((ledger.deals || 0) > 0) return { title: 'the Borrowed Crown', reason: `it sat down with the Empty Chair ${ledger.deals} time(s) and called it trade` };
    if ((ledger.lies || 0) > (ledger.truths || 0) && ledger.truths > 0) return { title: 'the Silken Line', reason: 'its words are kinder than its books' };
    if ((ledger.truths || 0) > (ledger.lies || 0)) return { title: 'the Lamp-Line', reason: 'it told the town what the town was almost ready to hear' };
    if ((this.state.crownWins || 0) >= 2) return { title: 'the Twice-Crowned', reason: 'the throne has learned their shape by heart' };
    return { title: 'the Straight Road', reason: 'a line that kept walking when the road bent' };
  }

  // Deception does not threaten you in the abstract, it has read your history, and it reads it out loud.
  deceptionTaunt() {
    const l = this.state.ledger || { truths: 0, lies: 0, shadows: 0 };
    const nn = this.dynastyNickname();
    const parts = [];
    if ((l.lies || 0) > 0) parts.push(`I counted ${l.lies} lie(s) kept so gently the town thanked you for them. You are a natural; I only ever believed in you a little.`);
    if ((l.shadows || 0) > 0) parts.push(`And ${l.shadows} little errand(s) for the dead King, in broad daylight, as if shaking my hand with your face showing.`);
    if ((l.truths || 0) > 0) parts.push(`Even the truths, ${l.truths} of them, you delivered the way you deliver a lamp to a house that is on fire.`);
    if (this.state.rivalFacedFinal) parts.push(`You brought your own grudge to my war so you would not have to stand alone. Loyalty is a lie I have always respected.`);
    if ((this.state.dynasty || 0) > 0) parts.push(`${this.state.dynasty} heir(s) you raised to keep the war warm. Somewhere a child calls you by name and does not know the price of the name.`);
    if ((this.state.namedLies || []).length) {
      (this.state.namedLies || []).forEach(n => parts.push(`You believed the town would keep your ${n.atAge} secret forever, so you gave it a family, <b>${n.name}</b> still sets a seat for it every first frost. That is architecture. I could not have done better, and I am the professional.`));
    }
    if ((this.state.burials || []).length > 2) parts.push(`${this.state.burials.length} of your dead already lie in a row behind the hall, and the newest one still has green on the stone. You pace faster than your yard fills. That takes either courage or momentum. I quote you to the mirror as "the momentum."`);
    if ((l.deals || 0) > 0) parts.push(`We have sat at a table together ${l.deals} time(s), and you kept returning to it. Three Ages in, you have learned to call the drawer "the economy." Do you know which one of us first did that?`);
    if ((this.state.truthDugOldLies || 0) > 0) parts.push(`Every time your honesty uncovered an old lie, you paid its price in the town's own shame, <b>${this.state.truthDugOldLies}</b> truth(s) that cost the town its face. I watched you rent your own mirror to price your conscience. Beautiful accounting, champion.`);
    if ((this.state.townHonest || 0) >= 3) parts.push(`You told this town <b>${this.state.townHonest}</b> truths and it applauded each one, so I memorized your honest name, champion. I will use it carefully, so that it still fits when I am done with it.`);
    if ((this.state.wrongedFamilies || []).length) {
      (this.state.wrongedFamilies || []).forEach(w => parts.push(`You refused to name the ${w.name} at the gate, so I fed them a reason to carry a blade. ${w.name} keep a still-drier seat for you now, and, this war, a sharper one. Such economy. You taught them that too.`));
    }
    if ((this.state.desertions || []).length) parts.push(`Your own ${this.state.desertions.map(d => d.name).join(' and ')} walked out into the dusk rather than stand where you were standing. Even I know that weight. I am not ashamed to feel it.`);
    const intro = `The town calls you "${nn.title}". I call you by a longer name. Listen:`;
    const outro = 'It is easier to keep the Mirror than to look in it, champion. I know. I built the mirror.';
    const body = parts.length ? parts.join(' ') : 'You have not even lied yet. How interesting, I have to do the telling for you.';
    return `${intro} ${body} ${outro}`;
  }

  masterLieutenant() {
    if (!this.state.corruption) return null;
    const active = DECEPTION_LIEUTENANTS.filter(l => l.arena <= this.state.corruption);
    if (!active.length) return null;
    return active[active.length - 1];
  }

  /* ---------- Town wound event ---------- */
  levelUpThreshold() {
    return this.state.level * 40;
  }

  woundThreshold() {
    return 8 - Math.max(0, (this.state.cycle || 1) - 1);
  }

  woundLooms() {
    if (this.state.woundState && this.state.woundState.done === (this.currentAge() ? this.currentAge().id : null)) return false;
    const t = this.woundThreshold();
    return (this.state.totalBattles || 0) >= Math.max(1, t - 2) && (this.state.totalBattles || 0) < t && !this.state.kingOfAge;
  }

  wristWoundDue() {
    const age = this.currentAge();
    if (this.state.woundState && this.state.woundState.done === age.id) return false;
    // The Eternal Cycle quickens the town wound: cycle 1 needs 8 battles, each further cycle needs one fewer.
    return (this.state.totalBattles || 0) >= this.woundThreshold() && !this.state.kingOfAge;
  }

  startTownWound() {
    const age = this.currentAge();
    const wound = TOWN_WOUNDS[Math.floor(Math.random() * TOWN_WOUNDS.length)];
    const lt = DECEPTION_LIEUTENANTS.find(l => l.arena === wound.lieutenant) || DECEPTION_LIEUTENANTS[wound.lieutenant % DECEPTION_LIEUTENANTS.length];
    const folk = TOWNSFOLK[Math.floor(Math.random() * TOWNSFOLK.length)];
    this.woundBattle = { phase: 1, wound, lt, ageId: age.id, folkId: folk.id };
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${wound.icon} ${wound.desc}</div>
        <div class="line" style="animation-delay:0.5s">${lt.name}, ${lt.epithet}, has taken seed in ${this.state.town}.</div>
        <div class="line" style="animation-delay:1s">You find <b>${folk.name}</b> at the edge of it: "${folk.beatDark}"</div>
        <div class="line" style="animation-delay:1.4s">The wound has a face this time, and the face knows you. That makes it worse. That makes it yours.</div>
      </div>
      <div class="story-continue" id="story-continue">Meet them in the two-sided night</div>`;
    document.getElementById('story-continue').addEventListener('click', () => this.startWoundPhase(1));
  }

  // After the wound is bound, the town's face resumes its rounds.
  townsfolkBeat() {
    const dark = (this.state.corruption || 0) >= 5 || this.wristWoundDue();
    const folk = TOWNSFOLK[Math.floor(Math.random() * TOWNSFOLK.length)];
    return { folk, beat: dark ? folk.beatDark : folk.beat };
  }

  // The party's thread: whichever companion speaks for the realm this morning.
  partyVoice(event) {
    const mates = (this.state.party || []).filter(p => !p.isPlayer && p.name);
    if (!mates.length) return null;
    const mate = mates[Math.floor(Math.random() * mates.length)];
    const vp = PARTY_VOICES[mate.archetype] || PARTY_VOICES.striker;
    const pool = (vp[event] || PARTY_VOICES.striker[event] || []);
    if (!pool.length) return null;
    const line = pool[Math.floor(Math.random() * pool.length)]
      .replace('{N}', mate.name)
      .replace('{NAME}', (this.state.lastKingName || mate.name));
    return { by: mate.name, line, icon: '🗣️' };
  }

  notePartyWord(event) {
    const v = this.partyVoice(event);
    if (!v) return;
    this.state.partyLog = this.state.partyLog || [];
    this.state.partyLog.push({ by: v.by, line: v.line, at: this.state.year || 1 });
    if (this.state.partyLog.length > 4) this.state.partyLog.shift();
  }

  lastPartyWord() {
    const log = this.state.partyLog || [];
    return log.length ? log[log.length - 1] : null;
  }

  /* ---------- Loyalty: the party chooses, not merely accompanies ---------- */
  getLoyalty(name) {
    return (this.state && this.state.loyalty && this.state.loyalty[name]) || 0;
  }

  shiftLoyalty(name, delta) {
    if (!name) return;
    this.state.loyalty = this.state.loyalty || {};
    this.state.loyalty[name] = Math.max(-4, Math.min(5, this.getLoyalty(name) + delta));
    this.save();
  }

  shiftPartyLoyalty(delta, archetypes) {
    (this.state.party || []).filter(p => !p.isPlayer && p.name).forEach(p => {
      if (!archetypes || archetypes.includes(p.archetype)) this.shiftLoyalty(p.name, delta);
    });
  }

  // Loyalty of 3+ is a companion who acts on your behalf, even against you.
  trustedCompanions() {
    return (this.state.party || []).filter(p => !p.isPlayer && p.name && this.getLoyalty(p.name) >= 3);
  }

  // Loyalty at the floor is a companion who leaves. Suites never reach the floor with
  // casual lies and a single deal; only a King who repeatedly crosses the party thins it.
  applyDesertions() {
    const mates = (this.state.party || []).filter(p => !p.isPlayer && p.name);
    const shaken = mates.filter(p => this.getLoyalty(p.name) <= -4);
    if (!shaken.length) return;
    const lowest = shaken.sort((a, b) => this.getLoyalty(a.name) - this.getLoyalty(b.name))[0];
    const lik = this.getLoyalty(lowest.name);
    const line = `${lowest.name} walks out of the Champion Hall at dusk, sword left on the table, ${lik === -4 ? 'without a goodbye, the most honest exit there is' : 'with one brutal sentence'}. "I stood beside you through the quiet things," they say. "I will not stand through this." The hall is a chair wider, and nobody sits in the new space.`;
    this.state.desertions = this.state.desertions || [];
    this.state.desertions.push({ name: lowest.name, atAge: this.currentAge().name, line, at: this.state.year || 1 });
    this.state.party = this.state.party.filter(p => p !== lowest);
    this.state.loyalty = this.state.loyalty || {};
    delete this.state.loyalty[lowest.name];
    this.state.lastDeserter = { name: lowest.name, line, atAge: this.currentAge().name };
    this.save();
  }

  mirrorOf(cycle) {
    return VIRTUE_MIRRORS[Math.max(0, Math.min(VIRTUE_MIRRORS.length - 1, (cycle || 1) - 1))];
  }

  // The dead King's last words, written from what the King actually did. A death with a face.
  deathWordFor(leader) {
    const s = this.state || {};
    const led = s.ledger || { truths: 0, lies: 0, shadows: 0, deals: 0 };
    const name = leader ? leader.name : 'the King';
    const bits = [];
    if ((s.namedLies || []).length) {
      const fam = s.namedLies[s.namedLies.length - 1];
      bits.push(`In the ${fam.atAge}, I told the town a kinder story because I could not afford the true one. Keep the ${fam.name}. I did`);
    } else if ((led.lies || 0) > 0) {
      bits.push(`I kept ${led.lies} lie(s) warm in my own pocket this life. Count them when you are ready. They are receipts`);
    }
    if ((s.crownWins || 0) > 0) bits.push(`I wore ${s.crownWins} crown(s) and still never learned to put one down gently`);
    if (s.usurper) bits.push(`I let ${s.usurper.name} take the crown I had carried. Do not avenge that; answer it`);
    if ((s.corruption || 0) >= 6) bits.push(`the lamp went out in me before the battle did. I am sorry you inherit the dark`);
    else if ((s.townHonest || 0) >= 3) bits.push(`I told the town ${s.townHonest} true things and it kept them all. That is the whole proof I was real`);
    if (s.lastKingLetter) bits.push(`I owed the old King a visit and never made it. Go say the thing we both meant`);
    if ((s.desertions || []).length) bits.push(`before the end I was alone enough to understand them. ${s.desertions[s.desertions.length - 1].name} was right, and I knew it`);
    if (bits.length < 1) bits.push(`I meant to leave a better sentence than this and the battle took the better one first`);
    const letter = bits.join('. ');
    return { letter, name };
  }

  // A kept lie earns a family, a name the town will keep raising bread to. Up to three.
  registerNamedLie() {
    const aged = this.state.namedLies = this.state.namedLies || [];
    if (aged.length >= 3) return;
    const age = this.currentAge();
    aged.push({
      name: LIE_FAMILIES[aged.length % LIE_FAMILIES.length],
      atAge: age.name,
      year: this.state.year || 1
    });
  }

  /* ---------- The Reckoning, a named lie comes back calling ---------- */
  reckoningDue() {
    return (this.state.namedLies || []).length >= 1 && this.state.reckoningDone == null;
  }

  showReckoning() {
    const fam = this.state.namedLies[this.state.namedLies.length - 1];
    const container = document.getElementById('hub-content');
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('⚖️', 'The Reckoning', 'A delegation at the gate, older than any lie should be allowed to make anyone.', '#c9a961')}
        <div class="location-frame">
          <div class="event-banner" style="text-align:left">
            <div class="event-title">They have come for the name</div>
            <p style="margin-top:12px;line-height:1.9;font-style:italic;color:var(--text-dim)">"${RECKONING_LINES.setup.replace('{FAMILY}', fam.name)}"</p>
            <p style="margin-top:14px;line-height:1.7">The town watches from behind shutters, the way it watched the night you named it. Whatever you say now will be the truth the town uses to re-read every lie before it.</p>
            <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-small" onclick="game.confessReckoning()" style="flex:1">🪞 Name it, admit the ${fam.name} lie in public (100 gold, +2 town honesty, Corruption +1)</button>
              <button class="btn btn-small" onclick="game.doubleDownReckoning()" style="flex:1">🌑 Refuse to name it, call it 'an old misunderstanding' (100 gold, Corruption +2, the ${fam.name} leave wronged)</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  confessReckoning() {
    const fam = this.state.namedLies[this.state.namedLies.length - 1];
    this.state.gold = Math.max(0, (this.state.gold || 0) - 100);
    this.state.townHonest = (this.state.townHonest || 0) + 2;
    this.addCorruption(1);
    this.state.reckoningDone = true;
    this.state.confessed = this.state.confessed || [];
    this.state.confessed.push(fam.name);
    this.notePartyWord('approve');
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s;color:#5aa77a">${RECKONING_LINES.confess.replace('{FAMILY}', fam.name)}</div>
        <div class="line" style="animation-delay:0.5s">It costs the town 100 gold in lost silence, hurts its pride enough to scar (+1 Corruption), but the ${fam.name} step back into the ordinary, resumed, and someone starts sweeping the square like a lid has been lifted.</div>
        <div class="line" style="animation-delay:1s;color:var(--gold)">+2 town honesty. The town keeps this day.</div>
      </div>
      <div class="story-continue" id="story-continue">Return to the Hall</div>`;
    document.getElementById('story-continue').addEventListener('click', () => { this.renderHub(); this.showScreen('hub'); });
  }

  doubleDownReckoning() {
    const fam = this.state.namedLies[this.state.namedLies.length - 1];
    this.state.gold = (this.state.gold || 0) + 100;
    this.addCorruption(2);
    this.state.reckoningDone = true;
    this.state.wrongedFamilies = this.state.wrongedFamilies || [];
    this.state.wrongedFamilies.push({ name: fam.name, atAge: this.currentAge().name });
    this.shiftPartyLoyalty(-2, ['mender', 'bulwark']);
    this.notePartyWord('doubt');
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s;color:#c0392b">${RECKONING_LINES.doubledown.replace('{FAMILY}', fam.name)}</div>
        <div class="line" style="animation-delay:0.5s">The gate stays shut. Somewhere in the dusk, ${fam.name} begin to believe the town was never going to name them, because the town never has to. Corruption +2. The money feels fine in your hand, which is Deception's favorite kind of fine.</div>
        <div class="line" style="animation-delay:1s;color:var(--gold)">The ${fam.name} are wronged now, and wronged is a war-word.</div>
      </div>
      <div class="story-continue" id="story-continue">Return to the Hall</div>`;
    document.getElementById('story-continue').addEventListener('click', () => { this.renderHub(); this.showScreen('hub'); });
  }

  lieMemoryEcho() {
    const aged = this.state.namedLies || [];
    if (!aged.length) return '';
    const last = aged[aged.length - 1];
    return ` The town still sets a seat for <b>${last.name}</b> every first frost, a lie with a festival, named in the ${last.atAge}. That was your architecture. In the ${last.atAge}, that silence became a neighbor.`;
  }

  burialEcho() {
    const b = this.state.burials || [];
    if (!b.length) return '';
    const list = b.slice(-2).map(x => x.name).join(' · ');
    return ` Behind the hall, <b>The Quiet Row</b> holds ${list}. The yard is no longer empty grass; it is a ledger the town deciphers by looking at who still eats beside it.`;
  }

  // Who stands with you at the final gate, and who stands against, the whole history, gathered.
  finalGatheringHTML() {
    const allies = [];
    const wronged = [];
    (this.state.party || []).filter(p => !p.isPlayer && p.name).forEach(p => allies.push(p.name));
    const led = this.state.ledger || { truths: 0, lies: 0, shadows: 0, deals: 0 };
    if (led.truths > 0) allies.push('the towns that learned to see');
    if (this.state.riftsCleared > 0) allies.push(`the rifts you walked into and out of (${this.state.riftsCleared})`);
    if (this.state.relicOk && Object.keys(this.state.relicOk).length) allies.push('the relics carried, still warm');
    if ((this.state.burials || []).length) allies.push('the dead, who still stand where they stood');
    if (this.state.lastKingLetter || this.state.unfinishedThing) allies.push('the letter of the King who could not finish');
    (this.state.confessed || []).forEach(c => allies.push(`${c}, named at last`));
    const trusted = this.trustedCompanions();
    if (trusted.length) allies.push(`${trusted.map(c => c.name).join(' · ')} (chose to stay loudly)`);
    const rv = this.state.rivals || {};
    Object.keys(rv).forEach(r => { if ((rv[r] || 0) >= 2) wronged.push(r); });
    (this.state.namedLies || []).forEach(n => wronged.push(`${n.name} (bred of a kept silence)`));
    (this.state.wrongedFamilies || []).forEach(w => wronged.push(`${w.name} (refused the name you kept)`));
    (this.state.desertions || []).forEach(d => wronged.push(`${d.name}, who walked out`));
    if (this.state.usurper) wronged.push(`${this.state.usurper.name}, who wears the crown you dropped`);
    if ((led.deals || 0) > 0) wronged.push('the Empty Chair, which called you colleague');
    if (this.state.rivalFacedFinal) wronged.push(this.state.rivalFacedFinal.name);
    const a = allies.length ? allies.join(' · ') : 'only yourself, standing under the two-sided night';
    const w = wronged.length ? wronged.join(' · ') : 'none, the wrongs you made were few enough to outlive';
    return `<div class="gathering">
      <div class="gathering-title">WHO STANDS WITH YOU, AND WHO STANDS AGAINST</div>
      <div class="gathering-row">Stepping forward: <b>${a}</b></div>
      <div class="gathering-row wronged">Stepping forward last, not to help: ${w}</div>
    </div>`;
  }

  /* ---------- The Empty Chair ---------- */
  temptationDue() {
    return (this.state.corruption || 0) >= 3 && !this.state.temptationDone && (this.state.ledger.lies || this.state.ledger.shadows) > 0;
  }

  startTemptation() {
    this.showScreen('story');
    const scene = TEMPTATION_SCENES[Math.min((this.state.deals || 0), TEMPTATION_SCENES.length - 1)];
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${scene.setup}</div>
        <div class="line" style="animation-delay:0.7s;color:#b07bd8">${scene.price}</div>
        <div class="line" style="animation-delay:1.3s">${scene.offer}</div>
      </div>
      <div style="text-align:center;margin-top:22px" class="tempt-row">
        <button class="btn" onclick="game.acceptDeception()">🩶 Take the deal</button>
        <button class="btn btn-ghost" onclick="game.refuseTemptation()">🪞 Stand up</button>
      </div>`;
  }

  acceptDeception() {
    this.state.deals = (this.state.deals || 0) + 1;
    const led = this.state.ledger = this.state.ledger || { truths: 0, lies: 0, shadows: 0, deals: 0 };
    led.deals = (led.deals || 0) + 1;
    // A companion who has trusted you all these years does not let you sit down without a word.
    const interceptor = this.trustedCompanions()[0];
    const intercepted = !!interceptor;
    if (intercepted) {
      this.state.gold = (this.state.gold || 0) + 125 + (this.state.deals - 1) * 50;
      this.addCorruption(1);
      this.state.dealIntercepted = (this.state.dealIntercepted || 0) + 1;
      this.shiftLoyalty(interceptor.name, 1);
    } else {
      this.state.gold = (this.state.gold || 0) + 250 + (this.state.deals - 1) * 100;
      this.addCorruption(2);
    }
    this.state.temptationDone = true;
    this.state.lastDealAt = this.state.year || 1;
    // The deal dims every trusting face, except the one that stepped in front of the drawer.
    (this.state.party || []).filter(p => !p.isPlayer && p.name && p.name !== (interceptor ? interceptor.name : '')).forEach(p => this.shiftLoyalty(p.name, -2));
    this.notePartyWord(intercepted ? 'approve' : 'doubt');
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        ${intercepted ? `<div class="line" style="animation-delay:0.1s;color:#5aa77a">...and then <b>${interceptor.name}</b> steps between you and the drawer. They do not raise a hand. They simply stand there, absolutely present, and the drawer is, for one long second, embarrassed. "${interceptor.name}": "We have sat beside you through the quiet things. That does not mean we will sit across from it."</div>
        <div class="line" style="animation-delay:0.45s;color:#b07bd8">The deal is struck anyway, half as large, half as deep, because you are still you, and some of you wanted it. +125 gold · Corruption +1. They took the other half and burned the contract, and the archive records it as a debt repaid by someone who was never asked to owe.</div>` : `<div class="line" style="animation-delay:0.1s;color:#b07bd8">The drawer slides home. The fire does not even blink.</div>
        <div class="line" style="animation-delay:0.6s;color:var(--gold)">THE DEAL IS STRUCK.</div>
        <div class="line" style="animation-delay:1.1s">Somewhere behind the hall, a coin the town cannot name begins to spend. The Empty Chair is empty no longer, it is merely unoccupied, which is different, and worse. The archive will record this King not as a monster, but as a customer.</div>`}
      </div>
      <div class="story-continue" id="story-continue">Walk into the next dawn</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      this.state.dealEndAt = true;
      this.startEternalAge(false);
    });
  }

  refuseTemptation() {
    this.state.temptationDone = true;
    this.state.temptationRefused = (this.state.temptationRefused || 0) + 1;
    this.state.corruption = Math.max(0, (this.state.corruption || 0) - 2);
    this.state.townHonest = (this.state.townHonest || 0) + 1;
    this.notePartyWord('approve');
    this.shiftPartyLoyalty(1);
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">You stand. The stool tips. The fire goes out without a sound.</div>
        <div class="line" style="animation-delay:0.6s;color:var(--gold)">The shape stays a moment longer, wearing your every future warmly, and then it is gone, the table with it.</div>
        <div class="line" style="animation-delay:1.1s">The East Gate smells of nothing but night. You are, for the first time in years, uncounted.</div>
      </div>
      <div class="story-continue" id="story-continue">Leave the gate</div>`;
    document.getElementById('story-continue').addEventListener('click', () => this.renderHub());
  }

  startWoundPhase(phase) {
    if (!this.woundBattle) return;
    const { wound, lt } = this.woundBattle;
    const lvl = this.state.level;
    const enemies = phase === 1
      ? [
          { name: `Corrupted ${wound.title.split(' ')[0]} Maker`, kingdom: 'neutral', stats: { hp: 90 + lvl * 14, atk: 30 + lvl * 6, def: 22 + lvl * 4, spd: 40 + lvl * 3, spAtk: 26 + lvl * 5 } },
          { name: 'Drunk Shadow', kingdom: 'neutral', stats: { hp: 80 + lvl * 12, atk: 26 + lvl * 5, def: 26 + lvl * 4, spd: 34 + lvl * 2, spAtk: 20 + lvl * 4 } }
        ]
      : [{ ...lt, stats: { ...lt.stats } }];
    if (phase === 2) {
      const scale = 0.9 + this.state.level * 0.14;
      Object.keys(enemies[0].stats).forEach(s => enemies[0].stats[s] = Math.round(enemies[0].stats[s] * scale));
    }
    this.startBattle(enemies, 'wound');
  }

  /* ---------- Wagers ---------- */
  openWager() {
    const round = this.competitionRound || 1;
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const hometown = KINGDOMS[this.state.kingdom] ? KINGDOMS[this.state.kingdom].name : 'your kingdom';
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">Before Round ${round} is called, the bookkeepers shoulder through the crowd.</div>
        <div class="line" style="animation-delay:0.5s">Stake <b>25 gold</b> of the town's purse on the round. <b>Honor Your Odds</b> returns it at 2× if ${hometown} carries the round. <b>Deception's Cheat</b> returns it at 3×, and the shadow adds 2 corruption to the town.</div>
        <div class="line" style="animation-delay:0.9s;opacity:.75">A lost round costs the stake. Refusing the wager costs nothing.</div>
      </div>
      <div class="wager-grid">
        ${Object.entries(ARENA_WAGERS).map(([kind, w]) => `
          <div class="wager-card ${kind}" onclick="game.confirmWager('${kind}')" style="--wc:${kind === 'deception' ? '#9b59b6' : 'var(--gold)'}">
            <div class="wager-ico">${w.icon}</div>
            <div class="wager-name">${w.label}</div>
            <div class="wager-desc">${w.desc}</div>
          </div>`).join('')}
      </div>
      <div style="text-align:center;margin-top:18px">
        <button class="btn btn-small" onclick="game.startCompetitionRound()" style="opacity:0.7">No wager, fight true</button>
      </div>`;
  }

  confirmWager(kind) {
    const w = ARENA_WAGERS[kind];
    const round = this.competitionRound || 1;
    this.pendingWager = { kind, amount: 25, pay: w.pay, corruption: w.corruption };
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const payoff = w.pay === 2 ? 'leave with 50: your 25 back and 25 more' : 'leave with 75: your 25 back and 50 more';
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${w.icon} The bookkeeper scratches on a slate: <b>${w.label}</b>.</div>
        <div class="line" style="animation-delay:0.5s">25 gold staked on Round ${round}. Take the round and ${payoff}${w.corruption ? `, but Deception adds ${w.corruption} corruption to the town.` : '. A lost round forfeits the stake.'}</div>
      </div>
      <div class="story-continue" id="story-continue">${w.pay === 2 ? 'Bet on yourself' : 'Take Deception\'s odds'}</div>`;
    document.getElementById('story-continue').addEventListener('click', () => this.startCompetitionRound());
  }

  settleWager(win) {
    if (!this.pendingWager) return;
    const { kind, amount, pay, corruption } = this.pendingWager;
    this.pendingWager = null;
    if (win) {
      const prize = amount;
      this.state.gold += prize * (pay - 1);
    } else {
      this.state.gold = Math.max(0, this.state.gold - amount);
    }
    if (corruption) this.addCorruption(corruption);
    this.save();
  }

  renderHub() {
    if (!this.state) return;
    this.applyDesertions();
    const k = KINGDOMS[this.state.kingdom];
    const age = this.currentAge();
    const townName = this.state.town || (age.towns && age.towns[this.state.kingdom]) || 'The Ring';
    const container = document.getElementById('hub-content');
    container.style.setProperty('--hall-glow', `rgba(212,168,71,0.4)`);
    container.style.setProperty('--realm-art', `url("assets/kingdoms/${k.id}.jpg")`);

    const gold = this.state.gold;
    const partyCount = this.state.party.length;
    const itemCount = Object.values(this.state.inventory).reduce((a, b) => a + b, 0);

    const seal = (ico, label, val) => `
      <div class="hall-seal">
        <span class="seal-ico">${ico}</span>
        <span class="seal-label"><small>${label}</small><b>${val}</b></span>
      </div>`;

    const zones = [
      { action: 'showTraining', icon: '⚔️', name: 'Training Grounds', loc: 'East Wing · Courtyard', desc: 'Sharpen your blade against the practice dummies. Free bouts, or wager your gold for a sharper lesson.', foot: 'Every fall teaches. So does every win', cta: 'Enter the yard', color: k.color, glyph: '⚔' },
      { action: 'showRoleGuild', icon: '🎖️', name: 'Guild Hall', loc: 'Inner Yard · Doors of the Calling', desc: 'Every champion walks a path. Train your role, unlock talents, and run off-season drills.', foot: `${this.roleSummary()}`, cta: 'Answer the call', color: k.color, glyph: '✦' },
      { action: 'showRecruit', icon: '🛡️', name: 'Champion Hall', loc: 'West Wing · Hall of Heroes', desc: 'Champions of your realm gather here. Recruit allies to march beside you.', foot: `${partyCount}/4 in your party`, cta: 'Meet the champions', color: k.color, glyph: '🛡' },
      { action: 'showShop', icon: '⚗️', name: 'Quartermaster', loc: 'Armory · Weapons Rack', desc: 'Provision your company. Salves, elixirs and field gear for gold.', foot: `${gold} gold`, cta: 'Browse the stores', color: k.color, glyph: '✦' },
      { action: 'showCodex', icon: '📜', name: 'Codex of the Mirror', loc: 'Archives · The Sealed Shelf', desc: 'Lore of the eight virtues, the Mirror, and the name behind the crack.', foot: `${(this.state.codex ? Object.values(this.state.codex).filter(Boolean).length : 0)}/${CODEX_ENTRIES.length} entries`, cta: 'Read the codex', color: '#8e8ea8', glyph: '✎' },
      { action: 'showIntel', icon: '🕯️', name: 'Scout Reports', loc: 'War Table · Map Chamber', desc: 'Read what the scouts brought back from the shadowed border.', foot: 'Knowledge is armor', cta: 'Read intelligence', color: k.color, glyph: '◈' },
      { action: 'showInventory', icon: '📜', name: 'Inventory', loc: 'Camp Stores · Regalia Chest', desc: 'Everything you carry. Supplies, relics and battle-trophies.', foot: `${itemCount} carried`, cta: 'Open the chest', color: '#9a8e7a', glyph: '▣' },
      { action: 'startCompetition', icon: '🏆', name: 'Enter Competition', loc: 'Throne Room · Arena of Virtues', desc: 'Face the champions of the other kingdoms. Three rounds. One throne.', foot: `${this.state.competitionWins} wins claimed`, cta: 'Sound the horn', color: k.color, glyph: '♛' },
      { action: 'startCrownTrial', icon: '👑', name: this.state.level >= CROWN_TRIAL_REQ_LEVEL ? 'Crown Trial' : 'Crown Trial (Sealed)', loc: 'The Ring of Ages · Heart of the Arena', desc: this.state.level >= CROWN_TRIAL_REQ_LEVEL ? 'Declare the role of your kingdom and face its perfected mirror. Defeat it and be crowned King of the Age.' : `Reach Level ${CROWN_TRIAL_REQ_LEVEL} to earn the right to face the Age's mirror.`, foot: this.state.level >= CROWN_TRIAL_REQ_LEVEL ? (this.state.kingOfAge ? 'The King reigns' : `${this.state.crownWins} crown(s) claimed`) : `Requires Level ${CROWN_TRIAL_REQ_LEVEL}`, cta: this.state.level >= CROWN_TRIAL_REQ_LEVEL ? 'Enter the ring' : 'Sealed', color: this.state.level >= CROWN_TRIAL_REQ_LEVEL ? '#f1c40f' : '#555555', glyph: '♛' },
      { action: 'showDecree', icon: this.hasDecree() ? '📜' : '📜', name: this.hasDecree() ? 'The Founding Decree' : 'Choose the Founding Decree', loc: 'Town Square · The First Parchment', desc: 'The founding act of this Age, what shall shape your town?', foot: this.hasDecree() ? `Sealed: ${DECREES.find(d => d.id === this.state.decrees[this.currentAge().id])?.name || ''}` : 'Unsealed', cta: this.hasDecree() ? 'Read it' : 'Choose', color: '#c9a961', glyph: '📜' },
      { action: 'showAgeScroll', icon: '📖', name: 'The Scroll of the Age', loc: 'Archives · Inscribed Ledger', desc: 'Your Age, written down as milestones. Complete them all to hollow out the crown.', foot: `${this.ageGoals().filter(g => g.done).length}/${this.ageGoals().length} resolutes`, cta: 'Inscribe your legend', color: '#8e8ea8', glyph: '✎' },
      ...(this.state.finalWar && !this.state.trueEnding ? [{ action: 'startFinalWarWave', icon: '🌑', name: `The Final War`, loc: 'The Eastern Siege · Deception\'s Camp', desc: this.state.finalWar.wave === 1 ? 'The first wave of the Eighth\'s army crawls over the eastern ridge.' : this.state.finalWar.wave === 2 ? 'Wave 2, the architects of the shadow take the field.' : 'Wave 3, the grave-guard and the Eighth itself. End it.', foot: `Wave ${this.state.finalWar.wave}/3`, cta: this.state.finalWar.wave >= 3 ? 'Face the Eighth' : 'Take the field', color: '#202020', glyph: '🌑' }] : []),
      ...(this.corruptionCrisisDue() ? [{ action: 'startCorruptionCrisis', icon: '🩸', name: 'The Corruption Crisis', loc: 'Town Square · The Crack', desc: 'The Age\'s corruption has crowned itself. The town wears its darkness in public now.', foot: 'Corruption at its cap', cta: 'Face the crack', color: '#c0392b', glyph: '🩸' }] : []),
      { action: 'showTrophyWall', icon: '🏛️', name: 'Hall of Champions', loc: 'North Wing · Long Gallery', desc: 'Trophies of every Age your dynasty has survived.', foot: `${(this.state.trophies || []).length} trophy/trophies`, cta: 'Walk the gallery', color: '#b8860b', glyph: '🏛' },
      { action: 'showLedger', icon: '📖', name: 'Ledger of Reigns', loc: 'Archives · The Chronicler\'s Wing', desc: 'The full accounting of your line: battles won and lost, truths kept and lies told, relics found and names earned.', foot: `${(this.state.fightStats ? this.state.fightStats.wins + this.state.fightStats.losses : 0)} battle(s) fought · ${(this.state.ledger ? this.state.ledger.truths : 0)} truth(s)`, cta: 'Read the ledger', color: '#8e8ea8', glyph: '✎' },
      ...(this.state.lastKing ? [{ action: 'showKingLetters', icon: '🗝️', name: 'The Fallen Throne', loc: 'Beyond the Throne · A Shade', desc: 'The King of the last Age sits in the corner of the world, remembering.', foot: `${this.state.lastKing.name} waits`, cta: 'Approach the shade', color: '#8e8ea8', glyph: '🗝' }] : []),
      ...(this.reckoningDue() ? [{ action: 'showReckoning', icon: '⚖️', name: 'The Reckoning', loc: 'The Town Gate · A Delegation', desc: 'The family your oldest silence named has come to the gate, not for bread, and not for mercy. For the name.', foot: `${this.state.namedLies.length} kept lie(s) knocking`, cta: 'Open the gate', color: '#c9a961', glyph: '⚖' }] : []),
      ...((this.state.questDoneAge || null) !== this.currentAge().id ? [{ action: 'showSideQuest', icon: '🧭', name: 'A Stranger at the Gate', loc: 'The Town Gate · Crowd', desc: 'A small hand reaches out of the crowd for a half-minute of your mercy.', foot: 'Quick favor', cta: 'Hear them out', color: '#5aa77a', glyph: '🧭' }] : []),
      ...(!this.state.themeLies || !this.state.themeLies[this.currentAge().id] ? [{ action: 'showThemeLie', icon: '🪞', name: 'The Mirror\'s Question', loc: 'The Candle-Keeper\'s Window', desc: `Somewhere in ${townName}, a truth you keep and a lie you live are about to meet.`, foot: 'Only you can answer', cta: 'Answer the Mirror', color: '#8e8ea8', glyph: '🪞' }] : []),
      ...(this.riftZone() ? [{ action: 'showRift', icon: '🌋', name: this.riftZone().name, loc: 'Beyond the Border · A Closed Gate', desc: this.riftZone().note, foot: 'One relic waits inside', cta: 'Descend into the rift', color: '#7a3b2a', glyph: '🌋' }] : []),
      ...(this.wristWoundDue() ? [{ action: 'startTownWound', icon: '🩸', name: 'The Town Wound', loc: 'Outskirts · A Festering', desc: 'Deception\'s seed has opened a wound in your town. Bind it, or let it fester.', foot: 'Two-sided battle', cta: 'Bind the wound', color: '#c0392b', glyph: '🩸' }] : []),
      ...(this.temptationDue() ? [{ action: 'startTemptation', icon: '🪑', name: 'The Empty Chair', loc: 'East Gate · A Second Stool', desc: 'Something has set a table at the East Gate where no table was, and a fire that burns without sound. It is not an ambush. It is worse: it is an invitation.', foot: 'The Eighth sits down', cta: 'Sit for a moment', color: '#b07bd8', glyph: '🪑' }] : []),
      ...((this.state.burials || []).length ? [{ action: 'showQuietRow', icon: '🕯️', name: 'The Quiet Row', loc: 'Behind the Hall · The Yard', desc: 'Where the dynasty keeps its dead. The town reads the Row the way it reads a ledger, by looking at who still eats beside it.', foot: `${this.state.burials.length} name(s) set`, cta: 'Walk the Row', color: '#9b8aa5', glyph: '🕯' }] : [])
    ];

    const partyCards = this.state.party.map(p => {
      const info = this.getClassInfo(p.class, this.state.kingdom) || { name: p.class };
      return `
        <div class="hall-portrait">
          <div class="portrait-niche">
            <div class="portrait-avatar">${info.avatar || ''}</div>
          </div>
          <div class="portrait-plate">
            <div class="portrait-name">${p.name}</div>
            <div class="portrait-class">${info.name || p.class} · Lv ${p.level || 1}</div>
          <div class="portrait-role">${ROLE_ARCHETYPES[p.archetype]?.icon || ''} ${ROLE_ARCHETYPES[p.archetype]?.name || ''} · ${roleTitleFor(p.roleLevel || 1)}</div>
            <div class="portrait-hp"><div class="portrait-hp-fill"></div></div>
          </div>
        </div>`;
    }).join('');

    const emptySlots = Array(Math.max(0, 4 - partyCount))
      .fill(`<div class="hall-portrait"><div class="portrait-empty">Empty<br>Votive Stone</div></div>`).join('');

    container.innerHTML = `
      <div class="hall-bg"></div>
      <div class="hall-flicker"></div>
      <div class="hall-veil"></div>
      <div class="hall-scene">
        <div class="hall-masthead">
          <div class="hall-emblem">${k.emblem}</div>
          <div class="hall-title">${k.name}</div>
          <div class="hall-motto">"${k.motto}"</div>
          <div class="hall-year">${this.state.kingOfAge ? `♛ ${KING_OF_THE_AGE_TITLE.replace('{AGE}', this.ageName(age))}` : `Year ${this.state.year} · ${age.name} · ${townName}`}</div>
          <p class="hall-caption">${k.description}</p>
          <p class="hall-town" style="margin-top:6px;font-size:12px;color:${this.state.corruption >= 5 ? '#9b59b6' : 'var(--gold)'};opacity:.85">${this.townConditionText()}</p>
          <div class="hall-hud-btns">
            <button class="audio-toggle" id="audio-toggle" onclick="game.toggleMute()" title="Toggle procedural sound">${this.audioFx && this.audioFx.muted ? '🔇' : '🔊'}</button>
            <button class="pause-toggle" onclick="game.showPauseMenu()" title="Menu">☰</button>
          </div>
        </div>

        ${this.woundLoom() ? `<div class="hall-alert">🩸 The town has begun to flinch at shadows. <b>Deception's seed is digging in</b>, bind the wound before it blossoms (${this.woundThreshold()} battles needed).</div>` : ''}
        ${this.onboardingStrip()}
        ${this.firstStepPending() ? `<div class="first-step-hint">➤ Next step: <b>${this.firstStepPending().label}</b>, the lit door below.</div>` : ''}

        <div class="hall-seals">
          ${seal('🪙', 'Gold', gold)}
          ${seal('⚔️', 'Level', this.state.level)}
          ${seal('🏆', 'Competition Wins', this.state.competitionWins)}
          ${seal('💎', 'Shards', this.state.shards || 0)}
          ${seal('🏛️', 'Dynasty', this.state.dynasty || 0)}
        </div>

        <div class="hall-corruption">${this.corruptionMeter()}</div>

        <div class="hall-folks">
          ${(() => {
            const tb = this.townsfolkBeat();
            const relic = this.relicBonus();
            const rival = this.bestRival();
            const rt = rival ? this.rivalTitle(rival.grudge) : null;
            return `
              <div class="folk-card">
                <span class="folk-ico">${tb.folk.icon}</span>
                <div class="folk-body">
                  <div class="folk-name">${tb.folk.name}</div>
                  <div class="folk-beat">${tb.beat}</div>
                  <div class="folk-beat folk-count">The crowd calls your line '${this.dynastyNickname().title}'.</div>
                </div>
              </div>
              ${rival ? `
                <div class="folk-card rival-card">
                  <span class="folk-ico">⚔️</span>
                  <div class="folk-body">
                    <div class="folk-name">${rival.name} · ${rt ? rt.title : 'The Beaten'}</div>
                    <div class="folk-beat">"${rt ? rt.note : 'They have lost to you, and the loss is becoming a grudge.'}"</div>
                    <div class="folk-beat folk-count">${rival.grudge} duel(s) lost to your line · ${rival.wins} defeats handed to ${rival.kingdom}</div>
                  </div>
                </div>` : ''}
              ${relic ? `
                <div class="folk-card relic-worn">
                  <span class="folk-ico">${relic.icon}</span>
                  <div class="folk-body">
                    <div class="folk-name">Relic Equipped</div>
                    <div class="folk-beat">${relic.name} · +${relic.amt} ${relic.stat.toUpperCase()}</div>
                  </div>
                </div>` : ''}
              ${(() => {
                const pw = this.lastPartyWord();
                if (!pw) return '';
                return `
                <div class="folk-card party-voice-card">
                  <span class="folk-ico">${pw.icon || '🗣️'}</span>
                  <div class="folk-body">
                    <div class="folk-name">"${pw.line}"</div>
                    <div class="folk-beat folk-count">- ${pw.by}, of your party · Year ${pw.at || '-'}</div>
                  </div>
                </div>`;
              })()}
              ${(this.state.lastDeserter) ? `
                <div class="folk-card deserter-card">
                  <span class="folk-ico">🕯️</span>
                  <div class="folk-body">
                    <div class="folk-name">${this.state.lastDeserter.name} has left the party</div>
                    <div class="folk-beat">${this.state.lastDeserter.line}</div>
                    <div class="folk-beat folk-count">The hall is a chair wider this morning.</div>
                  </div>
                </div>` : ''}
            `;
          })()}
        </div>

        <div class="hall-divider"><span>✦</span></div>

        <div class="hall-party">
          ${partyCards}
          ${emptySlots}
        </div>

        <div class="hall-zones">
          <div class="hall-zones-title">The hall holds many doors, where will you go, champion?</div>
          <div class="hall-zones-grid">
            ${zones.map(z => `
              <div class="hall-zone ${(this.firstStepPending() && this.firstStepPending().doorAction === z.action) ? 'zone-next' : ''}" onclick="game.${z.action}()" data-glyph="${z.glyph}" style="--zone-c:${z.color}">
                <div class="zone-head">
                  <span class="zone-icon">${z.icon}</span>
                  <span class="zone-name">${z.name}</span>
                </div>
                <div class="zone-loc">${z.loc}</div>
                <div class="zone-desc">${z.desc}</div>
                <div class="zone-foot">
                  <span>${z.foot}</span>
                  <span class="zone-cta">${z.cta} →</span>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
    if (this.state.lastDeserter) this.state.lastDeserter = null;
    if (!this.firstStepsAllDone() && !this.state.firstStepsToast) {
      this.state.firstStepsToast = true;
      this.save();
      const pending = this.firstStepPending();
      this.notify([`The Hall stands open before you. Follow the lit door and ${pending ? pending.label.toLowerCase() : 'take your first step'}, each completes the Age's scroll.`], '🕯️');
    }
    this.updateBackground();
  }

  showTraining() {
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">The yard master sizes you up from the rail. The dummies of the yard are quick to wound and quicker to humiliate, and they bite harder when you ask them to.</div>
        <div class="line" style="animation-delay:0.5s">Practice is free and pays gold, experience and shards. A staked spar costs 25 gold up front, and a win returns your 25 plus 50 more with a sharper lesson.</div>
      </div>
      <div class="decree-grid">
        <div class="decree-card" onclick="game.startTrainingBout(false)" style="--dc:#2ecc71">
          <div class="decree-ico">🪵</div>
          <div class="decree-name">Practice</div>
          <div class="decree-desc">A free bout. Win for the usual gold, experience and shards. Nothing at risk.</div>
        </div>
        <div class="decree-card" onclick="game.startTrainingBout(true)" style="--dc:#f1c40f">
          <div class="decree-ico">🏅</div>
          <div class="decree-name">Spar with Stakes</div>
          <div class="decree-desc">Wager 25 gold. Win and collect 75 total plus a sharper lesson. A fall costs the stake.</div>
        </div>
      </div>`;
  }

  startTrainingBout(staked) {
    this.trainingStaked = !!staked;
    if (staked) {
      if ((this.state.gold || 0) < 25) {
        this.trainingStaked = false;
        this.notify(['The yard master shakes his head. A staked spar needs 25 gold on the rail.']);
        return;
      }
      this.state.gold -= 25;
    }
    this.startBattle(this.generateTrainingEnemies(), 'training');
  }

  generateTrainingEnemies() {
    const lvl = this.state.level;
    return [
      { name: 'Training Dummy Alpha', kingdom: 'neutral', isTrainingDummy: true, stats: { hp: 40 + lvl * 10, atk: 14 + lvl * 5, def: 15 + lvl * 3, spd: 30, spAtk: 14 + lvl * 4 } },
      { name: 'Training Dummy Beta', kingdom: 'neutral', isTrainingDummy: true, stats: { hp: 35 + lvl * 8, atk: 10 + lvl * 4, def: 20 + lvl * 3, spd: 35, spAtk: 10 + lvl * 3 } }
    ];
  }

  hallBackdrop() {
    const kingdomId = (this.state && this.state.kingdom) || 'spunk';
    return `<div class="hall-bg" style="--realm-art:url('assets/kingdoms/${kingdomId}.jpg')"></div><div class="hall-flicker"></div><div class="hall-veil"></div>`;
  }

  locationBanner(icon, title, sub, color) {
    const kingdomId = (this.state && this.state.kingdom) || 'spunk';
    return `
      <div class="location-banner" style="--bnr-c:${color};--bnr-glow:${color};--loc-art:url('assets/kingdoms/${kingdomId}.jpg')">
        <div class="back-link" onclick="game.renderHub()">← Return to the Hall</div>
        <div class="loc-icon">${icon}</div>
        <h2>${title}</h2>
        <p class="loc-sub">${sub}</p>
      </div>`;
  }

  generateDrillEnemies(archetype) {
    const lvl = this.state.level;
    const s = 1 + lvl * 0.12;
    const enemy = (name, st) => ({ name, kingdom: 'neutral', stats: st });
    switch (archetype) {
      case 'striker':
        return [
          enemy('Iron Colossus', { hp: Math.round((110 + lvl * 14) * s), atk: Math.round((18 + lvl * 4) * s), def: Math.round((45 + lvl * 5) * s), spd: 20, spAtk: 15 })
        ];
      case 'bulwark':
        return [
          enemy('Gatebreaker Cad', { hp: Math.round((50 + lvl * 9) * s), atk: Math.round((30 + lvl * 6) * s), def: 10, spd: 40, spAtk: 15 }),
          enemy('Gatebreaker Doe', { hp: Math.round((50 + lvl * 9) * s), atk: Math.round((30 + lvl * 6) * s), def: 10, spd: 42, spAtk: 15 }),
          enemy('Gatebreaker Tre', { hp: Math.round((50 + lvl * 9) * s), atk: Math.round((30 + lvl * 6) * s), def: 10, spd: 38, spAtk: 15 })
        ];
      case 'mender':
        return [
          enemy('Fever Cast', { hp: Math.round((60 + lvl * 10) * s), atk: Math.round((25 + lvl * 5) * s), def: 15, spd: 36, spAtk: 30 }),
          enemy('Pale Ajin', { hp: Math.round((70 + lvl * 11) * s), atk: Math.round((26 + lvl * 5) * s), def: 18, spd: 34, spAtk: 35 })
        ];
      case 'schemer':
      default:
        return [
          enemy('Tongue-Rigger', { hp: Math.round((65 + lvl * 10) * s), atk: Math.round((28 + lvl * 5) * s), def: 20, spd: 50, spAtk: 40 }),
          enemy('Word-Viper', { hp: Math.round((60 + lvl * 10) * s), atk: Math.round((26 + lvl * 5) * s), def: 20, spd: 52, spAtk: 45 })
        ];
    }
  }

  startRoleDrill(archetype) {
    const drill = ROLE_DRILLS[archetype];
    if (!drill) return;
    this.roleDrillFocus = archetype;
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${drill.scenario}</div>
        <div class="line" style="animation-delay:0.5s" style="color:${drill.color}"><b>${drill.objective}</b></div>
      </div>
      <div class="story-continue" id="story-continue">Enter ${drill.name}</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      this.startBattle(this.generateDrillEnemies(archetype), 'drill');
    });
  }

  generateCrownBoss(archetype) {
    const lvl = this.state.level;
    const arch = archetype || 'striker';
    const paragon = ROLE_PARAGONS[arch] || ROLE_PARAGONS.striker;
    const player = this.state.party.find(p => p.isPlayer) || this.state.party[0];
    const pStats = (player && player.stats) || {};
    // The mirror is built from YOUR champion's own framework, stats, level,
    // talents and role, so the trial truly asks "defeat yourself, perfected."
    const s = (1.05 + lvl * 0.055) * this.difficultyMult();
    const stats = {};
    Object.keys(pStats).forEach(k => stats[k] = Math.round(pStats[k] * s));
    if (!stats.hp) stats.hp = Math.round((120 + lvl * 30) * s);
    if (!stats.atk) stats.atk = Math.round((30 + lvl * 6) * s);
    if (!stats.def) stats.def = Math.round((18 + lvl * 4) * s);
    if (!stats.spd) stats.spd = Math.round((20 + lvl * 3) * s);
    if (stats.spAtk == null) stats.spAtk = Math.round((16 + lvl * 3) * s);
    const lastKing = this.state.lastKing;
    const name = (lastKing && lastKing.name) ? `${lastKing.name}, ${paragon.name}` : paragon.name;
    const talents = (player && player.talents) ? Object.assign({}, player.talents) : {};
    const cycle = this.state.cycle || 1;
    const virt = VIRTUE_MIRRORS[(cycle - 1) % VIRTUE_MIRRORS.length];
    let taunt = paragon.taunt + (player ? ` <b>${player.name}</b>, I am the path you walked made flesh.` : '');
    // From the second cycle on, the perfected reflection is also the Age's mirror, and it says so.
    if (cycle >= 2 && virt) taunt += `<br><span style="color:#b07bd8">They called this the "${virt.name}" ... and its only law: ${virt.lesson}</span>`;
    // The mirror carries your chosen regret with it, the one thing you cannot outgrow.
    const grief = REGRETS.find(r => r.id === this.state.regret);
    const regretTaunt = (grief && grief.mirrorTaunt && player)
      ? `${grief.mirrorTaunt.replace('{NAME}', player.name).replace('{TOWN}', this.state.town)}`
      : null;
    return {
      name,
      epithet: paragon.epithet,
      kingdom: this.state.kingdom,
      roleArchetype: arch,
      taunt,
      regretTaunt,
      isCrownBoss: true,
      lastKing: lastKing ? lastKing.name : null,
      talents,
      roleLevel: (player && player.roleLevel) || 1,
      mirrorName: (cycle >= 2 && virt) ? virt.name : null,
      mirrorLesson: (cycle >= 2 && virt) ? virt.lesson : null,
      stats
    };
  }

  startCrownTrial() {
    const age = this.currentAge();
    if (this.state.level < CROWN_TRIAL_REQ_LEVEL) {
      this.showScreen('story');
      const container = document.getElementById('story-content');
      container.innerHTML = `
        <div class="location-banner" style="--bnr-c:var(--gold)">
          <div class="back-link" onclick="game.renderHub()">← Return to the Hall</div>
          <div class="loc-icon">🔒</div>
          <h2>The Crown Trial</h2>
          <p class="loc-sub">${age.name} · ${ARENA_OF_VIRTUES.name}</p>
        </div>
        <div class="location-frame">
          <div class="event-banner">
            <div class="event-title">The ring is sealed to the still-young</div>
            <p style="margin-top:10px;line-height:1.8;font-style:italic;color:var(--text-dim)">"A King does not walk into the Arena of Virtues half-formed. Prove your worth first, ${age.arenaMotto}"</p>
            <p style="margin-top:8px;line-height:1.7">Reach <b>Level ${CROWN_TRIAL_REQ_LEVEL}</b> and the Ring of Ages will open its doors to you. Train, compete, and let your calling rise.</p>
          </div>
          <div style="text-align:center;margin-top:22px">
            <button class="btn btn-small" onclick="game.renderHub()">Return to the Hall</button>
          </div>
        </div>`;
      return;
    }

    this.showScreen('story');
    const container = document.getElementById('story-content');
    const lastKing = this.state.lastKing;
    const roleCards = ['striker', 'bulwark', 'mender', 'schemer'].map(a => {
      const arch = ROLE_ARCHETYPES[a];
      const paragon = ROLE_PARAGONS[a];
      return `
        <div class="crown-role-card" onclick="game.declareCrownRole('${a}')" style="--rc:${arch.color}">
          <div class="crown-role-ico">${arch.icon}</div>
          <div class="crown-role-name">${arch.name}, ${arch.unit}</div>
          <div class="crown-role-foe">Face: ${paragon.name} · ${paragon.epithet}</div>
          <div class="crown-role-taunt">"${paragon.taunt}"</div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="location-banner" style="--bnr-c:var(--gold)">
        <div class="back-link" onclick="game.renderHub()">← Return to the Hall</div>
        <div class="loc-icon">♛</div>
        <h2>The Crown Trial</h2>
        <p class="loc-sub">${age.name} · ${ARENA_OF_VIRTUES.name}</p>
      </div>
      <div class="location-frame">
        <div class="event-banner">
          <div class="event-title">Will you answer the Age's call?</div>
          <p style="margin-top:10px;line-height:1.8;font-style:italic;color:var(--text-dim)">"The Arena does not ask what you are. It asks what you intend to outgrow."</p>
          <p style="margin-top:8px;line-height:1.7">Declare the <b>role of your kingdom</b> you stand for. The Ring of Ages will raise its perfected mirror against you, defeat it and be crowned King of the Age.${lastKing ? `<br><br><b>${lastKing.name}</b> holds the ring still, the shadow of the previous age sits opposite you.` : ''}</p>
        </div>
        <div class="crown-roles">
          ${roleCards}
        </div>
        <div style="text-align:center;margin-top:22px;font-style:italic;color:var(--text-dim);font-size:0.8rem">Choose a role to declare. Combat begins, once.</div>
      </div>`;
  }

  declareCrownRole(archetype) {
    this.crownBoss = this.generateCrownBoss(archetype);
    this.kingDefeated = false;
    this.startCrownCombat();
  }

  startCrownCombat() {
    this.startBattle(this.crownBoss ? [this.crownBoss] : [this.generateCrownBoss(this.state.party.find(p => p.isPlayer)?.archetype || 'striker')], 'crown');
  }

  roleXpFor(unit) {
    if (!unit || !unit.perf) return 0;
    const p = unit.archetype;
    const perf = unit.perf;
    if (p === 'striker') return Math.round(perf.dmg * 0.06 + perf.kills * 12 + (perf.ctrl ? 0 : 0));
    if (p === 'bulwark') return Math.round(perf.taken * 0.06 + perf.shield * 0.05 + perf.kills * 10);
    if (p === 'mender') return Math.round(perf.heal * 0.08 + perf.ctrl * 3);
    return Math.round(perf.ctrl * 6 + perf.dmg * 0.03);
  }

  // Party affinity, bonds grow with shared combat. Higher bonds grant a small combat bonus.
  gainAffinity(playerTeam) {
    const members = [];
    playerTeam.forEach(u => {
      const m = this.state.party.find(p => p.name === u.name);
      if (m) members.push(m);
    });
    if (members.length < 2) return;
    const pairs = new Set();
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const key = [members[i].name, members[j].name].sort().join('|');
        pairs.add(key);
      }
    }
    this.state.affinity = this.state.affinity || {};
    pairs.forEach(key => {
      this.state.affinity[key] = Math.min(100, (this.state.affinity[key] || 0) + 4);
    });
    this.state.party.forEach(m => {
      m.lastFought = m.lastFought || 0;
      if (playerTeam.some(u => u.name === m.name)) m.lastFought++;
    });
  }

  affinityBonus() {
    const aff = this.state.affinity || {};
    let total = 0;
    const all = this.state.party.map(p => p.name).sort();
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const v = aff[`${all[i]}|${all[j]}`] || 0;
        if (v >= 80) total += 2;
        else if (v >= 50) total += 1.5;
        else if (v >= 25) total += 1;
      }
    }
    return total;
  }

  affinityLine(p) {
    const aff = this.state.affinity || {};
    const bonds = this.state.party
      .map(o => {
        if (o.name === p.name) return 0;
        return aff[[p.name, o.name].sort().join('|')] || 0;
      })
      .filter(v => v > 0);
    if (!bonds.length) return '-';
    const best = Math.max(...bonds);
    const tag = best >= 80 ? 'Deep' : best >= 50 ? 'True' : best >= 25 ? 'Growing' : 'New';
    return `${tag} ☀ ${best}`;
  }

  awardRoleXp(playerTeam, type) {
    const t = (id) => (this.state.decrees && this.state.decrees[this.currentAge().id] === id) ? this.decreeTier(id) : 1;
    const mult = (type === 'competition' || type === 'deception' ? 1.6 : 1)
      * (this.legacyPerk('scholar_blood') ? 1.25 : 1)
      * (this.crownBoon('the_archive') ? 1.3 : 1)
      * ((this.state.decrees[this.currentAge().id] || '') === 'arena_tax' ? 0.3 * t('arena_tax') + 1 : 1)
      * ((this.state.decrees[this.currentAge().id] || '') === 'iron_march' ? 0.06 * t('iron_march') + 1 : 1);
    const focus = this.roleDrillFocus || null;
    const gains = [];
    playerTeam.forEach(u => {
      const member = this.state.party.find(p => p.name === u.name);
      if (!member || !member.archetype) return;
      let xp = Math.round(this.roleXpFor(u) * mult);
      if (focus && member.archetype === focus) xp = Math.round(xp * 2);
      if (xp <= 0) return;
      member.roleXp = (member.roleXp || 0) + xp;
      gains.push({ name: member.name, archetype: member.archetype, xp });
      let threshold = member.roleLevel * 30;
      while (member.roleXp >= threshold && member.roleLevel < 12) {
        member.roleXp -= threshold;
        member.roleLevel++;
        member.rolePoints = (member.rolePoints || 0) + 1;
        threshold = member.roleLevel * 30;
        gains.push({ name: member.name, archetype: member.archetype, leveled: member.roleLevel });
      }
    });

    if (gains.length && this.roleXpToast) {
      const lines = gains.map(g => g.leveled
        ? `${g.name} reached ${roleTitleFor(g.leveled)} in ${ROLE_ARCHETYPES[g.archetype].name}! +1 skill point`
        : `${g.name} +${g.xp} role XP (${ROLE_ARCHETYPES[g.archetype].name})`).slice(0, 6);
      this.roleXpToast(lines);
    }
  }

  showRoleGuild() {
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    const selectedName = this.roleGuildSelected || (this.state.party[0]?.name) || '';
    this.roleGuildSelected = selectedName;

    const memberCards = this.state.party.map(p => {
      const arch = ROLE_ARCHETYPES[p.archetype] || ROLE_ARCHETYPES.striker;
      const info = this.getClassInfo(p.class, this.state.kingdom) || { name: p.class };
      const sel = p.name === selectedName ? ' sel' : '';
      return `
        <div class="rg-member${sel}" onclick="game.roleGuildSelect('${p.name.replace(/'/g, "\\'")}')" style="--rg-c:${arch.color}">
          <div class="rg-member-avatar">${info.avatar || ''}</div>
          <div class="rg-member-name">${p.name}</div>
          <div class="rg-member-class">${info.name || p.class}</div>
          <div class="rg-member-role">${arch.icon} ${arch.name} · ${ROLE_ARCHETYPES[p.archetype].unit}</div>
          <div class="rg-member-lvl">Lv ${p.roleLevel} · ${roleTitleFor(p.roleLevel)}</div>
          <div class="rg-points">✦ ${p.rolePoints || 0} pts · ${this.affinityLine(p)}</div>
        </div>`;
    }).join('');

    const detail = this.renderRoleTree(this.state.party.find(p => p.name === selectedName));

    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('🎖️', 'Guild Hall', `Between competitions, the realm is kept by its calling. Shape your champions here, the yard, the wall, the infirmary and the court never rest.`, k.color)}
        <div class="location-frame">
          <div class="rg-members">${memberCards}</div>
          <div class="rg-divider">✦ The Calling ✦</div>
          ${detail}
          <div class="rg-drills">
            <div class="rg-drills-title">Off-Season Drills</div>
            <div class="rg-drills-grid">
              ${Object.entries(ROLE_DRILLS).map(([id, d]) => `
                <div class="rg-drill" style="--rgc:${d.color}" onclick="game.startRoleDrill('${id}')">
                  <div class="rg-drill-icon">${d.icon}</div>
                  <div class="rg-drill-name">${d.name}</div>
                  <div class="rg-drill-desc">${d.desc}</div>
                  <div class="rg-drill-objective"><b>Objective:</b> ${d.objective}</div>
                  <div class="rg-drill-go">Enter the drill →</div>
                </div>`).join('')}
            </div>
            <div class="rg-drills-note">Drills award double role XP to matching roles. Focus makes you a true ${ROLE_ARCHETYPES[this.roleDrillFocus || 'striker'].unit.toLowerCase()}.</div>
          </div>
        </div>
      </div>`;
  }

  roleGuildSelect(name) {
    this.roleGuildSelected = name;
    this.showRoleGuild();
  }

  renderRoleTree(p) {
    if (!p) return '<div class="rg-empty">No champion selected.</div>';
    const arch = ROLE_ARCHETYPES[p.archetype] || ROLE_ARCHETYPES.striker;
    const tree = ROLE_TREES[p.archetype] || ROLE_TREES.striker;
    const pts = p.rolePoints || 0;
    const xpNext = p.roleLevel * 30;
    const xpPct = Math.min(100, Math.round((p.roleXp || 0) / xpNext * 100));

    const pack = (tierIdxs) => tierIdxs.map(tierIdx => {
      const tierIds = tree.tiers[tierIdx];
      if (!tierIds) return '';
      return `<div class="rg-tier">${tierIds.map(id => {
        const node = tree.nodes[id];
        const rank = (p.talents && p.talents[id]) || 0;
        const unlocked = this.canLearnRoleTalent(p, id);
        const owned = rank >= 3;
        return `
          <div class="rg-node${unlocked ? ' open' : ''}${rank > 0 ? ' has' : ''}${owned ? ' max' : ''}" style="--rgc:${arch.color}">
            <div class="rg-node-head"><span class="rg-node-icon">${node.icon}</span><span class="rg-node-tier">Tier ${node.tier}</span></div>
            <div class="rg-node-name">${node.name || id}</div>
            <div class="rg-node-desc">${node.desc}</div>
            <div class="rg-node-ranks">${[1, 2, 3].map(rk => `<span class="rg-rank${rk <= rank ? ' on' : ''}"></span>`).join('')}</div>
            ${owned ? '<div class="rg-node-owned">Mastered</div>'
              : unlocked ? `<button class="btn btn-small rg-learn${pts > 0 ? '' : ' rg-learn-empty'}" onclick="game.learnRoleTalent('${p.name.replace(/'/g, "\\'")}','${id}')">${pts > 0 ? 'Train (1 pt)' : 'Train, no pts'}</button>`
              : `<div class="rg-node-locked">Locked</div>`}
          </div>`;
      }).join('')}</div>`;
    }).join('');

    return `
      <div class="rg-detail" style="--rgc:${arch.color}">
        <div class="rg-detail-head">
          <div class="rg-detail-icon">${arch.icon}</div>
          <div>
            <div class="rg-detail-roletitle">${arch.name}, ${ROLE_ARCHETYPES[p.archetype].unit}</div>
            <div class="rg-detail-level">Level ${p.roleLevel} · ${roleTitleFor(p.roleLevel)} · ${xpPct}% to next level</div>
            <div class="rg-detail-desc">${arch.desc}</div>
          </div>
          <div class="rg-detail-points">✦ ${pts} skill points</div>
          </div>
          ${pts <= 0 ? `<div class="rg-hint">Need skill points? Win battles, competitions and off-season drills to earn role XP, each role level grants <b>1 skill point</b>.</div>` : ''}
        <div class="rg-xpbar"><div class="rg-xpfill" style="width:${xpPct}%"></div></div>
        <div class="rg-tree">${pack([0])}<div class="rg-tier-connector"></div>${pack([1])}<div class="rg-tier-connector"></div>${pack([2])}</div>
        <div class="rg-offseason">
          <div class="rg-offseason-title">Between competitions, ${ROLE_OFFSEASON_TITLE[p.archetype]}</div>
          <div class="rg-offseason-line">${ROLE_OFFSEASON[p.archetype][(p.roleLevel - 1) % ROLE_OFFSEASON[p.archetype].length]}</div>
        </div>
      </div>`;
  }

  roleTierRequirement(archetype) {
    return { 1: 2, 2: 4 }; // tier2 needs 2 pts in tier1, tier3 needs 4 in tier1+tier2
  }

  roleTierPoints(p, archetype, tier) {
    const tree = ROLE_TREES[archetype] || ROLE_TREES.striker;
    let sum = 0;
    for (let t = 0; t < tier; t++) {
      (tree.tiers[t] || []).forEach(id => { sum += (p.talents && p.talents[id]) || 0; });
    }
    return sum;
  }

  canLearnRoleTalent(p, id) {
    const tree = ROLE_TREES[p.archetype] || ROLE_TREES.striker;
    const node = tree.nodes[id];
    if (!node) return false;
    const rank = (p.talents && p.talents[id]) || 0;
    if (rank >= 3) return false;
    if (p.roleLevel < node.tier * 2 - 1) return false;
    const need = this.roleTierRequirement(p.archetype);
    if (node.tier >= 2 && this.roleTierPoints(p, p.archetype, node.tier - 1) < need[node.tier]) return false;
    return true;
  }

  learnRoleTalent(name, id) {
    const p = this.state.party.find(m => m.name === name);
    if (!p) return;
    if ((p.rolePoints || 0) <= 0) {
      this.roleXpToast([`${p.name} has no skill points. Earn role XP in battles, competitions and off-season drills, each role level grants 1 skill point.`]);
      return;
    }
    if (!this.canLearnRoleTalent(p, id)) { this.roleXpToast([`${p.name}, this talent is still locked.`]); return; }
    p.rolePoints--;
    p.talents = p.talents || {};
    p.talents[id] = (p.talents[id] || 0) + 1;
    this.save();
    this.showRoleGuild();
  }

  showRecruit() {
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    const huntActive = !!(this.state.huntState && this.state.huntState.active);
    let available = k.recruitable.filter(r => !this.state.party.find(p => p.name === r.name));
    let summonNote = '';
    if (huntActive && available.length === 0) {
      const taken = new Set(this.state.party.map(p => p.name));
      available = Object.values(KINGDOMS).flatMap(ks => (ks.recruitable || [])).filter(r => !taken.has(r.name));
      summonNote = ' The Hall throws its doors wide, a champion of another realm answers the Hunt\'s call.';
    }

    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('🏹', 'Champion Hall', `Beneath the vaulted ceiling, the heroes of ${k.name} wait to be called. Recruit champions to fill your party (max 4).`, k.color)}
        ${huntActive ? `<p style="color:var(--gold-light);font-size:0.85rem;margin:0 0 10px">🏴 <b>The Hunt is open and it calls for fresh blood.</b> Summon a champion who has not fought the arena rounds, then return to the Competition gate.${summonNote}</p>` : ''}
        <div class="location-frame">
          ${available.length === 0 ? '<p style="text-align:center;color:var(--text-dim)">No champions are available for recruitment right now.</p>' : ''}
          <div class="recruit-grid">
            ${available.map(r => `
              <div class="recruit-card">
                <div class="recruit-name">${r.name}</div>
                <div class="recruit-class">${this.getClassInfo(r.class, r.kingdom)?.name || r.class} | Level ${r.level}</div>
                <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:10px">
                  HP: ${r.stats.hp} | ATK: ${r.stats.atk} | DEF: ${r.stats.def} | SPD: ${r.stats.spd}
                </div>
                <button class="btn btn-small" onclick="game.recruitAlly('${r.name}')">Recruit (50 Gold)</button>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  recruitAlly(name) {
    const huntActive = !!(this.state.huntState && this.state.huntState.active);
    if (this.state.party.length >= (huntActive ? 5 : 4)) {
      this.notify([huntActive ? 'The summon is answered by one fresh champion, your party is at its hunt strength.' : 'The Hall is full, no more champions can be sworn in.'], '🛡️');
      return;
    }
    if (this.state.gold < 50) { this.notify(['You lack the gold for a sworn champion (50 gold).'], '🪙'); return; }
    const allRecruitable = Object.values(KINGDOMS).flatMap(ks => ks.recruitable || []);
    const recruit = allRecruitable.find(r => r.name === name);
    if (!recruit) return;
    this.state.gold -= 50;
    this.state.party.push(this.withRoleData({ ...recruit, isPlayer: true }));
    this.save();
    this.showRecruit();
  }

  showShop() {
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('⚗️', 'Quartermaster', `The armorer's forge glows in the dark. Stock up for the battles ahead, you carry ${this.state.gold} gold and ${this.state.shards || 0} shards.`, k.color)}
        <div class="location-frame">
          <div class="shop-grid">
            ${Object.values(ITEMS).map(item => `
              <div class="shop-item" onclick="game.buyItem('${item.id}')">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-desc">${item.desc}</div>
                <div class="item-price">${item.price} Gold</div>
              </div>`).join('')}
          </div>
          <div class="depot-section">
            <div class="depot-title">💎 The Shard Depot</div>
            <p class="depot-note">Shards are pulled from the rifts you conquer and the crowns you near, spend the proof of what you've endured.</p>
            <div class="depot-grid">
              ${SHARD_DEPOT.map(entry => `
                <div class="depot-item">
                  <div class="item-icon">${entry.icon}</div>
                  <div class="item-name">${entry.name}</div>
                  <div class="item-desc">${entry.desc}</div>
                  <div class="item-price">${entry.shards} Shards</div>
                  <button class="btn btn-small" onclick="game.buyShardItem('${entry.id}')">Take it</button>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
  }

  buyShardItem(id) {
    const entry = SHARD_DEPOT.find(e => e.id === id);
    if (!entry) return;
    if ((this.state.shards || 0) < entry.shards) {
      this.notify([`The Depot keeper shakes their head, ${entry.name} needs ${entry.shards} shards and you hold ${this.state.shards || 0}.`], '💎');
      return;
    }
    this.state.shards -= entry.shards;
    const leader = this.state.party.find(p => p.isPlayer) || this.state.party[0];
    if (entry.effect.type === 'stat') {
      if (leader && leader.stats) {
        leader.stats[entry.effect.stat] = Math.round((leader.stats[entry.effect.stat] || 0) + entry.effect.amount);
        leader.boughtGear = leader.boughtGear || {};
        leader.boughtGear[id] = (leader.boughtGear[id] || 0) + 1;
        this.roleXpToast([`${entry.name} chosen, ${entry.effect.stat.toUpperCase()} +${entry.effect.amount} (permanent).`]);
      }
    } else if (entry.effect.type === 'passive') {
      if (leader) {
        leader.passives = leader.passives || {};
        leader.passives[entry.effect.id || id] = true;
        this.roleXpToast([`${entry.name} fitted, its effect is always on.`]);
      }
    } else {
      this.state.inventory[id] = (this.state.inventory[id] || 0) + 1;
      this.roleXpToast([`${entry.name} stored in your satchel.`]);
    }
    this.save();
    this.showShop();
  }

  buyItem(id) {
    const item = ITEMS[id];
    if (!item || this.state.gold < item.price) { this.notify(['The armorer will not part with it, you cannot afford this (gold required).'], '🪙'); return; }
    this.state.gold -= item.price;
    const leader = this.state.party.find(p => p.isPlayer) || this.state.party[0];
    if (item.effect && item.effect.type === 'stat') {
      if (leader && leader.stats) {
        leader.stats[item.effect.stat] = Math.round((leader.stats[item.effect.stat] || 0) + item.effect.amount);
        leader.boughtGear = leader.boughtGear || {};
        leader.boughtGear[id] = (leader.boughtGear[id] || 0) + 1;
        this.roleXpToast([`${item.name} equipped, ${item.effect.stat.toUpperCase()} +${item.effect.amount} (permanent).`]);
      }
    } else if (item.effect && item.effect.type === 'passive') {
      if (leader) {
        leader.passives = leader.passives || {};
        leader.passives[item.effect.id || item.id] = true;
        this.roleXpToast([`${item.name} fitted, its effect is always on.`]);
      }
    } else {
      this.state.inventory[id] = (this.state.inventory[id] || 0) + 1;
      this.roleXpToast([`${item.name} stored in your satchel.`]);
    }
    this.save();
    this.showShop();
  }

  raiseBanner() {
    if ((this.state.inventory.warBanner || 0) < 1) return;
    this.state.inventory.warBanner--;
    if (this.state.inventory.warBanner <= 0) delete this.state.inventory.warBanner;
    this.state.bannerBuff = 0.2;
    this.save();
    this.showInventory();
    this.roleXpToast(['The banner rises. Your party opens the next battle at +20% Attack.']);
  }

  showInventory() {
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    const items = Object.entries(this.state.inventory).filter(([, count]) => count > 0);

    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('📜', 'Inventory', 'Your battle-worn satchel, laid out by lantern light. Everything you carry on the road to the throne.', k.color)}
        <div class="location-frame">
          ${items.length === 0 ? '<p style="text-align:center;color:var(--text-dim)">Your inventory is empty.</p>' : ''}
          <div class="inventory-list">
            ${items.map(([id, count]) => {
              const item = ITEMS[id];
              return item ? `
                <div class="inventory-item">
                  <div style="font-size:1.5rem">${item.icon}</div>
                  <div style="font-weight:700;margin:5px 0">${item.name}</div>
                  <div class="item-count">x${count}</div>
                  <div style="font-size:0.75rem;color:var(--text-dim)">${item.desc}</div>
                </div>` : '';
            }).join('')}
          </div>
          ${(this.state.inventory.warBanner || 0) > 0 ? `
          <div class="relic-section">
            <div class="relic-title">🏴 War Banner</div>
            <p style="font-size:0.8rem;color:var(--text-dim);margin:0 0 10px">Raise it before a battle, your party opens the fight at +20% Attack.</p>
            <button class="btn btn-small" onclick="game.raiseBanner()">Raise the banner (use 1)</button>
          </div>` : ''}
          <div class="relic-section">
            <div class="relic-title">🎐 Relics of the World</div>
            <div class="relic-grid">
              ${RELICS.map(r => {
                const have = this.state.relicOk && this.state.relicOk[r.id];
                const equipped = this.state.relicEquip === r.id;
                return `
                  <div class="relic-card ${have ? '' : 'unknown'} ${equipped ? 'equipped' : ''}">
                    <div class="relic-top">
                      ${have ? `<span style="font-size:1.6rem">${r.icon}</span>` : '<span style="font-size:1.6rem;opacity:.4">❓</span>'}
                      <span class="relic-name">${have ? r.name : 'Relic of Another Age'}</span>
                    </div>
                    ${have ? `<div class="relic-desc">${r.desc}</div><div class="relic-bonus">+${r.amt} ${r.stat.toUpperCase()}</div>` : '<div class="relic-desc">A relic exists somewhere, beyond a gate that stays closed until it is another Age.</div>'}
                    <div style="margin-top:10px">
                      ${have && !equipped ? `<button class="btn btn-small" onclick="game.equipRelic('${r.id}')">Equip</button>` : ''}
                      ${equipped ? '<span class="relic-equipped-tag">EQUIPPED</span>' : ''}
                    </div>
                  </div>`;
              }).join('')}
            </div>
            <p class="relic-note">Relics are found at the heart of the rifts, one peril per Age, one relic each.</p>
          </div>
        </div>
      </div>`;
  }

  equipRelic(id) {
    this.state.relicEquip = id;
    this.save();
    this.showInventory();
  }

  relicBonus() {
    const r = this.state.relicOk && this.state.relicEquip ? RELICS.find(x => x.id === this.state.relicEquip) : null;
    return r || null;
  }

  showIntel() {
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    const c = this.state.corruption || 0;
    const lt = this.masterLieutenant();
    const report = this.corruptionWorldText() + '<br><br>' + STORY.intelReports[Math.floor(Math.random() * STORY.intelReports.length)];
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('🕯️', 'Scout Reports', 'Candles gutter over the war map. The messengers, breathless, mud-splashed, bring word from beyond the border.', k.color)}
        <div class="location-frame">
          <div class="event-banner">
            <div class="event-title">Latest Intelligence</div>
            <p style="margin-top:10px;line-height:1.8">${report}</p>
            ${lt ? `<p style="margin-top:12px;line-height:1.8;color:#9b59b6"><b>${lt.name}</b>, ${lt.epithet}, walks the roads openly now. ${lt.taunt}</p>
            <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
              <button class="btn btn-small" onclick="game.corruptionBrawl()">⚔️ Challenge ${lt.name} (-4 corruption)</button>
            </div>` : ''}
          </div>
          <div style="text-align:center;margin-top:20px">
            <button class="btn btn-small" onclick="game.showIntel()">Get Another Report</button>
          </div>
        </div>
      </div>`;
  }

  showCodex() {
    const k = KINGDOMS[this.state.kingdom];
    const container = document.getElementById('hub-content');
    const codex = this.state.codex || {};
    const entries = CODEX_ENTRIES.map(e => {
      const unlocked = !!codex[e.id];
      return `
        <div class="codex-entry ${unlocked ? '' : 'locked'}">
          <div class="codex-ico">${unlocked ? e.icon : '🔒'}</div>
          <div class="codex-body">
            <div class="codex-title">${e.title}${unlocked ? '' : ', Unread'}</div>
            ${unlocked ? `<div class="codex-text">${e.text}</div>` : `<div class="codex-text" style="opacity:.6">The page is sealed. The world will open it when it is ready.</div>`}
          </div>
        </div>`;
    }).join('');
    container.innerHTML = `${this.hallBackdrop()}
      <div class="hall-scene">
        ${this.locationBanner('📜', 'Codex of the Mirror', 'The Sealed Shelf hums softly. Some pages are written; some pages are waiting.', '#8e8ea8')}
        <div class="location-frame">
          ${entries}
          <div style="text-align:center;margin-top:20px">
            <button class="btn btn-small" onclick="game.renderHub();game.showScreen('hub')">Return to the Hall</button>
          </div>
        </div>
      </div>`;
  }

  corruptionBrawl() {
    const lt = this.masterLieutenant();
    if (!lt) { this.showIntel(); return; }
    const lvl = this.state.level;
    const scale = 1 + this.state.corruption * 0.12 + lvl * 0.08;
    const stats = {};
    Object.keys(lt.stats).forEach(s => stats[s] = Math.round(lt.stats[s] * scale));
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${lt.taunt}</div>
        <div class="line" style="animation-delay:0.5s">Defeat <b>${lt.name}</b> and the corruption of this Age eases by <b>4</b>.</div>
      </div>
      <div class="story-continue" id="story-continue">Fight ${lt.name}</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      this.woundBattle = { phase: 1, wound: null, lt, ageId: this.currentAge().id };
      this.corruptionBrawling = true;
      this.startBattle([{ ...lt, stats }], 'wound');
    });
  }

  startCompetition() {
    if (this.state.huntState && this.state.huntState.active) { this.startHuntSetup(); return; }
    this.competitionRound = 1;
    this.competitionRoster = (this.state.party || []).map(p => p.name);
    this.competitionQueue = [];
    this.buildCompetitionBracket();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${STORY.competitionIntro}</div>
        <div class="line" style="animation-delay:0.5s">Eight champions enter the bracket. You draw <b>${this.bracket.opponent.name}</b> of <b>${KINGDOMS[this.bracket.opponent.kingdom].name}</b> first.</div>
        ${this.bracket.rivals[0] ? `<div class="line" style="animation-delay:0.8s" style="color:#e74c3c">${this.bracket.rivals[0].taunt}</div>` : ''}
      </div>
      <div class="story-continue" id="story-continue">Click to begin Round 1...</div>`;
    document.getElementById('story-continue').addEventListener('click', () => this.openWager());
  }

  buildCompetitionBracket() {
    const all = Object.keys(KINGDOMS);
    const mine = this.state.kingdom;
    const others = all.filter(k => k !== mine);
    const shuffled = others.sort(() => Math.random() - 0.5);
    const opp = shuffled[0];
    const r2A = shuffled[1]; const r2B = shuffled[2];
    const r3A = shuffled[3]; const r3B = shuffled[4];
    const r3C = shuffled[5]; const r3D = shuffled[6];

    // Simulate the bracket, the world fights while you do.
    const power = (k) => 0.5 + Math.random();
    const win = (a, b) => power(a) > power(b) ? a : b;
    const q1 = mine, q2 = opp;
    const s1 = win(r2A, r2B);          // winner of quarter (2 vs 3)
    const s2A = win(r3A, r3B), s2B = win(r3C, r3D);
    const finalOpp = win(s2A, s2B);

    this.bracket = {
      pairs: [`${KINGDOMS[q1].name} vs ${KINGDOMS[q2].name}`, `${KINGDOMS[r2A].name} vs ${KINGDOMS[r2B].name}`, `${KINGDOMS[r3A].name} vs ${KINGDOMS[r3B].name}`, `${KINGDOMS[r3C].name} vs ${KINGDOMS[r3D].name}`],
      semifinals: [`Winner 1 vs Winner 2`, `${KINGDOMS[s2A].name} vs ${KINGDOMS[s2B].name}`],
      finalWinner: finalOpp,
      opponent: this.placeRival(opp),
      opponents: {
        2: this.placeRival(s1),
        3: this.placeRival(finalOpp)
      },
      rivals: []
    };
  }

  placeRival(kingdom) {
    const existing = this.state.rivals[kingdom];
    const names = RIVAL_NAMES[kingdom] || ['The Undefeated'];
    const name = (existing && existing.name) || names[Math.floor(Math.random() * names.length)];
    const grudge = (existing && existing.grudge) || 0;
    return { kingdom, name, grudge };
  }

  startCompetitionRound() {
    const round = this.competitionRound;
    let opponents;
    let text;
    let rivalNote = '';

    if (round === 1) {
      const foe = this.bracket.opponent;
      const poolPick = COMPETITION_OPPONENTS.round1[Math.floor(Math.random() * COMPETITION_OPPONENTS.round1.length)];
      opponents = [{ ...poolPick.fighter, kingdom: poolPick.kingdom, level: this.state.level, name: foe.name }];
      text = STORY.competitionRound1;
      rivalNote = this.rivalTaunt(foe);
    } else if (round === 2) {
      const foe = this.bracket.opponents[2] || { kingdom: 'accord', name: 'The Cohort', grudge: 0 };
      const poolPick = COMPETITION_OPPONENTS.round2[Math.floor(Math.random() * COMPETITION_OPPONENTS.round2.length)];
      const stage = Math.max(1, this.state.level);
      const L = stage + 2;
      opponents = poolPick.fighters.slice(0, 3).map((f) => ({
        ...f, kingdom: foe.kingdom, level: L,
        stats: {
          hp: Math.round((f.stats.hp || 80) * 0.55 + L * 14),
          atk: Math.round((f.stats.atk || 60) * 0.22 + L * 5),
          spAtk: Math.round((f.stats.spAtk || 55) * 0.22 + L * 5),
          def: Math.round((f.stats.def || 60) * 0.3 + L * 5),
          spd: Math.round((f.stats.spd || 60) * 0.55 + L * 2)
        }
      }));
      if (foe.name) opponents[0].name = foe.name;
      text = STORY.competitionRound2;
      rivalNote = this.rivalTaunt(foe);
    } else {
      return this.startHuntSetup();
    }

    this.showScreen('story');
    const container = document.getElementById('story-content');
    this.bracket.current = (round === 1 ? this.bracket.opponent : this.bracket.opponents[round]) || null;
    container.innerHTML = `
      <div class="competition-bracket">
        ${this.bracketHTML()}
      </div>
      <div class="story-text"><div class="line" style="animation-delay:0.1s">${text}</div></div>
      ${rivalNote ? `<div class="story-text"><div class="line rival-taunt" style="animation-delay:0.4s">${rivalNote}</div></div>` : ''}
      <div class="story-continue" id="story-continue">Click to fight...</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      this.startBattle(opponents, 'competition');
    });
  }

  /*** Round 3, the Hunt. A fresh champion (never bloodied in this arena's rounds) carries the kingdom's covenant relic. ***/
  freshForHunt() {
    const roster = this.competitionRoster || (this.state.competitionRoster || []);
    return (this.state.party || []).filter(p => !roster.includes(p.name));
  }

  startHuntSetup() {
    const h = this.state.huntState;
    if (h && h.active && h.carrier && !h.done && h.line && h.line.length) { this.renderHuntStep(); return; }
    const foe = this.bracket && this.bracket.opponents[3] || { kingdom: 'valor', name: 'The Undefeated', grudge: 0 };
    const relic = HUNT_RELICS[this.state.kingdom] || HUNT_RELICS.valor;
    if (!h || !h.active) {
      const hs = { active: true, step: 0, done: false, carrier: null, relic: relic.id, line: [] };
      this.state.huntState = hs;
      hs.line = this.buildHuntLine(foe);
    }
    this.huntFinalist = foe;
    const eligible = this.freshForHunt();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    if (!eligible.length) {
      container.innerHTML = `
        <div class="story-text">
          <div class="line" style="animation-delay:0.1s">${STORY.competitionHuntIntro.replace('{RELIC_NAME}', `${relic.icon} ${relic.name.replace(/^The\s+/, '')}`)}</div>
          <div class="line" style="animation-delay:0.5s">${STORY.competitionHuntSummon}</div>
        </div>
        <div class="story-continue" id="story-continue">Open the Champion Hall...</div>`;
      document.getElementById('story-continue').addEventListener('click', () => { this.showScreen('hub'); this.showRecruit(); });
      return;
    }
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${STORY.competitionHuntIntro.replace('{RELIC_NAME}', `${relic.icon} ${relic.name.replace(/^The\s+/, '')}`)}</div>
        <div class="line" style="animation-delay:0.5s">The warden's clerk notes the covenant law and marks the allowed hands. Only an unbloodied champion may touch <b>${relic.name}</b>.</div>
      </div>
      <div class="hunt-picker">
        <p style="margin:0 0 6px;font-size:0.85rem;opacity:0.8">Who carries the relic for ${KINGDOMS[this.state.kingdom].name}?</p>
        ${eligible.map(p => `<button class="btn" onclick="game.pickReliquary('${p.name}')">${p.name}, ${this.getClassInfo(p.class, p.kingdom)?.name || p.class} (Lv ${p.level || 1})</button>`).join('')}
      </div>`;
  }

  pickReliquary(name) {
    const h = this.state.huntState;
    if (!h || !h.active || h.done) return;
    if (!this.freshForHunt().some(p => p.name === name)) return;
    h.carrier = name;
    this.retuneHuntEnemiesToCarrier();
    this.roleXpToast && this.roleXpToast([`${name} takes up ${HUNT_RELICS[h.relic].name}, the Hunt begins.`]);
    this.save();
    this.renderHuntStep();
  }

  renderHuntStep() {
    const h = this.state.huntState;
    if (!h || h.done) return;
    const carrier = (this.state.party || []).find(p => p.name === h.carrier);
    const relic = HUNT_RELICS[h.relic];
    const step = h.line[h.step];
    if (!step) { this.completeHunt(); return; }
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const header = `<div class="story-chapter">THE HUNT, ${carrier ? carrier.name.toUpperCase() : 'THE RELIQUARY'} · STEP ${h.step + 1} OF ${h.line.length}</div>`;
    if (step.id === 'talk') {
      const pool = STORY.huntTrick || [];
      const t = pool[Math.floor(Math.random() * pool.length)] || { prompt: 'A stranger offers a path.', falseOption: 'Take it', trueOption: 'Refuse it' };
      h.pending = t;
      container.innerHTML = `
        ${header}
        <div class="story-text"><div class="line" style="animation-delay:0.1s">${step.text}</div></div>
        <div class="story-text"><div class="line rival-taunt" style="animation-delay:0.5s">${t.prompt}</div></div>
        <div class="hunt-picker">
          <button class="btn" onclick="game.huntAnswer(false)">${t.falseOption}</button>
          <button class="btn" onclick="game.huntAnswer(true)">${t.trueOption}</button>
        </div>`;
      return;
    }
    container.innerHTML = `
      ${header}
      <div class="story-text"><div class="line" style="animation-delay:0.1s">${step.text}</div></div>
      ${step.enemy && step.enemy.taunt ? `<div class="story-text"><div class="line rival-taunt" style="animation-delay:0.5s">${step.enemy.taunt}</div></div>` : ''}
      <div class="story-continue" id="story-continue">${step.id === 'clash' ? 'Fight for the relic...' : 'Press on...'}</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      this.startBattle([step.enemy], 'hunt');
    });
  }

  huntAnswer(truth) {
    const h = this.state.huntState;
    if (!h || !h.pending) return;
    const t = h.pending;
    h.pending = null;
    if (truth) {
      this.roleXpToast && this.roleXpToast(['The tale cracks like cheap wax. You hold the true path.']);
      this.advanceHunt();
      return;
    }
    const sab = this.huntInterceptor();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">The "lead" is a trap, ${sab.name} of ${KINGDOMS[sab.kingdom].name} was already waiting where you were told to go.</div>
      </div>
      <div class="story-continue" id="story-continue">Fight your way clear...</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      this.startBattle([sab], 'hunt');
    });
  }

  advanceHunt() {
    const h = this.state.huntState;
    if (!h || h.done) return;
    h.step++;
    if (h.step >= h.line.length) { this.completeHunt(); return; }
    this.save();
    setTimeout(() => this.renderHuntStep(), 900);
  }

  completeHunt() {
    const h = this.state.huntState;
    if (!h || h.done) return;
    const relic = HUNT_RELICS[h.relic] || HUNT_RELICS.valor;
    this.state.huntState = { active: false, done: true, carrier: h.carrier, relic: h.relic };
    this.competitionQueue.push({ round: 3, won: true });
    this.state.competitionWins = (this.state.competitionWins || 0) + 1;
    this.state.competitionWinsAge = this.state.competitionWinsAge || 0;
    this.state.competitionWinsAge++;
    this.settleWager(true);
    this.recordRivalGrudge && this.recordRivalGrudge();
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const carrier = (this.state.party || []).find(p => p.name === h.carrier);
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${STORY.competitionHuntDeliver.replace('{RELIC_NAME}', `${relic.icon} ${relic.name.replace(/^The\s+/, '')}`)}</div>
        <div class="line" style="animation-delay:0.5s">The arena's oldest clerk, whose pen has outlasted kings, carves the name below the mirror: <b>${(carrier && carrier.name) || h.carrier}</b> carried <b>${relic.name}</b> home for ${KINGDOMS[this.state.kingdom].name}.</div>
      </div>
      <div class="story-continue" id="story-continue">Claim the year...</div>`;
    document.getElementById('story-continue').addEventListener('click', () => this.showVictory());
    this.fxStinger('win');
  }

  huntSetback() {
    const h = this.state.huntState;
    if (!h) return;
    this.settleWager(false);
    if (this.huntFinalist) {
      const k = this.huntFinalist.kingdom;
      this.state.rivals = this.state.rivals || {};
      if (!this.state.rivals[k]) this.state.rivals[k] = { name: this.huntFinalist.name, grudge: 0 };
      this.state.rivals[k].grudge = (this.state.rivals[k].grudge || 0) + 1;
    }
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${STORY.competitionHuntSetback}</div>
        <div class="line" style="animation-delay:0.5s">The hunt is not over, the relic is out there, and ${KINGDOMS[this.state.kingdom].name} cannot be seen to walk back to the arena empty-handed.</div>
      </div>
      <div class="story-continue" id="story-continue">Re-enter the hunt...</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      this.showScreen('story');
      this.renderHuntStep();
    });
    this.fxStinger('lose');
  }

  huntCarrierStats() {
    const h = this.state.huntState;
    const named = h && h.carrier ? (this.state.party || []).find(p => p.name === h.carrier) : null;
    const u = named || (this.state.party || []).find(p => p.isPlayer) || (this.state.party || [])[0];
    const st = (u && u.stats) || {};
    return {
      hp: st.hp || 100,
      atk: st.atk || 20,
      def: st.def || 12,
      spd: st.spd || 32,
      spAtk: st.spAtk || 18
    };
  }

  // The hunt's foes scale against the champion who actually carries the relic,
  // and can never land a single blow that would one-shot a fresh champion.
  huntThreat(lvl) {
    const c = this.huntCarrierStats();
    const capAtk = Math.floor((0.8 * c.hp + c.def) / 2);
    const capSpAtk = Math.floor((0.8 * c.hp + c.def) / 3.3);
    return {
      atk: Math.max(24, Math.min((70 + lvl * 7), capAtk)),
      spAtk: Math.max(20, Math.min((60 + lvl * 6), capSpAtk))
    };
  }

  huntInterceptor() {
    const lvl = this.state.level;
    const others = Object.keys(KINGDOMS).filter(id => id !== this.state.kingdom);
    const kId = others[Math.floor(Math.random() * others.length)];
    const names = (RIVAL_NAMES && RIVAL_NAMES[kId]) || ['The Saboteur'];
    const name = names[Math.floor(Math.random() * names.length)];
    const s = 1 + Math.random() * 0.12;
    const t = this.huntThreat(lvl);
    const c = this.huntCarrierStats();
    return {
      name: `${name}, the Saboteur`,
      kingdom: kId,
      level: lvl + 2,
      epithet: `${KINGDOMS[kId].name}'s hand in the dark of the hunt`,
      taunt: `"A hunt is a race of thieves, ${this.state.town}. I merely arrive earlier than your hope."`,
      signature: `Ambush, it strikes first against the Reliquary's guard.`,
      stats: {
        hp: Math.round((190 + lvl * 13) * 0.85 + c.hp * 0.25),
        atk: Math.round(t.atk * s),
        def: Math.round((58 + lvl * 6) * 0.5 + c.def * 0.9),
        spd: Math.round((66 + lvl * 5) * 0.5 + c.spd * 0.9),
        spAtk: Math.round(t.spAtk * s)
      }
    };
  }

  huntFinalistEnemy(foe) {
    const lvl = this.state.level;
    const s = 1.35 + Math.random() * 0.15;
    const t = this.huntThreat(lvl);
    const c = this.huntCarrierStats();
    return {
      name: foe.name,
      kingdom: foe.kingdom,
      level: lvl + 4,
      epithet: `${KINGDOMS[foe.kingdom].name}'s final champion, standing between you and your own relic`,
      taunt: `"${this.state.town} hunts for a relic it already owns. I hunt for the right to take it from them. Let us learn which of those is true."`,
      signature: `Last Stand, it strikes hardest as the hunt nears its end.`,
      stats: {
        hp: Math.round((260 + lvl * 16) * 0.7 + c.hp * 0.5),
        atk: Math.round(t.atk * 1.05 * s),
        def: Math.round((75 + lvl * 7) * 0.4 + c.def * 0.95),
        spd: Math.round((70 + lvl * 6) * 0.45 + c.spd * 0.95),
        spAtk: Math.round(t.spAtk * 1.05 * s)
      }
    };
  }

  retuneHuntEnemiesToCarrier() {
    const h = this.state.huntState;
    if (!h || !h.line) return;
    const lvl = this.state.level;
    const t = this.huntThreat(lvl);
    const c = this.huntCarrierStats();
    if (h.line[1] && h.line[1].enemy) {
      const e = h.line[1].enemy;
      const s = 1 + Math.random() * 0.12;
      e.stats.hp = Math.round((190 + lvl * 13) * 0.85 + c.hp * 0.25);
      e.stats.atk = Math.round(t.atk * s);
      e.stats.spAtk = Math.round(t.spAtk * s);
      e.stats.def = Math.round((58 + lvl * 6) * 0.5 + c.def * 0.9);
      e.stats.spd = Math.round((66 + lvl * 5) * 0.5 + c.spd * 0.9);
    }
    if (h.line[2] && h.line[2].enemy) {
      const e = h.line[2].enemy;
      const s2 = 1.35 + Math.random() * 0.15;
      e.stats.hp = Math.round((260 + lvl * 16) * 0.7 + c.hp * 0.5);
      e.stats.atk = Math.round(t.atk * 1.05 * s2);
      e.stats.spAtk = Math.round(t.spAtk * 1.05 * s2);
      e.stats.def = Math.round((75 + lvl * 7) * 0.4 + c.def * 0.95);
      e.stats.spd = Math.round((70 + lvl * 6) * 0.45 + c.spd * 0.95);
    }
  }

  buildHuntLine(foe) {
    const sab = this.huntInterceptor();
    const relicName = (HUNT_RELICS[this.state.huntState.relic] || HUNT_RELICS.valor).name.replace(/^The\s+/, '');
    return [
      { id: 'talk', title: 'The Crooked Trail', text: `A mile beyond the east bell-road, ${sab.name} of ${KINGDOMS[sab.kingdom].name} does not bar the road, they hand out directions. The hunt's oldest trick: the road you are told to take is the road they have already armed.` },
      { id: 'fight', title: sab.name, text: `The interceptor does not wait for the arena. ${sab.name} means to stop the ${relicName} before it is unearthed.`, enemy: sab },
      { id: 'clash', title: foe.name, text: `The ${KINGDOMS[foe.kingdom].name} champion guards their own relic at the border crossing, and a champion of the arena's shadow knows no courtesy. You must pass them to bring the ${relicName} home.`, enemy: this.huntFinalistEnemy(foe) }
    ];
  }

  rivalTaunt(foe) {
    if (!foe || !foe.name) return '';
    const grudge = this.state.rivals[foe.kingdom] && this.state.rivals[foe.kingdom].grudge;
    if (!grudge) return '';
    return `<b style="color:#e74c3c">${foe.name}</b> of ${KINGDOMS[foe.kingdom].name} narrows their eyes: <i>"We have met before. You took ${grudge} victory/victories from me by name. Tonight the score remembers."</i>`;
  }

  bestRival() {
    const entries = Object.entries(this.state.rivals || {}).filter(([k, r]) => r && r.grudge >= 2);
    if (!entries.length) return null;
    entries.sort((a, b) => b[1].grudge - a[1].grudge);
    const [kingdom, r] = entries[0];
    return { kingdom, name: r.name, grudge: r.grudge, wins: r.wins || 0 };
  }

  rivalFighter(rival) {
    const lvl = this.state.level;
    const grudgeScale = 1 + (rival.grudge || 0) * 0.06;
    const k = KINGDOMS[rival.kingdom];
    const avatar = (k && k.emblem) || '⚔️';
    const title = this.rivalTitle(rival.grudge) || { title: 'The Beaten' };
    return {
      name: `${rival.name}, ${title.title}`,
      kingdom: rival.kingdom,
      isRival: true,
      rival: true,
      level: lvl,
      color: (k && k.color) || '#c0392b',
      avatar,
      epithet: `${title.title}, ${rival.kingdom}'s champion, scarred by your name`,
      taunt: `"${title.note} Heard this one? 'Victory grows a crown. Defeat grows a grudge.' And I have grown ${rival.grudge} grudge-shaped reasons to split your line."`,
      signature: `Grudge, strikes the champion who has beaten it before, harder with every duel.`,
      stats: {
        hp: Math.round((240 + lvl * 16) * grudgeScale),
        atk: Math.round((90 + lvl * 9) * grudgeScale),
        def: Math.round((75 + lvl * 7) * grudgeScale),
        spd: Math.round((70 + lvl * 5) * grudgeScale),
        spAtk: Math.round((75 + lvl * 8) * grudgeScale)
      }
    };
  }

  bracketHTML() {
    const b = this.bracket;
    return `
      <div class="bracket-view">
        <div class="bracket-rounds">
          <div class="bracket-col">
            <div class="bracket-round-title">Quarterfinals</div>
            ${b.pairs.map((p, i) => `<div class="bracket-match ${i === 0 ? 'mine' : ''}">${p}</div>`).join('')}
          </div>
          <div class="bracket-col">
            <div class="bracket-round-title">Semifinals</div>
            ${b.semifinals.map(p => `<div class="bracket-match">${p}</div>`).join('')}
          </div>
          <div class="bracket-col">
            <div class="bracket-round-title">Final</div>
            <div class="bracket-match finals"><span>Winner vs ${KINGDOMS[b.finalWinner].name}</span></div>
          </div>
        </div>
      </div>`;
  }

  startBattle(enemies, type = 'training') {
    this.showScreen('combat');
    this.renderCombat(enemies, type);
  }

  renderCombat(enemies, type) {
    const container = document.getElementById('combat-content');
    const k = KINGDOMS[this.state.kingdom];
    const rivalKingdom = (enemies || []).map(enemy => enemy && enemy.kingdom).find(id => id && KINGDOMS[id]);
    const battleRealm = KINGDOMS[rivalKingdom] || k;
    const battleStage = document.getElementById('combat-stage');
    if (battleStage && battleRealm) battleStage.style.setProperty('--battle-art', `url("assets/kingdoms/${battleRealm.id}.jpg")`);

    // Eternal Cycle difficulty applies to base battles (training/drill/competition).
    // finalwar/crisis scale internally; crown uses its own mirror-scaling.
    if (type !== 'finalwar' && type !== 'crisis' && type !== 'crown') {
      const m = this.difficultyMult();
      if (m !== 1) {
        enemies = enemies.map(e => {
          const stats = Object.assign({}, e.stats || {});
          Object.keys(stats).forEach(s => stats[s] = Math.round(stats[s] * m));
          return Object.assign({}, e, { stats });
        });
      }
    }

    const endCombatHandler = (winner, playerTeam, enemyTeam) => {
      setTimeout(() => combat3d.destroy(), 500);
      if (winner === 'player') {
        this.fxStinger('win');
        this.state.totalBattles++;
        this.state.fightStats = this.state.fightStats || { wins: 0, losses: 0 };
        this.state.fightStats.wins++;
        this.gainAffinity(playerTeam);
        const goldReward = type === 'competition' ? 75 : type === 'wound' ? 60 : type === 'finalwar' ? 120 : type === 'crisis' ? 55 : 25;
        const shardReward = type === 'competition' ? 4 : type === 'crown' ? 8 : type === 'deception' ? 5 : type === 'drill' ? 2 : type === 'finalwar' ? 10 : type === 'crisis' ? 6 : type === 'rift' ? 6 : 2;
        let goldMult = 1;
        if ((this.state.decrees[this.currentAge().id] || '') === 'open_gates') goldMult += 0.2 * this.decreeTier('open_gates');
        if (this.legacyPerk('gilded_hand')) goldMult += 0.15;
        if (this.crownBoon('war_chest')) goldMult += 0.4;
        this.state.gold += Math.round(goldReward * goldMult);
        this.state.exp += type === 'competition' ? 36 : type === 'wound' ? 30 : 14;
        this.state.exp *= this.crownBoon('the_archive') ? 1.3 : 1;
        const harnessed = this.awardShards(shardReward + (this.crownBoon('the_seal') ? 2 : 0));
        this.awardRoleXp(playerTeam, type);

        if (this.state.exp >= this.levelUpThreshold()) {
          this.state.level++;
          this.state.exp = 0;
          this.state.party.forEach(p => {
            if (p.isPlayer) {
              Object.keys(p.stats).forEach(s => p.stats[s] += 3);
              p.stats.hp += 10;
            }
          });
        }

        if (type === 'competition') {
          this.competitionQueue.push({ round: this.competitionRound, won: true });
          this.settleWager(true);
          if (this.competitionRound < 3) {
            this.competitionRound++;
            setTimeout(() => {
              this.showScreen('story');
              const cont = document.getElementById('story-content');
              cont.innerHTML = `
                <div class="story-text"><div class="line" style="animation-delay:0.1s">Victory in Round ${this.competitionRound - 1}! You advance to the next round! ${shardReward ? 'Found +' + harnessed + ' shards.' : ''}</div></div>
                <div class="story-continue" id="story-continue">Continue to Round ${this.competitionRound}...</div>`;
              document.getElementById('story-continue').addEventListener('click', () => this.openWager());
            }, 1500);
          } else {
            this.state.competitionWins++;
            this.state.competitionWinsAge = this.state.competitionWinsAge || 0;
            this.state.competitionWinsAge++;
            this.settleWager(true);
            this.recordRivalGrudge();
            setTimeout(() => this.showVictory(), 1500);
          }
        } else if (type === 'hunt') {
          this.advanceHunt();
        } else if (type === 'drill') {
          setTimeout(() => {
            this.roleDrillFocus = null;
            this.showScreen('story');
            const cont = document.getElementById('story-content');
            cont.innerHTML = `
              <div class="story-text"><div class="line" style="animation-delay:0.1s">Drill complete! Your role is sharper. Return to the Guild Hall and grow your calling. ${harnessed ? 'Found +' + harnessed + ' shards.' : ''}</div></div>
              <div class="story-continue" id="story-continue">Return to the Guild Hall</div>`;
            document.getElementById('story-continue').addEventListener('click', () => {
              this.showRoleGuild();
              this.showScreen('hub');
            });
          }, 1500);
        } else if (type === 'crown') {
          this.state.kingOfAge = true;
          this.state.crownWins = (this.state.crownWins || 0) + 1;
          // Reclaim: if a rival has been wearing the crown you dropped, taking the ring takes it back.
          if (this.state.usurper) {
            this.state.reclaimed = (this.state.reclaimed || 0) + 1;
            this.state.trophies.push({
              crowned: true,
              ageName: this.currentAge().name,
              year: this.state.year,
              title: 'The Crown Reclaimed',
              note: `${this.state.usurper.name} is unmade as King, your line took the throne back by name.`,
              corruption: this.state.corruption
            });
            this.state.usurper = null;
          }
          this.state.trophies.push({
            crowned: true,
            ageName: this.currentAge().name,
            year: this.state.year,
            title: KING_OF_THE_AGE_TITLE.replace('{AGE}', this.ageName(this.currentAge())),
            note: `${this.state.party.find(p => p.isPlayer)?.name || 'Champion'} of ${this.state.town} outgrew their role.`,
            corruption: this.state.corruption
          });
          this.state.corruption = Math.max(0, (this.state.corruption || 0) - 4);
          setTimeout(() => this.showCrowning(), 1500);
        } else if (type === 'finalwar') {
          const wave = (this.state.finalWar && this.state.finalWar.wave) || 1;
          if (wave < 3) {
            this.state.finalWar.wave = wave + 1;
            this.save();
            setTimeout(() => {
              this.showScreen('story');
              const cont = document.getElementById('story-content');
              const waveText = this.state.finalWar.wave === 2 ? STORY.finalWarWave2 : STORY.finalWarWave3;
              cont.innerHTML = `
                <div class="story-text"><div class="line" style="animation-delay:0.1s">${STORY.finalWarWin}</div>
                <div class="line" style="animation-delay:0.5s">${waveText}</div></div>
                <div class="story-continue" id="story-continue">Face Wave ${this.state.finalWar.wave}...</div>`;
              document.getElementById('story-continue').addEventListener('click', () => this.startFinalWarWave(this.state.finalWar.wave));
            }, 1500);
          } else {
            this.state.trueEnding = true;
            this.state.finalWar = null;
            this.state.trophies.push({
              crowned: true,
              ageName: 'The Final War',
              year: this.state.year,
              title: 'The End of Deception',
              note: `${this.state.party.find(p => p.isPlayer)?.name || 'Champion'} of ${this.state.town} broke the Eighth on the Arena floor.`,
              corruption: this.state.corruption
            });
            this.save();
            setTimeout(() => this.showTrueEnding(), 1500);
          }
        } else if (type === 'rift') {
          setTimeout(() => this.riftWin(), 1500);
        } else if (type === 'crisis') {
          this.state.corruption = 3;
          this.state.corruptionCrisisDoneAge = this.currentAge().id;
          this.save();
          setTimeout(() => {
            this.showScreen('story');
            const cont = document.getElementById('story-content');
            cont.innerHTML = `
              <div class="story-text">
                <div class="line" style="animation-delay:0.1s">${STORY.crisisWin}</div>
                <div class="line" style="animation-delay:0.5s">Corruption crumbles to <b>3</b>. The streets stop remembering. +${harnessed} shards.</div>
              </div>
              <div class="story-continue" id="story-continue">Return to the Hall</div>`;
            document.getElementById('story-continue').addEventListener('click', () => {
              this.renderHub();
              this.showScreen('hub');
            });
          }, 1500);
        } else if (type === 'wound') {
          if (this.corruptionBrawling) {
            this.corruptionBrawling = false;
            const ltName = this.woundBattle ? this.woundBattle.lt.name : 'the lieutenant';
            this.woundBattle = null;
            this.addCorruption(-4);
            setTimeout(() => {
              this.showScreen('story');
              const cont = document.getElementById('story-content');
              cont.innerHTML = `
                <div class="story-text">
                  <div class="line" style="animation-delay:0.1s">${ltName} dissolves into the crowd like a rumor. The corruption of the Age eases (−4).</div>
                  <div class="line" style="animation-delay:0.5s">The roads feel a degree colder, and stranger, than before. That is the victory.</div>
                </div>
                <div class="story-continue" id="story-continue">Return to the Hall</div>`;
              document.getElementById('story-continue').addEventListener('click', () => {
                this.renderHub();
                this.showScreen('hub');
              });
            }, 1500);
          } else if (this.woundBattle && this.woundBattle.phase === 1) {
            this.woundBattle.phase = 2;
            setTimeout(() => {
              this.showScreen('story');
              const cont = document.getElementById('story-content');
              cont.innerHTML = `
                <div class="story-text">
                  <div class="line" style="animation-delay:0.1s">The corruption thrashes, but the wound is deeper than one crack.</div>
                  <div class="line" style="animation-delay:0.5s"><b>${this.woundBattle.lt.name}</b>, ${this.woundBattle.lt.epithet}, steps into the two-sided night.</div>
                </div>
                <div class="intel-cards">
                  <div class="intel-card" style="--ic:${this.woundBattle.lt.color || '#a43232'}">
                    <div class="intel-head"><span class="intel-ico">🩸</span><span class="intel-name">${this.woundBattle.lt.name}</span></div>
                    <div class="intel-sig">${this.woundBattle.lt.signature || 'Fights as a lieutenant of the Eighth.'}</div>
                  </div>
                </div>
                <div class="story-continue" id="story-continue">Meet the second side</div>`;
              document.getElementById('story-continue').addEventListener('click', () => this.startWoundPhase(2));
            }, 1500);
          } else if (this.woundBattle) {
            const age = this.currentAge();
            this.state.woundState = { done: age.id };
            if (this.masterLieutenant() && this.masterLieutenant().id === this.woundBattle.lt.id) {
              this.addCorruption(-2);
            }
            this.woundBattle = null;
            this.state.gold += 40;
            setTimeout(() => {
              this.showScreen('story');
              const cont = document.getElementById('story-content');
              cont.innerHTML = `
                <div class="story-text">
                  <div class="line" style="animation-delay:0.1s">The wound closes. The town breathes out, shakily, together.</div>
                  <div class="line" style="animation-delay:0.5s">A splinter deeper than flesh is pulled: +40 gold, +${harnessed} shards. ${this.state.woundState.done ? 'This Age\'s wound is sealed.' : ''}</div>
                </div>
                <div class="story-continue" id="story-continue">Return to the Hall</div>`;
              document.getElementById('story-continue').addEventListener('click', () => {
                this.renderHub();
                this.showScreen('hub');
              });
            }, 1500);
          } else {
            setTimeout(() => {
              this.showScreen('story');
              const cont = document.getElementById('story-content');
              cont.innerHTML = `
                <div class="story-text"><div class="line" style="animation-delay:0.1s">The skirmish ends. +${harnessed} shards.</div></div>
                <div class="story-continue" id="story-continue">Return to Hub</div>`;
              document.getElementById('story-continue').addEventListener('click', () => {
                this.renderHub();
                this.showScreen('hub');
              });
            }, 1500);
          }
        } else {
          const staked = this.trainingStaked;
          this.trainingStaked = false;
          if (staked) this.state.gold += 75;
          setTimeout(() => {
            this.showScreen('story');
            const cont = document.getElementById('story-content');
            cont.innerHTML = `
              <div class="story-text"><div class="line" style="animation-delay:0.1s">Training complete! You earned ${Math.round(goldReward * goldMult)} gold, gained experience, and found +${harnessed} shards.${staked ? ' The staked purse returns: your 25 back plus 50 more.' : ''}</div></div>
              <div class="story-continue" id="story-continue">Return to Hub</div>`;
            document.getElementById('story-continue').addEventListener('click', () => {
              this.renderHub();
              this.showScreen('hub');
            });
          }, 1500);
        }
        this.save();
      } else {
        this.state.totalBattles++;
        this.fxStinger('lose');
        this.state.fightStats = this.state.fightStats || { wins: 0, losses: 0 };
        this.state.fightStats.losses++;
        const loseDrill = type === 'drill';
        const loseCrown = type === 'crown';
        if (type === 'hunt') { this.huntSetback(); return; }
        if (loseDrill) {
          this.awardRoleXp(playerTeam, type);
        }
        if (type === 'competition') {
          this.settleWager(false);
        }
        if (loseCrown) {
          this.addCorruption(2);
          setTimeout(() => {
            this.fallToHeir('The ring claimed another crown. The champion of ' + this.state.town + ' fell to their own perfected shadow, the mirror does not forgive.');
          }, 1200);
          return;
        }
        if (type === 'finalwar') {
          this.addCorruption(2);
          setTimeout(() => {
            this.fallToHeir('The Final War broke over your champion like a tide. The siege of Deception holds, but a dynasty does not surrender. It outlives.');
          }, 1200);
          return;
        }
        if (type === 'crisis') {
          this.state.corruptionCrisisDoneAge = this.currentAge().id;
          this.addCorruption(2);
          this.save();
          setTimeout(() => {
            this.showScreen('story');
            const cont = document.getElementById('story-content');
            cont.innerHTML = `
              <div class="story-text">
                <div class="line" style="animation-delay:0.1s">${STORY.crisisLose}</div>
                <div class="line" style="animation-delay:0.5s">The town pays the seers out of its own pockets. Corruption clings (+2). The shadow is fed, this Age.</div>
              </div>
              <div class="story-continue" id="story-continue">Return to the Hall</div>`;
            document.getElementById('story-continue').addEventListener('click', () => {
              this.renderHub();
              this.showScreen('hub');
            });
}, 1500);
          return;
        }
        if (type === 'rift') {
          this.state.gold = Math.max(0, (this.state.gold || 0) - 40);
          this.addCorruption(1);
          this.save();
          setTimeout(() => {
            this.showScreen('story');
            const cont = document.getElementById('story-content');
            cont.innerHTML = `
              <div class="story-text">
                <div class="line" style="animation-delay:0.1s">The rift spits you back out, bloody, richer in memory, poorer in gold.</div>
                <div class="line" style="animation-delay:0.5s">The gate is still open. The guardian is still waiting. (-40 gold, Corruption +1.)</div>
              </div>
              <div class="story-continue" id="story-continue">Return to the Hall</div>`;
            document.getElementById('story-continue').addEventListener('click', () => {
              this.renderHub();
              this.showScreen('hub');
            });
          }, 1500);
          return;
        }
        setTimeout(() => {
          this.showScreen('story');
          const cont = document.getElementById('story-content');
          const stakeLost = this.trainingStaked;
          this.trainingStaked = false;
          let lossMsg = type === 'competition' ? STORY.defeat
            : loseDrill ? 'The drill bested you, but the field teaches more than victory.'
            : loseCrown ? 'The shadow of the King still holds the ring. Train your calling, and return when you can outgrow yourself.'
            : type === 'wound' ? 'The wound was too deep this time. The town will dress it and wait for a stronger champion.'
            : 'Your training ended in defeat. You need to grow stronger.';
          if (stakeLost && type === 'training') lossMsg += ' The 25 gold stake stays with the yard master.';
          cont.innerHTML = `
            <div class="story-text"><div class="line" style="animation-delay:0.1s">${lossMsg}</div></div>
            <div class="story-continue" id="story-continue">${loseDrill ? 'Return to the Guild Hall' : 'Return to Hub'}</div>`;
          document.getElementById('story-continue').addEventListener('click', () => {
            if (loseDrill) this.showRoleGuild();
            else this.renderHub();
            this.showScreen('hub');
          });
        }, 1500);
        this.save();
      }
    };

    const playerTeam = this.state.party.map(p => ({ ...p }));
    const affinityPct = 1 + this.affinityBonus() / 100;
    const relic = this.relicBonus();
    const legacyMult = {
      atk: (this.legacyPerk('heirloom_blade') ? 1.05 : 1) * (this.crownBoon('the_forge') ? 1.08 : 1) * affinityPct,
      def: this.legacyPerk('iron_lineage') ? 1.05 : 1,
      hp: this.legacyPerk('second_breath') ? 1.1 : 1
    };
    playerTeam.forEach(u => {
      if (!u.stats) return;
      if (relic) {
        u.stats = Object.assign({}, u.stats);
        const k = relic.stat;
        if (k === 'atk') u.stats.atk = Math.round((u.stats.atk || 0) + relic.amt);
        else if (k === 'spAtk') u.stats.spAtk = Math.round((u.stats.spAtk || 0) + relic.amt);
        else if (k === 'def') u.stats.def = Math.round((u.stats.def || 0) + relic.amt);
        else if (k === 'spd') u.stats.spd = Math.round((u.stats.spd || 0) + relic.amt);
        else if (k === 'hp') u.stats.hp = Math.round((u.stats.hp || u.stats.maxHp || 0) + relic.amt);
        if (!u._relicName) u._relicName = relic.name;
      }
      if (legacyMult.atk !== 1 || legacyMult.def !== 1 || legacyMult.hp !== 1) {
        u.stats = Object.assign({}, u.stats);
        u.stats.atk = Math.round((u.stats.atk || 0) * legacyMult.atk);
        u.stats.def = Math.round((u.stats.def || 0) * legacyMult.def);
        u.stats.hp = Math.round((u.stats.hp || u.stats.maxHp || 0) * legacyMult.hp);
      }
      if (this.legacyPerk('second_breath')) u._healMult = 1.2;
      if (this.legacyPerk('unbroken_vow')) u._dmgResist = 0.1;
      if (this.state.bannerBuff) {
        u.stats = Object.assign({}, u.stats);
        u.stats.atk = Math.round((u.stats.atk || 0) * (1 + this.state.bannerBuff));
      }
    });

    const plateColor = (p) => (KINGDOMS[p.kingdom]?.color) || '#d4a847';
    const fieldPlates = document.getElementById('field-plates');
    if (fieldPlates) {
      fieldPlates.innerHTML = `
        <div class="field-col ally-col">
          ${playerTeam.map(p => `
            <div class="unit-plate ally" data-unit-id="${p.name}">
              <div class="plate-gem" style="background:${plateColor(p)};box-shadow:0 0 8px ${plateColor(p)}"></div>
              <div class="plate-body">
                <div class="plate-name">${p.name}</div>
                <div class="plate-sub">${p.class} &middot; Lv ${p.level || 1}</div>
                <div class="plate-hpbar"><div class="plate-hpfill" data-hp-bar="${p.name}" style="width:100%"></div></div>
                <div class="plate-hptext" data-hp-text="${p.name}">HP: ${p.stats.hp}/${p.stats.hp}</div>
                <div class="plate-ep" data-ep-text="${p.name}">EP 100</div>
              </div>
            </div>`).join('')}
        </div>
        <div class="field-col foe-col">
          ${enemies.map((e, i) => `
            <div class="unit-plate foe" data-unit-id="${e.name}" data-target-idx="${i}" onclick="game.plateTarget(this)">
              <div class="plate-gem" style="background:#a43232;box-shadow:0 0 8px #a43232"></div>
              <div class="plate-body">
                <div class="plate-name">${e.name}</div>
                <div class="plate-sub">${e.kingdom || 'Unknown'}</div>
                <div class="plate-hpbar"><div class="plate-hpfill" data-hp-bar="${e.name}" style="width:100%"></div></div>
                <div class="plate-hptext" data-hp-text="${e.name}">HP: ${e.stats.hp}/${e.stats.hp}</div>
                <div class="plate-ep" data-ep-text="${e.name}">EP 100</div>
              </div>
            </div>`).join('')}
        </div>`;
    }

    container.innerHTML = `
      <div class="combat-header">
        <div class="round-info">${type === 'competition' ? `COMPETITION - ROUND ${this.competitionRound}` : type === 'hunt' ? `THE HUNT, ${(this.state.huntState && this.state.huntState.carrier) ? this.state.huntState.carrier.toUpperCase() : 'THE RELIQUARY'}` : type === 'drill' ? `ROLE DRILL, ${ROLE_DRILLS[this.roleDrillFocus]?.name || 'THE CALLING'}` : type === 'finalwar' ? `THE FINAL WAR, WAVE ${this.state.finalWar ? this.state.finalWar.wave : 1} OF 3` : type === 'crisis' ? 'THE CORRUPTION CRISIS' : type === 'wound' ? 'THE TOWN WOUND' : type === 'rift' ? 'THE RIFT, A CLOSED GATE' : type === 'crown' ? 'THE CROWN TRIAL' : type === 'deception' ? 'THE EIGHTH, DECEPTION' : type === 'temptation' ? 'THE EMPTY CHAIR' : 'TRAINING BATTLE'}</div>
        <div class="round-sub">${type === 'competition' ? 'The Grand Tournament of the Three Realms' : type === 'hunt' ? 'The final two kingdoms race the wilds for their covenant relic.' : type === 'drill' ? (ROLE_DRILLS[this.roleDrillFocus]?.desc || 'Prove your role.') : type === 'finalwar' ? 'The shadow of the Eighth breaks its siege on the Age.' : type === 'crisis' ? 'The town\'s corruption has grown teeth. Survive the city\'s own dark.' : type === 'wound' ? 'Deception\'s seed, dug deep in the town\'s flesh.' : type === 'rift' ? 'A gate beyond the border, open this Age, holding one relic for the bold.' : type === 'crown' ? 'The perfected mirror of your kingdom, and it knows your regret.' : type === 'deception' ? 'The shadow of the Eighth keeps its own counsel, and it has been reading your ledger.' : type === 'temptation' ? 'The Eighth sits down at the table, and the seat across from you is yours.' : 'Sharpen your blade on the proving ground'}</div>
        ${(type === 'deception' || type === 'finalwar' || type === 'wound' || type === 'crown') ? `<div class="combat-intel">${enemies.map(e => `<span class="combat-intel-chip">${e.name}: ${e.regretTaunt || e.signature || 'a shadow of the Eighth.'}</span>`).join('')}</div>` : ''}
        <div class="shape-hud" id="shape-hud"></div>
      </div>
      <div class="combat-chronicle">
        <div class="chronicle-head"><span class="chronicle-title">War Chronicle</span></div>
        <div class="combat-log" id="combat-log"></div>
      </div>
      <div id="combat-actions-container">
        <div class="combat-actions">
          <button class="combat-btn" onclick="game.combatAction('attack')"><div class="action-name">Attack</div><div class="action-desc">Basic strike</div></button>
          <button class="combat-btn" onclick="game.combatAction('defend')"><div class="action-name">Defend</div><div class="action-desc">Shield up + recover</div></button>
          <button class="combat-btn" onclick="game.combatAction('special')"><div class="action-name">Special</div><div class="action-desc">Kingdom ability (30 EP)</div></button>
          <button class="combat-btn" onclick="game.combatAction('heal')"><div class="action-name">Heal</div><div class="action-desc">Heal weakest ally (25 EP)</div></button>
          <button class="combat-btn" onclick="game.combatAction('item')"><div class="action-name">Item</div><div class="action-desc">Satchel consumables</div></button>
        </div>
        <div id="target-select" class="target-select" style="display:none"></div>
        <div id="item-select" class="target-select" style="display:none"></div>
        <div class="combat-footer">
          <button class="combat-mini-btn" onclick="game.toggleCombatHelp()" title="How battle works">? Help</button>
          <button class="combat-mini-btn" id="combat-speed-btn" onclick="game.toggleCombatSpeed()" title="Speed up the turn pacing">Speed: ${this.combatSpeed}×</button>
        </div>
      </div>
      <div id="combat-help" class="combat-help" style="display:none">
        <div class="combat-help-card">
          <div class="combat-help-title">⚔️ Field Manual</div>
          <div class="combat-help-close" onclick="game.toggleCombatHelp()">✕</div>
          <ul class="combat-help-list">
            <li><b>Energy (EP)</b>: every blow restores it. Specials cost 30 EP, heals cost 25 EP, defending recovers 20.</li>
            <li><b>Momentum</b>: a chain of unbroken strikes from your side builds it. An unblocked hit taken resets it.</li>
            <li><b>Focus</b>: hold momentum and your blows concentrate into single, true strikes.</li>
            <li><b>Critical hits</b>: a chance on every basic strike (raised by Speed and certain talents).</li>
            <li><b>Guard</b>: raising your guard sets a shield that soaks the next hits.</li>
            <li><b>The pairing</b>: each kingdom bears a virtue's sway over one rival and a weakness to another.</li>
            <li><b>Mirror Images</b>: the Lie's illusions take blows meant for the true form.</li>
            <li><b>The satchel</b>: drink a potion from your satchel for +70 to a champion (switch to the satchel tab).</li>
            <li><b>Victory</b>: one side falls and the bout ends; bandage before you burn out, because Momentum is how foes punish your rhythm.</li>
            <li><b>Speed</b>: press "Speed: ×1" to set the battle's pacing to ×2 and cut through the grind.</li>
          </ul>
        </div>
      </div>`;

    if (this.state.bannerBuff) { this.state.bannerBuff = null; this.save(); }

if (!this.state.combatHelpSeen) {
      this.state.combatHelpSeen = true;
      this.save();
      this.notify(['Battle rules in short: EP builds, specials burn it, momentum favors the unbroken. Press ? Help for the full Field Manual.']);
    }

    combat.speed = this.combatSpeed;
    combat.initCombat(playerTeam, enemies, { type });
    this.combatType = type;
    this.combatEnemies = enemies;
    combat.onCombatEnd = endCombatHandler;

    combat.onShapeUpdate = (s) => {
      const el = document.getElementById('shape-hud');
      if (el) {
        const pct = Math.min(100, (s.momentum / 5) * 100);
        el.innerHTML = `
          <div class="shape-item">
            <span class="shape-label">Momentum</span>
            <div class="shape-track"><div class="shape-fill" style="width:${pct}%"></div></div>
            <span class="shape-num">${s.momentum}/5</span>
          </div>
          <div class="shape-item ${s.focusCount > 1 ? 'shape-live' : ''}">
            <span class="shape-label">Focus</span>
            <span class="shape-num">${s.focusCount > 1 ? 'x' + s.focusCount : '-'}</span>
          </div>`;
      }
    };
    combat.emitShape();

    combat3d.destroy();
    try {
      const isGrand = type === 'competition' || type === 'crown' || type === 'finalwar' || type === 'crisis';
      combat3d.init('combat-3d-container', { mode: isGrand ? 'grand' : 'training' });
      combat3d.setupPositions(combat.playerTeam, combat.enemyTeam);
    } catch(e) {
      console.warn('3D init failed:', e);
    }

    combat.onLogUpdate = (log) => {
      const logEl = document.getElementById('combat-log');
      if (logEl) {
        logEl.innerHTML = log.slice(-15).map(l =>
          `<div class="log-entry log-${l.type}">${l.message}</div>`
        ).join('');
        logEl.scrollTop = logEl.scrollHeight;
      }
      try {
        this.crowdFxOnLog(log, combat, playerTeam, enemyTeam);
      } catch (e) { /* visual crowd effects must never break the turn chain */ }
    };

    combat.onTurnUpdate = (unit) => {
      this.updateCombatUI();
    };
  }

  crowdFxOnLog(log, combatEngine, playerTeam, enemyTeam) {
      const last = log[log.length - 1];
      if (!last || !combat3d.running) return;
      if (last.type === 'damage' && last.message.includes('attacks')) {
        const parts = last.message.split(' attacks ');
        if (parts.length === 2) {
          const atkName = parts[0];
          const tgtName = parts[1].split(' for ')[0];
          const dmg = parseInt(parts[1].split(' for ')[1]) || 0;
          const isCrit = log.some(l => l.message === 'CRITICAL HIT!' && l.turn === last.turn);
          combat3d.shakeCamera(isCrit ? 8 : 3, isCrit ? 200 : 150);
          combat3d.playAttack(atkName, tgtName, dmg, isCrit);
          if (isCrit) { combat3d.crowdReact('roar'); this.fxStinger('crit'); }
          else if (playerTeam.find(u => u.name === tgtName)) combat3d.crowdReact('groan');
          else combat3d.crowdReact('cheer');
        }
      } else if (last.type === 'special') {
        const atkName = last.message.split(' uses ')[0] || last.message.split('!')[0];
        const unit = combatEngine.allUnits.find(u => atkName.includes(u.name));
        if (unit) {
          const color = KINGDOMS[unit.kingdom]?.color ? parseInt(KINGDOMS[unit.kingdom].color.replace('#', '0x')) : 0xf1c40f;
          combat3d.playSpecial(unit.name, color);
          combat3d.shakeCamera(10, 300);
          combat3d.crowdReact('roar');
          this.fxStinger('special');
        }
      } else if (last.type === 'heal') {
        const name = last.message.split(' recovered')[0];
        combat3d.playHeal(name);
      } else if (last.type === 'info' && last.message.includes('guard')) {
        const name = last.message.split(' raises')[0];
        combat3d.playDefend(name);
      } else if (last.type === 'damage' && last.message.includes('fallen')) {
        const name = last.message.split(' has fallen')[0];
        combat3d.playDeath(name);
        if (enemyTeam.find(u => u.name === name)) { combat3d.crowdReact('roar'); this.fxStinger('kill'); }
        else { combat3d.crowdReact('groan'); this.fxStinger('hurt'); }
      }
  }

  combatAction(action) {
    if (!combat.isPlayerTurn || combat.combatEnded) return;
    this.hideBattleItem();

    if (action === 'item') {
      const usable = this.battleConsumables();
      if (!usable.length) { this.setTurnCall('No usable items in your satchel.', 'hint'); return; }
      const box = document.getElementById('item-select');
      if (box) {
        box.style.display = 'block';
        box.innerHTML = `
          <div class="item-picker">
            <div class="item-picker-title">Choose from your satchel, it uses this turn.</div>
            <div class="item-picker-list">
              ${usable.map(u => `<button class="combat-item-btn" onclick="game.useBattleItem('${u.id}')">${u.icon} ${u.name} <span class="item-count">x${u.count}</span></button>`).join('')}
            </div>
            <button class="btn btn-small" onclick="game.cancelBattleItem()">Close</button>
          </div>`;
      }
      return;
    }

    this.pendingAction = action;
    this.clearTargeting();

    if (action === 'defend' || action === 'heal') {
      combat.playerAction(action, 0);
      this.updateCombatUI();
      return;
    }

    document.querySelectorAll('.unit-plate.foe').forEach(p => p.classList.add('targeting'));
    this.setTurnCall('CHOOSE A TARGET', 'hint');
    const targetContainer = document.getElementById('target-select');
    targetContainer.style.display = 'none';
    targetContainer.innerHTML = '';
  }

  battleConsumables() {
    const has = [];
    Object.values(ITEMS).forEach(item => {
      if (!item.effect || (item.effect.type !== 'heal' && item.effect.type !== 'energy' && item.effect.type !== 'revive')) return;
      const count = this.state.inventory[item.id] || 0;
      if (count > 0) has.push({ ...item, count });
    });
    return has;
  }

  useBattleItem(id) {
    const item = ITEMS[id];
    if (!item || !combat || combat.combatEnded || !combat.isPlayerTurn) return;
    if (!item.effect || (item.effect.type !== 'heal' && item.effect.type !== 'energy' && item.effect.type !== 'revive')) return;
    if (item.effect.type === 'revive' && !combat.playerTeam.some(u => !u.alive)) return;
    const count = this.state.inventory[id] || 0;
    if (count < 1) { this.hideBattleItem(); return; }
    this.state.inventory[id] = count - 1;
    if (this.state.inventory[id] <= 0) delete this.state.inventory[id];
    this.save();
    this.hideBattleItem();
    combat.useBattleItem(item);
    this.updateCombatUI();
  }

  hideBattleItem() {
    const box = document.getElementById('item-select');
    if (box) box.style.display = 'none';
  }

  cancelBattleItem() {
    this.hideBattleItem();
  }

  plateTarget(el) {
    if (!el.classList.contains('targeting')) return;
    const idx = parseInt(el.dataset.targetIdx, 10);
    this.selectTarget(idx);
  }

  selectTarget(index) {
    this.clearTargeting();
    document.getElementById('target-select').style.display = 'none';
    combat.playerAction(this.pendingAction, index);
    this.updateCombatUI();
  }

  clearTargeting() {
    document.querySelectorAll('.unit-plate.foe').forEach(p => p.classList.remove('targeting'));
  }

  setTurnCall(text, cls) {
    const el = document.getElementById('turn-call');
    if (!el) return;
    el.textContent = text;
    el.className = 'turn-call';
    if (cls) el.classList.add(cls);
    el.classList.add('show');
    clearTimeout(this._turnCallTimer);
    this._turnCallTimer = setTimeout(() => el.classList.remove('show'), cls === 'hint' ? 8000 : 2000);
  }

  hideTurnCall() {
    const el = document.getElementById('turn-call');
    if (!el) return;
    el.classList.remove('show');
    clearTimeout(this._turnCallTimer);
  }

  toggleCombatHelp() {
    const el = document.getElementById('combat-help');
    if (!el) return;
    el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
  }

  toggleCombatSpeed() {
    this.combatSpeed = this.combatSpeed === 1 ? 2 : 1;
    if (combat) combat.speed = this.combatSpeed;
    const btn = document.getElementById('combat-speed-btn');
    if (btn) btn.textContent = `Speed: ${this.combatSpeed}×`;
    this.setTurnCall(this.combatSpeed === 2 ? 'The Chronicle hurries its pages…' : 'The Chronicle breathes again.', 'hint');
  }

  updateCombatUI() {
    [...combat.playerTeam, ...combat.enemyTeam].forEach(unit => {
      const hpBar = document.querySelector(`[data-hp-bar="${unit.name}"]`);
      const hpText = document.querySelector(`[data-hp-text="${unit.name}"]`);
      const epText = document.querySelector(`[data-ep-text="${unit.name}"]`);
      const combatant = document.querySelector(`[data-unit-id="${unit.name}"]`);
      if (hpBar) {
        const pct = (unit.currentHp / unit.maxHp) * 100;
        hpBar.style.width = pct + '%';
        hpBar.classList.remove('low', 'medium');
        if (pct < 25) hpBar.classList.add('low');
        else if (pct < 60) hpBar.classList.add('medium');
      }
      if (hpText) hpText.textContent = `HP: ${unit.currentHp}/${unit.maxHp}`;
      if (epText) epText.textContent = `EP ${unit.energy}`;
      if (combatant) {
        combatant.classList.toggle('dead', !unit.alive);
        combatant.classList.toggle('active-turn', unit === combat.currentUnit && unit.isPlayer);
        combatant.classList.toggle('acting', unit === combat.currentUnit && !unit.isPlayer);
      }
    });

    const acting = combat.currentUnit;
    if (acting && !combat.combatEnded) {
      const playerActing = combat.playerTeam.includes(acting);
      if (combat.isPlayerTurn && playerActing) {
        this.setTurnCall(`YOUR TURN, ${acting.name}`, 'yours');
      } else if (!playerActing) {
        this.setTurnCall(`${acting.name} ACTS`, 'theirs');
      } else {
        this.hideTurnCall();
      }
    }
    this.clearTargeting();

    const actionsContainer = document.getElementById('combat-actions-container');
    if (actionsContainer) {
      const btns = actionsContainer.querySelectorAll('.combat-btn');
      btns.forEach(b => b.disabled = !combat.isPlayerTurn || combat.combatEnded);
    }
    if (!combat.isPlayerTurn) this.hideBattleItem();
  }

  showVictory() {
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const k = KINGDOMS[this.state.kingdom];
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${STORY.victory}</div>
        <div class="line" style="animation-delay:0.5s">${STORY.victoryMessages[this.state.kingdom]}</div>
      </div>
      <div class="story-continue" id="story-continue">${this.state.finalWar && !this.state.trueEnding ? 'Rally for the Final War...' : 'Continue to Deception Battle...'}</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      if (this.state.finalWar && !this.state.trueEnding) {
        this.showScreen('story');
        const c = document.getElementById('story-content');
        c.innerHTML = `
          <div class="story-text">
            <div class="line" style="animation-delay:0.1s">${STORY.finalWarIntro[2]}</div>
          </div>
          <div class="story-continue" id="story-continue">Rally the Kingdom</div>`;
        document.getElementById('story-continue').addEventListener('click', () => this.startFinalWarWave(this.state.finalWar.wave || 1));
      } else {
        this.startDeceptionBattle();
      }
    });
  }

  showCrowning() {
    const age = this.currentAge();
    const arch = ROLE_ARCHETYPES[(this.crownBoss && this.crownBoss.roleArchetype) || 'striker'];
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const cont = this.state.party.find(p => p.isPlayer) || this.state.party[0];
    const crownName = (cont ? cont.name : 'The Champion');
    const crownTitle = KING_OF_THE_AGE_TITLE.replace('{AGE}', this.ageName(age));
    this.fxStinger('crown');
    container.innerHTML = `
      <div class="coronation-stage">
        <div class="coronation-crowd"></div>
        <div class="coronation-lights"><div class="coronation-beam"></div></div>
        <div class="coronation-pauldron">
          <div class="coronation-crown">👑</div>
        </div>
        <div class="coronation-title">${crownTitle}</div>
        <div class="coronation-name">${crownName} of ${this.state.town}</div>
        <div class="coronation-motto">"${arch.name} who outgrew their own role"</div>
        <div class="coronation-crowd-note">${age.name} remembers this.</div>
        ${(this.crownBoss && this.crownBoss.mirrorName) ? `<div class="coronation-mirror">The ${this.crownBoss.mirrorName} of this Age: "${this.crownBoss.mirrorLesson}"</div>` : ''}
      </div>
      <div class="story-text">
        <div class="line" style="animation-delay:1.6s">The shadow of the King dissolves into the arena stone. The hum of ${ARENA_OF_VIRTUES.name} falls silent, then erupts.</div>
        <div class="line" style="animation-delay:2s">Every town of the age hears the bell. Every champion knows its meaning.</div>
        <div class="line" style="animation-delay:2.4s">${crownName} of ${this.state.town} is crowned. The Age has its King.</div>
      </div>
      <div class="story-continue" id="story-continue">Begin the Next Age</div>`;
    document.getElementById('story-continue').addEventListener('click', () => this.showCrownLaw());
  }

  // A King's first law, one royal boon that will shape the Age that follows.
  showCrownLaw() {
    const curIdx = AGES.findIndex(a => a.id === this.state.ageId);
    const nextAge = AGES[(curIdx + 1) % AGES.length];
    const k = KINGDOMS[this.state.kingdom];
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const hasLaw = this.state.crownBoons && this.state.crownBoons[nextAge.id];
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">Every King leaves a law behind. The judges of ${this.state.town} ask how your reign should echo into the next Age: <b>${this.ageName(nextAge)}</b>.</div>
        <div class="line" style="animation-delay:0.5s">${hasLaw ? 'The last law still stands over the coming Age.' : 'Choose the law that will rule the Age ahead.'}</div>
      </div>
      <div class="decree-grid">
        ${CROWN_BOONS.map(b => `
          <div class="decree-card ${hasLaw === b.id ? 'chosen' : ''}" onclick="game.chooseCrownBoon('${b.id}')" style="--dc:#f1c40f">
            <div class="decree-ico">${b.icon}</div>
            <div class="decree-name">${b.name}${hasLaw === b.id ? ' · Law' : ''}</div>
            <div class="decree-desc">${b.desc}</div>
          </div>`).join('')}
      </div>`;
  }

  chooseCrownBoon(id) {
    const curIdx = AGES.findIndex(a => a.id === this.state.ageId);
    const nextAge = AGES[(curIdx + 1) % AGES.length];
    this.state.crownBoons = this.state.crownBoons || {};
    this.state.crownBoons[nextAge.id] = id;
    this.state.codex = this.state.codex || {};
    this.state.codex.crown = true;
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const b = CROWN_BOONS.find(x => x.id === id);
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">The King's law is carved before the first stone of the new Age is laid:</div>
        <div class="line" style="animation-delay:0.5s"><b>${b.icon} ${b.name}</b>, "${b.desc}"</div>
      </div>
      <div class="story-continue" id="story-continue">Advance the Ages</div>`;
    document.getElementById('story-continue').addEventListener('click', () => this.advanceAge());
  }

  crownBoon(id) {
    const b = this.state.crownBoons && this.state.crownBoons[this.currentAge().id];
    if (!b) return 0;
    return b === id ? 1 : 0;
  }

  advanceAge() {
    const curIdx = AGES.findIndex(a => a.id === this.state.ageId);

    // Crowning the FINAL Age of a cycle opens the Final War, Deception's last siege.
    if (curIdx === AGES.length - 1 && !this.state.trueEnding) {
      this.state.finalWar = { wave: 1 };
      this.state.codex = Object.assign({}, this.state.codex, { zeroth: true, deception: true });
      const prevKing = this.state.party.find(p => p.isPlayer) || this.state.party[0];
      this.state.lastKing = prevKing ? { name: prevKing.name, archetype: prevKing.archetype } : null;
      this.save();
      this.showScreen('story');
      const container = document.getElementById('story-content');
      container.innerHTML = `
        <div class="story-text">
          <div class="line" style="animation-delay:0.1s">${STORY.finalWarIntro[0]}</div>
          <div class="line" style="animation-delay:0.5s">${STORY.finalWarIntro[1]}</div>
          <div class="line" style="animation-delay:1s">${STORY.finalWarIntro[2]}</div>
          <div class="line" style="animation-delay:1.5s;color:#c9a961">${STORY.finalWarZeroth}</div>
        </div>
        <div class="story-continue" id="story-continue">Rally the Kingdom</div>`;
      document.getElementById('story-continue').addEventListener('click', () => this.startFinalWarWave(1));
      return;
    }

    const nextAge = AGES[(curIdx + 1) % AGES.length];
    const prevKing = this.state.party.find(p => p.isPlayer) || this.state.party[0];
    this.state.ageId = nextAge.id;
    this.state.town = (nextAge.towns && nextAge.towns[this.state.kingdom]) || 'The Ring';
    this.state.kingOfAge = false;
    this.state.kingDefeated = false;
    this.state.year++;
    this.state.gold += 150;
    this.state.lastKing = prevKing ? { name: prevKing.name, archetype: prevKing.archetype } : null;
    this.state.lastKingLetter = KING_LETTERS[(this.state.crownWins || 0) % KING_LETTERS.length];
    this.state.questDoneAge = null;
    this.state.woundState = null;
    this.state.competitionWinsAge = 0;
    this.state.corruptionCrisisDoneAge = null;
    this.state.trophies.push({
      crowned: false,
      ageName: nextAge.name,
      year: this.state.year,
      title: 'The Age Reborn',
      note: `${this.state.town} was reborn in ${nextAge.name}.`,
      corruption: this.state.corruption
    });
    // The world starts naming the line, the legacy screen and the town both listen.
    const nn = this.dynastyNickname();
    this.state.dynastyTitles = this.state.dynastyTitles || [];
    this.state.dynastyTitles.push({ age: nextAge.name, year: this.state.year, title: nn.title, reason: nn.reason });
    const lastTrophy = this.state.trophies[this.state.trophies.length - 1];
    lastTrophy.note += ` The crowd already calls your line <b>${nn.title}</b>.`;

    // Corruption creeps with every passing Age, unless the Lion of Corruptions or Veil of Mercy holds it back.
    // In cycle 2+, the Eternal Cycle itself leaves a scar: Deception remembers the ages it has won.
    let creep = (this.state.cycle || 1) >= 2 ? 2 : 1;
    if (this.state.cycle >= 2) this.state.corruptionScar = true;
    if (this.legacyPerk('lion_corruption')) creep -= 1;
    if ((this.state.decrees[nextAge.id] || '') === 'veil_of_mercy') creep -= this.decreeTier('veil_of_mercy');
    if (this.crownBoon('the_veil')) creep -= 1;
    if (creep > 0) this.addCorruption(creep);

    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${nextAge.intro[0]}</div>
        <div class="line" style="animation-delay:0.5s">${nextAge.intro[1]}</div>
        <div class="line" style="animation-delay:1s">Your town is reborn as <b>${this.state.town}</b>. ${nextAge.arenaMotto}</div>
        <div class="line" style="animation-delay:1.4s">${this.corruptionWorldText()}</div>
        <div class="interlude">${this.deceptionInterlude()}</div>
      </div>
      <div class="story-continue" id="story-continue">Rejoin Your Town</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      if (!this.hasDecree()) {
        this.showDecree();
      } else {
        this.renderHub();
        this.showScreen('hub');
      }
    });
    this.save();
  }

  /* ---------- The Final War, Deception's last siege ---------- */
  startFinalWarWave(wave) {
    if (!this.state.finalWar) this.state.finalWar = { wave };
    this.state.finalWar.wave = wave;
    this.save();
    const mult = this.difficultyMult();
    const scaleEnemy = (e, over = 1) => {
      const stats = { hp: 60, atk: 40, def: 30, spd: 40, spAtk: 30 };
      Object.keys(e.stats || {}).forEach(s => stats[s] = Math.round(e.stats[s] * (1 + this.state.level * 0.14) * mult * over));
      return { ...e, stats, level: this.state.level };
    };
    let enemies;
    let waveText;
    if (wave === 1) {
      enemies = [scaleEnemy(DECEPTION_LIEUTENANTS.find(l => l.id === 'lust')),
        scaleEnemy(DECEPTION_LIEUTENANTS.find(l => l.id === 'greed')),
        scaleEnemy(DECEPTION_LIEUTENANTS.find(l => l.id === 'wrath'))];
      waveText = STORY.finalWarWave1;
    } else if (wave === 2) {
      enemies = [scaleEnemy(DECEPTION_LIEUTENANTS.find(l => l.id === 'lie')),
        scaleEnemy(DECEPTION_LIEUTENANTS.find(l => l.id === 'pride'))];
      // The families you refused to name come back in arms, the names you kept raise their own weapons.
      const wronged = this.state.wrongedFamilies || [];
      if (wronged.length) {
        const fam = wronged[0];
        const champion = scaleEnemy({
          id: 'wronged',
          name: `${fam.name}, the Wronged`,
          kingdom: this.state.kingdom,
          color: '#f39c12',
          epithet: 'back from the seat you set them at',
          stats: { hp: 260, atk: 92, def: 70, spd: 60, spAtk: 80 },
          signature: 'Accusation, strikes the champion who kept the silence; scales with every family you refused to name.'
        }, 1.15);
        champion.famName = fam.name;
        enemies.push(champion);
      } else {
        enemies.push(scaleEnemy(DECEPTION_LIEUTENANTS.find(l => l.id === 'envy')));
      }
      waveText = STORY.finalWarWave2;
    } else {
      enemies = [scaleEnemy(DECEPTION_LIEUTENANTS.find(l => l.id === 'sloth'), 1.2),
        scaleEnemy(DECEPTION_FINAL, 1.5)];
      // The rival your line has beaten by name comes for a last duel, the final war turns personal.
      const rival = this.bestRival();
      if (rival) {
        enemies.unshift(scaleEnemy(this.rivalFighter(rival), 1.1));
        this.state.rivalFacedFinal = { name: rival.name, grudge: rival.grudge };
      }
      waveText = STORY.finalWarWave3;
      // Let the Eighth wear the archive like a coat for the final unsheathing.
      const talker = enemies.find(e => e.id === 'deception');
      if (talker) talker.regretTaunt = this.deceptionTaunt();
    }
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const rivalLine = (wave === 3 && this.state.rivalFacedFinal)
      ? `<div class="line" style="animation-delay:0.65s;color:#d28a4a">And among them, uninvited by anyone but himself: <b>${this.state.rivalFacedFinal.name}</b>. They have lost <b>${this.state.rivalFacedFinal.grudge}</b> duel(s) to your line by name, and they came anyway. "Not for crowns," they say, rolling a shoulder. "For the score." This is the only duel tonight that is personal. Both of you know it.</div>`
      : '';
    const lieBanner = (wave === 1 && (this.state.namedLies || []).length)
      ? `<div class="line" style="animation-delay:0.8s;color:#a43232">Behind the first rank, the horde drags a banner between two torches, and the name on it is not a war-name. It is <b>${this.state.namedLies[this.state.namedLies.length - 1].name}</b>, the family your kept silence gave this town. The townsfolk who believed you walk behind it, uncertain, still hopeful. You do not look away.</div>`
      : '';
    const truthBanner = (wave === 1 && (this.state.truthDugOldLies || 0) > 0)
      ? `<div class="line" style="animation-delay:0.75s;color:#5aa77a">Between the torches, a second banner is unfurled, and it is your own honesty, held up like a wanted poster. "<b>THE LAMP THAT COST THE TOWN ITS FACE</b>", it reads, and the townsfolk who heard every one of the ${this.state.truthDugOldLies} costly truths drop their eyes. Deception does not need to forge your shame in this war. It is already signed with your name.</div>`
      : '';
    const wrongedLine = (wave === 2 && (this.state.wrongedFamilies || []).length)
      ? `<div class="line" style="animation-delay:0.75s;color:#f39c12">And at the center of the second rank, no longer a name on a banner but a person behind a shield: <b>${this.state.wrongedFamilies[0].name}, the Wronged</b>. They waited out the whole first wave to walk the field in daylight. They have brought the seat your line set them at. They are setting it in front of the war.</div>`
      : '';
    const partyStand = (wave === 3 && this.state.party.length > 1)
      ? (() => {
          const pw = this.partyVoice('stand');
          const loyal = this.trustedCompanions()[0];
          const loyalLine = loyal
            ? `<div class="line party-voice-line" style="animation-delay:1.05s">🛡️ <b>${loyal.name}</b> steps forward and waits, absolutely held, absolutely present, the way only someone who chose to stay twice can be. They do not raise a weapon in defense of the war. They speak once, to the dark: "You do not get to name them."</div>`
            : '';
          return (pw ? `<div class="line party-voice-line" style="animation-delay:1.15s">🗣️ <b>${pw.by}</b>, "${pw.line}"</div>` : '') + loyalLine;
        })()
      : '';
    const persuasion = wave === 3
      ? `<div class="line" style="animation-delay:0.9s;color:#b07bd8">The shadow in the almost-yours face speaks, and it is not threatening you. It is <i>selling</i>. "This is not my war," it says. "It is your reason finally speaking plain. Every crown you wore was a load-bearing lie. Every drop of gold, a scar you bought. Set the truth down, champion. You have carried it three Ages too long. Let me carry you. It is easier. It is what the Dead King chose. It is what every King chooses, once they have seen the lamp is cosmetic."</div>`
      : '';
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${waveText}</div>
        <div class="line" style="animation-delay:0.5s">${enemies.map(e => `<b style="color:#a43232">${e.name}</b>`).join(', ')} stand between you and the Eighth.</div>
        ${rivalLine}
        ${lieBanner}
        ${truthBanner}
        ${wrongedLine}
        ${partyStand}
        ${persuasion}
      </div>
      ${wave === 3 ? this.finalGatheringHTML() : ''}
      <div class="intel-cards">
        ${enemies.map(e => `
          <div class="intel-card" style="--ic:${e.color || '#a43232'}">
            <div class="intel-head"><span class="intel-ico">${e.avatar || '🌑'}</span><span class="intel-name">${e.name}</span></div>
            <div class="intel-sig">${e.signature || 'Fights as a shadow of the Eighth.'}</div>
          </div>`).join('')}
      </div>
      <div class="story-continue" id="story-continue">Take the field</div>`;
    document.getElementById('story-continue').addEventListener('click', () => this.startBattle(enemies, 'finalwar'));
  }

  showTrueEnding() {
    const cont = this.state.party.find(p => p.isPlayer) || this.state.party[0];
    const name = cont ? cont.name : 'Champion';
    const cycles = (this.state.cycle || 1) + 1;
    this.fxStinger('win');
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const mirrorWhole = this.state.mirrorWhole || (this.state.cycle || 1) >= 8;
    container.innerHTML = `
      <div class="true-end-stage">
        <div class="true-end-emblem">☀️</div>
        <div class="true-end-title">${mirrorWhole ? 'THE MIRROR IS WHOLE' : 'THE WAR IS OVER'}</div>
        <div class="true-end-name">${mirrorWhole ? 'Deception, the Eighth, remembers nothing, except that for one morning, the world kept a single story.' : 'Deception, the Eighth, remembers nothing. That is the wound none of them can heal.'}</div>
      </div>
      <div class="story-text">
        <div class="line" style="animation-delay:0.3s">${STORY.trueEnding[0]}</div>
        <div class="line" style="animation-delay:0.7s">${STORY.trueEnding[1]}</div>
        <div class="line" style="animation-delay:1.1s">${STORY.trueEnding[2].replace('{CYCLES}', cycles === 1 ? 'ONE CYCLE' : `${cycles} CYCLES`)}</div>
        ${mirrorWhole ? `<div class="line" style="animation-delay:1.35s;color:#f1c40f">You walked <b>eight</b> Ages' mirrors, and the <i>Mirror Made Whole</i> is no longer a shard in the archive, it is a person-shaped seam in the world, and the world bends around it the way a town bends around a beloved ghost. This is the completion the seeds of the other seven mirrors dreamed of.</div>` : ''}
        <div class="line" style="animation-delay:1.6s">The dynasty of <b>${name}</b>, ${this.state.dynasty || 0} heirs, ${this.state.crownWins || 0} crowns, ${this.state.year || 1} years, ${(this.state.trophies || []).length} trophies, is written into the archive of the world.</div>
        ${this.legacyReadbackHTML()}
      </div>
      ${this.finalGatheringHTML()}
      <div class="story-continue" id="story-continue">Approach the Mirror's Shards</div>`;
    document.getElementById('story-continue').addEventListener('click', () => this.showReforgeChoice());
  }

  // The True Ending reads the ledger back: what the line actually did, and what the archive says of it.
  legacyReadbackHTML() {
    const l = this.state.ledger || { truths: 0, lies: 0, shadows: 0 };
    const cont = this.state.party.find(p => p.isPlayer) || this.state.party[0];
    const heroName = cont ? cont.name : 'Champion';
    const nn = this.dynastyNickname();
    let verdict = '';
    if ((l.truths || 0) > (l.lies || 0) && (l.truths || 0) > (l.shadows || 0)) {
      verdict = 'You were the lamp, in the end, truth heavy on your shoulders, and carried anyway. The archive argues about whether the town loved you or feared you. Both books are inked, and both are yours.';
    } else if ((l.lies || 0) > 0 && (l.lies || 0) >= (l.truths || 0)) {
      verdict = 'You were the carrier, softer, kindlier, and the town thanked you by sleeping. The archive records the lies as kindnesses and the kindnesses as scars, and cannot decide which one you meant. It decides, finally, to keep both.';
    } else {
      verdict = 'You were neither lamp nor carrier, you were the road itself. The archive cannot decide if that was honesty or merely momentum. It decides the road, and closes the book warm.';
    }
    const shadowLine = (l.shadows || 0) > 0
      ? ` You did <b>${l.shadows}</b> errand(s) for the dead King who took Deception's deals, the plausible first steps of a long, comfortable descent. The deal never tripped you. That is what the shadow still regrets.`
      : ' You never shook hands with the dead King\'s bargain. Deception, unmade, is still quietly impressed.';
    const rivalLine = this.state.rivalFacedFinal
      ? ` The last name you beat in the Archive was <b>${this.state.rivalFacedFinal.name}</b>, ${this.state.rivalFacedFinal.grudge} duel(s) lost, and they still chose the final wave over the door. The chroniclers record it as defeat. The Mirror records it as the only honest fight of the war.`
      : '';
    const dealLine = (l.deals || 0) > 0
      ? ` You sat with the Empty Chair <b>${l.deals}</b> time(s), and ${this.state.temptationRefused ? `only refused it ${this.state.temptationRefused} time(s). ` : ''}The deal never consumed you, it merely priced you. The Mirror records that you knew the price and paid it in increments, which is the most human thing it has ever been asked to record.`
      : (this.state.temptationRefused || 0) > 0
        ? ` When the Empty Chair set a table before you, you stood up ${this.state.temptationRefused} time(s). The town has a festival for the exact year of it now. The Mirror kept the seat, empty, as a courtesy.`
        : '';
    const lieFamilies = (this.state.namedLies || []).length
      ? ` The lies you kept are not in this ledger as entries, they are in it as families: ${this.state.namedLies.map(n => `<b>${n.name}</b>, bred in the ${n.atAge}`).join(' · ')}. The books call them fiction. The town calls them neighbors.`
      : '';
    const buried = (this.state.burials || []).length
      ? ` Behind the hall, The Quiet Row holds <b>${this.state.burials.length}</b> name(s): ${this.state.burials.slice(-2).map(b => b.name).join(' and ')}. The town kept the grass short there all those years, even when nothing else was tidy.`
      : '';
    const teethLine = (this.state.truthDugOldLies || 0) > 0
      ? ` You told <b>${this.state.truthDugOldLies}</b> truth(s) that cost the town its own face, honesty that dug old lies up into the light and left the light paying. The archive records each one twice, once as courage and once as the shame that bought it.`
      : '';
    const dreamLine = (this.state.lieBoughtFuture || 0) > 0
      ? ` And <b>${this.state.lieBoughtFuture}</b> lie(s) bought a shred of the future outright, gold-soft, candle-lit, yours until the reckoning comes to collect. Deception calls it a mortgage. The Mirror calls it a window.`
      : '';
    const usurpLine = this.state.usurper
      ? ` In the end the crown sat on <b>${this.state.usurper.name}</b>'s head instead of your line's, ${this.state.usurper.atAge}, ${this.state.usurper.grudge} grudge(s) old. The chroniclers write usurpation. The town, more honestly, writes "the day the prices changed."`
      : '';
    const reclaimLine = (this.state.reclaimed || 0) > 0
      ? ` Your line took the crown back <b>${this.state.reclaimed}</b> time(s) by name. The archive calls that persistence. The vanity fair calls it the only loop in the book worth reading twice.`
      : '';
    const desertLine = (this.state.desertions || []).length
      ? ` And <b>${this.state.desertions.length}</b> companion(s) walked out into the dusk rather than stand where you stood: ${this.state.desertions.map(d => d.name).join(', ')}. The archive files them as losses. The dinner table files them as empty chairs, which is different.`
      : '';
    return `
      <div class="ledger-echo">
        <div class="ledger-title">What the archive records of ${heroName}</div>
        <div class="ledger-row"><b>${l.truths || 0}</b> truths told · <b>${l.lies || 0}</b> lies kept · <b>${l.shadows || 0}</b> shadow-errands for the dead King · <b>${l.deals || 0}</b> deal(s) struck at the Empty Chair</div>
        <div class="ledger-row ledger-verdict">${verdict}</div>
        <div class="ledger-row">${shadowLine}</div>${rivalLine}
        <div class="ledger-row">${dealLine}</div>${lieFamilies}
        <div class="ledger-row">${buried}</div>
        <div class="ledger-row">${teethLine}</div>${dreamLine}${desertLine}${usurpLine}${reclaimLine}
        <div class="ledger-row">And the world found a name for the line while it was busy: <b><span class="ledger-name">${nn.title}</span></b>, ${nn.reason}.</div>
      </div>`;
  }

  // The True Ending's deep choice, a King decides what the world becomes.
  showReforgeChoice() {
    const cont = this.state.party.find(p => p.isPlayer) || this.state.party[0];
    const name = cont ? cont.name : 'Champion';
    const l = this.state.ledger || { truths: 0, lies: 0, shadows: 0 };
    const truths = l.truths || 0;
    const earned = truths >= 2;
    // The Mirror only lets a mouth that told the truth reach for the whole truth.
    const reforgeCard = earned
      ? `<div class="reforge-card" onclick="game.startEternalAge(true)" style="--rf:#5aa77a">
          <div class="reforge-ico">🪞</div>
          <div class="reforge-name">Reforge the Mirror</div>
          <div class="reforge-desc">End the virtues' loneliness. Eight truths become one living, arguable truth, stitched, scarred, whole.</div>
          <div class="reforge-foot">The Age of the Thread</div>
        </div>`
      : `<div class="reforge-card reforge-locked" style="--rf:#5aa77a">
          <div class="reforge-ico">🪞 🔒</div>
          <div class="reforge-name">Reforge the Mirror, the shards will not fit</div>
          <div class="reforge-desc">The Mirror is blunt where you were kind. It will not be made whole by a mouth that kept its truths, not because it is cruel, but because it is honest, and you have not shown it the way.</div>
          <div class="reforge-foot">Tell the town what it almost knows. Earn <b>${Math.max(1, 2 - truths)}</b> more truth(s), <b>${truths}/2</b>, and the shards will remember how to fit.</div>
        </div>`;
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">The eight shards of the Mirror lie in a circle in the Arena dust. They lean toward one another like iron finding a magnet.</div>
        <div class="line" style="animation-delay:0.5s">A King may forge. A King may keep. Only the world dreams either way.</div>
      </div>
      <div class="reforge-grid">
        ${reforgeCard}
        <div class="reforge-card" onclick="game.startEternalAge(false)" style="--rf:#c0392b">
          <div class="reforge-ico">⚔️</div>
          <div class="reforge-name">Keep the Division</div>
          <div class="reforge-desc">Keep the crowns, the war-years, the bright sharp edges. The world stays divided, harder, truer to its edges.</div>
          <div class="reforge-foot">The Age of the Sharp</div>
        </div>
      </div>
      <p style="text-align:center;margin-top:14px;font-size:12px;opacity:.6">Your choice, ${name}, is carved into the next Age.</p>`;
  }

  // NG+, the world begins again, harder, wiser. Legacy perks and the dynasty endure.
  startEternalAge(reforged = false) {
    this.state.cycle = (this.state.cycle || 1) + 1;
    // Eight cycles make the Mirror whole in the world's ledger, even without the reforge.
    if ((this.state.cycle || 1) >= 8) this.state.mirrorWhole = true;
    this.state.eternalReforged = !!reforged;
    this.state.codex = Object.assign({}, this.state.codex, { mirror: true });
    this.state.ageId = AGES[0].id;
    this.state.town = (AGES[0].towns && AGES[0].towns[this.state.kingdom]) || 'The Ring';
    this.state.kingOfAge = false;
    this.state.kingDefeated = false;
    this.state.year++;
    this.state.gold += 250;
    this.state.lastKing = null;
    this.state.woundState = null;
    this.state.competitionWinsAge = 0;
    this.state.questDoneAge = null;
    this.state.finalWar = null;
    this.state.corruptionCrisisDoneAge = null;
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">${this.state.eternalReforged ? STORY.reforgeAnew : STORY.keepDivisionAnew}. ${STORY.eternalAnew}</div>
        <div class="line" style="animation-delay:0.5s">Difficulty has ascended: <b>+${Math.round((this.difficultyMult() - 1) * 100)}%</b> to all foes. The dynasty carries ${(this.state.legacyPerks || []).length} legacy perk(s) into the new dawn.</div>
      </div>
      <div class="story-continue" id="story-continue">Rejoin Your Town</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      if (!this.hasDecree()) this.showDecree();
      else { this.renderHub(); this.showScreen('hub'); }
    });
  }

  /* ---------- The Corruption Crisis, the town's own darkness ---------- */
  startCorruptionCrisis() {
    this.showScreen('story');
    const container = document.getElementById('story-content');
    const k = KINGDOMS[this.state.kingdom];
    container.innerHTML = `
      <div class="story-text">
        ${STORY.crisisIntro.map((l, i) => `<div class="line" style="animation-delay:${0.1 + i * 0.4}s">${l}</div>`).join('')}
      </div>
      <div class="crisis-choices">
        <div class="crisis-card" onclick="game.crisisBrawl()" style="--cc:#c0392b">
          <div class="crisis-ico">⚔️</div>
          <div class="crisis-name">Drive the shadow out</div>
          <div class="crisis-desc">Face the crack's own teeth. Win to purge corruption to 3, lose and the town feeds it instead.</div>
        </div>
        <div class="crisis-card" onclick="game.settleCrisisTribute()" style="--cc:#2d6b3f">
          <div class="crisis-ico">🪙</div>
          <div class="crisis-name">Pay the seers</div>
          <div class="crisis-desc">Give 150 gold to have the town's shadow bound for the Age. Corruption settles at 6.</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:22px">
        <button class="btn btn-small" onclick="game.corruptionCrisisDefer()" style="opacity:0.75">Leave it be (corruption stays)</button>
      </div>`;
  }

  crisisBrawl() {
    const lt = DECEPTION_LIEUTENANTS[(this.state.corruption - 1) % DECEPTION_LIEUTENANTS.length] || DECEPTION_LIEUTENANTS[0];
    const mult = this.difficultyMult();
    const stats = {};
    Object.keys(lt.stats).forEach(s => stats[s] = Math.round(lt.stats[s] * (1 + this.state.corruption * 0.12) * mult));
    const shadow = {
      ...lt,
      name: 'The Town\'s Own Shadow',
      epithet: 'the corruption has a face now',
      stats
    };
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">The crack in the town square opens, and the town's own face looks out of it.</div>
        <div class="line" style="animation-delay:0.5s">"${shadow.taunt}"</div>
      </div>
      <div class="story-continue" id="story-continue">Enter the crack</div>`;
    document.getElementById('story-continue').addEventListener('click', () => this.startBattle([shadow], 'crisis'));
  }

  settleCrisisTribute() {
    const cost = 150;
    const paid = Math.min(cost, this.state.gold);
    this.state.gold -= paid;
    this.state.corruption = 6;
    this.state.corruptionCrisisDoneAge = this.currentAge().id;
    this.save();
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">The seers take ${paid} gold and unroll a net of amber thread over the crack.</div>
        <div class="line" style="animation-delay:0.5s">Corruption settles at 6. The town sleeps the rest of the Age with bedclothes pulled over its eyes.</div>
      </div>
      <div class="story-continue" id="story-continue">Return to the Hall</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      this.renderHub();
      this.showScreen('hub');
    });
  }

  corruptionCrisisDefer() {
    this.showScreen('story');
    const container = document.getElementById('story-content');
    container.innerHTML = `
      <div class="story-text">
        <div class="line" style="animation-delay:0.1s">The town does not have a good night. But nothing in the world ever happened because someone refused to look.</div>
      </div>
      <div class="story-continue" id="story-continue">Return to the Hall</div>`;
    document.getElementById('story-continue').addEventListener('click', () => {
      this.renderHub();
      this.showScreen('hub');
    });
  }

  startDeceptionBattle() {
    const enemies = DECEPTION_ARMY.slice(0, 3).map(e => ({
      ...e, stats: { ...e.stats }
    }));
    const lt = this.masterLieutenant();
    if (lt) {
      enemies[1] = { ...lt, stats: { ...lt.stats } };
    }
    // A personal rival, someone your dynasty has beaten by name before, demands the field.
    const rival = this.bestRival();
    if (rival) {
      enemies[0] = this.rivalFighter(rival);
    }
    // Deception escalates with every year, every crown, every Eternal Cycle.
    const scale = this.state.level * 0.15 + (this.state.year || 1) * 0.01 + (this.state.crownWins || 0) * 0.06 + (this.state.cycle > 1 ? (this.state.cycle - 1) * 0.18 : 0);
    enemies.forEach(e => {
      Object.keys(e.stats).forEach(s => e.stats[s] = Math.round(e.stats[s] * (1 + scale)));
    });
    // Deception has been reading your ledger all along, let it say so at the top of the year's war.
    const tauntCarrier = enemies.find(e => !e.isRival) || enemies[0];
    if (tauntCarrier) tauntCarrier.regretTaunt = this.deceptionTaunt();

    this.showScreen('combat');
    this.renderCombat(enemies, 'deception');
    const origOnEnd = combat.onCombatEnd;
    combat.onCombatEnd = (winner, playerTeam, enemyTeam) => {
      origOnEnd(winner, playerTeam, enemyTeam);
      if (winner === 'player') {
        setTimeout(() => {
          this.state.year++;
          this.state.gold += 200;
          this.showScreen('story');
          const container = document.getElementById('story-content');
          container.innerHTML = `
            <div class="story-text">
              <div class="line" style="animation-delay:0.1s">DECEPTION DEFEATED! The horde scatters!</div>
              <div class="line" style="animation-delay:0.5s">You have protected Warfare for another year. But they will return...</div>
              <div class="line" style="animation-delay:1s">Year ${this.state.year} begins. The cycle continues.</div>
            </div>
            <div class="story-continue" id="story-continue">Return to Hub</div>`;
          document.getElementById('story-continue').addEventListener('click', () => {
            this.renderHub();
            this.showScreen('hub');
          });
        }, 500);
      }
      this.save();
    };
  }
}

const game = new Game();
document.addEventListener('DOMContentLoaded', () => game.init());
