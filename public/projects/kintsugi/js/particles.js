/**
 * Kintsugi - Particles Module
 * Dust burst and gold sparkle particle systems
 */

import { COLORS } from './config.js';

/**
 * Create a burst of dust particles at impact point
 * @param {Array} particles - Dust particles array to add to
 * @param {number} x - Impact X
 * @param {number} y - Impact Y
 * @param {number} intensity - Break intensity (0-1)
 */
export function createDustBurst(particles, x, y, intensity) {
  const count = Math.floor(20 + intensity * 35);
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.5 + Math.random() * 2.5) * intensity;
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
      vy: Math.sin(angle) * speed - Math.random() * 3,
      size: 0.8 + Math.random() * 2.5,
      life: 1,
      decay: 0.012 + Math.random() * 0.018,
      gravity: 0.04 + Math.random() * 0.04,
    });
  }
}

/**
 * Create a gold sparkle particle
 * @param {Array} particles - Gold particles array to add to
 * @param {number} x - Spawn X
 * @param {number} y - Spawn Y
 * @param {boolean} large - Whether to create a larger sparkle
 */
export function createGoldSparkle(particles, x, y, large = false) {
  particles.push({
    x: x + (Math.random() - 0.5) * 12,
    y: y + (Math.random() - 0.5) * 12,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6 - 0.4,
    size: large ? 2 + Math.random() * 3 : 1 + Math.random() * 2,
    life: 1,
    decay: 0.015 + Math.random() * 0.02,
    shimmer: Math.random() * Math.PI * 2,
  });
}

/**
 * Update all dust particles
 * @param {Array} particles - Dust particles array
 */
export function updateDust(particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.life -= p.decay;
    
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

/**
 * Update all gold sparkle particles
 * @param {Array} particles - Gold particles array
 */
export function updateGold(particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.shimmer += 0.3;
    p.life -= p.decay;
    
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

/**
 * Draw all dust particles
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} particles - Dust particles array
 */
export function drawDust(ctx, particles) {
  for (const p of particles) {
    ctx.globalAlpha = p.life * 0.6;
    ctx.fillStyle = COLORS.rawEdge;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw all gold sparkle particles
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} particles - Gold particles array
 */
export function drawGold(ctx, particles) {
  for (const p of particles) {
    const alpha = p.life * p.life;
    const shimmerBrightness = 0.7 + Math.sin(p.shimmer) * 0.3;
    ctx.globalAlpha = alpha * shimmerBrightness;
    
    // Outer glow
    ctx.fillStyle = 'rgba(255, 200, 80, 0.4)';
    ctx.shadowColor = 'rgba(255, 200, 100, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Bright core
    ctx.shadowBlur = 8;
    ctx.fillStyle = COLORS.goldBright;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    
    // White hot center
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 255, 240, ${0.9 * shimmerBrightness})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

/**
 * Draw all particles (dust and gold)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} dustParticles - Dust particles array
 * @param {Array} goldParticles - Gold particles array
 */
export function drawAll(ctx, dustParticles, goldParticles) {
  drawDust(ctx, dustParticles);
  drawGold(ctx, goldParticles);
}

/**
 * Update all particles (dust and gold)
 * @param {Array} dustParticles - Dust particles array
 * @param {Array} goldParticles - Gold particles array
 */
export function updateAll(dustParticles, goldParticles) {
  updateDust(dustParticles);
  updateGold(goldParticles);
}

// For testing
export function _test() {
  const results = [];
  
  // Test createDustBurst
  const dustParticles = [];
  createDustBurst(dustParticles, 100, 100, 0.5);
  
  results.push({
    name: 'createDustBurst creates particles',
    pass: dustParticles.length > 0,
  });
  
  results.push({
    name: 'dust particles have required properties',
    pass: dustParticles.every(p => 
      'x' in p && 'y' in p && 'vx' in p && 'vy' in p && 
      'life' in p && 'decay' in p && 'gravity' in p
    ),
  });
  
  // Test createGoldSparkle
  const goldParticles = [];
  createGoldSparkle(goldParticles, 100, 100, false);
  createGoldSparkle(goldParticles, 100, 100, true);
  
  results.push({
    name: 'createGoldSparkle creates particles',
    pass: goldParticles.length === 2,
  });
  
  results.push({
    name: 'gold particles have shimmer property',
    pass: goldParticles.every(p => 'shimmer' in p),
  });
  
  // Test large sparkle is bigger
  results.push({
    name: 'large sparkle has bigger size range',
    pass: goldParticles[1].size >= goldParticles[0].size * 0.8, // Allow some variance
  });
  
  // Test updateDust removes dead particles
  const testDust = [{ x: 0, y: 0, vx: 0, vy: 0, life: 0.01, decay: 0.02, gravity: 0.04 }];
  updateDust(testDust);
  updateDust(testDust);
  
  results.push({
    name: 'updateDust removes dead particles',
    pass: testDust.length === 0,
  });
  
  // Test updateGold removes dead particles
  const testGold = [{ x: 0, y: 0, vx: 0, vy: 0, life: 0.01, decay: 0.02, shimmer: 0 }];
  updateGold(testGold);
  updateGold(testGold);
  
  results.push({
    name: 'updateGold removes dead particles',
    pass: testGold.length === 0,
  });
  
  // Test particle life decreases
  const lifeDust = [{ x: 0, y: 0, vx: 0, vy: 0, life: 1, decay: 0.1, gravity: 0.04 }];
  const initialLife = lifeDust[0].life;
  updateDust(lifeDust);
  
  results.push({
    name: 'particle life decreases on update',
    pass: lifeDust[0].life < initialLife,
  });
  
  return results;
}
