import { useEffect, useMemo, useState } from 'react';
import { Button, FormField, Input, Modal, Select } from '@/components/ui';
import type { Client } from '@/types';

type SaveProposalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientInfo: { name: string; id?: string }) => void;
  clients: Client[];
  isSaving: boolean;
};

export function SaveProposalModal({
  isOpen,
  onClose,
  onSave,
  clients,
  isSaving,
}: SaveProposalModalProps): JSX.Element {
  const [isUnlinked, setIsUnlinked] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [manualClientName, setManualClientName] = useState('');
  const [error, setError] = useState('');

  const eligibleClients = useMemo(
    () =>
      clients.filter(
        (client) =>
          !client.archived &&
          (client.status === 'Cliente Ativo' || client.status === 'Potencial Cliente'),
      ),
    [clients],
  );

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (eligibleClients.length > 0) {
        setIsUnlinked(false);
        setSelectedClientId(eligibleClients[0].id);
      } else {
        setIsUnlinked(true);
      }
    }
  }, [isOpen, eligibleClients]);

  const handleSave = () => {
    if (isSaving) return;

    if (isUnlinked) {
      if (!manualClientName.trim()) {
        setError('O nome do cliente é obrigatório.');
        return;
      }
      onSave({ name: manualClientName.trim() });
      return;
    }

    const client = clients.find((item) => item.id === selectedClientId);
    if (!client) {
      setError('Cliente selecionado inválido.');
      return;
    }

    onSave({ name: client.name, id: client.id });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Salvar como Proposta">
      <div className="space-y-4">
        <p className="text-text-primary mb-4">
          Vincule a um cliente existente ou crie uma proposta avulsa.
        </p>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="unlinkedProposal"
            checked={isUnlinked}
            onChange={(event) => setIsUnlinked(event.target.checked)}
            className="h-4 w-4 rounded border-border-color accent-primary/70 focus:ring-primary/70"
          />
          <label htmlFor="unlinkedProposal" className="text-sm font-medium text-text-primary">
            Salvar Proposta Sem Vínculo
          </label>
        </div>

        {isUnlinked ? (
          <FormField label="Nome do Cliente">
            <Input
              type="text"
              value={manualClientName}
              onChange={(event) => setManualClientName(event.target.value)}
            />
          </FormField>
        ) : (
          <div>
            <Select
              id="clientSelect"
              label="Selecione o Cliente"
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
              options={
                eligibleClients.length === 0
                  ? [{ value: '', label: 'Nenhum cliente elegível' }]
                  : eligibleClients.map((client) => ({
                      value: client.id,
                      label: client.name,
                    }))
              }
              disabled={eligibleClients.length === 0}
              aria-label="Selecione o cliente"
            />
          </div>
        )}

        {error && <p className="text-error text-sm mt-2">{error}</p>}
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving} loading={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar Proposta'}
        </Button>
      </div>
    </Modal>
  );
}
