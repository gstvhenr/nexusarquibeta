import React, { useEffect, useRef, useState } from 'react';
import { googleDriveService } from '../../services/infrastructure/googleDriveService';

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isButtonReady, setIsButtonReady] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = googleDriveService.subscribe((driveState) => {
      if (driveState.status === 'disconnected') {
        if (driveState.errorMessage) {
          setError(driveState.errorMessage);
        }
      } else if (driveState.status === 'connected') {
        setError(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const container = buttonContainerRef.current;
    if (!container) return;

    let cancelled = false;
    setIsButtonReady(false);

    void googleDriveService
      .renderLoginButton(container)
      .then(() => {
        if (!cancelled) {
          setIsButtonReady(true);
          setError(null);
        }
      })
      .catch((renderError) => {
        if (cancelled) return;
        setIsButtonReady(false);
        setError(
          renderError instanceof Error
            ? renderError.message
            : 'Falha ao carregar o login do Google. Recarregue a pagina.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-card bg-surface shadow-soft">
        <div className="flex flex-col items-center p-8 text-center text-text-primary">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lift">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M19 17v4" />
              <path d="M3 5h4" />
              <path d="M17 19h4" />
            </svg>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-text-primary">Nexus-Arqui</h1>
          <p className="mb-8 text-sm leading-relaxed text-text-secondary">
            Bem-vindo ao sistema de gestão do seu escritório. Autentique-se com sua conta Google
            para acessar seus dados e projetos.
          </p>

          <div className="w-full">
            <div
              ref={buttonContainerRef}
              className="flex min-h-11 w-full justify-center"
              data-testid="google-login-button-container"
            />
            {!isButtonReady && !error && (
              <div className="mt-3 rounded-lg bg-surface-hover px-4 py-3 text-sm text-text-secondary">
                Carregando login do Google...
              </div>
            )}
          </div>

          {error && <p className="mt-4 text-sm font-medium text-error">{error}</p>}
        </div>
        <div className="bg-surface-hover p-4 text-center">
          <p className="text-xs text-text-muted">
            O acesso ao NexusArqui agora usa o fluxo oficial de login do Google. A permissao do
            Drive e solicitada separadamente quando necessaria.
          </p>
        </div>
      </div>
    </div>
  );
}
