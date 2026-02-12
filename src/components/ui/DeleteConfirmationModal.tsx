import React from 'react';
import Modal from './Modal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
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
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-6 py-2 rounded-lg font-semibold text-white bg-error hover:opacity-90 transition-colors"
        >
          Excluir
        </button>
      </div>
    </Modal>
  );
};
