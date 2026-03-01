import React, { useState, useMemo, useCallback } from 'react';

import { useSystemData } from '../../context/DataContext';
import { PageHeader } from '../../components/layout';
import { NAV_LINKS } from '../../constants';
import { PlusIcon, ChevronDownIcon } from '../../components/ui';
import { agendaService } from '../../services/agendaService';
import type { EventIndex } from '../../services/agendaService';
import { AgendaEvent } from '../../types';
import { EventFormModal, SubtaskDetailModal } from '../../components/agenda';
import { DeleteConfirmationModal } from '../../components/ui';
import { useUnifiedEvents } from '../../hooks/useUnifiedEvents';
import useLocalStorage from '../../hooks/useLocalStorage';

import type { CalendarViewMode } from './agendaConstants';
import { MONTHS, CELL_HEIGHT_STORAGE_KEY } from './agendaConstants';
import MonthlyCalendarGrid from './MonthlyCalendarGrid';
import WeeklyTimeGrid from './WeeklyTimeGrid';
import DayDetailSidebar from './DayDetailSidebar';

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
    setAgendaEvents((prev) => agendaService.saveEvent(prev, event));
    setEventModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (eventToDelete) {
      setAgendaEvents((prev) => agendaService.deleteEvent(prev, eventToDelete.id));
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

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

  const visibleRange = useMemo(() => {
    if (viewMode === 'monthly') {
      return { start: calendarGrid[0], end: calendarGrid[calendarGrid.length - 1] };
    }
    return { start: weeklyGrid[0], end: weeklyGrid[weeklyGrid.length - 1] };
  }, [viewMode, calendarGrid, weeklyGrid]);

  const eventIndex: EventIndex = useMemo(
    () => agendaService.buildEventIndex(unifiedEvents, visibleRange.start, visibleRange.end),
    [unifiedEvents, visibleRange],
  );

  const selectedDateEvents = useMemo(
    () =>
      agendaService
        .getEventsFromIndex(selectedDate, eventIndex)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [selectedDate, eventIndex],
  );

  const agendaIcon = NAV_LINKS.find((link) => link.label === 'Agenda')?.children?.find(
    (c) => c.label === 'Calendário',
  )?.icon;

  const handleEventView = useCallback((event: AgendaEvent) => {
    setEventToView(event);
    setDetailModalOpen(true);
  }, []);

  const handleEventEdit = useCallback((event: AgendaEvent) => {
    setEventToEdit(event);
    setEventModalOpen(true);
  }, []);

  const handleToggleCompleted = useCallback(
    (eventId: string) => {
      setAgendaEvents((prev) => agendaService.toggleEventCompleted(prev, eventId));
    },
    [setAgendaEvents],
  );

  const handleEventDeleteRequest = useCallback((event: AgendaEvent) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  }, []);

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

      {/* Main Layout Container */}
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
            <MonthlyCalendarGrid
              calendarGrid={calendarGrid}
              eventIndex={eventIndex}
              selectedDate={selectedDate}
              currentDate={currentDate}
              normalizedCellHeightScale={normalizedCellHeightScale}
              onDateClick={handleDateClick}
            />
          ) : (
            <WeeklyTimeGrid
              weeklyGrid={weeklyGrid}
              eventIndex={eventIndex}
              onEventView={handleEventView}
              onEventEdit={handleEventEdit}
              onToggleCompleted={handleToggleCompleted}
            />
          )}
        </div>

        {/* Day Detail Side - Sidebar (hidden in weekly mode) */}
        {viewMode === 'monthly' && (
          <DayDetailSidebar
            selectedDate={selectedDate}
            selectedDateEvents={selectedDateEvents}
            agendaEvents={agendaEvents}
            onEventView={handleEventView}
            onEventEdit={handleEventEdit}
            onEventDelete={handleEventDeleteRequest}
          />
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
          setAgendaEvents((prev) => agendaService.updateEvent(prev, updated));
          setEventToView(updated);
        }}
      />
    </div>
  );
};

export default AgendaPage;
