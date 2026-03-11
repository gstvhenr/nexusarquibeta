import React from 'react';
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
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  IconButton,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/ui';
import { Tab, TabList, TabPanel, Tabs } from '@/components/ui/Tabs';
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
  setLinkModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleUnlinkQuotation: QuotationsTabProps['onUnlink'];
  commissionTotal?: number;
  potentialCommissionTotal?: number;
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
  setLinkModalOpen,
  handleUnlinkQuotation,
  commissionTotal,
  potentialCommissionTotal,
}: ProjetoDetalhesTabsProps) {
  const tabButtonClass = ({ active }: { active: boolean }) =>
    `flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${
      active
        ? 'border-primary text-primary'
        : 'border-transparent text-text-secondary hover:text-text-primary'
    }`;

  const commonInputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition';

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
              activeTab={activeTab}
              localProject={localProject}
              commonInputClass={commonInputClass}
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
            <div className="space-y-8 animate-fade-in-up">
              <div className="bg-background/30 p-6 rounded-xl border border-border-color/50">
                <h3 className="font-serif text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-success" /> Prazo de Conclusão
                </h3>
                <div className="max-w-md">
                  <label
                    htmlFor="field-data-final-de-entrega-do-projeto"
                    className="block text-sm font-medium text-text-secondary mb-1"
                  >
                    Data Final de Entrega do Projeto
                  </label>
                  <input
                    id="field-data-final-de-entrega-do-projeto"
                    type="date"
                    value={localProject.deadline?.split('T')[0] || ''}
                    onChange={(e) => handleLocalChange('deadline', e.target.value || null)}
                    className={commonInputClass}
                    aria-label="Prazo final do projeto"
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    Esta data define o marco final no cronograma e serve como base para alertas de
                    atraso.
                  </p>
                </div>
              </div>

              <div className="bg-background/30 p-6 rounded-xl border border-border-color/50">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-xl font-bold text-secondary flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-warning" /> Adição de Prazos (Marcos)
                  </h3>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddDeadline}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" /> Adicionar Prazo
                  </Button>
                </div>

                <div className="space-y-3">
                  {(localProject.additionalDeadlines || []).length === 0 && (
                    <div className="text-center py-8 text-text-secondary border-2 border-dashed border-border-color rounded-lg">
                      <p>Nenhum prazo intermediário definido.</p>
                    </div>
                  )}

                  {(localProject.additionalDeadlines || []).map((deadline) => (
                    <div
                      key={deadline.id}
                      className="flex items-center gap-4 bg-surface p-4 rounded-lg shadow-sm border border-border-color group hover:border-primary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <label
                          htmlFor="field-titulo-do-marco"
                          className="block text-xs font-bold text-text-secondary uppercase mb-1"
                        >
                          Título do Marco
                        </label>
                        <input
                          id="field-titulo-do-marco"
                          value={deadline.title}
                          onChange={(e) =>
                            handleDeadlineChange(deadline.id, 'title', e.target.value)
                          }
                          className="w-full bg-transparent border-none focus:ring-0 text-base font-semibold text-text-primary p-0"
                          placeholder="Ex: Aprovação de Layout"
                          aria-label="Título do marco"
                        />
                      </div>
                      <div className="h-8 w-px bg-border-color"></div>
                      <div>
                        <label
                          htmlFor="field-data"
                          className="block text-xs font-bold text-text-secondary uppercase mb-1"
                        >
                          Data
                        </label>
                        <input
                          id="field-data"
                          type="date"
                          value={deadline.date.split('T')[0]}
                          onChange={(e) =>
                            handleDeadlineChange(deadline.id, 'date', e.target.value)
                          }
                          className="bg-transparent border-none focus:ring-0 text-sm text-text-primary p-0"
                          aria-label="Data do marco"
                        />
                      </div>
                      <IconButton
                        variant="danger"
                        onClick={() => handleRemoveDeadline(deadline.id)}
                        aria-label={`Remover prazo ${deadline.title}`}
                        className="opacity-0 group-hover:opacity-100 ml-2"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </IconButton>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
              onLink={() => setLinkModalOpen(true)}
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
