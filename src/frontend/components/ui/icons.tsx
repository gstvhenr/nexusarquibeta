import React from 'react';

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

// --- NAVIGATION (extracted to icons-navigation.tsx) ---
export {
  HomeIcon,
  AgendaIcon,
  BriefcaseIcon,
  ProjetosIcon,
  UsersIcon,
  FinanceiroIcon,
  DocumentosIcon,
  SuprimentosIcon,
  MarketingIconNew,
  SubcontratacaoIcon,
  RelatoriosIcon,
  SettingsIcon,
} from './icons-navigation';

// --- SUBMENUS & DOMAIN (extracted to icons-submenu.tsx) ---
export {
  UserPlusIcon,
  OrcamentosIcon,
  ProposalIcon,
  ChartBarIcon,
  StackedCoinsIcon,
  CashIcon,
  CreditCardIcon,
  DollarSignIcon,
  CashBoxIcon,
  MeusDocumentosIcon,
  DocumentosProjetosIcon,
  BuildingIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  GiftIcon,
  PainelIcon,
  ConteudosIcon,
  BancoDeIdeiasIcon,
  RedesSociaisIcon,
  BadgeIcon,
} from './icons-submenu';

// --- COMMON ACTIONS (extracted to icons-common.tsx) ---
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
  CalendarPlusIcon,
  BellAlertIcon,
  UserCircleIcon,
  NotStartedIcon,
  PausedIcon,
  CanceledIcon,
  StarIcon,
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

// --- SOCIAL BRANDS (extracted to icons-social.tsx) ---
export {
  InstagramIcon,
  FacebookIcon,
  LinkedInIcon,
  TikTokIcon,
  YouTubeIcon,
  GoogleIcon,
} from './icons-social';

// --- IMPORT ALL for ICON_MAP ---
import * as nav from './icons-navigation';
import * as sub from './icons-submenu';
import * as common from './icons-common';
import * as social from './icons-social';

// --- EXPORT MAP ---
export const ICON_MAP = {
  LogoIcon,
  ...nav,
  ...sub,
  ...common,
  ...social,
} as const;
