import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { Button, FormField, Input, Modal } from '@/components/ui';
import { useCoreData, useSupplyChainData, useSystemData } from '@/context/DataContext';
import { NAV_LINKS } from '@/constants';
import type { HiredService } from '@/types';
import {
  ClipboardDocumentListIcon,
  TrashIcon,
  PlusIcon,
  UserCircleIcon,
  ArchiveIcon,
  UnarchiveIcon,
} from '@/components/ui';
import { formatCurrency, formatDate, getDeadlineInfo, getTodayDateOnly } from '@/utils/formatters';
import { v4 as uuidv4 } from 'uuid';

const ServicosContratadosPage: () => React.ReactNode = () => {
  const { projects, setProjects } = useCoreData();

  const { freelancers } = useSupplyChainData();
  const { hiredServices, setHiredServices } = useSystemData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [deadline, setDeadline] = useState('');

  const activeProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          (p.status === 'Em Andamento' || p.status === 'Não Iniciado' || p.status === 'Pausado') &&
          !p.archived,
      ),
    [projects],
  );

  const activeFreelancers = useMemo(() => freelancers.filter((f) => !f.archived), [freelancers]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  const delegatedServices = useMemo(() => {
    return hiredServices
      .filter((s) => (s.archived || false) === showArchived)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [hiredServices, showArchived]);

  const openModal = () => {
    setSelectedProjectId('');
    setSelectedTaskIds([]);
    setSelectedFreelancerId('');
    setCost(0);
    setDeadline(getTodayDateOnly());
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!selectedProjectId || !selectedFreelancerId || cost <= 0 || !deadline) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const project = projects.find((p) => p.id === selectedProjectId);
    const freelancer = freelancers.find((f) => f.id === selectedFreelancerId);

    if (!project || !freelancer) return;

    const newServiceId = uuidv4();
    const newService: HiredService = {
      id: newServiceId,
      projectId: selectedProjectId,
      freelancerId: selectedFreelancerId,
      taskIds: selectedTaskIds,
      cost: cost,
      deadline: deadline,
      status: 'Em Andamento',
      createdAt: new Date().toISOString(),
      archived: false,
    };

    // 1. Create Hired Service
    setHiredServices((prev) => [newService, ...prev]);

    // 4. Update Project Tasks Assignee
    if (selectedTaskIds.length > 0) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === selectedProjectId) {
            return {
              ...p,
              sections: p.sections.map((sec) => ({
                ...sec,
                tasks: sec.tasks.map((task) => {
                  if (selectedTaskIds.includes(task.id)) {
                    return { ...task, assignee: `Freelancer: ${freelancer.name}` };
                  }
                  return task;
                }),
              })),
            };
          }
          return p;
        }),
      );
    }

    setIsModalOpen(false);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    );
  };

  const handleArchive = (id: string, archive: boolean) => {
    setHiredServices((prev) => prev.map((s) => (s.id === id ? { ...s, archived: archive } : s)));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      setHiredServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleStatusChange = (id: string, status: HiredService['status']) => {
    setHiredServices((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const subcontratacaoLink = NAV_LINKS.find((link) => link.label === 'Subcontratação');
  const pageIcon = subcontratacaoLink?.children?.find(
    (child) => child.path === '/prestadores-freelancers/servicos-contratados',
  )?.icon;

  const selectClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition';

  return (
    <div className="animate-fade-in-up h-full flex flex-col px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6">
      <PageHeader title="Serviços Contratados" icon={pageIcon}>
        <Button
          variant="secondary"
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center gap-2"
        >
          {showArchived ? (
            <UnarchiveIcon className="w-4 h-4" />
          ) : (
            <ArchiveIcon className="w-4 h-4" />
          )}
          {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
        </Button>
        <Button variant="primary" onClick={openModal} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Contratar Serviço
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {delegatedServices.map((service) => {
          const project = projects.find((p) => p.id === service.projectId);
          const freelancer = freelancers.find((f) => f.id === service.freelancerId);
          const deadlineInfo = getDeadlineInfo(service.deadline);

          return (
            <div
              key={service.id}
              className={`bg-surface rounded-xl shadow-soft p-5 border-l-4 ${service.status === 'Concluído' ? 'border-success' : 'border-info'} transition-all hover:shadow-lg`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-text-primary text-lg">
                    {freelancer?.name || 'Freelancer Desconhecido'}
                  </h4>
                  <p className="text-sm text-text-secondary truncate max-w-[200px]">
                    {project?.name || 'Projeto Desconhecido'}
                  </p>
                </div>
                <div className="bg-background rounded-full p-2 border border-border-color">
                  {freelancer?.photo ? (
                    <img
                      src={freelancer.photo}
                      alt={freelancer.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-secondary" />
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4 bg-background/30 p-3 rounded-lg border border-border-color/50">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Custo:</span>
                  <span className="font-semibold text-text-primary">
                    {formatCurrency(service.cost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Prazo:</span>
                  <span className={`font-semibold ${deadlineInfo.className}`}>
                    {formatDate(service.deadline)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Tarefas Delegadas:</span>
                  <span className="font-semibold text-text-primary">
                    {service.taskIds.length} selecionadas
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border-color flex justify-between items-center">
                <select
                  value={service.status}
                  onChange={(e) =>
                    handleStatusChange(service.id, e.target.value as HiredService['status'])
                  }
                  className="bg-background border border-border-color text-xs rounded p-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  aria-label="Status do serviço"
                >
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleArchive(service.id, !service.archived)}
                    className="text-text-secondary hover:text-primary p-1.5 rounded-full hover:bg-background transition-colors"
                    title={service.archived ? 'Desarquivar' : 'Arquivar'}
                    aria-label={service.archived ? 'Desarquivar serviço' : 'Arquivar serviço'}
                  >
                    {service.archived ? (
                      <UnarchiveIcon className="w-4 h-4" />
                    ) : (
                      <ArchiveIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-text-secondary hover:text-error p-1.5 rounded-full hover:bg-background transition-colors"
                    title="Excluir"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {delegatedServices.length === 0 && (
          <div className="col-span-full text-center py-16 text-text-secondary border-2 border-dashed border-border-color rounded-xl">
            <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-3 opacity-20" />
            <p>Nenhum serviço contratado encontrado.</p>
            <p className="text-xs mt-1">Use o botão acima para iniciar uma nova subcontratação.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Contratar Novo Serviço"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="field-projeto"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Projeto
              </label>
              <select
                id="field-projeto"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className={selectClass}
                aria-label="Projeto"
              >
                <option value="">Selecione o Projeto...</option>
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.startsWith(p.code) ? p.name : `${p.code} - ${p.name}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="field-freelancer"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Freelancer
              </label>
              <select
                id="field-freelancer"
                value={selectedFreelancerId}
                onChange={(e) => setSelectedFreelancerId(e.target.value)}
                className={selectClass}
                aria-label="Freelancer"
              >
                <option value="">Selecione o Profissional...</option>
                {activeFreelancers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.specialties[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Custo Total (R$)">
              <Input
                type="number"
                value={cost || ''}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Prazo de Entrega">
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </FormField>
          </div>

          {selectedProject ? (
            <div className="bg-background/50 p-4 rounded-xl border border-border-color/50">
              <span className="block text-sm font-bold text-text-primary mb-3">
                Selecione as Tarefas para Delegar
              </span>
              <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {selectedProject.sections
                  .flatMap((s) => s.tasks)
                  .map((task) => (
                    <label
                      key={task.id}
                      className="flex items-center gap-3 text-sm cursor-pointer hover:bg-surface p-2 rounded-lg border border-transparent hover:border-border-color transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="rounded accent-primary w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-text-primary block truncate">
                          {task.name}
                        </span>
                        {task.assignee && (
                          <span className="text-xs text-text-secondary">
                            Atual: {task.assignee}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                {selectedProject.sections.flatMap((s) => s.tasks).length === 0 && (
                  <p className="text-xs text-text-secondary italic text-center py-4">
                    Este projeto não tem tarefas cadastradas.
                  </p>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-3 italic">
                * Ao salvar, o freelancer será definido como responsável por estas tarefas no
                projeto.
              </p>
            </div>
          ) : (
            <div className="text-center py-8 bg-background/30 rounded-xl border border-dashed border-border-color text-sm text-text-secondary">
              Selecione um projeto para ver as tarefas disponíveis.
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Confirmar Contratação
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ServicosContratadosPage;
