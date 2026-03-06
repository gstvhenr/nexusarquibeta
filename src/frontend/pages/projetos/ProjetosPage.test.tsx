import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import { createTestFinancials, createTestProject } from '@/test/factories';
import type { Project } from '@/types';
import ProjetosPage from './ProjetosPage';

const FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

let modalRoot: HTMLDivElement;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  api.clearAllData();
  document.getElementById('modal-root')?.remove();
  modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  cleanup();
  vi.useRealTimers();
  api.clearAllData();
  document.getElementById('modal-root')?.remove();
});

function seedProjects(projects: Project[]) {
  const snapshot = api.getData();
  api.replaceData({
    ...snapshot,
    projects,
    agendaEvents: [],
  });
}

function renderProjetosPage() {
  return render(
    <MemoryRouter initialEntries={['/projetos']} future={FUTURE_FLAGS}>
      <DataProvider>
        <Routes>
          <Route path="/projetos" element={<ProjetosPage />} />
        </Routes>
      </DataProvider>
    </MemoryRouter>,
  );
}

describe('ProjetosPage — Integration', () => {
  it('sorts active projects by nearest deadline and toggles to archived list', async () => {
    seedProjects([
      createTestProject({
        id: 'proj-future',
        name: 'Projeto Prazo Longo',
        deadline: '2026-12-31',
      }),
      createTestProject({
        id: 'proj-near',
        name: 'Projeto Prazo Curto',
        deadline: '2026-03-15',
        status: 'Pausado',
      }),
      createTestProject({
        id: 'proj-no-deadline',
        name: 'Projeto Sem Prazo',
        deadline: null,
      }),
      createTestProject({
        id: 'proj-archived',
        name: 'Projeto Arquivado',
        archived: true,
        status: 'Cancelado',
      }),
    ]);

    renderProjetosPage();

    expect(await screen.findByText('Projetos')).toBeInTheDocument();
    expect(screen.getByText('Não Iniciado')).toBeInTheDocument();

    const nearDeadline = screen.getByRole('heading', { name: 'Projeto Prazo Curto' });
    const futureDeadline = screen.getByRole('heading', { name: 'Projeto Prazo Longo' });
    const noDeadline = screen.getByRole('heading', { name: 'Projeto Sem Prazo' });

    expect(
      nearDeadline.compareDocumentPosition(futureDeadline) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(
      futureDeadline.compareDocumentPosition(noDeadline) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivados' }));

    expect(screen.getByRole('button', { name: 'Ver Ativos' })).toBeInTheDocument();
    expect(screen.queryByText('Não Iniciado')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Projeto Arquivado' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Projeto Prazo Curto' })).not.toBeInTheDocument();
  });

  it('shows correct empty states for active and archived views', async () => {
    seedProjects([]);

    renderProjetosPage();

    expect(await screen.findByText('Nenhum projeto encontrado')).toBeInTheDocument();
    expect(screen.getByText('Converta uma proposta em projeto para começar.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivados' }));

    expect(screen.getByText('Nenhum projeto arquivado')).toBeInTheDocument();
    expect(screen.getByText('Você ainda não arquivou nenhum projeto.')).toBeInTheDocument();
  });

  it('archives and unarchives a project using list actions', async () => {
    seedProjects([
      createTestProject({
        id: 'proj-active',
        name: 'Projeto Ativo',
        status: 'Em Andamento',
      }),
      createTestProject({
        id: 'proj-archived-manual',
        name: 'Projeto Arquivado Manual',
        archived: true,
        status: 'Cancelado',
        inactivatedAt: null,
        finalizedAt: null,
      }),
    ]);

    renderProjetosPage();

    fireEvent.click(await screen.findByLabelText('Inativar Projeto'));

    expect(await screen.findByText('Nenhum projeto encontrado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivados' }));
    expect(screen.getByRole('heading', { name: 'Projeto Ativo' })).toBeInTheDocument();

    await waitFor(() => {
      const archived = api.getData().projects.find((project) => project.id === 'proj-active');
      expect(archived?.archived).toBe(true);
      expect(archived?.status).toBe('Cancelado');
      expect(archived?.inactivatedAt).toBeTruthy();
    });

    fireEvent.click(screen.getByLabelText('Desarquivar projeto'));
    fireEvent.click(screen.getByRole('button', { name: 'Ver Ativos' }));
    expect(
      await screen.findByRole('heading', { name: 'Projeto Arquivado Manual' }),
    ).toBeInTheDocument();
  });

  it('finalizes project, completes tasks and settles pending installments', async () => {
    seedProjects([
      createTestProject({
        id: 'proj-finalize',
        name: 'Projeto Para Finalizar',
        status: 'Em Andamento',
        sections: [
          {
            id: 'sec-1',
            name: 'Etapa 1',
            tasks: [{ id: 'task-1', name: 'Tarefa 1', completed: false, hours: 2, status: 'todo' }],
          },
        ],
        financials: createTestFinancials({
          paymentType: 'parcelado',
          installments: [
            {
              id: 'inst-1',
              number: 1,
              value: 500,
              dueDate: '2026-03-15',
              paid: true,
              paymentDate: '2026-03-15',
            },
            {
              id: 'inst-2',
              number: 2,
              value: 500,
              dueDate: '2026-04-15',
              paid: false,
              paymentDate: null,
            },
          ],
        }),
      }),
    ]);

    renderProjetosPage();

    fireEvent.click(await screen.findByLabelText('Finalizar Projeto'));

    expect(screen.getByText('Finalizar o Projeto?')).toBeInTheDocument();
    const finalizeDialog = screen.getByRole('dialog');
    expect(within(finalizeDialog).getByText('Projeto Para Finalizar')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sim, Finalizar' }));
    expect(await screen.findByText('Nenhum projeto encontrado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivados' }));
    expect(
      await screen.findByRole('heading', { name: 'Projeto Para Finalizar' }),
    ).toBeInTheDocument();

    await waitFor(() => {
      const finalized = api.getData().projects.find((project) => project.id === 'proj-finalize');
      expect(finalized?.status).toBe('Concluído');
      expect(finalized?.archived).toBe(true);
      expect(finalized?.finalizedAt).toBeTruthy();
      expect(finalized?.sections[0]?.tasks[0]?.completed).toBe(true);
      expect(finalized?.financials.installments?.[1]?.paid).toBe(true);
      expect(finalized?.financials.installments?.[1]?.paymentDate).toBeTruthy();
    });
  });
});
