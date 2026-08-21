/**
 * SectionHeader — Page / section title + subtitle block.
 * Used at the top of every page.
 */
const SectionHeader = ({
  title,
  subtitle,
  children,
  className = '',
  tag: Tag = 'h1',
}) => (
  <div className={`mb-8 animate-in ${className}`}>
    <Tag className="section-title mb-2">{title}</Tag>
    {subtitle && <p className="section-subtitle max-w-2xl">{subtitle}</p>}
    {children && <div className="mt-4 flex items-center gap-3">{children}</div>}
  </div>
);

export default SectionHeader;
