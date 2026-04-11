import React, { useState, useMemo, useCallback } from 'react';
import { useDisclosure } from '../../hooks/useDisclosure';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout';
import { ClientFormModal, ClientesTablePanel } from '../../components/clientes';
import { Button, DeleteConfirmationModal, Modal } from '../../components/ui';
import { useCoreData, useSystemData } from '../../context/DataContext';
import type { Client, PaymentStatus } from '../../types';
import { NAV_LINKS } from '../../constants';
import { PlusIcon, ArchiveIcon, UnarchiveIcon } from '../../components/ui';
import { getPaymentStatusByClientId, saveClientAndUpdateState } from '../../services/clientService';
import { driveFileService } from '../../services/infrastructure/driveFileService';
import { v4 as uuidv4 } from 'uuid';
import type { ClientesFilterState } from '@/components/clientes/types';
const ClientesPage: () => React.ReactNode = () => {
  const { clients, setClients, projects, setProjects, setProposals } = useCoreData();
  const { agendaEvents } = useSystemData();
  const [showArchived, setShowArchived] = useState(false);
  const [filter, setFilter] = useState<ClientesFilterState>({
    search: '',
    status: 'Todos',
    paymentStatus: 'Todos' as PaymentStatus | 'Todos',
  });

  const formDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const duplicateErrorDisclosure = useDisclosure();
  const openFormModal = formDisclosure.open;
  const closeFormModal = formDisclosure.close;
  const closeDeleteModal = deleteDisclosure.close;
  const openDuplicateErrorModal = duplicateErrorDisclosure.open;
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const totalActiveClients = useMemo(() => clients.filter((c) => !c.archived).length, [clients]);
  const totalArchivedClients = useMemo(() => clients.filter((c) => c.archived).length, [clients]);
  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      if ((a.isUrgent ?? false) !== (b.isUrgent ?? false)) return (b.isUrgent ?? false) ? 1 : -1;
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [clients]);

  const paymentStatusByClientId = useMemo(
    () => getPaymentStatusByClientId(clients, projects),
    [clients, projects],
  );
  const clientDeadlines = useMemo(() => {
    const deadlinesMap = new Map<string, Date | null>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    clients.forEach((client) => {
      const clientProjects = projects.filter(
        (p) =>
          p.clientId === client.id &&
          !p.archived &&
          p.status !== 'Concluído' &&
          p.status !== 'Cancelado',
      );
      const projectDates = clientProjects.flatMap((project) => {
        const deadlineDate = project.deadline ? [new Date(project.deadline).getTime()] : [];
        const milestoneDates =
          project.additionalDeadlines?.map((deadline) => new Date(deadline.date).getTime()) || [];
        const taskDates = project.sections.flatMap((section) =>
          section.tasks
            .filter((task) => !task.completed && !!task.dueDate)
            .map((task) => new Date(task.dueDate!).getTime()),
        );
        return [...deadlineDate, ...milestoneDates, ...taskDates];
      });
      const clientEvents = agendaEvents.filter(
        (e) => e.clientId === client.id && !e.completed && !e.archived,
      );
      const eventDates = clientEvents
        .filter((event) => !!event.date)
        .map((event) => new Date(event.date).getTime());
      const relevantDates = [...projectDates, ...eventDates];

      if (relevantDates.length === 0) {
        deadlinesMap.set(client.id, null);
      } else {
        relevantDates.sort((a, b) => a - b);
        deadlinesMap.set(client.id, new Date(relevantDates[0]));
      }
    });
    return deadlinesMap;
  }, [clients, projects, agendaEvents]);

  const filteredClients = useMemo(
    () =>
      sortedClients.filter((client) => {
        const primaryContact = client.contacts?.find((c) => c.isPrimary) || client.contacts?.[0];
        const paymentStatus = paymentStatusByClientId.get(client.id) || 'Em dia';

        const matchesArchived = client.archived === showArchived;
        if (!matchesArchived) return false;

        const matchesSearch = filter.search
          ? client.name.toLowerCase().includes(filter.search.toLowerCase()) ||
            (client.cpfCnpj && client.cpfCnpj.includes(filter.search)) ||
            (client.address?.city &&
              client.address.city.toLowerCase().includes(filter.search.toLowerCase())) ||
            (primaryContact && primaryContact.phone.includes(filter.search))
          : true;

        if (!showArchived) {
          const matchesPaymentStatus =
            filter.paymentStatus !== 'Todos' ? paymentStatus === filter.paymentStatus : true;
          const matchesStatus = filter.status !== 'Todos' ? client.status === filter.status : true;
          return matchesSearch && matchesStatus && matchesPaymentStatus;
        }

        return matchesSearch;
      }),
    [sortedClients, filter, showArchived, paymentStatusByClientId],
  );

  const handleSelectClient = useCallback((id: string) => {
    setSelectedClientIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedClientIds.size === filteredClients.length) {
      setSelectedClientIds(new Set());
    } else {
      setSelectedClientIds(new Set(filteredClients.map((c) => c.id)));
    }
  }, [filteredClients, selectedClientIds]);

  const openAddModal = useCallback(() => {
    setCurrentClient(null);
    openFormModal();
  }, [openFormModal]);

  const openClientPage = useCallback(
    (client: Client) => {
      navigate(`/clientes/${client.id}`);
    },
    [navigate],
  );

  const handleSaveClient = useCallback(
    async (clientToSave: Client, originalClient: Client | null, pendingAvatar?: File | null) => {
      const finalClient = { ...clientToSave };
      let clientId = finalClient.id;

      // Assure ID exists before upload so we know the folder
      if (!clientId) {
        clientId = uuidv4();
        finalClient.id = clientId;
      }

      if (pendingAvatar) {
        try {
          // Provide a specific fallback name if file.name is empty/missing
          const relativePath = await driveFileService.uploadFeatureFile(
            'clientes',
            clientId,
            pendingAvatar,
            'avatar.jpg',
          );
          finalClient.avatarUrl = relativePath;
        } catch (error) {
          console.error('Erro ao fazer upload do avatar:', error);
          alert('Não foi possível salvar o avatar, verifique o console para mais detalhes.');
        }
      }

      const result = saveClientAndUpdateState(finalClient, originalClient, clients);
      if (result.error === 'duplicate_cpf_cnpj') {
        openDuplicateErrorModal();
        return;
      }
      if (result.error === 'invalid_cpf_cnpj') {
        alert('CPF/CNPJ inválido. Verifique os dígitos informados.');
        return;
      }
      setClients(result.updatedClients);
      closeFormModal();
    },
    [clients, openDuplicateErrorModal, closeFormModal, setClients],
  );
  const handleDeleteConfirm = useCallback(() => {
    if (currentClient) {
      setClients((prev) => prev.filter((c) => c.id !== currentClient.id));
    }
    closeDeleteModal();
    setCurrentClient(null);
  }, [currentClient, closeDeleteModal, setClients]);

  const toggleClientProp = useCallback(
    (id: string, prop: keyof Client) =>
      setClients((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, [prop]: !c[prop], lastContactDate: new Date().toISOString() } : c,
        ),
      ),
    [setClients],
  );
  const handleBulkArchive = () => {
    if (selectedClientIds.size === 0) return;
    const clientIdsToToggle = new Set(selectedClientIds);
    const newArchiveStatus = !showArchived;
    const updatedClients = clients.map((c) => {
      if (clientIdsToToggle.has(c.id)) {
        return {
          ...c,
          archived: newArchiveStatus,
          status: newArchiveStatus ? 'Cliente Desabilitado' : 'Potencial Cliente',
        } as Client;
      }
      return c;
    });

    setProposals((prev) =>
      prev.map((p) =>
        p.clientId && clientIdsToToggle.has(p.clientId) ? { ...p, archived: newArchiveStatus } : p,
      ),
    );

    setProjects((prev) =>
      prev.map((p) =>
        clientIdsToToggle.has(p.clientId) ? { ...p, archived: newArchiveStatus } : p,
      ),
    );

    setClients(updatedClients);
    setSelectedClientIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedClientIds.size === 0) return;
    const clientsToDelete = Array.from(selectedClientIds);
    const hasProjects = clientsToDelete.some((id) => projects.some((p) => p.clientId === id));

    if (hasProjects) {
      alert(
        'Alguns clientes selecionados possuem projetos vinculados e não podem ser excluídos. Por favor, arquive-os.',
      );
      return;
    }

    if (
      window.confirm(
        `Tem certeza que deseja excluir ${selectedClientIds.size} clientes selecionados?`,
      )
    ) {
      setClients((prev) => prev.filter((c) => !selectedClientIds.has(c.id)));
      setSelectedClientIds(new Set());
    }
  };

  const clientesIcon = NAV_LINKS.find((link) => link.path === '/clientes')?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Clientes" icon={clientesIcon}>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowArchived(!showArchived)}
            className="text-sm flex items-center gap-2"
          >
            {showArchived ? (
              <UnarchiveIcon className="w-4 h-4" />
            ) : (
              <ArchiveIcon className="w-4 h-4" />
            )}
            {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
          </Button>

          {!showArchived && (
            <Button
              type="button"
              variant="primary"
              onClick={openAddModal}
              className="text-sm flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" /> Adicionar Cliente
            </Button>
          )}
        </div>
      </PageHeader>

      <ClientesTablePanel
        showArchived={showArchived}
        filter={filter}
        onFilterChange={setFilter}
        selectedClientIds={selectedClientIds}
        filteredClients={filteredClients}
        totalActiveClients={totalActiveClients}
        totalArchivedClients={totalArchivedClients}
        paymentStatusByClientId={paymentStatusByClientId}
        clientDeadlines={clientDeadlines}
        onSelectAll={handleSelectAll}
        onSelectClient={handleSelectClient}
        onToggleUrgent={(id) => toggleClientProp(id, 'isUrgent')}
        onViewClient={openClientPage}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
      />

      <ClientFormModal
        isOpen={formDisclosure.isOpen}
        onClose={formDisclosure.close}
        onSave={handleSaveClient}
        initialClient={currentClient}
        isReadOnly={false}
        onSwitchToEdit={() => {}}
      />

      <DeleteConfirmationModal
        isOpen={deleteDisclosure.isOpen}
        onClose={deleteDisclosure.close}
        onConfirm={handleDeleteConfirm}
        itemName={currentClient?.name || ''}
        itemType="Cliente"
      />

      <Modal
        isOpen={duplicateErrorDisclosure.isOpen}
        onClose={duplicateErrorDisclosure.close}
        title="Cliente Duplicado"
      >
        <p className="text-text-primary mb-6">
          Já existe um cliente com este CPF/CNPJ. Caso não o encontre, verifique os clientes
          arquivados.
        </p>
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={duplicateErrorDisclosure.close}>
            Entendi
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ClientesPage;
