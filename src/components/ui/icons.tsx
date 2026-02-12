import React from 'react';

// Wrapper padrão para ícones.
const Icon: React.FC<{
  children: React.ReactNode;
  className?: string;
  viewBox?: string;
  fill?: string;
  strokeWidth?: number;
}> = ({
  children,
  className = 'w-6 h-6',
  viewBox = '0 0 24 24',
  fill = 'none',
  strokeWidth = 1.5,
}) => (
  <svg
    className={className}
    fill={fill}
    viewBox={viewBox}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

// --- LOGO ---
export const LogoIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="365 197 1416 1549"
    fill="none"
    className={className}
  >
    <defs>
      <linearGradient id="nexus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.65" />
      </linearGradient>
      <filter id="nexus-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
      </filter>
    </defs>
    <path
      d="M 768.0 1726.5 L 384.5 1549.0 L 384.5 407.0 L 765.0 216.5 L 1316.5 764.0 L 1316.0 1073.5 L 767.5 558.0 Z"
      fill="url(#nexus-gradient)"
      filter="url(#nexus-shadow)"
    />
    <path
      d="M 1384.0 1720.5 L 831.5 1186.0 L 831.5 880.0 L 1383.5 1405.0 L 1386.0 219.5 L 1761.5 407.0 L 1761.5 1550.0 Z"
      fill="url(#nexus-gradient)"
      filter="url(#nexus-shadow)"
    />
  </svg>
);

// --- NAVEGAÇÃO PRINCIPAL ---

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Icon>
);

export const AgendaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </Icon>
);

export const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Icon>
);

export const ProjetosIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M3 3h18v18H3z" />
    <path d="M9 3v18" />
    <path d="M15 9h6" />
    <path d="M3 9h6" />
    <path d="M3 15h18" />
  </Icon>
);

export const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

export const FinanceiroIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </Icon>
);

export const DocumentosIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </Icon>
);

export const SuprimentosIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" x2="12" y1="22" y2="12" />
  </Icon>
);

export const MarketingIconNew: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </Icon>
);

export const SubcontratacaoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Icon>
);

export const RelatoriosIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <line x1="8" x2="16" y1="12" y2="12" />
    <line x1="8" x2="16" y1="8" y2="8" />
    <line x1="8" x2="10" y1="16" y2="16" />
  </Icon>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="8" cy="18" r="2" />
  </Icon>
);

// --- SUBMENUS & AÇÕES ---

export const UserPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="20" x2="20" y1="8" y2="14" />
    <line x1="23" x2="17" y1="11" y2="11" />
  </Icon>
);

export const OrcamentosIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </Icon>
);

export const ProposalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </Icon>
);

// Financeiro Sub
export const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </Icon>
);
export const CashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </Icon>
);
export const CreditCardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1Z" />
    <line x1="16" x2="8" y1="8" y2="8" />
    <line x1="16" x2="8" y1="12" y2="12" />
    <line x1="10" x2="8" y1="16" y2="16" />
  </Icon>
);
export const DollarSignIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Icon>
);

// Documentos Sub
export const MeusDocumentosIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    <path d="M12 10v6" />
    <path d="M9 13h6" />
  </Icon>
);
export const DocumentosProjetosIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    <path d="M12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
  </Icon>
);

// Suprimentos Sub
export const BuildingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </Icon>
);
export const CubeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </Icon>
);
export const ClipboardDocumentListIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </Icon>
);
export const GiftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <line x1="19" x2="5" y1="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </Icon>
);

// Marketing Sub
export const PainelIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </Icon>
);
export const ConteudosIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 14h6" />
    <path d="M9 10h6" />
    <path d="M9 18h6" />
  </Icon>
);
export const BancoDeIdeiasIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5a6 6 0 0 0-11 0c0 1.5.5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </Icon>
);
export const RedesSociaisIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </Icon>
);

// Freelancers (Badge)
export const BadgeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </Icon>
);

// --- GENERAL UI ICONS ---

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </Icon>
);
export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </Icon>
);
export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Icon>
);
export const ArchiveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </Icon>
);
export const UnarchiveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="m9.5 15.5 2.5-2.5 2.5 2.5" />
    <path d="M12 18v-5" />
  </Icon>
);
export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Icon>
);
export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </Icon>
);
export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);
export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);
export const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </Icon>
);
export const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </Icon>
);
export const SirenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M6 10h12v4H6z" />
    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    <path d="M12 7v3" />
    <path d="M4 14h16" />
    <path d="M17 14l-1 4H8l-1-4" />
  </Icon>
);
export const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);
export const CalendarPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M10 16h4" />
    <path d="M12 14v4" />
  </Icon>
);
export const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
  </Icon>
);
export const UsersIconV3: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="18" x2="23" y1="8" y2="13" />
    <line x1="23" x2="18" y1="8" y2="13" />
  </Icon>
);
export const NotStartedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
  </Icon>
);
export const PausedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="10" x2="10" y1="15" y2="9" />
    <line x1="14" x2="14" y1="15" y2="9" />
  </Icon>
);
export const CanceledIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m4.9 4.9 14.2 14.2" />
  </Icon>
);
export const StarIcon: React.FC<{ className?: string; solid?: boolean }> = ({
  className,
  solid,
}) => (
  <Icon className={className} fill={solid ? 'currentColor' : 'none'}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Icon>
);
const FolderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </Icon>
);
export const ListViewIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <line x1="8" x2="21" y1="6" y2="6" />
    <line x1="8" x2="21" y1="12" y2="12" />
    <line x1="8" x2="21" y1="18" y2="18" />
    <line x1="3" x2="3.01" y1="6" y2="6" />
    <line x1="3" x2="3.01" y1="12" y2="12" />
    <line x1="3" x2="3.01" y1="18" y2="18" />
  </Icon>
);
export const CollectionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </Icon>
);
export const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </Icon>
);
export const BullhornIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M10 9 9 9a3 3 0 0 1-3-3v0a3 3 0 0 1 3-3l1 0" />
    <path d="M22 12a5 5 0 0 0-1.62-3.87 2.13 2.13 0 0 0-1.5-.63h-7a4.93 4.93 0 0 0-2.6 1.13" />
    <path d="M22 12a5 5 0 0 1-1.62 3.87 2.13 2.13 0 0 1-1.5.63h-7a4.93 4.93 0 0 1-2.6-1.13" />
    <path d="M6 16v3c0 1.1.9 2 2 2h3" />
  </Icon>
);
export const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
);
export const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Icon>
);
export const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);
export const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
  </Icon>
);
export const ArrowUpCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m16 12-4-4-4 4" />
    <path d="M12 16V8" />
  </Icon>
);
export const ArrowDownCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m8 12 4 4 4-4" />
    <path d="M12 8v8" />
  </Icon>
);
export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);
export const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </Icon>
);
export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </Icon>
);
export const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Icon>
);
export const RadarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
    <path d="M8.5 8.5v.01" />
    <path d="M16 12v.01" />
    <path d="M12 16v.01" />
  </Icon>
);
export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </Icon>
);
export const UploadCloudIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </Icon>
);
export const FileTextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </Icon>
);
export const FileJsonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10 12c-2 0-2 2-2 2s0 2 2 2" />
    <path d="M14 12c2 0 2 2 2 2s0 2-2 2" />
  </Icon>
);
const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Icon className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);

// --- SOCIAL BRANDS (Keep as brands - filled by default usually, but we use SVG paths) ---

export const InstagramIcon = (props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
export const FacebookIcon = (props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
export const LinkedInIcon = (props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
export const TikTokIcon = (props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);
export const YouTubeIcon = (props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);
const XIconSocial = (props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M4 4l16 16" />
    <path d="M4 20l16-16" />
  </svg>
);

// --- EXPORT MAP ---

export const ICON_MAP = {
  HomeIcon,
  AgendaIcon,
  OrcamentosIcon,
  ProposalIcon,
  FinanceiroIcon,
  DocumentosIcon,
  RelatoriosIcon,
  SettingsIcon,
  BuildingIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  GiftIcon,
  CashIcon,
  CreditCardIcon,
  ChartBarIcon,
  RedesSociaisIcon,
  ClockIcon,
  SearchIcon,
  CheckCircleIcon,
  XCircleIcon,
  NotStartedIcon,
  PausedIcon,
  CanceledIcon,
  UserCircleIcon,
  MenuIcon,
  XIcon,
  TrashIcon,
  ArchiveIcon,
  UnarchiveIcon,
  EditIcon,
  PlusIcon,
  ChevronDownIcon,
  FolderIcon,
  LogoIcon,
  ListViewIcon,
  StarIcon,
  AlertIcon,
  BancoDeIdeiasIcon,
  UsersIcon,
  UsersIconV3,
  CollectionIcon,
  TagIcon,
  BullhornIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ArrowLeftIcon,
  KeyIcon,
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
  TikTokIcon,
  YouTubeIcon,
  EyeIcon,
  PencilIcon,
  CalendarPlusIcon,
  MarketingIconNew,
  ProjetosIcon,
  SubcontratacaoIcon,
  MeusDocumentosIcon,
  DocumentosProjetosIcon,
  SuprimentosIcon,
  PainelIcon,
  ConteudosIcon,
  LinkIcon,
  BriefcaseIcon,
  RadarIcon,
  UserPlusIcon,
  BadgeIcon,
  SirenIcon,
  DownloadIcon,
  UploadCloudIcon,
  FileTextIcon,
  FileJsonIcon,
  LockIcon,
  DollarSignIcon,
};

export type IconName = keyof typeof ICON_MAP;
