import type { Client, ClientContact, Project, ProjectMeeting } from '@/types';

export type FieldId = (name: string) => string;

export type ClientChangeHandler = (field: keyof Client, value: Client[keyof Client]) => void;

export type ClientAddressChangeHandler = (field: keyof Client['address'], value: string) => void;

export type ClientRepresentativeChangeHandler = (
  field: keyof NonNullable<Client['representative']>,
  value: string,
) => void;

export type ClientContactChangeHandler = (
  id: string,
  field: keyof Omit<ClientContact, 'id'>,
  value: string | boolean,
) => void;

export interface ClientFinancialSummary {
  projectId: string;
  projectName: string;
  pending: number;
  overdue: number;
  paid: number;
  totalValue: number;
}

export interface ClientFormInfoTabProps {
  client: Client;
  initialClient: Client | null;
  isReadOnly: boolean;
  isPJ: boolean;
  fieldId: FieldId;
  commonInputClass: string;
  onChange: ClientChangeHandler;
  onAddressChange: ClientAddressChangeHandler;
  onRepChange: ClientRepresentativeChangeHandler;
  onContactChange: ClientContactChangeHandler;
  getModifiedClass: (currentVal: unknown, originalVal: unknown) => string;
}

export interface ClientFormFinanceTabProps {
  financialSummaries: ClientFinancialSummary[];
}

export interface ClientFormMeetingsTabProps {
  meetings: Client['meetings'];
  isReadOnly: boolean;
  commonInputClass: string;
  clientProjects: Project[];
  newMeeting: Partial<ProjectMeeting>;
  onNewMeetingChange: (
    updater: (meeting: Partial<ProjectMeeting>) => Partial<ProjectMeeting>,
  ) => void;
  onAddMeeting: () => void;
  onDeleteMeeting: (id: string) => void;
}

export interface ClientFormNotesTabProps {
  fieldId: FieldId;
  client: Client;
  initialClient: Client | null;
  isReadOnly: boolean;
  commonInputClass: string;
  onChange: ClientChangeHandler;
  getModifiedClass: (currentVal: unknown, originalVal: unknown) => string;
}

export interface ClientFormAuditTabProps {
  auditLog: Client['auditLog'];
}

export interface ClientFormFooterProps {
  isReadOnly: boolean;
  onClose: () => void;
  onSwitchToEdit: () => void;
  onSave: () => void;
}
