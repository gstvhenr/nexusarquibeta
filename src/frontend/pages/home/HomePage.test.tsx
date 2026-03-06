import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api, type AppData } from '@/services/infrastructure/api';
import { createTestProject } from '@/test/factories';
import type { AgendaEvent, MarketingActivity, Proposal } from '@/types';
import HomePage from './HomePage';

const FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

const toIsoDate = (date: Date): string => {
  const clone = new Date(date);
  clone.setHours(12, 0, 0, 0);
  return clone.toISOString().slice(0, 10);
};

const dateOffset = (daysFromToday: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return toIsoDate(date);
};

const createProposal = (overrides: Partial<Proposal> = {}): Proposal => ({
  id: 'proposal-1',
  code: 'PROP-001',
  name: 'Proposta Residencial',
  date: dateOffset(-12),
  status: 'Pendente',
  sections: [],
  discount: 0,
  subtotal: 8000,
  total: 8000,
  archived: false,
  ...overrides,
});

const createMarketingActivity = (
  overrides: Partial<MarketingActivity> = {},
): MarketingActivity => ({
  id: 'marketing-1',
  title: 'Conteudo editorial',
  status: 'Pendente',
  contentType: 'Post (Instagram)',
  dueDate: dateOffset(3),
  responsibleId: 'professional-1',
  ...overrides,
});

const createAgendaEvent = (overrides: Partial<AgendaEvent> = {}): AgendaEvent => ({
  id: 'event-1',
  title: 'Reuniao de alinhamento',
  date: dateOffset(1),
  time: '09:00',
  type: 'Reunião com Cliente',
  priority: 3,
  recurrence: 'none',
  completed: false,
  ...overrides,
});

const seedData = (overrides: Partial<AppData>): void => {
  const snapshot = api.getData();
  api.replaceData({
    ...snapshot,
    ...overrides,
  });
};

const ProjectRouteProbe = () => {
  const { projectId } = useParams<{ projectId: string }>();
  return <p>{`ROUTE_PROJETO:${projectId}`}</p>;
};

const renderHomePage = () =>
  render(
    <MemoryRouter initialEntries={['/']} future={FUTURE_FLAGS}>
      <DataProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projetos" element={<p>ROUTE_PROJETOS</p>} />
          <Route path="/projetos/:projectId" element={<ProjectRouteProbe />} />
          <Route path="/propostas" element={<p>ROUTE_PROPOSTAS</p>} />
          <Route path="/agenda" element={<p>ROUTE_AGENDA</p>} />
          <Route path="/gestao-marketing" element={<p>ROUTE_GESTAO_MARKETING</p>} />
          <Route path="/financeiro/recebiveis" element={<p>ROUTE_FINANCEIRO_RECEBIVEIS</p>} />
        </Routes>
      </DataProvider>
    </MemoryRouter>,
  );

let modalRoot: HTMLDivElement;

beforeEach(() => {
  api.clearAllData();
  modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'modal-root');
  document.body.appendChild(modalRoot);
});

afterEach(() => {
  cleanup();
  api.clearAllData();
  vi.useRealTimers();
  if (modalRoot && document.body.contains(modalRoot)) {
    document.body.removeChild(modalRoot);
  }
});

describe('HomePage — Excellence Integration', () => {
  it.each([
    ['morning', '2026-03-04T09:00:00.000Z', 'Bom dia, Rafael'],
    ['afternoon', '2026-03-04T16:00:00.000Z', 'Boa tarde, Rafael'],
    ['night', '2026-03-04T21:00:00.000Z', 'Boa noite, Rafael'],
  ])('renders greeting for %s period', async (_, nowIso, expectedGreeting) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(nowIso));

    seedData({
      projects: [],
      proposals: [],
      marketingActivities: [],
      agendaEvents: [],
      dismissedFocusItems: [],
    });

    renderHomePage();

    expect(screen.getByRole('heading', { name: expectedGreeting })).toBeInTheDocument();
  });

  it('shows all-clear states and supports KPI keyboard navigation', async () => {
    seedData({
      projects: [],
      proposals: [],
      marketingActivities: [],
      agendaEvents: [],
      dismissedFocusItems: [],
    });

    renderHomePage();

    expect(await screen.findByText('Tudo sob controle!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Rever dispensados' })).not.toBeInTheDocument();
    expect(screen.getByText('Agenda livre para os próximos dias.')).toBeInTheDocument();

    const proposalsCard = screen.getByRole('button', { name: /Propostas/i });
    fireEvent.keyDown(proposalsCard, { key: ' ' });

    expect(await screen.findByText('ROUTE_PROPOSTAS')).toBeInTheDocument();
  });

  it('navigates to receivables from critical alert using keyboard', async () => {
    const overdueProject = createTestProject({
      id: 'proj-overdue',
      name: 'Projeto Critico',
      status: 'Em Andamento',
      deadline: dateOffset(20),
      sections: [],
      financials: {
        paymentType: 'vista',
        lumpSumValue: 4200,
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: dateOffset(-2),
      },
    });

    seedData({
      projects: [overdueProject],
      proposals: [],
      marketingActivities: [],
      agendaEvents: [],
      dismissedFocusItems: [],
    });

    renderHomePage();

    const criticalAlert = await screen.findByRole('button', {
      name: /FINANCEIRO URGENTE/i,
    });
    fireEvent.keyDown(criticalAlert, { key: 'Enter' });
    expect(await screen.findByText('ROUTE_FINANCEIRO_RECEBIVEIS')).toBeInTheDocument();
  });

  it('navigates to receivables from critical alert using click', async () => {
    const overdueProject = createTestProject({
      id: 'proj-overdue-click',
      name: 'Projeto Critico Click',
      status: 'Em Andamento',
      deadline: dateOffset(20),
      sections: [],
      financials: {
        paymentType: 'vista',
        lumpSumValue: 4200,
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: dateOffset(-2),
      },
    });

    seedData({
      projects: [overdueProject],
      proposals: [],
      marketingActivities: [],
      agendaEvents: [],
      dismissedFocusItems: [],
    });

    renderHomePage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /FINANCEIRO URGENTE/i,
      }),
    );
    expect(await screen.findByText('ROUTE_FINANCEIRO_RECEBIVEIS')).toBeInTheDocument();
  });

  it('dismisses and restores focus alerts through system state', async () => {
    const overdueProject = createTestProject({
      id: 'proj-alert',
      name: 'Projeto com Alerta',
      status: 'Em Andamento',
      deadline: dateOffset(10),
      sections: [],
      financials: {
        paymentType: 'vista',
        lumpSumValue: 3000,
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: dateOffset(-1),
      },
    });

    seedData({
      projects: [overdueProject],
      proposals: [],
      marketingActivities: [],
      agendaEvents: [],
      dismissedFocusItems: [],
    });

    renderHomePage();

    fireEvent.click(await screen.findByRole('button', { name: 'Dispensar' }));

    expect(await screen.findByText('Tudo sob controle!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rever dispensados' })).toBeInTheDocument();

    await waitFor(() => {
      expect(api.getData().dismissedFocusItems).toContain('payment_overdue_lump_proj-alert');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Rever dispensados' }));

    expect(await screen.findByText('FINANCEIRO URGENTE')).toBeInTheDocument();
    await waitFor(() => {
      expect(api.getData().dismissedFocusItems).toEqual([]);
    });
  });

  it('renders active projects with rounded progress and supports project navigation', async () => {
    const project = createTestProject({
      id: 'proj-nav',
      name: 'Projeto Navegavel',
      clientName: 'Cliente Norte',
      status: 'Em Andamento',
      deadline: dateOffset(2),
      sections: [
        {
          id: 'section-1',
          name: 'Etapa',
          tasks: [
            { id: 'task-1', name: 'Levantamento', completed: true, hours: 2, status: 'done' },
            { id: 'task-2', name: 'Estudo', completed: false, hours: 2, status: 'todo' },
            { id: 'task-3', name: 'Proposta', completed: false, hours: 2, status: 'todo' },
          ],
        },
      ],
      financials: {
        paymentType: 'vista',
        lumpSumValue: 10000,
        lumpSumStatus: 'Em aberto',
        lumpSumDueDate: dateOffset(25),
      },
    });

    seedData({
      projects: [project],
      proposals: [createProposal()],
      marketingActivities: [],
      agendaEvents: [],
      dismissedFocusItems: ['deadline_proj-nav'],
    });

    renderHomePage();

    expect(await screen.findByRole('heading', { name: 'Projeto Navegavel' })).toBeInTheDocument();
    expect(screen.getByText('Cliente Norte')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();

    const projectHeading = screen.getByRole('heading', { name: 'Projeto Navegavel' });
    const projectCard = projectHeading.closest('[role="button"]');
    if (!projectCard) {
      throw new Error('Project card not found');
    }

    fireEvent.keyDown(projectCard, { key: 'Enter' });
    expect(await screen.findByText('ROUTE_PROJETO:proj-nav')).toBeInTheDocument();
  });

  it('navigates via "Ver Todos" and project-empty CTA', async () => {
    seedData({
      projects: [
        createTestProject({
          id: 'proj-paused',
          name: 'Projeto Pausado',
          status: 'Pausado',
          deadline: null,
          sections: [],
        }),
      ],
      proposals: [createProposal()],
      marketingActivities: [],
      agendaEvents: [],
      dismissedFocusItems: [],
    });

    renderHomePage();

    expect(await screen.findByText('Nenhum projeto em andamento no momento.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver Todos' }));
    expect(await screen.findByText('ROUTE_PROJETOS')).toBeInTheDocument();

    seedData({
      projects: [],
      proposals: [createProposal()],
      marketingActivities: [],
      agendaEvents: [],
      dismissedFocusItems: [],
    });
    renderHomePage();

    fireEvent.click(await screen.findByRole('button', { name: 'Converter uma proposta' }));
    expect(await screen.findByText('ROUTE_PROPOSTAS')).toBeInTheDocument();
  });

  it('renders upcoming events and agenda navigation', async () => {
    seedData({
      projects: [],
      proposals: [],
      marketingActivities: [],
      agendaEvents: [
        createAgendaEvent({
          id: 'agenda-1',
          title: 'Reuniao de kickoff',
          date: dateOffset(1),
          time: '09:00',
        }),
        createAgendaEvent({
          id: 'agenda-2',
          title: 'Visita tecnica',
          date: dateOffset(2),
          time: '14:30',
        }),
      ],
      dismissedFocusItems: [],
    });

    renderHomePage();

    expect(await screen.findByText('Reuniao de kickoff')).toBeInTheDocument();
    expect(screen.getByText('Visita tecnica')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.queryByText('Agenda livre para os próximos dias.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Agenda Completa' }));
    expect(await screen.findByText('ROUTE_AGENDA')).toBeInTheDocument();
  });

  it('limits pending marketing list to top 3 tasks and navigates via marketing KPI', async () => {
    seedData({
      projects: [],
      proposals: [],
      marketingActivities: [
        createMarketingActivity({
          id: 'mkt-1',
          title: 'Story de bastidores',
          dueDate: dateOffset(1),
        }),
        createMarketingActivity({
          id: 'mkt-2',
          title: 'Carrossel de projeto',
          dueDate: dateOffset(2),
        }),
        createMarketingActivity({ id: 'mkt-3', title: 'Video de obra', dueDate: dateOffset(3) }),
        createMarketingActivity({
          id: 'mkt-4',
          title: 'Post de depoimento',
          dueDate: dateOffset(4),
        }),
      ],
      agendaEvents: [],
      dismissedFocusItems: [],
    });

    renderHomePage();

    expect(await screen.findByText('Marketing Pendente')).toBeInTheDocument();
    expect(screen.getByText('Story de bastidores')).toBeInTheDocument();
    expect(screen.getByText('Carrossel de projeto')).toBeInTheDocument();
    expect(screen.getByText('Video de obra')).toBeInTheDocument();
    expect(screen.queryByText('Post de depoimento')).not.toBeInTheDocument();

    const marketingSubtext = screen.getByText('Tarefas pendentes');
    const marketingCard = marketingSubtext.closest('[role="button"]');
    if (!marketingCard) {
      throw new Error('Marketing KPI card not found');
    }

    fireEvent.click(marketingCard);
    expect(await screen.findByText('ROUTE_GESTAO_MARKETING')).toBeInTheDocument();
  });
});
