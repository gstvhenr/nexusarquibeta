import type { Client, DocumentFile, DocumentFolder, DocumentItem, DocumentStorage } from '@/types';
import { firebaseFileService } from '../firebaseFileService';

export type IdentifiableRecord = {
  id: string;
  [key: string]: unknown;
};

type DocumentNodeRecord = {
  id: string;
  rootKey: keyof DocumentStorage;
  parentId: string | null;
  type: 'folder' | 'file';
  payload: DocumentFolder | DocumentFile;
};

export function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

export function computeHash(value: unknown): string {
  return JSON.stringify(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isIdentifiableArray(value: unknown): value is IdentifiableRecord[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => isRecord(entry) && typeof entry.id === 'string' && entry.id.length > 0)
  );
}

export function getArrayOrderField(item: IdentifiableRecord, orderIndex: number): number {
  const explicitOrder = item.order;
  return typeof explicitOrder === 'number' && Number.isFinite(explicitOrder)
    ? explicitOrder
    : orderIndex;
}

export function decodePreferenceKey(encodedKey: string): string {
  return decodeURIComponent(encodedKey);
}

export function encodePreferenceKey(key: string): string {
  return encodeURIComponent(key);
}

function flattenDocumentTree(
  rootKey: keyof DocumentStorage,
  node: DocumentFolder,
  parentId: string | null,
): DocumentNodeRecord[] {
  const nextNodes: DocumentNodeRecord[] = [
    {
      id: node.id,
      rootKey,
      parentId,
      type: 'folder',
      payload: {
        ...node,
        children: [],
      },
    },
  ];

  for (const child of node.children) {
    if (child.type === 'folder') {
      nextNodes.push(...flattenDocumentTree(rootKey, child, node.id));
      continue;
    }

    nextNodes.push({
      id: child.id,
      rootKey,
      parentId: node.id,
      type: 'file',
      payload: cloneValue(child),
    });
  }

  return nextNodes;
}

export function flattenDocumentStorage(
  storage: DocumentStorage | undefined | null,
): DocumentNodeRecord[] {
  if (!storage || !storage.personal || !storage.projects) {
    return [];
  }

  return [
    ...flattenDocumentTree('personal', storage.personal, null),
    ...flattenDocumentTree('projects', storage.projects, null),
  ];
}

export function rebuildDocumentStorage(nodes: DocumentNodeRecord[]): DocumentStorage {
  const folderMap = new Map<string, DocumentFolder>();
  const fileNodes: Array<{ parentId: string | null; node: DocumentFile }> = [];

  for (const node of nodes) {
    if (node.type === 'folder') {
      folderMap.set(node.id, {
        ...(node.payload as DocumentFolder),
        children: [],
      });
      continue;
    }

    fileNodes.push({
      parentId: node.parentId,
      node: cloneValue(node.payload as DocumentFile),
    });
  }

  for (const node of nodes) {
    if (node.parentId === null) {
      continue;
    }

    const parentFolder = folderMap.get(node.parentId);
    if (!parentFolder) {
      continue;
    }

    if (node.type === 'folder') {
      const childFolder = folderMap.get(node.id);
      if (childFolder) {
        parentFolder.children.push(childFolder);
      }
    }
  }

  for (const { parentId, node } of fileNodes) {
    if (!parentId) {
      continue;
    }

    const parentFolder = folderMap.get(parentId);
    if (parentFolder) {
      parentFolder.children.push(node);
    }
  }

  const personal = folderMap.get('personal-root');
  const projects = folderMap.get('projects-root');

  if (!personal || !projects) {
    throw new Error('Estrutura documental inválida: raízes do armazenamento não encontradas.');
  }

  return { personal, projects };
}

async function sanitizeDocumentSources(file: DocumentFile): Promise<DocumentFile> {
  const nextSources = await Promise.all(
    file.sources.map(async (source, index) => {
      if (
        source.type !== 'upload' ||
        !source.content ||
        !source.content.startsWith('data:') ||
        source.storagePath
      ) {
        return source;
      }

      const storagePath = await firebaseFileService.uploadDataUrl(
        `documents/${file.id}/${source.id}/${source.fileName || `file-${index}`}`,
        source.content,
        { contentType: source.fileType },
      );

      return {
        ...source,
        content: undefined,
        storagePath,
        storageProvider: 'firebase-storage' as const,
      };
    }),
  );

  return {
    ...file,
    sources: nextSources,
  };
}

async function sanitizeDocumentStorage(
  storage: DocumentStorage | undefined | null,
): Promise<DocumentStorage> {
  if (!storage || !storage.personal || !storage.projects) {
    return storage as DocumentStorage;
  }

  const sanitizeFolder = async (folder: DocumentFolder): Promise<DocumentFolder> => {
    const sanitizedChildren: DocumentItem[] = [];

    for (const child of folder.children) {
      if (child.type === 'folder') {
        sanitizedChildren.push(await sanitizeFolder(child));
        continue;
      }

      sanitizedChildren.push(await sanitizeDocumentSources(child));
    }

    return {
      ...folder,
      children: sanitizedChildren,
    };
  };

  return {
    personal: await sanitizeFolder(storage.personal),
    projects: await sanitizeFolder(storage.projects),
  };
}

async function sanitizeClientRecords(clients: Client[]): Promise<Client[]> {
  return Promise.all(
    clients.map(async (client) => {
      if (
        !client.avatarUrl ||
        !client.avatarUrl.startsWith('data:image/') ||
        client.avatarStoragePath
      ) {
        return client;
      }

      const storagePath = await firebaseFileService.uploadDataUrl(
        `avatars/${client.id}/legacy-avatar`,
        client.avatarUrl,
      );
      const avatarUrl = await firebaseFileService.getFileUrl(storagePath);

      return {
        ...client,
        avatarStoragePath: storagePath,
        avatarUrl: avatarUrl ?? client.avatarUrl,
      };
    }),
  );
}

export async function sanitizeDomainValue(domainKey: string, value: unknown): Promise<unknown> {
  if (domainKey === 'documentStorage' && isRecord(value)) {
    return sanitizeDocumentStorage(value as unknown as DocumentStorage);
  }

  if (domainKey === 'clients' && Array.isArray(value)) {
    return sanitizeClientRecords(value as Client[]);
  }

  return value;
}

export function stripRemoteMetadata<T extends Record<string, unknown>>(value: T): T {
  const nextValue = { ...value };
  delete nextValue.__order;
  delete nextValue.__deviceId;
  delete nextValue.__updatedAt;
  return nextValue as T;
}
