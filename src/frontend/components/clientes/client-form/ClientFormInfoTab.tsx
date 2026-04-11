import { ClientFormInfoAddressStatus } from './ClientFormInfoAddressStatus';
import { ClientFormInfoIdentityContacts } from './ClientFormInfoIdentityContacts';
import type { ClientFormInfoTabProps } from './types';

export const ClientFormInfoTab = ({
  client,
  initialClient,
  isReadOnly,
  isPJ,
  fieldId,
  commonInputClass,
  onChange,
  onAvatarChange,
  onAddressChange,
  onRepChange,
  onContactChange,
  getModifiedClass,
}: ClientFormInfoTabProps & {
  onAvatarChange?: (file: File | null, preview: string | null) => void;
}) => (
  <div className="space-y-6">
    <ClientFormInfoIdentityContacts
      client={client}
      initialClient={initialClient}
      isReadOnly={isReadOnly}
      isPJ={isPJ}
      fieldId={fieldId}
      commonInputClass={commonInputClass}
      onChange={onChange}
      onAvatarChange={onAvatarChange}
      onRepChange={onRepChange}
      onContactChange={onContactChange}
      getModifiedClass={getModifiedClass}
    />
    <ClientFormInfoAddressStatus
      client={client}
      initialClient={initialClient}
      isReadOnly={isReadOnly}
      fieldId={fieldId}
      commonInputClass={commonInputClass}
      onChange={onChange}
      onAddressChange={onAddressChange}
      getModifiedClass={getModifiedClass}
    />
  </div>
);
