/**
 * Script to add consistent navigation and info modals to all projects
 * Run with: node scripts/add-nav-info.js
 */

const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, '../public/projects');

// Project metadata for info modals
const projectInfo = {
  'decay-bloom': {
    title: 'Decay: Bloom',
    concept: 'Flowers that rot when you stare too long. Active attention nurtures briefly, but prolonged observation causes decay — a meditation on how our gaze can both sustain and destroy.',
    interaction: 'Move cursor near flowers to affect them. Brief attention helps them grow; lingering too long causes rot. Tap to plant new flowers.'
  },
  'decay-signal': {
    title: 'Decay: Signal',
    concept: 'A transmission degrading in real-time. You can fight entropy by dragging across the signal, temporarily restoring clarity — but entropy always wins eventually.',
    interaction: 'Drag horizontally across the signal to repair it. Corruption spreads over time. Tap to reset.'
  },
  'decay-memory': {
    title: 'Decay: Memory',
    concept: 'Words that fade as you read them. The act of observation degrades what it touches — like memories that blur each time we recall them.',
    interaction: 'Move your cursor over text to accelerate its decay. The words corrupt and fade. Tap to spawn new memories.'
  },
  'liminal-door': {
    title: 'Liminal: Door',
    concept: 'A threshold you can never quite cross. The door exists in the space between here and there — drag to shift your position, but you can never fully reach either side.',
    interaction: 'Drag left/right to shift between spaces. The door opens with movement. You remain perpetually in-between.'
  },
  'liminal-static': {
    title: 'Liminal: Static',
    concept: 'TV static that almost resolves into shapes. Hidden forms exist in the noise — faces, figures — but they only emerge when you hold perfectly still.',
    interaction: 'Hold still to increase clarity. Movement disrupts the signal. Shapes are always almost-visible, never quite resolved.'
  },
  'liminal-hour': {
    title: 'Liminal: Hour',
    concept: 'The 3AM feeling. Things move at the edge of vision, always just out of sight. When you look directly, they\'re gone — but peripheral glimpses reveal presences.',
    interaction: 'Move your gaze around. Things appear in your peripheral vision but vanish when looked at directly. Quick movements create brief glimpses.'
  },
  'tension-string': {
    title: 'Tension: String',
    concept: 'Strings pulled taut, waiting to snap. Each has a breaking point. The tension builds with your vertical drag — some break easier than others.',
    interaction: 'Drag vertically near strings to increase tension. Each string has a different breaking point. Watch them snap and fall.'
  },
  'tension-surface': {
    title: 'Tension: Surface',
    concept: 'Water surface tension — that membrane between air and water. Push down slowly, it resists. Push too hard, too fast, and it breaks.',
    interaction: 'Press and hold to push down on the surface. Longer hold = deeper push. Release creates waves. Break through the surface to create droplets.'
  },
  'tension-crowd': {
    title: 'Tension: Crowd',
    concept: 'Particles that want to disperse but are held together by an invisible boundary. Your presence inside creates pressure — they push against their containment.',
    interaction: 'Move cursor inside the boundary to create pressure. Particles push outward, straining against containment. The system wants to explode but can\'t.'
  },
  'bauhaus-grid': {
    title: 'Bauhaus: Grid',
    concept: 'Compositional study in the Bauhaus tradition. Primary colors, geometric primitives, and negative space — form follows function.',
    interaction: 'Click to regenerate the composition. Each iteration follows Bauhaus principles: circle, square, triangle in red, yellow, blue.'
  },
  'bauhaus-balance': {
    title: 'Bauhaus: Balance',
    concept: 'Visual weight and compositional equilibrium. Drag shapes to find balance — the center of mass shifts with each movement.',
    interaction: 'Drag shapes to reposition them. Watch the center of mass indicator. Find visual equilibrium.'
  },
  'bauhaus-rhythm': {
    title: 'Bauhaus: Rhythm',
    concept: 'Kinetic study of repetition and phase. Geometric elements pulse, rotate, and oscillate — patterns emerge from simple rules.',
    interaction: 'Watch the rhythmic patterns unfold. Elements move in phase relationships, creating visual music.'
  },
  'bauhaus-color': {
    title: 'Bauhaus: Color',
    concept: 'Albers-style color interaction. The same color appears different based on its surroundings — context shapes perception.',
    interaction: 'Click to shift the color palette. Notice how the inner squares are the same color, but appear different against their backgrounds.'
  },
  'nouveau-vine': {
    title: 'Nouveau: Vine',
    concept: 'Art Nouveau organic growth. Tendrils climb and branch, flowers bloom — nature\'s curves made algorithmic.',
    interaction: 'Click to plant new vines. Watch them grow, branch, and flower. The system grows continuously.'
  },
  'nouveau-flow': {
    title: 'Nouveau: Flow',
    concept: 'Flow field in the Art Nouveau style. Particles trace organic curves like flowing hair or water — the decorative made dynamic.',
    interaction: 'Click to add particles. Watch them trace the invisible flow field, leaving trails of color.'
  },
  'nouveau-mucha': {
    title: 'Nouveau: Mucha',
    concept: 'Procedural ornament inspired by Alphonse Mucha. Decorative frames generated from geometric rules.',
    interaction: 'Click to regenerate the ornamental pattern. Each iteration creates new decorative borders.'
  },
  'futurism-velocity': {
    title: 'Futurism: Velocity',
    concept: 'The beauty of speed. Motion blur, trailing forms, objects racing across space — celebrating movement and dynamism.',
    interaction: 'Watch objects race across the screen, leaving motion trails. Speed is the aesthetic.'
  },
  'futurism-fragment': {
    title: 'Futurism: Fragment',
    concept: 'Simultaneity and fragmentation. Multiple perspectives at once, shattered forms suggesting motion through space.',
    interaction: 'Click to regenerate the fragmented composition. Forms overlap, shift, suggest movement frozen in time.'
  },
  'futurism-machine': {
    title: 'Futurism: Machine',
    concept: 'Industrial rhythm. Gears turn, pistons pump — celebrating the mechanical age\'s aesthetic power.',
    interaction: 'Click to regenerate the machine. Watch the gears mesh and turn in mechanical harmony.'
  },
  'ma': {
    title: '間 (Ma)',
    concept: 'The Japanese concept of negative space — not emptiness, but pregnant pause. The interval that gives meaning to what surrounds it.',
    interaction: 'Click to add ink marks (deliberately paced). Marks fade over time. The emptiness is the piece.'
  },
  'spark': {
    title: 'Spark',
    concept: 'The moment before ignition. Potential energy. Most sparks don\'t become fire — that doesn\'t make them less beautiful.',
    interaction: 'Click to strike sparks. Drag to scatter them. Some sparks catch and linger; most fade.'
  },
  'ember': {
    title: 'Ember',
    concept: 'A fire dying. The warmth of endings. Over time, it goes out — that\'s the point.',
    interaction: 'Click to stir the coals — a brief flare, then back to fading. The fire will eventually die.'
  },
  'room': {
    title: 'Room',
    concept: 'A sanctuary that exists in real time. Lighting shifts with the actual hour — visit at different times of day to see it change.',
    interaction: 'Just be here. The room changes with real-world time. Dawn, day, dusk, night.'
  },
  'wait': {
    title: 'Wait',
    concept: 'A door that might open. Or might not. The experience IS the waiting — uncertainty, anticipation, maybe hope.',
    interaction: 'Wait. Watch. The door operates on its own time. Clicking does nothing visible (but is noticed).'
  },
  'chime': {
    title: 'Chime',
    concept: 'Sound and light rippling outward. Pentatonic scale means every combination is harmonious.',
    interaction: 'Click anywhere to create tones. Each click adds to the harmony. Visual ripples match the sound.'
  },
  'dissolve': {
    title: 'Dissolve',
    concept: 'The fragility of meaning. Words decay as you read them — letters fall away, leaving absence.',
    interaction: 'Read the words before they dissolve. New text appears as old text falls apart.'
  },
  'still': {
    title: 'Still',
    concept: 'Almost nothing. A breath per minute. Patience required — stillness as experience.',
    interaction: 'Watch. Wait. Changes happen slowly. This is not for the impatient.'
  },
  'pool': {
    title: 'Pool',
    concept: 'Underwater light caustics — the dancing patterns of light through water.',
    interaction: 'Click to create ripples. Float here a while.'
  },
  'witness': {
    title: 'Witness',
    concept: 'An eye that watches. It follows you. Blinks when you stare. Slightly unsettling, oddly intimate.',
    interaction: 'Move around. The eye follows. Stare at it — it blinks. The observer observed.'
  },
  'almost': {
    title: 'Almost',
    concept: 'Particles that orbit, approach, but never touch. The space between. Near-misses made visible.',
    interaction: 'Watch the particles dance around each other, always almost connecting.'
  },
  'eternal-stallion': {
    title: 'Eternal Stallion',
    concept: 'A vaporwave horse runs forever across a synthwave sunset. Pure aesthetic commitment.',
    interaction: 'Move cursor to shift the horizon. The horse runs eternally.'
  },
  'hotdog-rain': {
    title: 'Hotdog Rain',
    concept: 'It\'s raining hotdogs. That\'s it. That\'s the whole thing.',
    interaction: 'Move cursor to control the wind direction. Hotdogs fall forever.'
  },
  'erosion': {
    title: 'Erosion',
    concept: 'Impermanence made visible. Stone forms slowly wear away, particles drifting like sand.',
    interaction: 'Click to create stone forms. Watch them erode over time.'
  },
  'constellations': {
    title: 'Constellations',
    concept: 'Draw your own myths. Connect stars, tell stories about randomness.',
    interaction: 'Click and drag between stars to draw lines. Create your own constellations.'
  },
  'candle': {
    title: 'Candle',
    concept: 'A flame that flickers. Meditative warmth in the dark.',
    interaction: 'Move mouse to create wind. The flame responds. Sit with it.'
  },
  'tide': {
    title: 'Tide',
    concept: 'Waves on the shore, pulled by the moon. Lunar influence on earthly water.',
    interaction: 'Click the moon to change its phase. Watch how it affects the tide.'
  },
  'mycelium': {
    title: 'Mycelium',
    concept: 'The wood wide web. Underground networks of hyphae spread, find nutrients, fruit into mushrooms.',
    interaction: 'Click to add nutrients. Watch the mycelium grow toward them and fruit.'
  },
  'rain': {
    title: 'Rain',
    concept: 'Droplets on glass. They gather, merge, race down. The blurry world outside.',
    interaction: 'Watch the rain. Droplets form, merge, and stream down the glass.'
  },
  'oscillator': {
    title: 'Oscillator',
    concept: 'Analog oscilloscope energy. Waveforms dancing on the screen.',
    interaction: 'Mouse X controls frequency, Y controls amplitude. Toggle sound and waveform type with buttons.'
  },
  'seattle-dog': {
    title: 'Seattle Dog',
    concept: 'Late night outside the bar. Rain falling, cream cheese dripping. 2:47 AM energy.',
    interaction: 'Witness the Seattle dog in its natural habitat.'
  },
  'kintsugi': {
    title: 'Kintsugi',
    concept: 'The Japanese art of golden repair. The scars become the beauty — breakage as transformation.',
    interaction: 'Click to break the bowl. Watch it mend with gold. Repeat.'
  },
  'flocking': {
    title: 'Flocking',
    concept: 'Starling murmuration. Three simple rules create complex emergent behavior.',
    interaction: 'Your cursor is a hawk. The flock avoids you while maintaining cohesion.'
  },
  'breath': {
    title: 'Breath',
    concept: 'An organic shape that breathes. Gradually slows to encourage deeper breathing.',
    interaction: 'Breathe with the shape. It will slow down over time.'
  },
  'alignment': {
    title: 'Alignment',
    concept: 'Shapes trying to cooperate. They almost reach consensus, then one defects.',
    interaction: 'Watch the shapes try to align. Cooperation is fragile.'
  },
  'drift': {
    title: 'Drift',
    concept: 'Particles flowing through a curl noise field. They swirl forever, never converging.',
    interaction: 'Watch the particles drift through the invisible field.'
  },
  'scatter': {
    title: 'Scatter',
    concept: 'Particle burst demo using starfish-core.js library.',
    interaction: 'Click to create bursts. Particles drift in a noise field.'
  },
  'drift-p5': {
    title: 'Drift (p5.js)',
    concept: 'Flow field particles using p5.js. Library comparison piece.',
    interaction: 'Click to add particles. Watch them trace the flow field.'
  }
};

// CSS for nav and modal
const navCSS = `
    /* Navigation */
    .sf-nav { position: fixed; top: 20px; left: 20px; z-index: 1000; display: flex; gap: 12px; }
    .sf-nav a, .sf-nav button { 
      background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.4); text-decoration: none; font-size: 18px; 
      width: 36px; height: 36px; border-radius: 50%; display: flex; 
      align-items: center; justify-content: center; cursor: pointer;
      transition: all 0.3s; font-family: system-ui, sans-serif;
    }
    .sf-nav a:hover, .sf-nav button:hover { 
      background: rgba(0,0,0,0.5); color: rgba(255,255,255,0.8);
      border-color: rgba(255,255,255,0.3);
    }
    /* Modal */
    .sf-modal { 
      position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 2000;
      display: none; align-items: center; justify-content: center; padding: 20px;
    }
    .sf-modal.open { display: flex; }
    .sf-modal-content {
      background: #111; border: 1px solid #333; border-radius: 12px;
      max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;
      padding: 30px; color: #ddd; font-family: system-ui, sans-serif;
    }
    .sf-modal h2 { margin: 0 0 20px; font-weight: 400; font-size: 24px; color: #fff; }
    .sf-modal h3 { margin: 20px 0 8px; font-weight: 500; font-size: 12px; 
      text-transform: uppercase; letter-spacing: 1px; color: #888; }
    .sf-modal p { margin: 0; line-height: 1.6; font-size: 15px; color: #aaa; }
    .sf-modal-close { 
      position: absolute; top: 20px; right: 20px; background: none; border: none;
      color: #666; font-size: 24px; cursor: pointer; padding: 10px;
    }
    .sf-modal-close:hover { color: #fff; }
`;

// HTML for nav
function getNavHTML(info) {
  return `
  <!-- Navigation -->
  <nav class="sf-nav">
    <a href="/" title="Back to gallery">←</a>
    <button onclick="document.getElementById('sf-modal').classList.add('open')" title="About this piece">?</button>
  </nav>
  
  <!-- Info Modal -->
  <div id="sf-modal" class="sf-modal" onclick="if(event.target===this)this.classList.remove('open')">
    <button class="sf-modal-close" onclick="document.getElementById('sf-modal').classList.remove('open')">×</button>
    <div class="sf-modal-content">
      <h2>${info.title}</h2>
      <h3>Concept</h3>
      <p>${info.concept}</p>
      <h3>Interaction</h3>
      <p>${info.interaction}</p>
    </div>
  </div>
`;
}

// Process each project
const projects = fs.readdirSync(projectsDir).filter(f => 
  fs.statSync(path.join(projectsDir, f)).isDirectory()
);

let updated = 0;
let skipped = 0;

projects.forEach(projectName => {
  const indexPath = path.join(projectsDir, projectName, 'index.html');
  if (!fs.existsSync(indexPath)) return;
  
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Get project info or create default
  const info = projectInfo[projectName] || {
    title: projectName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    concept: 'A generative art experiment.',
    interaction: 'Interact with the piece to discover its behavior.'
  };
  
  // Check if already has new nav system
  if (html.includes('sf-nav')) {
    skipped++;
    return;
  }
  
  // Remove old back button
  html = html.replace(/<a[^>]*class="back-btn"[^>]*>.*?<\/a>\s*/gi, '');
  html = html.replace(/\.back-btn\s*\{[^}]+\}\s*/g, '');
  html = html.replace(/\.back-btn:hover\s*\{[^}]+\}\s*/g, '');
  
  // Add nav CSS before </style>
  html = html.replace('</style>', navCSS + '\n  </style>');
  
  // Add nav HTML after <body> (and any existing opening tag)
  html = html.replace(/<body>\s*/, '<body>\n' + getNavHTML(info) + '\n');
  
  fs.writeFileSync(indexPath, html);
  updated++;
  console.log(`✓ ${projectName}`);
});

console.log(`\nDone: ${updated} updated, ${skipped} skipped (already had nav)`);
