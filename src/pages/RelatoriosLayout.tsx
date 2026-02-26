import React, { useState, useMemo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { PageHeader } from '../components/layout';
import { useReportData } from '../hooks/useReportData';
import { generateReport, ReportFilter } from '../services/reportService';
import { NAV_LINKS } from '../constants';

// ═══════════════════════════════════════════════════════════════
// TAB DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const REPORT_TABS = [
  { path: '/relatorios/financeiro', label: 'Financeiro' },
  { path: '/relatorios/projetos', label: 'Projetos' },
  { path: '/relatorios/aquisicao', label: 'Aquisição de Clientes' },
] as const;

// ═══════════════════════════════════════════════════════════════
// OUTLET CONTEXT TYPE
// ═══════════════════════════════════════════════════════════════

export interface RelatoriosOutletContext {
  financialMetrics: ReturnType<typeof generateReport>['financialMetrics'];
  projectMetrics: ReturnType<typeof generateReport>['projectMetrics'];
  acquisitionMetrics: ReturnType<typeof generateReport>['acquisitionMetrics'];
}

// ═══════════════════════════════════════════════════════════════
// LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════════

const RelatoriosLayout: () => React.ReactNode = () => {
  const reportInput = useReportData();

  const [filter, setFilter] = useState<ReportFilter>({
    type: 'preset',
    days: 365,
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
  });

  const reportData = useMemo(() => generateReport(reportInput, filter), [reportInput, filter]);
  const { financialMetrics, projectMetrics, acquisitionMetrics } = reportData;

  const handlePresetClick = (days: number) => {
    setFilter({
      type: 'preset',
      days,
      startDate: '',
      endDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'startDate' | 'endDate',
  ) => {
    setFilter((prev) => ({
      ...prev,
      type: 'custom',
      days: 0,
      [field]: e.target.value,
    }));
  };

  const dateFilterOptions = [
    { label: 'Últimos 30 dias', value: 30 },
    { label: 'Últimos 90 dias', value: 90 },
    { label: 'Este ano', value: 365 },
    { label: 'Desde o início', value: 99999 },
  ];

  const relatoriosIcon = NAV_LINKS.find((link) => link.label === 'Relatórios')?.icon;

  const outletContext: RelatoriosOutletContext = {
    financialMetrics,
    projectMetrics,
    acquisitionMetrics,
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Relatórios" icon={relatoriosIcon}>
        <div className="flex items-center gap-4 bg-background p-1.5 rounded-lg border border-border-color">
          <div className="flex items-center gap-1">
            {dateFilterOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePresetClick(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filter.type === 'preset' && filter.days === opt.value
                    ? 'bg-primary text-primary-content'
                    : 'bg-transparent text-text-secondary hover:bg-surface'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border-l border-border-color pl-3">
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => handleDateChange(e, 'startDate')}
              className="bg-surface p-1.5 rounded-md border border-border-color text-xs text-text-primary focus:border-accent focus:ring-0"
              aria-label="Data de início"
            />
            <span className="text-text-secondary text-xs">até</span>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => handleDateChange(e, 'endDate')}
              className="bg-surface p-1.5 rounded-md border border-border-color text-xs text-text-primary focus:border-accent focus:ring-0"
              aria-label="Data de fim"
            />
          </div>
        </div>
      </PageHeader>

      {/* ── Tab Navigation ──────────────────────────────── */}
      <nav className="mt-4 mb-6" aria-label="Abas de relatórios">
        <div className="flex gap-1 border-b border-border-color/40">
          {REPORT_TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end
              className={({ isActive }) =>
                [
                  'relative px-5 py-3 text-sm font-semibold transition-colors duration-200',
                  'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-t-lg',
                  isActive ? 'text-primary' : 'text-text-secondary',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {tab.label}
                  {/* Animated underline indicator */}
                  <span
                    className={[
                      'absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full transition-all duration-300 ease-out',
                      isActive
                        ? 'bg-primary opacity-100 scale-x-100'
                        : 'bg-transparent opacity-0 scale-x-0',
                    ].join(' ')}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Active Sub-Page ──────────────────────────────── */}
      <Outlet context={outletContext} />
    </div>
  );
};

export default RelatoriosLayout;
