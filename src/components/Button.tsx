import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none transition-all duration-200 active:scale-[0.98] cursor-pointer';
  
  const variantClasses = {
    primary: 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20 border border-sky-400/30 focus:ring-2 focus:ring-sky-500/40',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/60 focus:ring-2 focus:ring-slate-600',
    outline: 'bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white focus:ring-2 focus:ring-sky-500/20',
  };
  
  const sizeClasses = {
    sm: 'px-3.5 py-2 text-xs min-h-[38px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3.5 text-base min-h-[48px]',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed active:scale-100' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};