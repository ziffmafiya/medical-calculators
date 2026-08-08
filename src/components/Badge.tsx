import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'brand' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors duration-150';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const variantStyles = {
    gray: 'bg-[var(--gray-800)] text-[var(--gray-300)] border border-[var(--gray-700)]',
    brand: 'bg-[rgba(54,191,250,0.12)] text-[var(--primary)] border border-[rgba(54,191,250,0.2)]',
    success: 'bg-[rgba(18,183,106,0.12)] text-[var(--success-300)] border border-[rgba(18,183,106,0.2)]',
    warning: 'bg-[rgba(247,144,9,0.12)] text-[var(--warning-300)] border border-[rgba(247,144,9,0.2)]',
    error: 'bg-[rgba(240,68,56,0.12)] text-[var(--error-300)] border border-[rgba(240,68,56,0.2)]',
    info: 'bg-[rgba(54,191,250,0.12)] text-[var(--primary)] border border-[rgba(54,191,250,0.2)]',
  };

  const dotColors = {
    gray: 'bg-[var(--gray-500)]',
    brand: 'bg-[var(--primary)]',
    success: 'bg-[var(--success-500)]',
    warning: 'bg-[var(--warning-500)]',
    error: 'bg-[var(--error-500)]',
    info: 'bg-[var(--primary)]',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};
