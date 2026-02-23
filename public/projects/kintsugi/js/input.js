/**
 * Kintsugi - Input Module
 * Mouse and touch input handling
 */

import { canvas } from './config.js';

// Callbacks
let onHoldStart = null;
let onHoldEnd = null;
let onHoldMove = null;
let onHoverChange = null;

/**
 * Convert client coordinates to canvas coordinates
 * @param {number} clientX - Client X coordinate
 * @param {number} clientY - Client Y coordinate
 * @returns {Object} {x, y} canvas coordinates
 */
export function getCanvasCoords(clientX, clientY) {
  const rect = canvas.el.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (canvas.el.width / rect.width),
    y: (clientY - rect.top) * (canvas.el.height / rect.height),
  };
}

/**
 * Check if client coordinates are inside the bowl
 * @param {number} clientX - Client X coordinate
 * @param {number} clientY - Client Y coordinate
 * @returns {boolean}
 */
export function isInsideBowl(clientX, clientY) {
  const { x, y } = getCanvasCoords(clientX, clientY);
  return Math.hypot(x - canvas.centerX, y - canvas.centerY) < canvas.bowlRadius;
}

/**
 * Set up input event listeners
 * @param {Function} holdStart - Called when hold starts (x, y)
 * @param {Function} holdEnd - Called when hold ends
 * @param {Function} holdMove - Called when hold position moves (x, y)
 * @param {Function} hoverChange - Called when hover state changes (isHovering)
 */
export function setup(holdStart, holdEnd, holdMove, hoverChange) {
  onHoldStart = holdStart;
  onHoldEnd = holdEnd;
  onHoldMove = holdMove;
  onHoverChange = hoverChange;
  
  // Mouse events
  canvas.el.addEventListener('mousedown', handleMouseDown);
  canvas.el.addEventListener('mouseup', handleMouseUp);
  canvas.el.addEventListener('mouseleave', handleMouseUp);
  canvas.el.addEventListener('mousemove', handleMouseMove);
  
  // Touch events
  canvas.el.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.el.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.el.addEventListener('touchend', handleTouchEnd, { passive: false });
}

/**
 * Handle mouse down
 */
function handleMouseDown(e) {
  if (isInsideBowl(e.clientX, e.clientY) && onHoldStart) {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    onHoldStart(coords.x, coords.y);
  }
}

/**
 * Handle mouse up
 */
function handleMouseUp() {
  if (onHoldEnd) {
    onHoldEnd();
  }
}

/**
 * Handle mouse move
 */
function handleMouseMove(e) {
  const inside = isInsideBowl(e.clientX, e.clientY);
  
  if (onHoverChange) {
    onHoverChange(inside);
  }
  
  canvas.el.style.cursor = inside ? 'pointer' : 'default';
  
  if (onHoldMove) {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    onHoldMove(coords.x, coords.y);
  }
}

/**
 * Handle touch start
 */
function handleTouchStart(e) {
  e.preventDefault();
  const t = e.touches[0];
  if (isInsideBowl(t.clientX, t.clientY) && onHoldStart) {
    const coords = getCanvasCoords(t.clientX, t.clientY);
    onHoldStart(coords.x, coords.y);
  }
}

/**
 * Handle touch move
 */
function handleTouchMove(e) {
  e.preventDefault();
  if (onHoldMove) {
    const t = e.touches[0];
    const coords = getCanvasCoords(t.clientX, t.clientY);
    onHoldMove(coords.x, coords.y);
  }
}

/**
 * Handle touch end
 */
function handleTouchEnd(e) {
  e.preventDefault();
  if (onHoldEnd) {
    onHoldEnd();
  }
}

/**
 * Clean up event listeners
 */
export function cleanup() {
  canvas.el.removeEventListener('mousedown', handleMouseDown);
  canvas.el.removeEventListener('mouseup', handleMouseUp);
  canvas.el.removeEventListener('mouseleave', handleMouseUp);
  canvas.el.removeEventListener('mousemove', handleMouseMove);
  canvas.el.removeEventListener('touchstart', handleTouchStart);
  canvas.el.removeEventListener('touchmove', handleTouchMove);
  canvas.el.removeEventListener('touchend', handleTouchEnd);
}

// For testing
export function _test() {
  const results = [];
  
  // Store original canvas values
  const origEl = canvas.el;
  const origCenterX = canvas.centerX;
  const origCenterY = canvas.centerY;
  const origRadius = canvas.bowlRadius;
  
  // Set test values
  canvas.centerX = 200;
  canvas.centerY = 200;
  canvas.bowlRadius = 100;
  
  // Mock canvas element
  canvas.el = {
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 400 }),
    width: 400,
    height: 400,
  };
  
  // Test getCanvasCoords
  const coords = getCanvasCoords(200, 200);
  results.push({
    name: 'getCanvasCoords returns correct coordinates',
    pass: coords.x === 200 && coords.y === 200,
  });
  
  // Test isInsideBowl
  results.push({
    name: 'isInsideBowl returns true for center',
    pass: isInsideBowl(200, 200) === true,
  });
  
  results.push({
    name: 'isInsideBowl returns false for outside',
    pass: isInsideBowl(0, 0) === false,
  });
  
  results.push({
    name: 'isInsideBowl returns true for edge',
    pass: isInsideBowl(250, 200) === true, // 50 pixels from center, radius is 100
  });
  
  // Restore original values
  canvas.el = origEl;
  canvas.centerX = origCenterX;
  canvas.centerY = origCenterY;
  canvas.bowlRadius = origRadius;
  
  return results;
}
