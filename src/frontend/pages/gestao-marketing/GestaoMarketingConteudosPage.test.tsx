import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import GestaoMarketingConteudosPage from './GestaoMarketingConteudosPage';

afterEach(() => {
  cleanup();
});

describe('GestaoMarketingConteudosPage', () => {
  it('renders content route view actions', () => {
    render(
      <MemoryRouter initialEntries={['/gestao-marketing/conteudos']}>
        <DataProvider>
          <GestaoMarketingConteudosPage />
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Gestão de Marketing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Novo Conteúdo/i })).toBeInTheDocument();
  });
});
