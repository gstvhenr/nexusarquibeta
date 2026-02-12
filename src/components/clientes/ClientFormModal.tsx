import React, { useState, useEffect, useMemo, useRef, useId } from 'react';
import Modal from '../ui/Modal';
import type { Client, ProjectMeeting, ClientContact } from '../../types';
import { clientStatuses } from '../../types';
import {
  SERVICE_INTEREST_OPTIONS,
  PIPELINE_STATUS_OPTIONS,
  LEAD_SOURCE_OPTIONS,
} from '../../constants';
import { TrashIcon, PlusIcon, ChevronDownIcon } from '../ui/icons';
import {
  formatDateWithTime,
  formatPhone,
  formatCpfCnpj,
  formatCurrency,
  formatDate,
  formatCEP,
} from '../../utils/formatters';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '../../context/DataContext';
import { calculateProjectFinancialSummary } from '../../services/clientFinancialSummaryService';

const getInitialClient = (): Client => ({
  id: '',
  name: '',
  cpfCnpj: '',
  clientType: 'PF',
  birthDate: '',
  representative: { name: '', relationship: '', role: '' },
  contacts: [{ id: uuidv4(), phone: '', hasWhatsApp: false, isPrimary: true }],
  email: '',
  status: 'Potencial Cliente',
  leadSource: 'Não informado',
  serviceInterests: [],
  address: {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zip: '',
    complement: '',
  },
  isFavorite: false,
  isUrgent: false,
  registrationDate: new Date().toISOString(),
  lastContactDate: new Date().toISOString(),
  pipelineStatus: PIPELINE_STATUS_OPTIONS[0],
  meetings: [],
  behavioralProfile: { notes: '' },
  archived: false,
});

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client, originalClient: Client | null) => void;
  initialClient: Client | null;
  isReadOnly: boolean;
  onSwitchToEdit: () => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClient,
  isReadOnly,
  onSwitchToEdit,
}) => {
  const { projects } = useData();
  const formId = useId();
  const fieldId = (name: string) => `${formId}-${name}`;
  const [client, setClient] = useState<Client>(initialClient || getInitialClient());
  const [activeTab, setActiveTab] = useState('info');
  const [isInterestsDropdownOpen, setInterestsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State for the new meeting form
  const [newMeeting, setNewMeeting] = useState<Partial<ProjectMeeting>>({
    date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      const clientData = initialClient
        ? JSON.parse(JSON.stringify(initialClient))
        : getInitialClient();
      if (initialClient && !clientData.contacts) {
        clientData.contacts = [];
      }
      if (initialClient && clientData.contacts.length === 0 && (clientData as any).phone) {
        clientData.contacts.push({
          id: uuidv4(),
          phone: (clientData as any).phone,
          hasWhatsApp: !!(clientData as any).phoneHasWhatsApp,
          isPrimary: true,
        });
      }
      // Ensure clientType has a default
      if (!clientData.clientType) clientData.clientType = 'PF';

      setClient(clientData);
      setActiveTab('info');
      setNewMeeting({ date: new Date().toISOString().split('T')[0], reason: '', notes: '' });
      setInterestsDropdownOpen(false);
    }
  }, [initialClient, isOpen]);

  // Handle clicking outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setInterestsDropdownOpen(false);
      }
    };
    if (isInterestsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isInterestsDropdownOpen]);

  const clientProjects = useMemo(() => {
    if (!client.id) return [];
    return projects.filter((p) => p.clientId === client.id && !p.archived);
  }, [projects, client.id]);

  const financialSummaries = useMemo(() => {
    return clientProjects.map((p) => ({
      ...calculateProjectFinancialSummary(p),
      projectId: p.id,
      projectName: p.name,
    }));
  }, [clientProjects]);

  const handleChange = (field: keyof Client, value: any) =>
    setClient((c) => ({ ...c, [field]: value }));
  const handleAddressChange = (field: keyof Client['address'], value: string) =>
    setClient((c) => ({ ...c, address: { ...c.address, [field]: value } }));
  const handleRepChange = (field: keyof NonNullable<Client['representative']>, value: string) =>
    setClient((c) => ({
      ...c,
      representative: { ...(c.representative || { name: '', relationship: '' }), [field]: value },
    }));

  const handleContactChange = (id: string, field: keyof Omit<ClientContact, 'id'>, value: any) => {
    let newContacts = client.contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    if (field === 'isPrimary' && value === true) {
      newContacts = newContacts.map((c) => (c.id === id ? c : { ...c, isPrimary: false }));
    }
    setClient((c) => ({ ...c, contacts: newContacts }));
  };

  const handleAddContact = () => {
    if (client.contacts.length >= 3) return;
    const newContact: ClientContact = {
      id: uuidv4(),
      phone: '',
      hasWhatsApp: false,
      isPrimary: client.contacts.length === 0,
    };
    setClient((c) => ({ ...c, contacts: [...c.contacts, newContact] }));
  };

  const handleRemoveContact = (id: string) => {
    let remainingContacts = client.contacts.filter((c) => c.id !== id);
    if (!remainingContacts.some((c) => c.isPrimary) && remainingContacts.length > 0) {
      remainingContacts[0].isPrimary = true;
    }
    setClient((c) => ({ ...c, contacts: remainingContacts }));
  };

  const handleServiceInterestChange = (interest: string, checked: boolean) => {
    const newInterests = checked
      ? [...client.serviceInterests, interest]
      : client.serviceInterests.filter((i) => i !== interest);
    handleChange('serviceInterests', newInterests);
  };

  const handleAddMeeting = () => {
    if (!newMeeting.reason?.trim() && !newMeeting.notes?.trim()) return;

    const project = projects.find((p) => p.id === newMeeting.projectId);

    const meetingToAdd: ProjectMeeting = {
      id: uuidv4(),
      date: newMeeting.date || new Date().toISOString(),
      reason: newMeeting.reason || 'Reunião de Acompanhamento',
      notes: newMeeting.notes || '',
      projectId: newMeeting.projectId,
      projectName: project?.name,
    };

    setClient((c) => ({ ...c, meetings: [meetingToAdd, ...(c.meetings || [])] }));
    setNewMeeting({ date: new Date().toISOString().split('T')[0], reason: '', notes: '' });
  };

  const handleDeleteMeeting = (id: string) => {
    setClient((c) => ({ ...c, meetings: (c.meetings || []).filter((m) => m.id !== id) }));
  };

  const handleSave = () => onSave(client, initialClient);

  const getModifiedClass = (currentVal: any, originalVal: any) => {
    if (isReadOnly || !initialClient) return 'border-border-color';
    const v1 = currentVal === null || currentVal === undefined ? '' : String(currentVal);
    const v2 = originalVal === null || originalVal === undefined ? '' : String(originalVal);
    return v1 !== v2 ? 'border-yellow-500 ring-1 ring-yellow-500/20' : 'border-border-color';
  };

  const commonInputClass =
    'w-full bg-background p-2 rounded-md border focus:border-accent text-text-primary transition disabled:opacity-70 disabled:cursor-not-allowed';
  const tabButtonClass = (tabId: string) =>
    `whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tabId ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'}`;

  const isPJ = client.clientType === 'PJ';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReadOnly ? 'Detalhes do Cliente' : initialClient ? 'Editar Cliente' : 'Novo Cliente'}
      size="5xl"
    >
      {initialClient && (
        <div className="border-b border-border-color mb-4">
          <nav className="-mb-px flex space-x-6">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={tabButtonClass('info')}
            >
              Informações Gerais
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className={tabButtonClass('finance')}
            >
              Financeiro
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('meetings')}
              className={tabButtonClass('meetings')}
            >
              Reuniões
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={tabButtonClass('notes')}
            >
              Observações
            </button>
            {(initialClient?.auditLog || []).length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={tabButtonClass('audit')}
              >
                Histórico
              </button>
            )}
          </nav>
        </div>
      )}
      <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-4 -mr-4 p-1">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <fieldset className="p-4 border rounded-lg border-border-color">
              <legend className="px-2 font-semibold text-secondary">Identificação</legend>

              {/* PF/PJ Selector - Mandatory on top */}
              <div className="flex gap-4 mb-4 px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="clientType"
                    value="PF"
                    checked={client.clientType === 'PF'}
                    onChange={() => handleChange('clientType', 'PF')}
                    className="accent-primary"
                    disabled={isReadOnly}
                  />
                  <span className="text-sm font-medium text-text-primary">Pessoa Física</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="clientType"
                    value="PJ"
                    checked={client.clientType === 'PJ'}
                    onChange={() => handleChange('clientType', 'PJ')}
                    className="accent-primary"
                    disabled={isReadOnly}
                  />
                  <span className="text-sm font-medium text-text-primary">Pessoa Jurídica</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="md:col-span-1">
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('name')}
                  >
                    {isPJ ? 'Razão Social' : 'Nome Completo'}
                  </label>
                  <input
                    id={fieldId('name')}
                    type="text"
                    value={client.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`${commonInputClass} ${getModifiedClass(client.name, initialClient?.name)}`}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="md:col-span-1">
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('birthDate')}
                  >
                    {isPJ ? 'Data de Abertura' : 'Data de Nascimento'}
                  </label>
                  <input
                    id={fieldId('birthDate')}
                    type="date"
                    value={client.birthDate || ''}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    className={`${commonInputClass} ${getModifiedClass(client.birthDate, initialClient?.birthDate)}`}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="md:col-span-1">
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('cpfCnpj')}
                  >
                    {isPJ ? 'CNPJ' : 'CPF'}
                  </label>
                  <input
                    id={fieldId('cpfCnpj')}
                    type="text"
                    value={client.cpfCnpj || ''}
                    onChange={(e) => handleChange('cpfCnpj', formatCpfCnpj(e.target.value))}
                    className={`${commonInputClass} ${getModifiedClass(client.cpfCnpj, initialClient?.cpfCnpj)}`}
                    disabled={isReadOnly}
                  />
                </div>

                {isPJ && (
                  <>
                    <div className="md:col-span-2">
                      <label
                        className="block text-sm font-medium text-text-secondary mb-1"
                        htmlFor={fieldId('rep-name')}
                      >
                        Nome do Representante
                      </label>
                      <input
                        id={fieldId('rep-name')}
                        type="text"
                        value={client.representative?.name || ''}
                        onChange={(e) => handleRepChange('name', e.target.value)}
                        className={`${commonInputClass} ${getModifiedClass(client.representative?.name, initialClient?.representative?.name)}`}
                        disabled={isReadOnly}
                        placeholder="Nome do contato principal"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label
                        className="block text-sm font-medium text-text-secondary mb-1"
                        htmlFor={fieldId('rep-role')}
                      >
                        Cargo
                      </label>
                      <input
                        id={fieldId('rep-role')}
                        type="text"
                        value={client.representative?.role || ''}
                        onChange={(e) => handleRepChange('role', e.target.value)}
                        className={`${commonInputClass} ${getModifiedClass(client.representative?.role, initialClient?.representative?.role)}`}
                        disabled={isReadOnly}
                        placeholder="Cargo"
                      />
                    </div>
                  </>
                )}
              </div>
            </fieldset>
            <fieldset className="p-4 border rounded-lg border-border-color">
              <legend className="px-2 font-semibold text-secondary">Contatos</legend>
              <div className="space-y-3 pt-2">
                {client.contacts?.map((contact, index) => (
                  <div
                    key={contact.id}
                    className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-center"
                  >
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(contact.id, 'phone', e.target.value)}
                      onBlur={(e) =>
                        handleContactChange(contact.id, 'phone', formatPhone(e.target.value))
                      }
                      className={`${commonInputClass} ${initialClient?.contacts?.find((c) => c.id === contact.id)?.phone !== contact.phone ? 'border-yellow-500 ring-1 ring-yellow-500/20' : 'border-border-color'}`}
                      placeholder={`Telefone ${index + 1}`}
                      aria-label={`Telefone ${index + 1}`}
                      disabled={isReadOnly}
                    />
                    <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={contact.hasWhatsApp}
                        onChange={(e) =>
                          handleContactChange(contact.id, 'hasWhatsApp', e.target.checked)
                        }
                        className="rounded accent-primary"
                        disabled={isReadOnly}
                      />{' '}
                      WhatsApp
                    </label>
                    <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                      <input
                        type="radio"
                        name="primary-contact"
                        checked={contact.isPrimary}
                        onChange={(e) =>
                          handleContactChange(contact.id, 'isPrimary', e.target.checked)
                        }
                        className="accent-primary"
                        disabled={isReadOnly}
                      />{' '}
                      Principal
                    </label>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(contact.id)}
                        className="p-2 text-gray-400 hover:text-error"
                        aria-label={`Remover telefone ${index + 1}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {!isReadOnly && (client.contacts?.length || 0) < 3 && (
                  <button
                    type="button"
                    onClick={handleAddContact}
                    className="w-full text-sm font-semibold text-primary p-2 rounded-md hover:bg-primary/10 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 inline mr-1" /> Adicionar Telefone
                  </button>
                )}
                <div className="mt-4">
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('email')}
                  >
                    Email
                  </label>
                  <input
                    id={fieldId('email')}
                    type="email"
                    value={client.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`${commonInputClass} ${getModifiedClass(client.email, initialClient?.email)}`}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </fieldset>
            <fieldset className="p-4 border rounded-lg border-border-color">
              <legend className="px-2 font-semibold text-secondary">Endereço</legend>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-2">
                <div className="md:col-span-4">
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('address-street')}
                  >
                    Logradouro
                  </label>
                  <input
                    id={fieldId('address-street')}
                    type="text"
                    value={client.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className={`${commonInputClass} ${getModifiedClass(client.address.street, initialClient?.address.street)}`}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('address-number')}
                  >
                    Número
                  </label>
                  <input
                    id={fieldId('address-number')}
                    type="text"
                    value={client.address.number}
                    onChange={(e) => handleAddressChange('number', e.target.value)}
                    className={`${commonInputClass} ${getModifiedClass(client.address.number, initialClient?.address.number)}`}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="md:col-span-6">
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('address-complement')}
                  >
                    Complemento
                  </label>
                  <input
                    id={fieldId('address-complement')}
                    type="text"
                    value={client.address.complement || ''}
                    onChange={(e) => handleAddressChange('complement', e.target.value)}
                    className={`${commonInputClass} ${getModifiedClass(client.address.complement, initialClient?.address.complement)}`}
                    disabled={isReadOnly}
                    placeholder="Opcional"
                  />
                </div>
                <div className="md:col-span-3">
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('address-neighborhood')}
                  >
                    Bairro
                  </label>
                  <input
                    id={fieldId('address-neighborhood')}
                    type="text"
                    value={client.address.neighborhood}
                    onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                    className={`${commonInputClass} ${getModifiedClass(client.address.neighborhood, initialClient?.address.neighborhood)}`}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="md:col-span-3">
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('address-city')}
                  >
                    Cidade
                  </label>
                  <input
                    id={fieldId('address-city')}
                    type="text"
                    value={client.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className={`${commonInputClass} ${getModifiedClass(client.address.city, initialClient?.address.city)}`}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="md:col-span-1">
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('address-state')}
                  >
                    Estado
                  </label>
                  <input
                    id={fieldId('address-state')}
                    type="text"
                    value={client.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className={commonInputClass}
                    disabled={true}
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('address-zip')}
                  >
                    CEP
                  </label>
                  <input
                    id={fieldId('address-zip')}
                    type="text"
                    value={client.address.zip}
                    onChange={(e) => handleAddressChange('zip', formatCEP(e.target.value))}
                    className={`${commonInputClass} ${getModifiedClass(client.address.zip, initialClient?.address.zip)}`}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </fieldset>
            <fieldset className="p-4 border rounded-lg border-border-color">
              <legend className="px-2 font-semibold text-secondary">Status e Interesses</legend>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 items-start">
                <div>
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('status')}
                  >
                    Status do Cliente
                  </label>
                  <select
                    id={fieldId('status')}
                    value={client.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className={`${commonInputClass} ${getModifiedClass(client.status, initialClient?.status)}`}
                    disabled={isReadOnly}
                  >
                    {clientStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('pipelineStatus')}
                  >
                    Status no Pipeline
                  </label>
                  <select
                    id={fieldId('pipelineStatus')}
                    value={client.pipelineStatus}
                    onChange={(e) => handleChange('pipelineStatus', e.target.value)}
                    className={`${commonInputClass} ${getModifiedClass(client.pipelineStatus, initialClient?.pipelineStatus)}`}
                    disabled={isReadOnly}
                  >
                    {PIPELINE_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('leadSource')}
                  >
                    Fonte do Lead
                  </label>
                  <select
                    id={fieldId('leadSource')}
                    value={client.leadSource}
                    onChange={(e) => handleChange('leadSource', e.target.value)}
                    className={`${commonInputClass} ${getModifiedClass(client.leadSource, initialClient?.leadSource)}`}
                    disabled={isReadOnly}
                  >
                    {LEAD_SOURCE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Multi-select Dropdown for Services */}
                <div className="relative" ref={dropdownRef}>
                  <label
                    className="block text-sm font-medium text-text-secondary mb-1"
                    htmlFor={fieldId('serviceInterests')}
                  >
                    Serviços de Interesse
                  </label>
                  <button
                    id={fieldId('serviceInterests')}
                    type="button"
                    onClick={() =>
                      !isReadOnly && setInterestsDropdownOpen(!isInterestsDropdownOpen)
                    }
                    className={`${commonInputClass} text-left flex justify-between items-center ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'} ${JSON.stringify(client.serviceInterests) !== JSON.stringify(initialClient?.serviceInterests) ? 'border-yellow-500 ring-1 ring-yellow-500/20' : 'border-border-color'}`}
                    disabled={isReadOnly}
                  >
                    <span className="truncate block">
                      {client.serviceInterests.length > 0
                        ? `${client.serviceInterests.length} selecionado(s)`
                        : 'Selecione os serviços...'}
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${isInterestsDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isInterestsDropdownOpen && (
                    <div className="absolute z-20 bottom-full left-0 right-0 mb-1 bg-surface border border-border-color rounded-lg shadow-lifted max-h-60 overflow-y-auto custom-scrollbar p-1">
                      {SERVICE_INTEREST_OPTIONS.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 p-2 hover:bg-background rounded-md cursor-pointer transition-colors text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={client.serviceInterests.includes(opt)}
                            onChange={(e) => handleServiceInterestChange(opt, e.target.checked)}
                            className="rounded accent-primary w-4 h-4"
                          />
                          <span className="text-text-primary">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-full text-xs text-text-secondary mt-1">
                  Cliente desde: {formatDate(client.registrationDate)}
                </div>
              </div>

              {/* Display selected interests as tags below for better visibility */}
              {client.serviceInterests.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {client.serviceInterests.map((interest) => (
                    <span
                      key={interest}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </fieldset>
          </div>
        )}
        {activeTab === 'finance' && (
          <div className="space-y-4">
            {financialSummaries.length > 0 ? (
              financialSummaries.map((summary) => (
                <div key={summary.projectId} className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg text-text-primary border-b border-border-color pb-2 mb-3">
                    {summary.projectName}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-text-secondary">Pendente</p>
                      <p className="font-bold text-lg text-warning">
                        {formatCurrency(summary.pending)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Atrasado</p>
                      <p className="font-bold text-lg text-error">
                        {formatCurrency(summary.overdue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Total Pago</p>
                      <p className="font-bold text-lg text-success">
                        {formatCurrency(summary.paid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Valor Total</p>
                      <p className="font-bold text-lg text-secondary">
                        {formatCurrency(summary.totalValue)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-text-secondary py-8">
                Nenhum projeto ativo para exibir dados financeiros.
              </p>
            )}
          </div>
        )}
        {activeTab === 'meetings' && (
          <div className="space-y-6">
            {!isReadOnly && (
              <div className="bg-background/50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-text-primary">Registrar Nova Reunião</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={newMeeting.projectId || ''}
                    onChange={(e) => setNewMeeting((m) => ({ ...m, projectId: e.target.value }))}
                    className={commonInputClass}
                    aria-label="Projeto da reunião"
                  >
                    <option value="">Vincular Projeto (Opcional)</option>
                    {clientProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting((m) => ({ ...m, date: e.target.value }))}
                    className={commonInputClass}
                    aria-label="Data da reunião"
                  />
                  <input
                    type="text"
                    placeholder="Motivo da Reunião"
                    value={newMeeting.reason || ''}
                    onChange={(e) => setNewMeeting((m) => ({ ...m, reason: e.target.value }))}
                    className={commonInputClass}
                    aria-label="Motivo da reunião"
                  />
                </div>
                <textarea
                  value={newMeeting.notes || ''}
                  onChange={(e) => setNewMeeting((m) => ({ ...m, notes: e.target.value }))}
                  rows={3}
                  placeholder="Descreva o que foi discutido..."
                  className={commonInputClass}
                  aria-label="Anotações da reunião"
                ></textarea>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleAddMeeting}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-secondary text-secondary-content hover:bg-secondary-focus"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <h4 className="font-semibold text-text-secondary">Histórico de Reuniões</h4>
              {(client.meetings || [])
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((meeting) => (
                  <div
                    key={meeting.id}
                    className="bg-background p-3 rounded-lg flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="flex items-baseline gap-4">
                        <p className="text-xs text-text-secondary font-semibold">
                          {formatDateWithTime(meeting.date)}
                        </p>
                        {meeting.projectName && (
                          <p className="text-xs font-bold text-primary">{meeting.projectName}</p>
                        )}
                      </div>
                      <p className="font-semibold text-text-primary mt-1">{meeting.reason}</p>
                      <p className="text-sm whitespace-pre-wrap mt-1">{meeting.notes}</p>
                    </div>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="p-1 text-gray-400 hover:text-error"
                        aria-label="Remover reunião"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
        {activeTab === 'notes' && (
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-text-secondary"
              htmlFor={fieldId('generalNotes')}
            >
              Observações Gerais
            </label>
            <textarea
              id={fieldId('generalNotes')}
              value={client.generalNotes || ''}
              onChange={(e) => handleChange('generalNotes', e.target.value)}
              rows={12}
              placeholder="Adicione anotações gerais sobre o cliente, preferências, histórico de contatos, etc."
              className={`${commonInputClass} ${getModifiedClass(client.generalNotes, initialClient?.generalNotes)}`}
              disabled={isReadOnly}
            />
          </div>
        )}
        {activeTab === 'audit' && (
          <div className="space-y-2 text-sm">
            {(client.auditLog || [])
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((log, index) => (
                <div key={index} className="bg-background p-3 rounded-lg">
                  <p>
                    <strong className="text-secondary">{log.field}</strong> alterado de{' '}
                    <span className="italic text-text-secondary">
                      "{JSON.stringify(log.oldValue)}"
                    </span>{' '}
                    para{' '}
                    <span className="italic text-text-primary">
                      "{JSON.stringify(log.newValue)}"
                    </span>
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {formatDateWithTime(log.timestamp)}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        {isReadOnly ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={onSwitchToEdit}
              className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors"
            >
              Editar Cliente
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors"
            >
              Salvar Alterações
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};
