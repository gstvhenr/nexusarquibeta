import { TrashIcon } from '../../ui/icons';
import { Button, IconButton, Input, Select, Textarea } from '../../ui';
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
          <Select
            value={newMeeting.projectId || ''}
            onChange={(e) => {
              const val = e.target.value;
              onNewMeetingChange((meeting) => ({ ...meeting, projectId: val }));
            }}
            options={[
              { value: '', label: 'Vincular Projeto (Opcional)' },
              ...clientProjects.map((project) => ({ value: project.id, label: project.name })),
            ]}
            className={commonInputClass}
            aria-label="Projeto da reunião"
          />
          <Input
            type="date"
            value={newMeeting.date}
            onChange={(e) => {
              const val = e.target.value;
              onNewMeetingChange((meeting) => ({ ...meeting, date: val }));
            }}
            className={commonInputClass}
            aria-label="Data da reunião"
          />
          <Input
            type="text"
            placeholder="Motivo da Reunião"
            value={newMeeting.reason || ''}
            onChange={(e) => {
              const val = e.target.value;
              onNewMeetingChange((meeting) => ({ ...meeting, reason: val }));
            }}
            className={commonInputClass}
            aria-label="Motivo da reunião"
          />
        </div>
        <Textarea
          value={newMeeting.notes || ''}
          onChange={(e) => {
            const val = e.target.value;
            onNewMeetingChange((meeting) => ({ ...meeting, notes: val }));
          }}
          rows={3}
          placeholder="Descreva o que foi discutido..."
          className={commonInputClass}
          aria-label="Anotações da reunião"
        />
        <div className="text-right">
          <Button variant="secondary" onClick={onAddMeeting}>
            Adicionar
          </Button>
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
