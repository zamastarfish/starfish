/**
 * Kintsugi - Fracture Module
 * Organic crack propagation with sinuous paths
 * 
 * Key concepts:
 * - CrackPath: Full polyline path data structure
 * - Progressive growth: Cracks extend over time during tension
 * - Sinuous curves: Catmull-Rom smoothed organic lines
 * - Shared paths: Same data used for cracks AND gold rendering
 */

import { canvas } from './config.js';

/**
 * Create a CrackPath data structure
 * @param {number} startX - Starting X
 * @param {number} startY - Starting Y
 * @param {number} angle - Initial propagation angle
 * @param {number} maxLength - Maximum length this crack can grow
 * @param {number} depth - Branch depth (0 = main crack)
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
    // Sinuous properties
    curvature: (Math.random() - 0.5) * 0.8,  // Tendency to curve left/right
    wavelength: 15 + Math.random() * 25,      // How often direction changes
    phase: Math.random() * Math.PI * 2,       // Phase offset for curves
  };
}

/**
 * Catmull-Rom spline interpolation for smooth curves
 */
function catmullRomPoint(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  
  return {
    x: 0.5 * (
      (2 * p1.x) +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
    ),
    y: 0.5 * (
      (2 * p1.y) +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
    )
  };
}

/**
 * Get smoothed points from a CrackPath using Catmull-Rom interpolation
 */
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
      const t = j / resolution;
      smoothed.push(catmullRomPoint(p0, p1, p2, p3, t));
    }
  }
  
  // Add final point
  smoothed.push(pts[pts.length - 1]);
  
  return smoothed;
}

/**
 * Grow a crack path by one step
 * @returns {boolean} True if crack grew, false if finished
 */
function growCrackStep(crackPath, intensity) {
  if (crackPath.finished) return false;
  
  const lastPoint = crackPath.points[crackPath.points.length - 1];
  
  // Variable step size for more organic feel
  const stepSize = 6 + Math.random() * 10;
  
  // Sinuous direction changes using sine wave + noise
  const waveInfluence = Math.sin(crackPath.currentLength / crackPath.wavelength + crackPath.phase) * 0.4;
  const drift = crackPath.curvature * 0.15;
  const noise = (Math.random() - 0.5) * 0.35;
  
  crackPath.angle += waveInfluence * 0.3 + drift + noise;
  
  const newX = lastPoint.x + Math.cos(crackPath.angle) * stepSize;
  const newY = lastPoint.y + Math.sin(crackPath.angle) * stepSize;
  
  crackPath.currentLength += stepSize;
  
  // Check bounds
  const distFromCenter = Math.hypot(newX - canvas.centerX, newY - canvas.centerY);
  if (distFromCenter > canvas.bowlRadius * 0.95) {
    crackPath.finished = true;
    return false;
  }
  
  // Check max length
  if (crackPath.currentLength >= crackPath.maxLength) {
    crackPath.finished = true;
    return false;
  }
  
  crackPath.points.push({ x: newX, y: newY });
  
  // Potential branching (only for main cracks, controlled by intensity)
  if (crackPath.depth < 3 && 
      crackPath.currentLength > 30 && 
      Math.random() < 0.08 * intensity * (1 - crackPath.depth * 0.3)) {
    const branchAngle = crackPath.angle + (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.7);
    const branchLength = crackPath.maxLength * (0.25 + Math.random() * 0.3);
    const branch = createCrackPath(newX, newY, branchAngle, branchLength, crackPath.depth + 1);
    crackPath.branches.push(branch);
  }
  
  return true;
}

/**
 * Initialize tension cracks at the start of a hold
 * @param {number} x - Break point X
 * @param {number} y - Break point Y
 * @param {number} numCracks - Number of main cracks
 * @returns {Array} Array of CrackPath objects
 */
export function initializeTensionCracks(x, y, numCracks) {
  const cracks = [];
  
  for (let i = 0; i < numCracks; i++) {
    const baseAngle = (i / numCracks) * Math.PI * 2;
    const angleJitter = (Math.random() - 0.5) * (Math.PI / numCracks) * 0.8;
    const angle = baseAngle + angleJitter;
    const maxLength = canvas.bowlRadius * (0.6 + Math.random() * 0.4);
    
    cracks.push(createCrackPath(x, y, angle, maxLength, 0));
  }
  
  return cracks;
}

/**
 * Grow tension cracks progressively during hold
 * Called each frame during TENSION state
 * @param {Array} crackPaths - Existing crack paths to grow
 * @param {number} intensity - Current hold intensity (0-1)
 * @param {number} x - Current break point X (for new cracks)
 * @param {number} y - Current break point Y (for new cracks)
 * @returns {Array} Updated crack paths
 */
export function growTensionCracks(crackPaths, intensity, x, y) {
  // Initialize if empty
  if (crackPaths.length === 0) {
    const numInitial = Math.floor(4 + intensity * 4);
    return initializeTensionCracks(x, y, numInitial);
  }
  
  // Grow existing cracks
  const growthRate = Math.floor(2 + intensity * 4); // Steps per call
  
  // Collect all cracks including branches
  function collectAllCracks(cracks, result = []) {
    for (const crack of cracks) {
      result.push(crack);
      if (crack.branches.length > 0) {
        collectAllCracks(crack.branches, result);
      }
    }
    return result;
  }
  
  const allCracks = collectAllCracks(crackPaths);
  
  // Grow each crack
  for (let step = 0; step < growthRate; step++) {
    for (const crack of allCracks) {
      growCrackStep(crack, intensity);
    }
    // Re-collect to include any new branches
    allCracks.length = 0;
    collectAllCracks(crackPaths, allCracks);
  }
  
  // Add more main cracks as intensity increases
  const targetCracks = Math.floor(6 + intensity * 10);
  if (crackPaths.length < targetCracks && Math.random() < 0.15 * intensity) {
    const newAngle = Math.random() * Math.PI * 2;
    const maxLength = canvas.bowlRadius * (0.4 + intensity * 0.5);
    crackPaths.push(createCrackPath(x, y, newAngle, maxLength, 0));
  }
  
  return crackPaths;
}

/**
 * Finalize crack paths for breaking - grow to completion
 * @param {Array} crackPaths - Tension crack paths
 * @param {number} intensity - Break intensity
 * @returns {Array} Completed crack paths
 */
export function finalizeCracks(crackPaths, intensity) {
  function collectAllCracks(cracks, result = []) {
    for (const crack of cracks) {
      result.push(crack);
      if (crack.branches.length > 0) {
        collectAllCracks(crack.branches, result);
      }
    }
    return result;
  }
  
  // Grow all cracks to completion
  let iterations = 0;
  const maxIterations = 500;
  
  while (iterations < maxIterations) {
    const allCracks = collectAllCracks(crackPaths);
    let anyGrew = false;
    
    for (const crack of allCracks) {
      if (growCrackStep(crack, intensity)) {
        anyGrew = true;
      }
    }
    
    if (!anyGrew) break;
    iterations++;
  }
  
  return crackPaths;
}

/**
 * Create organic fracture pattern from finalized tension cracks
 * @param {number} impactX - Impact X coordinate
 * @param {number} impactY - Impact Y coordinate
 * @param {number} intensity - Break intensity (0-1)
 * @param {Array} existingCracks - Pre-grown tension cracks (optional)
 * @returns {Object} { fragments, paths, seams, pools }
 */
export function createFracture(impactX, impactY, intensity, existingCracks = null) {
  let crackPaths;
  
  if (existingCracks && existingCracks.length > 0) {
    // Finalize the existing tension cracks
    crackPaths = finalizeCracks(existingCracks, intensity);
  } else {
    // Generate new cracks from scratch
    const numMainCracks = Math.floor(5 + intensity * 8);
    crackPaths = initializeTensionCracks(impactX, impactY, numMainCracks);
    crackPaths = finalizeCracks(crackPaths, intensity);
  }
  
  // Add concentric ring cracks for high intensity
  if (intensity > 0.5) {
    addRingCracks(intensity, crackPaths);
  }
  
  // Flatten all paths (including branches) for rendering
  const allPaths = flattenCrackPaths(crackPaths);
  
  // Convert to legacy seams format (for compatibility)
  const seams = pathsToSeams(allPaths);
  
  // Find intersection points for gold pooling
  const pools = findIntersections(seams);
  
  // Create fragments from crack network
  const fragments = createFragmentsFromCracks(crackPaths, impactX, impactY, intensity);
  
  return { 
    fragments, 
    paths: allPaths,  // Full polyline paths for gold
    seams,            // Legacy format
    pools 
  };
}

/**
 * Flatten crack paths (including nested branches) into array
 */
function flattenCrackPaths(crackPaths) {
  const result = [];
  
  function flatten(paths) {
    for (const path of paths) {
      // Add the smoothed version of this path
      result.push({
        points: getSmoothedPoints(path),
        rawPoints: path.points,
        thickness: path.thickness,
        depth: path.depth,
        progress: 0,
        flowProgress: 0,
      });
      
      if (path.branches.length > 0) {
        flatten(path.branches);
      }
    }
  }
  
  flatten(crackPaths);
  return result;
}

/**
 * Add concentric ring cracks for high-intensity breaks
 */
function addRingCracks(intensity, crackPaths) {
  const numRings = Math.floor(1 + intensity * 2);
  
  for (let ring = 0; ring < numRings; ring++) {
    const radius = canvas.bowlRadius * (0.25 + ring * 0.25) * (0.8 + Math.random() * 0.4);
    const arcStart = Math.random() * Math.PI * 2;
    const arcLength = Math.PI * (0.3 + Math.random() * 0.5);
    
    const path = createCrackPath(
      canvas.centerX + Math.cos(arcStart) * radius,
      canvas.centerY + Math.sin(arcStart) * radius,
      arcStart + Math.PI / 2,
      radius * arcLength,
      1
    );
    
    // Generate arc points with sinuous variation
    const steps = 15;
    path.points = [];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const a = arcStart + t * arcLength;
      const r = radius + Math.sin(t * 6 + ring) * 8 + (Math.random() - 0.5) * 6;
      path.points.push({
        x: canvas.centerX + Math.cos(a) * r,
        y: canvas.centerY + Math.sin(a) * r,
      });
    }
    
    path.finished = true;
    crackPaths.push(path);
  }
}

/**
 * Convert full paths to legacy seam format
 */
function pathsToSeams(paths) {
  const seams = [];
  
  for (const path of paths) {
    const points = path.points;
    for (let i = 0; i < points.length - 1; i++) {
      seams.push({
        x1: points[i].x,
        y1: points[i].y,
        x2: points[i + 1].x,
        y2: points[i + 1].y,
        progress: 0,
        flowProgress: 0,
        thickness: path.thickness,
        isJunction: i === 0 || i === points.length - 2,
      });
    }
  }
  
  return seams;
}

/**
 * Find intersection points between seams for gold pooling
 */
function findIntersections(seams) {
  const pools = [];
  
  for (let i = 0; i < seams.length; i++) {
    for (let j = i + 1; j < seams.length; j++) {
      const intersection = lineIntersection(seams[i], seams[j]);
      if (intersection) {
        pools.push({
          x: intersection.x,
          y: intersection.y,
          size: 4 + Math.random() * 4,
          progress: 0,
        });
      }
    }
  }
  
  return pools;
}

/**
 * Calculate intersection point of two line segments
 */
function lineIntersection(s1, s2) {
  const x1 = s1.x1, y1 = s1.y1, x2 = s1.x2, y2 = s1.y2;
  const x3 = s2.x1, y3 = s2.y1, x4 = s2.x2, y4 = s2.y2;
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 0.001) return null;
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  // Only count intersections within the middle of segments
  if (t > 0.1 && t < 0.9 && u > 0.1 && u < 0.9) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
    };
  }
  
  return null;
}

/**
 * Create fragment shapes from crack network
 */
function createFragmentsFromCracks(crackPaths, impactX, impactY, intensity) {
  const fragments = [];
  
  // Collect all endpoint angles from all cracks (including branches)
  const angles = [];
  
  function collectAngles(paths) {
    for (const path of paths) {
      if (path.points.length > 1) {
        const lastPt = path.points[path.points.length - 1];
        const angle = Math.atan2(lastPt.y - canvas.centerY, lastPt.x - canvas.centerX);
        angles.push(angle);
      }
      if (path.branches.length > 0) {
        collectAngles(path.branches);
      }
    }
  }
  
  collectAngles(crackPaths);
  
  const numSlices = Math.max(6, angles.length);
  
  // Sort and fill gaps
  angles.sort((a, b) => a - b);
  
  while (angles.length < numSlices) {
    let maxGap = 0;
    let maxIdx = 0;
    for (let i = 0; i < angles.length; i++) {
      const next = (i + 1) % angles.length;
      let gap = angles[next] - angles[i];
      if (next === 0) gap += Math.PI * 2;
      if (gap > maxGap) {
        maxGap = gap;
        maxIdx = i;
      }
    }
    const newAngle = angles[maxIdx] + maxGap / 2;
    angles.splice(maxIdx + 1, 0, newAngle > Math.PI ? newAngle - Math.PI * 2 : newAngle);
  }
  
  // Create fragment for each angular slice
  for (let i = 0; i < angles.length; i++) {
    const a1 = angles[i];
    const a2 = angles[(i + 1) % angles.length];
    
    const verts = [];
    verts.push({ x: canvas.centerX, y: canvas.centerY });
    
    // Outer edge with irregularity
    const steps = 4;
    let a = a1;
    const aDiff = ((a2 - a1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const aStep = aDiff / steps;
    
    for (let s = 0; s <= steps; s++) {
      const r = canvas.bowlRadius * (0.95 + (Math.random() - 0.5) * 0.08);
      verts.push({
        x: canvas.centerX + Math.cos(a) * r,
        y: canvas.centerY + Math.sin(a) * r,
      });
      a += aStep;
    }
    
    // Calculate centroid
    let cx = 0, cy = 0;
    for (const v of verts) { cx += v.x; cy += v.y; }
    cx /= verts.length;
    cy /= verts.length;
    
    // Velocity based on distance from impact
    const impactDist = Math.hypot(cx - impactX, cy - impactY);
    const impactInfluence = Math.max(0.3, 1 - impactDist / (canvas.bowlRadius * 1.2));
    
    const outwardAngle = Math.atan2(cy - canvas.centerY, cx - canvas.centerX);
    const speed = (2 + Math.random() * 3) * intensity * impactInfluence;
    
    fragments.push({
      vertices: verts.map(v => ({ x: v.x - cx, y: v.y - cy })),
      x: cx,
      y: cy,
      originX: cx,
      originY: cy,
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
 * Generate tension crack visualization (deprecated - use growTensionCracks)
 * Kept for backward compatibility
 */
export function generateTensionCracks(x, y, intensity) {
  // Convert from new crack path format to old format
  const crackPaths = initializeTensionCracks(x, y, Math.floor(5 + intensity * 10));
  
  // Grow based on intensity
  const growSteps = Math.floor(intensity * 20);
  for (let i = 0; i < growSteps; i++) {
    for (const path of crackPaths) {
      growCrackStep(path, intensity);
    }
  }
  
  // Convert to old format
  const result = [];
  function flatten(paths) {
    for (const path of paths) {
      result.push({ points: path.points });
      if (path.branches.length > 0) {
        flatten(path.branches);
      }
    }
  }
  flatten(crackPaths);
  
  return result;
}

// For testing
export function _test() {
  const results = [];
  
  // Store original values
  const origCenterX = canvas.centerX;
  const origCenterY = canvas.centerY;
  const origRadius = canvas.bowlRadius;
  
  // Set test values
  canvas.centerX = 200;
  canvas.centerY = 200;
  canvas.bowlRadius = 100;
  
  // Test createFracture returns expected structure
  const result = createFracture(200, 200, 0.5);
  
  results.push({
    name: 'createFracture() returns fragments array',
    pass: Array.isArray(result.fragments) && result.fragments.length > 0,
  });
  
  results.push({
    name: 'createFracture() returns paths array',
    pass: Array.isArray(result.paths) && result.paths.length > 0,
  });
  
  results.push({
    name: 'createFracture() returns seams array',
    pass: Array.isArray(result.seams) && result.seams.length > 0,
  });
  
  results.push({
    name: 'createFracture() returns pools array',
    pass: Array.isArray(result.pools),
  });
  
  // Test path structure
  if (result.paths.length > 0) {
    const path = result.paths[0];
    results.push({
      name: 'path has points array',
      pass: Array.isArray(path.points) && path.points.length > 1,
    });
    results.push({
      name: 'path has thickness',
      pass: typeof path.thickness === 'number',
    });
  }
  
  // Test fragment structure
  if (result.fragments.length > 0) {
    const frag = result.fragments[0];
    results.push({
      name: 'fragment has required properties',
      pass: 'vertices' in frag && 'x' in frag && 'y' in frag && 'vx' in frag && 'vy' in frag,
    });
  }
  
  // Test growTensionCracks
  let cracks = [];
  cracks = growTensionCracks(cracks, 0.5, 200, 200);
  
  results.push({
    name: 'growTensionCracks initializes cracks',
    pass: cracks.length > 0,
  });
  
  const initialLength = cracks[0].currentLength;
  cracks = growTensionCracks(cracks, 0.5, 200, 200);
  
  results.push({
    name: 'growTensionCracks extends cracks',
    pass: cracks[0].currentLength > initialLength || cracks[0].finished,
  });
  
  // Test Catmull-Rom smoothing
  const testPath = { points: [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 20, y: 5 },
    { x: 30, y: 15 }
  ]};
  const smoothed = getSmoothedPoints(testPath);
  
  results.push({
    name: 'getSmoothedPoints increases point count',
    pass: smoothed.length > testPath.points.length,
  });
  
  // Test intensity affects output
  const lowIntensity = createFracture(200, 200, 0.2);
  const highIntensity = createFracture(200, 200, 1.0);
  
  results.push({
    name: 'higher intensity creates more fragments',
    pass: highIntensity.fragments.length >= lowIntensity.fragments.length,
  });
  
  // Test line intersection
  const s1 = { x1: 0, y1: 0, x2: 10, y2: 10 };
  const s2 = { x1: 0, y1: 10, x2: 10, y2: 0 };
  const intersection = lineIntersection(s1, s2);
  
  results.push({
    name: 'lineIntersection finds crossing lines',
    pass: intersection !== null && Math.abs(intersection.x - 5) < 0.1,
  });
  
  // Restore original values
  canvas.centerX = origCenterX;
  canvas.centerY = origCenterY;
  canvas.bowlRadius = origRadius;
  
  return results;
}
