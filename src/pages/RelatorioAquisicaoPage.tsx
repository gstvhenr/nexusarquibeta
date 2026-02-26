import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { type RelatoriosOutletContext } from './RelatoriosLayout';
import { ReportCard, StatCard, InteractiveBarChart } from '../components/relatorios';

const RelatorioAquisicaoPage: () => React.ReactNode = () => {
  const { acquisitionMetrics } = useOutletContext<RelatoriosOutletContext>();

  return (
    <section className="animate-fade-in-up">
      <h2 className="font-serif text-3xl font-bold text-text-primary mb-6">
        Aquisição de Clientes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard title="Funil de Propostas">
          <StatCard
            label="Propostas convertidas"
            value={`${acquisitionMetrics.conversionRate.toFixed(1)}%`}
          />
        </ReportCard>
        <ReportCard title="Novos Clientes">
          <StatCard label="Clientes no período" value={acquisitionMetrics.newClientsCount} />
        </ReportCard>
        <ReportCard title="Gasto com Marketing">
          <StatCard
            label="Investimento no período"
            value={formatCurrency(acquisitionMetrics.marketingSpend)}
          />
        </ReportCard>
        <ReportCard title="CAC">
          <StatCard label="Custo por aquisição" value={formatCurrency(acquisitionMetrics.cac)} />
        </ReportCard>
        <ReportCard title="Leads Convertidos por Origem" className="lg:col-span-4">
          <InteractiveBarChart data={acquisitionMetrics.leadSourceChartData} format="number" />
        </ReportCard>
      </div>
    </section>
  );
};

export default RelatorioAquisicaoPage;
