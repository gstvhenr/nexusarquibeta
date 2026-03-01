import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { type RelatoriosOutletContext } from './RelatoriosLayout';
import { ReportCard, StatCard, InteractiveBarChart } from '../../components/relatorios';

const RelatorioFinanceiroPage: () => React.ReactNode = () => {
  const { financialMetrics } = useOutletContext<RelatoriosOutletContext>();

  return (
    <section className="animate-fade-in-up">
      <h2 className="font-serif text-3xl font-bold text-text-primary mb-6">Painel Financeiro</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard title="Receita de Projetos">
          <StatCard
            label="Projetos concluídos no período"
            value={formatCurrency(financialMetrics.revenueFromProjects)}
          />
        </ReportCard>
        <ReportCard title="Receita de Comissões">
          <StatCard
            label="Comissões recebidas no período"
            value={formatCurrency(financialMetrics.revenueFromCommissions)}
          />
        </ReportCard>
        <ReportCard title="Custos Totais">
          <StatCard
            label="Compras e serviços no período"
            value={formatCurrency(financialMetrics.totalCosts)}
          />
        </ReportCard>
        <ReportCard title="Lucratividade Total">
          <StatCard
            label="Receitas - Custos"
            value={formatCurrency(financialMetrics.profitability)}
          />
        </ReportCard>
        <ReportCard title="Receita Mensal (Últimos Meses)" className="lg:col-span-4">
          <InteractiveBarChart data={financialMetrics.revenueChartData} format="currency" />
        </ReportCard>
      </div>
    </section>
  );
};

export default RelatorioFinanceiroPage;
