import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '../context/DataContext';
import AgendaPage from './AgendaPage';

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

function renderAgendaPage() {
  return render(
    <MemoryRouter initialEntries={['/agenda/calendario']}>
      <DataProvider>
        <Routes>
          <Route path="/agenda/calendario" element={<AgendaPage />} />
        </Routes>
      </DataProvider>
    </MemoryRouter>,
  );
}

describe('AgendaPage — Integration', () => {
  it('renders without runtime errors and shows page title', async () => {
    // Given
    renderAgendaPage();

    // Then — page title is always visible
    expect(await screen.findByText('Calendário')).toBeInTheDocument();
  });

  it('shows "Novo Evento" button', async () => {
    // Given
    renderAgendaPage();

    // Then
    expect(await screen.findByText('Novo Evento')).toBeInTheDocument();
  });

  it('shows day-of-week headers', async () => {
    // Given
    renderAgendaPage();

    // Then — day abbreviations should be visible
    expect(await screen.findByText('Dom')).toBeInTheDocument();
    expect(screen.getByText('Seg')).toBeInTheDocument();
    expect(screen.getByText('Sex')).toBeInTheDocument();
  });
});
