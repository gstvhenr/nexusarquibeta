import React, { useMemo, useState } from 'react';
import {
  getProjectBaseContractValue,
  getProjectLumpSumValue,
  getProjectTotalContractValue,
} from '@/utils/projectFinancials';
import { formatCurrency, getTodayDateOnly } from '@/utils/formatters';
import { ProjectFinanceAddendumsSection } from './project-finance/ProjectFinanceAddendumsSection';
import { ProjectFinanceConfigSection } from './project-finance/ProjectFinanceConfigSection';
import { ProjectFinanceTransactionsSection } from './project-finance/ProjectFinanceTransactionsSection';
import { ProjectFinanceOverviewSubTab } from './project-finance/ProjectFinanceOverviewSubTab';
import type { FinanceTabProps } from './project-finance/types';
import {
  ChartBarIcon,
  CashIcon,
  ClipboardDocumentListIcon,
  SettingsIcon,
} from '@/components/ui/icons';

type FinanceSubTab = 'visao_geral' | 'contrato' | 'pagamento';

const SUB_TABS: readonly { id: FinanceSubTab; label: string; icon: React.ReactNode }[] = [
  { id: 'visao_geral', label: 'Visão Geral', icon: <ChartBarIcon className="w-4 h-4" /> },
  { id: 'contrato', label: 'Contrato & Aditivos', icon: <SettingsIcon className="w-4 h-4" /> },
  {
    id: 'pagamento',
    label: 'Pagamentos (Parcelas)',
    icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
  },
];

export const ProjectFinanceTab: (props: FinanceTabProps) => React.ReactNode = ({
  project,
  budgetServices,
  onFinancialsChange,
  onInstallmentChange,
  onGenerateInstallments,
  onConfirmPayment,
  onAddInstallment,
  onRemoveInstallment,
  onAddAddendum,
  onUpdateAddendumStatus,
  onRemoveAddendum,
  commissionTotal: _commissionTotal = 0,
  potentialCommissionTotal: _potentialCommissionTotal = 0,
}) => {
  const financials = project.financials;
  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>('visao_geral');
  const [showSettings, setShowSettings] = useState(false);

  const [newAddendum, setNewAddendum] = useState({
    description: '',
    value: 0,
    date: getTodayDateOnly(),
    isDiscount: false,
  });

  const [selectedBudgetServiceId, setSelectedBudgetServiceId] = useState('');
  const [budgetServiceValue, setBudgetServiceValue] = useState(0);
  const [budgetServiceDate, setBudgetServiceDate] = useState(getTodayDateOnly());
  const [budgetServiceMode, setBudgetServiceMode] = useState<'increase' | 'discount'>('increase');

  const commonInputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent text-text-primary transition text-sm';

  const { baseContractValue, totalValue, totalPaid, totalToPay, totalAddendums } = useMemo(() => {
    const resolvedBaseContractValue = getProjectBaseContractValue(project);
    const resolvedTotalValue = getProjectTotalContractValue(project);
    const addendumsSum = resolvedTotalValue - resolvedBaseContractValue;

    let paid = 0;
    if (financials.paymentType === 'vista') {
      paid = financials.lumpSumStatus === 'Pago' ? getProjectLumpSumValue(project) : 0;
    } else {
      paid = (financials.installments || [])
        .filter((installment) => installment.paid)
        .reduce((sum, installment) => sum + installment.value, 0);
    }

    return {
      baseContractValue: resolvedBaseContractValue,
      totalValue: resolvedTotalValue,
      totalPaid: paid,
      totalToPay: Math.max(0, resolvedTotalValue - paid),
      totalAddendums: addendumsSum,
    };
  }, [financials, project]);

  const selectedBudgetService = useMemo(
    () => budgetServices.find((service) => service.id === selectedBudgetServiceId),
    [budgetServices, selectedBudgetServiceId],
  );

  const handleAddNewAddendum = () => {
    const absoluteValue = Math.abs(newAddendum.value);
    if (!newAddendum.description.trim() || !Number.isFinite(absoluteValue) || absoluteValue <= 0) {
      return;
    }

    onAddAddendum({
      description: newAddendum.description.trim(),
      value: newAddendum.isDiscount ? -absoluteValue : absoluteValue,
      date: newAddendum.date,
    });

    setNewAddendum({
      description: '',
      value: 0,
      date: getTodayDateOnly(),
      isDiscount: false,
    });
  };

  const handleBudgetServiceChange = (serviceId: string) => {
    setSelectedBudgetServiceId(serviceId);
    const selected = budgetServices.find((service) => service.id === serviceId);
    if (selected) {
      setBudgetServiceValue(selected.suggestedValue);
    } else {
      setBudgetServiceValue(0);
    }
  };

  const handleAddBudgetService = () => {
    if (!selectedBudgetService) return;

    const absoluteValue = Math.abs(budgetServiceValue);
    if (!Number.isFinite(absoluteValue) || absoluteValue <= 0) return;

    const signedValue = budgetServiceMode === 'discount' ? -absoluteValue : absoluteValue;
    const prefix = budgetServiceMode === 'discount' ? 'Desconto em serviço' : 'Servico adicional';

    onAddAddendum({
      description: `${prefix}: ${selectedBudgetService.description} (${selectedBudgetService.sectionTitle})`,
      value: signedValue,
      date: budgetServiceDate,
    });

    setSelectedBudgetServiceId('');
    setBudgetServiceValue(0);
    setBudgetServiceDate(getTodayDateOnly());
    setBudgetServiceMode('increase');
  };

  return (
    <div className="animate-fade-in-up">
      <div className="bg-background/30 rounded-xl border border-border-color/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color/50">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              $
            </span>
            <h3 className="font-serif text-xl font-bold text-secondary">Financeiro do Projeto</h3>
          </div>
        </div>

        {/* ── Sub-navigation ── */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-border-color/30 bg-background/20">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${
                  activeSubTab === tab.id
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="p-6">
          {/* ── Tab: Visão Geral ── */}
          {activeSubTab === 'visao_geral' && (
            <div className="space-y-6 animate-fade-in-up">
              <ProjectFinanceOverviewSubTab
                project={project}
                financials={financials}
                baseContractValue={baseContractValue}
                totalValue={totalValue}
                totalPaid={totalPaid}
                totalToPay={totalToPay}
                totalAddendums={totalAddendums}
              />
            </div>
          )}

          {/* ── Tab: Pagamento ── */}
          {activeSubTab === 'pagamento' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Mini KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface rounded-xl border border-border-color p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <CashIcon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
                      Recebido
                    </p>
                    <p className="text-lg font-bold text-success tabular-nums">
                      {formatCurrency(totalPaid)}
                    </p>
                  </div>
                </div>
                <div className="bg-surface rounded-xl border border-border-color p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                    <CashIcon className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
                      A Receber
                    </p>
                    <p className="text-lg font-bold text-warning tabular-nums">
                      {formatCurrency(totalToPay)}
                    </p>
                  </div>
                </div>
                <div className="bg-surface rounded-xl border border-border-color p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                    <SettingsIcon className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
                      Aditivos
                    </p>
                    <p
                      className={`text-lg font-bold tabular-nums ${totalAddendums >= 0 ? 'text-success' : 'text-error'}`}
                    >
                      {totalAddendums >= 0 ? '+' : ''}
                      {formatCurrency(totalAddendums)}
                    </p>
                  </div>
                </div>
                <div className="bg-surface rounded-xl border border-border-color p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <CashIcon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
                      Total Contrato
                    </p>
                    <p className="text-lg font-bold text-secondary tabular-nums">
                      {formatCurrency(totalValue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transactions table (installments or lump-sum) */}
              <ProjectFinanceTransactionsSection
                project={project}
                financials={financials}
                onInstallmentChange={onInstallmentChange}
                onConfirmPayment={onConfirmPayment}
                onAddInstallment={onAddInstallment}
                onRemoveInstallment={onRemoveInstallment}
              />
            </div>
          )}

          {/* ── Tab: Contrato & Aditivos ── */}
          {activeSubTab === 'contrato' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Step 1: Contract configuration (full width) */}
              <ProjectFinanceConfigSection
                financials={financials}
                baseContractValue={baseContractValue}
                showSettings={showSettings}
                onToggleSettings={() => setShowSettings((prev) => !prev)}
                commonInputClass={commonInputClass}
                onFinancialsChange={onFinancialsChange}
                onGenerateInstallments={onGenerateInstallments}
              />

              {/* Step 2: Addendums management (full width) */}
              <ProjectFinanceAddendumsSection
                financials={financials}
                commonInputClass={commonInputClass}
                newAddendum={newAddendum}
                onNewAddendumChange={setNewAddendum}
                onAddNewAddendum={handleAddNewAddendum}
                budgetServices={budgetServices}
                selectedBudgetServiceId={selectedBudgetServiceId}
                onBudgetServiceIdChange={handleBudgetServiceChange}
                budgetServiceValue={budgetServiceValue}
                onBudgetServiceValueChange={setBudgetServiceValue}
                budgetServiceDate={budgetServiceDate}
                onBudgetServiceDateChange={setBudgetServiceDate}
                budgetServiceMode={budgetServiceMode}
                onBudgetServiceModeChange={setBudgetServiceMode}
                selectedBudgetService={selectedBudgetService}
                onAddBudgetService={handleAddBudgetService}
                onUpdateAddendumStatus={onUpdateAddendumStatus}
                onRemoveAddendum={onRemoveAddendum}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
