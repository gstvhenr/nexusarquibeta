import React from 'react';
import GestaoMarketingPage from './GestaoMarketingPage';

/**
 * Route wrapper for `/gestao-marketing/banco-de-ideias`.
 * Keeps a stable route entry while the real implementation lives in `GestaoMarketingPage`.
 */
const GestaoMarketingBancoIdeiasPage: () => React.ReactNode = () => {
  return <GestaoMarketingPage />;
};

export default GestaoMarketingBancoIdeiasPage;
