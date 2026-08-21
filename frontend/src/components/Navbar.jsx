import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import OriginalLogoMark from './OriginalLogoMark';

const NAV_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'About',    to: '/about' },
  { label: 'Events',   to: '/events' },
  { label: 'Team',     to: '/team' },
  { label: 'Gallery',  to: '/gallery' },
  { label: 'Contact',  to: '/contact' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      id="navbar"
      className="fixed w-full top-0 z-50 bg-aws-navy/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-5 md:px-10 h-16 transition-all duration-300"
    >
      {/* ── Logo ── */}
      <Link
        to="/"
        className="flex items-center gap-2.5 flex-shrink-0 group"
        aria-label="AWS Student Builder Group Roorkee Institute of Technology"
      >
        <OriginalLogoMark className="w-8 h-8 flex-shrink-0 transition-transform group-hover:scale-105" />
        <div className="leading-normal">
          <p className="text-[11px] md:text-[12px] font-black text-white tracking-tight uppercase">
            AWS STUDENT BUILDER GROUP
          </p>
          <p className="text-[10px] md:text-[11px] font-bold text-sbg-green tracking-tight pb-0.5">
            Roorkee Institute of Technology
          </p>
        </div>
      </Link>

      {/* ── Center pill nav — desktop ── */}
      <nav
        aria-label="Main navigation"
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full absolute left-1/2 -translate-x-1/2"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {NAV_LINKS.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            id={`nav-${label.toLowerCase()}`}
            className={({ isActive }) =>
              `px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-sbg-green bg-sbg-green/10 border border-sbg-green/30 font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Right — CTA ── */}
      <div className="flex items-center gap-3">
        <Link
          to="/contact"
          id="nav-cta-btn"
          className="hidden sm:inline-flex items-center gap-2 bg-sbg-green text-black font-bold px-6 py-2.5 rounded-full hover:bg-[#00c972] transition-all"
        >
          Join Now
        </Link>

        {/* Hamburger — mobile */}
        <button
          id="nav-hamburger"
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen
            ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          }
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div
          className="absolute top-full inset-x-0 md:hidden py-3 px-4"
          style={{
            background: 'rgba(22, 29, 38, 0.97)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderTop: 'none',
          }}
        >
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-sm font-medium mb-0.5 transition-colors ${
                  isActive
                    ? 'text-sbg-green bg-sbg-green/10 border border-sbg-green/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center mt-3 bg-sbg-green text-black font-bold px-6 py-2.5 rounded-full hover:bg-[#00c972] transition-all"
          >
            Join Now
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
