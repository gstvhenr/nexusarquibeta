import React from 'react';
import { Icon } from './iconBase';

// --- NAVEGAÇÃO PRINCIPAL ---

export const HomeIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Icon>
);

export const AgendaIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </Icon>
);

export const BriefcaseIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Icon>
);

export const ProjetosIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M3 3h18v18H3z" />
    <path d="M9 3v18" />
    <path d="M15 9h6" />
    <path d="M3 9h6" />
    <path d="M3 15h18" />
  </Icon>
);

export const UsersIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

export const FinanceiroIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </Icon>
);

export const DocumentosIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </Icon>
);

export const SuprimentosIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" x2="12" y1="22" y2="12" />
  </Icon>
);

export const MarketingIconNew: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </Icon>
);

export const SubcontratacaoIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Icon>
);

export const RelatoriosIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <line x1="8" x2="16" y1="12" y2="12" />
    <line x1="8" x2="16" y1="8" y2="8" />
    <line x1="8" x2="10" y1="16" y2="16" />
  </Icon>
);

export const SettingsIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="8" cy="18" r="2" />
  </Icon>
);
