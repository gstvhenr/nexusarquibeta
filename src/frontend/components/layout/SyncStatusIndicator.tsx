import React from 'react';
import { useDriveSync } from '../../hooks/useDriveSync';
import { AlertIcon, CheckCircleIcon, UploadCloudIcon, XCircleIcon } from '../ui';

const formatLastSync = (timestamp?: number | null) => {
  if (!timestamp) return 'Nunca';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('pt-BR', {
    timeStyle: 'short',
    dateStyle: 'short',
  }).format(date);
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const SyncStatusIndicator: React.FC = () => {
  const {
    status,
    errorMessage,
    lastSyncTimestamp,
    dirtyDomains,
    dirtyPreferences,
    retryScheduledAt,
    pendingChangesCount,
    forcePull,
    quota,
  } = useDriveSync();

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (status !== 'syncing' && status !== 'offline') {
      // Opted for forcePull as a primary sync action (it pulls, then the engine merges/pushes if dirty)
      void forcePull();
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'offline':
        return {
          icon: <XCircleIcon className="h-4 w-4 text-text-disabled" aria-label="Offline" />,
          label: 'Offline',
          color: 'text-text-disabled',
        };
      case 'syncing':
        return {
          icon: (
            <UploadCloudIcon
              className="h-4 w-4 text-primary animate-spin"
              aria-label="Sincronizando..."
            />
          ),
          label: 'Sincronizando...',
          color: 'text-primary',
        };
      case 'error':
        return {
          icon: <AlertIcon className="h-4 w-4 text-danger" aria-label="Erro na sincronização" />,
          label: retryScheduledAt ? 'Erro com nova tentativa agendada' : 'Erro na Sincronização',
          color: 'text-danger',
        };
      case 'idle':
      default:
        if (dirtyDomains.length > 0 || dirtyPreferences.length > 0) {
          // Pendente para subir (aguardando debounce)
          return {
            icon: (
              <UploadCloudIcon
                className="h-4 w-4 text-warning"
                aria-label="Sincronização pendente..."
              />
            ),
            label:
              pendingChangesCount > 0
                ? `${pendingChangesCount} alteração(ões) pendente(s)`
                : 'Alterações Pendentes',
            color: 'text-warning',
          };
        }
        return {
          icon: <CheckCircleIcon className="h-4 w-4 text-success" aria-label="Sincronizado" />,
          label: 'Sincronizado',
          color: 'text-success',
        };
    }
  };

  const getQuotaDisplay = () => {
    if (!quota || quota.limitBytes === 0) return null;
    const pct = (quota.usageBytes / quota.limitBytes) * 100;
    const isDanger = pct > 90;
    const isWarning = pct > 75;
    const color = isDanger ? 'text-danger' : isWarning ? 'text-warning' : 'text-text-secondary';

    return (
      <span
        className={`text-xs ml-2 border-l border-border pl-2 ${color}`}
        title={`Uso: ${formatBytes(quota.usageBytes)} de ${formatBytes(quota.limitBytes)}`}
      >
        {pct.toFixed(0)}% Utilizado
      </span>
    );
  };

  const display = getStatusDisplay();

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-hover cursor-pointer transition-colors"
      title={`Última tentativa: ${formatLastSync(lastSyncTimestamp)}\n${retryScheduledAt ? `Nova tentativa: ${formatLastSync(retryScheduledAt)}` : ''}\n${errorMessage ? `Erro: ${errorMessage}` : ''}`}
      onPointerDown={handlePointerDown}
      role="button"
      tabIndex={0}
    >
      {display.icon}
      <span className={`hidden md:inline-flex items-center font-medium ${display.color}`}>
        {display.label}
        {getQuotaDisplay()}
      </span>
    </div>
  );
};
