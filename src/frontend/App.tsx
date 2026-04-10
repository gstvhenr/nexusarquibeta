import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header, Sidebar, RouteErrorBoundary } from './components/layout';
import LoadingFallback from './components/ui/LoadingFallback';
import { DriveApiToast } from './components/drive/DriveApiToast';
import { localDriveService } from './services/infrastructure/localDriveService';
import { googleDriveService } from './services/infrastructure/googleDriveService';

// Critical-path page: loaded eagerly for instant first paint.
import HomePage from './pages/home/HomePage';

// All other pages: lazy-loaded on navigation for smaller initial bundle.
const AgendaPage = lazy(() => import('./pages/agenda'));
const BlocoDeNotasPage = lazy(() => import('./pages/agenda/bloco-de-notas/BlocoDeNotasPage'));
const CatalogoPage = lazy(() => import('./pages/suprimentos/catalogo/CatalogoPage'));
const ClienteDetalhesPage = lazy(() => import('./pages/clientes/detalhes'));
const ClientesPage = lazy(() => import('./pages/clientes'));
const ComissoesPage = lazy(() => import('./pages/suprimentos/comissoes'));
const ConfiguracoesPage = lazy(() => import('./pages/configuracoes'));
const CotacaoDetalhesPage = lazy(() => import('./pages/suprimentos/cotacoes/CotacaoDetalhesPage'));
const CotacoesPage = lazy(() => import('./pages/suprimentos/cotacoes/CotacoesPage'));
const DocumentosPessoalPage = lazy(() => import('./pages/documentos'));
const DocumentosProjetosPage = lazy(() => import('./pages/documentos/DocumentosProjetosPage'));
const FinanceiroGestaoCaixaPage = lazy(() => import('./pages/financeiro/gestao-caixa'));
const FinanceiroHistoricoPage = lazy(() => import('./pages/financeiro/historico'));
const FinanceiroPrevisaoCaixaPage = lazy(
  () => import('./pages/financeiro/FinanceiroPrevisaoCaixaPage'),
);
const FinanceiroVisaoGeralPage = lazy(() => import('./pages/financeiro'));
const FornecedoresPage = lazy(() => import('./pages/suprimentos/fornecedores/FornecedoresPage'));
const GestaoMarketingConteudosPage = lazy(
  () => import('./pages/gestao-marketing/GestaoMarketingConteudosPage'),
);

const InstagramPage = lazy(() => import('./pages/gestao-marketing/redes-sociais/InstagramPage'));
const FacebookPage = lazy(() => import('./pages/gestao-marketing/redes-sociais/FacebookPage'));
const LinkedInPage = lazy(() => import('./pages/gestao-marketing/redes-sociais/LinkedInPage'));
const TikTokPage = lazy(() => import('./pages/gestao-marketing/redes-sociais/TikTokPage'));
const YouTubePage = lazy(() => import('./pages/gestao-marketing/redes-sociais/YouTubePage'));
const GooglePage = lazy(() => import('./pages/gestao-marketing/redes-sociais/GooglePage'));
const LembretesPage = lazy(() => import('./pages/agenda/lembretes/LembretesPage'));
const OrcamentosPage = lazy(() => import('./pages/comercial/orcamentos'));
const PrestadoresFreelancersPage = lazy(() => import('./pages/prestadores-freelancers'));
const ProjetoDetalhesPage = lazy(() => import('./pages/projetos/detalhes'));
const ProjetosPage = lazy(() => import('./pages/projetos'));
const PropostaDetalhesPage = lazy(() => import('./pages/comercial/propostas/PropostaDetalhesPage'));
const PropostasPage = lazy(() => import('./pages/comercial/propostas'));
const ProspectsPage = lazy(() => import('./pages/comercial/prospects'));
const RedesSociaisPage = lazy(() => import('./pages/gestao-marketing/redes-sociais'));
const RelatoriosPage = lazy(() => import('./pages/relatorios'));
const ServicosContratadosPage = lazy(
  () => import('./pages/prestadores-freelancers/servicos-contratados/ServicosContratadosPage'),
);
const TarefasPage = lazy(() => import('./pages/agenda/tarefas'));

const App: () => React.ReactNode = () => {
  const location = useLocation();
  const isSpecialPage =
    location.pathname.startsWith('/agenda') ||
    location.pathname.startsWith('/financeiro') ||
    location.pathname.startsWith('/prestadores-freelancers') ||
    location.pathname.startsWith('/fornecedores');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showDriveToast, setShowDriveToast] = useState(false);

  useEffect(() => {
    async function connectDrive(): Promise<void> {
      // 1. Verificar se voltamos de um redirect do Google (token no hash)
      const connected = await googleDriveService.handleRedirectCallback();
      if (connected) return;

      // 2. Se tem pasta local, não precisa de API
      const hasFolder = await localDriveService.hasSavedFolder();
      if (hasFolder) return;

      // 3. Sem pasta local e sem token → redirecionar ao Google
      googleDriveService.signIn().catch(() => {
        /* redirect em progresso ou erro silenciado */
      });
    }

    connectDrive();

    const unsubscribe = googleDriveService.subscribe((driveState) => {
      if (driveState.status === 'connected') {
        setShowDriveToast(true);
      }
    });
    return unsubscribe;
  }, []);

  const mainPaddingClass = 'px-2 pt-2 md:px-4 md:pt-4 lg:px-6 lg:pt-6 pb-4 md:pb-5';

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
          <RouteErrorBoundary key={location.pathname}>
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
                <Route
                  path="/financeiro/previsao-caixa"
                  element={<FinanceiroPrevisaoCaixaPage />}
                />
                <Route path="/financeiro/historico" element={<FinanceiroHistoricoPage />} />
                <Route
                  path="/financeiro/recebiveis"
                  element={<Navigate to="/financeiro/historico?tipo=credit" replace />}
                />
                <Route
                  path="/financeiro/debitos"
                  element={<Navigate to="/financeiro/historico?tipo=debit" replace />}
                />
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
                  element={<Navigate to="/gestao-marketing/conteudos" replace />}
                />
                <Route
                  path="/gestao-marketing/conteudos"
                  element={<GestaoMarketingConteudosPage />}
                />

                <Route path="/gestao-marketing/redes-sociais" element={<RedesSociaisPage />} />
                <Route
                  path="/gestao-marketing/redes-sociais/Instagram"
                  element={<InstagramPage />}
                />
                <Route path="/gestao-marketing/redes-sociais/Facebook" element={<FacebookPage />} />
                <Route path="/gestao-marketing/redes-sociais/LinkedIn" element={<LinkedInPage />} />
                <Route path="/gestao-marketing/redes-sociais/TikTok" element={<TikTokPage />} />
                <Route path="/gestao-marketing/redes-sociais/YouTube" element={<YouTubePage />} />
                <Route path="/gestao-marketing/redes-sociais/Google" element={<GooglePage />} />
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
                <Route path="/relatorios" element={<RelatoriosPage />} />
                <Route path="/configuracoes" element={<ConfiguracoesPage />} />
              </Routes>
            </Suspense>
          </RouteErrorBoundary>
        </main>
      </div>

      <DriveApiToast visible={showDriveToast} onDismiss={() => setShowDriveToast(false)} />
    </div>
  );
};

export default App;
