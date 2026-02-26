# Canonical Example: Extração de Componente (Antes/Depois)

## Objetivo

Modelo de decomposição de página monolítica, baseado em caso real.

## Arquivos de referência

- Orquestrador: `src/pages/FornecedoresPage.tsx`
- Componentes extraídos: `src/components/supply-chain/*`
- Checklist: `docs/checklists/refactor-hotspot.md`

## Contexto: por que decompor

`FornecedoresPage` concentrava responsabilidades de renderização, modais, cálculo de
visão detalhada e ações de vínculo de produto no mesmo fluxo. A regra operacional
em `AGENTS.md` exige decompor páginas que ultrapassam 500 linhas antes de concluir
ciclos de manutenção.

## Antes (trecho focado — monolito reconstruído)

Trecho representativo do padrão anterior, com UI e regra misturadas no mesmo arquivo:

```tsx
// Antes: trecho monolítico realista
const FornecedoresPage = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleLinkProduct = (productId: string, price: number) => {
    if (!selectedSupplier) return;
    setSupplierProductPrices((prev) => {
      const today = new Date().toISOString().split('T')[0];
      const entry = prev.find(
        (p) => p.productId === productId && p.supplierId === selectedSupplier.id,
      );
      if (entry) {
        return prev.map((p) =>
          p.id === entry.id
            ? { ...p, priceHistory: [...p.priceHistory, { date: today, price }] }
            : p,
        );
      }
      return [...prev, makeSupplierPriceEntry(selectedSupplier.id, productId, today, price)];
    });
  };

  return <>{/* lista + detalhe + modal + KPI no mesmo arquivo */}</>;
};
```

## Depois (resultado da extração)

```tsx
// 1) FornecedoresPage reduzido para composição/orquestração
import { SuppliersView, SupplierFormModal } from '../components/supply-chain';

function FornecedoresPage() {
  const [isSupplierModalOpen, setSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  return (
    <div className="h-full flex flex-col">
      <SuppliersView
        suppliers={suppliers}
        commissions={commissions}
        quotations={quotations}
        projects={projects}
        products={products}
        prices={prices}
        onEditSupplier={setSelectedSupplier}
        onLinkProduct={handleLinkProduct}
      />
      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        initialSupplier={selectedSupplier}
        onSave={handleSaveSupplier}
        onArchive={handleArchiveSupplier}
        onDelete={handleDeleteSupplier}
      />
    </div>
  );
}

// 2) Componente extraído dedicado (ex.: SupplierFormModal)
function SupplierFormModal({ isOpen, onSave, initialSupplier }: Props) {
  const [supplier, setSupplier] = useState<Supplier>(initialSupplier || getInitialSupplier());
  const handleSave = () => {
    if (!supplier.name.trim()) return;
    onSave({ ...supplier, id: supplier.id || `sup_${Date.now()}` });
  };
  return isOpen ? <Modal title="Fornecedor">{/* formulário */}</Modal> : null;
}

// 3) Barrel para exports limpos
export { default as SuppliersView } from './SuppliersView';
export { default as SupplierFormModal } from './SupplierFormModal';
export { default as LinkProductModal } from './LinkProductModal';
export { default as SupplierKpiCard } from './SupplierKpiCard';
```

## Checklist pós-extração

- [ ] Página reduzida a composição (sem lógica de negócio direta)
- [ ] Componentes extraídos em pasta própria com barrel
- [ ] Imports/exports limpos (sem resíduos)
- [ ] `npm run verify` verde
- [ ] Sem mudanças visuais acidentais

## Anti-pattern (NÃO fazer)

```tsx
// ERRADO: extrair UI e manter regra de negócio crítica no componente
export const SupplierForm = () => {
  const isValid = supplier.cnpj.length === 14; // regra de domínio no UI
  return <button disabled={!isValid}>Salvar</button>;
};

// ERRADO: componente extraído dependente da página-pai (acoplamento circular)
import { usePageState, handleEverything } from '../pages/FornecedoresPage';
```

## Regra de manutenção

Se o padrão de decomposição mudar, atualizar este exemplo e registrar decisão em
`DECISIONS-active.md` e/ou ADR quando houver mudança estrutural.
