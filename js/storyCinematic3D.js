/*
 * StoryCinematic3D, "Shards of the Mirror"
 * A fully choreographed post-Begin prologue. Every story beat is a live,
 * action-driven 3D set-piece (no static fades): Zeroth raises and SLAMS his
 * mace, the Mirror spider-web cracks before violently shattering into
 * physics-driven shards, the kings burst up and raise their blades, the ring
 * shudders, and Deception erupts with lightning. Camera is directed per beat.
 *
 *  phase 0 CONVERGENCE   orbit around the unified throne, embers rising
 *  phase 1 THE MIRROR    the Mirror slams down out of the sky with a shockwave
 *  phase 2 SHADOW        Zeroth rises and swings his mace; Mirror cracks grow
 *  phase 3 SHATTER      the Mirror detonates; dozens of shards fly with physics
 *  phase 4 KINGDOMS      8 kings burst up, raise blades, ring shudders
 *  phase 5 DECEPTION     rift erupts, kings turn and point weapons aloft
 *  phase 6 YOUR KINGDOM  settle on the chosen realm
 */
class StoryCinematic3D {
  constructor() {
    this.ready = false;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.container = null;
    this.clock = null;
    this.running = false;
    this.animFrame = null;
    this.failed = false;
    this.time = 0;
    this.phase = -1;
    this.phaseTime = 0;
    this.pendingPhase = null;
    this.kings = [];
    this.mirrorGroup = null;
    this.mirrorRays = null;
    this.mirrorShards = [];
    this.mirrorCracks = [];
    this.throne = null;
    this.centerLight = null;
    this.zeroth = null;
    this.zerothPool = null;
    this.zerothLight = null;
    this.rift = null;
    this.riftLight = null;
    this.bolts = [];
    this.shockwaves = [];
    this.flashEl = null;
    this.shake = 0;
    this.burstDone = false;
    this.city = null;
    this.actorGroups = [];
    this.sage = null;
    this.ruler = null;
    this.guards = [];
    this.courtiers = [];
    this.bannerCols = [];
  }

  init(containerId, kingdoms) {
    if (!window.THREE) { this.failed = true; return false; }
    const container = document.getElementById(containerId);
    if (!container) { this.failed = true; return false; }
    try {
      this.container = container;
      this.kingdoms = Object.values(kingdoms || {});
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x05050c);
      this.scene.fog = new THREE.FogExp2(0x05050c, 0.026);

      this.camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 300);
      this.camera.position.set(0, 6, 26);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      container.appendChild(this.renderer.domElement);

      this.buildPost();

      this.clock = new THREE.Clock();
      this.burstDone = false;
      this.buildEnvironmental();
      this.buildDais();
      this.royalHallDress();
      this.buildActors();
      this.buildCenter();
      this.buildMirror();
      this.buildZeroth();
      this.buildKings();
      this.buildEffects();
      this.buildParticles();

      window.addEventListener('resize', () => this.onResize());
      this.ready = true;
      this.running = true;
      this.animate();
      return true;
    } catch (e) {
      console.warn('StoryCinematic3D failed:', e);
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
    if (this.postReady && this.postRT) {
      this.postRT.setSize(w, h);
      if (this.postUniforms && this.postUniforms.uRes) this.postUniforms.uRes.value.set(w, h);
    }
  }

  hex2rgb(hex) {
    const h = (hex || '#888888').replace('#', '');
    return new THREE.Color(
      parseInt(h.substring(0, 2), 16) / 255,
      parseInt(h.substring(2, 4), 16) / 255,
      parseInt(h.substring(4, 6), 16) / 255
    );
  }
  easeInOut(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  easeBack(p) { const c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }
  clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  rand(a, b) { return a + Math.random() * (b - a); }

  /* ============ CUSTOM POST-PROCESSING (r128 compatible, no addons) ============
     We cannot rely on THREE.Examples addons (loaded as a bare old build), so this
     builds a lightweight filmic pipeline from primitives only: an offscreen render
     target plus a fullscreen quad whose shader applies vignette, chromatic
     aberration, film grain, a cinematic grade and an impact flash. A cheap
     bright-pass + blur layer fakes bloom. */
  buildPost() {
    try {
      if (!window.THREE || !THREE.WebGLRenderTarget || !THREE.OrthographicCamera) return;
      const w = this.container.clientWidth, h = this.container.clientHeight;
      this.postRT = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
      this.postRT.texture.generateMipmaps = false;
      this.glowRT = new THREE.WebGLRenderTarget(Math.max(4, w / 3), Math.max(4, h / 3), { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
      this.glowRT.texture.generateMipmaps = false;
      this.brightRT = new THREE.WebGLRenderTarget(Math.max(4, w / 3), Math.max(4, h / 3), { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
      this.brightRT.texture.generateMipmaps = false;

      this.postScene = new THREE.Scene();
      this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.postUniforms = {
        tDiffuse: { value: this.postRT.texture },
        tGlow: { value: this.glowRT.texture },
        uTime: { value: 0 },
        uVig: { value: 0.82 },
        uCA: { value: 0.0016 },
        uGrain: { value: 0.045 },
        uFlash: { value: 0 },
        uShake: { value: 0 },
        uRes: { value: new THREE.Vector2(w, h) }
      };
      this.postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.makePostShader());
      this.postQuad.frustumCulled = false;
      this.postScene.add(this.postQuad);

      this.vignette = 0.82; this.ca = 0.0016; this.grain = 0.045;
      this.postReady = true;
    } catch (e) {
      console.warn('PostFX disabled:', e);
      this.postReady = false;
    }
  }

  makePostShader() {
    return new THREE.ShaderMaterial({
      uniforms: this.postUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D tDiffuse;
        uniform sampler2D tGlow;
        uniform float uTime, uVig, uCA, uGrain, uFlash, uShake;
        uniform vec2 uRes;
        varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        void main(){
          vec2 uv = vUv;
          float shake = uShake * 0.012 * (uv.x - 0.5) * 2.0;
          float ca = uCA * (1.0 + uShake * 3.0);
          vec2 off = vec2(shake, 0.0) + vec2(ca, 0.0);
          float r = texture2D(tDiffuse, uv + off).r;
          float g = texture2D(tDiffuse, uv).g;
          float b = texture2D(tDiffuse, uv - off).b;
          vec3 col = vec3(r, g, b);
          // additive bloom from the soft glow layer
          vec3 glow = texture2D(tGlow, uv).rgb;
          col += glow * 0.9;
          // vignette
          vec2 d = uv - 0.5;
          float vig = smoothstep(0.55, 0.22, length(d)) * 0.92 + 0.08;
          col *= mix(1.0, vig, uVig);
          // film grain
          col += (hash(uv * 610.0 + fract(uTime) * 17.0) - 0.5) * uGrain * 1.8;
          // cinematic warm grade
          col = pow(max(col, 0.0), vec3(0.96, 0.985, 1.02));
          // impact flash
          col += uFlash * 0.75;
          // subtle letterbox edge darkening
          col *= 1.0 - uVig * 0.06 * smoothstep(0.45, 0.5, abs(uv.y - 0.7));
          gl_FragColor = vec4(col, 1.0);
        }`
    });
  }

  /* Render the scene into the post pipeline and present to screen. */
  renderFrame() {
    if (!this.postReady) { this.renderer.render(this.scene, this.camera); return; }

    // 1) scene -> full-res offscreen (readable copy)
    this.renderer.setRenderTarget(this.postRT);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    // 2) cheap bloom: bright-pass + fast blur into the low-res glow target
    try {
      this.computeGlow();
    } catch (e) { /* glow optional */ }

    // 3) fullscreen post to screen
    this.postUniforms.tDiffuse.value = this.postRT.texture;
    this.postUniforms.tGlow.value = this.glowRT.texture;
    this.renderer.render(this.postScene, this.postCam);
  }

  computeGlow() {
    if (!this.brightRT) return;
    if (!this._rtQuad) {
      this._rtQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
      this._rtQuad.frustumCulled = false;
    }
    // a) bright pass from the full-res color into the persistent low-res brightRT
    const brightMat = this._brightMat || (this._brightMat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: this.postRT.texture }, uThresh: { value: 0.5 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D tDiffuse; uniform float uThresh;
        varying vec2 vUv;
        void main(){
          vec3 c = texture2D(tDiffuse, vUv).rgb;
          float l = dot(c, vec3(0.299,0.587,0.114));
          c *= smoothstep(uThresh, 1.0, l);
          gl_FragColor = vec4(c, 1.0);
        }`
    }));
    brightMat.uniforms.tDiffuse.value = this.postRT.texture;
    this._rtQuad.material = brightMat;
    this.renderer.setRenderTarget(this.brightRT);
    this.renderer.render(this._rtQuad, this.postCam);
    this.renderer.setRenderTarget(null);

    // b) blur the bright layer into glowRT for a soft halo
    const blurMat = this._blurMat || (this._blurMat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: this.brightRT.texture }, uDir: { value: new THREE.Vector2(1, 0) }, uRes: { value: new THREE.Vector2(this.glowRT.width, this.glowRT.height) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D tDiffuse; uniform vec2 uDir, uRes;
        varying vec2 vUv;
        void main(){
          vec2 d = uDir / max(uRes.x, uRes.y) * 1.5;
          vec3 acc = texture2D(tDiffuse, vUv).rgb * 4.0;
          acc += texture2D(tDiffuse, vUv+d).rgb;
          acc += texture2D(tDiffuse, vUv-d).rgb;
          acc += texture2D(tDiffuse, vUv+2.0*d).rgb;
          acc += texture2D(tDiffuse, vUv-2.0*d).rgb;
          gl_FragColor = vec4(acc / 8.0, 1.0);
        }`
    }));
    blurMat.uniforms.tDiffuse.value = this.brightRT.texture;
    this._rtQuad.material = blurMat;
    this.renderer.setRenderTarget(this.glowRT);
    this.renderer.render(this._rtQuad, this.postCam);
    this.renderer.setRenderTarget(null);
  }  /* Drive the post uniforms each frame, impact shake, flash decay, and a
     slowly settling cinematic grade so the whole reel feels like a film. */
  updatePost(t, dt) {
    if (!this.postReady) return;
    const U = this.postUniforms;
    if (!U || !U.uTime) return;
    U.uTime.value = t;
    // chromatic/positional shake tracks the world shake but muted
    U.uShake.value = this.shake;
    // flash decays fast after its trigger
    if (this.postFlash) {
      this.postFlash = Math.max(0, this.postFlash - dt * 5);
      U.uFlash.value = this.postFlash;
    } else if (U.uFlash.value > 0) {
      U.uFlash.value = Math.max(0, U.uFlash.value - dt * 5);
    }
    // vividness slides up during the calm convergence, down at deception
    const targetVig = this.phase === 5 ? 0.95 : 0.82;
    U.uVig.value += (targetVig - U.uVig.value) * dt * 1.5;
    U.uGrain.value = this.phase === 5 ? 0.06 : 0.045;
  }

  postImpact(strength) {
    this.postFlash = Math.min(1, strength);
  }



  /* ============ CUSTOM POST-PROCESSING (r128 compatible, no addons) ============
     We cannot rely on THREE.Examples addons (loaded as a bare old build), so this
     builds a lightweight filmic pipeline from primitives only:
       render scene -> bright-pass bloom (fake) via additive blurred copies, plus
       a fullscreen shader applying vignette, chromatic aberration, film grain and
       ACES-ish grading. Chromatic shake and a screen-level wipe pulse ride along. */
  buildPost() {
    try {
      if (!window.THREE || !THREE.WebGLRenderTarget) return;
      const w = this.container.clientWidth, h = this.container.clientHeight;
      this.composerCanvas = this.renderer.domElement; // render target path below
      // Two scaled-down glow layers to fake bloom cheaply.
      this.glowRT = new THREE.WebGLRenderTarget(Math.max(2, w / 3), Math.max(2, h / 3), { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
      this.blurRT = new THREE.WebGLRenderTarget(Math.max(2, w / 3), Math.max(2, h / 3), { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
      this.glowRT.texture.generateMipmaps = false;
      this.blurRT.texture.generateMipmaps = false;
      this.postBlendMat = this.makePostShader();
      this.glowMesh = this.makeFullscreenQuad(this.postBlendMat);
      this.sceneBG = null;
      this.vignette = 0.85;
      this.ca = 0.0016;
      this.grain = 0.05;
      this.grade = 0; // 0..1, settle toward cinematic warm grade
      this.postReady = true;
    } catch (e) {
      console.warn('PostFX disabled:', e);
      this.postReady = false;
    }
  }

  makePostShader() {
    return new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uVig: { value: 0.85 },
        uCA: { value: 0.0016 },
        uGrain: { value: 0.05 },
        uFlash: { value: 0 },
        uShake: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) }
      },
      defines: {},
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D tDiffuse;
        uniform float uTime, uVig, uCA, uGrain, uFlash, uShake;
        uniform vec2 uRes;
        varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        void main(){
          vec2 uv = vUv;
          // chromatic shake offset on impact
          float camShake = uShake * 0.012;
          vec2 cuv = uv + vec2(camShake, 0.0) * (uv.x - 0.5) * 2.0;
          // chromatic aberration: sample 3 channels at slight offsets
          float ca = uCA * (1.0 + uShake * 3.0);
          vec3 col;
          col.r = texture2D(tDiffuse, cuv + vec2( ca, 0.0)).r;
          col.g = texture2D(tDiffuse, cuv).g;
          col.b = texture2D(tDiffuse, cuv - vec2( ca, 0.0)).b;
          // vignette
          vec2 d = uv - 0.5;
          float vign = smoothstep(0.5, 0.25, length(d) * (1.75 - uVig));
          col *= mix(1.0, vign, uVig * 0.9 + 0.1);
          // film grain
          float g = (hash(uv * 700.0 + uTime) - 0.5) * uGrain * 1.6;
          col += g;
          // cinematic warm grade (slight lift + saturation)
          col = pow(max(col, 0.0), vec3(0.97, 0.99, 1.03));
          col = max(col, 0.0);
          // impact flash overlay
          col += uFlash * 0.7;
          gl_FragColor = vec4(col, 1.0);
        }`
    });
  }

  makeFullscreenQuad(mat) {
    const geo = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 999;
    return mesh;
  }

  fakeBloomLayer(src, glowMesh) {
    // Simple bright-pass via a temp scene; we approximate bloom using the
    // existing render target texture sampled through a bright-enhancing shader.
    const bright = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: glowMesh.material.uniforms.tDiffuse.value },
        uThresh: { value: 0.55 }
      },
      vertexShader: glowMesh.material.vertexShader,
      fragmentShader: `
        precision highp float;
        uniform sampler2D tDiffuse;
        uniform float uThresh;
        varying vec2 vUv;
        void main(){
          vec3 c = texture2D(tDiffuse, vUv).rgb;
          float l = dot(c, vec3(0.299,0.587,0.114));
          c = max(c - (uThresh - 0.5) * 0.0, 0.0);
          c *= smoothstep(uThresh, 1.0, l);
          gl_FragColor = vec4(c, 1.0);
        }`
    });
    return bright;
  }

  renderPost() {
    if (!this.postReady || !this.postRT) return;
    // 1) acquire readable copy of the scene into this.postRT
    this.renderer.setRenderTarget(this.postRT);
    this.renderer.render(this.scene, this.camera);
    // 2) double low-res brightness pass to fake a soft glow (cheap bloom)
    this.postBlendMat.uniforms.tDiffuse.value = this.postRT.texture;
    // blur by rendering scene->glowRT using a small box blur shader
    this.renderer.setRenderTarget(this.glowRT);
    this.softBlur(this.postRT.texture, 1);
    this.renderer.setRenderTarget(this.blurRT);
    this.softBlur(this.glowRT.texture, 2);
    // 3) composite glow plus fullscreen shader to screen
    this.renderer.setRenderTarget(null);
    this.postBlendMat.uniforms.tDiffuse.value = this.blurRT.texture;
    this.renderer.render(this.postScene, this.camera);
  }

  softBlur(src, pass) {
    const blurMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: src },
        uDir: { value: pass === 1 ? new THREE.Vector2(1, 0) : new THREE.Vector2(0, 1) },
        uRes: { value: new THREE.Vector2(this.glowRT.width, this.glowRT.height) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy,0.0,1.0); }`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D tDiffuse;
        uniform vec2 uDir, uRes;
        varying vec2 vUv;
        void main(){
          float off = 2.0 / max(uRes.x, uRes.y);
          vec2 d = uDir * off;
          vec3 acc = texture2D(tDiffuse, vUv).rgb * 4.0;
          acc += texture2D(tDiffuse, vUv+d).rgb;
          acc += texture2D(tDiffuse, vUv-d).rgb;
          acc += texture2D(tDiffuse, vUv+2.0*d).rgb;
          acc += texture2D(tDiffuse, vUv-2.0*d).rgb;
          gl_FragColor = vec4(acc / 8.0, 1.0);
        }`
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blurMat);
    mesh.frustumCulled = false;
    this.renderer.render(mesh, this.scene); // orthographic? need camera
  }

  buildPostScene() {
    this.postScene = new THREE.Scene();
    this.postScene.add(this.postBlendMesh);
    this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }



  buildEnvironmental() {
    const stars = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, sizeAttenuation: false, transparent: true, opacity: 0.7 })
    );
    const arr = [];
    for (let i = 0; i < 400; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 80 + Math.random() * 160;
      arr.push(Math.cos(a) * r, Math.random() * 90 - 20, Math.sin(a) * r);
    }
    stars.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3));
    this.scene.add(stars);

    this.ambient = new THREE.AmbientLight(0x445566, 0.5);
    this.scene.add(this.ambient);
    const moon = new THREE.DirectionalLight(0xaab6cc, 0.5);
    moon.position.set(-6, 14, 10);
    this.scene.add(moon);
    const warm = new THREE.DirectionalLight(0xffdd99, 0.3);
    warm.position.set(0, 6, -8);
    this.scene.add(warm);
    this.centerLight = new THREE.PointLight(0xd4a847, 0, 50, 2);
    this.centerLight.position.set(0, 8, 0);
    this.scene.add(this.centerLight);

    // drifting mist planes for depth
    this.mist = [];
    const mistMat = new THREE.MeshBasicMaterial({ color: 0x334, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide });
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(26, 12), mistMat);
      m.rotation.x = Math.PI / 2;
      m.position.set(this.rand(-14, 14), 1.2 + i * 0.4, this.rand(-10, 6));
      m.userData.speed = this.rand(0.1, 0.4);
      this.scene.add(m);
      this.mist.push(m);
    }
  }

  buildDais() {
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 17, 0.6, 64, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.5, roughness: 0.7 })
    );
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(15.3, 0.12, 8, 96),
      new THREE.MeshStandardMaterial({ color: 0xd4a847, metalness: 0.9, roughness: 0.2, emissive: 0xd4a847, emissiveIntensity: 0.4 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    this.ring = ring;
    this.scene.add(ring);

    this.pillars = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.55, 11, 8),
        new THREE.MeshStandardMaterial({ color: 0x16162a, metalness: 0.6, roughness: 0.4 })
      );
      pillar.position.set(Math.cos(a) * 19, 5, Math.sin(a) * 19);
      this.scene.add(pillar);
      this.pillars.push(pillar);
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xd4a847, metalness: 0.9, roughness: 0.2, emissive: 0xd4a847, emissiveIntensity: 0.3 })
      );
      cap.position.copy(pillar.position).setY(10.8);
      this.scene.add(cap);
    }
  }

  buildCenter() {
    const throne = new THREE.Group();
    const gold = new THREE.MeshStandardMaterial({ color: 0xd4a847, metalness: 0.9, roughness: 0.2, emissive: 0xd4a847, emissiveIntensity: 0.25 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 1.6), gold);
    seat.position.y = 1.2;
    throne.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.4, 1.6), gold);
    back.position.y = 2.8;
    throne.add(back);
    for (let i = 0; i < 3; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 4), gold);
      spike.position.set(-0.5 + i * 0.5, 4.0, 0.7);
      throne.add(spike);
    }
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 0.3, 8), gold);
    base.position.y = 0.15;
    throne.add(base);
    const aura = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 2.4, 6, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xffd27f, emissive: 0xffb84d, emissiveIntensity: 1.4, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })
    );
    aura.position.y = 4;
    throne.add(aura);
    this.throneAura = aura;
    this.throne = throne;
    this.scene.add(throne);
  }

  /* ---- The Mirror: a whole disc made of capturable shard meshes ----
     Spider-web cracks grow on the surface (cracked=phase2), then the
     geometry detaches into per-shard fly-aways (phase 3). */
  buildMirror() {
    const group = new THREE.Group();
    const gold = new THREE.MeshStandardMaterial({ color: 0xd4a847, metalness: 0.9, roughness: 0.2, emissive: 0xd4a847, emissiveIntensity: 0.5 });
    const frame = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.12, 12, 48), gold);
    group.add(frame);
    this.mirrorFrame = frame;

    // surface built from 24 wedges so it can shatter believably
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xbfe0ff, metalness: 0.3, roughness: 0.05, emissive: 0x88bbff, emissiveIntensity: 0.8, transparent: true, opacity: 0.95 });
    this.mirrorGlassMat = glassMat;
    const wedgeGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.18, 1, 8, false, 0, Math.PI * 2 / 24);
    const N = 24;
    for (let i = 0; i < N; i++) {
      const mat = glassMat.clone();
      mat.color = new THREE.Color(0xbfe0ff).lerp(new THREE.Color(0x8fc7ff), Math.random() * 0.35);
      const shard = new THREE.Mesh(wedgeGeo, mat);
      shard.rotation.z = (i / N) * Math.PI * 2;
      shard.userData.slot = i;
      shard.userData.flyVec = new THREE.Vector3(Math.cos(i / N * Math.PI * 2) * 1, Math.random() * 0.6 - 0.3, Math.sin(i / N * Math.PI * 2) * 1).multiplyScalar(0.9 + Math.random() * 0.8);
      shard.userData.spin = new THREE.Vector3(this.rand(-4, 4), this.rand(-4, 4), this.rand(-4, 4));
      shard.userData.basePos = new THREE.Vector3();
      shard.userData.burst = 0;
      group.add(shard);
      this.mirrorShards.push(shard);
      // crack spider-web line per shard (grows in phase 2)
      const crack = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.02),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false })
      );
      crack.rotation.z = (i / N) * Math.PI * 2 + this.rand(-0.3, 0.3);
      crack.position.x = Math.cos((i / N) * Math.PI * 2) * 0.6;
      crack.position.y = Math.sin((i / N) * Math.PI * 2) * 0.6;
      shard.add(crack);
      this.mirrorCracks.push(crack);
    }

    group.position.set(0, -14, 0);
    group.visible = false;
    this.mirrorGroup = group;
    this.scene.add(group);

    // light rays
    const rays = new THREE.Group();
    const rayMat = new THREE.MeshBasicMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    for (let i = 0; i < 16; i++) {
      const ray = new THREE.Mesh(new THREE.PlaneGeometry(3, 14), rayMat);
      ray.position.y = -7;
      ray.rotation.z = (i / 16) * Math.PI * 2;
      rays.add(ray);
    }
    rays.visible = false;
    this.mirrorRays = rays;
    group.add(rays);
  }

  /* ---- Zeroth the Warlord with a swingable mace arm ---- */
  buildZeroth() {
    const z = new THREE.Group();
    const dark = new THREE.MeshStandardMaterial({ color: 0x0a0a12, metalness: 0.7, roughness: 0.5 });
    const red = new THREE.MeshStandardMaterial({ color: 0x300000, emissive: 0xff2a00, emissiveIntensity: 0.9 });
    const steel = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, metalness: 0.9, roughness: 0.4 });
    const add = (geo, m, pos, rot) => { const mesh = new THREE.Mesh(geo, m); if (pos) mesh.position.set(pos[0], pos[1], pos[2]); if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]); mesh.castShadow = true; z.add(mesh); return mesh; };

    add(new THREE.CylinderGeometry(1.2, 1.9, 4.6, 8), dark, [0, 1.7, 0]);
    add(new THREE.ConeGeometry(1.9, 2.2, 8), dark, [0, -0.4, 0]);
    add(new THREE.SphereGeometry(0.7, 8, 8), steel, [-1.15, 2.8, 0]);
    add(new THREE.SphereGeometry(0.7, 8, 8), steel, [1.15, 2.8, 0]);
    add(new THREE.SphereGeometry(0.42, 12, 12), dark, [0, 3.3, 0]);
    add(new THREE.BoxGeometry(0.2, 0.2, 0.1), red, [-0.14, 3.3, 0.42]);
    add(new THREE.BoxGeometry(0.2, 0.2, 0.1), red, [0.14, 3.3, 0.42]);
    add(new THREE.ConeGeometry(0.09, 0.7, 6), steel, [-0.3, 3.7, 0], [0, 0, -0.5]);
    add(new THREE.ConeGeometry(0.09, 0.7, 6), steel, [0.3, 3.7, 0], [0, 0, 0.5]);
    add(new THREE.CylinderGeometry(0.18, 0.24, 1.6, 6), dark, [-1.15, 3.3, 0.2], [0, 0, 1.5]);

    // right arm is a pivot so we can swing the whole mace
    const armPivot = new THREE.Group();
    armPivot.position.set(0.85, 3.2, 0.2);
    z.add(armPivot);
    const arm = add(new THREE.CylinderGeometry(0.16, 0.2, 1.7, 6), dark, [0.4, 0, 0.1], [0, 0, 0.3]);
    armPivot.add(arm);
    const mace = new THREE.Group();
    mace.position.set(0.85, 0.1, 0.1);
    armPivot.add(mace);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), steel);
    shaft.position.y = 0.6;
    mace.add(shaft);
    const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), red);
    head.position.y = 1.5;
    mace.add(head);
    void arm; void shaft; void head;

    z.position.set(0, -7, 0);
    z.visible = false;
    z.userData.armPivot = armPivot;
    z.userData.mace = mace;
    this.zeroth = z;
    this.zerothMaceY = 0;

    const pool = new THREE.Mesh(
      new THREE.CircleGeometry(3.4, 32),
      new THREE.MeshBasicMaterial({ color: 0xff2a00, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = 0.05;
    this.scene.add(pool);
    this.zerothPool = pool;
    this.zerothLight = new THREE.PointLight(0xff2a00, 0, 34, 2);
    this.zerothLight.position.set(0, 4, 0);
    this.scene.add(this.zerothLight);
    this.scene.add(z);
  }

  buildKings() {
    const ks = this.kingdoms;
    if (!ks || !ks.length) return;
    const N = ks.length;
    this.kings = ks.map((k, i) => {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const group = this.buildKingFigure(k);
      group.position.set(0, -7, 0);
      group.userData.angle = a;
      group.userData.x = Math.cos(a) * 10.5;
      group.userData.z = Math.sin(a) * 10.5;
      this.scene.add(group);

      const spot = new THREE.SpotLight(this.hex2rgb(k.color), 0, 34, Math.PI / 6, 0.5, 1.6);
      spot.position.set(group.userData.x, 15, group.userData.z);
      const tgt = new THREE.Object3D();
      tgt.position.set(group.userData.x, 0, group.userData.z);
      this.scene.add(spot); this.scene.add(tgt);
      spot.target = tgt;

      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.5, 0),
        new THREE.MeshStandardMaterial({ color: this.hex2rgb(k.color), emissive: this.hex2rgb(k.color), emissiveIntensity: 0.8, metalness: 0.6, roughness: 0.2 })
      );
      gem.position.set(0, 3.1, 0);
      gem.userData.originY = 3.1;
      group.add(gem);

      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 2.0, 9, 20, 1, true),
        new THREE.MeshBasicMaterial({ color: this.hex2rgb(k.color), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      pillar.position.x = group.userData.x;
      pillar.position.z = group.userData.z;
      pillar.position.y = 4.5;
      this.scene.add(pillar);

      return { data: k, group, gem, spot, pillar, risen: 0, delay: i * 0.5, landedShake: false };
    });
  }

  buildKingFigure(k) {
    const g = new THREE.Group();
    const c = this.hex2rgb(k.color);
    const dark = new THREE.Color(c).multiplyScalar(0.5);
    const sea = new THREE.Color(0x0a0a18);
    const gold = new THREE.Color(0xd4a847);
    const mat = (color, m, r, e) => {
      const o = { color, metalness: m == null ? 0.4 : m, roughness: r == null ? 0.6 : r };
      if (e) { o.emissive = e; o.emissiveIntensity = 0.3; }
      return new THREE.MeshStandardMaterial(o);
    };
    const add = (geo, material, pos, rot) => {
      const m = new THREE.Mesh(geo, material);
      if (pos) m.position.set(pos[0], pos[1], pos[2]);
      if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      m.castShadow = true;
      m.castShadow = true;
      g.add(m);
      return m;
    };
    add(new THREE.ConeGeometry(1.5, 4.8, 6), mat(dark, 0.3, 0.8), [0, -0.4, 0.3]);
    add(new THREE.CylinderGeometry(0.55, 0.75, 1.6, 8), mat(c, 0.5, 0.5), [0, 0.7, 0]);
    add(new THREE.CylinderGeometry(0.75, 0.7, 0.4, 10), mat(gold, 0.9, 0.2, 0x8b6914), [0, 1.55, 0]);
    add(new THREE.SphereGeometry(0.42, 14, 14), mat(sea, 0.2, 0.7), [0, 2.1, 0]);
    add(new THREE.CylinderGeometry(0.3, 0.34, 0.22, 8), mat(gold, 0.9, 0.2, 0x8b6914), [0, 2.42, 0]);
    for (let i = 0; i < 5; i++) {
      const aa = (i / 5) * Math.PI * 2;
      add(new THREE.ConeGeometry(0.05, 0.16, 4), mat(gold, 0.9, 0.2), [Math.cos(aa) * 0.3, 2.56, Math.sin(aa) * 0.3]);
    }
    if (k.id === 'vigilant') add(new THREE.BoxGeometry(0.02, 0.5, 0.5), mat(0x2c2c3a, 0.2, 0.8), [0, 2.1, 0.44]);
    else if (k.id === 'scrupulous') add(new THREE.CircleGeometry(0.2, 16), mat(0xffffff, 0, 0.3, 0xaaaaaa), [0, 2.1, 0.44]);
    else if (k.id === 'clement') add(new THREE.CircleGeometry(0.18, 16), mat(gold, 0.9, 0.2, gold), [0, 2.04, 0.45]);

    const armMat = mat(c, 0.5, 0.5);
    add(new THREE.CylinderGeometry(0.13, 0.16, 0.9, 6), armMat, [-0.85, 1.2, 0], [0, 0, 0.15]);

    // right arm pivot holding a sword, can be raised/pointed
    const armPivot = new THREE.Group();
    armPivot.position.set(0.75, 1.4, -0.1);
    g.add(armPivot);
    const forearm = add(new THREE.CylinderGeometry(0.12, 0.15, 0.85, 6), armMat, [0.28, 0, 0.1], [0, 0, 0.4]);
    armPivot.add(forearm);
    const bladePivot = new THREE.Group();
    bladePivot.position.set(0.55, 0, 0.1);
    armPivot.add(bladePivot);
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.12), mat(0xdfeaff, 0.9, 0.1, 0x88bbff));
    sword.position.y = 0.6;
    bladePivot.add(sword);
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.06), mat(gold, 0.9, 0.2, 0x8b6914));
    cross.position.y = 0.12;
    bladePivot.add(cross);
    void forearm; void sword; void cross;

    g.userData.king = k;
    g.userData.armPivot = armPivot;
    g.userData.bladePivot = bladePivot;
    return g;
  }

  /* ---- A reusable low-poly humanoid avatar ----
     opts: { color, robe, skin, crown:true|'helmet'|false, weapon:'sword'|'mace'|false,
             height }  returns a THREE.Group with armPivots + legs for acting. */
  buildCharacter(opts) {
    const o = opts || {};
    const g = new THREE.Group();
    const robe = new THREE.Color(o.robe || '#6b6b8a');
    const skin = new THREE.Color(o.skin || '#d9b98a');
    const gold = new THREE.Color(0xd4a847);
    const metal = new THREE.Color(o.metal || '#2c2c3a');
    const mat = (c, m, r) => new THREE.MeshStandardMaterial({ color: c, metalness: m == null ? 0.4 : m, roughness: r == null ? 0.6 : r });
    const add = (geo, m, pos, rot) => { const mesh = new THREE.Mesh(geo, m); if (pos) mesh.position.set(pos[0], pos[1], pos[2]); if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]); mesh.castShadow = true; g.add(mesh); return mesh; };
    const H = o.height || 1.6;
    // legs (for marching actors)
    const legL = new THREE.Group(); legL.position.set(-0.12, H*0.28, 0);
    const legR = new THREE.Group(); legR.position.set(0.12, H*0.28, 0);
    g.add(legL); g.add(legR);
    // body / robe
    add(new THREE.CylinderGeometry(0.18, 0.34, H*0.55, 8), mat(robe, 0.2, 0.8), [0, H*0.58, 0]);
    // head
    add(new THREE.SphereGeometry(0.16, 12, 12), mat(skin, 0.1, 0.7), [0, H*0.92, 0]);
    // crown or helmet
    if (o.crown === 'helmet') add(new THREE.ConeGeometry(0.16, 0.28, 6), mat(metal, 0.9, 0.3), [0, H*1.06, 0]);
    else if (o.crown) {
      add(new THREE.CylinderGeometry(0.17, 0.2, 0.1, 8), mat(gold, 0.9, 0.2), [0, H*1.03, 0]);
      for (let i = 0; i < 4; i++) { const aA = (i/4)*Math.PI*2; add(new THREE.ConeGeometry(0.03, 0.1, 4), mat(gold, 0.9, 0.2), [Math.cos(aA)*0.15, H*1.09, Math.sin(aA)*0.15]); }
    }
    // arms (as pivots)
    const armL = new THREE.Group(); armL.position.set(-0.24, H*0.78, 0); g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.24, H*0.78, 0); g.add(armR);
    const larm = add.call(null, new THREE.CylinderGeometry(0.05, 0.06, H*0.3, 6), mat(robe, 0.3, 0.7), [0, -H*0.14, 0]);
    armL.add(larm);
    const rarm = add.call(null, new THREE.CylinderGeometry(0.05, 0.06, H*0.3, 6), mat(robe, 0.3, 0.7), [0, -H*0.14, 0]);
    armR.add(rarm);
    // weapon
    if (o.weapon === 'sword') {
      const s = new THREE.Group(); s.position.set(0, -0.18, 0); armR.add(s);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.55, 0.1), new THREE.MeshStandardMaterial({ color: 0xdfeaff, metalness: 0.9, roughness: 0.1, emissive: 0x88bbff, emissiveIntensity: 0.35 })); blade.position.y = 0.28; s.add(blade);
      armR.userData.weapon = s;
    } else if (o.weapon === 'mace') {
      const s = new THREE.Group(); s.position.set(0.2, -0.2, 0); armR.add(s);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), mat(metal, 0.9, 0.3)); shaft.position.y = -0.1; s.add(shaft);
      const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), new THREE.MeshStandardMaterial({ color: 0x801010, metalness: 0.9, roughness: 0.2, emissive: 0xff2a00, emissiveIntensity: 0.4 })); head.position.y = 0.15; s.add(head);
      armR.userData.weapon = s;
    }
    g.userData.armL = armL; g.userData.armR = armR; g.userData.legL = legL; g.userData.legR = legR;
    return g;
  }

  /* Dresses the dais as a royal throne-hall interior: arches, banners,
     braziers and a raised dais so it reads as a real kingdom world. */
  royalHallDress() {
    this.arches = []; this.banners = [];
    const stone = new THREE.MeshStandardMaterial({ color: 0x2a2433, metalness: 0.2, roughness: 0.8 });
    // ring of arches around the dais
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * 17, z = Math.sin(a) * 17;
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.18, 8, 14, Math.PI), stone);
      arch.position.set(x, 6.4, z);
      arch.rotation.set(0, -a + Math.PI / 2, 0);
      this.scene.add(arch); this.arches.push(arch);
      // banner hanging between arches
      const bc = this.kingdoms[i] ? this.hex2rgb(this.kingdoms[i].color) : new THREE.Color(0x666);
      const banner = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 2.6),
        new THREE.MeshStandardMaterial({ color: bc, side: THREE.DoubleSide, emissive: bc, emissiveIntensity: 0.18 })
      );
      banner.position.set(x * 1.06, 5.2, z * 1.06);
      banner.lookAt(0, 5.2, 0);
      this.scene.add(banner); this.banners.push(banner);
      this.bannerCols.push(bc);
    }
    // braziers / torch lights at the dais edge
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.4;
      const x = Math.cos(a) * 13, z = Math.sin(a) * 13;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x3a2c18, metalness: 0.7, roughness: 0.5 }));
      post.position.set(x, 0.8, z);
      this.scene.add(post);
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffaa33, emissive: 0xff7711, emissiveIntensity: 1.6 }));
      flame.position.set(x, 1.75, z);
      flame.userData.baseY = 1.75;
      this.scene.add(flame);
      this.flames ? this.flames.push(flame) : (this.flames = [flame]);
      const bLight = new THREE.PointLight(0xff9933, 0.8, 12, 2);
      bLight.position.set(x, 2.0, z);
      this.scene.add(bLight);
      this.torchLights ? this.torchLights.push(bLight) : (this.torchLights = [bLight]);
    }
  }

  /* Stages the acting cast for the opening beats: a seated ruler on the dais,
     a kneeling sage, flanking guards and courtiers around the hall. */
  buildActors() {
    this.actorGroups = [];
    // The Convergent Ruler, seated centrally on the dais
    const ruler = this.buildCharacter({ robe: 0xd4b06a, skin: 0xe3c391, crown: true, weapon: 'sword' });
    ruler.position.set(0, 1.3, 0.35);
    ruler.scale.setScalar(1.15);
    this.scene.add(ruler);
    this.ruler = ruler;
    this.actorGroups.push(ruler);
    // Sage kneeling before where the mirror descends
    const sage = this.buildCharacter({ robe: 0x8aaabb, skin: 0xe6c9a0, crown: false });
    sage.position.set(-2.4, 0.28, 4.5);
    this.scene.add(sage);
    this.sage = sage;
    this.actorGroups.push(sage);
    // flanking guards
    const guardColors = [0x55586b, 0x4a4d5e];
    for (let i = 0; i < 4; i++) {
      const side = i < 2 ? 1 : -1;
      const gd = this.buildCharacter({ robe: guardColors[i % 2], skin: 0xd9b98a, crown: 'helmet', weapon: 'sword' });
      gd.position.set(side * (4 + i * 2), 0.15, i < 2 ? 2.2 : 6.5);
      gd.userData.home = gd.position.clone();
      gd.rotation.y = side > 0 ? Math.PI / 2.6 : -Math.PI / 2.6;
      this.scene.add(gd);
      this.guards.push(gd);
      this.actorGroups.push(gd);
    }
    // a few courtiers standing in the hall
    const courtColors = [0x7a5e8a, 0x8a7a4d, 0x5e8a6a, 0x7a4d4d];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.2;
      const c = this.buildCharacter({ robe: courtColors[i % courtColors.length], skin: 0xe0c09a, crown: false });
      c.position.set(Math.cos(a) * 11, 0.1, 3 + Math.sin(a) * 8);
      c.rotation.y = Math.PI - a;
      c.userData.home = c.position.clone();
      c.userData.scatter = c.position.clone().multiplyScalar(1.5);
      this.scene.add(c);
      this.courtiers.push(c);
      this.actorGroups.push(c);
    }
  }

  buildEffects() {
    const flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:5;transition:opacity 0.1s';
    this.flashEl = flash;
    this.container.appendChild(flash);

    this.boltRoot = new THREE.Group();
    this.boltRoot.visible = false;
    this.scene.add(this.boltRoot);
  }

  addShockwave(x, y, z, color, speedMax) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.6, 40),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, y + 0.06, z);
    this.scene.add(ring);
    this.shockwaves.push({ mesh: ring, age: 0, speed: speedMax || 5, baseColor: color });
  }

  makeBolt(x0, y0, z0, x1, y1, z1, color) {
    const segs = 7;
    const pts = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const jx = t < 0.5 ? t * 2 : 2 - t * 2;
      pts.push(new THREE.Vector3(
        x0 + (x1 - x0) * t + this.rand(-0.4, 0.4) * jx,
        y0 + (y1 - y0) * t + this.rand(-0.6, 0.6) * jx,
        z0 + (z1 - z0) * t + this.rand(-0.4, 0.4) * jx
      ));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, linewidth: 1 }));
    this.boltRoot.add(line);
    return line;
  }

  buildParticles() {
    const count = 800;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const kc = this.kings.length ? this.kings.map(k => this.hex2rgb(k.data.color)) : [new THREE.Color(0xffffff)];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 20;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = Math.sin(a) * r;
      const col = kc[Math.floor(Math.random() * kc.length)];
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.particleGeo = geo;
    this.scene.add(this.particles);
  }

  updateParticles() {
    if (!this.particles) return;
    const pos = this.particleGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.array[i * 3 + 1] + 0.008;
      if (y > 16) y = 0;
      pos.array[i * 3 + 1] = y;
    }
    pos.needsUpdate = true;
    this.particles.rotation.y += 0.0004;
  }

  updateMist(dt) {
    if (!this.mist) return;
    this.mist.forEach(m => { m.position.x += m.userData.speed * dt * 0.5; if (m.position.x > 18) m.position.x = -18; });
  }

  updateShockwaves(dt) {
    this.shockwaves = this.shockwaves.filter(s => s.age < 1.6);
    this.shockwaves.forEach(s => {
      s.age += dt;
      const e = this.easeOut(Math.min(1, s.age / 1.6));
      const scale = s.speed * e * 2.4;
      s.mesh.scale.set(scale, scale, 1);
      s.mesh.material.opacity = 0.9 * (1 - e);
      s.mesh.lookAt(s.mesh.position.x + Math.sin(s.age * 3), s.mesh.position.y, s.mesh.position.z + Math.cos(s.age * 3));
    });
  }

  setPhase(phase) {
    if (phase !== this.phase) this.pendingPhase = phase;
  }

  animate() {
    if (!this.running) return;
    this.animFrame = requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    const t = this.time;

    if (this.pendingPhase != null) {
      this.phase = this.pendingPhase;
      this.pendingPhase = null;
      this.phaseTime = 0;
      this.enterPhase();
    }
    this.phaseTime += dt;

    this.shake = this.shake * 0.9;
    this.updateMist(dt);
    this.updateShockwaves(dt);
    this.updateParticles();
    this.updatePhaseAnim(t, dt);
    this.updateCamera(t, dt);
    this.updatePost(t, dt);
    this.renderFrame();
  }

  enterPhase() {
    const p = this.phase;
    if (p === 2) this.flash(0.5);
    if (p === 3) this.flash(0.6);
  }

  flash(strength) {
    if (!this.flashEl) return;
    this.flashEl.style.opacity = String(strength);
    const el = this.flashEl;
    setTimeout(() => { if (el) el.style.opacity = '0'; }, 90);
  }

  /* ============ ACTING CAST (royal-hall characters) ============ */
  updateActors(t, pt, phase) {
    const ep = p => 1 - Math.pow(1 - p, 3); // ease-out helper
    const clamp = this.clamp;

    const showHall = phase === 0 || phase === 1 || phase === 2 || phase === 3;
    const peopleFlee = phase === 2 || phase === 3 || phase === 5;
    const hideForKings = phase === 4 || phase === 5;

    // Ruler: seated during the calm, RISE + brace when Zeroth appears (phase 2),
    // then sink away once the kingdoms rise (phase 4/5).
    if (this.ruler) {
      if (showHall) {
        this.ruler.visible = true;
        let ry = 1.3;
        let rz = 0.35;
        // seat bob while calm
        if (phase === 0) ry += Math.sin(t * 1.3) * 0.04;
        // rise to standing + brace as the warlord arrives (step back off the line)
        if (phase === 2 || phase === 3) {
          const rise = ep(clamp((pt - 0.5) / 1.0, 0, 1));
          ry = 1.3 + rise * 1.1;
          rz = 0.35 - rise * 2.6;
          this.ruler.userData.armL.rotation.z = 0.6 * rise;
          this.ruler.userData.armR.rotation.z = -0.6 * rise;
          if (rise >= 1 && phase === 2 && !this.rulerAlarmed) {
            this.rulerAlarmed = true;
            this.shake = Math.max(this.shake, 0.2);
          }
        } else {
          this.ruler.userData.armL.rotation.z *= 0.9;
          this.ruler.userData.armR.rotation.z *= 0.9;
        }
        this.ruler.position.y = ry;
        this.ruler.position.z = rz;
      } else {
        // sink back into the throne as the kingdoms take the stage
        this.ruler.position.y += (0 - this.ruler.position.y) * 0.05;
        if (this.ruler.position.y < 0.2) this.ruler.visible = false;
      }
    }

    // Sage: kneels before the mirror (phase 1) praying; recoils at the shatter (3).
    if (this.sage) {
      if (phase === 0) {
        this.sage.visible = true;
        this.sage.position.y = 0.28;
        this.sage.userData.armL.rotation.z = 0.3 + Math.sin(t * 2) * 0.1;
        this.sage.userData.armR.rotation.z = -0.3 - Math.sin(t * 2) * 0.1;
      } else if (phase === 1) {
        this.sage.visible = true;
        const kneel = ep(clamp((pt - 0.6) / 1.5, 0, 1));
        this.sage.position.y = 0.28 - kneel * 0.22;
        this.sage.position.x = -2.4 - kneel * 0.5;
        this.sage.rotation.x = kneel * 0.5;
        this.sage.userData.armL.rotation.z = 0.25;
        this.sage.userData.armR.rotation.z = -0.25;
      } else if (phase === 2) {
        // startled, rises off knees and steps back
        const back = ep(clamp((pt - 0.6) / 1.2, 0, 1));
        this.sage.position.y = 0.28;
        this.sage.position.x = -3.2 - back * 0.6;
        this.sage.rotation.x = 0;
        this.sage.userData.armL.rotation.z = 0.9;
        this.sage.userData.armR.rotation.z = -0.9;
      } else if (phase === 3) {
        // knocked back as the mirror detonates
        const kb = ep(clamp((pt - 1.0) / 0.6, 0, 1));
        this.sage.position.x = -3.8 - kb * 2.2;
        this.sage.position.y = 0.3 - kb * 1.8;
        this.sage.rotation.x = kb * 1.6;
        this.sage.rotation.z = kb * 0.7;
        this.sage.userData.armL.rotation.z = 1.8;
        this.sage.userData.armR.rotation.z = -1.8;
      } else if (hideForKings) {
        this.sage.position.y -= 0.06;
        if (this.sage.position.y < 0.1) this.sage.visible = false;
      } else {
        this.sage.visible = false;
      }
    }

    // Guards: stand watch during calm; raise weapons as Zeroth comes;
    // scatter away when the kingdoms/frenzy take over.
    this.guards.forEach((gd, i) => {
      if (showHall) {
        gd.visible = true;
        // settle back to post when not fleeing
        gd.position.x += (gd.userData.home.x - gd.position.x) * 0.04;
        gd.position.z += (gd.userData.home.z - gd.position.z) * 0.04;
        gd.position.y = 0.15;
        if (peopleFlee) {
          const f = ep(clamp((pt - (0.4 + i * 0.1)) / 1.4, 0, 1));
          gd.position.x += Math.sin(i * 7) * f * 3.2;
          gd.position.z += (1 + i * 0.3) * f * 3;
          gd.position.y = 0.15 - f;
          gd.rotation.y = Math.PI / 2 + Math.sin(i * 3) * 0.4;
        } else {
          // on guard, weapon raised a touch
          const alert = phase === 2 ? 1 : 0;
          gd.userData.armR.rotation.z = -0.4 - alert * 0.9;
          gd.userData.armL.rotation.z = 0.5 * alert;
          gd.rotation.y = gd.userData.rot || (gd.rotation.y);
          gd.rotation.y = gd.position.x > 0 ? Math.PI / 2.6 : -Math.PI / 2.6;
        }
      } else {
        gd.position.y -= 0.06;
        if (gd.position.y < 0.1) gd.visible = false;
      }
    });

    // Courtiers: idle calmly, then panic-scatter (flee the hall) when it breaks.
    this.courtiers.forEach((c, i) => {
      if (showHall && !peopleFlee) {
        c.visible = true;
        const home = c.userData.home;
        c.position.x += (home.x - c.position.x) * 0.04;
        c.position.z += (home.z - c.position.z) * 0.04;
        c.position.y = 0.1;
        c.userData.armL.rotation.z = 0.15 + Math.sin(t * 2 + i) * 0.1;
        c.userData.armR.rotation.z = -0.15 - Math.sin(t * 2 + i) * 0.1;
      } else if (showHall) {
        const f = ep(clamp((pt - (0.3 + i * 0.12)) / 1.5, 0, 1));
        const dirX = c.userData.home.x > 0 ? 1 : -1;
        c.position.x += dirX * f * 6;
        c.position.z += (c.userData.home.z > 0 ? 1 : -1) * f * 5;
        c.position.y = 0.1 - f;
        c.rotation.y = dirX > 0 ? -Math.PI / 2 : Math.PI / 2;
        c.userData.armL.rotation.z = 1.4;
        c.userData.armR.rotation.z = -1.4;
      } else {
        c.position.y -= 0.06;
        if (c.position.y < 0.1) c.visible = false;
      }
    });
  }

  /* ================= PER-BEAT ACTION ================= */
  updatePhaseAnim(t, dt) {
    const pt = this.phaseTime;
    const phase = this.phase;

    // the acting royal-hall cast (ruler, sage, guards, courtiers)
    this.updateActors(t, pt, phase);

    // --- Convergence (0): throne orbits, ember aura pulses ---
    if (this.throne) {
      this.throne.visible = phase === 0;
      if (phase === 0) {
        this.throne.position.y = Math.sin(t * 0.5) * 0.1;
        this.throne.rotation.y += 0.003;
        const aura = this.throneAura;
        aura.material.opacity = 0.25 + Math.sin(t * 1.2) * 0.1;
        this.centerLight.intensity = 2.2 + Math.sin(t * 2) * 0.6;
      } else {
        this.centerLight.intensity = Math.max(0, this.centerLight.intensity * 0.9);
      }
    }

    // --- Mirror drop + rays (1) ---
    if (phase === 1) {
      this.mirrorGroup.visible = true;
      const drop = this.easeOut(this.clamp(pt / 1.8, 0, 1));
      const y = -14 + (8.2 - (-14)) * drop;
      this.mirrorGroup.position.y = y;
      this.mirrorGroup.rotation.y += 0.005;
      const settle = this.clamp(drop, 0, 1);
      if (drop >= 1 && !this.mirrorDropDone) {
        // impact shockwave + punch-in when the mirror slams into place
        this.mirrorDropDone = true;
        this.addShockwave(0, 8.2, 0, 0x88bbff, 6);
        this.shake = Math.max(this.shake, 0.4);
        this.postImpact(0.55);
      }
      this.mirrorRays.visible = drop > 0.3;
      if (this.mirrorRays) this.mirrorRays.rotation.y += 0.004;
      // slight rocking before it settles
      this.mirrorGroup.rotation.x = Math.sin(t * 2) * 0.05 * (1 - settle);
      void settle;
    } else if (phase === 2) {
      // mirror stays risen, threatened by Zeroth below
      this.mirrorGroup.visible = true;
      this.mirrorRays.visible = true;
      if (this.mirrorRays) this.mirrorRays.rotation.y += 0.004;
    } else if (phase === 3 && !this.burstDone) {
      // pre-detonation: visible and shaking
      this.mirrorGroup.visible = true;
    }

    // --- Shadow (2): Zeroth rises, swings mace into the dais, mirror cracks ---
    if (phase === 2) {
      if (this.zeroth) {
        this.animateZeroth(t, pt, true);
        // spider-web cracks grow on the mirror surface
        const crackAmt = this.clamp((pt - 1.4) / 2.2, 0, 1);
        this.mirrorCracks.forEach(c => { c.material.opacity = crackAmt; });
      }
    }

    // --- Shatter (3): the mirror detonates with physics shards ---
    if (phase === 3) {
      const pre = this.burstPrefire ? 1 : this.clamp(pt / 1.2, 0, 1);
      if (pt > 1.2 && !this.burstDone) {
        this.burstDone = true;
        this.mirrorGroup.visible = false;
        this.flash(1.5);
        this.shake = 1.2;
        this.postImpact(1);
        this.addShockwave(0, 8.2, 0, 0xffffff, 9);
        this.mirrorShards.forEach((s, i) => {
          s.userData.burst = 0;
          s.userData.basePos.copy(s.position);
          s.userData.baseRot = s.rotation.clone();
        });
      }
      if (this.burstDone) this.animateShards(t, dt);
      else if (this.mirrorGroup) {
        this.mirrorGroup.visible = true;
        this.mirrorGroup.rotation.y += 0.12;
        this.mirrorGroup.rotation.z = Math.sin(pt * 30) * 0.08;
        this.centerLight.intensity = 4 + Math.sin(pt * 24) * 2;
        // cracks fully scored before detonation
        this.mirrorCracks.forEach(c => { c.material.opacity = 1; });
      }
      void pre;
    }

    // --- Kingdoms (4): kings burst up, raise blades, ring shudders ---
    if (phase === 4 || phase === 5) {
      this.kings.forEach((k, i) => {
        k.group.visible = true;
        const cx = k.group.userData.x, cz = k.group.userData.z;
        if (phase === 4) {
          const prog = this.clamp((pt - k.delay) / 0.9, 0, 1);
          const up = this.easeBack(prog) * 7.4;
          k.group.position.x = cx;
          k.group.position.z = cz;
          k.group.position.y = -7 + Math.max(0, up);
          k.group.rotation.y = -(k.group.userData.angle) + Math.PI / 2;
          // landing shake per king
          if (prog >= 1 && !k.landedShake) {
            k.landedShake = true;
            this.shake = Math.max(this.shake, 0.35);
            this.postImpact(Math.min(1, 0.25 + i * 0.03));
            this.addShockwave(cx, 0, cz, this.hex2rgb(k.data.color), 5);
          }
          // raise the blade sharp with an ease-back as they land
          const raise = prog >= 1 ? 1 : easeBackLocal(prog);
          k.group.userData.armPivot.rotation.z = -1.6 + 1.6 * raise;
          k.group.userData.bladePivot.rotation.z = -0.6 * (1 - raise);
          k.risen = Math.max(k.risen, raise);
          k.pillar.material.opacity = 0.5 * (1 - raise) + 0.06 * raise;
          k.pillar.scale.y = 0.5 + 0.5 * raise;
          k.gem.rotation.y += 0.03;
          k.gem.position.y = k.gem.userData.originY + Math.sin(t * 1.2 + i) * 0.12;
          k.spot.intensity = 0.3 + raise * 1.6;
        } else {
          // deception: kings turn to face the rift and point blades up
          k.group.position.x = cx;
          k.group.position.z = cz;
          k.group.position.y = k.risen * 7.4 - 7 + Math.sin(t * 1 + i) * 0.06;
          const face = -Math.atan2(cx - 0, cz - 0) + Math.PI + Math.sin(t * 0.4 + i) * 0.08;
          k.group.rotation.y = face;
          const alarm = this.clamp((pt - 1) / 2, 0, 1);
          k.group.userData.armPivot.rotation.z = -1.6 + 1.6 * eu(alarm) * Math.sin(t * 0.5 + i);
          k.gem.position.y = k.gem.userData.originY + Math.sin(t * 1.2 + i) * 0.16;
          k.gem.rotation.y += 0.03;
          k.spot.intensity = Math.max(0.05, 0.3 + k.risen * 1.6 * (1 - alarm * 0.8));
        }
      });
      // ring & pillars shudder subtly during battle beats
      if (this.ring) this.ring.rotation.z = Math.sin(t * 3) * 0.01;
      if (this.pillars) this.pillars.forEach((p, i) => p.rotation.z = Math.sin(t * 4 + i) * 0.008);
    }

    // --- Deception (5): rift erupts, lightning, red wash ---
    if (phase === 5) {
      this.animateRift(t, dt, pt);
    } else {
      if (this.rift) { this.rift.visible = false; this.riftLight.intensity = 0; }
      if (this.boltRoot) this.boltRoot.visible = false;
    }

    // clean up Zeroth after shatter / kingdoms
    if (this.zeroth) {
      if (phase === 3 && this.burstDone) {
        this.zerothLight.intensity *= 0.92;
        this.zerothPool.material.opacity *= 0.9;
      } else if (phase === 4 || phase === 5) {
        this.zeroth.visible = false;
        this.zerothLight.intensity = 0;
        this.zerothPool.material.opacity = 0;
      }
    }

    // ambient settles toward normal after heavy beats
    if (phase === 4) this.ambient.intensity = Math.max(0.5, this.ambient.intensity * 0.98);
  }

  animateZeroth(t, pt, crackMode) {
    const rise = this.easeOut(this.clamp((pt - 0.3) / 1.2, 0, 1));
    this.zeroth.visible = true;
    this.zeroth.position.y = -7 + rise * 7;
    this.zeroth.rotation.y += 0.001;
    this.zerothLight.intensity = rise * (8 + Math.sin(t * 6) * 3);
    this.zerothLight.position.y = 3 + rise * 3;
    this.zerothPool.material.opacity = 0.5 * rise;
    this.ambient.intensity = Math.max(this.ambient.intensity, 0.8 + 0.4 * rise);

    // MACE SWING: wind up (raise), then SLAM down into the dais
    const armPivot = this.zeroth.userData.armPivot;
    // full swing cycle returns 0..1 (1 = slammed at floor)
    const swing = this.clamp((pt - 1.2) / 1.4, 0, 1);
    const windup = Math.sin(swing * Math.PI); // 0 -> 1 -> 0
    armPivot.rotation.z = -2.4 + windup * 2.2; // raise way up, then drive down
    this.zerothMaceY = Math.sin(swing * Math.PI) * 0.9; // mace drops as it swings
    this.zeroth.userData.mace.position.y = this.zerothMaceY;
    // impact shake when the mace reaches the floor
    if (swing >= 0.98 && !this.maceSlammed) {
      this.maceSlammed = true;
      this.shake = Math.max(this.shake, 0.9);
      this.flash(0.6);
      this.postImpact(0.7);
      this.addShockwave(0, 0.1, 0, 0xff2a00, 8);
    }
    // mirror wobbles violently under the blows
    if (this.mirrorGroup) this.mirrorGroup.rotation.z = Math.sin(t * 14) * 0.1 * swing;
  }

  animateShards(t, dt) {
    this.shardsActive = true;
    this.mirrorShards.forEach((s, i) => {
      const u = s.userData;
      u.burst += dt;
      const spd = Math.min(u.burst / 2.0, 1);
      const e = this.easeOut(spd);
      // physics: fly outward, fall, spin, fade out near end
      s.position.copy(u.basePos).add(u.flyVec.clone().multiplyScalar(e * 8));
      s.position.y -= e * Math.pow(spd, 2) * 6; // gravity
      s.rotation.x = u.baseRot ? u.baseRot.x + u.spin.x * spd : u.spin.x * spd;
      s.rotation.y = u.baseRot ? u.baseRot.y + u.spin.y * spd : u.spin.y * spd;
      s.rotation.z = u.baseRot ? u.baseRot.z + u.spin.z * spd : u.spin.z * spd;
      s.material.opacity = 0.95 * (1 - Math.max(0, e - 0.82));
      // sparkle, emissive pulse
      s.material.emissiveIntensity = 0.8 + 1.4 * (1 - e);
    });
  }

  animateRift(t, dt, pt) {
    if (!this.rift) {
      const geo = new THREE.SphereGeometry(1, 22, 22);
      const mat = new THREE.MeshStandardMaterial({ color: 0x1a0000, emissive: 0xff2200, emissiveIntensity: 0.6, transparent: true, opacity: 0.85 });
      this.rift = new THREE.Mesh(geo, mat);
      this.scene.add(this.rift);
      this.riftLight = new THREE.PointLight(0xff2200, 0, 60, 2);
      this.scene.add(this.riftLight);
      this.boltRoot.visible = true;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const line = this.makeBolt(Math.cos(a) * 3, 8, Math.sin(a) * 3, Math.cos(a) * 8, 8 + this.rand(-2, 3), Math.sin(a) * 8, 0xff5500);
        this.bolts.push(line);
      }
    }
    this.rift.visible = true;
    const grow = this.easeOut(this.clamp(pt / 2.2, 0, 1));
    const pulse = Math.sin(t * 5) * 0.07 + 1;
    this.rift.scale.setScalar(0.8 + grow * 5.2 * pulse);
    this.rift.position.y = 6 + grow * 6;
    this.rift.material.emissiveIntensity = 0.4 + grow * (1 + Math.sin(t * 6) * 0.4);
    this.riftLight.intensity = grow * 10;
    this.riftLight.position.y = this.rift.position.y;
    this.rift.rotation.y += 0.012;
    this.boltRoot.visible = grow > 0.2;
    this.bolts.forEach((b, i) => {
      const on = Math.sin(t * (8 + i * 3) + i * 7) > 0.25;
      b.material.opacity = on ? (0.5 + 0.5 * Math.random()) : 0.04;
    });
    this.ambient.intensity = Math.max(this.ambient.intensity, 1.0 + 0.4 * grow);
    if (grow > 0.7 && Math.random() < 0.3) { this.shake = Math.max(this.shake, 0.15); this.addShockwave(0, 8, 0, 0xff2200, 6); }
  }

  updateCamera(t, dt) {
    const pt = this.phaseTime;
    // filmic shot clock: each phase beats reveal per phaseTime so the camera
    // commits to a shot move instead of orbiting forever on wall-clock t.
    const st = pt > 0 ? pt : t;
    const pos = new THREE.Vector3();
    const look = new THREE.Vector3(0, 2.5, 0);
    let fov = 55;
    let dutch = 0;

    // camera action per beat (phaseTime-driven so every replay is identical)
    switch (this.phase) {
      case 0: // CONVERGENCE, slow ceremonial orbit + gentle lift over the throne
        {
          const e = this.easeInOut(this.clamp(st / 8, 0, 1));
          const ang = Math.PI / 2 + e * Math.PI * 2 + Math.sin(t * 0.3) * 0.04;
          pos.set(Math.cos(ang) * 16, 5.5 + Math.sin(t * 0.7) * 0.7, Math.sin(ang) * 16 + 3);
          look.set(0, 3, 0);
        }
        break;
      case 1: // THE MIRROR, crane up then swoop down as it slams into place
        {
          const prog = this.easeInOut(this.clamp(st / 2.4, 0, 1));
          const camY = 7 + Math.sin(prog * Math.PI) * 5;
          pos.set(Math.sin(st * 0.9) * 3, camY, 20 - prog * 12);
          look.set(0, 8, 0);
          fov += Math.sin(st * 3) * 1.2;
        }
        break;
      case 2: // SHADOW, low heroic angle on Zeroth, punch-in on the mace slam
        {
          const e = this.clamp(st / 2.2, 0, 1);
          pos.set(Math.sin(st * 0.7) * 4, 3.0 + Math.sin(st * 1.3) * 0.5, 13 - e * 1.2);
          look.set(0, 3.4, 0);
          // mace wind-up pulls focus tight, slam punches the FOV wide
          const windup = Math.sin(this.clamp((st - 1.2) / 1.4, 0, 1) * Math.PI);
          fov += windup * 2.2;
          dutch = Math.sin(st * 0.9) * 0.03;
        }
        break;
      case 3: // SHATTER, violent punch-in to the mirror then slow fall with shards
        {
          const punch = Math.min(st * 7, 9);
          pos.set(Math.sin(st * 1.4) * 2, 7, 16 - punch);
          look.set(0, 8, 0);
          fov += punch * 0.55;
          dutch = Math.sin(st * 6) * 0.04;
        }
        break;
      case 4: // KINGDOMS, fast dolly sweep across the rising kings
        {
          const ang = Math.PI / 2 + Math.min(st * 0.32, Math.PI * 0.9);
          pos.set(Math.cos(ang) * 15, 5 + Math.sin(st * 0.6) * 1.1, Math.sin(ang) * 15 + 3);
          look.set(0, 2.5 - st * 0.05, 0);
          fov += Math.sin(st * 2.2) * 1.6;
          dutch = Math.sin(st * 1.1) * 0.02;
        }
        break;
      case 5: // DECEPTION, pull back and up, alarmed, hard Dutch tilt
        {
          pos.set(Math.sin(st * 0.8) * 4, 7 + Math.sin(st * 0.5) * 1.2 - st * 0.06, 28 - st * 0.4);
          look.set(0, 8, 0);
          fov += Math.sin(st * 9) * 2.2;
          dutch = 0.08 + Math.sin(st * 3) * 0.04;
        }
        break;
      case 6:
        {
          const an = Math.PI / 2;
          pos.set(Math.cos(an) * 14, 6, Math.sin(an) * 14 + 4);
          look.set(0, 2, 0);
        }
        break;
      default:
        pos.set(0, 8, 26);
        look.set(0, 2, 0);
    }

    // screen-shake rides on top of the commit shot
    if (this.shake > 0.01) {
      pos.x += this.rand(-1, 1) * this.shake * 0.55;
      pos.y += this.rand(-1, 1) * this.shake * 0.55;
      pos.z += this.rand(-1, 1) * this.shake * 0.55;
      dutch += this.rand(-1, 1) * this.shake * 0.04;
    }

    this.camera.position.lerp(pos, 0.1);
    this.camera.lookAt(look);
    this.camera.rotation.z += dutch;
    if (Math.abs(fov - 55) > 0.01) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); } else if (this.camera.fov !== 55) { this.camera.fov = 55; this.camera.updateProjectionMatrix(); }
  }

  stop() { this.running = false; if (this.animFrame) cancelAnimationFrame(this.animFrame); }

  destroy() {
    this.stop();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    if (this.postRT) { this.postRT.dispose(); this.postRT = null; }
    if (this.glowRT) { this.glowRT.dispose(); this.glowRT = null; }
    if (this.brightRT) { this.brightRT.dispose(); this.brightRT = null; }
    this.postReady = false;
    if (this.flashEl && this.flashEl.parentNode) this.flashEl.parentNode.removeChild(this.flashEl);
    this.renderer = null; this.scene = null; this.camera = null;
    this.kings = []; this.mirrorShards = []; this.mirrorCracks = []; this.bolts = []; this.shockwaves = [];
    this.ready = false;
  }
}

function easeBackLocal(p) { const c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }
function eu(p) { return 1 - Math.pow(1 - p, 3); }

const storyCinematic3D = new StoryCinematic3D();
