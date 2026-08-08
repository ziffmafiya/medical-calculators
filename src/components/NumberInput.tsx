import React from 'react';

export interface NumberInputProps {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  required?: boolean;
  precision?: number;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  placeholder,
  required,
  helperText,
  error,
  disabled,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(null);
      return;
    }
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const inputValue = value === null ? '' : value;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--gray-300)] mb-1.5">
          {label}
          {required && <span className="text-[var(--error-500)] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3.5 py-2.5 bg-[var(--gray-900)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--gray-500)] text-sm h-11 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 ${
            error
              ? 'border-[var(--error-500)] focus-visible:ring-[var(--shadow-ring-error)]'
              : 'border-[var(--input-border)] focus-visible:ring-[var(--ring)] focus-visible:border-[var(--primary)]'
          } ${unit ? 'pr-12' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--muted-foreground)] bg-[var(--gray-800)] px-2 py-0.5 rounded-md pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {error ? (
        <p className="text-xs text-[var(--error-500)] mt-1.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">{helperText}</p>
      ) : null}
    </div>
  );
};