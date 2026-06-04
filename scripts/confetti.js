/**
 * confetti.js
 * Lightweight canvas-based confetti and fireworks.
 * No dependencies, GitHub Pages compatible.
 *
 * Usage:
 *   import { launchConfetti, launchFireworks } from './confetti.js';
 *   launchConfetti();          // ~3 s burst of colourful confetti
 *   launchFireworks();         // firework rockets + star bursts
 */

// ---------------------------------------------------------------------------
// Shared canvas overlay
// ---------------------------------------------------------------------------

let _canvas = null;
let _ctx    = null;
let _rafId  = null;
let _particles = [];

function getCanvas() {
  if (!_canvas) {
    _canvas = document.createElement('canvas');
    _canvas.setAttribute('aria-hidden', 'true');
    _canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');
  }
  _canvas.width  = window.innerWidth;
  _canvas.height = window.innerHeight;
  return { canvas: _canvas, ctx: _ctx };
}

function stopLoop() {
  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  _particles = [];
  if (_ctx) _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
}

// ---------------------------------------------------------------------------
// Particle constructors
// ---------------------------------------------------------------------------

const CONFETTI_COLORS = [
  '#FF6B35', '#FFE44D', '#5BDB6F', '#4DB8FF',
  '#A78BFA', '#FF7EB3', '#00C9B1', '#FF4D6D',
];

function makeConfettiParticle(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 4 + Math.random() * 6;
  return {
    type:  'confetti',
    x, y,
    vx:    Math.cos(angle) * speed,
    vy:    Math.sin(angle) * speed - 8, // strong upward burst
    gravity: 0.25,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.2,
    width:  8 + Math.random() * 10,
    height: 5 + Math.random() * 6,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    life:  1,
    decay: 0.008 + Math.random() * 0.005,
  };
}

function makeRocket(x) {
  const { canvas } = getCanvas();
  return {
    type: 'rocket',
    x,
    y: canvas.height + 10,
    vy: -(12 + Math.random() * 6),
    targetY: canvas.height * (0.15 + Math.random() * 0.25),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    trail: [],
    exploded: false,
    life: 1,
    decay: 0,
  };
}

function makeStar(x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random() * 5;
  return {
    type: 'star',
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    gravity: 0.12,
    size: 3 + Math.random() * 4,
    color,
    life: 1,
    decay: 0.015 + Math.random() * 0.01,
  };
}

// ---------------------------------------------------------------------------
// Update + draw
// ---------------------------------------------------------------------------

function updateParticle(p) {
  if (p.type === 'rocket') {
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 10) p.trail.shift();
    p.y += p.vy;
    if (p.y <= p.targetY && !p.exploded) {
      p.exploded = true;
      p.life     = 0; // mark for removal — explosion spawns stars
      return 'explode';
    }
    return 'ok';
  }

  if (p.type === 'confetti' || p.type === 'star') {
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.99;
    if (p.rotation !== undefined) p.rotation += p.rotSpeed;
    p.life -= p.decay;
    return p.life > 0 ? 'ok' : 'dead';
  }
  return 'dead';
}

function drawParticle(ctx, p) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, p.life);

  if (p.type === 'rocket') {
    // Draw trail
    p.trail.forEach((pt, i) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = (i / p.trail.length) * 0.5 * Math.max(0, p.life);
      ctx.fill();
    });
    // Draw head
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  if (p.type === 'confetti') {
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
  }

  if (p.type === 'star') {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Animation loop
// ---------------------------------------------------------------------------

function loop() {
  const { canvas, ctx } = getCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const next = [];
  for (const p of _particles) {
    const result = updateParticle(p);
    if (result === 'explode') {
      // Spawn star burst at explosion site
      const count = 32 + Math.floor(Math.random() * 24);
      for (let i = 0; i < count; i++) {
        next.push(makeStar(p.x, p.y, p.color));
      }
      // Also a few confetti from the burst
      for (let i = 0; i < 12; i++) {
        const cp = makeConfettiParticle(p.x, p.y);
        cp.vy *= 0.4; // less aggressive
        next.push(cp);
      }
    } else if (result === 'ok') {
      drawParticle(ctx, p);
      next.push(p);
    }
    // 'dead' — discard
  }
  _particles = next;

  if (_particles.length > 0) {
    _rafId = requestAnimationFrame(loop);
  } else {
    stopLoop();
  }
}

function ensureLoop() {
  if (!_rafId) {
    _rafId = requestAnimationFrame(loop);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Burst of confetti from the top of the screen.
 * Lasts ~3 seconds, then cleans itself up.
 * @param {number} [count=120]
 */
export function launchConfetti(count = 120) {
  const { canvas } = getCanvas();
  stopLoop();
  for (let i = 0; i < count; i++) {
    const x = canvas.width * (0.1 + Math.random() * 0.8);
    const y = canvas.height * 0.3 + Math.random() * 40;
    _particles.push(makeConfettiParticle(x, y));
  }
  ensureLoop();
}

/**
 * Firework rockets that shoot up and explode in star bursts.
 * Fires 4–6 rockets over ~2 seconds, total duration ~4 seconds.
 */
export function launchFireworks() {
  const { canvas } = getCanvas();
  stopLoop();

  const rocketCount = 5;
  for (let i = 0; i < rocketCount; i++) {
    setTimeout(() => {
      const x = canvas.width * (0.2 + Math.random() * 0.6);
      _particles.push(makeRocket(x));
      ensureLoop();
    }, i * 380);
  }
}

/**
 * Small star-burst pop at a specific element's position.
 * Great for per-correct-answer micro-celebrations.
 * @param {HTMLElement} el  – origin element
 * @param {number} [count=20]
 */
export function popStarsAt(el, count = 20) {
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width  / 2;
  const y = rect.top  + rect.height / 2;
  getCanvas(); // ensure canvas exists
  for (let i = 0; i < count; i++) {
    _particles.push(makeStar(x, y,
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    ));
  }
  ensureLoop();
}
