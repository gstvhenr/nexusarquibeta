import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '../../../context/DataContext';
import PropostasPage from './PropostasPage';

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

function renderPropostas() {
  return render(
    <MemoryRouter>
      <DataProvider>
        <PropostasPage />
      </DataProvider>
    </MemoryRouter>,
  );
}

describe('PropostasPage — Integration', () => {
  it('renders empty state when no proposals exist', () => {
    // Given
    renderPropostas();

    // Then
    expect(screen.getByText('Nenhuma proposta encontrada')).toBeInTheDocument();
  });

  it('shows "Ver Arquivadas" toggle button', () => {
    // Given
    renderPropostas();

    // Then
    expect(screen.getByRole('button', { name: /Ver Arquivadas/i })).toBeInTheDocument();
  });

  it('toggles to archived view and shows archived empty state', () => {
    // Given
    renderPropostas();

    // When
    fireEvent.click(screen.getByRole('button', { name: /Ver Arquivadas/i }));

    // Then
    expect(screen.getByText('Nenhuma proposta arquivada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver Ativas/i })).toBeInTheDocument();
  });
});
