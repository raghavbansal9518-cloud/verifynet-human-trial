/**
 * VERIFYNET — RETRO CYBER GRID & PARTICLE ENGINE (js/background.js)
 * Lightweight HTML5 Canvas rendering subtle pixel matrix nodes, coordinate markers,
 * and ambient atmospheric luminescence.
 */

class RetroBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.numParticles = 45;
    this.mouseX = -9999;
    this.mouseY = -9999;
    this.animationFrameId = null;
    this.isRunning = true;
    this.gridOffset = 0;

    this.glyphs = ['01', 'FF', '?', '+', '::', '><', '0x', 'SYS'];

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();

    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });

    // Check if user disabled animations
    const animSetting = localStorage.getItem('verifynet_anim');
    if (animSetting === 'disabled') {
      this.stop();
      this.render(); // Draw single static frame
    } else {
      this.start();
    }
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    if (!this.isRunning) {
      this.render();
    }
  }

  createParticles() {
    this.particles = [];
    const colors = [
      'rgba(216, 243, 106, 0.45)', // lime
      'rgba(167, 139, 250, 0.45)', // purple
      'rgba(98, 217, 232, 0.45)',  // cyan
      'rgba(242, 241, 233, 0.25)'  // soft white
    ];

    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() > 0.8 ? 3 : 2,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -0.15 - Math.random() * 0.35,
        color: colors[Math.floor(Math.random() * colors.length)],
        isGlyph: Math.random() > 0.75,
        glyph: this.glyphs[Math.floor(Math.random() * this.glyphs.length)],
        opacity: 0.15 + Math.random() * 0.5,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseVal: Math.random() * Math.PI
      });
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  update() {
    this.gridOffset = (this.gridOffset + 0.15) % 40;

    for (let p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulseVal += p.pulseSpeed;

      // Wrap edges
      if (p.y < -20) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      if (p.x < -20) p.x = this.width + 10;
      if (p.x > this.width + 20) p.x = -10;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Subtle Digital Grid
    const gridSize = 40;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(146, 148, 161, 0.04)';

    ctx.beginPath();
    // Vertical lines
    for (let x = 0; x <= this.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    // Horizontal lines with slow upward drift
    const startY = this.gridOffset;
    for (let y = startY; y <= this.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();

    // 2. Ambient Glow Spots (Dark atmospheric illumination)
    const limeGlow = ctx.createRadialGradient(
      this.width * 0.25, this.height * 0.35, 10,
      this.width * 0.25, this.height * 0.35, this.width * 0.45
    );
    limeGlow.addColorStop(0, 'rgba(216, 243, 106, 0.035)');
    limeGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = limeGlow;
    ctx.fillRect(0, 0, this.width, this.height);

    const purpleGlow = ctx.createRadialGradient(
      this.width * 0.75, this.height * 0.6, 10,
      this.width * 0.75, this.height * 0.6, this.width * 0.45
    );
    purpleGlow.addColorStop(0, 'rgba(167, 139, 250, 0.04)');
    purpleGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = purpleGlow;
    ctx.fillRect(0, 0, this.width, this.height);

    // 3. Render Particles & Floating Glyphs
    ctx.font = '9px "JetBrains Mono", monospace';
    for (let p of this.particles) {
      const alpha = p.opacity * (0.6 + Math.sin(p.pulseVal) * 0.4);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0.1, alpha);

      if (p.isGlyph) {
        ctx.fillText(p.glyph, p.x, p.y);
      } else {
        // Pixel square
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }
    }
    ctx.globalAlpha = 1.0;
  }
}
