import { useCallback } from 'react';
import type { Client, ClientContact } from '../types';
import { saveClientAndUpdateState } from '../services/clientService';
import { v4 as uuidv4 } from 'uuid';

export interface UseClienteDetalhesFormArgs {
  client: Client | null;
  setClient: React.Dispatch<React.SetStateAction<Client | null>>;
  originalClient: Client | undefined;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  setShowSaveSuccess: (v: boolean) => void;
}

/**
 * Core form handlers for the client details page.
 * @returns All field-level change handlers, save, and cancel actions.
 */
export function useClienteDetalhesForm({
  client,
  setClient,
  originalClient,
  clients,
  setClients,
  isEditing,
  setIsEditing,
  setShowSaveSuccess,
}: UseClienteDetalhesFormArgs) {
  const handleChange = useCallback(
    (field: keyof Client, value: Client[keyof Client]) =>
      setClient((c) => (c ? { ...c, [field]: value } : null)),
    [setClient],
  );

  const handleAddressChange = useCallback(
    (field: keyof Client['address'], value: string) =>
      setClient((c) => (c ? { ...c, address: { ...c.address, [field]: value } } : null)),
    [setClient],
  );

  const handleRepChange = useCallback(
    (field: keyof NonNullable<Client['representative']>, value: string) =>
      setClient((c) =>
        c
          ? {
              ...c,
              representative: {
                ...(c.representative || { name: '', relationship: '' }),
                [field]: value,
              },
            }
          : null,
      ),
    [setClient],
  );

  const handleContactChange = useCallback(
    (id: string, field: keyof Omit<ClientContact, 'id'>, value: string | boolean) => {
      if (!client) return;
      let newContacts = client.contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c));
      if (field === 'isPrimary' && value === true) {
        newContacts = newContacts.map((c) => (c.id === id ? c : { ...c, isPrimary: false }));
      }
      setClient((c) => (c ? { ...c, contacts: newContacts } : null));
    },
    [client, setClient],
  );

  const handleAddContact = useCallback(() => {
    if (!client || client.contacts.length >= 3) return;
    const newContact: ClientContact = {
      id: uuidv4(),
      phone: '',
      hasWhatsApp: false,
      isPrimary: client.contacts.length === 0,
    };
    setClient((c) => (c ? { ...c, contacts: [...c.contacts, newContact] } : null));
  }, [client, setClient]);

  const handleRemoveContact = useCallback(
    (id: string) => {
      if (!client) return;
      const remainingContacts = client.contacts.filter((c) => c.id !== id);
      if (!remainingContacts.some((c) => c.isPrimary) && remainingContacts.length > 0) {
        remainingContacts[0].isPrimary = true;
      }
      setClient((c) => (c ? { ...c, contacts: remainingContacts } : null));
    },
    [client, setClient],
  );

  const handleServiceInterestChange = useCallback(
    (interest: string, checked: boolean) => {
      if (!client) return;
      const newInterests = checked
        ? [...client.serviceInterests, interest]
        : client.serviceInterests.filter((i) => i !== interest);
      handleChange('serviceInterests', newInterests);
    },
    [client, handleChange],
  );

  const handleSave = useCallback(() => {
    if (!client) return;
    const result = saveClientAndUpdateState(client, originalClient || null, clients);
    if (result.error === 'duplicate_cpf_cnpj') {
      alert('CPF/CNPJ Duplicado!');
      return;
    }
    if (result.error === 'invalid_cpf_cnpj') {
      alert('CPF/CNPJ inválido!');
      return;
    }
    setClients(result.updatedClients);
    setIsEditing(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  }, [client, originalClient, clients, setClients, setIsEditing, setShowSaveSuccess]);

  const handleCancel = useCallback(() => {
    if (originalClient) {
      setClient(JSON.parse(JSON.stringify(originalClient)));
    }
    setIsEditing(false);
  }, [originalClient, setClient, setIsEditing]);

  const getModifiedClass = useCallback(
    (currentVal: unknown, originalVal: unknown) => {
      if (!isEditing || !originalClient) return 'border-border-color';
      const v1 = currentVal === null || currentVal === undefined ? '' : String(currentVal);
      const v2 = originalVal === null || originalVal === undefined ? '' : String(originalVal);
      return v1 !== v2 ? 'border-yellow-500 ring-1 ring-yellow-500/20' : 'border-border-color';
    },
    [isEditing, originalClient],
  );

  return {
    handleChange,
    handleAddressChange,
    handleRepChange,
    handleContactChange,
    handleAddContact,
    handleRemoveContact,
    handleServiceInterestChange,
    handleSave,
    handleCancel,
    getModifiedClass,
  };
}
