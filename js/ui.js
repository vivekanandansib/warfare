class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start(color = '#f1c40f', type = 'float') {
    this.stop();
    this.running = true;
    this.particles = [];
    this.color = color;
    this.type = type;
    this.animate();
  }

  stop() {
    this.running = false;
    this.particles = [];
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setColor(color) {
    this.color = color;
  }

  setType(type) {
    this.type = type;
  }

  createParticle() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    switch (this.type) {
      case 'float':
        return {
          x: Math.random() * w,
          y: h + 10,
          size: Math.random() * 3 + 1,
          speedY: -(Math.random() * 1.5 + 0.5),
          speedX: (Math.random() - 0.5) * 0.8,
          opacity: Math.random() * 0.6 + 0.2,
          life: 1,
          decay: Math.random() * 0.003 + 0.001
        };
      case 'embers':
        return {
          x: Math.random() * w,
          y: h + 10,
          size: Math.random() * 2.5 + 0.5,
          speedY: -(Math.random() * 2.5 + 1),
          speedX: (Math.random() - 0.5) * 2,
          opacity: Math.random() * 0.8 + 0.2,
          life: 1,
          decay: Math.random() * 0.005 + 0.002,
          flicker: Math.random() * Math.PI * 2
        };
      case 'stars':
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: 0,
          targetOpacity: Math.random() * 0.8 + 0.2,
          life: 1,
          decay: 0.001,
          twinkle: Math.random() * Math.PI * 2
        };
      case 'mist':
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 80 + 40,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.08 + 0.02,
          life: 1,
          decay: 0.0005
        };
      default:
        return this.createParticle();
    }
  }

  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.particles.length < 50) {
      this.particles.push(this.createParticle());
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();

      if (this.type === 'mist') {
        const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, this.hexToRgba(this.color, p.opacity * p.life));
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      } else if (this.type === 'embers') {
        p.flicker += 0.1;
        const flickerOpacity = p.opacity * p.life * (0.7 + Math.sin(p.flicker) * 0.3);
        this.ctx.fillStyle = this.hexToRgba(this.color, flickerOpacity);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowColor = this.color;
        this.ctx.shadowBlur = 10;
      } else if (this.type === 'stars') {
        p.twinkle += 0.05;
        if (p.opacity < p.targetOpacity && p.life > 0.5) {
          p.opacity += 0.01;
        } else {
          p.opacity = p.targetOpacity * Math.abs(Math.sin(p.twinkle));
        }
        this.ctx.fillStyle = this.hexToRgba(this.color, p.opacity);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = this.hexToRgba(this.color, p.opacity * p.life);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  flash(color, duration = 300) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: ${color}; opacity: 0.3; z-index: 99;
      pointer-events: none; transition: opacity ${duration}ms ease;
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = '0'; });
    setTimeout(() => overlay.remove(), duration);
  }

  screenShake(intensity = 5, duration = 300) {
    const container = document.getElementById('game-container');
    container.classList.add('screen-shake');
    container.style.setProperty('--shake-intensity', `${intensity}px`);
    setTimeout(() => container.classList.remove('screen-shake'), duration);
  }
}

const particles = new ParticleSystem(document.getElementById('particle-canvas'));
