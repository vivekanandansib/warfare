# WARFARE, The Battle of Virtues

A single-player arena-building fantasy RPG about kingdoms, Ages, deception, and the crown of the Age. You build a town, forge a party of champions, win the Competition, hunt for relics, face the Eighth, and take the crown before the era closes.

No build step, no dependencies, no framework. Plain HTML, CSS, and JavaScript that runs anywhere a static file server can reach.

## What you do

- Pick one of eight virtue kingdoms, each with its own champion classes, town, and arena motto.
- Recruit and train champions in the Champion Hall, equip them, and outgrow your role to unlock skill points.
- Fight in the Arena. Momentum rewards an unbroken chain of strikes; an unblocked hit resets it. Build EP for focus and specials, or get punished.
- Win the Competition across three rounds. Bookkeepers offer wagers before every round. Round 3 is the Hunt: choose a fresh-handed relic carrier, maybe take the false lead, then fight the saboteur and the rival champion who guards their own relic.
- Deal with the town wound, face Deception, the Eighth, and then the Crown Trial before the Age can turn.
- Become King of the Age and leave a Royal Law behind. In the final Age of a cycle, crowning opens the Final War instead of a new era.

## The Ages

Every game starts in a randomly chosen Age. Ages change the town, the omen, the decrees, and the arena motto.

- The Age of Verdant Fire: the founding year, towns rise in the blast-shadow of the Arena.
- The Age of the Cracked Mirror: the Mirror broke, and a shadow sits between the towns.
- The Age of the Quiet King: the last King dreams under the Arena, and the final boss is yourself, perfected.

## Run it

The game is fully static. Serve the folder and open `index.html`.

```sh
# from the project root
python -m http.server 8126
# then open http://127.0.0.1:8126/index.html
```

Any static server works, including GitHub Pages, `npx serve`, or a simple `php -S`.

## How the code is organized

```
index.html            Single entry point and screen container
css/style.css         All game styling
js/data.js            Kingdoms, ages, relics, decrees, items, foes, story text
js/game.js            Core engine: state, screens, competition, hunt, crown, ages
js/combat.js          Turn-based combat engine with momentum
js/ui.js              Shared UI helpers and rendering
js/combat3d.js        Optional 3D stage for battles
js/storyScenes.js     Story and cinematic scene helpers
js/storyCinematic3D.js
js/titleCinematic.js
js/kingdomFlyover.js  Realtime kingdom flyover view
assets/kingdoms/      Per kingdom artwork
```

## Test suites

Two vm-based suites run without a browser. They exercise the game code in a sandboxed DOM.

```sh
node test-hub.js      # hub, shop, recruit, intel, inventory, combat render
node test-combat.js   # combat engine rules and flow
```

`test-combat.html` loads the combat suite in a real browser page if you prefer.

## Notes

- Progress saves to your browser's localStorage.
- The game grows its own law: the crown boon you choose first is the law that stands over the coming Age.