import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui';
import {
  TrashIcon,
  ArchiveIcon,
  UnarchiveIcon,
  EditIcon,
  BuildingIcon,
  GiftIcon,
  UserCircleIcon,
} from '../ui';
import type { Supplier, SupplierContact } from '../../types';
import { SUPPLIER_CATEGORY_OPTIONS } from '../../constants';
import { getInitialSupplier } from '../../utils/supplierHelpers';

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
  const inputClass =
    'w-full bg-background p-2.5 rounded-md border border-border-color focus:border-primary outline-none transition text-sm';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSupplier ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
      size="2xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
        {/* Logo & Name Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-28 h-28 bg-surface rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border-color text-text-secondary cursor-pointer hover:border-primary hover:bg-primary/5 transition-all relative group"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  (() => fileInputRef.current?.click())();
                }
              }}
              role="button"
              tabIndex={0}
            >
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditIcon className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="text-center p-2">
                  <BuildingIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span className="text-[10px] font-semibold">Upload Logo</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
              aria-label="Selecionar logo do fornecedor"
            />
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="field-nome-da-empresa-span-classname-text-error-span"
                  className="block text-xs font-bold text-text-secondary uppercase mb-1"
                >
                  Nome da Empresa <span className="text-error">*</span>
                </label>
                <input
                  id="field-nome-da-empresa-span-classname-text-error-span"
                  type="text"
                  value={supplier.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={inputClass}
                  placeholder="Ex: Marmoraria Pedra Fina"
                  aria-label="Nome do fornecedor"
                />
              </div>
              <div>
                <label
                  htmlFor="field-cnpj"
                  className="block text-xs font-bold text-text-secondary uppercase mb-1"
                >
                  CNPJ
                </label>
                <input
                  id="field-cnpj"
                  type="text"
                  value={supplier.cnpj || ''}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  className={inputClass}
                  placeholder="00.000.000/0001-00"
                  aria-label="CNPJ"
                />
              </div>
              <div>
                <label
                  htmlFor="field-site"
                  className="block text-xs font-bold text-text-secondary uppercase mb-1"
                >
                  Site
                </label>
                <input
                  id="field-site"
                  type="url"
                  value={supplier.site || ''}
                  onChange={(e) => handleChange('site', e.target.value)}
                  className={inputClass}
                  placeholder="https://"
                  aria-label="Site"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs / Sections */}
        <div className="space-y-6">
          <div className="bg-background/30 p-5 rounded-xl border border-border-color/50">
            <h4 className="font-serif font-bold text-secondary mb-4 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5" /> Contato Principal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="field-nome-do-contato"
                  className="block text-xs font-bold text-text-secondary uppercase mb-1"
                >
                  Nome do Contato
                </label>
                <input
                  id="field-nome-do-contato"
                  type="text"
                  value={supplier.mainContact.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  className={inputClass}
                  aria-label="Nome do contato"
                />
              </div>
              <div>
                <label
                  htmlFor="field-cargo"
                  className="block text-xs font-bold text-text-secondary uppercase mb-1"
                >
                  Cargo
                </label>
                <input
                  id="field-cargo"
                  type="text"
                  value={supplier.mainContact.role || ''}
                  onChange={(e) => handleContactChange('role', e.target.value)}
                  className={inputClass}
                  aria-label="Cargo"
                />
              </div>
              <div>
                <span className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Telefone / WhatsApp
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={supplier.mainContact.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    className={inputClass}
                    aria-label="Telefone do contato"
                  />
                  <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none bg-background border border-border-color px-2 py-2.5 rounded-md hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={supplier.mainContact.hasWhatsApp}
                      onChange={(e) => handleContactChange('hasWhatsApp', e.target.checked)}
                      className="rounded accent-primary"
                    />
                    Whats
                  </label>
                </div>
              </div>
              <div>
                <label
                  htmlFor="field-email"
                  className="block text-xs font-bold text-text-secondary uppercase mb-1"
                >
                  Email
                </label>
                <input
                  id="field-email"
                  type="email"
                  value={supplier.mainContact.email || ''}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className={inputClass}
                  aria-label="Email"
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="field-endereco-completo"
                className="block text-xs font-bold text-text-secondary uppercase mb-1"
              >
                Endereço Completo
              </label>
              <input
                id="field-endereco-completo"
                type="text"
                value={supplier.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className={inputClass}
                placeholder="Rua, Número, Bairro, Cidade - UF"
                aria-label="Endereço completo"
              />
            </div>
          </div>

          <div className="bg-background/30 p-5 rounded-xl border border-border-color/50">
            <h4 className="font-serif font-bold text-secondary mb-4 flex items-center gap-2">
              <GiftIcon className="w-5 h-5" /> Detalhes Comerciais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Comissão (%)
                </span>
                <div className="relative">
                  <input
                    type="number"
                    value={supplier.commissionPercentage || ''}
                    onChange={(e) =>
                      handleChange('commissionPercentage', parseFloat(e.target.value) || 0)
                    }
                    className={`${inputClass} pl-3 pr-8`}
                    placeholder="0"
                    aria-label="Comissão (%)"
                  />
                  <span className="absolute right-3 top-2.5 text-text-secondary font-bold">%</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <span className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  Categorias
                </span>
                <div className="h-24 overflow-y-auto bg-background border border-border-color rounded-md p-2 grid grid-cols-2 gap-2 custom-scrollbar">
                  {SUPPLIER_CATEGORY_OPTIONS.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 text-xs cursor-pointer hover:bg-surface p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={supplier.categories.includes(cat)}
                        onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                        className="rounded accent-primary"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="field-notas-internas"
              className="block text-xs font-bold text-text-secondary uppercase mb-1"
            >
              Notas Internas
            </label>
            <textarea
              id="field-notas-internas"
              value={supplier.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Informações sobre atendimento, prazos, qualidade..."
              aria-label="Notas internas"
            />
          </div>
        </div>
      </div>

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
