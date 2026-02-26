import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PIPELINE_STATUS_OPTIONS } from '../../constants';
import { useCoreData } from '../../context/DataContext';
import { calculateProjectFinancialSummary } from '../../services/clientFinancialSummaryService';
import type { Client, ClientContact, ProjectMeeting } from '../../types';
import Modal from '../ui/Modal';
import {
  ClientFormAuditTab,
  ClientFormFinanceTab,
  ClientFormFooter,
  ClientFormInfoTab,
  ClientFormMeetingsTab,
  ClientFormNotesTab,
} from './client-form';
import type { ClientFinancialSummary } from './client-form';

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

type ClientTab = 'info' | 'finance' | 'meetings' | 'notes' | 'audit';

export const ClientFormModal: (props: ClientFormModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
  initialClient,
  isReadOnly,
  onSwitchToEdit,
}) => {
  const { projects } = useCoreData();
  const formId = useId();
  const fieldId = (name: string) => `${formId}-${name}`;

  const [client, setClient] = useState<Client>(initialClient || getInitialClient());
  const [activeTab, setActiveTab] = useState<ClientTab>('info');
  const [isInterestsDropdownOpen, setInterestsDropdownOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState<Partial<ProjectMeeting>>({
    date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    type LegacyClient = Client & {
      phone?: string;
      phoneHasWhatsApp?: boolean;
    };

    const clientData: LegacyClient = initialClient
      ? JSON.parse(JSON.stringify(initialClient))
      : getInitialClient();

    if (initialClient && !clientData.contacts) {
      clientData.contacts = [];
    }

    if (initialClient && clientData.contacts.length === 0 && clientData.phone) {
      clientData.contacts.push({
        id: uuidv4(),
        phone: clientData.phone,
        hasWhatsApp: !!clientData.phoneHasWhatsApp,
        isPrimary: true,
      });
    }

    if (!clientData.clientType) {
      clientData.clientType = 'PF';
    }

    setClient(clientData);
    setActiveTab('info');
    setNewMeeting({ date: new Date().toISOString().split('T')[0], reason: '', notes: '' });
    setInterestsDropdownOpen(false);
  }, [initialClient, isOpen]);

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
    return projects.filter((project) => project.clientId === client.id && !project.archived);
  }, [projects, client.id]);

  const financialSummaries = useMemo<ClientFinancialSummary[]>(
    () =>
      clientProjects.map((project) => ({
        ...calculateProjectFinancialSummary(project),
        projectId: project.id,
        projectName: project.name,
      })),
    [clientProjects],
  );

  const handleChange = (field: keyof Client, value: Client[keyof Client]) => {
    setClient((current) => ({ ...current, [field]: value }));
  };

  const handleAddressChange = (field: keyof Client['address'], value: string) => {
    setClient((current) => ({ ...current, address: { ...current.address, [field]: value } }));
  };

  const handleRepChange = (field: keyof NonNullable<Client['representative']>, value: string) => {
    setClient((current) => ({
      ...current,
      representative: {
        ...(current.representative || { name: '', relationship: '' }),
        [field]: value,
      },
    }));
  };

  const handleContactChange = (
    id: string,
    field: keyof Omit<ClientContact, 'id'>,
    value: string | boolean,
  ) => {
    let nextContacts = client.contacts.map((contact) =>
      contact.id === id ? { ...contact, [field]: value } : contact,
    );

    if (field === 'isPrimary' && value === true) {
      nextContacts = nextContacts.map((contact) =>
        contact.id === id ? contact : { ...contact, isPrimary: false },
      );
    }

    setClient((current) => ({ ...current, contacts: nextContacts }));
  };

  const handleAddContact = () => {
    if (client.contacts.length >= 3) return;

    const newContact: ClientContact = {
      id: uuidv4(),
      phone: '',
      hasWhatsApp: false,
      isPrimary: client.contacts.length === 0,
    };

    setClient((current) => ({ ...current, contacts: [...current.contacts, newContact] }));
  };

  const handleRemoveContact = (id: string) => {
    let remainingContacts = client.contacts.filter((contact) => contact.id !== id);

    if (!remainingContacts.some((contact) => contact.isPrimary) && remainingContacts.length > 0) {
      remainingContacts = remainingContacts.map((contact, index) =>
        index === 0 ? { ...contact, isPrimary: true } : contact,
      );
    }

    setClient((current) => ({ ...current, contacts: remainingContacts }));
  };

  const handleServiceInterestChange = (interest: string, checked: boolean) => {
    const nextInterests = checked
      ? [...client.serviceInterests, interest]
      : client.serviceInterests.filter((item) => item !== interest);

    handleChange('serviceInterests', nextInterests);
  };

  const handleAddMeeting = () => {
    if (!newMeeting.reason?.trim() && !newMeeting.notes?.trim()) return;

    const project = projects.find((item) => item.id === newMeeting.projectId);

    const meetingToAdd: ProjectMeeting = {
      id: uuidv4(),
      date: newMeeting.date || new Date().toISOString(),
      reason: newMeeting.reason || 'Reunião de Acompanhamento',
      notes: newMeeting.notes || '',
      projectId: newMeeting.projectId,
      projectName: project?.name,
    };

    setClient((current) => ({ ...current, meetings: [meetingToAdd, ...(current.meetings || [])] }));
    setNewMeeting({ date: new Date().toISOString().split('T')[0], reason: '', notes: '' });
  };

  const handleDeleteMeeting = (id: string) => {
    setClient((current) => ({
      ...current,
      meetings: (current.meetings || []).filter((meeting) => meeting.id !== id),
    }));
  };

  const handleSave = () => {
    onSave(client, initialClient);
  };

  const getModifiedClass = (currentVal: unknown, originalVal: unknown) => {
    if (isReadOnly || !initialClient) return 'border-border-color';

    const normalizedCurrent =
      currentVal === null || currentVal === undefined ? '' : String(currentVal);
    const normalizedOriginal =
      originalVal === null || originalVal === undefined ? '' : String(originalVal);

    return normalizedCurrent !== normalizedOriginal
      ? 'border-yellow-500 ring-1 ring-yellow-500/20'
      : 'border-border-color';
  };

  const commonInputClass =
    'w-full bg-background p-2 rounded-md border focus:border-accent text-text-primary transition disabled:opacity-70 disabled:cursor-not-allowed';

  const tabButtonClass = (tabId: ClientTab) =>
    `whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tabId ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'}`;

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
            {(initialClient.auditLog || []).length > 0 && (
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
          <ClientFormInfoTab
            client={client}
            initialClient={initialClient}
            isReadOnly={isReadOnly}
            isPJ={client.clientType === 'PJ'}
            fieldId={fieldId}
            commonInputClass={commonInputClass}
            dropdownRef={dropdownRef}
            isInterestsDropdownOpen={isInterestsDropdownOpen}
            onToggleInterestsDropdown={() => setInterestsDropdownOpen((open) => !open)}
            onChange={handleChange}
            onAddressChange={handleAddressChange}
            onRepChange={handleRepChange}
            onContactChange={handleContactChange}
            onAddContact={handleAddContact}
            onRemoveContact={handleRemoveContact}
            onServiceInterestChange={handleServiceInterestChange}
            getModifiedClass={getModifiedClass}
          />
        )}

        {activeTab === 'finance' && (
          <ClientFormFinanceTab financialSummaries={financialSummaries} />
        )}

        {activeTab === 'meetings' && (
          <ClientFormMeetingsTab
            meetings={client.meetings}
            isReadOnly={isReadOnly}
            commonInputClass={commonInputClass}
            clientProjects={clientProjects}
            newMeeting={newMeeting}
            onNewMeetingChange={(updater) => setNewMeeting((meeting) => updater(meeting))}
            onAddMeeting={handleAddMeeting}
            onDeleteMeeting={handleDeleteMeeting}
          />
        )}

        {activeTab === 'notes' && (
          <ClientFormNotesTab
            fieldId={fieldId}
            client={client}
            initialClient={initialClient}
            isReadOnly={isReadOnly}
            commonInputClass={commonInputClass}
            onChange={handleChange}
            getModifiedClass={getModifiedClass}
          />
        )}

        {activeTab === 'audit' && <ClientFormAuditTab auditLog={client.auditLog} />}
      </div>

      <ClientFormFooter
        isReadOnly={isReadOnly}
        onClose={onClose}
        onSwitchToEdit={onSwitchToEdit}
        onSave={handleSave}
      />
    </Modal>
  );
};
