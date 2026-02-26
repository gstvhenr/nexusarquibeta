import React from 'react';
import { Icon } from './iconBase';
// C12 exception (2026-02-16): manter arquivo unico para ICON_MAP estavel; cores hardcoded apenas para brands oficiais em SVG.

// --- LOGO ---
export const LogoIcon: (props: { className?: string }) => React.ReactNode = ({
  className = 'w-12 h-12',
}) => (
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

// --- SUBMENUS & AÇÕES ---

export const UserPlusIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="20" x2="20" y1="8" y2="14" />
    <line x1="23" x2="17" y1="11" y2="11" />
  </Icon>
);

export const OrcamentosIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
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

export const ProposalIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </Icon>
);

// Financeiro Sub
export const ChartBarIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </Icon>
);
export const StackedCoinsIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    {/* Left column – shorter stack (3 coins) */}
    <ellipse cx="8" cy="18" rx="4" ry="1.5" />
    <path d="M4 18v-3" />
    <path d="M12 18v-3" />
    <ellipse cx="8" cy="15" rx="4" ry="1.5" />
    <path d="M4 15v-3" />
    <path d="M12 15v-3" />
    <ellipse cx="8" cy="12" rx="4" ry="1.5" />
    {/* Right column – taller stack (5 coins) */}
    <ellipse cx="17" cy="18" rx="4" ry="1.5" />
    <path d="M13 18v-3" />
    <path d="M21 18v-3" />
    <ellipse cx="17" cy="15" rx="4" ry="1.5" />
    <path d="M13 15v-3" />
    <path d="M21 15v-3" />
    <ellipse cx="17" cy="12" rx="4" ry="1.5" />
    <path d="M13 12V9" />
    <path d="M21 12V9" />
    <ellipse cx="17" cy="9" rx="4" ry="1.5" />
    <path d="M13 9V6" />
    <path d="M21 9V6" />
    <ellipse cx="17" cy="6" rx="4" ry="1.5" />
  </Icon>
);
export const CashIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </Icon>
);
export const CreditCardIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1Z" />
    <line x1="16" x2="8" y1="8" y2="8" />
    <line x1="16" x2="8" y1="12" y2="12" />
    <line x1="10" x2="8" y1="16" y2="16" />
  </Icon>
);
export const DollarSignIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Icon>
);
export const CashBoxIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    {/* Wallet body */}
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z" />
    {/* Wallet flap */}
    <path d="M3 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
    {/* Card slot / clasp */}
    <path d="M17 12h4v4h-4a2 2 0 0 1 0-4z" />
  </Icon>
);

// Documentos Sub
export const MeusDocumentosIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    <path d="M12 10v6" />
    <path d="M9 13h6" />
  </Icon>
);
export const DocumentosProjetosIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    <path d="M12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
  </Icon>
);

// Suprimentos Sub
export const BuildingIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
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
export const CubeIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </Icon>
);
export const ClipboardDocumentListIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </Icon>
);
export const GiftIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <line x1="19" x2="5" y1="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </Icon>
);

// Marketing Sub
export const PainelIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </Icon>
);
export const ConteudosIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 14h6" />
    <path d="M9 10h6" />
    <path d="M9 18h6" />
  </Icon>
);
export const BancoDeIdeiasIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5a6 6 0 0 0-11 0c0 1.5.5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </Icon>
);
export const RedesSociaisIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </Icon>
);

// Freelancers (Badge)
export const BadgeIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </Icon>
);

import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ArchiveIcon,
  UnarchiveIcon,
  SearchIcon,
  ChevronDownIcon,
  MenuIcon,
  XIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertIcon,
  SirenIcon,
  ClockIcon,
  CameraIcon,
  CalendarPlusIcon,
  BellAlertIcon,
  UserCircleIcon,
  UsersIconV3,
  NotStartedIcon,
  PausedIcon,
  CanceledIcon,
  StarIcon,
  FolderIcon,
  ListViewIcon,
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
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  LinkIcon,
  RadarIcon,
  DownloadIcon,
  UploadCloudIcon,
  FileTextIcon,
  FileJsonIcon,
  LockIcon,
} from './icons-common';
export {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ArchiveIcon,
  UnarchiveIcon,
  SearchIcon,
  ChevronDownIcon,
  MenuIcon,
  XIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertIcon,
  SirenIcon,
  ClockIcon,
  CameraIcon,
  CalendarPlusIcon,
  BellAlertIcon,
  UserCircleIcon,
  UsersIconV3,
  NotStartedIcon,
  PausedIcon,
  CanceledIcon,
  StarIcon,
  FolderIcon,
  ListViewIcon,
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
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  LinkIcon,
  RadarIcon,
  DownloadIcon,
  UploadCloudIcon,
  FileTextIcon,
  FileJsonIcon,
  LockIcon,
} from './icons-common';

// --- SOCIAL BRANDS (extracted to icons-social.tsx for tree-shaking) ---
import {
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
  TikTokIcon,
  YouTubeIcon,
  GoogleIcon,
} from './icons-social';
export { InstagramIcon, FacebookIcon, LinkedInIcon, TikTokIcon, YouTubeIcon, GoogleIcon };

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
  GoogleIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  CameraIcon,
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
  CashBoxIcon,
  StackedCoinsIcon,
  BellAlertIcon,
};

export type IconName = keyof typeof ICON_MAP;
