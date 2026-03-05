import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { ContractAddendum, ContractAddendumStatus } from '../types';
import { createTestProject } from '../test/factories';
import { appendAddendumAuditEntry, recalculateProjectTotals } from './addendumUtils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeAddendum = (status: ContractAddendumStatus, value: number): ContractAddendum => ({
  id: `add-${value}`,
  description: 'Addendum de teste',
  date: '2026-01-01',
  status,
  value,
});

// ---------------------------------------------------------------------------
// appendAddendumAuditEntry
// ---------------------------------------------------------------------------

describe('appendAddendumAuditEntry', () => {
  const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T/;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('prepends entry to the audit trail (newest first)', () => {
    // Arrange
    const existingEntry = {
      id: 'existing-1',
      addendumId: 'add-1',
      action: 'created' as const,
      description: 'Aditivo criado',
      timestamp: '2026-01-10T08:00:00.000Z',
      actor: 'Usuário',
    };
    const project = createTestProject({
      financials: {
        paymentType: 'vista',
        addendumAuditTrail: [existingEntry],
      },
    });

    // Act
    const result = appendAddendumAuditEntry(project, {
      addendumId: 'add-2',
      action: 'status_changed',
      description: 'Status alterado para Aprovado',
      fromStatus: 'Pendente',
      toStatus: 'Aprovado',
    });

    // Assert — new entry is at index 0
    expect(result.financials.addendumAuditTrail).toHaveLength(2);
    expect(result.financials.addendumAuditTrail![0].action).toBe('status_changed');
    expect(result.financials.addendumAuditTrail![1].id).toBe('existing-1');
  });

  it('generates a unique id for the new entry', () => {
    // Arrange
    const project = createTestProject({ financials: { paymentType: 'vista' } });

    // Act
    const result1 = appendAddendumAuditEntry(project, {
      addendumId: 'add-1',
      action: 'created',
      description: 'Criado',
    });
    const result2 = appendAddendumAuditEntry(project, {
      addendumId: 'add-1',
      action: 'created',
      description: 'Criado',
    });

    // Assert
    const id1 = result1.financials.addendumAuditTrail![0].id;
    const id2 = result2.financials.addendumAuditTrail![0].id;
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('sets timestamp as current ISO string', () => {
    // Arrange
    const project = createTestProject({ financials: { paymentType: 'vista' } });

    // Act
    const result = appendAddendumAuditEntry(project, {
      addendumId: 'add-1',
      action: 'created',
      description: 'Criado',
    });

    // Assert
    const { timestamp } = result.financials.addendumAuditTrail![0];
    expect(timestamp).toMatch(ISO_REGEX);
    expect(timestamp).toBe('2026-01-15T10:00:00.000Z');
  });

  it('defaults actor to "Sistema" when not provided', () => {
    // Arrange
    const project = createTestProject({ financials: { paymentType: 'vista' } });

    // Act
    const result = appendAddendumAuditEntry(project, {
      addendumId: 'add-1',
      action: 'created',
      description: 'Criado',
    });

    // Assert
    expect(result.financials.addendumAuditTrail![0].actor).toBe('Sistema');
  });

  it('uses the provided actor instead of the default', () => {
    // Arrange
    const project = createTestProject({ financials: { paymentType: 'vista' } });

    // Act
    const result = appendAddendumAuditEntry(project, {
      addendumId: 'add-1',
      action: 'status_changed',
      description: 'Aprovado pelo arquiteto',
      actor: 'Arq. João',
    });

    // Assert
    expect(result.financials.addendumAuditTrail![0].actor).toBe('Arq. João');
  });

  it('handles a project with no existing audit trail (initializes to single entry)', () => {
    // Arrange — financials without addendumAuditTrail
    const project = createTestProject({ financials: { paymentType: 'vista' } });

    // Act
    const result = appendAddendumAuditEntry(project, {
      addendumId: 'add-1',
      action: 'created',
      description: 'Criado',
    });

    // Assert
    expect(result.financials.addendumAuditTrail).toHaveLength(1);
  });

  it('does not mutate the original project', () => {
    // Arrange
    const project = createTestProject({ financials: { paymentType: 'vista' } });
    const originalTrail = project.financials.addendumAuditTrail;

    // Act
    appendAddendumAuditEntry(project, {
      addendumId: 'add-1',
      action: 'created',
      description: 'Criado',
    });

    // Assert — original is untouched
    expect(project.financials.addendumAuditTrail).toBe(originalTrail);
  });
});

// ---------------------------------------------------------------------------
// recalculateProjectTotals
// ---------------------------------------------------------------------------

describe('recalculateProjectTotals', () => {
  it('sets totalValue to base + sum of approved/faturado addendums', () => {
    // Arrange
    const project = createTestProject({
      budget: 50_000,
      financials: {
        paymentType: 'parcelado',
        baseContractValue: 50_000,
        totalValue: 50_000,
      },
    });
    const nextAddendums: ContractAddendum[] = [
      makeAddendum('Aprovado', 10_000),
      makeAddendum('Faturado', 5_000),
      makeAddendum('Pendente', 3_000), // should NOT be included
    ];

    // Act
    const result = recalculateProjectTotals(project, nextAddendums);

    // Assert — 50k base + 15k approved = 65k
    expect(result.financials.totalValue).toBe(65_000);
  });

  it('sets budget to the base contract value', () => {
    // Arrange
    const project = createTestProject({
      budget: 30_000,
      financials: { paymentType: 'parcelado', baseContractValue: 30_000, totalValue: 30_000 },
    });

    // Act
    const result = recalculateProjectTotals(project, [makeAddendum('Aprovado', 5_000)]);

    // Assert
    expect(result.budget).toBe(30_000);
  });

  it('updates lumpSumValue when paymentType is "vista"', () => {
    // Arrange
    const project = createTestProject({
      budget: 20_000,
      financials: {
        paymentType: 'vista',
        baseContractValue: 20_000,
        totalValue: 20_000,
        lumpSumValue: 20_000,
      },
    });
    const nextAddendums: ContractAddendum[] = [makeAddendum('Aprovado', 8_000)];

    // Act
    const result = recalculateProjectTotals(project, nextAddendums);

    // Assert — lumpSum mirrors total when paymentType is 'vista'
    expect(result.financials.lumpSumValue).toBe(28_000);
  });

  it('does not override lumpSumValue when paymentType is "parcelado"', () => {
    // Arrange
    const project = createTestProject({
      budget: 20_000,
      financials: {
        paymentType: 'parcelado',
        baseContractValue: 20_000,
        totalValue: 20_000,
        lumpSumValue: 20_000,
      },
    });

    // Act
    const result = recalculateProjectTotals(project, [makeAddendum('Aprovado', 5_000)]);

    // Assert — lumpSum unchanged for installments
    expect(result.financials.lumpSumValue).toBe(20_000);
  });

  it('stores the new addendums list in financials', () => {
    // Arrange
    const project = createTestProject({
      budget: 10_000,
      financials: { paymentType: 'vista', baseContractValue: 10_000, totalValue: 10_000 },
    });
    const nextAddendums: ContractAddendum[] = [makeAddendum('Aprovado', 2_000)];

    // Act
    const result = recalculateProjectTotals(project, nextAddendums);

    // Assert
    expect(result.financials.addendums).toEqual(nextAddendums);
  });

  it('handles empty addendums array (contract value remains unchanged)', () => {
    // Arrange
    const project = createTestProject({
      budget: 15_000,
      financials: { paymentType: 'parcelado', baseContractValue: 15_000, totalValue: 15_000 },
    });

    // Act
    const result = recalculateProjectTotals(project, []);

    // Assert
    expect(result.financials.totalValue).toBe(15_000);
    expect(result.budget).toBe(15_000);
  });

  it('does not mutate the original project', () => {
    // Arrange
    const project = createTestProject({
      budget: 10_000,
      financials: { paymentType: 'vista', baseContractValue: 10_000, totalValue: 10_000 },
    });
    const originalBudget = project.budget;

    // Act
    recalculateProjectTotals(project, [makeAddendum('Aprovado', 5_000)]);

    // Assert
    expect(project.budget).toBe(originalBudget);
  });
});
