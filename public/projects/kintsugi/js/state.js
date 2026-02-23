/**
 * Kintsugi - State Machine Module
 * Manages application state and transitions
 */

// State enum
export const States = {
  WHOLE: 'whole',
  TENSION: 'tension',
  SHATTERED: 'shattered',
  PAUSE: 'pause',
  MENDING: 'mending',
};

// Central state object
export const state = {
  current: States.WHOLE,
  timer: 0,
  
  // Interaction
  isHolding: false,
  holdStart: 0,
  holdTime: 0,
  isHovering: false,
  breakPoint: { x: 0, y: 0 },
  
  // Animation
  breathPhase: 0,
  breakCount: 0,
  
  // Collections (populated by other modules)
  fragments: [],
  goldSeams: [],       // Legacy seams (kept for compatibility)
  goldPaths: [],       // Full polyline paths for gold rendering
  dustParticles: [],
  goldParticles: [],
  goldPools: [],
  
  // Growing cracks during tension (feed-forward)
  tensionCrackPaths: [], // Array of CrackPath objects that grow during hold
  lastTensionGrowth: 0,  // Timestamp of last growth tick
  
  // Pending paths/pools from current break (not yet permanent)
  pendingPaths: [],    // Full crack paths for gold
  pendingSeams: [],    // Legacy seams (deprecated)
  pendingPools: [],
};

/**
 * Transition to a new state
 */
export function transition(newState) {
  state.current = newState;
  state.timer = Date.now();
}

/**
 * Get time elapsed since state transition
 */
export function stateElapsed() {
  return Date.now() - state.timer;
}

/**
 * Calculate hold intensity (0 to 1)
 */
export function holdIntensity(maxHoldTime) {
  return Math.min(1, 0.4 + (state.holdTime / maxHoldTime) * 0.6);
}

/**
 * Start a hold interaction
 */
export function startHold(x, y) {
  state.isHolding = true;
  state.holdStart = Date.now();
  state.holdTime = 0;
  state.breakPoint = { x, y };
  state.tensionCrackPaths = [];  // Reset growing cracks
  state.lastTensionGrowth = Date.now();
}

/**
 * End a hold interaction
 */
export function endHold() {
  state.isHolding = false;
}

/**
 * Update hold time (call each frame during tension)
 */
export function updateHoldTime() {
  state.holdTime = (Date.now() - state.holdStart) / 1000;
}

/**
 * Reset to initial state
 */
export function reset() {
  state.current = States.WHOLE;
  state.timer = 0;
  state.isHolding = false;
  state.holdStart = 0;
  state.holdTime = 0;
  state.breakPoint = { x: 0, y: 0 };
  state.fragments = [];
  state.tensionCrackPaths = [];
  state.lastTensionGrowth = 0;
  state.pendingPaths = [];
  state.pendingSeams = [];
  state.pendingPools = [];
  state.dustParticles = [];
  state.goldParticles = [];
}

/**
 * Commit pending paths/pools to permanent gold
 */
export function commitGold() {
  // Commit full crack paths
  state.goldPaths.push(...state.pendingPaths.map(p => ({ ...p, progress: 1, flowProgress: 1 })));
  // Also commit legacy seams for compatibility
  state.goldSeams.push(...state.pendingSeams.map(s => ({ ...s, progress: 1, flowProgress: 1 })));
  state.goldPools.push(...state.pendingPools.map(p => ({ ...p, progress: 1 })));
  state.pendingPaths = [];
  state.pendingSeams = [];
  state.pendingPools = [];
  state.tensionCrackPaths = [];
  state.fragments = [];
  state.dustParticles = [];
  state.goldParticles = [];
}

// For testing
export function _test() {
  const results = [];
  
  // Test States enum
  results.push({
    name: 'States enum has all states',
    pass: Object.keys(States).length === 5,
  });
  
  // Test state object has required properties
  const requiredProps = ['current', 'isHolding', 'breakPoint', 'fragments', 'goldSeams'];
  for (const prop of requiredProps) {
    results.push({
      name: `state.${prop} exists`,
      pass: prop in state,
    });
  }
  
  // Test transition function
  const originalState = state.current;
  transition(States.TENSION);
  results.push({
    name: 'transition() changes state',
    pass: state.current === States.TENSION,
  });
  transition(originalState);
  
  // Test holdIntensity bounds
  state.holdTime = 0;
  results.push({
    name: 'holdIntensity(2500) min is ~0.4',
    pass: holdIntensity(2500) >= 0.4 && holdIntensity(2500) <= 0.5,
  });
  
  state.holdTime = 3;
  results.push({
    name: 'holdIntensity(2500) max is 1',
    pass: holdIntensity(2500) === 1,
  });
  state.holdTime = 0;
  
  return results;
}
