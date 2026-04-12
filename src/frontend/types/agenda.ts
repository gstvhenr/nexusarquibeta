import type { Subtask } from './project';

// --- Agenda Types ---
export type AgendaEventType =
  | 'Reunião com Cliente'
  | 'Visita à Cliente'
  | 'Reunião de Equipe'
  | 'Visita à Obra'
  | 'Visita a Fornecedor'
  | 'Compra de Materiais'
  | 'Prazo de Entrega'
  | 'Evento/Feira'
  | 'Foco Criativo'
  | 'Pessoal'
  | 'Desenvolvimento de Projeto'
  | 'Reunião de Marketing'
  | 'Gravação de Conteúdo'
  | 'Reunião com Freelancer'
  | 'Recebimento'
  | 'Pagamento de Custo'
  | 'Outro';

export const agendaEventTypes: AgendaEventType[] = [
  'Reunião com Cliente',
  'Visita à Cliente',
  'Reunião de Equipe',
  'Visita à Obra',
  'Visita a Fornecedor',
  'Compra de Materiais',
  'Prazo de Entrega',
  'Evento/Feira',
  'Foco Criativo',
  'Pessoal',
  'Desenvolvimento de Projeto',
  'Reunião de Marketing',
  'Gravação de Conteúdo',
  'Reunião com Freelancer',
  'Recebimento',
  'Pagamento de Custo',
  'Outro',
];

export type AgendaEventRecurrence = 'none' | 'weekly' | 'monthly';
export type KanbanStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  isAllDay?: boolean;
  time: string;
  timeEnd?: string;
  type: AgendaEventType;
  description?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  priority: number;
  recurrence: AgendaEventRecurrence;
  isDeadlineEvent?: boolean;
  isFinancialEvent?: 'income' | 'expense';
  completed?: boolean;
  freelancerServiceId?: string;
  kanbanStatus?: KanbanStatus;
  completedAt?: string;
  archived?: boolean;
  category?: 'Evento' | 'Tarefa'; // Nova tipagem obrigatória para criação/edição em UI
  subtasks?: Subtask[]; // Added subtasks for Kanban granularity
  attachments?: { id: string; name: string; storagePath?: string; driveRelativePath?: string }[];
  links?: string[];
}

/** Post-it reminder displayed on the Lembretes board. */
export interface Reminder {
  id: string;
  title: string;
  comment: string;
  /** ISO datetime string for when the user should be reminded. */
  remindAt: string;
  /** Post-it color key (e.g. 'yellow', 'green', 'blue'). */
  color: string;
  createdAt: string;
  /** Whether this reminder is pinned to the top of the board. */
  pinned?: boolean;
  /** Whether this reminder is archived and only available in history view. */
  archived?: boolean;
  /** ISO datetime when marked as completed; null = active. */
  completedAt?: string | null;
  /** Optional external URL associated with this reminder. */
  externalUrl?: string;
}

export interface ContractDeadlinesSettings {
  defaultPreliminarDeadlineDays: number;
  defaultExecutiveDeadlineDays: number;
  defaultRevisionLimit: number;
}
