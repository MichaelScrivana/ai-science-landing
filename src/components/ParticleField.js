export class ParticleField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.molecules = [];
    this.connections = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.mode = 'hero';
    this.target = null; // { rect: {x,y,w,h}, center: {x,y} }
    this.titleRect = null;
    this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.palette = ['#00BCFF', '#89D329', '#FF3162'];
    this.paletteWeights = [0.60, 0.25, 0.15];
    this.init();
  }

  init() {
    this.resize();
    this.createMolecules();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.updateTargetFromDOM();
  }

  createMolecules() {
    const moleculeCount = 200;
    this.molecules = [];
    for (let i = 0; i < moleculeCount; i++) {
      let sx = Math.random() * this.canvas.width;
      let sy = Math.random() * this.canvas.height;
      const pad = 4;
      let attempts = 0;
      while (attempts < 80) {
        const avoidContent = this.target?.rect ? this.pointInPadRect(sx, sy, this.target.rect, pad) : false;
        const avoidTitle = this.titleRect ? this.pointInPadRect(sx, sy, this.titleRect, 0) : false;
        if (!avoidContent && !avoidTitle) break;
        sx = Math.random() * this.canvas.width;
        sy = Math.random() * this.canvas.height;
        attempts++;
      }
      this.molecules.push({
        x: Math.max(0, Math.min(this.canvas.width, sx)),
        y: Math.max(0, Math.min(this.canvas.height, sy)),
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 4.2 + 1.0,
        bonds: Math.floor(Math.random() * 3) + 1,
        pulsePhase: Math.random() * Math.PI * 4,
        glowing: false,
        baseColor: this.pickWeightedColor(),
        dotRadius: Math.random() * 1.5 + 0.8
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createMolecules();
    });
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
        this.mouse.x = null;
        this.mouse.y = null;
      }
    });
    window.addEventListener('pf:setMode', (e) => {
      const { mode } = e.detail || {};
      if (mode) this.mode = mode;
    });
    window.addEventListener('pf:setTarget', (e) => {
      const { rect } = e.detail || {};
      if (rect) {
        this.target = {
          rect,
          center: { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 }
        };
      }
    });
  }

  updateTargetFromDOM() {
    const contentEl = document.querySelector('.hero-content');
    const titleEl = document.querySelector('.hero-title');
    if (contentEl) {
      const r = contentEl.getBoundingClientRect();
      this.target = {
        rect: { x: r.left, y: r.top, w: r.width, h: r.height },
        center: { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      };
    }
    if (titleEl) {
      const tr = titleEl.getBoundingClientRect();
      this.titleRect = { x: tr.left, y: tr.top, w: tr.width, h: tr.height };
    }
  }

  drawMolecule(molecule) {
    const { x, y, radius, glowing, pulsePhase, baseColor, dotRadius } = molecule;
    const pulse = Math.sin(Date.now() * 0.003 + pulsePhase) * 0.3 + 1;
    const currentRadius = radius * pulse;
    if (glowing) {
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, currentRadius * 4);
      gradient.addColorStop(0, this.hexToRGBA(baseColor, 0.25));
      gradient.addColorStop(1, this.hexToRGBA(baseColor, 0.0));
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, currentRadius * 4, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.fillStyle = this.hexToRGBA(baseColor, 1);
    this.ctx.beginPath();
    this.ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(x - currentRadius * 0.3, y - currentRadius * 0.3, currentRadius * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
    const bondAngle = (Math.PI * 2) / molecule.bonds;
    for (let i = 0; i < molecule.bonds; i++) {
      const angle = bondAngle * i;
      const bx = x + Math.cos(angle) * (currentRadius + 3);
      const by = y + Math.sin(angle) * (currentRadius + 3);
      this.ctx.fillStyle = glowing ? this.hexToRGBA(baseColor, 1) : this.hexToRGBA(baseColor, 0.5);
      this.ctx.beginPath();
      this.ctx.arc(bx, by, dotRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  hexToRGBA(hex, alpha) {
    let h = hex.replace('#', '');
    if (h.length === 3) {
      h = h.split('').map(ch => ch + ch).join('');
    }
    const r = parseInt(h.substring(0,2), 16);
    const g = parseInt(h.substring(2,4), 16);
    const b = parseInt(h.substring(4,6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  pickWeightedColor() {
    const weights = this.paletteWeights || [];
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    const rnd = Math.random() * total;
    let acc = 0;
    for (let i = 0; i < this.palette.length; i++) {
      acc += (weights[i] ?? 1);
      if (rnd <= acc) return this.palette[i];
    }
    return this.palette[0];
  }

  drawConnection(mol1, mol2, strength) {
    this.ctx.save();
    this.ctx.strokeStyle = `rgba(45, 156, 219, ${strength})`;
    this.ctx.lineWidth = strength * 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.lineDashOffset = Date.now() * 0.01;
    this.ctx.beginPath();
    this.ctx.moveTo(mol1.x, mol1.y);
    this.ctx.lineTo(mol2.x, mol2.y);
    this.ctx.stroke();
    this.ctx.restore();
  }

  updateMolecules() {
    this.molecules.forEach(molecule => {
      if (!this.prefersReduced) {
        if (this.mode === 'hero') {
          this.applyHeroForces(molecule);
        } else if (this.mode === 'surround') {
          this.applySurroundForces(molecule);
        }
      }
      molecule.x += molecule.vx;
      molecule.y += molecule.vy;
      molecule.vx *= 0.975;
      molecule.vy *= 0.975;
      const speed = Math.hypot(molecule.vx, molecule.vy);
      const maxSpeed = 2.5;
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        molecule.vx *= scale;
        molecule.vy *= scale;
      }
      if (molecule.x < molecule.radius || molecule.x > this.canvas.width - molecule.radius) {
        molecule.vx *= -0.8;
        molecule.x = Math.max(molecule.radius, Math.min(this.canvas.width - molecule.radius, molecule.x));
      }
      if (molecule.y < molecule.radius || molecule.y > this.canvas.height - molecule.radius) {
        molecule.vy *= -0.8;
        molecule.y = Math.max(molecule.radius, Math.min(this.canvas.height - molecule.radius, molecule.y));
      }
      molecule.vx += (Math.random() - 0.5) * 0.02;
      molecule.vy += (Math.random() - 0.5) * 0.02;
    });
  }

  applyHeroForces(molecule) {
    if (this.mouse.x !== null && this.mouse.y !== null) {
      const dx = this.mouse.x - molecule.x;
      const dy = this.mouse.y - molecule.y;
      const dist = Math.hypot(dx, dy);
      if (dist < this.mouse.radius) {
        const force = (this.mouse.radius - dist) / this.mouse.radius;
        molecule.vx += dx * force * 0.02;
        molecule.vy += dy * force * 0.02;
        molecule.glowing = true;
      } else {
        molecule.glowing = false;
      }
    } else {
      molecule.glowing = false;
    }
    if (this.target?.rect) {
      const pad = 8;
      const rx = this.target.rect.x - pad;
      const ry = this.target.rect.y - pad;
      const rw = this.target.rect.w + pad * 2;
      const rh = this.target.rect.h + pad * 2;
      const inside = molecule.x > rx && molecule.x < rx + rw && molecule.y > ry && molecule.y < ry + rh;
      if (inside) {
        const cx = Math.max(rx, Math.min(molecule.x, rx + rw));
        const cy = Math.max(ry, Math.min(molecule.y, ry + rh));
        const dx = molecule.x - cx;
        const dy = molecule.y - cy;
        const len = Math.max(1, Math.hypot(dx, dy));
        molecule.vx += (dx / len) * 0.08;
        molecule.vy += (dy / len) * 0.08;
      }
    }
  }

  applySurroundForces(molecule) {
    if (this.target?.center) {
      const dx = this.target.center.x - molecule.x;
      const dy = this.target.center.y - molecule.y;
      molecule.vx += dx * 0.02;
      molecule.vy += dy * 0.02;
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        molecule.vx *= 0.85;
        molecule.vy *= 0.85;
        molecule.glowing = true;
      } else {
        molecule.glowing = false;
      }
    }
  }

  findConnections() {
    this.connections = [];
    const maxDistance = 125; // Increased from 100 for longer connections
    for (let i = 0; i < this.molecules.length; i++) {
      for (let j = i + 1; j < this.molecules.length; j++) {
        const mol1 = this.molecules[i];
        const mol2 = this.molecules[j];
        const dx = mol1.x - mol2.x;
        const dy = mol1.y - mol2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < maxDistance) {
          const strength = 1 - (distance / maxDistance);
          if ((mol1.glowing && mol2.glowing) || Math.random() < 0.1) {
            this.connections.push({ mol1, mol2, strength: strength * 0.9 });
          }
        }
      }
    }
  }

  pointInPadRect(x, y, rect, pad = 0) {
    const rx = rect.x - pad;
    const ry = rect.y - pad;
    const rw = rect.w + pad * 2;
    const rh = rect.h + pad * 2;
    return x > rx && x < rx + rw && y > ry && y < ry + rh;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updateMolecules();
    this.findConnections();
    this.connections.forEach(({ mol1, mol2, strength }) => {
      this.drawConnection(mol1, mol2, strength);
    });
    this.molecules.forEach(molecule => {
      this.drawMolecule(molecule);
    });
    requestAnimationFrame(() => this.animate());
  }
}