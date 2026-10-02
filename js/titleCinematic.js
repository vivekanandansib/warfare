/*
 * TitleCinematic, The Crown Falls
 * A Three.js prologue: the Eight Kings of Warfare rise in the Hall of Thrones,
 * are named one by one, then all turn to face the corrupting shadow of Deception.
 *
 * Renders procedurally-lit low-poly kings using each kingdom's own colors.
 * Purely cosmetic; any THREE failure falls back to the existing 2D scene.
 */
class TitleCinematic {
  constructor() {
    this.ready = false;
    this.container = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = null;
    this.kings = [];
    this.focusRing = [];
    this.particles = null;
    this.time = 0;
    this.animFrame = null;
    this.failed = false;
    this.onBeat = null; // (kingIndex | -1) callback for 2D overlay text
    this.lastBeat = -2;
    this.hidden = false;
  }

  init(containerId, kingdoms, opts = {}) {
    if (!window.THREE) { this.failed = true; return false; }
    const container = document.getElementById(containerId);
    if (!container) { this.failed = true; return false; }

    try {
      this.container = container;
      this.kingdoms = Object.values(kingdoms || {});
      this.opts = opts;
      this.overlay = opts.overlayEl || null;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x05050c);
      this.scene.fog = new THREE.FogExp2(0x05050c, 0.028);

      this.camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 300);
      this.camera.position.set(0, 7, 34);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      container.appendChild(this.renderer.domElement);

      this.clock = new THREE.Clock();
      this.buildHall();
      this.buildKings();
      this.buildParticles();

      window.addEventListener('resize', () => this.onResize());
      this.ready = true;
      this.running = true;
      this.animate();
      return true;
    } catch (e) {
      console.warn('TitleCinematic failed:', e);
      this.failed = true;
      return false;
    }
  }

  onResize() {
    if (!this.renderer || !this.container) return;
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  hex2rgb(hex) {
    const h = (hex || '#888888').replace('#', '');
    return new THREE.Color(
      parseInt(h.substring(0, 2), 16) / 255,
      parseInt(h.substring(2, 4), 16) / 255,
      parseInt(h.substring(4, 6), 16) / 255
    );
  }

  buildHall() {
    // circular dais floor
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 18, 0.6, 64, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.5, roughness: 0.7 })
    );
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // golden ring chiast
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(16.4, 0.12, 8, 96),
      new THREE.MeshStandardMaterial({ color: 0xd4a847, metalness: 0.9, roughness: 0.2, emissive: 0xd4a847, emissiveIntensity: 0.4 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    this.scene.add(ring);

    // outer pillars + faint arcs (supports, not to scale)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 12, 8),
        new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.6, roughness: 0.4 })
      );
      pillar.position.set(Math.cos(a) * 21, 5.5, Math.sin(a) * 21);
      pillar.castShadow = true;
      this.scene.add(pillar);
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xd4a847, metalness: 0.9, roughness: 0.2, emissive: 0xd4a847, emissiveIntensity: 0.35 })
      );
      cap.position.copy(pillar.position).setY(11.6);
      this.scene.add(cap);
    }

    // ambient + rim lighting
    const ambient = new THREE.AmbientLight(0x445566, 0.5);
    this.scene.add(ambient);
    const moon = new THREE.DirectionalLight(0xaab6cc, 0.5);
    moon.position.set(-6, 14, 10);
    this.scene.add(moon);
    const warm = new THREE.DirectionalLight(0xffdd99, 0.4);
    warm.position.set(0, 6, -8);
    this.scene.add(warm);
    this.rim = new THREE.PointLight(0xd4a847, 0, 30);
    this.rim.position.set(0, 3, 12);
    this.scene.add(this.rim);
    this.rimTarget = new THREE.Object3D();
    this.scene.add(this.rimTarget);
    this.rim.target = this.rimTarget;
  }

  buildKings() {
    const ks = this.kingdoms;
    if (!ks || !ks.length) return;
    const N = ks.length;
    this.kings = ks.map((k, i) => {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const radius = 11;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      const group = this.buildKingFigure(k);
      group.position.set(x, 0, z);
      group.rotation.y = -a + Math.PI / 2;
      this.scene.add(group);

      // floating emblem gem above each king
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 0),
        new THREE.MeshStandardMaterial({ color: this.hex2rgb(k.color), emissive: this.hex2rgb(k.color), emissiveIntensity: 0.8, metalness: 0.6, roughness: 0.2 })
      );
      gem.position.set(0, 3.1, 0);
      gem.userData.originY = 3.1;
      group.add(gem);

      // personal spotlight
      const spot = new THREE.SpotLight(this.hex2rgb(k.color), 0, 30, Math.PI / 6, 0.45, 1.6);
      spot.position.set(x, 14, z);
      spot.target.position.set(x, 0, z);
      this.scene.add(spot);
      this.scene.add(spot.target);

      const mg = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.001, side: THREE.DoubleSide, depthWrite: false });
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(9, 14),
        mg
      );
      glow.position.set(0, 1.8, 0);
      glow.rotation.y = 0;
      group.add(glow);

      return {
        data: k,
        group,
        gem,
        baseY: 0,
        alive: true,
        spot,
        glow
      };
    });
  }

  buildKingFigureLegacy(k) {
    const g = new THREE.Group();
    const c = this.hex2rgb(k.color);
    const dark = new THREE.Color(c).multiplyScalar(0.5);
    const sea = new THREE.Color(0x0a0a18);
    const gold = new THREE.Color(0xd4a847);

    const mat = (color, m, r, e) => {
      const o = { color, metalness: m == null ? 0.4 : m, roughness: r == null ? 0.6 : r };
      if (e) { o.emissive = typeof e === 'object' ? e : color; o.emissiveIntensity = 0.3; }
      return new THREE.MeshStandardMaterial(o);
    };
    const add = (geo, material, pos, rot, shadow) => {
      const m = new THREE.Mesh(geo, material);
      if (pos) m.position.set(pos[0], pos[1], pos[2]);
      if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      if (shadow !== false) m.castShadow = true;
      g.add(m);
      return m;
    };

    // grand cape (triangle-ish cone)
    add(new THREE.ConeGeometry(1.5, 4.8, 6), mat(dark, 0.3, 0.8), [0, -0.4, 0.3]);
    // body
    add(new THREE.CylinderGeometry(0.55, 0.75, 1.6, 8), mat(c, 0.5, 0.5), [0, 0.7, 0]);
    // shoulders
    add(new THREE.CylinderGeometry(0.75, 0.7, 0.4, 10), mat(gold, 0.9, 0.2, 0x8b6914), [0, 1.55, 0]);
    // head
    add(new THREE.SphereGeometry(0.42, 14, 14), mat(sea, 0.2, 0.7), [0, 2.1, 0]);
    // crown
    const crown = add(new THREE.CylinderGeometry(0.3, 0.34, 0.22, 8), mat(gold, 0.9, 0.2, 0x8b6914), [0, 2.42, 0]);
    for (let i = 0; i < 5; i++) {
      const aa = (i / 5) * Math.PI * 2;
      add(new THREE.ConeGeometry(0.05, 0.16, 4), mat(gold, 0.9, 0.2), [Math.cos(aa) * 0.3, 2.56, Math.sin(aa) * 0.3]);
    }
    if (k.id === 'vigilant') {
      add(new THREE.BoxGeometry(0.02, 0.5, 0.5), mat(0x2c2c3a, 0.2, 0.8), [0, 2.1, 0.44]); // visor
    } else if (k.id === 'scrupulous') {
      add(new THREE.CircleGeometry(0.2, 16), mat(0xffffff, 0, 0.3, 0xaaaaaa), [0, 2.1, 0.44]); // halo
    } else if (k.id === 'clement') {
      add(new THREE.CircleGeometry(0.18, 16), mat(gold, 0.9, 0.2, gold), [0, 2.04, 0.45]);
    }

    // arms
    const armMat = mat(c, 0.5, 0.5);
    add(new THREE.CylinderGeometry(0.13, 0.16, 0.9, 6), armMat, [-0.85, 1.2, 0], [0, 0, 0.15]);
    add(new THREE.CylinderGeometry(0.13, 0.16, 0.9, 6), armMat, [0.85, 1.2, 0], [0, 0, -0.15]);

    // a simple scepter/staff in the right hand to add regal presence
    add(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), mat(gold, 0.9, 0.2), [0.95, 1.55, 0.1], [0.2, 0, 0]);
    add(new THREE.SphereGeometry(0.1, 8, 8), mat(c, 0.9, 0.2, c), [0.95, 2.4, 0.1]);

    g.userData.king = k;
    return g;
  }

  buildKingFigure(k) {
    const c = this.hex2rgb(k.color);
    const king = window.FantasyHumanoid3D.create({ robe: c, accent: c, skin: 0xc79f80,
      height: 2.55, crown: k.id === 'vigilant' ? 'helmet' : true,
      metal: 0xd4a847, beard: k.id === 'valor' || k.id === 'clement', cape: true });
    const staff = new THREE.Group();
    staff.position.set(0.28, 0.48, 0.12); king.userData.armR.add(staff);
    const gold = new THREE.MeshStandardMaterial({ color: 0xd4a847, metalness: 0.9, roughness: 0.2 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.35, 8), gold);
    shaft.position.set(0, -0.42, 0); staff.add(shaft);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 1), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.7, metalness: 0.5, roughness: 0.2 }));
    gem.position.set(0, 0.28, 0); staff.add(gem);
    king.userData.king = k;
    return king;
  }

  buildParticles() {
    const count = 900;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const kc = this.kings.map(k => this.hex2rgb(k.data.color));
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 22;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.random() * 16;
      positions[i * 3 + 2] = Math.sin(a) * r;
      const col = kc[Math.floor(Math.random() * kc.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending });
    this.particles = new THREE.Points(geo, mat);
    this.particleGeo = geo;
    this.scene.add(this.particles);
  }

  updateParticles() {
    if (!this.particles) return;
    const pos = this.particleGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.array[i * 3 + 1] + 0.008;
      if (y > 17) y = 0;
      pos.array[i * 3 + 1] = y;
    }
    pos.needsUpdate = true;
    this.particles.rotation.y += 0.0004;
  }

  /*
   * Timeline (seconds)
   *  0.0 - 4.0   : slow glide, hall dark, kings kneeling & dim
   *  4.0 - 6.5   : shot zero, the empty throne center glows
   *  6.5 - 40.5  : one king per ~4.25s: rise, spotlight, float gem
   *  40.5 - 46   : all kings brighten, camera pulls to reveal 8 + center
   *  46  - 55   : shadow rift of Deception surges above, kings turn toward it
   *  55+        : hold, embers fill
   */
  beats() {
    if (!this.kings.length) return [];
    // stagger beats across 8 kings from t=7 to t=40
    const arr = [];
    for (let i = 0; i < this.kings.length; i++) {
      arr.push(7 + i * 4.2);
    }
    return arr;
  }

  animate() {
    if (!this.running) return;
    this.animFrame = requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    const t = this.time;

    this.updateParticles();
    this.updateKings(t);
    this.updateCamera(t);
    this.updateOverlay(t);

    this.renderer.render(this.scene, this.camera);
  }

  easeInOut(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  updateKings(t) {
    const beats = this.beats();
    const N = this.kings.length;
    this.kings.forEach((k, i) => {
      const beamT = t <= beats[i] ? 0 : this.easeInOut(this.clamp((t - beats[i]) / 2.2, 0, 1));
      // rise
      k.group.position.y = k.baseY + beamT * 1.1;
      // intro swing-in (first portion)
      const swing = this.easeInOut(this.clamp((t - (i * 0.4)) / 1.5, 0, 1));
      k.group.rotation.y = (-((i / N) * Math.PI * 2 - Math.PI / 2) + Math.PI / 2) + (1 - swing) * 0.6 + Math.sin(t * 0.3 + i) * 0.05;
      // gem float
      k.gem.position.y = k.gem.userData.originY + beamT * 0.5 + Math.sin(t * 1.2 + i) * 0.12;
      k.gem.rotation.y += 0.02;
      k.gem.rotation.x += 0.01;
      k.gem.scale.setScalar(0.4 + beamT * 0.6);
      // glow
      k.glow.material.opacity = 0.1 + beamT * 0.18;

      // final act / deception surge (after all kings risen)
      const allRisen = t >= (this.beats()[N - 1] || 0) + 2.2;
      const surgeT = this.clamp((t - 42) / 4, 0, 1);
      if (surgeT > 0) {
        // darker kingdom + turn head toward center shadow
        k.group.rotation.y += surgeT * 0.5 * Math.sin(i);
        k.spot.intensity = Math.max(0.1, k.spot.intensity * (1 - surgeT * 0.7));
        k.group.scale.setScalar(1 - surgeT * 0.06);
      } else if (allRisen) {
        k.spot.intensity = 1.1 + Math.sin(t * 2 + i) * 0.2;
      } else {
        k.spot.intensity = 0.25 + beamT * 1.0;
      }
    });

    // center throne glow (the Void)
    const surgeT = Math.max(0, this.clamp((t - 42) / 4, 0, 1));
    if (!this.rift) {
      const spike = new THREE.ConeGeometry(3, 6, 4);
      const spikeM = new THREE.Mesh(spike, new THREE.MeshStandardMaterial({ color: 0x300, emissive: 0x400000, emissiveIntensity: 0.3, wireframe: false }));
      spikeM.position.set(0, 10, 0);
      spikeM.visible = false;
      this.scene.add(spikeM);
      this.rift = spikeM;
      this.riftMat = spikeM.material;
      this.riftInner = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x500000, emissive: 0xaa0000, emissiveIntensity: 0.6 })
      );
      this.riftInner.position.set(0, 10, 0);
      this.riftInner.visible = false;
      this.scene.add(this.riftInner);
      const rf = new THREE.PointLight(0xaa0000, 0, 40, 2);
      rf.position.set(0, 10, 0);
      this.scene.add(rf);
      this.riftLight = rf;
    }
    this.rift.visible = surgeT > 0;
    this.riftInner.visible = surgeT > 0;
    if (surgeT > 0) {
      const grow = this.easeInOut(surgeT);
      this.rift.scale.setScalar(0.5 + grow * 2.5);
      this.rift.rotation.y += 0.02;
      this.rift.position.y = 8 + grow * 4;
      this.riftMat.emissiveIntensity = 0.2 + grow * 1.2;
      this.riftInner.scale.setScalar(0.6 + grow * (Math.sin(t * 3) * 0.15 + 1.4));
      this.riftInner.material.emissiveIntensity = 0.3 + grow * (Math.sin(t * 4) * 0.25 + 1.0);
      this.riftLight.intensity = grow * 5;
      this.riftLight.position.y = 8 + grow * 4;
    } else {
      this.riftLight.intensity = 0;
    }
  }

  updateCamera(t) {
    const beats = this.beats();
    const N = this.kings.length;
    const pos = new THREE.Vector3();
    const look = new THREE.Vector3(0, 1.6, 0);

    // phase 1: intro orbit
    if (t < 7) {
      const p = Math.min(t / 7, 1);
      const ang = -Math.PI / 2 + p * 1.4;
      pos.set(Math.cos(ang) * 30, 8 + Math.sin(p * Math.PI) * 2, Math.sin(ang) * 30 + 4);
    }
    // phase 2: focus each king
    else if (t < beats[N - 1] + 2.2) {
      let idx = 0;
      for (let i = 0; i < N; i++) { if (t >= beats[i]) idx = i; }
      const k = this.kings[idx];
      const local = (t - beats[idx]) / 4.2; // 0..1 over beat window
      const ease = local;
      const angle = -Math.PI / 2 + (idx / N) * Math.PI * 2;
      const hx = Math.cos(angle) * 11;
      const hz = Math.sin(angle) * 11;
      // dive toward the king
      const dist = 16 - ease * 6;
      const camX = hx + Math.cos(angle) * -dist * 0.5;
      const camZ = hz + Math.sin(angle) * -dist * 0.5;
      pos.set(camX, k.group.position.y + 3.4 + Math.sin(t * 0.5) * 0.2, camZ);
      pos.lerp(new THREE.Vector3(hx * 0.9, k.group.position.y + 3.0, hz * 0.9), ease * 0.5);
      look.set(hx, k.group.position.y + 1.9, hz);
      this.rim.position.copy(new THREE.Vector3(hx, 12, hz));
      this.rimTarget.position.copy(new THREE.Vector3(hx, 0, hz));
      this.rim.intensity = ease * 2.4;
    }
    // phase 3: pull back reveal
    else if (t < 42) {
      const p = this.easeInOut(this.clamp((t - (beats[N - 1] + 2.2)) / 5, 0, 1));
      pos.set(Math.cos(Math.PI / 2) * (12 + p * 16), 8 + p * 5, Math.sin(Math.PI / 2) * (12 + p * 16) + 4);
      look.set(0, 2.5, 0);
      this.rim.intensity = Math.max(0, this.rim.intensity * (1 - p));
    }
    // phase 4: deception surge, push back & down as shadow grows
    else {
      const p = this.easeInOut(this.clamp((t - 42) / 6, 0, 1));
      pos.set(Math.cos(Math.PI / 2) * 24, 6 + p * 2, Math.sin(Math.PI / 2) * 24 + 8);
      look.set(0, 4 + p * 6, 0);
      this.rim.intensity = 0;
    }

    // smooth the camera
    if (!this._camSmoothed) { this.camera.position.copy(pos); this._camSmoothed = true; }
    else this.camera.position.lerp(pos, 0.12);
    this.camera.lookAt(look);
  }

  updateOverlay(t) {
    if (!this.overlay) return;
    if (t >= 42) {
      if (this.lastBeat !== -100) {
        this.lastBeat = -100;
        this.emitBeat(null, true);
      }
      return;
    }
    const idx = this.beats().findIndex(b => t >= b + 0.5 && t <= b + 3.9);
    if (idx >= 0 && idx !== this.lastBeat) {
      this.lastBeat = idx;
      this.emitBeat(this.kings[idx].data, false);
    }
  }

  emitBeat(data, isRift) {
    if (this.onBeat) { try { this.onBeat(data, isRift); } catch (e) {} }
  }

  setHidden(h) {
    this.hidden = h;
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.style.opacity = h ? '0' : '1';
      this.renderer.domElement.style.transition = 'opacity 0.6s';
    }
  }

  stop() {
    this.running = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  destroy() {
    this.stop();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.kings = [];
    this.ready = false;
  }
}

const titleCinematic = new TitleCinematic();
