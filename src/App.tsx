import React, { lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header, Sidebar } from './components/layout';
import LoadingFallback from './components/ui/LoadingFallback';

// Critical-path page: loaded eagerly for instant first paint.
import HomePage from './pages/HomePage';

// All other pages: lazy-loaded on navigation for smaller initial bundle.
const AgendaPage = lazy(() => import('./pages/AgendaPage'));
const BlocoDeNotasPage = lazy(() => import('./pages/BlocoDeNotasPage'));
const CatalogoPage = lazy(() => import('./pages/CatalogoPage'));
const ClienteDetalhesPage = lazy(() => import('./pages/ClienteDetalhesPage'));
const ClientesPage = lazy(() => import('./pages/ClientesPage'));
const ComissoesPage = lazy(() => import('./pages/ComissoesPage'));
const ConfiguracoesPage = lazy(() => import('./pages/ConfiguracoesPage'));
const CotacaoDetalhesPage = lazy(() => import('./pages/CotacaoDetalhesPage'));
const CotacoesPage = lazy(() => import('./pages/CotacoesPage'));
const DocumentosPessoalPage = lazy(() => import('./pages/DocumentosPessoalPage'));
const DocumentosProjetosPage = lazy(() => import('./pages/DocumentosProjetosPage'));
const FinanceiroDebitosPage = lazy(() => import('./pages/FinanceiroDebitosPage'));
const FinanceiroGestaoCaixaPage = lazy(() => import('./pages/FinanceiroGestaoCaixaPage'));
const FinanceiroPrevisaoCaixaPage = lazy(() => import('./pages/FinanceiroPrevisaoCaixaPage'));
const FinanceiroRecebiveisPage = lazy(() => import('./pages/FinanceiroRecebiveisPage'));
const FinanceiroVisaoGeralPage = lazy(() => import('./pages/FinanceiroVisaoGeralPage'));
const FornecedoresPage = lazy(() => import('./pages/FornecedoresPage'));
const GestaoMarketingPainelPage = lazy(() => import('./pages/GestaoMarketingPainelPage'));
const GestaoMarketingConteudosPage = lazy(() => import('./pages/GestaoMarketingConteudosPage'));
const GestaoMarketingBancoIdeiasPage = lazy(() => import('./pages/GestaoMarketingBancoIdeiasPage'));
const InstagramDetailPage = lazy(() => import('./pages/InstagramDetailPage'));
const LembretesPage = lazy(() => import('./pages/LembretesPage'));
const OrcamentosPage = lazy(() => import('./pages/OrcamentosPage'));
const PrestadoresFreelancersPage = lazy(() => import('./pages/PrestadoresFreelancersPage'));
const ProjetoDetalhesPage = lazy(() => import('./pages/ProjetoDetalhesPage'));
const ProjetosPage = lazy(() => import('./pages/ProjetosPage'));
const PropostaDetalhesPage = lazy(() => import('./pages/PropostaDetalhesPage'));
const PropostasPage = lazy(() => import('./pages/PropostasPage'));
const ProspectsPage = lazy(() => import('./pages/ProspectsPage'));
const RedesSociaisPage = lazy(() => import('./pages/RedesSociaisPage'));
const RelatoriosLayout = lazy(() => import('./pages/RelatoriosLayout'));
const RelatorioFinanceiroPage = lazy(() => import('./pages/RelatorioFinanceiroPage'));
const RelatorioProjetosPage = lazy(() => import('./pages/RelatorioProjetosPage'));
const RelatorioAquisicaoPage = lazy(() => import('./pages/RelatorioAquisicaoPage'));
const ServicosContratadosPage = lazy(() => import('./pages/ServicosContratadosPage'));
const TarefasPage = lazy(() => import('./pages/TarefasPage'));

const App: () => React.ReactNode = () => {
  const location = useLocation();
  const isSpecialPage =
    location.pathname.startsWith('/agenda') ||
    location.pathname.startsWith('/financeiro') ||
    location.pathname.startsWith('/prestadores-freelancers');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const standardBottomPaddingClass = 'pb-4 md:pb-5';
  const mainPaddingClass = isSpecialPage
    ? standardBottomPaddingClass
    : `px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6 ${standardBottomPaddingClass}`;

  return (
    <div
      className={`bg-background font-sans text-text-primary ${isSpecialPage ? 'h-screen overflow-hidden' : ''}`}
    >
      <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />

      <div
        className={`flex flex-col md:pl-64 lg:pl-80 ${isSpecialPage ? 'h-full' : 'min-h-screen'}`}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className={`flex-1 flex flex-col min-h-0 ${mainPaddingClass}`}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />

              <Route path="/agenda" element={<Navigate to="/agenda/calendario" replace />} />
              <Route path="/agenda/calendario" element={<AgendaPage />} />
              <Route path="/agenda/tarefas" element={<TarefasPage />} />
              <Route path="/agenda/lembretes" element={<LembretesPage />} />
              <Route path="/agenda/bloco-de-notas" element={<BlocoDeNotasPage />} />

              <Route path="/prospects" element={<ProspectsPage />} />
              <Route path="/propostas" element={<PropostasPage />} />
              <Route path="/propostas/:id" element={<PropostaDetalhesPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/clientes/:id" element={<ClienteDetalhesPage />} />
              <Route path="/orcamentos" element={<OrcamentosPage />} />
              <Route path="/projetos" element={<ProjetosPage />} />
              <Route path="/projetos/:id" element={<ProjetoDetalhesPage />} />
              <Route
                path="/financeiro"
                element={<Navigate to="/financeiro/visao-geral" replace />}
              />
              <Route path="/financeiro/visao-geral" element={<FinanceiroVisaoGeralPage />} />
              <Route path="/financeiro/previsao-caixa" element={<FinanceiroPrevisaoCaixaPage />} />
              <Route path="/financeiro/recebiveis" element={<FinanceiroRecebiveisPage />} />
              <Route path="/financeiro/debitos" element={<FinanceiroDebitosPage />} />
              <Route path="/financeiro/gestao-caixa" element={<FinanceiroGestaoCaixaPage />} />
              <Route path="/documentos" element={<Navigate to="/documentos/pessoal" replace />} />
              <Route path="/documentos/pessoal" element={<DocumentosPessoalPage />} />
              <Route path="/documentos/projetos" element={<DocumentosProjetosPage />} />
              <Route path="/fornecedores" element={<FornecedoresPage />} />
              <Route path="/catalogo" element={<CatalogoPage />} />
              <Route path="/cotacoes" element={<CotacoesPage />} />
              <Route path="/cotacoes/:id" element={<CotacaoDetalhesPage />} />
              <Route path="/comissoes" element={<ComissoesPage />} />
              <Route
                path="/gestao-marketing"
                element={<Navigate to="/gestao-marketing/painel" replace />}
              />
              <Route path="/gestao-marketing/painel" element={<GestaoMarketingPainelPage />} />
              <Route
                path="/gestao-marketing/conteudos"
                element={<GestaoMarketingConteudosPage />}
              />
              <Route
                path="/gestao-marketing/banco-de-ideias"
                element={<GestaoMarketingBancoIdeiasPage />}
              />
              <Route path="/gestao-marketing/redes-sociais" element={<RedesSociaisPage />} />
              <Route
                path="/gestao-marketing/redes-sociais/:networkId"
                element={<InstagramDetailPage />}
              />
              <Route
                path="/prestadores-freelancers"
                element={<Navigate to="/prestadores-freelancers/visao-geral" replace />}
              />
              <Route
                path="/prestadores-freelancers/visao-geral"
                element={<PrestadoresFreelancersPage />}
              />
              <Route
                path="/prestadores-freelancers/servicos-contratados"
                element={<ServicosContratadosPage />}
              />
              <Route path="/relatorios/*" element={<RelatoriosLayout />}>
                <Route index element={<Navigate to="/relatorios/financeiro" replace />} />
                <Route path="financeiro" element={<RelatorioFinanceiroPage />} />
                <Route path="projetos" element={<RelatorioProjetosPage />} />
                <Route path="aquisicao" element={<RelatorioAquisicaoPage />} />
              </Route>
              <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;
