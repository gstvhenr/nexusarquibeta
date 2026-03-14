import React from 'react';
import type { Proposal, SavedSection } from '../../types';
import { formatCurrency } from '../../utils/formatters';

type BudgetTableBlockProps = {
  proposal: Proposal;
  showItemPrices: boolean;
  showSectionTotals: boolean;
  showDiscount: boolean;
  showGrandTotal: boolean;
  totalsAlignment: 'right' | 'left';
};

const computeSectionTotal = (section: SavedSection): number => {
  return section.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
};

export const BudgetTableBlock: (props: BudgetTableBlockProps) => React.ReactNode = ({
  proposal,
  showItemPrices,
  showSectionTotals,
  showDiscount,
  showGrandTotal,
  totalsAlignment,
}) => {
  return (
    <div className="my-6">
      {proposal.sections.map((section) => {
        const sectionTotal = computeSectionTotal(section);
        return (
          <div key={section.id} className="mb-8">
            <h4 className="font-serif text-lg font-bold text-text-primary mb-2 border-b-2 border-primary/20 pb-1 inline-block">
              {section.title}
            </h4>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm">
                <thead className="text-left text-text-secondary border-b border-border-color">
                  <tr>
                    <th className="py-2 pr-4 font-semibold uppercase text-xs tracking-wider">
                      Descrição
                    </th>
                    {showItemPrices && (
                      <th className="py-2 pl-4 text-right font-semibold uppercase text-xs tracking-wider w-32">
                        Valor
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item) => (
                    <tr key={item.id} className="border-b border-border-color/30 last:border-0">
                      <td className="py-3 pr-4 text-text-primary">
                        {item.description}
                        {item.quantity > 1 && (
                          <span className="text-text-secondary text-xs ml-2">
                            ({item.quantity} {item.unit})
                          </span>
                        )}
                      </td>
                      {showItemPrices && (
                        <td className="py-3 pl-4 text-right font-medium text-text-primary">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showSectionTotals && (
              <div className="flex justify-end mt-3 pr-2">
                <div className="flex items-center gap-3 bg-background px-4 py-2 rounded">
                  <span className="text-sm text-text-secondary font-medium">
                    Subtotal da Seção:
                  </span>
                  <span className="text-base text-text-primary font-semibold">
                    {formatCurrency(sectionTotal)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {showGrandTotal && (
        <div
          className={`flex items-end pt-4 mt-4 border-t-2 border-border-color ${totalsAlignment === 'left' ? 'justify-start' : 'justify-end'}`}
        >
          <div className="w-full max-w-xs space-y-2 text-md">
            {showDiscount && proposal.discount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-medium text-text-primary">
                    {formatCurrency(proposal.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Desconto ({proposal.discount}%)</span>
                  <span className="font-medium text-error">
                    - {formatCurrency(proposal.subtotal - proposal.total)}
                  </span>
                </div>
                <div className="border-t border-border-color my-1"></div>
              </>
            )}
            <div className="flex justify-between font-bold text-xl items-center">
              <span className="text-primary">Total</span>
              <span className="text-text-primary">{formatCurrency(proposal.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
