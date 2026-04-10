import React from 'react';
import { ClienteAddressFieldset } from './ClienteAddressFieldset';
import { FormField, Input, Select } from '@/components/ui';
import { LEAD_SOURCE_OPTIONS, PIPELINE_STATUS_OPTIONS } from '@/constants';
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
  handleChange: (field: keyof Client, value: Client[keyof Client]) => void;
  handleAddressChange: (field: keyof Client['address'], value: string) => void;
  handleRepChange: (field: keyof NonNullable<Client['representative']>, value: string) => void;
  handleContactChange: (
    id: string,
    field: keyof Omit<ClientContact, 'id'>,
    value: string | boolean,
  ) => void;
  getModifiedClass: (currentVal: unknown, originalVal: unknown) => string;
}

export function ClienteDetalhesInfoTab({
  activeTab,
  client,
  isPJ,
  isEditing,
  originalClient,
  handleChange,
  handleAddressChange,
  handleRepChange,
  handleContactChange,
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

            <div className="mt-6">
              <span className="block text-sm font-medium text-text-secondary mb-2">Telefones</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[0, 1, 2].map((index) => {
                  const contact = client.contacts?.[index];
                  const phoneLabel = `Telefone 0${index + 1}`;
                  return (
                    <FormField key={contact?.id ?? `phone-slot-${index}`} label={phoneLabel}>
                      <Input
                        type="tel"
                        value={contact?.phone ?? ''}
                        onChange={(e) => {
                          if (contact) {
                            handleContactChange(contact.id, 'phone', e.target.value);
                          }
                        }}
                        onBlur={(e) => {
                          if (contact) {
                            handleContactChange(contact.id, 'phone', formatPhone(e.target.value));
                          }
                        }}
                        className={`${DISABLED_OVERRIDE} ${contact && originalClient?.contacts?.find((c) => c.id === contact.id)?.phone !== contact.phone ? 'border-warning ring-1 ring-warning/20' : 'border-border-color'}`}
                        placeholder={phoneLabel}
                        disabled={!isEditing}
                        aria-label={phoneLabel}
                      />
                      {contact && (
                        <label className="flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer mt-1">
                          <input
                            id={`whatsapp-${contact.id}`}
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
                      )}
                    </FormField>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
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
