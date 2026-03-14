import React, { useId, useMemo, useState } from 'react';
import { useCoreData } from '../../context/DataContext';
import { calculateProjectFinancialSummary } from '../../services/clientFinancialSummaryService';
import { Button } from '../ui';
import Modal from '../ui/Modal';
import {
  ClientFormAuditTab,
  ClientFormFinanceTab,
  ClientFormInfoTab,
  ClientFormMeetingsTab,
  ClientFormNotesTab,
  ClientFormFooter,
} from './client-form';
import type { ClientFinancialSummary } from './client-form';
import type { Client } from '../../types';
import { useClientFormHandlers } from '../../hooks/useClientFormHandlers';

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
  const [activeTab, setActiveTab] = useState<ClientTab>('info');

  const {
    client,
    clientProjects,
    isInterestsDropdownOpen,
    setInterestsDropdownOpen,
    newMeeting,
    setNewMeeting,
    dropdownRef,
    handleChange,
    handleAddressChange,
    handleRepChange,
    handleContactChange,
    handleAddContact,
    handleRemoveContact,
    handleServiceInterestChange,
    handleAddMeeting,
    handleDeleteMeeting,
    getModifiedClass,
  } = useClientFormHandlers({ isOpen, initialClient, projects });

  const financialSummaries = useMemo<ClientFinancialSummary[]>(
    () =>
      clientProjects.map((project) => ({
        ...calculateProjectFinancialSummary(project),
        projectId: project.id,
        projectName: project.name,
      })),
    [clientProjects],
  );

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
            <Button
              variant="secondary"
              onClick={() => setActiveTab('info')}
              className={tabButtonClass('info')}
            >
              Informações Gerais
            </Button>
            <Button
              variant="secondary"
              onClick={() => setActiveTab('finance')}
              className={tabButtonClass('finance')}
            >
              Financeiro
            </Button>
            <Button
              variant="secondary"
              onClick={() => setActiveTab('meetings')}
              className={tabButtonClass('meetings')}
            >
              Reuniões
            </Button>
            <Button
              variant="secondary"
              onClick={() => setActiveTab('notes')}
              className={tabButtonClass('notes')}
            >
              Observações
            </Button>
            {(initialClient.auditLog || []).length > 0 && (
              <Button
                variant="secondary"
                onClick={() => setActiveTab('audit')}
                className={tabButtonClass('audit')}
              >
                Histórico
              </Button>
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
        onSave={() => onSave(client, initialClient)}
      />
    </Modal>
  );
};
