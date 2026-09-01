import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import OriginalLogoMark from './OriginalLogoMark';

const Footer = () => (
  <footer className="bg-[#10151c] border-t border-white/5 py-4 mt-6">
    <div className="max-w-7xl mx-auto px-6">
      {/* Tagline Banner */}
      <div className="pb-3 mb-4 border-b border-white/5 w-full flex justify-center items-center overflow-hidden">
        <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-white/80 whitespace-nowrap text-center w-full font-mono uppercase block">
          BUILD. DEPLOY. GROW.
        </span>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Top/Left: Logo + Tagline */}
      <div className="md:col-span-1 space-y-2">
        <Link to="/" className="flex items-center gap-2.5 group">
          <OriginalLogoMark className="w-7 h-7 flex-shrink-0 transition-transform group-hover:scale-105" />
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
      <div className="space-y-2">
        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">Navigation</h4>
        <ul className="space-y-1 text-xs font-sans">
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
      <div className="space-y-2">
        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">Connect</h4>
        <div className="flex space-x-4">
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/in/aws-sbg-on-campus-rit-roorkee/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00d084] transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
            </a>

            {/* WhatsApp */}
            <a href="https://chat.whatsapp.com/CDOK76szIgzLFTOGcSPCY2" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00d084] transition-colors" aria-label="WhatsApp">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.031 0c-6.627 0-12.031 5.405-12.031 12.034 0 2.124.553 4.195 1.603 6.012l-1.703 6.216 6.35-1.666c1.782.972 3.784 1.485 5.781 1.485 6.623 0 12.025-5.405 12.025-12.046 0-6.629-5.402-12.035-12.025-12.035zm6.55 17.202c-.328.92-1.921 1.713-2.673 1.802-.751.089-1.725.263-5.234-1.196-4.24-1.761-6.953-6.106-7.164-6.39-.211-.284-1.712-2.277-1.712-4.341 0-2.064 1.074-3.08 1.458-3.483.385-.403.839-.504 1.118-.504.28 0 .559.006.812.018.265.013.621-.104.972.744.364.88 1.258 3.064 1.368 3.29.111.226.185.489.043.774-.141.284-.213.46-.425.709-.211.248-.445.541-.637.728-.213.208-.436.435-.195.848.241.413 1.075 1.776 2.311 2.88 1.599 1.428 2.923 1.868 3.328 2.064.406.196.643.16.885-.116.241-.277 1.042-1.216 1.323-1.633.282-.416.564-.347.943-.207.38.139 2.4 1.131 2.812 1.339.412.208.687.311.786.486.101.174.101 1.018-.227 1.938z" clipRule="evenodd" />
                </svg>
            </a>

            {/* Instagram */}
            <a href="https://www.instagram.com/aws.sbg.ritroorkee/?hl=en" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00d084] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" clipRule="evenodd" />
                </svg>
            </a>
        </div>
      </div>

      {/* Bottom-Right: Resources Link */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">Resources</h4>
        <a
          href="https://builder.aws.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-sbg-green hover:underline"
        >
          AWS Builder Center
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  </div>

  {/* Bottom Copyright Bar */}
    <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-gray-500">
      © 2026 AWS SBG RIT
    </div>
  </footer>
);

export default Footer;
