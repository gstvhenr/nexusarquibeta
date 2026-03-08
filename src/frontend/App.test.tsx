import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from './App';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { FinancialSecurityProvider } from './context/FinancialSecurityContext';

const LocationProbe: () => React.ReactNode = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const renderApp = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <DataProvider>
          <FinancialSecurityProvider>
            <App />
            <LocationProbe />
          </FinancialSecurityProvider>
        </DataProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );

/**
 * Lazy-loaded route redirects take longer under full-suite coverage
 * instrumentation. Increase waitFor timeout beyond the default 1000ms.
 */
const REDIRECT_WAIT_OPTIONS = { timeout: 5000 } as const;

describe('App entrypoint', () => {
  it('uses standard layout classes for non-special routes', () => {
    const { container } = renderApp('/rota-inexistente');

    const appRoot = container.querySelector('div.bg-background');
    const contentWrapper = container.querySelector('main')?.parentElement;
    const main = container.querySelector('main');

    expect(appRoot).toHaveClass('bg-background', 'font-sans', 'text-text-primary');
    expect(appRoot).not.toHaveClass('h-screen', 'overflow-hidden');

    expect(contentWrapper).toHaveClass('min-h-screen');
    expect(contentWrapper).not.toHaveClass('h-full');

    expect(main).toHaveClass('px-2', 'pt-2', 'md:px-4', 'md:pt-4', 'lg:px-6', 'lg:pt-6');
    expect(main).toHaveClass('pb-4', 'md:pb-5');
  });

  it('uses fullscreen layout classes for special routes', () => {
    const { container } = renderApp('/financeiro/rota-inexistente');

    const appRoot = container.querySelector('div.bg-background');
    const contentWrapper = container.querySelector('main')?.parentElement;
    const main = container.querySelector('main');

    expect(appRoot).toHaveClass('h-screen', 'overflow-hidden');
    expect(contentWrapper).toHaveClass('h-full');
    expect(contentWrapper).not.toHaveClass('min-h-screen');

    expect(main).toHaveClass('pb-4', 'md:pb-5');
    expect(main?.className).not.toContain('px-2');
    expect(main?.className).not.toContain('pt-2');
  });

  it('opens sidebar from header button on mobile flow', () => {
    const { container } = renderApp('/rota-inexistente');

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('-translate-x-full');
    expect(sidebar).not.toHaveClass('translate-x-0');

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(sidebar).toHaveClass('translate-x-0');
    expect(sidebar).not.toHaveClass('-translate-x-full');
  });

  it('redirects /agenda to /agenda/calendario', async () => {
    renderApp('/agenda');

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/agenda/calendario');
    }, REDIRECT_WAIT_OPTIONS);
  });

  it('redirects /documentos to /documentos/pessoal', async () => {
    renderApp('/documentos');

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/documentos/pessoal');
    }, REDIRECT_WAIT_OPTIONS);
  });

  it('redirects /relatorios to /relatorios/financeiro', async () => {
    renderApp('/relatorios');

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/relatorios/financeiro');
    }, REDIRECT_WAIT_OPTIONS);
  });
});
