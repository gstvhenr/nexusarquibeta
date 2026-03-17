import React from 'react';
import type { Project, ProjectAddress, ProjectStatus } from '@/types';
import { projectStatuses } from '@/types';
import {
  ArchiveIcon,
  Button,
  CheckCircleIcon,
  EditIcon,
  FormField,
  Input,
  LinkIcon,
  Select,
  Textarea,
  TrashIcon,
  UnarchiveIcon,
} from '@/components/ui';
import { InfoCard, RevisionCounter } from '@/components/projetos';
import type { ProjectActionType } from '@/components/projetos';

interface ProjetoDetalhesOverviewTabProps {
  localProject: Project;
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
  localProject,
  isEditingAddress,
  setIsEditingAddress,
  handleLocalChange,
  handleAddressChange,
  progress,
  incrementRevision,
  handleActionRequest,
  handleReactivate,
}: ProjetoDetalhesOverviewTabProps) {
  const projectStatusOptions = projectStatuses.map((status) => ({
    value: status,
    label: status,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <FormField
          label="Nome do Projeto"
          htmlFor="field-nome-do-projeto"
          className="md:col-span-9"
        >
          <Input
            id="field-nome-do-projeto"
            value={localProject.name}
            onChange={(e) => handleLocalChange('name', e.target.value)}
            aria-label="Nome do projeto"
          />
        </FormField>

        <Select
          id="field-status"
          label="Status"
          value={localProject.status}
          onChange={(e) => handleLocalChange('status', e.target.value as ProjectStatus)}
          options={projectStatusOptions}
          wrapperClassName="md:col-span-3"
          aria-label="Status do projeto"
        />
      </div>

      <FormField label="Descrição" htmlFor="field-descricao">
        <Textarea
          id="field-descricao"
          value={localProject.description}
          onChange={(e) => handleLocalChange('description', e.target.value)}
          rows={3}
          aria-label="Descrição do projeto"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background/30 p-4 rounded-xl border border-border-color/50">
          <div className="flex justify-between items-center mb-2">
            <span className="block text-sm font-medium text-text-secondary">Endereço da Obra</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditingAddress((current) => !current)}
              className="text-xs flex items-center gap-1"
            >
              <EditIcon className="w-3 h-3" />
              {isEditingAddress ? 'Fechar' : 'Editar'}
            </Button>
          </div>

          {isEditingAddress ? (
            <div className="space-y-2 text-sm">
              <Input
                placeholder="Rua"
                value={localProject.serviceAddress?.street || ''}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                aria-label="Rua"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Número"
                  value={localProject.serviceAddress?.number || ''}
                  onChange={(e) => handleAddressChange('number', e.target.value)}
                  aria-label="Número"
                />
                <Input
                  placeholder="CEP"
                  value={localProject.serviceAddress?.zip || ''}
                  onChange={(e) => handleAddressChange('zip', e.target.value)}
                  aria-label="CEP"
                />
              </div>
              <Input
                placeholder="Cidade"
                value={localProject.serviceAddress?.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
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
          <span className="block text-sm font-medium text-text-secondary mb-1">Dados de RRT</span>
          <div className="flex gap-2">
            <FormField label="Número" htmlFor="project-rrt-number" className="flex-1">
              <Input
                id="project-rrt-number"
                type="text"
                value={localProject.rrtNumber || ''}
                onChange={(e) => handleLocalChange('rrtNumber', e.target.value)}
                aria-label="Número do RRT"
                title="Número do RRT"
              />
            </FormField>

            <FormField label="Link do Arquivo" htmlFor="project-rrt-url" className="flex-1">
              <div className="flex gap-1">
                <Input
                  id="project-rrt-url"
                  type="text"
                  value={localProject.rrtUrl || ''}
                  onChange={(e) => handleLocalChange('rrtUrl', e.target.value)}
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
            </FormField>
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
        <Button
          type="button"
          variant="danger"
          onClick={() => handleActionRequest('delete')}
          className="text-sm flex items-center gap-2"
        >
          <TrashIcon className="w-4 h-4" /> Excluir Projeto
        </Button>

        {localProject.archived ? (
          <>
            <div className="flex-1"></div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleReactivate}
              className="text-sm flex items-center gap-2 bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20"
            >
              <UnarchiveIcon className="w-4 h-4" /> Reativar Projeto
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleActionRequest('inactivate')}
              className="text-sm flex items-center gap-2 bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
            >
              <ArchiveIcon className="w-4 h-4" /> Inativar e Arquivar
            </Button>
            <div className="flex-1"></div>
            <Button
              type="button"
              variant="success"
              onClick={() => handleActionRequest('finalize')}
              className="text-sm flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" /> Finalizar Projeto
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
