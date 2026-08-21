const FEATURES = [
  {
    id: 'fullstack',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>
      </svg>
    ),
    title: 'Full-Stack Web Dev',
    description: 'Build production-ready apps with React, Django, and AWS amplify. From zero to deployed.',
    accent: 'rgba(124,58,237,0.15)',
    glow: 'rgba(124,58,237,0.25)',
  },
  {
    id: 'iot',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
      </svg>
    ),
    title: 'IoT & Hardware',
    description: 'Prototype with embedded systems, AWS IoT Core, and real-world sensor deployments.',
    accent: 'rgba(255,153,0,0.12)',
    glow: 'rgba(255,153,0,0.25)',
  },
  {
    id: 'hackathons',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Competitive Hackathons',
    description: 'Compete in AWS Hackathons, Smart India Hackathon, and global cloud challenges.',
    accent: 'rgba(52,211,153,0.10)',
    glow: 'rgba(52,211,153,0.25)',
  },
];

const AboutSection = () => (
  <section id="about" className="section">
    {/* Background glow */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(124,58,237,0.07) 0%, transparent 70%)',
      }}
    />

    <div className="relative z-10 max-w-6xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-16">
        <span className="section-badge">What We Do</span>
        <h2 className="section-title">Build. Learn. Ship.</h2>
        <div className="section-divider" />
        <p className="section-sub">
          Three pillars that drive every project, every event, and every member of AWS SBG RIT.
        </p>
      </div>

      {/* Feature cards — floating glass, no borders */}
      <div className="grid md:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <div
            key={f.id}
            className="glass-card group relative overflow-hidden animate-fade-up"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            {/* Card inner glow on hover */}
            <div
              aria-hidden="true"
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-0
                         group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle, ${f.glow} 0%, transparent 70%)` }}
            />

            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-white"
              style={{ background: f.accent }}
            >
              {f.icon}
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
