import type { AgendaEvent } from '../../types';
import { TrashIcon } from '../ui/icons';

const labelClass = 'block text-sm font-medium text-text-secondary mb-1';

interface EventAttachmentsFieldProps {
  inputId: string;
  attachments?: AgendaEvent['attachments'];
  newFiles?: File[];
  filesToDelete?: string[];
  onNewFilesChange?: (files: File[]) => void;
  onFilesToDeleteChange?: (paths: string[]) => void;
}

export function EventAttachmentsField({
  inputId,
  attachments,
  newFiles,
  filesToDelete,
  onNewFilesChange,
  onFilesToDeleteChange,
}: EventAttachmentsFieldProps): JSX.Element {
  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>
        Arquivos Anexos (Firebase)
      </label>
      <div className="mb-3">
        <input
          type="file"
          multiple
          id={inputId}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && onNewFilesChange) {
              onNewFilesChange([...(newFiles || []), ...Array.from(e.target.files)]);
            }
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => document.getElementById(inputId)?.click()}
          className="px-4 py-2 border border-border-color rounded-md text-sm font-medium hover:bg-background/80 text-text-primary"
        >
          Selecionar Arquivos...
        </button>
      </div>
      <div className="space-y-2">
        {attachments
          ?.filter(
            (attachment) =>
              !filesToDelete?.includes(
                attachment.storagePath ?? attachment.driveRelativePath ?? '',
              ),
          )
          .map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-2 bg-background/50 rounded-md border border-border-color/30"
            >
              <span className="text-sm text-text-primary truncate">{attachment.name}</span>
              <button
                type="button"
                onClick={() =>
                  (attachment.storagePath ?? attachment.driveRelativePath) &&
                  onFilesToDeleteChange?.([
                    ...(filesToDelete || []),
                    attachment.storagePath ?? attachment.driveRelativePath ?? '',
                  ])
                }
                className="text-text-secondary hover:text-error"
                aria-label="Remover arquivo"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}

        {newFiles?.map((file, idx) => (
          <div
            key={`new-${file.name}-${idx}`}
            className="flex items-center justify-between p-2 bg-secondary/10 rounded-md border border-secondary/20"
          >
            <span className="text-sm text-text-primary truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => onNewFilesChange?.(newFiles.filter((_, i) => i !== idx))}
              className="text-text-secondary hover:text-error"
              aria-label="Remover arquivo selecionado"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
