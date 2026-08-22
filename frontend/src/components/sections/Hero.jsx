const SparkleIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

// Floating orb decorations
const Orb = ({ style, className = '' }) => (
  <div
    aria-hidden="true"
    className={`absolute rounded-full pointer-events-none ${className}`}
    style={style}
  />
);

const Hero = () => (
  <section id="hero" className="hero-section">
    {/* Noise texture */}
    <div className="noise-overlay" />

    {/* Primary spotlight — purple/blue radial at top */}
    <div className="hero-spotlight" aria-hidden="true" />

    {/* Secondary orange accent — bottom left */}
    <Orb
      className="animate-pulse-slow"
      style={{
        width: 320,
        height: 320,
        bottom: '10%',
        left: '-5%',
        background: 'radial-gradient(circle, rgba(255,153,0,0.08) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }}
    />

    {/* Tertiary purple — bottom right */}
    <Orb
      className="animate-pulse-slow"
      style={{
        width: 400,
        height: 400,
        bottom: '5%',
        right: '-8%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animationDelay: '1.5s',
      }}
    />

    {/* Floating chip graphic — top right decoration */}
    <div
      aria-hidden="true"
      className="absolute top-32 right-12 lg:right-32 opacity-20 animate-float hidden lg:block"
    >
      <svg width="90" height="90" viewBox="0 0 200 200" fill="none">
        <rect x="55" y="55" width="90" height="90" rx="12"
          fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
        {[70,100,130].map((x,i) => (
          <line key={i} x1={x} y1="55" x2={x} y2="30"
            stroke="#ff9900" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        ))}
        {[70,100,130].map((x,i) => (
          <line key={`b${i}`} x1={x} y1="145" x2={x} y2="170"
            stroke="#ff9900" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        ))}
      </svg>
    </div>

    {/* Content */}
    <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">

      {/* Badge */}
      <div className="hero-badge animate-fade-up">
        <SparkleIcon />
        RIT Chapter · Est. 2024
        <SparkleIcon />
      </div>

      {/* Main heading */}
      <h1 className="hero-title animate-fade-up anim-delay-100">
        <span className="block text-gray-300 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
          Welcome to RIT's
        </span>
        <span className="block text-gradient-purple leading-none">
          AWS Student
        </span>
        <span className="block text-white leading-none">
          Builder Group
        </span>
      </h1>

      {/* Sub-heading */}
      <p className="hero-subtitle animate-fade-up anim-delay-200">
        Architecting the future through{' '}
        <span className="text-white font-medium">Full-Stack</span>,{' '}
        <span className="text-white font-medium">IoT &amp; Embedded</span>, and{' '}
        <span className="text-white font-medium">Cloud Innovations</span>.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up anim-delay-300">
        <a
          href="https://www.meetup.com/aws-sbg-at-roorkee-institute-of-technology/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-solid"
          id="hero-join-btn"
        >
          Join Now
        </a>
        <a href="#projects" className="btn btn-ghost group" id="hero-explore-btn">
          Explore Projects
          <ArrowRightIcon />
        </a>
      </div>

      {/* Micro-stats row */}
      <div
        className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 animate-fade-up anim-delay-400"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        {[
          { value: '50+',  label: 'Active Builders' },
          { value: '12',   label: 'Projects Shipped' },
          { value: '24',   label: 'Certifications' },
          { value: '8',    label: 'Events Hosted' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  </section>
);

export default Hero;
