import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import { createTestFinancials, createTestProject } from '@/test/factories';
import ProjetoDetalhesPageContent from './ProjetoDetalhesPageContent';

const FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

let modalRoot: HTMLDivElement;

function seedProjectDetailsData() {
  const snapshot = api.getData();
  const project = createTestProject({
    id: 'proj-base',
    code: 'PRJ-BASE',
    name: 'Projeto Base',
    budget: 1000,
    linkedQuotationIds: [],
    financials: createTestFinancials({
      paymentType: 'vista',
      baseContractValue: 1000,
      totalValue: 1300,
      lumpSumValue: 1300,
      addendums: [
        {
          id: 'add-1',
          description: 'Aditivo inicial',
          value: 100,
          date: '2026-03-01',
          status: 'Rascunho',
        },
        {
          id: 'add-2',
          description: 'Aditivo aprovado',
          value: 300,
          date: '2026-03-02',
          status: 'Aprovado',
        },
      ],
    }),
  });

  api.replaceData({
    ...snapshot,
    projects: [project],
    quotations: [
      {
        id: 'quote-1',
        name: 'Cotação A',
        date: '2026-03-10',
        items: [],
        status: 'Em Aberto',
      },
    ],
  });
}

function renderDetailsPage(path = '/projetos/detalhes/proj-base') {
  return render(
    <MemoryRouter initialEntries={[path]} future={FUTURE_FLAGS}>
      <DataProvider>
        <Routes>
          <Route path="/projetos/detalhes/:id" element={<ProjetoDetalhesPageContent />} />
        </Routes>
      </DataProvider>
    </MemoryRouter>,
  );
}

describe('ProjetoDetalhesPageContent', () => {
  beforeEach(() => {
    api.clearAllData();
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    api.clearAllData();
    if (modalRoot && document.body.contains(modalRoot)) {
      document.body.removeChild(modalRoot);
    }
  });

  it('renders not-found fallback when project id does not exist', () => {
    renderDetailsPage('/projetos/detalhes/inexistente');

    expect(screen.getByText('Projeto não encontrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
  });

  it('handles dirty-state cancel flow and beforeunload guard', async () => {
    seedProjectDetailsData();
    renderDetailsPage();

    expect(await screen.findByText('Projeto Base - PRJ-BASE')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar Alterações' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Cotações/i }));
    fireEvent.click(screen.getByRole('button', { name: '+ Vincular Cotação' }));
    fireEvent.click(screen.getByLabelText('Selecionar cotação Cotação A'));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Seleção' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument();
    });

    const beforeUnloadEvent = new Event('beforeunload', { cancelable: true });
    Object.defineProperty(beforeUnloadEvent, 'returnValue', { writable: true, value: undefined });
    window.dispatchEvent(beforeUnloadEvent);

    expect(beforeUnloadEvent.defaultPrevented).toBe(true);
    expect(beforeUnloadEvent.returnValue).toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Salvar Alterações' })).not.toBeInTheDocument();
      expect(screen.getByText('Nenhuma cotação vinculada a este projeto.')).toBeInTheDocument();
    });
  });

  it('confirms base contract value changes, saves, and persists recalculated totals', async () => {
    seedProjectDetailsData();
    renderDetailsPage();

    fireEvent.click(await screen.findByRole('tab', { name: /Financeiro/i }));
    fireEvent.change(screen.getByLabelText('Valor base do contrato'), {
      target: { value: '2000' },
    });

    expect(screen.getByText('Confirmar Alteração de Valor')).toBeInTheDocument();
    expect(screen.getByText(/R\$ 2.000,00/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    expect(await screen.findByText('Alterações salvas com sucesso!')).toBeInTheDocument();

    await waitFor(() => {
      const persistedProject = api.getData().projects.find((project) => project.id === 'proj-base');
      expect(persistedProject?.budget).toBe(2000);
      expect(persistedProject?.financials.baseContractValue).toBe(2000);
      expect(persistedProject?.financials.totalValue).toBe(2300);
      expect(persistedProject?.financials.lumpSumValue).toBe(2300);
    });
  });

  it('manages quotation links and addendum lifecycle through tabs', async () => {
    seedProjectDetailsData();
    renderDetailsPage();

    fireEvent.click(await screen.findByRole('tab', { name: /Cotações/i }));
    fireEvent.click(screen.getByRole('button', { name: '+ Vincular Cotação' }));

    expect(screen.getByText('Vincular Cotações')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Selecionar cotação Cotação A'));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Seleção' }));
    expect(await screen.findByText('Cotação A')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Desvincular cotação' }));
    expect(
      await screen.findByText('Nenhuma cotação vinculada a este projeto.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Financeiro/i }));
    fireEvent.change(screen.getByDisplayValue('Rascunho'), { target: { value: 'Pendente' } });

    fireEvent.change(screen.getByPlaceholderText('Descrição'), {
      target: { value: 'Aditivo Manual Teste' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('Valor')[0], { target: { value: '250' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Aditivo' }));

    expect(await screen.findByText('Aditivo Manual Teste')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Remover aditivo' })[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => {
      const persistedProject = api.getData().projects.find((project) => project.id === 'proj-base');
      expect(persistedProject?.linkedQuotationIds).toEqual([]);
      expect(
        persistedProject?.financials.addendums?.some(
          (addendum) => addendum.description === 'Aditivo Manual Teste',
        ),
      ).toBe(true);
      expect(
        persistedProject?.financials.addendums?.some(
          (addendum) => addendum.id === 'add-1' && addendum.status === 'Pendente',
        ),
      ).toBe(true);
    });
  });
});
