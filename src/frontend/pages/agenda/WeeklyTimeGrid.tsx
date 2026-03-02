import React, { useRef, useEffect } from 'react';
import { agendaService } from '../../services/agendaService';
import type { EventIndex } from '../../services/agendaService';
import type { AgendaEvent } from '../../types';
import { EditIcon, CheckCircleIcon } from '../../components/ui';
import { DAYS, HOURS, HOUR_HEIGHT_PX, priorityColors } from './agendaConstants';

interface WeeklyTimeGridProps {
  weeklyGrid: Date[];
  eventIndex: EventIndex;
  onEventView: (event: AgendaEvent) => void;
  onEventEdit: (event: AgendaEvent) => void;
  onToggleCompleted: (eventId: string) => void;
}

function WeeklyTimeGrid({
  weeklyGrid,
  eventIndex,
  onEventView,
  onEventEdit,
  onToggleCompleted,
}: WeeklyTimeGridProps) {
  const weekGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (weekGridRef.current) {
      const now = new Date();
      const scrollTarget = Math.max((now.getHours() - 1) * HOUR_HEIGHT_PX, 0);
      weekGridRef.current.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        ref={weekGridRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        {/* Day column headers */}
        <div
          className="grid shrink-0 border-b border-border-color/50 sticky top-0 z-20 bg-surface"
          style={{ gridTemplateColumns: '3.5rem repeat(7, 1fr)' }}
        >
          <div className="bg-surface" />
          {weeklyGrid.map((date) => {
            const todayMidnight = new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate(),
            ).getTime();
            const dateMidnight = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
            ).getTime();
            const isToday = dateMidnight === todayMidnight;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isPastDay = dateMidnight < todayMidnight;
            return (
              <div
                key={date.toISOString()}
                className={`text-center py-3 border-l border-border-color/30 bg-surface ${
                  isWeekend ? 'bg-gray-100 dark:bg-gray-800' : ''
                } ${isPastDay && !isToday ? 'opacity-50' : ''}`}
              >
                <span className="text-[10px] font-bold text-text-secondary uppercase">
                  {DAYS[date.getDay()]}
                </span>
                <br />
                <span
                  className={`text-lg font-bold ${
                    isToday
                      ? 'bg-primary text-primary-content rounded-full w-8 h-8 inline-flex items-center justify-center'
                      : isWeekend
                        ? 'text-text-secondary'
                        : 'text-text-primary'
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        <div
          className="grid relative"
          style={{
            gridTemplateColumns: '3.5rem repeat(7, 1fr)',
            gridTemplateRows: `repeat(${HOURS.length}, ${HOUR_HEIGHT_PX}px)`,
          }}
        >
          {/* Hour rows */}
          {HOURS.map((hour) => {
            const now = new Date();
            return (
              <React.Fragment key={hour}>
                <div
                  className="text-[10px] font-semibold text-text-secondary pr-2 text-right select-none border-t border-border-color/20 pt-0.5"
                  style={{ gridColumn: 1, gridRow: hour + 1 }}
                >
                  {String(hour).padStart(2, '0')}:00
                </div>
                {weeklyGrid.map((date, colIdx) => {
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const dateMidnight = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                  ).getTime();
                  const nowMidnight = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                  ).getTime();
                  const isPastCell =
                    dateMidnight < nowMidnight ||
                    (dateMidnight === nowMidnight && hour <= now.getHours());

                  let cellBg = '';
                  if (isWeekend) {
                    cellBg = 'bg-gray-100/60 dark:bg-gray-800/25';
                  } else if (isPastCell) {
                    cellBg = 'bg-amber-50/60 dark:bg-amber-950/25';
                  }

                  return (
                    <div
                      key={colIdx}
                      className={`border-t border-l border-border-color/20 ${cellBg}`}
                      style={{ gridColumn: colIdx + 2, gridRow: hour + 1 }}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* Current time indicator */}
          {(() => {
            const now = new Date();
            const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
            const topPx = (minutesSinceMidnight / 60) * HOUR_HEIGHT_PX;
            const todayIndex = weeklyGrid.findIndex((d) => d.toDateString() === now.toDateString());
            if (todayIndex === -1) return null;
            return (
              <div
                className="absolute pointer-events-none z-20"
                style={{
                  top: `${topPx}px`,
                  left: '3.5rem',
                  right: 0,
                  height: 0,
                }}
              >
                <div className="absolute inset-x-0 h-[1px] bg-red-400/30" />
                <div
                  className="absolute h-[2px] bg-red-500"
                  style={{
                    left: `calc(${(todayIndex / 7) * 100}%)`,
                    width: `${(1 / 7) * 100}%`,
                  }}
                />
                <div
                  className="absolute w-2.5 h-2.5 bg-red-500 rounded-full -translate-y-[4px] -translate-x-[3px]"
                  style={{
                    left: `calc(${(todayIndex / 7) * 100}%)`,
                  }}
                />
              </div>
            );
          })()}

          {/* Event cards */}
          {weeklyGrid.map((date, colIdx) => {
            const dayEvents = agendaService.getEventsFromIndex(date, eventIndex);
            if (dayEvents.length === 0) return null;
            return (
              <div
                key={`events-${colIdx}`}
                className="relative"
                style={{
                  gridColumn: colIdx + 2,
                  gridRow: `1 / ${HOURS.length + 1}`,
                  pointerEvents: 'none',
                }}
              >
                {dayEvents.map((event) => {
                  const [hStr, mStr] = (event.time || '00:00').split(':');
                  const startMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr || '0', 10);
                  const topPx = (startMinutes / 60) * HOUR_HEIGHT_PX;

                  let durationMinutes = 60;
                  if (event.timeEnd) {
                    const [hE, mE] = event.timeEnd.split(':');
                    const endMinutes = parseInt(hE, 10) * 60 + parseInt(mE || '0', 10);
                    durationMinutes = Math.max(endMinutes - startMinutes, 20);
                  }
                  const heightPx = (durationMinutes / 60) * HOUR_HEIGHT_PX;

                  let cardBg = '';
                  const pColor = priorityColors[event.priority];
                  if (event.completed) {
                    cardBg =
                      'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800/40 dark:border-gray-600 dark:text-gray-500 line-through';
                  } else if (event.isFinancialEvent === 'income') {
                    cardBg =
                      'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-600 dark:text-emerald-300';
                  } else if (event.isFinancialEvent === 'expense') {
                    cardBg =
                      'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-900/30 dark:border-rose-600 dark:text-rose-300';
                  } else if (event.isDeadlineEvent) {
                    cardBg =
                      'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-300';
                  } else if (pColor) {
                    cardBg = `${pColor.bg} ${pColor.text} border-current/30`;
                  } else {
                    cardBg = 'bg-primary/10 border-primary/30 text-primary';
                  }

                  return (
                    <div
                      key={event.id}
                      className={`absolute z-10 rounded-md border-l-[3px] px-1.5 py-0.5 text-left overflow-hidden cursor-pointer hover:shadow-md transition-shadow group/card ${cardBg}`}
                      style={{
                        top: `${topPx}px`,
                        height: `${Math.max(heightPx, 24)}px`,
                        left: '2px',
                        right: '2px',
                        pointerEvents: 'auto',
                      }}
                      onClick={() => onEventView(event)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onEventView(event);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-start justify-between gap-0.5">
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold truncate leading-tight">
                            {event.title}
                          </div>
                          {heightPx > 28 && (
                            <div className="text-[9px] opacity-75 truncate">
                              {event.time}
                              {event.timeEnd ? ` – ${event.timeEnd}` : ''}
                            </div>
                          )}
                        </div>
                        {!event.isDeadlineEvent && !event.isFinancialEvent && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                              aria-label="Editar evento"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventEdit(event);
                              }}
                            >
                              <EditIcon className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              className={`p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 ${
                                event.completed ? 'text-emerald-500' : ''
                              }`}
                              aria-label={
                                event.completed ? 'Marcar como pendente' : 'Marcar como concluída'
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleCompleted(event.id);
                              }}
                            >
                              <CheckCircleIcon className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WeeklyTimeGrid;
