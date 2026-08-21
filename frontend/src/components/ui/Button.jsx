/**
 * Button — Primary / Outline / Ghost / Orange / Purple variants
 * Matches the AWS Builder Center CTA button styles exactly.
 */
const VARIANTS = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost:   'btn-ghost',
  orange:  'btn-orange',
  purple:  'btn-purple',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5',
  md: '',  // default from .btn class
  lg: 'text-base px-5 py-2.5',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  icon: Icon,
  ...props
}) => {
  const variantClass = VARIANTS[variant] ?? VARIANTS.primary;
  const sizeClass    = SIZES[size]    ?? '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClass}
        ${sizeClass}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
