/**
 * Kintsugi - Renderer Module
 * Bowl and fragment rendering
 */

import { COLORS, canvas } from './config.js';
import * as lacquer from './lacquer.js';

/**
 * Clear the canvas with background color
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function clear(ctx) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.size, canvas.size);
}

/**
 * Draw the intact bowl with lacquer pattern
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} breathScale - Breathing animation scale (default 1)
 */
export function drawBowl(ctx, breathScale = 1) {
  ctx.save();
  
  const r = canvas.bowlRadius * breathScale;
  const cx = canvas.centerX;
  const cy = canvas.centerY;
  
  // Shadow beneath bowl
  const shadow = ctx.createRadialGradient(
    cx + 5, cy + 12, r * 0.85,
    cx + 5, cy + 12, r * 1.25
  );
  shadow.addColorStop(0, 'rgba(0,0,0,0.25)');
  shadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.arc(cx + 5, cy + 12, r * 1.25, 0, Math.PI * 2);
  ctx.fill();
  
  // Main ceramic surface gradient
  const mainGrad = ctx.createRadialGradient(
    cx - r * 0.35, cy - r * 0.35, 0,
    cx + r * 0.15, cy + r * 0.15, r * 1.1
  );
  mainGrad.addColorStop(0, COLORS.ceramicEdge);
  mainGrad.addColorStop(0.25, COLORS.ceramic);
  mainGrad.addColorStop(0.6, COLORS.ceramicMid);
  mainGrad.addColorStop(0.85, COLORS.ceramicShadow);
  mainGrad.addColorStop(1, COLORS.ceramicDark);
  
  ctx.fillStyle = mainGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  
  // Clip to bowl and draw lacquer pattern
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
  ctx.clip();
  lacquer.draw(ctx);
  ctx.restore();
  
  // Inner depth shading
  const innerGrad = ctx.createRadialGradient(
    cx + r * 0.08, cy + r * 0.08, 0,
    cx, cy, r * 0.55
  );
  innerGrad.addColorStop(0, 'rgba(0,0,0,0.07)');
  innerGrad.addColorStop(0.7, 'rgba(0,0,0,0.03)');
  innerGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  
  // Rim highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 1.5, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Draw a single fragment with lacquer pattern
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} fragment - Fragment object
 */
export function drawFragment(ctx, fragment) {
  const f = fragment;
  if (f.vertices.length < 3) return;
  
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.rotation);
  
  // Shadow under fragment
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.moveTo(f.vertices[0].x + 3, f.vertices[0].y + 5);
  for (let i = 1; i < f.vertices.length; i++) {
    ctx.lineTo(f.vertices[i].x + 3, f.vertices[i].y + 5);
  }
  ctx.closePath();
  ctx.fill();
  
  // Raw ceramic edge (thickness)
  ctx.fillStyle = COLORS.ceramicShadow;
  ctx.strokeStyle = COLORS.ceramicDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(f.vertices[0].x, f.vertices[0].y);
  for (let i = 1; i < f.vertices.length; i++) {
    ctx.lineTo(f.vertices[i].x, f.vertices[i].y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Main ceramic surface (offset for depth)
  const offset = -3;
  
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(f.vertices[0].x + offset, f.vertices[0].y + offset);
  for (let i = 1; i < f.vertices.length; i++) {
    ctx.lineTo(f.vertices[i].x + offset, f.vertices[i].y + offset);
  }
  ctx.closePath();
  ctx.clip();
  
  // Base ceramic color
  ctx.fillStyle = COLORS.ceramic;
  ctx.fillRect(-canvas.bowlRadius, -canvas.bowlRadius, canvas.bowlRadius * 2, canvas.bowlRadius * 2);
  
  // Draw lacquer pattern (transformed to world coords)
  const worldX = f.originX;
  const worldY = f.originY;
  ctx.translate(-worldX + canvas.centerX, -worldY + canvas.centerY);
  
  for (const el of lacquer.getElements()) {
    ctx.globalAlpha = el.alpha;
    drawLacquerElement(ctx, el);
  }
  ctx.globalAlpha = 1;
  
  ctx.restore();
  
  // Light edge on ceramic surface
  ctx.strokeStyle = COLORS.ceramicEdge;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(f.vertices[0].x + offset, f.vertices[0].y + offset);
  for (let i = 1; i < f.vertices.length; i++) {
    ctx.lineTo(f.vertices[i].x + offset, f.vertices[i].y + offset);
  }
  ctx.closePath();
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Draw a lacquer element (used for fragments)
 */
function drawLacquerElement(ctx, el) {
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
      
    case 'dot':
      ctx.beginPath();
      ctx.arc(el.x, el.y, el.r, 0, Math.PI * 2);
      ctx.fillStyle = el.color;
      ctx.fill();
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
      ctx.beginPath();
      ctx.arc(0, 0, el.petalSize * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
  }
}

/**
 * Draw all fragments
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} fragments - Array of fragment objects
 */
export function drawFragments(ctx, fragments) {
  for (const f of fragments) {
    drawFragment(ctx, f);
  }
}

/**
 * Draw tension cracks (pre-break visualization) - legacy format
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} cracks - Array of crack objects from fracture.generateTensionCracks
 * @param {number} intensity - Tension intensity (0-1)
 */
export function drawTensionCracks(ctx, cracks, intensity) {
  ctx.save();
  ctx.strokeStyle = `rgba(80, 70, 60, ${intensity * 0.7})`;
  ctx.lineWidth = 0.8 + intensity * 0.4;
  ctx.lineCap = 'round';
  
  for (const crack of cracks) {
    if (crack.points.length < 2) continue;
    
    ctx.beginPath();
    ctx.moveTo(crack.points[0].x, crack.points[0].y);
    for (let i = 1; i < crack.points.length; i++) {
      ctx.lineTo(crack.points[i].x, crack.points[i].y);
    }
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Draw tension crack paths (new format - sinuous curves)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} crackPaths - Array of CrackPath objects
 * @param {number} intensity - Tension intensity (0-1)
 */
export function drawTensionCrackPaths(ctx, crackPaths, intensity) {
  if (!crackPaths || crackPaths.length === 0) return;
  
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Collect all paths including branches
  function drawPath(path, depth = 0) {
    if (!path.points || path.points.length < 2) return;
    
    // Deeper cracks are thinner and lighter
    const depthFade = Math.max(0.3, 1 - depth * 0.25);
    const alpha = intensity * 0.7 * depthFade;
    const width = (1.2 + intensity * 0.6) * depthFade;
    
    ctx.strokeStyle = `rgba(60, 50, 45, ${alpha})`;
    ctx.lineWidth = width;
    
    // Draw smooth curve through points
    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    
    if (path.points.length === 2) {
      ctx.lineTo(path.points[1].x, path.points[1].y);
    } else {
      // Use quadratic curves for smoothness
      for (let i = 1; i < path.points.length - 1; i++) {
        const xc = (path.points[i].x + path.points[i + 1].x) / 2;
        const yc = (path.points[i].y + path.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(path.points[i].x, path.points[i].y, xc, yc);
      }
      // Final segment
      const last = path.points[path.points.length - 1];
      ctx.lineTo(last.x, last.y);
    }
    
    ctx.stroke();
    
    // Draw branches
    if (path.branches) {
      for (const branch of path.branches) {
        drawPath(branch, depth + 1);
      }
    }
  }
  
  // Draw all main cracks and their branches
  for (const crackPath of crackPaths) {
    drawPath(crackPath, 0);
  }
  
  ctx.restore();
}

/**
 * Draw hover glow around bowl
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function drawHoverGlow(ctx) {
  const pulse = 0.4 + Math.sin(Date.now() * 0.005) * 0.3;
  ctx.strokeStyle = `rgba(212, 168, 71, ${pulse * 0.25})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(canvas.centerX, canvas.centerY, canvas.bowlRadius + 8, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Draw mending warmth glow
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} progress - Mending progress (0-1)
 */
export function drawMendingWarmth(ctx, progress) {
  const warmth = Math.sin(progress * Math.PI) * 0.06;
  if (warmth > 0) {
    ctx.fillStyle = `rgba(255, 200, 100, ${warmth})`;
    ctx.fillRect(0, 0, canvas.size, canvas.size);
  }
  
  // Completion pulse
  if (progress > 0.9) {
    const pulse = (progress - 0.9) / 0.1;
    const pulseAlpha = Math.sin(pulse * Math.PI) * 0.1;
    ctx.fillStyle = `rgba(255, 220, 150, ${pulseAlpha})`;
    ctx.beginPath();
    ctx.arc(canvas.centerX, canvas.centerY, canvas.bowlRadius * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// For testing
export function _test() {
  const results = [];
  
  // Test functions exist
  results.push({
    name: 'clear is a function',
    pass: typeof clear === 'function',
  });
  
  results.push({
    name: 'drawBowl is a function',
    pass: typeof drawBowl === 'function',
  });
  
  results.push({
    name: 'drawFragment is a function',
    pass: typeof drawFragment === 'function',
  });
  
  results.push({
    name: 'drawFragments is a function',
    pass: typeof drawFragments === 'function',
  });
  
  results.push({
    name: 'drawTensionCracks is a function',
    pass: typeof drawTensionCracks === 'function',
  });
  
  results.push({
    name: 'drawTensionCrackPaths is a function',
    pass: typeof drawTensionCrackPaths === 'function',
  });
  
  results.push({
    name: 'drawHoverGlow is a function',
    pass: typeof drawHoverGlow === 'function',
  });
  
  results.push({
    name: 'drawMendingWarmth is a function',
    pass: typeof drawMendingWarmth === 'function',
  });
  
  return results;
}
