import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreContext } from '@/context/CoreContext';
import { SystemContext } from '@/context/SystemContext';
import type { CoreDataType, SystemDataType } from '@/context/types';
import type { DocumentStorage, Project } from '@/types';
import { AddModal } from './AddModal';

function TestProviders({
  children,
  projects,
  documentStorage,
}: {
  children: React.ReactNode;
  projects: Project[];
  documentStorage: DocumentStorage;
}): JSX.Element {
  const [coreProjects, setCoreProjects] = useState<CoreDataType['projects']>(projects);
  const [proposals, setProposals] = useState<CoreDataType['proposals']>([]);
  const [clients, setClients] = useState<CoreDataType['clients']>([]);

  const [storage, setStorage] = useState<SystemDataType['documentStorage']>(documentStorage);
  const [agendaEvents, setAgendaEvents] = useState<SystemDataType['agendaEvents']>([]);
  const [reminders, setReminders] = useState<SystemDataType['reminders']>([]);
  const [customBudgetTemplate, setCustomBudgetTemplate] = useState<
    SystemDataType['customBudgetTemplate']
  >(null);
  const [globalIdentifierCounter, setGlobalIdentifierCounter] = useState<
    SystemDataType['globalIdentifierCounter']
  >(2500);
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
    projects: coreProjects,
    setProjects: setCoreProjects,
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

describe('AddModal', () => {
  beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    document.getElementById('modal-root')?.remove();
  });

  it('returns null when closed', () => {
    render(
      <TestProviders projects={[]} documentStorage={baseStorage}>
        <AddModal
          isOpen={false}
          onClose={vi.fn()}
          onSave={vi.fn()}
          onLinkProject={vi.fn()}
          parentId="personal-root"
          isProjectRoot={false}
          breadcrumbPath={[baseStorage.personal]}
        />
      </TestProviders>,
    );

    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument();
  });

  it('creates a folder and emits onSave payload', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <TestProviders projects={[]} documentStorage={baseStorage}>
        <AddModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          onLinkProject={vi.fn()}
          parentId="personal-root"
          isProjectRoot={false}
          breadcrumbPath={[baseStorage.personal]}
        />
      </TestProviders>,
    );

    fireEvent.change(screen.getByLabelText('Nome da pasta'), { target: { value: 'Contratos' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).toHaveBeenCalledWith(
      'personal-root',
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Contratos',
          type: 'folder',
        }),
      ]),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not save when folder name is empty, but closes modal', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <TestProviders projects={[]} documentStorage={baseStorage}>
        <AddModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          onLinkProject={vi.fn()}
          parentId="personal-root"
          isProjectRoot={false}
          breadcrumbPath={[baseStorage.personal]}
        />
      </TestProviders>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uploads selected files when opened inside a nested folder', async () => {
    const nestedFolder = {
      id: 'folder-contratos',
      name: 'Contratos',
      type: 'folder' as const,
      children: [],
      dateAdded: '2026-03-03T10:00:00.000Z',
      dateModified: '2026-03-03T10:00:00.000Z',
    };
    const onSave = vi.fn();
    const onClose = vi.fn();
    const firstFile = new File(['conteudo-1'], 'contrato.pdf', { type: 'application/pdf' });
    const secondFile = new File(['conteudo-2'], 'referencia.txt', { type: 'text/plain' });

    render(
      <TestProviders projects={[]} documentStorage={baseStorage}>
        <AddModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          onLinkProject={vi.fn()}
          parentId="folder-contratos"
          isProjectRoot={false}
          breadcrumbPath={[baseStorage.personal, nestedFolder]}
        />
      </TestProviders>,
    );

    expect(screen.getByRole('heading', { name: 'Adicionar a Meus Documentos / Contratos' }));

    const input = screen.getByLabelText('Selecionar arquivos');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [firstFile, secondFile],
    });
    fireEvent.change(input);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const [parentId, files] = onSave.mock.calls[0] as [string, Array<{ type: string; name: string }>];

    expect(parentId).toBe('folder-contratos');
    expect(files).toHaveLength(2);
    expect(files[0]).toEqual(expect.objectContaining({ type: 'file', name: 'contrato.pdf' }));
    expect(files[1]).toEqual(expect.objectContaining({ type: 'file', name: 'referencia.txt' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('links unlinked project when opened in project root mode', () => {
    const linkedProject = buildProject({
      id: 'proj-1',
      code: 'PRJ-001',
      name: 'PRJ-001 - Casa',
    });
    const archivedProject = buildProject({
      id: 'proj-2',
      code: 'PRJ-002',
      name: 'PRJ-002 - Arquivado',
      archived: true,
    });
    const unlinkedProject = buildProject({
      id: 'proj-3',
      code: 'PRJ-003',
      name: 'Loja Centro',
    });

    const documentStorage: DocumentStorage = {
      ...baseStorage,
      projects: {
        ...baseStorage.projects,
        children: [
          {
            id: 'proj-folder_proj-1',
            name: 'PRJ-001 - Casa',
            type: 'folder',
            children: [],
            dateAdded: '2026-03-03T10:00:00.000Z',
            dateModified: '2026-03-03T10:00:00.000Z',
            projectId: 'proj-1',
            projectCode: 'PRJ-001',
          },
        ],
      },
    };

    const onLinkProject = vi.fn();
    const onClose = vi.fn();

    render(
      <TestProviders
        projects={[linkedProject, archivedProject, unlinkedProject]}
        documentStorage={documentStorage}
      >
        <AddModal
          isOpen={true}
          onClose={onClose}
          onSave={vi.fn()}
          onLinkProject={onLinkProject}
          parentId="projects-root"
          isProjectRoot={true}
          breadcrumbPath={[documentStorage.projects]}
        />
      </TestProviders>,
    );

    expect(screen.queryByLabelText('Tipo')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Vincular Projeto' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'PRJ-003 - Loja Centro' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'PRJ-002 - Arquivado' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onLinkProject).toHaveBeenCalledWith(unlinkedProject);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows empty project fallback and skips link callback when there is no project to link', () => {
    const onlyLinked = buildProject({
      id: 'proj-1',
      code: 'PRJ-001',
      name: 'PRJ-001 - Casa',
    });
    const documentStorage: DocumentStorage = {
      ...baseStorage,
      projects: {
        ...baseStorage.projects,
        children: [
          {
            id: 'proj-folder_proj-1',
            name: 'PRJ-001 - Casa',
            type: 'folder',
            children: [],
            dateAdded: '2026-03-03T10:00:00.000Z',
            dateModified: '2026-03-03T10:00:00.000Z',
            projectId: 'proj-1',
            projectCode: 'PRJ-001',
          },
        ],
      },
    };
    const onLinkProject = vi.fn();
    const onClose = vi.fn();

    render(
      <TestProviders projects={[onlyLinked]} documentStorage={documentStorage}>
        <AddModal
          isOpen={true}
          onClose={onClose}
          onSave={vi.fn()}
          onLinkProject={onLinkProject}
          parentId="projects-root"
          isProjectRoot={true}
          breadcrumbPath={[documentStorage.projects]}
        />
      </TestProviders>,
    );

    expect(screen.getByRole('option', { name: 'Nenhum projeto para vincular' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onLinkProject).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
