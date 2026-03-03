import { TrashIcon } from '../../ui/icons';
import { IconButton } from '../../ui';
import { formatDateWithTime } from '@/utils/formatters';
import type { ClientFormMeetingsTabProps } from './types';

export const ClientFormMeetingsTab = ({
  meetings,
  isReadOnly,
  commonInputClass,
  clientProjects,
  newMeeting,
  onNewMeetingChange,
  onAddMeeting,
  onDeleteMeeting,
}: ClientFormMeetingsTabProps) => (
  <div className="space-y-6">
    {!isReadOnly && (
      <div className="bg-background/50 p-4 rounded-lg space-y-3">
        <h4 className="font-semibold text-text-primary">Registrar Nova Reunião</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={newMeeting.projectId || ''}
            onChange={(e) =>
              onNewMeetingChange((meeting) => ({ ...meeting, projectId: e.target.value }))
            }
            className={commonInputClass}
            aria-label="Projeto da reunião"
          >
            <option value="">Vincular Projeto (Opcional)</option>
            {clientProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={newMeeting.date}
            onChange={(e) =>
              onNewMeetingChange((meeting) => ({ ...meeting, date: e.target.value }))
            }
            className={commonInputClass}
            aria-label="Data da reunião"
          />
          <input
            type="text"
            placeholder="Motivo da Reunião"
            value={newMeeting.reason || ''}
            onChange={(e) =>
              onNewMeetingChange((meeting) => ({ ...meeting, reason: e.target.value }))
            }
            className={commonInputClass}
            aria-label="Motivo da reunião"
          />
        </div>
        <textarea
          value={newMeeting.notes || ''}
          onChange={(e) => onNewMeetingChange((meeting) => ({ ...meeting, notes: e.target.value }))}
          rows={3}
          placeholder="Descreva o que foi discutido..."
          className={commonInputClass}
          aria-label="Anotações da reunião"
        ></textarea>
        <div className="text-right">
          <button
            type="button"
            onClick={onAddMeeting}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-secondary text-secondary-content hover:bg-secondary-focus"
          >
            Adicionar
          </button>
        </div>
      </div>
    )}

    <div className="space-y-3">
      <h4 className="font-semibold text-text-secondary">Histórico de Reuniões</h4>
      {(meetings || [])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((meeting) => (
          <div
            key={meeting.id}
            className="bg-background p-3 rounded-lg flex justify-between items-start"
          >
            <div className="flex-1">
              <div className="flex items-baseline gap-4">
                <p className="text-xs text-text-secondary font-semibold">
                  {formatDateWithTime(meeting.date)}
                </p>
                {meeting.projectName && (
                  <p className="text-xs font-bold text-primary">{meeting.projectName}</p>
                )}
              </div>
              <p className="font-semibold text-text-primary mt-1">{meeting.reason}</p>
              <p className="text-sm whitespace-pre-wrap mt-1">{meeting.notes}</p>
            </div>
            {!isReadOnly && (
              <IconButton
                variant="danger"
                size="sm"
                onClick={() => onDeleteMeeting(meeting.id)}
                aria-label="Remover reunião"
              >
                <TrashIcon className="w-4 h-4" />
              </IconButton>
            )}
          </div>
        ))}
    </div>
  </div>
);
