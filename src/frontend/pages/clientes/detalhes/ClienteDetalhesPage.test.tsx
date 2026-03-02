import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '../../../context/DataContext';
import ClienteDetalhesPage from './ClienteDetalhesPage';

const TEST_CLIENT_ID = 'client-integration-1';
const LOADING_MESSAGE = 'Carregando ou cliente não encontrado...';

vi.mock('../../services/infrastructure/api', () => ({
  api: {
    getData: () => ({
      projects: [],
      proposals: [],
      clients: [],
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
      reminders: [],
    }),
    updateData: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    reserveGlobalIdentifier: vi.fn().mockResolvedValue(2501),
    importClients: vi.fn(),
    clearAllData: vi.fn(),
  },
}));

vi.mock('../../services/clientFinancialSummaryService', () => ({
  calculateProjectFinancialSummary: vi.fn().mockReturnValue({
    totalContractValue: 0,
    totalReceived: 0,
    totalPending: 0,
    totalExpenses: 0,
    netResult: 0,
    projectCount: 0,
  }),
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

function renderClienteDetalhes() {
  return render(
    <MemoryRouter initialEntries={[`/clientes/${TEST_CLIENT_ID}`]}>
      <DataProvider>
        <Routes>
          <Route path="/clientes/:id" element={<ClienteDetalhesPage />} />
        </Routes>
      </DataProvider>
    </MemoryRouter>,
  );
}

describe('ClienteDetalhesPage — Integration', () => {
  it('renders loading state when client is unavailable', async () => {
    // Given
    renderClienteDetalhes();

    // Then
    expect(await screen.findByText(LOADING_MESSAGE)).toBeInTheDocument();
  });

  it('does not render "Editar Cliente" button while loading', async () => {
    // Given
    renderClienteDetalhes();
    await screen.findByText(LOADING_MESSAGE);

    // Then
    expect(screen.queryByRole('button', { name: /Editar Cliente/i })).toBeNull();
  });

  it('keeps route mounted without runtime errors in loading state', async () => {
    // Given
    renderClienteDetalhes();

    // Then
    expect(await screen.findByText(LOADING_MESSAGE)).toBeInTheDocument();
  });
});
