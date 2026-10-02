/* KingdomFlyover, a living cinematic of the player's chosen kingdom:
   their people going about their day in a torch-lit village square. */
(function () {
  const F = function () {
    this.ready = false;
    this.running = false;
    this.failed = false;
    this.time = 0;
    this.kingdom = null;
    this.villagers = [];
    this.phase = 'enter';
    this.finished = false;
  };

  F.prototype.hex2rgb = function (hex) {
    if (hex instanceof THREE.Color) return hex;
    if (typeof hex === 'number') return new THREE.Color(hex);
    const s = String(hex).replace('#', '');
    return new THREE.Color(parseInt(s, 16));
  };
  F.prototype.rand = function (a, b) { return a + Math.random() * (b - a); };
  F.prototype.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* Per-kingdom identity, each realm is its own world, not just a palette swap.
     Skies, terrain, architecture, monuments, lighting and ambient effects all change. */
  F.prototype.themeFor = function (kingdom) {
    const T = {
      altruism: {
        label: 'Lush Meadow', sky: 0x0d2a18, fog: 0x0d2416, fogD: 0.022, amb: 0.75,
        origin: 'Born in the ruins of the Blight Vale, the first healers swore to mend every wound Deception\'s children caused. Green shrines glow across the meadow so the wounded can always find their way home.',
        ground: 0x2e523a, groundRock: 0x1f3b2a, plaza: 0x3d6b4a,
        house: 0x6b4a2f, roof: 0x2e6b3a, win: 0xffe9a8, winGlow: 1.8,
        sun: 0xfff2d8, sunInt: 1.3, warm: 0x66d17a, warmInt: 1.5,
        particle: 'fireflies', particleColor: 0xa8e6cf,
        monument: 'shrine', monumentColor: 0x77dd99, hotspot: { x: 1.2, z: 7.0, r: 1.7, w: 0.4 },
        trees: true, flowers: true, well: true, braziers: 3,
        hoodRatio: 0.3,
        robes: ['#2ecc71', '#8fd694', '#5dbb8a', '#9fc28a', '#4f9e63', '#c8d6a0', '#7fd08a', '#3f8f5f']
      },
      accord: {
        label: 'Collegiate Spire', sky: 0x0a1626, fog: 0x0a1422, fogD: 0.028, amb: 0.8,
        origin: 'Founded from a hundred warring city-states bound by a single treaty, Accord\'s marble spires rose where swords once fell. Its scholars still record every broken promise so history is never repeated.',
        ground: 0x8a9099, groundRock: 0x6f757e, plaza: 0x9aa2ad,
        house: 0xd8d6ce, roof: 0x2a4a7a, win: 0xcfe4ff, winGlow: 1.5,
        sun: 0xdfeaff, sunInt: 1.25, warm: 0x3498db, warmInt: 1.4,
        particle: 'papers', particleColor: 0xa8d8ea,
        monument: 'obelisk', monumentColor: 0x5aa7e0, hotspot: { x: 0.8, z: 7.6, r: 1.9, w: 0.4 },
        arch: 'column', trees: false, flowers: false, well: true,
        hoodRatio: 0.15,
        robes: ['#3498db', '#5aa7e0', '#7fb3d8', '#2c6fa8', '#a8c8e8', '#4a95cc', '#8fb8da', '#3a84b8']
      },
      rapport: {
        label: 'Nocturne Bazaar', sky: 0x12081f, fog: 0x12081f, fogD: 0.042, amb: 0.45,
        origin: 'An underground city of whispers founded by exiles who trusted no crown, only each other. By night its bazaar trades secrets, and every bond forged there is sworn for life.',
        ground: 0x33233f, groundRock: 0x2a1c33, plaza: 0x44304f,
        house: 0x38233a, roof: 0x5a3a8a, win: 0xe0a8ff, winGlow: 1.8,
        sun: 0xbfa8e8, sunInt: 0.95, warm: 0x9b59b6, warmInt: 1.6,
        particle: 'wisps', particleColor: 0xd4a5ff,
        monument: 'lantern', monumentColor: 0xb070d8, hotspot: { x: 1.4, z: 7.4, r: 1.7, w: 0.5 },
        lanterns: true, trees: false, flowers: false, well: true,
        hoodRatio: 0.75,
        robes: ['#9b59b6', '#b070d8', '#7a4a9e', '#c89ae8', '#6a3a88', '#8f5ab0', '#a878c8', '#5a2a72']
      },
      valor: {
        label: 'War-Camp', sky: 0x2a0d05, fog: 0x200a04, fogD: 0.032, amb: 0.6,
        origin: 'Raised from the embers of the First War\'s funeral pyres, Valor\'s warbands train in the camp that never quiets. Its war-horns still sound the oaths their founders died to keep.',
        ground: 0x4a3826, groundRock: 0x3a2a1c, plaza: 0x5a4632,
        house: 0x4a3120, roof: 0x6a3a20, win: 0xffc866, winGlow: 1.7,
        sun: 0xffb36a, sunInt: 1.15, warm: 0xe74c3c, warmInt: 1.7,
        particle: 'embers', particleColor: 0xff7a2a,
        monument: 'dummy', monumentColor: 0xcc5544, hotspot: { x: 1.6, z: 8.0, r: 2.0, w: 0.5 },
        arch: 'halls', trees: false, flowers: false, well: false, braziers: 8,
        hoodRatio: 0.1,
        robes: ['#e74c3c', '#c0392b', '#a05040', '#e0876a', '#702a1a', '#d06040', '#a83a2a', '#c86a50']
      },
      clement: {
        label: 'Gilded Court', sky: 0x241805, fog: 0x1e1404, fogD: 0.03, amb: 0.85,
        origin: 'When the greedy kings crushed the weak, a golden court rose to weigh the scales between mercy and judgment. Clement\'s judges decide with heart and blade in equal measure.',
        ground: 0x8a7a60, groundRock: 0x6f6250, plaza: 0xa08a68,
        house: 0xe8e0d0, roof: 0xc8a020, win: 0xffeaa7, winGlow: 1.9,
        sun: 0xffe8b0, sunInt: 1.35, warm: 0xf1c40f, warmInt: 1.6,
        particle: 'golddust', particleColor: 0xffe08a,
        monument: 'scales', monumentColor: 0xe0b84a, hotspot: { x: 0.8, z: 7.9, r: 1.8, w: 0.5 },
        trees: false, flowers: false, well: true,
        hoodRatio: 0.4,
        robes: ['#f1c40f', '#d4ac0d', '#b8860b', '#e8cf6a', '#a08410', '#c8a83a', '#e8c85a', '#8a7010']
      },
      vigilant: {
        label: 'Iron Bastion', sky: 0x131a22, fog: 0x131a22, fogD: 0.026, amb: 0.7,
        origin: 'Built atop the border watchtowers that never dimmed, Vigilant is the iron wall that held when all else fell. Its sentinels keep the watch their founders began, eyes never close.',
        ground: 0x3a4150, groundRock: 0x2e3542, plaza: 0x495264,
        house: 0x565e70, roof: 0x39404f, win: 0xbfd4ff, winGlow: 1.3,
        sun: 0xc8d8e8, sunInt: 1.1, warm: 0x95a5a6, warmInt: 1.2,
        particle: 'mist', particleColor: 0x88a0b8,
        monument: 'tower', monumentColor: 0x6a7690, hotspot: { x: 1.2, z: 7.8, r: 1.8, w: 0.4 },
        arch: 'fortress', bannersEverywhere: true, trees: false, flowers: false, well: true,
        hoodRatio: 0.45,
        robes: ['#95a5a6', '#7f8c8d', '#a8b4bc', '#6a7680', '#b8c0c8', '#8a96a0', '#5f6b76', '#a0aab3']
      },
      scrupulous: {
        label: 'Ivory Observatory', sky: 0x101c26, fog: 0x101c26, fogD: 0.03, amb: 0.85,
        origin: 'From the Ivory Observatory, scholars of truth hunt every lie that slipped through the kingdoms\' cracks. Scrupulous was founded on a single vow, no deception outlives the dawn.',
        ground: 0xb8bec4, groundRock: 0x9aa0a6, plaza: 0xc8ced4,
        house: 0xe8eaf0, roof: 0x7c8698, win: 0xe4f0ff, winGlow: 1.7,
        sun: 0xffffff, sunInt: 1.4, warm: 0xdfe6ee, warmInt: 1.3,
        particle: 'snow', particleColor: 0xffffff,
        monument: 'spire', monumentColor: 0xd8e0ea, hotspot: { x: 0.6, z: 8.0, r: 1.8, w: 0.35 },
        arch: 'column', trees: false, flowers: false, well: true,
        hoodRatio: 0.2,
        robes: ['#ecf0f1', '#d5dbe0', '#c0c8d0', '#eef2f5', '#abb4be', '#dfe5eb', '#b8c0ca', '#f2f5f8']
      },
      spunk: {
        label: 'Carnival Row', sky: 0x1c1020, fog: 0x1c1020, fogD: 0.036, amb: 0.6,
        origin: 'Born on the rowdy festival-roads where luck, trickery and courage make fortunes overnight, Spunk\'s carnival never sleeps. Its rogues trust instinct over title, and audacity wins.',
        ground: 0x523d26, groundRock: 0x44321f, plaza: 0x644a30,
        house: 0x6b4a5a, roof: 0xb85a3a, win: 0xffc46a, winGlow: 1.8,
        sun: 0xff9966, sunInt: 1.0, warm: 0xe67e22, warmInt: 1.7,
        particle: 'sparks', particleColor: 0xffaa44,
        monument: 'tent', monumentColor: 0xe68a2a, hotspot: { x: 1.4, z: 7.6, r: 1.9, w: 0.45 },
        stringlights: true, trees: false, flowers: false, well: true,
        hoodRatio: 0.5,
        robes: ['#e67e22', '#d35400', '#e8437a', '#f5b041', '#c0392b', '#a26cd6', '#e08a3a', '#2e86c1']
      }
    };
    return T[kingdom.id] || T.altruism;
  };

  /* A reusable low-poly villager avatar (head, body/robe, arms). */
  F.prototype.buildVillager = function (robe, skin, opts) {
    const o = opts || {};
    const g = new THREE.Group();
    const m = (c, mm, r) => new THREE.MeshStandardMaterial({ color: c, metalness: mm == null ? 0.2 : mm, roughness: r == null ? 0.7 : r });
    const H = o.h || 1.45;
    const add = (geo, mat, x, y, z) => { const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x, y, z); mesh.castShadow = true; g.add(mesh); return mesh; };
    // robe/body
    add(new THREE.CylinderGeometry(0.17, 0.34, H * 0.55, 8), m(robe, 0.2, 0.8), 0, H * 0.55, 0);
    // head
    add(new THREE.SphereGeometry(0.15, 12, 12), m(skin, 0.1, 0.6), 0, H * 0.9, 0);
    // hood or hair
    if (o.hood) add(new THREE.ConeGeometry(0.17, 0.3, 8), m(robe, 0.2, 0.8), 0, H * 1.02, 0);
    else add(new THREE.SphereGeometry(0.06, 8, 8), m(o.hair || 0x3a2a1a, 0, 0.8), 0, H * 0.99, 0.13);
    // arms
    const armL = new THREE.Group(); armL.position.set(-0.24, H * 0.74, 0); g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.24, H * 0.74, 0); g.add(armR);
    armL.add(add(new THREE.CylinderGeometry(0.05, 0.06, H * 0.3, 6), m(robe, 0.3, 0.7), 0, -H * 0.14, 0));
    armR.add(add(new THREE.CylinderGeometry(0.05, 0.06, H * 0.3, 6), m(robe, 0.3, 0.7), 0, -H * 0.14, 0));
g.userData.armL = armL; g.userData.armR = armR;
    return g;
  };

  /* Low-poly horse for the mounted guard (~2u tall). */
  F.prototype.buildHorse = function (shade) {
    const g = new THREE.Group();
    const hide = new THREE.MeshStandardMaterial({ color: shade || 0x4a4038, roughness: 0.85, metalness: 0.1 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x332c26, roughness: 0.9 });
    const man = new THREE.MeshStandardMaterial({ color: 0x2c2a26, roughness: 0.9 });
    const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; if (rx||ry||rz) m.rotation.set(rx||0, ry||0, rz||0); g.add(m); return m; };
    // body
    add(new THREE.CylinderGeometry(0.34, 0.4, 1.9, 10), hide, 0, 1.0, 0, Math.PI / 2, 0, 0);
    // neck + head
    add(new THREE.CylinderGeometry(0.16, 0.22, 0.8, 8), hide, 0, 1.55, 0.85, -0.5, 0, 0);
    add(new THREE.BoxGeometry(0.32, 0.3, 0.4), hide, 0, 1.75, 1.3);
    // muzzle
    add(new THREE.BoxGeometry(0.2, 0.16, 0.28), man, 0, 1.62, 1.55);
    // ears
    add(new THREE.ConeGeometry(0.05, 0.22, 4), man, -0.08, 2.0, 1.3, 0.3, 0, 0);
    add(new THREE.ConeGeometry(0.05, 0.22, 4), man, 0.08, 2.0, 1.3, 0.3, 0, 0);
    // tail
    add(new THREE.CylinderGeometry(0.04, 0.08, 0.7, 6), man, 0, 1.1, -1.05, 0.5, 0, 0);
    // four legs
    const legs = [];
    for (const sx of [-0.3, 0.3]) {
      for (const sz of [0.55, -0.55]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.85, 7), dark);
        leg.position.set(sx, 0.42, sz);
        leg.castShadow = true;
        g.add(leg);
        legs.push(leg);
      }
    }
    g.userData.legs = legs;
    return g;
  };

  /* Mounted guard: horse + armoured rider with a spear. */
  F.prototype.buildMountedGuard = function (k) {
    const guard = new THREE.Group();
    const horse = this.buildHorse();
    guard.add(horse);
    this.guardHorse = horse;
    const rider = this.buildVillager(new THREE.Color(0x4a4d5e), 0xd9b98a, { h: 1.3, hood: false, hair: 0x22222a });
    rider.position.set(0, 1.28, 0);
    rider.scale.setScalar(0.85);
    guard.add(rider);
    // harness blanket in kingdom color
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 1.15), new THREE.MeshStandardMaterial({ color: this.hex2rgb(k.color), emissive: this.hex2rgb(k.color), emissiveIntensity: 0.2, roughness: 0.6 }));
    blanket.position.set(0, 1.02, 0);
    blanket.rotation.x = Math.PI / 2;
    horse.add(blanket);
    // spear
    const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 6), new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.8 }));
    spear.position.set(0.35, 0.9, 0.55);
    spear.rotation.z = -0.12;
    guard.add(spear);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0xdfeaff, metalness: 0.9, roughness: 0.15, emissive: 0x88bbff, emissiveIntensity: 0.4 }));
    tip.position.set(0.35, 2.05, 0.55);
    guard.add(tip);
    guard.userData.spear = spear;
    guard.userData.rider = rider;
    return guard;
  };

  /* A couple of farm animals: pecking hens and a trotting dog. */
  F.prototype.buildHen = function () {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), new THREE.MeshStandardMaterial({ color: 0xe8e4d8, roughness: 0.8 }));
    body.scale.set(1, 0.85, 1.25); body.position.y = 0.3; body.castShadow = true;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), new THREE.MeshStandardMaterial({ color: 0xd8d2c0, roughness: 0.8 }));
    head.position.set(0, 0.52, 0.22); g.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 5), new THREE.MeshStandardMaterial({ color: 0xe0912a, roughness: 0.5 }));
    beak.rotation.x = -Math.PI / 2; beak.position.set(0, 0.52, 0.34); g.add(beak);
    const comb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), new THREE.MeshStandardMaterial({ color: 0xd84040 }));
    comb.position.set(0, 0.62, 0.2); g.add(comb);
    g.userData.state = 'peck';
    g.userData.hopT = 0;
    return g;
  };

  F.prototype.buildDog = function () {
    const g = new THREE.Group();
    const tan = new THREE.MeshStandardMaterial({ color: 0x9a7a52, roughness: 0.9 });
    const add = (geo, mat, x, y, z, rx) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx) m.rotation.x = rx; m.castShadow = true; g.add(m); return m; };
    add(new THREE.BoxGeometry(0.5, 0.34, 1.0), tan, 0, 0.34, 0);
    add(new THREE.BoxGeometry(0.22, 0.22, 0.3), tan, 0, 0.55, 0.55);
    add(new THREE.ConeGeometry(0.06, 0.2, 6), tan, 0, 0.72, 0.6);
    const tail = add(new THREE.CylinderGeometry(0.04, 0.06, 0.3, 6), tan, 0, 0.52, -0.62, -0.6);
    const legs = [];
    for (const sx of [-0.18, 0.18]) { for (const sz of [0.3, -0.3]) { legs.push(add(new THREE.CylinderGeometry(0.05, 0.06, 0.34, 6), tan, sx, 0.17, sz)); } }
    g.userData.legs = legs;
    g.userData.tail = tail;
    return g;
  };

  F.prototype.buildTown = function (k) {
    const col = this.hex2rgb(k.color);
    const th = this.theme = this.themeFor(k);
    const scene = this.scene;

    // biome ground
    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 18, 0.3, 64, 1, true),
      new THREE.MeshStandardMaterial({ color: this.hex2rgb(th.ground), metalness: 0.05, roughness: 0.95 })
    );
    ground.rotation.x = Math.PI / 2; ground.position.y = -0.15; ground.receiveShadow = true;
    scene.add(ground);
    // inner plaza ring in the kingdom color
    const plaza = new THREE.Mesh(
      new THREE.TorusGeometry(7, 0.14, 8, 64),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.4, metalness: 0.8, roughness: 0.3 })
    );
    plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.02;
    scene.add(plaza);

    this.buildHouses(k, th, col);
    this.buildBanners(k, th, col);

    // market stalls (2), awning always in kingdom color
    for (let i = 0; i < 2; i++) {
      const a = i === 0 ? 0.6 : Math.PI + 0.6;
      const sx = Math.cos(a) * 6.5, sz = Math.sin(a) * 6.5;
      const stall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 1.1), new THREE.MeshStandardMaterial({ color: this.hex2rgb(th.groundRock), roughness: 0.9 }));
      stall.position.set(sx, 0.5, sz);
      stall.rotation.y = -a;
      scene.add(stall);
      const awn = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.2), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.15, side: THREE.DoubleSide }));
      awn.position.set(sx, 1.35, sz); awn.rotation.y = -a;
      scene.add(awn);
      for (let wI = 0; wI < 5; wI++) {
        const ware = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: this.hex2rgb(['#d4a847', '#e07858', '#5fb88a', '#c86a8a', '#7aa0d0'][wI % 5]), roughness: 0.6 }));
        ware.position.set(sx - 0.8 + wI * 0.4, 1.05, sz);
        scene.add(ware);
      }
      this.stalls.push({ pos: { x: sx, z: sz }, rot: -a });
    }

    // central well (some realms don't have one)
    if (th.well !== false) {
      const well = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.95, 1.0, 16), new THREE.MeshStandardMaterial({ color: this.hex2rgb(th.groundRock), roughness: 0.9 }));
      well.position.set(0, 0.5, 0); scene.add(well);
      const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.6, 6), new THREE.MeshStandardMaterial({ color: 0x4a3a28 }));
      wellRoof.position.y = 1.5; well.add(wellRoof);
      this.well = well;
    }

    // torch braziers, more for war realms, fewer for the meadow
    const bCount = th.braziers || 5;
    for (let i = 0; i < bCount; i++) {
      const a = (i / bCount) * Math.PI * 2 + 0.9;
      const x = Math.cos(a) * 11.5, z = Math.sin(a) * 11.5;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.5, 6), new THREE.MeshStandardMaterial({ color: 0x3a2c18 }));
      post.position.set(x, 0.75, z); scene.add(post);
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffaa33, emissive: 0xff7711, emissiveIntensity: 1.6 }));
      flame.position.set(x, 1.6, z); flame.userData.baseY = 1.6; scene.add(flame);
      this.flames.push(flame);
      const bLight = new THREE.PointLight(0xff9933, 0.6, 11, 2);
      bLight.position.set(x, 1.8, z); scene.add(bLight);
      this.lights.push(bLight);
    }

    this.buildDecor(k, th, col);

    // low king + throne at the far edge for presence (optional, subtle)
    const king = this.buildVillager(new THREE.Color(col), 0xe0c09a, { h: 1.6, hood: false, hair: 0xffffff });
    king.scale.setScalar(1.3);
    king.position.set(0, 0.15, -11.5);
    king.rotation.y = Math.PI;
    scene.add(king);
    this.king = king;
  };

  /* Ring of dwellings, architecture style follows the kingdom identity. */
  F.prototype.buildHouses = function (k, th, col) {
    const scene = this.scene;
    const wallMat = new THREE.MeshStandardMaterial({ color: this.hex2rgb(th.house), metalness: 0.1, roughness: 0.9 });
    const roofMat = new THREE.MeshStandardMaterial({ color: this.hex2rgb(th.roof), roughness: 0.9 });
    const winMat = new THREE.MeshStandardMaterial({ color: this.hex2rgb(th.win), emissive: this.hex2rgb(th.win), emissiveIntensity: th.winGlow, side: THREE.DoubleSide });
    const style = th.arch === 'column' ? 'columns' : (th.arch === 'fortress' ? 'keep' : 'halls');
    const N = style === 'keep' ? 8 : 10;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + 0.3;
      const x = Math.cos(a) * 14, z = Math.sin(a) * 14;
      const varH = style === 'keep' ? 3.4 + (i % 3) * 0.5 : 2.4 + (i % 3);
      const wallW = style === 'keep' ? 4.2 : 3.2, wallD = style === 'keep' ? 3.6 : 3.2;
      const wall = new THREE.Mesh(new THREE.BoxGeometry(wallW, varH, wallD), wallMat);
      wall.position.set(x, varH / 2, z);
      wall.rotation.y = a;
      scene.add(wall);
      if (style === 'keep') {
        for (let cI = 0; cI < 3; cI++) {
          const cren = new THREE.Mesh(new THREE.BoxGeometry(wallW * 0.24, 0.4, wallW * 0.24), new THREE.MeshStandardMaterial({ color: 0x2e3542, roughness: 0.9 }));
          cren.position.set(x - wallW / 2 + cI * wallW * 0.5, varH + 0.22, z);
          cren.rotation.y = a;
          scene.add(cren);
        }
      }
      let roof;
      if (style === 'columns') {
        roof = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.15, 0.5, 8), roofMat);
        roof.position.set(x, varH + 0.35, z);
        roof.rotation.y = a;
      } else {
        roof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.1 + (i % 3) * 0.15, 4), roofMat);
        roof.position.set(x, varH + 0.75, z);
        roof.rotation.y = Math.PI / 4;
      }
      scene.add(roof);
      // glowing windows face the plaza
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), winMat);
      win.position.set(x, varH * 0.66, z); win.lookAt(0, varH * 0.66, 0);
      scene.add(win);
      if (th.stringlights) {
        for (let s = 0; s < 3; s++) {
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: this.hex2rgb(th.win), emissiveIntensity: 1.8 }));
          bulb.position.set(x - 0.9 + s * 0.9, varH + 0.15, z); scene.add(bulb);
        }
      }
    }
  };

  /* Kingdom banners ring the plaza. */
  F.prototype.buildBanners = function (k, th, col) {
    const scene = this.scene;
    const count = th.bannersEverywhere ? 10 : 6;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.5;
      const x = Math.cos(a) * 9.5, z = Math.sin(a) * 9.5;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 6), new THREE.MeshStandardMaterial({ color: 0x3a2c18, metalness: 0.6, roughness: 0.5 }));
      pole.position.set(x, 1.7, z); scene.add(pole);
      const banner = new THREE.Mesh(
        new THREE.PlaneGeometry(1.0, 1.5),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.2, side: THREE.DoubleSide })
      );
      banner.position.set(x, 2.8, z); banner.lookAt(0, 2.8, 0);
      banner.userData.baseRotY = banner.rotation.y;
      scene.add(banner);
      this.banners.push(banner);
      if (th.particle === 'embers' || th.particle === 'sparks') {
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff9933, emissive: 0xff5511, emissiveIntensity: 1.5 }));
        flame.position.set(x, 3.35, z); flame.userData.baseY = 3.35; scene.add(flame);
        this.flames.push(flame);
      }
    }
  };

  /* Signature monument + kingdom-specific dressing. */
  F.prototype.buildDecor = function (k, th, col) {
    const scene = this.scene;
    this.monument = null;
    const mk = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; scene.add(m); return m; };

    if (th.trees) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.15;
        const x = Math.cos(a) * 15.2, z = Math.sin(a) * 15.2;
        mk(new THREE.CylinderGeometry(0.18, 0.3, 2.2, 7), new THREE.MeshStandardMaterial({ color: 0x5a4430, roughness: 1 }), x, 1.1, z);
        const leaf = mk(new THREE.SphereGeometry(1.15, 8, 8), new THREE.MeshStandardMaterial({ color: 0x2f7a44, roughness: 0.9 }), x, 3.1, z);
        leaf.scale.set(1, 0.9, 1);
      }
      for (let i = 0; i < 24; i++) {
        const a = this.rand(0, Math.PI * 2), r = this.rand(10, 15.5);
        const fl = mk(new THREE.ConeGeometry(0.09, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0x77dd99, emissive: 0x449955, emissiveIntensity: 0.5 }), Math.cos(a) * r, 0.15, Math.sin(a) * r);
        const fl2 = new THREE.Mesh(fl.geometry.clone(), fl.material.clone());
        fl2.position.set(fl.position.x + 0.35, 0.12, fl.position.z);
        scene.add(fl2);
      }
    }

    // signature monument set just off the far plaza edge, framed by the sweep
    const mX = 0, mZ = 9.5;
    const mColM = new THREE.MeshStandardMaterial({ color: this.hex2rgb(th.monumentColor), emissive: this.hex2rgb(th.monumentColor), emissiveIntensity: 0.45, metalness: 0.4, roughness: 0.3 });
    const stone = new THREE.MeshStandardMaterial({ color: 0xcfc8bd, metalness: 0.15, roughness: 0.5 });
    const mono = new THREE.Group();
    const mm = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; mono.add(m); return m; };
    switch (th.monument) {
      case 'shrine': {
        mm(new THREE.CylinderGeometry(1.0, 1.25, 0.35, 10), stone, 0, 0.2, 0);
        mm(new THREE.SphereGeometry(0.45, 10, 10), mColM, 0, 0.8, 0);
        this.monumentGlow = [];
        for (let i = 0; i < 3; i++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7 + i * 0.22, 0.05, 6, 24), mColM);
          ring.rotation.x = Math.PI / 2; ring.position.y = 0.9 + i * 0.02;
          mono.add(ring); this.monumentGlow.push(ring);
        }
        break;
      }
      case 'obelisk': {
        mm(new THREE.CylinderGeometry(0.18, 0.55, 4.4, 4), stone, 0, 2.2, 0);
        mm(new THREE.ConeGeometry(0.5, 0.7, 4), mColM, 0, 4.8, 0);
        mm(new THREE.BoxGeometry(2.2, 0.4, 2.2), stone, 0, 0.2, 0);
        break;
      }
      case 'scales': {
        mm(new THREE.CylinderGeometry(0.12, 0.16, 2.6, 8), stone, 0, 1.3, 0);
        mm(new THREE.BoxGeometry(2.4, 0.12, 0.12), mColM, 0, 2.7, 0);
        for (const s of [-1, 1]) {
          mm(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.9 }), s * 1.1, 2.5, 0);
          mm(new THREE.CylinderGeometry(0.4, 0.55, 0.08, 12), mColM, s * 1.1, 2.28, 0);
        }
        break;
      }
      case 'dummy': {
        mm(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 6), new THREE.MeshStandardMaterial({ color: 0x4a3a28 }), 0, 0.6, 0);
        mm(new THREE.BoxGeometry(0.7, 1.0, 0.25), new THREE.MeshStandardMaterial({ color: 0x6a6048 }), 0, 1.7, 0);
        const tg = new THREE.Mesh(new THREE.CircleGeometry(0.28, 10), mColM);
        tg.position.set(0, 1.9, 0.16); tg.rotation.y = Math.PI / 2; mono.add(tg);
        for (let s = -1; s <= 1; s++) mm(new THREE.BoxGeometry(0.05, 0.7, 0.05), mColM, s * 0.9, 1.35, 0);
        break;
      }
      case 'tower': {
        mm(new THREE.CylinderGeometry(0.9, 1.15, 3.6, 10), stone, 0, 1.8, 0);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.9, 8), new THREE.MeshStandardMaterial({ color: 0x2e3542 }));
        cap.position.y = 4.05; mono.add(cap);
        for (let i = 0; i < 6; i++) {
          const ca = (i / 6) * Math.PI * 2;
          mm(new THREE.BoxGeometry(0.18, 0.5, 0.18), stone, Math.cos(ca) * 0.95, 3.8, Math.sin(ca) * 0.95);
        }
        const bf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffaa33, emissive: 0xff7711, emissiveIntensity: 1.5 }));
        bf.position.set(0, 4.55, 0); bf.userData.baseY = 4.55; mono.add(bf);
        this.flames.push(bf);
        const bl = new THREE.PointLight(0xff9933, 0.7, 10, 2); bl.position.set(0, 4.6, 0); mono.add(bl);
        this.lights.push(bl);
        break;
      }
      case 'spire': {
        mm(new THREE.CylinderGeometry(0.5, 1.1, 3.0, 6), stone, 0, 1.5, 0);
        mm(new THREE.CylinderGeometry(0.3, 0.5, 1.6, 6), stone, 0, 3.3, 0);
        mm(new THREE.ConeGeometry(0.55, 1.3, 8), mColM, 0, 4.7, 0);
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), new THREE.MeshStandardMaterial({ color: 0xbfe8ff, emissive: 0x88ccff, emissiveIntensity: 1.2 }));
        orb.position.set(0, 5.35, 0); mono.add(orb);
        break;
      }
      case 'lantern': {
        mm(new THREE.CylinderGeometry(0.09, 0.12, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0x3a2c18 }), 0, 1.6, 0);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), new THREE.MeshStandardMaterial({ color: 0xffd7a8, emissive: 0xffb45a, emissiveIntensity: 1.8 }));
        lamp.position.set(0, 3.35, 0); mono.add(lamp);
        this.flames.push(lamp);
        this.monumentGlow = [];
        const ll = new THREE.PointLight(0xffb45a, 1.0, 9, 2); ll.position.set(0, 3.35, 0); mono.add(ll);
        this.lights.push(ll);
        break;
      }
      case 'tent': {
        for (const s of [-1, 1]) {
          const pm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.6, 6), new THREE.MeshStandardMaterial({ color: 0x3a2c18 }));
          pm.position.set(s * 1.4, 1.8, 0); mono.add(pm);
          const canV = s > 0 ? 0xe67e22 : 0xa26cd6;
          const can = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.0, 8), new THREE.MeshStandardMaterial({ color: canV, emissive: canV, emissiveIntensity: 0.25, side: THREE.DoubleSide }));
          can.position.set(s * 1.4, 3.4, 0); mono.add(can);
        }
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.3, side: THREE.DoubleSide }));
        flag.position.set(0, 3.9, 0); mono.add(flag);
        break;
      }
      default: break;
    }
    mono.position.set(mX, 0, mZ);
    scene.add(mono);
    this.monument = mono;

    // extra hanging lanterns for night-bazaar realms
    if (th.lanterns) {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.2;
        const x = Math.cos(a) * 6.8, z = Math.sin(a) * 6.8;
        mk(new THREE.CylinderGeometry(0.05, 0.07, 2.0, 6), new THREE.MeshStandardMaterial({ color: 0x2c2320 }), x, 1.0, z);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: this.hex2rgb(th.win), emissiveIntensity: 1.8 }));
        lamp.position.set(x, 2.2, z); scene.add(lamp);
        this.flames.push(lamp);
        const ll = new THREE.PointLight(0xffb45a, 0.5, 8, 2); ll.position.set(x, 2.3, z); scene.add(ll);
        this.lights.push(ll);
      }
    }
  };

  /* Ambient weather/particles per realm: fireflies, wisps, embers, sparks,
     golddust, papers, snow or low mist. */
  F.prototype.buildWeather = function (th) {
    const type = th.particle || 'none';
    if (type === 'none') { this.particles = null; return; }
    const N = type === 'mist' ? 60 : 130;
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = this.rand(0, Math.PI * 2), r = this.rand(0, 15.5);
      pos[i * 3 + 0] = Math.cos(a) * r;
      pos[i * 3 + 1] = type === 'snow' ? this.rand(-0.5, 8) : this.rand(0.02, 4.5);
      pos[i * 3 + 2] = Math.sin(a) * r;
      if (type === 'embers' || type === 'sparks' || type === 'golddust' || type === 'papers') {
        vel[i * 3 + 0] = this.rand(-0.2, 0.2);
        vel[i * 3 + 1] = this.rand(0.3, 0.8);
        vel[i * 3 + 2] = this.rand(-0.2, 0.2);
      } else if (type === 'snow') {
        vel[i * 3 + 0] = this.rand(-0.15, 0.15);
        vel[i * 3 + 1] = this.rand(-0.6, -0.25);
      } else if (type === 'mist') {
        vel[i * 3 + 0] = this.rand(-0.25, 0.25);
        vel[i * 3 + 1] = this.rand(0.02, 0.12);
        vel[i * 3 + 2] = this.rand(-0.25, 0.25);
      } else {
        vel[i * 3 + 1] = this.rand(0.08, 0.28);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const isGlow = type !== 'snow' && type !== 'papers' && type !== 'mist';
    const mat = new THREE.PointsMaterial({
      color: this.hex2rgb(th.particleColor),
      size: type === 'mist' ? 0.6 : isGlow ? 0.1 : 0.14,
      transparent: true, opacity: type === 'mist' ? 0.16 : 0.8, depthWrite: false,
      blending: (isGlow || type === 'mist') ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    this.scene.add(points);
    this.particles = { points: points, pos: pos, vel: vel, type: type, N: N };
  };

  F.prototype.liveWeather = function (dt) {
    const P = this.particles;
    if (!P) return;
    const pos = P.pos, vel = P.vel, N = P.N, type = P.type, t = this.time;
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      let y = pos[i3 + 1];
      if (type === 'fireflies' || type === 'wisps') {
        y += vel[i3 + 1] * dt;
        if (y > 4.6) y = 0.3;
        pos[i3] += Math.sin(t * 0.5 + i) * 0.02 * dt * 10;
        pos[i3 + 2] += Math.cos(t * 0.6 + i) * 0.02 * dt * 10;
      } else if (type === 'snow') {
        y += vel[i3 + 1] * dt;
        pos[i3] += Math.sin(t * 0.8 + i) * 0.01;
        pos[i3 + 2] += Math.cos(t * 0.7 + i) * 0.01;
        if (y < -0.3) y = 9;
      } else if (type === 'embers' || type === 'sparks' || type === 'golddust') {
        y += vel[i3 + 1] * dt;
        pos[i3] += vel[i3] * dt + Math.sin(t * 3 + i) * 0.004;
        pos[i3 + 2] += vel[i3 + 2] * dt + Math.cos(t * 3 + i) * 0.004;
        if (y > 5.2) { pos[i3] = this.rand(-12, 12); pos[i3 + 2] = this.rand(-12, 12); y = 0.1; }
      } else if (type === 'papers') {
        y += vel[i3 + 1] * dt;
        pos[i3] += vel[i3] * dt * 2;
        pos[i3 + 2] += vel[i3 + 2] * dt * 2;
        if (y > 3.5 || Math.abs(pos[i3]) > 16 || Math.abs(pos[i3 + 2]) > 16) { pos[i3] = 0; pos[i3 + 2] = 0; y = 0.2; }
      } else if (type === 'mist') {
        y += vel[i3 + 1] * dt;
        if (y < 0.02) y = 0.02;
        pos[i3] += vel[i3] * dt * 0.8;
        pos[i3 + 2] += vel[i3 + 2] * dt * 0.8;
        if (Math.abs(pos[i3]) > 17) pos[i3] *= -0.9;
        if (Math.abs(pos[i3 + 2]) > 17) pos[i3 + 2] *= -0.9;
      }
      pos[i3 + 1] = y;
    }
    P.points.geometry.attributes.position.needsUpdate = true;
  };

  /* Spawn the villagers, the "people" of the kingdom. */
  F.prototype.spawnPeople = function (k) {
    const th = this.theme || {};
    const robes = th.robes || [k.color, '#c8b98a', '#8a9bbf', '#a77a6a', '#6f8f7a', '#b98a8a', '#8a7a9f', '#cfbf8f'];
    const hoodRatio = th.hoodRatio == null ? 0.33 : th.hoodRatio;
    const skins = [0xe3c9a0, 0xd9b98a, 0xb98a5a, 0xe6cfae, 0xcaa078];
    const N = 14;
    for (let i = 0; i < N; i++) {
      const robe = this.hex2rgb(robes[i % robes.length]).clone().lerp(new THREE.Color(k.color), 0.15);
      const v = this.buildVillager(robe, skins[i % skins.length], Math.random() < hoodRatio ? { hood: true } : {});
      // random spot inside the plaza
      const a = this.rand(0, Math.PI * 2), r = this.rand(1.5, 7.5);
      v.position.set(Math.cos(a) * r, 0.12, Math.sin(a) * r);
      v.rotation.y = this.rand(0, Math.PI * 2);
      v.userData = Object.assign(v.userData, {
        home: v.position.clone(),
        target: null, state: 'wander', stateT: 0, idle: this.rand(0, 5),
        walkPhase: this.rand(0, 6.28), speed: this.rand(0.4, 0.8),
        stallIdx: null
      });
      // a few are stall workers / well-bearers
      if (i < this.stalls.length) { v.userData.stallIdx = i; v.userData.state = 'work'; v.position.copy({ x: this.stalls[i].pos.x + this.rand(-0.6, 0.6), y: 0.12, z: this.stalls[i].pos.z + this.rand(-0.6, 0.6) }); }
      else if (i === N - 1 && this.well) { v.userData.state = 'well'; v.position.set(this.rand(-0.6, 0.6), 0.12, this.rand(-0.6, 0.6)); }
      this.scene.add(v);
      this.villagers.push(v);
    }
  };

  F.prototype.pickTarget = function (v) {
    const hot = (this.theme || {}).hotspot;
    if (hot && Math.random() < (hot.w || 0.4)) {
      const a = this.rand(0, Math.PI * 2), r = this.rand(0, hot.r || 1.8);
      v.userData.target = new THREE.Vector3(hot.x + Math.cos(a) * r, 0.12, hot.z + Math.sin(a) * r);
      return;
    }
    const a = this.rand(0, Math.PI * 2), r = this.rand(1.5, 7.5);
    v.userData.target = new THREE.Vector3(Math.cos(a) * r, 0.12, Math.sin(a) * r);
  };

  /* Spawn the mounted guard (still patrol around the square) + farm animals. */
  F.prototype.spawnGuardAndAnimals = function (k) {
    this.animals = [];
    // mounted guard patrolling a ring just outside the plaza
    const guard = this.buildMountedGuard(k);
    const gA = this.rand(0, Math.PI * 2);
    guard.userData = Object.assign(guard.userData, {
      radius: this.rand(9.0, 9.6), angle: gA, speed: this.rand(0.12, 0.2),
      bob: this.rand(0, 6.28)
    });
    const gx = Math.cos(gA) * guard.userData.radius, gz = Math.sin(gA) * guard.userData.radius;
    guard.position.set(gx, 0, gz);
    guard.rotation.y = -gA;
    this.scene.add(guard);
    this.guard = guard;

    // two hens near the well / a stall
    const henSpots = [[1.6, 1.1], [-1.4, -1.9], [2.2, -2.4]];
    for (let i = 0; i < 3; i++) {
      const hen = this.buildHen();
      hen.position.set(henSpots[i][0], 0, henSpots[i][1]);
      hen.rotation.y = this.rand(0, Math.PI * 2);
      hen.userData = Object.assign(hen.userData, {
        peckT: this.rand(0, 2), speed: this.rand(0.25, 0.4),
        home: hen.position.clone()
      });
      this.scene.add(hen);
      this.animals.push(hen);
    }
    // one dog trotting around
    const dog = this.buildDog();
    const da = this.rand(0, Math.PI * 2);
    dog.position.set(Math.cos(da) * 4.5, 0, Math.sin(da) * 4.5);
    dog.userData = Object.assign(dog.userData, {
      walkPhase: this.rand(0, 6.28), speed: this.rand(0.6, 0.9),
      target: this.pickAnimalTarget(), state: 'trot'
    });
    this.scene.add(dog);
    this.animals.push(dog);
    this.dog = dog;
  };

  F.prototype.pickAnimalTarget = function () {
    const a = this.rand(0, Math.PI * 2), r = this.rand(1.5, 5.5);
    return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
  };

  /* Per-frame animal "life": hens peck then hop-scuttle, dog trots around. */
  F.prototype.liveAnimals = function (dt) {
    const t = this.time;
    (this.animals || []).forEach((an, ai) => {
      if (an.userData.legs) {
        // it's the dog
        const u = an.userData;
        u.walkPhase += dt * u.speed * 10;
        // trot: legs swing + body rock
        an.userData.legs.forEach((leg, li) => { leg.rotation.x = Math.sin(u.walkPhase + (li % 2) * Math.PI) * 0.5; });
        an.position.y = Math.abs(Math.sin(u.walkPhase)) * 0.04;
        if (u.tail) u.tail.rotation.x = -0.6 + Math.sin(t * 8 + ai) * 0.25;
        if (u.state !== 'trot') { u.state = 'trot'; }
        const to = u.target ? u.target.clone() : null;
        if (!to) { u.target = this.pickAnimalTarget(); u.stateT = 0; }
        else {
          u.stateT += dt;
          to.y = 0;
          const dist = an.position.distanceTo(to);
          if (dist < 0.25 || u.stateT > 8) { u.target = this.pickAnimalTarget(); u.stateT = 0; }
          else {
            const dir = to.sub(an.position).setY(0).normalize();
            an.position.add(dir.multiplyScalar(u.speed * dt));
            const wy = Math.atan2(dir.x, dir.z);
            an.rotation.y += (wy - an.rotation.y) * 0.12;
          }
        }
        // chase none, just keeps trotting
      } else {
        // hens handled in liveHens
      }
    });
    this.liveHens(dt, t);
  };

  F.prototype.liveHens = function (dt, t) {
    (this.animals || []).forEach((an, ai) => {
      if (!an.userData.legs && an.userData.state) {
        const u = an.userData;
        u.peckT += dt;
        if (u.state === 'peck') {
          // head bobs down toward the ground then back
          an.children.forEach(c => { if (c.position && c.position.y > 0.4) c.position.y = 0.52 - Math.sin(this.time * 12 + ai * 3) * 0.16; });
          if (u.peckT > 1.6) { u.state = 'scuttle'; u.scuttleT = 0; u.scuttleA = this.rand(0, Math.PI * 2); }
        } else if (u.state === 'scuttle') {
          u.scuttleT += dt;
          an.rotation.y += (u.scuttleA - an.rotation.y) * 0.1;
          const dx = Math.sin(u.scuttleA) * u.speed * dt, dz = Math.cos(u.scuttleA) * u.speed * dt;
          an.position.x += dx; an.position.z += dz;
          an.position.y = Math.abs(Math.sin(this.time * 20)) * 0.03;
          if (u.scuttleT > 1.4 || an.position.length() > 8) { u.state = 'peck'; u.peckT = 0; }
        }
      }
    });
  };

  /* Per-frame villager "living" behaviour: wander, pause to chat, work, well. */
  F.prototype.livePeople = function (dt) {
    // chat detection: villagers who get close pause and face each other
    const chatPairs = [];
    for (let i = 0; i < this.villagers.length; i++) {
      for (let j = i + 1; j < this.villagers.length; j++) {
        const A = this.villagers[i], B = this.villagers[j];
        if (A.userData.state === 'wander' && B.userData.state === 'wander') {
          const d = A.position.distanceTo(B.position);
          if (d < 1.3) chatPairs.push([A, B, i, j]);
        }
      }
    }

    this.villagers.forEach((v, vi) => {
      const u = v.userData;
      u.stateT += dt;

      // walk bob
      if (u.state === 'wander') {
        u.walkPhase += dt * u.speed * 9;
        v.userData.armL.rotation.z = Math.sin(u.walkPhase) * 0.4;
        v.userData.armR.rotation.z = -Math.sin(u.walkPhase) * 0.4;
        if (!u.target) this.pickTarget(v);
        const to = u.target.clone().sub(v.position); to.y = 0;
        const dist = to.length();
        if (dist < 0.3) { u.state = 'pause'; u.stateT = 0; u.pauseLen = this.rand(1.2, 3); }
        else {
          const dir = to.normalize();
          v.position.add(dir.multiplyScalar(u.speed * dt));
          const wantYaw = Math.atan2(dir.x, dir.z);
          v.rotation.y += (wantYaw - v.rotation.y) * 0.15;
        }
      } else if (u.state === 'pause') {
        v.userData.armL.rotation.z *= 0.9; v.userData.armR.rotation.z *= 0.9;
        if (u.stateT > u.pauseLen) { u.state = 'wander'; u.target = null; }
      } else if (u.state === 'work') {
        const st = this.stalls[u.stallIdx];
        if (st) {
          v.rotation.y += (st.rot + Math.PI / 2 - v.rotation.y) * 0.1;
          v.userData.armL.rotation.z = 1.2 + Math.sin(this.time * 3) * 0.3;
          v.userData.armR.rotation.z = -0.6;
        }
      } else if (u.state === 'well') {
        v.rotation.y += (Math.PI / 2 + Math.sin(this.time * 0.5) * 0.3 - v.rotation.y) * 0.05;
        v.userData.armL.rotation.z = 1.4;
        v.rotation.y = Math.PI / 2 + Math.sin(this.time * 0.4) * 0.2;
        v.userData.armL.rotation.z = 1.3 + Math.sin(this.time * 4) * 0.2;
        v.userData.armR.rotation.z = -1.3 - Math.sin(this.time * 4) * 0.2;
      }
    });

    // chat: pair them up to face + gesture for a few seconds
    chatPairs.forEach(([A, B, ai, bi]) => {
      if (A.userData.state === 'wander' && B.userData.state === 'wander') {
        A.userData.state = 'chat'; B.userData.state = 'chat';
        A.userData.stateT = 0; B.userData.stateT = 0;
        A.userData.chatLen = this.rand(2, 4); B.userData.chatLen = A.userData.chatLen;
      }
    });
    this.villagers.forEach((v, vk) => {
      if (v.userData.state === 'chat') {
        v.userData.armL.rotation.z = 0.5 + Math.sin(this.time * (3 + vk)) * 0.3+0;
        v.userData.armR.rotation.z = -0.5 - Math.sin(this.time * (3 + vk)) * 0.3+0;
        if (v.userData.stateT > v.userData.chatLen) { v.userData.state = 'wander'; v.userData.target = null; }
      }
    });
  };

  F.prototype.init = function (containerId, kingdom) {
    if (!window.THREE) { this.failed = true; return false; }
    const container = document.getElementById(containerId);
    if (!container) { this.failed = true; return false; }
    try {
      this.container = container;
      this.kingdom = kingdom;
      this.kcolor = this.hex2rgb(kingdom.color);
      this.banners = []; this.stalls = []; this.flames = []; this.lights = []; this.villagers = [];
      this.animals = []; this.guard = null; this.guardHorse = null; this.dog = null;

      this.scene = new THREE.Scene();
      this.theme = this.themeFor(kingdom);
      this.scene.background = new THREE.Color(this.theme.sky);
      this.scene.fog = new THREE.FogExp2(this.theme.fog, this.theme.fogD);

      this.camera = new THREE.PerspectiveCamera(58, container.clientWidth / container.clientHeight, 0.1, 90);
      this.camera.position.set(0, 3.2, 12);

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;
      container.appendChild(this.renderer.domElement);

      this.ambient = new THREE.AmbientLight(0xffffff, this.theme.amb);
      this.scene.add(this.ambient);
      const sun = new THREE.DirectionalLight(this.theme.sun, this.theme.sunInt);
      sun.position.set(8, 14, 6); sun.castShadow = true;
      this.scene.add(sun);
      const warm = new THREE.PointLight(this.theme.warm, this.theme.warmInt, 32, 2);
      warm.position.set(0, 6, 0); this.scene.add(warm);
      this.warm = warm;

      this.buildTown(kingdom);
      this.spawnPeople(kingdom);
      this.spawnGuardAndAnimals(kingdom);
      this.buildWeather(this.theme);

      this.clock = new THREE.Clock();
      this.finished = false;
      this.ready = true;
      this.running = true;
      this.animate();
      return true;
    } catch (e) {
      console.warn('KingdomFlyover failed:', e);
      this.failed = true;
      return false;
    }
  };

  F.prototype.finish = function () {
    if (this.finished) return;
    this.finished = true;
    if (typeof this.onFinished === 'function') this.onFinished();
  };

  F.prototype.patrolGuard = function (dt) {
    if (!this.guard) return;
    const g = this.guard, u = g.userData;
    u.angle += u.speed * dt;
    const gx = Math.cos(u.angle) * u.radius, gz = Math.sin(u.angle) * u.radius;
    g.position.set(gx, 0, gz);
    // face travel direction (tangent) with a gentle lean
    g.rotation.y = u.angle + Math.PI / 2;
    u.bob += dt * 6;
    // horse: leg trot + body bob
    const hLegs = this.guardHorse ? this.guardHorse.userData.legs : null;
    if (hLegs) hLegs.forEach((leg, li) => { leg.position.y = 0.42 - Math.abs(Math.sin(u.bob + (li % 2) * Math.PI)) * 0.06; leg.rotation.x = Math.sin(u.bob + (li % 2) * Math.PI) * 0.22; });
    g.position.y = Math.abs(Math.sin(u.bob)) * 0.05;
    // rider: slight lean and spear raise
    const rider = u.rider;
    if (rider) {
      rider.rotation.z = Math.sin(u.bob) * 0.03;
      rider.position.y = 1.28 + Math.abs(Math.sin(u.bob)) * 0.03;
      rider.userData.armR.rotation.z = -0.5;
      rider.userData.armL.rotation.z = 0.4;
    }
  };

  F.prototype.animate = function () {
    if (!this.running) return;
    this.animFrame = requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    const t = this.time;

    // people live
    this.livePeople(dt);
    this.patrolGuard(dt);
    this.liveAnimals(dt);
    this.liveWeather(dt);

    // monument glow pulse
    if (this.monumentGlow) {
      this.monumentGlow.forEach((r, i) => { r.material.emissiveIntensity = 0.4 + Math.sin(t * 2 + i * 0.7) * 0.15; });
    }

    // flames flicker
    this.flames.forEach((f, i) => { f.position.y = f.userData.baseY + Math.sin(t * (8 + i) + i) * 0.05; });
    this.lights.forEach((l, i) => { l.intensity = 0.5 + Math.sin(t * (7 + i)) * 0.15; });

    // banners sway
    this.banners.forEach((b, i) => { b.rotation.y = b.userData.baseRotY + Math.sin(t * 1.5 + i) * 0.08; });

    // king presence pulse
    if (this.king) { this.king.userData.armR.rotation.z = 0.3 + Math.sin(t * 1.2) * 0.08; }

    // camera flythrough: swoop in, then slow orbit across the people
    this.updateCamera(t, dt);

    // finish after a tour duration
    if (t > 14 && !this.finished) this.finish();

    this.renderer.render(this.scene, this.camera);
  };

  F.prototype.updateCamera = function (t) {
    // Three-act flythrough:
    //  Act 1 (0-4s)  swoop down from above over the houses into the square
    //  Act 2 (4-10s) low sweeping pass around the plaza at villager height
    //  Act 3 (10-14s) bank up and pull back, turning toward the king, for the name reveal
    const act1 = this.clamp(t / 4.2, 0, 1);
    const act2 = this.clamp((t - 4) / 6, 0, 1);
    const act3 = this.clamp((t - 10) / 4, 0, 1);
    const e1 = 1 - Math.pow(1 - act1, 3);
    const e2 = 1 - Math.pow(1 - act2, 3);
    const e3 = 1 - Math.pow(1 - act3, 3);

    // Act 1: dive from a high corner down into the square center
    const a1From = new THREE.Vector3(-13, 9.5, 15);
    const a1To = new THREE.Vector3(4, 2.2, 1);
    const a1P = a1From.clone().lerp(a1To, e1);
    a1P.y += Math.sin(t * 1.4) * 0.4;

    // Act 2: low, tight sweep around the well/people with banking
    const sweepX = Math.sin(t * 0.75) * 9.5;
    const sweepZ = -4.5 + Math.cos(t * 0.75) * 9.5 * 0.82;
    const a2P = new THREE.Vector3(sweepX, 2.0 + Math.sin(t * 0.9) * 0.55, sweepZ);

    // Act 3: pull up and back, swiveling toward the distant king
    const kingPos = new THREE.Vector3(0, 2.4, -11.5);
    const a3P = // passes from act2 position toward an elevated back vantage
      a2P.clone().lerp(new THREE.Vector3(6, 5.5, 16), e3);

    // blend acts
    const pos = a1P.clone().lerp(a2P, e2).lerp(a3P, e3);

    const target = new THREE.Vector3(0, 1.5, 0);
    if (act3 > 0.35) {
      target.lerp(kingPos, e3 * 0.8);
    } else {
      // look toward the lively center, drifting slightly
      target.set(Math.sin(t * 0.4) * 1.8, 1.4 - e2 * 0.2, Math.cos(t * 0.3) * 1.6);
    }

    this.camera.position.lerp(pos, 0.06);
    this.camera.lookAt(target);
    // subtle roll for life during the low sweep
    this.camera.rotation.z = Math.sin(t * 0.5) * 0.02 * e2;
  };

  F.prototype.stop = function () { this.running = false; if (this.animFrame) cancelAnimationFrame(this.animFrame); };

  F.prototype.destroy = function () {
    this.finished = true;
    this.stop();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    this.renderer = null; this.scene = null; this.camera = null;
    this.particles = null; this.villagers = []; this.ready = false;
  };

  window.KingdomFlyover = F;
  window.kingdomFlyover = new F();
})();
