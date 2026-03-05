import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProposalListItem } from './ProposalComponents';
import type { Proposal } from '../../types';
import { MemoryRouter, useNavigate } from 'react-router-dom';

vi.mock('../../utils/formatters', () => ({
  formatCurrency: (val: number) => `R$ ${val.toFixed(2)}`,
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockProposal: Proposal = {
  id: 'prop-123',
  code: 'PRP-2026-001',
  name: 'Projeto Residencial Alpha',
  clientId: 'client-1',
  date: '2026-01-15',
  status: 'Pendente',
  total: 4500,
  subtotal: 5000,
  discount: 10,
  sections: [],
};

describe('ProposalListItem', () => {
  it('renders proposal information correctly', () => {
    render(
      <MemoryRouter>
        <ProposalListItem
          proposal={mockProposal}
          onDelete={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          hasProject={false}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Projeto Residencial Alpha')).toBeInTheDocument();
    expect(screen.getByText(/PRP-2026-001/)).toBeInTheDocument();
    expect(screen.getByText(/2026-01-15/)).toBeInTheDocument();
    expect(screen.getByText('R$ 4500.00')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('renders linkedProjectCode if provided', () => {
    render(
      <MemoryRouter>
        <ProposalListItem
          proposal={mockProposal}
          onDelete={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          hasProject={true}
          linkedProjectCode="PRJ-2026-001"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('PRJ-2026-001')).toBeInTheDocument();
  });

  it('navigates to proposal detail on click', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <ProposalListItem
          proposal={mockProposal}
          onDelete={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          hasProject={false}
        />
      </MemoryRouter>
    );

    const container = screen.getByText('Projeto Residencial Alpha').closest('.cursor-pointer')!;
    fireEvent.click(container);

    expect(mockNavigate).toHaveBeenCalledWith('/propostas/prop-123');
  });

  it('navigates to proposal detail on Enter or Space key down', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <ProposalListItem
          proposal={mockProposal}
          onDelete={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          hasProject={false}
        />
      </MemoryRouter>
    );

    const container = screen.getByText('Projeto Residencial Alpha').closest('[role="button"]')!;

    // Test Enter
    fireEvent.keyDown(container, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/propostas/prop-123');

    // Test Space
    fireEvent.keyDown(container, { key: ' ' });
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('shows Archive button and hides Unarchive when not archived', () => {
    render(
      <MemoryRouter>
        <ProposalListItem
          proposal={mockProposal}
          onDelete={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          hasProject={false}
          isArchived={false}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Arquivar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Desarquivar' })).not.toBeInTheDocument();
  });

  it('shows Unarchive button and hides Archive when archived', () => {
    render(
      <MemoryRouter>
        <ProposalListItem
          proposal={mockProposal}
          onDelete={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          hasProject={false}
          isArchived={true}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Desarquivar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Arquivar' })).not.toBeInTheDocument();
  });

  it('calls onArchive when Archive button is clicked', () => {
    const handleArchive = vi.fn();
    render(
      <MemoryRouter>
        <ProposalListItem
          proposal={mockProposal}
          onDelete={vi.fn()}
          onArchive={handleArchive}
          onUnarchive={vi.fn()}
          hasProject={false}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Arquivar' }));
    expect(handleArchive).toHaveBeenCalledWith(mockProposal);
  });

  it('calls onUnarchive when Unarchive button is clicked', () => {
    const handleUnarchive = vi.fn();
    render(
      <MemoryRouter>
        <ProposalListItem
          proposal={mockProposal}
          onDelete={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={handleUnarchive}
          hasProject={false}
          isArchived={true}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Desarquivar' }));
    expect(handleUnarchive).toHaveBeenCalledWith(mockProposal);
  });

  it('hides Delete button when hasProject is true', () => {
    render(
      <MemoryRouter>
        <ProposalListItem
          proposal={mockProposal}
          onDelete={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          hasProject={true}
        />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
  });

  it('shows Delete button and calls onDelete when clicked and hasProject is false', () => {
    const handleDelete = vi.fn();
    render(
      <MemoryRouter>
        <ProposalListItem
          proposal={mockProposal}
          onDelete={handleDelete}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          hasProject={false}
        />
      </MemoryRouter>
    );

    const deleteBtn = screen.getByRole('button', { name: 'Excluir' });
    expect(deleteBtn).toBeInTheDocument();

    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith(mockProposal);
  });
});
