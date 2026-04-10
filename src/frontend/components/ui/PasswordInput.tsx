import { useState } from 'react';
import { IconButton } from './IconButton';
import { Input } from './Input';
import { EyeIcon, EyeOffIcon } from './icons';

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
        onClick={() => setVisible((previous) => !previous)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </IconButton>
    </div>
  );
}
