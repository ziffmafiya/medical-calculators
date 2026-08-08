import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
  disabled,
}) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <div className="min-h-[38px] flex items-end pb-1.5">
          <label className="text-xs font-semibold text-[var(--gray-300)] uppercase tracking-wider leading-tight">
            {label}
            {required && <span className="text-[var(--error-500)] ml-0.5">*</span>}
          </label>
        </div>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className={`appearance-none w-full px-3.5 py-2.5 pr-10 bg-[var(--gray-900)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--gray-500)] text-sm h-11 transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-4 ${
            error
              ? 'border-[var(--error-500)] focus-visible:ring-[var(--shadow-ring-error)]'
              : 'border-[var(--input-border)] focus-visible:ring-[var(--ring)] focus-visible:border-[var(--primary)]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted-foreground)]">
          <svg
            className="w-4 h-4"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-[var(--error-500)] mt-1.5">{error}</p>}
    </div>
  );
};