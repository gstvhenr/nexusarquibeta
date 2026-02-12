import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout';
import { Modal } from '../components/ui';
import { DocumentIcons } from '../components/ui';
import { useData } from '../context/DataContext';
import { PROJECT_DOCUMENT_FOLDER_TEMPLATE, NAV_LINKS } from '../constants';
import type {
  DocumentStorage,
  DocumentFolder,
  DocumentFile,
  DocumentItem,
  Project,
  DocumentStatus,
} from '../types';
import { documentStatuses } from '../types';
import { formatDate, formatBytes } from '../utils/formatters';
import { openDocument, fileToB64 } from '../utils/documents';
import {
  traverseAndModify,
  traverseAndCollect,
  addItemToTree,
  deleteRecursive,
} from '../utils/tree';
import { CollectionIcon, ListViewIcon, PlusIcon } from '../components/ui';

// --- SUB-COMPONENTS ---
const AddModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (parentId: string, items: DocumentItem[]) => void;
  onLinkProject: (project: Project) => void;
  parentId: string;
  isProjectRoot: boolean;
  breadcrumbPath: DocumentFolder[];
}> = ({ isOpen, onClose, onSave, onLinkProject, parentId, isProjectRoot, breadcrumbPath }) => {
  const { documentStorage: docs, projects } = useData();
  const isRootFolder = breadcrumbPath.length <= 1;

  const getDefaultAddType = () => {
    if (isProjectRoot) return 'project';
    if (isRootFolder) return 'folder';
    return 'upload';
  };

  const [addType, setAddType] = useState(getDefaultAddType());
  const [folderName, setFolderName] = useState('');
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null);
  const [projectToLink, setProjectToLink] = useState('');

  const linkedProjectIds = useMemo(() => {
    const linkedFolders = docs.projects.children.filter(
      (c): c is DocumentFolder => c.type === 'folder',
    );
    return new Set(linkedFolders.map((f) => f.projectId));
  }, [docs]);

  const unlinkedProjects = useMemo(() => {
    return projects.filter((p) => !p.archived && !linkedProjectIds.has(p.id));
  }, [projects, linkedProjectIds]);

  const pathString = useMemo(() => {
    if (!breadcrumbPath || breadcrumbPath.length === 0) return '';
    const sectionNameMap: Record<string, string> = {
      'personal-root': 'Meus Documentos',
      'projects-root': 'Documentos de Projetos',
    };

    return breadcrumbPath
      .map((folder, index) => {
        if (index === 0) return sectionNameMap[folder.id] || folder.name;
        return folder.name;
      })
      .join(' / ');
  }, [breadcrumbPath]);

  useEffect(() => {
    if (isOpen) {
      setAddType(getDefaultAddType());
      setFolderName('');
      setFilesToUpload(null);
      setProjectToLink(unlinkedProjects[0]?.id || '');
    }
  }, [isOpen, isProjectRoot, isRootFolder, unlinkedProjects]);

  const handleSave = async () => {
    const now = new Date().toISOString();
    const getUniqueId = (prefix: string) =>
      `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    if (addType === 'folder' && folderName.trim()) {
      const newFolder: DocumentFolder = {
        id: getUniqueId('folder'),
        name: folderName.trim(),
        type: 'folder',
        children: [],
        dateAdded: now,
        dateModified: now,
      };
      onSave(parentId, [newFolder]);
    } else if (addType === 'upload' && filesToUpload) {
      const newFiles: DocumentFile[] = [];
      for (const file of Array.from(filesToUpload) as File[]) {
        const b64 = await fileToB64(file);
        const sourceId = getUniqueId('src');
        const newFile: DocumentFile = {
          id: getUniqueId('file'),
          name: file.name,
          type: 'file',
          dateAdded: now,
          dateModified: now,
          sources: [
            {
              id: sourceId,
              type: 'upload',
              content: b64,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              dateAdded: now,
            },
          ],
          primarySourceId: sourceId,
        };
        newFiles.push(newFile);
      }
      onSave(parentId, newFiles);
    } else if (addType === 'project' && projectToLink) {
      const project = projects.find((p) => p.id === projectToLink);
      if (project) {
        onLinkProject(project);
      }
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const inputClass =
    'w-full bg-background p-2 rounded-md border border-border-color focus:border-accent';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isProjectRoot ? 'Vincular Projeto' : `Adicionar a ${pathString}`}
    >
      <div className="space-y-4">
        {!isProjectRoot && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Tipo</label>
            <select
              value={addType}
              onChange={(e) => setAddType(e.target.value)}
              className={inputClass}
              aria-label="Tipo"
            >
              {!isRootFolder && <option value="upload">Upload de Arquivo</option>}
              <option value="folder">Nova Pasta</option>
            </select>
          </div>
        )}

        {addType === 'project' && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Projeto</label>
            <select
              value={projectToLink}
              onChange={(e) => setProjectToLink(e.target.value)}
              className={inputClass}
              aria-label="Projeto"
            >
              {unlinkedProjects.length > 0 ? (
                unlinkedProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.startsWith(p.code) ? p.name : `${p.code} - ${p.name}`}
                  </option>
                ))
              ) : (
                <option disabled>Nenhum projeto para vincular</option>
              )}
            </select>
          </div>
        )}

        {addType === 'folder' && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Nome da Pasta
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className={inputClass}
              aria-label="Nome da pasta"
            />
          </div>
        )}

        {addType === 'upload' && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Arquivos</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFilesToUpload(e.target.files)}
              className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20`}
              aria-label="Selecionar arquivos"
            />
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus"
        >
          Salvar
        </button>
      </div>
    </Modal>
  );
};

const DocumentosPage: React.FC = () => {
  const { documentStorage, setDocumentStorage, projects } = useData();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const activeSection = useMemo(
    () => (location.pathname.includes('/projetos') ? 'projects' : 'personal'),
    [location.pathname],
  );

  const [currentPath, setCurrentPath] = useState<string[]>(['personal-root']);

  useEffect(() => {
    setCurrentPath([activeSection === 'projects' ? 'projects-root' : 'personal-root']);
  }, [activeSection]);

  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const activeRoot = documentStorage[activeSection];
  const currentFolderId = currentPath[currentPath.length - 1];

  const { currentFolder, breadcrumbPath } = useMemo(() => {
    let folder: DocumentFolder = activeRoot;
    if (!folder) return { currentFolder: undefined, breadcrumbPath: [] };

    let path: DocumentFolder[] = [activeRoot];
    for (let i = 1; i < currentPath.length; i++) {
      const nextFolder = folder.children.find((c) => c.id === currentPath[i]) as
        | DocumentFolder
        | undefined;
      if (nextFolder) {
        folder = nextFolder;
        path.push(nextFolder);
      } else {
        break;
      }
    }
    return { currentFolder: folder, breadcrumbPath: path };
  }, [activeRoot, currentPath]);

  const sortedChildren = useMemo(() => {
    if (!currentFolder?.children) return [];
    return [...currentFolder.children].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [currentFolder]);

  const documentStatusClasses: Record<DocumentStatus, string> = {
    'Em Revisão': 'bg-warning/20 text-warning',
    Aprovado: 'bg-info/20 text-info',
    'Versão Final': 'bg-success/20 text-success',
    Obsoleto: 'bg-surface text-text-secondary',
  };

  const handleAddItem = (parentId: string, items: DocumentItem[]) => {
    const newStorage = { ...documentStorage };
    let root = newStorage[activeSection];
    for (const item of items) {
      root = addItemToTree(root, parentId, item);
    }
    newStorage[activeSection] = root;
    setDocumentStorage(newStorage);
  };

  const handleLinkProject = (project: Project) => {
    const { id: projectId, code: projectCode, name: projectName } = project;
    const now = new Date().toISOString();
    const createTemplate = (template: typeof PROJECT_DOCUMENT_FOLDER_TEMPLATE): DocumentFolder[] =>
      template.map((item) => ({
        id: `folder_${Date.now()}_${Math.random()}`,
        name: item.name,
        type: 'folder',
        children: item.children ? createTemplate(item.children as any) : [],
        dateAdded: now,
        dateModified: now,
      }));

    // Prevent double code e.g., "#2500 - #2500 - Name"
    const folderName = projectName.startsWith(projectCode)
      ? projectName
      : `${projectCode} - ${projectName}`;

    const newProjectFolder: DocumentFolder = {
      id: `proj-folder_${projectId}`,
      name: folderName,
      type: 'folder',
      children: createTemplate(PROJECT_DOCUMENT_FOLDER_TEMPLATE),
      dateAdded: now,
      dateModified: now,
      projectId: projectId,
      projectCode: projectCode,
    };
    handleAddItem('projects-root', [newProjectFolder]);
  };

  const documentosIcon = NAV_LINKS.find((link) => link.label === 'Documentos')?.icon;

  const pageTitle = activeSection === 'projects' ? 'Documentos de Projetos' : 'Meus Documentos';

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <PageHeader title={pageTitle} icon={documentosIcon}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-background rounded-lg shadow-inner-soft">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-content' : 'text-text-secondary hover:bg-surface'}`}
              aria-label="Visualização em lista"
            >
              <ListViewIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-content' : 'text-text-secondary hover:bg-surface'}`}
              aria-label="Visualização em grade"
            >
              <CollectionIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 rounded-lg font-semibold text-sm text-primary-content bg-primary hover:bg-primary-focus flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Adicionar
          </button>
        </div>
      </PageHeader>

      <main className="flex-1 bg-surface rounded-xl shadow-soft p-6 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center pb-4 border-b border-border-color">
          <div className="flex items-center text-sm font-semibold text-text-secondary">
            {breadcrumbPath.map((folder, i) => (
              <React.Fragment key={folder.id}>
                {i > 0 && <span className="mx-2">/</span>}
                <button
                  onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                  className="hover:text-primary transition-colors"
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto pt-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedChildren.map((item) => (
                <div
                  key={item.id}
                  onDoubleClick={() =>
                    item.type === 'folder'
                      ? setCurrentPath((p) => [...p, item.id])
                      : openDocument(item as DocumentFile)
                  }
                  className="bg-background/50 p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/10 transition-colors aspect-square"
                >
                  <div className="w-16 h-16 text-secondary mb-2">
                    <DocumentIcons.GetIcon
                      type={
                        item.type === 'folder'
                          ? (item as DocumentFolder).projectId
                            ? 'projectfolder'
                            : 'folder'
                          : (item as DocumentFile).sources[0]?.fileType || 'default'
                      }
                    />
                  </div>
                  <p className="text-sm font-semibold text-text-primary break-all line-clamp-2">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-background/50 text-xs text-text-secondary uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="p-4 w-12"></th>
                    <th scope="col" className="px-6 py-3">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Modificado em
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Tamanho
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {sortedChildren.map((item) => {
                    const isFolder = item.type === 'folder';
                    const file = isFolder ? null : (item as DocumentFile);
                    const folder = isFolder ? (item as DocumentFolder) : null;
                    const source = file
                      ? file.sources.find((s) => s.id === file.primarySourceId)
                      : null;
                    const fileSize = source?.fileSize;

                    return (
                      <tr
                        key={item.id}
                        onDoubleClick={() =>
                          isFolder ? setCurrentPath((p) => [...p, item.id]) : openDocument(file!)
                        }
                        className="group hover:bg-background/80 transition-colors cursor-pointer"
                      >
                        <td className="p-4">
                          <div className="w-6 h-6 text-secondary">
                            <DocumentIcons.GetIcon
                              type={
                                isFolder
                                  ? folder!.projectId
                                    ? 'projectfolder'
                                    : 'folder'
                                  : file!.sources[0]?.fileType || 'default'
                              }
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-text-primary">{item.name}</td>
                        <td className="px-6 py-4 text-text-secondary">
                          {formatDate(item.dateModified)}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {isFolder
                            ? `${folder!.children.length} itens`
                            : fileSize
                              ? formatBytes(fileSize)
                              : source?.type === 'link'
                                ? 'Link'
                                : '-'}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {file && file.status && (
                            <span
                              className={`px-2 py-1 text-xs font-bold rounded-full ${documentStatusClasses[file.status]}`}
                            >
                              {file.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {currentFolder?.children.length === 0 && (
            <div className="text-center text-text-secondary py-16">
              <p className="font-semibold">Esta pasta está vazia.</p>
            </div>
          )}
        </div>
      </main>

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddItem}
        onLinkProject={handleLinkProject}
        parentId={currentFolderId}
        isProjectRoot={activeSection === 'projects' && currentFolderId === 'projects-root'}
        breadcrumbPath={breadcrumbPath}
      />
    </div>
  );
};

export default DocumentosPage;
