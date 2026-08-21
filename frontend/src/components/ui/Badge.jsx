/**
 * Badge — Role / Tech stack / Status pill
 */
const VARIANTS = {
  orange: 'badge-orange',
  purple: 'badge-purple',
  blue:   'badge-blue',
  green:  'badge-green',
  gray:   'badge bg-navy-800/60 text-text-muted border border-border-card',
};

const Badge = ({ children, variant = 'blue', className = '' }) => (
  <span className={`${VARIANTS[variant] ?? VARIANTS.blue} ${className}`}>
    {children}
  </span>
);

export default Badge;
