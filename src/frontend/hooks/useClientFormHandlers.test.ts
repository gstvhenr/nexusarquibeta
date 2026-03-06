import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Client, Project } from '../types';
import { useClientFormHandlers } from './useClientFormHandlers';

vi.mock('../constants', () => ({
  PIPELINE_STATUS_OPTIONS: ['Novo', 'Em Negociação', 'Fechado'],
}));

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'p1',
  code: 'PRJ-001',
  name: 'Projeto',
  clientName: 'Cliente',
  clientId: 'c1',
  status: 'Em Andamento',
  deadline: null,
  budget: 0,
  description: '',
  sections: [],
  financials: { paymentType: 'vista' },
  archived: false,
  ...overrides,
});

const defaultArgs = (overrides = {}) => ({
  isOpen: true,
  initialClient: null as Client | null,
  projects: [] as Project[],
  ...overrides,
});

describe('useClientFormHandlers', () => {
  it('initializes with empty client when initialClient is null', () => {
    // Given — sem cliente inicial
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    // Then — campos vazios com defaults
    expect(result.current.client.name).toBe('');
    expect(result.current.client.clientType).toBe('PF');
    expect(result.current.client.contacts).toHaveLength(1);
  });

  it('handleChange updates client field', () => {
    // Given — hook com isOpen=true
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    // When — altera nome
    act(() => {
      result.current.handleChange('name', 'Novo Nome');
    });

    // Then — nome atualizado
    expect(result.current.client.name).toBe('Novo Nome');
  });

  it('handleAddressChange updates address field', () => {
    // Given — hook inicializado
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    act(() => {
      result.current.handleAddressChange('city', 'Campinas');
    });

    expect(result.current.client.address.city).toBe('Campinas');
  });

  it('handleRepChange updates representative field', () => {
    // Given — hook inicializado
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    act(() => {
      result.current.handleRepChange('name', 'Dr. Carlos');
    });

    expect(result.current.client.representative?.name).toBe('Dr. Carlos');
  });

  it('handleAddContact adds contact when below limit', () => {
    // Given — 1 contato existente (limit = 3)
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    act(() => {
      result.current.handleAddContact();
    });

    // Then — agora tem 2 contatos
    expect(result.current.client.contacts).toHaveLength(2);
  });

  it('handleAddContact does not add when contacts.length >= 3', () => {
    // Given — já com 3 contatos (máximo)
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    act(() => {
      // Adiciona 2 extras (já começa com 1 do default)
      result.current.handleAddContact();
      result.current.handleAddContact();
    });

    expect(result.current.client.contacts).toHaveLength(3);

    // When — tenta adicionar mais um
    act(() => {
      result.current.handleAddContact();
    });

    // Then — ainda 3 contatos
    expect(result.current.client.contacts).toHaveLength(3);
  });

  it('handleRemoveContact removes correct contact', () => {
    // Given — hook com 1 contato default
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));
    const contactId = result.current.client.contacts[0].id;

    act(() => {
      result.current.handleAddContact();
    });
    const secondContactId = result.current.client.contacts[1].id;

    // When — remove o primeiro
    act(() => {
      result.current.handleRemoveContact(contactId);
    });

    // Then — apenas o segundo permanece
    expect(result.current.client.contacts).toHaveLength(1);
    expect(result.current.client.contacts[0].id).toBe(secondContactId);
  });

  it('handleServiceInterestChange adds interest when checked', () => {
    // Given — sem interesses
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    act(() => {
      result.current.handleServiceInterestChange('Reforma', true);
    });

    expect(result.current.client.serviceInterests).toContain('Reforma');
  });

  it('handleServiceInterestChange removes interest when unchecked', () => {
    // Given — com interesse existente
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    act(() => {
      result.current.handleServiceInterestChange('Reforma', true);
    });

    act(() => {
      result.current.handleServiceInterestChange('Reforma', false);
    });

    expect(result.current.client.serviceInterests).not.toContain('Reforma');
  });

  it('handleAddMeeting requires reason or notes', () => {
    // Given — newMeeting sem reason e sem notes
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    // When — tenta adicionar reunião vazia
    act(() => {
      result.current.handleAddMeeting();
    });

    // Then — lista de reuniões continua vazia
    expect(result.current.client.meetings).toHaveLength(0);
  });

  it('handleAddMeeting adds meeting when reason is provided', () => {
    // Given — motivo preenchido
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    act(() => {
      result.current.setNewMeeting({ date: '2026-03-01', reason: 'Apresentação', notes: '' });
    });

    act(() => {
      result.current.handleAddMeeting();
    });

    // Then — reunião adicionada
    expect(result.current.client.meetings).toHaveLength(1);
    expect(result.current.client.meetings![0].reason).toBe('Apresentação');
  });

  it('handleDeleteMeeting removes meeting by id', () => {
    // Given — meeting existente após add
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    act(() => {
      result.current.setNewMeeting({ date: '2026-03-01', reason: 'Kick-off', notes: '' });
    });
    act(() => {
      result.current.handleAddMeeting();
    });

    const meetingId = result.current.client.meetings![0].id;

    act(() => {
      result.current.handleDeleteMeeting(meetingId);
    });

    // Then — lista vazia novamente
    expect(result.current.client.meetings).toHaveLength(0);
  });

  it('clientProjects filters projects by clientId', () => {
    // Given — projeto associado ao cliente
    const initialClient = { id: 'c1' } as Client;
    const projects = [makeProject({ clientId: 'c1' }), makeProject({ id: 'p2', clientId: 'c99' })];
    const { result } = renderHook(() =>
      useClientFormHandlers({ isOpen: true, initialClient, projects }),
    );

    // Then — apenas p1 (clientId=c1) retornado
    expect(result.current.clientProjects).toHaveLength(1);
    expect(result.current.clientProjects[0].clientId).toBe('c1');
  });

  it('getModifiedClass returns modified class when value differs and initialClient exists', () => {
    // Given — initialClient existente e valores diferentes
    const initialClient = { id: 'c1', name: 'Original' } as Client;
    const { result } = renderHook(() =>
      useClientFormHandlers({ isOpen: true, initialClient, projects: [] }),
    );

    const cls = result.current.getModifiedClass('Alterado', 'Original');

    // Then — classe de modificação retornada
    expect(cls).toContain('yellow');
  });

  it('handleContactChange updates a contact field by id', () => {
    // Given — hook com um contato default
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));
    const contactId = result.current.client.contacts[0].id;

    // When — altera o campo phone do contato
    act(() => {
      result.current.handleContactChange(contactId, 'phone', '11988887777');
    });

    // Then — phone do contato atualizado
    const updatedContact = result.current.client.contacts.find((c) => c.id === contactId);
    expect(updatedContact?.phone).toBe('11988887777');
  });

  it('handleContactChange with isPrimary=true demotes all other contacts', () => {
    // Given — dois contatos; o primeiro é primário
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));

    act(() => {
      result.current.handleAddContact();
    });

    const [firstId, secondId] = [
      result.current.client.contacts[0].id,
      result.current.client.contacts[1].id,
    ];

    // When — segundo contato é marcado como primário
    act(() => {
      result.current.handleContactChange(secondId, 'isPrimary', true);
    });

    // Then — segundo é primário e primeiro não é
    const contacts = result.current.client.contacts;
    expect(contacts.find((c) => c.id === secondId)?.isPrimary).toBe(true);
    expect(contacts.find((c) => c.id === firstId)?.isPrimary).toBe(false);
  });

  it('setInterestsDropdownOpen toggles the dropdown state', () => {
    // Given — dropdown fechado por padrão
    const { result } = renderHook(() => useClientFormHandlers(defaultArgs()));
    expect(result.current.isInterestsDropdownOpen).toBe(false);

    // When — abre o dropdown
    act(() => {
      result.current.setInterestsDropdownOpen(true);
    });

    // Then — dropdown aberto
    expect(result.current.isInterestsDropdownOpen).toBe(true);

    // When — fecha o dropdown
    act(() => {
      result.current.setInterestsDropdownOpen(false);
    });

    // Then — dropdown fechado novamente
    expect(result.current.isInterestsDropdownOpen).toBe(false);
  });

  it('initializes contacts from legacy phone field when initialClient has no contacts', () => {
    // Given — cliente legado com phone mas sem contacts
    const legacyClient = {
      id: 'c-legacy',
      name: 'Legado',
      cpfCnpj: '',
      clientType: 'PF',
      birthDate: '',
      representative: { name: '', relationship: '', role: '' },
      contacts: [] as Client['contacts'],
      email: '',
      status: 'Potencial Cliente',
      leadSource: 'Não informado',
      serviceInterests: [],
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: 'SP',
        zip: '',
        complement: '',
      },
      isFavorite: false,
      isUrgent: false,
      registrationDate: new Date().toISOString(),
      lastContactDate: new Date().toISOString(),
      pipelineStatus: 'Novo',
      meetings: [],
      behavioralProfile: { notes: '' },
      archived: false,
      // legacy fields injected at runtime
      phone: '11977776666',
      phoneHasWhatsApp: true,
    } as unknown as Client;

    // When — hook abre com cliente legado
    const { result } = renderHook(() =>
      useClientFormHandlers({ isOpen: true, initialClient: legacyClient, projects: [] }),
    );

    // Then — contato criado a partir do phone legado
    expect(result.current.client.contacts).toHaveLength(1);
    expect(result.current.client.contacts[0].phone).toBe('11977776666');
    expect(result.current.client.contacts[0].hasWhatsApp).toBe(true);
    expect(result.current.client.contacts[0].isPrimary).toBe(true);
  });
});
