import React, { Component, ErrorInfo, ReactNode } from 'react';

interface RouteErrorBoundaryProps {
  children?: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary scoped to the route content area.
 *
 * Renders an inline fallback inside `<main>` so that the sidebar and header
 * remain interactive. Use `key={location.pathname}` on the wrapper so the
 * boundary resets automatically when the user navigates to a different route.
 *
 * @example
 * <RouteErrorBoundary key={location.pathname}>
 *   <Suspense fallback={<LoadingFallback />}>
 *     <Routes>…</Routes>
 *   </Suspense>
 * </RouteErrorBoundary>
 */
class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  public state: RouteErrorBoundaryState = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RouteErrorBoundary] Uncaught error in route:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <div className="w-16 h-16 mb-6 rounded-full bg-error/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>

          <h2 className="font-serif text-2xl font-bold text-secondary mb-2">
            Erro ao carregar página
          </h2>

          <p className="text-text-secondary mb-6 max-w-md">
            Ocorreu um erro ao carregar esta seção. Você pode tentar novamente ou navegar para outra
            página usando o menu lateral.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-5 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-5 py-2 rounded-lg font-semibold text-text-secondary border border-border-primary hover:bg-surface-secondary transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
