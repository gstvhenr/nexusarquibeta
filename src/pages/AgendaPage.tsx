import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

type CalendarViewMode = 'monthly' | 'weekly';
import { useSystemData } from '../context/DataContext';
import { PageHeader } from '../components/layout';
import { NAV_LINKS } from '../constants';
import {
  PlusIcon,
  ChevronDownIcon,
  ClockIcon,
  TrashIcon,
  EditIcon,
  CheckCircleIcon,
} from '../components/ui';
import { agendaService } from '../services/agendaService';
import { AgendaEvent } from '../types';
import { EventFormModal, SubtaskDetailModal } from '../components/agenda';
import { DeleteConfirmationModal } from '../components/ui';
import { useUnifiedEvents } from '../hooks/useUnifiedEvents';
import useLocalStorage from '../hooks/useLocalStorage';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT_PX = 56;

const DEFAULT_CELL_HEIGHT_REM = 5;
const CELL_HEIGHT_STORAGE_KEY = 'nexus-agenda-cell-height-scale';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const priorityColors: Record<number, { bg: string; text: string; name: string; dotClass: string }> =
  {
    1: {
      bg: 'bg-sky-100 dark:bg-sky-900/40',
      text: 'text-sky-800 dark:text-sky-300',
      name: 'Opcional',
      dotClass: 'priority-swatch-1',
    },
    2: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/40',
      text: 'text-emerald-800 dark:text-emerald-300',
      name: 'Baixa',
      dotClass: 'priority-swatch-2',
    },
    3: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/40',
      text: 'text-yellow-800 dark:text-yellow-300',
      name: 'Moderada',
      dotClass: 'priority-swatch-3',
    },
    4: {
      bg: 'bg-orange-100 dark:bg-orange-900/40',
      text: 'text-orange-800 dark:text-orange-300',
      name: 'Alta',
      dotClass: 'priority-swatch-4',
    },
    5: {
      bg: 'bg-red-100 dark:bg-red-900/40',
      text: 'text-red-800 dark:text-red-300',
      name: 'Crítica',
      dotClass: 'priority-swatch-5',
    },
  };

const AgendaPage: () => React.ReactNode = () => {
  const systemData = useSystemData();
  const { agendaEvents, setAgendaEvents } = systemData;

  const unifiedEvents = useUnifiedEvents();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [cellHeightScale, setCellHeightScale] = useLocalStorage<number>(CELL_HEIGHT_STORAGE_KEY, 1);
  const normalizedCellHeightScale = Math.min(1.5, Math.max(0.5, cellHeightScale));

  const handleCellHeightChange = useCallback(
    (scale: number) => {
      setCellHeightScale(Math.min(1.5, Math.max(0.5, scale)));
    },
    [setCellHeightScale],
  );

  const weekGridRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current hour when entering weekly view
  useEffect(() => {
    if (viewMode === 'weekly' && weekGridRef.current) {
      const now = new Date();
      const scrollTarget = Math.max((now.getHours() - 1) * HOUR_HEIGHT_PX, 0);
      weekGridRef.current.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  }, [viewMode]);

  // Modals
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<AgendaEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<AgendaEvent | null>(null);
  const [eventToView, setEventToView] = useState<AgendaEvent | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  }, [currentDate]);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleMonthChange = (offset: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  const handleWeekChange = (offset: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + offset * 7);
      return newDate;
    });
  };

  const weeklyGrid = useMemo(() => {
    const dayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, idx) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + idx);
      return day;
    });
  }, [currentDate]);

  const calendarHeaderLabel = useMemo(() => {
    if (viewMode === 'monthly') {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    const weekStart = weeklyGrid[0];
    const weekEnd = weeklyGrid[6];
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${weekStart.getDate()} – ${weekEnd.getDate()} de ${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
    }
    return `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()].slice(0, 3)} – ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()].slice(0, 3)} ${weekEnd.getFullYear()}`;
  }, [viewMode, currentDate, weeklyGrid]);

  const handleSaveEvent = (event: AgendaEvent) => {
    setAgendaEvents((prev) => {
      const exists = prev.some((e) => e.id === event.id);
      if (exists) return prev.map((e) => (e.id === event.id ? event : e));
      return [...prev, event];
    });
    setEventModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (eventToDelete) {
      setAgendaEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const renderDayCell = useCallback(
    (date: Date) => {
      const dayEvents = agendaService.getEventsForDay(date, unifiedEvents);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Date comparison logic
      const dateTimestamp = new Date(date);
      dateTimestamp.setHours(0, 0, 0, 0);
      const isToday = dateTimestamp.getTime() === today.getTime();
      const isPast = dateTimestamp.getTime() < today.getTime();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      const dayKey = date.toISOString().split('T')[0];
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
              let dotClass = 'bg-gray-300';
              if (p === 'deadline') dotClass = 'bg-purple-500';
              else if (p === 'income') dotClass = 'bg-emerald-400';
              else if (p === 'expense') dotClass = 'bg-rose-400';
              else if (typeof p === 'number') dotClass = priorityColors[p]?.dotClass || dotClass;
              return <div key={i} className={`w-2 h-2 rounded-full ${dotClass}`} />;
            })}
        </div>
      );

      // Base styling
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
        bgClass = 'bg-amber-50/60 dark:bg-amber-950/25';
        textClass = 'text-text-secondary';
      }

      // Weekend tint (both monthly and weekly)
      if (isWeekend && !isSelected && !isDifferentMonth) {
        bgClass = isPast
          ? 'bg-gray-100/60 dark:bg-gray-800/25'
          : 'bg-gray-100/60 dark:bg-gray-800/30';
        textClass = 'text-text-secondary';
      }

      return (
        <div
          key={dayKey}
          onClick={() => handleDateClick(date)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleDateClick(date);
            }
          }}
          role="button"
          tabIndex={0}
          className={`
                    relative rounded-xl flex flex-col p-2 cursor-pointer transition-all duration-200 ease-in-out group
                    ${bgClass} ${borderClass}
                `}
          style={{ minHeight: `${DEFAULT_CELL_HEIGHT_REM * normalizedCellHeightScale}rem` }}
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
    [unifiedEvents, selectedDate, currentDate, handleDateClick, normalizedCellHeightScale],
  );

  const calendarGrid = useMemo(() => {
    const { days, firstDay } = daysInMonth;
    const totalSlots = Math.ceil((days + firstDay) / 7) * 7;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const previousMonthGrid = Array.from({ length: firstDay }, (_, idx) => {
      const day = prevMonthDays - firstDay + idx + 1;
      return new Date(year, month - 1, day);
    });
    const currentMonthGrid = Array.from(
      { length: days },
      (_, idx) => new Date(year, month, idx + 1),
    );
    const remainingSlots = totalSlots - previousMonthGrid.length - currentMonthGrid.length;
    const nextMonthGrid = Array.from(
      { length: remainingSlots },
      (_, idx) => new Date(year, month + 1, idx + 1),
    );

    return [...previousMonthGrid, ...currentMonthGrid, ...nextMonthGrid];
  }, [daysInMonth, currentDate]);

  const selectedDateEvents = useMemo(
    () =>
      agendaService
        .getEventsForDay(selectedDate, unifiedEvents)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [selectedDate, unifiedEvents],
  );

  const agendaIcon = NAV_LINKS.find((link) => link.label === 'Agenda')?.children?.find(
    (c) => c.label === 'Calendário',
  )?.icon;

  return (
    <div className="animate-fade-in-up flex flex-col h-full max-h-full px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6 overflow-hidden">
      <PageHeader title="Calendário" icon={agendaIcon}>
        {viewMode === 'monthly' && (
          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-surface/80 border border-border-color/30 shadow-soft">
            <span className="text-xs text-text-secondary select-none">Altura</span>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={normalizedCellHeightScale}
              onChange={(e) => handleCellHeightChange(parseFloat(e.target.value))}
              className="w-20 h-1 accent-primary cursor-pointer"
              aria-label="Altura das células do calendário"
            />
            <span className="text-xs text-text-secondary tabular-nums select-none w-6">
              {normalizedCellHeightScale.toFixed(1)}x
            </span>
          </div>
        )}
        <button
          onClick={() => {
            setEventToEdit(null);
            setEventModalOpen(true);
          }}
          className="px-5 h-9 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center gap-2 transition-colors text-sm"
        >
          <PlusIcon className="w-5 h-5" /> Novo Evento
        </button>
      </PageHeader>

      {/* Main Layout Container - Strict Height Constraints */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Calendar Side */}
        <div className="flex-1 bg-surface rounded-2xl shadow-soft p-6 flex flex-col border border-border-color/50 h-full min-h-0 overflow-hidden">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-2xl font-serif font-bold text-secondary capitalize">
              {calendarHeaderLabel}
            </h2>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-border-color overflow-hidden">
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    viewMode === 'monthly'
                      ? 'bg-primary text-primary-content'
                      : 'bg-surface text-text-secondary hover:bg-background'
                  }`}
                >
                  Mês
                </button>
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    viewMode === 'weekly'
                      ? 'bg-primary text-primary-content'
                      : 'bg-surface text-text-secondary hover:bg-background'
                  }`}
                >
                  Semana
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    viewMode === 'monthly' ? handleMonthChange(-1) : handleWeekChange(-1)
                  }
                  className="p-2 rounded-lg hover:bg-background border border-border-color"
                  aria-label={viewMode === 'monthly' ? 'Mês anterior' : 'Semana anterior'}
                >
                  <ChevronDownIcon className="w-5 h-5 rotate-90" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 rounded-lg hover:bg-background border border-border-color text-sm font-semibold"
                >
                  Hoje
                </button>
                <button
                  onClick={() =>
                    viewMode === 'monthly' ? handleMonthChange(1) : handleWeekChange(1)
                  }
                  className="p-2 rounded-lg hover:bg-background border border-border-color"
                  aria-label={viewMode === 'monthly' ? 'Próximo mês' : 'Próxima semana'}
                >
                  <ChevronDownIcon className="w-5 h-5 -rotate-90" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'monthly' ? (
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
                {calendarGrid.map((date, _idx) => renderDayCell(date))}
              </div>
            </>
          ) : (
            /* ─── Weekly Time-Grid ─── */
            <div className="flex flex-col flex-1 min-h-0">
              {/* Scrollable time-grid body (header+grid share same scroll context for aligned columns) */}
              <div
                ref={weekGridRef}
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar"
              >
                {/* Day column headers — sticky inside scroll container */}
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
                  {/* Hour rows — label + 7 column cells */}
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

                          let cellBg = ''; // future weekday = white (default)
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

                  {/* Current time indicator — full width red line */}
                  {(() => {
                    const now = new Date();
                    const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
                    const topPx = (minutesSinceMidnight / 60) * HOUR_HEIGHT_PX;
                    const todayIndex = weeklyGrid.findIndex(
                      (d) => d.toDateString() === now.toDateString(),
                    );
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
                        {/* Full-width subtle line */}
                        <div className="absolute inset-x-0 h-[1px] bg-red-400/30" />
                        {/* Stronger line on today's column */}
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

                  {/* Event cards — per column */}
                  {weeklyGrid.map((date, colIdx) => {
                    const dayEvents = agendaService.getEventsForDay(date, unifiedEvents);
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
                              onClick={() => {
                                setEventToView(event);
                                setDetailModalOpen(true);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setEventToView(event);
                                  setDetailModalOpen(true);
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
                                {/* Action icons — always visible */}
                                {!event.isDeadlineEvent && !event.isFinancialEvent && (
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                      type="button"
                                      className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                                      aria-label="Editar evento"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEventToEdit(event);
                                        setEventModalOpen(true);
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
                                        event.completed
                                          ? 'Marcar como pendente'
                                          : 'Marcar como concluída'
                                      }
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAgendaEvents((prev) =>
                                          prev.map((ev) =>
                                            ev.id === event.id
                                              ? { ...ev, completed: !ev.completed }
                                              : ev,
                                          ),
                                        );
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
          )}
        </div>

        {/* Day Detail Side - Sidebar (hidden in weekly mode) */}
        {viewMode === 'monthly' && (
          <div className="w-full lg:w-[24rem] bg-surface rounded-2xl shadow-soft p-6 flex flex-col border border-border-color/50 h-full min-h-0 overflow-hidden shrink-0">
            <div className="shrink-0 mb-6">
              <h3 className="font-serif text-xl font-bold text-secondary mb-1">
                {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
              </h3>
              <p className="text-text-secondary text-sm capitalize">
                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
              </p>
            </div>

            {/* Scrollable list container: flex-1 takes space, min-h-0 allows shrinking, overflow-y-auto puts scrollbar HERE */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2 custom-scrollbar min-h-0">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => {
                  const isEditableEvent = agendaEvents.some(
                    (savedEvent) => savedEvent.id === event.id,
                  );
                  return (
                    <div
                      key={event.id}
                      onClick={() => {
                        if (isEditableEvent) {
                          setEventToView(event);
                          setDetailModalOpen(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (isEditableEvent) {
                            setEventToView(event);
                            setDetailModalOpen(true);
                          }
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`
                                        p-4 rounded-xl border border-border-color/60 bg-background/50 transition-colors group shadow-sm
                                        ${isEditableEvent ? 'hover:bg-background cursor-pointer' : 'cursor-default'}
                                        ${event.isDeadlineEvent ? 'border-l-4 border-l-purple-500' : ''}
                                    `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${event.priority ? priorityColors[event.priority].bg + ' ' + priorityColors[event.priority].text : 'bg-gray-100 text-gray-600'}`}
                        >
                          {event.time}
                        </span>
                        {/* Action buttons (Edit/Delete) only for persisted manual events */}
                        {isEditableEvent && (
                          <div className="flex gap-1 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEventToEdit(event);
                                setEventModalOpen(true);
                              }}
                              className="p-1 text-text-secondary hover:text-primary"
                              aria-label="Editar evento"
                            >
                              <EditIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEventToDelete(event);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1 text-text-secondary hover:text-error"
                              aria-label="Excluir evento"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {event.isDeadlineEvent && (
                          <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Prazo do Projeto
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-text-primary text-sm mb-1">{event.title}</h4>
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {event.description}
                      </p>
                      {event.clientName && (
                        <div className="mt-2 text-[10px] font-medium text-primary bg-primary/5 px-2 py-1 rounded inline-block border border-primary/10">
                          {event.clientName}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-text-secondary">
                  <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Sem eventos para este dia.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={() => eventToEdit && setDeleteModalOpen(true)}
        event={eventToEdit}
        dateForNewEvent={selectedDate}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteEvent}
        itemName={eventToDelete?.title || ''}
        itemType="Evento"
      />

      <SubtaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        task={eventToView}
        onUpdate={(updated) => {
          setAgendaEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
          setEventToView(updated);
        }}
      />
    </div>
  );
};

export default AgendaPage;
