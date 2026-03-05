import { describe, expect, it } from 'vitest';
import type { Client } from '../types';
import { createTestProject } from '../test/factories';
import {
  getPaymentStatusByClientId,
  saveClientAndUpdateState,
  validateClientForProject,
} from './clientService';

// ── Shared factory ────────────────────────────────────────────────────

const buildClient = (overrides: Partial<Client> = {}): Client =>
  ({
    id: 'cli_base',
    name: 'Cliente Base',
    clientType: 'PF',
    cpfCnpj: '',
    birthDate: '1990-01-01',
    contacts: [{ id: 'ct_1', phone: '(11) 99999-0000', hasWhatsApp: true, isPrimary: true }],
    email: 'base@nexus.test',
    status: 'Cliente Ativo',
    leadSource: 'Indicação',
    serviceInterests: ['Projeto Executivo'],
    address: {
      street: 'Rua das Flores',
      number: '100',
      complement: '',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zip: '01000-000',
    },
    isFavorite: false,
    registrationDate: '2025-01-01',
    lastContactDate: '2025-01-10',
    pipelineStatus: 'Em negociação',
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: false,
    ...overrides,
  }) as Client;

// ── getPaymentStatusByClientId ────────────────────────────────────────

describe('clientService.getPaymentStatusByClientId', () => {
  it('marks client as "Em dia" when there are no linked projects', () => {
    // Given
    const clients = [{ id: 'c_no_proj' }] as Client[];

    // When
    const map = getPaymentStatusByClientId(clients, []);

    // Then
    expect(map.get('c_no_proj')).toBe('Em dia');
  });

  it('marks client as "Em dia" when all installments are paid', () => {
    // Given
    const clients = [{ id: 'c_paid' }] as Client[];
    const projects = [
      createTestProject({
        id: 'p_paid',
        clientId: 'c_paid',
        archived: false,
        financials: {
          paymentType: 'parcelado',
          installments: [
            { id: 'i1', number: 1, dueDate: '2000-01-01', paid: true, value: 100, paymentDate: '2000-01-01' },
            { id: 'i2', number: 2, dueDate: '2000-02-01', paid: true, value: 100, paymentDate: '2000-02-01' },
          ],
        },
      }),
    ];

    // When
    const map = getPaymentStatusByClientId(clients, projects);

    // Then
    expect(map.get('c_paid')).toBe('Em dia');
  });

  it('marks client as overdue when there is an overdue unpaid installment', () => {
    // Given — cliente com uma parcela vencida e não paga
    const clients = [{ id: 'c1' }] as Client[];
    const projects = [
      createTestProject({
        id: 'p1',
        clientId: 'c1',
        archived: false,
        financials: {
          paymentType: 'parcelado',
          installments: [
            { id: 'i1', number: 1, dueDate: '2000-01-01', paid: false, value: 100, paymentDate: null },
          ],
        },
      }),
    ];

    // When
    const map = getPaymentStatusByClientId(clients, projects);

    // Then
    expect(map.get('c1')).toBe('Em Atraso');
  });

  it('marks client as pending when there is unpaid future debt (vista)', () => {
    // Given — cliente com cobrança em aberto no futuro
    const clients = [{ id: 'c2' }] as Client[];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const projects = [
      createTestProject({
        id: 'p2',
        clientId: 'c2',
        archived: false,
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: nextMonth.toISOString().split('T')[0],
        },
      }),
    ];

    // When
    const map = getPaymentStatusByClientId(clients, projects);

    // Then
    expect(map.get('c2')).toBe('Pendente');
  });

  it('marks client as overdue when lump-sum vista is past due', () => {
    // Given
    const clients = [{ id: 'c3' }] as Client[];
    const projects = [
      createTestProject({
        id: 'p3',
        clientId: 'c3',
        archived: false,
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: '2000-01-01',
        },
      }),
    ];

    // When
    const map = getPaymentStatusByClientId(clients, projects);

    // Then
    expect(map.get('c3')).toBe('Em Atraso');
  });
});

// ── saveClientAndUpdateState ──────────────────────────────────────────

describe('clientService.saveClientAndUpdateState', () => {
  it('rejects duplicate CPF/CNPJ', () => {
    // Given — já existe cliente com mesmo CPF
    const existing = [{ id: '1', cpfCnpj: '11144477735' }] as Client[];
    const incoming = { id: '2', cpfCnpj: '111.444.777-35' } as Client;

    // When
    const result = saveClientAndUpdateState(incoming, null, existing);

    // Then
    expect(result.error).toBe('duplicate_cpf_cnpj');
    expect(result.updatedClients).toBe(existing);
  });

  it('rejects invalid CPF/CNPJ', () => {
    // Given — CPF com dígitos inválidos
    const existing = [] as Client[];

    // When
    const result = saveClientAndUpdateState(
      { id: '1', cpfCnpj: '12345678900' } as Client,
      null,
      existing,
    );

    // Then
    expect(result.error).toBe('invalid_cpf_cnpj');
    expect(result.updatedClients).toBe(existing);
  });

  it('creates new client with generated id and initial audit log', () => {
    // Given — cliente novo sem ID
    const incoming = buildClient({
      id: '',
      cpfCnpj: '',
      registrationDate: '',
      lastContactDate: '',
    });

    // When
    const result = saveClientAndUpdateState(incoming, null, []);

    // Then
    expect(result.error).toBeUndefined();
    expect(result.updatedClients).toHaveLength(1);
    expect(result.updatedClients[0].id).toBeTruthy();
    expect(result.updatedClients[0].auditLog).toHaveLength(1);
    expect(result.updatedClients[0].auditLog![0].field).toBe('Cliente');
  });

  it('updates existing client and generates audit diff log for changed fields', () => {
    // Given — cliente salvo com nome diferente
    const original = buildClient({ id: 'cli_existing', name: 'Nome Antigo' });
    const updated = { ...original, name: 'Nome Novo' };
    const allClients = [original];

    // When
    const result = saveClientAndUpdateState(updated, original, allClients);

    // Then — não deve retornar erro e deve gerar audit log de diff
    expect(result.error).toBeUndefined();
    expect(result.updatedClients).toHaveLength(1);
    expect(result.updatedClients[0].name).toBe('Nome Novo');
    const auditLog = result.updatedClients[0].auditLog ?? [];
    const nameChange = auditLog.find((log) => log.field === 'Nome');
    expect(nameChange).toBeDefined();
    expect(nameChange!.oldValue).toContain('Nome Antigo');
    expect(nameChange!.newValue).toContain('Nome Novo');
  });

  it('does not add audit log when no fields change on update', () => {
    // Given — client idêntico ao original
    const original = buildClient({ id: 'cli_same', auditLog: [] });
    const unchanged = { ...original };
    const allClients = [original];

    // When
    const result = saveClientAndUpdateState(unchanged, original, allClients);

    // Then — nenhuma entrada nova no audit log
    expect(result.error).toBeUndefined();
    expect(result.updatedClients[0].auditLog).toHaveLength(0);
  });
});

// ── validateClientForProject ──────────────────────────────────────────

describe('clientService.validateClientForProject', () => {
  it('returns valid=true for a fully-filled PF client', () => {
    // Given — cliente PF com todos os campos obrigatórios preenchidos
    const client = buildClient({ clientType: 'PF', cpfCnpj: '123.456.789-09' });

    // When
    const result = validateClientForProject(client);

    // Then
    expect(result.valid).toBe(true);
    expect(result.missingFields).toHaveLength(0);
  });

  it('returns missing fields for a PF client with no name, no CPF, no phone, no address', () => {
    // Given — cliente PF incompleto
    const client = buildClient({
      clientType: 'PF',
      name: '',
      birthDate: '',
      cpfCnpj: '',
      contacts: [],
      address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
      status: '' as Client['status'],
      pipelineStatus: '' as Client['pipelineStatus'],
      leadSource: 'Não informado',
      serviceInterests: [],
    });

    // When
    const result = validateClientForProject(client);

    // Then
    expect(result.valid).toBe(false);
    expect(result.missingFields).toContain('Nome ou Razão Social');
    expect(result.missingFields).toContain('Data de Nascimento');
    expect(result.missingFields).toContain('CPF');
    expect(result.missingFields).toContain('Pelo menos um telefone de contato');
    expect(result.missingFields).toContain(
      'Endereço completo (Rua, Número, Bairro, Cidade, Estado, CEP)',
    );
    expect(result.missingFields).toContain('Status do Cliente');
    expect(result.missingFields).toContain('Status no Pipeline');
    expect(result.missingFields).toContain('Fonte do Lead');
    expect(result.missingFields).toContain('Serviços de Interesse');
  });

  it('returns valid=true for a fully-filled PJ client with representante', () => {
    // Given — cliente PJ completo
    const client = buildClient({
      clientType: 'PJ',
      cpfCnpj: '12.345.678/0001-99',
      birthDate: '2018-05-20',
      representative: { name: 'João Silva', role: 'Diretor', relationship: 'Sócio' },
    });

    // When
    const result = validateClientForProject(client);

    // Then
    expect(result.valid).toBe(true);
    expect(result.missingFields).toHaveLength(0);
  });

  it('returns missing fields for a PJ client without representante', () => {
    // Given — PJ sem representante, sem CNPJ, sem data de abertura
    const client = buildClient({
      clientType: 'PJ',
      cpfCnpj: '',
      birthDate: '',
      representative: undefined,
    });

    // When
    const result = validateClientForProject(client);

    // Then
    expect(result.valid).toBe(false);
    expect(result.missingFields).toContain('Data de Abertura');
    expect(result.missingFields).toContain('CNPJ');
    expect(result.missingFields).toContain('Nome do Representante');
    expect(result.missingFields).toContain('Cargo do Representante');
  });

  it('reports missing phone when contact list is present but phone is empty', () => {
    // Given — contato existe mas sem número
    const client = buildClient({
      clientType: 'PF',
      contacts: [{ id: 'ct_empty', phone: '', hasWhatsApp: false, isPrimary: true }],
    });

    // When
    const result = validateClientForProject(client);

    // Then
    expect(result.missingFields).toContain('Pelo menos um telefone de contato');
  });

  it('reports missing address fields individually', () => {
    // Given — endereço parcialmente preenchido (sem CEP e sem número)
    const client = buildClient({
      clientType: 'PF',
      address: {
        street: 'Rua A',
        number: '',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zip: '',
      },
    });

    // When
    const result = validateClientForProject(client);

    // Then
    expect(result.valid).toBe(false);
    expect(result.missingFields).toContain(
      'Endereço completo (Rua, Número, Bairro, Cidade, Estado, CEP)',
    );
  });
});
