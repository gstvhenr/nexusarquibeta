import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgendaEvent } from '@/types';
import MonthlyCalendarGrid from './MonthlyCalendarGrid';
import { agendaService } from '../../services/agendaService';

const getEventsFromIndex = vi.spyOn(agendaService, 'getEventsFromIndex');

function makeDate(year: number, month: number, day: number): Date {
  // month is 0-indexed
  return new Date(year, month, day);
}

describe('MonthlyCalendarGrid', () => {
  beforeEach(() => {
    getEventsFromIndex.mockReset();
    getEventsFromIndex.mockReturnValue([]);
    // Freeze time so "isToday" comparisons are deterministic
    vi.setSystemTime(new Date(2026, 2, 15)); // March 15, 2026
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe('weekday header row', () => {
    it('renders all 7 weekday abbreviations', () => {
      // Arrange / Act
      render(
        <MonthlyCalendarGrid
          calendarGrid={[makeDate(2026, 2, 10)]}
          eventIndex={new Map()}
          selectedDate={makeDate(2026, 2, 10)}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1}
          onDateClick={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('Dom')).toBeInTheDocument();
      expect(screen.getByText('Seg')).toBeInTheDocument();
      expect(screen.getByText('Ter')).toBeInTheDocument();
      expect(screen.getByText('Qua')).toBeInTheDocument();
      expect(screen.getByText('Qui')).toBeInTheDocument();
      expect(screen.getByText('Sex')).toBeInTheDocument();
      expect(screen.getByText('Sáb')).toBeInTheDocument();
    });
  });

  describe('day cells', () => {
    it('renders the day number for each date in the calendar grid', () => {
      // Arrange
      const grid = [makeDate(2026, 2, 10), makeDate(2026, 2, 11), makeDate(2026, 2, 12)];

      // Act
      render(
        <MonthlyCalendarGrid
          calendarGrid={grid}
          eventIndex={new Map()}
          selectedDate={grid[0]}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1}
          onDateClick={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('each day cell has role="button" for accessibility', () => {
      // Arrange
      const grid = [makeDate(2026, 2, 10), makeDate(2026, 2, 11)];

      // Act
      render(
        <MonthlyCalendarGrid
          calendarGrid={grid}
          eventIndex={new Map()}
          selectedDate={grid[0]}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1}
          onDateClick={vi.fn()}
        />,
      );

      // Assert — 2 day cells + 7 day headers (not buttons) = 2 buttons
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
  });

  describe('date selection', () => {
    it('calls onDateClick with the correct date on mouse click', () => {
      // Arrange
      const dateA = makeDate(2026, 2, 10);
      const onDateClick = vi.fn();

      render(
        <MonthlyCalendarGrid
          calendarGrid={[dateA]}
          eventIndex={new Map()}
          selectedDate={dateA}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1}
          onDateClick={onDateClick}
        />,
      );

      // Act
      fireEvent.click(screen.getByText('10').closest('[role="button"]') as HTMLElement);

      // Assert
      expect(onDateClick).toHaveBeenCalledOnce();
      expect(onDateClick).toHaveBeenCalledWith(dateA);
    });

    it('calls onDateClick on Enter keydown', () => {
      // Arrange
      const dateA = makeDate(2026, 2, 10);
      const onDateClick = vi.fn();

      render(
        <MonthlyCalendarGrid
          calendarGrid={[dateA]}
          eventIndex={new Map()}
          selectedDate={dateA}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1}
          onDateClick={onDateClick}
        />,
      );

      // Act
      const dayCell = screen.getByText('10').closest('[role="button"]') as HTMLElement;
      fireEvent.keyDown(dayCell, { key: 'Enter' });

      // Assert
      expect(onDateClick).toHaveBeenCalledWith(dateA);
    });

    it('calls onDateClick on Space keydown', () => {
      // Arrange
      const dateA = makeDate(2026, 2, 10);
      const onDateClick = vi.fn();

      render(
        <MonthlyCalendarGrid
          calendarGrid={[dateA]}
          eventIndex={new Map()}
          selectedDate={dateA}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1}
          onDateClick={onDateClick}
        />,
      );

      // Act
      const dayCell = screen.getByText('10').closest('[role="button"]') as HTMLElement;
      fireEvent.keyDown(dayCell, { key: ' ' });

      // Assert
      expect(onDateClick).toHaveBeenCalledWith(dateA);
    });

    it('does NOT call onDateClick for non-Enter/Space keys', () => {
      // Arrange
      const dateA = makeDate(2026, 2, 10);
      const onDateClick = vi.fn();

      render(
        <MonthlyCalendarGrid
          calendarGrid={[dateA]}
          eventIndex={new Map()}
          selectedDate={dateA}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1}
          onDateClick={onDateClick}
        />,
      );

      // Act
      const dayCell = screen.getByText('10').closest('[role="button"]') as HTMLElement;
      fireEvent.keyDown(dayCell, { key: 'ArrowDown' });

      // Assert
      expect(onDateClick).not.toHaveBeenCalled();
    });
  });

  describe('event indicators', () => {
    it('renders a priority swatch for each distinct priority on a day', () => {
      // Arrange
      const dateA = makeDate(2026, 2, 10);
      getEventsFromIndex.mockReturnValue([
        {
          id: 'e1', title: 'Alta prio', date: '2026-03-10', time: '10:00',
          type: 'Prazo de Entrega', recurrence: 'none', priority: 5, isDeadlineEvent: false
        } as AgendaEvent,
      ]);

      // Act
      const { container } = render(
        <MonthlyCalendarGrid
          calendarGrid={[dateA]}
          eventIndex={new Map()}
          selectedDate={dateA}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1}
          onDateClick={vi.fn()}
        />,
      );

      // Assert — priority 5 dot rendered
      expect(container.querySelector('.priority-swatch-5')).toBeInTheDocument();
    });

    it('renders no swatches when there are no events for a day', () => {
      // Arrange
      const dateA = makeDate(2026, 2, 10);
      getEventsFromIndex.mockReturnValue([]);

      // Act
      const { container } = render(
        <MonthlyCalendarGrid
          calendarGrid={[dateA]}
          eventIndex={new Map()}
          selectedDate={dateA}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1}
          onDateClick={vi.fn()}
        />,
      );

      // Assert — no colored swatch divs with exact priority class
      expect(container.querySelector('.priority-swatch-5')).not.toBeInTheDocument();
      expect(container.querySelector('.priority-swatch-3')).not.toBeInTheDocument();
    });

    it('renders unique swatches — no duplicates for same priority on the same day', () => {
      // Arrange — two events with the same priority 3
      const dateA = makeDate(2026, 2, 10);
      getEventsFromIndex.mockReturnValue([
        {
          id: 'e1', title: 'P3 A', date: '2026-03-10', time: '09:00',
          type: 'Desenvolvimento de Projeto', recurrence: 'none', priority: 3
        } as AgendaEvent,
        {
          id: 'e2', title: 'P3 B', date: '2026-03-10', time: '10:00',
          type: 'Desenvolvimento de Projeto', recurrence: 'none', priority: 3
        } as AgendaEvent,
      ]);

      // Act
      const { container } = render(
        <MonthlyCalendarGrid
          calendarGrid={[dateA]}
          eventIndex={new Map()}
          selectedDate={dateA}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1}
          onDateClick={vi.fn()}
        />,
      );

      // Assert — only 1 swatch for priority 3 (deduplication via Set)
      expect(container.querySelectorAll('.priority-swatch-3')).toHaveLength(1);
    });
  });

  describe('today highlighting', () => {
    it('applies the "today" styling for the current date — March 15 2026', () => {
      // Arrange — system time frozen to March 15, 2026
      const today = makeDate(2026, 2, 15);

      // Act
      const { container } = render(
        <MonthlyCalendarGrid
          calendarGrid={[today]}
          eventIndex={new Map()}
          selectedDate={today}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1}
          onDateClick={vi.fn()}
        />,
      );

      // Assert — "15" should exist inside a bg-primary circle (today indicator)
      const dayNum = container.querySelector('span.bg-primary');
      expect(dayNum).toBeInTheDocument();
      expect(dayNum?.textContent).toBe('15');
    });
  });

  describe('normalizedCellHeightScale', () => {
    it('applies the scale value to each day cell min-height', () => {
      // Arrange
      const dateA = makeDate(2026, 2, 10);

      // Act
      const { container } = render(
        <MonthlyCalendarGrid
          calendarGrid={[dateA]}
          eventIndex={new Map()}
          selectedDate={dateA}
          currentDate={makeDate(2026, 2, 1)}
          normalizedCellHeightScale={1.2}
          onDateClick={vi.fn()}
        />,
      );

      // Assert — DEFAULT_CELL_HEIGHT_REM (5) * 1.2 = 6rem
      const dayCell = container.querySelector('[role="button"]') as HTMLElement;
      expect(dayCell.style.minHeight).toBe('6rem');
    });
  });
});
