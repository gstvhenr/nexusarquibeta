import type { ProspectStatus } from '../../types';

export type ProspectAction = 'renew' | 'convert' | 'lost' | 'archive';

export type ProspectStatusFilter = ProspectStatus | 'Todos';
