import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

// A helper component that throws on demand
const ThrowingChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test explosion');
  }
  return <p>Child content OK</p>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress React error boundary console noise during tests
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  // ── Happy path ──

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <p>Everything is fine</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
  });

  it('renders without children (empty boundary)', () => {
    const { container } = render(<ErrorBoundary />);

    // Should render nothing but not crash
    expect(container).toBeTruthy();
  });

  // ── Error state ──

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Algo deu errado.')).toBeInTheDocument();
    expect(
      screen.getByText(/Pedimos desculpas pelo inconveniente/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recarregar/i })).toBeInTheDocument();
  });

  it('does not render children after catching an error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.queryByText('Child content OK')).not.toBeInTheDocument();
  });

  it('logs the error via console.error in componentDidCatch', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    // React itself logs + componentDidCatch logs
    expect(consoleSpy).toHaveBeenCalled();
    const catchCall = consoleSpy.mock.calls.find(
      (args) => args[0] === 'Uncaught error:',
    );
    expect(catchCall).toBeDefined();
    expect(catchCall![1]).toBeInstanceOf(Error);
    expect((catchCall![1] as Error).message).toBe('Test explosion');
  });

  // ── Reload button interaction ──

  it('calls window.location.reload when the reload button is clicked', () => {
    // Mock window.location.reload
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    const reloadButton = screen.getByRole('button', { name: /Recarregar/i });
    fireEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  // ── getDerivedStateFromError ──

  it('sets hasError to true via getDerivedStateFromError', () => {
    const result = (ErrorBoundary as unknown as { getDerivedStateFromError: (e: Error) => { hasError: boolean } })
      .getDerivedStateFromError(new Error('test'));

    expect(result).toEqual({ hasError: true });
  });
});
