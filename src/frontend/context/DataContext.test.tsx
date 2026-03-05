import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, type AppData } from '../services/infrastructure/api';
import {
  DataProvider,
  useCoreData,
  useFinanceData,
  useMarketingData,
  useSupplyChainData,
  useSystemData,
} from './DataContext';
import { DataHistoryContext } from './DataHistoryContext';

const makeAppData = (overrides: Partial<AppData> = {}): AppData => ({
  projects: [],
  proposals: [],
  clients: [],
  documentStorage: {} as AppData['documentStorage'],
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
  globalIdentifierCounter: 1,
  dismissedFocusItems: [],
  acceptedPaymentMethods: [],
  hiredServices: [],
  prospects: [],
  contractDeadlines: {} as AppData['contractDeadlines'],
  cashBoxExpenses: [],
  cashBoxCredits: [],
  reminders: [],
  ...overrides,
});

const ContextProbe = () => {
  const core = useCoreData();
  const finance = useFinanceData();
  const supply = useSupplyChainData();
  const marketing = useMarketingData();
  const system = useSystemData();
  const history = useContext(DataHistoryContext);

  if (!history) throw new Error('DataHistoryContext is missing');

  return (
    <div>
      <span data-testid="projects-count">{core.projects.length}</span>
      <span data-testid="commissions-count">{finance.commissions.length}</span>
      <span data-testid="suppliers-count">{supply.suppliers.length}</span>
      <span data-testid="activities-count">{marketing.marketingActivities.length}</span>
      <span data-testid="agenda-count">{system.agendaEvents.length}</span>
      <span data-testid="can-undo">{String(history.canUndo)}</span>
      <span data-testid="can-redo">{String(history.canRedo)}</span>

      <button
        type="button"
        onClick={() =>
          core.setProjects([{ id: 'project-1' }] as unknown as AppData['projects'])
        }
      >
        set-projects
      </button>
      <button type="button" onClick={() => core.setProjects((prev) => prev)}>
        set-projects-same
      </button>
      <button
        type="button"
        onClick={() =>
          core.setProjects((prev) => [
            ...prev,
            { id: 'project-2' } as unknown as AppData['projects'][number],
          ])
        }
      >
        append-project
      </button>
      <button type="button" onClick={history.undo}>
        undo
      </button>
      <button type="button" onClick={history.redo}>
        redo
      </button>
      <button type="button" onClick={history.clearHistory}>
        clear
      </button>
    </div>
  );
};

describe('DataContext / DataProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'updateData').mockImplementation(() => undefined);
    vi.spyOn(api, 'replaceData').mockImplementation(() => undefined);
    vi.spyOn(api, 'getData').mockReturnValue(makeAppData());
  });

  it('provides all domain slices and history state to descendants', () => {
    vi.spyOn(api, 'getData').mockReturnValue(
      makeAppData({
        projects: [{ id: 'project-1' }] as unknown as AppData['projects'],
        commissions: [{ id: 'commission-1' }] as unknown as AppData['commissions'],
        suppliers: [{ id: 'supplier-1' }] as unknown as AppData['suppliers'],
        marketingActivities: [{ id: 'activity-1' }] as unknown as AppData['marketingActivities'],
        agendaEvents: [{ id: 'event-1' }] as unknown as AppData['agendaEvents'],
      }),
    );

    render(
      <DataProvider>
        <ContextProbe />
      </DataProvider>,
    );

    expect(screen.getByTestId('projects-count')).toHaveTextContent('1');
    expect(screen.getByTestId('commissions-count')).toHaveTextContent('1');
    expect(screen.getByTestId('suppliers-count')).toHaveTextContent('1');
    expect(screen.getByTestId('activities-count')).toHaveTextContent('1');
    expect(screen.getByTestId('agenda-count')).toHaveTextContent('1');
    expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
    expect(screen.getByTestId('can-redo')).toHaveTextContent('false');
  });

  it('tracks history and persists when direct setter value changes', async () => {
    const updateDataSpy = vi.spyOn(api, 'updateData').mockImplementation(() => undefined);

    render(
      <DataProvider>
        <ContextProbe />
      </DataProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'set-projects' }));

    expect(updateDataSpy).toHaveBeenCalledWith(
      'projects',
      expect.arrayContaining([expect.objectContaining({ id: 'project-1' })]),
    );

    await waitFor(() => {
      expect(screen.getByTestId('projects-count')).toHaveTextContent('1');
      expect(screen.getByTestId('can-undo')).toHaveTextContent('true');
    });
  });

  it('skips persistence when setter returns the same reference', () => {
    const updateDataSpy = vi.spyOn(api, 'updateData').mockImplementation(() => undefined);

    render(
      <DataProvider>
        <ContextProbe />
      </DataProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'set-projects-same' }));

    expect(updateDataSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('projects-count')).toHaveTextContent('0');
  });

  it('supports functional updates through setField pipeline', async () => {
    const updateDataSpy = vi.spyOn(api, 'updateData').mockImplementation(() => undefined);

    render(
      <DataProvider>
        <ContextProbe />
      </DataProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'append-project' }));

    expect(updateDataSpy).toHaveBeenCalledWith(
      'projects',
      expect.arrayContaining([expect.objectContaining({ id: 'project-2' })]),
    );
    await waitFor(() => {
      expect(screen.getByTestId('projects-count')).toHaveTextContent('1');
    });
  });

  it('re-syncs from storage event and clears undo history', async () => {
    const firstSnapshot = makeAppData();
    const secondSnapshot = makeAppData({
      projects: [{ id: 'project-9' }] as unknown as AppData['projects'],
    });
    const getDataSpy = vi.spyOn(api, 'getData');
    getDataSpy.mockReturnValueOnce(firstSnapshot).mockReturnValue(secondSnapshot);

    render(
      <DataProvider>
        <ContextProbe />
      </DataProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'set-projects' }));
    await waitFor(() => {
      expect(screen.getByTestId('can-undo')).toHaveTextContent('true');
    });

    fireEvent(window, new Event('storage'));

    await waitFor(() => {
      expect(screen.getByTestId('projects-count')).toHaveTextContent('1');
      expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
      expect(screen.getByTestId('can-redo')).toHaveTextContent('false');
    });
  });

  it('supports undo, redo and clearHistory through DataHistoryContext', async () => {
    const replaceDataSpy = vi.spyOn(api, 'replaceData').mockImplementation(() => undefined);

    render(
      <DataProvider>
        <ContextProbe />
      </DataProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'set-projects' }));
    await waitFor(() => {
      expect(screen.getByTestId('projects-count')).toHaveTextContent('1');
      expect(screen.getByTestId('can-undo')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByRole('button', { name: 'undo' }));
    await waitFor(() => {
      expect(screen.getByTestId('projects-count')).toHaveTextContent('0');
      expect(screen.getByTestId('can-redo')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByRole('button', { name: 'redo' }));
    await waitFor(() => {
      expect(screen.getByTestId('projects-count')).toHaveTextContent('1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'clear' }));
    await waitFor(() => {
      expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
      expect(screen.getByTestId('can-redo')).toHaveTextContent('false');
    });

    expect(replaceDataSpy).toHaveBeenCalled();
  });
});
