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
  dropdownRef,
  isInterestsDropdownOpen,
  onToggleInterestsDropdown,
  onChange,
  onAddressChange,
  onRepChange,
  onContactChange,
  onAddContact,
  onRemoveContact,
  onServiceInterestChange,
  getModifiedClass,
}: ClientFormInfoTabProps) => (
  <div className="space-y-6">
    <ClientFormInfoIdentityContacts
      client={client}
      initialClient={initialClient}
      isReadOnly={isReadOnly}
      isPJ={isPJ}
      fieldId={fieldId}
      commonInputClass={commonInputClass}
      onChange={onChange}
      onRepChange={onRepChange}
      onContactChange={onContactChange}
      onAddContact={onAddContact}
      onRemoveContact={onRemoveContact}
      getModifiedClass={getModifiedClass}
    />
    <ClientFormInfoAddressStatus
      client={client}
      initialClient={initialClient}
      isReadOnly={isReadOnly}
      fieldId={fieldId}
      commonInputClass={commonInputClass}
      dropdownRef={dropdownRef}
      isInterestsDropdownOpen={isInterestsDropdownOpen}
      onToggleInterestsDropdown={onToggleInterestsDropdown}
      onChange={onChange}
      onAddressChange={onAddressChange}
      onServiceInterestChange={onServiceInterestChange}
      getModifiedClass={getModifiedClass}
    />
  </div>
);
