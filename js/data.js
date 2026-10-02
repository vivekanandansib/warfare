const KINGDOMS = {
  altruism: {
    id: 'altruism',
    name: 'Altruism',
    motto: 'Heal the Broken',
    color: '#2ecc71',
    gradient: ['#27ae60', '#2ecc71', '#a8e6cf'],
    icon: '💚',
    emblem: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#27ae60"/><stop offset="100%" stop-color="#a8e6cf"/></linearGradient></defs><circle cx="50" cy="50" r="45" fill="none" stroke="url(#ag)" stroke-width="2.5" opacity="0.6"/><path d="M50 20 C50 20 30 35 30 50 C30 62 38 72 50 80 C62 72 70 62 70 50 C70 35 50 20 50 20Z" fill="url(#ag)" opacity="0.8"/><path d="M50 35 L50 60 M38 50 L62 50" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.9"/></svg>`,
    description: 'The healers and protectors of Warfare. Altruism believes that true strength comes from lifting others. Their armies fight not for conquest, but to shield the innocent.',
    specialty: 'Healing & Support',
    combatStyle: 'Sustain',
    stats: { hp: 90, atk: 65, def: 70, spd: 75, spAtk: 85 },
    bonusVs: 'scrupulous',
    weaknessVs: 'vigilant',
    specialMove: 'Mending Light',
    specialDesc: 'Restores HP to all allies and grants a shield for 2 turns',
    recruitable: [
      { name: 'Aria the Mender', class: 'healer', level: 3, stats: { hp: 80, atk: 40, def: 55, spd: 70, spAtk: 90 } },
      { name: 'Bramble Root', class: 'tank', level: 2, stats: { hp: 110, atk: 55, def: 85, spd: 45, spAtk: 40 } }
    ]
  },
  accord: {
    id: 'accord',
    name: 'Accord',
    motto: 'Unity in Purpose',
    color: '#3498db',
    gradient: ['#2980b9', '#3498db', '#a8d8ea'],
    icon: '💙',
    emblem: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="acg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2980b9"/><stop offset="100%" stop-color="#a8d8ea"/></linearGradient></defs><circle cx="50" cy="50" r="45" fill="none" stroke="url(#acg)" stroke-width="2.5" opacity="0.6"/><path d="M30 55 L42 45 L50 55 L58 45 L70 55" fill="none" stroke="url(#acg)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="30" cy="55" r="4" fill="#a8d8ea"/><circle cx="70" cy="55" r="4" fill="#2980b9"/><path d="M38 60 L50 70 L62 60" fill="none" stroke="url(#acg)" stroke-width="2" opacity="0.6"/></svg>`,
    description: 'The diplomats and master strategists. Accord turns enemies into allies through words alone. In battle, they exploit weaknesses with surgical precision.',
    specialty: 'Diplomacy & Strategy',
    combatStyle: 'Counter',
    stats: { hp: 85, atk: 70, def: 75, spd: 80, spAtk: 80 },
    bonusVs: 'valor',
    weaknessVs: 'rapport',
    specialMove: 'Seal of Alliance',
    specialDesc: 'Binds an enemy, preventing them from acting for 1 turn while boosting party attack',
    recruitable: [
      { name: 'Lyra the Silver Tongue', class: 'strategist', level: 3, stats: { hp: 75, atk: 60, def: 65, spd: 85, spAtk: 80 } },
      { name: 'Sentinel Kael', class: 'guardian', level: 2, stats: { hp: 100, atk: 50, def: 90, spd: 55, spAtk: 50 } }
    ]
  },
  rapport: {
    id: 'rapport',
    name: 'Rapport',
    motto: 'Bonds Unbroken',
    color: '#9b59b6',
    gradient: ['#8e44ad', '#9b59b6', '#d4a5ff'],
    icon: '💜',
    emblem: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8e44ad"/><stop offset="100%" stop-color="#d4a5ff"/></linearGradient></defs><circle cx="50" cy="50" r="45" fill="none" stroke="url(#rg)" stroke-width="2.5" opacity="0.6"/><ellipse cx="50" cy="48" rx="18" ry="12" fill="none" stroke="url(#rg)" stroke-width="2.5"/><circle cx="50" cy="48" r="5" fill="url(#rg)"/><path d="M32 48 L15 40" stroke="#8e44ad" stroke-width="1.5" opacity="0.5"/><path d="M68 48 L85 40" stroke="#d4a5ff" stroke-width="1.5" opacity="0.5"/><path d="M50 60 L50 78" stroke="url(#rg)" stroke-width="2" opacity="0.6"/><path d="M42 72 L50 78 L58 72" fill="none" stroke="url(#rg)" stroke-width="1.5" opacity="0.5"/></svg>`,
    description: 'The spies and intelligence network of Warfare. Rapport knows every secret, every weakness. Their bond-based warfare turns allies into an unstoppable network.',
    specialty: 'Intelligence & Debuffs',
    combatStyle: 'Stealth',
    stats: { hp: 75, atk: 75, def: 60, spd: 95, spAtk: 80 },
    bonusVs: 'accord',
    weaknessVs: 'spunk',
    specialMove: 'Shadow Web',
    specialDesc: 'Reveals all enemy weaknesses and applies a debuff reducing their defense by 30%',
    recruitable: [
      { name: 'Nyx the Whisper', class: 'rogue', level: 3, stats: { hp: 65, atk: 80, def: 50, spd: 95, spAtk: 70 } },
      { name: 'Echo the Mirror', class: 'assassin', level: 2, stats: { hp: 70, atk: 85, def: 45, spd: 90, spAtk: 65 } }
    ]
  },
  valor: {
    id: 'valor',
    name: 'Valor',
    motto: 'Fearless in Battle',
    color: '#e74c3c',
    gradient: ['#c0392b', '#e74c3c', '#ff6b6b'],
    icon: '❤️',
    emblem: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="vg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c0392b"/><stop offset="100%" stop-color="#ff6b6b"/></linearGradient></defs><circle cx="50" cy="50" r="45" fill="none" stroke="url(#vg)" stroke-width="2.5" opacity="0.6"/><path d="M50 22 L55 42 L75 42 L59 54 L65 74 L50 62 L35 74 L41 54 L25 42 L45 42Z" fill="url(#vg)" opacity="0.7"/><path d="M50 30 L53 42 L65 42 L55 50 L58 62 L50 55 L42 62 L45 50 L35 42 L47 42Z" fill="none" stroke="#fff" stroke-width="1" opacity="0.4"/></svg>`,
    description: 'The warriors and front-line berserkers. Valor charges headfirst into any battle. Their battle cries can turn the tide of any engagement.',
    specialty: 'Raw Damage & Aggression',
    combatStyle: 'Offense',
    stats: { hp: 100, atk: 95, def: 65, spd: 70, spAtk: 60 },
    bonusVs: 'spunk',
    weaknessVs: 'accord',
    specialMove: 'War Cry',
    specialDesc: 'Massive single-target damage with a chance to stun the enemy for 1 turn',
    recruitable: [
      { name: 'Gareth the Unbroken', class: 'warrior', level: 3, stats: { hp: 110, atk: 95, def: 70, spd: 65, spAtk: 50 } },
      { name: 'Seraphina Blaze', class: 'berserker', level: 2, stats: { hp: 85, atk: 100, def: 50, spd: 75, spAtk: 55 } }
    ]
  },
  clement: {
    id: 'clement',
    name: 'Clement',
    motto: 'Mercy is Strength',
    color: '#f1c40f',
    gradient: ['#f39c12', '#f1c40f', '#ffeaa7'],
    icon: '💛',
    emblem: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f39c12"/><stop offset="100%" stop-color="#ffeaa7"/></linearGradient></defs><circle cx="50" cy="50" r="45" fill="none" stroke="url(#cg)" stroke-width="2.5" opacity="0.6"/><line x1="50" y1="22" x2="50" y2="38" stroke="url(#cg)" stroke-width="2.5"/><line x1="25" y1="50" x2="75" y2="50" stroke="url(#cg)" stroke-width="2.5"/><path d="M25 50 L25 60 Q25 65 30 65 L42 65" fill="none" stroke="url(#cg)" stroke-width="2"/><path d="M75 50 L75 60 Q75 65 70 65 L58 65" fill="none" stroke="url(#cg)" stroke-width="2"/><circle cx="25" cy="62" r="3" fill="#f39c12"/><circle cx="75" cy="62" r="3" fill="#ffeaa7"/><line x1="45" y1="78" x2="55" y2="78" stroke="url(#cg)" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    description: 'The judges and peacekeepers. Clement wields mercy as a weapon, knowing when to show restraint and when to strike. Their balanced approach makes them unpredictable.',
    specialty: 'Balance & Judgment',
    combatStyle: 'Adaptive',
    stats: { hp: 90, atk: 75, def: 75, spd: 75, spAtk: 75 },
    bonusVs: 'vigilant',
    weaknessVs: 'scrupulous',
    specialMove: 'Judgment\'s Edge',
    specialDesc: 'Deals damage based on how much HP the enemy is missing, the weaker they are, the harder it hits',
    recruitable: [
      { name: 'Aurelius the Just', class: 'paladin', level: 3, stats: { hp: 95, atk: 75, def: 80, spd: 70, spAtk: 75 } },
      { name: 'Lady Tempest', class: 'cleric', level: 2, stats: { hp: 80, atk: 55, def: 70, spd: 80, spAtk: 85 } }
    ]
  },
  vigilant: {
    id: 'vigilant',
    name: 'Vigilant',
    motto: 'Eyes Never Close',
    color: '#95a5a6',
    gradient: ['#7f8c8d', '#95a5a6', '#bdc3c7'],
    icon: '🤍',
    emblem: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="vig" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7f8c8d"/><stop offset="100%" stop-color="#bdc3c7"/></linearGradient></defs><circle cx="50" cy="50" r="45" fill="none" stroke="url(#vig)" stroke-width="2.5" opacity="0.6"/><rect x="35" y="30" width="30" height="45" rx="2" fill="none" stroke="url(#vig)" stroke-width="2"/><rect x="30" y="25" width="40" height="8" rx="2" fill="url(#vig)" opacity="0.7"/><rect x="42" y="55" width="16" height="20" rx="1" fill="none" stroke="#bdc3c7" stroke-width="1.5"/><line x1="50" y1="33" x2="50" y2="50" stroke="#bdc3c7" stroke-width="1.5" opacity="0.5"/><circle cx="50" cy="44" r="3" fill="#bdc3c7" opacity="0.6"/></svg>`,
    description: 'The sentinels and unyielding guards. Vigilant never sleeps, never falters. Their iron defense makes them the immovable wall of Warfare.',
    specialty: 'Defense & Shields',
    combatStyle: 'Tank',
    stats: { hp: 110, atk: 60, def: 95, spd: 55, spAtk: 50 },
    bonusVs: 'altruism',
    weaknessVs: 'clement',
    specialMove: 'Bastion Wall',
    specialDesc: 'Grants full party a shield equal to 40% of Vigilant\'s max HP for 3 turns',
    recruitable: [
      { name: 'Ironclad Mira', class: 'guardian', level: 3, stats: { hp: 120, atk: 55, def: 100, spd: 45, spAtk: 45 } },
      { name: 'Watcher Renn', class: 'sentinel', level: 2, stats: { hp: 100, atk: 65, def: 85, spd: 60, spAtk: 50 } }
    ]
  },
  scrupulous: {
    id: 'scrupulous',
    name: 'Scrupulous',
    motto: 'Justice Above All',
    color: '#ecf0f1',
    gradient: ['#bdc3c7', '#ecf0f1', '#ffffff'],
    icon: '⚔️',
    emblem: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#bdc3c7"/><stop offset="100%" stop-color="#ffffff"/></linearGradient></defs><circle cx="50" cy="50" r="45" fill="none" stroke="url(#sg)" stroke-width="2.5" opacity="0.6"/><circle cx="50" cy="45" r="18" fill="none" stroke="url(#sg)" stroke-width="2"/><circle cx="50" cy="45" r="8" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.6"/><circle cx="50" cy="45" r="2" fill="#fff"/><line x1="50" y1="25" x2="50" y2="18" stroke="url(#sg)" stroke-width="1.5"/><line x1="50" y1="65" x2="50" y2="78" stroke="url(#sg)" stroke-width="1.5"/><line x1="32" y1="45" x2="25" y2="45" stroke="url(#sg)" stroke-width="1.5"/><line x1="68" y1="45" x2="75" y2="45" stroke="url(#sg)" stroke-width="1.5"/><path d="M44 68 L50 78 L56 68" fill="none" stroke="url(#sg)" stroke-width="1.5"/></svg>`,
    description: 'The investigators and hunters. Scrupulous pursues truth with relentless precision. Their critical strikes can end fights in a single blow.',
    specialty: 'Precision & Critical Hits',
    combatStyle: 'Burst',
    stats: { hp: 80, atk: 85, def: 65, spd: 85, spAtk: 75 },
    bonusVs: 'clement',
    weaknessVs: 'altruism',
    specialMove: 'True Sight',
    specialDesc: 'Next attack is guaranteed critical hit with 50% bonus damage',
    recruitable: [
      { name: 'Artemis the Keen', class: 'hunter', level: 3, stats: { hp: 75, atk: 90, def: 55, spd: 90, spAtk: 70 } },
      { name: 'Inquisitor Vael', class: 'inquisitor', level: 2, stats: { hp: 85, atk: 80, def: 65, spd: 80, spAtk: 75 } }
    ]
  },
  spunk: {
    id: 'spunk',
    name: 'Spunk',
    motto: 'Audacity Wins',
    color: '#e67e22',
    gradient: ['#d35400', '#e67e22', '#ffb347'],
    icon: '🔥',
    emblem: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="spg" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#d35400"/><stop offset="50%" stop-color="#e67e22"/><stop offset="100%" stop-color="#ffb347"/></linearGradient></defs><circle cx="50" cy="50" r="45" fill="none" stroke="url(#spg)" stroke-width="2.5" opacity="0.6"/><path d="M50 18 C50 18 30 38 30 55 C30 68 38 78 50 82 C62 78 70 68 70 55 C70 38 50 18 50 18Z" fill="url(#spg)" opacity="0.6"/><path d="M50 32 C50 32 40 45 40 55 C40 63 44 68 50 70 C56 68 60 63 60 55 C60 45 50 32 50 32Z" fill="url(#spg)" opacity="0.8"/><path d="M50 45 L45 58 L52 55 L50 65" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/></svg>`,
    description: 'The rogues and wild cards. Spunk thrives on chaos and unpredictability. Their unorthodox tactics make them impossible to plan against.',
    specialty: 'Randomness & High Risk',
    combatStyle: 'Chaos',
    stats: { hp: 80, atk: 80, def: 55, spd: 90, spAtk: 75 },
    bonusVs: 'rapport',
    weaknessVs: 'valor',
    specialMove: 'Wild Surge',
    specialDesc: 'Randomly deals 1x-3x damage, heals allies, or debuffs enemies, nobody knows what happens',
    recruitable: [
      { name: 'Jinx the Unpredictable', class: 'rogue', level: 3, stats: { hp: 70, atk: 85, def: 50, spd: 95, spAtk: 80 } },
      { name: 'Ruckus McChaos', class: 'berserker', level: 2, stats: { hp: 90, atk: 90, def: 40, spd: 85, spAtk: 60 } }
    ]
  }
};

const KINGDOM_CLASSES = {
  altruism: {
    mender: { name: 'Mender', icon: '💚', avatar: `<svg viewBox="0 0 120 160"><defs><radialGradient id="mglow"><stop offset="0%" stop-color="#a8e6cf" stop-opacity="0.35"/><stop offset="100%" stop-color="#2ecc71" stop-opacity="0"/></radialGradient></defs><circle cx="60" cy="30" r="45" fill="url(#mglow)"/><ellipse cx="60" cy="96" rx="30" ry="50" fill="#2ecc71" opacity="0.08"/><path d="M48 54Q48 42 60 42Q72 42 72 54L72 58Q76 58 76 62L76 68Q76 70 74 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L46 70Q44 70 44 68L44 62Q44 58 48 58Z" fill="#2ecc71" opacity="0.82"/><ellipse cx="60" cy="42" rx="10" ry="11" fill="#27ae60"/><path d="M50 38Q50 28 60 26Q70 28 70 38" fill="#a8e6cf" opacity="0.5"/><path d="M52 40L54 38M66 40L68 38" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="43" rx="1.5" ry="1" fill="#1a1a2e"/><path d="M44 58L38 66Q36 68 38 70L42 72" stroke="#2ecc71" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="34" cy="64" r="5" fill="#a8e6cf" opacity="0.5"/><path d="M32 62L36 66M34 60L34 68" stroke="#2ecc71" stroke-width="1.5" stroke-linecap="round"/><path d="M76 58L82 66Q84 68 82 70L78 72" stroke="#2ecc71" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="86" cy="64" r="5" fill="#a8e6cf" opacity="0.5"/><path d="M40 84L42 118L52 118L52 84" fill="#1a5a3a" opacity="0.7"/><path d="M68 84L68 118L78 118L80 84" fill="#1a5a3a" opacity="0.7"/><path d="M42 118L40 128Q40 132 44 132L50 132" fill="#2ecc71" opacity="0.4"/><path d="M78 118L80 128Q80 132 76 132L70 132" fill="#2ecc71" opacity="0.4"/><circle cx="60" cy="62" r="7" fill="none" stroke="#a8e6cf" stroke-width="1.5" opacity="0.7"/><path d="M57 62L63 62M60 59L60 65" stroke="#a8e6cf" stroke-width="1.5" stroke-linecap="round"/><circle cx="60" cy="62" r="12" fill="none" stroke="#a8e6cf" stroke-width="0.7" opacity="0.25"/></svg>`, desc: 'Healing specialist. Restores allies and shields the weak.', bonusStat: 'spAtk', bonusAmount: 15 },
    warden: { name: 'Warden', icon: '🛡️', avatar: `<svg viewBox="0 0 120 160"><ellipse cx="60" cy="100" rx="32" ry="50" fill="#2ecc71" opacity="0.08"/><path d="M48 50Q48 38 60 38Q72 38 72 50L72 58Q76 58 76 62L76 68Q76 70 74 70L68 70L68 80Q68 86 62 86L58 86Q52 86 52 80L52 70L46 70Q44 70 44 68L44 62Q44 58 48 58Z" fill="#2ecc71" opacity="0.82"/><ellipse cx="60" cy="42" rx="11" ry="12" fill="#27ae60"/><path d="M49 38Q50 28 60 26Q70 28 71 38" fill="#1a4a2e" opacity="0.6"/><path d="M50 34L48 28M70 34L72 28M56 32L55 26M64 32L65 26" stroke="#2ecc71" stroke-width="1.5" stroke-linecap="round"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="2" ry="1" fill="#1a1a2e"/><path d="M14 44L14 98Q14 106 24 106L24 44Z" fill="#2ecc71" opacity="0.65"/><path d="M14 52L24 52M14 62L24 62M14 72L24 72M14 82L24 82" stroke="#a8e6cf" stroke-width="0.8" opacity="0.4"/><ellipse cx="19" cy="76" rx="5" ry="5" fill="none" stroke="#a8e6cf" stroke-width="1.5" opacity="0.5"/><path d="M76 52L80 58Q82 62 78 64L76 62" stroke="#2ecc71" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 86L40 120L52 120L52 86" fill="#1a4a2e" opacity="0.7"/><path d="M68 86L68 120L80 120L84 86" fill="#1a4a2e" opacity="0.7"/><path d="M40 120L38 130Q38 134 42 134L50 134" fill="#2ecc71" opacity="0.4"/><path d="M80 120L82 130Q82 134 78 134L70 134" fill="#2ecc71" opacity="0.4"/></svg>`, desc: 'Protective tank. Draws attacks and shields the party.', bonusStat: 'def', bonusAmount: 12 },
    spiritweaver: { name: 'Spiritweaver', icon: '✨', avatar: `<svg viewBox="0 0 120 160"><defs><radialGradient id="swglow"><stop offset="0%" stop-color="#a8e6cf" stop-opacity="0.4"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><circle cx="60" cy="20" r="50" fill="url(#swglow)"/><path d="M48 54Q48 42 60 42Q72 42 72 54L72 60Q76 60 76 64L76 72Q76 74 74 74L66 74L66 84Q66 88 62 88L58 88Q54 88 54 84L54 74L46 74Q44 74 44 72L44 64Q44 60 48 60Z" fill="#2ecc71" opacity="0.75"/><ellipse cx="60" cy="44" rx="10" ry="11" fill="#27ae60" opacity="0.85"/><path d="M50 38Q50 28 60 26Q70 28 70 38" fill="#a8e6cf" opacity="0.4"/><path d="M46 44Q44 38 48 34Q52 32 54 36" fill="#2ecc71" opacity="0.5"/><path d="M74 44Q76 38 72 34Q68 32 66 36" fill="#2ecc71" opacity="0.5"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="1.5" ry="1" fill="#1a1a2e"/><path d="M36 60L28 72Q26 76 30 78L34 76" stroke="#2ecc71" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="24" cy="68" r="6" fill="none" stroke="#a8e6cf" stroke-width="1.5" opacity="0.7"/><circle cx="24" cy="68" r="10" fill="none" stroke="#a8e6cf" stroke-width="0.7" opacity="0.3"/><path d="M84 60L92 72Q94 76 90 78L86 76" stroke="#2ecc71" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="96" cy="68" r="6" fill="none" stroke="#a8e6cf" stroke-width="1.5" opacity="0.7"/><circle cx="96" cy="68" r="10" fill="none" stroke="#a8e6cf" stroke-width="0.7" opacity="0.3"/><path d="M40 88L42 104Q42 108 38 112L36 122Q36 126 40 126L52 126" fill="#1a4a2e" opacity="0.5"/><path d="M80 88L78 104Q78 108 82 112L84 122Q84 126 80 126L68 126" fill="#1a4a2e" opacity="0.5"/><path d="M52 126Q60 130 68 126" fill="#2ecc71" opacity="0.35"/><circle cx="20" cy="56" r="2" fill="#a8e6cf" opacity="0.5"/><circle cx="100" cy="56" r="2" fill="#a8e6cf" opacity="0.5"/><circle cx="14" cy="74" r="1.5" fill="#a8e6cf" opacity="0.35"/><circle cx="106" cy="74" r="1.5" fill="#a8e6cf" opacity="0.35"/></svg>`, desc: 'Support mage. Boosts party morale and debuffs enemies.', bonusStat: 'spd', bonusAmount: 10 },
    bulwark: { name: 'Bulwark', icon: '🏰', avatar: `<svg viewBox="0 0 120 160"><path d="M30 42L30 112Q30 120 40 120L80 120Q90 120 90 112L90 42Z" fill="#2ecc71" opacity="0.1"/><path d="M46 50Q46 38 60 38Q74 38 74 50L74 58Q78 58 78 62L78 70Q78 72 76 72L70 72L70 80Q70 84 66 84L54 84Q50 84 50 80L50 72L44 72Q42 72 42 70L42 62Q42 58 46 58Z" fill="#2ecc71" opacity="0.82"/><ellipse cx="60" cy="42" rx="12" ry="13" fill="#27ae60"/><path d="M49 36Q50 26 60 24Q70 26 71 36" fill="#1a4a2e" opacity="0.7"/><rect x="50" y="28" width="20" height="10" rx="2" fill="#2ecc71" opacity="0.6"/><rect x="52" y="24" width="5" height="8" fill="#2ecc71" opacity="0.5"/><rect x="58" y="22" width="5" height="10" fill="#2ecc71" opacity="0.5"/><rect x="64" y="24" width="5" height="8" fill="#2ecc71" opacity="0.5"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="2" ry="1" fill="#1a1a2e"/><path d="M42 72L42 80L30 80L30 112Q30 118 36 118L36 72Z" fill="#1a4a2e" opacity="0.6"/><path d="M78 72L78 80L90 80L90 112Q90 118 84 118L84 72Z" fill="#1a4a2e" opacity="0.6"/><path d="M36 118L38 132Q38 136 42 136L52 136" fill="#2ecc71" opacity="0.4"/><path d="M84 118L82 132Q82 136 78 136L68 136" fill="#2ecc71" opacity="0.4"/></svg>`, desc: 'Fortified warrior. Slow but nearly unkillable.', bonusStat: 'hp', bonusAmount: 18 }
  },
  accord: {
    diplomat: { name: 'Diplomat', icon: '📜', avatar: `<svg viewBox="0 0 120 160"><path d="M46 54Q46 42 60 42Q74 42 74 54L74 58Q78 58 78 62L78 70Q78 72 76 72L68 72L68 82Q68 86 64 86L56 86Q52 86 52 82L52 72L44 72Q42 72 42 70L42 62Q42 58 46 58Z" fill="#3498db" opacity="0.8"/><ellipse cx="60" cy="44" rx="10" ry="11" fill="#2980b9"/><path d="M50 38Q50 28 60 26Q70 28 70 38" fill="#1a3a5e" opacity="0.5"/><path d="M48 40Q46 36 50 34L54 38" fill="#3498db" opacity="0.4"/><path d="M72 40Q74 36 70 34L66 38" fill="#3498db" opacity="0.4"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="1.5" ry="1" fill="#1a1a2e"/><path d="M34 56L28 48Q26 44 30 42L34 46" stroke="#3498db" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="16" y="38" width="16" height="22" rx="2" fill="#3498db" opacity="0.6"/><line x1="20" y1="44" x2="28" y2="44" stroke="#a8d8ea" stroke-width="1" opacity="0.7"/><line x1="20" y1="48" x2="28" y2="48" stroke="#a8d8ea" stroke-width="1" opacity="0.7"/><line x1="20" y1="52" x2="26" y2="52" stroke="#a8d8ea" stroke-width="1" opacity="0.5"/><path d="M86 56L92 48Q94 44 90 42L86 46" stroke="#3498db" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 86L40 108L52 108L52 86" fill="#1a3a5e" opacity="0.6"/><path d="M68 86L68 108L80 108L84 86" fill="#1a3a5e" opacity="0.6"/><path d="M40 108L38 128Q38 132 42 132L50 132" fill="#3498db" opacity="0.4"/><path d="M80 108L82 128Q82 132 78 132L70 132" fill="#3498db" opacity="0.4"/></svg>`, desc: 'Strategic mastermind. Controls the flow of battle.', bonusStat: 'spAtk', bonusAmount: 15 },
    sentinel: { name: 'Sentinel', icon: '🛡️', avatar: `<svg viewBox="0 0 120 160"><path d="M46 50Q46 38 60 38Q74 38 74 50L74 58Q78 58 78 62L78 68Q78 70 76 70L68 70L68 80Q68 86 62 86L58 86Q52 86 52 80L52 70L46 70Q44 70 44 68L44 62Q44 58 48 58Z" fill="#3498db" opacity="0.8"/><ellipse cx="60" cy="42" rx="10" ry="11" fill="#2980b9"/><path d="M50 36Q50 26 60 24Q70 26 70 36" fill="#1a3a5e" opacity="0.5"/><path d="M48 32L46 26M72 32L74 26M56 30L55 24M64 30L65 24" stroke="#3498db" stroke-width="1.2" stroke-linecap="round"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="2" ry="1" fill="#1a1a2e"/><path d="M10 40L10 100Q10 108 20 108L20 40Z" fill="#3498db" opacity="0.6"/><path d="M10 50L20 50M10 60L20 60M10 70L20 70M10 80L20 80M10 90L20 90" stroke="#a8d8ea" stroke-width="0.8" opacity="0.4"/><ellipse cx="15" cy="74" rx="4" ry="6" fill="none" stroke="#a8d8ea" stroke-width="1.5" opacity="0.5"/><path d="M80 54L86 60Q88 64 84 66L82 64" stroke="#3498db" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 88L40 112L52 112L52 88" fill="#1a3a5e" opacity="0.6"/><path d="M68 88L68 112L80 112L84 88" fill="#1a3a5e" opacity="0.6"/><path d="M40 112L38 132Q38 136 42 136L50 136" fill="#3498db" opacity="0.4"/><path d="M80 112L82 132Q82 136 78 136L70 136" fill="#3498db" opacity="0.4"/></svg>`, desc: 'Defensive wall. Counter-attacks when struck.', bonusStat: 'def', bonusAmount: 12 },
    arbitrer: { name: 'Arbitrer', icon: '⚖️', avatar: `<svg viewBox="0 0 120 160"><path d="M46 52Q46 40 60 40Q74 40 74 52L74 58Q78 58 78 62L78 68Q78 70 76 70L68 70L68 82Q68 86 64 86L56 86Q52 86 52 82L52 70L44 70Q42 70 42 68L42 62Q42 58 46 58Z" fill="#3498db" opacity="0.8"/><ellipse cx="60" cy="42" rx="10" ry="11" fill="#2980b9"/><path d="M50 36Q50 26 60 24Q70 26 70 36" fill="#1a3a5e" opacity="0.5"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="2" ry="1" fill="#1a1a2e"/><path d="M60 20L60 10" stroke="#3498db" stroke-width="2.5"/><line x1="44" y1="14" x2="76" y2="14" stroke="#3498db" stroke-width="2"/><path d="M44 14L40 24Q40 28 44 28L48 28" fill="none" stroke="#3498db" stroke-width="1.5"/><path d="M76 14L80 24Q80 28 76 28L72 28" fill="none" stroke="#3498db" stroke-width="1.5"/><circle cx="44" cy="28" r="3.5" fill="#3498db" opacity="0.6"/><circle cx="76" cy="28" r="3.5" fill="#3498db" opacity="0.6"/><path d="M36 56L30 64Q28 68 32 70L36 68" stroke="#3498db" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M84 56L90 64Q92 68 88 70L84 68" stroke="#3498db" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 86L40 108L52 108L52 86" fill="#1a3a5e" opacity="0.6"/><path d="M68 86L68 108L80 108L84 86" fill="#1a3a5e" opacity="0.6"/><path d="M40 108L38 128Q38 132 42 132L50 132" fill="#3498db" opacity="0.4"/><path d="M80 108L82 128Q82 132 78 132L70 132" fill="#3498db" opacity="0.4"/></svg>`, desc: 'Balanced fighter. Adapts to any situation.', bonusStat: 'atk', bonusAmount: 10 },
    bondsworn: { name: 'Bondsworn', icon: '🔗', avatar: `<svg viewBox="0 0 120 160"><path d="M46 52Q46 40 60 40Q74 40 74 52L74 58Q78 58 78 62L78 68Q78 70 76 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L44 70Q42 70 42 68L42 62Q42 58 46 58Z" fill="#3498db" opacity="0.8"/><ellipse cx="60" cy="42" rx="10" ry="11" fill="#2980b9"/><path d="M50 36Q50 26 60 24Q70 26 70 36" fill="#1a3a5e" opacity="0.5"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="2" ry="1" fill="#1a1a2e"/><path d="M30 56L30 70Q30 74 34 74L38 74Q42 74 42 70L42 56Q42 52 38 52L34 52Q30 52 30 56Z" fill="#3498db" opacity="0.5"/><path d="M78 56L78 70Q78 74 82 74L86 74Q90 74 90 70L90 56Q90 52 86 52L82 52Q78 52 78 56Z" fill="#3498db" opacity="0.5"/><line x1="42" y1="62" x2="78" y2="62" stroke="#a8d8ea" stroke-width="2.5" opacity="0.6"/><circle cx="36" cy="62" r="3.5" fill="none" stroke="#a8d8ea" stroke-width="1.5" opacity="0.7"/><circle cx="84" cy="62" r="3.5" fill="none" stroke="#a8d8ea" stroke-width="1.5" opacity="0.7"/><path d="M36 86L40 108L52 108L52 86" fill="#1a3a5e" opacity="0.6"/><path d="M68 86L68 108L80 108L84 86" fill="#1a3a5e" opacity="0.6"/><path d="M40 108L38 128Q38 132 42 132L50 132" fill="#3498db" opacity="0.4"/><path d="M80 108L82 128Q82 132 78 132L70 132" fill="#3498db" opacity="0.4"/></svg>`, desc: 'Ally-bonder. Stronger when allies are nearby.', bonusStat: 'hp', bonusAmount: 15 }
  },
  rapport: {
    whisper: { name: 'Whisper', icon: '🗡️', avatar: `<svg viewBox="0 0 120 160"><path d="M44 52Q44 40 58 40Q72 40 72 52L72 58Q76 58 76 62L76 68Q76 70 74 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L46 70Q44 70 44 68L44 62Q44 58 48 58Z" fill="#9b59b6" opacity="0.75"/><ellipse cx="58" cy="42" rx="10" ry="11" fill="#8e44ad"/><path d="M48 36Q48 26 58 24Q68 26 68 36" fill="#4a1a6a" opacity="0.6"/><path d="M44 38Q40 34 44 30" fill="#9b59b6" opacity="0.5"/><path d="M72 38Q76 34 72 30" fill="#9b59b6" opacity="0.5"/><path d="M50 42L52 40M64 42L66 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="58" cy="45" rx="1.5" ry="1" fill="#1a1a2e"/><path d="M52 50L52 54Q52 56 54 56L62 56Q64 56 64 54L64 50" fill="#4a1a6a" opacity="0.5"/><path d="M76 46L84 38Q88 34 92 38L90 46L86 50Q84 52 80 50Z" fill="#9b59b6" opacity="0.6"/><path d="M88 38L92 34M86 44L90 40" stroke="#d4a5ff" stroke-width="1" opacity="0.5"/><path d="M28 54L22 62Q20 66 24 68L28 66" stroke="#9b59b6" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M22 58L20 54L24 50L28 54Z" fill="#9b59b6" opacity="0.5"/><path d="M32 84L36 106L48 106L52 84" fill="#2a0a3a" opacity="0.6"/><path d="M68 84L68 106L80 106L86 84" fill="#2a0a3a" opacity="0.6"/><path d="M36 106L34 124Q34 128 38 128L48 128" fill="#9b59b6" opacity="0.4"/><path d="M80 106L82 124Q82 128 78 128L68 128" fill="#9b59b6" opacity="0.4"/></svg>`, desc: 'Shadow assassin. Strikes from the dark unseen.', bonusStat: 'spd', bonusAmount: 15 },
    phantom: { name: 'Phantom', icon: '👁️', avatar: `<svg viewBox="0 0 120 160"><defs><linearGradient id="phg"><stop offset="0%" stop-color="#d4a5ff" stop-opacity="0.7"/><stop offset="100%" stop-color="#9b59b6" stop-opacity="0.5"/></linearGradient></defs><path d="M44 52Q44 40 58 40Q72 40 72 52L72 58Q76 58 76 62L76 70Q76 72 74 72L66 72L66 82Q66 86 62 86L56 86Q52 86 52 82L52 72L44 72Q42 72 42 70L42 62Q42 58 46 58Z" fill="url(#phg)" opacity="0.55"/><ellipse cx="58" cy="42" rx="10" ry="11" fill="#9b59b6" opacity="0.65"/><path d="M48 36Q48 26 58 24Q68 26 68 36" fill="#4a1a6a" opacity="0.45"/><path d="M50 42L52 40M64 42L66 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="58" cy="45" rx="1.5" ry="1" fill="#1a1a2e"/><ellipse cx="58" cy="38" rx="12" ry="6" fill="none" stroke="#d4a5ff" stroke-width="1.5" opacity="0.5"/><circle cx="58" cy="38" r="3.5" fill="#d4a5ff" opacity="0.4"/><path d="M30 56L24 64Q22 68 26 70L30 68" stroke="#9b59b6" stroke-width="2.5" fill="none" opacity="0.5" stroke-linecap="round"/><path d="M86 56L92 64Q94 68 90 70L86 68" stroke="#9b59b6" stroke-width="2.5" fill="none" opacity="0.5" stroke-linecap="round"/><path d="M32 86L38 110Q38 114 42 114L52 114" fill="#2a0a3a" opacity="0.35"/><path d="M86 86L80 110Q80 114 76 114L66 114" fill="#2a0a3a" opacity="0.35"/><path d="M46 114Q58 120 70 114" fill="#9b59b6" opacity="0.15"/></svg>`, desc: 'Debuffer. Weakens enemies before the kill.', bonusStat: 'spAtk', bonusAmount: 12 },
    broker: { name: 'Broker', icon: '🕸️', avatar: `<svg viewBox="0 0 120 160"><path d="M46 54Q46 42 60 42Q74 42 74 54L74 58Q78 58 78 62L78 68Q78 70 76 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L44 70Q42 70 42 68L42 62Q42 58 46 58Z" fill="#9b59b6" opacity="0.8"/><ellipse cx="60" cy="44" rx="10" ry="11" fill="#8e44ad"/><path d="M50 38Q50 28 60 26Q70 28 70 38" fill="#4a1a6a" opacity="0.5"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="2" ry="1" fill="#1a1a2e"/><line x1="60" y1="20" x2="30" y2="8" stroke="#d4a5ff" stroke-width="0.8" opacity="0.4"/><line x1="60" y1="20" x2="90" y2="8" stroke="#d4a5ff" stroke-width="0.8" opacity="0.4"/><line x1="60" y1="20" x2="20" y2="16" stroke="#d4a5ff" stroke-width="0.8" opacity="0.3"/><line x1="60" y1="20" x2="100" y2="16" stroke="#d4a5ff" stroke-width="0.8" opacity="0.3"/><line x1="60" y1="20" x2="26" y2="28" stroke="#d4a5ff" stroke-width="0.6" opacity="0.2"/><line x1="60" y1="20" x2="94" y2="28" stroke="#d4a5ff" stroke-width="0.6" opacity="0.2"/><circle cx="30" cy="8" r="2.5" fill="#9b59b6" opacity="0.3"/><circle cx="90" cy="8" r="2.5" fill="#9b59b6" opacity="0.3"/><circle cx="20" cy="16" r="2" fill="#d4a5ff" opacity="0.2"/><circle cx="100" cy="16" r="2" fill="#d4a5ff" opacity="0.2"/><path d="M34 84L38 106L50 106L52 84" fill="#2a0a3a" opacity="0.6"/><path d="M68 84L68 106L80 106L84 84" fill="#2a0a3a" opacity="0.6"/><path d="M38 106L36 126Q36 130 40 130L50 130" fill="#9b59b6" opacity="0.4"/><path d="M80 106L82 126Q82 130 78 130L68 130" fill="#9b59b6" opacity="0.4"/></svg>`, desc: 'Info broker. Exploits enemy weaknesses.', bonusStat: 'atk', bonusAmount: 10 },
    shadowguard: { name: 'Shadowguard', icon: '🌑', avatar: `<svg viewBox="0 0 120 160"><ellipse cx="60" cy="100" rx="36" ry="52" fill="#9b59b6" opacity="0.06"/><path d="M44 52Q44 40 58 40Q72 40 72 52L72 58Q76 58 76 62L76 68Q76 70 74 70L68 70L68 80Q68 84 62 84L56 84Q50 84 50 80L50 70L44 70Q42 70 42 68L42 62Q42 58 46 58Z" fill="#9b59b6" opacity="0.5"/><ellipse cx="58" cy="42" rx="10" ry="11" fill="#9b59b6" opacity="0.6"/><path d="M48 36Q48 26 58 24Q68 26 68 36" fill="#4a1a6a" opacity="0.35"/><path d="M50 42L52 40M64 42L66 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="58" cy="45" rx="1.5" ry="1" fill="#1a1a2e"/><path d="M12 38L12 98Q12 106 22 106L22 38Z" fill="#9b59b6" opacity="0.35"/><path d="M12 52L22 52M12 64L22 64M12 76L22 76M12 88L22 88" stroke="#d4a5ff" stroke-width="0.8" opacity="0.2"/><path d="M32 84L38 108L50 108L50 84" fill="#2a0a3a" opacity="0.35"/><path d="M68 84L68 108L80 108L86 84" fill="#2a0a3a" opacity="0.35"/></svg>`, desc: 'Stealth tank. Hard to hit, hard to find.', bonusStat: 'def', bonusAmount: 12 }
  },
  valor: {
    vanguard: { name: 'Vanguard', icon: '⚔️', avatar: `<svg viewBox="0 0 120 160"><path d="M44 50Q44 38 60 38Q76 38 76 50L76 58Q80 58 80 62L80 68Q80 70 78 70L70 70L70 80Q70 84 66 84L54 84Q50 84 50 80L50 70L42 70Q40 70 40 68L40 62Q40 58 44 58Z" fill="#e74c3c" opacity="0.85"/><ellipse cx="60" cy="42" rx="11" ry="12" fill="#c0392b"/><path d="M49 36Q50 26 60 24Q70 26 71 36" fill="#5a1a1a" opacity="0.6"/><path d="M46 32L44 24M74 32L76 24M54 30L53 22M66 30L67 22" stroke="#e74c3c" stroke-width="1.5" stroke-linecap="round"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="2" ry="1" fill="#1a1a2e"/><path d="M80 44L88 38L92 40L90 48L86 52L80 50Z" fill="#e74c3c" opacity="0.7"/><path d="M88 38L92 36M90 44L94 42" stroke="#ff6b6b" stroke-width="1" opacity="0.6"/><path d="M80 50L80 92" stroke="#e74c3c" stroke-width="3.5"/><path d="M82 48L86 44" stroke="#ff6b6b" stroke-width="1" opacity="0.5"/><path d="M32 84L36 108L48 108L52 84" fill="#5a1a1a" opacity="0.7"/><path d="M68 84L68 108L80 108L86 84" fill="#5a1a1a" opacity="0.7"/><path d="M36 108L34 126Q34 130 38 130L48 130" fill="#e74c3c" opacity="0.5"/><path d="M80 108L82 126Q82 130 78 130L68 130" fill="#e74c3c" opacity="0.5"/></svg>`, desc: 'Front-line berserker. Pure devastating offense.', bonusStat: 'atk', bonusAmount: 18 },
    warcry: { name: 'Warcry', icon: '📯', avatar: `<svg viewBox="0 0 120 160"><path d="M46 52Q46 40 60 40Q74 40 74 52L74 58Q78 58 78 62L78 68Q78 70 76 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L44 70Q42 70 42 68L42 62Q42 58 46 58Z" fill="#e74c3c" opacity="0.85"/><ellipse cx="60" cy="44" rx="11" ry="12" fill="#c0392b"/><path d="M49 38Q50 28 60 26Q70 28 71 38" fill="#5a1a1a" opacity="0.6"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="2" ry="1" fill="#1a1a2e"/><path d="M30 52L22 44Q18 40 18 44L18 54Q18 60 22 62L30 60" fill="#e74c3c" opacity="0.6"/><path d="M18 50L14 46M18 54L14 58" stroke="#ff6b6b" stroke-width="1" opacity="0.5"/><path d="M80 52L86 58Q88 62 84 64L82 62" stroke="#e74c3c" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M34 84L38 108L50 108L52 84" fill="#5a1a1a" opacity="0.6"/><path d="M68 84L68 108L80 108L84 84" fill="#5a1a1a" opacity="0.6"/><path d="M38 108L36 126Q36 130 40 130L50 130" fill="#e74c3c" opacity="0.5"/><path d="M80 108L82 126Q82 130 78 130L68 130" fill="#e74c3c" opacity="0.5"/></svg>`, desc: 'Battlecrier. Boosts party attack with every shout.', bonusStat: 'spAtk', bonusAmount: 12 },
    ironfist: { name: 'Ironfist', icon: '👊', avatar: `<svg viewBox="0 0 120 160"><path d="M42 48Q42 36 60 36Q78 36 78 48L78 56Q82 56 82 60L82 66Q82 68 80 68L72 68L72 78Q72 82 68 82L52 82Q48 82 48 78L48 68L40 68Q38 68 38 66L38 60Q38 56 42 56Z" fill="#e74c3c" opacity="0.85"/><ellipse cx="60" cy="40" rx="12" ry="13" fill="#c0392b"/><path d="M48 34Q50 24 60 22Q70 24 72 34" fill="#5a1a1a" opacity="0.6"/><path d="M46 30L42 22M74 30L78 22M54 28L52 20M66 28L68 20" stroke="#e74c3c" stroke-width="1.5" stroke-linecap="round"/><path d="M50 40L52 38M68 40L70 38" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="43" rx="2" ry="1" fill="#1a1a2e"/><path d="M18 46L18 58Q18 62 22 62L26 62L26 46Q26 42 22 42L22 42Q18 42 18 46Z" fill="#e74c3c" opacity="0.7"/><path d="M94 46L94 58Q94 62 90 62L86 62L86 46Q86 42 90 42L90 42Q94 42 94 46Z" fill="#e74c3c" opacity="0.7"/><path d="M30 82L34 110L48 110L52 82" fill="#5a1a1a" opacity="0.7"/><path d="M68 82L68 110L84 110L88 82" fill="#5a1a1a" opacity="0.7"/><path d="M34 110L32 130Q32 134 36 134L48 134" fill="#e74c3c" opacity="0.5"/><path d="M84 110L86 130Q86 134 82 134L70 134" fill="#e74c3c" opacity="0.5"/></svg>`, desc: 'Brawler. High HP, hits hard, takes hits.', bonusStat: 'hp', bonusAmount: 15 },
    bloodrager: { name: 'Bloodrager', icon: '🩸', avatar: `<svg viewBox="0 0 120 160"><path d="M44 52Q44 40 60 40Q76 40 76 52L76 58Q80 58 80 62L80 68Q80 70 78 70L70 70L70 80Q70 84 66 84L54 84Q50 84 50 80L50 70L42 70Q40 70 40 68L40 62Q40 58 44 58Z" fill="#e74c3c" opacity="0.85"/><ellipse cx="60" cy="44" rx="11" ry="12" fill="#c0392b"/><path d="M49 38Q50 28 60 26Q70 28 71 38" fill="#5a1a1a" opacity="0.6"/><path d="M46 34L42 26M74 34L78 26" stroke="#e74c3c" stroke-width="2" stroke-linecap="round"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="2" ry="1" fill="#1a1a2e"/><path d="M60 32L56 26L60 22L64 26Z" fill="#ff6b6b" opacity="0.6"/><path d="M56 24L52 18M64 24L68 18M60 22L60 14" stroke="#ff6b6b" stroke-width="1.5" stroke-linecap="round"/><path d="M30 56L24 50L20 54L24 60L30 58" fill="#e74c3c" opacity="0.5"/><path d="M90 56L96 50L100 54L96 60L90 58" fill="#e74c3c" opacity="0.5"/><path d="M34 84L38 108L50 108L52 84" fill="#5a1a1a" opacity="0.6"/><path d="M68 84L68 108L80 108L84 84" fill="#5a1a1a" opacity="0.6"/><path d="M38 108L36 128Q36 132 40 132L50 132" fill="#e74c3c" opacity="0.5"/><path d="M80 108L82 128Q82 132 78 132L68 132" fill="#e74c3c" opacity="0.5"/></svg>`, desc: 'Rage fighter. Stronger as HP drops lower.', bonusStat: 'atk', bonusAmount: 10 }
  },
  clement: {
    arbiter: { name: 'Arbiter', icon: '⚖️', avatar: `<svg viewBox="0 0 120 160"><path d="M44 54Q44 42 60 42Q76 42 76 54L76 60Q80 60 80 64L80 72Q80 74 78 74L70 74L70 84Q70 88 66 88L54 88Q50 88 50 84L50 74L42 74Q40 74 40 72L40 64Q40 60 44 60Z" fill="#f1c40f" opacity="0.85"/><ellipse cx="60" cy="46" rx="10" ry="11" fill="#d4ac0d"/><path d="M50 40Q50 30 60 28Q70 30 70 40" fill="#7a6a0a" opacity="0.5"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="1.5" ry="1" fill="#1a1a2e"/><path d="M60 24L60 14" stroke="#f1c40f" stroke-width="2.5"/><line x1="42" y1="18" x2="78" y2="18" stroke="#f1c40f" stroke-width="2"/><path d="M42 18L38 28Q38 32 42 32L46 32" fill="none" stroke="#f1c40f" stroke-width="1.5"/><path d="M78 18L82 28Q82 32 78 32L74 32" fill="none" stroke="#f1c40f" stroke-width="1.5"/><circle cx="42" cy="32" r="4" fill="#f1c40f" opacity="0.6"/><circle cx="78" cy="32" r="4" fill="#f1c40f" opacity="0.6"/><path d="M36 58L30 66Q28 70 32 72L36 70" stroke="#f1c40f" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M84 58L90 66Q92 70 88 72L84 70" stroke="#f1c40f" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 88L40 110L52 110L52 88" fill="#7a6a0a" opacity="0.5"/><path d="M68 88L68 110L80 110L84 88" fill="#7a6a0a" opacity="0.5"/><path d="M40 110L38 130Q38 134 42 134L50 134" fill="#f1c40f" opacity="0.4"/><path d="M80 110L82 130Q82 134 78 134L70 134" fill="#f1c40f" opacity="0.4"/></svg>`, desc: 'Holy judge. Balanced stats with adaptive power.', bonusStat: 'spAtk', bonusAmount: 12 },
    templar: { name: 'Templar', icon: '⚜️', avatar: `<svg viewBox="0 0 120 160"><path d="M44 50Q44 38 60 38Q76 38 76 50L76 58Q80 58 80 62L80 68Q80 70 78 70L70 70L70 80Q70 84 66 84L54 84Q50 84 50 80L50 70L42 70Q40 70 40 68L40 62Q40 58 44 58Z" fill="#f1c40f" opacity="0.85"/><ellipse cx="60" cy="42" rx="11" ry="12" fill="#d4ac0d"/><path d="M49 36Q50 26 60 24Q70 26 71 36" fill="#7a6a0a" opacity="0.5"/><path d="M48 32L46 24M72 32L74 24M56 30L55 22M64 30L65 22" stroke="#f1c40f" stroke-width="1.2" stroke-linecap="round"/><path d="M60 20L56 12L60 8L64 12Z" fill="#f1c40f" opacity="0.7"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="2" ry="1" fill="#1a1a2e"/><path d="M14 44L14 88Q14 96 22 96L22 44Z" fill="#f1c40f" opacity="0.55"/><path d="M18 52L18 88" stroke="#ffeaa7" stroke-width="0.8" opacity="0.4"/><path d="M14 62L22 62M14 74L22 74" stroke="#ffeaa7" stroke-width="0.8" opacity="0.3"/><path d="M80 54L86 60Q88 64 84 66L82 64" stroke="#f1c40f" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 84L40 108L52 108L52 84" fill="#7a6a0a" opacity="0.5"/><path d="M68 84L68 108L80 108L84 84" fill="#7a6a0a" opacity="0.5"/><path d="M40 108L38 128Q38 132 42 132L50 132" fill="#f1c40f" opacity="0.4"/><path d="M80 108L82 128Q82 132 78 132L70 132" fill="#f1c40f" opacity="0.4"/></svg>`, desc: 'Holy warrior. Heals and smites in equal measure.', bonusStat: 'hp', bonusAmount: 15 },
    justiciar: { name: 'Justiciar', icon: '🔨', avatar: `<svg viewBox="0 0 120 160"><path d="M46 52Q46 40 60 40Q74 40 74 52L74 58Q78 58 78 62L78 68Q78 70 76 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L44 70Q42 70 42 68L42 62Q42 58 46 58Z" fill="#f1c40f" opacity="0.85"/><ellipse cx="60" cy="44" rx="10" ry="11" fill="#d4ac0d"/><path d="M50 38Q50 28 60 26Q70 28 70 38" fill="#7a6a0a" opacity="0.5"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="2" ry="1" fill="#1a1a2e"/><path d="M80 46L80 58Q80 62 84 62L88 62L88 54L92 50L92 46L88 42L84 42L80 46Z" fill="#f1c40f" opacity="0.65"/><path d="M88 42L96 38L96 46L88 50" fill="#f1c40f" opacity="0.5"/><path d="M34 58L28 66Q26 70 30 72L34 70" stroke="#f1c40f" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 88L40 110L52 110L52 88" fill="#7a6a0a" opacity="0.5"/><path d="M68 88L68 110L80 110L84 88" fill="#7a6a0a" opacity="0.5"/><path d="M40 110L38 130Q38 134 42 134L50 134" fill="#f1c40f" opacity="0.4"/><path d="M80 110L82 130Q82 134 78 134L70 134" fill="#f1c40f" opacity="0.4"/></svg>`, desc: 'Executioner. Deals more damage to weakened foes.', bonusStat: 'atk', bonusAmount: 12 },
    peacemaker: { name: 'Peacemaker', icon: '🕊️', avatar: `<svg viewBox="0 0 120 160"><defs><radialGradient id="pglow"><stop offset="0%" stop-color="#ffeaa7" stop-opacity="0.35"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><circle cx="60" cy="22" r="32" fill="url(#pglow)"/><path d="M46 56Q46 44 60 44Q74 44 74 56L74 60Q78 60 78 64L78 72Q78 74 76 74L68 74L68 84Q68 88 64 88L56 88Q52 88 52 84L52 74L44 74Q42 74 42 72L42 64Q42 60 46 60Z" fill="#f1c40f" opacity="0.78"/><ellipse cx="60" cy="46" rx="10" ry="11" fill="#d4ac0d" opacity="0.9"/><path d="M50 40Q50 30 60 28Q70 30 70 40" fill="#7a6a0a" opacity="0.4"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="1.5" ry="1" fill="#1a1a2e"/><path d="M48 40Q36 34 30 40Q26 46 34 50Q42 52 48 46Z" fill="#f1c40f" opacity="0.3"/><path d="M72 40Q84 34 90 40Q94 46 86 50Q78 52 72 46Z" fill="#f1c40f" opacity="0.3"/><path d="M34 60L28 68Q26 72 30 74L34 72" stroke="#f1c40f" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M86 60L92 68Q94 72 90 74L86 72" stroke="#f1c40f" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 88L40 110L52 110L52 88" fill="#7a6a0a" opacity="0.45"/><path d="M68 88L68 110L80 110L84 88" fill="#7a6a0a" opacity="0.45"/><path d="M40 110L38 130Q38 134 42 134L50 134" fill="#f1c40f" opacity="0.35"/><path d="M80 110L82 130Q82 134 78 134L70 134" fill="#f1c40f" opacity="0.35"/></svg>`, desc: 'Diplomatic healer. Calms enemies, mends allies.', bonusStat: 'def', bonusAmount: 10 }
  },
  vigilant: {
    bastion: { name: 'Bastion', icon: '🏰', avatar: `<svg viewBox="0 0 120 160"><path d="M30 42L30 112Q30 120 40 120L80 120Q90 120 90 112L90 42Z" fill="#95a5a6" opacity="0.1"/><path d="M44 50Q44 38 60 38Q76 38 76 50L76 58Q80 58 80 62L80 70Q80 72 78 72L72 72L72 80Q72 84 68 84L52 84Q48 84 48 80L48 72L42 72Q40 72 40 70L40 62Q40 58 44 58Z" fill="#95a5a6" opacity="0.82"/><ellipse cx="60" cy="42" rx="12" ry="13" fill="#7f8c8d"/><path d="M49 36Q50 26 60 24Q70 26 71 36" fill="#3a3a4a" opacity="0.6"/><rect x="50" y="28" width="20" height="12" rx="2" fill="#95a5a6" opacity="0.6"/><rect x="52" y="24" width="5" height="8" fill="#95a5a6" opacity="0.5"/><rect x="58" y="22" width="5" height="10" fill="#95a5a6" opacity="0.5"/><rect x="64" y="24" width="5" height="8" fill="#95a5a6" opacity="0.5"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="2" ry="1" fill="#1a1a2e"/><path d="M10 40L10 102Q10 110 20 110L20 40Z" fill="#95a5a6" opacity="0.6"/><path d="M10 50L20 50M10 60L20 60M10 70L20 70M10 80L20 80M10 90L20 90" stroke="#bdc3c7" stroke-width="0.8" opacity="0.4"/><ellipse cx="15" cy="74" rx="4" ry="6" fill="none" stroke="#bdc3c7" stroke-width="1.5" opacity="0.5"/><path d="M36 84L40 112L52 112L52 84" fill="#3a3a4a" opacity="0.6"/><path d="M68 84L68 112L80 112L84 84" fill="#3a3a4a" opacity="0.6"/><path d="M40 112L38 132Q38 136 42 136L50 136" fill="#95a5a6" opacity="0.5"/><path d="M80 112L82 132Q82 136 78 136L70 136" fill="#95a5a6" opacity="0.5"/></svg>`, desc: 'Immovable fortress. Highest defense in all of Warfare.', bonusStat: 'def', bonusAmount: 18 },
    watchman: { name: 'Watchman', icon: '👁️', avatar: `<svg viewBox="0 0 120 160"><path d="M46 52Q46 40 60 40Q74 40 74 52L74 58Q78 58 78 62L78 68Q78 70 76 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L44 70Q42 70 42 68L42 62Q42 58 46 58Z" fill="#95a5a6" opacity="0.8"/><ellipse cx="60" cy="44" rx="10" ry="11" fill="#7f8c8d"/><path d="M50 38Q50 28 60 26Q70 28 70 38" fill="#3a3a4a" opacity="0.5"/><path d="M48 34L46 28M72 34L74 28M56 32L55 26M64 32L65 26" stroke="#95a5a6" stroke-width="1.2" stroke-linecap="round"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="2" ry="1" fill="#1a1a2e"/><ellipse cx="60" cy="36" rx="12" ry="6" fill="none" stroke="#bdc3c7" stroke-width="1.5" opacity="0.5"/><circle cx="60" cy="36" r="3.5" fill="#bdc3c7" opacity="0.4"/><path d="M34 56L28 64Q26 68 30 70L34 68" stroke="#95a5a6" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M86 56L92 64Q94 68 90 70L86 68" stroke="#95a5a6" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 86L40 108L52 108L52 86" fill="#3a3a4a" opacity="0.6"/><path d="M68 86L68 108L80 108L84 86" fill="#3a3a4a" opacity="0.6"/><path d="M40 108L38 128Q38 132 42 132L50 132" fill="#95a5a6" opacity="0.5"/><path d="M80 108L82 128Q82 132 78 132L70 132" fill="#95a5a6" opacity="0.5"/></svg>`, desc: 'Defensive sentinel. Counter-attacks with precision.', bonusStat: 'atk', bonusAmount: 10 },
    ironwall: { name: 'Ironwall', icon: '🛡️', avatar: `<svg viewBox="0 0 120 160"><path d="M42 48Q42 36 60 36Q78 36 78 48L78 56Q82 56 82 60L82 68Q82 70 80 70L72 70L72 80Q72 84 68 84L52 84Q48 84 48 80L48 70L40 70Q38 70 38 68L38 60Q38 56 42 56Z" fill="#95a5a6" opacity="0.82"/><ellipse cx="60" cy="40" rx="12" ry="13" fill="#7f8c8d"/><path d="M48 34Q50 24 60 22Q70 24 72 34" fill="#3a3a4a" opacity="0.6"/><path d="M52 40L54 38M66 40L68 38" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="43" rx="2" ry="1" fill="#1a1a2e"/><path d="M16 30L16 98Q16 108 26 108L26 30Z" fill="#95a5a6" opacity="0.65"/><path d="M16 42L26 42M16 54L26 54M16 66L26 66M16 78L26 78M16 90L26 90" stroke="#bdc3c7" stroke-width="0.8" opacity="0.4"/><ellipse cx="21" cy="74" rx="5" ry="7" fill="none" stroke="#bdc3c7" stroke-width="1.5" opacity="0.5"/><path d="M30 84L34 112L48 112L52 84" fill="#3a3a4a" opacity="0.7"/><path d="M68 84L68 112L84 112L88 84" fill="#3a3a4a" opacity="0.7"/><path d="M34 112L32 132Q32 136 36 136L48 136" fill="#95a5a6" opacity="0.5"/><path d="M84 112L86 132Q86 136 82 136L70 136" fill="#95a5a6" opacity="0.5"/></svg>`, desc: 'Damage soak. Absorbs hits meant for allies.', bonusStat: 'hp', bonusAmount: 18 },
    sentinel: { name: 'Sentinel', icon: '🗼', avatar: `<svg viewBox="0 0 120 160"><path d="M44 48Q44 36 60 36Q76 36 76 48L76 56Q80 56 80 60L80 68Q80 70 78 70L72 70L72 78Q72 82 68 82L52 82Q48 82 48 78L48 70L42 70Q40 70 40 68L40 60Q40 56 44 56Z" fill="#95a5a6" opacity="0.82"/><ellipse cx="60" cy="40" rx="11" ry="12" fill="#7f8c8d"/><path d="M49 34Q50 24 60 22Q70 24 71 34" fill="#3a3a4a" opacity="0.6"/><path d="M48 30L46 24M72 30L74 24" stroke="#95a5a6" stroke-width="1.2" stroke-linecap="round"/><path d="M52 40L54 38M66 40L68 38" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="43" rx="2" ry="1" fill="#1a1a2e"/><path d="M32 42L32 96Q32 104 40 104L40 42Z" fill="#95a5a6" opacity="0.6"/><path d="M80 42L80 96Q80 104 88 104L88 42Z" fill="#95a5a6" opacity="0.6"/><rect x="36" y="56" width="6" height="6" rx="1" fill="#bdc3c7" opacity="0.4"/><rect x="36" y="72" width="6" height="6" rx="1" fill="#bdc3c7" opacity="0.4"/><rect x="78" y="56" width="6" height="6" rx="1" fill="#bdc3c7" opacity="0.4"/><rect x="78" y="72" width="6" height="6" rx="1" fill="#bdc3c7" opacity="0.4"/><path d="M36 82L40 108L52 108L52 82" fill="#3a3a4a" opacity="0.6"/><path d="M68 82L68 108L80 108L84 82" fill="#3a3a4a" opacity="0.6"/><path d="M40 108L38 128Q38 132 42 132L50 132" fill="#95a5a6" opacity="0.5"/><path d="M80 108L82 128Q82 132 78 132L70 132" fill="#95a5a6" opacity="0.5"/></svg>`, desc: 'Tower guard. Immovable and unyielding.', bonusStat: 'def', bonusAmount: 12 }
  },
  scrupulous: {
    inquisitor: { name: 'Inquisitor', icon: '🔍', avatar: `<svg viewBox="0 0 120 160"><path d="M46 52Q46 40 60 40Q74 40 74 52L74 58Q78 58 78 62L78 68Q78 70 76 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L44 70Q42 70 42 68L42 62Q42 58 46 58Z" fill="#ecf0f1" opacity="0.82"/><ellipse cx="60" cy="44" rx="10" ry="11" fill="#bdc3c7"/><path d="M50 38Q50 28 60 26Q70 28 70 38" fill="#4a4a5a" opacity="0.5"/><path d="M48 34L46 28M72 34L74 28" stroke="#ecf0f1" stroke-width="1.2" stroke-linecap="round"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="2" ry="1" fill="#1a1a2e"/><path d="M84 46L90 40Q94 36 98 40L96 48L92 52Q90 54 86 52Z" fill="#ecf0f1" opacity="0.6"/><path d="M90 40L94 36M88 46L92 42" stroke="#fff" stroke-width="1" opacity="0.5"/><circle cx="88" cy="40" r="9" fill="none" stroke="#ecf0f1" stroke-width="1.5" opacity="0.5"/><circle cx="88" cy="40" r="4" fill="none" stroke="#ecf0f1" stroke-width="1" opacity="0.4"/><path d="M34 58L28 66Q26 70 30 72L34 70" stroke="#ecf0f1" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 86L40 108L52 108L52 86" fill="#4a4a5a" opacity="0.6"/><path d="M68 86L68 108L80 108L84 86" fill="#4a4a5a" opacity="0.6"/><path d="M40 108L38 128Q38 132 42 132L50 132" fill="#ecf0f1" opacity="0.4"/><path d="M80 108L82 128Q82 132 78 132L70 132" fill="#ecf0f1" opacity="0.4"/></svg>`, desc: 'Truth hunter. Guaranteed critical hits.', bonusStat: 'atk', bonusAmount: 15 },
    marksman: { name: 'Marksman', icon: '🎯', avatar: `<svg viewBox="0 0 120 160"><path d="M46 52Q46 40 60 40Q74 40 74 52L74 58Q78 58 78 62L78 68Q78 70 76 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L44 70Q42 70 42 68L42 62Q42 58 46 58Z" fill="#ecf0f1" opacity="0.82"/><ellipse cx="60" cy="44" rx="10" ry="11" fill="#bdc3c7"/><path d="M50 38Q50 28 60 26Q70 28 70 38" fill="#4a4a5a" opacity="0.5"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="2" ry="1" fill="#1a1a2e"/><path d="M84 38L92 30Q96 26 100 30L98 38L94 42Q92 44 88 42Z" fill="#ecf0f1" opacity="0.6"/><path d="M92 30L96 26M90 36L94 32" stroke="#fff" stroke-width="1" opacity="0.5"/><circle cx="92" cy="36" r="7" fill="none" stroke="#ecf0f1" stroke-width="1.5" opacity="0.5"/><circle cx="92" cy="36" r="3.5" fill="none" stroke="#ecf0f1" stroke-width="1" opacity="0.4"/><circle cx="92" cy="36" r="1.5" fill="#ecf0f1" opacity="0.6"/><line x1="86" y1="36" x2="98" y2="36" stroke="#ecf0f1" stroke-width="0.8" opacity="0.4"/><line x1="92" y1="30" x2="92" y2="42" stroke="#ecf0f1" stroke-width="0.8" opacity="0.4"/><path d="M34 58L28 66Q26 70 30 72L34 70" stroke="#ecf0f1" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 86L40 108L52 108L52 86" fill="#4a4a5a" opacity="0.6"/><path d="M68 86L68 108L80 108L84 86" fill="#4a4a5a" opacity="0.6"/><path d="M40 108L38 128Q38 132 42 132L50 132" fill="#ecf0f1" opacity="0.4"/><path d="M80 108L82 128Q82 132 78 132L70 132" fill="#ecf0f1" opacity="0.4"/></svg>`, desc: 'Precision striker. Highest crit rate.', bonusStat: 'spd', bonusAmount: 15 },
    judge: { name: 'Judge', icon: '⚖️', avatar: `<svg viewBox="0 0 120 160"><path d="M46 54Q46 42 60 42Q74 42 74 54L74 58Q78 58 78 62L78 70Q78 72 76 72L68 72L68 82Q68 86 64 86L56 86Q52 86 52 82L52 72L44 72Q42 72 42 70L42 62Q42 58 46 58Z" fill="#ecf0f1" opacity="0.82"/><ellipse cx="60" cy="46" rx="10" ry="11" fill="#bdc3c7"/><path d="M50 40Q50 30 60 28Q70 30 70 40" fill="#4a4a5a" opacity="0.5"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="2" ry="1" fill="#1a1a2e"/><rect x="50" y="8" width="20" height="14" rx="2" fill="none" stroke="#ecf0f1" stroke-width="1.5" opacity="0.6"/><line x1="60" y1="22" x2="60" y2="38" stroke="#ecf0f1" stroke-width="1.5"/><path d="M56 12L60 8L64 12" fill="none" stroke="#ecf0f1" stroke-width="1" opacity="0.5"/><path d="M36 58L30 66Q28 70 32 72L36 70" stroke="#ecf0f1" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M84 58L90 66Q92 70 88 72L84 70" stroke="#ecf0f1" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 88L40 110L52 110L52 88" fill="#4a4a5a" opacity="0.55"/><path d="M68 88L68 110L80 110L84 88" fill="#4a4a5a" opacity="0.55"/><path d="M40 110L38 130Q38 134 42 134L50 134" fill="#ecf0f1" opacity="0.4"/><path d="M80 110L82 130Q82 134 78 134L70 134" fill="#ecf0f1" opacity="0.4"/></svg>`, desc: 'Sentence-giver. Bonus damage to debuffed enemies.', bonusStat: 'spAtk', bonusAmount: 12 },
    executioner: { name: 'Executioner', icon: '🗡️', avatar: `<svg viewBox="0 0 120 160"><path d="M44 50Q44 38 60 38Q76 38 76 50L76 56Q80 56 80 60L80 66Q80 68 78 68L70 68L70 80Q70 84 66 84L54 84Q50 84 50 80L50 68L42 68Q40 68 40 66L40 60Q40 56 44 56Z" fill="#ecf0f1" opacity="0.82"/><ellipse cx="60" cy="42" rx="10" ry="11" fill="#bdc3c7"/><path d="M50 36Q50 26 60 24Q70 26 70 36" fill="#4a4a5a" opacity="0.5"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="2" ry="1" fill="#1a1a2e"/><path d="M80 44L80 56Q80 60 84 60L88 60L88 52L92 48L92 44L88 40L84 40L80 44Z" fill="#ecf0f1" opacity="0.6"/><path d="M88 40L96 36L96 44L88 48" fill="#ecf0f1" opacity="0.5"/><path d="M80 60L80 96" stroke="#ecf0f1" stroke-width="3"/><path d="M34 84L38 108L50 108L52 84" fill="#4a4a5a" opacity="0.6"/><path d="M68 84L68 108L80 108L84 84" fill="#4a4a5a" opacity="0.6"/><path d="M38 108L36 128Q36 132 40 132L50 132" fill="#ecf0f1" opacity="0.4"/><path d="M80 108L82 128Q82 132 78 132L68 132" fill="#ecf0f1" opacity="0.4"/></svg>`, desc: 'Finishing blow. Devastating to low HP foes.', bonusStat: 'atk', bonusAmount: 10 }
  },
  spunk: {
    wildcard: { name: 'Wildcard', icon: '🃏', avatar: `<svg viewBox="0 0 120 160"><path d="M46 52Q46 40 60 40Q74 40 74 52L74 56Q78 56 78 60L78 68Q78 70 76 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L44 70Q42 70 42 68L42 60Q42 56 46 56Z" fill="#e67e22" opacity="0.82"/><ellipse cx="60" cy="44" rx="10" ry="11" fill="#d35400"/><path d="M50 38Q50 28 60 26Q70 28 70 38" fill="#5a3a0a" opacity="0.5"/><path d="M48 34L44 28M72 34L76 28M56 32L55 26M64 32L65 26" stroke="#e67e22" stroke-width="1.2" stroke-linecap="round"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="2" ry="1" fill="#1a1a2e"/><path d="M80 46L90 40L94 46L90 52L80 48Z" fill="#e67e22" opacity="0.55"/><path d="M30 46L20 40L16 46L20 52L30 48Z" fill="#e67e22" opacity="0.55"/><text x="86" y="47" font-size="9" fill="#ffb347" opacity="0.6" font-family="serif">A</text><text x="18" y="47" font-size="9" fill="#ffb347" opacity="0.6" font-family="serif">K</text><path d="M36 84L40 108L52 108L52 84" fill="#5a3a0a" opacity="0.6"/><path d="M68 84L68 108L80 108L84 84" fill="#5a3a0a" opacity="0.6"/><path d="M40 108L38 128Q38 132 42 132L50 132" fill="#e67e22" opacity="0.4"/><path d="M80 108L82 128Q82 132 78 132L70 132" fill="#e67e22" opacity="0.4"/></svg>`, desc: 'Chaos agent. Random bonus effects every turn.', bonusStat: 'spd', bonusAmount: 15 },
    ronin: { name: 'Ronin', icon: '⚡', avatar: `<svg viewBox="0 0 120 160"><path d="M46 52Q46 40 60 40Q74 40 74 52L74 58Q78 58 78 62L78 68Q78 70 76 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L44 70Q42 70 42 68L42 62Q42 58 46 58Z" fill="#e67e22" opacity="0.82"/><ellipse cx="60" cy="44" rx="10" ry="11" fill="#d35400"/><path d="M50 38Q50 28 60 26Q70 28 70 38" fill="#5a3a0a" opacity="0.5"/><path d="M48 34L46 28M72 34L74 28" stroke="#e67e22" stroke-width="1.2" stroke-linecap="round"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="2" ry="1" fill="#1a1a2e"/><path d="M80 44L80 54Q80 58 84 58L88 58L88 50L92 46L92 42L88 38L84 38L80 44Z" fill="#e67e22" opacity="0.6"/><path d="M88 38L96 34L96 42L88 46" fill="#e67e22" opacity="0.5"/><path d="M80 58L80 92" stroke="#e67e22" stroke-width="3"/><path d="M60 32L58 26L60 22L62 26Z" fill="#ffb347" opacity="0.5"/><path d="M56 24L52 18M64 24L68 18M60 22L60 14" stroke="#ffb347" stroke-width="1.5" stroke-linecap="round"/><path d="M34 84L38 108L50 108L52 84" fill="#5a3a0a" opacity="0.6"/><path d="M68 84L68 108L80 108L84 84" fill="#5a3a0a" opacity="0.6"/><path d="M38 108L36 128Q36 132 40 132L50 132" fill="#e67e22" opacity="0.4"/><path d="M80 108L82 128Q82 132 78 132L68 132" fill="#e67e22" opacity="0.4"/></svg>`, desc: 'Unpredictable fighter. High risk, high reward.', bonusStat: 'atk', bonusAmount: 15 },
    trickster: { name: 'Trickster', icon: '🎭', avatar: `<svg viewBox="0 0 120 160"><path d="M46 52Q46 40 60 40Q74 40 74 52L74 56Q78 56 78 60L78 68Q78 70 76 70L68 70L68 80Q68 84 64 84L56 84Q52 84 52 80L52 70L44 70Q42 70 42 68L42 60Q42 56 46 56Z" fill="#e67e22" opacity="0.82"/><ellipse cx="60" cy="44" rx="10" ry="11" fill="#d35400"/><path d="M50 38Q50 28 60 26Q70 28 70 38" fill="#5a3a0a" opacity="0.5"/><path d="M52 44L54 42M66 44L68 42" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="47" rx="2" ry="1" fill="#1a1a2e"/><path d="M42 38Q36 32 42 26Q50 22 54 28" fill="#e67e22" opacity="0.4"/><path d="M78 38Q84 32 78 26Q70 22 66 28" fill="#e67e22" opacity="0.4"/><path d="M48 40Q50 34 54 36" fill="#ffb347" opacity="0.4"/><path d="M72 40Q70 34 66 36" fill="#ffb347" opacity="0.4"/><circle cx="54" cy="40" r="1.5" fill="#e67e22" opacity="0.6"/><circle cx="66" cy="40" r="1.5" fill="#e67e22" opacity="0.6"/><path d="M54 44Q60 48 66 44" fill="none" stroke="#e67e22" stroke-width="1" opacity="0.5"/><path d="M34 56L28 64Q26 68 30 70L34 68" stroke="#e67e22" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M86 56L92 64Q94 68 90 70L86 68" stroke="#e67e22" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M36 84L40 108L52 108L52 84" fill="#5a3a0a" opacity="0.6"/><path d="M68 84L68 108L80 108L84 84" fill="#5a3a0a" opacity="0.6"/><path d="M40 108L38 128Q38 132 42 132L50 132" fill="#e67e22" opacity="0.4"/><path d="M80 108L82 128Q82 132 78 132L70 132" fill="#e67e22" opacity="0.4"/></svg>`, desc: 'Debuffer. Confuses and misdirects enemies.', bonusStat: 'spAtk', bonusAmount: 12 },
    berserker: { name: 'Berserker', icon: '🔥', avatar: `<svg viewBox="0 0 120 160"><path d="M44 50Q44 38 60 38Q76 38 76 50L76 56Q80 56 80 60L80 66Q80 68 78 68L70 68L70 80Q70 84 66 84L54 84Q50 84 50 80L50 68L42 68Q40 68 40 66L40 60Q40 56 44 56Z" fill="#e67e22" opacity="0.85"/><ellipse cx="60" cy="42" rx="11" ry="12" fill="#d35400"/><path d="M49 36Q50 26 60 24Q70 26 71 36" fill="#5a3a0a" opacity="0.6"/><path d="M46 32L42 24M74 32L78 24" stroke="#e67e22" stroke-width="2" stroke-linecap="round"/><path d="M52 42L54 40M66 42L68 40" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="45" rx="2" ry="1" fill="#1a1a2e"/><path d="M80 44L88 38L92 40L90 48L86 52L80 50Z" fill="#e67e22" opacity="0.7"/><path d="M88 38L92 36M90 44L94 42" stroke="#ffb347" stroke-width="1" opacity="0.6"/><path d="M80 50L80 92" stroke="#e67e22" stroke-width="3.5"/><path d="M60 32L56 26L60 22L64 26Z" fill="#ffb347" opacity="0.6"/><path d="M56 24L52 18M64 24L68 18M60 22L60 14" stroke="#ffb347" stroke-width="1.5" stroke-linecap="round"/><path d="M32 84L36 108L48 108L52 84" fill="#5a3a0a" opacity="0.7"/><path d="M68 84L68 108L80 108L86 84" fill="#5a3a0a" opacity="0.7"/><path d="M36 108L34 126Q34 130 38 130L48 130" fill="#e67e22" opacity="0.5"/><path d="M80 108L82 126Q82 130 78 130L68 130" fill="#e67e22" opacity="0.5"/></svg>`, desc: 'Glass cannon. Devastating damage but fragile.', bonusStat: 'atk', bonusAmount: 10 }
  }
};

const DECEPTION = {
  lust: {
    id: 'lust', name: 'Lust', title: 'The Tempter',
    color: '#e91e63', icon: '💋',
    description: 'Master of desire and manipulation. Lust bends wills and corrupts the purest hearts.',
    stats: { hp: 85, atk: 70, def: 60, spd: 85, spAtk: 90 },
    specialMove: 'Charm', specialDesc: 'Has a 40% chance to make an ally attack their own party member',
    isBoss: false
  },
  lie: {
    id: 'lie', name: 'Lie', title: 'The Deceiver',
    color: '#7c4dff', icon: '🤥',
    description: 'Weaver of illusions and false truths. Lie makes you see what isn\'t and believe what can\'t be.',
    stats: { hp: 75, atk: 65, def: 55, spd: 90, spAtk: 95 },
    specialMove: 'Mirror Image', specialDesc: 'Creates 2 copies of itself; only the real one can be hit',
    isBoss: false
  },
  greed: {
    id: 'greed', name: 'Greed', title: 'The Corruptor',
    color: '#ffd700', icon: '💰',
    description: 'Hoards all things and starves the world. Greed drains resources and turns allies against each other.',
    stats: { hp: 95, atk: 75, def: 70, spd: 60, spAtk: 80 },
    specialMove: 'Siphon', specialDesc: 'Steals 30% of target\'s HP and adds it to its own',
    isBoss: false
  },
  wrath: {
    id: 'wrath', name: 'Wrath', title: 'The Destroyer',
    color: '#ff1744', icon: '😡',
    description: 'Pure, unbridled rage incarnate. Wrath obliterates everything in its path with devastating force.',
    stats: { hp: 100, atk: 100, def: 50, spd: 70, spAtk: 65 },
    specialMove: 'Rampage', specialDesc: 'Hits ALL party members for massive damage, but reduces its own defense',
    isBoss: false
  },
  envy: {
    id: 'envy', name: 'Envy', title: 'The Coveter',
    color: '#00c853', icon: '🐍',
    description: 'Covets what others possess and steals their power. Envy can copy any ability used against it.',
    stats: { hp: 80, atk: 80, def: 65, spd: 80, spAtk: 85 },
    specialMove: 'Mimic', specialDesc: 'Copies the last special move used by any character and uses it at 120% power',
    isBoss: false
  },
  pride: {
    id: 'pride', name: 'Pride', title: 'The Sovereign',
    color: '#ff6d00', icon: '👑',
    description: 'The self-proclaimed ruler of Deception. Pride is devastatingly powerful but its arrogance is its undoing.',
    stats: { hp: 120, atk: 95, def: 80, spd: 65, spAtk: 90 },
    specialMove: 'Imperial Decree', specialDesc: 'Deals massive damage to one target, but skips its next turn due to overconfidence',
    isBoss: true
  },
  sloth: {
    id: 'sloth', name: 'Sloth', title: 'The Hollow',
    color: '#546e7a', icon: '😴',
    description: 'The embodiment of apathy and despair. Sloth drains the will to fight, making enemies too tired to act.',
    stats: { hp: 110, atk: 50, def: 85, spd: 30, spAtk: 95 },
    specialMove: 'Despair Aura', specialDesc: 'All enemies lose 20% of their max energy and have their speed halved for 3 turns',
    isBoss: true
  }
};

const DECEPTION_ARMY = [
  { ...DECEPTION.lust, level: 5 },
  { ...DECEPTION.lie, level: 5 },
  { ...DECEPTION.greed, level: 6 },
  { ...DECEPTION.wrath, level: 7 },
  { ...DECEPTION.envy, level: 6 },
  { ...DECEPTION.pride, level: 8 },
  { ...DECEPTION.sloth, level: 8 }
];

const CLASS_TYPES = {
  warrior: { name: 'Warrior', icon: '⚔️', desc: 'High attack, solid HP. Front-line damage dealer.', bonusStat: 'atk', bonusAmount: 10 },
  healer: { name: 'Healer', icon: '💚', desc: 'Support specialist. Heals allies and boosts morale.', bonusStat: 'spAtk', bonusAmount: 10 },
  rogue: { name: 'Rogue', icon: '🗡️', desc: 'Fast and deadly. High crit chance, low defense.', bonusStat: 'spd', bonusAmount: 10 },
  guardian: { name: 'Guardian', icon: '🛡️', desc: 'The wall. Massive HP and defense, absorbs damage.', bonusStat: 'def', bonusAmount: 10 },
  strategist: { name: 'Strategist', icon: '📖', desc: 'Balanced stats with strong special attacks.', bonusStat: 'spAtk', bonusAmount: 15 },
  berserker: { name: 'Berserker', icon: '🔥', desc: 'Glass cannon. Devastating damage but fragile.', bonusStat: 'atk', bonusAmount: 15 },
  paladin: { name: 'Paladin', icon: '⚜️', desc: 'Holy warrior. Heals and fights in equal measure.', bonusStat: 'hp', bonusAmount: 15 },
  hunter: { name: 'Hunter', icon: '🏹', desc: 'Precision striker. Highest critical hit rate.', bonusStat: 'spd', bonusAmount: 12 }
};

/* ROLE PROGRESSION, the calling each class walks between competitions.
   Every class is mapped to one of four archetypes. Each archetype owns a
   six-node talent tree (3 ranks each). Talent ranks are read out of combat
   clones in combat.js; role XP and skill points live on party members. */
const ROLE_ARCHETYPES = {
  striker:  { name: 'Blade', unit: 'Striker', icon: '🗡️', color: '#e74c3c', desc: 'Pure offense. Strikes, slays, and breaks the line.' },
  bulwark:  { name: 'Wall', unit: 'Bulwark', icon: '🛡️', color: '#95a5a6', desc: 'Protection. Holds the line and takes the hits.' },
  mender:   { name: 'Hand', unit: 'Mender', icon: '💚', color: '#2ecc71', desc: 'Life. Heals the wounded and pulls allies from the brink.' },
  schemer:  { name: 'Mind', unit: 'Schemer', icon: '🎭', color: '#9b59b6', desc: 'Manipulation. Debuffs enemies and bends the battle.' }
};

const ROLE_TREES = {
  striker: {
    tiers: [
      [ 'keenedge', 'executioner', 'bloodrush' ],
      [ 'overwhelm', 'precision' ],
      [ 'adrenaline' ]
    ],
    nodes: {
      keenedge:   { name: 'Keen Edge', tier: 1, icon: '⚡', vals: [5, 10, 15], desc: '+5/10/15% Critical chance' },
      executioner: { name: 'Executioner', tier: 1, icon: '💀', vals: [15, 30, 50], desc: '+15/30/50% damage against enemies below 30% HP' },
      bloodrush:  { name: 'Bloodrush', tier: 1, icon: '🩸', vals: [15, 25, 40], desc: 'Heal for 15/25/40% of damage inflicted by a killing blow' },
      overwhelm:  { name: 'Overwhelm', tier: 2, icon: '💥', vals: [10, 20, 30], desc: '+10/20/30% damage against enemies at full HP' },
      precision:  { name: 'True Precision', tier: 2, icon: '🎯', vals: [15, 30, 50], desc: 'Critical hits deal +15/30/50% bonus damage' },
      adrenaline: { name: 'Adrenaline', tier: 3, icon: '🔥', vals: [10, 20, 30], desc: '+10/20/30% damage while Energy is above 80' }
    }
  },
  bulwark: {
    tiers: [
      [ 'bulwark', 'unbreakable', 'harden' ],
      [ 'aegis', 'counter' ],
      [ 'fortify' ]
    ],
    nodes: {
      bulwark:    { name: 'Bulwark', tier: 1, icon: '🏰', vals: [15, 30, 50], desc: 'Defend grants +15/30/50% more shield' },
      unbreakable: { name: 'Unbreakable', tier: 1, icon: '⛰️', vals: [15, 25, 40], desc: '+15/25/40% Defense while below 30% HP' },
      harden:     { name: 'Harden', tier: 1, icon: '🪨', vals: [5, 10, 15], desc: 'Take 5/10/15% less damage' },
      aegis:      { name: 'Aegis Stance', tier: 2, icon: '🛡️', vals: [20, 35, 50], desc: 'Defend also shields the weakest ally for 20/35/50% of your shield' },
      counter:    { name: 'Counter', tier: 2, icon: '⚔️', vals: [20, 35, 50], desc: 'Reflect 20/35/50% of damage back at the attacker' },
      fortify:    { name: 'Fortify', tier: 3, icon: '🗼', vals: [10, 20, 30], desc: 'Using your Special grants +10/20/30 Defense for 2 turns' }
    }
  },
  mender: {
    tiers: [
      [ 'mend', 'sooth', 'invigorate' ],
      [ 'polished', 'grace' ],
      [ 'rebirth' ]
    ],
    nodes: {
      mend:       { name: 'Mend', tier: 1, icon: '💚', vals: [15, 30, 50], desc: '+15/30/50% healing power' },
      sooth:      { name: 'Soothing Touch', tier: 1, icon: '🌿', vals: [1, 2, 3], desc: 'Healing removes 1/2/3 debuffs from the target' },
      invigorate: { name: 'Invigorate', tier: 1, icon: '⚡', vals: [10, 20, 30], desc: 'Gain 10/20/30 Energy when you heal' },
      polished:   { name: 'Polished Light', tier: 2, icon: '✨', vals: [30, 50, 70], desc: 'Overhealing converts 30/50/70% to a shield' },
      grace:      { name: 'Warding Grace', tier: 2, icon: '🕊️', vals: [10, 20, 30], desc: 'Healing an ally below 30% HP grants them +10/20/30 Attack for 2 turns' },
      rebirth:    { name: 'Rebirth', tier: 3, icon: '🌈', vals: [25, 40, 50], desc: 'Once per battle, revive a fallen ally at 25/40/50% HP' }
    }
  },
  schemer: {
    tiers: [
      [ 'deepen', 'sap', 'demoralize' ],
      [ 'entangle', 'mystify' ],
      [ 'hex' ]
    ],
    nodes: {
      deepen:     { name: 'Deepen', tier: 1, icon: '⏳', vals: [1, 2, 3], desc: 'Your debuffs last 1/2/3 extra turns' },
      sap:        { name: 'Energy Sap', tier: 1, icon: '🕸️', vals: [5, 10, 15], desc: 'Debuffed enemies lose 5/10/15 Energy' },
      demoralize: { name: 'Demoralize', tier: 1, icon: '👎', vals: [5, 10, 15], desc: 'Debuffing an enemy drains 5/10/15 morale' },
      entangle:   { name: 'Entangle', tier: 2, icon: '🌀', vals: [10, 20, 30], desc: '+10/20/30% damage against debuffed enemies' },
      mystify:    { name: 'Mystify', tier: 2, icon: '🔮', vals: [8, 16, 25], desc: '+8/16/25% crit chance against debuffed enemies' },
      hex:        { name: 'Hex', tier: 3, icon: '🕯️', vals: [5, 10, 15], desc: 'Gain 5/10/15 HP whenever you apply a debuff' }
    }
  }
};

/* Every class id (KINGDOM_CLASSES + CLASS_TYPES + recruitable style names)
   resolves to one of the four archetypes above. */
const CLASS_ROLE = {
  mender: 'mender', warden: 'bulwark', spiritweaver: 'mender', bulwark: 'bulwark',
  diplomat: 'schemer', sentinel: 'bulwark', arbitrer: 'schemer', bondsworn: 'schemer',
  whisper: 'striker', phantom: 'schemer', broker: 'schemer', shadowguard: 'bulwark',
  vanguard: 'striker', warcry: 'schemer', ironfist: 'bulwark', bloodrager: 'striker',
  arbiter: 'schemer', templar: 'mender', justiciar: 'striker', peacemaker: 'mender',
  bastion: 'bulwark', watchman: 'bulwark', ironwall: 'bulwark',
  inquisitor: 'schemer', marksman: 'striker', judge: 'schemer', executioner: 'striker',
  wildcard: 'schemer', ronin: 'striker', trickster: 'schemer', berserker: 'striker',
  warrior: 'striker', healer: 'mender', rogue: 'striker', guardian: 'bulwark',
  strategist: 'schemer', paladin: 'mender', hunter: 'striker',
  tank: 'bulwark', cleric: 'mender', assassin: 'striker'
};

/* Titles shown for role levels. */
const ROLE_TITLES = [
  { at: 1, title: 'Novice' },
  { at: 3, title: 'Adept' },
  { at: 5, title: 'Expert' },
  { at: 7, title: 'Master' },
  { at: 9, title: 'Grandmaster' },
  { at: 11, title: 'Legend' }
];

const roleTitleFor = (roleLevel) => {
  let t = 'Novice';
  ROLE_TITLES.forEach(r => { if (roleLevel >= r.at) t = r.title; });
  return t;
};

/* Role practice drills, focused duels for the off-season. */
const ROLE_DRILLS = {
  striker: { name: 'The Gauntlet', icon: '🗡️', color: '#e74c3c', desc: 'A reinforced practice colossus. Break it with pure offense.', scenario: 'The yard master raises a wooden colossus with a warship\'s hide. A single bell marks the time.', objective: 'Bring it down before the day-bell, pure offense, no mercy.' },
  bulwark: { name: 'The Last Gate', icon: '🛡️', color: '#95a5a6', desc: 'Three blade-brothers rush the line at once. Hold.', scenario: 'The gate-end of the courtyard smells of oiled shield and wet stone. Three veterans rush you as one.', objective: 'End the drill with your own banner still planted, hold the gate.' },
  mender:  { name: 'Grim Ward', icon: '💚', color: '#2ecc71', desc: 'The wounded come down from the ridge. Bring them home.', scenario: 'The infirmary is short of hands. Two bloodied practice-mates are brought in, one barely stands.', objective: 'No ally falls in the ward tonight. Keep them standing to the bell.' },
  schemer: { name: 'The Quiet Game', icon: '🎭', color: '#9b59b6', desc: 'Two rival tricksters cross blades and words. Out-think them.', scenario: 'Two rival tricksters ask to "spar", the hall favors anyone who makes them look foolish.', objective: 'Control the fight and humiliate both, beat them while taking the least harm.' }
};

/* Off-season flavor text, what a champion does between competitions. */
const ROLE_OFFSEASON = {
  striker: [
    'You rise before the sun to spar against the shadow-posts.',
    'The old dueling master claims your gains are "adequate". You disagree.',
    'You stack stones to mark every kill in the training yard.',
    'Rain falls. You do not stop. The path does not care for rain.'
  ],
  bulwark: [
    'You hold the inner gate against three recruits until the dinner bell.',
    'Splinters in your palms, shields in your soul.',
    'The wall remembers every blow you never let past.',
    'You polish your shield until it shines like a promise.'
  ],
  mender: [
    'The infirmary smells of herbs and quiet. You belong there.',
    'You sit with the wounded and learn the names of their mothers.',
    'Cautery, bandage, suture, the holy trinity of the hand.',
    'A child gifts you a wilted flower. You mend it back to life.'
  ],
  schemer: [
    'You read the envoys\' letters three times for what they do not say.',
    'Two traders both think you favor them. You favor the truth.',
    'You set a trap of words in the common hall and watch it spring.',
    'The court jester bows to you. That is not an accident.'
  ]
};

const ROLE_OFFSEASON_TITLE = {
  striker: 'The Yard',
  bulwark: 'The Wall',
  mender: 'The Infirmary',
  schemer: 'The Court'
};

const ITEMS = {
  healthPotion: { id: 'healthPotion', name: 'Health Potion', icon: '🧪', desc: 'Restores 50 HP', price: 25, effect: { type: 'heal', amount: 50 } },
  manaElixir: { id: 'manaElixir', name: 'Mana Elixir', icon: '⚡', desc: 'Restores 30 Energy', price: 30, effect: { type: 'energy', amount: 30 } },
  ironShield: { id: 'ironShield', name: 'Iron Shield', icon: '🛡️', desc: '+15 Defense permanently', price: 100, effect: { type: 'stat', stat: 'def', amount: 15 } },
  sharpBlade: { id: 'sharpBlade', name: 'Sharp Blade', icon: '🗡️', desc: '+15 Attack permanently', price: 100, effect: { type: 'stat', stat: 'atk', amount: 15 } },
  speedBoots: { id: 'speedBoots', name: 'Swift Boots', icon: '👢', desc: '+15 Speed permanently', price: 100, effect: { type: 'stat', stat: 'spd', amount: 15 } },
  reviveStone: { id: 'reviveStone', name: 'Revive Stone', icon: '💎', desc: 'Revives one ally with 50% HP in battle', price: 150, effect: { type: 'revive', amount: 0.5 } },
  warBanner: { id: 'warBanner', name: 'War Banner', icon: '🏴', desc: '+20% attack for entire party in next battle', price: 200, effect: { type: 'buff', stat: 'atk', amount: 0.2 } },
  crisisArmor: { id: 'crisisArmor', name: 'Crisis Armor', icon: '🔰', desc: 'Reduces damage taken by 25% when below 30% HP', price: 250, effect: { type: 'passive', id: 'crisis' } }
};

const STORY = {
  intro: [
    "In the beginning, there was The Convergence, a single, unified kingdom where all virtues lived as one.",
    "Peace reigned for a thousand years under the guidance of the Mirror of Truth, a relic that reflected the purest intentions of every soul.",
    "But envy festered in the shadows. A warlord named Zeroth sought to shatter the Mirror and claim its power for himself.",
    "The Mirror cracked. And from its shards, the world fractured into eight.",
    "Each fragment carried a single virtue, pure, powerful, and isolated from the rest.",
    "From these fragments rose eight kingdoms, each believing their virtue was the true path.",
    "And from the dark shards of the Mirror... Deception was born.",
    "Now, the eight kingdoms of Warfare face a common enemy. But first, they must prove who is worthy to lead.",
    "Every year, the Annual Competition decides which kingdom rules them all.",
    "This year... you will fight."
  ],
  kingdomIntros: {
    altruism: "You stand in the Gardens of Mercy, where the wounded come to heal. The elders of Altruism have chosen you to represent their virtue in the Competition. 'Remember,' they say, 'the strongest sword is the one that protects, not destroys.'",
    accord: "The Council of Accord has summoned you to the Hall of Unity. 'The Competition approaches,' the Speaker declares. 'We need a champion who can unite, not divide. Someone who sees strategy in every word and power in every alliance.'",
    rapport: "In the shadowed chambers of the Bond Network, you've been selected. 'We know everything about everyone,' the Network whispers. 'Now we need someone who can use that knowledge. The Competition is just the beginning, Deception is coming.'",
    valor: "The Arena of the Fearless roars with anticipation. Warriors line the walls, each one a potential champion. But the generals have chosen YOU. 'Valor doesn't just fight,' they say. 'Valor inspires. Go show them what fearless really means.'",
    clement: "The Temple of Balance is quiet, as always. The judges of Clement have deliberated and reached their verdict: you. 'Justice is not about punishment,' the High Judge tells you. 'It's about knowing when to show mercy and when to draw the line.'",
    vigilant: "The Watchtower of Eternity has seen everything. And its sentinels have seen something in you. 'You never sleep,' the Commander says. 'You never falter. The Competition needs a wall that cannot be broken. Be that wall.'",
    scrupulous: "The Archives of Truth stretch endlessly, filled with every secret ever uncovered. The Inquisitors have reviewed every candidate. 'Only one emerged clean,' they say, pointing to you. 'Justice Above All, remember that motto. It will guide you.'",
    spunk: "The Chaos Colosseum is... well, it's chaos. But somehow, the council of wild cards has picked you. 'Look, we don't do speeches,' they say. 'Just go out there and do something so audacious that nobody sees it coming. That's kind of our thing.'"
  },
  competitionIntro: "The trumpet sounds across all eight kingdoms. The Annual Competition has begun! Representatives from each kingdom will face off in three rounds of increasingly intense combat. The kingdom that proves itself strongest will rule Warfare for the coming year.\n\nThe Competition decides the year. But the Crown decides the Age, only the champion who outgrows their role may take the Arena's mirror and rule. Prove the year first.\n\nBut beware, Deception watches from the shadows, waiting for the victor to let their guard down.",
  competitionRound1: "ROUND 1: SINGLE COMBAT\n\nOne champion from each kingdom faces off in the Arena of Virtues. Only the strongest will advance.",
  competitionRound2: "ROUND 2: TACTICAL BATTLE\n\nParty-based combat. Coordination and strategy separate the merely strong from the truly powerful.",
  competitionRound3: "ROUND 3: THE HUNT of the Closing Bell\n\nArena steel goes quiet. The final two kingdoms are freed from the glass, but not from each other. Each must recover the hidden relic their kingdom keeps by covenant, and lay it before the Arena's mirror. First relic to the mirror wins the year.",
  competitionHuntIntro: "ROUND 3: THE HUNT of the Closing Bell\n\nThe final two kingdoms are sent beyond the arena wall. Beyond the bell-road lies the marker of {RELIC_NAME}, hidden by covenant, sealed until the horns of the closing bell. Whoever lays their relic at the Arena's foot first wins the Age.\n\nThere is a law older than the relic: a champion who carried the arena's rounds is forbidden to touch it. Fresh hands only.",
  competitionHuntSummon: "Every hand in your party has already bled in this arena, the warden's clerk reads the rule aloud and crosses off each name. No fresh champion walks with you.\n\nYou must summon one at the Champion Hall, then return to the gate when the hunt's bell sounds.",
  competitionHuntDeliver: "The {RELIC_NAME} rests at the Arena's foot. The mirror accepts it. The closing bell sounds once, and the year belongs to your kingdom.",
  competitionHuntSetback: "The rival's champion strikes the relic loose from the hunt, not to steal it, but to scatter it. The relic is not lost. It is merely unclaimed. A beaten champion does not surrender a relic; it must be won again with the same hands.",
  huntTrick: [
    { prompt: `A cloaked rider, too clean for the road, reads your kingdom's seal from memory. "Your relic was moved at dawn to the Hollow Reach," they say, "straight toward the rival's camp." Their hands are soft; their scent is the rival court's spice.`, falseOption: 'Ride to the Hollow Reach', trueOption: 'Hold the old path' },
    { prompt: `A wounded scout staggers toward you, bleeding through a bandage that is far too new. "The finalist knows your vault," she gasps. "They'll lift the relic from the crypt unless you divert." The wound is wax; the bandage is theater.`, falseOption: 'Divert to the crypt', trueOption: 'Stay true to the trail' }
  ],
  victory: "The crowd erupts as your kingdom's banner flies highest! You have proven your virtue is the strongest.\n\nBut as the celebrations begin, the ground trembles. From the east, a dark horde emerges, Deception has come to claim the exhausted victor.\n\nThe real battle begins now.",
  defeat: "Your kingdom falls in the Competition. The crowd grows silent.\n\nBut the elders place a hand on your shoulder. 'Defeat is not the end,' they say. 'Every virtue was born from failure. Rise. Train. Return stronger.'\n\nYou may have lost the Competition, but the war against Deception is still to come.",
  intelReports: [
    "Scouts report that Deception's forces are massing near the Border of Shadows. They're waiting for the Competition to weaken us.",
    "A spy intercepted a message: Lust has been infiltrating the eastern kingdoms, turning their champions against each other.",
    "Lie has been spreading false rumors about the Competition's fairness. Several kingdoms are questioning the results before they've even begun.",
    "Wrath has been sighted gathering an army of corrupted beasts. When it attacks, it will be devastating.",
    "Pride and Sloth have formed an unlikely alliance. Pride's power combined with Sloth's despair aura could be catastrophic.",
    "Greed has been offering kingdoms forbidden power in exchange for allegiance. Some have accepted.",
    "Envy has been copying the abilities of our strongest warriors. We need to develop new tactics.",
    "The Shadow Council of Deception has seven seats, one for each virtue they've corrupted. Only one seat remains empty."
  ],
  victoryMessages: {
    valor: "Valor's banner soars above the battlefield! The warriors have proven that fearlessness is the true path to victory!",
    accord: "Accord's strategy prevails! Through unity and coordination, they have shown that together, we are unstoppable!",
    rapport: "Rapport's intelligence network proved decisive! Knowledge truly is power when wielded by the connected!",
    altruism: "Altruism's compassion triumphs! By lifting others, they have risen highest of all!",
    clement: "Clement's balanced approach wins the day! Neither too harsh nor too lenient, perfectly judged!",
    vigilant: "Vigilant's unyielding defense holds! Like a mountain against the storm, they could not be moved!",
    scrupulous: "Scrupulous's precision strikes true! With justice as their guide, every blow found its mark!",
    spunk: "Spunk's audacious gamble pays off! Against all odds and expectations, chaos reigns supreme!"
  },

  /* ---- Endgame: Deception's Final War ---- */
  finalWarIntro: [
    'The last crown of the last Age rests on your brow for exactly one breath.',
    'Then the Arena of Virtues dims. The seven lieutenants of Deception stand in a ring around it, patient, silent, hungry.',
    '"You wore the crown. You proved the mirror. Good," the shadow says. "Now prove the world." Wave by wave, Deception comes.'
  ],
  finalWarWave1: 'WAVE 1, THE HUNGER. Lust, Greed and Wrath charge the ring. The crowd has not yet decided whether it is watching champions, or feeding this.',
  finalWarWave2: 'WAVE 2, THE ARCHITECTS. Lie, Envy and Pride advance. The arena floor goes dark where they walk.',
  finalWarWave3: 'WAVE 3, THE GRAVE-GUARD. Sloth rouses at last, and behind it, Deception itself wears a face that is almost yours. It has worn that face before: Zeroth thought he broke the Mirror to claim it, in truth he only handed it a body to wear.',
  finalWarWin: 'The last lieutenant dissolves. The shadow screams with all seven voices, then, for a single moment, with none. Silence like the first dawn.',
  trueEnding: [
    'The Arena of Virtues stands whole again, and for the first time in an Age, nothing is waiting behind it.',
    'The towns open their doors in the middle of the night because nothing is knocking. The Mirror is still broken, but the shards lie quiet, like weapons finally laid down.',
    'EIGHT KINGDOMS · {CYCLES} OF THE CROWN · ONE TRUTH: a champion did not outgrow their role, the role outgrew itself. The war is over.',
    'But the world still turns. And somewhere east, a seam of the world flexes, dreaming of a new crack...'
  ],
  eternalAnew: 'The Eternal Age begins. The towns rise again, the war is over, and the world remembers what you did, so it rises a little harder. Somewhere east, a seam of the world still flexes, dreaming of a new crack. Difficulty ascends; the crown awaits whoever can keep taking it.',
  crisisIntro: [
    'The town has been holding its breath for too long, and now it forgets to exhale.',
    'The streets carry a smell of old stone that has been standing somewhere else. The corruption of the Age has reached its crown, and it has noticed you.'
  ],
  crisisWin: 'The crack in the town widens, screams, and then a wind blows through it like a sigh. The corruption recedes from the streets. The seers whisper that the Age exhaled.',
  crisisLose: 'The fight turns wrong, the shadow swallows the blow whole and walks through you, through the town, through the fountain, and only the fountain remains a fountain.',

  /* Corruption narrative beats, the town's doubt grows with the meter. */
  corruptionBeats: [
    'The town still cheers you. The cheers just now carry something you did not teach them, a pause, like a coin dropped on stone. Somewhere a door closes that you did not enter.',
    'A man in the square holds his son a heartbeat too long when you pass. The seers count their candles twice. The town has started to believe the whisper that finds every king: that the crown is a mask, and the mask is growing.'
  ],

  /* Heir memory, the dynasty keeps one line of who came before. */
  heirMemory: 'The old champion left one unfinished thing stamped into the town stone: a name, half-carved, that no one admits to recognizing. The heir wears it like a debt, and means to pay it.',
  heirMemoryThree: 'Two heirs have now worn this blade, and both reached for the same half-carved name. The town has begun to leave offerings there, as if it were a grave or a door or a promise.',

  /* Zeroth, the name behind the crack. */
  zerothLore: [
    'The archives have one page that never dries: a warlord\'s confession, beginning "I did not want to break it. I wanted to be sure it was real."',
    'Zeroth spoke the Mirror\'s name aloud and struck at the thing it refused to show him. What cracked was not glass he could shatter, it was the wall between wanting and having.',
    'Deception was not born from his swing. It was born from what his swing proved: that even the most honest kingdom, if it fears being a lie, will break itself to become true.'
  ],
  finalWarZeroth: 'And as the Eighth rises, a memory not your own climbs the back of your throat, a warlord, proud, alone, raising a blade against his own reflection because he could not find himself in it. "This is what Zeroth heard too," the shadow whispers. "That his virtue had a flaw. I only ever let the flaw speak."',

  /* The True Ending's deep choice. */
  reforgeOffer: 'The Arena is whole. The lie is dead. And in the quiet behind it, the eight shards of the world lie within reach like hilt-scattered sword pieces.\nTo reforge the Mirror is to end the virtues\' loneliness, to let eight truths become one living, arguable truth again. To keep the division is to keep the crowns, the war-years, the bright sharp edges that made you.\nBoth choices are yours. Only the world dreams either way.',
  reforgeAnew: 'The Eternal Age begins, but it begins stitched. Deep under the Arena, the eight shards lean toward one another like iron finding a magnet. The towns still rise, still compete, but every victory draws a single thread from the world, and one day the loop will end. This is the Age of the Thread.',
  keepDivisionAnew: 'The Eternal Age begins. You chose the edge. The world remembers what you did, and it rises a little harder, the crown waits for whoever can keep taking it, sharp forever. This is the Age of the Sharp',
};

const COMPETITION_OPPONENTS = {
  round1: [
    { kingdom: 'valor', fighter: { name: 'Gareth the Unbroken', stats: { hp: 100, atk: 90, def: 65, spd: 70, spAtk: 55 } } },
    { kingdom: 'accord', fighter: { name: 'Lyra the Silver Tongue', stats: { hp: 80, atk: 65, def: 70, spd: 85, spAtk: 80 } } },
    { kingdom: 'rapport', fighter: { name: 'Nyx the Whisper', stats: { hp: 70, atk: 80, def: 55, spd: 95, spAtk: 75 } } },
    { kingdom: 'spunk', fighter: { name: 'Jinx the Unpredictable', stats: { hp: 75, atk: 85, def: 50, spd: 90, spAtk: 80 } } },
    { kingdom: 'vigilant', fighter: { name: 'Ironclad Mira', stats: { hp: 115, atk: 55, def: 95, spd: 45, spAtk: 45 } } },
    { kingdom: 'altruism', fighter: { name: 'Aria the Mender', stats: { hp: 85, atk: 45, def: 60, spd: 75, spAtk: 90 } } },
    { kingdom: 'scrupulous', fighter: { name: 'Artemis the Keen', stats: { hp: 78, atk: 88, def: 60, spd: 90, spAtk: 75 } } }
  ],
  round2: [
    { kingdom: 'clement', fighters: [
      { name: 'Aurelius the Just', stats: { hp: 95, atk: 75, def: 80, spd: 70, spAtk: 75 } },
      { name: 'Lady Tempest', stats: { hp: 80, atk: 55, def: 70, spd: 80, spAtk: 85 } },
      { name: 'Guardian Theron', stats: { hp: 100, atk: 60, def: 85, spd: 55, spAtk: 50 } }
    ]},
    { kingdom: 'valor', fighters: [
      { name: 'Gareth the Unbroken', stats: { hp: 110, atk: 95, def: 70, spd: 65, spAtk: 50 } },
      { name: 'Seraphina Blaze', stats: { hp: 85, atk: 100, def: 50, spd: 75, spAtk: 55 } },
      { name: 'Ironwall Dorin', stats: { hp: 105, atk: 60, def: 80, spd: 55, spAtk: 45 } }
    ]},
    { kingdom: 'spunk', fighters: [
      { name: 'Kestrel Flicker', stats: { hp: 82, atk: 92, def: 48, spd: 92, spAtk: 70 } },
      { name: 'Braxo the Loud', stats: { hp: 108, atk: 78, def: 55, spd: 78, spAtk: 66 } },
      { name: 'Mischief No-Name', stats: { hp: 76, atk: 86, def: 45, spd: 98, spAtk: 74 } }
    ]},
    { kingdom: 'accord', fighters: [
      { name: 'Caspian the Arbiter', stats: { hp: 90, atk: 72, def: 68, spd: 76, spAtk: 88 } },
      { name: 'Seneschal Petra', stats: { hp: 84, atk: 62, def: 78, spd: 72, spAtk: 82 } },
      { name: 'Voice Adair', stats: { hp: 88, atk: 58, def: 60, spd: 84, spAtk: 92 } }
    ]},
    { kingdom: 'scrupulous', fighters: [
      { name: 'Inquisitor Vester', stats: { hp: 92, atk: 82, def: 66, spd: 74, spAtk: 78 } },
      { name: 'Pursuer Onna', stats: { hp: 80, atk: 88, def: 52, spd: 86, spAtk: 72 } },
      { name: 'Ledger-Keeper Aldous', stats: { hp: 96, atk: 68, def: 62, spd: 70, spAtk: 86 } }
    ]},
    { kingdom: 'altruism', fighters: [
      { name: 'Sister Indira', stats: { hp: 98, atk: 52, def: 72, spd: 74, spAtk: 90 } },
      { name: 'Hale Brother Mort', stats: { hp: 104, atk: 64, def: 60, spd: 68, spAtk: 76 } },
      { name: 'Cradle-Keeper Ami', stats: { hp: 86, atk: 60, def: 66, spd: 82, spAtk: 84 } }
    ]}
  ],
  round3: [
    { kingdom: 'valor', fighters: [
      { name: 'Gareth the Unbroken', stats: { hp: 120, atk: 100, def: 75, spd: 70, spAtk: 55 } },
      { name: 'Seraphina Blaze', stats: { hp: 90, atk: 105, def: 55, spd: 80, spAtk: 60 } },
      { name: 'Berserker Thane', stats: { hp: 95, atk: 110, def: 45, spd: 85, spAtk: 50 } },
      { name: 'Ironwall Dorin', stats: { hp: 115, atk: 65, def: 90, spd: 55, spAtk: 50 } }
    ]},
    { kingdom: 'accord', fighters: [
      { name: 'Speaker Calla', stats: { hp: 88, atk: 74, def: 60, spd: 82, spAtk: 95 } },
      { name: 'Warden Oriel', stats: { hp: 110, atk: 70, def: 72, spd: 64, spAtk: 78 } },
      { name: 'Mediator Tam', stats: { hp: 94, atk: 66, def: 74, spd: 76, spAtk: 88 } },
      { name: 'Justicar Emrys', stats: { hp: 100, atk: 80, def: 66, spd: 70, spAtk: 84 } }
    ]}
  ]
};

/* ---- Shard Depot, where earned shards find their use. ---- */
const SHARD_DEPOT = [
  { id: 'shardPotion', name: 'Verdant Salve', icon: '🧪', desc: 'Restores 90 HP in battle.', shards: 6, effect: { type: 'heal', amount: 90 } },
  { id: 'shardElixir', name: 'Mirror Essence', icon: '⚡', desc: 'Restores 60 Energy in battle.', shards: 8, effect: { type: 'energy', amount: 60 } },
  { id: 'warBanner', name: 'Weaver\'s Banner', icon: '🏴', desc: '+20% attack for the whole party in the next battle (raise it from your Inventory).', shards: 15, effect: { type: 'buff', stat: 'atk', amount: 0.2 } },
  { id: 'shardRevive', name: 'Ember Heart', icon: '💎', desc: 'Revives one fallen ally at 70% HP in battle.', shards: 18, effect: { type: 'revive', amount: 0.7 } },
  { id: 'shardKeepsake', name: 'Crown Keepsake', icon: '👑', desc: '+6 Attack permanently.', shards: 45, effect: { type: 'stat', stat: 'atk', amount: 6 } },
  { id: 'shardCharm', name: 'Warding Charm', icon: '🪬', desc: 'Reduces damage taken by 15% while below 30% HP, and it whispers of an Age you have not lived.', shards: 60, effect: { type: 'passive', id: 'shardCharm' } }
];

/* =====================================================================
   THE AGES, Warfare as endless sessions.
   Each AGE is a full game-session: all eight towns (one per Kingdom)
   rise, build, march, and compete inside the shared arena. The victor
   becomes KING OF THE AGE, and that King becomes the final mirror-trial
   of the NEXT Age (see CROWN_TRIALS, keyed by role archetype).
   ===================================================================== */
const AGES = [
  {
    id: 'age_of_the_verdant_fire',
    name: 'The Age of Verdant Fire',
    omen: 'the Emerald Comet',
    chapter: 'The Founding Year',
    intro: [
      'The Convergence is a scar on the world, and from its distant fire the first age begins.',
      'Eight towns rise in the blast-shadow of the Arena of Virtues, each a seed of a virtue.',
      'The Arena hums, unfinished, waiting, it grows only when its towns feed it blood and stone.',
      'Build your home. Forge your champions. The first King of the Age will be crowned before the comet sets.'
    ],
    towns: {
      altruism: 'Mendfall',
      accord: 'Uniara',
      rapport: 'The Tangle',
      valor: 'Fearsworn',
      clement: 'The Midway',
      vigilant: 'Everwatch',
      scrupulous: 'Ledgerhall',
      spunk: 'Rattlepit'
    },
    arenaMotto: 'Let the strongest law be law.'
  },
  {
    id: 'age_of_the_cracked_mirror',
    name: 'The Age of the Cracked Mirror',
    omen: 'Deception\'s first breath',
    chapter: 'The Age of Shadows',
    intro: [
      'The Mirror of Truth did not just break, it was broken, and the fragments still cut.',
      'A shadow now sits between the towns, whispering that only one virtue may survive.',
      'The Arena of Virtues drinks deeper this age. Champions are measured not against a town, but against a King.',
      'When you enter the arena, speak your faction\'s name. Let the shards decide who reflects truth.'
    ],
    towns: {
      altruism: 'Woundkeep',
      accord: 'The Useless Accord',
      rapport: 'Eavesdrop',
      valor: 'The Gilded Wound',
      clement: 'Both Sides',
      vigilant: 'The Unblinking',
      scrupulous: 'Accusation',
      spunk: 'The Chaos Coin'
    },
    arenaMotto: 'Only the uncracked may rule.'
  },
  {
    id: 'age_of_the_quiet_king',
    name: 'The Age of the Quiet King',
    omen: 'the Sleeping Monolith',
    chapter: 'The King\'s Long Sleep',
    intro: [
      'The last King of the previous age lies under the Arena, dreaming of the throne.',
      'Each town still builds, still trains, but every arena echo carries a dare: wake the King, or be forgotten.',
      'The Crown Trial awaits only those who outgrow their own role, the final boss is thyself, perfected.',
      'This is the age where a champion may become more than a champion. Become the faction\'s final form.'
    ],
    towns: {
      altruism: 'Last Altar',
      accord: 'The Unbroken Circle',
      rapport: 'The Seen Bridge',
      valor: 'The Dawning Line',
      clement: 'Scale\'s Rest',
      vigilant: 'The Ever-Dawn',
      scrupulous: 'The Final Review',
      spunk: 'The Lucky Crossroads'
    },
    arenaMotto: 'Every king is a door.'
  }
];

/* Per-role final bosses: the perfected mirror of a role, faced as the
   "final boss of that faction/role" when a champion reaches their peak. */
const ROLE_PARAGONS = {
  striker: {
    name: 'The Unsheathed King',
    epithet: 'speed is his sermon',
    stats: { hp: 260, atk: 95, def: 55, spd: 98, spAtk: 60 },
    taunt: 'You learned to strike. I learned to be the strike.'
  },
  bulwark: {
    name: 'The Unmovable King',
    epithet: 'patience is his war',
    stats: { hp: 340, atk: 60, def: 105, spd: 30, spAtk: 55 },
    taunt: 'Every army breaks itself on what it cannot move.'
  },
  mender: {
    name: 'The Unending King',
    epithet: 'mercy is his blade',
    stats: { hp: 300, atk: 55, def: 75, spd: 60, spAtk: 105 },
    taunt: 'I do not kill the worthy. I simply never let them die.'
  },
  schemer: {
    name: 'The Unseen King',
    epithet: 'the joke is the throne',
    stats: { hp: 250, atk: 75, def: 70, spd: 90, spAtk: 100 },
    taunt: 'By the time you saw me, your defeat was an old joke.'
  }
};

const KING_OF_THE_AGE_TITLE = 'King of the {AGE}';
const CROWN_TRIAL_REQ_LEVEL = 7;

/* Legacy perks, permanent boons a dynasty keeps even when a champion falls.
   Unlocked one at a time whenever an heir inherits the calling. */
const LEGACY_PERKS = [
  { id: 'heirloom_blade', name: 'Heirloom Blade', icon: '⚔️', desc: '+5% attack on all champions, forever.' },
  { id: 'iron_lineage', name: 'Iron Lineage', icon: '🛡️', desc: '+5% defense on all champions, forever.' },
  { id: 'scholar_blood', name: 'Scholar Blood', icon: '📜', desc: '+25% role XP earned, forever.' },
  { id: 'gilded_hand', name: 'Gilded Hand', icon: '🪙', desc: '+15% gold from every victory, forever.' },
  { id: 'shards_instead', name: 'Shard-Sighted', icon: '💎', desc: 'Find +2 arena shards every battle, forever.' },
  { id: 'unbroken_vow', name: 'Unbroken Vow', icon: '🔥', desc: 'Take 10% less damage, forever.' },
  { id: 'second_breath', name: 'Second Breath', icon: '❤️‍🔥', desc: 'Healing you receive is +20% effective, forever.' },
  { id: 'lion_corruption', name: 'Lion of Corruptions', icon: '👑', desc: 'Your corruption rises 1 less each year, forever.' }
];

/* Founding decrees, one choice each Age that shapes your town's fortune. */
const DECREES = [
  { id: 'open_gates', name: 'The Open Gates', icon: '🚪', desc: 'Traders flood the town. +20% gold from all victories this Age.', apply: 'gold' },
  { id: 'arena_tax', name: 'The Arena Tax', icon: '🏛️', desc: 'The ring feeds the calling. +30% role XP this Age.', apply: 'roleXp' },
  { id: 'hoard_shards', name: 'Hoard the Shards', icon: '💎', desc: 'Fragment of the Mirror stays with you. +3 shards per battle this Age.', apply: 'shards' },
  { id: 'iron_march', name: 'The Iron March', icon: '⚙️', desc: 'Every champion is drilled hard. +6% attack this Age.', apply: 'atk' },
  { id: 'veil_of_mercy', name: 'Veil of Mercy', icon: '🕊️', desc: 'The town forgives itself. Corruption rises 1 less this Age.', apply: 'corruption' }
];

/* Deception's lieutenants, named corrupted champions who wander the ages. */
const DECEPTION_LIEUTENANTS = [
  { id: 'lust', name: 'Lady Vex, the Sated', color: '#e74c3c', epithet: 'desire without end', arena: 0, stats: { hp: 180, atk: 85, def: 50, spd: 90, spAtk: 80 }, signature: 'Charm, may turn one of your allies against you.', taunt: 'Your people want me. I am merely what they already whisper.' },
  { id: 'lie', name: 'Father Fracture', color: '#9b59b6', epithet: 'truth, broken in advance', arena: 1, stats: { hp: 200, atk: 75, def: 60, spd: 80, spAtk: 95 }, signature: 'Mirror Images, copies itself and strikes past your guard.', taunt: 'Everything you believe about yourself is my gift to you.' },
  { id: 'greed', name: 'The Hoard-Worm', color: '#f1c40f', epithet: 'more, always more', arena: 2, stats: { hp: 240, atk: 80, def: 70, spd: 60, spAtk: 85 }, signature: 'Siphon, drains your HP and feeds itself on it.', taunt: 'I own your town a hundred times over. You merely live in it.' },
  { id: 'wrath', name: 'Sunder the Red', color: '#c0392b', epithet: 'anger with a name', arena: 3, stats: { hp: 220, atk: 105, def: 65, spd: 70, spAtk: 55 }, signature: 'Rampage, hits your whole party at once.', taunt: 'Your fortress will remember the sound of my axe reading its name.' },
  { id: 'envy', name: 'Mirrormouth', color: '#2ecc71', epithet: 'wants what you are', arena: 4, stats: { hp: 190, atk: 85, def: 60, spd: 85, spAtk: 95 }, signature: 'Mimic, copies the last move used against it.', taunt: 'I will wear your victory and it will fit better on me.' },
  { id: 'pride', name: 'August Zero', color: '#ecf0f1', epithet: 'the throne that kneels to none', arena: 5, stats: { hp: 210, atk: 90, def: 80, spd: 55, spAtk: 90 }, signature: 'Imperial Decree, a crushing blow, then an arrogant pause.', taunt: 'I do not fight you. I permit your small rebellion.' },
  { id: 'sloth', name: 'The Unrisen', color: '#95a5a6', epithet: 'sleep as a weapon', arena: 6, stats: { hp: 260, atk: 60, def: 90, spd: 25, spAtk: 75 }, signature: 'Despair Aura, saps your energy and slows your party.', taunt: 'Rest now. I have already won by making you tired.' }
];

/* The final face of Deception itself, faced at the end of the Final War. */
const DECEPTION_FINAL = {
  id: 'deception',
  name: 'Deception, the Eighth',
  color: '#202020',
  epithet: 'the reflection that remembers',
  arena: 7,
  stats: { hp: 420, atk: 110, def: 90, spd: 80, spAtk: 130 },
  signature: 'Recollection, strikes hardest against the champion carrying the most crowns.',
  taunt: 'I was there before your first mirror. I will be there after your last. Fight me, champion, you only ever carried me.'
};

/* The founding decrees of the crown, a King's own law, chosen on crowning. */
const CROWN_BOONS = [
  { id: 'war_chest', name: 'The War Chest', icon: '🪙', desc: 'The realm funds your marches. +40% gold from victories this Age.', apply: 'gold' },
  { id: 'the_forge', name: 'The Crown\'s Forge', icon: '⚔️', desc: 'Royal smiths arm your champions. +8% attack this Age.', apply: 'atk' },
  { id: 'the_archive', name: 'The Crown\'s Archive', icon: '📜', desc: 'Scribes record your battles. +30% role XP this Age.', apply: 'roleXp' },
  { id: 'the_veil', name: 'The Royal Veil', icon: '🕊️', desc: 'The crown deflects whispers. Corruption rises 1 less this Age.', apply: 'corruption' },
  { id: 'the_seal', name: 'The Broken Seal', icon: '🔮', desc: 'Fragment of the Mirror set in the hilt. +2 shards per battle this Age.', apply: 'shards' }
];

/* Codex of the Mirror, lore entries unlocked as the world is understood. */
const CODEX_ENTRIES = [
  { id: 'zeroth', icon: '🗡️', title: 'Zeroth, Who Broke the Mirror', unlockedBy: 'beats', text: 'He is old grief now, but his question outlives him: if a king fears his own virtue is a lie, what does that fear make the truth?' },
  { id: 'deception', icon: '🎭', title: 'Deception, the Eighth', unlockedBy: 'finalwar', text: 'Not a kingdom. Not a god. The flaw in every mirror, the one thing an honest thing refuses to show itself. It was born the day Zeroth could not look.' },
  { id: 'crown', icon: '👑', title: 'The Crown Trial', unlockedBy: 'crown', text: 'The Arena does not ask what you are. It asks what you intend to outgrow. Every king who passed it left the shape of themselves behind.' },
  { id: 'mirror', icon: '🪞', title: 'The Mirror of Truth', unlockedBy: 'eternal', text: 'Some say it could be reforged. Some say the hour of the reforge is the hour the world finally tells itself one story again. The seam in the east still dreams of deciding.' }
];

/* Eight mirrors, the world's virtues, one per cycle of the eternal war. The eighth is the whole. */
const VIRTUE_MIRRORS = [
  { id: 'mirror_1', name: 'Mirror of the Open Hand', virtue: 'Honesty', lesson: 'What you hide in the light learns to hide you.' },
  { id: 'mirror_2', name: 'Mirror of the Double Edge', virtue: 'Clarity', lesson: 'Every truth is a blade with two handles.' },
  { id: 'mirror_3', name: 'Mirror of the Borrowed Crown', virtue: 'Duty', lesson: 'A crown is not owned. It is carried, and it remembers who dropped it.' },
  { id: 'mirror_4', name: 'Mirror of the Keeping Hand', virtue: 'Mercy', lesson: 'The hand that catches is worn down by what it catches.' },
  { id: 'mirror_5', name: 'Mirror of the Unfinished Word', virtue: 'Courage', lesson: 'A word left unsaid is a room left dark.' },
  { id: 'mirror_6', name: 'Mirror of the War That Never Ends', virtue: 'Hope', lesson: 'The war that never ends teaches the longest patience.' },
  { id: 'mirror_7', name: 'Mirror of the Long Sleep', virtue: 'Peace', lesson: 'Even the mirror rests. It is the watching that wears.' },
  { id: 'mirror_8', name: 'Mirror Made Whole', virtue: 'Unity', lesson: 'Eight truths stitched into one arguable truth: the only wholeness that stays whole.' }
];

/* The Reckoning, when a named lie comes back to the gate calling. */
const RECKONING_LINES = {
  setup: 'A delegation stands at the town gate at dawn. They are the elders of the {FAMILY}, the family this line kept alive out of silence. They have not come for bread, and they have not come for mercy. They have come for the name.',
  confess: 'You say the name out loud, in public, where the town can hear it. The square goes quiet the way a held breath goes quiet. The {FAMILY} elders nod slowly, and then the town begins, loudly and clumsily, to unlearn it.',
  doubledown: 'You do not say the name. You smile, and you call it \'an old misunderstanding\', and you mean the words so well the town believes you. The {FAMILY} leaves without another word. They are patient. They were taught patience by a town that kept their silence.'
};

/* Rival champion names per kingdom, they remember every grudge. */
const RIVAL_NAMES = {
  valor: ['Aldric the Unflinching', 'Katya Stormblade'],
  accord: ['Cassius the Even-Handed', 'Maribel of the Truce'],
  rapport: ['Sil, Who Listens', 'Echo'],
  altruism: ['Rook the Soft-Hearted', 'Summer, the Undying'],
  clement: ['The Scale', 'Mercia the Measured'],
  vigilant: ['Watcher Kade', 'Nightslip'],
  scrupulous: ['Ledger Truth', 'The Auditor'],
  spunk: ['Chaos Cricket', 'Betwixt']
};

/* Letters from the last King, the crown she gave up finds you across ages. */
const KING_LETTERS = [
  'I did not begrudge you the crown. I begrudged the silence after. The arena remembers me as a shadow now, be a warmer shadow than I was.',
  'They carved my name out of the town stones and it hurt less than I expected. Build walls, heir. The shadow is not the worst thing that finds a town.',
  'I watch you through the Mirror, which is to say I watch everything. You fight beautifully. Forgive me that I root for you and also for your fall.',
  'If Deception ever offers you a shorter road, tell it I already tried that road and it ends in the same place: alone, with gold, with nothing.'
];

/* Town wounds, the crisis that strikes your town mid-Age, once. */
const TOWN_WOUNDS = [
  { id: 'fire', icon: '🔥', title: 'The Unquiet Pyre', desc: 'Deception\'s spark took the granary. The flames wear a face.', lieutenant: 3 },
  { id: 'plague', icon: '🩸', title: 'The Sleepless Cough', desc: 'A curse of Sloth sleeps in the well. The town dreams standing up.', lieutenant: 6 },
  { id: 'greed_raid', icon: '💰', title: 'The Debt Collectors', desc: 'The Hoard-Worm demands the town ledger, in blood.', lieutenant: 2 }
];

/* Thirty-second town errands, quick, human, rewarding. */
const SIDE_QUESTS = [
  { id: 'flower', title: 'The Wilted Crown', prompt: 'A child holds a withered flower and swears it used to be a crown.', reward: { gold: 20, xp: 5, shards: 1 } },
  { id: 'letter', title: 'The Unsent Letter', prompt: 'An old soldier wants one letter delivered, to a grave.', reward: { gold: 15, xp: 8, shards: 1 } },
  { id: 'rat', title: 'The Bell Tower', prompt: 'Something nests in the bell. The town verger refuses to climb.', reward: { gold: 25, xp: 4, shards: 2 } },
  { id: 'trap', title: 'The Loaded Die', prompt: 'A gambler begs you to "win back" his home, from himself.', reward: { gold: 30, xp: 0, shards: 1 } },
  { id: 'crone', title: 'The Mended Shrine', prompt: 'The shrine-keeper\'s hands shake. She asks only for a steady one.', reward: { gold: 10, xp: 12, shards: 1 } },
  { id: 'dog', title: 'The Loyal Beast', prompt: 'A hound guards the gate of an empty house. It will not move for anyone else.', reward: { gold: 18, xp: 6, shards: 2 } }
];

/* Arena wager offers, honor your own odds, or take Deception's cheat. */
const ARENA_WAGERS = {
  honor: { label: 'Honor Your Odds', icon: '⚖️', desc: 'Bet 25 gold on yourself. Win the round and it returns at 2×: you keep your stake and collect 25 more.', pay: 2, corruption: 0 },
  deception: { label: 'Deception\'s Cheat', icon: '🎭', desc: 'The shadow stakes against the field for you. Win the round and 25 gold returns at 3× (75 total), and Deception adds 2 corruption to the town.', pay: 3, corruption: 2 }
};

const ARENA_OF_VIRTUES = {
  name: 'Arena of Virtues',
  desc: 'The shared session-stage where the towns of an age compete. It grows as the age progresses and remembers every King who ever stood upon it.'
};

/* The champion's origin, one regret they carry into every Age. */
const REGRETS = [
  { id: 'betrayed', icon: '🩸', name: 'The Name I Gave Away', desc: 'You once testified against a friend to keep your own hands clean. The throne knows. The friend knows. Only you pretend not to know.', stat: 'atk', amt: 8, mirrorTaunt: 'You gave a name away to keep your own hands clean, and the name has followed you through every Age. I am that name now. I am the friend who still believes you.' },
  { id: 'abandoned', icon: '🌊', name: 'The One I Left at the Gate', desc: 'When the town was starving, you walked north with the last coin. You have a fine crown now, stitched from that walk.', stat: 'hp', amt: 40, mirrorTaunt: 'You walked north with the last coin while the town starved. I am the north you took, heir, and the stair at the gate has worn a hollow in your shape, waiting for you to come back down it.' },
  { id: 'kept', icon: '🗝️', name: 'The Truth I Buried', desc: 'You found a letter about Zeroth and burned it. Some doors should stay shut, you told yourself. You still tell yourself.', stat: 'spAtk', amt: 8, mirrorTaunt: 'You burned a letter to keep a door shut. I am the door, heir, and I have already read what was on the other side. It was addressed to you.' }
];

/* Named townsfolk, the town is not a backdrop, it has faces. */
const TOWNSFOLK = [
  { id: 'baker', name: 'Mara the Ovenmaster', icon: '🍞', beat: 'Mara is up before the birds, proving the day can still begin. She doesn\'t ask how you got your crown. She only asks if you\'ve eaten.', beatDark: 'Mara\'s ovens are cold this week. She stands at the whitewashed window and watches the smoke of the town, deciding whether to light the fire at all.' },
  { id: 'seer', name: 'Candle-Keeper Enzo', icon: '🕯️', beat: 'Enzo counts his candles twice now. "Nine for the town," he says, "one for the thing that watches it." He never says which town.', beatDark: 'Enzo caught you looking and did not count candles. He simply blew one out and waited to see if you would ask.' },
  { id: 'child', name: 'Pip', icon: '🏮', beat: 'Pip trails you through the hall holding a withered flower, proof, they insist, that it was once a crown. You are the only one who has ever agreed to look.', beatDark: 'Pip does not play near the crack anymore. When you pass, they press their face to the glass of the door, not opening it.' }
];

/* Named relics, carried treasure with a memory. */
const RELICS = [
  { id: 'crowns_flame', name: 'Ember of the First Crown', icon: '🔥', stat: 'atk', amt: 10, desc: 'The first crown was not gold. It was a live coal, passed hand to hand, to prove the line would bear the burn.' },
  { id: 'mirror_shard', name: 'Shard of the Broken Mirror', icon: '🪞', stat: 'spAtk', amt: 10, desc: 'It shows not your face but your next face, the one you are becoming. Deception hates it. Deception coos at it.' },
  { id: 'stone_throne', name: 'Kneeling Stone', icon: '🪨', stat: 'hp', amt: 60, desc: 'Every king of this age knelt on it. The groove left by their knees fits your own. It was waiting for you.' },
  { id: 'oath_iron', name: 'Iron of the Last Oath', icon: '⚔️', stat: 'def', amt: 10, desc: 'A sword that was sworn, then broken on purpose, to prove the oath and not the sword was the true steel.' },
  { id: 'seven_candles', name: 'Enzo\'s Ninth Candle', icon: '🕯️', stat: 'spd', amt: 6, desc: 'A candle that never burns down. The Candle-Keeper smokes it for the thing that watches. It watches you differently.' }
];

/* The covenant relics of the eight kingdoms, stakes of the Hunt (Round 3 of the Annual Competition). */
const HUNT_RELICS = {
  altruism: { id: 'altruism', name: 'The Hand That Gave', icon: '🤲', lore: 'The first hand of the First Kingdom was not reaching for gold, it was reaching out. Cast bronze, it still trembles with the effort of kindness.' },
  accord: { id: 'accord', name: 'The Sealed Accord', icon: '📜', lore: 'A treaty bound in wax no king has ever cracked. It holds one unfinished line, written to be signed by the king who finally tells the truth.' },
  rapport: { id: 'rapport', name: 'The Chime of the Empty Room', icon: '🔔', lore: 'A bell that rings only when a room falls honest-empty, no listeners, no performance. It has not rung in a hundred years. It will ring for whoever waits truly.' },
  valor: { id: 'valor', name: 'The Unstruck War-Horn', icon: '📯', lore: 'Never blown in victory, because it was only ever for the final war. Its silence is a boast none of the other kingdoms can match.' },
  clement: { id: 'clement', name: 'The Bowl of the Unfed', icon: '🥣', lore: 'A bowl that fills at dusk, for whoever broke their fast to feed another first. The kingdom that keeps it has never once let it overflow.' },
  vigilant: { id: 'vigilant', name: 'The Lamp of the Third Watch', icon: '🏮', lore: 'Kept lit through the night watch without ever flickering once. Its flame remembers every dawn a sentinel chose not to sleep.' },
  scrupulous: { id: 'scrupulous', name: 'The Ledger of the Honest Mistake', icon: '⚖️', lore: 'A ledger with one corrected error, kept in the open where it can be seen. Nothing about the kingdom is written smaller than the truth.' },
  spunk: { id: 'spunk', name: 'The Coin That Landed Twice', icon: '🪙', lore: 'Flipped for a wager, it landed twice, and the holder never did answer which side was lying. It keeps every possibility, and none of them dull.' }
};

/* Optional rifts, one perilous zone per Age, with a named boss and a relic in the heart. */
const AGE_RIFTS = {
  age_of_the_verdant_fire: { name: 'The Sunken Arena', icon: '🏛️', boss: 'Drowned Champion', note: 'An arena that sank without losing its crowd. The spectators still applaud, fathoms down, bubbles instead of bravos.', lore: 'The crowd never left. It simply learned to breathe water. Watch them: every cheer is one second of your life you will not get back.' },
  age_of_the_cracked_mirror: { name: 'The Hall of Wrong Reflections', icon: '🪞', boss: 'The Unflattering Self', note: 'A hall of mirrors where each reflection is one flaw you have refused to own. The end one walks.', lore: 'The last mirror does not lie and does not flatter. It shows the King your heirs will be. Every King who reached it has backed slowly out of the room.' },
  age_of_the_quiet_king: { name: 'The Hanging Court', icon: '⚖️', boss: 'The Unconvicted', note: 'A court that never recessed. The verdict was due three hundred years ago and the judge refuses to rush it.', lore: 'Zeroth\'s trial. It never ended because the evidence kept confessing. The Unconvicted waits behind the bench, still certain of the answer Zeroth never heard.' }
};

/* The Mirror's question turned on the player, a kingdom that fears being a lie. */
const THEME_LIES = [
  { id: 'spy', icon: '🕵️', prompt: 'A messenger from ${kingdom} catches you alone: "The last champion won by a scar they did not earn. If the town knew the truth, it would never trust the Arena again."', lieGain: ['+120 gold, and the town believes the lie for one more year.', '+40 gold in your pocket. Deception laughs somewhere, delighted at the friction.'], truthGain: ['-40 gold, and the town goes quiet, but the quiet is honest.', 'Deception hisses in the mirror behind you: "Boring. I had such hopes."'] },
  { id: 'grain', icon: '🌾', prompt: 'The granary count is short. The ledger says what your kingdom needs it to say; the scales say otherwise.', lieGain: ['+60 gold from the doctored ledger.', 'The town eats the same, unchanged, and the lie eats a corner of them.'], truthGain: ['-60 gold and a lean season, but the scales are clean at last.', 'The bakers nod. They can read a ledger. They could always read one.'] },
  { id: 'mercy', icon: '🕊️', prompt: 'The Candle-Keeper overheard your own honesty echo back wrong. He asks, plainly: "Which of us is the mirror, King?"', lieGain: ['+50 gold for the reassurance, and no more questions tonight.', 'Enzo accepts the answer the way one accepts rain: it arrives anyway.'], truthGain: ['-50 gold for the honesty, and Enzo lights two candles, one for the town, one for you.', 'Deception, watching from the seam, is silent for a full minute. It has never been silent.'] }
];

/* Heirs carry one unfinished thing, this is what the dead King could not finish. */
const UNFINISHED_LETTERS = [
  'The heir found a sealed letter in the dead champion\'s boot, addressed to nobody. "If I had told the truth about the scar," it begins, "would the Arena have believed me? I need to know which answer would have saved the town."',
  'A half-carved name waits under the crown\'s seat, scratched in by trembling hands. The heir does not finish it. Some carvings must be left open, like wounds.',
  'The previous champion kept a single dead coal from the First Crown. They meant to re-light it on Mount of the Fallen. They never reached the mountain. The coal is trucked along in the heir\'s saddlebag, warm as a held breath.'
];

/* Grief, the town reacts when a King dies. */
const TOWN_GRIEF = [
  'The town does not lower the flag. It raises a second one, beside it, empty, for the shape of the person no longer in it.',
  'Grief moves through ${town} the way an Age does: slowly, with bells. The ovens burned all night so that no one would wake to a cold kitchen on the day of a death.',
  'The Candle-Keeper lit one candle for the dead King and did not blow it out. "A candle for the town, a candle for the crown, and now," he said, "a third for the gap."'
];

/* The party is not a loadout. Each companion carries a thread, and has a word
   for the things you do. {N} is replaced by the speaker's name when spoken. */
const PARTY_VOICES = {
  striker: {
    approve: [
      '{N} nods once. To a striker, that is applause.',
      '"A blade that lies gets dull," {N} says. "Good King."'
    ],
    disapprove: [
      '{N} turns to sharpen their blade rather than watch the gold move.',
      '"You bought the night, not the war," {N} says.'
    ],
    doubt: [
      '{N} stands a little further from you at the table this morning.',
      '"You shook hands with the dead King," {N} says, "and counted it as groceries."'
    ],
    grieve: [
      '{N} drives a small cross into the yard behind the hall, then steps back from it.',
      '"I shared a camp fire with {NAME}," {N} says. "A fine, sharp person. I will carry the fine part."'
    ],
    stand: [
      '{N} buckles their belt and steps to your side. "Side by side, King. Or not at all."',
      '"{NAME} may be standing in every shade we meet," {N} says at the gate. "The torch is still us."'
    ],
    eternal: [
      '"We start again, then. Good. The world kept score, so will we," {N} says.',
      '{N} watches the new dawn without joy or fear. A warrior\'s patience: renewed, not surprised.'
    ]
  },
  bulwark: {
    approve: [
      '{N} plants their shield and sets it down like a full stop. "That is a line we can hold."',
      '"The wall you build on a true word stands," {N} says.'
    ],
    disapprove: [
      '{N} polishes their shield a long time without speaking. The silence has a keystone in it.',
      '"We are protecting a town that is comfortable with the thing that watches it," {N} says. "I want a better wall than that."'
    ],
    doubt: [
      '{N} checks the inner gate twice tonight. Gates checked twice are gates that are worried.',
      '"The dead King\'s coin," {N} says, "bought a crack in our side of the wall."'
    ],
    grieve: [
      '{N} stands at the gate through the whole funeral, holding it like a promise to the grave.',
      '"The wall held," {N} says very quietly. "Not high enough. The wall held."'
    ],
    stand: [
      '{N} plants their feet and the ground decides to agree. "They come at you, King, they come at the wall."',
      '"One more door, we bar it," {N} says. "One more night, we are it."'
    ],
    eternal: [
      '{N} grinds a shallow new trench at the inner gate. "Rebuild," they say, "or the trench stays a scar."',
      '"Some lines you hold twice," {N} says at the re-dawn. "That is the whole of the wall."'
    ]
  },
  mender: {
    approve: [
      '"Truth stings like a good bandage, then it lets you move," {N} says, and means it kindly.',
      '{N} lights a candle for the name you kept. "That is how the town learns to carry light."'
    ],
    disapprove: [
      '{N} bandages nothing tonight. "A lie is a wound I cannot cauterize from the outside."',
      '"{N} has seen what sleeps well and does not heal. That is what you bought tonight."'
    ],
    doubt: [
      '{N} checks their kit one extra time without being asked. "The dead King\'s errands always bleed through."',
      '"You carry the shadow\'s bundle," {N} says, "and the town smiles at the bow."'
    ],
    grieve: [
      '{N} works the funeral without speaking, mending cuffs and hems that were whole, because small hands need holding too.',
      '"I could not heal {NAME}. That is a debt I will carry to the row," {N} says, "and kindly."'
    ],
    stand: [
      '"Everyone comes home tonight," {N} says at the gate. "That is my decree. Yours is higher."',
      '{N} sets a second satchel of wound-salves by the gate. "For the ones we bring home."'
    ],
    eternal: [
      '"A new Age is a new wound," {N} says mildly. "It will close. It always does, when someone carries the light."',
      '{N} re-sorts the herbs with the patience of someone who has watched seasons turn twice. "Growth is a kind of healing, King."'
    ]
  },
  schemer: {
    approve: [
      '"{N} watches you say the true thing and quietly rewrites the plan. One page:" easier."',
      '"A truth is a better mask than any lie, if you can carry it," {N} says.'
    ],
    disapprove: [
      '"You kept the lie because it was comfortable," {N} says. "I keep lies because I have to. That difference is the whole game."',
      '{N} does not disapprove aloud. To a schemer, that means you have it coming politely.'
    ],
    doubt: [
      '"The dead King\'s coin," {N} says, "spends in my ledgers. I want to know what I have really been paid for."',
      '{N} shuffles their cards twice. "You play a longer game now, King. Make sure you read your own hand."'
    ],
    grieve: [
      '{N} says nothing at the funeral. At the empty chair, they lay three cards, face down. Grief, played properly, is a strategy of silence.',
      '"{NAME} played a long game," {N} says at last, "and lost one good night of it."'
    ],
    stand: [
      '"They think the final war is a battle," {N} says at the gate. "I have made it a trap. Walk in smiling."',
      '{N} hands you a plan too short to be a plan. "Everyone survives this," they say. "That is the only paragraph."'
    ],
    eternal: [
      '"The world resets. Do not make the mistake of resetting with it," {N} says.',
      '{N} smiles the way schemers smile at a shuffled deck. "Again? I have been counting those cards since the first Age."'
    ]
  }
};

/* Families the town builds out of the lies you let it keep. Named, and then they
   keep showing up, because a lie with a name is not a lie anymore, it's a neighbor. */
const LIE_FAMILIES = ['the Lamplight Trust', 'the Quiet Ledger', 'the Harvest Promise', 'the Second Dawn', 'the Long Sleep', 'the Bramble Pact'];

/* The Eighth does not ambush. It sets a table. Once per world, if your corruption
   is ripe, it offers the deal, and this time it names the whole price. */
const TEMPTATION_SCENES = [
  { setup: 'At the East Gate stands a table where no table was. Two stools. A fire that burns without sound. On the far side sits a shape wearing your face the way a traveler wears a coat they found.', price: '"You have told the town lies it thanked you for. You have carried the dead King\'s errands and called them groceries. Those are not debts, champion. Those are installments. I only come to collect what you were already paying."', offer: 'It slides a drawer of the table open. Inside: whatever your hands have been reaching for. Gold. Sleep. A town that stops asking. "Take the drawer," it says. "That is the whole deal. There is no second page. That is what makes it honest."' },
  { setup: 'The table again, older, greyer, and the face wearing yours has begun to look comfortable. It nods like an old colleague.', price: '"You beat me last year and called it a victory. I noticed you kept the ledger open. Victories are for the arena. Trades are for the road. I knew you would come back to the road."', offer: '"This time the drawer is heavier. A world this divided needs someone to hold it steady. That could be you, not as a King. As a landlord. Easier. Richer. The Mirror itself will forget you were ever a lamp."' },
  { setup: 'The table has become a small throne. The face wearing yours is now the only mirror in the world that does not flinch when it looks at you.', price: '"Three Ages, champion. You have outlived crowns and out-kept lies, and still you set out two stools. I think you may like the road better than the destination."', offer: '"One last drawer. Not gold, a crown with no mirror under it. Take it, and the war-that-never-ends becomes a job-that-never-questions. The town will call you King. I will call you colleague. The Mirror will call you nothing, because it will not be able to see you anymore."' }
];

/* A rival is a mirror you have beaten, and the mirror keeps score. */
const RIVAL_TITLES = [
  { min: 1, title: 'The Beaten', note: 'They have lost to you and they have not forgiven the loss.' },
  { min: 3, title: 'The Scarred', note: 'Three defeats carve deeper than any blade. They stop talking about beating you and start talking about outliving you.' },
  { min: 6, title: 'The Undying Enemy', note: 'Six defeats. They no longer train to win, they train to be the last thing you see. Mirror law: what you break becomes sharp.' }
];

/* One Deception POV interlude per Age, a glimpse east, into the thing that watches. */
const DECEPTION_INTERLUDES = {
  age_of_the_verdant_fire: 'East of the world, where the first crack in the Mirror still weeps, Deception counts the crowns it has outlived. It does not hurry; it has practice. "A King is only a lamp somebody forgot to refuel," it tells the crack. "Give me the Age. See how cleanly the wick burns out."',
  age_of_the_cracked_mirror: 'Deception walks the Hall of Wrong Reflections, trailing a finger across each one. "Look how honest they are with themselves today," it whispers. "That is only fear wearing spectacles. By the next Age, they will ask me to do the looking for them." The mirrors do not answer. Mirrors rarely do.',
  age_of_the_quiet_king: 'The Hanging Court has been adjourned for three hundred years, and Deception alone remembers the verdict. It sits where the judge would sit and rehearses a speech it has never needed to give. "Zeroth wanted the Mirror broken so he could stop hearing what it told him. Poor Zeroth. I never told him anything. He listened to himself and blamed me for the echo."'
};

/* Rolling flavor for the war chronicle, the arena keeps a running commentary. Appended
   AFTER the mechanical line so the 3D crowd-parser's "attacks"/"for"/"recovered" tokens survive. */
const COMBAT_FLAVOR = {
  strikeAlly: [
    'The plaza holds its breath.',
    'Steel finds the seam.',
    'A clean, earned hit.',
    'The crowd leans in like one body.',
    'The banner snaps straight overhead.',
    'Dust hisses off the flagstones.',
    'The far benches stamp in rhythm.'
  ],
  strikeFoe: [
    'The shadow strikes back.',
    'Blood beads at the blade\'s edge.',
    'The horde presses like weather.',
    'The far side of the arena cheers.',
    'An ugly, practised blow.',
    'The torchlight shivers.'
  ],
  crit: [
    'The runes on the plate flare white!',
    'A hit the arena will talk about for a year!',
    'The mirror flinches, it felt that!',
    'Old stone cracks under the feet!',
    'The crowd is on its feet, all of them!'
  ],
  heal: [
    'The wound knits, grudgingly.',
    'Candle-Keeper Enzo would light one for this.',
    'Warmth spreads up the arm.',
    'The breath comes easy again.',
    'The bones settle into place.'
  ],
  guard: [
    'The shield settles like a hung gate.',
    'The plates lock into place.',
    'The banner still above the banner.'
  ],
  fallen: [
    'The dust takes them.',
    'A raven calls once.',
    'One fewer torch in the line.',
    'The crowd goes quiet the way a held breath goes quiet.'
  ],
  special: [
    'The arena floor trembles.',
    'The Virtues\' colors streak the air.',
    'The far standers rise to see.',
    'For one second the eight statues seem to watch.'
  ],
  phaseGeneric: [
    '{N} sets its feet differently now. It has stopped testing you. It is measuring something.',
    '{N} wipes its mouth and smiles. "Good opener. Now the work."',
    '{N} tilts its head. Half is gone, and it looks, if anything, more patient.',
    'Something shifts behind {N}\'s eyes, the part of it that trained fades, and the part of it that kills comes forward.'
  ],
  phaseCrown: [
    '{N} stops. "You fight like someone rehearsing a funeral. We both know whose."',
    'The mirror-crown tilts. "Half. The half you showed the town. Show me the rest."',
    '{N} looks down at its own hands, the ones made from your framework, and laughs softly. "Even the regret fits."'
  ],
  phaseRift: [
    '{N} surfaces from the deep again, slow. "The crowd has not stopped applauding in a hundred years. You are the first silence."',
    'Water runs off {N} in ribbons. "Arena beneath water is still arena. Still watching."'
  ],
  phaseDeception: [
    'The shadow smiles with your own mouth. "Halfway. This is my favourite part, the part where you start to wonder if the Mirror was ever honest with you either."',
    'The horde smells blood and grows teeth. {N} walks through the middle of it untouched.'
  ]
};
