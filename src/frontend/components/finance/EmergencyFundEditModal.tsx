import { CurrencyInput } from '@/components/projetos/tabs/project-finance/CurrencyInput';
import { Button, Modal } from '@/components/ui';
import { formatCurrency } from '@/utils/formatters';

interface EmergencyFundEditModalProps {
  currentValue: number | undefined;
  formError: string | null;
  hasTarget: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCurrentValueChange: (value: number | undefined) => void;
  onSave: () => void;
  onTargetToggle: (checked: boolean) => void;
  onTargetValueChange: (value: number | undefined) => void;
  suggestionValue: number | null;
  targetMonths: number;
  targetValue: number | undefined;
}

export function EmergencyFundEditModal({
  currentValue,
  formError,
  hasTarget,
  isOpen,
  onClose,
  onCurrentValueChange,
  onSave,
  onTargetToggle,
  onTargetValueChange,
  suggestionValue,
  targetMonths,
  targetValue,
}: EmergencyFundEditModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fundo de Reserva" size="lg">
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="emergency-fund-current"
            className="text-sm font-semibold text-text-primary"
          >
            Valor atual da reserva
          </label>
          <CurrencyInput
            id="emergency-fund-current"
            aria-label="Valor atual do fundo de reserva"
            value={currentValue}
            onChange={onCurrentValueChange}
            className="w-full rounded-xl border border-border-color/60 bg-background/80 px-4 py-3 text-base font-semibold text-text-primary outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-3 rounded-2xl border border-border-color/40 bg-background/55 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={hasTarget}
              onChange={(event) => onTargetToggle(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border-color text-primary focus:ring-primary/30"
            />
            <span className="text-sm font-semibold text-text-primary">Meta</span>
          </label>

          {hasTarget && (
            <div className="space-y-2">
              <label
                htmlFor="emergency-fund-target"
                className="text-sm font-semibold text-text-primary"
              >
                Meta da reserva
              </label>
              <CurrencyInput
                id="emergency-fund-target"
                aria-label="Meta do fundo de reserva"
                value={targetValue}
                onChange={onTargetValueChange}
                className="w-full rounded-xl border border-border-color/60 bg-background/80 px-4 py-3 text-base font-semibold text-text-primary outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {suggestionValue && (
            <p className="text-xs leading-relaxed text-text-secondary">
              Sugestão inicial: {formatCurrency(suggestionValue)} para cobrir cerca de{' '}
              {targetMonths} meses no ritmo atual do dashboard.
            </p>
          )}
        </div>

        {formError && (
          <div className="rounded-xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
            {formError}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-border-color pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>Salvar reserva</Button>
        </div>
      </div>
    </Modal>
  );
}
