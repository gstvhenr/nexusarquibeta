import React from 'react';
import type { Proposal, ProposalBlock } from '../../types';
import { BudgetTableBlock } from './BudgetTableBlock';
import {
  IconButton,
  PlusIcon,
  TrashIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  Button,
  Textarea,
} from '../ui';
import { v4 as uuidv4 } from 'uuid';

// --- Internal sub-component ---

const TextBlockEditor: (props: {
  content: string;
  onChange: (val: string) => void;
  onDelete: () => void;
  isEditing: boolean;
}) => React.ReactNode = ({ content, onChange, onDelete, isEditing }) => {
  return (
    <div className="relative group mb-4">
      {isEditing ? (
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-background p-4 rounded-lg border border-border-color focus:border-accent text-base leading-relaxed min-h-[100px]"
          placeholder="Escreva seu texto aqui..."
        />
      ) : (
        <div className="prose max-w-none text-text-primary whitespace-pre-wrap p-2">{content}</div>
      )}
      {isEditing && (
        <IconButton
          variant="danger"
          size="sm"
          onClick={onDelete}
          aria-label="Excluir bloco"
          className="absolute -right-3 -top-3 bg-surface border border-border-color shadow-sm"
        >
          <TrashIcon className="w-4 h-4" />
        </IconButton>
      )}
    </div>
  );
};

/**
 * Document editor for proposal content blocks (text + budget table).
 * input -> blocks, proposal, onUpdateBlocks callback, readOnly flag
 * output -> rendered proposal document with editing controls
 */
export const ProposalDocumentEditor: (props: {
  blocks: ProposalBlock[];
  proposal: Proposal;
  onUpdateBlocks: (blocks: ProposalBlock[]) => void;
  readOnly: boolean;
}) => React.ReactNode = ({ blocks, proposal, onUpdateBlocks, readOnly }) => {
  const addTextBlock = (index: number) => {
    const newBlock: ProposalBlock = { id: uuidv4(), type: 'text', content: '', order: index };
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    onUpdateBlocks(newBlocks);
  };

  const handleContentChange = (id: string, newContent: string) => {
    onUpdateBlocks(blocks.map((b) => (b.id === id ? { ...b, content: newContent } : b)));
  };

  const handleDeleteBlock = (id: string) => {
    onUpdateBlocks(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    onUpdateBlocks(newBlocks);
  };

  return (
    <div className="h-full p-12 relative">
      {/* Header / Letterhead */}
      <div className="border-b-2 border-primary pb-6 mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-serif text-3xl font-bold text-secondary">
            Rafael Munaro Arquitetura
          </h1>
          <p className="text-sm text-text-secondary mt-1">CAU: A231798-2 | (19) 99690-8104</p>
          <p className="text-sm text-text-secondary">
            Rua Padre Fabiano, 1072 - Centro, Capivari-SP
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-text-primary">Proposta Comercial</h2>
          <p className="text-sm text-text-secondary">{proposal.code}</p>
          {proposal.showProposalDate !== false && (
            <p className="text-sm text-text-secondary">{proposal.date}</p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-serif text-2xl font-bold text-center text-primary mb-2">
          {proposal.name}
        </h3>
        <p className="text-center text-text-secondary">Projeto de Arquitetura & Interiores</p>
      </div>

      {/* Blocks */}
      <div className="space-y-6">
        {blocks.map((block, index) => (
          <div key={block.id} className="relative group/block">
            {!readOnly && (
              <div className="absolute -left-10 top-2 flex flex-col gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
                <IconButton
                  variant="primary"
                  size="sm"
                  onClick={() => moveBlock(index, -1)}
                  aria-label="Mover bloco para cima"
                >
                  <ArrowUpCircleIcon className="w-5 h-5" />
                </IconButton>
                <IconButton
                  variant="primary"
                  size="sm"
                  onClick={() => moveBlock(index, 1)}
                  aria-label="Mover bloco para baixo"
                >
                  <ArrowDownCircleIcon className="w-5 h-5" />
                </IconButton>
              </div>
            )}

            {block.type === 'text' && (
              <TextBlockEditor
                content={block.content || ''}
                onChange={(val) => handleContentChange(block.id, val)}
                onDelete={() => handleDeleteBlock(block.id)}
                isEditing={!readOnly}
              />
            )}

            {block.type === 'budget_table' && (
              <div
                className={`transition-colors ${!readOnly ? 'border-2 border-dashed border-transparent hover:border-primary/20 rounded p-2' : ''}`}
              >
                <BudgetTableBlock
                  proposal={proposal}
                  showItemPrices={proposal.showItemPrices !== false}
                  showSectionTotals={proposal.showSectionTotals !== false}
                  showDiscount={proposal.discount > 0 && proposal.showDiscount !== false}
                  showGrandTotal={proposal.showGrandTotal !== false}
                  totalsAlignment={proposal.totalsAlignment === 'left' ? 'left' : 'right'}
                />
                {!readOnly && (
                  <p className="text-center text-xs text-text-secondary mb-2">
                    Tabela de Orçamento (Gerada Automaticamente)
                  </p>
                )}
              </div>
            )}

            {!readOnly && (
              <div
                className="h-4 group/add flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity my-2 cursor-pointer"
                onClick={() => addTextBlock(index + 1)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    (() => addTextBlock(index + 1))();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="h-px bg-primary/30 w-full relative">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-primary text-primary px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <PlusIcon className="w-3 h-3" /> Texto
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Initial Add Button if empty */}
      {!readOnly && blocks.length === 0 && (
        <Button
          variant="ghost"
          onClick={() => addTextBlock(0)}
          className="w-full py-8 border-2 border-dashed border-border-color rounded-lg text-text-secondary hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center"
        >
          <PlusIcon className="w-8 h-8 mb-2" />
          <span>Começar a escrever a proposta</span>
        </Button>
      )}
    </div>
  );
};
