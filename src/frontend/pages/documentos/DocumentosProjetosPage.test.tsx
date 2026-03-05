import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import DocumentosProjetosPage from './DocumentosProjetosPage';

describe('DocumentosProjetosPage', () => {
  it('renders project documents route wrapper', () => {
    render(
      <MemoryRouter initialEntries={['/documentos/projetos']}>
        <DataProvider>
          <Routes>
            <Route path="/documentos/projetos" element={<DocumentosProjetosPage />} />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Documentos de Projetos' }),
    ).toBeInTheDocument();
  });
});

