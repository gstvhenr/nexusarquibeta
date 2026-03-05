import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import GestaoMarketingPainelPage from './GestaoMarketingPainelPage';

afterEach(() => {
  cleanup();
});

describe('GestaoMarketingPainelPage', () => {
  it('renders marketing dashboard route view', () => {
    render(
      <MemoryRouter initialEntries={['/gestao-marketing/painel']}>
        <DataProvider>
          <GestaoMarketingPainelPage />
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Gestão de Marketing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar Prestador/i })).toBeInTheDocument();
  });
});
