import type { ProjectStatus } from './project';

// --- Client Types ---
export type ClientStatus = 'Cliente Ativo' | 'Cliente Desabilitado' | 'Potencial Cliente';
export const clientStatuses: ClientStatus[] = [
  'Cliente Ativo',
  'Cliente Desabilitado',
  'Potencial Cliente',
];

export type PaymentStatus = 'Em dia' | 'Pendente' | 'Em Atraso';
export const paymentStatuses: PaymentStatus[] = ['Em dia', 'Pendente', 'Em Atraso'];

export interface ProjectMeeting {
  id: string;
  date: string;
  projectId?: string;
  projectName?: string;
  reason: string;
  notes: string;
  clientId?: string; // SQL Foreign Key Preparation
}

export interface ClientContact {
  id: string;
  phone: string;
  hasWhatsApp: boolean;
  isPrimary: boolean;
  clientId?: string; // SQL Foreign Key Preparation
}

export interface ClientLink {
  id: string;
  title: string;
  url: string;
  clientId?: string; // SQL Foreign Key Preparation
}

export interface Client {
  id: string;
  name: string;
  avatarUrl?: string; // New: Profile Picture Base64
  clientType?: 'PF' | 'PJ'; // New: Person Type
  birthDate?: string; // New: Date of Birth or Opening Date
  cpfCnpj?: string;
  representative?: {
    name: string;
    relationship: string;
    role?: string;
  };
  contacts: ClientContact[];
  email?: string;
  status: ClientStatus;
  leadSource?: string;
  serviceInterests: string[];
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  isFavorite: boolean;
  isUrgent?: boolean; // New: Priority Radar
  registrationDate: string;
  lastContactDate: string;
  pipelineStatus: string;
  meetings: ProjectMeeting[];
  generalNotes?: string;
  externalLinks?: ClientLink[];
  behavioralProfile: {
    notes: string;
  };
  archived: boolean;
  projectLinks?: {
    projectId: string;
    projectCode: string;
    projectName: string;
    status: ProjectStatus;
  }[];
  auditLog?: {
    timestamp: string;
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

// --- Prospect Types ---
export type ProspectPriority = 'Baixa' | 'Média' | 'Alta';
export type ProspectStatus = 'Em Aberto' | 'Convertido' | 'Perdido';

export interface Prospect {
  id: string;
  name: string;
  contact?: string; // Legacy field, kept for compatibility
  phone?: string;
  hasWhatsApp?: boolean;
  email?: string;
  social?: string;
  origin: string; // 'Instagram', 'Indicação', etc.
  interest: string; // 'Residencial', 'Reforma', etc.
  priority: ProspectPriority;
  status: ProspectStatus;
  createdAt: string; // ISO String
  followUpDays: number; // Max 90
  startDate: string; // Date to start counting followUpDays
  notes?: string;
  archived?: boolean;
}
