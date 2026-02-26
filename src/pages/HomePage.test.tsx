import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '../context/DataContext';
import HomePage from './HomePage';

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

function renderHomePage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <DataProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </DataProvider>
    </MemoryRouter>,
  );
}

describe('HomePage — Integration', () => {
  it('renders without runtime errors and shows greeting', async () => {
    // Given
    renderHomePage();

    // Then — greeting changes by time of day, so match any of the three
    const greetingPattern = /Bom dia|Boa tarde|Boa noite/i;
    expect(await screen.findByText(greetingPattern)).toBeInTheDocument();
  });

  it('shows KPI cards', async () => {
    // Given
    renderHomePage();

    // Then — KPI labels should be visible
    expect(await screen.findByText('Projetos Ativos')).toBeInTheDocument();
    expect(screen.getByText('Propostas')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('shows "Tudo sob controle" when no focus items', async () => {
    // Given — empty data means no focus items
    renderHomePage();

    // Then
    expect(await screen.findByText('Tudo sob controle!')).toBeInTheDocument();
  });
});
