import { Button } from '@/components/ui';
import type { DriveState } from '@/services/infrastructure/googleDriveTypes';

interface GoogleDriveFolderStatusProps {
  folderName: string | null;
  localPermissionActive: boolean;
  onSelectFolder: () => void | Promise<void>;
  onRemoveFolder: () => void | Promise<void>;
}

interface GoogleDriveApiStatusProps {
  apiState: DriveState;
  folderName: string | null;
  localPermissionActive: boolean;
  isApiConnected: boolean;
  onConnectApi: () => void | Promise<void>;
}

export function GoogleDriveFolderStatus({
  folderName,
  localPermissionActive,
  onSelectFolder,
  onRemoveFolder,
}: GoogleDriveFolderStatusProps): JSX.Element {
  return (
    <div>
      <h4 className="mb-2 font-semibold text-text-primary">Pasta Local do Google Drive</h4>

      {folderName ? (
        <div className="mt-3 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  localPermissionActive ? 'bg-success' : 'bg-warning'
                }`}
                aria-hidden="true"
              />
              <span className="text-sm text-text-primary">
                {folderName}/<span className="font-semibold">01. NexusArqui</span>
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              {localPermissionActive
                ? 'Permissão local ativa para leitura e escrita.'
                : 'Pasta salva sem permissão ativa. Reavalie a conexão ou use a API como fallback.'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onSelectFolder}>
              Alterar
            </Button>
            <Button variant="secondary" onClick={onRemoveFolder}>
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col items-start justify-between gap-4 rounded-lg border border-dashed border-border-color/50 px-4 py-3 sm:flex-row sm:items-center">
          <p className="text-sm text-text-secondary">
            Nenhuma pasta selecionada. Selecione a pasta raiz do Google Drive (ex: O:\Meu Drive).
          </p>
          <Button variant="primary" onClick={onSelectFolder}>
            Selecionar Pasta
          </Button>
        </div>
      )}
    </div>
  );
}

export function GoogleDriveApiStatus({
  apiState,
  folderName,
  localPermissionActive,
  isApiConnected,
  onConnectApi,
}: GoogleDriveApiStatusProps): JSX.Element {
  return (
    <div className="border-t border-border-color/50 pt-5">
      <h4 className="mb-2 font-semibold text-text-primary">Conexão via API</h4>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                isApiConnected ? 'bg-success' : 'bg-border-color'
              }`}
              aria-hidden="true"
            />
            <span className="text-sm text-text-primary">
              {isApiConnected ? 'Conectado' : 'Desconectado'}
            </span>
            {apiState.userEmail && (
              <span className="text-sm text-text-secondary">({apiState.userEmail})</span>
            )}
          </div>
          {folderName && !localPermissionActive && (
            <p className="text-xs text-text-secondary">
              A pasta local está configurada, mas sem permissão ativa. A API permanece visível para
              fallback e recuperação.
            </p>
          )}
        </div>

        {!isApiConnected && (
          <Button variant="secondary" onClick={() => void onConnectApi()}>
            {apiState.status === 'connecting' ? 'Conectando...' : 'Conectar Google Drive'}
          </Button>
        )}
      </div>
    </div>
  );
}
