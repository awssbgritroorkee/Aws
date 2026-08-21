import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Home',     href: '#hero' },
  { label: 'About',    href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Team',     href: '#team' },
  { label: 'Contact',  href: '#contact' },
];

const SbgLogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tnChipFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
    </defs>
    {[70,85,100,115,130].map((x, i) => (
      <line key={`tt${i}`} x1={x} y1="55" x2={x} y2={i%2===0?20:10}
        stroke="#ff9900" strokeWidth="3" strokeLinecap="round" opacity={i%2===0?0.9:0.6}/>
    ))}
    {[70,85,100,115,130].map((x, i) => (
      <line key={`tb${i}`} x1={x} y1="145" x2={x} y2={i%2===0?180:190}
        stroke="#ff9900" strokeWidth="3" strokeLinecap="round" opacity={i%2===0?0.9:0.6}/>
    ))}
    {[70,85,100,115,130].map((y, i) => (
      <line key={`tl${i}`} x1="55" y1={y} x2={i%2===0?20:10} y2={y}
        stroke="#ff9900" strokeWidth="3" strokeLinecap="round" opacity={i%2===0?0.9:0.6}/>
    ))}
    {[70,85,100,115,130].map((y, i) => (
      <line key={`tr${i}`} x1="145" y1={y} x2={i%2===0?180:190} y2={y}
        stroke="#ff9900" strokeWidth="3" strokeLinecap="round" opacity={i%2===0?0.9:0.6}/>
    ))}
    <rect x="55" y="55" width="90" height="90" rx="12" fill="url(#tnChipFill)"/>
    <rect x="55" y="55" width="90" height="90" rx="12" fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.5"/>
    <rect x="69" y="69" width="62" height="62" rx="6" fill="#4c1d95" opacity="0.65"/>
    <text x="100" y="96" fontFamily="Inter,Arial,sans-serif" fontSize="11" fontWeight="800"
      fill="#fff" textAnchor="middle" letterSpacing="3">SBG</text>
    <path d="M83 110 Q100 121 117 110" stroke="#ff9900" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <polygon points="113,106 118,110 112,113" fill="#ff9900"/>
  </svg>
);

const HamburgerIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="6" x2="20" y2="6"/>
    <line x1="4" y1="12" x2="20" y2="12"/>
    <line x1="4" y1="18" x2="20" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const TopNav = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [active, setActive]         = useState('#hero');
  const [menuOpen, setMenuOpen]     = useState(false);

  // Shadow/border on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight active section via IntersectionObserver
  useEffect(() => {
    const sections = NAV_LINKS.map(l => document.querySelector(l.href)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const handleNavClick = (href) => {
    setActive(href);
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      id="top-nav"
      className="navbar"
      style={scrolled ? { borderBottomColor: 'rgba(255,255,255,0.09)' } : {}}
    >
      {/* Left — Logo */}
      <a
        href="#hero"
        onClick={(e) => { e.preventDefault(); handleNavClick('#hero'); }}
        className="flex items-center gap-2.5 group flex-shrink-0"
        aria-label="AWS SBG RIT Home"
      >
        <SbgLogoMark />
        <div>
          <p className="text-[11px] font-bold text-white leading-tight tracking-tight">AWS SBG</p>
          <p className="text-[10px] font-semibold leading-tight"
             style={{ background: 'linear-gradient(90deg,#ff9900,#ffb84d)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            RIT Chapter
          </p>
        </div>
      </a>

      {/* Center — Pill nav (desktop) */}
      <div className="nav-pill-container absolute left-1/2 -translate-x-1/2">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
            className={`nav-link ${active === link.href ? 'active' : ''}`}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Right — CTA + hamburger */}
      <div className="flex items-center gap-3">
        <a
          href="#contact"
          onClick={(e) => { e.preventDefault(); handleNavClick('#contact'); }}
          className="hidden sm:inline-flex btn btn-purple text-xs px-4 py-2"
          id="nav-join-btn"
        >
          Join Now
        </a>
        <button
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="nav-hamburger"
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 md:hidden py-4 px-4 animate-fade-in"
          style={{ background: 'rgba(5,11,20,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
              className={`block px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-all
                ${active === link.href
                  ? 'text-white bg-purple-dim/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); handleNavClick('#contact'); }}
            className="btn btn-purple w-full justify-center mt-2 text-sm"
          >
            Join Now
          </a>
        </div>
      )}
    </nav>
  );
};

export default TopNav;
