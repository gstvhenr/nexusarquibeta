import React, { useMemo, useState } from 'react';
import {
  getProjectBaseContractValue,
  getProjectLumpSumValue,
  getProjectTotalContractValue,
} from '@/utils/projectFinancials';
import { ProjectFinanceAddendumsSection } from './project-finance/ProjectFinanceAddendumsSection';
import { ProjectFinanceConfigSection } from './project-finance/ProjectFinanceConfigSection';
import { ProjectFinanceKPISection } from './project-finance/ProjectFinanceKPISection';
import { ProjectFinanceTransactionsSection } from './project-finance/ProjectFinanceTransactionsSection';
import type { FinanceTabProps } from './project-finance/types';

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
}) => {
  const financials = project.financials;
  const [showSettings, setShowSettings] = useState(false);

  const [newAddendum, setNewAddendum] = useState({
    description: '',
    value: 0,
    date: new Date().toISOString().split('T')[0],
    isDiscount: false,
  });

  const [selectedBudgetServiceId, setSelectedBudgetServiceId] = useState('');
  const [budgetServiceValue, setBudgetServiceValue] = useState(0);
  const [budgetServiceDate, setBudgetServiceDate] = useState(
    new Date().toISOString().split('T')[0],
  );
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
      date: new Date().toISOString().split('T')[0],
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
    setBudgetServiceDate(new Date().toISOString().split('T')[0]);
    setBudgetServiceMode('increase');
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <ProjectFinanceKPISection
        totalValue={totalValue}
        totalAddendums={totalAddendums}
        totalPaid={totalPaid}
        totalToPay={totalToPay}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
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

          <ProjectFinanceConfigSection
            financials={financials}
            baseContractValue={baseContractValue}
            showSettings={showSettings}
            onToggleSettings={() => setShowSettings((prev) => !prev)}
            commonInputClass={commonInputClass}
            onFinancialsChange={onFinancialsChange}
            onGenerateInstallments={onGenerateInstallments}
          />
        </div>

        <div className="lg:col-span-8">
          <ProjectFinanceTransactionsSection
            project={project}
            financials={financials}
            onFinancialsChange={onFinancialsChange}
            onInstallmentChange={onInstallmentChange}
            onGenerateInstallments={onGenerateInstallments}
            onConfirmPayment={onConfirmPayment}
            onAddInstallment={onAddInstallment}
            onRemoveInstallment={onRemoveInstallment}
          />
        </div>
      </div>
    </div>
  );
};
