import { v4 as uuidv4 } from 'uuid';
import type { Project, Installment, AdditionalDeadline } from '../types/project';
import type { PaymentMethod } from '../types/finance';
import { getTodayDateOnly, toDateOnlyString } from '../utils/formatters';
import { getProjectTotalContractValue } from '../utils/projectFinancials';

type ProjectSetter = React.Dispatch<React.SetStateAction<Project | null>>;

export type PaymentTarget = { type: 'lump' } | { type: 'installment'; id: string };

/**
 * Encapsulates financial handlers for project details (installments, payments, deadlines, revision).
 * input -> setLocalProject setter, localProject ref, payment modal state setters
 * output -> { handleGenerateInstallments, handleInstallmentChange, handleAddInstallment, handleRemoveInstallment, handleOpenConfirmPayment, handleConfirmPayment, handleAddDeadline, handleDeadlineChange, handleRemoveDeadline, incrementRevision }
 */
export function useProjectFinancials(
  setLocalProject: ProjectSetter,
  localProject: Project | null,
  paymentToConfirm: PaymentTarget | null,
  setPaymentToConfirm: React.Dispatch<React.SetStateAction<PaymentTarget | null>>,
  openPaymentConfirmModal: () => void,
  closePaymentConfirmModal: () => void,
) {
  const handleGenerateInstallments = () => {
    setLocalProject((p) => {
      if (!p) return null;
      const total = getProjectTotalContractValue(p);
      const count = p.financials.numberOfInstallments || 1;
      const day = p.financials.installmentsPaymentDay || new Date().getDate();
      const interest =
        (p.financials.installmentsInterestEnabled ?? true)
          ? (p.financials.installmentsInterestRate || 0) / 100
          : 0;
      const totalWithInterest = total * (1 + interest);
      const valuePerInstallment = totalWithInterest / count;
      const today = new Date();
      const newInstallments = Array.from({ length: count }, (_, i): Installment => {
        const monthOffset = p.financials.startInstallmentsInCurrentMonth ? i : i + 1;
        const targetMonth = today.getMonth() + monthOffset;
        let targetDate = new Date(today.getFullYear(), targetMonth, day);
        if (targetDate.getMonth() !== targetMonth % 12) {
          targetDate = new Date(today.getFullYear(), targetMonth + 1, 0);
        }
        return {
          id: uuidv4(),
          number: i + 1,
          value: valuePerInstallment,
          dueDate: toDateOnlyString(targetDate),
          paid: false,
          paymentDate: null,
        };
      });
      return { ...p, financials: { ...p.financials, installments: newInstallments } };
    });
  };

  const handleInstallmentChange = (
    id: string,
    field: keyof Installment,
    value: Installment[keyof Installment],
  ) => {
    setLocalProject((p) => {
      if (!p) return null;
      const installments =
        p.financials.installments?.map((inst) =>
          inst.id === id ? { ...inst, [field]: value } : inst,
        ) || [];
      return { ...p, financials: { ...p.financials, installments } };
    });
  };

  const handleAddInstallment = () => {
    setLocalProject((p) => {
      if (!p) return null;
      const currentInstallments = p.financials.installments || [];
      const newInstallment: Installment = {
        id: uuidv4(),
        number: currentInstallments.length + 1,
        value: 0,
        dueDate: getTodayDateOnly(),
        paid: false,
        paymentDate: null,
        description: 'Parcela Extra',
      };
      return {
        ...p,
        financials: { ...p.financials, installments: [...currentInstallments, newInstallment] },
      };
    });
  };

  const handleRemoveInstallment = (id: string) => {
    setLocalProject((p) => {
      if (!p) return null;
      return {
        ...p,
        financials: {
          ...p.financials,
          installments: p.financials.installments?.filter((i) => i.id !== id),
        },
      };
    });
  };

  const handleOpenConfirmPayment = (
    payment: { type: 'lump' } | { type: 'installment'; id: string },
  ) => {
    setPaymentToConfirm(payment);
    openPaymentConfirmModal();
  };

  const handleConfirmPayment = (paymentDate: string, paymentMethod: PaymentMethod) => {
    if (!paymentToConfirm || !localProject) return;
    const newFinancials = { ...localProject.financials };
    if (paymentToConfirm.type === 'lump') {
      newFinancials.lumpSumStatus = 'Pago';
      newFinancials.lumpSumPaymentDate = paymentDate;
      newFinancials.lumpSumPaymentMethod = paymentMethod;
    } else {
      newFinancials.installments = (newFinancials.installments || []).map((inst) =>
        inst.id === paymentToConfirm.id
          ? { ...inst, paid: true, paymentDate: paymentDate, paymentMethod: paymentMethod }
          : inst,
      );
    }
    setLocalProject({ ...localProject, financials: newFinancials });
    closePaymentConfirmModal();
    setPaymentToConfirm(null);
  };

  const handleAddDeadline = () => {
    setLocalProject((p) => {
      if (!p) return null;
      const conclusionDate = p.deadline ? p.deadline.split('T')[0] : null;
      const today = getTodayDateOnly();
      // Block if there is no conclusion date or today is >= conclusion date
      if (!conclusionDate || today >= conclusionDate) return p;
      return {
        ...p,
        additionalDeadlines: [
          ...(p.additionalDeadlines || []),
          { id: uuidv4(), title: 'Novo Prazo', date: today },
        ],
      };
    });
  };

  const handleDeadlineChange = (id: string, field: keyof AdditionalDeadline, value: string) => {
    setLocalProject((p) => {
      if (!p) return null;
      // When editing a date, block values >= conclusion date
      if (field === 'date') {
        const conclusionDate = p.deadline ? p.deadline.split('T')[0] : null;
        if (conclusionDate && value >= conclusionDate) return p;
      }
      return {
        ...p,
        additionalDeadlines: (p.additionalDeadlines || []).map((d) =>
          d.id === id ? { ...d, [field]: value } : d,
        ),
      };
    });
  };

  const handleRemoveDeadline = (id: string) => {
    setLocalProject((p) =>
      p
        ? { ...p, additionalDeadlines: (p.additionalDeadlines || []).filter((d) => d.id !== id) }
        : null,
    );
  };

  const incrementRevision = () => {
    setLocalProject((p) => (p ? { ...p, revisionCount: (p.revisionCount || 0) + 1 } : null));
  };

  const decrementRevision = () => {
    setLocalProject((p) =>
      p ? { ...p, revisionCount: Math.max(0, (p.revisionCount || 0) - 1) } : null,
    );
  };

  return {
    handleGenerateInstallments,
    handleInstallmentChange,
    handleAddInstallment,
    handleRemoveInstallment,
    handleOpenConfirmPayment,
    handleConfirmPayment,
    handleAddDeadline,
    handleDeadlineChange,
    handleRemoveDeadline,
    incrementRevision,
    decrementRevision,
  };
}
