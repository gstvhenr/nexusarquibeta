import { describe, expect, it } from 'vitest';
import type { Client } from '../types';
import { createTestProject } from '../test/factories';
import { getPaymentStatusByClientId, saveClientAndUpdateState } from './clientService';

describe('clientService.getPaymentStatusByClientId', () => {
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
            {
              id: 'i1',
              number: 1,
              dueDate: '2000-01-01',
              paid: false,
              value: 100,
              paymentDate: null,
            },
          ],
        },
      }),
    ];

    // When — status é calculado com base nos projetos financeiros
    const map = getPaymentStatusByClientId(clients, projects);

    // Then — status final deve marcar atraso
    expect(map.get('c1')).toBe('Em Atraso');
  });

  it('marks client as pending when there is unpaid future debt', () => {
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

    // When — status é calculado com vencimento futuro
    const map = getPaymentStatusByClientId(clients, projects);

    // Then — status final deve ficar pendente
    expect(map.get('c2')).toBe('Pendente');
  });
});

describe('clientService.saveClientAndUpdateState', () => {
  it('rejects duplicate CPF/CNPJ', () => {
    // Given — já existe cliente com mesmo CPF
    const existing = [{ id: '1', cpfCnpj: '11144477735' }] as Client[];
    const incoming = { id: '2', cpfCnpj: '111.444.777-35' } as Client;

    // When — tentativa de salvar cliente duplicado
    const result = saveClientAndUpdateState(incoming, null, existing);

    // Then — retorna erro de domínio e mantém lista original
    expect(result.error).toBe('duplicate_cpf_cnpj');
    expect(result.updatedClients).toBe(existing);
  });

  it('rejects invalid CPF/CNPJ', () => {
    // Given — CPF com dígitos inválidos
    const existing = [] as Client[];

    // When — tentativa de salvar com documento inválido
    const result = saveClientAndUpdateState(
      { id: '1', cpfCnpj: '12345678900' } as Client,
      null,
      existing,
    );

    // Then — retorna erro de validação e não altera lista
    expect(result.error).toBe('invalid_cpf_cnpj');
    expect(result.updatedClients).toBe(existing);
  });

  it('creates new client with generated id and initial audit log', () => {
    // Given — cliente novo sem ID e sem documento obrigatório
    const incoming = {
      id: '',
      name: 'Novo Cliente',
      cpfCnpj: '',
      contacts: [],
      status: 'Potencial Cliente',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zip: '',
      },
      serviceInterests: [],
      isFavorite: false,
      registrationDate: '',
      lastContactDate: '',
      pipelineStatus: 'Novo',
      meetings: [],
      behavioralProfile: { notes: '' },
      archived: false,
    } as Client;

    // When — primeiro salvamento da entidade
    const result = saveClientAndUpdateState(incoming, null, []);

    // Then — cria cliente com ID e log inicial de auditoria
    expect(result.error).toBeUndefined();
    expect(result.updatedClients).toHaveLength(1);
    expect(result.updatedClients[0].id).toBeTruthy();
    expect(result.updatedClients[0].auditLog).toHaveLength(1);
  });
});
