import React, { useEffect, useState } from 'react';
import { Modal } from '../ui';
import { IDEA_COLORS } from '../../constants';
import type { MarketingIdea } from '../../types';

interface IdeaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (idea: MarketingIdea) => void;
  onDelete: (id: string) => void;
  initialIdea: MarketingIdea | null;
}

const IdeaFormModal: (props: IdeaFormModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialIdea,
}) => {
  const [idea, setIdea] = useState<Partial<MarketingIdea>>({});

  useEffect(() => {
    if (isOpen) {
      setIdea(initialIdea || { color: 'yellow' });
    }
  }, [isOpen, initialIdea]);

  const handleSave = () => {
    if (!idea.content?.trim()) return;
    const finalIdea: MarketingIdea = {
      id: idea.id || `idea_${Date.now()}`,
      date: idea.date || new Date().toISOString(),
      title: idea.title || '',
      content: idea.content,
      color: idea.color || 'yellow',
      isFavorite: idea.isFavorite || false,
    };
    onSave(finalIdea);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialIdea ? 'Editar Ideia' : 'Nova Ideia'}>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="field-titulo-opcional"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Título (Opcional)
          </label>
          <input
            id="field-titulo-opcional"
            type="text"
            value={idea.title || ''}
            onChange={(e) => setIdea((i) => ({ ...i, title: e.target.value }))}
            className="w-full bg-background p-2 rounded-md border border-border-color"
            aria-label="Título da ideia"
          />
        </div>
        <div>
          <label
            htmlFor="field-ideia"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Ideia
          </label>
          <textarea
            id="field-ideia"
            value={idea.content || ''}
            onChange={(e) => setIdea((i) => ({ ...i, content: e.target.value }))}
            rows={5}
            className="w-full bg-background p-2 rounded-md border border-border-color"
            aria-label="Conteúdo da ideia"
          ></textarea>
        </div>
        <div>
          <span className="block text-sm font-medium text-text-secondary mb-2">Cor da Nota</span>
          <div className="flex items-center gap-3">
            {Object.keys(IDEA_COLORS).map((colorKey) => (
              <button
                key={colorKey}
                type="button"
                onClick={() => setIdea((i) => ({ ...i, color: colorKey }))}
                className={`w-8 h-8 rounded-full ${IDEA_COLORS[colorKey].bg} ${IDEA_COLORS[colorKey].border} transition-transform hover:scale-110 ${idea.color === colorKey ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                aria-label={`Selecionar cor ${colorKey}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
        <div>
          {initialIdea && (
            <button
              type="button"
              onClick={() => onDelete(initialIdea.id)}
              className="px-4 py-2 rounded-lg font-semibold text-error hover:bg-error/10 transition-colors"
            >
              Excluir
            </button>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
          >
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default IdeaFormModal;
