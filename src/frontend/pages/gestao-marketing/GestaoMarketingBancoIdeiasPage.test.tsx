import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import GestaoMarketingBancoIdeiasPage from './GestaoMarketingBancoIdeiasPage';

afterEach(() => {
  cleanup();
});

describe('GestaoMarketingBancoIdeiasPage', () => {
  it('renders ideas route view actions', () => {
    render(
      <MemoryRouter initialEntries={['/gestao-marketing/banco-de-ideias']}>
        <DataProvider>
          <GestaoMarketingBancoIdeiasPage />
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Gestão de Marketing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nova Ideia/i })).toBeInTheDocument();
  });
});
