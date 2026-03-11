import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '@/types';
import { ProjetoDetalhesTabs } from './ProjetoDetalhesTabs';

const localProject: Project = {
  id: 'proj-1',
  code: 'PRJ-001',
  name: 'Projeto Teste',
  clientName: 'Cliente Teste',
  clientId: 'client-1',
  status: 'Em Andamento',
  deadline: null,
  budget: 10000,
  description: 'Descrição',
  sections: [],
  additionalDeadlines: [],
  notes: 'Nota inicial',
  linkedQuotationIds: ['qt-1'],
  financials: {
    paymentType: 'vista',
  },
};

function renderTabs(overrides: Partial<React.ComponentProps<typeof ProjetoDetalhesTabs>> = {}) {
  const props: React.ComponentProps<typeof ProjetoDetalhesTabs> = {
    activeTab: 'overview',
    setActiveTab: vi.fn(),
    localProject,
    progress: 35,
    isEditingAddress: false,
    setIsEditingAddress: vi.fn(),
    handleLocalChange: vi.fn(),
    handleAddressChange: vi.fn(),
    incrementRevision: vi.fn(),
    handleActionRequest: vi.fn(),
    handleReactivate: vi.fn(),
    handleSectionChange: vi.fn(),
    handleTaskChange: vi.fn(),
    handleAddSection: vi.fn(),
    handleRemoveSection: vi.fn(),
    handleAddTask: vi.fn(),
    handleRemoveTask: vi.fn(),
    handleEditTaskDetails: vi.fn(),
    handleAddDeadline: vi.fn(),
    handleDeadlineChange: vi.fn(),
    handleRemoveDeadline: vi.fn(),
    handleGanttTaskUpdate: vi.fn(),
    budgetServices: [],
    handleFinancialsChange: vi.fn(),
    handleInstallmentChange: vi.fn(),
    handleGenerateInstallments: vi.fn(),
    handleOpenConfirmPayment: vi.fn(),
    handleAddInstallment: vi.fn(),
    handleRemoveInstallment: vi.fn(),
    handleAddAddendum: vi.fn(),
    handleUpdateAddendumStatus: vi.fn(),
    handleRemoveAddendum: vi.fn(),
    quotations: [
      {
        id: 'qt-1',
        name: 'Cotação Estrutural',
        date: '2026-03-01',
        status: 'Aceita',
        items: [],
      },
    ],
    setLinkModalOpen: vi.fn(),
    handleUnlinkQuotation: vi.fn(),
    ...overrides,
  };

  render(<ProjetoDetalhesTabs {...props} />);
  return props;
}

describe('ProjetoDetalhesTabs', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders tabs and dispatches tab change callback', () => {
    const setActiveTab = vi.fn();
    renderTabs({ setActiveTab });

    expect(screen.getByRole('tab', { name: 'Visão Geral' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Etapas/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Financeiro/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Etapas/i }));

    expect(setActiveTab).toHaveBeenCalledWith('stages');
  });

  it('handles empty deadlines and deadline callbacks', () => {
    const handleLocalChange = vi.fn();
    const handleAddDeadline = vi.fn();

    renderTabs({
      activeTab: 'deadlines',
      handleLocalChange,
      handleAddDeadline,
      localProject: {
        ...localProject,
        deadline: null,
        additionalDeadlines: [],
      },
    });

    expect(screen.getByText('Nenhum prazo intermediário definido.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Prazo final do projeto'), {
      target: { value: '2026-08-15' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Prazo' }));

    expect(handleLocalChange).toHaveBeenCalledWith('deadline', '2026-08-15');
    expect(handleAddDeadline).toHaveBeenCalledTimes(1);
  });

  it('updates and removes additional deadlines', () => {
    const handleDeadlineChange = vi.fn();
    const handleRemoveDeadline = vi.fn();

    renderTabs({
      activeTab: 'deadlines',
      handleDeadlineChange,
      handleRemoveDeadline,
      localProject: {
        ...localProject,
        additionalDeadlines: [
          { id: 'd-1', title: 'Aprovar layout', date: '2026-03-20' },
          { id: 'd-2', title: 'Executivo', date: '2026-04-10' },
        ],
      },
    });

    const titleInputs = screen.getAllByLabelText('Título do marco');
    const dateInputs = screen.getAllByLabelText('Data do marco');

    fireEvent.change(titleInputs[0], { target: { value: 'Layout aprovado' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-04-20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Remover prazo Aprovar layout' }));

    expect(handleDeadlineChange).toHaveBeenCalledWith('d-1', 'title', 'Layout aprovado');
    expect(handleDeadlineChange).toHaveBeenCalledWith('d-2', 'date', '2026-04-20');
    expect(handleRemoveDeadline).toHaveBeenCalledWith('d-1');
  });

  it('handles quotation linking/unlinking and notes updates', () => {
    const setLinkModalOpen = vi.fn();
    const handleUnlinkQuotation = vi.fn();
    const handleLocalChange = vi.fn();

    renderTabs({
      activeTab: 'quotations',
      setLinkModalOpen,
      handleUnlinkQuotation,
    });

    fireEvent.click(screen.getByRole('button', { name: '+ Vincular Cotação' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desvincular cotação' }));

    expect(setLinkModalOpen).toHaveBeenCalledWith(true);
    expect(handleUnlinkQuotation).toHaveBeenCalledWith('qt-1');

    cleanup();

    renderTabs({
      activeTab: 'notes',
      handleLocalChange,
      localProject: {
        ...localProject,
        notes: 'Texto inicial',
      },
    });

    fireEvent.change(screen.getByLabelText('Anotações do projeto'), {
      target: { value: 'Notas atualizadas' },
    });

    expect(handleLocalChange).toHaveBeenCalledWith('notes', 'Notas atualizadas');
  });
});
