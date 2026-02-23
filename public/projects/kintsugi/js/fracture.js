/**
 * Kintsugi - Fracture Module
 * Organic crack propagation with sinuous paths
 * 
 * Key concepts:
 * - CrackPath: Full polyline path data structure
 * - Progressive growth: Cracks extend over time during tension
 * - Sinuous curves: Catmull-Rom smoothed organic lines
 * - Shared paths: Same data used for cracks AND gold rendering
 * - Graph-based fragments: Crack network defines fragment boundaries
 */

import { canvas } from './config.js';

/**
 * Create a CrackPath data structure
 */
function createCrackPath(startX, startY, angle, maxLength, depth = 0) {
  return {
    points: [{ x: startX, y: startY }],
    angle: angle,
    maxLength: maxLength,
    currentLength: 0,
    depth: depth,
    thickness: 2.5 + Math.random() * 2.5 - depth * 0.5,
    branches: [],
    finished: false,
    curvature: (Math.random() - 0.5) * 0.8,
    wavelength: 15 + Math.random() * 25,
    phase: Math.random() * Math.PI * 2,
  };
}

function catmullRomPoint(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  
  return {
    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
  };
}

export function getSmoothedPoints(crackPath, resolution = 4) {
  const pts = crackPath.points;
  if (pts.length < 2) return pts;
  if (pts.length === 2) return pts;
  
  const smoothed = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    
    for (let j = 0; j < resolution; j++) {
      smoothed.push(catmullRomPoint(p0, p1, p2, p3, j / resolution));
    }
  }
  smoothed.push(pts[pts.length - 1]);
  return smoothed;
}

function growCrackStep(crackPath, intensity) {
  if (crackPath.finished) return false;
  
  const lastPoint = crackPath.points[crackPath.points.length - 1];
  const stepSize = 6 + Math.random() * 10;
  
  const waveInfluence = Math.sin(crackPath.currentLength / crackPath.wavelength + crackPath.phase) * 0.4;
  crackPath.angle += waveInfluence * 0.3 + crackPath.curvature * 0.15 + (Math.random() - 0.5) * 0.35;
  
  const newX = lastPoint.x + Math.cos(crackPath.angle) * stepSize;
  const newY = lastPoint.y + Math.sin(crackPath.angle) * stepSize;
  crackPath.currentLength += stepSize;
  
  const distFromCenter = Math.hypot(newX - canvas.centerX, newY - canvas.centerY);
  if (distFromCenter > canvas.bowlRadius * 0.95 || crackPath.currentLength >= crackPath.maxLength) {
    crackPath.finished = true;
    return false;
  }
  
  crackPath.points.push({ x: newX, y: newY });
  
  if (crackPath.depth < 3 && crackPath.currentLength > 30 && Math.random() < 0.08 * intensity * (1 - crackPath.depth * 0.3)) {
    const branchAngle = crackPath.angle + (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.7);
    crackPath.branches.push(createCrackPath(newX, newY, branchAngle, crackPath.maxLength * (0.25 + Math.random() * 0.3), crackPath.depth + 1));
  }
  
  return true;
}

export function initializeTensionCracks(x, y, numCracks) {
  const cracks = [];
  for (let i = 0; i < numCracks; i++) {
    const baseAngle = (i / numCracks) * Math.PI * 2;
    const angle = baseAngle + (Math.random() - 0.5) * (Math.PI / numCracks) * 0.8;
    cracks.push(createCrackPath(x, y, angle, canvas.bowlRadius * (0.6 + Math.random() * 0.4), 0));
  }
  return cracks;
}

export function growTensionCracks(crackPaths, intensity, x, y) {
  if (crackPaths.length === 0) return initializeTensionCracks(x, y, Math.floor(4 + intensity * 4));
  
  function collectAllCracks(cracks, result = []) {
    for (const crack of cracks) {
      result.push(crack);
      if (crack.branches.length > 0) collectAllCracks(crack.branches, result);
    }
    return result;
  }
  
  const allCracks = collectAllCracks(crackPaths);
  const growthRate = Math.floor(2 + intensity * 4);
  
  for (let step = 0; step < growthRate; step++) {
    for (const crack of allCracks) growCrackStep(crack, intensity);
    allCracks.length = 0;
    collectAllCracks(crackPaths, allCracks);
  }
  
  const targetCracks = Math.floor(6 + intensity * 10);
  if (crackPaths.length < targetCracks && Math.random() < 0.15 * intensity) {
    crackPaths.push(createCrackPath(x, y, Math.random() * Math.PI * 2, canvas.bowlRadius * (0.4 + intensity * 0.5), 0));
  }
  
  return crackPaths;
}

export function finalizeCracks(crackPaths, intensity) {
  function collectAllCracks(cracks, result = []) {
    for (const crack of cracks) {
      result.push(crack);
      if (crack.branches.length > 0) collectAllCracks(crack.branches, result);
    }
    return result;
  }
  
  let iterations = 0;
  while (iterations++ < 500) {
    const allCracks = collectAllCracks(crackPaths);
    let anyGrew = false;
    for (const crack of allCracks) if (growCrackStep(crack, intensity)) anyGrew = true;
    if (!anyGrew) break;
  }
  return crackPaths;
}

export function createFracture(impactX, impactY, intensity, existingCracks = null) {
  let crackPaths = existingCracks && existingCracks.length > 0
    ? finalizeCracks(existingCracks, intensity)
    : finalizeCracks(initializeTensionCracks(impactX, impactY, Math.floor(5 + intensity * 8)), intensity);
  
  if (intensity > 0.5) addRingCracks(intensity, crackPaths);
  
  const allPaths = flattenCrackPaths(crackPaths);
  const seams = pathsToSeams(allPaths);
  const pools = findIntersections(seams);
  const fragments = createFragmentsFromCrackGeometry(crackPaths, impactX, impactY, intensity);
  
  return { fragments, paths: allPaths, seams, pools };
}

function flattenCrackPaths(crackPaths) {
  const result = [];
  function flatten(paths) {
    for (const path of paths) {
      result.push({
        points: getSmoothedPoints(path),
        rawPoints: path.points,
        thickness: path.thickness,
        depth: path.depth,
        progress: 0,
        flowProgress: 0,
      });
      if (path.branches.length > 0) flatten(path.branches);
    }
  }
  flatten(crackPaths);
  return result;
}

function addRingCracks(intensity, crackPaths) {
  const numRings = Math.floor(1 + intensity * 2);
  for (let ring = 0; ring < numRings; ring++) {
    const radius = canvas.bowlRadius * (0.25 + ring * 0.25) * (0.8 + Math.random() * 0.4);
    const arcStart = Math.random() * Math.PI * 2;
    const arcLength = Math.PI * (0.3 + Math.random() * 0.5);
    
    const path = createCrackPath(canvas.centerX + Math.cos(arcStart) * radius, canvas.centerY + Math.sin(arcStart) * radius, arcStart + Math.PI / 2, radius * arcLength, 1);
    path.points = [];
    for (let s = 0; s <= 15; s++) {
      const t = s / 15;
      const a = arcStart + t * arcLength;
      const r = radius + Math.sin(t * 6 + ring) * 8 + (Math.random() - 0.5) * 6;
      path.points.push({ x: canvas.centerX + Math.cos(a) * r, y: canvas.centerY + Math.sin(a) * r });
    }
    path.finished = true;
    crackPaths.push(path);
  }
}

function pathsToSeams(paths) {
  const seams = [];
  for (const path of paths) {
    const points = path.points;
    for (let i = 0; i < points.length - 1; i++) {
      seams.push({
        x1: points[i].x, y1: points[i].y,
        x2: points[i + 1].x, y2: points[i + 1].y,
        progress: 0, flowProgress: 0,
        thickness: path.thickness,
        isJunction: i === 0 || i === points.length - 2,
      });
    }
  }
  return seams;
}

function findIntersections(seams) {
  const pools = [];
  for (let i = 0; i < seams.length; i++) {
    for (let j = i + 1; j < seams.length; j++) {
      const intersection = lineIntersection(seams[i], seams[j]);
      if (intersection) pools.push({ x: intersection.x, y: intersection.y, size: 4 + Math.random() * 4, progress: 0 });
    }
  }
  return pools;
}

function lineIntersection(s1, s2) {
  const x1 = s1.x1, y1 = s1.y1, x2 = s1.x2, y2 = s1.y2;
  const x3 = s2.x1, y3 = s2.y1, x4 = s2.x2, y4 = s2.y2;
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 0.001) return null;
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  if (t > 0.1 && t < 0.9 && u > 0.1 && u < 0.9) {
    return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
  }
  return null;
}

// ===========================================================================
// CRACK-GEOMETRY-BASED FRAGMENT GENERATION
// Fragments use the actual crack paths as their boundaries
// ===========================================================================

/**
 * Create fragments centered on IMPACT POINT using crack paths as dividers
 * Falls back to simple wedges if not enough cracks
 */
function createFragmentsFromCrackGeometry(crackPaths, impactX, impactY, intensity) {
  const cx = canvas.centerX;
  const cy = canvas.centerY;
  const r = canvas.bowlRadius;
  const fragments = [];
  
  // Collect all main crack paths (not branches) with angles from IMPACT point
  const mainCracks = [];
  for (const path of crackPaths) {
    if (path.points.length >= 2) {
      const smoothed = getSmoothedPoints(path, 3);
      const lastPt = smoothed[smoothed.length - 1];
      const angle = Math.atan2(lastPt.y - impactY, lastPt.x - impactX);
      mainCracks.push({ points: smoothed, angle: angle });
    }
  }
  
  // Sort by angle
  mainCracks.sort((a, b) => a.angle - b.angle);
  
  // Use cracks as fragment dividers if we have enough
  if (mainCracks.length >= 3) {
    for (let i = 0; i < mainCracks.length; i++) {
      const crack1 = mainCracks[i];
      const crack2 = mainCracks[(i + 1) % mainCracks.length];
      
      const boundary = buildCrackBoundedFragment(crack1, crack2, impactX, impactY, cx, cy, r);
      addFragmentFromBoundary(fragments, boundary, impactX, impactY, intensity);
    }
  } else {
    // Fallback: simple wedges from bowl center
    const numFragments = 8;
    const angleStep = (Math.PI * 2) / numFragments;
    for (let i = 0; i < numFragments; i++) {
      const boundary = buildSimpleWedge(i * angleStep - Math.PI, (i + 1) * angleStep - Math.PI, cx, cy, r);
      addFragmentFromBoundary(fragments, boundary, impactX, impactY, intensity);
    }
  }
  
  return fragments;
}

/**
 * Build fragment boundary between two crack paths, centered on impact point
 */
function buildCrackBoundedFragment(crack1, crack2, impactX, impactY, cx, cy, r) {
  const boundary = [];
  const rimR = r * 0.98;
  
  // Start at impact point
  boundary.push({ x: impactX, y: impactY });
  
  // Follow crack1 outward (skip points too close to impact)
  for (const pt of crack1.points) {
    if (Math.hypot(pt.x - impactX, pt.y - impactY) > 8) {
      boundary.push({ x: pt.x, y: pt.y });
    }
  }
  
  // Ensure we reach the rim
  const last1 = boundary[boundary.length - 1];
  if (Math.hypot(last1.x - cx, last1.y - cy) < rimR * 0.8) {
    const extAngle = Math.atan2(last1.y - impactY, last1.x - impactX);
    boundary.push({ x: cx + Math.cos(extAngle) * rimR, y: cy + Math.sin(extAngle) * rimR });
  }
  
  // Arc along rim to crack2
  const angle1 = Math.atan2(boundary[boundary.length - 1].y - cy, boundary[boundary.length - 1].x - cx);
  const crack2End = crack2.points[crack2.points.length - 1];
  let angle2 = Math.atan2(crack2End.y - cy, crack2End.x - cx);
  
  // Go the right way around (short arc vs long arc based on crack angles)
  let arcDelta = angle2 - angle1;
  if (arcDelta < 0) arcDelta += Math.PI * 2;
  if (arcDelta > Math.PI * 1.8) arcDelta -= Math.PI * 2; // Wrap if needed
  
  const arcSteps = Math.max(2, Math.ceil(Math.abs(arcDelta) / 0.3));
  for (let s = 1; s <= arcSteps; s++) {
    const t = s / arcSteps;
    const angle = angle1 + arcDelta * t;
    const wobble = Math.sin(angle * 7) * 2;
    boundary.push({ x: cx + Math.cos(angle) * (rimR + wobble), y: cy + Math.sin(angle) * (rimR + wobble) });
  }
  
  // Follow crack2 back inward (reverse order)
  for (let i = crack2.points.length - 1; i >= 0; i--) {
    const pt = crack2.points[i];
    if (Math.hypot(pt.x - impactX, pt.y - impactY) > 8) {
      boundary.push({ x: pt.x, y: pt.y });
    }
  }
  
  return boundary;
}

/**
 * Add a fragment to the array from boundary points
 */
function addFragmentFromBoundary(fragments, boundary, impactX, impactY, intensity) {
  if (boundary.length < 3) return;
  
  // Calculate centroid
  let centroidX = 0, centroidY = 0;
  for (const pt of boundary) { centroidX += pt.x; centroidY += pt.y; }
  centroidX /= boundary.length;
  centroidY /= boundary.length;
  
  if (isNaN(centroidX) || isNaN(centroidY)) return;
  
  // Velocity outward from impact
  const outAngle = Math.atan2(centroidY - impactY, centroidX - impactX);
  const speed = (1.5 + Math.random() * 2) * intensity;
  
  fragments.push({
    vertices: boundary.map(pt => ({ x: pt.x - centroidX, y: pt.y - centroidY })),
    x: centroidX,
    y: centroidY,
    originX: centroidX,
    originY: centroidY,
    vx: Math.cos(outAngle) * speed + (Math.random() - 0.5) * 1,
    vy: Math.sin(outAngle) * speed + (Math.random() - 0.5) * 1,
    rotation: 0,
    rotationVel: (Math.random() - 0.5) * 0.1 * intensity,
    thickness: 6 + Math.random() * 4,
  });
}

/**
 * Build a simple pie wedge - GUARANTEED to create valid geometry
 * No crack path logic, just pure geometric wedge with organic edges
 */
function buildSimpleWedge(startAngle, endAngle, cx, cy, r) {
  const boundary = [];
  const rimR = r * 0.98;
  
  // Seed for consistent randomness per wedge
  const seed = startAngle * 1000;
  const wobble = (t, offset) => Math.sin(t * Math.PI * 2 + seed + offset) * 6;
  
  // 1. Start at center
  boundary.push({ x: cx, y: cy });
  
  // 2. Left edge: sinuous line from center to rim along startAngle
  const leftSteps = 5;
  for (let s = 1; s <= leftSteps; s++) {
    const t = s / leftSteps;
    const dist = t * rimR;
    const w = wobble(t, 0) * (1 - t * 0.3); // Less wobble near rim
    boundary.push({
      x: cx + Math.cos(startAngle) * dist + Math.cos(startAngle + Math.PI/2) * w,
      y: cy + Math.sin(startAngle) * dist + Math.sin(startAngle + Math.PI/2) * w
    });
  }
  
  // 3. Arc along rim
  const arcSteps = Math.max(4, Math.ceil(Math.abs(endAngle - startAngle) / 0.2));
  for (let s = 1; s <= arcSteps; s++) {
    const t = s / arcSteps;
    const angle = startAngle + (endAngle - startAngle) * t;
    const rimWobble = Math.sin(angle * 7 + seed) * 2 + Math.sin(angle * 13) * 1.5;
    boundary.push({
      x: cx + Math.cos(angle) * (rimR + rimWobble),
      y: cy + Math.sin(angle) * (rimR + rimWobble)
    });
  }
  
  // 4. Right edge: sinuous line from rim back to center along endAngle
  const rightSteps = 5;
  for (let s = rightSteps - 1; s >= 1; s--) {
    const t = s / rightSteps;
    const dist = t * rimR;
    const w = wobble(t, 3.14) * (1 - t * 0.3);
    boundary.push({
      x: cx + Math.cos(endAngle) * dist + Math.cos(endAngle + Math.PI/2) * w,
      y: cy + Math.sin(endAngle) * dist + Math.sin(endAngle + Math.PI/2) * w
    });
  }
  
  return boundary;
}

export function generateTensionCracks(x, y, intensity) {
  const crackPaths = initializeTensionCracks(x, y, Math.floor(5 + intensity * 10));
  const growSteps = Math.floor(intensity * 20);
  for (let i = 0; i < growSteps; i++) {
    for (const path of crackPaths) growCrackStep(path, intensity);
  }
  
  const result = [];
  function flatten(paths) {
    for (const path of paths) {
      result.push({ points: path.points });
      if (path.branches.length > 0) flatten(path.branches);
    }
  }
  flatten(crackPaths);
  return result;
}

export function _test() {
  const results = [];
  const origCenterX = canvas.centerX, origCenterY = canvas.centerY, origRadius = canvas.bowlRadius;
  canvas.centerX = 200; canvas.centerY = 200; canvas.bowlRadius = 100;
  
  const result = createFracture(200, 200, 0.5);
  
  results.push({ name: 'createFracture() returns fragments array', pass: Array.isArray(result.fragments) && result.fragments.length > 0 });
  results.push({ name: 'createFracture() returns paths array', pass: Array.isArray(result.paths) && result.paths.length > 0 });
  results.push({ name: 'createFracture() returns seams array', pass: Array.isArray(result.seams) && result.seams.length > 0 });
  results.push({ name: 'createFracture() returns pools array', pass: Array.isArray(result.pools) });
  
  if (result.paths.length > 0) {
    const path = result.paths[0];
    results.push({ name: 'path has points array', pass: Array.isArray(path.points) && path.points.length > 1 });
    results.push({ name: 'path has thickness', pass: typeof path.thickness === 'number' });
  }
  
  if (result.fragments.length > 0) {
    const frag = result.fragments[0];
    results.push({ name: 'fragment has required properties', pass: 'vertices' in frag && 'x' in frag && 'y' in frag && 'vx' in frag && 'vy' in frag });
    results.push({ name: 'fragments have organic shapes (>4 vertices)', pass: frag.vertices.length > 4 });
  }
  
  let cracks = growTensionCracks([], 0.5, 200, 200);
  results.push({ name: 'growTensionCracks initializes cracks', pass: cracks.length > 0 });
  
  const initialLength = cracks[0].currentLength;
  cracks = growTensionCracks(cracks, 0.5, 200, 200);
  results.push({ name: 'growTensionCracks extends cracks', pass: cracks[0].currentLength > initialLength || cracks[0].finished });
  
  const testPath = { points: [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 5 }, { x: 30, y: 15 }] };
  results.push({ name: 'getSmoothedPoints increases point count', pass: getSmoothedPoints(testPath).length > testPath.points.length });
  
  const lowIntensity = createFracture(200, 200, 0.2);
  const highIntensity = createFracture(200, 200, 1.0);
  results.push({ name: 'higher intensity creates more fragments', pass: highIntensity.fragments.length >= lowIntensity.fragments.length });
  
  const s1 = { x1: 0, y1: 0, x2: 10, y2: 10 }, s2 = { x1: 0, y1: 10, x2: 10, y2: 0 };
  const intersection = lineIntersection(s1, s2);
  results.push({ name: 'lineIntersection finds crossing lines', pass: intersection !== null && Math.abs(intersection.x - 5) < 0.1 });
  
  canvas.centerX = origCenterX; canvas.centerY = origCenterY; canvas.bowlRadius = origRadius;
  return results;
}
