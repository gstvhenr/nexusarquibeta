import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header, Sidebar } from './components/layout';
import {
  AgendaPage,
  CatalogoPage,
  ClienteDetalhesPage,
  ClientesPage,
  ComissoesPage,
  ConfiguracoesPage,
  CotacaoDetalhesPage,
  CotacoesPage,
  DocumentosPessoalPage,
  DocumentosProjetosPage,
  FinanceiroDebitosPage,
  FinanceiroRecebiveisPage,
  FinanceiroVisaoGeralPage,
  FornecedoresPage,
  GestaoMarketingPainelPage,
  GestaoMarketingConteudosPage,
  GestaoMarketingBancoIdeiasPage,
  HomePage,
  OrcamentosPage,
  PrestadoresFreelancersPage,
  ProjetoDetalhesPage,
  ProjetosPage,
  PropostaDetalhesPage,
  PropostasPage,
  ProspectsPage,
  RedesSociaisPage,
  RelatoriosPage,
  ServicosContratadosPage,
  TarefasPage,
} from './pages';

const App: React.FC = () => {
  const location = useLocation();
  const isSpecialPage =
    location.pathname.startsWith('/agenda') ||
    location.pathname.startsWith('/financeiro') ||
    location.pathname.startsWith('/prestadores-freelancers');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className={`bg-background font-sans text-text-primary ${isSpecialPage ? 'h-screen overflow-hidden' : ''}`}
    >
      <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />

      <div
        className={`flex flex-col md:pl-64 lg:pl-80 ${isSpecialPage ? 'h-full' : 'min-h-screen'}`}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className={`flex-1 flex flex-col ${isSpecialPage ? '' : 'p-4 md:p-6 lg:p-10'}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/agenda" element={<Navigate to="/agenda/calendario" replace />} />
            <Route path="/agenda/calendario" element={<AgendaPage />} />
            <Route path="/agenda/tarefas" element={<TarefasPage />} />

            <Route path="/prospects" element={<ProspectsPage />} />
            <Route path="/propostas" element={<PropostasPage />} />
            <Route path="/propostas/:id" element={<PropostaDetalhesPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/clientes/:id" element={<ClienteDetalhesPage />} />
            <Route path="/orcamentos" element={<OrcamentosPage />} />
            <Route path="/projetos" element={<ProjetosPage />} />
            <Route path="/projetos/:id" element={<ProjetoDetalhesPage />} />
            <Route path="/financeiro" element={<Navigate to="/financeiro/visao-geral" replace />} />
            <Route path="/financeiro/visao-geral" element={<FinanceiroVisaoGeralPage />} />
            <Route path="/financeiro/recebiveis" element={<FinanceiroRecebiveisPage />} />
            <Route path="/financeiro/debitos" element={<FinanceiroDebitosPage />} />
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
            <Route path="/gestao-marketing/conteudos" element={<GestaoMarketingConteudosPage />} />
            <Route
              path="/gestao-marketing/banco-de-ideias"
              element={<GestaoMarketingBancoIdeiasPage />}
            />
            <Route path="/gestao-marketing/redes-sociais" element={<RedesSociaisPage />} />
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
        </main>
      </div>
    </div>
  );
};

export default App;
