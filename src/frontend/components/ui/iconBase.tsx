import React from 'react';

type IconProps = {
  children: React.ReactNode;
  className?: string;
  viewBox?: string;
  fill?: string;
  strokeWidth?: number;
};

export const Icon: (props: IconProps) => React.ReactNode = ({
  children,
  className = 'w-6 h-6',
  viewBox = '0 0 24 24',
  fill = 'none',
  strokeWidth = 1.5,
}) => (
  <svg
    className={className}
    fill={fill}
    viewBox={viewBox}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);
