import { useMemo } from 'react';
import { UserCircleIcon } from '../../components/ui';
import type { Client, MarketingActivity, MarketingIdea, MarketingProfessional } from '../../types';
import { formatCurrency } from '../../utils/formatters';

type LeadSourceChartProps = {
  clients: Client[];
};

function LeadSourceChart({ clients }: LeadSourceChartProps): JSX.Element {
  const sourceData = useMemo(() => {
    const counts = clients.reduce((accumulator: Record<string, number>, client) => {
      const source = client.leadSource || 'Não informado';
      accumulator[source] = (accumulator[source] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((first, second) => second.count - first.count);
  }, [clients]);

  if (sourceData.length === 0) {
    return (
      <div className="p-4 bg-background rounded-lg text-center text-sm text-text-secondary">
        Nenhum dado de origem de lead para exibir.
      </div>
    );
  }

  const maxCount = Math.max(...sourceData.map((item) => item.count), 0);

  return (
    <div className="space-y-3">
      {sourceData.map((item) => (
        <div key={item.name} className="flex items-center gap-4 text-sm">
          <div className="w-40 font-semibold text-text-primary truncate">{item.name}</div>
          <progress
            className="progress-bar progress-track-background progress-fill-primary-50 h-4 flex-1 rounded-full"
            value={maxCount > 0 ? (item.count / maxCount) * 100 : 0}
            max={100}
          />
          <div className="w-10 text-right font-bold text-secondary">{item.count}</div>
        </div>
      ))}
    </div>
  );
}

type ConversionRateChartProps = {
  clients: Client[];
};

function ConversionRateChart({ clients }: ConversionRateChartProps): JSX.Element {
  const conversionData = useMemo(() => {
    const sourceGroups = clients.reduce(
      (accumulator: Record<string, { leads: number; converted: number }>, client) => {
        const source = client.leadSource || 'Não informado';
        if (!accumulator[source]) {
          accumulator[source] = { leads: 0, converted: 0 };
        }
        accumulator[source].leads += 1;
        if (client.projectLinks && client.projectLinks.length > 0) {
          accumulator[source].converted += 1;
        }
        return accumulator;
      },
      {},
    );

    return Object.entries(sourceGroups)
      .map(([name, data]) => ({
        name,
        rate: data.leads > 0 ? (data.converted / data.leads) * 100 : 0,
        label: `${data.converted}/${data.leads}`,
      }))
      .sort((first, second) => second.rate - first.rate);
  }, [clients]);

  if (conversionData.length === 0) {
    return (
      <div className="p-4 bg-background rounded-lg text-center text-sm text-text-secondary">
        Nenhum dado de conversão para exibir.
      </div>
    );
  }

  const maxRate = Math.max(...conversionData.map((item) => item.rate), 0);

  return (
    <div className="space-y-3">
      {conversionData.map((item) => (
        <div key={item.name} className="flex items-center gap-4 text-sm">
          <div className="w-40 font-semibold text-text-primary truncate">{item.name}</div>
          <div className="flex-1 relative">
            <progress
              className="progress-bar progress-track-background progress-fill-secondary-50 h-4 w-full rounded-full"
              value={maxRate > 0 ? (item.rate / maxRate) * 100 : 0}
              max={100}
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px] pointer-events-none">
              {item.rate.toFixed(0)}%
            </span>
          </div>
          <div className="w-16 text-right font-bold text-secondary">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

type ProfessionalCardProps = {
  professional: MarketingProfessional;
  onEdit: () => void;
};

function ProfessionalCard({ professional, onEdit }: ProfessionalCardProps): JSX.Element {
  return (
    <div
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit();
        }
      }}
      role="button"
      tabIndex={0}
      className="relative group bg-surface rounded-xl shadow-soft p-4 flex-shrink-0 w-64 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-accent transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-background rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-border-color">
          {professional.photo ? (
            <img
              src={professional.photo}
              alt={professional.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircleIcon className="text-secondary/20 w-12 h-12" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-text-primary break-words">{professional.name}</h4>
          <p className="text-xs text-text-secondary truncate">{professional.email}</p>
        </div>
      </div>
      <div className="text-right mt-2">
        {professional.billingFormat && (
          <p className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-1">
            {professional.billingFormat}
          </p>
        )}
        <p className="font-semibold text-secondary mt-1">{formatCurrency(professional.cost)}</p>
      </div>
    </div>
  );
}

type MarketingDashboardViewProps = {
  professionals: MarketingProfessional[];
  activities: MarketingActivity[];
  ideas: MarketingIdea[];
  clients: Client[];
  onEditProfessional: (professional: MarketingProfessional) => void;
};

export function MarketingDashboardView({
  professionals,
  activities,
  ideas,
  clients,
  onEditProfessional,
}: MarketingDashboardViewProps): JSX.Element {
  const pendingActivities = activities.filter((activity) => activity.status === 'Pendente');
  const totalCost = activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);

  const kpiData = {
    professionals: professionals.length,
    pendingActivities: pendingActivities.length,
    totalCost: formatCurrency(totalCost),
    ideas: ideas.length,
  };

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface rounded-xl shadow-soft p-5 text-center">
          <p className="text-4xl font-bold text-secondary">{kpiData.professionals}</p>
          <p className="text-sm font-semibold text-text-secondary mt-1">Prestadores</p>
        </div>
        <div className="bg-surface rounded-xl shadow-soft p-5 text-center">
          <p className="text-4xl font-bold text-secondary">{kpiData.pendingActivities}</p>
          <p className="text-sm font-semibold text-text-secondary mt-1">Conteúdos Pendentes</p>
        </div>
        <div className="bg-surface rounded-xl shadow-soft p-5 text-center">
          <p className="text-4xl font-bold text-secondary">{kpiData.totalCost}</p>
          <p className="text-sm font-semibold text-text-secondary mt-1">Custo Total</p>
        </div>
        <div className="bg-surface rounded-xl shadow-soft p-5 text-center">
          <p className="text-4xl font-bold text-secondary">{kpiData.ideas}</p>
          <p className="text-sm font-semibold text-text-secondary mt-1">Ideias no Banco</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-xl font-bold text-secondary">Prestadores de Serviço</h3>
        </div>
        <div className="flex gap-4 pb-4 overflow-x-auto">
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onEdit={() => onEditProfessional(professional)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-serif text-xl font-bold text-secondary mb-4">
            Origem de Leads (Clientes Convertidos)
          </h3>
          <LeadSourceChart clients={clients} />
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold text-secondary mb-4">
            Taxa de Conversão por Origem
          </h3>
          <ConversionRateChart clients={clients} />
        </div>
      </div>
    </div>
  );
}
