import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/layout';
import { NAV_LINKS } from '../constants';
import { PlusIcon, ChevronDownIcon, ClockIcon, TrashIcon, EditIcon } from '../components/ui';
import { agendaService } from '../services/agendaService';
import { AgendaEvent } from '../types';
import { EventFormModal } from '../components/agenda';
import { DeleteConfirmationModal } from '../components/ui';
import { formatDateDayMonth } from '../utils/formatters';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
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

const AgendaPage: React.FC = () => {
  const allData = useData();
  const { agendaEvents, setAgendaEvents } = allData;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modals
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<AgendaEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<AgendaEvent | null>(null);

  const unifiedEvents = useMemo(() => agendaService.getUnifiedEvents(allData), [allData]);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  }, [currentDate]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (offset: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

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

  const renderDayCell = (date: Date) => {
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
              e.isFinancialEvent ? e.isFinancialEvent : e.isDeadlineEvent ? 'deadline' : e.priority,
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
    let bgClass = 'bg-surface';
    let borderClass = 'border border-border-color/60 hover:border-primary/50';
    let textClass = 'text-text-primary';

    if (isDifferentMonth) {
      bgClass = 'bg-background/40 opacity-50';
    } else if (isSelected) {
      bgClass = 'bg-primary/5 z-10 shadow-md transform scale-[1.02]';
      borderClass = 'border-2 border-primary';
    } else if (isToday) {
      bgClass = 'bg-primary/5'; // Subtle light background for today
      borderClass = 'border border-primary/30';
    } else if (isPast) {
      bgClass = 'bg-gray-50 dark:bg-white/5'; // Subtle gray for past
      textClass = 'text-text-secondary';
    }

    return (
      <div
        key={dayKey}
        onClick={() => handleDateClick(date)}
        className={`
                    relative rounded-xl flex flex-col p-2 cursor-pointer transition-all duration-200 ease-in-out group min-h-[5rem]
                    ${bgClass} ${borderClass}
                `}
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
  };

  const calendarGrid = useMemo(() => {
    const { days, firstDay } = daysInMonth;
    const totalSlots = Math.ceil((days + firstDay) / 7) * 7;
    const grid = [];

    // Previous Month Days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      grid.push(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i));
    }

    // Current Month Days
    for (let i = 1; i <= days; i++) {
      grid.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    // Next Month Days
    const remainingSlots = totalSlots - grid.length;
    for (let i = 1; i <= remainingSlots; i++) {
      grid.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i));
    }

    return grid;
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
    <div className="animate-fade-in-up flex flex-col h-full max-h-full p-4 md:p-6 lg:p-10 overflow-hidden">
      <PageHeader title="Calendário" icon={agendaIcon}>
        <button
          onClick={() => {
            setEventToEdit(null);
            setEventModalOpen(true);
          }}
          className="px-5 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center gap-2 transition-colors text-sm"
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
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleMonthChange(-1)}
                className="p-2 rounded-lg hover:bg-background border border-border-color"
                aria-label="Mês anterior"
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
                onClick={() => handleMonthChange(1)}
                className="p-2 rounded-lg hover:bg-background border border-border-color"
                aria-label="Próximo mês"
              >
                <ChevronDownIcon className="w-5 h-5 -rotate-90" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2 shrink-0">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-text-secondary uppercase py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid Container: Flex-1 to take available space, overflow-y-auto to scroll internally */}
          <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 overflow-y-auto custom-scrollbar content-start">
            {calendarGrid.map((date, idx) => renderDayCell(date))}
          </div>
        </div>

        {/* Day Detail Side - Sidebar */}
        <div className="w-full lg:w-[28rem] bg-surface rounded-2xl shadow-soft p-6 flex flex-col border border-border-color/50 h-full min-h-0 overflow-hidden shrink-0">
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
                        setEventToEdit(event);
                        setEventModalOpen(true);
                      }
                    }}
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
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <p className="text-xs text-text-secondary line-clamp-2">{event.description}</p>
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
    </div>
  );
};

export default AgendaPage;
