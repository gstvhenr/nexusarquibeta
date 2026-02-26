type SectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function Section({ title, description, children }: SectionProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-border-color">
      <div className="md:col-span-1">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>
      <div className="md:col-span-2 bg-surface rounded-xl shadow-soft p-6">{children}</div>
    </div>
  );
}
