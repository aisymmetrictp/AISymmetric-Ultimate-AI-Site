/* ============================================
   Neural Network Background Animation
   Flowing dots, connecting lines, glowing nodes
   ============================================ */

(function () {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, nodes, mouse, dpr;
  const CONFIG = {
    nodeCount: 80,
    maxDistance: 180,
    nodeSpeed: 0.3,
    nodeMinRadius: 1.5,
    nodeMaxRadius: 3,
    lineOpacity: 0.08,
    nodeOpacity: 0.25,
    pulseInterval: 4000,
    pulseSpeed: 2,
    mouseRadius: 200,
    mouseForce: 0.02,
    glowColor: '59, 130, 246',
    cyanColor: '34, 211, 238',
  };

  // Reduce nodes on mobile
  function getNodeCount() {
    if (window.innerWidth < 768) return 40;
    if (window.innerWidth < 1024) return 60;
    return CONFIG.nodeCount;
  }

  mouse = { x: -1000, y: -1000 };

  class Node {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * CONFIG.nodeSpeed;
      this.vy = (Math.random() - 0.5) * CONFIG.nodeSpeed;
      this.radius = CONFIG.nodeMinRadius + Math.random() * (CONFIG.nodeMaxRadius - CONFIG.nodeMinRadius);
      this.baseRadius = this.radius;
      this.opacity = 0.1 + Math.random() * CONFIG.nodeOpacity;
      this.baseOpacity = this.opacity;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.isGlowing = false;
      this.glowIntensity = 0;
      this.color = Math.random() > 0.7 ? CONFIG.cyanColor : CONFIG.glowColor;
    }

    update() {
      // Gentle drift
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Keep in bounds
      this.x = Math.max(0, Math.min(width, this.x));
      this.y = Math.max(0, Math.min(height, this.y));

      // Mouse reactivity
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.mouseRadius) {
        const force = (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseForce;
        this.vx -= dx * force * 0.5;
        this.vy -= dy * force * 0.5;
        this.glowIntensity = Math.min(1, this.glowIntensity + 0.05);
      } else {
        this.glowIntensity = Math.max(0, this.glowIntensity - 0.02);
      }

      // Gentle pulse
      this.pulsePhase += 0.01;
      const pulse = Math.sin(this.pulsePhase) * 0.3;
      this.radius = this.baseRadius + pulse;
      this.opacity = this.baseOpacity + pulse * 0.1 + this.glowIntensity * 0.4;

      // Damping
      this.vx *= 0.999;
      this.vy *= 0.999;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * (1 + this.glowIntensity * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();

      // Glow effect
      if (this.glowIntensity > 0.1) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.glowIntensity * 0.1})`;
        ctx.fill();
      }
    }
  }

  // Signal pulses traveling along connections
  class Pulse {
    constructor(fromNode, toNode) {
      this.from = fromNode;
      this.to = toNode;
      this.progress = 0;
      this.speed = 0.008 + Math.random() * 0.008;
      this.alive = true;
      this.color = Math.random() > 0.5 ? CONFIG.glowColor : CONFIG.cyanColor;
    }

    update() {
      this.progress += this.speed;
      if (this.progress >= 1) this.alive = false;
    }

    draw() {
      const x = this.from.x + (this.to.x - this.from.x) * this.progress;
      const y = this.from.y + (this.to.y - this.from.y) * this.progress;
      const alpha = Math.sin(this.progress * Math.PI) * 0.8;

      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
      ctx.fill();

      // Trailing glow
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${alpha * 0.2})`;
      ctx.fill();
    }
  }

  let pulses = [];
  let lastPulseTime = 0;

  function init() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const count = getNodeCount();
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push(new Node());
    }
    pulses = [];
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.maxDistance) {
          const alpha = (1 - dist / CONFIG.maxDistance) * CONFIG.lineOpacity;
          const mouseInfluence = Math.max(nodes[i].glowIntensity, nodes[j].glowIntensity);
          const finalAlpha = alpha + mouseInfluence * 0.15;

          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${CONFIG.glowColor}, ${finalAlpha})`;
          ctx.lineWidth = 0.5 + mouseInfluence * 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function spawnPulse() {
    if (nodes.length < 2) return;
    const fromIdx = Math.floor(Math.random() * nodes.length);
    let toIdx;
    let closestDist = Infinity;

    // Find a nearby node to send pulse to
    for (let i = 0; i < nodes.length; i++) {
      if (i === fromIdx) continue;
      const dx = nodes[fromIdx].x - nodes[i].x;
      const dy = nodes[fromIdx].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.maxDistance && dist < closestDist) {
        closestDist = dist;
        toIdx = i;
      }
    }

    if (toIdx !== undefined) {
      pulses.push(new Pulse(nodes[fromIdx], nodes[toIdx]));
    }
  }

  function animate(timestamp) {
    ctx.clearRect(0, 0, width, height);

    // Update & draw nodes
    for (const node of nodes) {
      node.update();
    }

    drawConnections();

    for (const node of nodes) {
      node.draw();
    }

    // Spawn pulses periodically
    if (timestamp - lastPulseTime > CONFIG.pulseInterval) {
      spawnPulse();
      spawnPulse();
      lastPulseTime = timestamp;
    }

    // Update & draw pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      pulses[i].update();
      if (pulses[i].alive) {
        pulses[i].draw();
      } else {
        pulses.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  // Mouse tracking
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(init, 200);
  });

  // Start
  init();
  requestAnimationFrame(animate);
})();
