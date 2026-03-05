import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '@/types';
import { ProjetoDetalhesOverviewTab } from './ProjetoDetalhesOverviewTab';

const localProject: Project = {
  id: 'proj-1',
  code: 'PRJ-001',
  name: 'Projeto Residencial',
  clientName: 'Cliente',
  clientId: 'client-1',
  status: 'Em Andamento',
  deadline: null,
  budget: 10000,
  description: 'Descrição inicial',
  sections: [],
  financials: {
    paymentType: 'vista',
  },
  serviceAddress: {
    street: 'Rua A',
    number: '100',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zip: '01000-000',
  },
  revisionCount: 1,
  revisionLimit: 3,
  archived: false,
};

describe('ProjetoDetalhesOverviewTab', () => {
  afterEach(() => {
    cleanup();
  });

  it('updates project fields and triggers project actions', () => {
    const handleLocalChange = vi.fn();
    const setIsEditingAddress = vi.fn();
    const handleActionRequest = vi.fn();
    const incrementRevision = vi.fn();

    render(
      <ProjetoDetalhesOverviewTab
        activeTab="overview"
        localProject={localProject}
        commonInputClass="input"
        isEditingAddress={false}
        setIsEditingAddress={setIsEditingAddress}
        handleLocalChange={handleLocalChange}
        handleAddressChange={vi.fn()}
        progress={50}
        incrementRevision={incrementRevision}
        handleActionRequest={handleActionRequest}
        handleReactivate={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Nome do projeto'), {
      target: { value: 'Projeto Atualizado' },
    });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Pausado' } });
    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Excluir Projeto/i }));
    fireEvent.click(screen.getByRole('button', { name: /Inativar e Arquivar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Finalizar Projeto/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar revisão' }));

    expect(handleLocalChange).toHaveBeenCalledWith('name', 'Projeto Atualizado');
    expect(handleLocalChange).toHaveBeenCalledWith('status', 'Pausado');
    expect(setIsEditingAddress).toHaveBeenCalledWith(true);
    expect(handleActionRequest).toHaveBeenCalledWith('delete');
    expect(handleActionRequest).toHaveBeenCalledWith('inactivate');
    expect(handleActionRequest).toHaveBeenCalledWith('finalize');
    expect(incrementRevision).toHaveBeenCalledTimes(1);
  });

  it('supports address editing mode and RRT link rendering', () => {
    const handleAddressChange = vi.fn();
    const handleLocalChange = vi.fn();

    render(
      <ProjetoDetalhesOverviewTab
        activeTab="overview"
        localProject={{
          ...localProject,
          rrtUrl: 'https://nexus-arqui.local/rrt',
        }}
        commonInputClass="input"
        isEditingAddress
        setIsEditingAddress={vi.fn()}
        handleLocalChange={handleLocalChange}
        handleAddressChange={handleAddressChange}
        progress={50}
        incrementRevision={vi.fn()}
        handleActionRequest={vi.fn()}
        handleReactivate={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Rua'), { target: { value: 'Rua B' } });
    fireEvent.change(screen.getByPlaceholderText('Número'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('CEP'), { target: { value: '02000-000' } });
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Campinas' } });
    fireEvent.change(screen.getByLabelText('Número do RRT'), { target: { value: '998877' } });
    fireEvent.change(screen.getByLabelText('Link do RRT'), {
      target: { value: 'https://rrt.local/arquivo' },
    });

    expect(handleAddressChange).toHaveBeenCalledWith('street', 'Rua B');
    expect(handleAddressChange).toHaveBeenCalledWith('number', '200');
    expect(handleAddressChange).toHaveBeenCalledWith('zip', '02000-000');
    expect(handleAddressChange).toHaveBeenCalledWith('city', 'Campinas');
    expect(handleLocalChange).toHaveBeenCalledWith('rrtNumber', '998877');
    expect(handleLocalChange).toHaveBeenCalledWith('rrtUrl', 'https://rrt.local/arquivo');

    const rrtLink = screen.getByRole('link', { name: 'Abrir link do RRT' });
    expect(rrtLink).toHaveAttribute('href', 'https://nexus-arqui.local/rrt');
  });

  it('renders archived actions and fallback address text', () => {
    const handleReactivate = vi.fn();

    render(
      <ProjetoDetalhesOverviewTab
        activeTab="overview"
        localProject={{
          ...localProject,
          archived: true,
          serviceAddress: undefined,
        }}
        commonInputClass="input"
        isEditingAddress={false}
        setIsEditingAddress={vi.fn()}
        handleLocalChange={vi.fn()}
        handleAddressChange={vi.fn()}
        progress={15}
        incrementRevision={vi.fn()}
        handleActionRequest={vi.fn()}
        handleReactivate={handleReactivate}
      />,
    );

    expect(screen.getByText('Endereço não informado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reativar Projeto/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Finalizar Projeto/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reativar Projeto/i }));
    expect(handleReactivate).toHaveBeenCalledTimes(1);
  });
});
