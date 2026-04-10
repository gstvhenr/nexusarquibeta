import { FormField, Input } from '@/components/ui';
import type { Client } from '@/types';
import { formatCEP } from '@/utils/formatters';

const DISABLED_OVERRIDE = 'disabled:opacity-100 disabled:cursor-default disabled:bg-background/50';

interface ClienteAddressFieldsetProps {
  client: Client;
  originalClient: Client | undefined;
  isEditing: boolean;
  handleAddressChange: (field: keyof Client['address'], value: string) => void;
  getModifiedClass: (currentVal: unknown, originalVal: unknown) => string;
}

export function ClienteAddressFieldset({
  client,
  originalClient,
  isEditing,
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
          <FormField label="CEP">
            <Input
              type="text"
              value={client.address.zip}
              onChange={(e) => handleAddressChange('zip', formatCEP(e.target.value))}
              className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.address.zip, originalClient?.address.zip)}`}
              disabled={!isEditing}
              aria-label="CEP"
            />
          </FormField>
        </div>
        <div className="md:col-span-4">
          <FormField label="Logradouro">
            <Input
              type="text"
              value={client.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.address.street, originalClient?.address.street)}`}
              disabled={!isEditing}
              aria-label="Logradouro"
            />
          </FormField>
        </div>
        <div className="md:col-span-2">
          <FormField label="Número">
            <Input
              type="text"
              value={client.address.number}
              onChange={(e) => handleAddressChange('number', e.target.value)}
              className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.address.number, originalClient?.address.number)}`}
              disabled={!isEditing}
              aria-label="Número"
            />
          </FormField>
        </div>
        <div className="md:col-span-4">
          <FormField label="Complemento">
            <Input
              type="text"
              value={client.address.complement || ''}
              onChange={(e) => handleAddressChange('complement', e.target.value)}
              className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.address.complement, originalClient?.address.complement)}`}
              disabled={!isEditing}
              placeholder="Opcional"
              aria-label="Complemento"
            />
          </FormField>
        </div>
        <div className="md:col-span-3">
          <FormField label="Bairro">
            <Input
              type="text"
              value={client.address.neighborhood}
              onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
              className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.address.neighborhood, originalClient?.address.neighborhood)}`}
              disabled={!isEditing}
              aria-label="Bairro"
            />
          </FormField>
        </div>
        <div className="md:col-span-2">
          <FormField label="Cidade">
            <Input
              type="text"
              value={client.address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              className={`${DISABLED_OVERRIDE} ${getModifiedClass(client.address.city, originalClient?.address.city)}`}
              disabled={!isEditing}
              aria-label="Cidade"
            />
          </FormField>
        </div>
        <div className="md:col-span-1">
          <FormField label="Estado">
            <Input
              type="text"
              value={client.address.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              className={DISABLED_OVERRIDE}
              disabled={true}
              aria-label="Estado"
            />
          </FormField>
        </div>
      </div>
    </fieldset>
  );
}
