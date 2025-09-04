import React from 'react';

interface NumberInputProps {
  label: string;
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
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  unit,
  placeholder,
  required = false,
  precision,
  helperText,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (inputValue === '') {
      // Если поле пустое, устанавливаем null
      onChange(null);
    } else {
      let newValue = parseFloat(inputValue);
      if (!isNaN(newValue)) {
        // Применяем precision если указан
        if (precision !== undefined) {
          newValue = Math.round(newValue * Math.pow(10, precision)) / Math.pow(10, precision);
        }
        onChange(newValue);
      }
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value ?? ''}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className="w-full px-3 py-3 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] text-base"
        />
        {unit && (
          <span className="absolute right-3 top-2 text-muted-foreground text-sm">
            {unit}
          </span>
        )}
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}; 