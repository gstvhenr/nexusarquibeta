import {
  CheckCircleIcon,
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  PencilIcon,
  TikTokIcon,
  TrashIcon,
  XIcon as XSocialIcon,
  Button,
} from '../../components/ui';
import type { MarketingActivity, MarketingContentType } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

type ContentTypeIconProps = {
  type: MarketingContentType;
  className?: string;
};

function ContentTypeIcon({ type, className = 'w-5 h-5' }: ContentTypeIconProps): JSX.Element {
  const lowerCaseType = type.toLowerCase();

  if (lowerCaseType.includes('instagram')) return <InstagramIcon className={className} />;
  if (lowerCaseType.includes('facebook')) return <FacebookIcon className={className} />;
  if (lowerCaseType.includes('tik tok')) return <TikTokIcon className={className} />;
  if (lowerCaseType.includes(' x')) return <XSocialIcon className={className} />;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M15.903 5.238a.75.75 0 0 1 .84 1.22l-7.5 11.25a.75.75 0 0 1-1.286-.54V5a.75.75 0 0 1 .75-.75h.25a.75.75 0 0 1 .75.75v7.44l5.197-7.795Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type MarketingContentListViewProps = {
  activities: MarketingActivity[];
  onToggleActivityStatus: (id: string) => void;
  onEditActivity: (activity: MarketingActivity) => void;
  onDeleteActivity: (activity: MarketingActivity) => void;
};

export function MarketingContentListView({
  activities,
  onToggleActivityStatus,
  onEditActivity,
  onDeleteActivity,
}: MarketingContentListViewProps): JSX.Element {
  const sortedActivities = [...activities].sort((first, second) => {
    const firstDate = first.dueDate ? new Date(first.dueDate).getTime() : 0;
    const secondDate = second.dueDate ? new Date(second.dueDate).getTime() : 0;
    return secondDate - firstDate;
  });

  return (
    <div className="p-6">
      <div className="bg-surface rounded-xl shadow-soft overflow-hidden border border-border-color/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background/50 text-xs font-semibold text-text-secondary uppercase border-b border-border-color">
              <tr>
                <th className="px-6 py-4 w-12 text-center">Status</th>
                <th className="px-6 py-4">Data e Hora</th>
                <th className="px-6 py-4">Conteúdo</th>
                <th className="px-6 py-4">Custo</th>
                <th className="px-6 py-4">Observações</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/50">
              {sortedActivities.map((activity) => (
                <tr
                  key={activity.id}
                  className={`hover:bg-background/30 transition-colors ${activity.status === 'Concluído' ? 'opacity-60' : ''}`}
                >
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => onToggleActivityStatus(activity.id)}
                      className={`!p-1 !min-h-0 !min-w-0 rounded-full border-2 transition-all ${activity.status === 'Concluído' ? '!bg-success !border-success text-white' : 'bg-transparent border-border-color text-transparent hover:border-success hover:bg-transparent'}`}
                      title={
                        activity.status === 'Concluído'
                          ? 'Marcar como Pendente'
                          : 'Confirmar Realização'
                      }
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </Button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary flex items-center gap-2">
                      {formatDate(activity.dueDate)}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {activity.dueDate
                        ? new Date(activity.dueDate).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--:--'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ContentTypeIcon
                        type={activity.contentType}
                        className="w-4 h-4 text-secondary"
                      />
                      <span className="font-bold text-text-primary">{activity.title}</span>
                    </div>
                    <div className="text-xs text-text-secondary">
                      {activity.contentType}
                      {activity.linkedProjectName ? ` • ${activity.linkedProjectName}` : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-text-primary">
                    {activity.cost && activity.cost > 0 ? formatCurrency(activity.cost) : '-'}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p
                      className="text-xs text-text-secondary truncate"
                      title={activity.notes || activity.description}
                    >
                      {activity.notes || activity.description || '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => onEditActivity(activity)}
                        className="!p-1.5 !min-h-0 !min-w-0 text-text-secondary hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => onDeleteActivity(activity)}
                        className="!p-1.5 !min-h-0 !min-w-0 text-text-secondary hover:text-error rounded-full hover:bg-error/10 transition-colors"
                        title="Excluir"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedActivities.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                    Nenhum conteúdo agendado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
