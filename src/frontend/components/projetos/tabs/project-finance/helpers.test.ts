import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Installment } from '@/types';
import { PAYMENT_STATUS_DOT_COLORS } from '@/constants';
import { getInstallmentStatus, getAuditTrailActionText } from './helpers';
import type { AddendumAuditEntry } from './types';

// ─── Factories ───────────────────────────────────────────────────────────────

function makeInstallment(overrides: Partial<Installment> = {}): Installment {
  return {
    id: 'inst-1',
    number: 1,
    value: 1000,
    dueDate: '2026-04-01',
    paid: false,
    paymentDate: null,
    ...overrides,
  };
}

function makeAuditEntry(overrides: Partial<AddendumAuditEntry>): AddendumAuditEntry {
  return {
    id: 'audit-1',
    addendumId: 'add-1',
    action: 'created',
    description: 'Test entry',
    timestamp: '2026-03-05T12:00:00Z',
    ...overrides,
  } as AddendumAuditEntry;
}

// ─── getInstallmentStatus ────────────────────────────────────────────────────

describe('getInstallmentStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-05T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Branch: paid ─────────────────────────────────────────────────────────

  describe('when installment is paid', () => {
    it('returns "Pago" with success color and correct dot', () => {
      const result = getInstallmentStatus(makeInstallment({ paid: true }));

      expect(result).toEqual({
        text: 'Pago',
        color: 'text-success',
        dotColor: PAYMENT_STATUS_DOT_COLORS['Em dia'],
      });
    });

    it('ignores due date when already paid (even if past due)', () => {
      const result = getInstallmentStatus(makeInstallment({ paid: true, dueDate: '2020-01-01' }));

      expect(result.text).toBe('Pago');
      expect(result.color).toBe('text-success');
    });

    it('returns consistent dot color mapped to "Em dia" status', () => {
      const result = getInstallmentStatus(makeInstallment({ paid: true }));

      expect(result.dotColor).toBe('bg-success');
    });
  });

  // --- Branch: overdue (unpaid + past due date) ─────────────────────────────

  describe('when installment is overdue', () => {
    it('returns "Atrasado" with error styling for past due date', () => {
      const result = getInstallmentStatus(makeInstallment({ dueDate: '2026-03-01' }));

      expect(result).toEqual({
        text: 'Atrasado',
        color: 'text-error',
        dotColor: PAYMENT_STATUS_DOT_COLORS['Em Atraso'],
      });
    });

    it('detects overdue when due date is exactly yesterday', () => {
      const result = getInstallmentStatus(makeInstallment({ dueDate: '2026-03-04' }));

      expect(result.text).toBe('Atrasado');
      expect(result.dotColor).toBe('bg-error');
    });

    it('detects overdue for dd/mm/yyyy format (PT-BR)', () => {
      const result = getInstallmentStatus(makeInstallment({ dueDate: '01/01/2026' }));

      expect(result.text).toBe('Atrasado');
    });

    it('detects overdue for dates far in the past', () => {
      const result = getInstallmentStatus(makeInstallment({ dueDate: '2020-06-15' }));

      expect(result.text).toBe('Atrasado');
    });
  });

  // --- Branch: pending (unpaid + future or today due date) ────────────────

  describe('when installment is pending', () => {
    it('returns "Pendente" with warning styling for future due date', () => {
      const result = getInstallmentStatus(makeInstallment({ dueDate: '2026-12-31' }));

      expect(result).toEqual({
        text: 'Pendente',
        color: 'text-warning',
        dotColor: PAYMENT_STATUS_DOT_COLORS['Pendente'],
      });
    });

    it('treats today as pending (not overdue)', () => {
      const result = getInstallmentStatus(makeInstallment({ dueDate: '2026-03-05' }));

      expect(result.text).toBe('Pendente');
      expect(result.color).toBe('text-warning');
    });

    it('returns consistent dot color mapped to "Pendente" status', () => {
      const result = getInstallmentStatus(makeInstallment({ dueDate: '2027-01-01' }));

      expect(result.dotColor).toBe('bg-warning');
    });
  });

  // --- Edge cases ───────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('returns "Pendente" for invalid due date (parseDateString returns null)', () => {
      const result = getInstallmentStatus(makeInstallment({ dueDate: 'not-a-date' }));

      expect(result.text).toBe('Pendente');
    });

    it('returns "Pendente" when dueDate is an empty string', () => {
      const result = getInstallmentStatus(makeInstallment({ dueDate: '' }));

      expect(result.text).toBe('Pendente');
    });
  });
});

// ─── getAuditTrailActionText ─────────────────────────────────────────────────

describe('getAuditTrailActionText', () => {
  it('returns "Criado" for "created" action', () => {
    const result = getAuditTrailActionText(makeAuditEntry({ action: 'created' }));

    expect(result).toBe('Criado');
  });

  it('returns "Removido" for "deleted" action', () => {
    const result = getAuditTrailActionText(makeAuditEntry({ action: 'deleted' }));

    expect(result).toBe('Removido');
  });

  it('returns formatted transition string for "status_changed"', () => {
    const result = getAuditTrailActionText(
      makeAuditEntry({
        action: 'status_changed',
        fromStatus: 'Rascunho',
        toStatus: 'Aprovado',
      }),
    );

    expect(result).toBe('Status: Rascunho -> Aprovado');
  });

  it('handles all valid addendum status pairs', () => {
    const transitions: Array<[string, string]> = [
      ['Pendente', 'Faturado'],
      ['Rascunho', 'Rejeitado'],
      ['Aprovado', 'Faturado'],
    ];

    transitions.forEach(([from, to]) => {
      const result = getAuditTrailActionText(
        makeAuditEntry({
          action: 'status_changed',
          fromStatus: from as AddendumAuditEntry['fromStatus'],
          toStatus: to as AddendumAuditEntry['toStatus'],
        }),
      );

      expect(result).toBe(`Status: ${from} -> ${to}`);
    });
  });

  it('gracefully handles undefined statuses in status_changed', () => {
    const result = getAuditTrailActionText(
      makeAuditEntry({
        action: 'status_changed',
        fromStatus: undefined,
        toStatus: undefined,
      }),
    );

    expect(result).toBe('Status: undefined -> undefined');
  });
});
