import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '../../context/DataContext';
import AgendaPage from './AgendaPage';

vi.mock('../../services/infrastructure/api', () => ({
  api: {
    getData: () => ({
      projects: [],
      proposals: [],
      clients: [],
      documentStorage: {
        personal: {
          id: 'personal-root',
          name: 'Meus Documentos',
          type: 'folder',
          children: [],
          dateAdded: '2026-03-03T10:00:00.000Z',
          dateModified: '2026-03-03T10:00:00.000Z',
        },
        projects: {
          id: 'projects-root',
          name: 'Documentos de Projetos',
          type: 'folder',
          children: [],
          dateAdded: '2026-03-03T10:00:00.000Z',
          dateModified: '2026-03-03T10:00:00.000Z',
        },
      },
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

// scrollTo is not implemented in jsdom; mock it so WeeklyTimeGrid doesn't throw
Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
  configurable: true,
  value: vi.fn(),
});

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
  describe('initial rendering', () => {
    it('renders without runtime errors and shows the page title', async () => {
      // Arrange / Act
      renderAgendaPage();

      // Assert
      expect(await screen.findByText('Calendário')).toBeInTheDocument();
    });

    it('shows the "Novo Evento" action button', async () => {
      // Arrange / Act
      renderAgendaPage();

      // Assert
      expect(await screen.findByText('Novo Evento')).toBeInTheDocument();
    });

    it('renders all 7 weekday header abbreviations in monthly view', async () => {
      // Arrange / Act
      renderAgendaPage();

      // Assert
      expect(await screen.findByText('Dom')).toBeInTheDocument();
      expect(screen.getByText('Seg')).toBeInTheDocument();
      expect(screen.getByText('Ter')).toBeInTheDocument();
      expect(screen.getByText('Qua')).toBeInTheDocument();
      expect(screen.getByText('Qui')).toBeInTheDocument();
      expect(screen.getByText('Sex')).toBeInTheDocument();
      expect(screen.getByText('Sáb')).toBeInTheDocument();
    });

    it('defaults to monthly view showing day cells', async () => {
      // Arrange / Act
      renderAgendaPage();

      // Assert — day number cells exist in monthly grid (at least 28 days visible)
      await screen.findByText('Calendário');
      const dayButtons = document.querySelectorAll('[role="button"]');
      expect(dayButtons.length).toBeGreaterThanOrEqual(28);
    });
  });

  describe('view switching', () => {
    it('switches to weekly view when "Semana" button is clicked', async () => {
      // Arrange
      renderAgendaPage();
      await screen.findByText('Calendário');

      // Act — find the Semana button by exact text content
      const weekButton = screen.getByText('Semana');
      fireEvent.click(weekButton);

      // Assert — weekly grid shows 24-hour timeline labels
      expect(await screen.findByText('00:00')).toBeInTheDocument();
    });

    it('switches back to monthly view from weekly view', async () => {
      // Arrange
      renderAgendaPage();
      await screen.findByText('Calendário');
      fireEvent.click(screen.getByText('Semana'));
      await screen.findByText('00:00');

      // Act
      fireEvent.click(screen.getByText('Mês'));

      // Assert — weekday headers are back (monthly grid)
      expect(await screen.findByText('Dom')).toBeInTheDocument();
    });
  });

  describe('month navigation', () => {
    it('renders prev and next navigation buttons in monthly view', async () => {
      // Arrange / Act
      renderAgendaPage();
      await screen.findByText('Calendário');

      // Assert — navigation buttons with correct aria-labels for monthly view
      expect(screen.getByLabelText('Mês anterior')).toBeInTheDocument();
      expect(screen.getByLabelText('Próximo mês')).toBeInTheDocument();
    });

    it('remains in monthly view after clicking the next navigation button', async () => {
      // Arrange
      renderAgendaPage();
      await screen.findByText('Calendário');

      // Act
      fireEvent.click(screen.getByLabelText('Próximo mês'));

      // Assert — still in monthly view (no 00:00 timeline label)
      expect(screen.queryByText('00:00')).not.toBeInTheDocument();
      // Weekday headers still visible
      expect(screen.getByText('Dom')).toBeInTheDocument();
    });
  });

  describe('new event modal', () => {
    it('opens the "Novo Evento / Tarefa" modal when "Novo Evento" is clicked', async () => {
      // Arrange
      renderAgendaPage();
      await screen.findByText('Calendário');

      // Act
      fireEvent.click(screen.getByText('Novo Evento'));

      // Assert
      expect(
        await screen.findByRole('heading', { name: 'Novo Evento / Tarefa' }),
      ).toBeInTheDocument();
    });

    it('closes the modal when the Cancel button is pressed', async () => {
      // Arrange
      renderAgendaPage();
      await screen.findByText('Calendário');
      fireEvent.click(screen.getByText('Novo Evento'));
      await screen.findByRole('heading', { name: 'Novo Evento / Tarefa' });

      // Act
      fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

      // Assert — modal is closed
      expect(
        screen.queryByRole('heading', { name: 'Novo Evento / Tarefa' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('day sidebar', () => {
    it('shows the DayDetailSidebar with date information upon load', async () => {
      // Arrange / Act
      renderAgendaPage();
      await screen.findByText('Calendário');

      // Assert — sidebar always shows current selected date
      // The sidebar shows a heading like "15 de Março"
      // We look for the sidebar's "Sem eventos para este dia." text as a proxy
      expect(await screen.findByText('Sem eventos para este dia.')).toBeInTheDocument();
    });
  });
});
