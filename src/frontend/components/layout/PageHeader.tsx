import React from 'react';
import { PAGE_HEADER_CONTENT_GAP, type PageHeaderContentGap } from '../../constants/layout';

interface PageHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  icon?: React.ReactElement<{ className?: string }>;
  children?: React.ReactNode;
  contentGap?: PageHeaderContentGap;
}

const PageHeader: (props: PageHeaderProps) => React.ReactNode = ({
  title,
  subtitle,
  icon,
  children,
  contentGap = 'default',
}) => {
  return (
    <div
      className={`${PAGE_HEADER_CONTENT_GAP[contentGap]} bg-surface rounded-2xl p-6 shadow-sm border border-border-color/20`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
              {React.cloneElement(icon, { className: 'w-8 h-8' })}
            </div>
          )}
          <div>
            <h1 className="font-serif text-3xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
