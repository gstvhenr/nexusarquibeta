import React, { useState, useEffect } from 'react';
import { Modal } from '../ui';
import { AlertIcon } from '../ui';
import { getTodayDateOnly } from '../../utils/formatters';

export type ProjectActionType = 'delete' | 'inactivate' | 'finalize';

export const ProjectActionModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (refundAmount: number, refundDate: string) => void;
  projectName: string;
  actionType: ProjectActionType;
}) => React.ReactNode = ({ isOpen, onClose, onConfirm, projectName, actionType }) => {
  const [hasRefund, setHasRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundDate, setRefundDate] = useState(getTodayDateOnly());

  useEffect(() => {
    if (!isOpen) return;
    setHasRefund(false);
    setRefundAmount(0);
    setRefundDate(getTodayDateOnly());
  }, [isOpen]);

  const handleSubmit = () => {
    if (hasRefund && refundAmount <= 0) {
      alert('Informe um valor de reembolso válido.');
      return;
    }
    onConfirm(hasRefund ? refundAmount : 0, refundDate);
  };

  if (!isOpen) return null;

  const commonInputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition';

  const config = {
    delete: {
      title: 'Excluir Projeto',
      message: `Você tem certeza que deseja EXCLUIR permanentemente o projeto "${projectName}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Sim, Excluir',
      color: 'error',
    },
    inactivate: {
      title: 'Inativar e Arquivar',
      message: `O projeto "${projectName}" será inativado e movido para o arquivo. Você poderá reativá-lo futuramente.`,
      confirmLabel: 'Inativar',
      color: 'warning',
    },
    finalize: {
      title: 'Finalizar Projeto',
      message: `Parabéns! O projeto "${projectName}" será marcado como concluído e arquivado. Todas as tarefas pendentes serão marcadas como concluídas.`,
      confirmLabel: 'Finalizar',
      color: 'success',
    },
  }[actionType];

  const colorClass = {
    error: 'bg-error hover:bg-error/80 text-white',
    warning: 'bg-warning hover:bg-warning/80 text-white',
    success: 'bg-success hover:bg-success/80 text-white',
  }[config.color];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title}>
      <div className="space-y-6">
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 bg-background border-${config.color}/30`}
        >
          <AlertIcon className={`w-5 h-5 text-${config.color} flex-shrink-0 mt-0.5`} />
          <p className="text-sm text-text-primary">{config.message}</p>
        </div>

        <div className="p-4 bg-background/50 rounded-lg border border-border-color/50">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              id="action-has-refund"
              type="checkbox"
              checked={hasRefund}
              onChange={(e) => setHasRefund(e.target.checked)}
              className="rounded accent-primary w-4 h-4"
              aria-label="Existe valor de reembolso"
            />
            <span className="font-semibold text-text-primary">
              Existem valores a serem reembolsados?
            </span>
          </label>

          {hasRefund && (
            <div className="grid grid-cols-2 gap-4 mt-3 animate-fade-in-up">
              <div>
                <label
                  htmlFor="field-valor-do-reembolso-r"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  Valor do Reembolso (R$)
                </label>
                <input
                  id="field-valor-do-reembolso-r"
                  type="number"
                  value={refundAmount || ''}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className={commonInputClass}
                  placeholder="0.00"
                  aria-label="Valor do reembolso"
                />
              </div>
              <div>
                <label
                  htmlFor="field-data-do-reembolso"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  Data do Reembolso
                </label>
                <input
                  id="field-data-do-reembolso"
                  type="date"
                  value={refundDate}
                  onChange={(e) => setRefundDate(e.target.value)}
                  className={commonInputClass}
                  aria-label="Data do reembolso"
                />
              </div>
              <p className="col-span-2 text-xs text-text-secondary italic">
                * Um registro de despesa será criado automaticamente na categoria "Reembolso a
                Cliente".
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className={`px-6 py-2 rounded-lg font-semibold ${colorClass}`}
        >
          {config.confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
