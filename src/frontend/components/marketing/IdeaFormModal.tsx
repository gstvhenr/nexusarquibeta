import React, { useEffect, useState } from 'react';
import { Button, FormField, Input, Modal, Textarea } from '../ui';
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
        <FormField label="Título (Opcional)">
          <Input
            type="text"
            value={idea.title || ''}
            onChange={(e) => setIdea((i) => ({ ...i, title: e.target.value }))}
            aria-label="Título da ideia"
          />
        </FormField>
        <FormField label="Ideia">
          <Textarea
            value={idea.content || ''}
            onChange={(e) => setIdea((i) => ({ ...i, content: e.target.value }))}
            rows={5}
            aria-label="Conteúdo da ideia"
          />
        </FormField>
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
            <Button
              variant="secondary"
              onClick={() => onDelete(initialIdea.id)}
              className="text-error hover:bg-error/10"
            >
              Excluir
            </Button>
          )}
        </div>
        <div className="flex space-x-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IdeaFormModal;
