import React from 'react';
import GestaoMarketingPage from './GestaoMarketingPage';

/**
 * Route wrapper for `/gestao-marketing/conteudos`.
 * Keeps a stable route entry while the real implementation lives in `GestaoMarketingPage`.
 */
const GestaoMarketingConteudosPage: () => React.ReactNode = () => {
  return <GestaoMarketingPage />;
};

export default GestaoMarketingConteudosPage;
