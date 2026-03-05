import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Client, MarketingActivity, MarketingIdea, MarketingProfessional } from '@/types';
import { MarketingDashboardView } from './MarketingDashboardView';

const professionals: MarketingProfessional[] = [
  {
    id: 'prof-1',
    name: 'Studio Ads',
    email: 'studio@example.com',
    phone: '(11) 99999-0000',
    billingFormat: 'Mensal',
    cost: 2500,
  },
  {
    id: 'prof-2',
    name: 'Videomaker',
    email: 'video@example.com',
    phone: '(11) 98888-0000',
    billingFormat: 'Por Conteúdo',
    cost: 1200,
  },
  {
    id: 'prof-3',
    name: 'Sem Foto',
    email: 'semfoto@example.com',
    phone: '(11) 97777-0000',
    cost: 0,
  },
];

const activities: MarketingActivity[] = [
  {
    id: 'act-1',
    title: 'Post institucional',
    status: 'Pendente',
    contentType: 'Post (Instagram)',
    dueDate: '2026-03-10T10:00:00.000Z',
    responsibleId: 'prof-1',
    cost: 300,
  },
  {
    id: 'act-2',
    title: 'Reels projeto',
    status: 'Concluído',
    contentType: 'Reels (Instagram)',
    dueDate: '2026-03-01T10:00:00.000Z',
    responsibleId: 'prof-2',
    cost: 700,
  },
];

const ideas: MarketingIdea[] = [
  { id: 'idea-1', content: 'Série de before/after', date: '2026-03-01', title: 'Before/After' },
];

const clients: Client[] = [
  {
    id: 'client-1',
    name: 'Cliente A',
    contacts: [],
    status: 'Cliente Ativo',
    serviceInterests: [],
    address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
    isFavorite: false,
    registrationDate: '2026-01-01',
    lastContactDate: '2026-01-01',
    leadSource: 'Instagram',
    projectLinks: [
      {
        projectId: 'proj-1',
        projectCode: '#3001',
        projectName: 'Projeto 1',
        status: 'Em Andamento',
      },
    ],
    pipelineStatus: 'Contato Inicial',
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: false,
  },
  {
    id: 'client-2',
    name: 'Cliente B',
    contacts: [],
    status: 'Cliente Ativo',
    serviceInterests: [],
    address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
    isFavorite: false,
    registrationDate: '2026-01-10',
    lastContactDate: '2026-01-10',
    leadSource: 'Instagram',
    projectLinks: [],
    pipelineStatus: 'Contato Inicial',
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: false,
  },
  {
    id: 'client-3',
    name: 'Cliente C',
    contacts: [],
    status: 'Cliente Ativo',
    serviceInterests: [],
    address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
    isFavorite: false,
    registrationDate: '2026-01-20',
    lastContactDate: '2026-01-20',
    leadSource: '',
    projectLinks: [],
    pipelineStatus: 'Contato Inicial',
    meetings: [],
    behavioralProfile: { notes: '' },
    archived: false,
  },
];

describe('MarketingDashboardView', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders KPI cards and triggers professional edit callback', () => {
    const onEditProfessional = vi.fn();

    render(
      <MarketingDashboardView
        professionals={professionals}
        activities={activities}
        ideas={ideas}
        clients={clients}
        onEditProfessional={onEditProfessional}
      />,
    );

    expect(screen.getByText('Prestadores')).toBeInTheDocument();
    expect(screen.getByText('Conteúdos Pendentes')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/R\$ 1\.000,00/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Studio Ads'));

    expect(onEditProfessional).toHaveBeenCalledWith(professionals[0]);
  });

  it('supports keyboard editing in professional card and renders lead/conversion aggregates', () => {
    const onEditProfessional = vi.fn();

    render(
      <MarketingDashboardView
        professionals={professionals}
        activities={activities}
        ideas={ideas}
        clients={clients}
        onEditProfessional={onEditProfessional}
      />,
    );

    expect(screen.getAllByText('Instagram')).toHaveLength(2);
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getAllByText('Não informado')).toHaveLength(2);

    const videomakerCard = screen.getByText('Videomaker').closest('[role="button"]');
    expect(videomakerCard).not.toBeNull();
    fireEvent.keyDown(videomakerCard as HTMLElement, { key: 'Enter' });
    fireEvent.keyDown(videomakerCard as HTMLElement, { key: ' ' });

    expect(onEditProfessional).toHaveBeenCalledTimes(2);
    expect(onEditProfessional).toHaveBeenCalledWith(professionals[1]);
  });

  it('renders empty states when there are no clients to chart', () => {
    render(
      <MarketingDashboardView
        professionals={[]}
        activities={[]}
        ideas={[]}
        clients={[]}
        onEditProfessional={vi.fn()}
      />,
    );

    expect(screen.getByText('Nenhum dado de origem de lead para exibir.')).toBeInTheDocument();
    expect(screen.getByText('Nenhum dado de conversão para exibir.')).toBeInTheDocument();
    expect(screen.getByText(/R\$ 0,00/)).toBeInTheDocument();
  });
});
