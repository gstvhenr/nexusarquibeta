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
          {
            id: 'inst-1',
            number: 1,
            value: 500,
            dueDate: '2026-01-15',
            paid: false,
            paymentDate: null,
          },
          {
            id: 'inst-2',
            number: 2,
            value: 500,
            dueDate: '2026-02-15',
            paid: false,
            paymentDate: null,
          },
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
          {
            id: 'inst-1',
            number: 1,
            value: 500,
            dueDate: '2026-01-15',
            paid: false,
            paymentDate: null,
          },
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
        financials: expect.objectContaining({
          lumpSumStatus: 'Pago',
          lumpSumPaymentDate: '2026-03-01',
        }),
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

  // ── Edge cases: null project guard ──

  it('handleGenerateInstallments returns null when project is null', () => {
    // Given
    const setLocalProject = vi.fn();
    const { handleGenerateInstallments } = useProjectFinancials(
      setLocalProject,
      null,
      null,
      vi.fn(),
      vi.fn(),
    );

    // When
    handleGenerateInstallments();
    const updater = setLocalProject.mock.calls[0][0];
    const result = updater(null);

    // Then — null guard exits early
    expect(result).toBeNull();
  });

  it('handleAddInstallment returns null when project is null', () => {
    // Given
    const setLocalProject = vi.fn();
    const { handleAddInstallment } = useProjectFinancials(
      setLocalProject,
      null,
      null,
      vi.fn(),
      vi.fn(),
    );

    // When
    handleAddInstallment();
    const updater = setLocalProject.mock.calls[0][0];
    const result = updater(null);

    // Then
    expect(result).toBeNull();
  });

  it('handleRemoveInstallment returns null when project is null', () => {
    // Given
    const setLocalProject = vi.fn();
    const { handleRemoveInstallment } = useProjectFinancials(
      setLocalProject,
      null,
      null,
      vi.fn(),
      vi.fn(),
    );

    // When
    handleRemoveInstallment('any-id');
    const updater = setLocalProject.mock.calls[0][0];
    const result = updater(null);

    // Then
    expect(result).toBeNull();
  });

  it('handleAddDeadline returns null when project is null', () => {
    // Given
    const setLocalProject = vi.fn();
    const { handleAddDeadline } = useProjectFinancials(
      setLocalProject,
      null,
      null,
      vi.fn(),
      vi.fn(),
    );

    // When
    handleAddDeadline();
    const updater = setLocalProject.mock.calls[0][0];
    const result = updater(null);

    // Then
    expect(result).toBeNull();
  });

  it('incrementRevision returns null when project is null', () => {
    // Given
    const setLocalProject = vi.fn();
    const { incrementRevision } = useProjectFinancials(
      setLocalProject,
      null,
      null,
      vi.fn(),
      vi.fn(),
    );

    // When
    incrementRevision();
    const updater = setLocalProject.mock.calls[0][0];
    const result = updater(null);

    // Then
    expect(result).toBeNull();
  });

  // ── Edge case: numberOfInstallments fallback to 1 ──

  it('handleGenerateInstallments defaults to 1 installment when numberOfInstallments is 0', () => {
    // Given — numberOfInstallments=0 should fallback to 1
    const setLocalProject = vi.fn();
    const project = makeProject({
      financials: {
        paymentType: 'parcelado',
        numberOfInstallments: 0,
        installmentsPaymentDay: 15,
        installmentsInterestEnabled: false,
        startInstallmentsInCurrentMonth: false,
      },
      budget: 1000,
    });
    const { handleGenerateInstallments } = useProjectFinancials(
      setLocalProject,
      project,
      null,
      vi.fn(),
      vi.fn(),
    );

    // When
    handleGenerateInstallments();
    const updater = setLocalProject.mock.calls[0][0];
    const result = updater(project);

    // Then — fallback to 1 installment with full value
    expect(result.financials.installments).toHaveLength(1);
    expect(result.financials.installments[0].number).toBe(1);
  });

  // ── Edge case: interest enabled ──

  it('handleGenerateInstallments applies interest rate when enabled', () => {
    // Given — 3 installments, budget=3000, interest=10%
    const setLocalProject = vi.fn();
    const project = makeProject({
      financials: {
        paymentType: 'parcelado',
        numberOfInstallments: 3,
        installmentsPaymentDay: 15,
        installmentsInterestEnabled: true,
        installmentsInterestRate: 10,
        startInstallmentsInCurrentMonth: false,
      },
      budget: 3000,
    });
    const { handleGenerateInstallments } = useProjectFinancials(
      setLocalProject,
      project,
      null,
      vi.fn(),
      vi.fn(),
    );

    // When
    handleGenerateInstallments();
    const updater = setLocalProject.mock.calls[0][0];
    const result = updater(project);

    // Then — total = 3000 * 1.10 = 3300; each = 1100
    expect(result.financials.installments).toHaveLength(3);
    expect(result.financials.installments[0].value).toBeCloseTo(1100, 2);
  });

  // ── handleConfirmPayment for installment type ──

  it('handleConfirmPayment marks specific installment as paid', () => {
    // Given — project with 2 installments, confirming inst-2
    const setLocalProject = vi.fn();
    const setPaymentConfirmModalOpen = vi.fn();
    const setPaymentToConfirm = vi.fn();
    const project = makeProject({
      financials: {
        paymentType: 'parcelado',
        installments: [
          {
            id: 'inst-1',
            number: 1,
            value: 500,
            dueDate: '2026-01-15',
            paid: false,
            paymentDate: null,
          },
          {
            id: 'inst-2',
            number: 2,
            value: 500,
            dueDate: '2026-02-15',
            paid: false,
            paymentDate: null,
          },
        ],
      },
    });

    const { handleConfirmPayment } = useProjectFinancials(
      setLocalProject,
      project,
      { type: 'installment', id: 'inst-2' },
      setPaymentToConfirm,
      setPaymentConfirmModalOpen,
    );

    // When
    handleConfirmPayment('2026-02-20', 'Boleto bancário');

    // Then — inst-2 marked paid, inst-1 untouched
    const updatedProject = setLocalProject.mock.calls[0][0];
    const inst1 = updatedProject.financials.installments.find(
      (i: { id: string }) => i.id === 'inst-1',
    );
    const inst2 = updatedProject.financials.installments.find(
      (i: { id: string }) => i.id === 'inst-2',
    );
    expect(inst1.paid).toBe(false);
    expect(inst2.paid).toBe(true);
    expect(inst2.paymentDate).toBe('2026-02-20');
    expect(inst2.paymentMethod).toBe('Boleto bancário');
    expect(setPaymentConfirmModalOpen).toHaveBeenCalledWith(false);
    expect(setPaymentToConfirm).toHaveBeenCalledWith(null);
  });

  // ── handleDeadlineChange ──

  it('handleDeadlineChange updates the correct deadline field', () => {
    // Given
    const setLocalProject = vi.fn();
    const { handleDeadlineChange } = useProjectFinancials(
      setLocalProject,
      makeProject(),
      null,
      vi.fn(),
      vi.fn(),
    );

    // When
    handleDeadlineChange('d1', 'title', 'Revisão Estrutural');
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({
      additionalDeadlines: [
        { id: 'd1', title: 'Antigo', date: '2026-01-01' },
        { id: 'd2', title: 'Outro', date: '2026-02-01' },
      ],
    });
    const result = updater(project);

    // Then — only d1 title changed, d2 untouched
    expect(result.additionalDeadlines[0].title).toBe('Revisão Estrutural');
    expect(result.additionalDeadlines[1].title).toBe('Outro');
  });

  // ── incrementRevision from undefined ──

  it('incrementRevision starts from 0 when revisionCount is undefined', () => {
    // Given — project without revisionCount
    const setLocalProject = vi.fn();
    const { incrementRevision } = useProjectFinancials(
      setLocalProject,
      makeProject(),
      null,
      vi.fn(),
      vi.fn(),
    );

    // When
    incrementRevision();
    const updater = setLocalProject.mock.calls[0][0];
    const project = makeProject({ revisionCount: undefined });
    const result = updater(project);

    // Then — 0 + 1 = 1
    expect(result.revisionCount).toBe(1);
  });

  // ── handleConfirmPayment does nothing when localProject is null ──

  it('handleConfirmPayment does nothing when localProject is null', () => {
    // Given — localProject=null, but paymentToConfirm exists
    const setLocalProject = vi.fn();
    const { handleConfirmPayment } = useProjectFinancials(
      setLocalProject,
      null,
      { type: 'lump' },
      vi.fn(),
      vi.fn(),
    );

    // When
    handleConfirmPayment('2026-03-01', 'PIX');

    // Then — nothing happens
    expect(setLocalProject).not.toHaveBeenCalled();
  });
});
