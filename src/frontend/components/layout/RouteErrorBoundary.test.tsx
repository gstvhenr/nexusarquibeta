import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import RouteErrorBoundary from './RouteErrorBoundary';

/** Helper that throws on demand so we can trigger the boundary. */
const ThrowingChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Route boom');
  }
  return <p>Route content OK</p>;
};

describe('RouteErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // ── Happy path ──

  it('renders children when no error is thrown', () => {
    render(
      <RouteErrorBoundary>
        <p>Safe content</p>
      </RouteErrorBoundary>,
    );

    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders without children (empty boundary)', () => {
    const { container } = render(<RouteErrorBoundary />);

    expect(container).toBeTruthy();
  });

  // ── Error state ──

  it('renders inline fallback when a child throws', () => {
    render(
      <RouteErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </RouteErrorBoundary>,
    );

    expect(screen.getByText('Erro ao carregar página')).toBeInTheDocument();
    expect(screen.getByText(/Ocorreu um erro ao carregar esta seção/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recarregar página/i })).toBeInTheDocument();
  });

  it('does not render children after catching an error', () => {
    render(
      <RouteErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </RouteErrorBoundary>,
    );

    expect(screen.queryByText('Route content OK')).not.toBeInTheDocument();
  });

  it('logs the error via console.error in componentDidCatch', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RouteErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </RouteErrorBoundary>,
    );

    const catchCall = consoleSpy.mock.calls.find(
      (args) => args[0] === '[RouteErrorBoundary] Uncaught error in route:',
    );
    expect(catchCall).toBeDefined();
    expect(catchCall![1]).toBeInstanceOf(Error);
    expect((catchCall![1] as Error).message).toBe('Route boom');
  });

  // ── Retry button ──

  it('resets error state when "Tentar novamente" is clicked', () => {
    // Use a mutable ref so we can toggle the throw flag synchronously
    // BEFORE clicking retry — otherwise the boundary resets, React re-renders
    // the still-throwing child, and the error is caught again instantly.
    let shouldThrow = true;
    const ControlledChild = () => {
      if (shouldThrow) {
        throw new Error('Route boom');
      }
      return <p>Route content OK</p>;
    };

    render(
      <RouteErrorBoundary>
        <ControlledChild />
      </RouteErrorBoundary>,
    );

    expect(screen.getByText('Erro ao carregar página')).toBeInTheDocument();

    // Turn off the throw flag, then click retry
    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));

    expect(screen.getByText('Route content OK')).toBeInTheDocument();
    expect(screen.queryByText('Erro ao carregar página')).not.toBeInTheDocument();
  });

  // ── Reload button ──

  it('calls window.location.reload when the reload button is clicked', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    render(
      <RouteErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </RouteErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Recarregar página/i }));

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  // ── getDerivedStateFromError ──

  it('sets hasError to true via getDerivedStateFromError', () => {
    const testError = new Error('test');
    const result = (
      RouteErrorBoundary as unknown as {
        getDerivedStateFromError: (e: Error) => { hasError: boolean; error: Error };
      }
    ).getDerivedStateFromError(testError);

    expect(result).toEqual({ hasError: true, error: testError });
  });
});
