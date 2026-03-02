import type { Client, ClientContact, ClientStatus } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Legacy client shape used during data migration from older localStorage formats.
 */
export type LegacyClientRecord = Record<string, unknown> & {
  id?: string;
  name?: string;
  phone?: string;
  phoneHasWhatsApp?: boolean;
  contacts?: ClientContact[];
  address?: Partial<Client['address']>;
  registrationDate?: string;
  lastContactDate?: string;
  clientType?: Client['clientType'];
  meetings?: unknown[];
  projectLinks?: unknown[];
  auditLog?: unknown[];
};

/**
 * Shape for seed client data used during initial data population.
 */
export type SeedClientData = {
  id: string;
  Nome: string;
  CPF?: string;
  Email?: string;
  Telefone?: string;
  WhatsApp?: string;
  Logradouro?: string;
  Numero?: string;
  Complemento?: string;
  Bairro?: string;
  Cidade?: string;
  Estado?: string;
  CEP?: string;
  StatusCliente: ClientStatus;
  StatusPipeline?: string;
  FonteLead?: string;
  ServicosInteresse?: string;
};

/**
 * Input -> Output:
 * - input: array of legacy client records from localStorage.
 * - output: migrated Client[] with normalized contacts, registrationDate, address, and clientType.
 */
export const migrateClients = (clients: LegacyClientRecord[]): Client[] => {
  if (!clients || !Array.isArray(clients)) return [];

  const migratedClients = clients.map((client) => {
    const updatedClient = { ...client };

    // Migration 1: phone/phoneHasWhatsApp to contacts array
    if ((!Array.isArray(client.contacts) || client.contacts.length === 0) && client.phone) {
      updatedClient.contacts = [
        {
          id: uuidv4(),
          phone: client.phone,
          hasWhatsApp: !!client.phoneHasWhatsApp,
          isPrimary: true,
        },
      ];
      delete updatedClient.phone;
      delete updatedClient.phoneHasWhatsApp;
    } else if (!Array.isArray(client.contacts)) {
      updatedClient.contacts = [];
    }

    // Migration 2: Add registrationDate
    if (!client.registrationDate) {
      updatedClient.registrationDate = client.lastContactDate || new Date().toISOString();
    }

    // Migration 3: Add number to address
    if (client.address && typeof client.address.number === 'undefined') {
      updatedClient.address = { ...client.address, number: '' };
    }

    // Migration 4: Ensure clientType exists (default to PF if missing)
    if (!updatedClient.clientType) {
      updatedClient.clientType = 'PF';
    }

    return updatedClient as unknown as Client;
  });

  return migratedClients;
};

/**
 * Input -> Output:
 * - input: SeedClientData record.
 * - output: fully-formed Client object with defaults.
 */
export const createSeedClient = (data: SeedClientData): Client => {
  const contacts: ClientContact[] = [];
  if (data.Telefone) {
    contacts.push({
      id: `contact_${data.id}_1`,
      phone: data.Telefone,
      hasWhatsApp: data.WhatsApp === 'Sim',
      isPrimary: true,
    });
  }

  return {
    id: data.id,
    name: data.Nome,
    cpfCnpj: data.CPF || '',
    email: data.Email || '',
    contacts: contacts,
    address: {
      street: data.Logradouro || '',
      number: data.Numero || '',
      complement: data.Complemento || '',
      neighborhood: data.Bairro || '',
      city: data.Cidade || '',
      state: data.Estado || '',
      zip: data.CEP || '',
    },
    status: data.StatusCliente as ClientStatus,
    pipelineStatus: data.StatusPipeline || 'Contato Inicial',
    leadSource: data.FonteLead || 'Não informado',
    serviceInterests: data.ServicosInteresse ? [data.ServicosInteresse] : [],
    registrationDate: '2026-01-11T09:00:00.000Z', // 11/01/2026
    lastContactDate: '2026-01-11T09:00:00.000Z',
    clientType: 'PF',
    birthDate: '',
    isFavorite: false,
    isUrgent: false,
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: data.StatusCliente === 'Cliente Desabilitado',
    representative: { name: '', relationship: '', role: '' },
    auditLog: [],
    projectLinks: [],
    generalNotes: '',
  };
};

type StorageLike = {
  getItem: <T>(key: string, defaultValue: T) => T;
  setItem: <T>(key: string, value: T) => void;
};

type SchemaMigrationKeys = {
  GLOBALIDENTIFIERCOUNTER: string;
  ACCEPTEDPAYMENTMETHODS: string;
};

type RunStorageSchemaMigrationsInput = {
  storage: StorageLike;
  keys: SchemaMigrationKeys;
  fromVersion: number;
  toVersion: number;
};

const migrateToV1 = ({ storage, keys }: { storage: StorageLike; keys: SchemaMigrationKeys }) => {
  const rawCounter = storage.getItem<number>(keys.GLOBALIDENTIFIERCOUNTER, 2500);
  const safeCounter =
    typeof rawCounter === 'number' && Number.isFinite(rawCounter) && rawCounter >= 0
      ? rawCounter
      : 2500;
  storage.setItem(keys.GLOBALIDENTIFIERCOUNTER, safeCounter);

  const rawPaymentMethods = storage.getItem<unknown>(keys.ACCEPTEDPAYMENTMETHODS, []);
  if (!Array.isArray(rawPaymentMethods)) {
    storage.setItem(keys.ACCEPTEDPAYMENTMETHODS, []);
  }
};

/**
 * Input -> Output:
 * - input: storage adapter, current schema version, target schema version.
 * - output: final applied schema version after running incremental migrations.
 */
export const runStorageSchemaMigrations = ({
  storage,
  keys,
  fromVersion,
  toVersion,
}: RunStorageSchemaMigrationsInput): number => {
  if (!Number.isFinite(fromVersion) || fromVersion < 0) {
    return 0;
  }
  if (fromVersion >= toVersion) {
    return fromVersion;
  }

  let currentVersion = fromVersion;
  while (currentVersion < toVersion) {
    const nextVersion = currentVersion + 1;

    if (nextVersion === 1) {
      migrateToV1({ storage, keys });
      currentVersion = 1;
      continue;
    }

    throw new Error(`No migration registered for storage schema v${nextVersion}.`);
  }

  return currentVersion;
};
