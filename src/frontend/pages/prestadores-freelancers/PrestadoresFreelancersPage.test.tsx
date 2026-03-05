import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import PrestadoresFreelancersPage from './PrestadoresFreelancersPage';

const FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

const renderPage = () =>
  render(
    <MemoryRouter future={FUTURE_FLAGS}>
      <DataProvider>
        <PrestadoresFreelancersPage />
      </DataProvider>
    </MemoryRouter>,
  );

describe('PrestadoresFreelancersPage', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    api.clearAllData();
    const snapshot = api.getData();
    api.replaceData({
      ...snapshot,
      freelancers: [
        {
          id: 'freela-active',
          name: 'Freelancer Ativo',
          email: 'ativo@example.com',
          phone: '(11) 99999-0000',
          specialties: ['Modelagem 3D'],
          projects: [],
          archived: false,
        },
        {
          id: 'freela-archived',
          name: 'Freelancer Arquivado',
          email: 'arq@example.com',
          phone: '(11) 98888-0000',
          specialties: ['Renderização'],
          projects: [],
          archived: true,
        },
      ],
      hiredServices: [
        {
          id: 'service-1',
          projectId: 'proj-1',
          freelancerId: 'freela-active',
          taskIds: [],
          cost: 1200,
          deadline: '2026-03-25',
          status: 'Em Andamento',
          createdAt: '2026-03-01T10:00:00.000Z',
          archived: false,
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    api.clearAllData();
  });

  it('renders summary metrics, filters by search and handles active/archived empty states', () => {
    renderPage();

    expect(screen.getByText('Freelancers')).toBeInTheDocument();
    expect(screen.getByText('Freelancers Ativos')).toBeInTheDocument();
    expect(screen.getByText('Serviços Contratados')).toBeInTheDocument();
    expect(screen.getByText('Custo Total')).toBeInTheDocument();
    expect(screen.getByText('Freelancer Ativo')).toBeInTheDocument();
    expect(screen.queryByText('Freelancer Arquivado')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar freelancer'), {
      target: { value: 'modelagem' },
    });
    expect(screen.getByText('Freelancer Ativo')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar freelancer'), {
      target: { value: 'termo-inexistente' },
    });
    expect(screen.getByText('Nenhum freelancer encontrado')).toBeInTheDocument();
    expect(
      screen.getByText('Tente ajustar a busca ou adicione um novo freelancer.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivados' }));

    expect(screen.getByRole('button', { name: 'Ver Ativos' })).toBeInTheDocument();
    expect(screen.getByText('Não há freelancers arquivados.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar freelancer'), {
      target: { value: 'renderização' },
    });
    expect(screen.getByText('Freelancer Arquivado')).toBeInTheDocument();
  });

  it('opens by keyboard and edits an existing freelancer', async () => {
    renderPage();

    const freelancerCard = screen.getByRole('button', { name: /Freelancer Ativo/i });
    fireEvent.keyDown(freelancerCard, { key: 'Enter' });

    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Freelancer Editado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Freelancer Editado')).toBeInTheDocument();
    await waitFor(() => {
      const updated = api
        .getData()
        .freelancers.find((freelancer) => freelancer.id === 'freela-active');
      expect(updated?.name).toBe('Freelancer Editado');
    });
  });

  it('creates, archives and reactivates a freelancer', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Adicionar Freelancer/i }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Freelancer Novo' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'novo@example.com' } });
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '11911111111' } });
    fireEvent.click(screen.getByLabelText('Renderização'));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Freelancer Novo')).toBeInTheDocument();
    await waitFor(() =>
      expect(
        api.getData().freelancers.some((freelancer) => freelancer.name === 'Freelancer Novo'),
      ).toBe(true),
    );

    fireEvent.click(screen.getByRole('button', { name: /Freelancer Novo/i }));
    fireEvent.click(screen.getByRole('button', { name: /Arquivar/i }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Freelancer Novo/i })).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivados' }));
    expect(await screen.findByText('Freelancer Novo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Freelancer Novo/i }));
    fireEvent.click(screen.getByRole('button', { name: /Reativar/i }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Freelancer Novo/i })).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ver Ativos' }));
    expect(await screen.findByText('Freelancer Novo')).toBeInTheDocument();
  });

  it('deletes freelancer through confirmation modal', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Freelancer Ativo/i }));
    fireEvent.click(screen.getByRole('button', { name: /Excluir/i }));

    const confirmationHeading = screen.getByRole('heading', {
      name: 'Confirmar Exclusão de Freelancer',
    });
    const confirmationContainer = confirmationHeading.closest('[role="document"]');
    if (!confirmationContainer) {
      throw new Error('Confirmation modal container not found');
    }
    expect(within(confirmationContainer).getByText(/Freelancer Ativo/i)).toBeInTheDocument();
    fireEvent.click(within(confirmationContainer).getByRole('button', { name: 'Excluir' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Freelancer Ativo/i })).not.toBeInTheDocument(),
    );
    expect(api.getData().freelancers.some((freelancer) => freelancer.id === 'freela-active')).toBe(
      false,
    );
  });
});
