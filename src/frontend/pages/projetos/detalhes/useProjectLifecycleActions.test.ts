import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { useProjectLifecycleActions } from './useProjectLifecycleActions';
import { createTestProject, createTestFinancials } from '../../../test/factories';
import type { AgendaEvent, ManualIncome, ProfessionalExpense, Project } from '../../../types';

// Mock agendaService — retorna events inalterados para simplificar assertions
vi.mock('../../services/agendaService', () => ({
  agendaService: {
    syncProjectEventsWithAgenda: (_project: Project | null, events: AgendaEvent[]) => events,
  },
}));

const mockNavigate = vi.fn();

function useLifecycleWrapper(
  initialProject: Project | null,
  initialExpenses: ProfessionalExpense[] = [],
) {
  const [projects, setProjects] = useState<Project[]>(initialProject ? [initialProject] : []);
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([]);
  const [manualExpenses, setManualExpenses] = useState<ProfessionalExpense[]>(initialExpenses);
  const [manualIncomes, setManualIncomes] = useState<ManualIncome[]>([]);
  const [localProject, setLocalProject] = useState<Project | null>(initialProject);

  const lifecycle = useProjectLifecycleActions({
    localProject,
    setProjects,
    setAgendaEvents,
    navigate: mockNavigate,
    manualExpenses,
    setManualExpenses,
    setManualIncomes,
    setLocalProject,
  });

  return { projects, agendaEvents, manualExpenses, manualIncomes, localProject, lifecycle };
}

describe('useProjectLifecycleActions', () => {
  const baseProject = createTestProject({
    id: 'proj-1',
    name: 'Projeto Lifecycle',
    status: 'Em Andamento',
    financials: createTestFinancials({ paymentType: 'vista' }),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- handleActionRequest ---

  it('handleActionRequest opens modal with correct action type', () => {
    // Given
    const { result } = renderHook(() => useLifecycleWrapper(baseProject));

    // When
    act(() => result.current.lifecycle.handleActionRequest('finalize'));

    // Then
    expect(result.current.lifecycle.isActionModalOpen).toBe(true);
    expect(result.current.lifecycle.currentActionType).toBe('finalize');
  });

  // --- handleExecuteAction: guard ---

  it('handleExecuteAction does nothing when localProject is null', () => {
    // Given
    const { result } = renderHook(() => useLifecycleWrapper(null));

    // When
    act(() => result.current.lifecycle.handleExecuteAction(0, '2026-01-01'));

    // Then
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --- handleExecuteAction: delete ---

  it('delete action removes project and navigates to /projetos', () => {
    // Given
    const { result } = renderHook(() => useLifecycleWrapper(baseProject));
    act(() => result.current.lifecycle.handleActionRequest('delete'));

    // When
    act(() => result.current.lifecycle.handleExecuteAction(0, '2026-01-01'));

    // Then
    expect(result.current.projects).toHaveLength(0);
    expect(mockNavigate).toHaveBeenCalledWith('/projetos');
  });

  it('delete action with refund creates expense before removal', () => {
    // Given
    const { result } = renderHook(() => useLifecycleWrapper(baseProject));
    act(() => result.current.lifecycle.handleActionRequest('delete'));

    // When
    act(() => result.current.lifecycle.handleExecuteAction(500, '2026-02-15'));

    // Then
    expect(result.current.manualExpenses).toHaveLength(1);
    expect(result.current.manualExpenses[0].value).toBe(500);
    expect(result.current.manualExpenses[0].category).toBe('Reembolso a Cliente');
    expect(result.current.manualExpenses[0].description).toContain('Projeto Excluído');
  });

  // --- handleExecuteAction: inactivate ---

  it('inactivate action sets status to Cancelado and archives project', () => {
    // Given
    const { result } = renderHook(() => useLifecycleWrapper(baseProject));
    act(() => result.current.lifecycle.handleActionRequest('inactivate'));

    // When
    act(() => result.current.lifecycle.handleExecuteAction(0, ''));

    // Then
    const updatedProject = result.current.projects[0];
    expect(updatedProject.status).toBe('Cancelado');
    expect(updatedProject.archived).toBe(true);
    expect(updatedProject.inactivatedAt).toBeDefined();
    expect(mockNavigate).toHaveBeenCalledWith('/projetos');
  });

  // --- handleExecuteAction: finalize ---

  it('finalize action sets status to Concluído, marks tasks done, and pays lump sum', () => {
    // Given
    const projectWithTasks = createTestProject({
      id: 'proj-finalize',
      name: 'Projeto Finalize',
      status: 'Em Andamento',
      sections: [
        {
          id: 'sec-1',
          name: 'Etapa',
          tasks: [{ id: 't1', name: 'Task 1', completed: false, hours: 2, status: 'todo' }],
        },
      ],
      financials: createTestFinancials({
        paymentType: 'vista',
        lumpSumStatus: 'Em aberto',
      }),
    });

    const { result } = renderHook(() => useLifecycleWrapper(projectWithTasks));
    act(() => result.current.lifecycle.handleActionRequest('finalize'));

    // When
    act(() => result.current.lifecycle.handleExecuteAction(0, ''));

    // Then
    const finalized = result.current.projects[0];
    expect(finalized.status).toBe('Concluído');
    expect(finalized.archived).toBe(true);
    expect(finalized.finalizedAt).toBeDefined();
    expect(finalized.sections[0].tasks[0].completed).toBe(true);
    expect(finalized.financials?.lumpSumStatus).toBe('Pago');
  });

  it('finalize action pays all unpaid installments for parcelado projects', () => {
    // Given
    const projectInstallments = createTestProject({
      id: 'proj-installments',
      name: 'Projeto Parcelado',
      financials: createTestFinancials({
        paymentType: 'parcelado',
        installments: [
          {
            id: 'inst-1',
            number: 1,
            value: 1000,
            dueDate: '2026-03-01',
            paid: true,
            paymentDate: '2026-03-01',
          },
          {
            id: 'inst-2',
            number: 2,
            value: 1000,
            dueDate: '2026-04-01',
            paid: false,
            paymentDate: null,
          },
        ],
      }),
    });

    const { result } = renderHook(() => useLifecycleWrapper(projectInstallments));
    act(() => result.current.lifecycle.handleActionRequest('finalize'));

    // When
    act(() => result.current.lifecycle.handleExecuteAction(0, ''));

    // Then
    const finalized = result.current.projects[0];
    const installments = finalized.financials?.installments;
    expect(installments?.[0].paid).toBe(true);
    expect(installments?.[1].paid).toBe(true);
    expect(installments?.[1].paymentDate).toBeDefined();
  });

  // --- handleReactivate ---

  it('reactivate does nothing when localProject is null', () => {
    // Given
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useLifecycleWrapper(null));

    // When
    act(() => result.current.lifecycle.handleReactivate());

    // Then — no crash, no navigation
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('reactivate sets project to Em Andamento when user confirms', () => {
    // Given
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const archivedProject = createTestProject({
      ...baseProject,
      status: 'Cancelado',
      archived: true,
      inactivatedAt: '2026-01-01T00:00:00.000Z',
    });
    const { result } = renderHook(() => useLifecycleWrapper(archivedProject));

    // When
    act(() => result.current.lifecycle.handleReactivate());

    // Then
    expect(result.current.localProject?.status).toBe('Em Andamento');
    expect(result.current.localProject?.archived).toBe(false);
    expect(result.current.localProject?.inactivatedAt).toBeNull();
  });

  it('reactivate does nothing when user cancels confirmation', () => {
    // Given
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const archivedProject = createTestProject({
      ...baseProject,
      status: 'Cancelado',
      archived: true,
    });
    const { result } = renderHook(() => useLifecycleWrapper(archivedProject));

    // When
    act(() => result.current.lifecycle.handleReactivate());

    // Then
    expect(result.current.localProject?.status).toBe('Cancelado');
    expect(result.current.localProject?.archived).toBe(true);
  });

  it('reactivate with refund reversal creates estorno incomes', () => {
    // Given — confirm both dialogs (reactivate + estorno)
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const archivedProject = createTestProject({
      id: 'proj-estorno',
      name: 'Projeto Estorno',
      status: 'Cancelado',
      archived: true,
    });

    const existingRefundExpense: ProfessionalExpense = {
      id: `exp_refund_proj-estorno_1700000000000`,
      description: 'Reembolso - Projeto Estorno (Projeto Encerrado)',
      category: 'Reembolso a Cliente',
      value: 750,
      dueDate: '2026-01-15',
      status: 'Pago',
      paymentDate: '2026-01-15',
      isRecurring: false,
      source: 'Manual',
    };

    const { result } = renderHook(() =>
      useLifecycleWrapper(archivedProject, [existingRefundExpense]),
    );

    // When
    act(() => result.current.lifecycle.handleReactivate());

    // Then — reversal income created
    expect(result.current.manualIncomes).toHaveLength(1);
    expect(result.current.manualIncomes[0].value).toBe(750);
    expect(result.current.manualIncomes[0].description).toContain('Estorno de reembolso');

    // Then — original expense marked as estornado
    const markedExpense = result.current.manualExpenses.find(
      (expense) => expense.id === existingRefundExpense.id,
    );
    expect(markedExpense?.description).toContain('[ESTORNADO]');
  });
});
