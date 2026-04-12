import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, FormField, Input, Modal, Select } from '../../components/ui';
import { useCoreData, useSystemData } from '../../context/DataContext';
import type { DocumentFolder, DocumentItem, DocumentFile, Project } from '../../types';
import { firebaseFileService } from '../../services/infrastructure/firebaseFileService';
import { fileToB64 } from '../../utils/documents';

type AddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (parentId: string, items: DocumentItem[]) => void;
  onLinkProject: (project: Project) => void;
  parentId: string;
  isProjectRoot: boolean;
  breadcrumbPath: DocumentFolder[];
};

export const AddModal: (props: AddModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onSave,
  onLinkProject,
  parentId,
  isProjectRoot,
  breadcrumbPath,
}) => {
  const { projects } = useCoreData();
  const { documentStorage: docs } = useSystemData();
  const isRootFolder = breadcrumbPath.length <= 1;

  const getDefaultAddType = useCallback(() => {
    if (isProjectRoot) {
      return 'project';
    }
    if (isRootFolder) {
      return 'folder';
    }
    return 'upload';
  }, [isProjectRoot, isRootFolder]);

  const [addType, setAddType] = useState(getDefaultAddType);
  const [folderName, setFolderName] = useState('');
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null);
  const [projectToLink, setProjectToLink] = useState('');

  const linkedProjectIds = useMemo(() => {
    const projectsRoot = docs?.projects;
    if (!projectsRoot?.children) {
      return new Set<string>();
    }

    const linkedFolders = projectsRoot.children.filter(
      (child): child is DocumentFolder => child.type === 'folder',
    );
    return new Set(linkedFolders.map((folder) => folder.projectId));
  }, [docs]);

  const unlinkedProjects = useMemo(() => {
    return projects.filter((project) => !project.archived && !linkedProjectIds.has(project.id));
  }, [projects, linkedProjectIds]);

  const pathString = useMemo(() => {
    if (!breadcrumbPath || breadcrumbPath.length === 0) {
      return '';
    }

    const sectionNameMap: Record<string, string> = {
      'personal-root': 'Meus Documentos',
      'projects-root': 'Documentos de Projetos',
    };

    return breadcrumbPath
      .map((folder, index) => {
        if (index === 0) {
          return sectionNameMap[folder.id] || folder.name;
        }
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
  }, [isOpen, getDefaultAddType, unlinkedProjects]);

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
      const newFiles: DocumentFile[] = await Promise.all(
        (Array.from(filesToUpload) as File[]).map(async (file) => {
          const fileId = getUniqueId('file');
          const sourceId = getUniqueId('src');
          let storagePath: string | undefined;
          let legacyContent: string | undefined;

          try {
            storagePath = await firebaseFileService.uploadDocumentFile(fileId, sourceId, file);
          } catch {
            // Local-only fallback when Firebase is unavailable during development/tests.
            legacyContent = await fileToB64(file);
          }

          return {
            id: fileId,
            name: file.name,
            type: 'file',
            dateAdded: now,
            dateModified: now,
            sources: [
              {
                id: sourceId,
                type: 'upload',
                content: legacyContent,
                storagePath,
                storageProvider: storagePath ? 'firebase-storage' : undefined,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                dateAdded: now,
              },
            ],
            primarySourceId: sourceId,
          };
        }),
      );
      onSave(parentId, newFiles);
    } else if (addType === 'project' && projectToLink) {
      const project = projects.find((item) => item.id === projectToLink);
      if (project) {
        onLinkProject(project);
      }
    }

    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const fileInputClass =
    'w-full bg-surface p-2 rounded-lg border border-border-color focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors duration-150';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isProjectRoot ? 'Vincular Projeto' : `Adicionar a ${pathString}`}
    >
      <div className="space-y-4">
        {!isProjectRoot && (
          <Select
            label="Tipo"
            id="field-tipo"
            value={addType}
            onChange={(event) => setAddType(event.target.value)}
            options={[
              ...(!isRootFolder ? [{ value: 'upload', label: 'Upload de Arquivo' }] : []),
              { value: 'folder', label: 'Nova Pasta' },
            ]}
          />
        )}

        {addType === 'project' && (
          <Select
            label="Projeto"
            id="field-projeto"
            value={projectToLink}
            onChange={(event) => setProjectToLink(event.target.value)}
            options={
              unlinkedProjects.length > 0
                ? unlinkedProjects.map((project) => ({
                    value: project.id,
                    label: project.name.startsWith(project.code)
                      ? project.name
                      : `${project.code} - ${project.name}`,
                  }))
                : []
            }
            placeholder={unlinkedProjects.length === 0 ? 'Nenhum projeto para vincular' : undefined}
          />
        )}

        {addType === 'folder' && (
          <FormField label="Nome da Pasta">
            <Input
              type="text"
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              aria-label="Nome da pasta"
            />
          </FormField>
        )}

        {addType === 'upload' && (
          <div>
            <label
              htmlFor="field-arquivos"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Arquivos
            </label>
            <input
              id="field-arquivos"
              type="file"
              multiple
              onChange={(event) => setFilesToUpload(event.target.files)}
              className={`${fileInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20`}
              aria-label="Selecionar arquivos"
            />
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Salvar
        </Button>
      </div>
    </Modal>
  );
};
