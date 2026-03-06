import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CoreContext } from '@/context/CoreContext';
import { SystemContext } from '@/context/SystemContext';
import type { CoreDataType, SystemDataType } from '@/context/types';
import type { DocumentStorage, Project } from '@/types';
import DocumentosPage from './DocumentosPage';

function TestProviders({
  children,
  documentStorage,
  projects = [],
}: {
  children: React.ReactNode;
  documentStorage: DocumentStorage;
  projects?: Project[];
}): JSX.Element {
  const [projectsState, setProjects] = useState<CoreDataType['projects']>(projects);
  const [proposals, setProposals] = useState<CoreDataType['proposals']>([]);
  const [clients, setClients] = useState<CoreDataType['clients']>([]);

  const [storage, setStorage] = useState<SystemDataType['documentStorage']>(documentStorage);
  const [agendaEvents, setAgendaEvents] = useState<SystemDataType['agendaEvents']>([]);
  const [reminders, setReminders] = useState<SystemDataType['reminders']>([]);
  const [customBudgetTemplate, setCustomBudgetTemplate] =
    useState<SystemDataType['customBudgetTemplate']>(null);
  const [globalIdentifierCounter, setGlobalIdentifierCounter] =
    useState<SystemDataType['globalIdentifierCounter']>(2500);
  const [dismissedFocusItems, setDismissedFocusItems] = useState<
    SystemDataType['dismissedFocusItems']
  >([]);
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<
    SystemDataType['acceptedPaymentMethods']
  >([]);
  const [hiredServices, setHiredServices] = useState<SystemDataType['hiredServices']>([]);
  const [contractDeadlines, setContractDeadlines] = useState<SystemDataType['contractDeadlines']>({
    defaultPreliminarDeadlineDays: 7,
    defaultExecutiveDeadlineDays: 30,
  });

  const coreValue: CoreDataType = {
    projects: projectsState,
    setProjects,
    proposals,
    setProposals,
    clients,
    setClients,
  };

  const systemValue: SystemDataType = {
    documentStorage: storage,
    setDocumentStorage: setStorage,
    agendaEvents,
    setAgendaEvents,
    reminders,
    setReminders,
    customBudgetTemplate,
    setCustomBudgetTemplate,
    globalIdentifierCounter,
    setGlobalIdentifierCounter,
    dismissedFocusItems,
    setDismissedFocusItems,
    acceptedPaymentMethods,
    setAcceptedPaymentMethods,
    hiredServices,
    setHiredServices,
    contractDeadlines,
    setContractDeadlines,
  };

  return (
    <CoreContext.Provider value={coreValue}>
      <SystemContext.Provider value={systemValue}>{children}</SystemContext.Provider>
    </CoreContext.Provider>
  );
}

const baseStorage: DocumentStorage = {
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
};

function buildProject(overrides: Partial<Project> = {}): Project {
  const seed = {
    id: 'project-1',
    code: 'PRJ-001',
    name: 'Casa Modelo',
    clientName: 'Cliente 1',
    clientId: 'client-1',
    status: 'Em Andamento',
    deadline: null,
    budget: 1000,
    description: 'Projeto teste',
    sections: [],
    archived: false,
    financials: {
      paymentType: 'vista',
      totalValue: 0,
      baseContractValue: 0,
      lumpSumStatus: 'Em aberto',
    },
  } satisfies Partial<Project>;

  return {
    ...seed,
    ...overrides,
    financials: {
      ...seed.financials,
      ...(overrides.financials || {}),
    },
  } as Project;
}

function renderPage(
  pathname: '/documentos/pessoal' | '/documentos/projetos',
  {
    storage = baseStorage,
    projects = [],
  }: { storage?: DocumentStorage; projects?: Project[] } = {},
) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <TestProviders documentStorage={storage} projects={projects}>
        <Routes>
          <Route path="/documentos/pessoal" element={<DocumentosPage />} />
          <Route path="/documentos/projetos" element={<DocumentosPage />} />
        </Routes>
      </TestProviders>
    </MemoryRouter>,
  );
}

describe('DocumentosPage', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
  });

  it('renders personal documents view title and empty folder state', () => {
    renderPage('/documentos/pessoal');

    expect(screen.getByRole('heading', { level: 1, name: 'Meus Documentos' })).toBeInTheDocument();
    expect(screen.getByText('Esta pasta está vazia.')).toBeInTheDocument();
  });

  it('renders project documents title on projects route', () => {
    renderPage('/documentos/projetos');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Documentos de Projetos' }),
    ).toBeInTheDocument();
  });

  it('sorts folders before files, navigates folders and opens files', async () => {
    const file = {
      id: 'file-1',
      name: 'z-arquivo.pdf',
      type: 'file' as const,
      dateAdded: '2026-03-03T10:00:00.000Z',
      dateModified: '2026-03-03T10:00:00.000Z',
      primarySourceId: 'src-1',
      sources: [
        {
          id: 'src-1',
          type: 'upload' as const,
          content: 'data:application/pdf;base64,ZmFrZQ==',
          fileName: 'z-arquivo.pdf',
          fileType: 'application/pdf',
          fileSize: 100,
          dateAdded: '2026-03-03T10:00:00.000Z',
        },
      ],
    };

    const storageWithChildren: DocumentStorage = {
      ...baseStorage,
      personal: {
        ...baseStorage.personal,
        children: [
          file,
          {
            id: 'folder-b',
            name: 'B Contratos',
            type: 'folder',
            children: [],
            dateAdded: '2026-03-03T10:00:00.000Z',
            dateModified: '2026-03-03T10:00:00.000Z',
          },
          {
            id: 'folder-a',
            name: 'A Administrativos',
            type: 'folder',
            children: [],
            dateAdded: '2026-03-03T10:00:00.000Z',
            dateModified: '2026-03-03T10:00:00.000Z',
          },
        ],
      },
    };

    renderPage('/documentos/pessoal', { storage: storageWithChildren });

    const rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByText('A Administrativos')).toBeInTheDocument();
    expect(within(rows[1]).getByText('B Contratos')).toBeInTheDocument();
    expect(within(rows[2]).getByText('z-arquivo.pdf')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Visualização em grade' }));
    fireEvent.doubleClick(screen.getByText('A Administrativos'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'A Administrativos' })).toBeInTheDocument();
    });
    expect(screen.getByText('Esta pasta está vazia.')).toBeInTheDocument();
  });

  it('adds a new personal folder through modal save flow', async () => {
    renderPage('/documentos/pessoal');

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    fireEvent.change(screen.getByLabelText('Nome da pasta'), {
      target: { value: '  Contratos  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(screen.getByText('Contratos')).toBeInTheDocument();
    });
    expect(screen.queryByText('Esta pasta está vazia.')).not.toBeInTheDocument();
  });

  it('links projects with and without preformatted name, then opens template folders', async () => {
    const projects: Project[] = [
      buildProject({ id: 'proj-1', code: 'PRJ-100', name: 'Casa da Praia' }),
      buildProject({ id: 'proj-2', code: 'PRJ-200', name: 'PRJ-200 - Loft' }),
    ];

    renderPage('/documentos/projetos', { projects });

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(screen.getByText('PRJ-100 - Casa da Praia')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    fireEvent.change(screen.getByLabelText('Projeto'), { target: { value: 'proj-2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(screen.getByText('PRJ-200 - Loft')).toBeInTheDocument();
    });

    fireEvent.doubleClick(screen.getByText('PRJ-100 - Casa da Praia'));

    await waitFor(() => {
      expect(screen.getByText('01 - Administrativo')).toBeInTheDocument();
    });
  });

  it('keeps rendering when active root is missing in storage snapshot', () => {
    const malformedStorage = {
      ...baseStorage,
      personal: undefined,
    } as unknown as DocumentStorage;

    renderPage('/documentos/pessoal', { storage: malformedStorage });

    expect(screen.getByRole('heading', { level: 1, name: 'Meus Documentos' })).toBeInTheDocument();
  });
});
