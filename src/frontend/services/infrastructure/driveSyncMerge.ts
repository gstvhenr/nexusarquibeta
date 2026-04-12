type IdentifiableRecord = {
  id: string;
  [key: string]: unknown;
};

interface MergeRecordArraysParams<T extends IdentifiableRecord> {
  localRecords: T[];
  remoteRecords: T[];
  localFallbackTimestamp: number;
  remoteFallbackTimestamp: number;
  localTombstones?: Record<string, number>;
  remoteTombstones?: Record<string, number>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseTimestampCandidate(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
}

function getRecordTimestamp(record: IdentifiableRecord, fallbackTimestamp: number): number {
  const knownKeys = [
    'updatedAt',
    'dateModified',
    'modifiedAt',
    'lastModified',
    'completedAt',
    'dateAdded',
    'lastContactDate',
    'registrationDate',
    'createdAt',
    'date',
  ];

  for (const key of knownKeys) {
    const candidate = parseTimestampCandidate(record[key]);
    if (candidate !== null) {
      return candidate;
    }
  }

  return fallbackTimestamp;
}

function mergeTombstones(
  localTombstones: Record<string, number> = {},
  remoteTombstones: Record<string, number> = {},
): Record<string, number> {
  const merged: Record<string, number> = {};
  const keys = new Set([...Object.keys(localTombstones), ...Object.keys(remoteTombstones)]);

  for (const key of keys) {
    merged[key] = Math.max(localTombstones[key] ?? 0, remoteTombstones[key] ?? 0);
  }

  return merged;
}

export function isIdentifiableRecordArray(value: unknown): value is IdentifiableRecord[] {
  return (
    Array.isArray(value) &&
    value.every((item) => isRecord(item) && typeof item.id === 'string' && item.id.length > 0)
  );
}

export function mergeRecordArrays<T extends IdentifiableRecord>({
  localRecords,
  remoteRecords,
  localFallbackTimestamp,
  remoteFallbackTimestamp,
  localTombstones = {},
  remoteTombstones = {},
}: MergeRecordArraysParams<T>): {
  mergedRecords: T[];
  mergedTombstones: Record<string, number>;
} {
  const mergedTombstones = mergeTombstones(localTombstones, remoteTombstones);
  const localById = new Map(localRecords.map((record) => [record.id, record]));
  const remoteById = new Map(remoteRecords.map((record) => [record.id, record]));
  const idsInOrder = [
    ...new Set([
      ...remoteRecords.map((record) => record.id),
      ...localRecords.map((record) => record.id),
    ]),
  ];
  const mergedRecords: T[] = [];

  for (const id of idsInOrder) {
    const localRecord = localById.get(id);
    const remoteRecord = remoteById.get(id);
    const localTimestamp = localRecord
      ? getRecordTimestamp(localRecord, localFallbackTimestamp)
      : localFallbackTimestamp;
    const remoteTimestamp = remoteRecord
      ? getRecordTimestamp(remoteRecord, remoteFallbackTimestamp)
      : remoteFallbackTimestamp;
    const deletedAt = mergedTombstones[id] ?? 0;

    if (localRecord && remoteRecord) {
      if (deletedAt >= Math.max(localTimestamp, remoteTimestamp)) {
        continue;
      }

      mergedRecords.push(remoteTimestamp >= localTimestamp ? remoteRecord : localRecord);
      continue;
    }

    if (localRecord) {
      if (deletedAt >= localTimestamp) {
        continue;
      }

      mergedRecords.push(localRecord);
      continue;
    }

    if (remoteRecord) {
      if (deletedAt >= remoteTimestamp) {
        continue;
      }

      mergedRecords.push(remoteRecord);
    }
  }

  const liveIds = new Set(mergedRecords.map((record) => record.id));
  for (const id of Object.keys(mergedTombstones)) {
    if (liveIds.has(id)) {
      delete mergedTombstones[id];
    }
  }

  return { mergedRecords, mergedTombstones };
}

export function buildDomainDeletionTombstones(
  previousValue: unknown,
  nextValue: unknown,
  existingTombstones: Record<string, number>,
  timestamp: number,
): Record<string, number> {
  if (!isIdentifiableRecordArray(previousValue) || !isIdentifiableRecordArray(nextValue)) {
    return existingTombstones;
  }

  const previousIds = new Set(previousValue.map((record) => record.id));
  const nextIds = new Set(nextValue.map((record) => record.id));
  const removedIds = [...previousIds].filter((id) => !nextIds.has(id));
  const restoredIds = [...nextIds].filter((id) => existingTombstones[id]);

  if (removedIds.length === 0 && restoredIds.length === 0) {
    return existingTombstones;
  }

  const nextTombstones = { ...existingTombstones };

  for (const removedId of removedIds) {
    nextTombstones[removedId] = timestamp;
  }

  for (const restoredId of restoredIds) {
    delete nextTombstones[restoredId];
  }

  return nextTombstones;
}
