import type { Client, Project, PaymentStatus } from '../types';
import { parseDateString } from '../utils/formatters';
import { v4 as uuidv4 } from 'uuid';

type SaveClientError = 'duplicate_cpf_cnpj' | 'invalid_cpf_cnpj';

const getDigits = (value: string): string => value.replace(/\D/g, '');

const allDigitsEqual = (value: string): boolean => /^(\d)\1+$/.test(value);

const validateCPF = (cpf: string): boolean => {
  if (cpf.length !== 11 || allDigitsEqual(cpf)) return false;
  const calc = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
};

const validateCNPJ = (cnpj: string): boolean => {
  if (cnpj.length !== 14 || allDigitsEqual(cnpj)) return false;
  const calc = (base: string, factors: number[]) => {
    const sum = base
      .split('')
      .reduce((acc, digit, index) => acc + Number(digit) * factors[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const base = cnpj.slice(0, 12);
  const digit1 = calc(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = calc(`${base}${digit1}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digit1 === Number(cnpj[12]) && digit2 === Number(cnpj[13]);
};

const isValidCpfCnpj = (value: string): boolean => {
  const digits = getDigits(value);
  if (!digits) return true;
  if (digits.length === 11) return validateCPF(digits);
  if (digits.length === 14) return validateCNPJ(digits);
  return false;
};

const normalizeForComparison = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeForComparison);
  }
  if (value && typeof value === 'object') {
    const sortedEntries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => [key, normalizeForComparison(val)]);
    return Object.fromEntries(sortedEntries);
  }
  return value;
};

const stableStringify = (value: unknown): string => JSON.stringify(normalizeForComparison(value));

/**
 * Input -> Output:
 * - input: lista de clientes e projetos.
 * - output: mapa `clientId -> PaymentStatus` com `Em dia`, `Pendente` ou `Em Atraso`.
 * Example:
 * const statusMap = getPaymentStatusByClientId(clients, projects);
 */
export const getPaymentStatusByClientId = (
  clients: Client[],
  projects: Project[],
): Map<string, PaymentStatus> => {
  const statusMap = new Map<string, PaymentStatus>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  clients.forEach((client) => {
    const clientProjects = projects.filter(
      (p) => p.clientId === client.id && !p.archived && p.financials,
    );
    if (clientProjects.length === 0) {
      statusMap.set(client.id, 'Em dia');
      return;
    }
    let hasPending = false;
    for (const p of clientProjects) {
      if (p.financials.paymentType === 'vista' && p.financials.lumpSumStatus === 'Em aberto') {
        const dueDate = parseDateString(p.financials.lumpSumDueDate);
        if (dueDate && dueDate < today) {
          statusMap.set(client.id, 'Em Atraso');
          return;
        }
        hasPending = true;
      } else if (p.financials.paymentType === 'parcelado' && p.financials.installments) {
        for (const inst of p.financials.installments) {
          if (!inst.paid) {
            const dueDate = parseDateString(inst.dueDate);
            if (dueDate && dueDate < today) {
              statusMap.set(client.id, 'Em Atraso');
              return;
            }
            hasPending = true;
          }
        }
      }
    }
    statusMap.set(client.id, hasPending ? 'Pendente' : 'Em dia');
  });

  return statusMap;
};

/**
 * Generates an audit log by comparing old and new client data.
 */
const generateAuditLog = (
  oldClient: Client,
  newClient: Client,
): NonNullable<Client['auditLog']> => {
  const logs: NonNullable<Client['auditLog']> = [];
  const timestamp = new Date().toISOString();

  const check = (label: string, oldVal: unknown, newVal: unknown) => {
    const oldStr = stableStringify(oldVal) || 'Vazio';
    const newStr = stableStringify(newVal) || 'Vazio';
    if (oldStr !== newStr) {
      logs.push({ timestamp, field: label, oldValue: oldVal, newValue: newVal });
    }
  };

  check('Nome', oldClient.name, newClient.name);
  check('CPF/CNPJ', oldClient.cpfCnpj, newClient.cpfCnpj);
  check('Email', oldClient.email, newClient.email);
  check('Status do Cliente', oldClient.status, newClient.status);
  check('Status do Pipeline', oldClient.pipelineStatus, newClient.pipelineStatus);
  check('Endereço', oldClient.address, newClient.address);
  check('Contatos', oldClient.contacts, newClient.contacts);
  check('Representante', oldClient.representative, newClient.representative);
  check('Observações Gerais', oldClient.generalNotes, newClient.generalNotes);

  return logs;
};

/**
 * Input -> Output:
 * - input: cliente a salvar, cliente original (ou null) e lista atual.
 * - output: nova lista de clientes; em erro retorna `error` de domínio.
 * Example:
 * const result = saveClientAndUpdateState(incoming, original, allClients);
 */
export const saveClientAndUpdateState = (
  clientToSave: Client,
  originalClient: Client | null,
  allClients: Client[],
): { updatedClients: Client[]; error?: SaveClientError } => {
  const normalizedCpfCnpj = getDigits(clientToSave.cpfCnpj || '');
  if (normalizedCpfCnpj && !isValidCpfCnpj(normalizedCpfCnpj)) {
    return { updatedClients: allClients, error: 'invalid_cpf_cnpj' };
  }

  // Validation for duplicate CPF/CNPJ
  if (
    normalizedCpfCnpj &&
    allClients.some(
      (c) => getDigits(c.cpfCnpj || '') === normalizedCpfCnpj && c.id !== clientToSave.id,
    )
  ) {
    return { updatedClients: allClients, error: 'duplicate_cpf_cnpj' };
  }

  let finalClient = { ...clientToSave };

  if (finalClient.id && originalClient) {
    // Existing client
    const newLogs = generateAuditLog(originalClient, finalClient);
    if (newLogs.length > 0) {
      finalClient.auditLog = [...(originalClient.auditLog || []), ...newLogs];
      finalClient.lastContactDate = new Date().toISOString();
    }
    const updatedClients = allClients.map((c) => (c.id === finalClient.id ? finalClient : c));
    return { updatedClients };
  } else {
    // New client
    finalClient.id = uuidv4();
    finalClient.registrationDate = new Date().toISOString();
    finalClient.auditLog = [
      {
        timestamp: new Date().toISOString(),
        field: 'Cliente',
        oldValue: 'N/A',
        newValue: 'Cliente criado.',
      },
    ];
    const updatedClients = [finalClient, ...allClients];
    return { updatedClients };
  }
};

/**
 * Input -> Output:
 * - input: cliente.
 * - output: `{ valid, missingFields }` para elegibilidade de vínculo com projeto.
 * Example:
 * const check = validateClientForProject(client);
 */
export const validateClientForProject = (
  client: Client,
): { valid: boolean; missingFields: string[] } => {
  const missing: string[] = [];

  if (!client.name?.trim()) missing.push('Nome ou Razão Social');

  // Check Client Type specific fields
  if (client.clientType === 'PJ') {
    if (!client.birthDate?.trim()) missing.push('Data de Abertura');
    if (!client.cpfCnpj?.trim()) missing.push('CNPJ');
    if (!client.representative?.name?.trim()) missing.push('Nome do Representante');
    if (!client.representative?.role?.trim()) missing.push('Cargo do Representante');
  } else {
    // Default to PF
    if (!client.birthDate?.trim()) missing.push('Data de Nascimento');
    if (!client.cpfCnpj?.trim()) missing.push('CPF');
  }

  if (!client.contacts || client.contacts.length === 0 || !client.contacts[0].phone) {
    missing.push('Pelo menos um telefone de contato');
  }

  const addr = client.address;
  if (
    !addr.street ||
    !addr.number ||
    !addr.neighborhood ||
    !addr.city ||
    !addr.state ||
    !addr.zip
  ) {
    missing.push('Endereço completo (Rua, Número, Bairro, Cidade, Estado, CEP)');
  }

  if (!client.status) missing.push('Status do Cliente');
  if (!client.pipelineStatus) missing.push('Status no Pipeline');
  if (!client.leadSource || client.leadSource === 'Não informado') missing.push('Fonte do Lead');

  if (!client.serviceInterests || client.serviceInterests.length === 0) {
    missing.push('Serviços de Interesse');
  }

  return {
    valid: missing.length === 0,
    missingFields: missing,
  };
};
