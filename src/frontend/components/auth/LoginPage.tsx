import React, { useEffect, useRef, useState } from 'react';
import { firebaseAuthService } from '../../services/infrastructure/firebaseAuthService';

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isButtonReady, setIsButtonReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = firebaseAuthService.subscribe((authState) => {
      if (authState.status === 'error') {
        setError(authState.errorMessage);
      } else if (authState.status === 'authenticated') {
        setError(null);
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsButtonReady(false);
    void firebaseAuthService
      .tryRestoreSession()
      .then(() => {
        if (!mountedRef.current) {
          return;
        }

        setIsButtonReady(true);
        setError(firebaseAuthService.getState().errorMessage);
      })
      .catch((restoreError) => {
        if (!mountedRef.current) {
          return;
        }

        setIsButtonReady(true);
        setError(
          restoreError instanceof Error
            ? restoreError.message
            : 'Falha ao carregar o login do Firebase. Recarregue a página.',
        );
      });
  }, []);

  const handleSignIn = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await firebaseAuthService.signIn();
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : 'Falha ao autenticar com o Google via Firebase.',
      );
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

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
            <button
              type="button"
              onClick={() => void handleSignIn()}
              disabled={!isButtonReady || isSubmitting}
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-content transition-colors hover:bg-primary-focus disabled:cursor-not-allowed disabled:opacity-60"
              data-testid="firebase-login-button"
            >
              {isSubmitting ? 'Autenticando...' : 'Entrar com Google'}
            </button>
            {!isButtonReady && !error && (
              <div className="mt-3 rounded-lg bg-surface-hover px-4 py-3 text-sm text-text-secondary">
                Carregando autenticação do Firebase...
              </div>
            )}
          </div>

          {error && <p className="mt-4 text-sm font-medium text-error">{error}</p>}
        </div>
        <div className="bg-surface-hover p-4 text-center">
          <p className="text-xs text-text-muted">
            O acesso ao NexusArqui usa Firebase Auth com provedor Google e Firestore como
            persistência principal.
          </p>
        </div>
      </div>
    </div>
  );
}
