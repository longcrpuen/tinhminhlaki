/**
 * Lightweight Pure Canvas Confetti for MindSparks
 * Zero-dependency, 60fps celebratory visual effects using HTML5 Canvas.
 * No DOM element overhead, supports onComplete callback.
 */
const Confetti = {
  canvas: null,
  ctx: null,
  particles: [],
  animationFrame: null,

  init() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'confetti-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.inset = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '9999';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d', { alpha: true });
    }
  },

  fire({ count = 80, duration = 3000, onComplete = null } = {}) {
    this.init();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = [
      '#a78bfa', '#c084fc', '#e879a8', '#60a5fa', 
      '#34d399', '#fbbf24', '#f87171', '#38bdf8'
    ];
    this.particles = [];

    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: w * (0.2 + Math.random() * 0.6),
        y: h * (0.35 + Math.random() * 0.15),
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.82) * 17,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        wobble: Math.random() * 10,
        opacity: 1
      });
    }

    const startTime = Date.now();
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.particles = [];
      if (typeof onComplete === 'function') {
        onComplete();
      }
    };

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration || this.particles.length === 0) {
        finish();
        return;
      }

      this.ctx.clearRect(0, 0, w, h);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.36; // gravity
        p.vx *= 0.982; // air friction
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - (elapsed / duration));

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
        this.ctx.restore();

        if (p.y > h + 50) {
          this.particles.splice(i, 1);
        }
      }

      this.animationFrame = requestAnimationFrame(render);
    };

    this.animationFrame = requestAnimationFrame(render);
  },

  clear() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.particles = [];
  }
};
