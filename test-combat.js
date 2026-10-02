const fs = require('fs');
const vm = require('vm');

const noop = () => {};
const fakeStyle = new Proxy({}, { get: () => noop });
const fakeEl = {
  style: fakeStyle,
  textContent: '', className: '',
  getContext: () => ({ clearRect: noop, beginPath: noop, fill: noop, arc: noop, fillRect: noop, canvas: { width: 0, height: 0 } }),
  width: 0, height: 0,
  addEventListener: noop,
  classList: { add: noop, remove: noop, toggle: noop },
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 50 }),
  appendChild: noop,
  remove: noop,
  insertBefore: noop,
  setAttribute: noop,
  getAttribute: () => null,
  parentElement: null,
  children: [],
  innerHTML: '',
  dataset: {}
};

const files = [
  'js/data.js',
  'js/ui.js',
  'js/combat.js'
];

const code = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const sandbox = {
  console, require, module: { exports: {} }, global,
  document: {
    createElement: () => ({ ...fakeEl }),
    getElementById: () => fakeEl,
    body: { appendChild: noop },
    querySelector: () => null,
    querySelectorAll: () => []
  },
  window: { innerWidth: 800, innerHeight: 600, addEventListener: noop },
  setTimeout: (fn) => { fn(); return 0; },
  setInterval: noop,
  requestAnimationFrame: noop,
  Image: noop
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

// class declarations in vm context aren't on sandbox, extract via eval
const KINGDOMS = vm.runInContext('KINGDOMS', sandbox);
const CombatEngine = vm.runInContext('CombatEngine', sandbox);

let passed = 0;
let failed = 0;

function log(msg) { console.log(msg); }
function assert(cond, msg) {
  if (cond) { passed++; log(`  PASS: ${msg}`); }
  else      { failed++; log(`  FAIL: ${msg}`); }
}

function makeUnit(name, kingdom, stats) {
  return { name, kingdom, class: 'Warrior', level: 1, stats: { ...stats } };
}

function freshCombat(players, enemies) {
  const c = new CombatEngine();
  // Override startTurn to avoid async enemyAI, we drive turns manually
  c.startTurn = function() {
    this.turn++;
    const alive = this.allUnits.filter(u => u.alive);
    if (alive.length === 0) { this.endCombat('draw'); return; }
    if (this.playerTeam.filter(u => u.alive).length === 0) { this.endCombat('enemy'); return; }
    if (this.enemyTeam.filter(u => u.alive).length === 0) { this.endCombat('player'); return; }
    const fastest = alive.sort((a, b) => this.getEffectiveStat(b, 'spd') - this.getEffectiveStat(a, 'spd'))[0];
    this.currentUnit = fastest;
    this.processBuffs(fastest);
    this.isPlayerTurn = fastest.isPlayer;
    if (this.onTurnUpdate) this.onTurnUpdate(fastest);
  };
  c.onLogUpdate = () => {};
  c.onCombatEnd = () => {};
  c.initCombat(players, enemies, { type: 'test' });
  return c;
}

const P = { hp: 100, atk: 20, def: 15, spAtk: 25, spd: 30 };
const E = { hp: 80,  atk: 18, def: 10, spAtk: 15, spd: 20 };

// ============================================================
log('\n=== TEST 1: initCombat sets up teams correctly ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  assert(c.playerTeam.length === 1, 'playerTeam has 1 member');
  assert(c.enemyTeam.length === 1, 'enemyTeam has 1 member');
  assert(c.playerTeam[0].currentHp === 100, 'player currentHp = 100');
  assert(c.playerTeam[0].maxHp === 100, 'player maxHp = 100');
  assert(c.playerTeam[0].energy === 100, 'player energy = 100');
  assert(c.playerTeam[0].alive === true, 'player alive = true');
  assert(c.playerTeam[0].isPlayer === true, 'player isPlayer = true');
  assert(c.enemyTeam[0].isPlayer === false, 'enemy isPlayer = false');
  assert(c.turn === 1, 'turn starts at 1');
}

// ============================================================
log('\n=== TEST 2: playerAction, attack deals damage ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  const hpBefore = c.enemyTeam[0].currentHp;
  c.playerAction('attack', 0);
  assert(c.enemyTeam[0].currentHp < hpBefore, `enemy hp dropped: ${hpBefore} -> ${c.enemyTeam[0].currentHp}`);
  assert(c.log.some(l => l.message.includes('Goblin') || l.message.includes('CRITICAL')), 'log contains Goblin reference or crit');
}

// ============================================================
log('\n=== TEST 3: playerAction, defend gives shield + energy ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  const hero = c.playerTeam[0];
  hero.energy = 50;
  c.playerAction('defend', 0);
  assert(hero.shield > 0, `shield gained: ${hero.shield}`);
  assert(hero.energy === 80, `energy recovered: ${hero.energy} (20 defend + 10 passive = 80)`);
  assert(c.log.some(l => l.message.includes('guard')), 'log mentions guard');
}

// ============================================================
log('\n=== TEST 4: playerAction, heal restores ally HP ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  const hero = c.playerTeam[0];
  hero.currentHp = 40;
  const hpBefore = hero.currentHp;
  c.playerAction('heal', 0);
  assert(hero.currentHp > hpBefore, `hp restored: ${hpBefore} -> ${hero.currentHp}`);
  assert(hero.energy === 85, `energy cost: ${hero.energy} (100 - 25 heal + 10 passive = 85)`);
  assert(c.log.some(l => l.message.includes('recovered')), 'log mentions recovered');
}

// ============================================================
log('\n=== TEST 5: playerAction, heal with no energy falls back to attack ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  const hero = c.playerTeam[0];
  hero.currentHp = 40;
  hero.energy = 0;
  const enemyHpBefore = c.enemyTeam[0].currentHp;
  c.playerAction('heal', 0);
  assert(c.enemyTeam[0].currentHp < enemyHpBefore, `enemy took fallback damage: ${enemyHpBefore} -> ${c.enemyTeam[0].currentHp}`);
  assert(c.log.some(l => l.message.includes('Not enough energy')), 'log mentions not enough energy');
}

// ============================================================
log('\n=== TEST 6: playerAction, heal when full HP falls back to attack ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  const enemyHpBefore = c.enemyTeam[0].currentHp;
  c.playerAction('heal', 0);
  assert(c.enemyTeam[0].currentHp < enemyHpBefore, `enemy took fallback damage: ${enemyHpBefore} -> ${c.enemyTeam[0].currentHp}`);
  assert(c.log.some(l => l.message.includes('No allies need healing')), 'log mentions no allies need healing');
}

// ============================================================
log('\n=== TEST 7: playerAction, special uses energy and executes ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  const hero = c.playerTeam[0];
  const enemyHpBefore = c.enemyTeam[0].currentHp;
  c.playerAction('special', 0);
  assert(hero.energy < 100, `energy consumed: ${hero.energy}`);
  assert(c.enemyTeam[0].currentHp < enemyHpBefore, `enemy took special damage: ${enemyHpBefore} -> ${c.enemyTeam[0].currentHp}`);
  assert(c.log.some(l => l.type === 'special'), 'log has special type entry');
}

// ============================================================
log('\n=== TEST 8: playerAction, special with no energy falls back to attack ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  c.playerTeam[0].energy = 0;
  const enemyHpBefore = c.enemyTeam[0].currentHp;
  c.playerAction('special', 0);
  assert(c.enemyTeam[0].currentHp < enemyHpBefore, `enemy took fallback damage: ${enemyHpBefore} -> ${c.enemyTeam[0].currentHp}`);
  assert(c.log.some(l => l.message.includes('Not enough energy')), 'log mentions not enough energy');
}

// ============================================================
log('\n=== TEST 9: playerAction, blocked when not player turn ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  c.isPlayerTurn = false;
  const hpBefore = c.enemyTeam[0].currentHp;
  c.playerAction('attack', 0);
  assert(c.enemyTeam[0].currentHp === hpBefore, 'no damage dealt when not player turn');
}

// ============================================================
log('\n=== TEST 10: playerAction, blocked when combat ended ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  c.combatEnded = true;
  const hpBefore = c.enemyTeam[0].currentHp;
  c.playerAction('attack', 0);
  assert(c.enemyTeam[0].currentHp === hpBefore, 'no damage dealt when combat ended');
}

// ============================================================
log('\n=== TEST 11: attack, invalid target index does nothing ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  c.playerAction('attack', 99);
  assert(c.isPlayerTurn === true, 'isPlayerTurn restored to true on invalid target');
  assert(c.playerTeam[0].energy === 100, 'energy unchanged on invalid target');
}

// ============================================================
log('\n=== TEST 12: special, invalid target index does nothing ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  c.playerAction('special', 99);
  assert(c.isPlayerTurn === true, 'isPlayerTurn restored to true on invalid target');
  assert(c.playerTeam[0].energy === 100, 'energy unchanged on invalid target');
}

// ============================================================
log('\n=== TEST 13: attack, dead target does nothing ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  c.enemyTeam[0].alive = false;
  c.enemyTeam[0].currentHp = 0;
  c.playerAction('attack', 0);
  assert(c.isPlayerTurn === true, 'isPlayerTurn restored to true on dead target');
}

// ============================================================
log('\n=== TEST 14: attack, shield absorbs damage ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  c.enemyTeam[0].shield = 999;
  const hpBefore = c.enemyTeam[0].currentHp;
  c.playerAction('attack', 0);
  assert(c.enemyTeam[0].currentHp === hpBefore, `enemy HP unchanged: ${c.enemyTeam[0].currentHp}`);
  assert(c.log.some(l => l.message.includes('shield')), 'log mentions shield');
}

// ============================================================
log('\n=== TEST 15: multiple party, fastest goes first ===');
{
  const c = freshCombat(
    [makeUnit('A', 'valor', { ...P, spd: 50 }, true),
     makeUnit('B', 'altruism', { ...P, spd: 10 }, true)],
    [makeUnit('E', 'lust', E, false)]
  );
  assert(c.currentUnit.name === 'A', `fastest unit goes first: ${c.currentUnit.name}`);
}

// ============================================================
log('\n=== TEST 16: kill enemy, combat end detected ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', { ...E, hp: 1 }, false)]);
  c.enemyTeam[0].currentHp = 1;
  let endResult = null;
  c.onCombatEnd = (winner) => { endResult = winner; };
  c.playerAction('attack', 0);
  assert(c.enemyTeam[0].alive === false, 'enemy is dead');
  assert(endResult === 'player', `combat ended with player win: ${endResult}`);
}

// ============================================================
log('\n=== TEST 17: defend, shield blocks subsequent damage ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  c.playerAction('defend', 0);
  const hero = c.playerTeam[0];
  const shieldBefore = hero.shield;
  assert(shieldBefore > 0, `shield applied: ${shieldBefore}`);
  const damage = c.calculateDamage(c.enemyTeam[0], hero);
  c.applyDamage(hero, damage, c.enemyTeam[0]);
  assert(hero.shield < shieldBefore || hero.currentHp === hero.maxHp,
    `shield absorbed some (shield: ${hero.shield}, hp: ${hero.currentHp})`);
}

// ============================================================
log('\n=== TEST 18: heal, targets weakest ally ===');
{
  const c = freshCombat(
    [makeUnit('A', 'valor', { ...P, spd: 50 }, true),
     makeUnit('B', 'altruism', { ...P, spd: 10 }, true)],
    [makeUnit('E', 'lust', E, false)]
  );
  c.playerTeam[0].currentHp = 30;
  c.playerTeam[1].currentHp = 80;
  c.currentUnit = c.playerTeam[0];
  c.isPlayerTurn = true;
  c.playerAction('heal', 0);
  assert(c.playerTeam[0].currentHp > 30, `weakest ally A healed: ${c.playerTeam[0].currentHp}`);
  assert(c.playerTeam[1].currentHp === 80, `stronger ally B unchanged: ${c.playerTeam[1].currentHp}`);
}

// ============================================================
log('\n=== TEST 19: energy gain after attack ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  c.playerTeam[0].energy = 0;
  c.playerAction('attack', 0);
  assert(c.playerTeam[0].energy === 10, `energy after attack: ${c.playerTeam[0].energy}`);
}

// ============================================================
log('\n=== TEST 20: energy after defend (20 action + 10 passive) ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  c.playerTeam[0].energy = 30;
  c.playerAction('defend', 0);
  assert(c.playerTeam[0].energy === 60, `energy after defend: ${c.playerTeam[0].energy}`);
}

// ============================================================
log('\n=== TEST 21: heal energy cap at maxEnergy ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  c.playerTeam[0].currentHp = 50;
  c.playerTeam[0].energy = 95;
  c.playerAction('heal', 0);
  // heal costs 25 then +10 passive = 80. 95-25+10 = 80, not over max
  assert(c.playerTeam[0].energy <= 100, `energy capped: ${c.playerTeam[0].energy}`);
}

// ============================================================
log('\n=== TEST 22: attack morale shift ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  const moraleBefore = { ...c.morale };
  c.playerAction('attack', 0);
  assert(c.morale.player === 100, `player morale at max: ${c.morale.player}`);
  assert(c.morale.enemy < moraleBefore.enemy, `enemy morale down: ${c.morale.enemy}`);
}

// ============================================================
log('\n=== TEST 23: executeSpecial, Valor special deals heavy damage ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  const hero = c.playerTeam[0];
  const enemyHpBefore = c.enemyTeam[0].currentHp;
  c.executeSpecial(hero, c.enemyTeam[0]);
  assert(c.enemyTeam[0].currentHp < enemyHpBefore, `Valor special dealt damage: ${enemyHpBefore} -> ${c.enemyTeam[0].currentHp}`);
  assert(c.log.some(l => l.message.includes('War Cry')), 'log mentions War Cry (Valor special)');
}

// ============================================================
log('\n=== TEST 24: executeSpecial, Altruism special heals allies ===');
{
  const c = freshCombat(
    [makeUnit('A', 'altruism', { ...P, spd: 50 }, true),
     makeUnit('B', 'valor', { ...P, spd: 10 }, true)],
    [makeUnit('E', 'lust', E, false)]
  );
  c.playerTeam[1].currentHp = 30;
  const hpBefore = c.playerTeam[1].currentHp;
  c.executeSpecial(c.playerTeam[0], c.enemyTeam[0]);
  assert(c.playerTeam[1].currentHp > hpBefore, `ally healed by Altruism: ${hpBefore} -> ${c.playerTeam[1].currentHp}`);
}

// ============================================================
log('\n=== TEST 25: enemyAI, attacks a player ===');
{
  const c = freshCombat([makeUnit('Hero', 'valor', P)], [makeUnit('Goblin', 'lust', E)]);
  const heroHpBefore = c.playerTeam[0].currentHp;
  c.enemyAI(c.enemyTeam[0]);
  assert(c.playerTeam[0].currentHp < heroHpBefore || c.playerTeam[0].shield > 0,
    `enemy acted: hp=${c.playerTeam[0].currentHp}, shield=${c.playerTeam[0].shield}`);
}

// ============================================================
log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
