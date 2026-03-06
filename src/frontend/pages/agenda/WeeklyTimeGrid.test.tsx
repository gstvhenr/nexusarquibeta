import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WeeklyTimeGrid from './WeeklyTimeGrid';
import type { AgendaEvent } from '@/types';
import { agendaService } from '../../services/agendaService';

const getEventsFromIndex = vi.spyOn(agendaService, 'getEventsFromIndex');

function createEvent(overrides: Partial<AgendaEvent> = {}): AgendaEvent {
  return {
    id: 'event-1',
    title: 'Tarefa Planejada',
    date: '2026-03-10',
    time: '10:00',
    type: 'Desenvolvimento de Projeto',
    priority: 3,
    recurrence: 'none',
    completed: false,
    ...overrides,
  };
}

function createWeekGrid(baseDate: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(baseDate);
    next.setDate(baseDate.getDate() + index);
    return next;
  });
}

describe('WeeklyTimeGrid', () => {
  beforeEach(() => {
    // Defensive cleanup: clears any stale DOM from previous test files.
    // AgendaPage renders WeeklyTimeGrid internally; its async DataProvider
    // state updates can complete after the previous file's afterEach cleanup.
    cleanup();
    getEventsFromIndex.mockReset();
    getEventsFromIndex.mockReturnValue([]);
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('timeline structure', () => {
    it('renders all 24 hour labels (00:00 through 23:00)', () => {
      // Arrange / Act
      render(
        <WeeklyTimeGrid
          weeklyGrid={createWeekGrid(new Date('2026-03-09T00:00:00.000Z'))}
          eventIndex={new Map()}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onToggleCompleted={vi.fn()}
        />,
      );

      // Assert — spot-check key hours
      expect(screen.getByText('00:00')).toBeInTheDocument();
      expect(screen.getByText('12:00')).toBeInTheDocument();
      expect(screen.getByText('23:00')).toBeInTheDocument();
    });

    it('renders 7 day column headers', () => {
      // Arrange / Act
      render(
        <WeeklyTimeGrid
          weeklyGrid={createWeekGrid(new Date('2026-03-09T00:00:00.000Z'))}
          eventIndex={new Map()}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onToggleCompleted={vi.fn()}
        />,
      );

      // Assert — day abbreviations are visible in headers
      expect(screen.getByText('Dom')).toBeInTheDocument();
      expect(screen.getByText('Seg')).toBeInTheDocument();
      expect(screen.getByText('Sáb')).toBeInTheDocument();
    });
  });

  describe('event card rendering', () => {
    it('renders event title when events exist for a day', () => {
      // Arrange
      const event = createEvent({ title: 'Reunião de Alinhamento' });
      const weeklyGrid = createWeekGrid(new Date('2026-03-09T00:00:00.000Z'));

      getEventsFromIndex.mockImplementation((date: Date) =>
        date.toDateString() === weeklyGrid[0].toDateString() ? [event] : [],
      );

      // Act
      render(
        <WeeklyTimeGrid
          weeklyGrid={weeklyGrid}
          eventIndex={new Map()}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onToggleCompleted={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('Reunião de Alinhamento')).toBeInTheDocument();
    });

    it('renders no event cards when there are no events for the week', () => {
      // Arrange
      const weeklyGrid = createWeekGrid(new Date('2026-03-09T00:00:00.000Z'));
      getEventsFromIndex.mockReturnValue([]);

      // Act
      render(
        <WeeklyTimeGrid
          weeklyGrid={weeklyGrid}
          eventIndex={new Map()}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onToggleCompleted={vi.fn()}
        />,
      );

      // Assert — no event role=button cards (only hour rows are rendered)
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('callbacks — standard events', () => {
    it('calls onEventView when an event card is clicked', () => {
      // Arrange
      const event = createEvent();
      const weeklyGrid = createWeekGrid(new Date('2026-03-09T00:00:00.000Z'));
      const onEventView = vi.fn();

      getEventsFromIndex.mockImplementation((date: Date) =>
        date.toDateString() === weeklyGrid[0].toDateString() ? [event] : [],
      );

      render(
        <WeeklyTimeGrid
          weeklyGrid={weeklyGrid}
          eventIndex={new Map()}
          onEventView={onEventView}
          onEventEdit={vi.fn()}
          onToggleCompleted={vi.fn()}
        />,
      );

      // Act
      fireEvent.click(screen.getByText('Tarefa Planejada'));

      // Assert
      expect(onEventView).toHaveBeenCalledWith(event);
    });

    it('calls onEventEdit when edit button is clicked without triggering onEventView', () => {
      // Arrange
      const event = createEvent();
      const weeklyGrid = createWeekGrid(new Date('2026-03-09T00:00:00.000Z'));
      const onEventView = vi.fn();
      const onEventEdit = vi.fn();

      getEventsFromIndex.mockImplementation((date: Date) =>
        date.toDateString() === weeklyGrid[0].toDateString() ? [event] : [],
      );

      render(
        <WeeklyTimeGrid
          weeklyGrid={weeklyGrid}
          eventIndex={new Map()}
          onEventView={onEventView}
          onEventEdit={onEventEdit}
          onToggleCompleted={vi.fn()}
        />,
      );

      // Act
      fireEvent.click(screen.getByLabelText('Editar evento'));

      // Assert
      expect(onEventEdit).toHaveBeenCalledWith(event);
      expect(onEventView).not.toHaveBeenCalled();
    });

    it('calls onToggleCompleted with event id when toggle button is clicked', () => {
      // Arrange
      const event = createEvent({ id: 'toggle-target' });
      const weeklyGrid = createWeekGrid(new Date('2026-03-09T00:00:00.000Z'));
      const onToggleCompleted = vi.fn();

      getEventsFromIndex.mockImplementation((date: Date) =>
        date.toDateString() === weeklyGrid[0].toDateString() ? [event] : [],
      );

      render(
        <WeeklyTimeGrid
          weeklyGrid={weeklyGrid}
          eventIndex={new Map()}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onToggleCompleted={onToggleCompleted}
        />,
      );

      // Act
      fireEvent.click(screen.getByLabelText('Marcar como concluída'));

      // Assert
      expect(onToggleCompleted).toHaveBeenCalledWith('toggle-target');
    });

    it('shows "Marcar como pendente" label for already completed events', () => {
      // Arrange
      const event = createEvent({ completed: true });
      const weeklyGrid = createWeekGrid(new Date('2026-03-09T00:00:00.000Z'));

      getEventsFromIndex.mockImplementation((date: Date) =>
        date.toDateString() === weeklyGrid[0].toDateString() ? [event] : [],
      );

      render(
        <WeeklyTimeGrid
          weeklyGrid={weeklyGrid}
          eventIndex={new Map()}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onToggleCompleted={vi.fn()}
        />,
      );

      // Assert — label changes for completed events
      expect(screen.getByLabelText('Marcar como pendente')).toBeInTheDocument();
    });
  });

  describe('financial events', () => {
    it('hides edit and toggle controls for income financial events', () => {
      // Arrange
      const event = createEvent({
        id: 'fin-income',
        title: 'Recebimento',
        isFinancialEvent: 'income',
      });
      const weeklyGrid = createWeekGrid(new Date('2026-03-09T00:00:00.000Z'));

      getEventsFromIndex.mockImplementation((date: Date) =>
        date.toDateString() === weeklyGrid[0].toDateString() ? [event] : [],
      );

      render(
        <WeeklyTimeGrid
          weeklyGrid={weeklyGrid}
          eventIndex={new Map()}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onToggleCompleted={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('Recebimento')).toBeInTheDocument();
      expect(screen.queryByLabelText('Editar evento')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Marcar como concluída')).not.toBeInTheDocument();
    });

    it('hides edit and toggle controls for expense financial events', () => {
      // Arrange
      const event = createEvent({
        id: 'fin-expense',
        title: 'Pagamento Fornecedor',
        isFinancialEvent: 'expense',
      });
      const weeklyGrid = createWeekGrid(new Date('2026-03-09T00:00:00.000Z'));

      getEventsFromIndex.mockImplementation((date: Date) =>
        date.toDateString() === weeklyGrid[0].toDateString() ? [event] : [],
      );

      render(
        <WeeklyTimeGrid
          weeklyGrid={weeklyGrid}
          eventIndex={new Map()}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onToggleCompleted={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('Pagamento Fornecedor')).toBeInTheDocument();
      expect(screen.queryByLabelText('Editar evento')).not.toBeInTheDocument();
    });
  });

  describe('deadline events', () => {
    it('hides edit and toggle controls for deadline events', () => {
      // Arrange
      const event = createEvent({
        id: 'deadline-event',
        title: 'Prazo de Entrega',
        isDeadlineEvent: true,
      });
      const weeklyGrid = createWeekGrid(new Date('2026-03-09T00:00:00.000Z'));

      getEventsFromIndex.mockImplementation((date: Date) =>
        date.toDateString() === weeklyGrid[0].toDateString() ? [event] : [],
      );

      render(
        <WeeklyTimeGrid
          weeklyGrid={weeklyGrid}
          eventIndex={new Map()}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onToggleCompleted={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('Prazo de Entrega')).toBeInTheDocument();
      expect(screen.queryByLabelText('Editar evento')).not.toBeInTheDocument();
    });
  });

  describe('keyboard accessibility', () => {
    it('calls onEventView on Enter key for an event card', () => {
      // Arrange
      const event = createEvent({ id: 'kb-event' });
      const weeklyGrid = createWeekGrid(new Date('2026-03-09T00:00:00.000Z'));
      const onEventView = vi.fn();

      getEventsFromIndex.mockImplementation((date: Date) =>
        date.toDateString() === weeklyGrid[0].toDateString() ? [event] : [],
      );

      const { container } = render(
        <WeeklyTimeGrid
          weeklyGrid={weeklyGrid}
          eventIndex={new Map()}
          onEventView={onEventView}
          onEventEdit={vi.fn()}
          onToggleCompleted={vi.fn()}
        />,
      );

      // Act — use container.querySelector to target the event card div[role=button] specifically.
      // screen.getByRole('button') is ambiguous: the card wrapper div AND the inner
      // action buttons (Edit, Complete) all have role=button.
      const card = container.querySelector('[role="button"]') as HTMLElement;
      fireEvent.keyDown(card, { key: 'Enter' });

      // Assert
      expect(onEventView).toHaveBeenCalledWith(event);
    });
  });
});
