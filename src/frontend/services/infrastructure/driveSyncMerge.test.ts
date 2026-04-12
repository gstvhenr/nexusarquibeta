import { describe, expect, it } from 'vitest';
import {
  buildDomainDeletionTombstones,
  isIdentifiableRecordArray,
  mergeRecordArrays,
} from './driveSyncMerge';

describe('driveSyncMerge', () => {
  it('should merge local and remote identifiable records preserving both sides when ids differ', () => {
    const { mergedRecords } = mergeRecordArrays({
      localRecords: [{ id: 'local-1', name: 'Local' }],
      remoteRecords: [{ id: 'remote-1', name: 'Remote' }],
      localFallbackTimestamp: 100,
      remoteFallbackTimestamp: 200,
    });

    expect(mergedRecords).toEqual([
      { id: 'remote-1', name: 'Remote' },
      { id: 'local-1', name: 'Local' },
    ]);
  });

  it('should prefer the newest version of the same record id', () => {
    const { mergedRecords } = mergeRecordArrays({
      localRecords: [{ id: 'same', name: 'Local', updatedAt: '2026-04-11T10:00:00.000Z' }],
      remoteRecords: [{ id: 'same', name: 'Remote', updatedAt: '2026-04-11T11:00:00.000Z' }],
      localFallbackTimestamp: 100,
      remoteFallbackTimestamp: 200,
    });

    expect(mergedRecords).toEqual([
      { id: 'same', name: 'Remote', updatedAt: '2026-04-11T11:00:00.000Z' },
    ]);
  });

  it('should respect tombstones and keep deletions from resurrecting', () => {
    const { mergedRecords } = mergeRecordArrays({
      localRecords: [{ id: 'gone', name: 'Local' }],
      remoteRecords: [{ id: 'gone', name: 'Remote' }],
      localFallbackTimestamp: 100,
      remoteFallbackTimestamp: 200,
      remoteTombstones: { gone: 300 },
    });

    expect(mergedRecords).toEqual([]);
  });

  it('should build tombstones only for removed records and clear them when restored', () => {
    const removed = buildDomainDeletionTombstones(
      [
        { id: '1', value: 'A' },
        { id: '2', value: 'B' },
      ],
      [{ id: '2', value: 'B' }],
      {},
      500,
    );

    expect(removed).toEqual({ 1: 500 });

    const restored = buildDomainDeletionTombstones(
      [{ id: '2', value: 'B' }],
      [
        { id: '1', value: 'A' },
        { id: '2', value: 'B' },
      ],
      removed,
      700,
    );

    expect(restored).toEqual({});
  });

  it('should detect identifiable arrays only when all entries expose id', () => {
    expect(isIdentifiableRecordArray([{ id: '1' }, { id: '2' }])).toBe(true);
    expect(isIdentifiableRecordArray([{ id: '1' }, { name: 'broken' }])).toBe(false);
    expect(isIdentifiableRecordArray(null)).toBe(false);
  });
});
