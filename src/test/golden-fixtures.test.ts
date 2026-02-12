import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readFixture = (fileName: string): unknown => {
  const fixturePath = resolve(process.cwd(), 'src', 'test', 'fixtures', fileName);
  const raw = readFileSync(fixturePath, 'utf-8');
  return JSON.parse(raw) as unknown;
};

const expectExactKeys = (value: unknown, expectedKeys: string[]): Record<string, unknown> => {
  expect(value).not.toBeNull();
  expect(typeof value).toBe('object');

  const record = value as Record<string, unknown>;
  expect(Object.keys(record).sort()).toEqual([...expectedKeys].sort());
  return record;
};

describe('golden fixtures contracts', () => {
  it('keeps canonical Client shape stable', () => {
    const client = expectExactKeys(readFixture('client.fixture.json'), [
      'id',
      'name',
      'contacts',
      'status',
      'serviceInterests',
      'address',
      'isFavorite',
      'registrationDate',
      'lastContactDate',
      'pipelineStatus',
      'meetings',
      'behavioralProfile',
      'archived',
    ]);

    const contacts = client.contacts as unknown[];
    expect(Array.isArray(contacts)).toBe(true);
    expect(contacts.length).toBeGreaterThan(0);
    expectExactKeys(contacts[0], ['id', 'phone', 'hasWhatsApp', 'isPrimary']);

    expectExactKeys(client.address, ['street', 'number', 'neighborhood', 'city', 'state', 'zip']);
    expectExactKeys(client.behavioralProfile, ['notes']);
  });

  it('keeps canonical Project shape stable', () => {
    const project = expectExactKeys(readFixture('project.fixture.json'), [
      'id',
      'code',
      'name',
      'clientName',
      'clientId',
      'status',
      'deadline',
      'budget',
      'description',
      'sections',
      'financials',
    ]);

    const sections = project.sections as unknown[];
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(0);

    const section = expectExactKeys(sections[0], ['id', 'name', 'tasks']);
    const tasks = section.tasks as unknown[];
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);
    expectExactKeys(tasks[0], ['id', 'name', 'completed', 'hours']);

    expectExactKeys(project.financials, [
      'paymentType',
      'baseContractValue',
      'totalValue',
      'lumpSumValue',
      'lumpSumDueDate',
      'lumpSumStatus',
      'lumpSumPaymentDate',
    ]);
  });

  it('keeps canonical Proposal shape stable', () => {
    const proposal = expectExactKeys(readFixture('proposal.fixture.json'), [
      'id',
      'code',
      'name',
      'date',
      'status',
      'sections',
      'discount',
      'subtotal',
      'total',
    ]);

    const sections = proposal.sections as unknown[];
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(0);

    const section = expectExactKeys(sections[0], ['id', 'title', 'items']);
    const items = section.items as unknown[];
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    expectExactKeys(items[0], ['id', 'description', 'unit', 'quantity', 'unitPrice']);
  });
});
