import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import ProjetoDetalhesPage from './ProjetoDetalhesPage';

afterEach(() => {
  cleanup();
});

describe('ProjetoDetalhesPage', () => {
  it('renders not-found fallback when id does not exist', () => {
    render(
      <MemoryRouter initialEntries={['/projetos/detalhes/inexistente']}>
        <DataProvider>
          <Routes>
            <Route path="/projetos/detalhes/:id" element={<ProjetoDetalhesPage />} />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Projeto não encontrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
  });
});
