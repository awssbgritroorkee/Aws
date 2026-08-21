import Badge from '../ui/Badge';
import Button from '../ui/Button';

const IdeaCard = ({ idea }) => {
  const { title, description, author, tags = [], created_at, votes = 0 } = idea;

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <article className="card p-4 group hover:border-border-subtle transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-text-primary leading-snug group-hover:text-white transition-colors">
          {title}
        </h3>
        <button
          className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded
                     border border-border-card text-text-subtle hover:border-sbg-purple/40
                     hover:text-sbg-purple-glow transition-all text-xs"
          aria-label={`Upvote: ${votes} votes`}
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 2l4 6H2l4-6z"/>
          </svg>
          <span className="font-bold">{votes}</span>
        </button>
      </div>

      {description && (
        <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">
          {description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.map((tag) => (
          <Badge key={tag} variant="purple">{tag}</Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-text-subtle border-t border-border-card pt-2 mt-2">
        <span>by <span className="text-text-muted font-medium">{author || 'Anonymous'}</span></span>
        <span>{formattedDate}</span>
      </div>
    </article>
  );
};

export default IdeaCard;
