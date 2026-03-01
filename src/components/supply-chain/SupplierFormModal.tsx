import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui';
import { TrashIcon, ArchiveIcon, UnarchiveIcon } from '../ui';
import type { Supplier, SupplierContact } from '../../types';
import { getInitialSupplier } from '../../utils/supplierHelpers';
import SupplierFormBody from './SupplierFormBody';

/**
 * Full CRUD modal for creating / editing a supplier record.
 * @param initialSupplier – `null` for creation, populated for editing
 * @param onSave – Callback with the finalised `Supplier` object
 */
const SupplierFormModal: (props: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
  onArchive: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  initialSupplier: Supplier | null;
}) => React.ReactNode = ({ isOpen, onClose, onSave, onArchive, onDelete, initialSupplier }) => {
  const [supplier, setSupplier] = useState<Supplier>(initialSupplier || getInitialSupplier());
  const [logoPreview, setLogoPreview] = useState<string | null>(initialSupplier?.logo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const data = initialSupplier || getInitialSupplier();
    setSupplier(data);
    setLogoPreview(data.logo || null);
  }, [initialSupplier, isOpen]);

  const handleChange = (field: keyof Supplier, value: Supplier[keyof Supplier]) =>
    setSupplier((s) => ({ ...s, [field]: value }));

  const handleContactChange = (
    field: keyof SupplierContact,
    value: SupplierContact[keyof SupplierContact],
  ) => setSupplier((s) => ({ ...s, mainContact: { ...s.mainContact, [field]: value } }));

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...supplier.categories, category]
      : supplier.categories.filter((c) => c !== category);
    handleChange('categories', newCategories);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        handleChange('logo', result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    if (!supplier.name.trim()) {
      alert('O nome do fornecedor é obrigatório.');
      return;
    }
    onSave({ ...supplier, id: supplier.id || `sup_${Date.now()}` });
  };

  const handleDelete = () => {
    if (
      initialSupplier &&
      window.confirm(
        `Tem certeza que deseja excluir "${initialSupplier.name}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      onDelete(initialSupplier.id);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSupplier ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
      size="2xl"
    >
      <SupplierFormBody
        supplier={supplier}
        logoPreview={logoPreview}
        onClickLogo={() => fileInputRef.current?.click()}
        onFieldChange={handleChange}
        onContactChange={handleContactChange}
        onCategoryChange={handleCategoryChange}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoChange}
        accept="image/*"
        className="hidden"
        aria-label="Selecionar logo do fornecedor"
      />

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-color">
        <div>
          {initialSupplier && (
            <div className="flex gap-2">
              <button
                onClick={() => onArchive(supplier)}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-secondary hover:bg-secondary/10 transition-colors flex items-center gap-2"
              >
                {supplier.archived ? (
                  <UnarchiveIcon className="w-4 h-4" />
                ) : (
                  <ArchiveIcon className="w-4 h-4" />
                )}{' '}
                {supplier.archived ? 'Reativar' : 'Arquivar'}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" /> Excluir
              </button>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-text-primary bg-border-color/50 hover:bg-border-color transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg font-semibold text-primary-content bg-primary hover:bg-primary-focus transition-colors shadow-soft"
          >
            Salvar Fornecedor
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SupplierFormModal;
