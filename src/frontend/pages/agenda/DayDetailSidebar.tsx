import React from 'react';
import type { AgendaEvent } from '../../types';
import { ClockIcon, EditIcon, IconButton, TrashIcon } from '../../components/ui';
import { MONTHS, priorityColors } from './agendaConstants';

interface DayDetailSidebarProps {
  selectedDate: Date;
  selectedDateEvents: AgendaEvent[];
  agendaEvents: AgendaEvent[];
  onEventView: (event: AgendaEvent) => void;
  onEventEdit: (event: AgendaEvent) => void;
  onEventDelete: (event: AgendaEvent) => void;
}

function DayDetailSidebar({
  selectedDate,
  selectedDateEvents,
  agendaEvents,
  onEventView,
  onEventEdit,
  onEventDelete,
}: DayDetailSidebarProps) {
  return (
    <div className="w-full lg:w-[24rem] bg-surface rounded-2xl shadow-soft p-6 flex flex-col border border-border-color/50 h-full min-h-0 overflow-hidden shrink-0">
      <div className="shrink-0 mb-6">
        <h3 className="font-serif text-xl font-bold text-secondary mb-1">
          {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
        </h3>
        <p className="text-text-secondary text-sm capitalize">
          {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2 custom-scrollbar min-h-0">
        {selectedDateEvents.length > 0 ? (
          selectedDateEvents.map((event) => {
            const isEditableEvent = agendaEvents.some((savedEvent) => savedEvent.id === event.id);
            return (
              <div
                key={event.id}
                onClick={() => {
                  if (isEditableEvent) {
                    onEventView(event);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isEditableEvent) {
                      onEventView(event);
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
                  {isEditableEvent && (
                    <div className="flex gap-1 transition-opacity">
                      <IconButton
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventEdit(event);
                        }}
                        aria-label="Editar evento"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </IconButton>
                      <IconButton
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventDelete(event);
                        }}
                        aria-label="Excluir evento"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </IconButton>
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
  );
}

export default DayDetailSidebar;
