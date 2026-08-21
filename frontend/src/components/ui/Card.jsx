/**
 * Card — Standard enterprise card surface
 * Children render inside. Optional header slot.
 */
const Card = ({
  children,
  className = '',
  header,
  padding = true,
  hover = true,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`
      card
      ${padding ? 'p-5' : ''}
      ${hover ? '' : 'hover:shadow-card hover:border-border-card'}
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
  >
    {header && (
      <div className="pb-4 mb-4 border-b border-border-card">
        {header}
      </div>
    )}
    {children}
  </div>
);

export default Card;
