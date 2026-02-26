const fs = require('fs');
const files = [
  'src/pages/FornecedoresPage.tsx',
  'src/pages/GestaoMarketingPage.tsx',
  'src/pages/ClienteDetalhesPage.tsx',
  'src/components/finance/index.ts',
];
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split(/\r?\n/).length;
  const bytes = fs.statSync(f).size;
  console.log(`${f}\tbytes=${bytes}\tlines=${lines}`);
}

const gm = fs.readFileSync('src/pages/GestaoMarketingPage.tsx', 'utf8');
console.log(
  `GestaoMarketing inline modals remaining? professional=${gm.includes('const ProfessionalFormModal')} activity=${gm.includes('const ActivityFormModal')} idea=${gm.includes('const IdeaFormModal')}`,
);

const forn = fs.readFileSync('src/pages/FornecedoresPage.tsx', 'utf8');
console.log(
  `Fornecedores local KPI names: has KPICard=${forn.includes('const KPICard')} has SupplierKpiCard=${forn.includes('const SupplierKpiCard')}`,
);

const fi = fs.readFileSync('src/components/finance/index.ts', 'utf8');
console.log(`Finance index exports from financeiro? ${fi.includes('../financeiro')}`);
