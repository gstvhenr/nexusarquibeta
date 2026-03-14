import React from 'react';
import {
  BuildingIcon,
  FormField,
  GiftIcon,
  Input,
  Textarea,
  UserCircleIcon,
  EditIcon,
} from '../ui';
import type { Supplier, SupplierContact } from '../../types';
import { SUPPLIER_CATEGORY_OPTIONS } from '../../constants';

interface SupplierFormBodyProps {
  supplier: Supplier;
  logoPreview: string | null;
  onClickLogo: () => void;
  onFieldChange: (field: keyof Supplier, value: Supplier[keyof Supplier]) => void;
  onContactChange: (
    field: keyof SupplierContact,
    value: SupplierContact[keyof SupplierContact],
  ) => void;
  onCategoryChange: (category: string, checked: boolean) => void;
}

function SupplierFormBody({
  supplier,
  logoPreview,
  onClickLogo,
  onFieldChange,
  onContactChange,
  onCategoryChange,
}: SupplierFormBodyProps) {
  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
      {/* Logo & Name Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-28 h-28 bg-surface rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border-color text-text-secondary cursor-pointer hover:border-primary hover:bg-primary/5 transition-all relative group"
            onClick={onClickLogo}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClickLogo();
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
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField
                label={
                  <>
                    Nome da Empresa <span className="text-error">*</span>
                  </>
                }
              >
                <Input
                  type="text"
                  value={supplier.name}
                  onChange={(e) => onFieldChange('name', e.target.value)}
                  placeholder="Ex: Marmoraria Pedra Fina"
                />
              </FormField>
            </div>
            <div>
              <FormField label="CNPJ">
                <Input
                  type="text"
                  value={supplier.cnpj || ''}
                  onChange={(e) => onFieldChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </FormField>
            </div>
            <div>
              <FormField label="Site">
                <Input
                  type="url"
                  value={supplier.site || ''}
                  onChange={(e) => onFieldChange('site', e.target.value)}
                  placeholder="https://"
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      {/* Main Contact */}
      <div className="bg-background/30 p-5 rounded-xl border border-border-color/50">
        <h4 className="font-serif font-bold text-secondary mb-4 flex items-center gap-2">
          <UserCircleIcon className="w-5 h-5" /> Contato Principal
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormField label="Nome do Contato">
              <Input
                type="text"
                value={supplier.mainContact.name}
                onChange={(e) => onContactChange('name', e.target.value)}
              />
            </FormField>
          </div>
          <div>
            <FormField label="Cargo">
              <Input
                type="text"
                value={supplier.mainContact.role || ''}
                onChange={(e) => onContactChange('role', e.target.value)}
              />
            </FormField>
          </div>
          <div>
            <span className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Telefone / WhatsApp
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="tel"
                value={supplier.mainContact.phone}
                onChange={(e) => onContactChange('phone', e.target.value)}
              />
              <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none bg-background border border-border-color px-2 py-2.5 rounded-md hover:border-primary transition-colors">
                <input
                  id="supplier-has-whatsapp"
                  type="checkbox"
                  checked={supplier.mainContact.hasWhatsApp}
                  onChange={(e) => onContactChange('hasWhatsApp', e.target.checked)}
                  className="rounded accent-primary"
                />
                Whats
              </label>
            </div>
          </div>
          <div>
            <FormField label="Email">
              <Input
                type="email"
                value={supplier.mainContact.email || ''}
                onChange={(e) => onContactChange('email', e.target.value)}
              />
            </FormField>
          </div>
        </div>
        <div className="mt-4">
          <FormField label="Endereço Completo">
            <Input
              type="text"
              value={supplier.address || ''}
              onChange={(e) => onFieldChange('address', e.target.value)}
              placeholder="Rua, Número, Bairro, Cidade - UF"
            />
          </FormField>
        </div>
      </div>

      {/* Commercial Details */}
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
                id="supplier-commission"
                type="number"
                value={supplier.commissionPercentage || ''}
                onChange={(e) =>
                  onFieldChange('commissionPercentage', parseFloat(e.target.value) || 0)
                }
                className="w-full bg-background p-2.5 rounded-md border border-border-color focus:border-primary outline-none transition text-sm pl-3 pr-8"
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
                    id={`supplier-category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                    type="checkbox"
                    checked={supplier.categories.includes(cat)}
                    onChange={(e) => onCategoryChange(cat, e.target.checked)}
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
        <FormField label="Notas Internas">
          <Textarea
            value={supplier.notes || ''}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            rows={3}
            placeholder="Informações sobre atendimento, prazos, qualidade..."
          />
        </FormField>
      </div>
    </div>
  );
}

export default SupplierFormBody;
