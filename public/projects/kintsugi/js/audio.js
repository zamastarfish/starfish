/**
 * Kintsugi - Audio Module
 * Sound synthesis for ceramic breaks and gold healing
 */

let audioCtx = null;
let audioEnabled = false;
let goldDrone = null;
let goldDroneGain = null;

/**
 * Initialize Web Audio context (must be called from user interaction)
 */
export function init() {
  if (audioCtx) return true;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioEnabled = true;
    return true;
  } catch (e) {
    audioEnabled = false;
    return false;
  }
}

/**
 * Check if audio is enabled
 */
export function isEnabled() {
  return audioEnabled && audioCtx !== null;
}

/**
 * Play ceramic break sound
 * @param {number} intensity - Break intensity (0-1)
 */
export function playBreak(intensity) {
  if (!audioEnabled || !audioCtx) return;
  
  const duration = 0.15 + intensity * 0.15;
  const now = audioCtx.currentTime;
  
  // Create noise buffer for crack sound
  const bufferSize = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    // Sharp attack, quick decay envelope
    const envelope = Math.exp(-t * 12) * (1 - t);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  // Bandpass filter for ceramic quality
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800 + intensity * 2000;
  filter.Q.value = 1.2;
  
  const gain = audioCtx.createGain();
  gain.gain.value = 0.25 + intensity * 0.25;
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  
  noise.start(now);
  noise.stop(now + duration);
  
  // Add resonant tone for depth
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 350 + intensity * 250;
  
  const oscGain = audioCtx.createGain();
  oscGain.gain.setValueAtTime(0.08, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  
  osc.connect(oscGain);
  oscGain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}

/**
 * Start the gold healing drone sound
 */
export function startGoldDrone() {
  if (!audioEnabled || !audioCtx || goldDrone) return;
  
  const now = audioCtx.currentTime;
  
  // Base tone - F3 healing frequency
  goldDrone = audioCtx.createOscillator();
  goldDrone.type = 'sine';
  goldDrone.frequency.value = 174;
  
  // Harmonics for richness
  const harm2 = audioCtx.createOscillator();
  harm2.type = 'sine';
  harm2.frequency.value = 174 * 2;
  
  const harm3 = audioCtx.createOscillator();
  harm3.type = 'sine';
  harm3.frequency.value = 174 * 3;
  
  // Master gain with fade-in
  goldDroneGain = audioCtx.createGain();
  goldDroneGain.gain.setValueAtTime(0, now);
  goldDroneGain.gain.linearRampToValueAtTime(0.08, now + 2);
  
  // Harmonic gains
  const harm2Gain = audioCtx.createGain();
  harm2Gain.gain.value = 0.03;
  
  const harm3Gain = audioCtx.createGain();
  harm3Gain.gain.value = 0.015;
  
  // Connect
  goldDrone.connect(goldDroneGain);
  harm2.connect(harm2Gain);
  harm3.connect(harm3Gain);
  harm2Gain.connect(goldDroneGain);
  harm3Gain.connect(goldDroneGain);
  goldDroneGain.connect(audioCtx.destination);
  
  // Start
  goldDrone.start(now);
  harm2.start(now);
  harm3.start(now);
  
  goldDrone._harmonics = [harm2, harm3];
}

/**
 * Stop the gold healing drone sound
 */
export function stopGoldDrone() {
  if (!goldDrone || !audioCtx) return;
  
  const now = audioCtx.currentTime;
  goldDroneGain.gain.linearRampToValueAtTime(0, now + 1.5);
  
  setTimeout(() => {
    if (goldDrone) {
      try {
        goldDrone.stop();
        goldDrone._harmonics.forEach(h => h.stop());
      } catch (e) {
        // Already stopped
      }
      goldDrone = null;
      goldDroneGain = null;
    }
  }, 1600);
}

/**
 * Play completion chord
 */
export function playComplete() {
  if (!audioEnabled || !audioCtx) return;
  
  const now = audioCtx.currentTime;
  const freqs = [261.63, 329.63, 392]; // C major chord
  
  freqs.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.06, now + i * 0.1 + 0.3);
    gain.gain.linearRampToValueAtTime(0, now + i * 0.1 + 2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 2.1);
  });
}

// For testing (limited - can't test actual audio without user interaction)
export function _test() {
  const results = [];
  
  results.push({
    name: 'init() is a function',
    pass: typeof init === 'function',
  });
  
  results.push({
    name: 'playBreak() is a function',
    pass: typeof playBreak === 'function',
  });
  
  results.push({
    name: 'startGoldDrone() is a function',
    pass: typeof startGoldDrone === 'function',
  });
  
  results.push({
    name: 'stopGoldDrone() is a function',
    pass: typeof stopGoldDrone === 'function',
  });
  
  results.push({
    name: 'playComplete() is a function',
    pass: typeof playComplete === 'function',
  });
  
  results.push({
    name: 'isEnabled() returns boolean before init',
    pass: typeof isEnabled() === 'boolean',
  });
  
  return results;
}
