class Combat3D {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.characters = [];
    this.running = false;
    this.arenaGroup = null;
    this.animating = false;
  }

  init(containerId, opts = {}) {
    this.mode = opts.mode || 'training';
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    this.scene = new THREE.Scene();
    if (this.mode === 'grand') {
      this.scene.background = new THREE.Color(0x0a0c1c);
      this.scene.fog = new THREE.FogExp2(0x0a0c1c, 0.006);
    } else {
      this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);
    }
    this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    if (this.mode === 'grand') {
      this.camera.position.set(0, 9, 20);
      this.camera.lookAt(0, 1.5, 0);
    } else {
      this.camera.position.set(0, 6, 14);
      this.camera.lookAt(0, 1.5, 0);
    }
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);
    this.setupLighting();
    if (this.mode === 'grand') this.buildGrandArena();
    else this.buildArena();
    window.addEventListener('resize', () => {
      if (!this.renderer || !container.clientWidth) return;
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
    this.running = true;
    this.animate();
  }

  setupLighting() {
    this.scene.add(new THREE.AmbientLight(0x334466, 0.6));
    const main = new THREE.DirectionalLight(0xffeedd, 1.2);
    main.position.set(5, 12, 8);
    main.castShadow = true;
    main.shadow.mapSize.width = 2048;
    main.shadow.mapSize.height = 2048;
    this.scene.add(main);
    const rim = new THREE.DirectionalLight(0x4488ff, 0.4);
    rim.position.set(-5, 8, -5);
    this.scene.add(rim);
    const glow = new THREE.PointLight(0xf1c40f, 0.3, 20);
    glow.position.set(0, 0.5, 0);
    this.scene.add(glow);
  }

  buildArena() {
    this.arenaGroup = new THREE.Group();
    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(10, 10, 0.3, 64),
      new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.3, roughness: 0.7 })
    );
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    this.arenaGroup.add(ground);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(10, 0.08, 8, 64),
      new THREE.MeshStandardMaterial({ color: 0xf1c40f, emissive: 0xf1c40f, emissiveIntensity: 0.5 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    this.arenaGroup.add(ring);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 3, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a2a4e, metalness: 0.6, roughness: 0.3 })
      );
      p.position.set(Math.cos(a) * 9.5, 1.5, Math.sin(a) * 9.5);
      p.castShadow = true;
      this.arenaGroup.add(p);
      const o = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf1c40f, emissive: 0xf1c40f, emissiveIntensity: 0.8 })
      );
      o.position.set(Math.cos(a) * 9.5, 3.2, Math.sin(a) * 9.5);
      this.arenaGroup.add(o);
    }
    this.scene.add(this.arenaGroup);
  }

  buildGrandArena() {
    this.arenaGroup = new THREE.Group();
    const sand = this.mat(0x8a6f3a, 0.15, 0.85);
    const stone = this.mat(0x2a2a3e, 0.4, 0.6);
    const darkStone = this.mat(0x181824, 0.4, 0.6);

    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(24, 24, 0.4, 64),
      sand
    );
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    this.arenaGroup.add(ground);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(10, 0.09, 8, 64),
      new THREE.MeshStandardMaterial({ color: 0xf1c40f, emissive: 0xf1c40f, emissiveIntensity: 0.5 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    this.arenaGroup.add(ring);

    const inner = new THREE.Mesh(
      new THREE.CircleGeometry(10, 64),
      this.mat(0x9a7a3c, 0.1, 0.75)
    );
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = 0.03;
    this.arenaGroup.add(inner);

    // tiered stands
    const tiers = [
      { r0: 13, r1: 16, h: 2.2, y: 1.0 },
      { r0: 17, r1: 20, h: 2.6, y: 3.4 },
      { r0: 21, r1: 24, h: 3.0, y: 6.2 }
    ];
    tiers.forEach((t) => {
      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(t.r1, t.r0, t.h, 64, 1, true),
        darkStone
      );
      stand.position.y = t.y;
      stand.receiveShadow = true;
      this.arenaGroup.add(stand);
      const lip = new THREE.Mesh(
        new THREE.TorusGeometry(t.r1, 0.06, 6, 64),
        stone
      );
      lip.rotation.x = -Math.PI / 2;
      lip.position.y = t.y + t.h / 2;
      this.arenaGroup.add(lip);
    });

    // crowd - colored blocks along each stand ring
    const crowdColors = [0x27ae60, 0x2980b9, 0x8e44ad, 0xc0392b, 0xf39c12, 0x7f8c8d, 0xecf0f1, 0xe67e22, 0xf1c40f, 0x95a5a6];
    this.crowdBlocks = [];
    this.crowdEnergy = 0;
    this.crowdHue = 0;
    tiers.forEach((t, ti) => {
      const ringR = t.r0 + 1.2;
      const count = 3 + ti * 3;
      for (let i = 0; i < count * 8; i++) {
        const a = (i / (count * 8)) * Math.PI * 2;
        const rr = ringR + (Math.random() - 0.5) * (t.r1 - t.r0 - 2);
        const c = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.8, 0.35),
          this.mat(crowdColors[i % crowdColors.length], 0.05, 0.9)
        );
        c.position.set(Math.cos(a) * rr, t.y + t.h / 2 + 0.4, Math.sin(a) * rr);
        c.rotation.y = -a + Math.PI / 2;
        c.userData.baseColor = crowdColors[i % crowdColors.length];
        c.userData.baseY = c.position.y;
        c.userData.jitter = 1 + Math.random();
        this.arenaGroup.add(c);
        this.crowdBlocks.push(c);
      }
    });

    // torch pillars around ring (12 of them)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.22, 3.4, 8),
        stone
      );
      p.position.set(Math.cos(a) * 11.2, 1.7, Math.sin(a) * 11.2);
      p.castShadow = true;
      this.arenaGroup.add(p);
      const bowl = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 10, 8),
        this.mat(0xe0b64e, 0.7, 0.3)
      );
      bowl.position.set(Math.cos(a) * 11.2, 3.6, Math.sin(a) * 11.2);
      this.arenaGroup.add(bowl);
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0xff8c00, emissive: 0xff6a00, emissiveIntensity: 2 })
      );
      flame.position.set(Math.cos(a) * 11.2, 3.95, Math.sin(a) * 11.2);
      this.arenaGroup.add(flame);
      const light = new THREE.PointLight(0xff7733, 0.6, 8);
      light.position.set(Math.cos(a) * 11.2, 4, Math.sin(a) * 11.2);
      this.arenaGroup.add(light);
    }

    // banner poles
    const poleColors = [0xc0392b, 0x2980b9, 0x8e44ad, 0x27ae60, 0xf39c12, 0x1abc9c, 0xe74c3c, 0xf1c40f];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 6, 6),
        this.mat(0x555566, 0.6, 0.4)
      );
      pole.position.set(Math.cos(a) * 25, 3.2, Math.sin(a) * 25);
      pole.castShadow = true;
      this.arenaGroup.add(pole);
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 1),
        new THREE.MeshStandardMaterial({
          color: poleColors[i],
          side: THREE.DoubleSide,
          metalness: 0.1, roughness: 0.7
        })
      );
      flag.position.set(Math.cos(a) * 25 + Math.sin(a) * 0.8, 6, Math.sin(a) * 25 - Math.cos(a) * 0.8);
      flag.rotation.y = -a + Math.PI / 2;
      this.arenaGroup.add(flag);
    }

    // stars
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for (let i = 0; i < 400; i++) {
      const s = Math.random() * 120 + 30;
      starPos.push((Math.random() - 0.5) * 2 * s, Math.random() * 60 + 15, (Math.random() - 0.5) * 2 * s);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xaac4ff, size: 0.14, transparent: true, opacity: 0.8 }));
    this.scene.add(stars);

    this.scene.add(this.arenaGroup);
  }

  getConfig(kid) {
    const c = {
      altruism:  { bc: 0x27ae60, ac: 0xa8e6cf, wc: 0xffffff, bt: 'slim',      w: 'staff' },
      accord:    { bc: 0x2980b9, ac: 0xf1c40f, wc: 0xc0c0c0, bt: 'balanced',  w: 'sword_shield' },
      rapport:   { bc: 0x8e44ad, ac: 0xd4a5ff, wc: 0xc0c0c0, bt: 'lean',      w: 'daggers' },
      valor:     { bc: 0xc0392b, ac: 0x1a1a1a, wc: 0x888888, bt: 'heavy',     w: 'greatsword' },
      clement:   { bc: 0xf39c12, ac: 0xffffff, wc: 0x888888, bt: 'robed',     w: 'gavel' },
      vigilant:  { bc: 0x7f8c8d, ac: 0x3498db, wc: 0x666666, bt: 'tower',     w: 'tower_shield' },
      scrupulous:{ bc: 0xecf0f1, ac: 0xe74c3c, wc: 0x555555, bt: 'slim',      w: 'crossbow' },
      spunk:     { bc: 0xe67e22, ac: 0xff69b4, wc: 0xffd700, bt: 'chaotic',   w: 'dual_blades' },
      neutral:   { bc: 0x666666, ac: 0x999999, wc: 0x888888, bt: 'balanced',  w: 'sword' }
    };
    return c[kid] || c.neutral;
  }

  mat(color, metal, rough) {
    return new THREE.MeshStandardMaterial({ color, metalness: metal || 0.4, roughness: rough || 0.5 });
  }

  buildCharacter(unit, isPlayer) {
    const g = new THREE.Group();
    const cfg = this.getConfig(unit.kingdom || 'neutral');
    const sc = 0.8 + (unit.stats.hp / 150) * 0.4;
    const bm = this.mat(cfg.bc);
    const am = this.mat(cfg.ac, 0.6, 0.3);
    const wm = this.mat(cfg.wc, 0.8, 0.2);
    const add = (geo, material, pos, rot) => {
      const m = new THREE.Mesh(geo, material);
      if (pos) m.position.set(pos[0], pos[1], pos[2]);
      if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      m.castShadow = true;
      g.add(m);
      return m;
    };
    switch (cfg.bt) {
      case 'slim':
        add(new THREE.CylinderGeometry(0.25, 0.2, 0.8, 8), bm, [0, 1.0, 0]);
        add(new THREE.SphereGeometry(0.22, 12, 12), bm, [0, 1.65, 0]);
        add(new THREE.CylinderGeometry(0.06, 0.05, 0.5, 6), bm, [-0.35, 1.0, 0], [0, 0, 0.3]);
        add(new THREE.CylinderGeometry(0.06, 0.05, 0.5, 6), bm, [0.35, 1.0, 0], [0, 0, -0.3]);
        add(new THREE.CylinderGeometry(0.07, 0.06, 0.5, 6), bm, [-0.12, 0.35, 0]);
        add(new THREE.CylinderGeometry(0.07, 0.06, 0.5, 6), bm, [0.12, 0.35, 0]);
        break;
      case 'heavy':
        add(new THREE.BoxGeometry(0.6, 0.7, 0.4), bm, [0, 1.05, 0]);
        add(new THREE.SphereGeometry(0.15, 8, 8), am, [-0.4, 1.35, 0]);
        add(new THREE.SphereGeometry(0.15, 8, 8), am, [0.4, 1.35, 0]);
        add(new THREE.SphereGeometry(0.2, 12, 12), bm, [0, 1.65, 0]);
        add(new THREE.BoxGeometry(0.3, 0.08, 0.25), wm, [0, 1.65, 0.15]);
        add(new THREE.CylinderGeometry(0.08, 0.07, 0.5, 6), bm, [-0.45, 0.95, 0]);
        add(new THREE.CylinderGeometry(0.08, 0.07, 0.5, 6), bm, [0.45, 0.95, 0]);
        add(new THREE.CylinderGeometry(0.09, 0.08, 0.5, 6), bm, [-0.15, 0.35, 0]);
        add(new THREE.CylinderGeometry(0.09, 0.08, 0.5, 6), bm, [0.15, 0.35, 0]);
        break;
      case 'tower':
        add(new THREE.BoxGeometry(0.7, 0.9, 0.5), bm, [0, 1.15, 0]);
        add(new THREE.SphereGeometry(0.22, 12, 12), bm, [0, 1.8, 0]);
        add(new THREE.BoxGeometry(0.35, 0.1, 0.3), wm, [0, 1.8, 0.18]);
        add(new THREE.CylinderGeometry(0.1, 0.09, 0.6, 6), bm, [-0.5, 1.1, 0]);
        add(new THREE.CylinderGeometry(0.1, 0.09, 0.6, 6), bm, [0.5, 1.1, 0]);
        add(new THREE.CylinderGeometry(0.1, 0.09, 0.5, 6), bm, [-0.18, 0.35, 0]);
        add(new THREE.CylinderGeometry(0.1, 0.09, 0.5, 6), bm, [0.18, 0.35, 0]);
        break;
      case 'lean':
        add(new THREE.CylinderGeometry(0.2, 0.18, 0.7, 8), bm, [0, 1.0, 0]);
        add(new THREE.ConeGeometry(0.25, 0.3, 8), am, [0, 1.65, 0], [0.1, 0, 0]);
        add(new THREE.SphereGeometry(0.18, 12, 12), bm, [0, 1.55, 0]);
        add(new THREE.CylinderGeometry(0.05, 0.04, 0.45, 6), bm, [-0.3, 0.95, 0], [0, 0, 0.4]);
        add(new THREE.CylinderGeometry(0.05, 0.04, 0.45, 6), bm, [0.3, 0.95, 0], [0, 0, -0.4]);
        add(new THREE.CylinderGeometry(0.06, 0.05, 0.5, 6), bm, [-0.1, 0.35, 0]);
        add(new THREE.CylinderGeometry(0.06, 0.05, 0.5, 6), bm, [0.1, 0.35, 0]);
        break;
      case 'robed':
        add(new THREE.ConeGeometry(0.35, 1.0, 8), bm, [0, 0.7, 0]);
        add(new THREE.CylinderGeometry(0.2, 0.25, 0.5, 8), am, [0, 1.3, 0]);
        add(new THREE.SphereGeometry(0.2, 12, 12), bm, [0, 1.7, 0]);
        add(new THREE.CylinderGeometry(0.15, 0.25, 0.2, 8), am, [0, 1.95, 0]);
        add(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 16), am, [0, 1.87, 0]);
        add(new THREE.CylinderGeometry(0.05, 0.04, 0.4, 6), bm, [-0.3, 1.2, 0]);
        add(new THREE.CylinderGeometry(0.05, 0.04, 0.4, 6), bm, [0.3, 1.2, 0]);
        break;
      case 'chaotic':
        add(new THREE.BoxGeometry(0.35, 0.6, 0.3), bm, [0, 1.0, 0], [0, 0, 0.1]);
        add(new THREE.SphereGeometry(0.2, 12, 12), bm, [0.05, 1.55, 0]);
        add(new THREE.ConeGeometry(0.06, 0.3, 4), am, [0.05, 1.85, 0], [0, 0, -0.2]);
        add(new THREE.CylinderGeometry(0.05, 0.04, 0.5, 6), bm, [-0.3, 0.95, 0.1], [0, 0, 0.5]);
        add(new THREE.CylinderGeometry(0.06, 0.05, 0.4, 6), am, [0.35, 1.0, -0.1], [0, 0, -0.6]);
        add(new THREE.CylinderGeometry(0.06, 0.05, 0.45, 6), bm, [-0.1, 0.35, 0.05]);
        add(new THREE.CylinderGeometry(0.07, 0.06, 0.5, 6), am, [0.12, 0.35, -0.05]);
        break;
      default:
        add(new THREE.CylinderGeometry(0.22, 0.2, 0.7, 8), bm, [0, 1.0, 0]);
        add(new THREE.SphereGeometry(0.2, 12, 12), bm, [0, 1.6, 0]);
        add(new THREE.BoxGeometry(0.15, 0.2, 0.05), am, [0, 1.85, 0]);
        add(new THREE.CylinderGeometry(0.06, 0.05, 0.45, 6), bm, [-0.32, 1.0, 0]);
        add(new THREE.CylinderGeometry(0.06, 0.05, 0.45, 6), bm, [0.32, 1.0, 0]);
        add(new THREE.CylinderGeometry(0.07, 0.06, 0.45, 6), bm, [-0.12, 0.35, 0]);
        add(new THREE.CylinderGeometry(0.07, 0.06, 0.45, 6), bm, [0.12, 0.35, 0]);
    }
    this.addWeapon(g, cfg, wm);
    g.scale.set(sc, sc, sc);
    const charData = { group: g, unit, isPlayer, config: cfg, originalY: 0, animState: 'idle', animTime: 0, hpPercent: 1 };
    this.characters.push(charData);
    this.scene.add(g);
    return charData;
  }

  addWeapon(g, cfg, wm) {
    const wg = new THREE.Group();
    const accentM = this.mat(cfg.ac, 0.6, 0.3);
    const add = (geo, mat, pos, rot) => {
      const m = new THREE.Mesh(geo, mat);
      if (pos) m.position.set(pos[0], pos[1], pos[2]);
      if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      wg.add(m);
    };
    switch (cfg.w) {
      case 'staff':
        add(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), wm, [0, 0.8, 0]);
        add(new THREE.SphereGeometry(0.08, 12, 12), this.mat(cfg.ac, 0.6, 0.3, true), [0, 1.4, 0]);
        wg.position.set(0.4, 0, 0.15);
        break;
      case 'sword_shield':
        add(new THREE.BoxGeometry(0.04, 0.6, 0.08), wm, [0, 0.9, 0]);
        add(new THREE.BoxGeometry(0.12, 0.04, 0.04), wm, [0, 0.6, 0]);
        wg.position.set(0.45, 0, 0.1);
        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.05), accentM);
        shield.position.set(-0.45, 0.9, 0.15);
        g.add(shield);
        break;
      case 'daggers':
        add(new THREE.BoxGeometry(0.03, 0.3, 0.05), wm, [-0.35, 0.8, 0.15], [0, 0, 0.3]);
        add(new THREE.BoxGeometry(0.03, 0.3, 0.05), wm, [0.35, 0.8, 0.15], [0, 0, -0.3]);
        break;
      case 'greatsword':
        add(new THREE.BoxGeometry(0.06, 0.9, 0.1), wm, [0, 1.0, 0]);
        add(new THREE.BoxGeometry(0.2, 0.04, 0.06), wm, [0, 0.55, 0]);
        wg.position.set(0.5, 0, 0);
        break;
      case 'gavel':
        add(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), wm, [0, 0.8, 0]);
        add(new THREE.BoxGeometry(0.15, 0.1, 0.1), wm, [0, 1.05, 0]);
        wg.position.set(0.4, 0, 0.1);
        break;
      case 'tower_shield':
        g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.08), wm)).position.set(0.55, 0.9, 0.15);
        break;
      case 'crossbow':
        add(new THREE.BoxGeometry(0.04, 0.4, 0.06), wm, [0, 0.9, 0]);
        add(new THREE.BoxGeometry(0.3, 0.03, 0.03), wm, [0, 1.1, 0]);
        wg.position.set(0.35, 0, 0.2);
        break;
      case 'dual_blades':
        add(new THREE.BoxGeometry(0.03, 0.4, 0.06), wm, [-0.4, 0.85, 0.1], [0, 0, 0.2]);
        add(new THREE.BoxGeometry(0.03, 0.4, 0.06), wm, [0.4, 0.85, 0.1], [0, 0, -0.2]);
        break;
      case 'sword':
        add(new THREE.BoxGeometry(0.04, 0.5, 0.07), wm, [0, 0.85, 0]);
        wg.position.set(0.35, 0, 0.1);
        break;
    }
    g.add(wg);
  }

  mat(color, metal, rough, emissive) {
    const opts = { color, metalness: metal || 0.4, roughness: rough || 0.5 };
    if (emissive) { opts.emissive = color; opts.emissiveIntensity = 0.5; }
    return new THREE.MeshStandardMaterial(opts);
  }

  setupPositions(playerTeam, enemyTeam) {
    this.clearCharacters();
    const pAlive = playerTeam.filter(u => u.alive);
    const eAlive = enemyTeam.filter(u => u.alive);
    pAlive.forEach((unit, i) => {
      const c = this.buildCharacter(unit, true);
      const sp = 1.8;
      c.group.position.set(-5, 0, -(pAlive.length - 1) * sp / 2 + i * sp);
      c.group.rotation.y = 0.3;
    });
    eAlive.forEach((unit, i) => {
      const c = this.buildCharacter(unit, false);
      const sp = 1.8;
      c.group.position.set(5, 0, -(eAlive.length - 1) * sp / 2 + i * sp);
      c.group.rotation.y = -0.3;
    });
  }

  clearCharacters() {
    this.characters.forEach(c => {
      this.scene.remove(c.group);
      c.group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    });
    this.characters = [];
  }

  getChar(name) {
    return this.characters.find(c => c.unit.name === name);
  }

  animateIdle(time) {
    this.characters.forEach(c => {
      if (c.animState !== 'idle') return;
      c.group.position.y = Math.sin(time * 2 + c.group.position.x) * 0.03;
    });
    // Crowd murmurs, sways and roars with the fight.
    if (this.crowdBlocks && this.crowdBlocks.length) {
      if (this.crowdEnergy > 0) this.crowdEnergy = Math.max(0, this.crowdEnergy - 0.02);
      this.crowdBlocks.forEach((b, i) => {
        const pulse = this.crowdEnergy * (0.6 + 0.4 * Math.sin(time * 8 + i * 0.7));
        if (this.crowdMood && this.crowdMood !== '#ffffff') {
          b.material.color.setHex(this.crowdMood);
          b.material.emissive.setHex(this.crowdMood);
          b.material.emissiveIntensity = 0.25 + pulse * 0.5;
        }
        if (b.material.emissiveIntensity > 0) {
          b.material.emissiveIntensity = Math.max(0, b.material.emissiveIntensity - 0.04);
        }
        if (pulse > 0.2) {
          b.position.y = b.userData.baseY + (Math.random() - 0.5) * 0.5 * pulse;
          b.scale.y = 1 + 0.6 * Math.sin(time * 22 + i) * pulse;
          b.scale.x = 1 + 0.3 * Math.sin(time * 22 + i * 1.3) * pulse;
        } else {
          b.position.y = b.userData.baseY + Math.sin(time * (1.2 + (i % 5) * 0.2) + i) * 0.03;
          b.scale.setScalar(1);
        }
      });
    }
  }

  crowdReact(kind) {
    this.crowdEnergy = Math.min(1, this.crowdEnergy + (kind === 'groan' ? 0.45 : 0.7));
    this.crowdMood = kind === 'groan' ? '#e74c3c' : kind === 'roar' ? '#f1c40f' : '#ffffff';
    if (kind === 'roar') this.shakeCamera(4, 180);
  }

  crowdReactEnemy() {
    this.crowdReact('groan');
  }

  playAttack(attackerName, targetName, damage, isCrit, callback) {
    const atk = this.getChar(attackerName);
    const tgt = this.getChar(targetName);
    if (!atk || !tgt) { if (callback) callback(); return; }
    atk.animState = 'attack';
    const startPos = atk.group.position.clone();
    const targetX = tgt.group.position.x;
    const midX = (startPos.x + targetX) / 2;
    const startTgtX = tgt.group.position.x;
    const dur = 600;
    const st = Date.now();
    const loop = () => {
      const el = Date.now() - st;
      const t = Math.min(el / dur, 1);
      if (t < 0.4) {
        const p = t / 0.4;
        atk.group.position.x = startPos.x + (midX - startPos.x) * p * 0.6;
        atk.group.position.y = Math.sin(p * Math.PI) * 0.3;
      } else if (t < 0.6) {
        atk.group.position.x = startPos.x + (midX - startPos.x) * 0.6;
        const hp = (t - 0.4) / 0.2;
        tgt.group.position.x = startTgtX + (isCrit ? 0.3 : 0.15) * (1 - hp);
        if (isCrit) tgt.group.position.y = Math.sin(hp * Math.PI) * 0.2;
      } else {
        const r = (t - 0.6) / 0.4;
        atk.group.position.x = startPos.x + (midX - startPos.x) * 0.6 * (1 - r);
        atk.group.position.y *= (1 - r);
      }
      if (t >= 1) {
        atk.group.position.copy(startPos);
        tgt.group.position.x = startTgtX;
        tgt.group.position.y = 0;
        atk.animState = 'idle';
        if (callback) callback();
        return;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  playSpecial(unitName, color, callback) {
    const c = this.getChar(unitName);
    if (!c) { if (callback) callback(); return; }
    c.animState = 'special';
    const pos = c.group.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    this.spawnParticles(pos, color, 20);
    const st = Date.now();
    const dur = 800;
    const loop = () => {
      const t = Math.min((Date.now() - st) / dur, 1);
      c.group.position.y = Math.sin(t * Math.PI * 3) * 0.15;
      c.group.scale.setScalar(t < 0.5 ? 0.8 + t * 0.4 : 1.0 - (t - 0.5) * 0.2);
      if (t >= 1) {
        c.group.position.y = 0;
        c.group.scale.setScalar(1);
        c.animState = 'idle';
        if (callback) callback();
        return;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  playDefend(unitName, callback) {
    const c = this.getChar(unitName);
    if (!c) { if (callback) callback(); return; }
    const st = Date.now();
    const loop = () => {
      const t = Math.min((Date.now() - st) / 500, 1);
      c.group.position.y = -t * 0.2;
      if (t >= 1) { c.group.position.y = 0; if (callback) callback(); return; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  playHeal(unitName, callback) {
    const c = this.getChar(unitName);
    if (!c) { if (callback) callback(); return; }
    this.spawnParticles(c.group.position.clone().add(new THREE.Vector3(0, 1, 0)), 0x2ecc71, 15);
    const st = Date.now();
    const loop = () => {
      const t = Math.min((Date.now() - st) / 600, 1);
      c.group.position.y = Math.sin(t * Math.PI) * 0.2;
      if (t >= 1) { c.group.position.y = 0; if (callback) callback(); return; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  playDeath(unitName, callback) {
    const c = this.getChar(unitName);
    if (!c) { if (callback) callback(); return; }
    c.animState = 'dead';
    const st = Date.now();
    const loop = () => {
      const t = Math.min((Date.now() - st) / 800, 1);
      c.group.rotation.x = t * Math.PI / 2;
      c.group.position.y = -t * 0.5;
      c.group.traverse(ch => {
        if (ch.material) { ch.material.transparent = true; ch.material.opacity = 1 - t; }
      });
      if (t >= 1) { c.group.visible = false; if (callback) callback(); return; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  spawnParticles(position, color, count) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vels = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = position.x;
      pos[i * 3 + 1] = position.y;
      pos[i * 3 + 2] = position.z;
      vels.push(new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 3 + 1, (Math.random() - 0.5) * 4));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.15, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);
    const st = Date.now();
    const loop = () => {
      const t = (Date.now() - st) / 800;
      if (t >= 1) { this.scene.remove(pts); geo.dispose(); mat.dispose(); return; }
      const pa = geo.attributes.position;
      for (let i = 0; i < count; i++) {
        pa.array[i * 3] += vels[i].x * 0.016;
        pa.array[i * 3 + 1] += vels[i].y * 0.016;
        pa.array[i * 3 + 2] += vels[i].z * 0.016;
        vels[i].y -= 3 * 0.016;
      }
      pa.needsUpdate = true;
      mat.opacity = 1 - t;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  shakeCamera(intensity, duration) {
    const orig = this.camera.position.clone();
    const st = Date.now();
    const loop = () => {
      const el = Date.now() - st;
      if (el > duration) { this.camera.position.copy(orig); return; }
      const d = 1 - el / duration;
      this.camera.position.x = orig.x + (Math.random() - 0.5) * intensity * d;
      this.camera.position.y = orig.y + (Math.random() - 0.5) * intensity * d;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  resetCamera() {
    const st = Date.now();
    const start = this.camera.position.clone();
    const end = this.mode === 'grand' ? new THREE.Vector3(0, 9, 20) : new THREE.Vector3(0, 6, 14);
    const loop = () => {
      const t = Math.min((Date.now() - st) / 400, 1);
      this.camera.position.lerpVectors(start, end, t);
      this.camera.lookAt(0, 1.5, 0);
      if (t < 1) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  animate() {
    if (!this.running) return;
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
    this.animateIdle(Date.now() * 0.001);
  }

  destroy() {
    this.running = false;
    this.clearCharacters();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
}

const combat3d = new Combat3D();
