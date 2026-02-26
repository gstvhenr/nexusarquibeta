import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '../context/DataContext';
import ProjetosPage from './ProjetosPage';

vi.mock('../services/infrastructure/api', () => ({
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

function renderProjetosPage() {
  return render(
    <MemoryRouter initialEntries={['/projetos']}>
      <DataProvider>
        <Routes>
          <Route path="/projetos" element={<ProjetosPage />} />
        </Routes>
      </DataProvider>
    </MemoryRouter>,
  );
}

describe('ProjetosPage — Integration', () => {
  it('renders without runtime errors and shows page title', async () => {
    // Given
    renderProjetosPage();

    // Then
    expect(await screen.findByText('Projetos')).toBeInTheDocument();
  });

  it('shows empty state when no projects exist', async () => {
    // Given — api returns empty projects array
    renderProjetosPage();

    // Then — empty state message
    expect(await screen.findByText('Nenhum projeto encontrado')).toBeInTheDocument();
  });

  it('shows archive toggle button', async () => {
    // Given
    renderProjetosPage();

    // Then
    expect(await screen.findByText('Ver Arquivados')).toBeInTheDocument();
  });
});
