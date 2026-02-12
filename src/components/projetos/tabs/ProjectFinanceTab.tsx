import React, { useMemo, useState } from 'react';
import {
  CashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  AlertIcon,
} from '../../ui/icons';
import { Project, Installment, ContractAddendum, ContractAddendumStatus } from '../../../types';
import { formatCurrency, formatDate, parseDateString } from '../../../utils/formatters';
import { getStatusSelectionOptions } from '../../../utils/addendumWorkflow';
import {
  getProjectBaseContractValue,
  getProjectLumpSumValue,
  getProjectTotalContractValue,
} from '../../../utils/projectFinancials';
import { PAYMENT_STATUS_DOT_COLORS } from '../../../constants';

type BudgetServiceOption = {
  id: string;
  sectionTitle: string;
  description: string;
  suggestedValue: number;
  unit: string;
};

interface FinanceTabProps {
  project: Project;
  budgetServices: BudgetServiceOption[];
  onFinancialsChange: (field: keyof Project['financials'], value: any) => void;
  onInstallmentChange: (id: string, field: keyof Installment, value: any) => void;
  onGenerateInstallments: () => void;
  onConfirmPayment: (payment: { type: 'lump' } | { type: 'installment'; id: string }) => void;
  onAddInstallment: () => void;
  onRemoveInstallment: (id: string) => void;
  onAddAddendum: (addendum: Omit<ContractAddendum, 'id' | 'status'>) => void;
  onUpdateAddendumStatus: (id: string, status: ContractAddendum['status']) => void;
  onRemoveAddendum: (id: string) => void;
}

const FinancialKPICard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}> = ({ title, value, icon, colorClass, bgClass }) => (
  <div className="bg-surface p-5 rounded-2xl shadow-sm border border-border-color flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-full ${bgClass} ${colorClass}`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">{title}</p>
      <p className={`text-2xl font-bold font-sans ${colorClass}`}>{value}</p>
    </div>
  </div>
);

export const ProjectFinanceTab: React.FC<FinanceTabProps> = ({
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

  // Addendum Form State
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
        .filter((i) => i.paid)
        .reduce((sum, i) => sum + i.value, 0);
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

  const getInstallmentStatus = (
    inst: Installment,
  ): { text: string; color: string; dotColor: string } => {
    if (inst.paid)
      return { text: 'Pago', color: 'text-success', dotColor: PAYMENT_STATUS_DOT_COLORS['Em dia'] };
    const dueDate = parseDateString(inst.dueDate);
    if (dueDate && dueDate < new Date(new Date().setHours(0, 0, 0, 0)))
      return {
        text: 'Atrasado',
        color: 'text-error',
        dotColor: PAYMENT_STATUS_DOT_COLORS['Em Atraso'],
      };
    return {
      text: 'Pendente',
      color: 'text-warning',
      dotColor: PAYMENT_STATUS_DOT_COLORS['Pendente'],
    };
  };

  const handleAddNewAddendum = () => {
    const absoluteValue = Math.abs(newAddendum.value);
    if (!newAddendum.description.trim() || !Number.isFinite(absoluteValue) || absoluteValue <= 0)
      return;

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

  const getAuditTrailActionText = (
    entry: NonNullable<Project['financials']['addendumAuditTrail']>[number],
  ) => {
    if (entry.action === 'created') return 'Criado';
    if (entry.action === 'deleted') return 'Removido';
    return `Status: ${entry.fromStatus} -> ${entry.toStatus}`;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <FinancialKPICard
          title="Total do Projeto"
          value={formatCurrency(totalValue)}
          icon={<CashIcon className="w-6 h-6" />}
          colorClass="text-secondary"
          bgClass="bg-secondary/10"
        />
        <FinancialKPICard
          title="Aditivos"
          value={formatCurrency(totalAddendums)}
          icon={<PlusIcon className="w-6 h-6" />}
          colorClass="text-info"
          bgClass="bg-info/10"
        />
        <FinancialKPICard
          title="Recebido"
          value={formatCurrency(totalPaid)}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          colorClass="text-success"
          bgClass="bg-success/10"
        />
        <FinancialKPICard
          title="A Receber"
          value={formatCurrency(totalToPay)}
          icon={<ClockIcon className="w-6 h-6" />}
          colorClass="text-warning"
          bgClass="bg-warning/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls & Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Addendums Section */}
          <div className="bg-surface p-6 rounded-2xl shadow-soft border border-border-color">
            <h4 className="font-serif text-lg font-bold text-secondary mb-4 border-b border-border-color pb-2 flex items-center gap-2">
              Termos Aditivos
            </h4>

            <div className="space-y-3 mb-4">
              {(financials.addendums || []).map((ad) => (
                <div
                  key={ad.id}
                  className="p-3 bg-background rounded-lg border border-border-color text-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-text-primary">{ad.description}</span>
                    <button
                      onClick={() => onRemoveAddendum(ad.id)}
                      className="text-text-secondary hover:text-error"
                      aria-label="Remover aditivo"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-xs text-text-secondary">
                    <span>{formatDate(ad.date)}</span>
                    <span
                      className={`font-bold ${ad.value < 0 ? 'text-error' : 'text-text-primary'}`}
                    >
                      {formatCurrency(ad.value)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <select
                      value={ad.status}
                      onChange={(e) =>
                        onUpdateAddendumStatus(ad.id, e.target.value as ContractAddendumStatus)
                      }
                      className="text-xs bg-surface border border-border-color rounded px-1 py-0.5"
                      aria-label="Status do aditivo"
                    >
                      {getStatusSelectionOptions(ad.status).map((status) => (
                        <option key={`${ad.id}_${status}`} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {(ad.status === 'Aprovado' || ad.status === 'Faturado') && (
                      <span className="text-[10px] text-success font-bold bg-success/10 px-1 rounded">
                        Incluído no Total
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {(financials.addendums || []).length === 0 && (
                <p className="text-xs text-text-secondary text-center py-2">
                  Nenhum aditivo registrado.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-border-color/50">
              <p className="text-xs font-bold text-text-secondary uppercase mb-2">Novo Aditivo</p>
              <input
                type="text"
                placeholder="Descrição (ex: Marcenaria Extra)"
                value={newAddendum.description}
                onChange={(e) => setNewAddendum({ ...newAddendum, description: e.target.value })}
                className={`${commonInputClass} mb-2`}
                aria-label="Descrição do aditivo"
              />
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Valor"
                  value={newAddendum.value || ''}
                  onChange={(e) => {
                    const parsedValue = Number(e.target.value);
                    setNewAddendum({
                      ...newAddendum,
                      value: Number.isFinite(parsedValue) ? parsedValue : 0,
                    });
                  }}
                  className={commonInputClass}
                  aria-label="Valor do aditivo"
                />
                <input
                  type="date"
                  value={newAddendum.date}
                  onChange={(e) => setNewAddendum({ ...newAddendum, date: e.target.value })}
                  className={commonInputClass}
                  aria-label="Data do aditivo"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-text-secondary mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddendum.isDiscount}
                  onChange={(e) => setNewAddendum({ ...newAddendum, isDiscount: e.target.checked })}
                  className="rounded accent-primary"
                />
                Marcar como desconto (valor negativo)
              </label>
              <button
                onClick={handleAddNewAddendum}
                className="w-full bg-primary text-primary-content text-xs font-bold py-2 rounded hover:bg-primary-focus transition-colors"
              >
                Adicionar Aditivo
              </button>
              <p className="text-[11px] text-text-secondary mt-2">
                Fluxo: Rascunho -&gt; Pendente -&gt; Aprovado -&gt; Faturado. Rejeitado encerra ou
                volta para Rascunho.
              </p>
              <p className="text-[11px] text-text-secondary mt-1">
                Aditivos aprovados/faturados com valor negativo funcionam como desconto no total do
                projeto.
              </p>
            </div>

            <div className="pt-3 border-t border-border-color/50 mt-3">
              <p className="text-xs font-bold text-text-secondary uppercase mb-2">
                Adicionar Servico de Orcamentos
              </p>
              <select
                value={selectedBudgetServiceId}
                onChange={(e) => handleBudgetServiceChange(e.target.value)}
                className={`${commonInputClass} mb-2`}
                aria-label="Selecionar servico de orcamentos"
                disabled={budgetServices.length === 0}
              >
                <option value="">-- Selecione um servico --</option>
                {budgetServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.sectionTitle} - {service.description}
                  </option>
                ))}
              </select>
              {budgetServices.length === 0 && (
                <p className="text-[11px] text-text-secondary mb-2">
                  Nenhum servico disponivel no template de Orcamentos.
                </p>
              )}
              <div className="flex gap-2 mb-2">
                <select
                  value={budgetServiceMode}
                  onChange={(e) => setBudgetServiceMode(e.target.value as 'increase' | 'discount')}
                  className={commonInputClass}
                  aria-label="Tipo de ajuste do servico"
                >
                  <option value="increase">Acrescimo</option>
                  <option value="discount">Desconto</option>
                </select>
                <input
                  type="number"
                  placeholder="Valor"
                  value={budgetServiceValue || ''}
                  onChange={(e) => {
                    const parsedValue = Number(e.target.value);
                    setBudgetServiceValue(Number.isFinite(parsedValue) ? parsedValue : 0);
                  }}
                  className={commonInputClass}
                  aria-label="Valor do servico"
                />
                <input
                  type="date"
                  value={budgetServiceDate}
                  onChange={(e) => setBudgetServiceDate(e.target.value)}
                  className={commonInputClass}
                  aria-label="Data do servico"
                />
              </div>
              <button
                onClick={handleAddBudgetService}
                className="w-full bg-secondary text-secondary-content text-xs font-bold py-2 rounded hover:bg-secondary-focus transition-colors"
                disabled={!selectedBudgetService}
              >
                Adicionar Servico ao Projeto
              </button>
            </div>

            {(financials.addendumAuditTrail || []).length > 0 && (
              <div className="mt-4 pt-3 border-t border-border-color/50">
                <p className="text-xs font-bold text-text-secondary uppercase mb-2">
                  Histórico do Workflow
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {financials.addendumAuditTrail!.slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2 rounded bg-surface border border-border-color/60"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-text-primary">
                          {entry.description}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          {new Date(entry.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1">
                        {getAuditTrailActionText(entry)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-surface p-6 rounded-2xl shadow-soft border border-border-color">
            <h4 className="font-serif text-lg font-bold text-secondary mb-4 border-b border-border-color pb-2">
              Configuração Base
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Tipo de Pagamento
                </label>
                <div className="flex bg-background rounded-lg p-1 border border-border-color">
                  <button
                    onClick={() => onFinancialsChange('paymentType', 'vista')}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${financials.paymentType === 'vista' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    À Vista
                  </button>
                  <button
                    onClick={() => onFinancialsChange('paymentType', 'parcelado')}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${financials.paymentType === 'parcelado' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    Parcelado
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Valor Base do Contrato
                </label>
                <input
                  type="number"
                  value={financials.baseContractValue ?? ''}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      onFinancialsChange('baseContractValue', undefined);
                      return;
                    }
                    const parsedValue = Number(e.target.value);
                    onFinancialsChange(
                      'baseContractValue',
                      Number.isFinite(parsedValue) ? parsedValue : undefined,
                    );
                  }}
                  className={commonInputClass}
                  placeholder={formatCurrency(baseContractValue)}
                  aria-label="Valor base do contrato"
                />
              </div>

              {financials.paymentType === 'parcelado' && (
                <div className="pt-2 border-t border-border-color mt-2">
                  <button
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-sm text-primary font-semibold hover:underline flex items-center justify-between w-full"
                  >
                    <span>Recalcular Parcelas (Base)</span>
                    <span className="text-xs">{showSettings ? '▲' : '▼'}</span>
                  </button>

                  {showSettings && (
                    <div className="mt-3 space-y-3 bg-background/50 p-3 rounded-lg text-sm animate-fade-in-up">
                      <div>
                        <label className="block text-xs font-medium mb-1">Nº Parcelas</label>
                        <input
                          type="number"
                          value={financials.numberOfInstallments || ''}
                          onChange={(e) =>
                            onFinancialsChange('numberOfInstallments', parseInt(e.target.value))
                          }
                          className={commonInputClass}
                          aria-label="Número de Parcelas"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Dia Vencimento</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={financials.installmentsPaymentDay || ''}
                          onChange={(e) =>
                            onFinancialsChange('installmentsPaymentDay', parseInt(e.target.value))
                          }
                          className={commonInputClass}
                          aria-label="Dia do Vencimento"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="interest"
                          type="checkbox"
                          checked={financials.installmentsInterestEnabled}
                          onChange={(e) =>
                            onFinancialsChange('installmentsInterestEnabled', e.target.checked)
                          }
                          className="rounded accent-primary"
                        />
                        <label htmlFor="interest">Aplicar Juros (%)</label>
                      </div>
                      {financials.installmentsInterestEnabled && (
                        <input
                          type="number"
                          value={financials.installmentsInterestRate || ''}
                          onChange={(e) =>
                            onFinancialsChange(
                              'installmentsInterestRate',
                              parseFloat(e.target.value),
                            )
                          }
                          className={commonInputClass}
                          placeholder="Taxa %"
                          aria-label="Taxa de Juros (%)"
                        />
                      )}

                      <button
                        type="button"
                        onClick={onGenerateInstallments}
                        className="w-full px-3 py-2 rounded-lg font-semibold text-xs bg-secondary text-secondary-content hover:bg-secondary-focus mt-2"
                      >
                        Recalcular (Substitui Existentes)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Transactions List */}
        <div className="lg:col-span-8">
          <div className="bg-surface rounded-2xl shadow-soft border border-border-color overflow-hidden">
            <div className="p-5 border-b border-border-color bg-background/30 flex justify-between items-center">
              <h4 className="font-serif text-lg font-bold text-secondary">
                {financials.paymentType === 'vista' ? 'Pagamento Único' : 'Cronograma Financeiro'}
              </h4>
              {financials.paymentType === 'parcelado' && (
                <button
                  onClick={onAddInstallment}
                  className="text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                >
                  <PlusIcon className="w-3 h-3" /> Nova Parcela
                </button>
              )}
            </div>

            {financials.paymentType === 'vista' ? (
              <div className="p-6">
                <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border-color">
                  <div className="space-y-1">
                    <p className="font-bold text-text-primary text-lg">Pagamento à Vista</p>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" /> Vencimento:{' '}
                        <input
                          type="date"
                          value={financials.lumpSumDueDate?.split('T')[0] || ''}
                          onChange={(e) =>
                            onFinancialsChange('lumpSumDueDate', e.target.value || null)
                          }
                          className="bg-transparent border-none p-0 text-sm focus:ring-0 text-text-primary font-medium cursor-pointer"
                          aria-label="Data de Vencimento"
                        />
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold font-sans text-secondary">
                      {formatCurrency(getProjectLumpSumValue(project))}
                    </p>
                    {financials.lumpSumStatus === 'Pago' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold">
                        <CheckCircleIcon className="w-4 h-4" /> Pago
                      </span>
                    ) : (
                      <button
                        onClick={() => onConfirmPayment({ type: 'lump' })}
                        className="px-4 py-1.5 bg-primary text-primary-content rounded-lg text-sm font-semibold hover:bg-primary-focus transition-colors shadow-sm"
                      >
                        Confirmar Recebimento
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-background/50 text-xs text-text-secondary uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3 w-16 text-center">#</th>
                      <th className="px-6 py-3">Descrição/Nota</th>
                      <th className="px-6 py-3">Vencimento</th>
                      <th className="px-6 py-3 text-right">Valor</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color/50">
                    {(financials.installments || []).map((inst) => {
                      const status = getInstallmentStatus(inst);
                      return (
                        <tr
                          key={inst.id}
                          className="hover:bg-background/30 transition-colors group"
                        >
                          <td className="px-6 py-4 text-center font-medium text-text-secondary">
                            {inst.number}
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={inst.description || ''}
                              onChange={(e) =>
                                onInstallmentChange(inst.id, 'description', e.target.value)
                              }
                              className="bg-transparent border-none p-0 text-sm text-text-primary focus:ring-0 w-full placeholder-text-secondary/50"
                              placeholder="Parcela Regular"
                              aria-label="Descrição da Parcela"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="date"
                              value={inst.dueDate.split('T')[0]}
                              onChange={(e) =>
                                onInstallmentChange(inst.id, 'dueDate', e.target.value)
                              }
                              className="bg-transparent border-none p-0 text-sm text-text-primary focus:ring-0 font-medium w-32 cursor-pointer"
                              aria-label="Data de Vencimento"
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <input
                              type="number"
                              value={inst.value}
                              onChange={(e) =>
                                onInstallmentChange(inst.id, 'value', parseFloat(e.target.value))
                              }
                              className="bg-transparent border-none p-0 text-sm text-right font-bold text-secondary focus:ring-0 w-24"
                              aria-label="Valor da Parcela"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-opacity-10 border border-opacity-20 ${status.color.replace('text-', 'bg-').replace('text-', 'border-')} ${status.color}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}
                              ></span>{' '}
                              {status.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            {!inst.paid ? (
                              <>
                                <button
                                  onClick={() =>
                                    onConfirmPayment({ type: 'installment', id: inst.id })
                                  }
                                  className="text-primary hover:text-primary-focus font-semibold text-xs border border-primary/30 px-3 py-1 rounded hover:bg-primary/5 transition-colors"
                                >
                                  Receber
                                </button>
                                <button
                                  onClick={() => onRemoveInstallment(inst.id)}
                                  className="p-1 text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                                  aria-label="Remover parcela"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-text-secondary italic">
                                Pago em {formatDate(inst.paymentDate)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {(financials.installments || []).length === 0 && (
                  <div className="p-8 text-center text-text-secondary">
                    <p>Nenhuma parcela gerada.</p>
                    <button
                      onClick={onGenerateInstallments}
                      className="mt-2 text-primary font-semibold hover:underline"
                    >
                      Gerar Agora
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
