import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { useProjectFinancials } from './useProjectFinancials';
import type { PaymentTarget } from './useProjectFinancials';
import { createTestProject } from '../test/factories';
import type { Project } from '../types';

function useFinancialsWrapper(initialProject: Project) {
  const [project, setProject] = useState<Project | null>(initialProject);
  const [paymentToConfirm, setPaymentToConfirm] = useState<PaymentTarget | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const financials = useProjectFinancials(
    setProject,
    project,
    paymentToConfirm,
    setPaymentToConfirm,
    setModalOpen,
  );
  return { project, financials, paymentToConfirm, modalOpen };
}

describe('useProjectFinancials', () => {
  const baseProject = createTestProject({
    financials: {
      paymentType: 'parcelado',
      numberOfInstallments: 3,
      installmentsPaymentDay: 15,
      startInstallmentsInCurrentMonth: true,
      installments: [
        { id: 'i1', number: 1, value: 1000, dueDate: '2026-03-15', paid: false, paymentDate: null },
        { id: 'i2', number: 2, value: 1000, dueDate: '2026-04-15', paid: false, paymentDate: null },
      ],
    },
  });

  it('handleAddInstallment adds an extra installment with correct number', () => {
    // Given
    const { result } = renderHook(() => useFinancialsWrapper(baseProject));

    // When
    act(() => result.current.financials.handleAddInstallment());

    // Then
    const installments = result.current.project?.financials.installments;
    expect(installments).toHaveLength(3);
    expect(installments?.[2].number).toBe(3);
    expect(installments?.[2].description).toBe('Parcela Extra');
    expect(installments?.[2].paid).toBe(false);
  });

  it('handleRemoveInstallment removes by id', () => {
    // Given
    const { result } = renderHook(() => useFinancialsWrapper(baseProject));

    // When
    act(() => result.current.financials.handleRemoveInstallment('i1'));

    // Then
    const installments = result.current.project?.financials.installments;
    expect(installments).toHaveLength(1);
    expect(installments?.[0].id).toBe('i2');
  });

  it('handleInstallmentChange updates a specific field', () => {
    // Given
    const { result } = renderHook(() => useFinancialsWrapper(baseProject));

    // When
    act(() => result.current.financials.handleInstallmentChange('i1', 'value', 2500));

    // Then
    expect(result.current.project?.financials.installments?.[0].value).toBe(2500);
  });

  it('handleOpenConfirmPayment sets target and opens modal', () => {
    // Given
    const { result } = renderHook(() => useFinancialsWrapper(baseProject));

    // When
    act(() =>
      result.current.financials.handleOpenConfirmPayment({ type: 'installment', id: 'i1' }),
    );

    // Then
    expect(result.current.paymentToConfirm).toEqual({ type: 'installment', id: 'i1' });
    expect(result.current.modalOpen).toBe(true);
  });

  it('handleAddDeadline adds a deadline with default title', () => {
    // Given
    const { result } = renderHook(() => useFinancialsWrapper(baseProject));

    // When
    act(() => result.current.financials.handleAddDeadline());

    // Then
    expect(result.current.project?.additionalDeadlines).toHaveLength(1);
    expect(result.current.project?.additionalDeadlines?.[0].title).toBe('Novo Prazo');
  });

  it('handleRemoveDeadline removes by id', () => {
    // Given
    const projectWithDeadlines = createTestProject({
      ...baseProject,
      additionalDeadlines: [{ id: 'd1', title: 'Entrega', date: '2026-05-01' }],
    });
    const { result } = renderHook(() => useFinancialsWrapper(projectWithDeadlines));

    // When
    act(() => result.current.financials.handleRemoveDeadline('d1'));

    // Then
    expect(result.current.project?.additionalDeadlines).toHaveLength(0);
  });

  it('incrementRevision increments revisionCount from zero', () => {
    // Given
    const { result } = renderHook(() => useFinancialsWrapper(baseProject));

    // When
    act(() => result.current.financials.incrementRevision());

    // Then
    expect(result.current.project?.revisionCount).toBe(1);
  });

  it('incrementRevision increments existing count', () => {
    // Given
    const projectWithRevision = createTestProject({ ...baseProject, revisionCount: 2 });
    const { result } = renderHook(() => useFinancialsWrapper(projectWithRevision));

    // When
    act(() => result.current.financials.incrementRevision());

    // Then
    expect(result.current.project?.revisionCount).toBe(3);
  });
});
