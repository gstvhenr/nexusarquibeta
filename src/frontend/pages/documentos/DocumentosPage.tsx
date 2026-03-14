import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/layout';
import { useSystemData } from '../../context/DataContext';
import { useDisclosure } from '../../hooks/useDisclosure';
import { NAV_LINKS } from '../../constants';
import type { DocumentFolder, DocumentItem, Project } from '../../types';
import { openDocument } from '../../utils/documents';
import { addItemToTree } from '../../utils/tree';
import { AddModal } from './AddModal';
import { DocumentsBreadcrumb } from './DocumentsBreadcrumb';
import { DocumentsGridView } from './DocumentsGridView';
import { DocumentsListView } from './DocumentsListView';
import { DocumentsToolbar } from './DocumentsToolbar';

const DocumentosPage: () => React.ReactNode = () => {
  const { documentStorage, setDocumentStorage } = useSystemData();
  const location = useLocation();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const addModal = useDisclosure();

  const activeSection = useMemo(
    () => (location.pathname.includes('/projetos') ? 'projects' : 'personal'),
    [location.pathname],
  );

  const [currentPath, setCurrentPath] = useState<string[]>(['personal-root']);

  useEffect(() => {
    setCurrentPath([activeSection === 'projects' ? 'projects-root' : 'personal-root']);
  }, [activeSection]);

  const activeRoot = documentStorage[activeSection];
  const currentFolderId = currentPath[currentPath.length - 1];

  const { currentFolder, breadcrumbPath } = useMemo(() => {
    let folder: DocumentFolder = activeRoot;
    if (!folder) {
      return { currentFolder: undefined, breadcrumbPath: [] };
    }

    let path: DocumentFolder[] = [activeRoot];
    for (let index = 1; index < currentPath.length; index += 1) {
      const nextFolder = folder.children.find((child) => child.id === currentPath[index]) as
        | DocumentFolder
        | undefined;

      if (!nextFolder) {
        break;
      }

      folder = nextFolder;
      path = [...path, nextFolder];
    }

    return { currentFolder: folder, breadcrumbPath: path };
  }, [activeRoot, currentPath]);

  const sortedChildren = useMemo(() => {
    if (!currentFolder?.children) {
      return [];
    }

    return [...currentFolder.children].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') {
        return -1;
      }
      if (a.type === 'file' && b.type === 'folder') {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [currentFolder]);

  const handleAddItem = (parentId: string, items: DocumentItem[]) => {
    const nextStorage = { ...documentStorage };
    let root = nextStorage[activeSection];

    for (const item of items) {
      root = addItemToTree(root, parentId, item);
    }

    nextStorage[activeSection] = root;
    setDocumentStorage(nextStorage);
  };

  const handleLinkProject = (project: Project) => {
    const { id: projectId, code: projectCode, name: projectName } = project;
    const now = new Date().toISOString();

    const folderName = projectName.startsWith(projectCode)
      ? projectName
      : `${projectCode} - ${projectName}`;

    const newProjectFolder: DocumentFolder = {
      id: `proj-folder_${projectId}`,
      name: folderName,
      type: 'folder',
      children: [],
      dateAdded: now,
      dateModified: now,
      projectId,
      projectCode,
    };

    handleAddItem('projects-root', [newProjectFolder]);
  };

  const documentosIcon = NAV_LINKS.find((link) => link.label === 'Documentos')?.icon;
  const pageTitle = activeSection === 'projects' ? 'Documentos de Projetos' : 'Meus Documentos';

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <PageHeader title={pageTitle} icon={documentosIcon}>
        <DocumentsToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAdd={addModal.open}
        />
      </PageHeader>

      <main className="flex-1 bg-surface rounded-xl shadow-soft p-6 flex flex-col overflow-hidden">
        <DocumentsBreadcrumb
          breadcrumbPath={breadcrumbPath}
          onNavigateToIndex={(index) => setCurrentPath(currentPath.slice(0, index + 1))}
        />

        <div className="flex-1 overflow-y-auto pt-4">
          {viewMode === 'grid' ? (
            <DocumentsGridView
              items={sortedChildren}
              onOpenFolder={(folderId) => setCurrentPath((path) => [...path, folderId])}
              onOpenFile={openDocument}
            />
          ) : (
            <DocumentsListView
              items={sortedChildren}
              onOpenFolder={(folderId) => setCurrentPath((path) => [...path, folderId])}
              onOpenFile={openDocument}
            />
          )}

          {currentFolder?.children.length === 0 && (
            <div className="text-center text-text-secondary py-16">
              <p className="font-semibold">Esta pasta está vazia.</p>
            </div>
          )}
        </div>
      </main>

      <AddModal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
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
