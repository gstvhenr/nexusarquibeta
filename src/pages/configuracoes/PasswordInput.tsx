import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../../components/ui/icons';

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
};

export function PasswordInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: PasswordInputProps): JSX.Element {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-background p-2.5 pr-10 rounded-lg border border-border-color text-text-primary text-sm focus:border-primary"
        aria-label={ariaLabel || placeholder}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-primary transition-colors rounded-md"
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
      </button>
    </div>
  );
}
