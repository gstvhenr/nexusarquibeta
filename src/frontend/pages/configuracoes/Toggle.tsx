type ToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
};

export function Toggle({ enabled, onChange, label }: ToggleProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`${enabled ? 'bg-primary' : 'bg-border-color'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface`}
      role="switch"
      aria-checked={enabled ? 'true' : 'false'}
      aria-label={label || 'Alternar'}
    >
      <span
        className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
}
