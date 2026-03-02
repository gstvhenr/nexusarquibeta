import { StarIcon, Button } from '../../components/ui';
import { IDEA_COLORS } from '../../constants';
import type { MarketingIdea } from '../../types';
import { formatDate } from '../../utils/formatters';

type IdeaCardProps = {
  idea: MarketingIdea;
  onEdit: () => void;
  onToggleFavorite: () => void;
};

function IdeaCard({ idea, onEdit, onToggleFavorite }: IdeaCardProps): JSX.Element {
  const colorClasses = IDEA_COLORS[idea.color || 'yellow'] || IDEA_COLORS.yellow;

  return (
    <div
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit();
        }
      }}
      role="button"
      tabIndex={0}
      className={`relative group p-4 rounded-lg shadow-soft flex flex-col h-48 cursor-pointer transform hover:-rotate-2 transition-all duration-200 ease-in-out ${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover}`}
    >
      <Button
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite();
        }}
        className="!p-1 !min-h-0 !min-w-0 absolute top-2 right-2 rounded-full !bg-transparent text-amber-300 hover:text-amber-400 transition-colors z-10"
        aria-label={idea.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <StarIcon solid={!!idea.isFavorite} className="w-6 h-6" />
      </Button>
      {idea.title && (
        <h4 className="font-serif font-bold text-text-primary mb-2 pr-8">{idea.title}</h4>
      )}
      <p
        className={`flex-grow text-text-primary whitespace-pre-wrap font-sans text-sm ${idea.title ? '' : 'pt-4'}`}
      >
        {idea.content}
      </p>
      <span className="text-xs text-text-secondary/70 mt-2">{formatDate(idea.date)}</span>
    </div>
  );
}

type MarketingIdeasViewProps = {
  ideas: MarketingIdea[];
  onEditIdea: (idea: MarketingIdea) => void;
  onToggleFavorite: (id: string) => void;
};

export function MarketingIdeasView({
  ideas,
  onEditIdea,
  onToggleFavorite,
}: MarketingIdeasViewProps): JSX.Element {
  const sortedIdeas = [...ideas].sort(
    (first, second) =>
      (second.isFavorite ? 1 : -1) - (first.isFavorite ? 1 : -1) ||
      new Date(second.date).getTime() - new Date(first.date).getTime(),
  );

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedIdeas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onEdit={() => onEditIdea(idea)}
            onToggleFavorite={() => onToggleFavorite(idea.id)}
          />
        ))}
      </div>
    </div>
  );
}
