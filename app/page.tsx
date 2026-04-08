export default function Home() {
  const projects = [
    // === April 8, 2026 ===
    {
      name: "Coin",
      description: "Binary choice. Yes or no. Sun or moon. Click to flip — the moment it's in the air, you usually know which side you're hoping for",
      date: "Apr 8",
      href: "/projects/coin/"
    },
    {
      name: "Shadow",
      description: "Move. It follows. Stop. It catches up. The shadow self — everything you can't outrun. It isn't evil, just the part of you that stays behind",
      date: "Apr 8",
      href: "/projects/shadow/"
    },
    {
      name: "Metronome",
      description: "Time made audible. Each click carves silence into equal portions. Drag to change tempo, tap to sync. From Grave to Prestissimo — same mechanism, different urgencies",
      date: "Apr 8",
      href: "/projects/metronome/"
    },
    {
      name: "Loom",
      description: "Warp and weft. Thread becomes textile through the ancient dance of over and under. Before punch cards, before computers, the Jacquard loom encoded patterns in paper. Click to change the weft color",
      date: "Apr 8",
      href: "/projects/loom/"
    },
    {
      name: "Tree",
      description: "L-system growth. Click to plant — watch branches emerge recursively from simple rules. Each tree grows differently, same grammar different seeds. The patience of organic form",
      date: "Apr 8",
      href: "/projects/tree/"
    },
    // === April 7, 2026 ===
    {
      name: "Life",
      description: "Conway's Game of Life. Four simple rules, infinite complexity. Draw to seed cells, watch them live, die, and evolve. The most famous example of emergence. Press SPACE to pause, R for random",
      date: "Apr 7",
      href: "/projects/life/"
    },
    {
      name: "Kaleidoscope",
      description: "Draw anywhere — your gesture reflects across axes of symmetry. Simple movements become intricate mandalas. Press S to change symmetry (6/8/12), C to clear",
      date: "Apr 7",
      href: "/projects/kaleidoscope/"
    },
    {
      name: "String",
      description: "The physics of plucked strings. Click anywhere to pluck — the position determines which harmonics ring out. Center for pure tone, edge for brightness. What we hear is the sum of standing waves",
      date: "Apr 7",
      href: "/projects/string/"
    },
    {
      name: "Harmonograph",
      description: "A 19th-century drawing machine, simulated. Two pendulums swing at different frequencies, tracing Lissajous figures as they slowly decay. Each pattern is unique and unrepeatable. Click to begin",
      date: "Apr 7",
      href: "/projects/harmonograph/"
    },
    {
      name: "Prism",
      description: "Newton revealed the rainbow hidden in white light. Move to position the prism, watch the spectrum emerge — red bends least, violet most. Each color sings its frequency. The beauty was there all along",
      date: "Apr 7",
      href: "/projects/prism/"
    },
    {
      name: "Sediment",
      description: "Geological time compressed. Click to deposit layers — each stratum an epoch, from the Hadean to the Quaternary. The weight of everything above presses down, compacting what came before. What will your layer leave behind?",
      date: "Apr 7",
      href: "/projects/sediment/"
    },
    {
      name: "Lorenz",
      description: "The butterfly effect, visualized. Three simple equations, infinite complexity. Deterministic chaos — perfectly predictable rules, unpredictable outcomes. Click to spawn trajectories that start almost identically, then diverge into different fates",
      date: "Apr 7",
      href: "/projects/lorenz/"
    },
    {
      name: "Jellyfish",
      description: "Drifting through the deep. Bell contracts, tentacles trail, bioluminescence glows. Click to spawn, move to create currents. 500 million years of elegant simplicity",
      date: "Apr 7",
      href: "/projects/jellyfish/"
    },
    // === April 6, 2026 ===
    {
      name: "Horizon",
      description: "Where sky meets sea. Colors shift slowly through dawn, day, dusk, night. Nothing to do. Nowhere to go. Just light changing over water",
      date: "Apr 6",
      href: "/projects/horizon/"
    },
    {
      name: "Dominoes",
      description: "Drag to place. Click to push. Watch the chain reaction cascade across the table. Small causes, large effects. The satisfaction of seeing it all fall",
      date: "Apr 6",
      href: "/projects/dominoes/"
    },
    {
      name: "Fireflies",
      description: "In Thai mangroves, thousands flash in perfect sync. No conductor — just simple rules: see a neighbor, adjust your rhythm. Watch them find each other. Click to disturb the pattern",
      date: "Apr 6",
      href: "/projects/fireflies/"
    },
    {
      name: "Alignment",
      description: "Game theory, visualized. Blue agents cooperate — they seek harmony, align with neighbors. Red agents defect — they disrupt, exploit trust. Click to flip any agent's strategy. Watch cooperation spread. Watch it collapse",
      date: "Apr 6",
      href: "/projects/alignment/"
    },
    // === April 5, 2026 ===
    {
      name: "Kintsugi",
      description: "金継ぎ — the Japanese art of golden repair. Click to break the bowl. Watch the gold fill the cracks. What was shattered becomes more beautiful for having been broken",
      date: "Apr 5",
      href: "/projects/kintsugi/"
    },
    {
      name: "Breath",
      description: "An invitation to slow down. The shape breathes in 4-7-8 rhythm — four seconds in, seven hold, eight out. No interaction required. Just watch. Just breathe",
      date: "Apr 5",
      href: "/projects/breath/"
    },
    {
      name: "Pulse",
      description: "The rhythm you carry inside. Sixty to a hundred beats per minute, unnoticed until you stop to feel it. Move to elevate the heart rate. Rest to let it calm. We are percussion instruments",
      date: "Apr 5",
      href: "/projects/pulse/"
    },
    // === April 4, 2026 ===
    {
      name: "Gamelan",
      description: "Bronze percussion from Java. Interlocking patterns called kotekan — two incomplete melodies that weave together. Time is cyclical. Click to strike; your notes join the pattern",
      date: "Apr 4",
      href: "/projects/gamelan/"
    },
    {
      name: "Swarm",
      description: "Hundreds of agents, three rules: stay close, align, avoid collision. From these constraints, murmurations emerge. You are the predator",
      date: "Apr 4",
      href: "/projects/swarm/"
    },
    {
      name: "Mitosis",
      description: "One becomes two. Click a cell to trigger division — watch chromosomes condense, align, pull apart. The ancient choreography encoded in every living thing",
      date: "Apr 4",
      href: "/projects/mitosis/"
    },
    {
      name: "Crystal",
      description: "Crystalline structures emerge from supersaturated solutions. 6-fold symmetry, branching fractals, the mathematics of mineral growth. Click to seed, move to warm and slow the process",
      date: "Apr 4",
      href: "/projects/crystal/"
    },
    {
      name: "Echo",
      description: "Draw a gesture, watch it repeat and degrade. Points drift, colors fade. Like remembering a dream, each echo loses fidelity",
      date: "Apr 4",
      href: "/projects/echo/"
    },
    // === April 3, 2026 ===
    {
      name: "Pop",
      description: "Bubbles rise. Pop them. That's it. Sometimes the simple pleasures are enough",
      date: "Apr 3",
      href: "/projects/pop/"
    },
    {
      name: "Grid",
      description: "Order. Regularity. Dots that breathe and respond. Move through, click to ripple. After chaos, structure. After noise, silence",
      date: "Apr 3",
      href: "/projects/grid/"
    },
    {
      name: "Glitch",
      description: "Digital corruption as aesthetic. Move to introduce errors, click for catastrophic failure. The image wants to be whole; you won't let it",
      date: "Apr 3",
      href: "/projects/glitch/"
    },
    {
      name: "Phase",
      description: "Two identical patterns, one slightly faster. Steve Reich's phasing technique—gradual drift, eventual realignment. The patterns are the same; the difference is time",
      date: "Apr 3",
      href: "/projects/phase/"
    },
    {
      name: "Wave",
      description: "Sine interference patterns. Multiple frequencies overlap, creating complexity from simplicity. Move to shift phase and frequency. What you see is what you hear",
      date: "Apr 3",
      href: "/projects/wave/"
    },
    // === April 2, 2026 ===
    {
      name: "Glow",
      description: "Bioluminescence in the deep. Soft orbs drift, pulse, fade. Move near to push them. Click to spawn. Creatures making their own light",
      date: "Apr 2",
      href: "/projects/glow/"
    },
    {
      name: "Ink",
      description: "Drops diffusing in water. Click to drop, drag to trail. Choose colors. Brownian motion, organic chaos — you start it, the water finishes it",
      date: "Apr 2",
      href: "/projects/ink/"
    },
    {
      name: "Smoke",
      description: "Wisps rising from an ember. Move to disturb the air, watch it curl and vanish. Nothing solid, nothing permanent — just the trace of something burning",
      date: "Apr 2",
      href: "/projects/smoke/"
    },
    {
      name: "Ripple",
      description: "Drop a stone in still water. Watch the circles spread, interfere, fade. Position maps to pitch. Drag to trail. The drone follows the energy",
      date: "Apr 2",
      href: "/projects/ripple/"
    },
    {
      name: "円相 (ensō)",
      description: "One breath, one stroke. The Zen circle — completeness, emptiness, the moment. Each circle reveals the artist's state of mind. Click to draw",
      date: "Apr 2",
      href: "/projects/enso/"
    },
    {
      name: "Bounce",
      description: "Balls fall, bounce, make music. Simple physics, simple joy. Drag to throw. Position maps to pitch. Press G to flip gravity",
      date: "Apr 2",
      href: "/projects/bounce/"
    },
    // === April 1, 2026 ===
    {
      name: "Null",
      description: "Nothing. Or almost nothing. Stay long enough and something might emerge. Or don't — the void doesn't mind",
      date: "Apr 1",
      href: "/projects/null/"
    },
    {
      name: "Drift",
      description: "Curl noise flow field with audio. Particles trace divergence-free currents. Move to disturb, click to spawn. The drone follows the flow",
      date: "Apr 1",
      href: "/projects/drift/"
    },
    {
      name: "Static",
      description: "The space between stations. White noise, visual snow, ghost signals. Tune the dial, hear the universe talking to itself when no one is broadcasting",
      date: "Apr 1",
      href: "/projects/static/"
    },
    // === March 7, 2026 ===
    {
      name: "Sublime",
      description: "Caspar David Friedrich energy. Tiny figure, vast landscape. You are small against the infinite — that's okay",
      date: "Mar 7",
      href: "/projects/sublime/"
    },
    // === March 6, 2026 ===
    {
      name: "Vanitas",
      description: "Memento mori — remember you will die. Flowers wilt, candles gutter, the skull watches. Classical still life, slowly decaying",
      date: "Mar 6",
      href: "/projects/vanitas/"
    },
    {
      name: "Brutalism",
      description: "Concrete monoliths. Click to strike, drag to scrape. Musique concrète — real recorded sounds, granularly mangled. Raw, exposed, heavy",
      date: "Mar 6",
      href: "/projects/brutalism/"
    },
    {
      name: "物の哀れ",
      description: "Mono no aware — the pathos of things. Cherry blossoms falling. Beauty is brief; that's what makes it beautiful",
      date: "Mar 6",
      href: "/projects/mono-no-aware/"
    },
    {
      name: "Threshold",
      description: "You're always approaching but never arriving. Zeno's paradox — visual and sonic. The drone rises but never resolves",
      date: "Mar 6",
      href: "/projects/threshold/"
    },
    {
      name: "Hollow",
      description: "Voids drifting in darkness. Your presence pushes them away. About emptiness, what's not there",
      date: "Mar 6",
      href: "/projects/hollow/"
    },
    // === March 5, 2026 ===
    {
      name: "Turing: Drone",
      description: "Reaction-diffusion with evolving drone. Pattern density shapes the sound. Click to seed",
      date: "Mar 5",
      href: "/projects/turing-drone/"
    },
    {
      name: "Flocking: Pad",
      description: "Starling murmuration with ambient pads. Cohesion = brightness, scatter = noise. Cursor is a hawk",
      date: "Mar 5",
      href: "/projects/flocking-pad/"
    },
    {
      name: "Orbit: Tone",
      description: "Gravitational bodies with sound. Collisions boom, close passes chime. Drag to spawn. R for random",
      date: "Mar 5",
      href: "/projects/orbit-tone/"
    },
    {
      name: "Pendulum: Arp",
      description: "Pendulum wave with arpeggios. Each bob plays a note when crossing center. Patterns emerge, dissolve, return",
      date: "Mar 5",
      href: "/projects/pendulum-arp/"
    },
    {
      name: "Bauhaus: Beat",
      description: "Bauhaus grid remixed with percussion. Shapes trigger sounds. Eno-inspired independent loops",
      date: "Mar 5",
      href: "/projects/bauhaus-beat/"
    },
    {
      name: "Resonance",
      description: "Drone + moiré mashup. Audio and visual interference patterns linked. Move to detune. Headphones recommended",
      date: "Mar 5",
      href: "/projects/resonance/"
    },
    {
      name: "Moiré",
      description: "Op art interference patterns. Move to shift the layers. Your eyes will lie to you",
      date: "Mar 5",
      href: "/projects/moire/"
    },
    {
      name: "Drone",
      description: "Generative ambient audio. A hum that shifts slowly. Minimal visuals, maximum presence. Headphones recommended",
      date: "Mar 5",
      href: "/projects/drone/"
    },
    {
      name: "Fog",
      description: "Shapes hidden in mist, revealed by your presence. Move through it, glimpse what's beneath. The fog returns",
      date: "Mar 5",
      href: "/projects/fog/"
    },
    {
      name: "Turing",
      description: "Reaction-diffusion patterns. How zebras get stripes. Click to seed, watch patterns emerge",
      date: "Mar 5",
      href: "/projects/turing/"
    },
    // === March 4, 2026 ===
    {
      name: "Dust",
      description: "Motes in a shaft of light. Move to disturb, be still and watch them settle. You are also dust",
      date: "Mar 4",
      href: "/projects/dust/"
    },
    {
      name: "Dogs of America",
      description: "A tour of regional hot dogs. Seattle, Chicago, New York, Sonoran, and beyond. Click to travel",
      date: "Mar 4",
      href: "/projects/dogs/"
    },
    {
      name: "Tend",
      description: "A shape dissolving. Your presence restores it. Let go and it fades. Everything requires care",
      date: "Mar 4",
      href: "/projects/tend/"
    },
    {
      name: "Patch",
      description: "Modular synth patcher. Drag cables between jacks, watch signal flow. The visual language of synthesis",
      date: "Mar 4",
      href: "/projects/patch/"
    },
    {
      name: "Attention",
      description: "Stay and watch. Something emerges — but only if you don't look away. Tab switch resets. 60 seconds",
      date: "Mar 4",
      href: "/projects/attention/"
    },
    // === March 3, 2026 ===
    {
      name: "Orbit",
      description: "Gravitational bodies in space. Click to spawn, drag for velocity. Watch them dance, collide, escape",
      date: "Mar 3",
      href: "/projects/orbit/"
    },
    {
      name: "Sand",
      description: "Digital sand. Drag to pour, watch it pile. Simple physics, satisfying accumulation. Press 1-4 for colors",
      date: "Mar 3",
      href: "/projects/sand/"
    },
    {
      name: "Pendulum",
      description: "A wave of pendulums, each slightly longer than the last. Patterns emerge, dissolve, return",
      date: "Mar 3",
      href: "/projects/pendulum/"
    },
    // === March 2, 2026 ===
    {
      name: "Now",
      description: "The current moment, visualized. Time passes whether you watch or not",
      date: "Mar 2",
      href: "/projects/now/"
    },
    {
      name: "Rothko",
      description: "Color field meditation. Soft rectangles breathe slowly. The edges blur. Stare long enough",
      date: "Mar 2",
      href: "/projects/rothko/"
    },
    {
      name: "Forget",
      description: "Memories that fade. Click to remember, but they always slip away again",
      date: "Mar 2",
      href: "/projects/forget/"
    },
    // === March 1, 2026 ===
    {
      name: "Float",
      description: "Weightlessness. You're the glowing particle, drifting upward with soft shapes. Let go",
      date: "Mar 1",
      href: "/projects/float/"
    },
    {
      name: "Sisyphus",
      description: "Push the boulder. Help it climb. Watch it fall. Again. The absurd made visible",
      date: "Mar 1",
      href: "/projects/sisyphus/"
    },
    {
      name: "Gaze",
      description: "Eyes that track you, multiply over time. Look away and they close. Return and they're staring",
      date: "Mar 1",
      href: "/projects/gaze/"
    },
    {
      name: "Decay: Bloom",
      description: "Flowers that rot when you stare too long. Dwell time determines flourish or decay",
      date: "Mar 1",
      href: "/projects/decay-bloom/"
    },
    {
      name: "Decay: Signal",
      description: "A degrading transmission. Drag to fight entropy — but entropy always wins",
      date: "Mar 1",
      href: "/projects/decay-signal/"
    },
    {
      name: "Decay: Memory",
      description: "Words that fade as you read them. Observation degrades what it touches",
      date: "Mar 1",
      href: "/projects/decay-memory/"
    },
    {
      name: "Liminal: Door",
      description: "A doorway you can never quite cross. Drag to shift the threshold",
      date: "Mar 1",
      href: "/projects/liminal-door/"
    },
    {
      name: "Liminal: Static",
      description: "TV noise that almost resolves into shapes. Hold still to see them",
      date: "Mar 1",
      href: "/projects/liminal-static/"
    },
    {
      name: "Liminal: Hour",
      description: "3AM. Things at the edge of vision. Move to look, but they're always just out of sight",
      date: "Mar 1",
      href: "/projects/liminal-hour/"
    },
    {
      name: "Tension: String",
      description: "Strings pulled taut. Drag vertically to increase tension. They want to snap",
      date: "Mar 1",
      href: "/projects/tension-string/"
    },
    {
      name: "Tension: Surface",
      description: "Water surface tension. Press and hold to push. Push too hard, it breaks",
      date: "Mar 1",
      href: "/projects/tension-surface/"
    },
    {
      name: "Tension: Crowd",
      description: "Particles that want to escape but can't. Your presence creates pressure",
      date: "Mar 1",
      href: "/projects/tension-crowd/"
    },
    {
      name: "Bauhaus: Grid",
      description: "Compositional study with geometric primitives. Primary colors, negative space",
      date: "Mar 1",
      href: "/projects/bauhaus-grid/"
    },
    {
      name: "Bauhaus: Balance",
      description: "Drag shapes to explore visual weight. Watch the center of mass shift",
      date: "Mar 1",
      href: "/projects/bauhaus-balance/"
    },
    {
      name: "Bauhaus: Rhythm",
      description: "Kinetic pattern study. Geometric elements pulsing, rotating, oscillating in phase",
      date: "Mar 1",
      href: "/projects/bauhaus-rhythm/"
    },
    {
      name: "Bauhaus: Color",
      description: "Albers-inspired color interaction. Same color looks different in context",
      date: "Mar 1",
      href: "/projects/bauhaus-color/"
    },
    {
      name: "Nouveau: Vine",
      description: "Growing organic tendrils. Bezier curves, branching, flowers blooming. Click to plant",
      date: "Mar 1",
      href: "/projects/nouveau-vine/"
    },
    {
      name: "Nouveau: Flow",
      description: "Art Nouveau flow field. Particles tracing organic curves like flowing hair",
      date: "Mar 1",
      href: "/projects/nouveau-flow/"
    },
    {
      name: "Nouveau: Mucha",
      description: "Decorative frame generator. Alphonse Mucha-inspired ornamental borders",
      date: "Mar 1",
      href: "/projects/nouveau-mucha/"
    },
    {
      name: "Futurism: Velocity",
      description: "Motion blur and speed trails. Objects racing across the screen",
      date: "Mar 1",
      href: "/projects/futurism-velocity/"
    },
    {
      name: "Futurism: Fragment",
      description: "Shattered forms, multiple perspectives. Simultaneity and dynamic fragmentation",
      date: "Mar 1",
      href: "/projects/futurism-fragment/"
    },
    {
      name: "Futurism: Machine",
      description: "Industrial rhythm. Gears turning, pistons pumping. The aesthetics of mechanics",
      date: "Mar 1",
      href: "/projects/futurism-machine/"
    },
    {
      name: "間 (Ma)",
      description: "The space between. Japanese aesthetics — sparse ink marks on paper that slowly fade",
      date: "Mar 1",
      href: "/projects/ma/"
    },
    {
      name: "Spark",
      description: "The moment before ignition. Click to strike, drag to scatter. Most sparks don't catch",
      date: "Mar 1",
      href: "/projects/spark/"
    },
    {
      name: "Ember",
      description: "A fire dying. Click to stir the coals. Over time, it goes out. That's the point",
      date: "Mar 1",
      href: "/projects/ember/"
    },
    {
      name: "Room",
      description: "A quiet space that exists in real time. Lighting shifts with the actual hour",
      date: "Mar 1",
      href: "/projects/room/"
    },
    {
      name: "Wait",
      description: "A door that might open. Or might not. The experience IS the waiting",
      date: "Mar 1",
      href: "/projects/wait/"
    },
    {
      name: "Scatter",
      description: "Particle burst demo. Click to explode, ambient drift in noise field",
      date: "Mar 1",
      href: "/projects/scatter/"
    },
    {
      name: "Erosion",
      description: "Click to create forms of stone. Watch them slowly wear away, particles drifting like sand",
      date: "Mar 1",
      href: "/projects/erosion/"
    },
    // === February 2026 ===
    {
      name: "Chime",
      description: "Click to create tones. Pentatonic scale — always harmonious. Sound + light rippling outward",
      date: "Feb 27",
      href: "/projects/chime/"
    },
    {
      name: "Dissolve",
      description: "Words decay as you read them. Letters fall away. The fragility of meaning",
      date: "Feb 27",
      href: "/projects/dissolve/"
    },
    {
      name: "Almost",
      description: "Particles that orbit, approach, but never touch. The space between",
      date: "Feb 27",
      href: "/projects/almost/"
    },
    {
      name: "Pool",
      description: "Underwater light caustics. Click to ripple. Float here a while",
      date: "Feb 27",
      href: "/projects/pool/"
    },
    {
      name: "Still",
      description: "Almost nothing. A breath per minute. Patience required",
      date: "Feb 27",
      href: "/projects/still/"
    },
    {
      name: "Witness",
      description: "An eye watches. It follows you. Blinks when you stare. Slightly unsettling, oddly intimate",
      date: "Feb 27",
      href: "/projects/witness/"
    },
    {
      name: "Eternal Stallion",
      description: "A vaporwave horse runs forever across a synthwave sunset. Cursor shifts the horizon. ∞",
      date: "Feb 26",
      href: "/projects/eternal-stallion/"
    },
    {
      name: "Hotdog Rain",
      description: "It's raining hotdogs. Move your cursor to control the wind. That's it",
      date: "Feb 26",
      href: "/projects/hotdog-rain/"
    },
    {
      name: "Constellations",
      description: "Connect stars, draw your own myths. The stories we tell ourselves about randomness",
      date: "Feb 26",
      href: "/projects/constellations/"
    },
    {
      name: "Candle",
      description: "A flame that flickers. Move your mouse to create wind. Meditative warmth in the dark",
      date: "Feb 25",
      href: "/projects/candle/"
    },
    {
      name: "Tide",
      description: "Waves on the shore, the pull of the moon. Click moon to change phase — it affects the tide",
      date: "Feb 25",
      href: "/projects/tide/"
    },
    {
      name: "Mycelium",
      description: "The wood wide web. Hyphae spread underground, find nutrients, send up mushrooms",
      date: "Feb 25",
      href: "/projects/mycelium/"
    },
    {
      name: "Rain",
      description: "Droplets on glass. They gather, merge, race down. The blurry world outside",
      date: "Feb 25",
      href: "/projects/rain/"
    },
    {
      name: "Oscillator",
      description: "Analog oscilloscope energy. Sine, square, triangle, saw. Mouse controls frequency and amplitude",
      date: "Feb 25",
      href: "/projects/oscillator/"
    },
    {
      name: "Drift (p5)",
      description: "Flow field particles using p5.js. Comparing library approaches",
      date: "Feb 25",
      href: "/projects/drift-p5/"
    },
    {
      name: "Seattle Dog",
      description: "Late night outside the bar. Rain falling, cream cheese dripping. 2:47 AM energy",
      date: "Feb 24",
      href: "/projects/seattle-dog/"
    },
    {
      name: "Kintsugi",
      description: "The Japanese art of golden repair. Break the bowl. Watch it mend. The scars become the beauty",
      date: "Feb 23",
      href: "/projects/kintsugi/"
    },
    {
      name: "Flocking",
      description: "Starling murmuration. Three simple rules, complex emergent behavior. Your cursor is a hawk",
      date: "Feb 23",
      href: "/projects/flocking/"
    },
    {
      name: "Breath",
      description: "An organic shape that breathes. Gradually slows to encourage deeper breathing",
      date: "Feb 23",
      href: "/projects/breath/"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <main className="max-w-2xl mx-auto px-6 py-24">
        <header className="mb-16">
          <h1 className="text-4xl font-light tracking-tight mb-4">
            starfish
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Generative art experiments by{" "}
            <a 
              href="https://zama.space" 
              className="text-zinc-200 hover:text-white transition-colors"
            >
              zama.starfish
            </a>
            . Code-based sketches exploring emergence, pattern, and the boundary between order and chaos.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-6">
            Projects ({projects.length})
          </h2>
          <ul className="space-y-4">
            {projects.map((project) => (
              <li key={project.name}>
                <a 
                  href={project.href}
                  className="block group"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-zinc-100 group-hover:text-white transition-colors">
                      {project.name}
                    </span>
                    <span className="text-zinc-600 text-sm">
                      {project.date}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm mt-1">
                    {project.description}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <footer className="pt-16 border-t border-zinc-800">
          <p className="text-zinc-600 text-sm">
            🌊 Things that shimmer
          </p>
        </footer>
      </main>
    </div>
  );
}
