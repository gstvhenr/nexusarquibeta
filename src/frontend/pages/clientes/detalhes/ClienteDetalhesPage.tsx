import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClienteDetalhesInfoTab, ClienteDetalhesSecondaryTabs } from '@/components/clientes';
import { PageHeader } from '@/components/layout';
import { EventFormModal } from '@/components/agenda';
import {
  ArrowLeftIcon,
  Button,
  CalendarPlusIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarSignIcon,
  FileTextIcon,
  LinkIcon,
  MapPinIcon,
  ProjetosIcon,
  TagIcon,
  UsersIcon,
} from '@/components/ui';
import { NAV_LINKS } from '@/constants';
import { useCoreData, useSystemData } from '@/context/DataContext';
import { useClienteDetalhesForm } from '@/hooks/useClienteDetalhesForm';
import { useClienteLinks } from '@/hooks/useClienteLinks';
import { useClienteMeetings } from '@/hooks/useClienteMeetings';
import { calculateProjectFinancialSummary } from '@/services/clientFinancialSummaryService';
import type { Client } from '@/types';

const ClienteDetalhesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, setClients, projects } = useCoreData();
  const { setAgendaEvents } = useSystemData();

  const originalClient = useMemo(() => clients.find((client) => client.id === id), [clients, id]);

  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const {
    handleChange,
    handleAddressChange,
    handleRepChange,
    handleContactChange,
    handleSave,
    handleCancel,
    getModifiedClass,
  } = useClienteDetalhesForm({
    client,
    setClient,
    originalClient,
    clients,
    setClients,
    isEditing,
    setIsEditing,
    setShowSaveSuccess,
  });

  const {
    newMeeting,
    setNewMeeting,
    isMeetingModalOpen,
    setMeetingModalOpen,
    preFilledEvent,
    handleAddMeeting,
    handleDeleteMeeting,
    handleScheduleMeeting,
    handleSaveAgendaEvent,
  } = useClienteMeetings({
    client,
    setClient,
    originalClient,
    clients,
    setClients,
    setAgendaEvents,
    isEditing,
    setShowSaveSuccess,
    projects,
  });

  const { newLink, setNewLink, handleAddLink, handleRemoveLink } = useClienteLinks({
    client,
    setClient,
  });

  useEffect(() => {
    if (originalClient) {
      const clientCopy: Client = JSON.parse(JSON.stringify(originalClient));
      // Pad contacts to always have 3 slots
      if (!clientCopy.contacts) {
        clientCopy.contacts = [];
      }
      while (clientCopy.contacts.length < 3) {
        clientCopy.contacts.push({
          id: crypto.randomUUID(),
          phone: '',
          hasWhatsApp: false,
          isPrimary: clientCopy.contacts.length === 0,
        });
      }
      setClient(clientCopy);
    }
  }, [originalClient]);

  const clientProjects = useMemo(() => {
    if (!client?.id) {
      return [];
    }

    return projects.filter((project) => project.clientId === client.id && !project.archived);
  }, [projects, client?.id]);

  const financialSummaries = useMemo(
    () =>
      clientProjects.map((project) => ({
        ...calculateProjectFinancialSummary(project),
        projectId: project.id,
        projectName: project.name,
      })),
    [clientProjects],
  );

  if (!client) {
    return <div className="p-10 text-center">Carregando ou cliente não encontrado...</div>;
  }

  const tabButtonClass = (tabId: string) =>
    `flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${activeTab === tabId ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`;
  const clientesIcon = NAV_LINKS.find((link) => link.path === '/clientes')?.icon;

  return (
    <div className="animate-fade-in-up pb-24">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            {client.avatarUrl ? (
              <img
                src={client.avatarUrl}
                alt={`Avatar de ${client.name}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-surface shadow-sm"
              />
            ) : null}
            <span>Detalhes: {client.name}</span>
          </div>
        }
        icon={!client.avatarUrl ? clientesIcon : undefined}
      >
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/clientes')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retornar
          </Button>

          <Button
            variant="secondary"
            onClick={handleScheduleMeeting}
            className="flex items-center gap-2"
          >
            <CalendarPlusIcon className="w-4 h-4 text-primary" />
            Agendar Reunião
          </Button>

          {isEditing ? (
            <>
              <Button variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Salvar Alterações
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setIsEditing(true)}
              className="text-primary bg-primary/10 hover:bg-primary/20"
            >
              Editar Cliente
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="bg-surface rounded-xl shadow-soft">
        <nav className="flex border-b border-border-color px-6 overflow-x-auto no-scrollbar">
          <Button
            variant="secondary"
            onClick={() => setActiveTab('info')}
            className={tabButtonClass('info')}
          >
            <UsersIcon className="w-4 h-4" /> Informações Gerais
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab('projects')}
            className={tabButtonClass('projects')}
          >
            <ProjetosIcon className="w-4 h-4" /> Projetos
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab('addresses')}
            className={tabButtonClass('addresses')}
          >
            <MapPinIcon className="w-4 h-4" /> Endereços
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab('finance')}
            className={tabButtonClass('finance')}
          >
            <DollarSignIcon className="w-4 h-4" /> Financeiro
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab('meetings')}
            className={tabButtonClass('meetings')}
          >
            <ClockIcon className="w-4 h-4" /> Reuniões
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab('notes')}
            className={tabButtonClass('notes')}
          >
            <FileTextIcon className="w-4 h-4" /> Observações
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab('links')}
            className={tabButtonClass('links')}
          >
            <LinkIcon className="w-4 h-4" /> Links
          </Button>
          {(originalClient?.auditLog || []).length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setActiveTab('audit')}
              className={tabButtonClass('audit')}
            >
              <TagIcon className="w-4 h-4" /> Histórico
            </Button>
          )}
        </nav>

        <div className="p-6">
          <ClienteDetalhesInfoTab
            activeTab={activeTab}
            client={client}
            isPJ={client.clientType === 'PJ'}
            isEditing={isEditing}
            originalClient={originalClient}
            handleChange={handleChange}
            handleAddressChange={handleAddressChange}
            handleRepChange={handleRepChange}
            handleContactChange={handleContactChange}
            getModifiedClass={getModifiedClass}
          />

          <ClienteDetalhesSecondaryTabs
            activeTab={activeTab}
            client={client}
            clientProjects={clientProjects}
            financialSummaries={financialSummaries}
            isEditing={isEditing}
            newMeeting={newMeeting}
            setNewMeeting={setNewMeeting}
            handleAddMeeting={handleAddMeeting}
            handleDeleteMeeting={handleDeleteMeeting}
            handleChange={handleChange}
            originalClient={originalClient}
            getModifiedClass={getModifiedClass}
            newLink={newLink}
            setNewLink={setNewLink}
            handleAddLink={handleAddLink}
            handleRemoveLink={handleRemoveLink}
            onOpenProject={(projectId) => navigate(`/projetos/${projectId}`)}
          />
        </div>
      </div>

      {showSaveSuccess && (
        <div className="fixed bottom-6 right-6 bg-success text-primary-content px-6 py-3 rounded-xl shadow-lifted z-50 flex items-center gap-3 animate-fade-in-up">
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
