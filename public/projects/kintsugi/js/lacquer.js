/**
 * Kintsugi - Lacquer Pattern Module
 * Generates decorative urushi-style patterns for the bowl surface
 */

import { COLORS, canvas } from './config.js';

// Pattern elements storage
let elements = [];
let patternSeed = 0;

/**
 * Seeded random number generator for consistent patterns
 */
function seededRandom(offset = 0) {
  const x = Math.sin(patternSeed + offset) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate a new lacquer pattern
 * Call this on resize or when bowl radius changes
 */
export function generate() {
  elements = [];
  patternSeed = Math.random() * 10000;
  
  const radius = canvas.bowlRadius;
  
  // Layer 1: Geometric circles and arcs
  generateCircles(radius);
  
  // Layer 2: Flowing brush curves
  generateCurves(radius);
  
  // Layer 3: Flower/petal motifs
  generateFlowers(radius);
  
  // Layer 4: Wave patterns (seigaiha-inspired)
  generateWaves(radius);
  
  // Layer 5: Gold dust (nashiji)
  generateDust(radius);
}

/**
 * Generate geometric circle elements
 */
function generateCircles(radius) {
  const count = 8 + Math.floor(seededRandom(0) * 6);
  
  for (let i = 0; i < count; i++) {
    const angle = seededRandom(i * 10) * Math.PI * 2;
    const dist = seededRandom(i * 10 + 1) * radius * 0.7;
    const r = 8 + seededRandom(i * 10 + 2) * 35;
    
    elements.push({
      type: 'circle',
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      r: r,
      filled: seededRandom(i * 10 + 3) > 0.6,
      color: pickColor(seededRandom(i * 10 + 4)),
      alpha: 0.15 + seededRandom(i * 10 + 5) * 0.25,
    });
  }
}

/**
 * Generate flowing brush curve elements
 */
function generateCurves(radius) {
  const count = 5 + Math.floor(seededRandom(100) * 4);
  
  for (let i = 0; i < count; i++) {
    const startAngle = seededRandom(i * 20 + 100) * Math.PI * 2;
    const startDist = seededRandom(i * 20 + 101) * radius * 0.5;
    const points = [];
    
    let x = Math.cos(startAngle) * startDist;
    let y = Math.sin(startAngle) * startDist;
    let angle = seededRandom(i * 20 + 102) * Math.PI * 2;
    
    const numPoints = 4 + Math.floor(seededRandom(i * 20 + 103) * 5);
    for (let j = 0; j < numPoints; j++) {
      points.push({ x, y });
      const step = 15 + seededRandom(i * 20 + j * 3 + 104) * 30;
      angle += (seededRandom(i * 20 + j * 3 + 105) - 0.5) * 1.2;
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
    }
    
    elements.push({
      type: 'curve',
      points: points,
      width: 1 + seededRandom(i * 20 + 106) * 3,
      color: seededRandom(i * 20 + 107) > 0.6 ? COLORS.lacquerGold : COLORS.lacquerRed,
      alpha: 0.2 + seededRandom(i * 20 + 108) * 0.3,
    });
  }
}

/**
 * Generate flower/petal motif elements
 */
function generateFlowers(radius) {
  const count = 3 + Math.floor(seededRandom(200) * 3);
  
  for (let i = 0; i < count; i++) {
    const angle = seededRandom(i * 30 + 200) * Math.PI * 2;
    const dist = radius * (0.2 + seededRandom(i * 30 + 201) * 0.5);
    
    elements.push({
      type: 'flower',
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      petalCount: 4 + Math.floor(seededRandom(i * 30 + 202) * 4),
      petalSize: 12 + seededRandom(i * 30 + 203) * 20,
      rotation: seededRandom(i * 30 + 204) * Math.PI * 2,
      color: seededRandom(i * 30 + 205) > 0.5 ? COLORS.lacquerGold : COLORS.lacquerCream,
      alpha: 0.15 + seededRandom(i * 30 + 206) * 0.2,
    });
  }
}

/**
 * Generate wave pattern elements (seigaiha-inspired)
 */
function generateWaves(radius) {
  const count = 2 + Math.floor(seededRandom(300) * 2);
  
  for (let i = 0; i < count; i++) {
    elements.push({
      type: 'wave',
      y: (seededRandom(i * 40 + 300) - 0.5) * radius * 1.2,
      amplitude: 8 + seededRandom(i * 40 + 301) * 12,
      frequency: 3 + seededRandom(i * 40 + 302) * 4,
      color: COLORS.lacquerGold,
      alpha: 0.12 + seededRandom(i * 40 + 303) * 0.15,
    });
  }
}

/**
 * Generate gold dust dots (nashiji technique)
 */
function generateDust(radius) {
  const count = 30 + Math.floor(seededRandom(400) * 40);
  
  for (let i = 0; i < count; i++) {
    const angle = seededRandom(i * 5 + 400) * Math.PI * 2;
    const dist = seededRandom(i * 5 + 401) * radius * 0.85;
    
    elements.push({
      type: 'dot',
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      r: 0.8 + seededRandom(i * 5 + 402) * 2,
      color: COLORS.lacquerGold,
      alpha: 0.2 + seededRandom(i * 5 + 403) * 0.4,
    });
  }
}

/**
 * Pick a lacquer color based on random value
 */
function pickColor(rand) {
  if (rand > 0.7) return COLORS.lacquerGold;
  if (rand > 0.3) return COLORS.lacquerRed;
  return COLORS.lacquerBlack;
}

/**
 * Draw lacquer pattern onto canvas context
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} offsetX - X offset (for fragment rendering)
 * @param {number} offsetY - Y offset (for fragment rendering)
 */
export function draw(ctx, offsetX = 0, offsetY = 0) {
  ctx.save();
  ctx.translate(canvas.centerX + offsetX, canvas.centerY + offsetY);
  
  for (const el of elements) {
    ctx.globalAlpha = el.alpha;
    drawElement(ctx, el);
  }
  
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Draw lacquer pattern clipped to a custom path
 * Used for drawing pattern on fragments
 */
export function drawClipped(ctx, clipPath, worldOffsetX, worldOffsetY) {
  ctx.save();
  
  // Apply clip path (should already be defined)
  ctx.clip();
  
  // Transform to world coordinates for pattern
  ctx.translate(worldOffsetX, worldOffsetY);
  
  for (const el of elements) {
    ctx.globalAlpha = el.alpha;
    drawElement(ctx, el);
  }
  
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Draw a single lacquer element
 */
function drawElement(ctx, el) {
  switch (el.type) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(el.x, el.y, el.r, 0, Math.PI * 2);
      if (el.filled) {
        ctx.fillStyle = el.color;
        ctx.fill();
      } else {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      break;
      
    case 'curve':
      if (el.points.length < 2) break;
      ctx.beginPath();
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length; i++) {
        const prev = el.points[i - 1];
        const curr = el.points[i];
        const cpx = (prev.x + curr.x) / 2;
        const cpy = (prev.y + curr.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
      }
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.width;
      ctx.lineCap = 'round';
      ctx.stroke();
      break;
      
    case 'flower':
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate(el.rotation);
      ctx.fillStyle = el.color;
      for (let p = 0; p < el.petalCount; p++) {
        const pAngle = (p / el.petalCount) * Math.PI * 2;
        ctx.save();
        ctx.rotate(pAngle);
        ctx.beginPath();
        ctx.ellipse(el.petalSize * 0.5, 0, el.petalSize * 0.5, el.petalSize * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Center dot
      ctx.beginPath();
      ctx.arc(0, 0, el.petalSize * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
      
    case 'wave':
      ctx.beginPath();
      ctx.strokeStyle = el.color;
      ctx.lineWidth = 1.2;
      const radius = canvas.bowlRadius;
      for (let x = -radius; x <= radius; x += 2) {
        const y = el.y + Math.sin(x / radius * Math.PI * el.frequency) * el.amplitude;
        if (x === -radius) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
      
    case 'dot':
      ctx.beginPath();
      ctx.arc(el.x, el.y, el.r, 0, Math.PI * 2);
      ctx.fillStyle = el.color;
      ctx.fill();
      break;
  }
}

/**
 * Get current elements (for testing/debugging)
 */
export function getElements() {
  return elements;
}

// For testing
export function _test() {
  const results = [];
  
  // Test generate creates elements
  const oldRadius = canvas.bowlRadius;
  canvas.bowlRadius = 100; // Set a test radius
  generate();
  
  results.push({
    name: 'generate() creates elements',
    pass: elements.length > 0,
  });
  
  // Test element types are distributed
  const types = new Set(elements.map(e => e.type));
  results.push({
    name: 'generate() creates multiple element types',
    pass: types.size >= 4,
  });
  
  // Test all elements have required properties
  const hasRequiredProps = elements.every(el => 
    'type' in el && 'color' in el && 'alpha' in el
  );
  results.push({
    name: 'all elements have type, color, alpha',
    pass: hasRequiredProps,
  });
  
  // Test alpha values are in valid range
  const alphasValid = elements.every(el => el.alpha >= 0 && el.alpha <= 1);
  results.push({
    name: 'all alpha values in [0,1]',
    pass: alphasValid,
  });
  
  // Test seeded random is deterministic
  patternSeed = 12345;
  const rand1 = seededRandom(0);
  patternSeed = 12345;
  const rand2 = seededRandom(0);
  results.push({
    name: 'seededRandom is deterministic',
    pass: rand1 === rand2,
  });
  
  // Restore
  canvas.bowlRadius = oldRadius;
  
  return results;
}
