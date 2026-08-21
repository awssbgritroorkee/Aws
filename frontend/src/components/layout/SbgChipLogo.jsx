/**
 * SbgChipLogo — Inline SVG chip logo (pure component, no asset import needed).
 * Renders the AWS SBG purple chip with circuit traces + AWS smile.
 */
const SbgChipLogo = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`flex-shrink-0 ${className}`}
    aria-label="AWS SBG Chip Logo"
  >
    <defs>
      <filter id="chipGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="chipFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
    </defs>

    {/* Circuit traces - Top */}
    {[70, 85, 100, 115, 130].map((x, i) => (
      <line key={`t${i}`} x1={x} y1="55" x2={x} y2={i % 2 === 0 ? 18 : 10}
        stroke="#ff9900" strokeWidth="2.5" strokeLinecap="round" opacity={i % 2 === 0 ? 0.9 : 0.65} />
    ))}
    {/* Circuit traces - Bottom */}
    {[70, 85, 100, 115, 130].map((x, i) => (
      <line key={`b${i}`} x1={x} y1="145" x2={x} y2={i % 2 === 0 ? 182 : 190}
        stroke="#ff9900" strokeWidth="2.5" strokeLinecap="round" opacity={i % 2 === 0 ? 0.9 : 0.65} />
    ))}
    {/* Circuit traces - Left */}
    {[70, 85, 100, 115, 130].map((y, i) => (
      <line key={`l${i}`} x1="55" y1={y} x2={i % 2 === 0 ? 18 : 10} y2={y}
        stroke="#ff9900" strokeWidth="2.5" strokeLinecap="round" opacity={i % 2 === 0 ? 0.9 : 0.65} />
    ))}
    {/* Circuit traces - Right */}
    {[70, 85, 100, 115, 130].map((y, i) => (
      <line key={`r${i}`} x1="145" y1={y} x2={i % 2 === 0 ? 182 : 190} y2={y}
        stroke="#ff9900" strokeWidth="2.5" strokeLinecap="round" opacity={i % 2 === 0 ? 0.9 : 0.65} />
    ))}

    {/* Chip body */}
    <rect x="55" y="55" width="90" height="90" rx="10" ry="10"
      fill="url(#chipFill)" filter="url(#chipGlow)" />
    <rect x="55" y="55" width="90" height="90" rx="10" ry="10"
      fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.6" />

    {/* Inner die area */}
    <rect x="68" y="68" width="64" height="64" rx="5"
      fill="#4c1d95" opacity="0.7" />
    <rect x="68" y="68" width="64" height="64" rx="5"
      fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.4" />

    {/* SBG label */}
    <text x="100" y="97" fontFamily="Inter, Arial, sans-serif" fontSize="12"
      fontWeight="700" fill="#e8edf3" textAnchor="middle" letterSpacing="2.5">
      SBG
    </text>

    {/* AWS smile arrow */}
    <path d="M 82 111 Q 100 122 118 111"
      stroke="#ff9900" strokeWidth="3" fill="none" strokeLinecap="round" />
    <polygon points="115,107 119,111 113,113" fill="#ff9900" />
  </svg>
);

export default SbgChipLogo;
