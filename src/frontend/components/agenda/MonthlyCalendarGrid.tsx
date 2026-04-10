import React, { useCallback } from 'react';
import { agendaService } from '../../services/agendaService';
import type { EventIndex } from '../../services/agendaService';
import { DAYS, DEFAULT_CELL_HEIGHT_REM, priorityColors } from './agendaConstants';
import { toDateOnlyString } from '../../utils/formatters';

interface MonthlyCalendarGridProps {
  calendarGrid: Date[];
  eventIndex: EventIndex;
  selectedDate: Date;
  currentDate: Date;
  normalizedCellHeightScale: number;
  onDateClick: (date: Date) => void;
}

function MonthlyCalendarGrid({
  calendarGrid,
  eventIndex,
  selectedDate,
  currentDate,
  normalizedCellHeightScale,
  onDateClick,
}: MonthlyCalendarGridProps) {
  const renderDayCell = useCallback(
    (date: Date) => {
      const dayEvents = agendaService.getEventsFromIndex(date, eventIndex);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dateTimestamp = new Date(date);
      dateTimestamp.setHours(0, 0, 0, 0);
      const isToday = dateTimestamp.getTime() === today.getTime();
      const isPast = dateTimestamp.getTime() < today.getTime();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      const dayKey = toDateOnlyString(date);
      const isDifferentMonth = date.getMonth() !== currentDate.getMonth();

      const eventIndicators = (
        <div className="flex flex-wrap items-center justify-center gap-1 mt-auto w-full px-1 pb-1">
          {[
            ...new Set(
              dayEvents.map((e) =>
                e.isFinancialEvent
                  ? e.isFinancialEvent
                  : e.isDeadlineEvent
                    ? 'deadline'
                    : e.priority,
              ),
            ),
          ]
            .sort((a, b) => (typeof b === 'number' ? b : 0) - (typeof a === 'number' ? a : 0))
            .slice(0, 8)
            .map((p, i) => {
              let dotClass = 'bg-text-secondary/40';
              if (p === 'deadline') dotClass = 'bg-error';
              else if (p === 'income') dotClass = 'bg-success';
              else if (p === 'expense') dotClass = 'bg-error/70';
              else if (typeof p === 'number') dotClass = priorityColors[p]?.dotClass || dotClass;
              return <div key={i} className={`w-2 h-2 rounded-full ${dotClass}`} />;
            })}
        </div>
      );

      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      let bgClass = 'bg-surface';
      let borderClass = 'border border-border-color/60 hover:border-primary/50';
      let textClass = 'text-text-primary';

      if (isDifferentMonth) {
        bgClass = 'bg-background/40 opacity-50';
      } else if (isSelected) {
        bgClass = 'bg-primary/5 z-10 shadow-md transform scale-[1.02]';
        borderClass = 'border-2 border-primary';
      } else if (isToday) {
        bgClass = 'bg-primary/5';
        borderClass = 'border border-primary/30';
      } else if (isPast) {
        bgClass = 'bg-warning/10 dark:bg-warning/5';
        textClass = 'text-text-secondary';
      }

      if (isWeekend && !isSelected && !isDifferentMonth) {
        bgClass = isPast
          ? 'bg-background/60 dark:bg-background/25'
          : 'bg-background/60 dark:bg-background/30';
        textClass = 'text-text-secondary';
      }

      return (
        <div
          key={dayKey}
          onClick={() => onDateClick(date)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onDateClick(date);
            }
          }}
          role="button"
          tabIndex={0}
          className={`
                    relative rounded-xl flex flex-col p-2 cursor-pointer transition-all duration-200 ease-in-out group
                    ${bgClass} ${borderClass}
                `}
          style={{ minHeight: `${DEFAULT_CELL_HEIGHT_REM * normalizedCellHeightScale}rem` }} // NOSONAR
        >
          <div className="flex justify-center">
            <span
              className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-content font-bold shadow-sm' : `font-semibold ${textClass}`}`}
            >
              {date.getDate()}
            </span>
          </div>
          {dayEvents.length > 0 && eventIndicators}
        </div>
      );
    },
    [eventIndex, selectedDate, currentDate, onDateClick, normalizedCellHeightScale],
  );

  return (
    <>
      <div className="grid grid-cols-7 mb-2 shrink-0 px-1">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-text-secondary uppercase py-2"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar content-start p-1">
        {calendarGrid.map((date) => renderDayCell(date))}
      </div>
    </>
  );
}

export default MonthlyCalendarGrid;
