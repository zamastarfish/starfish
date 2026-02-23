/**
 * Kintsugi - Configuration Module
 * Colors, constants, and sizing
 */

export const COLORS = {
  // Background
  bg: '#1a1918',
  
  // Ceramic
  ceramic: '#ebe7e2',
  ceramicMid: '#d8d4ce',
  ceramicShadow: '#c4bfb8',
  ceramicDark: '#a8a39c',
  ceramicEdge: '#f5f2ef',
  rawEdge: '#d0ccc6',
  
  // Gold
  gold: '#d4a847',
  goldBright: '#ffe566',
  goldMid: '#c9973d',
  goldDark: '#8b6914',
  goldGlow: 'rgba(255, 210, 80, 0.5)',
  
  // Lacquer (urushi)
  lacquerRed: '#8b2323',
  lacquerBlack: '#1a1a1a',
  lacquerGold: '#c9973d',
  lacquerCream: '#f5f0e8',
};

// Timing constants (ms)
export const TIMING = {
  maxHoldTime: 2500,        // Max hold for full intensity break
  pauseDuration: 2800,      // Pause after shatter before mending
  mendDuration: 16000,      // Gold mending animation duration
  settleTimeout: 2500,      // Max time to wait for fragments to settle
};

// Physics constants
export const PHYSICS = {
  gravity: 0.025,
  friction: 0.96,
  bounce: 0.4,
  boundaryMultiplier: 1.3,  // How far fragments can travel (× bowlRadius)
};

// Canvas/sizing state (mutable, set by resize)
export const canvas = {
  el: null,
  ctx: null,
  size: 0,
  centerX: 0,
  centerY: 0,
  bowlRadius: 0,
};

/**
 * Initialize canvas and calculate sizing
 */
export function initCanvas(canvasElement) {
  canvas.el = canvasElement;
  canvas.ctx = canvasElement.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

/**
 * Recalculate canvas size based on window
 */
export function resize() {
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  canvas.size = Math.min(minDim * 0.95, 650);
  canvas.el.width = canvas.size;
  canvas.el.height = canvas.size;
  canvas.centerX = canvas.size / 2;
  canvas.centerY = canvas.size / 2;
  canvas.bowlRadius = canvas.size * 0.36;
}

// For testing
export function _test() {
  const results = [];
  
  // Test COLORS has required keys
  const requiredColors = ['bg', 'ceramic', 'gold', 'goldBright', 'lacquerRed'];
  for (const key of requiredColors) {
    results.push({
      name: `COLORS.${key} exists`,
      pass: key in COLORS && typeof COLORS[key] === 'string',
    });
  }
  
  // Test TIMING values are positive numbers
  for (const [key, value] of Object.entries(TIMING)) {
    results.push({
      name: `TIMING.${key} is positive number`,
      pass: typeof value === 'number' && value > 0,
    });
  }
  
  // Test PHYSICS values
  results.push({
    name: 'PHYSICS.gravity is small positive',
    pass: PHYSICS.gravity > 0 && PHYSICS.gravity < 1,
  });
  
  return results;
}
