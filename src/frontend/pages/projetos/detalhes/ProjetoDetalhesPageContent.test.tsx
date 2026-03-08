import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import { createTestFinancials, createTestProject } from '@/test/factories';
import ProjetoDetalhesPageContent from './ProjetoDetalhesPageContent';

const FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

/**
 * Extended timeout for integration tests that render the full details page
 * with multiple tab switches under full-suite coverage instrumentation.
 */
const INTEGRATION_TIMEOUT_MS = 15_000;
const INTEGRATION_WAIT_OPTIONS = { timeout: INTEGRATION_TIMEOUT_MS };

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

  it(
    'handles dirty-state cancel flow and beforeunload guard',
    async () => {
      seedProjectDetailsData();
      renderDetailsPage();

      expect(await screen.findByText('Projeto Base - PRJ-BASE')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Salvar Alterações' })).not.toBeInTheDocument();

      // Switch to quotations tab — TabPanel unmounts/mounts (async boundary)
      fireEvent.click(
        await screen.findByRole('tab', { name: /Cotações/i }, INTEGRATION_WAIT_OPTIONS),
      );
      fireEvent.click(
        await screen.findByRole('button', { name: '+ Vincular Cotação' }, INTEGRATION_WAIT_OPTIONS),
      );
      fireEvent.click(
        await screen.findByLabelText(
          'Selecionar cotação Cotação A',
          undefined,
          INTEGRATION_WAIT_OPTIONS,
        ),
      );
      fireEvent.click(screen.getByRole('button', { name: 'Salvar Seleção' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Salvar Alterações' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
      }, INTEGRATION_WAIT_OPTIONS);

      const beforeUnloadEvent = new Event('beforeunload', { cancelable: true });
      Object.defineProperty(beforeUnloadEvent, 'returnValue', { writable: true, value: undefined });
      window.dispatchEvent(beforeUnloadEvent);

      expect(beforeUnloadEvent.defaultPrevented).toBe(true);
      expect(beforeUnloadEvent.returnValue).toBe('');

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Salvar Alterações' })).not.toBeInTheDocument();
        expect(screen.getByText('Nenhuma cotação vinculada a este projeto.')).toBeInTheDocument();
      }, INTEGRATION_WAIT_OPTIONS);
    },
    INTEGRATION_TIMEOUT_MS,
  );

  it(
    'confirms base contract value changes, saves, and persists recalculated totals',
    async () => {
      seedProjectDetailsData();
      renderDetailsPage();

      // Switch to finance tab — TabPanel unmounts/mounts (async boundary)
      fireEvent.click(
        await screen.findByRole('tab', { name: /Financeiro/i }, INTEGRATION_WAIT_OPTIONS),
      );

      // Wait for finance tab content to mount
      const baseInput = await screen.findByLabelText(
        'Valor base do contrato',
        undefined,
        INTEGRATION_WAIT_OPTIONS,
      );
      fireEvent.change(baseInput, { target: { value: '2000' } });

      // Wait for confirmation modal to open (state update)
      expect(
        await screen.findByText(
          'Confirmar Alteração de Valor',
          undefined,
          INTEGRATION_WAIT_OPTIONS,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText(/R\$ 2.000,00/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

      // After confirm, dirty state triggers the save bar (state update)
      const saveButton = await screen.findByRole(
        'button',
        { name: 'Salvar Alterações' },
        INTEGRATION_WAIT_OPTIONS,
      );
      fireEvent.click(saveButton);

      await waitFor(() => {
        const persistedProject = api
          .getData()
          .projects.find((project) => project.id === 'proj-base');
        expect(persistedProject?.budget).toBe(2000);
        expect(persistedProject?.financials.baseContractValue).toBe(2000);
        expect(persistedProject?.financials.totalValue).toBe(2300);
        expect(persistedProject?.financials.lumpSumValue).toBe(2300);
        expect(screen.queryByRole('button', { name: 'Salvar Alterações' })).not.toBeInTheDocument();
      }, INTEGRATION_WAIT_OPTIONS);
    },
    INTEGRATION_TIMEOUT_MS,
  );

  it(
    'manages quotation links and addendum lifecycle through tabs',
    async () => {
      seedProjectDetailsData();
      renderDetailsPage();

      // Switch to quotations tab — TabPanel unmounts/mounts
      fireEvent.click(await screen.findByRole('tab', { name: /Cotações/i }));
      fireEvent.click(await screen.findByRole('button', { name: '+ Vincular Cotação' }));

      expect(await screen.findByText('Vincular Cotações')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Selecionar cotação Cotação A'));
      fireEvent.click(screen.getByRole('button', { name: 'Salvar Seleção' }));

      // Wait for linked quotation to appear in the tab after modal saves
      await waitFor(() => {
        expect(screen.getByText('Cotação A')).toBeInTheDocument();
      });

      fireEvent.click(await screen.findByRole('button', { name: 'Desvincular cotação' }));
      await waitFor(() => {
        expect(screen.getByText('Nenhuma cotação vinculada a este projeto.')).toBeInTheDocument();
      });

      // Switch to finance tab — TabPanel unmounts/mounts (critical async boundary)
      fireEvent.click(await screen.findByRole('tab', { name: /Financeiro/i }));

      // Wait for finance tab content to mount — key fix for flaky failures
      const statusSelect = await screen.findByDisplayValue('Rascunho');
      fireEvent.change(statusSelect, { target: { value: 'Pendente' } });

      // Fill addendum form — await each change to ensure state propagates under coverage
      const descInput = screen.getByPlaceholderText('Descrição');
      fireEvent.change(descInput, { target: { value: 'Aditivo Manual Teste' } });
      await waitFor(() => {
        expect(descInput).toHaveValue('Aditivo Manual Teste');
      });

      const valInputs = screen.getAllByPlaceholderText('Valor');
      fireEvent.change(valInputs[0], { target: { value: '250' } });
      await waitFor(() => {
        expect(valInputs[0]).toHaveValue(250);
      });

      fireEvent.click(screen.getByRole('button', { name: 'Adicionar Aditivo' }));

      expect(await screen.findByText('Aditivo Manual Teste')).toBeInTheDocument();

      fireEvent.click(screen.getAllByRole('button', { name: 'Remover aditivo' })[1]);

      const saveButton = await screen.findByRole('button', { name: 'Salvar Alterações' });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const persistedProject = api
          .getData()
          .projects.find((project) => project.id === 'proj-base');
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
    },
    INTEGRATION_TIMEOUT_MS,
  );
});
