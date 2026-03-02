import React from 'react';
import DocumentosPage from './DocumentosPage';

/**
 * Route wrapper for `/documentos/projetos`.
 * Keeps a stable route entry while the real implementation lives in `DocumentosPage`.
 */
const DocumentosProjetosPage: () => React.ReactNode = () => {
  return <DocumentosPage />;
};

export default DocumentosProjetosPage;
