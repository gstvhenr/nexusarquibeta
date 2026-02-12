import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx';

import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { ClientFormModal } from '../components/clientes';
import { ClientTableRow } from '../components/clientes';
import { DeleteConfirmationModal } from '../components/ui';
import { useData } from '../context/DataContext';
import { api } from '../services/infrastructure/api';
import type { Client, PaymentStatus } from '../types';
import { clientStatuses, paymentStatuses } from '../types';
import { NAV_LINKS } from '../constants';
import {
  PlusIcon,
  DownloadIcon,
  UploadCloudIcon,
  FileTextIcon,
  FileJsonIcon,
  CheckCircleIcon,
  SearchIcon,
  UsersIcon,
  ArchiveIcon,
  UnarchiveIcon,
  TrashIcon,
} from '../components/ui';
import { getPaymentStatusByClientId, saveClientAndUpdateState } from '../services/clientService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getProjectTotalContractValue } from '../utils/projectFinancials';

const ClientesPage: React.FC = () => {
  const { clients, setClients, projects, setProjects, proposals, setProposals, agendaEvents } =
    useData();
  const [showArchived, setShowArchived] = useState(false);
  const [filter, setFilter] = useState({
    search: '',
    status: 'Todos',
    paymentStatus: 'Todos' as PaymentStatus | 'Todos',
  });

  // Modal States
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDuplicateErrorOpen, setDuplicateErrorOpen] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);

  // --- NEW SELECTION MODAL STATE ---
  const [isSelectionModalOpen, setSelectionModalOpen] = useState(false);

  // Export/Import Modal State
  const [activeModalTab, setActiveModalTab] = useState<'export' | 'import'>('export');

  // --- NEW EXPORT LOGIC STATES ---
  const [exportMode, setExportMode] = useState<'selected' | 'all'>('all'); // 1. Scope
  const [exportStatusFilter, setExportStatusFilter] = useState<'active' | 'archived' | 'both'>(
    'active',
  ); // 2. Filter

  // Manual Selection States
  const [manualSelectionIds, setManualSelectionIds] = useState<Set<string>>(new Set());
  const [manualSearch, setManualSearch] = useState('');

  const [importFile, setImportFile] = useState<File | null>(null);

  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());

  // Hidden input for JSON Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  // Totals
  const totalActiveClients = useMemo(() => clients.filter((c) => !c.archived).length, [clients]);
  const totalArchivedClients = useMemo(() => clients.filter((c) => c.archived).length, [clients]);

  // Sorting for Main Table (Alphabetical with Priority)
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

  // --- NEXT DEADLINE LOGIC ---
  const clientDeadlines = useMemo(() => {
    const deadlinesMap = new Map<string, Date | null>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    clients.forEach((client) => {
      const relevantDates: number[] = [];

      // 1. Project Deadlines & Tasks
      const clientProjects = projects.filter(
        (p) =>
          p.clientId === client.id &&
          !p.archived &&
          p.status !== 'Concluído' &&
          p.status !== 'Cancelado',
      );
      clientProjects.forEach((p) => {
        if (p.deadline) relevantDates.push(new Date(p.deadline).getTime());
        p.additionalDeadlines?.forEach((ad) => relevantDates.push(new Date(ad.date).getTime()));
        p.sections.forEach((s) =>
          s.tasks.forEach((t) => {
            if (!t.completed && t.dueDate) relevantDates.push(new Date(t.dueDate).getTime());
          }),
        );
      });

      // 2. Agenda Events (Future or Today)
      const clientEvents = agendaEvents.filter(
        (e) => e.clientId === client.id && !e.completed && !e.archived,
      );
      clientEvents.forEach((e) => {
        if (e.date) relevantDates.push(new Date(e.date).getTime());
      });

      if (relevantDates.length === 0) {
        deadlinesMap.set(client.id, null);
      } else {
        // Filter out dates far in the past? The prompt implies "Urgent" if past, so we keep past dates if they are not completed tasks.
        // We sort to find the earliest one.
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

  // --- Actions ---

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
    setFormModalOpen(true);
  }, []);

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
        setDuplicateErrorOpen(true);
        return;
      }
      if (result.error === 'invalid_cpf_cnpj') {
        alert('CPF/CNPJ inválido. Verifique os dígitos informados.');
        return;
      }
      setClients(result.updatedClients);
      setFormModalOpen(false);
    },
    [clients, setClients],
  );

  const handleDeleteConfirm = useCallback(() => {
    // Handles single delete request from modal
    if (currentClient) {
      setClients((prev) => prev.filter((c) => c.id !== currentClient.id));
    }
    setDeleteConfirmOpen(false);
    setCurrentClient(null);
  }, [currentClient, setClients]);

  const toggleClientProp = useCallback(
    (id: string, prop: keyof Client) =>
      setClients((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, [prop]: !c[prop], lastContactDate: new Date().toISOString() } : c,
        ),
      ),
    [setClients],
  );

  // --- BULK ACTIONS ---
  const handleBulkArchive = () => {
    if (selectedClientIds.size === 0) return;
    const clientIdsToToggle = new Set(selectedClientIds);
    const newArchiveStatus = !showArchived;
    const updatedClients = clients.map((c) => {
      if (clientIdsToToggle.has(c.id)) {
        return {
          ...c,
          archived: newArchiveStatus,
          status: newArchiveStatus ? 'Cliente Desabilitado' : 'Potencial Cliente', // Default status on unarchive
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
    // Check for linked projects
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

  // --- EXPORT LOGIC ---

  // 1. Filter clients based on Step 2 (Status) and Search, then sort Alphabetically
  const clientsForExportList = useMemo(() => {
    let filtered = clients.filter((c) => {
      if (exportStatusFilter === 'active') return !c.archived;
      if (exportStatusFilter === 'archived') return c.archived;
      return true; // 'both'
    });

    // Apply manual search filter
    if (manualSearch) {
      const searchLower = manualSearch.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          (c.cpfCnpj && c.cpfCnpj.includes(searchLower)),
      );
    }

    // Always sort alphabetically for export selection
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, exportStatusFilter, manualSearch]);

  useEffect(() => {
    if (isExportModalOpen) {
      // Logic: If user selected items in the main table, start in "Selected" mode with those items.
      // Otherwise start in "All" mode with "Active" filter default.
      if (selectedClientIds.size > 0) {
        setExportMode('selected');
        setExportStatusFilter('both'); // To ensure selected items are visible
        setManualSelectionIds(new Set(selectedClientIds));
      } else {
        setExportMode('all');
        setExportStatusFilter('active');
        setManualSelectionIds(new Set());
      }
      setManualSearch('');
      setImportFile(null);
    }
  }, [isExportModalOpen, selectedClientIds]);

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

  // Toggle logic for manual selection list
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
      // Export EVERYTHING matching the filter
      dataToExport = clientsForExportList;
    } else {
      // Export only SELECTED items that match the filter (the list already filters, but we double check ID)
      dataToExport = clientsForExportList.filter((c) => manualSelectionIds.has(c.id));
    }

    if (dataToExport.length === 0) {
      alert('Nenhum cliente selecionado para exportação.');
      return;
    }

    const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const fileName = `Ficha_Cadastral_Completa_${dateStr}`;

    if (format === 'JSON') {
      const jsonStr = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      FileSaver.saveAs(blob, `${fileName}.json`);
    } else if (format === 'PDF') {
      const doc = new jsPDF();
      let yPos = 20;
      const leftMargin = 14;
      const contentWidth = 182;
      const lineHeight = 6;

      const checkPageBreak = (spaceNeeded: number) => {
        if (yPos + spaceNeeded > 280) {
          doc.addPage();
          yPos = 20;
        }
      };

      const writeLine = (label: string, value: string | undefined | null, isBoldLabel = false) => {
        if (!value) return;
        checkPageBreak(lineHeight);
        doc.setFontSize(10);
        if (isBoldLabel) doc.setFont('helvetica', 'bold');
        else doc.setFont('helvetica', 'normal');

        const fullText = isBoldLabel ? `${label}: ${value}` : value;
        const splitText = doc.splitTextToSize(fullText, contentWidth);
        doc.text(splitText, leftMargin, yPos);
        yPos += splitText.length * 5 + 2;
        doc.setFont('helvetica', 'normal');
      };

      const writeHeader = (text: string) => {
        checkPageBreak(15);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(leftMargin, yPos, contentWidth, 8, 'F');
        doc.text(text, leftMargin + 2, yPos + 5.5);
        yPos += 12;
      };

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório Completo de Clientes', leftMargin, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${new Date().toLocaleString()}`, leftMargin, yPos);
      yPos += 15;

      dataToExport.forEach((client) => {
        checkPageBreak(60);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(client.name, leftMargin, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setTextColor(100);
        const typeText = client.clientType === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física';
        doc.text(`${typeText} - ${client.status}`, leftMargin, yPos);
        doc.setTextColor(0);
        yPos += 10;

        writeHeader('Dados Cadastrais');
        writeLine('CPF/CNPJ', client.cpfCnpj, true);
        writeLine(
          client.clientType === 'PJ' ? 'Data de Abertura' : 'Data de Nascimento',
          client.birthDate ? formatDate(client.birthDate) : null,
          true,
        );
        writeLine('Email', client.email, true);

        if (client.representative?.name) {
          writeLine(
            'Representante',
            `${client.representative.name} (${client.representative.role || 'Cargo não inf.'})`,
            true,
          );
        }

        if (client.contacts && client.contacts.length > 0) {
          const contactsStr = client.contacts
            .map((c) => `${c.phone} ${c.isPrimary ? '(Principal)' : ''}`)
            .join(', ');
          writeLine('Contatos', contactsStr, true);
        }

        if (client.address) {
          const addr = client.address;
          const addressStr = [
            `${addr.street}, ${addr.number}`,
            addr.complement,
            addr.neighborhood,
            `${addr.city}/${addr.state}`,
            addr.zip ? `CEP: ${addr.zip}` : null,
          ]
            .filter(Boolean)
            .join(' - ');

          if (addr.street) writeLine('Endereço', addressStr, true);
        }

        const clientProjects = projects.filter((p) => p.clientId === client.id);
        if (clientProjects.length > 0) {
          writeHeader('Projetos Vinculados');
          clientProjects.forEach((proj) => {
            const value = getProjectTotalContractValue(proj);
            const projStr = `${proj.name} (${proj.code}) - Status: ${proj.status} | Valor: ${formatCurrency(value)}`;
            writeLine('•', projStr, false);
          });
        }

        if (client.meetings && client.meetings.length > 0) {
          writeHeader('Histórico de Reuniões');
          client.meetings
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .forEach((m) => {
              const note = m.notes ? ` - Obs: ${m.notes}` : '';
              writeLine(formatDate(m.date), `${m.reason}${note}`, true);
            });
        }

        if (client.generalNotes) {
          writeHeader('Observações Gerais');
          writeLine('', client.generalNotes, false);
        }

        yPos += 10;
        doc.setDrawColor(200);
        doc.line(leftMargin, yPos, leftMargin + contentWidth, yPos);
        yPos += 10;
      });

      doc.save(`${fileName}.pdf`);
    } else if (format === 'DOCX') {
      const children: any[] = [
        new Paragraph({ text: 'Relatório Completo de Clientes', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: `Gerado em: ${new Date().toLocaleString()}` }),
        new Paragraph({ text: '' }),
      ];

      dataToExport.forEach((client) => {
        children.push(
          new Paragraph({
            text: client.name,
            heading: HeadingLevel.HEADING_2,
            border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          new Paragraph({
            text: `${client.clientType === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'} - ${client.status}`,
            spacing: { after: 200 },
          }),
        );

        const details: any[] = [];
        if (client.cpfCnpj)
          details.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'CPF/CNPJ: ', bold: true }),
                new TextRun(client.cpfCnpj),
              ],
            }),
          );
        if (client.email)
          details.push(
            new Paragraph({
              children: [new TextRun({ text: 'Email: ', bold: true }), new TextRun(client.email)],
            }),
          );

        if (client.contacts && client.contacts.length > 0) {
          const phones = client.contacts
            .map((c) => `${c.phone} ${c.isPrimary ? '(Principal)' : ''}`)
            .join(', ');
          details.push(
            new Paragraph({
              children: [new TextRun({ text: 'Telefones: ', bold: true }), new TextRun(phones)],
            }),
          );
        }

        if (client.address && client.address.street) {
          const addr = client.address;
          const addrStr = `${addr.street}, ${addr.number} ${addr.complement || ''} - ${addr.neighborhood}, ${addr.city}/${addr.state} (${addr.zip})`;
          details.push(
            new Paragraph({
              children: [new TextRun({ text: 'Endereço: ', bold: true }), new TextRun(addrStr)],
            }),
          );
        }

        if (client.representative?.name) {
          details.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Representante: ', bold: true }),
                new TextRun(`${client.representative.name} (${client.representative.role || ''})`),
              ],
            }),
          );
        }

        if (details.length > 0) {
          children.push(
            new Paragraph({ text: 'Dados Cadastrais', heading: HeadingLevel.HEADING_3 }),
            ...details,
          );
        }

        const clientProjects = projects.filter((p) => p.clientId === client.id);
        if (clientProjects.length > 0) {
          children.push(
            new Paragraph({
              text: 'Projetos',
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200 },
            }),
          );
          clientProjects.forEach((p) => {
            children.push(
              new Paragraph({
                text: `• ${p.name} (${p.code}) - ${p.status} - ${formatCurrency(getProjectTotalContractValue(p))}`,
                bullet: { level: 0 },
              }),
            );
          });
        }

        if (client.meetings && client.meetings.length > 0) {
          children.push(
            new Paragraph({
              text: 'Histórico de Reuniões',
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200 },
            }),
          );
          client.meetings.forEach((m) => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${formatDate(m.date)}: `, bold: true }),
                  new TextRun(m.reason + (m.notes ? ` - ${m.notes}` : '')),
                ],
                bullet: { level: 0 },
              }),
            );
          });
        }

        if (client.generalNotes) {
          children.push(
            new Paragraph({
              text: 'Observações Gerais',
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200 },
            }),
            new Paragraph({ text: client.generalNotes }),
          );
        }

        children.push(new Paragraph({ text: '' }), new Paragraph({ text: '' }));
      });

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const blob = await Packer.toBlob(doc);
      FileSaver.saveAs(blob, `${fileName}.docx`);
    }

    setExportModalOpen(false);
  };

  const clientesIcon = NAV_LINKS.find((link) => link.path === '/clientes')?.icon;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Clientes" icon={clientesIcon}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className="px-4 py-2 rounded-lg font-semibold text-text-primary bg-background border border-border-color hover:bg-border-color/50 transition-colors text-sm flex items-center gap-2"
          >
            {showArchived ? (
              <UnarchiveIcon className="w-4 h-4" />
            ) : (
              <ArchiveIcon className="w-4 h-4" />
            )}
            {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
          </button>

          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2 rounded-lg font-semibold text-text-primary bg-background border border-border-color hover:bg-border-color/50 hover:text-primary transition-colors text-sm flex items-center gap-2 group"
          >
            <DownloadIcon className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
            Dados
          </button>

          {!showArchived && (
            <button
              type="button"
              onClick={openAddModal}
              className="px-5 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus shadow-soft flex items-center gap-2 transition-colors text-sm"
            >
              <PlusIcon className="w-5 h-5" /> Adicionar Cliente
            </button>
          )}
        </div>
      </PageHeader>

      <div className="mb-6 p-4 bg-surface rounded-xl shadow-soft flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-4 flex-grow max-w-4xl">
          <input
            type="text"
            placeholder="Busca por nome ou CPF/CNPJ"
            value={filter.search}
            onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
            className="w-full sm:w-64 bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm"
            aria-label="Buscar cliente"
          />

          {!showArchived && (
            <>
              <select
                value={filter.status}
                onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
                className="bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm"
                aria-label="Filtrar por status"
              >
                <option value="Todos">Status</option>
                {clientStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={filter.paymentStatus}
                onChange={(e) => setFilter((f) => ({ ...f, paymentStatus: e.target.value as any }))}
                className="bg-background p-2 rounded-md border border-border-color focus:border-accent text-sm"
                aria-label="Filtrar por situação financeira"
              >
                <option value="Todos">Situação Financeira</option>
                {paymentStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-4">
          {selectedClientIds.size > 0 && (
            <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border-color animate-fade-in-up">
              <span className="text-sm font-bold text-primary px-3 py-1.5 bg-primary/10 rounded-md">
                {selectedClientIds.size} selecionado(s)
              </span>
              <button
                onClick={handleBulkArchive}
                className="p-1.5 text-text-secondary hover:text-primary hover:bg-surface rounded-md transition-colors"
                title={showArchived ? 'Desarquivar Selecionados' : 'Arquivar Selecionados'}
                aria-label={
                  showArchived
                    ? 'Desarquivar clientes selecionados'
                    : 'Arquivar clientes selecionados'
                }
              >
                {showArchived ? (
                  <UnarchiveIcon className="w-5 h-5" />
                ) : (
                  <ArchiveIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleBulkDelete}
                className="p-1.5 text-text-secondary hover:text-error hover:bg-surface rounded-md transition-colors"
                title="Excluir Selecionados"
                aria-label="Excluir clientes selecionados"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="text-sm font-medium text-text-secondary bg-background/50 px-4 py-2 rounded-lg border border-border-color/50">
            Total:{' '}
            <span className="text-text-primary font-bold">
              {showArchived ? totalArchivedClients : totalActiveClients}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-soft overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-background/50 text-xs text-text-secondary uppercase tracking-wider">
            <tr>
              <th scope="col" className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    filteredClients.length > 0 && selectedClientIds.size === filteredClients.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                  aria-label="Selecionar todos os clientes"
                />
              </th>
              <th scope="col" className="p-4 w-12 text-center"></th>
              <th scope="col" className="px-6 py-3">
                Cliente
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Situação Financeira
              </th>
              <th scope="col" className="px-6 py-3">
                Contato
              </th>
              <th scope="col" className="px-6 py-3">
                Localização
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Próximo Prazo
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <ClientTableRow
                  key={client.id}
                  client={client}
                  paymentStatus={paymentStatusByClientId.get(client.id) || 'Em dia'}
                  isSelected={selectedClientIds.has(client.id)}
                  onSelect={handleSelectClient}
                  onToggleUrgent={() => toggleClientProp(client.id, 'isUrgent')}
                  onView={openClientPage}
                  nextDeadline={clientDeadlines.get(client.id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="p-10 text-center text-text-secondary">
                    <h3 className="mt-2 text-lg font-medium text-text-primary">
                      {showArchived ? 'Nenhum cliente arquivado' : 'Nenhum cliente encontrado'}
                    </h3>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ClientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveClient}
        initialClient={currentClient}
        isReadOnly={false}
        onSwitchToEdit={() => {}}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentClient?.name || ''}
        itemType="Cliente"
      />

      <Modal
        isOpen={isDuplicateErrorOpen}
        onClose={() => setDuplicateErrorOpen(false)}
        title="Cliente Duplicado"
      >
        <p className="text-text-primary mb-6">
          Já existe um cliente com este CPF/CNPJ. Caso não o encontre, verifique os clientes
          arquivados.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setDuplicateErrorOpen(false)}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
          >
            Entendi
          </button>
        </div>
      </Modal>

      {/* Export/Import Modal Improved */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Gerenciamento de Dados"
        size="2xl"
      >
        <div className="flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-border-color mb-6">
            <button
              onClick={() => setActiveModalTab('export')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeModalTab === 'export' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              <span className="flex items-center gap-2">
                <DownloadIcon className="w-4 h-4" /> Exportar Dados
              </span>
            </button>
            <button
              onClick={() => setActiveModalTab('import')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeModalTab === 'import' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              <span className="flex items-center gap-2">
                <UploadCloudIcon className="w-4 h-4" /> Importar Backup
              </span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex flex-col">
            {activeModalTab === 'export' ? (
              <div className="space-y-6 animate-fade-in-up flex-1 flex flex-col">
                {/* Step 1: Export Scope */}
                <div>
                  <h4 className="text-sm font-bold text-text-secondary uppercase mb-3">
                    1. O que deseja exportar?
                  </h4>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setExportMode('selected')}
                      className={`flex-1 p-3 rounded-lg border text-center transition-all ${exportMode === 'selected' ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary' : 'bg-background border-border-color hover:bg-surface text-text-primary'}`}
                    >
                      <span className="block font-bold text-sm">Selecionar Manualmente</span>
                    </button>
                    <button
                      onClick={() => setExportMode('all')}
                      className={`flex-1 p-3 rounded-lg border text-center transition-all ${exportMode === 'all' ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary' : 'bg-background border-border-color hover:bg-surface text-text-primary'}`}
                    >
                      <span className="block font-bold text-sm">Lista Completa</span>
                    </button>
                  </div>
                </div>

                {/* Step 2: Status Filter */}
                <div>
                  <h4 className="text-sm font-bold text-text-secondary uppercase mb-3">
                    2. Qual tipo de cliente?
                  </h4>
                  <div className="flex bg-background rounded-lg p-1 border border-border-color">
                    <button
                      onClick={() => setExportStatusFilter('active')}
                      className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${exportStatusFilter === 'active' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      Apenas Ativos
                    </button>
                    <button
                      onClick={() => setExportStatusFilter('archived')}
                      className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${exportStatusFilter === 'archived' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      Apenas Arquivados
                    </button>
                    <button
                      onClick={() => setExportStatusFilter('both')}
                      className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${exportStatusFilter === 'both' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      Ambos
                    </button>
                  </div>
                </div>

                {/* Step 3: Conditional Selection Button */}
                {exportMode === 'selected' && (
                  <div className="mt-2 animate-fade-in-up">
                    <button
                      onClick={() => setSelectionModalOpen(true)}
                      className="w-full py-4 border-2 border-dashed border-primary/40 hover:border-primary rounded-xl flex flex-col items-center justify-center text-primary hover:bg-primary/5 transition-all gap-2 group"
                    >
                      <div className="p-2 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                        <UsersIcon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <span className="block font-bold text-sm">
                          {manualSelectionIds.size > 0
                            ? `${manualSelectionIds.size} Clientes Selecionados`
                            : 'Escolher Clientes da Lista'}
                        </span>
                        <span className="text-xs text-text-secondary">
                          Clique para abrir a seleção
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Export Buttons */}
                <div className="pt-4 border-t border-border-color">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleExport('PDF')}
                      className="flex-1 p-3 bg-surface border border-border-color rounded-xl hover:shadow-md hover:-translate-y-1 transition-all group text-center hover:border-error hover:bg-error/5"
                    >
                      <FileTextIcon className="w-6 h-6 mx-auto mb-2 text-error group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-sm text-text-primary block">Ficha PDF</span>
                      <span className="text-[10px] text-text-secondary">Completo</span>
                    </button>
                    <button
                      onClick={() => handleExport('DOCX')}
                      className="flex-1 p-3 bg-surface border border-border-color rounded-xl hover:shadow-md hover:-translate-y-1 transition-all group text-center hover:border-primary hover:bg-primary/5"
                    >
                      <FileTextIcon className="w-6 h-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-sm text-text-primary block">DOCX</span>
                      <span className="text-[10px] text-text-secondary">Editável</span>
                    </button>
                    <button
                      onClick={() => handleExport('JSON')}
                      className="flex-1 p-3 bg-surface border border-border-color rounded-xl hover:shadow-md hover:-translate-y-1 transition-all group text-center hover:border-warning hover:bg-warning/5"
                    >
                      <FileJsonIcon className="w-6 h-6 mx-auto mb-2 text-warning group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-sm text-text-primary block">JSON</span>
                      <span className="text-[10px] text-text-secondary">Backup</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in-up">
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group h-64 ${importFile ? 'border-success bg-success/5' : 'border-border-color hover:bg-background'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${importFile ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}
                  >
                    {importFile ? (
                      <CheckCircleIcon className="w-8 h-8" />
                    ) : (
                      <UploadCloudIcon className="w-8 h-8" />
                    )}
                  </div>
                  <h4 className="font-bold text-lg text-text-primary">
                    {importFile ? importFile.name : 'Clique para selecionar o arquivo'}
                  </h4>
                  <p className="text-text-secondary text-sm mt-1">
                    {importFile
                      ? 'Arquivo pronto para importação'
                      : 'Suporta apenas arquivos .JSON de backup'}
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".json"
                    className="hidden"
                  />
                </div>

                {importFile ? (
                  <button
                    onClick={handleImportConfirm}
                    className="w-full py-3 bg-success hover:bg-success/90 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <UploadCloudIcon className="w-5 h-5" /> Confirmar Importação
                  </button>
                ) : (
                  <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-warning mt-0.5">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-bold text-warning text-sm">Atenção ao importar</h5>
                        <p className="text-xs text-text-primary mt-1">
                          A importação irá adicionar novos clientes ou atualizar os existentes com o
                          mesmo ID. Recomenda-se fazer um backup (Exportar JSON) antes de
                          prosseguir.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-border-color">
          <button
            onClick={() => setExportModalOpen(false)}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
          >
            Fechar
          </button>
        </div>
      </Modal>

      {/* NEW Nested Modal for Client Selection (The "Floating Window") */}
      <Modal
        isOpen={isSelectionModalOpen}
        onClose={() => setSelectionModalOpen(false)}
        title="Seleção de Clientes"
        size="2xl"
      >
        <div className="flex flex-col h-[50vh]">
          <div className="p-1 mb-4 flex gap-3 items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                className="w-full bg-background pl-10 pr-4 py-3 rounded-xl border border-border-color text-sm focus:border-primary outline-none shadow-sm"
                autoFocus
                aria-label="Buscar cliente para seleção"
              />
            </div>
            <button
              onClick={toggleSelectAllManual}
              className="px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 border border-border-color bg-surface rounded-xl transition-colors whitespace-nowrap"
            >
              {manualSelectionIds.size === clientsForExportList.length
                ? 'Desmarcar Todos'
                : 'Marcar Todos'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar border border-border-color rounded-xl bg-background/30 p-2">
            <div className="space-y-1">
              {clientsForExportList.length > 0 ? (
                clientsForExportList.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 p-3 hover:bg-surface rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-border-color"
                  >
                    <input
                      type="checkbox"
                      checked={manualSelectionIds.has(c.id)}
                      onChange={() => toggleManualSelection(c.id)}
                      className="rounded accent-primary w-5 h-5 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                        {c.name}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {c.cpfCnpj || 'Sem documento'}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold ${c.archived ? 'bg-background border text-text-secondary' : 'bg-success/10 text-success'}`}
                    >
                      {c.archived ? 'Arquivado' : 'Ativo'}
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
              {manualSelectionIds.size} selecionado(s)
            </div>
            <div className="flex gap-3">
              {manualSelectionIds.size > 0 && (
                <button
                  onClick={() => setManualSelectionIds(new Set())}
                  className="px-4 py-2 text-sm font-semibold text-error hover:bg-error/10 rounded-lg transition-colors border border-transparent hover:border-error/20 flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" /> Limpar Seleção
                </button>
              )}
              <button
                onClick={() => setSelectionModalOpen(false)}
                className="px-6 py-2 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus shadow-soft transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientesPage;
