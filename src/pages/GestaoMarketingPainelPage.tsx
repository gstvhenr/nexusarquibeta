import React from 'react';
import GestaoMarketingPage from './GestaoMarketingPage';

/**
 * Route wrapper for `/gestao-marketing/painel`.
 * Keeps a stable route entry while the real implementation lives in `GestaoMarketingPage`.
 */
const GestaoMarketingPainelPage: () => React.ReactNode = () => {
  return <GestaoMarketingPage />;
};

export default GestaoMarketingPainelPage;
