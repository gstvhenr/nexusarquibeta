import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PIPELINE_STATUS_OPTIONS } from '../constants';
import type { Client, ClientContact, ProjectMeeting, Project } from '../types';
import { getTodayDateOnly } from '../utils/formatters';

const getInitialClient = (): Client => ({
  id: '',
  name: '',
  cpfCnpj: '',
  clientType: 'PF',
  birthDate: '',
  representative: { name: '', relationship: '', role: '' },
  contacts: [{ id: uuidv4(), phone: '', hasWhatsApp: false, isPrimary: true }],
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
  pipelineStatus: PIPELINE_STATUS_OPTIONS[0],
  meetings: [],
  behavioralProfile: { notes: '' },
  archived: false,
});

interface UseClientFormHandlersParams {
  isOpen: boolean;
  initialClient: Client | null;
  projects: Project[];
}

export function useClientFormHandlers({
  isOpen,
  initialClient,
  projects,
}: UseClientFormHandlersParams) {
  const [client, setClient] = useState<Client>(initialClient || getInitialClient());
  const [isInterestsDropdownOpen, setInterestsDropdownOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState<Partial<ProjectMeeting>>({
    date: getTodayDateOnly(),
    reason: '',
    notes: '',
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    type LegacyClient = Client & {
      phone?: string;
      phoneHasWhatsApp?: boolean;
    };

    const clientData: LegacyClient = initialClient
      ? JSON.parse(JSON.stringify(initialClient))
      : getInitialClient();

    if (initialClient && !clientData.contacts) {
      clientData.contacts = [];
    }

    if (initialClient && clientData.contacts.length === 0 && clientData.phone) {
      clientData.contacts.push({
        id: uuidv4(),
        phone: clientData.phone,
        hasWhatsApp: !!clientData.phoneHasWhatsApp,
        isPrimary: true,
      });
    }

    if (!clientData.clientType) {
      clientData.clientType = 'PF';
    }

    setClient(clientData);
    setNewMeeting({ date: getTodayDateOnly(), reason: '', notes: '' });
    setInterestsDropdownOpen(false);
  }, [initialClient, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setInterestsDropdownOpen(false);
      }
    };

    if (isInterestsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isInterestsDropdownOpen]);

  const clientProjects = useMemo(() => {
    if (!client.id) return [];
    return projects.filter((project) => project.clientId === client.id && !project.archived);
  }, [projects, client.id]);

  const handleChange = useCallback((field: keyof Client, value: Client[keyof Client]) => {
    setClient((current) => ({ ...current, [field]: value }));
  }, []);

  const handleAddressChange = useCallback((field: keyof Client['address'], value: string) => {
    setClient((current) => ({ ...current, address: { ...current.address, [field]: value } }));
  }, []);

  const handleRepChange = useCallback(
    (field: keyof NonNullable<Client['representative']>, value: string) => {
      setClient((current) => ({
        ...current,
        representative: {
          ...(current.representative || { name: '', relationship: '' }),
          [field]: value,
        },
      }));
    },
    [],
  );

  const handleContactChange = useCallback(
    (id: string, field: keyof Omit<ClientContact, 'id'>, value: string | boolean) => {
      setClient((current) => {
        let nextContacts = current.contacts.map((contact) =>
          contact.id === id ? { ...contact, [field]: value } : contact,
        );

        if (field === 'isPrimary' && value === true) {
          nextContacts = nextContacts.map((contact) =>
            contact.id === id ? contact : { ...contact, isPrimary: false },
          );
        }

        return { ...current, contacts: nextContacts };
      });
    },
    [],
  );

  const handleAddContact = useCallback(() => {
    setClient((current) => {
      if (current.contacts.length >= 3) return current;
      const newContact: ClientContact = {
        id: uuidv4(),
        phone: '',
        hasWhatsApp: false,
        isPrimary: current.contacts.length === 0,
      };
      return { ...current, contacts: [...current.contacts, newContact] };
    });
  }, []);

  const handleRemoveContact = useCallback((id: string) => {
    setClient((current) => {
      let remainingContacts = current.contacts.filter((contact) => contact.id !== id);
      if (!remainingContacts.some((contact) => contact.isPrimary) && remainingContacts.length > 0) {
        remainingContacts = remainingContacts.map((contact, index) =>
          index === 0 ? { ...contact, isPrimary: true } : contact,
        );
      }
      return { ...current, contacts: remainingContacts };
    });
  }, []);

  const handleServiceInterestChange = useCallback((interest: string, checked: boolean) => {
    setClient((current) => {
      const nextInterests = checked
        ? [...current.serviceInterests, interest]
        : current.serviceInterests.filter((item) => item !== interest);
      return { ...current, serviceInterests: nextInterests };
    });
  }, []);

  const handleAddMeeting = useCallback(() => {
    if (!newMeeting.reason?.trim() && !newMeeting.notes?.trim()) return;

    const project = projects.find((item) => item.id === newMeeting.projectId);

    const meetingToAdd: ProjectMeeting = {
      id: uuidv4(),
      date: newMeeting.date || getTodayDateOnly(),
      reason: newMeeting.reason || 'Reunião de Acompanhamento',
      notes: newMeeting.notes || '',
      projectId: newMeeting.projectId,
      projectName: project?.name,
    };

    setClient((current) => ({ ...current, meetings: [meetingToAdd, ...(current.meetings || [])] }));
    setNewMeeting({ date: getTodayDateOnly(), reason: '', notes: '' });
  }, [newMeeting, projects]);

  const handleDeleteMeeting = useCallback((id: string) => {
    setClient((current) => ({
      ...current,
      meetings: (current.meetings || []).filter((meeting) => meeting.id !== id),
    }));
  }, []);

  const getModifiedClass = useCallback(
    (currentVal: unknown, originalVal: unknown) => {
      if (!initialClient) return 'border-border-color';

      const normalizedCurrent =
        currentVal === null || currentVal === undefined ? '' : String(currentVal);
      const normalizedOriginal =
        originalVal === null || originalVal === undefined ? '' : String(originalVal);

      return normalizedCurrent !== normalizedOriginal
        ? 'border-warning ring-1 ring-warning/20'
        : 'border-border-color';
    },
    [initialClient],
  );

  return {
    client,
    clientProjects,
    isInterestsDropdownOpen,
    setInterestsDropdownOpen,
    newMeeting,
    setNewMeeting,
    dropdownRef,
    handleChange,
    handleAddressChange,
    handleRepChange,
    handleContactChange,
    handleAddContact,
    handleRemoveContact,
    handleServiceInterestChange,
    handleAddMeeting,
    handleDeleteMeeting,
    getModifiedClass,
  };
}
