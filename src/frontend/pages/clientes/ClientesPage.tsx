import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useDisclosure } from '../../hooks/useDisclosure';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout';
import { ClientFormModal } from '../../components/clientes';
import { Button, DeleteConfirmationModal, Modal } from '../../components/ui';
import { useCoreData, useSystemData } from '../../context/DataContext';
import { api } from '../../services/infrastructure/api';
import type { Client, PaymentStatus } from '../../types';
import { NAV_LINKS } from '../../constants';
import { PlusIcon, DownloadIcon, ArchiveIcon, UnarchiveIcon } from '../../components/ui';
import { getPaymentStatusByClientId, saveClientAndUpdateState } from '../../services/clientService';
import { exportClients } from '../../services/clientExportService';
import { ClientesDataManagementModal } from './ClientesDataManagementModal';
import { ClientesTablePanel } from './ClientesTablePanel';
import type { ClientesFilterState, DataModalTab, ExportMode, ExportStatusFilter } from './types';
const ClientesPage: () => React.ReactNode = () => {
  const { clients, setClients, projects, setProjects, setProposals } = useCoreData();
  const { agendaEvents } = useSystemData();
  const [showArchived, setShowArchived] = useState(false);
  const [filter, setFilter] = useState<ClientesFilterState>({
    search: '',
    status: 'Todos',
    paymentStatus: 'Todos' as PaymentStatus | 'Todos',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  const formDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const duplicateErrorDisclosure = useDisclosure();
  const exportDisclosure = useDisclosure();
  const selectionDisclosure = useDisclosure();
  const openFormModal = formDisclosure.open;
  const closeFormModal = formDisclosure.close;
  const closeDeleteModal = deleteDisclosure.close;
  const openDuplicateErrorModal = duplicateErrorDisclosure.open;
  const [activeModalTab, setActiveModalTab] = useState<DataModalTab>('export');
  const [exportMode, setExportMode] = useState<ExportMode>('all');
  const [exportStatusFilter, setExportStatusFilter] = useState<ExportStatusFilter>('active');
  const [manualSelectionIds, setManualSelectionIds] = useState<Set<string>>(new Set());
  const [manualSearch, setManualSearch] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Reset page when filters or data change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, showArchived, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredClients.slice(startIndex, startIndex + pageSize);
  }, [filteredClients, currentPage, pageSize]);
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
    (clientToSave: Client, originalClient: Client | null) => {
      const result = saveClientAndUpdateState(clientToSave, originalClient, clients);
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
  const clientsForExportList = useMemo(() => {
    let filtered = clients.filter((c) => {
      if (exportStatusFilter === 'active') return !c.archived;
      if (exportStatusFilter === 'archived') return c.archived;
      return true;
    });
    if (manualSearch) {
      const searchLower = manualSearch.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          (c.cpfCnpj && c.cpfCnpj.includes(searchLower)),
      );
    }
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, exportStatusFilter, manualSearch]);
  useEffect(() => {
    if (exportDisclosure.isOpen) {
      if (selectedClientIds.size > 0) {
        setExportMode('selected');
        setExportStatusFilter('both');
        setManualSelectionIds(new Set(selectedClientIds));
      } else {
        setExportMode('all');
        setExportStatusFilter('active');
        setManualSelectionIds(new Set());
      }
      setManualSearch('');
      setImportFile(null);
    }
  }, [exportDisclosure.isOpen, selectedClientIds]);
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setImportFile(event.target.files[0]);
    }
  };
  const handleImportConfirm = () => {
    if (!importFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          api.importClients(text);
          alert('Lista de clientes atualizada com sucesso!');
          window.location.reload();
        }
      } catch (err) {
        alert('Erro ao importar arquivo JSON: ' + err);
      }
    };
    reader.readAsText(importFile);
  };
  const toggleManualSelection = (id: string) => {
    setManualSelectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAllManual = () => {
    const allVisibleSelected = clientsForExportList.every((c) => manualSelectionIds.has(c.id));
    setManualSelectionIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        clientsForExportList.forEach((c) => next.delete(c.id));
      } else {
        clientsForExportList.forEach((c) => next.add(c.id));
      }
      return next;
    });
  };
  const handleExport = async (format: 'PDF' | 'DOCX' | 'JSON') => {
    let dataToExport: Client[] = [];
    if (exportMode === 'all') {
      dataToExport = clientsForExportList;
    } else {
      dataToExport = clientsForExportList.filter((c) => manualSelectionIds.has(c.id));
    }
    await exportClients(dataToExport, projects, format);
    exportDisclosure.close();
  };
  const clientesIcon = NAV_LINKS.find((link) => link.path === '/clientes')?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Clientes" icon={clientesIcon}>
        <div className="flex gap-2">
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

          <Button
            type="button"
            variant="secondary"
            onClick={exportDisclosure.open}
            className="text-sm flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Dados
          </Button>

          {!showArchived && (
            <Button
              type="button"
              variant="primary"
              onClick={openAddModal}
              className="text-sm flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" /> Adicionar Cliente
            </Button>
          )}
        </div>
      </PageHeader>

      <ClientesTablePanel
        showArchived={showArchived}
        filter={filter}
        onFilterChange={setFilter}
        selectedClientIds={selectedClientIds}
        filteredClients={paginatedClients}
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
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalFilteredCount={filteredClients.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
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

      <ClientesDataManagementModal
        isOpen={exportDisclosure.isOpen}
        onClose={exportDisclosure.close}
        activeModalTab={activeModalTab}
        onActiveModalTabChange={setActiveModalTab}
        exportMode={exportMode}
        onExportModeChange={setExportMode}
        exportStatusFilter={exportStatusFilter}
        onExportStatusFilterChange={setExportStatusFilter}
        manualSelectionIds={manualSelectionIds}
        onOpenSelectionModal={selectionDisclosure.open}
        isSelectionModalOpen={selectionDisclosure.isOpen}
        onCloseSelectionModal={selectionDisclosure.close}
        manualSearch={manualSearch}
        onManualSearchChange={setManualSearch}
        clientsForExportList={clientsForExportList}
        onToggleSelectAllManual={toggleSelectAllManual}
        onToggleManualSelection={toggleManualSelection}
        onClearManualSelection={() => setManualSelectionIds(new Set())}
        onExport={handleExport}
        fileInputRef={fileInputRef}
        importFile={importFile}
        onFileSelect={handleFileSelect}
        onImportConfirm={handleImportConfirm}
      />
    </div>
  );
};

export default ClientesPage;
