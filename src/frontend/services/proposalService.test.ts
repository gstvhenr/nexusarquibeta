import { describe, expect, it } from 'vitest';
import type {
  AgendaEvent,
  Client,
  ContractDeadlinesSettings,
  ProjectAddress,
  Proposal,
} from '../types';
import { proposalService } from './proposalService';

const contractSettings: ContractDeadlinesSettings = {
  defaultPreliminarDeadlineDays: 7,
  defaultExecutiveDeadlineDays: 30,
};

const baseProposal = (): Proposal =>
  ({
    id: 'prop_101',
    code: '#2601',
    name: 'Proposta Teste',
    date: '2026-02-13',
    status: 'Pendente',
    sections: [
      {
        id: 1,
        title: 'Arquitetura',
        items: [
          { id: 1, description: 'Estudo preliminar', unit: 'h', quantity: 1, unitPrice: 100 },
        ],
      },
    ],
    discount: 0,
    subtotal: 100,
    total: 100,
    clientId: 'cli_1',
  }) as Proposal;

const baseClient = (): Client =>
  ({
    id: 'cli_1',
    name: 'Cliente Exemplo',
    status: 'Potencial Cliente',
    address: {
      street: 'Rua A',
      number: '100',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zip: '01000-000',
    },
    contacts: [],
    serviceInterests: [],
    isFavorite: false,
    registrationDate: '2026-01-01',
    lastContactDate: '2026-01-01',
    pipelineStatus: 'Briefing',
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: false,
  }) as Client;

describe('proposalService.convertProposalToProject', () => {
  it('throws when proposal has no linked client', () => {
    // Given
    const proposalWithoutClient = { ...baseProposal(), clientId: undefined };

    // When
    const convertWithoutClient = () =>
      proposalService.convertProposalToProject(
        proposalWithoutClient,
        null,
        contractSettings,
        undefined,
      );

    // Then
    expect(convertWithoutClient).toThrow('Client must be linked to convert a proposal.');
  });

  it('converts proposal into project, folder and client updates', () => {
    // Given
    const proposal = baseProposal();
    const client = baseClient();
    const serviceAddress: ProjectAddress = {
      street: 'Rua B',
      number: '200',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zip: '01400-000',
    };

    // When
    const result = proposalService.convertProposalToProject(
      proposal,
      client,
      contractSettings,
      serviceAddress,
    );

    // Then
    expect(result.newProject.clientId).toBe(client.id);
    expect(result.newProject.code).toBe(proposal.code);
    expect(result.newProject.sections).toHaveLength(1);
    expect(result.newProjectFolder.projectId).toBe(result.newProject.id);
    expect(result.newProjectFolder.children).toEqual([]);

    expect(result.updatedProposal.status).toBe('Concluído');
    expect(result.updatedProposal.archived).toBe(true);

    expect(result.updatedClient?.status).toBe('Cliente Ativo');
    expect(result.updatedClient?.projectLinks?.[0].projectCode).toBe(proposal.code);

    const currentEvents: AgendaEvent[] = [
      {
        id: 'auto_event',
        title: 'Auto',
        date: '2026-02-15',
        time: '10:00',
        type: 'Prazo de Entrega',
        priority: 4,
        recurrence: 'none',
        projectId: result.newProject.id,
        isDeadlineEvent: true,
      },
      {
        id: 'manual_event',
        title: 'Manual',
        date: '2026-02-16',
        time: '11:00',
        type: 'Reunião com Cliente',
        priority: 2,
        recurrence: 'none',
        projectId: result.newProject.id,
      },
    ];

    const syncedEvents = result.updatedAgendaEvents(currentEvents);
    expect(syncedEvents).toHaveLength(1);
    expect(syncedEvents[0].id).toBe('manual_event');
  });

  it('preserves existing projectLinks when converting', () => {
    // Given
    const client = {
      ...baseClient(),
      projectLinks: [
        {
          projectId: 'existing-proj',
          projectCode: '#2500',
          projectName: 'Old Project',
          status: 'Concluído' as const,
        },
      ],
    };

    // When
    const result = proposalService.convertProposalToProject(
      baseProposal(),
      client,
      contractSettings,
      undefined,
    );

    // Then
    expect(result.updatedClient?.projectLinks).toHaveLength(2);
    expect(result.updatedClient?.projectLinks?.[0].projectCode).toBe('#2500');
    expect(result.updatedClient?.projectLinks?.[1].projectCode).toBe(baseProposal().code);
  });

  it('handles proposal with empty sections array', () => {
    // Given
    const proposal = { ...baseProposal(), sections: [] };

    // When
    const result = proposalService.convertProposalToProject(
      proposal,
      baseClient(),
      contractSettings,
      undefined,
    );

    // Then
    expect(result.newProject.sections).toEqual([]);
    expect(result.newProject.status).toBe('Em Andamento');
  });

  it('uses client address as fallback when no service address given', () => {
    // When
    const result = proposalService.convertProposalToProject(
      baseProposal(),
      baseClient(),
      contractSettings,
      undefined,
    );

    // Then
    expect(result.newProject.serviceAddress).toEqual(baseClient().address);
  });

  it('uses service address when explicitly provided', () => {
    // Given
    const serviceAddress = {
      street: 'Rua da Obra',
      number: '500',
      neighborhood: 'Centro',
      city: 'Campinas',
      state: 'SP',
      zip: '13000-000',
    };

    // When
    const result = proposalService.convertProposalToProject(
      baseProposal(),
      baseClient(),
      contractSettings,
      serviceAddress,
    );

    // Then
    expect(result.newProject.serviceAddress?.street).toBe('Rua da Obra');
    expect(result.newProject.serviceAddress?.city).toBe('Campinas');
  });

  it('does not change client status if already active', () => {
    // Given
    const activeClient = { ...baseClient(), status: 'Cliente Ativo' as const };

    // When
    const result = proposalService.convertProposalToProject(
      baseProposal(),
      activeClient,
      contractSettings,
      undefined,
    );

    // Then
    expect(result.updatedClient?.status).toBe('Cliente Ativo');
  });

  it('generates additional deadlines based on contract settings', () => {
    // Given
    const customSettings = {
      defaultPreliminarDeadlineDays: 14,
      defaultExecutiveDeadlineDays: 60,
    };

    // When
    const result = proposalService.convertProposalToProject(
      baseProposal(),
      baseClient(),
      customSettings,
      undefined,
    );

    // Then
    expect(result.newProject.additionalDeadlines).toHaveLength(2);
    expect(result.newProject.additionalDeadlines![0].title).toContain('Preliminar');
    expect(result.newProject.additionalDeadlines![1].title).toContain('Executivo');
  });
});
