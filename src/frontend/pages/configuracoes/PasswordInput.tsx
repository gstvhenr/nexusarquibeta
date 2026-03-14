import { useState } from 'react';
import { IconButton, Input } from '../../components/ui';
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
      <Input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className="pr-10"
      />
      <IconButton
        variant="primary"
        size="sm"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        tabIndex={-1}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        {visible ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
      </IconButton>
    </div>
  );
}
