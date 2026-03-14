import React from 'react';
import { ClienteAddressFieldset } from './ClienteAddressFieldset';
import {
  Button,
  ChevronDownIcon,
  FormField,
  IconButton,
  Input,
  PlusIcon,
  Select,
  TrashIcon,
} from '@/components/ui';
import {
  LEAD_SOURCE_OPTIONS,
  PIPELINE_STATUS_OPTIONS,
  SERVICE_INTEREST_OPTIONS,
} from '@/constants';
import { clientStatuses } from '@/types';
import type { Client, ClientContact } from '@/types';
import { formatCpfCnpj, formatDate, formatPhone } from '@/utils/formatters';
import { AvatarPicker } from '@/components/clientes/AvatarPicker';

const DISABLED_OVERRIDE = 'disabled:opacity-100 disabled:cursor-default disabled:bg-background/50';

interface ClienteDetalhesInfoTabProps {
  activeTab: string;
  client: Client;
  isPJ: boolean;
  isEditing: boolean;
  originalClient: Client | undefined;
  dropdownRef: React.RefObject<HTMLDivElement>;
  isInterestsDropdownOpen: boolean;
  setInterestsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleChange: (field: keyof Client, value: Client[keyof Client]) => void;
  handleAddressChange: (field: keyof Client['address'], value: string) => void;
  handleRepChange: (field: keyof NonNullable<Client['representative']>, value: string) => void;
  handleContactChange: (
    id: string,
    field: keyof Omit<ClientContact, 'id'>,
    value: string | boolean,
  ) => void;
  handleAddContact: () => void;
  handleRemoveContact: (id: string) => void;
  handleServiceInterestChange: (interest: string, checked: boolean) => void;
  getModifiedClass: (currentVal: unknown, originalVal: unknown) => string;
}

export function ClienteDetalhesInfoTab({
  activeTab,
  client,
  isPJ,
  isEditing,
  originalClient,
  dropdownRef,
  isInterestsDropdownOpen,
  setInterestsDropdownOpen,
  handleChange,
  handleAddressChange,
  handleRepChange,
  handleContactChange,
  handleAddContact,
  handleRemoveContact,
  handleServiceInterestChange,
  getModifiedClass,
}: ClienteDetalhesInfoTabProps) {
  const DISABLED_SELECT_OVERRIDE =
    'disabled:opacity-100 disabled:cursor-default disabled:bg-background/50';

  return (
    <>
      {activeTab === 'info' && (
        <div className="space-y-8 max-w-5xl">
          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-secondary mb-4 border-b border-border-color pb-1 w-full">
              Identificação
            </legend>
            <div className="flex gap-4 mb-4 px-1 items-start">
              <AvatarPicker
                name={client.name}
                avatarUrl={client.avatarUrl}
                isReadOnly={!isEditing}
                onChangeBase64={(base64) => handleChange('avatarUrl', base64)}
              />
              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="clientType"
                    value="PF"
                    checked={client.clientType === 'PF'}
                    onChange={() => handleChange('clientType', 'PF')}
                    className="accent-primary"
                    disabled={!isEditing}
                  />
                  <span className="text-sm font-medium text-text-primary">Pessoa Física</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="clientType"
                    value="PJ"
                    checked={client.clientType === 'PJ'}
                    onChange={() => handleChange('clientType', 'PJ')}
                    className="accent-primary"
                    disabled={!isEditing}
                  />
                  <span className="text-sm font-medium text-text-primary">Pessoa Jurídica</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label={isPJ ? 'Razão Social' : 'Nome Completo'}>
                <Input
                  type="text"
                  value={client.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.name, originalClient?.name)}`}
                  disabled={!isEditing}
                  aria-label={isPJ ? 'Razão Social' : 'Nome Completo'}
                />
              </FormField>
              <FormField label={isPJ ? 'Data de Abertura' : 'Data de Nascimento'}>
                <Input
                  type="date"
                  value={client.birthDate || ''}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.birthDate, originalClient?.birthDate)}`}
                  disabled={!isEditing}
                  aria-label={isPJ ? 'Data de Abertura' : 'Data de Nascimento'}
                />
              </FormField>
              <FormField label="CPF/CNPJ">
                <Input
                  type="text"
                  value={client.cpfCnpj || ''}
                  onChange={(e) => handleChange('cpfCnpj', formatCpfCnpj(e.target.value))}
                  className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.cpfCnpj, originalClient?.cpfCnpj)}`}
                  disabled={!isEditing}
                  aria-label="CPF/CNPJ"
                />
              </FormField>
              {isPJ && (
                <>
                  <FormField label="Nome do Representante">
                    <Input
                      type="text"
                      value={client.representative?.name || ''}
                      onChange={(e) => handleRepChange('name', e.target.value)}
                      className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.representative?.name, originalClient?.representative?.name)}`}
                      disabled={!isEditing}
                      placeholder="Opcional"
                      aria-label="Nome do representante"
                    />
                  </FormField>
                  <FormField label="Cargo / Relação">
                    <Input
                      type="text"
                      value={client.representative?.relationship || ''}
                      onChange={(e) => handleRepChange('relationship', e.target.value)}
                      className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.representative?.relationship, originalClient?.representative?.relationship)}`}
                      disabled={!isEditing}
                      placeholder="Opcional"
                      aria-label="Cargo ou relação"
                    />
                  </FormField>
                </>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-secondary mb-4 border-b border-border-color pb-1 w-full">
              Contatos
            </legend>
            <div className="space-y-3">
              {client.contacts?.map((contact, index) => (
                <div
                  key={contact.id}
                  className="grid grid-cols-[1fr,auto,auto,auto] gap-3 items-center bg-background/30 p-2 rounded-lg"
                >
                  <Input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => handleContactChange(contact.id, 'phone', e.target.value)}
                    onBlur={(e) =>
                      handleContactChange(contact.id, 'phone', formatPhone(e.target.value))
                    }
                    className={`${DISABLED_OVERRIDE} ${originalClient?.contacts?.find((c) => c.id === contact.id)?.phone !== contact.phone ? 'border-warning ring-1 ring-warning/20' : 'border-border-color'}`}
                    placeholder={`Telefone ${index + 1}`}
                    disabled={!isEditing}
                    aria-label={`Telefone ${index + 1}`}
                  />
                  <label className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contact.hasWhatsApp}
                      onChange={(e) =>
                        handleContactChange(contact.id, 'hasWhatsApp', e.target.checked)
                      }
                      className="rounded accent-primary"
                      disabled={!isEditing}
                    />{' '}
                    WhatsApp
                  </label>
                  <label className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer">
                    <input
                      type="radio"
                      name="primary-contact"
                      checked={contact.isPrimary}
                      onChange={(e) =>
                        handleContactChange(contact.id, 'isPrimary', e.target.checked)
                      }
                      className="accent-primary"
                      disabled={!isEditing}
                    />{' '}
                    Principal
                  </label>
                  {isEditing && (
                    <IconButton
                      variant="danger"
                      onClick={() => handleRemoveContact(contact.id)}
                      aria-label="Remover telefone"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </IconButton>
                  )}
                </div>
              ))}
              {isEditing && (client.contacts?.length || 0) < 3 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddContact}
                  className="flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" /> Adicionar Telefone
                </Button>
              )}
              <FormField label="Email">
                <Input
                  type="email"
                  value={client.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.email, originalClient?.email)}`}
                  disabled={!isEditing}
                  aria-label="Email"
                />
              </FormField>
            </div>
          </fieldset>

          <ClienteAddressFieldset
            client={client}
            originalClient={originalClient}
            isEditing={isEditing}
            handleAddressChange={handleAddressChange}
            getModifiedClass={getModifiedClass}
          />

          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-secondary mb-4 border-b border-border-color pb-1 w-full">
              Status e Interesses
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div>
                <label
                  htmlFor="field-status-do-cliente"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  Status do Cliente
                </label>
                <Select
                  id="field-status-do-cliente"
                  value={client.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  options={clientStatuses.map((s) => ({ value: s, label: s }))}
                  className={`${DISABLED_SELECT_OVERRIDE} ${getModifiedClass(client.status, originalClient?.status)}`}
                  disabled={!isEditing}
                  aria-label="Status do cliente"
                />
              </div>
              <div>
                <label
                  htmlFor="field-status-no-pipeline"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  Status no Pipeline
                </label>
                <Select
                  id="field-status-no-pipeline"
                  value={client.pipelineStatus}
                  onChange={(e) => handleChange('pipelineStatus', e.target.value)}
                  options={PIPELINE_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
                  className={`${DISABLED_SELECT_OVERRIDE} ${getModifiedClass(client.pipelineStatus, originalClient?.pipelineStatus)}`}
                  disabled={!isEditing}
                  aria-label="Status no pipeline"
                />
              </div>
              <div>
                <label
                  htmlFor="field-fonte-do-lead"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  Fonte do Lead
                </label>
                <Select
                  id="field-fonte-do-lead"
                  value={client.leadSource}
                  onChange={(e) => handleChange('leadSource', e.target.value)}
                  options={LEAD_SOURCE_OPTIONS.map((s) => ({ value: s, label: s }))}
                  className={`${DISABLED_SELECT_OVERRIDE} ${getModifiedClass(client.leadSource, originalClient?.leadSource)}`}
                  disabled={!isEditing}
                  aria-label="Fonte do lead"
                />
              </div>

              <div className="col-span-full">
                <div className="relative" ref={dropdownRef}>
                  <span className="block text-sm font-medium text-text-secondary mb-1">
                    Serviços de Interesse
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => isEditing && setInterestsDropdownOpen(!isInterestsDropdownOpen)}
                    className={`w-full bg-background p-2 rounded-md border text-left flex justify-between items-center ${!isEditing ? 'opacity-100 cursor-default' : 'cursor-pointer'} ${JSON.stringify(client.serviceInterests) !== JSON.stringify(originalClient?.serviceInterests) ? 'border-warning ring-1 ring-warning/20' : 'border-border-color'}`}
                    disabled={!isEditing}
                  >
                    <span className="truncate block">
                      {client.serviceInterests.length > 0
                        ? `${client.serviceInterests.length} selecionado(s)`
                        : 'Selecione os serviços...'}
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${isInterestsDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </Button>

                  {isInterestsDropdownOpen && (
                    <div className="absolute z-20 bottom-full left-0 right-0 mb-1 bg-surface border border-border-color rounded-lg shadow-lifted max-h-60 overflow-y-auto custom-scrollbar p-1">
                      {SERVICE_INTEREST_OPTIONS.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 p-2 hover:bg-background rounded-md cursor-pointer transition-colors text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={client.serviceInterests.includes(opt)}
                            onChange={(e) => handleServiceInterestChange(opt, e.target.checked)}
                            className="rounded accent-primary w-4 h-4"
                          />
                          <span className="text-text-primary">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {client.serviceInterests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {client.serviceInterests.map((interest) => (
                      <span
                        key={interest}
                        className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-full text-xs text-text-secondary mt-1">
                Cliente desde: {formatDate(client.registrationDate)}
              </div>
            </div>
          </fieldset>
        </div>
      )}
    </>
  );
}
