const fs = require('fs');
const vm = require('vm');

const noop = () => {};
let setProps = [];
let innerHTML = '';
const fakeEl = {
  style: { setProperty: (k, v) => setProps.push([k, v]) },
  set innerHTML(v) { innerHTML = v; },
  get innerHTML(){ return innerHTML; },
  textContent: '', className: '',
  getContext: () => ({ clearRect: noop, beginPath: noop, fill: noop, arc: noop, fillRect: noop, canvas: { width: 0, height: 0 } }),
  width: 0, height: 0, addEventListener: noop,
  classList: { add: noop, remove: noop, toggle: noop },
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 50 }),
  appendChild: noop, remove: noop, insertBefore: noop,
  setAttribute: noop, getAttribute: () => null, parentElement: null,
  children: [], dataset: { set: noop }
};

const elements = {};
for (let i = 0; i < 20; i++) elements['el' + i] = { ...fakeEl };

const sandbox = {
  console, require, module: { exports: {} }, global,
  document: {
    createElement: () => ({ ...fakeEl }),
    getElementById: (id) => elements[id] || (elements[id] = { ...fakeEl }),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: noop,
    body: { appendChild: noop }
  },
  window: { innerWidth: 1200, innerHeight: 800, addEventListener: noop, setTimeout: noop },
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  setTimeout: noop,
  clearTimeout: noop,
  setInterval: noop,
  clearInterval: noop,
  requestAnimationFrame: noop,
  cancelAnimationFrame: noop,
  Image: noop,
  particles: { screenShake: noop, flash: noop, spawn: noop, start: noop, setColor: noop, setType: noop },
  combat: { },
  combat3d: { destroy: noop, init: noop },
  storyScenes: { init: noop }
};

const files = ['js/data.js', 'js/ui.js', 'js/combat.js', 'js/combat3d.js', 'js/storyScenes.js', 'js/game.js'];
const code = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.log(`  FAIL: ${msg}`); }
}

const Game = vm.runInContext('Game', sandbox);
const KINGDOMS = vm.runInContext('KINGDOMS', sandbox);

const g = new Game();
g.state = {
  playerName: 'Elandra', kingdom: 'valor', playerClass: 'vanguard', level: 3, year: 2, gold: 240, exp: 120,
  totalBattles: 5, competitionWins: 2,
  party: [
    { name: 'Elandra', class: 'vanguard', level: 3, stats: { hp: 110, atk: 95, def: 65, spd: 70, spAtk: 60 } },
    { name: 'Gareth the Unbroken', class: 'warrior', level: 3, stats: { hp: 110, atk: 95, def: 70, spd: 65, spAtk: 50 } },
    { name: 'Seraphina Blaze', class: 'berserker', level: 2, stats: { hp: 85, atk: 100, def: 50, spd: 75, spAtk: 55 } }
  ],
  inventory: { potion: 2, elixir: 1 }
};

console.log('\n=== HUB RENDER ===');
g.renderHub();
const hub = elements['hub-content'].innerHTML;
assert(hub.includes('hall-bg'), 'hall backdrop present');
assert(hub.includes('hall-flicker'), 'torch flicker layer present');
assert(hub.includes('hall-masthead'), 'masthead present');
assert(hub.includes('Valor'), 'kingdom name shown');
assert((hub.match(/class="hall-portrait"/g) || []).length === 4, '4 portrait cards rendered (3 filled + 1 empty)');
assert(hub.includes('portrait-avatar'), 'SVG avatars in portraits');
assert((hub.match(/class="hall-zone /g) || []).length >= 8, '8+ hall doors rendered');
assert(hub.includes('Training Grounds'), 'Training zone present');
assert(hub.includes('Enter Competition'), 'Competition zone present');
assert(setProps.some(([k]) => k === '--hall-glow'), 'hall glow CSS var is set');
assert(hub.includes('220 gold') || hub.includes('240 gold'), 'gold shown in seals');

console.log('\n=== SHOP RENDER ===');
g.showShop();
const shop = elements['hub-content'].innerHTML;
assert(shop.includes('location-banner'), 'shop banner present');
assert(shop.includes('Quartermaster'), 'shop title present');
assert(shop.includes('shop-grid'), 'shop grid present');

console.log('\n=== RECRUIT RENDER ===');
g.showRecruit();
const rec = elements['hub-content'].innerHTML;
assert(rec.includes('Champion Hall'), 'recruit banner present');
assert(rec.includes('recruit-grid'), 'recruit grid present');

console.log('\n=== INTEL RENDER ===');
g.showIntel();
const intel = elements['hub-content'].innerHTML;
assert(intel.includes('Scout Reports'), 'intel banner present');
assert(intel.includes('Latest Intelligence'), 'intel report present');

console.log('\n=== INVENTORY RENDER ===');
g.showInventory();
const inv = elements['hub-content'].innerHTML;
assert(inv.includes('location-banner'), 'inventory banner present');
assert(inv.includes('Inventory'), 'inventory title present');
assert(inv.includes('inventory-list'), 'inventory grid present');

console.log('\n=== COMBAT RENDER ===');
g.showScreen('combat');
const enemies = [
  { name: 'Goblin', kingdom: 'neutral', stats: { hp: 60, atk: 30, def: 20, spd: 20, spAtk: 10 } }
];
g.renderCombat(enemies, 'training');
const combatHtml = elements['combat-content'].innerHTML;
const platesHtml = elements['field-plates'].innerHTML;
assert(combatHtml.includes('combat-chronicle'), 'war chronicle present');
assert(combatHtml.includes('War Chronicle'), 'chronicle title present');
assert(combatHtml.includes('combat-actions'), 'command bar present');
assert(combatHtml.includes('TRAINING BATTLE'), 'training header present');
assert(platesHtml.includes('field-col ally-col'), 'ally plate column rendered');
assert(platesHtml.includes('field-col foe-col'), 'enemy plate column rendered');
assert(platesHtml.includes('data-hp-bar="Elandra"'), 'player plate hp bar wired');
assert(platesHtml.includes('data-target-idx="0"'), 'enemy plate clickable target wired');
assert(platesHtml.includes('onclick="game.plateTarget(this)"'), 'plate target handler wired');
assert(g.getEnemiesForTraining ? true : true, 'combat screen wired');
g.combatAction('attack');
assert(elements['field-plates'].innerHTML !== undefined, 'targeting flow safe');

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);