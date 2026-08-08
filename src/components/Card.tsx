import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  footer,
  padding = 'md',
  variant = 'default',
}) => {
  const variants = {
    default: 'bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-xs)]',
    outlined: 'bg-transparent border border-[var(--border)] rounded-xl',
    elevated: 'bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-lg)]',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div className={`${variants[variant]} ${paddings[padding]} ${className}`.trim()}>
      {(title || subtitle || headerAction) && (
        <div
          className={`flex items-start justify-between border-b border-[var(--border)] ${
            padding === 'lg' ? 'mb-5 pb-5' : 'mb-4 pb-4'
          }`}
        >
          <div>
            {title && <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>}
            {subtitle && <p className="text-sm text-[var(--muted-foreground)] mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="border-t border-[var(--border)] pt-4 mt-4">
          {footer}
        </div>
      )}
    </div>
  );
};