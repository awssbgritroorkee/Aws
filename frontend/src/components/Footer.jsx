import { Link } from 'react-router-dom';
import { ExternalLink, MessageCircle } from 'lucide-react';
import OriginalLogoMark from './OriginalLogoMark';

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-1.22.99-2.22 2.22-2.22s2.22 1 2.22 2.22v4.93h2.8M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const Footer = () => (
  <footer className="bg-[#10151c] border-t border-white/5 mt-8 pt-6 pb-6">
    <div className="max-w-7xl mx-auto px-6">
      {/* Tagline Banner */}
      <div className="pb-6 mb-6 border-b border-white/10 w-full flex justify-center items-center overflow-hidden">
        <span className="text-[clamp(1.5rem,5vw,4rem)] font-black tracking-widest text-white/80 whitespace-nowrap text-center w-full font-mono uppercase block">
          BUILD. DEPLOY. GROW.
        </span>
      </div>

      <div className="pt-4 w-full grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Top/Left: Logo + Tagline */}
      <div className="md:col-span-1 space-y-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <OriginalLogoMark className="w-8 h-8 flex-shrink-0 transition-transform group-hover:scale-105" />
          <div className="leading-tight">
            <span className="text-white font-black text-[11px] md:text-[12px] block uppercase tracking-tight">
              AWS STUDENT BUILDER GROUP
            </span>
            <span className="text-[10px] md:text-[11px] font-bold text-sbg-green block tracking-tight">
              Roorkee Institute of Technology
            </span>
          </div>
        </Link>
        <p className="text-xs text-gray-400 leading-relaxed font-sans">
          Architecting the future through Cloud, Web, and Embedded Innovations.
        </p>
      </div>

      {/* Middle: Quick Links Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">Navigation</h4>
        <ul className="space-y-2 text-xs font-sans">
          <li>
            <Link to="/" className="hover:text-sbg-green transition-colors">Home</Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-sbg-green transition-colors">About Us</Link>
          </li>
          <li>
            <Link to="/events" className="hover:text-sbg-green transition-colors">Events &amp; Workshops</Link>
          </li>
          <li>
            <Link to="/team" className="hover:text-sbg-green transition-colors">Leadership Team</Link>
          </li>
          <li>
            <Link to="/gallery" className="hover:text-sbg-green transition-colors">Photo Gallery</Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-sbg-green transition-colors">Contact &amp; Join</Link>
          </li>
        </ul>
      </div>

      {/* Middle-Right: Community & Social Icons */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">Connect</h4>
        <div className="flex items-center gap-3">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-sbg-green hover:border-sbg-green/40 transition-all"
          >
            <LinkedinIcon className="w-4 h-4" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-sbg-green hover:border-sbg-green/40 transition-all"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-sbg-green hover:border-sbg-green/40 transition-all"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
          <a
            href="https://whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Community"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-sbg-green hover:border-sbg-green/40 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Bottom-Right: Resources Link */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">Resources</h4>
        <a
          href="https://builder.aws.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-sbg-green hover:underline"
        >
          AWS Builder Center
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  </div>

  {/* Bottom Copyright Bar */}
    <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm text-gray-500">
      © 2026 AWS SBG RIT
    </div>
  </footer>
);

export default Footer;
