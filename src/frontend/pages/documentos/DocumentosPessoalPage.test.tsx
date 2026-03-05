import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import DocumentosPessoalPage from './DocumentosPessoalPage';

describe('DocumentosPessoalPage', () => {
  it('renders personal documents route wrapper', () => {
    render(
      <MemoryRouter initialEntries={['/documentos/pessoal']}>
        <DataProvider>
          <Routes>
            <Route path="/documentos/pessoal" element={<DocumentosPessoalPage />} />
          </Routes>
        </DataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Meus Documentos' })).toBeInTheDocument();
  });
});

