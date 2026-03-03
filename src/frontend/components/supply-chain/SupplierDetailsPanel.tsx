import {
  Badge,
  BuildingIcon,
  ChartBarIcon,
  ClockIcon,
  CubeIcon,
  EditIcon,
  GiftIcon,
  TagIcon,
} from '../ui';
import { Tab, TabList, TabPanel, Tabs } from '../ui/Tabs';
import type { Supplier } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import SupplierKpiCard from './SupplierKpiCard';
import { SupplierCommissionsTab } from './SupplierCommissionsTab';
import { SupplierContactDetailsTab } from './SupplierContactDetailsTab';
import { SupplierProductsTab } from './SupplierProductsTab';
import type {
  SupplierActiveTab,
  SupplierCommissionHistory,
  SupplierProductSnapshot,
} from './supplierViewTypes';

type SupplierDetailsPanelProps = {
  selectedSupplier: Supplier | null;
  activeTab: SupplierActiveTab;
  onTabChange: (tab: SupplierActiveTab) => void;
  supplierProducts: SupplierProductSnapshot[];
  supplierCommissions: SupplierCommissionHistory;
  pendingCommissionValue: number;
  totalNegotiatedValue: number;
  onEditSupplier: (supplier: Supplier | null) => void;
  onOpenLinkModal: () => void;
};

const SUPPLIER_TABS: readonly SupplierActiveTab[] = ['details', 'products', 'commissions'];

function isSupplierActiveTab(value: string): value is SupplierActiveTab {
  return (SUPPLIER_TABS as readonly string[]).includes(value);
}

export function SupplierDetailsPanel({
  selectedSupplier,
  activeTab,
  onTabChange,
  supplierProducts,
  supplierCommissions,
  pendingCommissionValue,
  totalNegotiatedValue,
  onEditSupplier,
  onOpenLinkModal,
}: SupplierDetailsPanelProps): JSX.Element {
  if (!selectedSupplier) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary p-8">
        <div className="bg-surface p-6 rounded-full shadow-soft mb-6">
          <BuildingIcon className="w-16 h-16 text-border-color" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-text-primary mb-2">
          Selecione um Fornecedor
        </h3>
        <p className="max-w-md">
          Navegue pela lista à esquerda para ver detalhes, gerenciar produtos ou acompanhar
          comissões.
        </p>
        <button
          onClick={() => onEditSupplier(null)}
          className="mt-6 text-primary font-semibold hover:underline"
        >
          Ou cadastre um novo fornecedor
        </button>
      </div>
    );
  }

  const tabButtonClass = ({ active }: { active: boolean }) =>
    `px-6 py-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
      active
        ? 'border-primary text-primary'
        : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'
    }`;

  const handleTabChange = (value: string) => {
    if (isSupplierActiveTab(value)) {
      onTabChange(value);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
      <header className="p-6 pb-0 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden border-2 border-border-color shadow-sm p-1">
              {selectedSupplier.logo ? (
                <img
                  src={selectedSupplier.logo}
                  alt={selectedSupplier.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <BuildingIcon className="w-8 h-8 text-secondary/30" />
              )}
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold text-secondary">
                {selectedSupplier.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-secondary">
                <Badge variant="primary" className="font-medium">
                  <TagIcon className="w-3.5 h-3.5" />{' '}
                  {selectedSupplier.categories[0] || 'Fornecedor'}
                </Badge>
                {selectedSupplier.commissionPercentage ? (
                  <Badge variant="success" className="font-bold">
                    <GiftIcon className="w-3.5 h-3.5" /> {selectedSupplier.commissionPercentage}%
                    Comissão
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
          <button
            onClick={() => onEditSupplier(selectedSupplier)}
            className="px-4 py-2 rounded-lg font-semibold text-sm text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2"
          >
            <EditIcon className="w-4 h-4" /> Editar Perfil
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SupplierKpiCard
            label="Produtos no Catálogo"
            value={supplierProducts.length}
            icon={<CubeIcon className="w-5 h-5" />}
            color="text-info bg-info"
          />
          <SupplierKpiCard
            label="Comissões Pendentes"
            value={formatCurrency(pendingCommissionValue)}
            icon={<ClockIcon className="w-5 h-5" />}
            color="text-warning bg-warning"
          />
          <SupplierKpiCard
            label="Total Negociado"
            value={formatCurrency(totalNegotiatedValue)}
            subtext="Vendas confirmadas"
            icon={<ChartBarIcon className="w-5 h-5" />}
            color="text-success bg-success"
          />
        </div>

        <nav className="flex border-b border-border-color overflow-x-auto no-scrollbar">
          <TabList className="flex">
            <Tab value="details" className={tabButtonClass}>
              Detalhes de Contato
            </Tab>
            <Tab value="products" className={tabButtonClass}>
              Catálogo & Preços
            </Tab>
            <Tab value="commissions" className={tabButtonClass}>
              Histórico Financeiro
            </Tab>
          </TabList>
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto p-6 bg-background/30">
        <TabPanel value="details">
          <SupplierContactDetailsTab supplier={selectedSupplier} />
        </TabPanel>
        <TabPanel value="products">
          <SupplierProductsTab
            supplier={selectedSupplier}
            supplierProducts={supplierProducts}
            onOpenLinkModal={onOpenLinkModal}
          />
        </TabPanel>
        <TabPanel value="commissions">
          <SupplierCommissionsTab supplierCommissions={supplierCommissions} />
        </TabPanel>
      </div>
    </Tabs>
  );
}
