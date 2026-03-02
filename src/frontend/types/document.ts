// --- Document Types ---
type DocumentSourceType = 'upload' | 'link';
export type DocumentStatus = 'Em Revisão' | 'Aprovado' | 'Versão Final' | 'Obsoleto';

export interface DocumentSource {
  id: string;
  type: DocumentSourceType;
  content: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  dateAdded: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: 'file';
  sources: DocumentSource[];
  primarySourceId: string;
  dateAdded: string;
  dateModified: string;
  tags?: string[];
  status?: DocumentStatus;
  parentId?: string; // SQL Foreign Key Preparation (Folder ID)
}

export interface DocumentFolder {
  id: string;
  name: string;
  type: 'folder';
  children: (DocumentFolder | DocumentFile)[];
  dateAdded: string;
  dateModified: string;
  projectId?: string;
  projectCode?: string;
  parentId?: string; // SQL Foreign Key Preparation (Parent Folder ID)
}

export type DocumentItem = DocumentFile | DocumentFolder;

export interface DocumentStorage {
  personal: DocumentFolder;
  projects: DocumentFolder;
}
