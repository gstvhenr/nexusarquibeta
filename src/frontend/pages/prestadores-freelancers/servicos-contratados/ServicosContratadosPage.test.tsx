import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { api } from '@/services/infrastructure/api';
import { createTestProject } from '@/test/factories';
import ServicosContratadosPage from './ServicosContratadosPage';

const FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

const renderPage = () =>
  render(
    <MemoryRouter future={FUTURE_FLAGS}>
      <DataProvider>
        <ServicosContratadosPage />
      </DataProvider>
    </MemoryRouter>,
  );

const seedData = (overrides: Partial<ReturnType<typeof api.getData>>) => {
  const snapshot = api.getData();
  api.replaceData({ ...snapshot, ...overrides });
};

const projectWithTasks = createTestProject({
  id: 'proj-x',
  code: 'PRJ-100',
  name: 'Projeto Principal',
  status: 'Em Andamento',
  archived: false,
  sections: [
    {
      id: 'section-1',
      name: 'Execução',
      tasks: [
        { id: 'task-1', name: 'Tarefa Delegável', completed: false, hours: 8 },
        { id: 'task-2', name: 'Tarefa Interna', completed: false, hours: 3 },
      ],
    },
  ],
});

const projectNoTasks = createTestProject({
  id: 'proj-y',
  code: 'PRJ-200',
  name: 'Projeto Sem Tarefas',
  status: 'Não Iniciado',
  archived: false,
  sections: [{ id: 'section-empty', name: 'Planejamento', tasks: [] }],
});

const freelancer = {
  id: 'freelancer-1',
  name: 'Freelancer Teste',
  email: 'freela@example.com',
  phone: '(11) 99999-0000',
  specialties: ['Renderização'],
  projects: [],
  archived: false,
};

describe('ServicosContratadosPage', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    api.clearAllData();
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
    api.clearAllData();
    vi.restoreAllMocks();
  });

  it('sorts active services by creation date and toggles archived listing', () => {
    seedData({
      projects: [projectWithTasks, projectNoTasks],
      freelancers: [freelancer],
      hiredServices: [
        {
          id: 'service-old',
          projectId: 'proj-y',
          freelancerId: 'freelancer-1',
          taskIds: [],
          cost: 900,
          deadline: '2026-03-20',
          status: 'Em Andamento',
          createdAt: '2026-03-01T10:00:00.000Z',
          archived: false,
        },
        {
          id: 'service-new',
          projectId: 'proj-x',
          freelancerId: 'freelancer-1',
          taskIds: [],
          cost: 1500,
          deadline: '2026-03-25',
          status: 'Concluído',
          createdAt: '2026-03-03T10:00:00.000Z',
          archived: false,
        },
        {
          id: 'service-archived',
          projectId: 'proj-x',
          freelancerId: 'freelancer-1',
          taskIds: [],
          cost: 600,
          deadline: '2026-03-28',
          status: 'Cancelado',
          createdAt: '2026-03-04T10:00:00.000Z',
          archived: true,
        },
      ],
    });

    renderPage();

    expect(screen.getByText('Serviços Contratados')).toBeInTheDocument();
    const newestProject = screen.getByText('Projeto Principal');
    const oldestProject = screen.getByText('Projeto Sem Tarefas');
    expect(
      newestProject.compareDocumentPosition(oldestProject) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivados' }));

    expect(screen.getByRole('button', { name: 'Ver Ativos' })).toBeInTheDocument();
    expect(screen.getByText('Projeto Principal')).toBeInTheDocument();
    expect(screen.queryByText('Projeto Sem Tarefas')).not.toBeInTheDocument();
  });

  it('validates required fields before confirming new hiring', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    seedData({
      projects: [projectWithTasks],
      freelancers: [freelancer],
      hiredServices: [],
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Contratar Serviço/i }));

    expect(screen.getByText('Contratar Novo Serviço')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar Contratação' }));

    expect(alertSpy).toHaveBeenCalledWith('Preencha todos os campos obrigatórios.');
  });

  it('creates service and propagates side-effects to finance, agenda and delegated tasks', async () => {
    seedData({
      projects: [projectWithTasks, projectNoTasks],
      freelancers: [freelancer],
      hiredServices: [],
      manualExpenses: [],
      agendaEvents: [],
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Contratar Serviço/i }));

    fireEvent.change(screen.getByLabelText('Projeto'), { target: { value: 'proj-x' } });
    fireEvent.change(screen.getByLabelText('Freelancer'), { target: { value: 'freelancer-1' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '2500' } });
    fireEvent.click(screen.getByLabelText('Tarefa Delegável'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar Contratação' }));

    expect(await screen.findByText('Projeto Principal')).toBeInTheDocument();
    expect(screen.getByText('1 selecionadas')).toBeInTheDocument();

    await waitFor(() => {
      const data = api.getData();
      const service = data.hiredServices.find(
        (item) =>
          item.projectId === 'proj-x' && item.freelancerId === 'freelancer-1' && item.cost === 2500,
      );
      expect(service).toBeDefined();

      const serviceId = service?.id || '';
      expect(
        data.manualExpenses.some(
          (expense) =>
            expense.freelancerActivityId === serviceId &&
            expense.category === 'Serviços Terceirizados' &&
            expense.description.includes('Freelancer Teste'),
        ),
      ).toBe(true);
      expect(
        data.agendaEvents.some(
          (event) =>
            event.freelancerServiceId === serviceId &&
            event.type === 'Prazo de Entrega' &&
            event.projectId === 'proj-x',
        ),
      ).toBe(true);

      const persistedTask = data.projects
        .find((project) => project.id === 'proj-x')
        ?.sections.flatMap((section) => section.tasks)
        .find((task) => task.id === 'task-1');
      expect(persistedTask?.assignee).toBe('Freelancer: Freelancer Teste');
    });
  });

  it('updates status and supports archive/unarchive flow', async () => {
    seedData({
      projects: [projectWithTasks],
      freelancers: [freelancer],
      hiredServices: [
        {
          id: 'service-active',
          projectId: 'proj-x',
          freelancerId: 'freelancer-1',
          taskIds: [],
          cost: 1200,
          deadline: '2026-03-20',
          status: 'Em Andamento',
          createdAt: '2026-03-01T10:00:00.000Z',
          archived: false,
        },
      ],
    });

    renderPage();

    fireEvent.change(screen.getByLabelText('Status do serviço'), {
      target: { value: 'Concluído' },
    });

    await waitFor(() =>
      expect(
        api.getData().hiredServices.find((service) => service.id === 'service-active')?.status,
      ).toBe('Concluído'),
    );

    fireEvent.click(screen.getByLabelText('Arquivar serviço'));
    expect(await screen.findByText('Nenhum serviço contratado encontrado.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivados' }));
    expect(await screen.findByText('Projeto Principal')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Desarquivar serviço'));
    await waitFor(() => expect(screen.queryByText('Projeto Principal')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Ver Ativos' }));
    expect(await screen.findByText('Projeto Principal')).toBeInTheDocument();
  });

  it('falls back to unknown labels when linked freelancer or project is missing', () => {
    seedData({
      projects: [projectWithTasks],
      freelancers: [freelancer],
      hiredServices: [
        {
          id: 'service-orphan',
          projectId: 'project-missing',
          freelancerId: 'freelancer-missing',
          taskIds: [],
          cost: 500,
          deadline: '2026-03-22',
          status: 'Em Andamento',
          createdAt: '2026-03-03T08:00:00.000Z',
          archived: false,
        },
      ],
    });

    renderPage();

    expect(screen.getByText('Freelancer Desconhecido')).toBeInTheDocument();
    expect(screen.getByText('Projeto Desconhecido')).toBeInTheDocument();
  });

  it('deletes linked records only when deletion is confirmed', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    seedData({
      projects: [projectWithTasks],
      freelancers: [freelancer],
      hiredServices: [
        {
          id: 'service-active',
          projectId: 'proj-x',
          freelancerId: 'freelancer-1',
          taskIds: [],
          cost: 1200,
          deadline: '2026-03-20',
          status: 'Em Andamento',
          createdAt: '2026-03-01T10:00:00.000Z',
          archived: false,
        },
      ],
      manualExpenses: [
        {
          id: 'exp-linked',
          description: 'Despesa vinculada',
          category: 'Serviços Terceirizados',
          value: 1200,
          dueDate: '2026-03-20',
          status: 'Pendente',
          isRecurring: false,
          source: 'Freelancer',
          freelancerActivityId: 'service-active',
          paymentDate: null,
        },
        {
          id: 'exp-other',
          description: 'Despesa não vinculada',
          category: 'Operacional',
          value: 50,
          dueDate: '2026-03-21',
          status: 'Pendente',
          isRecurring: false,
          source: 'Manual',
          paymentDate: null,
        },
      ],
      agendaEvents: [
        {
          id: 'evt-linked',
          title: 'Evento vinculado',
          date: '2026-03-20',
          time: '12:00',
          type: 'Prazo de Entrega',
          description: 'Descrição',
          priority: 3,
          recurrence: 'none',
          freelancerServiceId: 'service-active',
          completed: false,
        },
        {
          id: 'evt-other',
          title: 'Evento independente',
          date: '2026-03-22',
          time: '09:00',
          type: 'Reunião',
          description: 'Descrição',
          priority: 2,
          recurrence: 'none',
          completed: false,
        },
      ],
    });

    renderPage();

    fireEvent.click(screen.getByTitle('Excluir'));

    expect(confirmSpy).toHaveBeenCalled();
    expect(api.getData().hiredServices.some((service) => service.id === 'service-active')).toBe(
      true,
    );
    expect(api.getData().manualExpenses.some((expense) => expense.id === 'exp-linked')).toBe(true);
    expect(api.getData().agendaEvents.some((event) => event.id === 'evt-linked')).toBe(true);

    confirmSpy.mockReturnValueOnce(true);
    fireEvent.click(screen.getByTitle('Excluir'));

    await waitFor(() => {
      const data = api.getData();
      expect(data.hiredServices.some((service) => service.id === 'service-active')).toBe(false);
      expect(data.manualExpenses.some((expense) => expense.id === 'exp-linked')).toBe(false);
      expect(data.agendaEvents.some((event) => event.id === 'evt-linked')).toBe(false);
      expect(data.manualExpenses.some((expense) => expense.id === 'exp-other')).toBe(true);
      expect(data.agendaEvents.some((event) => event.id === 'evt-other')).toBe(true);
    });
  });
});
