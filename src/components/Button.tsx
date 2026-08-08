import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  className = '',
  fullWidth = false,
}) => {
  const baseStyles = variant !== 'link'
    ? 'rounded-lg font-semibold transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[var(--ring)] inline-flex items-center justify-center gap-2'
    : 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[var(--ring)]';

  const variants = {
    primary: 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] shadow-[var(--shadow-xs)]',
    secondary: 'bg-[var(--card)] hover:bg-[var(--gray-700)] text-[var(--foreground)] border border-[var(--border)]',
    outline: 'bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]',
    ghost: 'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]',
    destructive: 'bg-[var(--destructive)] hover:bg-[#d92d20] text-white',
    link: 'bg-transparent text-[var(--primary)] hover:text-[var(--primary-hover)] underline-offset-4 hover:underline p-0 h-auto',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs h-8',
    sm: 'px-3.5 py-2 text-sm h-9',
    md: 'px-4 py-2.5 text-sm h-10',
    lg: 'px-5 py-2.5 text-base h-11',
    xl: 'px-6 py-3 text-base h-12',
  };

  const sizeStyles = variant === 'link' ? '' : sizes[size];
  const variantStyles = variants[variant];
  const widthStyles = fullWidth ? 'w-full' : '';
  const disabledStyles = (disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${disabledStyles} ${className}`.trim()}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
};