import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DayDetailSidebar from './DayDetailSidebar';
import type { AgendaEvent } from '@/types';

function createEvent(overrides: Partial<AgendaEvent> = {}): AgendaEvent {
  return {
    id: 'event-1',
    title: 'Reunião com Cliente',
    date: '2026-03-10',
    time: '10:00',
    type: 'Reunião com Cliente',
    priority: 3,
    recurrence: 'none',
    description: 'Alinhamento inicial',
    ...overrides,
  };
}

describe('DayDetailSidebar', () => {
  afterEach(() => {
    cleanup();
  });

  describe('date header', () => {
    it('displays the formatted date with day number and Portuguese month name', () => {
      // Arrange — March 10
      const date = new Date(2026, 2, 10); // month is 0-indexed

      // Act
      render(
        <DayDetailSidebar
          selectedDate={date}
          selectedDateEvents={[]}
          agendaEvents={[]}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('10 de Março')).toBeInTheDocument();
    });

    it('updates header text when another month is displayed', () => {
      // Arrange — July 4
      const date = new Date(2026, 6, 4);

      // Act
      render(
        <DayDetailSidebar
          selectedDate={date}
          selectedDateEvents={[]}
          agendaEvents={[]}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('4 de Julho')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state message when selected day has no events', () => {
      // Arrange / Act
      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[]}
          agendaEvents={[]}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('Sem eventos para este dia.')).toBeInTheDocument();
    });
  });

  describe('event rendering', () => {
    it('renders event title when events are provided', () => {
      // Arrange
      const event = createEvent({ title: 'Apresentação de Projeto' });

      // Act
      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[event]}
          agendaEvents={[event]}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('Apresentação de Projeto')).toBeInTheDocument();
    });

    it('renders event time as a tag', () => {
      // Arrange
      const event = createEvent({ time: '14:30' });

      // Act
      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[event]}
          agendaEvents={[event]}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('14:30')).toBeInTheDocument();
    });

    it('renders event description when present', () => {
      // Arrange
      const event = createEvent({ description: 'Detalhes importantes aqui' });

      // Act
      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[event]}
          agendaEvents={[event]}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('Detalhes importantes aqui')).toBeInTheDocument();
    });

    it('renders client name badge when clientName is set', () => {
      // Arrange
      const event = createEvent({ clientName: 'Arquitetura Viva' });

      // Act
      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[event]}
          agendaEvents={[event]}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('Arquitetura Viva')).toBeInTheDocument();
    });

    it('renders "Prazo do Projeto" badge for deadline events', () => {
      // Arrange
      const event = createEvent({ isDeadlineEvent: true });

      // Act
      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[event]}
          agendaEvents={[event]}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('Prazo do Projeto')).toBeInTheDocument();
    });
  });

  describe('editable vs read-only events', () => {
    it('calls onEventView only for editable events (present in agendaEvents)', () => {
      // Arrange
      const editableEvent = createEvent({ id: 'editable-1', title: 'Evento Editável' });
      const readOnlyEvent = createEvent({ id: 'readonly-1', title: 'Evento Somente Leitura' });
      const onEventView = vi.fn();

      // Act
      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[editableEvent, readOnlyEvent]}
          agendaEvents={[editableEvent]} // only editable is in the list
          onEventView={onEventView}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText('Evento Editável'));
      fireEvent.click(screen.getByText('Evento Somente Leitura'));

      // Assert
      expect(onEventView).toHaveBeenCalledOnce();
      expect(onEventView).toHaveBeenCalledWith(editableEvent);
    });

    it('shows edit and delete buttons only for editable events', () => {
      // Arrange
      const editableEvent = createEvent({ id: 'e1', title: 'Editável' });
      const readOnlyEvent = createEvent({ id: 'r1', title: 'Leitura' });

      // Act
      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[editableEvent, readOnlyEvent]}
          agendaEvents={[editableEvent]}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Assert — edit/delete buttons exist exactly once (for the editable event only)
      expect(screen.getAllByLabelText('Editar evento')).toHaveLength(1);
      expect(screen.getAllByLabelText('Excluir evento')).toHaveLength(1);
    });
  });

  describe('callbacks', () => {
    it('triggers onEventEdit when edit button is clicked', () => {
      // Arrange
      const event = createEvent({ id: 'edit-target' });
      const onEventEdit = vi.fn();

      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[event]}
          agendaEvents={[event]}
          onEventView={vi.fn()}
          onEventEdit={onEventEdit}
          onEventDelete={vi.fn()}
        />,
      );

      // Act
      fireEvent.click(screen.getByLabelText('Editar evento'));

      // Assert
      expect(onEventEdit).toHaveBeenCalledWith(event);
    });

    it('triggers onEventDelete when delete button is clicked', () => {
      // Arrange
      const event = createEvent({ id: 'delete-target' });
      const onEventDelete = vi.fn();

      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[event]}
          agendaEvents={[event]}
          onEventView={vi.fn()}
          onEventEdit={vi.fn()}
          onEventDelete={onEventDelete}
        />,
      );

      // Act
      fireEvent.click(screen.getByLabelText('Excluir evento'));

      // Assert
      expect(onEventDelete).toHaveBeenCalledWith(event);
    });

    it('does not trigger onEventView when edit button is clicked (stops propagation)', () => {
      // Arrange
      const event = createEvent({ id: 'propagation-test' });
      const onEventView = vi.fn();
      const onEventEdit = vi.fn();

      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[event]}
          agendaEvents={[event]}
          onEventView={onEventView}
          onEventEdit={onEventEdit}
          onEventDelete={vi.fn()}
        />,
      );

      // Act
      fireEvent.click(screen.getByLabelText('Editar evento'));

      // Assert — click should NOT bubble to the card's onEventView handler
      expect(onEventView).not.toHaveBeenCalled();
      expect(onEventEdit).toHaveBeenCalledOnce();
    });
  });

  describe('keyboard accessibility', () => {
    it('triggers onEventView on Enter keydown for editable events', () => {
      // Arrange
      const event = createEvent({ id: 'kb-1', title: 'Keyboard Event' });
      const onEventView = vi.fn();

      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[event]}
          agendaEvents={[event]}
          onEventView={onEventView}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Act
      const card = screen.getByText('Keyboard Event').closest('[role="button"]') as HTMLElement;
      fireEvent.keyDown(card, { key: 'Enter' });

      // Assert
      expect(onEventView).toHaveBeenCalledWith(event);
    });

    it('triggers onEventView on Space keydown for editable events', () => {
      // Arrange
      const event = createEvent({ id: 'kb-2', title: 'Space Keyboard Event' });
      const onEventView = vi.fn();

      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[event]}
          agendaEvents={[event]}
          onEventView={onEventView}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Act
      const card = screen.getByText('Space Keyboard Event').closest('[role="button"]') as HTMLElement;
      fireEvent.keyDown(card, { key: ' ' });

      // Assert
      expect(onEventView).toHaveBeenCalledWith(event);
    });

    it('does NOT trigger onEventView for non-Enter/Space keys', () => {
      // Arrange
      const event = createEvent({ id: 'kb-3', title: 'Arrow Key Event' });
      const onEventView = vi.fn();

      render(
        <DayDetailSidebar
          selectedDate={new Date('2026-03-10T00:00:00.000Z')}
          selectedDateEvents={[event]}
          agendaEvents={[event]}
          onEventView={onEventView}
          onEventEdit={vi.fn()}
          onEventDelete={vi.fn()}
        />,
      );

      // Act
      const card = screen.getByText('Arrow Key Event').closest('[role="button"]') as HTMLElement;
      fireEvent.keyDown(card, { key: 'ArrowDown' });

      // Assert
      expect(onEventView).not.toHaveBeenCalled();
    });
  });
});
