import type { ClientFormFooterProps } from './types';

export const ClientFormFooter = ({
  isReadOnly,
  onClose,
  onSwitchToEdit,
  onSave,
}: ClientFormFooterProps) => (
  <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border-color">
    {isReadOnly ? (
      <>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
        >
          Fechar
        </button>
        <button
          type="button"
          onClick={onSwitchToEdit}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors"
        >
          Editar Cliente
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors"
        >
          Salvar Alterações
        </button>
      </>
    )}
  </div>
);
