import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  Badge,
  BullhornIcon,
  ClockIcon,
  EmptyState,
  UserCircleIcon,
  UsersIcon,
} from '../../components/ui';
import type { Client, MarketingActivity, MarketingProfessional } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

type LeadSourceChartProps = {
  clients: Client[];
};

type MetricCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
};

type FocusStatProps = {
  label: string;
  value: string;
  hint: string;
};

type ProfessionalCardProps = {
  professional: MarketingProfessional;
  onEdit: () => void;
};

type MarketingDashboardViewProps = {
  professionals: MarketingProfessional[];
  activities: MarketingActivity[];

  clients: Client[];
  onEditProfessional: (professional: MarketingProfessional) => void;
};

function PanelShell({
  eyebrow,
  title,
  children,
  className = '',
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <section
      className={`flex min-h-0 flex-col rounded-xl border border-border-color/60 bg-background/55 p-3 ${className}`.trim()}
    >
      <div className="mb-3 shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
          {eyebrow}
        </p>
        <h3 className="mt-1 font-serif text-base font-bold text-text-primary">{title}</h3>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

function MetricCard({ title, value, icon }: MetricCardProps): JSX.Element {
  return (
    <article className="rounded-xl border border-border-color/60 bg-surface px-3 py-3 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            {title}
          </p>
          <p className="mt-1 text-xl font-bold text-text-primary">{value}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </article>
  );
}

function FocusStat({ label, value, hint }: FocusStatProps): JSX.Element {
  return (
    <div className="rounded-lg border border-border-color/60 bg-surface px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-text-primary">{value}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{hint}</p>
    </div>
  );
}

function ProfessionalCard({ professional, onEdit }: ProfessionalCardProps): JSX.Element {
  return (
    <div
      onClick={onEdit}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onEdit();
        }
      }}
      role="button"
      tabIndex={0}
      className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border-color/60 bg-surface px-3 py-2.5 transition-colors duration-150 hover:border-primary/30 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-border-color/60 bg-background">
        {professional.photo ? (
          <img
            src={professional.photo}
            alt={professional.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserCircleIcon className="h-6 w-6 text-secondary/25" />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-bold text-text-primary">{professional.name}</h4>
          <Badge variant="primary" size="sm">
            {professional.billingFormat || 'Sem formato'}
          </Badge>
        </div>
        <p className="truncate text-xs text-text-secondary">{professional.email}</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-text-primary">{formatCurrency(professional.cost)}</p>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Editar
        </span>
      </div>
    </div>
  );
}

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
      <div className="rounded-lg border border-dashed border-border-color bg-surface/70 p-4 text-center text-sm text-text-secondary">
        Nenhum dado de origem de lead para exibir.
      </div>
    );
  }

  const maxCount = Math.max(...sourceData.map((item) => item.count), 0);

  return (
    <div className="space-y-2.5">
      {sourceData.map((item) => (
        <div
          key={item.name}
          className="grid grid-cols-[minmax(0,116px)_1fr_auto] items-center gap-2.5"
        >
          <span className="truncate text-xs font-medium text-text-primary">{item.name}</span>
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }} // NOSONAR
            />
          </div>
          <span className="min-w-5 text-right text-xs font-semibold text-secondary">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function ConversionRateChart({ clients }: LeadSourceChartProps): JSX.Element {
  const conversionData = useMemo(() => {
    const sourceGroups = clients.reduce(
      (accumulator: Record<string, { leads: number; converted: number }>, client) => {
        const source = client.leadSource || 'Não informado';
        if (!accumulator[source]) {
          accumulator[source] = { leads: 0, converted: 0 };
        }
        accumulator[source].leads += 1;
        if ((client.projectLinks?.length || 0) > 0) {
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
      <div className="rounded-lg border border-dashed border-border-color bg-surface/70 p-4 text-center text-sm text-text-secondary">
        Nenhum dado de conversão para exibir.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {conversionData.map((item) => (
        <div
          key={item.name}
          className="rounded-lg border border-border-color/60 bg-surface px-3 py-2.5"
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="truncate text-xs font-semibold text-text-primary">{item.name}</span>
            <Badge variant="accent" size="sm">
              {item.label}
            </Badge>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary to-primary"
              style={{ width: `${item.rate}%` }} // NOSONAR
            />
          </div>
          <p className="mt-1.5 text-[11px] font-semibold text-text-secondary">
            {item.rate.toFixed(0)}% de conversão
          </p>
        </div>
      ))}
    </div>
  );
}

export function MarketingDashboardView({
  professionals,
  activities,
  clients,
  onEditProfessional,
}: MarketingDashboardViewProps): JSX.Element {
  const dashboardData = useMemo(() => {
    const pendingActivities = activities.filter((activity) => activity.status === 'Pendente');
    const totalCost = activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
    const convertedClients = clients.filter((client) => (client.projectLinks?.length || 0) > 0);

    const sourceCounts = clients.reduce((accumulator: Record<string, number>, client) => {
      const source = client.leadSource || 'Não informado';
      accumulator[source] = (accumulator[source] || 0) + 1;
      return accumulator;
    }, {});

    const leadingSourceEntry =
      Object.entries(sourceCounts).sort((first, second) => second[1] - first[1])[0] ?? null;

    const bestConversionEntry =
      Object.entries(
        clients.reduce(
          (accumulator: Record<string, { leads: number; converted: number }>, client) => {
            const source = client.leadSource || 'Não informado';
            if (!accumulator[source]) {
              accumulator[source] = { leads: 0, converted: 0 };
            }
            accumulator[source].leads += 1;
            if ((client.projectLinks?.length || 0) > 0) {
              accumulator[source].converted += 1;
            }
            return accumulator;
          },
          {},
        ),
      )
        .map(([source, data]) => ({
          source,
          rate: data.leads > 0 ? (data.converted / data.leads) * 100 : 0,
          label: `${data.converted}/${data.leads}`,
        }))
        .sort((first, second) => second.rate - first.rate)[0] ?? null;

    const nextActivities = pendingActivities
      .slice()
      .sort((first, second) => {
        const firstTime = first.dueDate
          ? new Date(first.dueDate).getTime()
          : Number.MAX_SAFE_INTEGER;
        const secondTime = second.dueDate
          ? new Date(second.dueDate).getTime()
          : Number.MAX_SAFE_INTEGER;
        return firstTime - secondTime;
      })
      .slice(0, 4);

    return {
      pendingActivities,
      totalCost,
      convertedClients,
      leadingSourceEntry,
      bestConversionEntry,
      nextActivities,
    };
  }, [activities, clients]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          title="Prestadores"
          value={String(professionals.length)}
          icon={<UsersIcon className="h-4 w-4" />}
        />
        <MetricCard
          title="Pendentes"
          value={String(dashboardData.pendingActivities.length)}
          icon={<ClockIcon className="h-4 w-4" />}
        />
        <MetricCard
          title="Custo Total"
          value={formatCurrency(dashboardData.totalCost)}
          icon={<BullhornIcon className="h-4 w-4" />}
        />
      </section>

      <section className="col-span-12 rounded-2xl border border-border-color/60 bg-surface p-6 shadow-soft">
        <div className="grid grid-cols-12 gap-6">
          <PanelShell
            eyebrow="Prestadores"
            title="Rede de execução"
            className="col-span-12 xl:col-span-5"
          >
            {professionals.length > 0 ? (
              <div className="grid auto-rows-min gap-3">
                {professionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onEdit={() => onEditProfessional(professional)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<UsersIcon className="mx-auto h-8 w-8" />}
                title="Nenhum prestador cadastrado"
                description="Use a ação do cabeçalho para montar a rede de apoio do marketing."
                className="h-full border-dashed bg-surface"
              />
            )}
          </PanelShell>

          <div className="col-span-12 grid grid-cols-1 gap-6 xl:col-span-3">
            <PanelShell eyebrow="Indicadores" title="Radar operacional">
              <div className="grid gap-3">
                <FocusStat
                  label="Origem líder"
                  value={dashboardData.leadingSourceEntry?.[0] || 'Sem dados'}
                  hint={
                    dashboardData.leadingSourceEntry
                      ? `${dashboardData.leadingSourceEntry[1]} lead(s) registrados`
                      : 'Cadastre a origem dos clientes para liberar a leitura.'
                  }
                />
                <FocusStat
                  label="Conversão destaque"
                  value={
                    dashboardData.bestConversionEntry
                      ? `${dashboardData.bestConversionEntry.source} · ${dashboardData.bestConversionEntry.rate.toFixed(0)}%`
                      : 'Sem dados'
                  }
                  hint={
                    dashboardData.bestConversionEntry
                      ? `${dashboardData.bestConversionEntry.label} clientes convertidos`
                      : 'Ainda não há base suficiente para ranquear canais.'
                  }
                />
                <FocusStat
                  label="Eficiência"
                  value={
                    clients.length > 0
                      ? `${Math.round((dashboardData.convertedClients.length / clients.length) * 100)}%`
                      : '0%'
                  }
                  hint={`${dashboardData.convertedClients.length} cliente(s) convertidos na base atual`}
                />
              </div>
            </PanelShell>

            <PanelShell eyebrow="Agenda" title="Próximas entregas">
              {dashboardData.nextActivities.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.nextActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-lg border border-border-color/60 bg-surface px-4 py-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Badge variant="warning" size="sm">
                          {activity.contentType}
                        </Badge>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                          {activity.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-text-primary">{activity.title}</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Entrega em {formatDate(activity.dueDate)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<ClockIcon className="mx-auto h-8 w-8" />}
                  title="Nenhum conteúdo pendente"
                  description="Quando houver publicações em aberto, elas aparecem aqui."
                  className="h-full border-dashed bg-surface"
                />
              )}
            </PanelShell>
          </div>

          <div className="col-span-12 grid grid-cols-1 gap-6 xl:col-span-4">
            <PanelShell eyebrow="Aquisição" title="Origem de Leads">
              <LeadSourceChart clients={clients} />
            </PanelShell>
            <PanelShell eyebrow="Performance" title="Taxa de Conversão">
              <ConversionRateChart clients={clients} />
            </PanelShell>
          </div>
        </div>
      </section>
    </div>
  );
}
