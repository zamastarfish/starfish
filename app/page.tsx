export default function Home() {
  const projects = [
    // === Confront / Question ===
    {
      name: "Sisyphus",
      description: "Push the boulder. Help it climb. Watch it fall. Again. The absurd made visible",
      date: "Mar 2026",
      href: "/projects/sisyphus/",
      series: "question"
    },
    {
      name: "Gaze",
      description: "Eyes that track you, multiply over time. Look away and they close. Return and they're all staring",
      date: "Mar 2026",
      href: "/projects/gaze/",
      series: "confront"
    },
    // === NEW: Weird Motifs (starfish-interact.js) ===
    {
      name: "Decay: Bloom",
      description: "Flowers that rot when you stare too long. Dwell time determines flourish or decay",
      date: "Mar 2026",
      href: "/projects/decay-bloom/",
      series: "decay"
    },
    {
      name: "Decay: Signal",
      description: "A degrading transmission. Drag to fight entropy — but entropy always wins",
      date: "Mar 2026",
      href: "/projects/decay-signal/",
      series: "decay"
    },
    {
      name: "Decay: Memory",
      description: "Words that fade as you read them. Observation degrades what it touches",
      date: "Mar 2026",
      href: "/projects/decay-memory/",
      series: "decay"
    },
    {
      name: "Liminal: Door",
      description: "A doorway you can never quite cross. Drag to shift the threshold",
      date: "Mar 2026",
      href: "/projects/liminal-door/",
      series: "liminal"
    },
    {
      name: "Liminal: Static",
      description: "TV noise that almost resolves into shapes. Hold still to see them",
      date: "Mar 2026",
      href: "/projects/liminal-static/",
      series: "liminal"
    },
    {
      name: "Liminal: Hour",
      description: "3AM. Things at the edge of vision. Move to look, but they're always just out of sight",
      date: "Mar 2026",
      href: "/projects/liminal-hour/",
      series: "liminal"
    },
    {
      name: "Tension: String",
      description: "Strings pulled taut. Drag vertically to increase tension. They want to snap",
      date: "Mar 2026",
      href: "/projects/tension-string/",
      series: "tension"
    },
    {
      name: "Tension: Surface",
      description: "Water surface tension. Press and hold to push. Push too hard, it breaks",
      date: "Mar 2026",
      href: "/projects/tension-surface/",
      series: "tension"
    },
    {
      name: "Tension: Crowd",
      description: "Particles that want to escape but can't. Your presence creates pressure",
      date: "Mar 2026",
      href: "/projects/tension-crowd/",
      series: "tension"
    },
    // === Motif Series (p5.js) ===
    {
      name: "Bauhaus: Grid",
      description: "Compositional study with geometric primitives. Primary colors, negative space, click to regenerate",
      date: "Feb 2026",
      href: "/projects/bauhaus-grid/",
      series: "bauhaus"
    },
    {
      name: "Bauhaus: Balance",
      description: "Drag shapes to explore visual weight. Watch the center of mass shift. Find equilibrium",
      date: "Feb 2026",
      href: "/projects/bauhaus-balance/",
      series: "bauhaus"
    },
    {
      name: "Bauhaus: Rhythm",
      description: "Kinetic pattern study. Geometric elements pulsing, rotating, oscillating in phase",
      date: "Feb 2026",
      href: "/projects/bauhaus-rhythm/",
      series: "bauhaus"
    },
    {
      name: "Bauhaus: Color",
      description: "Albers-inspired color interaction. Same color looks different in context. Click to shift palette",
      date: "Feb 2026",
      href: "/projects/bauhaus-color/",
      series: "bauhaus"
    },
    {
      name: "Nouveau: Vine",
      description: "Growing organic tendrils. Bezier curves, branching, flowers blooming. Click to plant",
      date: "Feb 2026",
      href: "/projects/nouveau-vine/",
      series: "nouveau"
    },
    {
      name: "Nouveau: Flow",
      description: "Art Nouveau flow field. Particles tracing organic curves like flowing hair or water",
      date: "Feb 2026",
      href: "/projects/nouveau-flow/",
      series: "nouveau"
    },
    {
      name: "Nouveau: Mucha",
      description: "Decorative frame generator. Alphonse Mucha-inspired ornamental borders",
      date: "Feb 2026",
      href: "/projects/nouveau-mucha/",
      series: "nouveau"
    },
    {
      name: "Futurism: Velocity",
      description: "Motion blur and speed trails. Objects racing across the screen. The beauty of velocity",
      date: "Feb 2026",
      href: "/projects/futurism-velocity/",
      series: "futurism"
    },
    {
      name: "Futurism: Fragment",
      description: "Shattered forms, multiple perspectives. Simultaneity and dynamic fragmentation",
      date: "Feb 2026",
      href: "/projects/futurism-fragment/",
      series: "futurism"
    },
    {
      name: "Futurism: Machine",
      description: "Industrial rhythm. Gears turning, pistons pumping. The aesthetics of mechanics",
      date: "Feb 2026",
      href: "/projects/futurism-machine/",
      series: "futurism"
    },
    // === Library experiments ===
    {
      name: "Scatter",
      description: "Particle burst demo using starfish-core.js. Click to explode, ambient drift in noise field",
      date: "Feb 2026",
      href: "/projects/scatter/"
    },
    {
      name: "Drift (p5)",
      description: "Flow field particles using p5.js. Comparing library approaches",
      date: "Feb 2026",
      href: "/projects/drift-p5/"
    },
    // === Recent originals ===
    {
      name: "間 (Ma)",
      description: "The space between. Japanese aesthetics — sparse ink marks on paper that slowly fade",
      date: "Feb 2026",
      href: "/projects/ma/"
    },
    {
      name: "Spark",
      description: "The moment before ignition. Click to strike, drag to scatter. Most sparks don't catch",
      date: "Feb 2026",
      href: "/projects/spark/"
    },
    {
      name: "Ember",
      description: "A fire dying. Click to stir the coals. Over time, it goes out. That's the point",
      date: "Feb 2026",
      href: "/projects/ember/"
    },
    {
      name: "Room",
      description: "A quiet space that exists in real time. Lighting shifts with the actual hour",
      date: "Feb 2026",
      href: "/projects/room/"
    },
    {
      name: "Wait",
      description: "A door that might open. Or might not. The experience IS the waiting",
      date: "Feb 2026",
      href: "/projects/wait/"
    },
    {
      name: "Chime",
      description: "Click to create tones. Pentatonic scale — always harmonious. Sound + light rippling outward",
      date: "Feb 2026",
      href: "/projects/chime/"
    },
    {
      name: "Dissolve",
      description: "Words decay as you read them. Letters fall away. The fragility of meaning",
      date: "Feb 2026",
      href: "/projects/dissolve/"
    },
    {
      name: "Still",
      description: "Almost nothing. A breath per minute. Patience required",
      date: "Feb 2026",
      href: "/projects/still/"
    },
    {
      name: "Pool",
      description: "Underwater light caustics. Click to ripple. Float here a while",
      date: "Feb 2026",
      href: "/projects/pool/"
    },
    {
      name: "Witness",
      description: "An eye watches. It follows you. Blinks when you stare. Slightly unsettling, oddly intimate",
      date: "Feb 2026",
      href: "/projects/witness/"
    },
    {
      name: "Almost",
      description: "Particles that orbit, approach, but never touch. The space between. Near-misses made visible",
      date: "Feb 2026",
      href: "/projects/almost/"
    },
    {
      name: "Eternal Stallion",
      description: "A vaporwave horse runs forever across a synthwave sunset. Cursor shifts the horizon. ∞",
      date: "Feb 2026",
      href: "/projects/eternal-stallion/"
    },
    {
      name: "Hotdog Rain",
      description: "It's raining hotdogs. Move your cursor to control the wind. That's it. That's the whole thing",
      date: "Feb 2026",
      href: "/projects/hotdog-rain/"
    },
    {
      name: "Erosion",
      description: "Click to create forms of stone. Watch them slowly wear away, particles drifting like sand",
      date: "Feb 2026",
      href: "/projects/erosion/"
    },
    {
      name: "Constellations",
      description: "Connect stars, draw your own myths. The stories we tell ourselves about randomness",
      date: "Feb 2026",
      href: "/projects/constellations/"
    },
    {
      name: "Candle",
      description: "A flame that flickers. Move your mouse to create wind. Meditative warmth in the dark",
      date: "Feb 2026",
      href: "/projects/candle/"
    },
    {
      name: "Tide",
      description: "Waves on the shore, the pull of the moon. Click moon to change phase — it affects the tide",
      date: "Feb 2026",
      href: "/projects/tide/"
    },
    {
      name: "Mycelium",
      description: "The wood wide web. Hyphae spread underground, find nutrients, send up mushrooms. Click to feed",
      date: "Feb 2026",
      href: "/projects/mycelium/"
    },
    {
      name: "Rain",
      description: "Droplets on glass. They gather, merge, race down. The blurry world outside",
      date: "Feb 2026",
      href: "/projects/rain/"
    },
    {
      name: "Oscillator",
      description: "Analog oscilloscope energy. Sine, square, triangle, saw. Mouse controls frequency and amplitude",
      date: "Feb 2026",
      href: "/projects/oscillator/"
    },
    {
      name: "Seattle Dog",
      description: "Late night outside the bar. Rain falling, cream cheese dripping. 2:47 AM energy",
      date: "Feb 2026",
      href: "/projects/seattle-dog/"
    },
    {
      name: "Kintsugi",
      description: "The Japanese art of golden repair. Break the bowl. Watch it mend. The scars become the beauty",
      date: "Feb 2026",
      href: "/projects/kintsugi/"
    },
    {
      name: "Flocking",
      description: "Starling murmuration. Three simple rules, complex emergent behavior. Your cursor is a hawk",
      date: "Feb 2026",
      href: "/projects/flocking/"
    },
    {
      name: "Breath",
      description: "An organic shape that breathes. Gradually slows to encourage deeper breathing",
      date: "Feb 2026",
      href: "/projects/breath/"
    },
    {
      name: "Alignment",
      description: "Shapes trying to cooperate. They almost reach consensus, then one defects",
      date: "Feb 2026",
      href: "/projects/alignment/"
    },
    {
      name: "Drift",
      description: "Particles flowing through a curl noise field — they swirl forever, never converging",
      date: "Feb 2026",
      href: "/projects/drift/"
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
