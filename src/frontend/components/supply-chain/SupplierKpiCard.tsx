import React from 'react';

/**
 * Visual KPI card used in the supplier detail panel.
 * @param label – KPI name (e.g. "Produtos no Catálogo")
 * @param value – Formatted number or currency string
 * @param icon  – React element for the icon
 * @param color – Tailwind colour classes (e.g. "text-info bg-info")
 */
const SupplierKpiCard: (props: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color: string;
}) => React.ReactNode = ({ label, value, subtext, icon, color }) => (
  <div className="bg-surface rounded-xl shadow-sm border border-border-color p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
    <div className={`p-2.5 rounded-full ${color} bg-opacity-10 text-opacity-100 flex-shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-text-secondary truncate">{label}</p>
      <p className="text-lg font-bold font-sans text-text-primary truncate">{value}</p>
      {subtext && <p className="text-xs text-text-secondary mt-0.5 truncate">{subtext}</p>}
    </div>
  </div>
);

export default SupplierKpiCard;
