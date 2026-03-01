import React, { useEffect, useMemo, useState } from 'react';
import { useCoreData, useSupplyChainData } from '../../context';
import type { Project } from '../../types';
import { ClipboardDocumentListIcon } from '../ui';
import { Modal } from '../ui';

export const LinkQuotationModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quotationIds: string[]) => void;
  project: Project;
}) => React.ReactNode = ({ isOpen, onClose, onSave, project }) => {
  const { quotations } = useSupplyChainData();
  const { projects } = useCoreData();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) setSelectedIds(project.linkedQuotationIds || []);
  }, [isOpen, project]);

  const availableQuotations = useMemo(() => {
    return quotations.filter((q) => {
      if (q.archived) return false;
      const isLinkedElsewhere = projects.some(
        (p) => p.id !== project.id && (p.linkedQuotationIds || []).includes(q.id),
      );
      return !isLinkedElsewhere;
    });
  }, [quotations, projects, project.id]);

  const handleToggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vincular Cotações" size="2xl">
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {availableQuotations.length > 0 ? (
          availableQuotations.map((quotation) => {
            const isSelected = selectedIds.includes(quotation.id);
            return (
              <label
                key={quotation.id}
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-background border-border-color hover:border-primary/50'}`}
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(quotation.id)}
                    className="h-5 w-5 rounded accent-primary cursor-pointer"
                    aria-label={`Selecionar cotação ${quotation.name}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p
                      className={`font-semibold ${isSelected ? 'text-primary' : 'text-text-primary'}`}
                    >
                      {quotation.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${quotation.status === 'Finalizada' ? 'bg-success/20 text-success' : 'bg-info/20 text-info'}`}
                    >
                      {quotation.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-text-secondary">{quotation.date}</p>
                    <p className="text-xs text-text-secondary font-medium">
                      {quotation.items.length} itens
                    </p>
                  </div>
                </div>
              </label>
            );
          })
        ) : (
          <div className="text-center py-12 text-text-secondary border-2 border-dashed border-border-color rounded-xl">
            <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma cotação disponível para vínculo.</p>
            <p className="text-xs mt-1">Crie uma nova cotação no menu Suprimentos.</p>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onSave(selectedIds)}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors shadow-soft"
        >
          Salvar Seleção
        </button>
      </div>
    </Modal>
  );
};
