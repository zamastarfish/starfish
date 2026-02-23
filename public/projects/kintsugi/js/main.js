/**
 * Kintsugi - 金継ぎ
 * The Japanese art of golden repair
 * 
 * Main entry point - ties all modules together
 */

import { canvas, initCanvas, TIMING } from './config.js';
import * as state from './state.js';
import * as audio from './audio.js';
import * as lacquer from './lacquer.js';
import * as fracture from './fracture.js';
import * as gold from './gold.js';
import * as particles from './particles.js';
import * as physics from './physics.js';
import * as renderer from './renderer.js';
import * as input from './input.js';

const { States } = state;

/**
 * Initialize the application
 */
export function init(canvasElement) {
  // Set up canvas
  initCanvas(canvasElement);
  
  // Generate initial lacquer pattern
  lacquer.generate();
  
  // Set up resize handler to regenerate pattern
  window.addEventListener('resize', () => {
    lacquer.generate();
  });
  
  // Set up input handlers
  input.setup(
    handleHoldStart,
    handleHoldEnd,
    handleHoldMove,
    handleHoverChange
  );
  
  // Start animation loop
  requestAnimationFrame(animate);
}

/**
 * Handle hold start (user pressed)
 */
function handleHoldStart(x, y) {
  if (state.state.current !== States.WHOLE) return;
  
  // Initialize audio on first interaction
  audio.init();
  
  state.startHold(x, y);
  state.transition(States.TENSION);
}

/**
 * Handle hold end (user released)
 */
function handleHoldEnd() {
  state.endHold();
}

/**
 * Handle hold move (user moved while holding)
 */
function handleHoldMove(x, y) {
  if (state.state.current === States.TENSION && state.state.isHolding) {
    state.state.breakPoint = { x, y };
  }
}

/**
 * Handle hover state change
 */
function handleHoverChange(isHovering) {
  state.state.isHovering = isHovering && state.state.current === States.WHOLE;
}

/**
 * Main update loop
 */
function update() {
  const now = Date.now();
  state.state.breathPhase += 0.02;
  
  // Update particles
  particles.updateAll(state.state.dustParticles, state.state.goldParticles);
  
  switch (state.state.current) {
    case States.WHOLE:
      // Just breathing
      break;
      
    case States.TENSION:
      state.updateHoldTime();
      
      // Progressive crack growth while holding
      const tensionIntensity = state.holdIntensity(TIMING.maxHoldTime / 1000);
      state.state.tensionCrackPaths = fracture.growTensionCracks(
        state.state.tensionCrackPaths,
        tensionIntensity,
        state.state.breakPoint.x,
        state.state.breakPoint.y
      );
      
      if (!state.state.isHolding) {
        // User released - break! Use the already-grown cracks
        const intensity = tensionIntensity;
        const result = fracture.createFracture(
          state.state.breakPoint.x,
          state.state.breakPoint.y,
          intensity,
          state.state.tensionCrackPaths  // Pass existing cracks
        );
        
        state.state.fragments = result.fragments;
        state.state.pendingPaths = result.paths;  // Full polyline paths for gold
        state.state.pendingSeams = result.seams;  // Legacy format
        state.state.pendingPools = result.pools;
        
        particles.createDustBurst(
          state.state.dustParticles,
          state.state.breakPoint.x,
          state.state.breakPoint.y,
          intensity
        );
        
        state.state.breakCount++;
        audio.playBreak(intensity);
        state.transition(States.SHATTERED);
      }
      break;
      
    case States.SHATTERED:
      const settled = physics.updateFragments(state.state.fragments);
      if (settled || state.stateElapsed() > TIMING.settleTimeout) {
        state.transition(States.PAUSE);
      }
      break;
      
    case States.PAUSE:
      // Sit with the damage
      if (state.stateElapsed() > TIMING.pauseDuration) {
        state.transition(States.MENDING);
        audio.startGoldDrone();
      }
      break;
      
    case States.MENDING:
      const progress = Math.min(1, state.stateElapsed() / TIMING.mendDuration);
      
      // Update fragment positions
      physics.updateMending(state.state.fragments, progress);
      
      // Update gold flow - both paths and legacy seams
      gold.updatePathFlow(state.state.pendingPaths, progress);
      gold.updateSeamFlow(state.state.pendingSeams, progress);
      gold.updatePoolFlow(state.state.pendingPools, progress);
      
      // Spawn gold sparkles along flowing paths
      for (const path of state.state.pendingPaths) {
        if (path.flowProgress > 0 && path.flowProgress < 1 && Math.random() < 0.4) {
          // Get point at flow front
          const pts = path.points;
          if (pts && pts.length > 1) {
            const idx = Math.floor(path.flowProgress * (pts.length - 1));
            const pt = pts[Math.min(idx, pts.length - 1)];
            particles.createGoldSparkle(state.state.goldParticles, pt.x, pt.y);
            if (Math.random() < 0.25) {
              particles.createGoldSparkle(state.state.goldParticles, pt.x, pt.y, true);
            }
          }
        }
      }
      
      // Complete
      if (progress >= 1) {
        state.commitGold();
        state.transition(States.WHOLE);
        audio.stopGoldDrone();
        audio.playComplete();
      }
      break;
  }
}

/**
 * Main draw loop
 */
function draw() {
  const ctx = canvas.ctx;
  
  renderer.clear(ctx);
  
  ctx.save();
  
  switch (state.state.current) {
    case States.WHOLE:
      // Subtle breathing animation
      const breath = 1 + Math.sin(state.state.breathPhase) * 0.003;
      renderer.drawBowl(ctx, breath);
      gold.drawPaths(ctx, state.state.goldPaths);  // Full paths
      gold.drawSeams(ctx, state.state.goldSeams);  // Legacy seams
      gold.drawPools(ctx, state.state.goldPools);
      
      if (state.state.isHovering) {
        renderer.drawHoverGlow(ctx);
      }
      break;
      
    case States.TENSION:
      const drawIntensity = state.holdIntensity(TIMING.maxHoldTime / 1000);
      const shake = physics.calculateShake(drawIntensity);
      ctx.translate(shake.x, shake.y);
      
      renderer.drawBowl(ctx);
      gold.drawPaths(ctx, state.state.goldPaths);
      gold.drawSeams(ctx, state.state.goldSeams);
      gold.drawPools(ctx, state.state.goldPools);
      
      // Draw the growing tension cracks from state
      renderer.drawTensionCrackPaths(ctx, state.state.tensionCrackPaths, drawIntensity);
      break;
      
    case States.SHATTERED:
    case States.PAUSE:
      renderer.drawFragments(ctx, state.state.fragments);
      particles.drawAll(ctx, state.state.dustParticles, state.state.goldParticles);
      break;
      
    case States.MENDING:
      const mendProgress = state.stateElapsed() / TIMING.mendDuration;
      renderer.drawMendingWarmth(ctx, mendProgress);
      
      renderer.drawFragments(ctx, state.state.fragments);
      gold.drawPaths(ctx, state.state.goldPaths);
      gold.drawSeams(ctx, state.state.goldSeams);
      gold.drawPools(ctx, state.state.goldPools);
      gold.drawPaths(ctx, state.state.pendingPaths, true);  // Flowing gold paths
      gold.drawSeams(ctx, state.state.pendingSeams, true);
      gold.drawPools(ctx, state.state.pendingPools);
      particles.drawAll(ctx, state.state.dustParticles, state.state.goldParticles);
      break;
  }
  
  ctx.restore();
}

/**
 * Animation loop
 */
function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}

// Tests are loaded separately in index.html when ?test is present
