/**
 * Kintsugi - Gold Rendering Module
 * Fluid gold rendering along crack PATHS (not just line segments)
 * 
 * Key insight: Gold follows the exact same paths that cracks created.
 * Generate once, render twice.
 */

import { COLORS } from './config.js';

/**
 * Draw gold along a full crack path (polyline with curves)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} path - Path object {points, thickness, progress, flowProgress}
 * @param {boolean} flowing - Whether to show flowing animation
 * @param {number} time - Current timestamp for shimmer
 */
export function drawPath(ctx, path, flowing = false, time = Date.now()) {
  if (!path.points || path.points.length < 2) return;
  if (path.progress <= 0 && path.flowProgress <= 0) return;
  
  const p = path.flowProgress !== undefined ? path.flowProgress : path.progress;
  if (p <= 0) return;
  
  const points = path.points;
  const totalLength = calculatePathLength(points);
  const visibleLength = totalLength * p;
  
  // Find how many points to draw based on flow progress
  const visiblePoints = getVisiblePoints(points, p);
  if (visiblePoints.length < 2) return;
  
  const baseThickness = path.thickness || 3.5;
  const shimmer = 0.85 + Math.sin(time * 0.003 + points[0].x * 0.1) * 0.15;
  
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Ambient glow
  ctx.shadowColor = `rgba(255, 190, 50, ${0.5 * shimmer})`;
  ctx.shadowBlur = flowing ? 28 : 18;
  
  // Outer glow layer
  ctx.strokeStyle = `rgba(255, 200, 60, ${0.15 * shimmer})`;
  ctx.lineWidth = baseThickness * 4;
  drawSmoothPath(ctx, visiblePoints);
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  
  // Draw fluid gold body with thickness variation
  drawFluidPathBody(ctx, visiblePoints, baseThickness, shimmer);
  
  // Specular highlights along path
  drawPathHighlights(ctx, visiblePoints, baseThickness, shimmer, time);
  
  // Flowing leading edge
  if (flowing && p > 0 && p < 1) {
    const lastPoint = visiblePoints[visiblePoints.length - 1];
    drawFlowingEdge(ctx, lastPoint.x, lastPoint.y, path, baseThickness, p);
  }
}

/**
 * Calculate total length of a path
 */
function calculatePathLength(points) {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y);
  }
  return length;
}

/**
 * Get visible portion of points based on progress
 */
function getVisiblePoints(points, progress) {
  if (progress >= 1) return points;
  
  const totalLength = calculatePathLength(points);
  const targetLength = totalLength * progress;
  
  const result = [points[0]];
  let accumulated = 0;
  
  for (let i = 1; i < points.length; i++) {
    const segmentLength = Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y);
    
    if (accumulated + segmentLength >= targetLength) {
      // Interpolate final point
      const remaining = targetLength - accumulated;
      const t = remaining / segmentLength;
      result.push({
        x: points[i-1].x + (points[i].x - points[i-1].x) * t,
        y: points[i-1].y + (points[i].y - points[i-1].y) * t
      });
      break;
    }
    
    accumulated += segmentLength;
    result.push(points[i]);
  }
  
  return result;
}

/**
 * Draw a smooth path through points
 */
function drawSmoothPath(ctx, points) {
  if (points.length < 2) return;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
  } else {
    // Use quadratic curves for smoothness
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    // Final point
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y);
  }
}

/**
 * Draw fluid gold body with organic thickness variation
 */
function drawFluidPathBody(ctx, points, baseThickness, shimmer) {
  if (points.length < 2) return;
  
  // Calculate thickness at each point
  const thicknessPoints = [];
  for (let i = 0; i < points.length; i++) {
    const t = points.length > 1 ? i / (points.length - 1) : 0;
    
    // Organic thickness: thicker in middle, variation with noise
    const midFactor = 1 - Math.abs(t - 0.5) * 0.6;
    const noise = Math.sin(t * 12 + points[0].x * 0.1) * 0.3 + 
                  Math.sin(t * 7 + points[0].y * 0.1) * 0.2;
    const thickness = baseThickness * (0.7 + midFactor * 0.5 + noise * 0.3);
    
    thicknessPoints.push({ ...points[i], thickness });
  }
  
  // Build polygon for fluid body
  const topEdge = [];
  const bottomEdge = [];
  
  for (let i = 0; i < thicknessPoints.length; i++) {
    const pt = thicknessPoints[i];
    
    // Calculate perpendicular direction
    let perpX, perpY;
    if (i === 0) {
      perpX = -(thicknessPoints[1].y - pt.y);
      perpY = thicknessPoints[1].x - pt.x;
    } else if (i === thicknessPoints.length - 1) {
      perpX = -(pt.y - thicknessPoints[i-1].y);
      perpY = pt.x - thicknessPoints[i-1].x;
    } else {
      perpX = -(thicknessPoints[i+1].y - thicknessPoints[i-1].y);
      perpY = thicknessPoints[i+1].x - thicknessPoints[i-1].x;
    }
    
    // Normalize
    const len = Math.hypot(perpX, perpY) || 1;
    perpX /= len;
    perpY /= len;
    
    topEdge.push({
      x: pt.x + perpX * pt.thickness,
      y: pt.y + perpY * pt.thickness
    });
    bottomEdge.push({
      x: pt.x - perpX * pt.thickness,
      y: pt.y - perpY * pt.thickness
    });
  }
  
  // Draw filled polygon
  ctx.beginPath();
  ctx.moveTo(topEdge[0].x, topEdge[0].y);
  
  // Top edge (forward)
  for (let i = 1; i < topEdge.length; i++) {
    ctx.lineTo(topEdge[i].x, topEdge[i].y);
  }
  
  // Bottom edge (backward)
  for (let i = bottomEdge.length - 1; i >= 0; i--) {
    ctx.lineTo(bottomEdge[i].x, bottomEdge[i].y);
  }
  
  ctx.closePath();
  
  // Gold gradient fill along path
  const start = points[0];
  const end = points[points.length - 1];
  const goldGrad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
  goldGrad.addColorStop(0, COLORS.goldDark);
  goldGrad.addColorStop(0.3, COLORS.gold);
  goldGrad.addColorStop(0.5, COLORS.goldBright);
  goldGrad.addColorStop(0.7, COLORS.gold);
  goldGrad.addColorStop(1, COLORS.goldMid);
  
  ctx.fillStyle = goldGrad;
  ctx.fill();
  
  // Bright highlight line down center
  ctx.strokeStyle = `rgba(255, 240, 180, ${0.6 * shimmer})`;
  ctx.lineWidth = baseThickness * 0.4;
  drawSmoothPath(ctx, points);
  ctx.stroke();
}

/**
 * Draw specular highlights along path
 */
function drawPathHighlights(ctx, points, baseThickness, shimmer, time) {
  const pathLength = calculatePathLength(points);
  const numHighlights = Math.floor(pathLength / 25);
  
  for (let i = 0; i < numHighlights; i++) {
    const t = (i + 0.5) / (numHighlights + 1);
    const pt = getPointAtT(points, t);
    
    const hx = pt.x + Math.sin(time * 0.002 + i) * 2;
    const hy = pt.y + Math.cos(time * 0.002 + i) * 2;
    const hs = baseThickness * (0.3 + shimmer * 0.3);
    
    ctx.fillStyle = `rgba(255, 255, 240, ${0.5 * shimmer})`;
    ctx.beginPath();
    ctx.arc(hx, hy, hs, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Get point at parametric t along path
 */
function getPointAtT(points, t) {
  if (t <= 0) return points[0];
  if (t >= 1) return points[points.length - 1];
  
  const totalLength = calculatePathLength(points);
  const targetLength = totalLength * t;
  
  let accumulated = 0;
  for (let i = 1; i < points.length; i++) {
    const segmentLength = Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y);
    
    if (accumulated + segmentLength >= targetLength) {
      const remaining = targetLength - accumulated;
      const segT = remaining / segmentLength;
      return {
        x: points[i-1].x + (points[i].x - points[i-1].x) * segT,
        y: points[i-1].y + (points[i].y - points[i-1].y) * segT
      };
    }
    
    accumulated += segmentLength;
  }
  
  return points[points.length - 1];
}

/**
 * Draw a fluid gold seam (legacy - straight line segments)
 * Kept for backward compatibility
 */
export function drawSeam(ctx, seam, flowing = false, time = Date.now()) {
  if (seam.progress <= 0) return;
  
  const p = seam.flowProgress !== undefined ? seam.flowProgress : seam.progress;
  const x1 = seam.x1, y1 = seam.y1;
  const x2 = seam.x1 + (seam.x2 - seam.x1) * p;
  const y2 = seam.y1 + (seam.y2 - seam.y1) * p;
  
  const length = Math.hypot(x2 - x1, y2 - y1);
  if (length < 2) return;
  
  // Convert to path format and use drawPath
  const path = {
    points: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
    thickness: seam.thickness || 3.5,
    progress: seam.progress,
    flowProgress: seam.flowProgress
  };
  
  drawPath(ctx, path, flowing, time);
}

/**
 * Draw the molten flowing edge effect
 */
function drawFlowingEdge(ctx, x, y, path, baseThickness, progress) {
  const dropSize = baseThickness * 1.8;
  
  ctx.shadowColor = 'rgba(255, 220, 100, 0.9)';
  ctx.shadowBlur = 15;
  
  // Outer glow
  ctx.fillStyle = 'rgba(255, 200, 80, 0.5)';
  ctx.beginPath();
  ctx.arc(x, y, dropSize * 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Main droplet
  ctx.fillStyle = COLORS.goldBright;
  ctx.beginPath();
  ctx.arc(x, y, dropSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Hot white center
  ctx.fillStyle = 'rgba(255, 255, 250, 0.9)';
  ctx.beginPath();
  ctx.arc(x, y, dropSize * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowBlur = 0;
  
  // Trailing drips along the path
  if (path.points && path.points.length > 2) {
    for (let d = 1; d <= 3; d++) {
      const dripT = Math.max(0, progress - d * 0.06);
      if (dripT > 0) {
        const dripPt = getPointAtT(path.points, dripT);
        const dripSize = baseThickness * (0.8 - d * 0.15);
        
        ctx.fillStyle = `rgba(255, 210, 80, ${0.6 - d * 0.15})`;
        ctx.beginPath();
        ctx.arc(dripPt.x, dripPt.y, dripSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * Draw a gold pool at an intersection point
 */
export function drawPool(ctx, pool, time = Date.now()) {
  if (pool.progress <= 0) return;
  
  const shimmer = 0.85 + Math.sin(time * 0.003 + pool.x * 0.05 + pool.y * 0.05) * 0.15;
  const size = pool.size * pool.progress;
  
  // Outer glow
  ctx.shadowColor = `rgba(255, 190, 50, ${0.6 * shimmer})`;
  ctx.shadowBlur = 20;
  
  ctx.fillStyle = `rgba(255, 200, 60, ${0.3 * shimmer})`;
  ctx.beginPath();
  ctx.arc(pool.x, pool.y, size * 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowBlur = 0;
  
  // Main pool - slightly irregular shape
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 2; a += 0.2) {
    const r = size * (0.9 + Math.sin(a * 3 + pool.x) * 0.15);
    const px = pool.x + Math.cos(a) * r;
    const py = pool.y + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  
  // Gradient fill
  const poolGrad = ctx.createRadialGradient(
    pool.x - size * 0.3, pool.y - size * 0.3, 0,
    pool.x, pool.y, size
  );
  poolGrad.addColorStop(0, COLORS.goldBright);
  poolGrad.addColorStop(0.4, COLORS.gold);
  poolGrad.addColorStop(1, COLORS.goldMid);
  
  ctx.fillStyle = poolGrad;
  ctx.fill();
  
  // Bright highlight
  ctx.fillStyle = `rgba(255, 255, 240, ${0.6 * shimmer})`;
  ctx.beginPath();
  ctx.arc(pool.x - size * 0.25, pool.y - size * 0.25, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw all paths in an array (primary method - follows crack geometry)
 */
export function drawPaths(ctx, paths, flowing = false) {
  if (!paths || paths.length === 0) return;
  
  const time = Date.now();
  for (const path of paths) {
    drawPath(ctx, path, flowing, time);
  }
}

/**
 * Draw all seams in an array (legacy compatibility)
 */
export function drawSeams(ctx, seams, flowing = false) {
  if (!seams || seams.length === 0) return;
  
  const time = Date.now();
  for (const seam of seams) {
    drawSeam(ctx, seam, flowing, time);
  }
}

/**
 * Draw all pools in an array
 */
export function drawPools(ctx, pools) {
  if (!pools || pools.length === 0) return;
  
  const time = Date.now();
  for (const pool of pools) {
    drawPool(ctx, pool, time);
  }
}

/**
 * Update path flow progress during mending
 * @param {Array} paths - Array of paths to update
 * @param {number} progress - Overall mending progress (0-1)
 */
export function updatePathFlow(paths, progress) {
  if (!paths) return;
  
  const pathStart = 0.15;
  const pathEnd = 0.85;
  
  for (const path of paths) {
    if (progress > pathStart) {
      const pathProgress = (progress - pathStart) / (pathEnd - pathStart);
      path.flowProgress = Math.min(1, pathProgress * 1.2);
      path.progress = path.flowProgress;
    }
  }
}

/**
 * Update seam flow progress during mending (legacy)
 */
export function updateSeamFlow(seams, progress) {
  if (!seams) return;
  
  const seamStart = 0.15;
  const seamEnd = 0.85;
  
  for (const seam of seams) {
    if (progress > seamStart) {
      const seamProgress = (progress - seamStart) / (seamEnd - seamStart);
      seam.flowProgress = Math.min(1, seamProgress * 1.2);
      seam.progress = seam.flowProgress;
    }
  }
}

/**
 * Update pool progress during mending
 */
export function updatePoolFlow(pools, progress) {
  if (!pools) return;
  
  for (const pool of pools) {
    if (progress > 0.3) {
      pool.progress = Math.min(1, (progress - 0.3) / 0.5);
    }
  }
}

// For testing
export function _test() {
  const results = [];
  
  // Test calculatePathLength
  const testPoints = [{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 6, y: 4 }];
  const length = calculatePathLength(testPoints);
  
  results.push({
    name: 'calculatePathLength computes correctly',
    pass: Math.abs(length - 8) < 0.01, // 5 + 3 = 8
  });
  
  // Test getVisiblePoints
  const visible = getVisiblePoints(testPoints, 0.5);
  
  results.push({
    name: 'getVisiblePoints returns subset',
    pass: visible.length >= 1 && visible.length <= testPoints.length,
  });
  
  // Test getPointAtT
  const midPoint = getPointAtT(testPoints, 0.5);
  
  results.push({
    name: 'getPointAtT returns valid point',
    pass: 'x' in midPoint && 'y' in midPoint,
  });
  
  // Test updatePathFlow
  const testPaths = [
    { points: [{ x: 0, y: 0 }, { x: 100, y: 0 }], progress: 0, flowProgress: 0 },
  ];
  
  updatePathFlow(testPaths, 0.5);
  results.push({
    name: 'updatePathFlow updates progress',
    pass: testPaths[0].flowProgress > 0,
  });
  
  updatePathFlow(testPaths, 1.0);
  results.push({
    name: 'updatePathFlow caps at 1',
    pass: testPaths[0].flowProgress <= 1,
  });
  
  // Test updatePoolFlow
  const testPools = [{ x: 50, y: 50, size: 5, progress: 0 }];
  
  updatePoolFlow(testPools, 0.5);
  results.push({
    name: 'updatePoolFlow updates progress',
    pass: testPools[0].progress > 0,
  });
  
  return results;
}
