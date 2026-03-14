import React from 'react';
import { Button, Input, Modal } from '../ui';
import { SearchIcon, TrashIcon } from '../ui/icons';
import type { Client } from '../../types';

type ClientSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  manualSearch: string;
  onManualSearchChange: (value: string) => void;
  clients: Client[];
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onToggleClient: (id: string) => void;
  onClearSelection: () => void;
};

export const ClientSelectionModal: (props: ClientSelectionModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  manualSearch,
  onManualSearchChange,
  clients,
  selectedIds,
  onToggleSelectAll,
  onToggleClient,
  onClearSelection,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleção de Clientes" size="2xl">
      <div className="flex flex-col h-[50vh]">
        <div className="p-1 mb-4 flex gap-3 items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={manualSearch}
              onChange={(e) => onManualSearchChange(e.target.value)}
              leftIcon={<SearchIcon className="w-5 h-5" />}
              className="py-3"
              autoFocus
              aria-label="Buscar cliente para seleção"
            />
          </div>
          <Button variant="secondary" onClick={onToggleSelectAll}>
            {selectedIds.size === clients.length ? 'Desmarcar Todos' : 'Marcar Todos'}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar border border-border-color rounded-xl bg-background/30 p-2">
          <div className="space-y-1">
            {clients.length > 0 ? (
              clients.map((client) => (
                <label
                  key={client.id}
                  className="flex items-center gap-3 p-3 hover:bg-surface rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-border-color"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(client.id)}
                    onChange={() => onToggleClient(client.id)}
                    className="rounded accent-primary w-5 h-5 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                      {client.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {client.cpfCnpj || 'Sem documento'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full font-bold ${client.archived ? 'bg-background border text-text-secondary' : 'bg-success/10 text-success'}`}
                  >
                    {client.archived ? 'Arquivado' : 'Ativo'}
                  </span>
                </label>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                <SearchIcon className="w-12 h-12 opacity-20 mb-2" />
                <p className="text-sm">Nenhum cliente encontrado.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-2 border-t border-border-color">
          <div className="text-sm text-text-secondary font-medium">
            {selectedIds.size} selecionado(s)
          </div>
          <div className="flex gap-3">
            {selectedIds.size > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={onClearSelection}
                className="flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" /> Limpar Seleção
              </Button>
            )}
            <Button variant="primary" onClick={onClose}>
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
