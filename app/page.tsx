export default function Home() {
  const projects = [
    {
      name: "Drift",
      description: "Particles following invisible currents",
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
