import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout';
import { useData } from '../context/DataContext';
import { saveClientAndUpdateState } from '../services/clientService';
import type { Client, ProjectMeeting, ClientContact, AgendaEvent, ClientLink } from '../types';
import { clientStatuses, projectStatuses } from '../types';
import {
  SERVICE_INTEREST_OPTIONS,
  PIPELINE_STATUS_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  NAV_LINKS,
  PROJECT_STATUS_COLORS,
} from '../constants';
import {
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  UsersIcon,
  ClockIcon,
  UsersIconV3,
  TagIcon,
  BriefcaseIcon,
  MapPinIcon,
  ArrowUpCircleIcon,
  CalendarPlusIcon,
  ProjetosIcon,
  DollarSignIcon,
  FileTextIcon,
  ArrowLeftIcon,
  LinkIcon,
} from '../components/ui';
import {
  formatDateWithTime,
  formatPhone,
  formatCpfCnpj,
  formatCurrency,
  formatDate,
  formatCEP,
} from '../utils/formatters';
import { getProjectTotalContractValue } from '../utils/projectFinancials';
import { v4 as uuidv4 } from 'uuid';
import { EventFormModal } from '../components/agenda';
import { calculateProjectFinancialSummary } from '../services/clientFinancialSummaryService';

const ClienteDetalhesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, setClients, projects, setAgendaEvents } = useData();

  // Find the client in global state
  const originalClient = useMemo(() => clients.find((c) => c.id === id), [clients, id]);

  // Local state for editing
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [isInterestsDropdownOpen, setInterestsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Link state
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  // Meeting Modal State
  const [isMeetingModalOpen, setMeetingModalOpen] = useState(false);
  const [preFilledEvent, setPreFilledEvent] = useState<AgendaEvent | null>(null);

  // State for the new meeting form (Local History)
  const [newMeeting, setNewMeeting] = useState<Partial<ProjectMeeting>>({
    date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  });

  useEffect(() => {
    if (originalClient) {
      setClient(JSON.parse(JSON.stringify(originalClient)));
    }
  }, [originalClient]);

  // Handle clicking outside of dropdown
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
    if (!client?.id) return [];
    return projects.filter((p) => p.clientId === client.id && !p.archived);
  }, [projects, client?.id]);

  const financialSummaries = useMemo(() => {
    return clientProjects.map((p) => ({
      ...calculateProjectFinancialSummary(p),
      projectId: p.id,
      projectName: p.name,
    }));
  }, [clientProjects]);

  if (!client) {
    return <div className="p-10 text-center">Carregando ou cliente não encontrado...</div>;
  }

  const handleChange = (field: keyof Client, value: any) =>
    setClient((c) => (c ? { ...c, [field]: value } : null));
  const handleAddressChange = (field: keyof Client['address'], value: string) =>
    setClient((c) => (c ? { ...c, address: { ...c.address, [field]: value } } : null));
  const handleRepChange = (field: keyof NonNullable<Client['representative']>, value: string) =>
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
    );

  const handleContactChange = (id: string, field: keyof Omit<ClientContact, 'id'>, value: any) => {
    if (!client) return;
    let newContacts = client.contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    if (field === 'isPrimary' && value === true) {
      newContacts = newContacts.map((c) => (c.id === id ? c : { ...c, isPrimary: false }));
    }
    setClient((c) => (c ? { ...c, contacts: newContacts } : null));
  };

  const handleAddContact = () => {
    if (!client || client.contacts.length >= 3) return;
    const newContact: ClientContact = {
      id: uuidv4(),
      phone: '',
      hasWhatsApp: false,
      isPrimary: client.contacts.length === 0,
    };
    setClient((c) => (c ? { ...c, contacts: [...c.contacts, newContact] } : null));
  };

  const handleRemoveContact = (id: string) => {
    if (!client) return;
    let remainingContacts = client.contacts.filter((c) => c.id !== id);
    if (!remainingContacts.some((c) => c.isPrimary) && remainingContacts.length > 0) {
      remainingContacts[0].isPrimary = true;
    }
    setClient((c) => (c ? { ...c, contacts: remainingContacts } : null));
  };

  const handleServiceInterestChange = (interest: string, checked: boolean) => {
    if (!client) return;
    const newInterests = checked
      ? [...client.serviceInterests, interest]
      : client.serviceInterests.filter((i) => i !== interest);
    handleChange('serviceInterests', newInterests);
  };

  const handleAddMeeting = () => {
    if (!newMeeting.reason?.trim() && !newMeeting.notes?.trim()) return;
    if (!client) return;

    const project = projects.find((p) => p.id === newMeeting.projectId);

    const meetingToAdd: ProjectMeeting = {
      id: uuidv4(),
      date: newMeeting.date || new Date().toISOString(),
      reason: newMeeting.reason || 'Reunião de Acompanhamento',
      notes: newMeeting.notes || '',
      projectId: newMeeting.projectId,
      projectName: project?.name,
    };

    setClient((c) => (c ? { ...c, meetings: [meetingToAdd, ...(c.meetings || [])] } : null));
    setNewMeeting({ date: new Date().toISOString().split('T')[0], reason: '', notes: '' });

    // Auto-save when adding meeting
    if (!isEditing) {
      const updatedClient = { ...client, meetings: [meetingToAdd, ...(client.meetings || [])] };
      const result = saveClientAndUpdateState(updatedClient, originalClient || null, clients);
      if (result.error === 'duplicate_cpf_cnpj') {
        alert('CPF/CNPJ Duplicado!');
        return;
      }
      if (result.error === 'invalid_cpf_cnpj') {
        alert('CPF/CNPJ inválido!');
        return;
      }
      setClients(result.updatedClients);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const handleDeleteMeeting = (id: string) => {
    setClient((c) =>
      c ? { ...c, meetings: (c.meetings || []).filter((m) => m.id !== id) } : null,
    );
  };

  const handleSave = () => {
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
  };

  const handleCancel = () => {
    if (originalClient) {
      setClient(JSON.parse(JSON.stringify(originalClient)));
    }
    setIsEditing(false);
  };

  // --- Agenda Integration Handlers ---
  const handleScheduleMeeting = () => {
    // Create a pre-filled event object. ID is empty to signal creation.
    // We set clientId so the modal automatically filters projects for this client.
    const initialEvent: AgendaEvent = {
      id: '',
      title: `Reunião com ${client.name}`,
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      timeEnd: '10:00',
      type: 'Reunião com Cliente',
      clientId: client.id,
      clientName: client.name,
      description: '',
      priority: 3,
      recurrence: 'none',
      completed: false,
      kanbanStatus: 'todo',
    };
    setPreFilledEvent(initialEvent);
    setMeetingModalOpen(true);
  };

  const handleSaveAgendaEvent = (event: AgendaEvent) => {
    setAgendaEvents((prev) => {
      const exists = prev.some((e) => e.id === event.id);
      if (exists) return prev.map((e) => (e.id === event.id ? event : e));
      return [...prev, event];
    });
    setMeetingModalOpen(false);
  };

  // --- Links Handlers ---
  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    try {
      new URL(newLink.url); // Simple validation
    } catch {
      alert('URL inválida. Certifique-se de incluir http:// ou https://');
      return;
    }

    const link: ClientLink = {
      id: uuidv4(),
      title: newLink.title,
      url: newLink.url,
    };

    setClient((prev) =>
      prev
        ? {
            ...prev,
            externalLinks: [...(prev.externalLinks || []), link],
          }
        : null,
    );

    setNewLink({ title: '', url: '' });
  };

  const handleRemoveLink = (id: string) => {
    setClient((prev) =>
      prev
        ? {
            ...prev,
            externalLinks: prev.externalLinks?.filter((l) => l.id !== id),
          }
        : null,
    );
  };

  const getModifiedClass = (currentVal: any, originalVal: any) => {
    if (!isEditing || !originalClient) return 'border-border-color';
    const v1 = currentVal === null || currentVal === undefined ? '' : String(currentVal);
    const v2 = originalVal === null || originalVal === undefined ? '' : String(originalVal);
    return v1 !== v2 ? 'border-yellow-500 ring-1 ring-yellow-500/20' : 'border-border-color';
  };

  const commonInputClass =
    'w-full bg-background p-2 rounded-md border focus:border-accent text-text-primary transition disabled:opacity-100 disabled:cursor-default disabled:bg-background/50';
  const tabButtonClass = (tabId: string) =>
    `flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${activeTab === tabId ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`;
  const clientesIcon = NAV_LINKS.find((link) => link.path === '/clientes')?.icon;

  const isPJ = client.clientType === 'PJ';

  return (
    <div className="animate-fade-in-up pb-24">
      <PageHeader title={`Detalhes: ${client.name}`} icon={clientesIcon}>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/clientes')}
            className="px-4 py-2 rounded-lg font-semibold text-text-primary bg-surface border border-border-color hover:bg-background transition-colors text-sm flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retornar
          </button>

          {/* Botão de Agendar Reunião */}
          <button
            onClick={handleScheduleMeeting}
            className="px-4 py-2 rounded-lg font-semibold text-text-primary bg-surface border border-border-color hover:bg-background transition-colors text-sm flex items-center gap-2"
          >
            <CalendarPlusIcon className="w-4 h-4 text-primary" />
            Agendar Reunião
          </button>

          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg font-semibold text-text-secondary bg-surface border border-border-color hover:bg-background transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors text-sm shadow-soft"
              >
                Salvar Alterações
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 rounded-lg font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors text-sm"
            >
              Editar Cliente
            </button>
          )}
        </div>
      </PageHeader>

      <div className="bg-surface rounded-xl shadow-soft">
        <nav className="flex border-b border-border-color px-6 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('info')} className={tabButtonClass('info')}>
            <UsersIcon className="w-4 h-4" /> Informações Gerais
          </button>
          <button onClick={() => setActiveTab('projects')} className={tabButtonClass('projects')}>
            <ProjetosIcon className="w-4 h-4" /> Projetos
          </button>
          <button onClick={() => setActiveTab('addresses')} className={tabButtonClass('addresses')}>
            <MapPinIcon className="w-4 h-4" /> Endereços
          </button>
          <button onClick={() => setActiveTab('finance')} className={tabButtonClass('finance')}>
            <DollarSignIcon className="w-4 h-4" /> Financeiro
          </button>
          <button onClick={() => setActiveTab('meetings')} className={tabButtonClass('meetings')}>
            <ClockIcon className="w-4 h-4" /> Reuniões
          </button>
          <button onClick={() => setActiveTab('notes')} className={tabButtonClass('notes')}>
            <FileTextIcon className="w-4 h-4" /> Observações
          </button>
          <button onClick={() => setActiveTab('links')} className={tabButtonClass('links')}>
            <LinkIcon className="w-4 h-4" /> Links
          </button>
          {(originalClient?.auditLog || []).length > 0 && (
            <button onClick={() => setActiveTab('audit')} className={tabButtonClass('audit')}>
              Histórico
            </button>
          )}
        </nav>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-8 max-w-5xl">
              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-secondary mb-4 border-b border-border-color pb-1 w-full">
                  Identificação
                </legend>
                <div className="flex gap-4 mb-4 px-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      value="PF"
                      checked={client.clientType === 'PF'}
                      onChange={() => handleChange('clientType', 'PF')}
                      className="accent-primary"
                      disabled={!isEditing}
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
                      disabled={!isEditing}
                    />
                    <span className="text-sm font-medium text-text-primary">Pessoa Jurídica</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      {isPJ ? 'Razão Social' : 'Nome Completo'}
                    </label>
                    <input
                      type="text"
                      value={client.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`${commonInputClass} ${getModifiedClass(client.name, originalClient?.name)}`}
                      disabled={!isEditing}
                      aria-label={isPJ ? 'Razão Social' : 'Nome Completo'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      {isPJ ? 'Data de Abertura' : 'Data de Nascimento'}
                    </label>
                    <input
                      type="date"
                      value={client.birthDate || ''}
                      onChange={(e) => handleChange('birthDate', e.target.value)}
                      className={`${commonInputClass} ${getModifiedClass(client.birthDate, originalClient?.birthDate)}`}
                      disabled={!isEditing}
                      aria-label={isPJ ? 'Data de Abertura' : 'Data de Nascimento'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      CPF/CNPJ
                    </label>
                    <input
                      type="text"
                      value={client.cpfCnpj || ''}
                      onChange={(e) => handleChange('cpfCnpj', formatCpfCnpj(e.target.value))}
                      className={`${commonInputClass} ${getModifiedClass(client.cpfCnpj, originalClient?.cpfCnpj)}`}
                      disabled={!isEditing}
                      aria-label="CPF/CNPJ"
                    />
                  </div>
                  {isPJ && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Nome do Representante
                        </label>
                        <input
                          type="text"
                          value={client.representative?.name || ''}
                          onChange={(e) => handleRepChange('name', e.target.value)}
                          className={`${commonInputClass} ${getModifiedClass(client.representative?.name, originalClient?.representative?.name)}`}
                          disabled={!isEditing}
                          placeholder="Opcional"
                          aria-label="Nome do representante"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Cargo / Relação
                        </label>
                        <input
                          type="text"
                          value={client.representative?.relationship || ''}
                          onChange={(e) => handleRepChange('relationship', e.target.value)}
                          className={`${commonInputClass} ${getModifiedClass(client.representative?.relationship, originalClient?.representative?.relationship)}`}
                          disabled={!isEditing}
                          placeholder="Opcional"
                          aria-label="Cargo ou relação"
                        />
                      </div>
                    </>
                  )}
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-secondary mb-4 border-b border-border-color pb-1 w-full">
                  Contatos
                </legend>
                <div className="space-y-3">
                  {client.contacts?.map((contact, index) => (
                    <div
                      key={contact.id}
                      className="grid grid-cols-[1fr,auto,auto,auto] gap-3 items-center bg-background/30 p-2 rounded-lg"
                    >
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(contact.id, 'phone', e.target.value)}
                        onBlur={(e) =>
                          handleContactChange(contact.id, 'phone', formatPhone(e.target.value))
                        }
                        className={`${commonInputClass} ${originalClient?.contacts?.find((c) => c.id === contact.id)?.phone !== contact.phone ? 'border-yellow-500 ring-1 ring-yellow-500/20' : 'border-border-color'}`}
                        placeholder={`Telefone ${index + 1}`}
                        disabled={!isEditing}
                        aria-label={`Telefone ${index + 1}`}
                      />
                      <label className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contact.hasWhatsApp}
                          onChange={(e) =>
                            handleContactChange(contact.id, 'hasWhatsApp', e.target.checked)
                          }
                          className="rounded accent-primary"
                          disabled={!isEditing}
                        />{' '}
                        WhatsApp
                      </label>
                      <label className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer">
                        <input
                          type="radio"
                          name="primary-contact"
                          checked={contact.isPrimary}
                          onChange={(e) =>
                            handleContactChange(contact.id, 'isPrimary', e.target.checked)
                          }
                          className="accent-primary"
                          disabled={!isEditing}
                        />{' '}
                        Principal
                      </label>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(contact.id)}
                          className="p-2 text-gray-400 hover:text-error transition-colors"
                          aria-label="Remover telefone"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (client.contacts?.length || 0) < 3 && (
                    <button
                      type="button"
                      onClick={handleAddContact}
                      className="text-sm font-semibold text-primary py-2 hover:underline flex items-center gap-1"
                    >
                      <PlusIcon className="w-4 h-4" /> Adicionar Telefone
                    </button>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={client.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`${commonInputClass} ${getModifiedClass(client.email, originalClient?.email)}`}
                      disabled={!isEditing}
                      aria-label="Email"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-secondary mb-4 border-b border-border-color pb-1 w-full">
                  Endereço
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={client.address.zip}
                      onChange={(e) => handleAddressChange('zip', formatCEP(e.target.value))}
                      className={`${commonInputClass} ${getModifiedClass(client.address.zip, originalClient?.address.zip)}`}
                      disabled={!isEditing}
                      aria-label="CEP"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Logradouro
                    </label>
                    <input
                      type="text"
                      value={client.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className={`${commonInputClass} ${getModifiedClass(client.address.street, originalClient?.address.street)}`}
                      disabled={!isEditing}
                      aria-label="Logradouro"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      value={client.address.number}
                      onChange={(e) => handleAddressChange('number', e.target.value)}
                      className={`${commonInputClass} ${getModifiedClass(client.address.number, originalClient?.address.number)}`}
                      disabled={!isEditing}
                      aria-label="Número"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={client.address.complement || ''}
                      onChange={(e) => handleAddressChange('complement', e.target.value)}
                      className={`${commonInputClass} ${getModifiedClass(client.address.complement, originalClient?.address.complement)}`}
                      disabled={!isEditing}
                      placeholder="Opcional"
                      aria-label="Complemento"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={client.address.neighborhood}
                      onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                      className={`${commonInputClass} ${getModifiedClass(client.address.neighborhood, originalClient?.address.neighborhood)}`}
                      disabled={!isEditing}
                      aria-label="Bairro"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={client.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className={`${commonInputClass} ${getModifiedClass(client.address.city, originalClient?.address.city)}`}
                      disabled={!isEditing}
                      aria-label="Cidade"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={client.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className={commonInputClass}
                      disabled={true}
                      aria-label="Estado"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-lg font-bold text-secondary mb-4 border-b border-border-color pb-1 w-full">
                  Status e Interesses
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Status do Cliente
                    </label>
                    <select
                      value={client.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className={`${commonInputClass} ${getModifiedClass(client.status, originalClient?.status)}`}
                      disabled={!isEditing}
                      aria-label="Status do cliente"
                    >
                      {clientStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Status no Pipeline
                    </label>
                    <select
                      value={client.pipelineStatus}
                      onChange={(e) => handleChange('pipelineStatus', e.target.value)}
                      className={`${commonInputClass} ${getModifiedClass(client.pipelineStatus, originalClient?.pipelineStatus)}`}
                      disabled={!isEditing}
                      aria-label="Status no pipeline"
                    >
                      {PIPELINE_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Fonte do Lead
                    </label>
                    <select
                      value={client.leadSource}
                      onChange={(e) => handleChange('leadSource', e.target.value)}
                      className={`${commonInputClass} ${getModifiedClass(client.leadSource, originalClient?.leadSource)}`}
                      disabled={!isEditing}
                      aria-label="Fonte do lead"
                    >
                      {LEAD_SOURCE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-full">
                    <div className="relative" ref={dropdownRef}>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Serviços de Interesse
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          isEditing && setInterestsDropdownOpen(!isInterestsDropdownOpen)
                        }
                        className={`${commonInputClass} text-left flex justify-between items-center ${!isEditing ? 'opacity-100 cursor-default' : 'cursor-pointer'} ${JSON.stringify(client.serviceInterests) !== JSON.stringify(originalClient?.serviceInterests) ? 'border-yellow-500 ring-1 ring-yellow-500/20' : 'border-border-color'}`}
                        disabled={!isEditing}
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
                    {client.serviceInterests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {client.serviceInterests.map((interest) => (
                          <span
                            key={interest}
                            className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-full text-xs text-text-secondary mt-1">
                    Cliente desde: {formatDate(client.registrationDate)}
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                <ProjetosIcon className="w-5 h-5" /> Projetos Vinculados
              </h4>
              {clientProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientProjects.map((project) => {
                    const statusColor = PROJECT_STATUS_COLORS[project.status];
                    return (
                      <div
                        key={project.id}
                        className="bg-surface border border-border-color rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-bold text-text-primary text-lg">{project.name}</h5>
                            <p className="text-sm text-text-secondary">{project.code}</p>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${statusColor.bg} ${statusColor.text}`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Total Contratado:</span>
                            <span className="font-semibold text-text-primary">
                              {formatCurrency(getProjectTotalContractValue(project))}
                            </span>
                          </div>
                          {project.deadline && (
                            <div className="flex justify-between text-sm">
                              <span className="text-text-secondary">Prazo:</span>
                              <span className="font-semibold text-text-primary">
                                {formatDate(project.deadline)}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/projetos/${project.id}`)}
                          className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          Ver Projeto <ArrowUpCircleIcon className="w-4 h-4 rotate-45" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-border-color rounded-xl bg-background/30">
                  <BriefcaseIcon className="w-12 h-12 mx-auto text-text-secondary/30 mb-3" />
                  <p className="text-text-secondary font-medium">
                    Nenhum projeto vinculado a este cliente.
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Crie um novo projeto ou converta uma proposta para vê-lo aqui.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Cadastro Principal */}
              <div>
                <h4 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2 border-b border-border-color pb-2">
                  <MapPinIcon className="w-5 h-5 text-primary" /> Endereço de Cadastro
                </h4>
                <div className="bg-surface border border-border-color rounded-xl p-5 shadow-sm">
                  <p className="font-semibold text-text-primary mb-1">Endereço Principal</p>
                  <p className="text-text-secondary text-sm">
                    {client.address.street}, {client.address.number}
                    {client.address.complement && ` - ${client.address.complement}`}
                    <br />
                    {client.address.neighborhood} - {client.address.city}/{client.address.state}
                    <br />
                    CEP: {client.address.zip}
                  </p>
                </div>
              </div>

              {/* Endereços de Obra dos Projetos */}
              <div>
                <h4 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2 border-b border-border-color pb-2">
                  <ProjetosIcon className="w-5 h-5 text-warning" /> Endereços de Obra (Projetos)
                </h4>
                {clientProjects.some((p) => p.serviceAddress?.street) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clientProjects
                      .filter((p) => p.serviceAddress?.street)
                      .map((project) => (
                        <div
                          key={project.id}
                          className="bg-background/50 border border-border-color rounded-xl p-5 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-2 bg-surface rounded-bl-xl border-b border-l border-border-color shadow-sm text-xs font-bold text-text-secondary">
                            Ref: {project.code}
                          </div>
                          <p className="font-bold text-primary mb-2 text-lg">{project.name}</p>
                          <div className="text-sm text-text-primary space-y-1">
                            <p>
                              {project.serviceAddress?.street}, {project.serviceAddress?.number}
                            </p>
                            {project.serviceAddress?.complement && (
                              <p className="text-text-secondary text-xs">
                                {project.serviceAddress.complement}
                              </p>
                            )}
                            <p>{project.serviceAddress?.neighborhood}</p>
                            <p className="font-medium">
                              {project.serviceAddress?.city}/{project.serviceAddress?.state}
                            </p>
                            <p className="text-text-secondary text-xs mt-1">
                              CEP: {project.serviceAddress?.zip}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-text-secondary italic text-sm">
                    Nenhum endereço de obra específico cadastrado nos projetos deste cliente.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-6">
              {financialSummaries.length > 0 ? (
                financialSummaries.map((summary) => (
                  <div
                    key={summary.projectId}
                    className="bg-surface border border-border-color p-6 rounded-xl shadow-sm"
                  >
                    <h4 className="font-semibold text-lg text-text-primary border-b border-border-color pb-3 mb-4">
                      {summary.projectName}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                      <div className="bg-warning/5 p-4 rounded-lg border border-warning/10">
                        <p className="text-sm text-text-secondary mb-1">Pendente</p>
                        <p className="font-bold text-xl text-warning">
                          {formatCurrency(summary.pending)}
                        </p>
                      </div>
                      <div className="bg-error/5 p-4 rounded-lg border border-error/10">
                        <p className="text-sm text-text-secondary mb-1">Atrasado</p>
                        <p className="font-bold text-xl text-error">
                          {formatCurrency(summary.overdue)}
                        </p>
                      </div>
                      <div className="bg-success/5 p-4 rounded-lg border border-success/10">
                        <p className="text-sm text-text-secondary mb-1">Total Pago</p>
                        <p className="font-bold text-xl text-success">
                          {formatCurrency(summary.paid)}
                        </p>
                      </div>
                      <div className="bg-background p-4 rounded-lg border border-border-color">
                        <p className="text-sm text-text-secondary mb-1">Valor Total</p>
                        <p className="font-bold text-xl text-secondary">
                          {formatCurrency(summary.totalValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-text-secondary py-16 border-2 border-dashed border-border-color rounded-xl">
                  Nenhum projeto ativo para exibir dados financeiros.
                </p>
              )}
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="space-y-8">
              <div className="bg-surface border border-border-color p-6 rounded-xl shadow-sm space-y-4">
                <h4 className="font-semibold text-text-primary text-lg">Registrar Nova Reunião</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={newMeeting.projectId || ''}
                    onChange={(e) => setNewMeeting((m) => ({ ...m, projectId: e.target.value }))}
                    className={commonInputClass}
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                    aria-label="Data da reunião"
                  />
                  <input
                    type="text"
                    placeholder="Motivo da Reunião"
                    value={newMeeting.reason || ''}
                    onChange={(e) => setNewMeeting((m) => ({ ...m, reason: e.target.value }))}
                    className={commonInputClass}
                    disabled={!isEditing}
                    aria-label="Motivo da reunião"
                  />
                </div>
                <textarea
                  value={newMeeting.notes || ''}
                  onChange={(e) => setNewMeeting((m) => ({ ...m, notes: e.target.value }))}
                  rows={3}
                  placeholder="Descreva o que foi discutido..."
                  className={commonInputClass}
                  disabled={!isEditing}
                  aria-label="Anotações da reunião"
                ></textarea>
                {isEditing ? (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleAddMeeting}
                      className="px-6 py-2 rounded-lg text-sm font-semibold bg-secondary text-secondary-content hover:bg-secondary-focus transition-colors"
                    >
                      Adicionar Registro
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary italic text-right">
                    Ative o modo de edição para adicionar reuniões.
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-text-secondary text-lg">Histórico de Reuniões</h4>
                {(client.meetings || [])
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((meeting) => (
                    <div
                      key={meeting.id}
                      className="bg-background p-4 rounded-lg flex justify-between items-start border border-border-color hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-baseline gap-4 mb-2">
                          <p className="text-sm text-text-secondary font-semibold bg-surface px-2 py-1 rounded border border-border-color">
                            {formatDateWithTime(meeting.date)}
                          </p>
                          {meeting.projectName && (
                            <p className="text-xs font-bold text-primary px-2 py-1 bg-primary/5 rounded border border-primary/20">
                              {meeting.projectName}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold text-text-primary text-base">
                          {meeting.reason}
                        </p>
                        <p className="text-sm whitespace-pre-wrap mt-2 text-text-secondary leading-relaxed">
                          {meeting.notes}
                        </p>
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          className="p-2 text-gray-400 hover:text-error rounded-full hover:bg-error/10 transition-colors"
                          aria-label="Excluir reunião"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                {(!client.meetings || client.meetings.length === 0) && (
                  <p className="text-text-secondary text-center py-8">
                    Nenhuma reunião registrada.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4 h-full">
              <label className="block text-lg font-bold text-secondary mb-2">
                Observações Gerais
              </label>
              <textarea
                value={client.generalNotes || ''}
                onChange={(e) => handleChange('generalNotes', e.target.value)}
                rows={20}
                placeholder="Adicione anotações gerais sobre o cliente, preferências, histórico de contatos, etc."
                className={`${commonInputClass} ${getModifiedClass(client.generalNotes, originalClient?.generalNotes)}`}
                disabled={!isEditing}
              />
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2 border-b border-border-color pb-2">
                <LinkIcon className="w-5 h-5 text-primary" /> Links Externos
              </h4>

              {/* List */}
              <div className="grid grid-cols-1 gap-3">
                {client.externalLinks?.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 bg-background border border-border-color rounded-lg hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-surface rounded-full border border-border-color text-primary">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary truncate">{link.title}</p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate block"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveLink(link.id)}
                        className="p-2 text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remover link ${link.title}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {(!client.externalLinks || client.externalLinks.length === 0) && (
                  <p className="text-center text-text-secondary py-8 italic border-2 border-dashed border-border-color rounded-lg">
                    Nenhum link adicionado.
                  </p>
                )}
              </div>

              {/* Add Form (Only in Edit Mode) */}
              {isEditing && (
                <div className="bg-surface p-4 rounded-xl border border-border-color shadow-sm mt-4">
                  <h5 className="font-semibold text-sm text-text-primary mb-3">
                    Adicionar Novo Link
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                        className={commonInputClass}
                        placeholder="Ex: Pasta do Drive"
                        aria-label="Título do link"
                      />
                    </div>
                    <div className="md:col-span-6">
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        URL
                      </label>
                      <input
                        type="url"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        className={commonInputClass}
                        placeholder="https://"
                        aria-label="URL do link"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        onClick={handleAddLink}
                        className="w-full py-2 bg-secondary text-secondary-content rounded-lg font-semibold text-sm hover:bg-secondary-focus transition-colors flex items-center justify-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" /> Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-secondary mb-4">Histórico de Alterações</h4>
              {(client.auditLog || [])
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((log, index) => (
                  <div
                    key={index}
                    className="bg-surface p-4 rounded-lg border border-border-color shadow-sm"
                  >
                    <div className="flex justify-between text-xs text-text-secondary mb-2">
                      <span className="font-semibold uppercase tracking-wider">{log.field}</span>
                      <span>{formatDateWithTime(log.timestamp)}</span>
                    </div>
                    <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-error/5 p-2 rounded border border-error/10 text-text-secondary line-through opacity-70">
                        {JSON.stringify(log.oldValue)}
                      </div>
                      <div className="bg-success/5 p-2 rounded border border-success/10 text-text-primary font-medium">
                        {JSON.stringify(log.newValue)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {showSaveSuccess && (
        <div className="fixed bottom-6 right-6 bg-success text-white px-6 py-3 rounded-xl shadow-lifted z-50 flex items-center gap-3 animate-fade-in-up">
          <CheckCircleIcon className="w-6 h-6" />
          <span className="font-semibold">Cliente salvo com sucesso!</span>
        </div>
      )}

      <EventFormModal
        isOpen={isMeetingModalOpen}
        onClose={() => setMeetingModalOpen(false)}
        onSave={handleSaveAgendaEvent}
        onDelete={() => {}}
        event={preFilledEvent}
        dateForNewEvent={new Date()}
      />
    </div>
  );
};

export default ClienteDetalhesPage;
