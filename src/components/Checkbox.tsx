import React from 'react';

export interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  children?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  children,
  description,
  disabled = false,
}) => {
  return (
    <label
      className={`inline-flex items-start gap-3 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className="relative flex items-start pt-0.5">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`w-5 h-5 flex items-center justify-center rounded-md border-2 transition-all duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--ring)] ${
            checked
              ? 'bg-[var(--primary)] border-[var(--primary)]'
              : 'border-[var(--input-border)] bg-[var(--gray-900)]'
          }`}
        >
          {checked && (
            <svg
              className="w-3.5 h-3.5 text-white"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      {(children || label || description) && (
        <div className="flex flex-col">
          {(children || label) && (
            <span className="text-sm font-medium text-[var(--foreground)]">
              {children || label}
            </span>
          )}
          {description && (
            <span className="text-sm text-[var(--muted-foreground)]">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};