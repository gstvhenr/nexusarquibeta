import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SystemContext } from '@/context/SystemContext';
import type { SystemDataType } from '@/context/types';
import type { Reminder } from '@/types';
import LembretesPage from './LembretesPage';

// ─── TEST HELPERS ───────────────────────────────────────────────

const createReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  id: 'rem-1',
  title: 'Ligação com cliente',
  comment: 'Confirmar briefing do projeto',
  remindAt: '2030-12-31T14:00:00.000Z', // future — not overdue
  color: 'yellow',
  createdAt: '2026-03-10T09:00:00.000Z',
  completedAt: null,
  pinned: false,
  ...overrides,
});

function ensureModalRoot(): HTMLDivElement {
  const existing = document.getElementById('modal-root');
  if (existing) return existing as HTMLDivElement;
  const el = document.createElement('div');
  el.id = 'modal-root';
  document.body.appendChild(el);
  return el;
}

const createEmptyDocumentStorage = (): SystemDataType['documentStorage'] => ({
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
});

function TestSystemProvider({
  initialReminders,
  children,
}: {
  initialReminders: Reminder[];
  children: React.ReactNode;
}): JSX.Element {
  const [documentStorage, setDocumentStorage] = useState<SystemDataType['documentStorage']>(
    createEmptyDocumentStorage,
  );
  const [agendaEvents, setAgendaEvents] = useState<SystemDataType['agendaEvents']>([]);
  const [reminders, setReminders] = useState<SystemDataType['reminders']>(initialReminders);
  const [customBudgetTemplate, setCustomBudgetTemplate] =
    useState<SystemDataType['customBudgetTemplate']>(null);
  const [globalIdentifierCounter, setGlobalIdentifierCounter] =
    useState<SystemDataType['globalIdentifierCounter']>(2500);
  const [dismissedFocusItems, setDismissedFocusItems] = useState<
    SystemDataType['dismissedFocusItems']
  >([]);
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<
    SystemDataType['acceptedPaymentMethods']
  >([]);
  const [hiredServices, setHiredServices] = useState<SystemDataType['hiredServices']>([]);
  const [contractDeadlines, setContractDeadlines] = useState<SystemDataType['contractDeadlines']>({
    defaultPreliminarDeadlineDays: 7,
    defaultExecutiveDeadlineDays: 30,
  });

  const value: SystemDataType = {
    documentStorage,
    setDocumentStorage,
    agendaEvents,
    setAgendaEvents,
    reminders,
    setReminders,
    customBudgetTemplate,
    setCustomBudgetTemplate,
    globalIdentifierCounter,
    setGlobalIdentifierCounter,
    dismissedFocusItems,
    setDismissedFocusItems,
    acceptedPaymentMethods,
    setAcceptedPaymentMethods,
    hiredServices,
    setHiredServices,
    contractDeadlines,
    setContractDeadlines,
  };

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

function renderPage(initialReminders: Reminder[] = []): void {
  render(
    <TestSystemProvider initialReminders={initialReminders}>
      <LembretesPage />
    </TestSystemProvider>,
  );
}

// ─── TESTS ───────────────────────────────────────────────────────

describe('LembretesPage', () => {
  beforeEach(() => {
    ensureModalRoot();
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
  });

  describe('empty state', () => {
    it('renders the page header "Lembretes"', () => {
      // Arrange / Act
      renderPage();

      // Assert
      expect(screen.getByText('Lembretes')).toBeInTheDocument();
    });

    it('shows the empty state component when there are no reminders', () => {
      // Arrange / Act
      renderPage();

      // Assert
      expect(screen.getByText('Nenhum lembrete ainda')).toBeInTheDocument();
    });

    it('does NOT show the "Concluídos" toggle when there are no completed reminders', () => {
      // Arrange / Act
      renderPage();

      // Assert
      expect(screen.queryByText(/Concluídos/)).not.toBeInTheDocument();
    });

    it('always renders the "Novo Lembrete" action button', () => {
      // Arrange / Act
      renderPage();

      // Assert
      expect(screen.getByRole('button', { name: /Novo Lembrete/i })).toBeInTheDocument();
    });
  });

  describe('active reminders', () => {
    it('renders reminder title when an active reminder exists', () => {
      // Arrange / Act
      renderPage([createReminder({ title: 'Reunião com arquiteto' })]);

      // Assert
      expect(screen.getByText('Reunião com arquiteto')).toBeInTheDocument();
    });

    it('renders reminder comment alongside the title', () => {
      // Arrange / Act
      renderPage([createReminder({ comment: 'Trazer desenhos técnicos' })]);

      // Assert
      expect(screen.getByText('Trazer desenhos técnicos')).toBeInTheDocument();
    });

    it('does not show empty state when at least one active reminder exists', () => {
      // Arrange / Act
      renderPage([createReminder()]);

      // Assert
      expect(screen.queryByText('Nenhum lembrete ainda')).not.toBeInTheDocument();
    });

    it('renders multiple reminders from the provided list', () => {
      // Arrange / Act
      renderPage([
        createReminder({ id: 'r1', title: 'Lembrete Alpha' }),
        createReminder({ id: 'r2', title: 'Lembrete Beta' }),
      ]);

      // Assert
      expect(screen.getByText('Lembrete Alpha')).toBeInTheDocument();
      expect(screen.getByText('Lembrete Beta')).toBeInTheDocument();
    });

    it('pinned reminders appear above non-pinned reminders', () => {
      // Arrange — pinned reminder is given a later creation date
      renderPage([
        createReminder({
          id: 'r1',
          title: 'Não Fixado',
          pinned: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        }),
        createReminder({
          id: 'r2',
          title: 'Fixado',
          pinned: true,
          createdAt: '2026-06-01T00:00:00.000Z',
        }),
      ]);

      // Assert — "Fixado" should appear before "Não Fixado" in the DOM
      const titlesText = document.body.textContent ?? '';
      const pinnedIndex = titlesText.indexOf('Fixado');
      const normalIndex = titlesText.indexOf('Não Fixado');
      expect(pinnedIndex).toBeLessThan(normalIndex);
    });
  });

  describe('form modal', () => {
    it('opens the "Novo Lembrete" form modal when button is clicked', () => {
      // Arrange
      renderPage();

      // Act
      fireEvent.click(screen.getByRole('button', { name: /Novo Lembrete/i }));

      // Assert
      expect(screen.getByRole('heading', { name: 'Novo Lembrete' })).toBeInTheDocument();
    });

    it('opens the edit form modal when a reminder card body is clicked', () => {
      // Arrange
      renderPage([createReminder({ title: 'Lembrete de Editar' })]);

      // Act — click on the reminder title text (inside the div[role=button] card body).
      // We use getByText because the card div's accessible name is non-empty
      // (derived from its inner content), making getByRole('button', { name: '' }) invalid.
      fireEvent.click(screen.getByText('Lembrete de Editar'));

      // Assert — edit form should open (it reuses the same form with the selected reminder)
      expect(screen.getByRole('heading', { name: 'Editar Lembrete' })).toBeInTheDocument();
    });
  });

  describe('pin toggle', () => {
    it('changes pin button title from "Fixar" to "Desafixar" after pinning', () => {
      // Arrange
      renderPage([createReminder({ pinned: false })]);

      // Act
      fireEvent.click(screen.getByTitle('Fixar'));

      // Assert
      expect(screen.getByTitle('Desafixar')).toBeInTheDocument();
    });

    it('changes pin button title from "Desafixar" back to "Fixar" after unpinning', () => {
      // Arrange
      renderPage([createReminder({ pinned: true })]);

      // Act
      fireEvent.click(screen.getByTitle('Desafixar'));

      // Assert
      expect(screen.getByTitle('Fixar')).toBeInTheDocument();
    });
  });

  describe('mark as complete', () => {
    it('removes reminder from active board when "Concluir" is clicked', () => {
      // Arrange
      renderPage([createReminder({ title: 'Completar Esta' })]);
      expect(screen.getByText('Completar Esta')).toBeInTheDocument();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));

      // Assert — active list is now empty → empty state shows
      expect(screen.getByText('Nenhum lembrete ainda')).toBeInTheDocument();
    });

    it('shows the "Concluídos (1)" toggle button after completing a reminder', () => {
      // Arrange
      renderPage([createReminder()]);

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));

      // Assert
      expect(screen.getByRole('button', { name: /Concluídos \(1\)/i })).toBeInTheDocument();
    });

    it('reveals completed reminders when the "Concluídos" toggle is clicked', () => {
      // Arrange
      renderPage([createReminder({ title: 'Tarefa Concluída' })]);
      fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));

      // Act
      fireEvent.click(screen.getByRole('button', { name: /Concluídos/i }));

      // Assert — completed reminder is visible with strikethrough title
      expect(screen.getByText('Tarefa Concluída')).toBeInTheDocument();
      expect(screen.getByText(/Concluído em/i)).toBeInTheDocument();
    });
  });

  describe('delete', () => {
    it('opens a delete confirmation modal when delete button is clicked', () => {
      // Arrange
      renderPage([createReminder({ title: 'Lembrete Deletável' })]);

      // Act
      fireEvent.click(screen.getByLabelText('Excluir'));

      // Assert — delete confirmation modal appears
      expect(screen.getByText(/Confirmar exclusão/i)).toBeInTheDocument();
    });

    it('removes reminder after confirming deletion in the modal', () => {
      // Arrange
      renderPage([createReminder({ title: 'Será Excluído' })]);
      fireEvent.click(screen.getByLabelText('Excluir'));

      // Act — confirm deletion. Scope the query to modal-root because both the
      // card's aria-label="Excluir" button AND the modal's "Excluir" confirm button
      // match name:/excluir/i simultaneously, causing getByRole to find multiple elements.
      const modalRoot = document.getElementById('modal-root')!;
      const { getByRole: getByRoleInModal } = within(modalRoot);
      fireEvent.click(getByRoleInModal('button', { name: /excluir/i }));

      // Assert — reminder is gone, empty state shows
      expect(screen.queryByText('Será Excluído')).not.toBeInTheDocument();
      expect(screen.getByText('Nenhum lembrete ainda')).toBeInTheDocument();
    });
  });

  describe('reschedule', () => {
    it('opens the reschedule form modal when "Reagendar" is clicked', () => {
      // Arrange
      renderPage([createReminder()]);

      // Act
      fireEvent.click(screen.getByLabelText('Reagendar'));

      // Assert — edit form modal opens in reschedule mode
      expect(screen.getByRole('heading', { name: /Reagendar/i })).toBeInTheDocument();
    });
  });
});
