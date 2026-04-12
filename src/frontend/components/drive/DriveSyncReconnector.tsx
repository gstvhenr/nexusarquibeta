import React, { useEffect, useState } from 'react';
import { Button, AlertIcon } from '@/components/ui';
import { driveSyncEngine } from '@/services/infrastructure/driveSyncEngine';
import { localDriveService } from '@/services/infrastructure/localDriveService';
import { useDriveSync } from '@/hooks/useDriveSync';

export const DriveSyncReconnector: React.FC = () => {
  const { status, accessMode } = useDriveSync();
  const [needsLocalReconnect, setNeedsLocalReconnect] = useState(false);
  const [isApiActive, setIsApiActive] = useState(false);

  useEffect(() => {
    // Verificar se há pasta local salva sem permissão ativa
    if (accessMode === 'none' || accessMode === 'api') {
      localDriveService.hasSavedFolder().then((hasFolder: boolean) => {
        if (hasFolder) {
          localDriveService.hasActivePermission().then((hasAccess: boolean) => {
            setNeedsLocalReconnect(!hasAccess);
            setIsApiActive(accessMode === 'api');
          });
        } else {
          setNeedsLocalReconnect(false);
        }
      });
    } else {
      setNeedsLocalReconnect(false);
    }
  }, [accessMode, status]);

  const handleReconnect = async () => {
    try {
      const success = await driveSyncEngine.reconnectWithRepermission();
      if (success) {
        setNeedsLocalReconnect(false);
      }
    } catch {
      // Ignore error if user cancels prompt
    }
  };

  useEffect(() => {
    if (!needsLocalReconnect) return;

    // Tentativa automática e invisível de re-adquirir permissão no primeiro clique do usuário.
    // A File System Access API exige um "user gesture". Ao interceptar o primeiro clique,
    // o navegador exibe o prompt nativo sem exigir que o usuário vá nas configurações.
    const handleFirstUserInteraction = async () => {
      await handleReconnect();
    };

    document.addEventListener('click', handleFirstUserInteraction, { once: true, capture: true });

    return () => {
      document.removeEventListener('click', handleFirstUserInteraction, { capture: true });
    };
  }, [needsLocalReconnect]);

  if (!needsLocalReconnect) return null;

  // API ativa → banner informativo (opcional); sem acesso → banner de alerta
  const bannerColorClass = isApiActive
    ? 'bg-info/10 border-info/20'
    : 'bg-warning/10 border-warning/20';
  const iconColorClass = isApiActive ? 'text-info' : 'text-warning';
  const iconBgClass = isApiActive ? 'bg-info/20' : 'bg-warning/20';

  const title = isApiActive ? 'Pasta local desconectada' : 'Sincronização Pausada';

  const description = isApiActive
    ? 'Seus dados estão sincronizando via API. Reconecte a pasta local para melhor performance.'
    : 'Sua conta Google Drive precisa de permissão para retomar a sincronia.';

  const buttonLabel = isApiActive ? 'Conectar Pasta' : 'Reconectar Conta';

  return (
    <div
      className={`${bannerColorClass} border-b p-2 md:p-3 flex flex-col md:flex-row items-center justify-between gap-4 z-50`}
    >
      <div className="flex items-center gap-3">
        <div className={`${iconBgClass} p-1.5 rounded-full flex-shrink-0`}>
          <AlertIcon className={`${iconColorClass} h-5 w-5`} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-text-primary m-0">{title}</h4>
          <p className="text-xs text-text-secondary m-0 mt-0.5">{description}</p>
        </div>
      </div>
      <Button
        onClick={handleReconnect}
        variant="primary"
        size="sm"
        className="w-full md:w-auto flex-shrink-0"
      >
        {buttonLabel}
      </Button>
    </div>
  );
};
