import { describe, expect, it, vi } from 'vitest';
import { createTestProject } from '../test/factories';
import type { Project } from '../types/project';
import { useProjectFinancials } from './useProjectFinancials';

const makeProject = (overrides: Partial<Project> = {}): Project =>
  createTestProject({
    sections: [],
    financials: {
      paymentType: 'parcelado',
      numberOfInstallments: 3,
      installmentsPaymentDay: 15,
      installmentsInterestEnabled: false,
      startInstallmentsInCurrentMonth: false,
    },
    budget: 3000,
    ...overrides,
  });

describe('useProjectFinancials', () => {
  it('handleGenerateInstallments creates correct number of installments', () => {
    // Given — projeto parcelado em 3x
    const setLocalProject = vi.fn();
    const { handleGenerateInstallments } = useProjectFinancials(
      setLocalProject,
      makeProject(),
      null,
      vi.fn(),
      vi.fn(),
    );

    // When — gera parcelas
    handleGenerateInstallments();
    const updater = setLocalProject.mock.calls[0][0];
    const result = updater(makeProject());

    // Then — 3 parcelas geradas
    expect(result.financials.installments).toHaveLength(3);
    expect(result.financials.installments[0].number).toBe(1);
    expect(result.financials.installments[0].paid).toBe(false);
  });

  it('handleAddInstallment adds a new installment', () => {
    // Given — projeto sem parcelas
    const setLocalProject = vi.fn();
    const { handleAddInstallment } = useProjectFinancials(
      setLocalProject,
      makeProject(),
      null,
      vi.fn(),
      vi.fn(),
    );

    handleAddInstallment();
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({ financials: { paymentType: 'parcelado', installments: [] } });
    const result = updater(project);

    // Then — uma parcela adicionada
    expect(result.financials.installments).toHaveLength(1);
    expect(result.financials.installments[0].description).toBe('Parcela Extra');
  });

  it('handleRemoveInstallment removes installment by id', () => {
    // Given — projeto com duas parcelas
    const setLocalProject = vi.fn();
    const { handleRemoveInstallment } = useProjectFinancials(
      setLocalProject,
      makeProject(),
      null,
      vi.fn(),
      vi.fn(),
    );

    handleRemoveInstallment('inst-1');
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({
      financials: {
        paymentType: 'parcelado',
        installments: [
          { id: 'inst-1', number: 1, value: 500, dueDate: '2026-01-15', paid: false, paymentDate: null },
          { id: 'inst-2', number: 2, value: 500, dueDate: '2026-02-15', paid: false, paymentDate: null },
        ],
      },
    });
    const result = updater(project);

    // Then — só inst-2 permanece
    expect(result.financials.installments).toHaveLength(1);
    expect(result.financials.installments[0].id).toBe('inst-2');
  });

  it('handleInstallmentChange updates field on correct installment', () => {
    // Given — parcela existente
    const setLocalProject = vi.fn();
    const { handleInstallmentChange } = useProjectFinancials(
      setLocalProject,
      makeProject(),
      null,
      vi.fn(),
      vi.fn(),
    );

    handleInstallmentChange('inst-1', 'value', 999);
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({
      financials: {
        paymentType: 'parcelado',
        installments: [
          { id: 'inst-1', number: 1, value: 500, dueDate: '2026-01-15', paid: false, paymentDate: null },
        ],
      },
    });
    const result = updater(project);

    // Then — valor atualizado
    expect(result.financials.installments[0].value).toBe(999);
  });

  it('handleOpenConfirmPayment sets payment target and opens modal', () => {
    // Given — setters mockados
    const setPaymentToConfirm = vi.fn();
    const setPaymentConfirmModalOpen = vi.fn();
    const { handleOpenConfirmPayment } = useProjectFinancials(
      vi.fn(),
      makeProject(),
      null,
      setPaymentToConfirm,
      setPaymentConfirmModalOpen,
    );

    // When — abre confirmação de pagamento
    handleOpenConfirmPayment({ type: 'lump' });

    // Then — target definido e modal aberto
    expect(setPaymentToConfirm).toHaveBeenCalledWith({ type: 'lump' });
    expect(setPaymentConfirmModalOpen).toHaveBeenCalledWith(true);
  });

  it('handleConfirmPayment does nothing when paymentToConfirm is null', () => {
    // Given — paymentToConfirm=null
    const setLocalProject = vi.fn();
    const { handleConfirmPayment } = useProjectFinancials(
      setLocalProject,
      makeProject(),
      null,
      vi.fn(),
      vi.fn(),
    );

    // When — confirma sem target
    handleConfirmPayment('2026-03-01', 'PIX');

    // Then — nenhuma atualização
    expect(setLocalProject).not.toHaveBeenCalled();
  });

  it('handleConfirmPayment marks lump sum as paid', () => {
    // Given — localProject com pagamento lump e paymentToConfirm=lump
    const setLocalProject = vi.fn();
    const setPaymentConfirmModalOpen = vi.fn();
    const setPaymentToConfirm = vi.fn();
    const project = makeProject({ financials: { paymentType: 'vista' } });

    const { handleConfirmPayment } = useProjectFinancials(
      setLocalProject,
      project,
      { type: 'lump' },
      setPaymentToConfirm,
      setPaymentConfirmModalOpen,
    );

    // When — confirma
    handleConfirmPayment('2026-03-01', 'PIX');

    // Then — projeto atualizado com lump pago
    expect(setLocalProject).toHaveBeenCalledWith(
      expect.objectContaining({
        financials: expect.objectContaining({ lumpSumStatus: 'Pago', lumpSumPaymentDate: '2026-03-01' }),
      }),
    );
    expect(setPaymentConfirmModalOpen).toHaveBeenCalledWith(false);
  });

  it('handleAddDeadline adds a new deadline', () => {
    // Given — projeto sem prazos adicionais
    const setLocalProject = vi.fn();
    const { handleAddDeadline } = useProjectFinancials(
      setLocalProject,
      makeProject(),
      null,
      vi.fn(),
      vi.fn(),
    );

    handleAddDeadline();
    const updater = setLocalProject.mock.calls[0][0];
    const result = updater(makeProject());

    // Then — prazo adicionado
    expect(result.additionalDeadlines).toHaveLength(1);
    expect(result.additionalDeadlines[0].title).toBe('Novo Prazo');
  });

  it('handleRemoveDeadline removes deadline by id', () => {
    // Given — projeto com um prazo
    const setLocalProject = vi.fn();
    const { handleRemoveDeadline } = useProjectFinancials(
      setLocalProject,
      makeProject(),
      null,
      vi.fn(),
      vi.fn(),
    );

    handleRemoveDeadline('d1');
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({
      additionalDeadlines: [
        { id: 'd1', title: 'Prazo A', date: '2026-01-01' },
        { id: 'd2', title: 'Prazo B', date: '2026-02-01' },
      ],
    });
    const result = updater(project);

    // Then — apenas d2 permanece
    expect(result.additionalDeadlines).toHaveLength(1);
    expect(result.additionalDeadlines[0].id).toBe('d2');
  });

  it('incrementRevision increments revisionCount', () => {
    // Given — projeto com revisionCount=2
    const setLocalProject = vi.fn();
    const { incrementRevision } = useProjectFinancials(
      setLocalProject,
      makeProject(),
      null,
      vi.fn(),
      vi.fn(),
    );

    incrementRevision();
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({ revisionCount: 2 });
    const result = updater(project);

    // Then — revisionCount incrementado para 3
    expect(result.revisionCount).toBe(3);
  });
});
