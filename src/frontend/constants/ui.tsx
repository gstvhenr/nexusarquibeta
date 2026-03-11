import React from 'react';
import type { NavLinkItem, ProjectStatus, SocialNetworkName } from '../types';
import {
  AgendaIcon,
  BadgeIcon,
  BancoDeIdeiasIcon,
  BellAlertIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarPlusIcon,
  CanceledIcon,
  CashIcon,
  ChartBarIcon,
  StackedCoinsIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ConteudosIcon,
  CubeIcon,
  DocumentosIcon,
  DocumentosProjetosIcon,
  FacebookIcon,
  FinanceiroIcon,
  CashBoxIcon,
  GiftIcon,
  HomeIcon,
  GoogleIcon,
  InstagramIcon,
  LinkedInIcon,
  MarketingIconNew,
  MeusDocumentosIcon,
  NotStartedIcon,
  OrcamentosIcon,
  PausedIcon,
  PainelIcon,
  ProjetosIcon,
  ProposalIcon,
  RedesSociaisIcon,
  RelatoriosIcon,
  SearchIcon,
  SettingsIcon,
  SubcontratacaoIcon,
  SuprimentosIcon,
  TikTokIcon,
  UserPlusIcon,
  UsersIcon,
  YouTubeIcon,
  FileTextIcon,
} from '../components/ui/icons';

export const NAV_LINKS: NavLinkItem[] = [
  { path: '/', label: 'Home', icon: <HomeIcon />, iconName: 'HomeIcon' },
  {
    label: 'Agenda',
    icon: <AgendaIcon />,
    iconName: 'AgendaIcon',
    children: [
      {
        path: '/agenda/calendario',
        label: 'Calendário',
        icon: <CalendarPlusIcon />,
        iconName: 'CalendarPlusIcon',
      },
      {
        path: '/agenda/tarefas',
        label: 'Tarefas',
        icon: <ClipboardDocumentListIcon />,
        iconName: 'ClipboardDocumentListIcon',
      },
      {
        path: '/agenda/lembretes',
        label: 'Lembretes',
        icon: <BellAlertIcon />,
        iconName: 'BellAlertIcon',
      },
      {
        path: '/agenda/bloco-de-notas',
        label: 'Anotações',
        icon: <FileTextIcon />,
        iconName: 'FileTextIcon',
      },
    ],
  },
  {
    label: 'Comercial',
    icon: <BriefcaseIcon />,
    iconName: 'BriefcaseIcon',
    children: [
      { path: '/prospects', label: 'Prospects', icon: <UserPlusIcon />, iconName: 'UserPlusIcon' },
      {
        path: '/orcamentos',
        label: 'Orçamentos',
        icon: <OrcamentosIcon />,
        iconName: 'OrcamentosIcon',
      },
      { path: '/propostas', label: 'Propostas', icon: <ProposalIcon />, iconName: 'ProposalIcon' },
    ],
  },
  { path: '/projetos', label: 'Projetos', icon: <ProjetosIcon />, iconName: 'ProjetosIcon' },
  { path: '/clientes', label: 'Clientes', icon: <UsersIcon />, iconName: 'UsersIcon' },
  {
    label: 'Financeiro',
    icon: <FinanceiroIcon />,
    iconName: 'FinanceiroIcon',
    children: [
      {
        path: '/financeiro/gestao-caixa',
        label: 'Gestão de Caixa',
        icon: <CashBoxIcon />,
        iconName: 'CashBoxIcon',
      },
      {
        path: '/financeiro/visao-geral',
        label: 'Visão Geral',
        icon: <StackedCoinsIcon />,
        iconName: 'StackedCoinsIcon',
      },
      {
        path: '/financeiro/previsao-caixa',
        label: 'Previsão de Caixa',
        icon: <ChartBarIcon />,
        iconName: 'ChartBarIcon',
      },
      {
        path: '/financeiro/historico',
        label: 'Histórico Financeiro',
        icon: <CashIcon />,
        iconName: 'CashIcon',
      },
    ],
  },
  {
    label: 'Documentos',
    icon: <DocumentosIcon />,
    iconName: 'DocumentosIcon',
    children: [
      {
        path: '/documentos/pessoal',
        label: 'Meus Documentos',
        icon: <MeusDocumentosIcon />,
        iconName: 'MeusDocumentosIcon',
      },
      {
        path: '/documentos/projetos',
        label: 'Documentos de Projetos',
        icon: <DocumentosProjetosIcon />,
        iconName: 'DocumentosProjetosIcon',
      },
    ],
  },
  {
    label: 'Suprimentos',
    icon: <SuprimentosIcon />,
    iconName: 'SuprimentosIcon',
    children: [
      {
        path: '/fornecedores',
        label: 'Fornecedores',
        icon: <BuildingIcon />,
        iconName: 'BuildingIcon',
      },
      {
        path: '/catalogo',
        label: 'Catálogo de Produtos',
        icon: <CubeIcon />,
        iconName: 'CubeIcon',
      },
      {
        path: '/cotacoes',
        label: 'Cotações',
        icon: <ClipboardDocumentListIcon />,
        iconName: 'ClipboardDocumentListIcon',
      },
      { path: '/comissoes', label: 'Comissões', icon: <GiftIcon />, iconName: 'GiftIcon' },
    ],
  },
  {
    label: 'Marketing',
    icon: <MarketingIconNew />,
    iconName: 'MarketingIconNew',
    children: [
      {
        path: '/gestao-marketing/painel',
        label: 'Painel',
        icon: <PainelIcon />,
        iconName: 'PainelIcon',
      },
      {
        path: '/gestao-marketing/conteudos',
        label: 'Conteúdos',
        icon: <ConteudosIcon />,
        iconName: 'ConteudosIcon',
      },
      {
        path: '/gestao-marketing/banco-de-ideias',
        label: 'Banco de Ideias',
        icon: <BancoDeIdeiasIcon />,
        iconName: 'BancoDeIdeiasIcon',
      },
      {
        path: '/gestao-marketing/redes-sociais',
        label: 'Redes Sociais',
        icon: <RedesSociaisIcon />,
        iconName: 'RedesSociaisIcon',
      },
    ],
  },
  {
    label: 'Subcontratação',
    icon: <SubcontratacaoIcon />,
    iconName: 'SubcontratacaoIcon',
    children: [
      {
        path: '/prestadores-freelancers/visao-geral',
        label: 'Freelancers',
        icon: <BadgeIcon />,
        iconName: 'BadgeIcon',
      },
      {
        path: '/prestadores-freelancers/servicos-contratados',
        label: 'Serviços Contratados',
        icon: <ClipboardDocumentListIcon />,
        iconName: 'ClipboardDocumentListIcon',
      },
    ],
  },
  {
    path: '/relatorios',
    label: 'Relatórios',
    icon: <RelatoriosIcon />,
    iconName: 'RelatoriosIcon',
  },
];

export const SETTINGS_LINK: NavLinkItem = {
  path: '/configuracoes',
  label: 'Configurações',
  icon: <SettingsIcon />,
  iconName: 'SettingsIcon',
};

export const PROJECT_STATUS_COLORS: Record<
  ProjectStatus,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  'Não Iniciado': {
    bg: 'bg-surface',
    text: 'text-text-secondary',
    border: 'border-border-color',
    icon: <NotStartedIcon />,
  },
  'Em Andamento': {
    bg: 'bg-info/20',
    text: 'text-info',
    border: 'border-info',
    icon: <SearchIcon />,
  },
  Pausado: {
    bg: 'bg-warning/20',
    text: 'text-warning',
    border: 'border-warning',
    icon: <PausedIcon />,
  },
  Concluído: {
    bg: 'bg-success/20',
    text: 'text-success',
    border: 'border-success',
    icon: <CheckCircleIcon />,
  },
  Cancelado: {
    bg: 'bg-error/20',
    text: 'text-error',
    border: 'border-error',
    icon: <CanceledIcon />,
  },
};

export const SOCIAL_NETWORKS_SUPPORTED: {
  id: SocialNetworkName;
  name: string;
  icon: React.ReactElement<{ className?: string }>;
  color: string;
  placeholder: string;
}[] = [
  {
    id: 'Instagram',
    name: 'Instagram',
    icon: <InstagramIcon />,
    color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
    placeholder: 'https://instagram.com/seu_usuario',
  },
  {
    id: 'Facebook',
    name: 'Facebook',
    icon: <FacebookIcon />,
    color: 'bg-blue-600',
    placeholder: 'https://facebook.com/sua_pagina',
  },
  {
    id: 'LinkedIn',
    name: 'LinkedIn',
    icon: <LinkedInIcon />,
    color: 'bg-sky-700',
    placeholder: 'https://linkedin.com/in/seu_perfil',
  },
  {
    id: 'TikTok',
    name: 'TikTok',
    icon: <TikTokIcon />,
    color: 'bg-black',
    placeholder: 'https://tiktok.com/@seu_usuario',
  },
  {
    id: 'YouTube',
    name: 'YouTube',
    icon: <YouTubeIcon />,
    color: 'bg-red-600',
    placeholder: 'https://youtube.com/c/seu_canal',
  },
  {
    id: 'Google',
    name: 'Google',
    icon: <GoogleIcon />,
    color: 'bg-blue-500',
    placeholder: 'https://g.page/sua_empresa',
  },
];

// --- Finance Presentation Constants (#5 — moved from financeService.ts) ---
export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  // Professional (legacy)
  'Software e Assinaturas': 'hsl(210, 70%, 55%)',
  'Impostos (DAS, INSS)': 'hsl(0, 60%, 55%)',
  'Anuidade de Conselho (CAU/CREA)': 'hsl(30, 70%, 55%)',
  'Marketing e Publicidade': 'hsl(280, 60%, 55%)',
  'Material de Escritório': 'hsl(180, 50%, 50%)',
  Contabilidade: 'hsl(150, 50%, 50%)',
  'Cursos e Especializações': 'hsl(50, 70%, 50%)',
  'Transporte e Viagens': 'hsl(330, 55%, 55%)',
  'Aluguel de Escritório': 'hsl(240, 50%, 55%)',
  'Serviços Terceirizados': 'hsl(100, 45%, 50%)',
  'Reembolso a Cliente': 'hsl(350, 45%, 55%)',
  Outros: 'hsl(0, 0%, 55%)',
  // CashBox — Professional
  Escritório: 'hsl(215, 60%, 50%)',
  Ferramentas: 'hsl(195, 55%, 48%)',
  Marketing: 'hsl(275, 55%, 55%)',
  Impostos: 'hsl(5, 60%, 52%)',
  'Serviços Profissionais': 'hsl(160, 50%, 48%)',
  Equipamentos: 'hsl(35, 65%, 50%)',
  'Taxas e Licenças': 'hsl(55, 55%, 48%)',
  'Seguro Profissional': 'hsl(300, 40%, 50%)',
  Comunicação: 'hsl(190, 55%, 50%)',
  'Capacitação e Educação': 'hsl(45, 70%, 48%)',
  'Veículo Profissional': 'hsl(340, 50%, 50%)',
  // CashBox — Personal
  Alimentação: 'hsl(15, 70%, 52%)',
  Desenvolvimento: 'hsl(260, 50%, 55%)',
  Educação: 'hsl(48, 65%, 48%)',
  Estabelecimento: 'hsl(220, 50%, 50%)',
  Família: 'hsl(320, 45%, 52%)',
  Lazer: 'hsl(170, 55%, 48%)',
  Moradia: 'hsl(200, 55%, 50%)',
  Roupas: 'hsl(290, 45%, 52%)',
  Saúde: 'hsl(140, 60%, 45%)',
  Seguros: 'hsl(25, 55%, 48%)',
  Streaming: 'hsl(265, 55%, 55%)',
  'Cuidados Pessoais': 'hsl(345, 50%, 52%)',
  Transporte: 'hsl(330, 50%, 50%)',
  'Pets e Animais': 'hsl(80, 50%, 48%)',
};

/** Colors for receivable-by-source donut slices (income toggle). */
export const RECEIVABLE_SOURCE_COLORS: Record<string, string> = {
  Projeto: 'hsl(160, 60%, 45%)',
  Comissão: 'hsl(200, 55%, 50%)',
  Consultoria: 'hsl(140, 50%, 48%)',
  Reembolso: 'hsl(45, 65%, 50%)',
  Rendimento: 'hsl(270, 50%, 55%)',
  Outros: 'hsl(0, 0%, 55%)',
};
