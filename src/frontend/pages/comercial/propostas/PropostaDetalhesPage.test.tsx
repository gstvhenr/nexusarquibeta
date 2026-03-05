import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import PropostaDetalhesPage from './PropostaDetalhesPage';

describe('PropostaDetalhesPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders not-found state when proposal id does not exist', () => {
    render(
      <MemoryRouter initialEntries={['/propostas/inexistente']}>
        <DataProvider>
          <Routes>
            <Route path="/propostas/:id" element={<PropostaDetalhesPage />} />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Proposta não encontrada')).toBeInTheDocument();
  });
});
