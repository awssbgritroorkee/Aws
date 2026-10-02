import { Link } from 'react-router-dom';
import { ExternalLink, Mail } from 'lucide-react';
import OriginalLogoMark from './OriginalLogoMark';

const NAV_LINKS = [
  { label: 'Home',       to: '/'           },
  { label: 'About Us',   to: '/about'      },
  { label: 'Events',     to: '/events'     },
  { label: 'Challenges', to: '/challenges' },
];

const COMMUNITY_LINKS = [
  { label: 'Team Up', to: '/teamup'  },
  { label: 'Team',    to: '/team'    },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
];

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aws-sbg-on-campus-rit-roorkee/',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://chat.whatsapp.com/CDOK76szIgzLFTOGcSPCY2',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.031 0c-6.627 0-12.031 5.405-12.031 12.034 0 2.124.553 4.195 1.603 6.012l-1.703 6.216 6.35-1.666c1.782.972 3.784 1.485 5.781 1.485 6.623 0 12.025-5.405 12.025-12.046 0-6.629-5.402-12.035-12.025-12.035zm6.55 17.202c-.328.92-1.921 1.713-2.673 1.802-.751.089-1.725.263-5.234-1.196-4.24-1.761-6.953-6.106-7.164-6.39-.211-.284-1.712-2.277-1.712-4.341 0-2.064 1.074-3.08 1.458-3.483.385-.403.839-.504 1.118-.504.28 0 .559.006.812.018.265.013.621-.104.972.744.364.88 1.258 3.064 1.368 3.29.111.226.185.489.043.774-.141.284-.213.46-.425.709-.211.248-.445.541-.637.728-.213.208-.436.435-.195.848.241.413 1.075 1.776 2.311 2.88 1.599 1.428 2.923 1.868 3.328 2.064.406.196.643.16.885-.116.241-.277 1.042-1.216 1.323-1.633.282-.416.564-.347.943-.207.38.139 2.4 1.131 2.812 1.339.412.208.687.311.786.486.101.174.101 1.018-.227 1.938z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/aws.sbg.ritroorkee/?hl=en',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
];

// ── Reusable column heading ────────────────────────────────────────────────────
const ColHeading = ({ children }) => (
  <h4 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">
    {children}
  </h4>
);

// ── Reusable nav link ──────────────────────────────────────────────────────────
const NavItem = ({ to, label }) => (
  <li>
    <Link
      to={to}
      className="text-sm text-gray-400 hover:text-sbg-green transition-colors duration-150 hover:translate-x-1 inline-block"
    >
      {label}
    </Link>
  </li>
);

// ─────────────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-[#0b0f17] border-t border-white/10 mt-12">

    <div className="max-w-7xl mx-auto py-10 px-6 lg:px-12">

      {/* ── Top centered tagline ────────────────────────────────────────────── */}
      <div className="w-full text-center border-b border-white/5 pb-8 mb-8">
        <h2 className="text-xl md:text-2xl font-bold tracking-[0.4em] text-white/90">
          LEARN. BUILD. CONNECT.
        </h2>
      </div>

      {/* ── 4-column grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">

        {/* Col 1 — Brand */}
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <OriginalLogoMark className="w-7 h-7 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
            <div className="leading-tight">
              <span className="text-white font-black text-xs block uppercase tracking-tight">
                AWS STUDENT BUILDER GROUP
              </span>
              <span className="text-[11px] font-bold text-sbg-green block tracking-tight">
                Roorkee Institute of Technology
              </span>
            </div>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            Architecting the future through Cloud, Web, and Embedded Innovations.
          </p>
        </div>

        {/* Col 2 — Navigation */}
        <div>
          <ColHeading>Navigation</ColHeading>
          <ul className="flex flex-col space-y-3">
            {NAV_LINKS.map((l) => <NavItem key={l.to} {...l} />)}
          </ul>
        </div>

        {/* Col 3 — Community */}
        <div>
          <ColHeading>Community</ColHeading>
          <ul className="flex flex-col space-y-3">
            {COMMUNITY_LINKS.map((l) => <NavItem key={l.to} {...l} />)}
          </ul>
        </div>

        {/* Col 4 — Connect */}
        <div>
          <ColHeading>Connect</ColHeading>

          {/* Social icon row */}
          <div className="flex items-center space-x-4 mb-4">
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-gray-400 hover:text-sbg-green transition-colors duration-150"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Email */}
          <a
            href="mailto:awssbg@ritroorkee.com"
            className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors duration-150 mb-4"
          >
            <Mail className="w-4 h-4 text-sbg-green flex-shrink-0" />
            <span>awssbg@ritroorkee.com</span>
          </a>

          {/* AWS Builder Center */}
          <a
            href="https://builder.aws.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sbg-green hover:underline underline-offset-4 transition-all"
          >
            AWS Builder Center
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>

    {/* ── Copyright bar ───────────────────────────────────────────────────── */}
    <div className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sbg-green animate-pulse" />
          <span>AWS SBG · Roorkee Institute of Technology</span>
        </div>
        <p>© 2026 AWS SBG RIT. All rights reserved.</p>
      </div>
    </div>

  </footer>
);

export default Footer;
