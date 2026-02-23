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
 * Create fragments where boundaries follow actual crack geometry
 * Each fragment's edges are derived from the sinuous crack paths
 */
function createFragmentsFromCrackGeometry(crackPaths, impactX, impactY, intensity) {
  const cx = canvas.centerX;
  const cy = canvas.centerY;
  const fragments = [];
  
  // Collect all crack paths with smoothed points
  const allPaths = [];
  function collectPaths(paths) {
    for (const path of paths) {
      if (path.points.length >= 2) {
        allPaths.push({ points: getSmoothedPoints(path, 3), raw: path.points });
      }
      if (path.branches && path.branches.length > 0) collectPaths(path.branches);
    }
  }
  collectPaths(crackPaths);
  
  // Sort crack endpoints by angle from center
  const endpoints = [];
  for (const path of allPaths) {
    const lastPt = path.points[path.points.length - 1];
    endpoints.push({ angle: Math.atan2(lastPt.y - cy, lastPt.x - cx), path });
  }
  endpoints.sort((a, b) => a.angle - b.angle);
  
  // Ensure minimum sectors for good fragmentation
  while (endpoints.length < 5) {
    let maxGap = 0, maxIdx = 0;
    for (let i = 0; i < endpoints.length; i++) {
      const next = (i + 1) % endpoints.length;
      let gap = endpoints[next].angle - endpoints[i].angle;
      if (next === 0) gap += Math.PI * 2;
      if (gap > maxGap) { maxGap = gap; maxIdx = i; }
    }
    const newAngle = endpoints[maxIdx].angle + maxGap / 2;
    const na = newAngle > Math.PI ? newAngle - Math.PI * 2 : newAngle;
    // Create synthetic radial crack for this gap
    endpoints.splice(maxIdx + 1, 0, {
      angle: na,
      path: { points: [{ x: cx, y: cy }, { x: cx + Math.cos(na) * canvas.bowlRadius * 0.95, y: cy + Math.sin(na) * canvas.bowlRadius * 0.95 }] },
      synthetic: true
    });
  }
  
  // Create fragment for each angular sector using actual crack paths as boundaries
  for (let i = 0; i < endpoints.length; i++) {
    const current = endpoints[i];
    const next = endpoints[(i + 1) % endpoints.length];
    const boundary = buildFragmentBoundary(current, next, cx, cy);
    
    if (boundary.length < 3) continue;
    
    // Calculate centroid
    let centroidX = 0, centroidY = 0;
    for (const pt of boundary) { centroidX += pt.x; centroidY += pt.y; }
    centroidX /= boundary.length;
    centroidY /= boundary.length;
    
    // Calculate area (skip tiny fragments)
    let area = 0;
    for (let j = 0; j < boundary.length; j++) {
      const p1 = boundary[j], p2 = boundary[(j + 1) % boundary.length];
      area += (p1.x * p2.y - p2.x * p1.y);
    }
    if (Math.abs(area) / 2 < 100) continue;
    
    // Calculate velocity based on impact position
    const impactDist = Math.hypot(centroidX - impactX, centroidY - impactY);
    const impactInfluence = Math.max(0.3, 1 - impactDist / (canvas.bowlRadius * 1.2));
    const outwardAngle = Math.atan2(centroidY - cy, centroidX - cx);
    const speed = (2 + Math.random() * 3) * intensity * impactInfluence;
    
    fragments.push({
      vertices: boundary.map(pt => ({ x: pt.x - centroidX, y: pt.y - centroidY })),
      x: centroidX, y: centroidY,
      originX: centroidX, originY: centroidY,
      vx: Math.cos(outwardAngle) * speed * 0.8 + (Math.random() - 0.5) * 1.5,
      vy: Math.sin(outwardAngle) * speed * 0.8 + (Math.random() - 0.5) * 1.5,
      rotation: 0,
      rotationVel: (Math.random() - 0.5) * 0.15 * intensity,
      thickness: 6 + Math.random() * 4,
    });
  }
  
  return fragments;
}

/**
 * Build a fragment boundary using crack path geometry
 * The boundary follows: crack1 (outward) -> arc along rim -> crack2 (inward)
 * This gives organic, sinuous edges that match the visible cracks
 */
function buildFragmentBoundary(crack1, crack2, cx, cy) {
  const boundary = [];
  const r = canvas.bowlRadius * 0.96;
  
  // Start at center
  boundary.push({ x: cx, y: cy });
  
  // Follow first crack outward (using its sinuous smoothed path)
  const path1 = crack1.path.points;
  for (let i = 0; i < path1.length; i++) {
    const pt = path1[i];
    if (Math.hypot(pt.x - cx, pt.y - cy) > 5) {
      boundary.push({ x: pt.x, y: pt.y });
    }
  }
  
  // Get endpoint angles for the rim arc
  const lastPt1 = path1[path1.length - 1];
  const lastPt2 = crack2.path.points[crack2.path.points.length - 1];
  const angle1 = Math.atan2(lastPt1.y - cy, lastPt1.x - cx);
  let angle2 = Math.atan2(lastPt2.y - cy, lastPt2.x - cx);
  if (angle2 < angle1) angle2 += Math.PI * 2;
  
  // Add arc points along the rim (with organic variation)
  const arcLength = angle2 - angle1;
  const numArcPoints = Math.max(2, Math.ceil(arcLength / 0.3));
  for (let i = 1; i < numArcPoints; i++) {
    const t = i / numArcPoints;
    const angle = angle1 + arcLength * t;
    const rVar = r + Math.sin(angle * 5) * 6 + (Math.random() - 0.5) * 4;
    boundary.push({ x: cx + Math.cos(angle) * rVar, y: cy + Math.sin(angle) * rVar });
  }
  
  // Follow second crack inward (reverse order, using its sinuous path)
  const path2 = crack2.path.points;
  for (let i = path2.length - 1; i >= 0; i--) {
    const pt = path2[i];
    if (Math.hypot(pt.x - cx, pt.y - cy) > 5) {
      boundary.push({ x: pt.x, y: pt.y });
    }
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
