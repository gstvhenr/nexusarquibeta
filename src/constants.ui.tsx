import React from 'react';
import type { NavLinkItem, ProjectStatus, SocialNetworkName } from './types';
import {
  AgendaIcon,
  BadgeIcon,
  BancoDeIdeiasIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarPlusIcon,
  CanceledIcon,
  CashIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ConteudosIcon,
  CreditCardIcon,
  CubeIcon,
  DocumentosIcon,
  DocumentosProjetosIcon,
  FacebookIcon,
  FinanceiroIcon,
  GiftIcon,
  HomeIcon,
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
} from './components/ui/icons';

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
        path: '/financeiro/visao-geral',
        label: 'Visão Geral',
        icon: <ChartBarIcon />,
        iconName: 'ChartBarIcon',
      },
      {
        path: '/financeiro/recebiveis',
        label: 'Recebíveis',
        icon: <CashIcon />,
        iconName: 'CashIcon',
      },
      {
        path: '/financeiro/debitos',
        label: 'Débitos',
        icon: <CreditCardIcon />,
        iconName: 'CreditCardIcon',
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
];

// --- Finance Presentation Constants (#5 — moved from financeService.ts) ---
export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
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
};
