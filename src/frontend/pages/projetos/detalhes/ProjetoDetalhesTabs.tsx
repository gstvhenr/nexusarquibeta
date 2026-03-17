import React, { useMemo } from 'react';
import type {
  ContractAddendum,
  ContractAddendumStatus,
  Project,
  ProjectAddress,
  ProjectFinancials,
  Quotation,
} from '@/types';
import {
  Button,
  CalendarPlusIcon,
  CashIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  IconButton,
  Input,
  ListViewIcon,
  PencilIcon,
  PlusIcon,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TrashIcon,
} from '@/components/ui';
import {
  ProjectChecklistTab,
  ProjectFinanceTab,
  ProjectGanttTab,
  ProjectNotesTab,
  ProjectQuotationsTab,
} from '@/components/projetos';
import type { ProjectActionType } from '@/components/projetos';
import type { BudgetServiceOption, ProjectDetailTabId } from './types';
import { ProjetoDetalhesOverviewTab } from './ProjetoDetalhesOverviewTab';
import type { HiredServiceStatus } from '@/types/freelancer';

interface FreelancerDeadline {
  id: string;
  freelancerName: string;
  deadline: string;
  status: HiredServiceStatus;
}

// ─── Unified Timeline Types ──────────────────────────────────────────────────

type UnifiedDeadlineKind = 'conclusao' | 'prazo' | 'freelancer';

interface UnifiedDeadlineEntry {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  kind: UnifiedDeadlineKind;
  status?: HiredServiceStatus;
  originalId?: string; // set for 'prazo' entries — the additionalDeadline original id
}

// ─── DeadlinesTabContent ─────────────────────────────────────────────────────

interface DeadlinesTabContentProps {
  localProject: Project;
  freelancerDeadlines: FreelancerDeadline[];
  handleLocalChange: (field: keyof Project, value: Project[keyof Project]) => void;
  handleAddDeadline: () => void;
  handleDeadlineChange: (id: string, field: 'title' | 'date', value: string) => void;
  handleRemoveDeadline: (id: string) => void;
}

function DeadlinesTabContent({
  localProject,
  freelancerDeadlines,
  handleLocalChange,
  handleAddDeadline,
  handleDeadlineChange,
  handleRemoveDeadline,
}: DeadlinesTabContentProps) {
  const today = new Date().toISOString().split('T')[0];

  const unifiedDeadlines = useMemo<UnifiedDeadlineEntry[]>(() => {
    const entries: UnifiedDeadlineEntry[] = [];
    const conclusionDateStr = localProject.deadline ? localProject.deadline.split('T')[0] : null;

    if (conclusionDateStr) {
      entries.push({
        id: 'conclusao',
        date: conclusionDateStr,
        label: 'Prazo de Conclusão',
        kind: 'conclusao',
      });
    }

    for (const d of localProject.additionalDeadlines ?? []) {
      const dateStr = d.date.split('T')[0];
      // Skip any additional deadline that coincides with the conclusion date (e.g. legacy "Entrega Projeto Executivo")
      if (conclusionDateStr && dateStr === conclusionDateStr) continue;
      entries.push({
        id: `prazo-${d.id}`,
        date: dateStr,
        label: d.title || 'Prazo sem título',
        kind: 'prazo',
        originalId: d.id,
      });
    }

    for (const fd of freelancerDeadlines) {
      entries.push({
        id: `fl-${fd.id}`,
        date: fd.deadline.split('T')[0],
        label: fd.freelancerName,
        kind: 'freelancer',
        status: fd.status,
      });
    }

    return entries.sort((a, b) => a.date.localeCompare(b.date));
  }, [localProject.deadline, localProject.additionalDeadlines, freelancerDeadlines]);

  const kindConfig: Record<
    UnifiedDeadlineKind,
    { border: string; dot: string; badge: string; badgeText: string; rowBg: string }
  > = {
    conclusao: {
      border: 'border-l-success',
      dot: 'bg-success',
      badge: 'bg-success/15 text-success',
      badgeText: 'Conclusão',
      rowBg: 'hover:bg-success/5',
    },
    prazo: {
      border: 'border-l-warning',
      dot: 'bg-warning',
      badge: 'bg-warning/15 text-warning',
      badgeText: 'Prazo',
      rowBg: 'hover:bg-warning/5',
    },
    freelancer: {
      border: 'border-l-info',
      dot: 'bg-info',
      badge: 'bg-info/15 text-info',
      badgeText: 'Freelancer',
      rowBg: 'hover:bg-info/5',
    },
  };

  const conclusionDate = localProject.deadline ? localProject.deadline.split('T')[0] : null;
  const canAddDeadline = !!conclusionDate && today < conclusionDate;

  return (
    <div className="animate-fade-in-up">
      <div className="bg-background/30 rounded-xl border border-border-color/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color/50">
          <div className="flex items-center gap-3">
            <ListViewIcon className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-xl font-bold text-secondary">Prazos do Projeto</h3>
            <span className="text-xs text-text-secondary bg-background/60 px-2 py-0.5 rounded-full border border-border-color/40">
              {unifiedDeadlines.length} {unifiedDeadlines.length === 1 ? 'prazo' : 'prazos'}
            </span>
          </div>
          <div
            title={
              !canAddDeadline
                ? 'Defina um Prazo de Conclusão antes de adicionar marcos intermediários'
                : undefined
            }
          >
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddDeadline}
              disabled={!canAddDeadline}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" /> Adicionar Prazo
            </Button>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-5 px-6 py-2.5 bg-background/20 border-b border-border-color/30 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success inline-block" /> Conclusão
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning inline-block" /> Atividade
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-info inline-block" /> Freelancer
          </span>
        </div>

        {/* Empty state */}
        {unifiedDeadlines.length === 0 && (
          <div className="text-center py-16 text-text-secondary">
            <ClockIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum prazo definido para este projeto.</p>
            <p className="text-sm mt-1 opacity-70">
              Adicione o prazo de conclusão ou marcos intermediários.
            </p>
          </div>
        )}

        {/* Deadline rows */}
        <ul className="divide-y divide-border-color/40">
          {unifiedDeadlines.map((entry) => {
            const cfg = kindConfig[entry.kind];
            const isPast = entry.date < today;
            const isFreelancer = entry.kind === 'freelancer';
            const isConclusao = entry.kind === 'conclusao';
            const originalId = entry.originalId;

            return (
              <li
                key={entry.id}
                className={`flex items-center gap-5 px-6 py-4 border-l-4 transition-colors ${cfg.border} ${cfg.rowBg} ${isPast ? 'opacity-60' : ''} group`}
              >
                {/* Badge column */}
                <div className="flex flex-col items-center gap-1 shrink-0 w-24">
                  <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.badge}`}
                  >
                    {cfg.badgeText}
                  </span>
                </div>

                {/* Title column */}
                <div className="flex-1 min-w-0">
                  {isFreelancer ? (
                    <div>
                      <span className="block text-[10px] font-bold text-text-secondary uppercase mb-0.5">
                        Prestador
                      </span>
                      <p className="text-sm font-sans font-semibold text-text-primary truncate">
                        {entry.label}
                      </p>
                      {entry.status && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            entry.status === 'Concluído'
                              ? 'bg-success/10 text-success'
                              : 'bg-info/10 text-info'
                          }`}
                        >
                          {entry.status}
                        </span>
                      )}
                    </div>
                  ) : isConclusao ? (
                    <div>
                      <span className="block text-[10px] font-bold text-text-secondary uppercase mb-0.5">
                        Entrega
                      </span>
                      <p className="text-sm font-sans font-semibold text-text-primary">
                        Prazo de Conclusão
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor={`field-title-${entry.id}`}
                        className="block text-[10px] font-bold text-text-secondary uppercase mb-0.5"
                      >
                        Prazo
                      </label>
                      <Input
                        id={`field-title-${entry.id}`}
                        value={entry.label === 'Prazo sem título' ? '' : entry.label}
                        onChange={(e) =>
                          originalId && handleDeadlineChange(originalId, 'title', e.target.value)
                        }
                        className="w-full bg-transparent hover:bg-warning/5 border border-transparent hover:border-border-color focus:ring-1 focus:ring-warning/50 rounded text-sm font-semibold text-text-primary px-0 py-0.5"
                        placeholder="Nome do prazo"
                        aria-label="Título do prazo"
                      />
                    </div>
                  )}
                </div>

                {/* Date + actions column */}
                <div className="shrink-0 flex items-center justify-end gap-2">
                  {isFreelancer ? (
                    /* Read-only freelancer date */
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-text-secondary uppercase mb-0.5">
                        Prazo
                      </p>
                      <p
                        className={`text-sm font-mono font-semibold ${
                          isPast ? 'line-through text-text-secondary' : 'text-text-primary'
                        }`}
                      >
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  ) : (
                    /* Editable date: [date text] [trash?] [📅 calendar trigger] */
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase mb-0.5 text-right">
                        Data
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm font-mono font-semibold ${isPast ? 'line-through text-text-secondary' : 'text-text-primary'}`}
                        >
                          {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>

                        {/* Trash — always visible, only for marcos */}
                        {!isConclusao && originalId && (
                          <IconButton
                            variant="danger"
                            onClick={() => handleRemoveDeadline(originalId)}
                            aria-label={`Remover prazo ${entry.label}`}
                            className="rounded-md"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </IconButton>
                        )}

                        {/* Calendar icon — hidden date input overlaid on top */}
                        <div className="relative flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-info/15 group/cal cursor-pointer">
                          <CalendarPlusIcon className="w-4 h-4 text-text-secondary group-hover/cal:text-info pointer-events-none transition-colors" />
                          <input
                            type="date"
                            value={entry.date}
                            max={!isConclusao && conclusionDate ? conclusionDate : undefined}
                            onChange={(e) => {
                              if (isConclusao) {
                                handleLocalChange('deadline', e.target.value || null);
                              } else if (originalId) {
                                handleDeadlineChange(originalId, 'date', e.target.value);
                              }
                            }}
                            aria-label="Selecionar data do prazo"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

type ChecklistTabProps = React.ComponentProps<typeof ProjectChecklistTab>;
type GanttTabProps = React.ComponentProps<typeof ProjectGanttTab>;
type FinanceTabProps = React.ComponentProps<typeof ProjectFinanceTab>;
type QuotationsTabProps = React.ComponentProps<typeof ProjectQuotationsTab>;

const PROJECT_DETAIL_TABS: readonly ProjectDetailTabId[] = [
  'overview',
  'stages',
  'deadlines',
  'gantt',
  'finance',
  'quotations',
  'notes',
];

function isProjectDetailTabId(value: string): value is ProjectDetailTabId {
  return (PROJECT_DETAIL_TABS as readonly string[]).includes(value);
}

interface ProjetoDetalhesTabsProps {
  activeTab: ProjectDetailTabId;
  setActiveTab: React.Dispatch<React.SetStateAction<ProjectDetailTabId>>;
  localProject: Project;
  progress: number;
  isEditingAddress: boolean;
  setIsEditingAddress: React.Dispatch<React.SetStateAction<boolean>>;
  handleLocalChange: (field: keyof Project, value: Project[keyof Project]) => void;
  handleAddressChange: (field: keyof ProjectAddress, value: string) => void;
  incrementRevision: () => void;
  handleActionRequest: (type: ProjectActionType) => void;
  handleReactivate: () => void;
  handleSectionChange: ChecklistTabProps['onSectionChange'];
  handleTaskChange: ChecklistTabProps['onTaskChange'];
  handleAddSection: ChecklistTabProps['onAddSection'];
  handleRemoveSection: ChecklistTabProps['onRemoveSection'];
  handleAddTask: ChecklistTabProps['onAddTask'];
  handleRemoveTask: ChecklistTabProps['onRemoveTask'];
  handleEditTaskDetails: ChecklistTabProps['onEditTaskDetails'];
  handleAddDeadline: () => void;
  handleDeadlineChange: (id: string, field: 'title' | 'date', value: string) => void;
  handleRemoveDeadline: (id: string) => void;
  handleGanttTaskUpdate: GanttTabProps['onTaskUpdate'];
  budgetServices: BudgetServiceOption[];
  handleFinancialsChange: (
    field: keyof Project['financials'],
    value: ProjectFinancials[keyof ProjectFinancials],
  ) => void;
  handleInstallmentChange: FinanceTabProps['onInstallmentChange'];
  handleGenerateInstallments: FinanceTabProps['onGenerateInstallments'];
  handleOpenConfirmPayment: FinanceTabProps['onConfirmPayment'];
  handleAddInstallment: FinanceTabProps['onAddInstallment'];
  handleRemoveInstallment: FinanceTabProps['onRemoveInstallment'];
  handleAddAddendum: (addendum: Omit<ContractAddendum, 'id' | 'status'>) => void;
  handleUpdateAddendumStatus: (id: string, status: ContractAddendumStatus) => void;
  handleRemoveAddendum: (id: string) => void;
  quotations: Quotation[];
  openLinkModal: () => void;
  handleUnlinkQuotation: QuotationsTabProps['onUnlink'];
  commissionTotal?: number;
  potentialCommissionTotal?: number;
  freelancerDeadlines: FreelancerDeadline[];
}

export function ProjetoDetalhesTabs({
  activeTab,
  setActiveTab,
  localProject,
  progress,
  isEditingAddress,
  setIsEditingAddress,
  handleLocalChange,
  handleAddressChange,
  incrementRevision,
  handleActionRequest,
  handleReactivate,
  handleSectionChange,
  handleTaskChange,
  handleAddSection,
  handleRemoveSection,
  handleAddTask,
  handleRemoveTask,
  handleEditTaskDetails,
  handleAddDeadline,
  handleDeadlineChange,
  handleRemoveDeadline,
  handleGanttTaskUpdate,
  budgetServices,
  handleFinancialsChange,
  handleInstallmentChange,
  handleGenerateInstallments,
  handleOpenConfirmPayment,
  handleAddInstallment,
  handleRemoveInstallment,
  handleAddAddendum,
  handleUpdateAddendumStatus,
  handleRemoveAddendum,
  quotations,
  openLinkModal,
  handleUnlinkQuotation,
  commissionTotal,
  potentialCommissionTotal,
  freelancerDeadlines,
}: ProjetoDetalhesTabsProps) {
  const tabButtonClass = ({ active }: { active: boolean }) =>
    `flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${
      active
        ? 'border-primary text-primary'
        : 'border-transparent text-text-secondary hover:text-text-primary'
    }`;

  const handleTabChange = (value: string) => {
    if (isProjectDetailTabId(value)) {
      setActiveTab(value);
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-soft">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <nav className="border-b border-border-color px-6 overflow-x-auto no-scrollbar">
          <TabList className="flex">
            <Tab value="overview" className={tabButtonClass}>
              Visão Geral
            </Tab>
            <Tab value="stages" className={tabButtonClass}>
              Etapas
            </Tab>
            <Tab value="deadlines" className={tabButtonClass}>
              <ClockIcon className="w-4 h-4" /> Prazos
            </Tab>
            <Tab value="gantt" className={tabButtonClass}>
              <CalendarPlusIcon className="w-4 h-4" /> Cronograma
            </Tab>
            <Tab value="finance" className={tabButtonClass}>
              <CashIcon className="w-4 h-4" /> Financeiro
            </Tab>
            <Tab value="quotations" className={tabButtonClass}>
              <ClipboardDocumentListIcon className="w-4 h-4" /> Cotações
            </Tab>
            <Tab value="notes" className={tabButtonClass}>
              <PencilIcon className="w-4 h-4" /> Anotações
            </Tab>
          </TabList>
        </nav>

        <div className="p-6">
          <TabPanel value="overview">
            <ProjetoDetalhesOverviewTab
              localProject={localProject}
              isEditingAddress={isEditingAddress}
              setIsEditingAddress={setIsEditingAddress}
              handleLocalChange={handleLocalChange}
              handleAddressChange={handleAddressChange}
              progress={progress}
              incrementRevision={incrementRevision}
              handleActionRequest={handleActionRequest}
              handleReactivate={handleReactivate}
            />
          </TabPanel>

          <TabPanel value="stages">
            <ProjectChecklistTab
              sections={localProject.sections}
              onSectionChange={handleSectionChange}
              onTaskChange={handleTaskChange}
              onAddSection={handleAddSection}
              onRemoveSection={handleRemoveSection}
              onAddTask={handleAddTask}
              onRemoveTask={handleRemoveTask}
              onEditTaskDetails={handleEditTaskDetails}
            />
          </TabPanel>

          <TabPanel value="deadlines">
            <DeadlinesTabContent
              localProject={localProject}
              freelancerDeadlines={freelancerDeadlines}
              handleLocalChange={handleLocalChange}
              handleAddDeadline={handleAddDeadline}
              handleDeadlineChange={handleDeadlineChange}
              handleRemoveDeadline={handleRemoveDeadline}
            />
          </TabPanel>

          <TabPanel value="gantt">
            <ProjectGanttTab
              sections={localProject.sections}
              onTaskUpdate={handleGanttTaskUpdate}
            />
          </TabPanel>

          <TabPanel value="finance">
            <ProjectFinanceTab
              project={localProject}
              budgetServices={budgetServices}
              onFinancialsChange={handleFinancialsChange}
              onInstallmentChange={handleInstallmentChange}
              onGenerateInstallments={handleGenerateInstallments}
              onConfirmPayment={handleOpenConfirmPayment}
              onAddInstallment={handleAddInstallment}
              onRemoveInstallment={handleRemoveInstallment}
              onAddAddendum={handleAddAddendum}
              onUpdateAddendumStatus={handleUpdateAddendumStatus}
              onRemoveAddendum={handleRemoveAddendum}
              commissionTotal={commissionTotal}
              potentialCommissionTotal={potentialCommissionTotal}
            />
          </TabPanel>

          <TabPanel value="quotations">
            <ProjectQuotationsTab
              project={localProject}
              allQuotations={quotations}
              onLink={openLinkModal}
              onUnlink={handleUnlinkQuotation}
            />
          </TabPanel>

          <TabPanel value="notes">
            <ProjectNotesTab
              notes={localProject.notes || ''}
              onChange={(value) => handleLocalChange('notes', value)}
            />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}
