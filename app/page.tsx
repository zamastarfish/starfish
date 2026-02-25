export default function Home() {
  const projects = [
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
            Projects
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
