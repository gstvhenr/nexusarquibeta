import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  trailing?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children, trailing }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-serif text-base font-bold text-text-primary tracking-tight">{children}</h3>
    {trailing}
  </div>
);
