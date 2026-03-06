import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataProvider } from '@/context/DataContext';
import type { AppData } from '@/services/infrastructure/api';
import type { AgendaEvent } from '@/types';
import TarefasPage from './TarefasPage';

const { getDataMock, updateDataMock } = vi.hoisted(() => ({
  getDataMock: vi.fn<() => AppData>(),
  updateDataMock: vi.fn(),
}));

vi.mock('../../../services/infrastructure/api', () => ({
  api: {
    getData: getDataMock,
    updateData: updateDataMock,
    replaceData: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    reserveGlobalIdentifier: vi.fn().mockResolvedValue(2501),
    importClients: vi.fn(),
    clearAllData: vi.fn(),
  },
}));

const createDocumentStorage = (): AppData['documentStorage'] => ({
  personal: {
    id: 'personal-root',
    name: 'Meus Documentos',
    type: 'folder',
    children: [],
    dateAdded: '2026-03-03T10:00:00.000Z',
    dateModified: '2026-03-03T10:00:00.000Z',
  },
  projects: {
    id: 'projects-root',
    name: 'Documentos de Projetos',
    type: 'folder',
    children: [],
    dateAdded: '2026-03-03T10:00:00.000Z',
    dateModified: '2026-03-03T10:00:00.000Z',
  },
});

const createAppData = (overrides: Partial<AppData> = {}): AppData => ({
  projects: [],
  proposals: [],
  clients: [],
  documentStorage: createDocumentStorage(),
  suppliers: [],
  products: [],
  supplierProductPrices: [],
  quotations: [],
  commissions: [],
  marketingProfessionals: [],
  marketingActivities: [],
  marketingIdeas: [],
  socialNetworks: [],
  freelancers: [],
  agendaEvents: [],
  manualExpenses: [],
  manualIncomes: [],
  customBudgetTemplate: null,
  globalIdentifierCounter: 2500,
  dismissedFocusItems: [],
  acceptedPaymentMethods: [],
  hiredServices: [],
  prospects: [],
  contractDeadlines: {
    defaultPreliminarDeadlineDays: 7,
    defaultExecutiveDeadlineDays: 30,
  },
  cashBoxExpenses: [],
  cashBoxCredits: [],
  reminders: [],
  ...overrides,
});

const createTask = (overrides: Partial<AgendaEvent> = {}): AgendaEvent => ({
  id: 'task-1',
  title: 'Tarefa',
  date: '2026-03-10',
  time: '10:00',
  type: 'Desenvolvimento de Projeto',
  priority: 3,
  recurrence: 'none',
  completed: false,
  kanbanStatus: 'todo',
  archived: false,
  ...overrides,
});

function ensureModalRoot(): HTMLDivElement {
  const existing = document.getElementById('modal-root');
  if (existing) return existing as HTMLDivElement;
  const el = document.createElement('div');
  el.id = 'modal-root';
  document.body.appendChild(el);
  return el;
}

function renderPage(appDataOverride: Partial<AppData> = {}): void {
  getDataMock.mockReturnValue(createAppData(appDataOverride));
  render(
    <DataProvider>
      <TarefasPage />
    </DataProvider>,
  );
}

describe('TarefasPage', () => {
  beforeEach(() => {
    ensureModalRoot();
    updateDataMock.mockClear();
  });

  afterEach(() => {
    cleanup();
    getDataMock.mockReset();
    updateDataMock.mockReset();
    document.getElementById('modal-root')?.remove();
  });

  describe('kanban board structure', () => {
    it('renders all four kanban column titles', () => {
      // Arrange / Act
      renderPage();

      // Assert
      expect(screen.getByText('A Fazer')).toBeInTheDocument();
      expect(screen.getByText('Em Andamento')).toBeInTheDocument();
      expect(screen.getByText('Aguardando Retorno')).toBeInTheDocument();
      expect(screen.getByText('Concluído')).toBeInTheDocument();
    });

    it('renders tasks in their correct kanban column', () => {
      // Arrange
      renderPage({
        agendaEvents: [
          createTask({ id: 'todo-1', title: 'Tarefa A Fazer', kanbanStatus: 'todo' }),
          createTask({ id: 'in-1', title: 'Tarefa Em Andamento', kanbanStatus: 'in_progress' }),
          createTask({ id: 'rev-1', title: 'Tarefa Em Revisão', kanbanStatus: 'review' }),
          createTask({
            id: 'done-1',
            title: 'Tarefa Concluída',
            kanbanStatus: 'done',
            completed: true,
          }),
        ],
      });

      // Assert — all tasks visible in their columns
      expect(screen.getByText('Tarefa A Fazer')).toBeInTheDocument();
      expect(screen.getByText('Tarefa Em Andamento')).toBeInTheDocument();
      expect(screen.getByText('Tarefa Em Revisão')).toBeInTheDocument();
      expect(screen.getByText('Tarefa Concluída')).toBeInTheDocument();
    });

    it('filters out financial events from the kanban board', () => {
      // Arrange
      renderPage({
        agendaEvents: [
          createTask({ id: 'task-ok', title: 'Tarefa Normal', kanbanStatus: 'todo' }),
          createTask({ id: 'fin-1', title: 'Movimentação Financeira', isFinancialEvent: 'income' }),
        ],
      });

      // Assert
      expect(screen.getByText('Tarefa Normal')).toBeInTheDocument();
      expect(screen.queryByText('Movimentação Financeira')).not.toBeInTheDocument();
    });

    it('does NOT filter out deadline events from the kanban board (only financialEvents are filtered)', () => {
      // Arrange — deadline events have isDeadlineEvent:true but still appear in the kanban
      // because TarefasPage only filters isFinancialEvent, not isDeadlineEvent
      renderPage({
        agendaEvents: [
          createTask({ id: 'deadline-1', title: 'Prazo de Entrega', isDeadlineEvent: true }),
        ],
      });

      // Assert — deadline task appears in the kanban board as a normal task
      expect(screen.getByText('Prazo de Entrega')).toBeInTheDocument();
    });

    it('filters out archived tasks from the active kanban board', () => {
      // Arrange
      renderPage({
        agendaEvents: [createTask({ id: 'arch1', title: 'Tarefa Arquivada', archived: true })],
      });

      // Assert — archived tasks should NOT appear in the kanban board
      expect(screen.queryByText('Tarefa Arquivada')).not.toBeInTheDocument();
    });
  });

  describe('archived view', () => {
    it('toggles to archived view when "Ver Arquivadas" is clicked', () => {
      // Arrange
      renderPage();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivadas' }));

      // Assert
      expect(screen.getByText('Tarefas Arquivadas')).toBeInTheDocument();
      expect(screen.getByText('Nenhuma tarefa arquivada')).toBeInTheDocument();
    });

    it('shows "Ver Ativas" button when in archived view', () => {
      // Arrange
      renderPage();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivadas' }));

      // Assert
      expect(screen.getByRole('button', { name: 'Ver Ativas' })).toBeInTheDocument();
    });

    it('returns to kanban view when "Ver Ativas" is clicked', () => {
      // Arrange
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivadas' }));

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Ver Ativas' }));

      // Assert — kanban columns are visible again
      expect(screen.getByText('A Fazer')).toBeInTheDocument();
    });

    it('displays archived tasks in the archived section', () => {
      // Arrange
      renderPage({
        agendaEvents: [createTask({ id: 'arch1', title: 'Tarefa X Arquivada', archived: true })],
      });

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Ver Arquivadas' }));

      // Assert
      expect(screen.getByText('Tarefa X Arquivada')).toBeInTheDocument();
    });
  });

  describe('task creation', () => {
    it('opens the new task modal when "Nova Tarefa" is clicked', () => {
      // Arrange
      renderPage();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Nova Tarefa' }));

      // Assert
      expect(screen.getByRole('heading', { name: 'Novo Evento / Tarefa' })).toBeInTheDocument();
    });

    it('creates a new task that appears in the kanban board after saving', async () => {
      // Arrange
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Nova Tarefa' }));

      // Act
      fireEvent.change(screen.getByLabelText('Título'), {
        target: { value: 'Tarefa Criada Pelo Teste' },
      });
      fireEvent.change(screen.getByLabelText('Tipo de Evento'), {
        target: { value: 'Desenvolvimento de Projeto' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

      // Assert — task is now rendered on the kanban board
      expect(await screen.findByText('Tarefa Criada Pelo Teste')).toBeInTheDocument();
    });
  });

  describe('drag and drop guard', () => {
    it('shows guard toast when moving task with incomplete subtasks to another column', async () => {
      // Arrange
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Nova Tarefa' }));
      fireEvent.change(screen.getByLabelText('Título'), {
        target: { value: 'Tarefa com subtarefas' },
      });
      fireEvent.change(screen.getByLabelText('Tipo de Evento'), {
        target: { value: 'Desenvolvimento de Projeto' },
      });

      const [subtaskInput, subtaskButton] = screen.getAllByLabelText('Adicionar subtarefa');
      fireEvent.change(subtaskInput, { target: { value: 'Subtask pendente' } });
      fireEvent.click(subtaskButton);
      fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

      const taskTitle = await screen.findByText('Tarefa com subtarefas');
      const taskCard = taskTitle.closest('[role="button"]') as HTMLElement;

      const transferStore: Record<string, string> = {};
      const dataTransfer = {
        setData: (key: string, value: string) => {
          transferStore[key] = value;
        },
        getData: (key: string) => transferStore[key] ?? '',
        clearData: () => {
          Object.keys(transferStore).forEach((key) => delete transferStore[key]);
        },
        dropEffect: 'move',
        effectAllowed: 'all',
        files: [] as unknown as FileList,
        items: [] as unknown as DataTransferItemList,
        types: [] as string[],
        setDragImage: () => {},
      } as DataTransfer;

      // Act
      fireEvent.dragStart(taskCard, { dataTransfer });
      fireEvent.dragOver(screen.getByText('Em Andamento'));
      fireEvent.drop(screen.getByText('Em Andamento'), { dataTransfer });

      // Assert
      expect(
        await screen.findByText(
          'Complete todas as subtarefas antes de mover esta tarefa para outra coluna.',
        ),
      ).toBeInTheDocument();
    });
  });
});
