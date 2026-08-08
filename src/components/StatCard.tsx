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
    <div className={`bg-[var(--gray-900)] border border-[var(--border)] rounded-xl p-4 sm:p-5 transition-all duration-200 ${className}`}>
      <div className="text-xs font-medium text-[var(--muted-foreground)] mb-2 flex justify-between items-center">
        {displayLabel}
        {trend && <span>{trendIcon[trend]}</span>}
      </div>
      <div>
        <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${statusStyles[status]}`}>
          {value}
        </span>
        {unit && <span className="text-sm font-normal text-[var(--muted-foreground)] ml-1">{unit}</span>}
      </div>
      {displaySublabel && <div className="text-xs text-[var(--gray-500)] mt-1.5">{displaySublabel}</div>}
      {description && <div className="mt-2">{description}</div>}
    </div>
  );
};
