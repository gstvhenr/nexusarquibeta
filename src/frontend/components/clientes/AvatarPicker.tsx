import { type ChangeEvent, useRef } from 'react';
import { getInitials } from '../../utils/supplierHelpers';
import { CameraIcon } from '../ui/icons-common';

interface AvatarPickerProps {
  name: string;
  avatarUrl?: string;
  isReadOnly?: boolean;
  onChangeBase64: (base64: string) => void;
}

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export function AvatarPicker({
  name,
  avatarUrl,
  isReadOnly = false,
  onChangeBase64,
}: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (isReadOnly) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      alert('A imagem deve ter no máximo 1MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate type
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      alert('A imagem deve estar no formato JPEG ou PNG.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onChangeBase64(base64String);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative group flex-shrink-0">
      <div
        className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-2 border-border-color bg-secondary/80 text-secondary-content font-bold text-xl ${
          isReadOnly ? 'cursor-default' : 'cursor-pointer group-hover:opacity-80 transition-opacity'
        }`}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={isReadOnly ? -1 : 0}
        title={isReadOnly ? 'Foto do cliente' : 'Alterar foto de perfil'}
        role={isReadOnly ? 'img' : 'button'}
        aria-label="Atualizar Avatar do Cliente"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={`Avatar de ${name}`} className="w-full h-full object-cover" />
        ) : (
          getInitials(name || '?')
        )}
      </div>

      {!isReadOnly && (
        <>
          <div
            className="absolute bottom-0 right-0 bg-primary text-primary-content p-1 rounded-full shadow cursor-pointer border-2 border-surface flex items-center justify-center w-6 h-6 hover:scale-110 transition-transform"
            onClick={handleClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Alterar foto"
          >
            <CameraIcon className="w-3 h-3" />
          </div>
          <input
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}
