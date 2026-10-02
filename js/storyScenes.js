class StoryScenes {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.animFrame = null;
    this.embers = [];
    this.fogLayers = [];
  }
  init(containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'width:100%;height:100%;display:block';
    c.innerHTML = '';
    c.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.embers = [];
    this.fogLayers = [];
    for (let i = 0; i < 40; i++) this.embers.push(this.newEmber());
    for (let i = 0; i < 5; i++) this.fogLayers.push({ x: Math.random() * 2000 - 500, y: Math.random() * 800, w: 300 + Math.random() * 400, speed: 0.2 + Math.random() * 0.3, alpha: 0.02 + Math.random() * 0.04 });
  }
  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const p = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    this.w = p.clientWidth;
    this.h = p.clientHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.scale(dpr, dpr);
  }
  stop() { this.running = false; if (this.animFrame) cancelAnimationFrame(this.animFrame); }
  newEmber() {
    return { x: Math.random() * 2000, y: 800 + Math.random() * 200, vx: (Math.random() - 0.5) * 0.5, vy: -(0.3 + Math.random() * 0.8), size: 1 + Math.random() * 2, alpha: 0.3 + Math.random() * 0.5, life: Math.random() };
  }
  updateEmbers(t) {
    this.embers.forEach(e => {
      e.x += e.vx + Math.sin(t * 0.001 + e.life * 10) * 0.3;
      e.y += e.vy;
      e.alpha = 0.3 + Math.sin(t * 0.003 + e.life * 5) * 0.3;
      if (e.y < -10) { e.y = 800 + Math.random() * 100; e.x = Math.random() * 2000; }
    });
  }
  drawEmbers(ctx, alpha) {
    this.embers.forEach(e => {
      ctx.fillStyle = `rgba(255,${150 + Math.floor(e.life * 100)},30,${e.alpha * (alpha || 1)})`;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2); ctx.fill();
    });
  }
  drawFog(ctx, alpha) {
    this.fogLayers.forEach(f => {
      f.x += f.speed;
      if (f.x > 2000) f.x = -f.w;
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.w / 2);
      g.addColorStop(0, `rgba(180,170,150,${f.alpha * (alpha || 1)})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(f.x - f.w / 2, f.y - f.w / 2, f.w, f.w);
    });
  }
  drawRain(ctx, t, intensity) {
    ctx.strokeStyle = `rgba(150,170,200,${0.15 * intensity})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 80 * intensity; i++) {
      const x = (i * 37 + t * 0.5) % this.w;
      const y = (i * 53 + t * 2) % this.h;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 12); ctx.stroke();
    }
  }
  drawLightning(ctx, flash) {
    if (flash > 0.95) {
      ctx.fillStyle = `rgba(200,210,255,${(flash - 0.95) * 10})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }
  }
  drawStars(ctx, t, count) {
    for (let i = 0; i < (count || 100); i++) {
      const x = (Math.sin(i * 127.1) * 0.5 + 0.5) * this.w;
      const y = (Math.cos(i * 311.7) * 0.5 + 0.5) * this.h * 0.6;
      const twinkle = Math.sin(t * 0.002 + i * 3) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(255,255,240,${twinkle * 0.7})`;
      ctx.beginPath(); ctx.arc(x, y, 0.5 + twinkle * 0.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  drawMountains(ctx, yBase, peaks, color, parallax) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, this.h);
    peaks.forEach((p, i) => {
      const x = (i / (peaks.length - 1)) * (this.w + 200) - 100;
      ctx.lineTo(x + (parallax || 0), this.h - p * yBase);
    });
    ctx.lineTo(this.w, this.h);
    ctx.closePath();
    ctx.fill();
  }
  drawCastle(ctx, x, y, scale, color) {
    ctx.fillStyle = color;
    const s = scale;
    ctx.fillRect(x - 15 * s, y - 40 * s, 30 * s, 40 * s);
    ctx.fillRect(x - 20 * s, y - 50 * s, 8 * s, 50 * s);
    ctx.fillRect(x + 12 * s, y - 50 * s, 8 * s, 50 * s);
    ctx.fillRect(x - 8 * s, y - 35 * s, 16 * s, 8 * s);
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x - 15 * s + i * 12 * s, y - 55 * s, 5 * s, 5 * s);
    }
    ctx.fillStyle = `rgba(255,200,50,${0.3 + Math.sin(Date.now() * 0.003) * 0.1})`;
    ctx.fillRect(x - 3 * s, y - 25 * s, 6 * s, 8 * s);
  }
  drawFigure(ctx, x, y, scale, color, cape) {
    const s = scale;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y - 35 * s, 8 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 6 * s, y - 28 * s, 12 * s, 20 * s);
    ctx.fillRect(x - 8 * s, y - 8 * s, 4 * s, 12 * s);
    ctx.fillRect(x + 4 * s, y - 8 * s, 4 * s, 12 * s);
    if (cape) {
      ctx.fillStyle = cape;
      ctx.beginPath();
      ctx.moveTo(x - 6 * s, y - 28 * s);
      ctx.lineTo(x - 14 * s, y);
      ctx.lineTo(x + 14 * s, y);
      ctx.lineTo(x + 6 * s, y - 28 * s);
      ctx.closePath();
      ctx.fill();
    }
  }
  play(sceneName, duration, callback) {
    this.stop();
    this.running = true;
    const fn = this.scenes[sceneName];
    if (!fn) { this.running = false; if (callback) callback(); return; }
    const st = Date.now();
    const loop = () => {
      if (!this.running) return;
      const p = Math.min((Date.now() - st) / duration, 1);
      this.ctx.clearRect(0, 0, this.w, this.h);
      this.updateEmbers(Date.now() - st);
      fn(this, this.ctx, this.w, this.h, p, Date.now() - st);
      if (p < 1) this.animFrame = requestAnimationFrame(loop);
      else { this.running = false; if (callback) callback(); }
    };
    requestAnimationFrame(loop);
  }
  get scenes() { const S = this; return {
    convergence(s, ctx, w, h, p, t) {
      const bg = ctx.createRadialGradient(w/2, h*0.4, 0, w/2, h*0.4, w*0.6);
      bg.addColorStop(0, '#1a1a3e'); bg.addColorStop(1, '#050510');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 120);
      s.drawMountains(ctx, h*0.15, [0.3,0.5,0.7,0.6,0.4,0.65,0.55,0.35,0.45,0.6,0.5,0.3], '#0a0a18', Math.sin(t*0.0002)*10);
      s.drawMountains(ctx, h*0.1, [0.2,0.35,0.45,0.4,0.3,0.5,0.4,0.25,0.35,0.45,0.35,0.2], '#080815', Math.sin(t*0.0003)*15);
      const pulse = Math.sin(t*0.002)*0.15+0.85;
      const rg = ctx.createRadialGradient(w/2, h*0.35, 0, w/2, h*0.35, 150*pulse);
      rg.addColorStop(0, 'rgba(255,255,255,0.9)'); rg.addColorStop(0.2, 'rgba(240,208,96,0.6)');
      rg.addColorStop(0.5, 'rgba(212,168,71,0.2)'); rg.addColorStop(1, 'transparent');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(w/2, h*0.35, 150*pulse, 0, Math.PI*2); ctx.fill();
      for (let i = 0; i < 8; i++) {
        const a = (i/8)*Math.PI*2 + t*0.0008;
        const d = 80 + Math.sin(t*0.001+i)*15;
        const x = w/2 + Math.cos(a)*d, y = h*0.35 + Math.sin(a)*d*0.6;
        const gc = ctx.createRadialGradient(x, y, 0, x, y, 20);
        const cols = ['#2ecc71','#3498db','#9b59b6','#e74c3c','#f1c40f','#95a5a6','#ecf0f1','#e67e22'];
        gc.addColorStop(0, cols[i]); gc.addColorStop(1, 'transparent');
        ctx.fillStyle = gc; ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI*2); ctx.fill();
      }
      s.drawEmbers(ctx, 0.6);
      s.drawFog(ctx, 0.5);
    },
    peace(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#050520'); bg.addColorStop(0.5, '#0a0a2e'); bg.addColorStop(1, '#0d1510');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 80);
      for (let i = 0; i < 6; i++) {
        const y = h*0.15 + i*25 + Math.sin(t*0.0008+i*0.7)*20;
        const g = ctx.createLinearGradient(0, y-15, 0, y+15);
        const cols = ['#1a5a3a','#1a3a5a','#3a1a5a','#5a3a1a','#1a5a5a','#3a1a3a'];
        g.addColorStop(0, 'transparent'); g.addColorStop(0.5, cols[i]); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(0, y-15, w, 30);
      }
      s.drawMountains(ctx, h*0.2, [0.4,0.6,0.5,0.7,0.55,0.65,0.5,0.4], '#0a1a10', Math.sin(t*0.0001)*5);
      s.drawMountains(ctx, h*0.12, [0.25,0.35,0.4,0.35,0.3,0.45,0.35,0.25], '#081508', 0);
      s.drawCastle(ctx, w*0.3, h*0.55, 1.2, '#0d1a0d');
      s.drawCastle(ctx, w*0.7, h*0.58, 0.8, '#0a150a');
      s.drawFog(ctx, 0.6);
    },
    mirror(s, ctx, w, h, p, t) {
      const bg = ctx.createRadialGradient(w/2, h*0.4, 0, w/2, h*0.4, w*0.5);
      bg.addColorStop(0, '#151530'); bg.addColorStop(1, '#050510');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 60);
      s.drawMountains(ctx, h*0.15, [0.3,0.5,0.65,0.5,0.4,0.55,0.45,0.3], '#0a0a18', 0);
      const mx = w/2, my = h*0.38;
      ctx.save(); ctx.translate(mx, my); ctx.rotate(Math.sin(t*0.0008)*0.03);
      ctx.strokeStyle = '#d4a847'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(0, 0, 60, 85, 0, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.ellipse(0, 0, 66, 91, 0, 0, Math.PI*2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = (i/12)*Math.PI*2;
        ctx.fillStyle = '#d4a847';
        ctx.beginPath(); ctx.arc(Math.cos(a)*63, Math.sin(a)*88, 3, 0, Math.PI*2); ctx.fill();
      }
      const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, 55);
      fg.addColorStop(0, 'rgba(255,255,255,0.85)'); fg.addColorStop(0.3, 'rgba(240,208,96,0.4)');
      fg.addColorStop(0.7, 'rgba(100,130,200,0.15)'); fg.addColorStop(1, 'rgba(50,50,100,0.05)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(0, 0, 56, 80, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 140);
      glow.addColorStop(0, 'rgba(240,208,96,0.25)'); glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow; ctx.fillRect(mx-140, my-140, 280, 280);
      s.drawEmbers(ctx, 0.4);
    },
    warlord(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#150808'); bg.addColorStop(0.5, '#0a0505'); bg.addColorStop(1, '#050505');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 30);
      s.drawMountains(ctx, h*0.15, [0.3,0.5,0.6,0.45,0.55,0.5,0.4,0.35], '#0a0505', 0);
      s.drawMountains(ctx, h*0.1, [0.2,0.3,0.35,0.3,0.25,0.35,0.3,0.2], '#080303', 0);
      s.drawCastle(ctx, w*0.7, h*0.5, 2, '#0a0505');
      s.drawCastle(ctx, w*0.15, h*0.55, 1.5, '#080404');
      const figureX = w*0.4, figureY = h*0.6;
      s.drawFigure(ctx, figureX, figureY, 2.5, '#1a0808', '#3a0808');
      const fg = ctx.createRadialGradient(figureX, figureY-40, 0, figureX, figureY-40, 100);
      fg.addColorStop(0, 'rgba(139,32,32,0.3)'); fg.addColorStop(1, 'transparent');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(figureX, figureY-40, 100, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(139,32,32,0.08)'; ctx.fillRect(0, h*0.7, w, h*0.3);
      for (let i = 0; i < 30; i++) {
        const px = w*0.2+Math.random()*w*0.6, py = h*0.7+Math.random()*h*0.25;
        ctx.fillStyle = `rgba(139,32,32,${0.05+Math.random()*0.1})`;
        ctx.fillRect(px, py, 1+Math.random()*3, 1+Math.random()*5);
      }
      s.drawEmbers(ctx, 0.8);
      s.drawFog(ctx, 0.3);
    },
    shatter(s, ctx, w, h, p, t) {
      const bg = ctx.createRadialGradient(w/2, h*0.4, 0, w/2, h*0.4, w*0.5);
      bg.addColorStop(0, '#1a1a3e'); bg.addColorStop(1, '#050510');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 50);
      s.drawMountains(ctx, h*0.15, [0.3,0.5,0.6,0.5,0.4,0.55,0.45,0.3], '#0a0a18', 0);
      const mx = w/2, my = h*0.38;
      const shards = 16;
      for (let i = 0; i < shards; i++) {
        const a = (i/shards)*Math.PI*2;
        const dist = p * (100 + i*12);
        const sx = mx + Math.cos(a)*dist;
        const sy = my + Math.sin(a)*dist*0.7;
        const rot = p * (i * 0.7);
        const fade = 1 - p*0.6;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(rot); ctx.globalAlpha = fade;
        const cols = ['#f0d060','#ffffff','#6a9fd8','#d4a847','#a0c0e0'];
        ctx.fillStyle = cols[i%5];
        ctx.beginPath();
        const sz = 8 + Math.random()*6;
        ctx.moveTo(0, -sz); ctx.lineTo(sz*0.6, 0); ctx.lineTo(0, sz); ctx.lineTo(-sz*0.6, 0);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      const flash = ctx.createRadialGradient(mx, my, 0, mx, my, 80*(1-p));
      flash.addColorStop(0, 'rgba(255,255,255,0.9)'); flash.addColorStop(1, 'transparent');
      ctx.fillStyle = flash; ctx.beginPath(); ctx.arc(mx, my, 80*(1-p), 0, Math.PI*2); ctx.fill();
      s.drawEmbers(ctx, 0.7);
    },
    deception(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0a0000'); bg.addColorStop(0.4, '#150000'); bg.addColorStop(1, '#050000');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      const riftX = w/2, riftY = h*0.35;
      const riftPulse = Math.sin(t*0.003)*0.3+0.7;
      for (let i = 5; i >= 0; i--) {
        const rg = ctx.createRadialGradient(riftX, riftY, 0, riftX, riftY, (60+i*25)*riftPulse);
        const alphas = [0.6, 0.3, 0.2, 0.15, 0.1, 0.05];
        rg.addColorStop(0, `rgba(100,0,0,${alphas[i]})`); rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(riftX, riftY, (60+i*25)*riftPulse, 0, Math.PI*2); ctx.fill();
      }
      for (let i = 0; i < 7; i++) {
        const a = (i/7)*Math.PI*2 + t*0.001;
        const d = 120 + Math.sin(t*0.002+i*2)*20;
        const x = riftX + Math.cos(a)*d;
        const y = riftY + Math.sin(a)*d*0.5;
        const eg = ctx.createRadialGradient(x, y, 0, x, y, 25);
        const ecols = ['#ff0040','#ff4400','#cc0000','#ff2200','#990000','#ff6600','#cc2200'];
        eg.addColorStop(0, ecols[i]); eg.addColorStop(1, 'transparent');
        ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI*2); ctx.fill();
        const sx = riftX + Math.cos(a)*30;
        const sy = riftY + Math.sin(a)*20;
        ctx.strokeStyle = `rgba(150,0,0,${0.3+Math.sin(t*0.005+i)*0.2})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x, y); ctx.stroke();
      }
      for (let i = 0; i < 5; i++) {
        s.drawCastle(ctx, w*(0.1+i*0.2), h*(0.7+Math.sin(i*2)*0.05), 0.7+i*0.2, '#080000');
      }
      s.drawRain(ctx, t, 0.6);
      s.drawMountains(ctx, h*0.15, [0.4,0.55,0.5,0.6,0.5,0.55,0.45,0.5], '#080000', 0);
      const flash = Math.sin(t*0.004);
      if (flash > 0.8) s.drawLightning(ctx, 0.9 + flash*0.1);
    },
    awakening(s, ctx, w, h, p, t) {
      const bg = ctx.createRadialGradient(w/2, h*0.5, 0, w/2, h*0.5, w*0.7);
      bg.addColorStop(0, '#1a1a3e'); bg.addColorStop(1, '#050510');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 100);
      s.drawMountains(ctx, h*0.18, [0.3,0.5,0.6,0.55,0.45,0.6,0.5,0.35,0.45,0.55], '#0a0a20', 0);
      s.drawMountains(ctx, h*0.12, [0.2,0.35,0.4,0.35,0.3,0.42,0.35,0.25,0.3,0.4], '#080815', 0);
      for (let i = 0; i < 8; i++) {
        const angle = (i/8)*Math.PI*2 - Math.PI/2;
        const cx = w/2 + Math.cos(angle)*w*0.3;
        const cy = h*0.65 + Math.sin(angle)*h*0.15;
        const cols = ['#2ecc71','#3498db','#9b59b6','#e74c3c','#f1c40f','#95a5a6','#ecf0f1','#e67e22'];
        const pulse = Math.sin(t*0.002+i)*0.3+0.7;
        const bg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40*pulse);
        bg2.addColorStop(0, cols[i]); bg2.addColorStop(0.5, cols[i]+'44'); bg2.addColorStop(1, 'transparent');
        ctx.fillStyle = bg2; ctx.beginPath(); ctx.arc(cx, cy, 40*pulse, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = cols[i];
        ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI*2); ctx.fill();
        s.drawCastle(ctx, cx, cy+5, 0.5, cols[i]+'33');
      }
      const beamGlow = ctx.createRadialGradient(w/2, h*0.5, 0, w/2, h*0.5, 200);
      beamGlow.addColorStop(0, 'rgba(255,255,255,0.15)'); beamGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGlow; ctx.beginPath(); ctx.arc(w/2, h*0.5, 200, 0, Math.PI*2); ctx.fill();
      s.drawEmbers(ctx, 0.5);
      s.drawFog(ctx, 0.4);
    },
    'kingdoms-rise'(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0a0a2e'); bg.addColorStop(0.5, '#101040'); bg.addColorStop(1, '#080820');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 90);
      const cols = ['#2ecc71','#3498db','#9b59b6','#e74c3c','#f1c40f','#95a5a6','#ecf0f1','#e67e22'];
      for (let i = 0; i < 8; i++) {
        const cx = w*(0.1 + (i%4)*0.27);
        const cy = h*(0.35 + Math.floor(i/4)*0.3);
        const rise = Math.min(1, p*2 - i*0.15);
        if (rise <= 0) continue;
        const groundY = cy + 20*(1-rise);
        const g2 = ctx.createRadialGradient(cx, groundY, 0, cx, groundY, 30+rise*20);
        g2.addColorStop(0, cols[i]); g2.addColorStop(1, 'transparent');
        ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(cx, groundY, 30+rise*20, 0, Math.PI*2); ctx.fill();
        s.drawCastle(ctx, cx, groundY, 0.5+rise*0.5, cols[i]+'55');
      }
      s.drawMountains(ctx, h*0.15, [0.3,0.45,0.55,0.5,0.4,0.5,0.45,0.35], '#0a0a20', 0);
      s.drawFog(ctx, 0.5);
      s.drawEmbers(ctx, 0.4);
    },
    'kingdom-altruism'(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#051a0a'); bg.addColorStop(0.5, '#0a2510'); bg.addColorStop(1, '#051a08');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 50);
      s.drawMountains(ctx, h*0.2, [0.3,0.5,0.6,0.5,0.4,0.55,0.5,0.35], '#061208', 0);
      s.drawMountains(ctx, h*0.13, [0.2,0.3,0.4,0.35,0.25,0.35,0.3,0.2], '#040e06', 0);
      for (let i = 0; i < 12; i++) {
        const bx = w*0.1 + (i/11)*w*0.8;
        const by = h*0.65 + Math.sin(i*1.3)*15;
        const sway = Math.sin(t*0.001+i*0.5)*3;
        ctx.strokeStyle = `rgba(46,204,113,${0.15+Math.sin(t*0.002+i)*0.05})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx+sway, by-40, bx+sway*2, by-70); ctx.stroke();
        const bg2 = ctx.createRadialGradient(bx+sway*2, by-70, 0, bx+sway*2, by-70, 8);
        bg2.addColorStop(0, 'rgba(46,204,113,0.4)'); bg2.addColorStop(1, 'transparent');
        ctx.fillStyle = bg2; ctx.beginPath(); ctx.arc(bx+sway*2, by-70, 8, 0, Math.PI*2); ctx.fill();
      }
      s.drawCastle(ctx, w*0.5, h*0.6, 1.5, '#1a4a2a');
      for (let i = 0; i < 20; i++) {
        const fx = Math.random()*w, fy = Math.random()*h*0.5;
        ctx.fillStyle = `rgba(46,204,113,${0.1+Math.random()*0.2})`;
        ctx.beginPath(); ctx.arc(fx, fy, 1+Math.random()*2, 0, Math.PI*2); ctx.fill();
      }
      s.drawFog(ctx, 0.3);
    },
    'kingdom-accord'(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#050a1a'); bg.addColorStop(0.5, '#0a1530'); bg.addColorStop(1, '#050a18');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 60);
      s.drawMountains(ctx, h*0.2, [0.3,0.5,0.55,0.5,0.45,0.5,0.45,0.35], '#0a1025', 0);
      s.drawMountains(ctx, h*0.13, [0.2,0.3,0.35,0.3,0.25,0.35,0.3,0.2], '#080d1a', 0);
      s.drawCastle(ctx, w*0.3, h*0.55, 1.5, '#1a2a5a');
      s.drawCastle(ctx, w*0.7, h*0.55, 1.5, '#1a2a5a');
      ctx.strokeStyle = 'rgba(52,152,219,0.3)'; ctx.lineWidth = 2;
      const bridgeY = h*0.58;
      ctx.beginPath(); ctx.moveTo(w*0.3+20, bridgeY);
      ctx.quadraticCurveTo(w*0.5, bridgeY-20, w*0.7-20, bridgeY); ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const fx = w*0.35 + (i/4)*w*0.3;
        ctx.fillStyle = 'rgba(52,152,219,0.15)';
        ctx.fillRect(fx, bridgeY-2, 3, 15);
      }
      s.drawFog(ctx, 0.4);
      s.drawEmbers(ctx, 0.3);
    },
    'kingdom-rapport'(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0a051a'); bg.addColorStop(0.5, '#150a30'); bg.addColorStop(1, '#0a0518');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 40);
      s.drawMountains(ctx, h*0.2, [0.3,0.5,0.55,0.5,0.45,0.5,0.45,0.35], '#0a0520', 0);
      for (let i = 0; i < 15; i++) {
        const sx = Math.random()*w, sy = Math.random()*h;
        ctx.strokeStyle = `rgba(155,89,182,${0.05+Math.random()*0.08})`;
        ctx.lineWidth = 0.5;
        const tx = sx+(Math.random()-0.5)*100;
        const ty = sy+(Math.random()-0.5)*100;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.fillStyle = `rgba(155,89,182,${0.15+Math.random()*0.15})`;
        ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI*2); ctx.fill();
      }
      s.drawCastle(ctx, w*0.5, h*0.55, 1.2, '#2a1a4a');
      for (let i = 0; i < 8; i++) {
        const ex = w*0.2+Math.random()*w*0.6;
        const ey = h*0.3+Math.random()*h*0.4;
        const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 15);
        eg.addColorStop(0, 'rgba(155,89,182,0.15)'); eg.addColorStop(1, 'transparent');
        ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, ey, 15, 0, Math.PI*2); ctx.fill();
      }
      s.drawFog(ctx, 0.3);
    },
    'kingdom-valor'(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#1a0505'); bg.addColorStop(0.5, '#300a0a'); bg.addColorStop(1, '#1a0505');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 30);
      s.drawMountains(ctx, h*0.2, [0.3,0.5,0.55,0.5,0.45,0.5,0.45,0.35], '#1a0808', 0);
      s.drawCastle(ctx, w*0.5, h*0.5, 2, '#3a1010');
      const arenaW = 180, arenaH = 80;
      ctx.strokeStyle = 'rgba(231,76,60,0.4)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(w/2, h*0.65, arenaW/2, arenaH/2, 0, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = 'rgba(231,76,60,0.05)'; ctx.beginPath(); ctx.ellipse(w/2, h*0.65, arenaW/2, arenaH/2, 0, 0, Math.PI*2); ctx.fill();
      s.drawFigure(ctx, w*0.42, h*0.65, 1.5, '#5a1515', '#8a2020');
      s.drawFigure(ctx, w*0.58, h*0.65, 1.5, '#3a1010', '#6a1515');
      s.drawEmbers(ctx, 0.7);
    },
    'kingdom-clement'(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#151005'); bg.addColorStop(0.5, '#2a1a08'); bg.addColorStop(1, '#151005');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 50);
      s.drawMountains(ctx, h*0.2, [0.3,0.5,0.55,0.5,0.45,0.5,0.45,0.35], '#151008', 0);
      s.drawCastle(ctx, w*0.5, h*0.5, 1.5, '#3a2a10');
      for (let i = 0; i < 25; i++) {
        const fx = w*0.2+Math.random()*w*0.6;
        const fy = h*0.55+Math.random()*h*0.3;
        const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 6);
        fg.addColorStop(0, 'rgba(241,196,15,0.3)'); fg.addColorStop(1, 'transparent');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(fx, fy, 6, 0, Math.PI*2); ctx.fill();
      }
      for (let i = 0; i < 5; i++) {
        const cx = w*0.25+i*w*0.12;
        ctx.fillStyle = 'rgba(241,196,15,0.1)';
        ctx.beginPath(); ctx.arc(cx, h*0.6, 4, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(241,196,15,0.15)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, h*0.6+4); ctx.lineTo(cx, h*0.6+20); ctx.stroke();
      }
      s.drawFog(ctx, 0.3);
    },
    'kingdom-vigilant'(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0a0a0a'); bg.addColorStop(0.5, '#151515'); bg.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 40);
      s.drawMountains(ctx, h*0.2, [0.35,0.55,0.6,0.55,0.5,0.55,0.5,0.4], '#0d0d0d', 0);
      s.drawCastle(ctx, w*0.5, h*0.45, 2.5, '#1a1a1a');
      const scanY = h*0.3 + (Math.sin(t*0.002)*0.5+0.5)*h*0.3;
      const sg = ctx.createLinearGradient(0, scanY-20, 0, scanY+20);
      sg.addColorStop(0, 'transparent'); sg.addColorStop(0.5, 'rgba(149,165,166,0.08)'); sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg; ctx.fillRect(0, scanY-20, w, 40);
      for (let i = 0; i < 4; i++) {
        const ex = w*0.3+i*w*0.15;
        const eg = ctx.createRadialGradient(ex, h*0.5, 0, ex, h*0.5, 10);
        eg.addColorStop(0, 'rgba(149,165,166,0.2)'); eg.addColorStop(1, 'transparent');
        ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, h*0.5, 10, 0, Math.PI*2); ctx.fill();
      }
      s.drawFog(ctx, 0.2);
    },
    'kingdom-scrupulous'(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0f0f0f'); bg.addColorStop(0.5, '#1a1a1a'); bg.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 30);
      s.drawMountains(ctx, h*0.2, [0.3,0.5,0.55,0.5,0.45,0.5,0.45,0.35], '#0c0c0c', 0);
      s.drawCastle(ctx, w*0.5, h*0.5, 1.8, '#1a1a1a');
      for (let r = 0; r < 6; r++) {
        const ry = h*0.55 + r*18;
        ctx.fillStyle = `rgba(236,240,241,${0.03+r*0.01})`;
        ctx.fillRect(w*0.3, ry, w*0.4, 2);
      }
      for (let i = 0; i < 20; i++) {
        const lx = w*0.32+Math.random()*w*0.36;
        const ly = h*0.53+Math.random()*h*0.2;
        ctx.fillStyle = `rgba(236,240,241,${0.05+Math.random()*0.08})`;
        ctx.font = '6px serif';
        ctx.fillText('~', lx, ly);
      }
      s.drawFog(ctx, 0.15);
    },
    'kingdom-spunk'(s, ctx, w, h, p, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#150a00'); bg.addColorStop(0.5, '#2a1500'); bg.addColorStop(1, '#150a00');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      s.drawStars(ctx, t, 40);
      s.drawMountains(ctx, h*0.2, [0.3,0.5,0.55,0.5,0.45,0.5,0.45,0.35], '#150d05', 0);
      s.drawCastle(ctx, w*0.5, h*0.5, 1.5, '#3a2010');
      for (let i = 0; i < 30; i++) {
        const ex = Math.random()*w, ey = Math.random()*h;
        const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 4+Math.random()*8);
        const pulse = Math.sin(t*0.005+i)*0.3+0.7;
        eg.addColorStop(0, `rgba(230,126,34,${0.2*pulse})`); eg.addColorStop(1, 'transparent');
        ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, ey, 4+Math.random()*8, 0, Math.PI*2); ctx.fill();
      }
      for (let i = 0; i < 5; i++) {
        const fx = w*0.2+Math.random()*w*0.6;
        const fy = h*0.6+Math.random()*h*0.2;
        s.drawFigure(ctx, fx, fy, 0.8+Math.random()*0.5, '#3a2010', '#5a3020');
      }
      s.drawEmbers(ctx, 0.9);
    }
  };}
}
const storyScenes = new StoryScenes();
