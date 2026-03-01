/**
 * starfish-core.js
 * Minimal utilities for generative art pieces
 * ~4KB unminified, zero dependencies
 */

// ─────────────────────────────────────────────────────────────
// MATH UTILITIES
// ─────────────────────────────────────────────────────────────

export const lerp = (a, b, t) => a + (b - a) * t;

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const map = (v, inMin, inMax, outMin, outMax) => 
  outMin + (outMax - outMin) * ((v - inMin) / (inMax - inMin));

export const random = (min = 0, max = 1) => 
  typeof min === 'number' && typeof max === 'number' 
    ? lerp(min, max, Math.random())
    : min[Math.floor(Math.random() * min.length)]; // array pick

export const randomInt = (min, max) => Math.floor(random(min, max + 1));

export const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

export const angle = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

// ─────────────────────────────────────────────────────────────
// EASING
// ─────────────────────────────────────────────────────────────

export const ease = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => t * (2 - t),
  inOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  inCubic: t => t * t * t,
  outCubic: t => (--t) * t * t + 1,
  inOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  smoothstep: t => t * t * (3 - 2 * t),
};

// ─────────────────────────────────────────────────────────────
// COLOR
// ─────────────────────────────────────────────────────────────

export function parseColor(c) {
  if (typeof c === 'string' && c.startsWith('#')) {
    const hex = c.slice(1);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  return c; // assume {r,g,b}
}

export function lerpColor(a, b, t) {
  const c1 = parseColor(a);
  const c2 = parseColor(b);
  return {
    r: Math.round(lerp(c1.r, c2.r, t)),
    g: Math.round(lerp(c1.g, c2.g, t)),
    b: Math.round(lerp(c1.b, c2.b, t)),
  };
}

export function rgba(c, a = 1) {
  const { r, g, b } = typeof c === 'string' ? parseColor(c) : c;
  return `rgba(${r},${g},${b},${a})`;
}

export function hsla(h, s, l, a = 1) {
  return `hsla(${h},${s}%,${l}%,${a})`;
}

// ─────────────────────────────────────────────────────────────
// CANVAS HELPERS
// ─────────────────────────────────────────────────────────────

export function createCanvas(container = document.body) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  container.appendChild(canvas);
  
  let width, height, dpr;
  
  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }
  
  resize();
  window.addEventListener('resize', resize);
  
  return {
    canvas,
    ctx,
    get width() { return width; },
    get height() { return height; },
    resize,
  };
}

export function radialGlow(ctx, x, y, radius, color, alpha = 1) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  const c = parseColor(color);
  gradient.addColorStop(0, rgba(c, alpha));
  gradient.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────
// PARTICLE SYSTEM
// ─────────────────────────────────────────────────────────────

export class Particle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx ?? 0;
    this.vy = options.vy ?? 0;
    this.size = options.size ?? 4;
    this.life = 1;
    this.decay = options.decay ?? 0.01;
    this.gravity = options.gravity ?? 0;
    this.friction = options.friction ?? 1;
    this.color = options.color ?? '#ffffff';
    this.glow = options.glow ?? 0;
    
    // Trail
    this.trail = [];
    this.trailLength = options.trailLength ?? 0;
    
    // Custom data
    this.data = options.data ?? {};
  }
  
  update() {
    // Store trail point
    if (this.trailLength > 0) {
      this.trail.push({ x: this.x, y: this.y, life: this.life });
      if (this.trail.length > this.trailLength) this.trail.shift();
    }
    
    // Physics
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
    
    // Decay
    this.life -= this.decay;
    
    return this.life > 0;
  }
  
  draw(ctx) {
    const alpha = this.life;
    const size = this.size * this.life;
    
    // Trail
    if (this.trail.length > 0) {
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const trailAlpha = (i / this.trail.length) * t.life * 0.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, size * 0.5 * (i / this.trail.length), 0, Math.PI * 2);
        ctx.fillStyle = rgba(this.color, trailAlpha);
        ctx.fill();
      }
    }
    
    // Glow
    if (this.glow > 0) {
      radialGlow(ctx, this.x, this.y, size * this.glow, this.color, alpha * 0.3);
    }
    
    // Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fillStyle = rgba(this.color, alpha);
    ctx.fill();
  }
}

export class Emitter {
  constructor(options = {}) {
    this.particles = [];
    this.maxParticles = options.maxParticles ?? 500;
  }
  
  spawn(x, y, options = {}) {
    if (this.particles.length < this.maxParticles) {
      this.particles.push(new Particle(x, y, options));
    }
  }
  
  burst(x, y, count, optionsFn) {
    for (let i = 0; i < count; i++) {
      const opts = typeof optionsFn === 'function' ? optionsFn(i) : optionsFn;
      this.spawn(x, y, opts);
    }
  }
  
  update() {
    this.particles = this.particles.filter(p => p.update());
  }
  
  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }
  
  get count() {
    return this.particles.length;
  }
}

// ─────────────────────────────────────────────────────────────
// ANIMATION LOOP
// ─────────────────────────────────────────────────────────────

export function loop(callback) {
  let startTime = null;
  let frameCount = 0;
  
  function frame(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    frameCount++;
    
    callback({ elapsed, frameCount, timestamp });
    requestAnimationFrame(frame);
  }
  
  requestAnimationFrame(frame);
}

// ─────────────────────────────────────────────────────────────
// NOISE (simplified Perlin-ish)
// ─────────────────────────────────────────────────────────────

const PERLIN_SIZE = 256;
const perlinPerm = [...Array(PERLIN_SIZE)].map((_, i) => i).sort(() => Math.random() - 0.5);
const perlinGrad = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function dot2(g, x, y) { return g[0] * x + g[1] * y; }

export function noise2d(x, y) {
  const X = Math.floor(x) & (PERLIN_SIZE - 1);
  const Y = Math.floor(y) & (PERLIN_SIZE - 1);
  x -= Math.floor(x);
  y -= Math.floor(y);
  
  const u = fade(x), v = fade(y);
  const aa = perlinPerm[(perlinPerm[X] + Y) & (PERLIN_SIZE - 1)] & 7;
  const ab = perlinPerm[(perlinPerm[X] + Y + 1) & (PERLIN_SIZE - 1)] & 7;
  const ba = perlinPerm[(perlinPerm[X + 1] + Y) & (PERLIN_SIZE - 1)] & 7;
  const bb = perlinPerm[(perlinPerm[X + 1] + Y + 1) & (PERLIN_SIZE - 1)] & 7;
  
  return lerp(
    lerp(dot2(perlinGrad[aa], x, y), dot2(perlinGrad[ba], x - 1, y), u),
    lerp(dot2(perlinGrad[ab], x, y - 1), dot2(perlinGrad[bb], x - 1, y - 1), u),
    v
  );
}
