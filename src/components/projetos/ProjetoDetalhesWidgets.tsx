import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../../context';
import type { PaymentMethod, Project } from '../../types';
import { paymentMethods } from '../../types';
import { AlertIcon, CheckCircleIcon, ClipboardDocumentListIcon, PlusIcon } from '../ui';
import { Modal } from '../ui';

export type ProjectActionType = 'delete' | 'inactivate' | 'finalize';

export const InfoCard: React.FC<{
  label: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className }) => (
  <div className={`bg-surface p-4 rounded-xl shadow-soft ${className}`}>
    <p className="text-sm font-semibold text-text-secondary">{label}</p>
    <div className="mt-1 font-bold text-text-primary text-lg">{children}</div>
  </div>
);

export const RevisionCounter: React.FC<{
  count: number;
  limit: number;
  onIncrement: () => void;
}> = ({ count, limit, onIncrement }) => {
  const isOverLimit = count > limit;
  return (
    <div
      className={`bg-surface p-4 rounded-xl shadow-soft border ${isOverLimit ? 'border-error/50' : 'border-border-color'}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-text-secondary">Revisões Utilizadas</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-bold ${isOverLimit ? 'text-error' : 'text-text-primary'}`}
            >
              {count}
            </span>
            <span className="text-text-secondary font-medium">/ {limit}</span>
          </div>
        </div>
        <button
          onClick={onIncrement}
          className="p-2 bg-background hover:bg-border-color rounded-full transition-colors text-text-primary"
          aria-label="Adicionar revisão"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      {isOverLimit && (
        <p className="text-xs text-error mt-2 font-semibold flex items-center gap-1">
          <AlertIcon className="w-3 h-3" /> Limite excedido. Sugere-se criar um Aditivo Financeiro.
        </p>
      )}
    </div>
  );
};

export const LinkQuotationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (quotationIds: string[]) => void;
  project: Project;
}> = ({ isOpen, onClose, onSave, project }) => {
  const { quotations, projects } = useData();
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

export const ConfirmPaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, method: PaymentMethod) => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentMethods[0]);

  useEffect(() => {
    if (!isOpen) return;
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod(paymentMethods[0]);
  }, [isOpen]);

  if (!isOpen) return null;

  const commonInputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Recebimento">
      <div className="space-y-4">
        <p className="text-text-primary">Confirme os detalhes do pagamento recebido.</p>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Data de Recebimento
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className={commonInputClass}
            aria-label="Data de recebimento"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Forma de Pagamento
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className={commonInputClass}
            aria-label="Forma de pagamento"
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onConfirm(paymentDate, paymentMethod)}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary"
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
};

export const ProjectActionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (refundAmount: number, refundDate: string) => void;
  projectName: string;
  actionType: ProjectActionType;
}> = ({ isOpen, onClose, onConfirm, projectName, actionType }) => {
  const [hasRefund, setHasRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundDate, setRefundDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!isOpen) return;
    setHasRefund(false);
    setRefundAmount(0);
    setRefundDate(new Date().toISOString().split('T')[0]);
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
    error: 'bg-error hover:bg-red-700 text-white',
    warning: 'bg-warning hover:bg-yellow-600 text-white',
    success: 'bg-success hover:bg-emerald-700 text-white',
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
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Valor do Reembolso (R$)
                </label>
                <input
                  type="number"
                  value={refundAmount || ''}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className={commonInputClass}
                  placeholder="0.00"
                  aria-label="Valor do reembolso"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Data do Reembolso
                </label>
                <input
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
