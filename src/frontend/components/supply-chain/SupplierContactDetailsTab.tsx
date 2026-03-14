import { BuildingIcon, GlobeIcon, MailIcon, MapPinIcon, PhoneIcon, UserCircleIcon } from '../ui';
import type { Supplier } from '../../types';

type SupplierContactDetailsTabProps = {
  supplier: Supplier;
};

export function SupplierContactDetailsTab({
  supplier,
}: SupplierContactDetailsTabProps): JSX.Element {
  return (
    <div className="space-y-6 max-w-4xl animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface p-5 rounded-xl shadow-sm border border-border-color">
          <h4 className="font-bold text-secondary mb-4 flex items-center gap-2 border-b border-border-color pb-2">
            <UserCircleIcon className="w-5 h-5" /> Contato Principal
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase">Nome</p>
              <p className="text-text-primary font-medium text-lg">{supplier.mainContact.name}</p>
              <p className="text-sm font-normal text-text-secondary mt-1">
                {supplier.mainContact.role || 'Responsável'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <PhoneIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Telefone</p>
                <div className="flex items-center gap-2">
                  <p className="text-text-primary font-mono">{supplier.mainContact.phone}</p>
                  {supplier.mainContact.hasWhatsApp && (
                    <span className="text-xs font-bold text-success/90 bg-success/10 px-2 py-0.5 rounded-full">
                      WhatsApp
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <MailIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Email</p>
                <a
                  href={`mailto:${supplier.mainContact.email}`}
                  className="text-primary hover:underline"
                >
                  {supplier.mainContact.email || 'N/A'}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl shadow-sm border border-border-color">
          <h4 className="font-bold text-secondary mb-4 flex items-center gap-2 border-b border-border-color pb-2">
            <BuildingIcon className="w-5 h-5" /> Empresa
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase">CNPJ</p>
              <p className="text-text-primary font-mono">{supplier.cnpj || 'Não informado'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-secondary/10 p-2 rounded-lg text-secondary">
                <MapPinIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Endereço</p>
                <p className="text-text-primary text-sm">{supplier.address || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-secondary/10 p-2 rounded-lg text-secondary">
                <GlobeIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Site</p>
                <a
                  href={supplier.site}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline text-sm truncate block max-w-[200px]"
                >
                  {supplier.site || 'N/A'}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-success/10 p-2 rounded-lg text-success">
                <BuildingIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase">Comissão</p>
                <p className="text-text-primary font-bold text-lg">
                  {supplier.commissionPercentage || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {supplier.notes && (
        <div className="bg-warning/10 p-5 rounded-xl border border-warning/20">
          <h4 className="font-bold text-warning mb-2">Anotações Internas</h4>
          <p className="text-text-primary whitespace-pre-wrap text-sm leading-relaxed">
            {supplier.notes}
          </p>
        </div>
      )}
    </div>
  );
}
