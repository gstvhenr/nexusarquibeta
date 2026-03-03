import React from 'react';
import { ClientProjectsTab } from '@/components/clientes/ClientProjectsTab';
import {
  FormField,
  IconButton,
  Input,
  LinkIcon,
  MapPinIcon,
  PlusIcon,
  ProjetosIcon,
  Textarea,
  TrashIcon,
} from '@/components/ui';
import type { Client, ProjectMeeting, Project } from '@/types';
import { formatCurrency, formatDateWithTime } from '@/utils/formatters';

const DISABLED_OVERRIDE = 'disabled:opacity-100 disabled:cursor-default disabled:bg-background/50';

type FinancialSummary = {
  projectId: string;
  projectName: string;
  pending: number;
  overdue: number;
  paid: number;
  totalValue: number;
};

type LinkDraft = {
  title: string;
  url: string;
};

interface ClienteDetalhesSecondaryTabsProps {
  activeTab: string;
  client: Client;
  clientProjects: Project[];
  financialSummaries: FinancialSummary[];

  isEditing: boolean;
  newMeeting: Partial<ProjectMeeting>;
  setNewMeeting: React.Dispatch<React.SetStateAction<Partial<ProjectMeeting>>>;
  handleAddMeeting: () => void;
  handleDeleteMeeting: (id: string) => void;
  handleChange: (field: keyof Client, value: Client[keyof Client]) => void;
  originalClient: Client | undefined;
  getModifiedClass: (currentVal: unknown, originalVal: unknown) => string;
  newLink: LinkDraft;
  setNewLink: React.Dispatch<React.SetStateAction<LinkDraft>>;
  handleAddLink: () => void;
  handleRemoveLink: (id: string) => void;
  onOpenProject: (projectId: string) => void;
}

export function ClienteDetalhesSecondaryTabs({
  activeTab,
  client,
  clientProjects,
  financialSummaries,

  isEditing,
  newMeeting,
  setNewMeeting,
  handleAddMeeting,
  handleDeleteMeeting,
  handleChange,
  originalClient,
  getModifiedClass,
  newLink,
  setNewLink,
  handleAddLink,
  handleRemoveLink,
  onOpenProject,
}: ClienteDetalhesSecondaryTabsProps) {
  return (
    <>
      {activeTab === 'projects' && (
        <ClientProjectsTab projects={clientProjects} onOpenProject={onOpenProject} />
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Cadastro Principal */}
          <div>
            <h4 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2 border-b border-border-color pb-2">
              <MapPinIcon className="w-5 h-5 text-primary" /> Endereço de Cadastro
            </h4>
            <div className="bg-surface border border-border-color rounded-xl p-5 shadow-sm">
              <p className="font-semibold text-text-primary mb-1">Endereço Principal</p>
              <p className="text-text-secondary text-sm">
                {client.address.street}, {client.address.number}
                {client.address.complement && ` - ${client.address.complement}`}
                <br />
                {client.address.neighborhood} - {client.address.city}/{client.address.state}
                <br />
                CEP: {client.address.zip}
              </p>
            </div>
          </div>

          {/* Endereços de Obra dos Projetos */}
          <div>
            <h4 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2 border-b border-border-color pb-2">
              <ProjetosIcon className="w-5 h-5 text-warning" /> Endereços de Obra (Projetos)
            </h4>
            {clientProjects.some((p) => p.serviceAddress?.street) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientProjects
                  .filter((p) => p.serviceAddress?.street)
                  .map((project) => (
                    <div
                      key={project.id}
                      className="bg-background/50 border border-border-color rounded-xl p-5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-2 bg-surface rounded-bl-xl border-b border-l border-border-color shadow-sm text-xs font-bold text-text-secondary">
                        Ref: {project.code}
                      </div>
                      <p className="font-bold text-primary mb-2 text-lg">{project.name}</p>
                      <div className="text-sm text-text-primary space-y-1">
                        <p>
                          {project.serviceAddress?.street}, {project.serviceAddress?.number}
                        </p>
                        {project.serviceAddress?.complement && (
                          <p className="text-text-secondary text-xs">
                            {project.serviceAddress.complement}
                          </p>
                        )}
                        <p>{project.serviceAddress?.neighborhood}</p>
                        <p className="font-medium">
                          {project.serviceAddress?.city}/{project.serviceAddress?.state}
                        </p>
                        <p className="text-text-secondary text-xs mt-1">
                          CEP: {project.serviceAddress?.zip}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-text-secondary italic text-sm">
                Nenhum endereço de obra específico cadastrado nos projetos deste cliente.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-6">
          {financialSummaries.length > 0 ? (
            financialSummaries.map((summary) => (
              <div
                key={summary.projectId}
                className="bg-surface border border-border-color p-6 rounded-xl shadow-sm"
              >
                <h4 className="font-semibold text-lg text-text-primary border-b border-border-color pb-3 mb-4">
                  {summary.projectName}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="bg-warning/5 p-4 rounded-lg border border-warning/10">
                    <p className="text-sm text-text-secondary mb-1">Pendente</p>
                    <p className="font-bold text-xl text-warning">
                      {formatCurrency(summary.pending)}
                    </p>
                  </div>
                  <div className="bg-error/5 p-4 rounded-lg border border-error/10">
                    <p className="text-sm text-text-secondary mb-1">Atrasado</p>
                    <p className="font-bold text-xl text-error">
                      {formatCurrency(summary.overdue)}
                    </p>
                  </div>
                  <div className="bg-success/5 p-4 rounded-lg border border-success/10">
                    <p className="text-sm text-text-secondary mb-1">Total Pago</p>
                    <p className="font-bold text-xl text-success">{formatCurrency(summary.paid)}</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg border border-border-color">
                    <p className="text-sm text-text-secondary mb-1">Valor Total</p>
                    <p className="font-bold text-xl text-secondary">
                      {formatCurrency(summary.totalValue)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-text-secondary py-16 border-2 border-dashed border-border-color rounded-xl">
              Nenhum projeto ativo para exibir dados financeiros.
            </p>
          )}
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="space-y-8">
          <div className="bg-surface border border-border-color p-6 rounded-xl shadow-sm space-y-4">
            <h4 className="font-semibold text-text-primary text-lg">Registrar Nova Reunião</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={newMeeting.projectId || ''}
                onChange={(e) => setNewMeeting((m) => ({ ...m, projectId: e.target.value }))}
                className="w-full bg-background p-2 rounded-md border focus:border-accent text-text-primary transition disabled:opacity-100 disabled:cursor-default disabled:bg-background/50"
                disabled={!isEditing}
                aria-label="Projeto da reunião"
              >
                <option value="">Vincular Projeto (Opcional)</option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={newMeeting.date}
                onChange={(e) => setNewMeeting((m) => ({ ...m, date: e.target.value }))}
                className={DISABLED_OVERRIDE}
                disabled={!isEditing}
                aria-label="Data da reunião"
              />
              <Input
                type="text"
                placeholder="Motivo da Reunião"
                value={newMeeting.reason || ''}
                onChange={(e) => setNewMeeting((m) => ({ ...m, reason: e.target.value }))}
                className={DISABLED_OVERRIDE}
                disabled={!isEditing}
                aria-label="Motivo da reunião"
              />
            </div>
            <Textarea
              value={newMeeting.notes || ''}
              onChange={(e) => setNewMeeting((m) => ({ ...m, notes: e.target.value }))}
              rows={3}
              placeholder="Descreva o que foi discutido..."
              className={DISABLED_OVERRIDE}
              disabled={!isEditing}
              aria-label="Anotações da reunião"
            />
            {isEditing ? (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleAddMeeting}
                  className="px-6 py-2 rounded-lg text-sm font-semibold bg-secondary text-secondary-content hover:bg-secondary-focus transition-colors"
                >
                  Adicionar Registro
                </button>
              </div>
            ) : (
              <p className="text-sm text-text-secondary italic text-right">
                Ative o modo de edição para adicionar reuniões.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-text-secondary text-lg">Histórico de Reuniões</h4>
            {(client.meetings || [])
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-background p-4 rounded-lg flex justify-between items-start border border-border-color hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-4 mb-2">
                      <p className="text-sm text-text-secondary font-semibold bg-surface px-2 py-1 rounded border border-border-color">
                        {formatDateWithTime(meeting.date)}
                      </p>
                      {meeting.projectName && (
                        <p className="text-xs font-bold text-primary px-2 py-1 bg-primary/5 rounded border border-primary/20">
                          {meeting.projectName}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-text-primary text-base">{meeting.reason}</p>
                    <p className="text-sm whitespace-pre-wrap mt-2 text-text-secondary leading-relaxed">
                      {meeting.notes}
                    </p>
                  </div>
                  {isEditing && (
                    <IconButton
                      variant="danger"
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      aria-label="Excluir reunião"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </IconButton>
                  )}
                </div>
              ))}
            {(!client.meetings || client.meetings.length === 0) && (
              <p className="text-text-secondary text-center py-8">Nenhuma reunião registrada.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4 h-full">
          <FormField label="Observações Gerais">
            <Textarea
              id="field-observacoes-gerais"
              value={client.generalNotes || ''}
              onChange={(e) => handleChange('generalNotes', e.target.value)}
              rows={20}
              placeholder="Adicione anotações gerais sobre o cliente, preferências, histórico de contatos, etc."
              className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.generalNotes, originalClient?.generalNotes)}`}
              disabled={!isEditing}
            />
          </FormField>
        </div>
      )}

      {activeTab === 'links' && (
        <div className="space-y-6">
          <h4 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2 border-b border-border-color pb-2">
            <LinkIcon className="w-5 h-5 text-primary" /> Links Externos
          </h4>

          {/* List */}
          <div className="grid grid-cols-1 gap-3">
            {client.externalLinks?.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-background border border-border-color rounded-lg hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-surface rounded-full border border-border-color text-primary">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">{link.title}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline truncate block"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>
                {isEditing && (
                  <IconButton
                    variant="danger"
                    onClick={() => handleRemoveLink(link.id)}
                    aria-label={`Remover link ${link.title}`}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
            ))}
            {(!client.externalLinks || client.externalLinks.length === 0) && (
              <p className="text-center text-text-secondary py-8 italic border-2 border-dashed border-border-color rounded-lg">
                Nenhum link adicionado.
              </p>
            )}
          </div>

          {/* Add Form (Only in Edit Mode) */}
          {isEditing && (
            <div className="bg-surface p-4 rounded-xl border border-border-color shadow-sm mt-4">
              <h5 className="font-semibold text-sm text-text-primary mb-3">Adicionar Novo Link</h5>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4">
                  <FormField label="Título">
                    <Input
                      type="text"
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      placeholder="Ex: Pasta do Drive"
                      aria-label="Título do link"
                    />
                  </FormField>
                </div>
                <div className="md:col-span-6">
                  <FormField label="URL">
                    <Input
                      type="url"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      placeholder="https://"
                      aria-label="URL do link"
                    />
                  </FormField>
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={handleAddLink}
                    className="w-full py-2 bg-secondary text-secondary-content rounded-lg font-semibold text-sm hover:bg-secondary-focus transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg text-secondary mb-4">Histórico de Alterações</h4>
          {(client.auditLog || [])
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((log) => (
              <div
                key={`${log.timestamp}-${log.field}-${JSON.stringify(log.newValue)}`}
                className="bg-surface p-4 rounded-lg border border-border-color shadow-sm"
              >
                <div className="flex justify-between text-xs text-text-secondary mb-2">
                  <span className="font-semibold uppercase tracking-wider">{log.field}</span>
                  <span>{formatDateWithTime(log.timestamp)}</span>
                </div>
                <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-error/5 p-2 rounded border border-error/10 text-text-secondary line-through opacity-70">
                    {JSON.stringify(log.oldValue)}
                  </div>
                  <div className="bg-success/5 p-2 rounded border border-success/10 text-text-primary font-medium">
                    {JSON.stringify(log.newValue)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </>
  );
}
