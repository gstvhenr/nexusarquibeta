import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProposalDocumentEditor } from './ProposalDocumentEditor';
import type { Proposal, ProposalBlock } from '../../types';

vi.mock('../../utils/formatters', () => ({
  formatCurrency: (val: number) => `R$ ${val.toFixed(2)}`,
}));

// We need to mock uuid to make addTextBlock deterministic
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

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
  sections: [
    {
      id: 1,
      title: 'Projeto Arquitetônico',
      items: [
        {
          id: 1, description: 'Levantamento', quantity: 1, unit: 'un', unitPrice: 2000,
        },
      ],
    },
  ],
};

const mockTextBlocks: ProposalBlock[] = [
  { id: 'block-1', type: 'text', content: 'Introdução do projeto', order: 0 },
  { id: 'block-2', type: 'budget_table', order: 1 },
  { id: 'block-3', type: 'text', content: 'Conclusão', order: 2 },
];

describe('ProposalDocumentEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders readOnly mode correctly (no textareas, no add buttons)', () => {
    const { container } = render(
      <ProposalDocumentEditor
        blocks={mockTextBlocks}
        proposal={mockProposal}
        onUpdateBlocks={vi.fn()}
        readOnly={true}
      />
    );

    // Letterhead
    expect(screen.getByText('Rafael Munaro Arquitetura')).toBeInTheDocument();
    expect(screen.getByText('Proposta Comercial')).toBeInTheDocument();
    expect(screen.getByText('PRP-2026-001')).toBeInTheDocument();

    // Content blocks
    // In readOnly mode, we should see normal divs with text
    expect(screen.getByText('Introdução do projeto')).toBeInTheDocument();
    expect(screen.getByText('Conclusão')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Escreva seu texto aqui...')).not.toBeInTheDocument();

    // Budget table (from BudgetTableBlock)
    expect(screen.getByText('Projeto Arquitetônico')).toBeInTheDocument();

    // No editing controls
    expect(container.querySelector('textarea')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mover/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Excluir bloco/i })).not.toBeInTheDocument();
    expect(screen.queryByText('+ Texto')).not.toBeInTheDocument();
  });

  it('renders edit mode correctly', () => {
    render(
      <ProposalDocumentEditor
        blocks={mockTextBlocks}
        proposal={mockProposal}
        onUpdateBlocks={vi.fn()}
        readOnly={false}
      />
    );

    // Should render textareas
    const textareas = screen.getAllByPlaceholderText('Escreva seu texto aqui...');
    expect(textareas).toHaveLength(2); // Two text blocks
    expect(textareas[0]).toHaveValue('Introdução do projeto');
    expect(textareas[1]).toHaveValue('Conclusão');

    // Should render editing controls (Delete buttons)
    const deleteButtons = screen.getAllByRole('button', { name: 'Excluir bloco' });
    expect(deleteButtons).toHaveLength(2);

    // Move up/down buttons are also rendered
    const moveButtons = screen.getAllByRole('button', { name: /Mover/i });
    expect(moveButtons.length).toBeGreaterThan(0);
  });

  it('renders empty state when there are no blocks', () => {
    render(
      <ProposalDocumentEditor
        blocks={[]}
        proposal={mockProposal}
        onUpdateBlocks={vi.fn()}
        readOnly={false}
      />
    );

    expect(screen.getByRole('button', { name: /Começar a escrever/i })).toBeInTheDocument();
  });

  it('handles adding an initial block', () => {
    const handleUpdate = vi.fn();
    render(
      <ProposalDocumentEditor
        blocks={[]}
        proposal={mockProposal}
        onUpdateBlocks={handleUpdate}
        readOnly={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Começar a escrever/i }));

    expect(handleUpdate).toHaveBeenCalledWith([
      { id: 'mock-uuid', type: 'text', content: '', order: 0 }
    ]);
  });

  it('handles adding a block via the plus separator', () => {
    const handleUpdate = vi.fn();
    render(
      <ProposalDocumentEditor
        blocks={mockTextBlocks}
        proposal={mockProposal}
        onUpdateBlocks={handleUpdate}
        readOnly={false}
      />
    );

    // There should be a separator after each block. Click the first one.
    const separators = screen.getAllByText('Texto');
    fireEvent.click(separators[0].closest('[role="button"]')!);

    const newBlocks = [...mockTextBlocks];
    newBlocks.splice(1, 0, { id: 'mock-uuid', type: 'text', content: '', order: 1 });
    expect(handleUpdate).toHaveBeenCalledWith(newBlocks);
  });

  it('handles keyboard activation on the plus separator', () => {
    const handleUpdate = vi.fn();
    render(
      <ProposalDocumentEditor
        blocks={mockTextBlocks}
        proposal={mockProposal}
        onUpdateBlocks={handleUpdate}
        readOnly={false}
      />
    );

    const separator = screen.getAllByText('Texto')[0].closest('[role="button"]')!;
    fireEvent.keyDown(separator, { key: 'Enter' });

    expect(handleUpdate).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(separator, { key: ' ' });
    expect(handleUpdate).toHaveBeenCalledTimes(2);
  });

  it('handles editing a text block', () => {
    const handleUpdate = vi.fn();
    render(
      <ProposalDocumentEditor
        blocks={mockTextBlocks}
        proposal={mockProposal}
        onUpdateBlocks={handleUpdate}
        readOnly={false}
      />
    );

    const textareas = screen.getAllByPlaceholderText('Escreva seu texto aqui...');
    fireEvent.change(textareas[0], { target: { value: 'Nova introdução' } });

    expect(handleUpdate).toHaveBeenCalledWith([
      { ...mockTextBlocks[0], content: 'Nova introdução' },
      mockTextBlocks[1],
      mockTextBlocks[2]
    ]);
  });

  it('handles deleting a text block', () => {
    const handleUpdate = vi.fn();
    render(
      <ProposalDocumentEditor
        blocks={mockTextBlocks}
        proposal={mockProposal}
        onUpdateBlocks={handleUpdate}
        readOnly={false}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: 'Excluir bloco' });
    fireEvent.click(deleteButtons[0]);

    expect(handleUpdate).toHaveBeenCalledWith([
      mockTextBlocks[1],
      mockTextBlocks[2]
    ]);
  });

  it('handles moving a block down', () => {
    const handleUpdate = vi.fn();
    render(
      <ProposalDocumentEditor
        blocks={mockTextBlocks}
        proposal={mockProposal}
        onUpdateBlocks={handleUpdate}
        readOnly={false}
      />
    );

    // Click "move down" on the first block
    const moveDownButtons = screen.getAllByRole('button', { name: 'Mover bloco para baixo' });
    fireEvent.click(moveDownButtons[0]);

    expect(handleUpdate).toHaveBeenCalledWith([
      mockTextBlocks[1],
      mockTextBlocks[0],
      mockTextBlocks[2]
    ]);
  });

  it('handles moving a block up', () => {
    const handleUpdate = vi.fn();
    render(
      <ProposalDocumentEditor
        blocks={mockTextBlocks}
        proposal={mockProposal}
        onUpdateBlocks={handleUpdate}
        readOnly={false}
      />
    );

    // Click "move up" on the second block
    const moveUpButtons = screen.getAllByRole('button', { name: 'Mover bloco para cima' });
    fireEvent.click(moveUpButtons[1]);

    expect(handleUpdate).toHaveBeenCalledWith([
      mockTextBlocks[1],
      mockTextBlocks[0],
      mockTextBlocks[2]
    ]);
  });

  it('does not move out of bounds', () => {
    const handleUpdate = vi.fn();
    render(
      <ProposalDocumentEditor
        blocks={mockTextBlocks}
        proposal={mockProposal}
        onUpdateBlocks={handleUpdate}
        readOnly={false}
      />
    );

    // Attempt to move first block up
    const moveUpButtons = screen.getAllByRole('button', { name: 'Mover bloco para cima' });
    fireEvent.click(moveUpButtons[0]);
    expect(handleUpdate).not.toHaveBeenCalled();

    // Attempt to move last block down
    const moveDownButtons = screen.getAllByRole('button', { name: 'Mover bloco para baixo' });
    fireEvent.click(moveDownButtons[moveDownButtons.length - 1]);
    expect(handleUpdate).not.toHaveBeenCalled();
  });
});
