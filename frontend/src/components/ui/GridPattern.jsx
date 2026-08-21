/**
 * GridPattern — faint SVG dot/line grid, used behind the hero section.
 * Matches the subtle grid on builder.aws.com
 */
const GridPattern = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`absolute inset-0 pointer-events-none ${className}`}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%231e3a5f' stroke-width='0.6' opacity='0.5'/%3E%3C/svg%3E")`,
      backgroundSize: '40px 40px',
    }}
  />
);

export default GridPattern;
