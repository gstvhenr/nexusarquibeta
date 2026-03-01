import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Client } from '../types';
import type { Project } from '../types/project';
import { exportClients } from './clientExportService';

const createObjectUrlMock = vi.fn(() => 'blob:mock-url');
const revokeObjectUrlMock = vi.fn();
const { pdfSaveMock } = vi.hoisted(() => ({
  pdfSaveMock: vi.fn(),
}));

vi.mock('jspdf', () => {
  class JsPdfMock {
    addPage = vi.fn();
    setFontSize = vi.fn();
    setFont = vi.fn();
    splitTextToSize = (text: string) => [text];
    text = vi.fn();
    setFillColor = vi.fn();
    rect = vi.fn();
    setTextColor = vi.fn();
    setDrawColor = vi.fn();
    line = vi.fn();
    save = pdfSaveMock;
  }

  return {
    default: JsPdfMock,
  };
});

const buildClient = (id: string, type: 'PF' | 'PJ'): Client =>
  ({
    id,
    name: type === 'PJ' ? 'Empresa Teste LTDA' : 'Pessoa Teste',
    clientType: type,
    birthDate: type === 'PJ' ? '2018-05-20' : '1990-03-15',
    cpfCnpj: type === 'PJ' ? '12.345.678/0001-99' : '123.456.789-09',
    representative:
      type === 'PJ'
        ? {
            name: 'Representante Comercial',
            relationship: 'Sócio',
            role: 'Diretor',
          }
        : undefined,
    contacts: [
      {
        id: `contact_${id}`,
        phone: '(11) 99999-0000',
        hasWhatsApp: true,
        isPrimary: true,
      },
    ],
    email: `${id}@nexus-arqui.test`,
    status: 'Cliente Ativo',
    leadSource: 'Indicação',
    serviceInterests: ['Projeto Executivo'],
    address: {
      street: 'Rua das Flores',
      number: '100',
      complement: 'Sala 12',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zip: '01000-000',
    },
    isFavorite: false,
    registrationDate: '2025-01-01',
    lastContactDate: '2025-01-10',
    pipelineStatus: 'Em negociação',
    meetings: [
      {
        id: `meeting_${id}_1`,
        date: '2025-01-15',
        reason: 'Kickoff',
        notes: 'Definição inicial',
      },
      {
        id: `meeting_${id}_2`,
        date: '2025-01-10',
        reason: 'Revisão',
        notes: '',
      },
    ],
    generalNotes: 'Cliente com prioridade alta.',
    behavioralProfile: {
      notes: 'Perfil analítico',
    },
    archived: false,
  }) as Client;

const buildProject = (client: Client): Project =>
  ({
    id: `project_${client.id}`,
    code: `PRJ-${client.id}`,
    name: `Projeto ${client.name}`,
    clientName: client.name,
    clientId: client.id,
    status: 'Em Andamento',
    deadline: '2099-12-31',
    budget: 2500,
    description: 'Projeto para exportação',
    sections: [],
    financials: {
      paymentType: 'vista',
      lumpSumValue: 2500,
      lumpSumStatus: 'Em aberto',
      lumpSumDueDate: '2099-12-31',
    },
  }) as Project;

describe('clientExportService.exportClients', () => {
  beforeAll(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectUrlMock,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: revokeObjectUrlMock,
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'dispatchEvent').mockReturnValue(true);
  });

  beforeEach(() => {
    createObjectUrlMock.mockClear();
    revokeObjectUrlMock.mockClear();
    pdfSaveMock.mockClear();
    vi.stubGlobal('alert', vi.fn());
  });

  it('alerts and exits when there are no clients to export', async () => {
    // Given
    const clients: Client[] = [];

    // When
    await exportClients(clients, [], 'JSON');

    // Then
    expect(alert).toHaveBeenCalledWith('Nenhum cliente selecionado para exportação.');
  });

  it('exports selected clients as JSON file', async () => {
    // Given
    const clients = [buildClient('cli_json', 'PF')];

    // When
    await exportClients(clients, [], 'JSON');

    // Then
    expect(createObjectUrlMock).toHaveBeenCalled();
  });

  it('exports selected clients as PDF report', async () => {
    // Given
    const clients = [buildClient('cli_pdf_pj', 'PJ'), buildClient('cli_pdf_pf', 'PF')];
    const projects = clients.map(buildProject);

    // When
    const exportExecution = exportClients(clients, projects, 'PDF');

    // Then
    await expect(exportExecution).resolves.toBeUndefined();
  });

  it('exports selected clients as DOCX report', async () => {
    // Given
    const clients = [buildClient('cli_docx_pj', 'PJ'), buildClient('cli_docx_pf', 'PF')];
    const projects = clients.map(buildProject);

    // When
    await exportClients(clients, projects, 'DOCX');

    // Then
    expect(createObjectUrlMock).toHaveBeenCalled();
  });
});
