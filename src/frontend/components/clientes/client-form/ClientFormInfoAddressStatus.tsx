import { Select } from '../../ui';
import { clientStatuses, type Client } from '@/types';
import { LEAD_SOURCE_OPTIONS, PIPELINE_STATUS_OPTIONS } from '@/constants';
import { formatCEP, formatDate } from '@/utils/formatters';
import type { ClientAddressChangeHandler, ClientChangeHandler, FieldId } from './types';

interface ClientFormInfoAddressStatusProps {
  client: Client;
  initialClient: Client | null;
  isReadOnly: boolean;
  fieldId: FieldId;
  commonInputClass: string;
  onChange: ClientChangeHandler;
  onAddressChange: ClientAddressChangeHandler;
  getModifiedClass: (currentVal: unknown, originalVal: unknown) => string;
}

export const ClientFormInfoAddressStatus = ({
  client,
  initialClient,
  isReadOnly,
  fieldId,
  commonInputClass,
  onChange,
  onAddressChange,
  getModifiedClass,
}: ClientFormInfoAddressStatusProps) => (
  <>
    <fieldset className="p-4 border rounded-lg border-border-color">
      <legend className="px-2 font-semibold text-secondary">Endereço</legend>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-2">
        <div className="md:col-span-4">
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('address-street')}
          >
            Logradouro
          </label>
          <input
            id={fieldId('address-street')}
            type="text"
            value={client.address.street}
            onChange={(e) => onAddressChange('street', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.address.street, initialClient?.address.street)}`}
            disabled={isReadOnly}
          />
        </div>
        <div className="md:col-span-2">
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('address-number')}
          >
            Número
          </label>
          <input
            id={fieldId('address-number')}
            type="text"
            value={client.address.number}
            onChange={(e) => onAddressChange('number', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.address.number, initialClient?.address.number)}`}
            disabled={isReadOnly}
          />
        </div>
        <div className="md:col-span-6">
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('address-complement')}
          >
            Complemento
          </label>
          <input
            id={fieldId('address-complement')}
            type="text"
            value={client.address.complement || ''}
            onChange={(e) => onAddressChange('complement', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.address.complement, initialClient?.address.complement)}`}
            disabled={isReadOnly}
            placeholder="Opcional"
          />
        </div>
        <div className="md:col-span-3">
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('address-neighborhood')}
          >
            Bairro
          </label>
          <input
            id={fieldId('address-neighborhood')}
            type="text"
            value={client.address.neighborhood}
            onChange={(e) => onAddressChange('neighborhood', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.address.neighborhood, initialClient?.address.neighborhood)}`}
            disabled={isReadOnly}
          />
        </div>
        <div className="md:col-span-3">
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('address-city')}
          >
            Cidade
          </label>
          <input
            id={fieldId('address-city')}
            type="text"
            value={client.address.city}
            onChange={(e) => onAddressChange('city', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.address.city, initialClient?.address.city)}`}
            disabled={isReadOnly}
          />
        </div>
        <div className="md:col-span-1">
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('address-state')}
          >
            Estado
          </label>
          <input
            id={fieldId('address-state')}
            type="text"
            value={client.address.state}
            onChange={(e) => onAddressChange('state', e.target.value)}
            className={commonInputClass}
            disabled={true}
          />
        </div>
        <div className="md:col-span-2">
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('address-zip')}
          >
            CEP
          </label>
          <input
            id={fieldId('address-zip')}
            type="text"
            value={client.address.zip}
            onChange={(e) => onAddressChange('zip', formatCEP(e.target.value))}
            className={`${commonInputClass} ${getModifiedClass(client.address.zip, initialClient?.address.zip)}`}
            disabled={isReadOnly}
          />
        </div>
      </div>
    </fieldset>

    <fieldset className="p-4 border rounded-lg border-border-color">
      <legend className="px-2 font-semibold text-secondary">Status</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 items-start">
        <div>
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('status')}
          >
            Status do Cliente
          </label>
          <Select
            id={fieldId('status')}
            value={client.status}
            onChange={(e) => onChange('status', e.target.value)}
            options={clientStatuses.map((status) => ({ value: status, label: status }))}
            className={`${commonInputClass} ${getModifiedClass(client.status, initialClient?.status)}`}
            disabled={isReadOnly}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('pipelineStatus')}
          >
            Status no Pipeline
          </label>
          <Select
            id={fieldId('pipelineStatus')}
            value={client.pipelineStatus}
            onChange={(e) => onChange('pipelineStatus', e.target.value)}
            options={PIPELINE_STATUS_OPTIONS.map((status) => ({ value: status, label: status }))}
            className={`${commonInputClass} ${getModifiedClass(client.pipelineStatus, initialClient?.pipelineStatus)}`}
            disabled={isReadOnly}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-text-secondary mb-1"
            htmlFor={fieldId('leadSource')}
          >
            Fonte do Lead
          </label>
          <Select
            id={fieldId('leadSource')}
            value={client.leadSource}
            onChange={(e) => onChange('leadSource', e.target.value)}
            options={LEAD_SOURCE_OPTIONS.map((source) => ({ value: source, label: source }))}
            className={`${commonInputClass} ${getModifiedClass(client.leadSource, initialClient?.leadSource)}`}
            disabled={isReadOnly}
          />
        </div>

        <div className="col-span-full text-xs text-text-secondary mt-1">
          Cliente desde: {formatDate(client.registrationDate)}
        </div>
      </div>
    </fieldset>
  </>
);
