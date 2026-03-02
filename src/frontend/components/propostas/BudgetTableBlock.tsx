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
            <h4 className="font-serif text-lg font-bold text-gray-800 mb-2 border-b-2 border-primary/20 pb-1 inline-block">
              {section.title}
            </h4>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b border-gray-200">
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
                    <tr key={item.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 pr-4 text-gray-700">
                        {item.description}
                        {item.quantity > 1 && (
                          <span className="text-gray-400 text-xs ml-2">
                            ({item.quantity} {item.unit})
                          </span>
                        )}
                      </td>
                      {showItemPrices && (
                        <td className="py-3 pl-4 text-right font-medium text-gray-900">
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
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded">
                  <span className="text-sm text-gray-600 font-medium">Subtotal da Seção:</span>
                  <span className="text-base text-gray-900 font-semibold">
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
          className={`flex items-end pt-4 mt-4 border-t-2 border-gray-300 ${totalsAlignment === 'left' ? 'justify-start' : 'justify-end'}`}
        >
          <div className="w-full max-w-xs space-y-2 text-md">
            {showDiscount && proposal.discount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(proposal.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Desconto ({proposal.discount}%)</span>
                  <span className="font-medium text-red-500">
                    - {formatCurrency(proposal.subtotal - proposal.total)}
                  </span>
                </div>
                <div className="border-t border-gray-200 my-1"></div>
              </>
            )}
            <div className="flex justify-between font-bold text-xl items-center">
              <span className="text-primary">Total</span>
              <span className="text-gray-900">{formatCurrency(proposal.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
