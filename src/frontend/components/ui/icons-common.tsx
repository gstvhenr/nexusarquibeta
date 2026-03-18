import React from 'react';
import { Icon } from './iconBase';

// --- COMMON UI ICONS ---

export const PlusIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </Icon>
);
export const MinusIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <line x1="5" x2="19" y1="12" y2="12" />
  </Icon>
);
export const EditIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </Icon>
);
export const TrashIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Icon>
);
export const ArchiveIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </Icon>
);
export const UnarchiveIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="m9.5 15.5 2.5-2.5 2.5 2.5" />
    <path d="M12 18v-5" />
  </Icon>
);
export const SearchIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Icon>
);
export const ChevronDownIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
export const ChevronLeftIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);
export const ChevronRightIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);
export const MenuIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </Icon>
);
export const XIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);
export const CheckCircleIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);
export const XCircleIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </Icon>
);
export const AlertIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </Icon>
);
export const SirenIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M6 10h12v4H6z" />
    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    <path d="M12 7v3" />
    <path d="M4 14h16" />
    <path d="M17 14l-1 4H8l-1-4" />
  </Icon>
);
export const ClockIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);
export const CalendarPlusIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M10 16h4" />
    <path d="M12 14v4" />
  </Icon>
);
export const BellAlertIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5Z" />
    <path d="M19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
    <path d="M12 2a7 7 0 0 0-7 7c0 3.5-1.5 5.5-2.5 6.5a1 1 0 0 0 .7 1.7h17.6a1 1 0 0 0 .7-1.7c-1-1-2.5-3-2.5-6.5a7 7 0 0 0-7-7Z" />
    <path d="M9.5 18.5A2.5 2.5 0 0 0 12 21a2.5 2.5 0 0 0 2.5-2.5" />
  </Icon>
);
export const UserCircleIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
  </Icon>
);
export const UsersIconV3: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="18" x2="23" y1="8" y2="13" />
    <line x1="23" x2="18" y1="8" y2="13" />
  </Icon>
);
export const NotStartedIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
  </Icon>
);
export const PausedIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="10" x2="10" y1="15" y2="9" />
    <line x1="14" x2="14" y1="15" y2="9" />
  </Icon>
);
export const CanceledIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m4.9 4.9 14.2 14.2" />
  </Icon>
);
export const StarIcon: (props: { className?: string; solid?: boolean }) => React.ReactNode = ({
  className,
  solid,
}) => (
  <Icon className={className} fill={solid ? 'currentColor' : 'none'}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Icon>
);
export const FolderIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </Icon>
);
export const ListViewIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <line x1="8" x2="21" y1="6" y2="6" />
    <line x1="8" x2="21" y1="12" y2="12" />
    <line x1="8" x2="21" y1="18" y2="18" />
    <line x1="3" x2="3.01" y1="6" y2="6" />
    <line x1="3" x2="3.01" y1="12" y2="12" />
    <line x1="3" x2="3.01" y1="18" y2="18" />
  </Icon>
);
export const CollectionIcon: (props: { className?: string }) => React.ReactNode = ({
  className,
}) => (
  <Icon className={className}>
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </Icon>
);
export const TagIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </Icon>
);
export const BullhornIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M10 9 9 9a3 3 0 0 1-3-3v0a3 3 0 0 1 3-3l1 0" />
    <path d="M22 12a5 5 0 0 0-1.62-3.87 2.13 2.13 0 0 0-1.5-.63h-7a4.93 4.93 0 0 0-2.6 1.13" />
    <path d="M22 12a5 5 0 0 1-1.62 3.87 2.13 2.13 0 0 1-1.5.63h-7a4.93 4.93 0 0 1-2.6-1.13" />
    <path d="M6 16v3c0 1.1.9 2 2 2h3" />
  </Icon>
);
export const MailIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
);
export const PhoneIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Icon>
);
export const MapPinIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);
export const GlobeIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
  </Icon>
);
export const CameraIcon: (props: { className?: string }) => React.ReactNode = ({ className }) => (
  <Icon className={className}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </Icon>
);
export {
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
} from './icons-common-extra';
