import { Button } from '../../ui';
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
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="primary" onClick={onSwitchToEdit}>
          Editar Cliente
        </Button>
      </>
    ) : (
      <>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave}>
          Salvar Alterações
        </Button>
      </>
    )}
  </div>
);
