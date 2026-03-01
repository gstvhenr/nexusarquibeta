import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { type RelatoriosOutletContext } from './RelatoriosLayout';
import { ReportCard, StatCard, InteractiveBarChart } from '../../components/relatorios';

const RelatorioProjetosPage: () => React.ReactNode = () => {
  const { projectMetrics } = useOutletContext<RelatoriosOutletContext>();

  return (
    <section className="animate-fade-in-up">
      <h2 className="font-serif text-3xl font-bold text-text-primary mb-6">
        Performance de Projetos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard title="Visão Geral">
          <div className="space-y-4">
            <StatCard
              label="Projetos Ativos"
              value={projectMetrics.inProgress}
              subtext="Projetos atualmente em andamento"
            />
            <div className="border-t border-border-color pt-4">
              <StatCard
                label="Taxa de Conclusão"
                value={`${projectMetrics.conclusionRate.toFixed(1)}%`}
                subtext="Proporção de projetos finalizados"
              />
            </div>
          </div>
        </ReportCard>

        <ReportCard title="Valores e Médias">
          <div className="space-y-4">
            <StatCard
              label="Ticket Médio"
              value={formatCurrency(projectMetrics.averageTicket)}
              subtext="Valor médio por projeto no período"
            />
            <div className="border-t border-border-color pt-4">
              <StatCard
                label="Volume Total Contratado"
                value={formatCurrency(projectMetrics.totalProjectValue)}
                subtext="Soma dos orçamentos no período"
              />
            </div>
          </div>
        </ReportCard>

        <ReportCard title="Status dos Projetos" className="lg:col-span-1">
          <div className="h-48">
            <InteractiveBarChart data={projectMetrics.projectStatusChartData} format="number" />
          </div>
        </ReportCard>
      </div>
    </section>
  );
};

export default RelatorioProjetosPage;
