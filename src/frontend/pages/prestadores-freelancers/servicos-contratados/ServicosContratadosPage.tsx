import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDisclosure } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { Button, FormField, IconButton, Input, Modal, Select } from '@/components/ui';
import { useCoreData, useSupplyChainData, useSystemData } from '@/context/DataContext';
import { NAV_LINKS, SUBCONTRATACAO_LABEL } from '@/constants';
import {
  bindTasksToHiredService,
  clearTasksFromHiredService,
  completeHiredService,
  completeTasksFromHiredService,
  cancelHiredService,
} from '@/services/hiredServiceService';
import type { HiredService } from '@/types';
import {
  ClipboardDocumentListIcon,
  TrashIcon,
  PlusIcon,
  UserCircleIcon,
  ArchiveIcon,
  UnarchiveIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  ChevronDownIcon,
} from '@/components/ui';
import { formatCurrency, formatDate, getDeadlineInfo, getTodayDateOnly } from '@/utils/formatters';
import { v4 as uuidv4 } from 'uuid';

const DEADLINE_STATUS_CLASS = {
  overdue: 'text-error font-bold',
  soon: 'text-warning font-semibold',
  ok: 'text-text-primary',
  none: 'text-text-secondary',
} as const;

const BORDER_BY_STATUS: Record<HiredService['status'], string> = {
  'Em Andamento': 'border-info',
  Concluído: 'border-success',
  Cancelado: 'border-error',
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  'Em Andamento': {
    label: 'Em andamento',
    className: 'text-info bg-info/10',
  },
  Concluído: {
    label: 'Concluído',
    className: 'text-success bg-success/10',
  },
  Cancelado: {
    label: 'Cancelado',
    className: 'text-error bg-error/10',
  },
};

const ServicosContratadosPage: () => React.ReactNode = () => {
  const { projects, setProjects } = useCoreData();

  const { freelancers } = useSupplyChainData();
  const { hiredServices, setHiredServices } = useSystemData();

  const modalDisclosure = useDisclosure();
  const paymentModalDisclosure = useDisclosure();
  const [showArchived, setShowArchived] = useState(false);
  const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [deadline, setDeadline] = useState('');

  // Dropdown state for Custom Tasks Select
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const tasksButtonRef = useRef<HTMLButtonElement>(null);
  const tasksDropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click was outside both the button and the dropdown content
      const target = event.target as Node;
      if (
        isTasksOpen &&
        tasksButtonRef.current &&
        !tasksButtonRef.current.contains(target) &&
        tasksDropdownRef.current &&
        !tasksDropdownRef.current.contains(target)
      ) {
        setIsTasksOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTasksOpen]);

  const toggleTasksDropdown = () => {
    if (!isTasksOpen && tasksButtonRef.current) {
      const rect = tasksButtonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 99999, // very high to float over modal
      });
    }
    setIsTasksOpen(!isTasksOpen);
  };

  const handleTaskCheckboxClick = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    );
  };

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

  const openCreateModal = () => {
    setEditingServiceId(null);
    setSelectedProjectId('');
    setSelectedTaskIds([]);
    setSelectedFreelancerId('');
    setCost(0);
    setDeadline(getTodayDateOnly());
    modalDisclosure.open();
  };

  const openEditModal = (serviceId: string) => {
    const service = hiredServices.find((s) => s.id === serviceId);
    if (!service) return;
    setEditingServiceId(serviceId);
    setSelectedProjectId(service.projectId);
    setSelectedTaskIds([...service.taskIds]);
    setSelectedFreelancerId(service.freelancerId);
    setCost(service.cost);
    setDeadline(service.deadline);
    modalDisclosure.open();
  };

  const handleSave = () => {
    if (!selectedProjectId || !selectedFreelancerId || cost <= 0 || !deadline) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const project = projects.find((p) => p.id === selectedProjectId);
    const freelancer = freelancers.find((f) => f.id === selectedFreelancerId);

    if (!project || !freelancer) return;

    if (editingServiceId) {
      // ── UPDATE existing service ──
      const oldService = hiredServices.find((s) => s.id === editingServiceId);
      if (!oldService) return;

      // 1. Clear old task bindings
      setProjects((prev) => {
        let updated = clearTasksFromHiredService(prev, oldService);
        // 2. Bind new task selection
        if (selectedTaskIds.length > 0) {
          updated = bindTasksToHiredService(
            updated,
            selectedProjectId,
            selectedTaskIds,
            freelancer.name,
          );
        }
        return updated;
      });

      // 3. Update the service itself
      setHiredServices((prev) =>
        prev.map((s) =>
          s.id === editingServiceId
            ? {
                ...s,
                freelancerId: selectedFreelancerId,
                taskIds: selectedTaskIds,
                cost,
                deadline,
              }
            : s,
        ),
      );
    } else {
      // ── CREATE new service ──
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
        paidAt: null,
        archived: false,
      };

      setHiredServices((prev) => [newService, ...prev]);

      if (selectedTaskIds.length > 0) {
        setProjects((prev) =>
          bindTasksToHiredService(prev, selectedProjectId, selectedTaskIds, freelancer.name),
        );
      }
    }

    modalDisclosure.close();
  };
  const handleArchive = (id: string, archive: boolean) => {
    setHiredServices((prev) => prev.map((s) => (s.id === id ? { ...s, archived: archive } : s)));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      const service = hiredServices.find((s) => s.id === id);
      if (service) {
        setProjects((prev) => clearTasksFromHiredService(prev, service));
      }
      setHiredServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // ── Completion flow ──────────────────────────────────────────
  const handleCompleteClick = (serviceId: string) => {
    setPendingCompleteId(serviceId);
    paymentModalDisclosure.open();
  };

  const handlePaymentConfirm = (isPaid: boolean) => {
    if (!pendingCompleteId) return;
    const service = hiredServices.find((s) => s.id === pendingCompleteId);
    if (!service) return;

    const updated = completeHiredService(service, isPaid);
    setHiredServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

    // Auto-complete linked project tasks
    setProjects((prev) => completeTasksFromHiredService(prev, service));

    setPendingCompleteId(null);
    paymentModalDisclosure.close();
  };

  // ── Cancellation flow ────────────────────────────────────────
  const handleCancelClick = (serviceId: string) => {
    const service = hiredServices.find((s) => s.id === serviceId);
    if (!service) return;

    if (
      !window.confirm(
        'Tem certeza que deseja cancelar este serviço? O freelancer será desvinculado do projeto e as cobranças serão removidas. Esta ação é irreversível.',
      )
    ) {
      return;
    }

    const updated = cancelHiredService(service);
    setHiredServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setProjects((prev) => clearTasksFromHiredService(prev, service));
  };

  const subcontratacaoLink = NAV_LINKS.find((link) => link.label === SUBCONTRATACAO_LABEL);
  const pageIcon = subcontratacaoLink?.children?.find(
    (child) => child.path === '/prestadores-freelancers/servicos-contratados',
  )?.icon;

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
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
        <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Contratar Serviço
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {delegatedServices.map((service) => {
          const project = projects.find((p) => p.id === service.projectId);
          const freelancer = freelancers.find((f) => f.id === service.freelancerId);
          const deadlineInfo = getDeadlineInfo(service.deadline);
          const isFinalized = service.status !== 'Em Andamento';
          const badge = STATUS_BADGE[service.status];

          return (
            <div
              key={service.id}
              className={`bg-surface rounded-xl shadow-soft p-5 border-l-4 ${BORDER_BY_STATUS[service.status]} transition-all hover:shadow-lg`}
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
                <div className="bg-background rounded-full overflow-hidden flex items-center justify-center border border-border-color shrink-0 w-12 h-12">
                  {freelancer?.photo ? (
                    <img
                      src={freelancer.photo}
                      alt={freelancer.name}
                      className="w-full h-full object-cover"
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
                  <span className={`font-semibold ${DEADLINE_STATUS_CLASS[deadlineInfo.status]}`}>
                    {formatDate(service.deadline)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Tarefas Delegadas:</span>
                  <span className="font-semibold text-text-primary">
                    {service.taskIds.length} selecionadas
                  </span>
                </div>
                {service.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Pagamento:</span>
                    <span className="font-semibold text-success">Pago</span>
                  </div>
                )}
                {service.status === 'Concluído' && !service.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Pagamento:</span>
                    <span className="font-semibold text-warning">Pendente</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border-color flex justify-between items-center">
                {/* Status badge */}
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${badge.className}`}
                >
                  {badge.label}
                </span>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {!isFinalized && (
                    <IconButton
                      onClick={() => openEditModal(service.id)}
                      variant="primary"
                      className="bg-background"
                      title="Editar serviço"
                      aria-label="Editar serviço"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={() => handleCompleteClick(service.id)}
                    variant="primary"
                    className="bg-background"
                    title="Concluir serviço"
                    aria-label="Concluir serviço"
                    disabled={isFinalized}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleCancelClick(service.id)}
                    variant="danger"
                    className="bg-background"
                    title="Cancelar serviço"
                    aria-label="Cancelar serviço"
                    disabled={isFinalized}
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleArchive(service.id, !service.archived)}
                    variant="primary"
                    className="bg-background"
                    title={service.archived ? 'Desarquivar' : 'Arquivar'}
                    aria-label={service.archived ? 'Desarquivar serviço' : 'Arquivar serviço'}
                  >
                    {service.archived ? (
                      <UnarchiveIcon className="w-4 h-4" />
                    ) : (
                      <ArchiveIcon className="w-4 h-4" />
                    )}
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(service.id)}
                    variant="danger"
                    className="bg-background"
                    title="Excluir"
                    aria-label="Excluir serviço"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </IconButton>
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

      {/* Modal: Contratar Novo Serviço */}
      <Modal
        isOpen={modalDisclosure.isOpen}
        onClose={modalDisclosure.close}
        title={editingServiceId ? 'Editar Serviço Contratado' : 'Contratar Novo Serviço'}
      >
        <div
          className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
          onScroll={() => setIsTasksOpen(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Projeto" htmlFor="field-projeto">
              <Select
                id="field-projeto"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                aria-label="Projeto"
                placeholder="Selecione o Projeto..."
                options={activeProjects.map((project) => ({
                  value: project.id,
                  label: project.name.startsWith(project.code)
                    ? project.name
                    : `${project.code} - ${project.name}`,
                }))}
                className="bg-background"
                disabled={Boolean(editingServiceId)}
              />
            </FormField>
            <FormField label="Freelancer" htmlFor="field-freelancer">
              <Select
                id="field-freelancer"
                value={selectedFreelancerId}
                onChange={(e) => setSelectedFreelancerId(e.target.value)}
                aria-label="Freelancer"
                placeholder="Selecione o Profissional."
                options={activeFreelancers.map((freelancer) => ({
                  value: freelancer.id,
                  label: freelancer.name,
                }))}
                className="bg-background"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Custo Total (R$)">
              <Input
                type="text"
                inputMode="decimal"
                value={
                  cost
                    ? cost.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : ''
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/\./g, '').replace(',', '.');
                  setCost(parseFloat(raw) || 0);
                }}
                placeholder="R$ 0,00"
              />
            </FormField>
            <FormField label="Prazo de Entrega">
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </FormField>
          </div>
          {selectedProject ? (
            <FormField label="Tarefas" htmlFor="field-tarefas">
              <button
                type="button"
                id="field-tarefas"
                ref={tasksButtonRef}
                onClick={toggleTasksDropdown}
                className={`w-full bg-surface border rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between
                  focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent
                  transition-colors duration-150 border-border-color`}
                aria-haspopup="true"
                aria-expanded={isTasksOpen ? true : undefined}
              >
                <span
                  className={`block truncate ${selectedTaskIds.length === 0 ? 'text-text-secondary' : 'text-text-primary'}`}
                >
                  {selectedTaskIds.length === 0
                    ? 'Selecione as tarefas...'
                    : `${selectedTaskIds.length} tarefa${selectedTaskIds.length > 1 ? 's' : ''} selecionada${selectedTaskIds.length > 1 ? 's' : ''}`}
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isTasksOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isTasksOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                  /* Dynamic portal coordinates require inline style */
                  <div
                    ref={tasksDropdownRef}
                    style={dropdownStyle}
                    className="bg-surface border border-border-color shadow-lifted rounded-lg max-h-56 overflow-y-auto custom-scrollbar flex flex-col my-1 z-[99999]"
                  >
                    {selectedProject.sections
                      .flatMap((s) => s.tasks)
                      .filter((task) => !task.completed || selectedTaskIds.includes(task.id))
                      .length === 0 ? (
                      <div className="px-3 py-4 text-sm text-text-secondary text-center italic">
                        Este projeto não tem tarefas disponíveis para delegar.
                      </div>
                    ) : (
                      selectedProject.sections
                        .flatMap((s) => s.tasks)
                        .filter((task) => !task.completed || selectedTaskIds.includes(task.id))
                        .map((task) => (
                          <label
                            key={task.id}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-background transition-colors border-b border-border-color/30 last:border-b-0"
                          >
                            <input
                              id={`task-delegate-${task.id}`}
                              type="checkbox"
                              checked={selectedTaskIds.includes(task.id)}
                              onChange={() => handleTaskCheckboxClick(task.id)}
                              className="rounded accent-primary w-4 h-4 cursor-pointer shrink-0"
                              aria-label={task.name}
                            />
                            <span className="font-medium text-text-primary truncate">
                              {task.assignee && !selectedTaskIds.includes(task.id)
                                ? `${task.name} (Atual: ${task.assignee})`
                                : task.name}
                            </span>
                          </label>
                        ))
                    )}
                  </div>,
                  document.body,
                )}
            </FormField>
          ) : (
            <div className="text-center py-8 bg-background/30 rounded-xl border border-dashed border-border-color text-sm text-text-secondary">
              Selecione um projeto para ver as tarefas disponíveis.
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
          <Button variant="secondary" onClick={modalDisclosure.close}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editingServiceId ? 'Salvar Alterações' : 'Confirmar Contratação'}
          </Button>
        </div>
      </Modal>

      {/* Modal: Confirmação de Pagamento */}
      <Modal
        isOpen={paymentModalDisclosure.isOpen}
        onClose={() => {
          setPendingCompleteId(null);
          paymentModalDisclosure.close();
        }}
        title="Confirmar Conclusão do Serviço"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            O serviço contratado já foi pago ao freelancer?
          </p>
          <div className="bg-background/50 p-3 rounded-lg border border-border-color/50 text-sm">
            <p className="text-text-secondary">
              <strong className="text-text-primary">Sim:</strong> O valor será registrado como
              despesa efetiva (pago) no módulo financeiro.
            </p>
            <p className="text-text-secondary mt-2">
              <strong className="text-text-primary">Não:</strong> O valor continuará como previsão
              de pagamento pendente no módulo financeiro.
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
          <Button
            variant="secondary"
            onClick={() => {
              setPendingCompleteId(null);
              paymentModalDisclosure.close();
            }}
          >
            Voltar
          </Button>
          <Button variant="primary" onClick={() => handlePaymentConfirm(false)}>
            Não, manter pendente
          </Button>
          <Button
            variant="primary"
            onClick={() => handlePaymentConfirm(true)}
            className="bg-success hover:bg-success/90"
          >
            Sim, já foi pago
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ServicosContratadosPage;
