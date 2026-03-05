import { describe, expect, it } from 'vitest';
import { getAuditTrailActionText, getInstallmentStatus } from './helpers';

describe('project-finance helpers', () => {
  it('returns installment status metadata for paid, late and pending', () => {
    const paid = getInstallmentStatus({
      id: 'inst-1',
      number: 1,
      value: 100,
      dueDate: '2026-01-01',
      paid: true,
      paymentDate: '2026-01-01',
    });
    const late = getInstallmentStatus({
      id: 'inst-2',
      number: 2,
      value: 100,
      dueDate: '2000-01-01',
      paid: false,
      paymentDate: null,
    });
    const pending = getInstallmentStatus({
      id: 'inst-3',
      number: 3,
      value: 100,
      dueDate: '2999-01-01',
      paid: false,
      paymentDate: null,
    });

    expect(paid.text).toBe('Pago');
    expect(late.text).toBe('Atrasado');
    expect(pending.text).toBe('Pendente');
  });

  it('returns readable audit trail action labels', () => {
    expect(
      getAuditTrailActionText({
        id: 'a',
        addendumId: '1',
        action: 'created',
        description: 'Aditivo A',
        timestamp: '2026-01-01T00:00:00.000Z',
      }),
    ).toBe('Criado');

    expect(
      getAuditTrailActionText({
        id: 'b',
        addendumId: '1',
        action: 'deleted',
        description: 'Aditivo A',
        timestamp: '2026-01-01T00:00:00.000Z',
      }),
    ).toBe('Removido');

    expect(
      getAuditTrailActionText({
        id: 'c',
        addendumId: '1',
        action: 'status_changed',
        description: 'Aditivo A',
        fromStatus: 'Pendente',
        toStatus: 'Aprovado',
        timestamp: '2026-01-01T00:00:00.000Z',
      }),
    ).toBe('Status: Pendente -> Aprovado');
  });
});
