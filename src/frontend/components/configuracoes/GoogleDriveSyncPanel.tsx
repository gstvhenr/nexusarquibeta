import { Button } from '@/components/ui';
import { SyncStatusIndicator } from '../layout/SyncStatusIndicator';

type DriveMode = 'local' | 'api' | 'none';

interface GoogleDriveSyncPanelProps {
  driveMode: DriveMode;
  syncing: boolean;
  restoring: boolean;
  lastSyncTimestamp: number | null;
  pendingChangesCount: number;
  dirtyPreferencesCount: number;
  retryScheduledAt: number | null;
  onSync: () => void | Promise<void>;
  onRestore: () => void | Promise<void>;
  onFlush: () => void | Promise<void>;
  onReconnect: () => void | Promise<void>;
}

function formatTimestamp(timestamp: number | null): string {
  if (!timestamp) return 'Nunca';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function GoogleDriveSyncPanel({
  driveMode,
  syncing,
  restoring,
  lastSyncTimestamp,
  pendingChangesCount,
  dirtyPreferencesCount,
  retryScheduledAt,
  onSync,
  onRestore,
  onFlush,
  onReconnect,
}: GoogleDriveSyncPanelProps): JSX.Element {
  return (
    <div className="space-y-4 border-t border-border-color/50 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-text-primary">Sincronizar com Drive</h4>
          <p className="text-sm text-text-secondary">
            {driveMode === 'local'
              ? 'Salva os dados na pasta local do Google Drive e mantém a fila automática.'
              : 'Envia os dados via API para o Google Drive com retry automático.'}
          </p>
        </div>
        <Button variant="secondary" onClick={onSync} disabled={syncing}>
          {syncing ? 'Sincronizando…' : 'Sincronizar'}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-text-primary">Restaurar do Drive</h4>
          <p className="text-sm text-text-secondary">
            {driveMode === 'local'
              ? 'Restaura dados da pasta local do Google Drive.'
              : 'Baixa dados via API do Google Drive.'}
          </p>
        </div>
        <Button variant="secondary" onClick={onRestore} disabled={restoring}>
          {restoring ? 'Restaurando…' : 'Restaurar'}
        </Button>
      </div>

      <div className="text-xs text-text-secondary">
        Modo ativo:{' '}
        <span className="font-semibold">{driveMode === 'local' ? 'Pasta Local' : 'API Web'}</span>
        {' · '}Última sincronização: {formatTimestamp(lastSyncTimestamp)}
        {' · '}Fila pendente: <span className="font-semibold">{pendingChangesCount}</span>
        {dirtyPreferencesCount > 0 && (
          <>
            {' · '}Preferências pendentes:{' '}
            <span className="font-semibold">{dirtyPreferencesCount}</span>
          </>
        )}
        {retryScheduledAt && (
          <>
            {' · '}Retry: <span className="font-semibold">{formatTimestamp(retryScheduledAt)}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <span className="font-semibold text-text-primary">Status do Motor de Sincronia:</span>
        <SyncStatusIndicator />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onFlush}>
          Forçar Flush da Fila
        </Button>
        <Button variant="secondary" onClick={onReconnect}>
          Reavaliar Conexão
        </Button>
      </div>
    </div>
  );
}
