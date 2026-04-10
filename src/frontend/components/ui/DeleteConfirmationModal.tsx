import React from 'react';
import Modal from './Modal';
import { Button } from './Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}

export const DeleteConfirmationModal: (props: DeleteConfirmationModalProps) => React.ReactNode = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Confirmar Exclusão de ${itemType}`}>
      <p className="text-text-primary mb-6">
        Tem certeza que deseja excluir {itemType.toLowerCase()}{' '}
        <strong className="font-semibold text-secondary">{itemName}</strong>? Esta ação não pode ser
        desfeita.
      </p>
      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Excluir
        </Button>
      </div>
    </Modal>
  );
};
