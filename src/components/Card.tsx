import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`glass-panel border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-950/40 transition-all duration-200 ${className}`}>
      {title && (
        <div className="mb-4 sm:mb-6 border-b border-slate-800/80 pb-3">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-slate-400 text-xs sm:text-sm mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};