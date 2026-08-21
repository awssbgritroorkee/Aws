/**
 * Avatar — Shows image if src provided, else initials fallback.
 */
const SIZES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

const Avatar = ({
  src,
  alt = '',
  initials = '?',
  size = 'md',
  gradientClass = 'from-sbg-purple to-sbg-purple-dark',
  className = '',
}) => {
  const sizeClass = SIZES[size] ?? SIZES.md;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`avatar ${sizeClass} object-cover ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={alt || initials}
      className={`avatar ${sizeClass} bg-gradient-to-br ${gradientClass} text-white ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
