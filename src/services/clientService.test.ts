import { describe, expect, it } from 'vitest';
import type { Client, Project } from '../types';
import { getPaymentStatusByClientId, saveClientAndUpdateState } from './clientService';

describe('clientService.getPaymentStatusByClientId', () => {
  it('marks client as overdue when there is an overdue unpaid installment', () => {
    const clients = [{ id: 'c1' }] as Client[];
    const projects = [
      {
        id: 'p1',
        clientId: 'c1',
        archived: false,
        financials: {
          paymentType: 'parcelado',
          installments: [
            {
              id: 'i1',
              dueDate: '2000-01-01',
              paid: false,
              value: 100,
            },
          ],
        },
      },
    ] as unknown as Project[];

    const map = getPaymentStatusByClientId(clients, projects);
    expect(map.get('c1')).toBe('Em Atraso');
  });

  it('marks client as pending when there is unpaid future debt', () => {
    const clients = [{ id: 'c2' }] as Client[];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const projects = [
      {
        id: 'p2',
        clientId: 'c2',
        archived: false,
        financials: {
          paymentType: 'vista',
          lumpSumStatus: 'Em aberto',
          lumpSumDueDate: nextMonth.toISOString().split('T')[0],
        },
      },
    ] as unknown as Project[];

    const map = getPaymentStatusByClientId(clients, projects);
    expect(map.get('c2')).toBe('Pendente');
  });
});

describe('clientService.saveClientAndUpdateState', () => {
  it('rejects duplicate CPF/CNPJ', () => {
    const existing = [{ id: '1', cpfCnpj: '11144477735' }] as Client[];
    const incoming = { id: '2', cpfCnpj: '111.444.777-35' } as Client;

    const result = saveClientAndUpdateState(incoming, null, existing);
    expect(result.error).toBe('duplicate_cpf_cnpj');
  });

  it('rejects invalid CPF/CNPJ', () => {
    const result = saveClientAndUpdateState(
      { id: '1', cpfCnpj: '12345678900' } as Client,
      null,
      [] as Client[],
    );

    expect(result.error).toBe('invalid_cpf_cnpj');
  });
});
