import { formatCpfCnpj, formatPhone } from '@/utils/formatters';
import type {
  ClientChangeHandler,
  ClientContactChangeHandler,
  ClientRepresentativeChangeHandler,
  FieldId,
} from './types';
import type { Client } from '@/types';
import { AvatarPicker } from '../AvatarPicker';

interface ClientFormInfoIdentityContactsProps {
  client: Client;
  initialClient: Client | null;
  isReadOnly: boolean;
  isPJ: boolean;
  fieldId: FieldId;
  commonInputClass: string;
  onChange: ClientChangeHandler;
  onRepChange: ClientRepresentativeChangeHandler;
  onContactChange: ClientContactChangeHandler;

  getModifiedClass: (currentVal: unknown, originalVal: unknown) => string;
}

export const ClientFormInfoIdentityContacts = ({
  client,
  initialClient,
  isReadOnly,
  isPJ,
  fieldId,
  commonInputClass,
  onChange,
  onRepChange,
  onContactChange,
  getModifiedClass,
}: ClientFormInfoIdentityContactsProps) => (
  <>
    <fieldset className="p-4 border rounded-lg border-border-color">
      <legend className="px-2 font-semibold text-secondary">Identificação</legend>

      <div className="flex gap-4 mb-4 px-1 items-start">
        <AvatarPicker
          name={client.name}
          avatarUrl={client.avatarUrl}
          isReadOnly={isReadOnly}
          onChangeBase64={(base64) => onChange('avatarUrl', base64)}
        />
        <div className="flex flex-col gap-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="clientType"
              value="PF"
              checked={client.clientType === 'PF'}
              onChange={() => onChange('clientType', 'PF')}
              className="accent-primary"
              disabled={isReadOnly}
            />
            <span className="text-sm font-medium text-text-primary">Pessoa Física</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="clientType"
              value="PJ"
              checked={client.clientType === 'PJ'}
              onChange={() => onChange('clientType', 'PJ')}
              className="accent-primary"
              disabled={isReadOnly}
            />
            <span className="text-sm font-medium text-text-primary">Pessoa Jurídica</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="md:col-span-1">
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('name')}
          >
            {isPJ ? 'Razão Social' : 'Nome Completo'}
          </label>
          <input
            id={fieldId('name')}
            type="text"
            value={client.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.name, initialClient?.name)}`}
            disabled={isReadOnly}
          />
        </div>
        <div className="md:col-span-1">
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('birthDate')}
          >
            {isPJ ? 'Data de Abertura' : 'Data de Nascimento'}
          </label>
          <input
            id={fieldId('birthDate')}
            type="date"
            value={client.birthDate || ''}
            onChange={(e) => onChange('birthDate', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.birthDate, initialClient?.birthDate)}`}
            disabled={isReadOnly}
          />
        </div>
        <div className="md:col-span-1">
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('cpfCnpj')}
          >
            {isPJ ? 'CNPJ' : 'CPF'}
          </label>
          <input
            id={fieldId('cpfCnpj')}
            type="text"
            value={client.cpfCnpj || ''}
            onChange={(e) => onChange('cpfCnpj', formatCpfCnpj(e.target.value))}
            className={`${commonInputClass} ${getModifiedClass(client.cpfCnpj, initialClient?.cpfCnpj)}`}
            disabled={isReadOnly}
          />
        </div>

        {isPJ && (
          <>
            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium text-text-secondary mb-1"
                htmlFor={fieldId('rep-name')}
              >
                Nome do Representante
              </label>
              <input
                id={fieldId('rep-name')}
                type="text"
                value={client.representative?.name || ''}
                onChange={(e) => onRepChange('name', e.target.value)}
                className={`${commonInputClass} ${getModifiedClass(client.representative?.name, initialClient?.representative?.name)}`}
                disabled={isReadOnly}
                placeholder="Nome do contato principal"
              />
            </div>
            <div className="md:col-span-1">
              <label
                className="block text-sm font-medium text-text-secondary mb-1"
                htmlFor={fieldId('rep-role')}
              >
                Cargo
              </label>
              <input
                id={fieldId('rep-role')}
                type="text"
                value={client.representative?.role || ''}
                onChange={(e) => onRepChange('role', e.target.value)}
                className={`${commonInputClass} ${getModifiedClass(client.representative?.role, initialClient?.representative?.role)}`}
                disabled={isReadOnly}
                placeholder="Cargo"
              />
            </div>
          </>
        )}
      </div>
    </fieldset>

    <fieldset className="p-4 border rounded-lg border-border-color">
      <legend className="px-2 font-semibold text-secondary">Contatos</legend>
      <div className="space-y-3 pt-2">
        <span className="block text-sm font-medium text-text-secondary mb-2">Telefones</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[0, 1, 2].map((index) => {
            const contact = client.contacts?.[index];
            const phoneLabel = `Telefone 0${index + 1}`;
            return (
              <div key={contact?.id ?? `phone-slot-${index}`}>
                <label
                  className="block text-sm font-medium text-text-secondary mb-1"
                  htmlFor={`contact-phone-${index}`}
                >
                  {phoneLabel}
                </label>
                <input
                  id={`contact-phone-${index}`}
                  type="tel"
                  value={contact?.phone ?? ''}
                  onChange={(e) => {
                    if (contact) {
                      onContactChange(contact.id, 'phone', e.target.value);
                    }
                  }}
                  onBlur={(e) => {
                    if (contact) {
                      onContactChange(contact.id, 'phone', formatPhone(e.target.value));
                    }
                  }}
                  className={`${commonInputClass} ${contact && initialClient?.contacts?.find((c) => c.id === contact.id)?.phone !== contact.phone ? 'border-warning ring-1 ring-warning/20' : 'border-border-color'}`}
                  placeholder={phoneLabel}
                  aria-label={phoneLabel}
                  disabled={isReadOnly}
                />
                {contact && (
                  <label className="flex items-center gap-1.5 text-xs whitespace-nowrap mt-1">
                    <input
                      id={`whatsapp-${contact.id}`}
                      type="checkbox"
                      checked={contact.hasWhatsApp}
                      onChange={(e) => onContactChange(contact.id, 'hasWhatsApp', e.target.checked)}
                      className="rounded accent-primary"
                      disabled={isReadOnly}
                    />{' '}
                    WhatsApp
                  </label>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('email')}
          >
            Email
          </label>
          <input
            id={fieldId('email')}
            type="email"
            value={client.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.email, initialClient?.email)}`}
            disabled={isReadOnly}
          />
        </div>
      </div>
    </fieldset>
  </>
);
