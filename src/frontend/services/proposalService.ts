import type {
  Project,
  Proposal,
  Client,
  ProjectSection,
  DocumentFolder,
  AgendaEvent,
  ContractDeadlinesSettings,
  ProjectAddress,
  AdditionalDeadline,
} from '../types';
import { agendaService } from './agendaService';
import { v4 as uuidv4 } from 'uuid';

const createProjectDocumentFolder = (project: Project): DocumentFolder => {
  const { id: projectId, code: projectCode, name: projectName } = project;
  const now = new Date().toISOString();

  // Check if projectName already starts with projectCode to avoid duplication (e.g. "#2500 - #2500 - Name")
  const folderName = projectName.startsWith(projectCode)
    ? projectName
    : `${projectCode} - ${projectName}`;

  return {
    id: `proj-folder_${projectId}`,
    name: folderName,
    type: 'folder',
    children: [],
    dateAdded: now,
    dateModified: now,
    projectId: projectId,
    projectCode: projectCode,
  };
};

const DEFAULT_DEADLINES: ContractDeadlinesSettings = {
  defaultPreliminarDeadlineDays: 7,
  defaultExecutiveDeadlineDays: 30,
};

const normalizeContractSettings = (
  settings: ContractDeadlinesSettings | null | undefined,
): ContractDeadlinesSettings => {
  const preliminarDays = Number(settings?.defaultPreliminarDeadlineDays);
  const executiveDays = Number(settings?.defaultExecutiveDeadlineDays);

  return {
    defaultPreliminarDeadlineDays:
      Number.isFinite(preliminarDays) && preliminarDays >= 0
        ? preliminarDays
        : DEFAULT_DEADLINES.defaultPreliminarDeadlineDays,
    defaultExecutiveDeadlineDays:
      Number.isFinite(executiveDays) && executiveDays >= 0
        ? executiveDays
        : DEFAULT_DEADLINES.defaultExecutiveDeadlineDays,
  };
};

const deriveProjectIdFromProposal = (proposalId: string): string => {
  const match = proposalId.match(/\d+/);
  if (match?.[0]) {
    return `proj_${match[0]}`;
  }
  return `proj_${uuidv4()}`;
};

export const proposalService = {
  /**
   * Input -> Output:
   * - input: proposta aprovada + cliente existente + configuração de prazos (+ endereço opcional).
   * - output: pacote atômico com `newProject`, `updatedProposal`, `updatedClient`, pasta de documentos e sincronizador de agenda.
   * Example:
   * const conversion = proposalService.convertProposalToProject(proposal, client, settings);
   */
  convertProposalToProject(
    proposal: Proposal,
    existingClient: Client | null,
    contractSettings: ContractDeadlinesSettings,
    serviceAddress?: ProjectAddress,
  ): {
    newProject: Project;
    updatedProposal: Proposal;
    updatedClient: Client | null;
    newProjectFolder: DocumentFolder;
    updatedAgendaEvents: (currentEvents: AgendaEvent[]) => AgendaEvent[];
  } {
    if (!proposal.clientId || !existingClient) {
      throw new Error('Client must be linked to convert a proposal.');
    }

    const safeContractSettings = normalizeContractSettings(contractSettings);
    const projectCode = proposal.code;
    const projectName = `${projectCode} - ${existingClient.name}`;

    const newSections: ProjectSection[] = proposal.sections.map((section) => ({
      id: uuidv4(),
      name: section.title,
      tasks: section.items.map((item) => ({
        id: uuidv4(),
        name: item.description,
        completed: false,
        hours: item.estimatedHours || 0,
      })),
    }));

    // --- Automatic Deadline Calculation ---
    const today = new Date();

    // Calculate Preliminar Deadline
    const preliminarDate = new Date(today);
    preliminarDate.setDate(
      preliminarDate.getDate() + safeContractSettings.defaultPreliminarDeadlineDays,
    );

    // Calculate Executive Deadline (assuming it starts after preliminar, purely additive logic for now)
    const executiveDate = new Date(preliminarDate);
    executiveDate.setDate(
      executiveDate.getDate() + safeContractSettings.defaultExecutiveDeadlineDays,
    );

    const additionalDeadlines: AdditionalDeadline[] = [
      { id: uuidv4(), title: 'Entrega Projeto Preliminar', date: preliminarDate.toISOString() },
      { id: uuidv4(), title: 'Entrega Projeto Executivo', date: executiveDate.toISOString() },
    ];

    const newProject: Project = {
      id: deriveProjectIdFromProposal(proposal.id),
      code: projectCode,
      name: projectName.trim(),
      clientName: existingClient.name,
      clientId: existingClient.id,
      status: 'Em Andamento', // Status changed to 'Em Andamento' as implied by signed contract
      deadline: executiveDate.toISOString(), // Set main deadline to the furthest calculated date
      budget: proposal.total,
      remuneration: proposal.remuneration,
      description: `Projeto criado a partir da proposta ${proposal.code}.`,
      sections: newSections,
      archived: false,
      proposalId: proposal.id,
      proposalCode: proposal.code,
      financials: {
        paymentType: 'vista',
        baseContractValue: proposal.total,
        totalValue: proposal.total,
        lumpSumValue: proposal.total,
        lumpSumStatus: 'Em aberto',
      },
      linkedQuotationIds: [],
      serviceAddress: serviceAddress || existingClient.address, // Use provided service address or fallback to client address
      additionalDeadlines: additionalDeadlines,
      revisionCount: 0,
      revisionLimit: 3,
    };

    const updatedProposal = { ...proposal, status: 'Concluído' as const, archived: true };
    const newProjectFolder = createProjectDocumentFolder(newProject);
    const updatedAgendaEvents = (currentEvents: AgendaEvent[]) =>
      agendaService.syncProjectEventsWithAgenda(newProject, currentEvents);

    // Update client status and add audit log
    const updatedClient = { ...existingClient };
    const originalStatus = existingClient.status;

    if (existingClient.status === 'Potencial Cliente') {
      updatedClient.status = 'Cliente Ativo';
    }

    const newAuditLogEntry = {
      timestamp: new Date().toISOString(),
      field: 'Vínculo de Projeto',
      oldValue: `Status: ${originalStatus}`,
      newValue: `Projeto ${newProject.code} criado. Status alterado para: ${updatedClient.status}`,
    };

    const newProjectLink = {
      projectId: newProject.id,
      projectCode: newProject.code,
      projectName: newProject.name,
      status: newProject.status,
    };

    updatedClient.projectLinks = [...(existingClient.projectLinks || []), newProjectLink];
    updatedClient.auditLog = [...(existingClient.auditLog || []), newAuditLogEntry];

    if (originalStatus !== updatedClient.status) {
      updatedClient.auditLog.push({
        timestamp: new Date().toISOString(),
        field: 'Status do Cliente',
        oldValue: originalStatus,
        newValue: updatedClient.status,
      });
    }

    return {
      newProject,
      updatedProposal,
      updatedClient,
      newProjectFolder,
      updatedAgendaEvents,
    };
  },
};
