import React from 'react';
import DocumentosPage from './DocumentosPage';

/**
 * Route wrapper for `/documentos/pessoal`.
 * Keeps a stable route entry while the real implementation lives in `DocumentosPage`.
 */
const DocumentosPessoalPage: () => React.ReactNode = () => {
  return <DocumentosPage />;
};

export default DocumentosPessoalPage;
