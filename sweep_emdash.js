const fs = require('fs');
const path = require('path');
const root = __dirname;
const targets = [
  'index.html', 'css/style.css',
  'js/combat.js', 'js/data.js', 'js/game.js', 'js/kingdomFlyover.js',
  'js/storyCinematic3D.js', 'js/storyScenes.js', 'js/titleCinematic.js',
  'js/ui.js', 'js/combat3d.js', 'test-combat.js', 'test-hub.js'
];
let total = 0;
const counts = {};
for (const f of targets) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { console.log('missing', f); continue; }
  let src = fs.readFileSync(p, 'utf8');
  const before = (src.match(/—/g) || []).length;
  const en = (src.match(/[–]/g) || []).length;
  if (!before && !en) continue;
  let out = src.replace(/ — /g, ', ').replace(/(—|\u2013)+/g, '-');
  fs.writeFileSync(p, out);
  counts[f] = { em: before, en, remaining: (out.match(/—/g) || []).length };
  total += before + en;
}
for (const k of Object.keys(counts)) console.log(k, JSON.stringify(counts[k]));
console.log('total dashes swept:', total);