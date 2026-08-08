import React from 'react';

interface StatCardProps {
  label?: string;
  title?: string;
  value: string | number | React.ReactNode;
  unit?: string;
  sublabel?: string;
  description?: React.ReactNode;
  helpText?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'normal' | 'warning' | 'critical';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  title,
  value,
  unit,
  sublabel,
  description,
  helpText,
  trend,
  status = 'normal',
  className = '',
}) => {
  const displayLabel = label || title;
  const displaySublabel = sublabel || helpText;
  const statusStyles = {
    normal: 'text-[var(--foreground)]',
    warning: 'text-[var(--warning-300)]',
    critical: 'text-[var(--error-300)]',
  };

  const trendIcon = {
    up: (
      <svg className="w-4 h-4 text-[var(--success-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4 text-[var(--error-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    neutral: (
      <svg className="w-4 h-4 text-[var(--gray-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
  };

  return (
    <div className={`bg-[#0d1424] border border-slate-800/80 rounded-xl p-4 sm:p-5 transition-all duration-200 hover:border-slate-700/60 shadow-xs ${className}`}>
      <div className="text-xs font-semibold text-slate-400 mb-2 flex justify-between items-center tracking-wide">
        <span>{displayLabel}</span>
        {trend && <span>{trendIcon[trend]}</span>}
      </div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${statusStyles[status]}`}>
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">{unit}</span>}
      </div>
      {displaySublabel && <div className="text-xs text-slate-500 mt-2">{displaySublabel}</div>}
      {description && <div className="mt-2.5">{description}</div>}
    </div>
  );
};
