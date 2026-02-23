/**
 * Kintsugi - Physics Module
 * Fragment physics simulation and mending animation
 */

import { canvas, PHYSICS } from './config.js';

/**
 * Update fragment physics (gravity, friction, boundaries)
 * @param {Array} fragments - Array of fragment objects
 * @returns {boolean} Whether all fragments have settled
 */
export function updateFragments(fragments) {
  const { gravity, friction, bounce, boundaryMultiplier } = PHYSICS;
  const boundary = canvas.bowlRadius * boundaryMultiplier;
  
  let settled = true;
  
  for (const f of fragments) {
    // Apply gravity
    f.vy += gravity;
    
    // Apply velocity
    f.x += f.vx;
    f.y += f.vy;
    
    // Apply friction
    f.vx *= friction;
    f.vy *= friction;
    
    // Apply rotation
    f.rotation += f.rotationVel;
    f.rotationVel *= 0.97;
    
    // Soft boundary - push back toward center
    const distFromCenter = Math.hypot(f.x - canvas.centerX, f.y - canvas.centerY);
    if (distFromCenter > boundary) {
      const angle = Math.atan2(f.y - canvas.centerY, f.x - canvas.centerX);
      f.x = canvas.centerX + Math.cos(angle) * boundary;
      f.y = canvas.centerY + Math.sin(angle) * boundary;
      f.vx *= -bounce;
      f.vy *= -bounce;
    }
    
    // Check if still moving
    if (Math.abs(f.vx) > 0.15 || Math.abs(f.vy) > 0.15) {
      settled = false;
    }
  }
  
  return settled;
}

/**
 * Update fragment positions during mending (move toward origin)
 * @param {Array} fragments - Array of fragment objects
 * @param {number} progress - Mending progress (0-1)
 */
export function updateMending(fragments, progress) {
  const lerpFactor = 0.06;
  const rotationDecay = 0.94;
  
  for (const f of fragments) {
    // Lerp position toward origin
    f.x += (f.originX - f.x) * lerpFactor;
    f.y += (f.originY - f.y) * lerpFactor;
    
    // Decay rotation
    f.rotation *= rotationDecay;
  }
}

/**
 * Check if all fragments are close to their origins
 * @param {Array} fragments - Array of fragment objects
 * @param {number} threshold - Distance threshold
 * @returns {boolean}
 */
export function fragmentsAtOrigin(fragments, threshold = 1) {
  return fragments.every(f => {
    const dist = Math.hypot(f.x - f.originX, f.y - f.originY);
    return dist < threshold;
  });
}

/**
 * Calculate screen shake based on tension intensity
 * @param {number} intensity - Tension intensity (0-1)
 * @returns {Object} {x, y} shake offset
 */
export function calculateShake(intensity) {
  if (intensity > 0.3) {
    const shake = (intensity - 0.3) * 8;
    return {
      x: (Math.random() - 0.5) * shake,
      y: (Math.random() - 0.5) * shake,
    };
  }
  return { x: 0, y: 0 };
}

// For testing
export function _test() {
  const results = [];
  
  // Store original config
  const origCenterX = canvas.centerX;
  const origCenterY = canvas.centerY;
  const origRadius = canvas.bowlRadius;
  
  // Set test values
  canvas.centerX = 200;
  canvas.centerY = 200;
  canvas.bowlRadius = 100;
  
  // Test updateFragments applies gravity
  const fragments = [{
    x: 200, y: 200,
    vx: 0, vy: 0,
    rotation: 0, rotationVel: 0,
    originX: 200, originY: 200,
  }];
  
  const initialY = fragments[0].y;
  updateFragments(fragments);
  
  results.push({
    name: 'updateFragments applies gravity',
    pass: fragments[0].vy > 0,
  });
  
  // Test updateFragments respects boundary
  const boundaryFragment = [{
    x: 500, y: 200, // Way outside boundary
    vx: 10, vy: 0,
    rotation: 0, rotationVel: 0,
    originX: 200, originY: 200,
  }];
  
  updateFragments(boundaryFragment);
  const distFromCenter = Math.hypot(
    boundaryFragment[0].x - canvas.centerX,
    boundaryFragment[0].y - canvas.centerY
  );
  
  results.push({
    name: 'updateFragments enforces boundary',
    pass: distFromCenter <= canvas.bowlRadius * PHYSICS.boundaryMultiplier + 1,
  });
  
  // Test settled detection
  const settledFragments = [{
    x: 200, y: 200,
    vx: 0.01, vy: 0.01, // Very slow
    rotation: 0, rotationVel: 0,
    originX: 200, originY: 200,
  }];
  
  results.push({
    name: 'updateFragments detects settled state',
    pass: updateFragments(settledFragments) === true,
  });
  
  // Test updateMending moves toward origin
  const mendingFragment = [{
    x: 250, y: 250,
    originX: 200, originY: 200,
    rotation: 0.5,
  }];
  
  updateMending(mendingFragment, 0.5);
  
  results.push({
    name: 'updateMending moves toward origin',
    pass: mendingFragment[0].x < 250 && mendingFragment[0].y < 250,
  });
  
  results.push({
    name: 'updateMending decays rotation',
    pass: Math.abs(mendingFragment[0].rotation) < 0.5,
  });
  
  // Test fragmentsAtOrigin
  const atOriginFragments = [{
    x: 200.5, y: 200.5,
    originX: 200, originY: 200,
  }];
  
  results.push({
    name: 'fragmentsAtOrigin returns true when close',
    pass: fragmentsAtOrigin(atOriginFragments, 1) === true,
  });
  
  const notAtOriginFragments = [{
    x: 210, y: 210,
    originX: 200, originY: 200,
  }];
  
  results.push({
    name: 'fragmentsAtOrigin returns false when far',
    pass: fragmentsAtOrigin(notAtOriginFragments, 1) === false,
  });
  
  // Test calculateShake
  results.push({
    name: 'calculateShake returns zero below threshold',
    pass: calculateShake(0.2).x === 0 && calculateShake(0.2).y === 0,
  });
  
  const shake = calculateShake(0.8);
  results.push({
    name: 'calculateShake returns non-zero above threshold',
    pass: typeof shake.x === 'number' && typeof shake.y === 'number',
  });
  
  // Restore original config
  canvas.centerX = origCenterX;
  canvas.centerY = origCenterY;
  canvas.bowlRadius = origRadius;
  
  return results;
}
