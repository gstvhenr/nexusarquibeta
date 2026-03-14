import React from 'react';
import type { Project } from '../../types';
import { PROJECT_STATUS_COLORS } from '../../constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getProjectTotalContractValue } from '../../utils/projectFinancials';
import { ArrowUpCircleIcon, BriefcaseIcon, ProjetosIcon } from '../ui/icons';
import { Button } from '../ui';

type ClientProjectsTabProps = {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
};

export const ClientProjectsTab: (props: ClientProjectsTabProps) => React.ReactNode = ({
  projects,
  onOpenProject,
}) => {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
        <ProjetosIcon className="w-5 h-5" /> Projetos Vinculados
      </h4>
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const statusColor = PROJECT_STATUS_COLORS[project.status];
            return (
              <div
                key={project.id}
                className="bg-surface border border-border-color rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-bold text-text-primary text-lg">{project.name}</h5>
                    <p className="text-sm text-text-secondary">{project.code}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${statusColor.bg} ${statusColor.text}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Total Contratado:</span>
                    <span className="font-semibold text-text-primary">
                      {formatCurrency(getProjectTotalContractValue(project))}
                    </span>
                  </div>
                  {project.deadline && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Prazo:</span>
                      <span className="font-semibold text-text-primary">
                        {formatDate(project.deadline)}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => onOpenProject(project.id)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  Ver Projeto <ArrowUpCircleIcon className="w-4 h-4 rotate-45" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-border-color rounded-xl bg-background/30">
          <BriefcaseIcon className="w-12 h-12 mx-auto text-text-secondary/30 mb-3" />
          <p className="text-text-secondary font-medium">
            Nenhum projeto vinculado a este cliente.
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Crie um novo projeto ou converta uma proposta para vê-lo aqui.
          </p>
        </div>
      )}
    </div>
  );
};
