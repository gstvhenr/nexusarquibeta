import React from 'react';
import type { Project, ProjectAddress, ProjectStatus } from '../../../types';
import { projectStatuses } from '../../../types';
import {
  ArchiveIcon,
  CheckCircleIcon,
  EditIcon,
  LinkIcon,
  TrashIcon,
  UnarchiveIcon,
} from '../../../components/ui';
import { InfoCard, RevisionCounter } from '../../../components/projetos';
import type { ProjectActionType } from '../../../components/projetos';
import type { ProjectDetailTabId } from './types';

interface ProjetoDetalhesOverviewTabProps {
  activeTab: ProjectDetailTabId;
  localProject: Project;
  commonInputClass: string;
  isEditingAddress: boolean;
  setIsEditingAddress: React.Dispatch<React.SetStateAction<boolean>>;
  handleLocalChange: (field: keyof Project, value: Project[keyof Project]) => void;
  handleAddressChange: (field: keyof ProjectAddress, value: string) => void;
  progress: number;
  incrementRevision: () => void;
  handleActionRequest: (type: ProjectActionType) => void;
  handleReactivate: () => void;
}

export function ProjetoDetalhesOverviewTab({
  activeTab,
  localProject,
  commonInputClass,
  isEditingAddress,
  setIsEditingAddress,
  handleLocalChange,
  handleAddressChange,
  progress,
  incrementRevision,
  handleActionRequest,
  handleReactivate,
}: ProjetoDetalhesOverviewTabProps) {
  return (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-9">
              <label
                htmlFor="field-nome-do-projeto"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Nome do Projeto
              </label>
              <input
                id="field-nome-do-projeto"
                value={localProject.name}
                onChange={(e) => handleLocalChange('name', e.target.value)}
                className={commonInputClass}
                aria-label="Nome do projeto"
              />
            </div>
            <div className="md:col-span-3">
              <label
                htmlFor="field-status"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Status
              </label>
              <select
                id="field-status"
                value={localProject.status}
                onChange={(e) => handleLocalChange('status', e.target.value as ProjectStatus)}
                className={commonInputClass}
                aria-label="Status"
              >
                {projectStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="field-descricao"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Descrição
            </label>
            <textarea
              id="field-descricao"
              value={localProject.description}
              onChange={(e) => handleLocalChange('description', e.target.value)}
              rows={3}
              className={commonInputClass}
              aria-label="Descrição do projeto"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background/30 p-4 rounded-xl border border-border-color/50">
              <div className="flex justify-between items-center mb-2">
                <span className="block text-sm font-medium text-text-secondary">
                  Endereço da Obra
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-primary hover:underline text-xs flex items-center gap-1"
                >
                  <EditIcon className="w-3 h-3" /> Editar
                </button>
              </div>

              {isEditingAddress ? (
                <div className="space-y-2 text-sm">
                  <input
                    placeholder="Rua"
                    value={localProject.serviceAddress?.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className={commonInputClass}
                    aria-label="Rua"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Número"
                      value={localProject.serviceAddress?.number || ''}
                      onChange={(e) => handleAddressChange('number', e.target.value)}
                      className={commonInputClass}
                      aria-label="Número"
                    />
                    <input
                      placeholder="CEP"
                      value={localProject.serviceAddress?.zip || ''}
                      onChange={(e) => handleAddressChange('zip', e.target.value)}
                      className={commonInputClass}
                      aria-label="CEP"
                    />
                  </div>
                  <input
                    placeholder="Cidade"
                    value={localProject.serviceAddress?.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className={commonInputClass}
                    aria-label="Cidade"
                  />
                </div>
              ) : (
                <p className="text-text-primary text-sm">
                  {localProject.serviceAddress?.street
                    ? `${localProject.serviceAddress.street}, ${localProject.serviceAddress.number} - ${localProject.serviceAddress.city}/${localProject.serviceAddress.state}`
                    : 'Endereço não informado.'}
                </p>
              )}
            </div>

            <div className="bg-background/30 p-4 rounded-xl border border-border-color/50 space-y-3">
              <span className="block text-sm font-medium text-text-secondary mb-1">
                Dados de RRT
              </span>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="project-rrt-number" className="text-xs text-text-secondary">
                    Número
                  </label>
                  <input
                    id="project-rrt-number"
                    type="text"
                    value={localProject.rrtNumber || ''}
                    onChange={(e) => handleLocalChange('rrtNumber', e.target.value)}
                    className={commonInputClass}
                    placeholder="Ex: 1234567"
                    aria-label="Número do RRT"
                    title="Número do RRT"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="project-rrt-url" className="text-xs text-text-secondary">
                    Link do Arquivo
                  </label>
                  <div className="flex gap-1">
                    <input
                      id="project-rrt-url"
                      type="text"
                      value={localProject.rrtUrl || ''}
                      onChange={(e) => handleLocalChange('rrtUrl', e.target.value)}
                      className={commonInputClass}
                      placeholder="https://..."
                      aria-label="Link do RRT"
                      title="Link do RRT"
                    />
                    {localProject.rrtUrl && (
                      <a
                        href={localProject.rrtUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-primary/10 text-primary rounded-md flex items-center justify-center hover:bg-primary/20"
                        aria-label="Abrir link do RRT"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <InfoCard
              label="Progresso Geral"
              className="bg-background border border-border-color h-full flex flex-col justify-center"
            >
              <div className="flex items-center gap-2">
                <progress
                  className="progress-bar progress-track-surface progress-fill-primary-success h-3 w-full rounded-full border border-border-color/50"
                  value={progress}
                  max={100}
                />
                <span className="font-bold text-primary min-w-[3rem] text-right">
                  {progress.toFixed(0)}%
                </span>
              </div>
            </InfoCard>

            <RevisionCounter
              count={localProject.revisionCount || 0}
              limit={localProject.revisionLimit || 3}
              onIncrement={incrementRevision}
            />
          </div>

          <div className="pt-6 border-t border-error/20 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleActionRequest('delete')}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-error bg-error/10 hover:bg-error/20 border border-error/20 flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" /> Excluir Projeto
            </button>

            {localProject.archived ? (
              <>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={handleReactivate}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-secondary bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 flex items-center gap-2"
                >
                  <UnarchiveIcon className="w-4 h-4" /> Reativar Projeto
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleActionRequest('inactivate')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-warning bg-warning/10 hover:bg-warning/20 border border-warning/20 flex items-center gap-2"
                >
                  <ArchiveIcon className="w-4 h-4" /> Inativar e Arquivar
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => handleActionRequest('finalize')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-white bg-success hover:bg-emerald-700 flex items-center gap-2"
                >
                  <CheckCircleIcon className="w-4 h-4" /> Finalizar Projeto
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
