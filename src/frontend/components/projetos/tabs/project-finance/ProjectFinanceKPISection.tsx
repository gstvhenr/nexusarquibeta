import { CashIcon, CheckCircleIcon, ClockIcon, PlusIcon } from '../../../ui/icons';
import { formatCurrency } from '../../../../utils/formatters';
import { FinancialKPICard } from './FinancialKPICard';

interface ProjectFinanceKPISectionProps {
  totalValue: number;
  totalAddendums: number;
  totalPaid: number;
  totalToPay: number;
}

export const ProjectFinanceKPISection = ({
  totalValue,
  totalAddendums,
  totalPaid,
  totalToPay,
}: ProjectFinanceKPISectionProps) => (
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
);
