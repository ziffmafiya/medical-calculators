import React from 'react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const InfoIcon = () => (
  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-5 h-5 text-[var(--success-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5 text-[var(--warning-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5 text-[var(--error-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  onDismiss,
  className = '',
}) => {
  const baseLayout = 'flex gap-3 p-4 rounded-xl border';

  const variantStyles = {
    info: 'bg-[rgba(54,191,250,0.06)] border-[rgba(54,191,250,0.15)] text-[var(--gray-300)]',
    success: 'bg-[rgba(18,183,106,0.06)] border-[rgba(18,183,106,0.15)] text-[var(--gray-300)]',
    warning: 'bg-[rgba(247,144,9,0.06)] border-[rgba(247,144,9,0.15)] text-[var(--gray-300)]',
    error: 'bg-[rgba(240,68,56,0.06)] border-[rgba(240,68,56,0.15)] text-[var(--gray-300)]',
  };

  const defaultIcons = {
    info: <InfoIcon />,
    success: <SuccessIcon />,
    warning: <WarningIcon />,
    error: <ErrorIcon />,
  };

  return (
    <div className={`${baseLayout} ${variantStyles[variant]} ${className}`}>
      <div className="flex-shrink-0 mt-0.5">
        {icon || defaultIcons[variant]}
      </div>
      <div className="flex-1 min-w-0">
        {title && <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">{title}</h3>}
        <div className="text-sm text-[var(--gray-300)]">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-md hover:bg-white/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors self-start"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
