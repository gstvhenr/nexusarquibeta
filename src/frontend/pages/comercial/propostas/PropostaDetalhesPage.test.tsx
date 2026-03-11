import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import PropostaDetalhesPage from './PropostaDetalhesPage';

vi.mock('@/services/infrastructure/api', () => ({
  api: {
    getData: () => ({
      projects: [],
      proposals: [
        {
          id: 'prop_unlinked',
          code: '#9001',
          name: 'Cotação Avulsa',
          date: '13/02/2026',
          status: 'Pendente',
          sections: [
            {
              id: 1,
              title: 'Arquitetura',
              items: [
                {
                  id: 1,
                  description: 'Estudo preliminar',
                  unit: 'm²',
                  quantity: 1,
                  unitPrice: 100,
                },
              ],
            },
          ],
          discount: 0,
          subtotal: 100,
          total: 100,
          archived: false,
          showItemPrices: true,
          showSectionTotals: true,
          showDiscount: false,
          showGrandTotal: true,
          showProposalDate: true,
          totalsAlignment: 'right',
        },
        {
          id: 'prop_linked',
          code: '#9002',
          name: 'Proposta Vinculada',
          clientId: 'client-1',
          date: '13/02/2026',
          status: 'Pendente',
          sections: [
            {
              id: 1,
              title: 'Arquitetura',
              items: [
                {
                  id: 1,
                  description: 'Estudo preliminar',
                  unit: 'm²',
                  quantity: 1,
                  unitPrice: 100,
                },
              ],
            },
          ],
          discount: 0,
          subtotal: 100,
          total: 100,
          archived: false,
          showItemPrices: true,
          showSectionTotals: true,
          showDiscount: false,
          showGrandTotal: true,
          showProposalDate: true,
          totalsAlignment: 'right',
        },
      ],
      clients: [
        {
          id: 'client-1',
          name: 'Cliente Exemplo',
          contacts: [],
          status: 'Cliente Ativo',
          serviceInterests: [],
          address: {
            street: 'Rua A',
            number: '100',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zip: '01000-000',
          },
          isFavorite: false,
          registrationDate: '2026-01-01',
          lastContactDate: '2026-01-01',
          pipelineStatus: 'Briefing',
          meetings: [],
          behavioralProfile: { notes: '' },
          archived: false,
        },
      ],
      documentStorage: { documents: [], folders: [] },
      suppliers: [],
      products: [],
      supplierProductPrices: [],
      quotations: [],
      commissions: [],
      marketingProfessionals: [],
      marketingActivities: [],
      marketingIdeas: [],
      socialNetworks: [],
      freelancers: [],
      agendaEvents: [],
      manualExpenses: [],
      manualIncomes: [],
      customBudgetTemplate: null,
      globalIdentifierCounter: 2500,
      dismissedFocusItems: [],
      acceptedPaymentMethods: [],
      hiredServices: [],
      prospects: [],
      contractDeadlines: {
        defaultPreliminarDeadlineDays: 7,
        defaultExecutiveDeadlineDays: 30,
      },
      cashBoxExpenses: [],
      cashBoxCredits: [],
      emergencyFund: { currentValue: 0 },
      reminders: [],
    }),
    updateData: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    reserveGlobalIdentifier: vi.fn().mockResolvedValue(2501),
    importClients: vi.fn(),
    clearAllData: vi.fn(),
    replaceData: vi.fn(),
  },
}));

let modalRoot: HTMLDivElement;

beforeEach(() => {
  modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'modal-root');
  document.body.appendChild(modalRoot);
});

afterEach(() => {
  cleanup();
  if (modalRoot && document.body.contains(modalRoot)) {
    document.body.removeChild(modalRoot);
  }
});

function renderDetalhes(proposalId: string) {
  return render(
    <MemoryRouter initialEntries={[`/propostas/${proposalId}`]}>
      <DataProvider>
        <Routes>
          <Route path="/propostas/:id" element={<PropostaDetalhesPage />} />
        </Routes>
      </DataProvider>
    </MemoryRouter>,
  );
}

describe('PropostaDetalhesPage', () => {
  it('renders not-found state when proposal id does not exist', () => {
    renderDetalhes('inexistente');

    expect(screen.getByText('Proposta não encontrada')).toBeInTheDocument();
  });

  describe('unlinked proposal (no clientId)', () => {
    it('renders the proposal header without crashing', () => {
      renderDetalhes('prop_unlinked');

      expect(screen.getByText('Cotação Avulsa - #9001')).toBeInTheDocument();
    });

    it('does not show the "Converter para Projeto" button', () => {
      renderDetalhes('prop_unlinked');

      expect(
        screen.queryByRole('button', { name: /Converter para Projeto/i }),
      ).not.toBeInTheDocument();
    });

    it('does not show error toast when page loads', () => {
      renderDetalhes('prop_unlinked');

      expect(screen.queryByText('Cliente não encontrado.')).not.toBeInTheDocument();
    });

    it('renders common action buttons (Voltar, Editar, PDF)', () => {
      renderDetalhes('prop_unlinked');

      expect(screen.getByRole('button', { name: /Voltar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Editar Documento/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /PDF/i })).toBeInTheDocument();
    });
  });

  describe('linked proposal (with clientId)', () => {
    it('renders the proposal header', () => {
      renderDetalhes('prop_linked');

      expect(screen.getByText('Proposta Vinculada - #9002')).toBeInTheDocument();
    });

    it('shows the "Converter para Projeto" button', () => {
      renderDetalhes('prop_linked');

      expect(screen.getByRole('button', { name: /Converter para Projeto/i })).toBeInTheDocument();
    });
  });
});
