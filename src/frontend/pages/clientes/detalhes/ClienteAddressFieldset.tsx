import type { Client } from '../../../types';
import { formatCEP } from '../../../utils/formatters';

interface ClienteAddressFieldsetProps {
  client: Client;
  originalClient: Client | undefined;
  isEditing: boolean;
  commonInputClass: string;
  handleAddressChange: (field: keyof Client['address'], value: string) => void;
  getModifiedClass: (currentVal: unknown, originalVal: unknown) => string;
}

export function ClienteAddressFieldset({
  client,
  originalClient,
  isEditing,
  commonInputClass,
  handleAddressChange,
  getModifiedClass,
}: ClienteAddressFieldsetProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-bold text-secondary mb-4 border-b border-border-color pb-1 w-full">
        Endereço
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="field-cep" className="block text-sm font-medium text-text-secondary mb-1">
            CEP
          </label>
          <input
            id="field-cep"
            type="text"
            value={client.address.zip}
            onChange={(e) => handleAddressChange('zip', formatCEP(e.target.value))}
            className={`${commonInputClass} ${getModifiedClass(client.address.zip, originalClient?.address.zip)}`}
            disabled={!isEditing}
            aria-label="CEP"
          />
        </div>
        <div className="md:col-span-4">
          <label
            htmlFor="field-logradouro"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Logradouro
          </label>
          <input
            id="field-logradouro"
            type="text"
            value={client.address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.address.street, originalClient?.address.street)}`}
            disabled={!isEditing}
            aria-label="Logradouro"
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor="field-numero"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Número
          </label>
          <input
            id="field-numero"
            type="text"
            value={client.address.number}
            onChange={(e) => handleAddressChange('number', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.address.number, originalClient?.address.number)}`}
            disabled={!isEditing}
            aria-label="Número"
          />
        </div>
        <div className="md:col-span-4">
          <label
            htmlFor="field-complemento"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Complemento
          </label>
          <input
            id="field-complemento"
            type="text"
            value={client.address.complement || ''}
            onChange={(e) => handleAddressChange('complement', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.address.complement, originalClient?.address.complement)}`}
            disabled={!isEditing}
            placeholder="Opcional"
            aria-label="Complemento"
          />
        </div>
        <div className="md:col-span-3">
          <label
            htmlFor="field-bairro"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Bairro
          </label>
          <input
            id="field-bairro"
            type="text"
            value={client.address.neighborhood}
            onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.address.neighborhood, originalClient?.address.neighborhood)}`}
            disabled={!isEditing}
            aria-label="Bairro"
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor="field-cidade"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Cidade
          </label>
          <input
            id="field-cidade"
            type="text"
            value={client.address.city}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            className={`${commonInputClass} ${getModifiedClass(client.address.city, originalClient?.address.city)}`}
            disabled={!isEditing}
            aria-label="Cidade"
          />
        </div>
        <div className="md:col-span-1">
          <label
            htmlFor="field-estado"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            Estado
          </label>
          <input
            id="field-estado"
            type="text"
            value={client.address.state}
            onChange={(e) => handleAddressChange('state', e.target.value)}
            className={commonInputClass}
            disabled={true}
            aria-label="Estado"
          />
        </div>
      </div>
    </fieldset>
  );
}
