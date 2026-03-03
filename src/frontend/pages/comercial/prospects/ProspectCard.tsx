import { useState } from 'react';
import {
  ArchiveIcon,
  Badge,
  CheckCircleIcon,
  ClockIcon,
  EditIcon,
  EyeIcon,
  IconButton,
  MailIcon,
  PhoneIcon,
  RadarIcon,
  TagIcon,
  TrashIcon,
  UnarchiveIcon,
  XCircleIcon,
} from '@/components/ui';
import type { Prospect, ProspectPriority, ProspectStatus } from '@/types';
import { getDaysRemaining } from '@/utils/prospectUtils';
import type { ProspectAction } from './types';

const PRIORITY_BADGE_VARIANT: Record<ProspectPriority, 'danger' | 'warning' | 'info'> = {
  Alta: 'danger',
  Média: 'warning',
  Baixa: 'info',
};

const PRIORITY_BADGE_CLASS: Record<ProspectPriority, string> = {
  Alta: 'ring-1 ring-error/20',
  Média: 'ring-1 ring-warning/20',
  Baixa: 'ring-1 ring-info/20',
};

const STATUS_BADGE_VARIANT: Record<ProspectStatus, 'info' | 'success' | 'default'> = {
  'Em Aberto': 'info',
  Convertido: 'success',
  Perdido: 'default',
};

const STATUS_BADGE_CLASS: Record<ProspectStatus, string> = {
  'Em Aberto': 'ring-1 ring-info/20',
  Convertido: 'ring-1 ring-success/20',
  Perdido: 'ring-1 ring-border-color',
};

const PROGRESS_GRADIENT: Record<'critical' | 'warning' | 'healthy', string> = {
  critical: 'from-error to-error/70',
  warning: 'from-warning to-warning/70',
  healthy: 'from-success to-success/70',
};

function getProgressGradient(daysRemaining: number): string {
  if (daysRemaining <= 3) return PROGRESS_GRADIENT.critical;
  if (daysRemaining <= 7) return PROGRESS_GRADIENT.warning;
  return PROGRESS_GRADIENT.healthy;
}

type ProspectCardProps = {
  prospect: Prospect;
  onEdit: (prospect: Prospect) => void;
  onDelete: (prospect: Prospect) => void;
  onAction: (id: string, action: ProspectAction) => void;
};

export function ProspectCard({
  prospect,
  onEdit,
  onDelete,
  onAction,
}: ProspectCardProps): JSX.Element {
  const [showDetails, setShowDetails] = useState(false);
  const daysRemaining = getDaysRemaining(prospect.startDate, prospect.followUpDays);
  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / prospect.followUpDays) * 100));
  const isExpired = daysRemaining < 0;
  const dimmed = prospect.status === 'Convertido' || prospect.status === 'Perdido';

  const initial = prospect.name.charAt(0).toUpperCase();
  const avatarColors = {
    Alta: 'from-red-500 to-rose-600',
    Média: 'from-amber-400 to-orange-500',
    Baixa: 'from-sky-400 to-blue-500',
  };
  const avatarGradient = avatarColors[prospect.priority] || 'from-gray-400 to-gray-500';

  return (
    <div
      className={`
        group relative bg-surface rounded-xl border border-border-color/40
        shadow-sm hover:shadow-lifted hover:border-border-color/70
        transition-all duration-300 ease-out
        overflow-hidden
        ${dimmed ? 'opacity-60 saturate-[0.3]' : ''}
      `}
    >
      <div className="flex">
        <div
          className={`w-1 shrink-0 bg-gradient-to-b ${
            prospect.priority === 'Alta'
              ? 'from-red-500 to-rose-400'
              : prospect.priority === 'Média'
                ? 'from-amber-400 to-orange-400'
                : 'from-sky-400 to-blue-400'
          }`}
        />

        <div className="flex-1 p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 md:w-[280px] md:shrink-0">
              <div
                className={`
                  w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradient}
                  flex items-center justify-center shrink-0
                  text-white font-bold text-sm shadow-sm
                  group-hover:scale-105 transition-transform duration-300
                `}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-text-primary truncate leading-tight">
                  {prospect.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge
                    variant={STATUS_BADGE_VARIANT[prospect.status]}
                    className={STATUS_BADGE_CLASS[prospect.status]}
                  >
                    {prospect.status}
                  </Badge>
                  <Badge
                    variant={PRIORITY_BADGE_VARIANT[prospect.priority]}
                    className={PRIORITY_BADGE_CLASS[prospect.priority]}
                  >
                    {prospect.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap md:w-[180px] md:shrink-0">
              <Badge variant="default" className="font-medium">
                <TagIcon className="w-3 h-3 opacity-50" />
                {prospect.origin}
              </Badge>
              <Badge variant="default" className="font-medium">
                {prospect.interest}
              </Badge>
            </div>

            {/* Right-aligned group: Radar + Visualizar dados + Actions */}
            <div className="flex items-center gap-3 ml-auto shrink-0">
              <div className="w-[160px] shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <RadarIcon
                      className={`w-3.5 h-3.5 ${isExpired ? 'text-error animate-pulse' : 'text-text-secondary/50'}`}
                    />
                    <span className="text-xs font-medium text-text-secondary">Radar</span>
                  </div>
                  <span
                    className={`text-xs font-bold tabular-nums ${isExpired ? 'text-error' : daysRemaining <= 3 ? 'text-warning' : 'text-text-secondary'}`}
                  >
                    {prospect.status === 'Em Aberto'
                      ? isExpired
                        ? `${Math.abs(daysRemaining)}d atr.`
                        : `${daysRemaining}d`
                      : '—'}
                  </span>
                </div>
                <div className="w-full bg-border-color/20 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${prospect.status === 'Em Aberto' ? getProgressGradient(daysRemaining) : 'from-gray-300 to-gray-300'}`}
                    style={{ width: `${prospect.status === 'Em Aberto' ? progressPercent : 0}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className={`p-1.5 rounded-lg transition-all duration-200 shrink-0 ${
                  showDetails
                    ? 'text-primary bg-primary/10'
                    : 'text-text-secondary/40 hover:text-primary hover:bg-primary/10'
                }`}
                aria-label="Visualizar dados cadastrais"
                title="Visualizar dados cadastrais"
              >
                <EyeIcon className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                {prospect.status === 'Em Aberto' ? (
                  <>
                    <IconButton
                      variant="primary"
                      size="sm"
                      onClick={() => onAction(prospect.id, 'renew')}
                      aria-label="Renovar"
                      title="+15 dias"
                    >
                      <ClockIcon className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                      variant="default"
                      size="sm"
                      onClick={() => onAction(prospect.id, 'convert')}
                      aria-label="Converter para cliente"
                      title="Converter para cliente"
                      className="hover:text-success hover:bg-success/10"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </IconButton>
                    <IconButton
                      variant="danger"
                      size="sm"
                      onClick={() => onAction(prospect.id, 'lost')}
                      aria-label="Marcar como perdido"
                      title="Marcar como perdido"
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </IconButton>
                  </>
                ) : (
                  <button
                    onClick={() => onAction(prospect.id, 'archive')}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5
                  text-xs font-semibold text-text-secondary
                  bg-background hover:bg-primary/10 hover:text-primary
                  rounded-lg transition-all duration-200"
                    title={prospect.archived ? 'Desarquivar' : 'Arquivar'}
                  >
                    {prospect.archived ? (
                      <>
                        <UnarchiveIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Desarquivar</span>
                      </>
                    ) : (
                      <>
                        <ArchiveIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Arquivar</span>
                      </>
                    )}
                  </button>
                )}

                <div className="flex items-center gap-0.5 ml-1 pl-1.5 border-l border-border-color/30">
                  <IconButton
                    variant="primary"
                    size="sm"
                    onClick={() => onEdit(prospect)}
                    aria-label="Editar"
                    title="Editar"
                  >
                    <EditIcon className="w-4 h-4" />
                  </IconButton>
                  <IconButton
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(prospect)}
                    aria-label="Excluir"
                    title="Excluir"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border-color/30 text-sm text-text-secondary animate-fade-in-up">
              {prospect.phone ? (
                <div className="flex items-center gap-1.5">
                  <PhoneIcon className="w-3.5 h-3.5 text-text-secondary/40 shrink-0" />
                  <span>{prospect.phone}</span>
                  {prospect.hasWhatsApp && (
                    <span className="text-xs text-success font-medium">WA</span>
                  )}
                </div>
              ) : null}
              {prospect.email ? (
                <div className="flex items-center gap-1.5">
                  <MailIcon className="w-3.5 h-3.5 text-text-secondary/40 shrink-0" />
                  <span>{prospect.email}</span>
                </div>
              ) : null}
              {!prospect.phone && !prospect.email && (
                <span className="text-xs text-text-secondary/50 italic">
                  Nenhum dado cadastral registrado.
                </span>
              )}
            </div>
          )}

          {prospect.notes && (
            <p
              className="text-sm text-text-secondary/60 italic line-clamp-1 mt-2 leading-relaxed"
              title={prospect.notes}
            >
              "{prospect.notes}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
