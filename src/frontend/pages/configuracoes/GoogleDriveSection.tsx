import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../components/ui';
import { googleDriveService } from '../../services/infrastructure/googleDriveService';
import { localDriveService } from '../../services/infrastructure/localDriveService';
import type { DriveState } from '../../services/infrastructure/googleDriveTypes';
import { api } from '../../services/infrastructure/api';
import { Section } from './Section';

type DriveMode = 'local' | 'api' | 'none';

function formatTimestamp(timestamp: number | null): string {
  if (!timestamp) return 'Nunca';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function GoogleDriveSection(): JSX.Element {
  const [folderName, setFolderName] = useState<string | null>(null);
  const [driveMode, setDriveMode] = useState<DriveMode>('none');
  const [apiState, setApiState] = useState<DriveState>(googleDriveService.getState);
  const [syncing, setSyncing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    localDriveService.initDisplayName().then((name) => {
      if (name) {
        setFolderName(name);
        setDriveMode('local');
      } else if (googleDriveService.getState().status === 'connected') {
        setDriveMode('api');
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = googleDriveService.subscribe((state) => {
      setApiState(state);
      if (state.status === 'connected' && driveMode !== 'local') {
        setDriveMode('api');
      }
    });
    return unsubscribe;
  }, [driveMode]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  // ---------- Local folder ----------

  const handleSelectFolder = useCallback(async () => {
    try {
      setMessage(null);
      const name = await localDriveService.selectFolder();
      setFolderName(name);
      setDriveMode('local');
      setMessage({
        type: 'success',
        text: `Pasta selecionada: ${name}/01. NexusArqui`,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setMessage({
        type: 'error',
        text: `Erro ao selecionar pasta: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      });
    }
  }, []);

  const handleRemoveFolder = useCallback(async () => {
    await localDriveService.clearSavedFolder();
    setFolderName(null);
    setDriveMode(apiState.status === 'connected' ? 'api' : 'none');
    setMessage({ type: 'success', text: 'Pasta local removida.' });
  }, [apiState.status]);

  // ---------- Sync / Restore ----------

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const jsonString = api.exportData();

      if (driveMode === 'local') {
        await localDriveService.writeSnapshot(jsonString);
        setMessage({
          type: 'success',
          text: 'Dados salvos na pasta local do Google Drive!',
        });
      } else {
        const snapshot = JSON.parse(jsonString) as unknown;
        await googleDriveService.uploadSnapshot(snapshot);
        setMessage({
          type: 'success',
          text: 'Dados sincronizados via API do Google Drive!',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro ao sincronizar: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      });
    } finally {
      setSyncing(false);
    }
  }, [driveMode]);

  const handleRestore = useCallback(async () => {
    const confirmed = window.confirm(
      'Restaurar dados do Google Drive? Isso substituirá os dados atuais.',
    );
    if (!confirmed) return;

    setRestoring(true);
    setMessage(null);
    try {
      let jsonString: string | null = null;

      if (driveMode === 'local') {
        jsonString = await localDriveService.readSnapshot();
      } else {
        const snapshot = await googleDriveService.downloadSnapshot<unknown>();
        jsonString = snapshot ? JSON.stringify(snapshot) : null;
      }

      if (!jsonString) {
        setMessage({
          type: 'error',
          text: 'Nenhum backup encontrado no Google Drive.',
        });
        return;
      }

      api.importData(jsonString);
      setMessage({
        type: 'success',
        text: 'Dados restaurados! A página será recarregada.',
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro ao restaurar: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      });
    } finally {
      setRestoring(false);
    }
  }, [driveMode]);

  const isApiConnected = apiState.status === 'connected';
  const canSync = driveMode === 'local' || (driveMode === 'api' && isApiConnected);

  return (
    <Section
      title="Google Drive"
      description="Sincronize seus dados com o Google Drive para backup e acesso de outras máquinas."
    >
      <div className="space-y-5">
        {/* Local folder selection */}
        <div>
          <h4 className="mb-2 font-semibold text-text-primary">Pasta Local do Google Drive</h4>

          {folderName ? (
            <div className="flex items-center justify-between rounded-lg bg-surface-hover px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                <span className="text-sm text-text-primary">
                  {folderName}/<span className="font-semibold">01. NexusArqui</span>
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleSelectFolder}>
                  Alterar
                </Button>
                <Button variant="secondary" onClick={handleRemoveFolder}>
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-border-color/50 px-4 py-3">
              <p className="text-sm text-text-secondary">
                Nenhuma pasta selecionada. Selecione a pasta raiz do Google Drive (ex: O:\Meu
                Drive).
              </p>
              <Button variant="primary" onClick={handleSelectFolder}>
                Selecionar Pasta
              </Button>
            </div>
          )}
        </div>

        {/* API status indicator */}
        {!folderName && (
          <div className="border-t border-border-color/50 pt-5">
            <h4 className="mb-2 font-semibold text-text-primary">Conexão via API</h4>

            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${isApiConnected ? 'bg-emerald-500' : 'bg-gray-400'}`}
                aria-hidden="true"
              />
              <span className="text-sm text-text-primary">
                {isApiConnected ? 'Conectado' : 'Desconectado'}
              </span>
              {apiState.userEmail && (
                <span className="text-sm text-text-secondary">({apiState.userEmail})</span>
              )}
            </div>
          </div>
        )}

        {/* Sync actions */}
        {canSync && (
          <div className="space-y-4 border-t border-border-color/50 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text-primary">Sincronizar com Drive</h4>
                <p className="text-sm text-text-secondary">
                  {driveMode === 'local'
                    ? 'Salva os dados na pasta local do Google Drive.'
                    : 'Envia os dados via API para o Google Drive.'}
                </p>
              </div>
              <Button variant="secondary" onClick={handleSync} disabled={syncing}>
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
              <Button variant="secondary" onClick={handleRestore} disabled={restoring}>
                {restoring ? 'Restaurando…' : 'Restaurar'}
              </Button>
            </div>

            <div className="text-xs text-text-secondary">
              Modo ativo:{' '}
              <span className="font-semibold">
                {driveMode === 'local' ? 'Pasta Local' : 'API Web'}
              </span>
              {' · '}Última sincronização: {formatTimestamp(apiState.lastSyncTimestamp)}
            </div>
          </div>
        )}

        {/* Feedback message */}
        {message && (
          <div
            className={`rounded-lg px-4 py-2 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </Section>
  );
}

export { GoogleDriveSection };
