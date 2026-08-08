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
      onChange(null);
    } else {
      let newValue = parseFloat(inputValue);
      if (!isNaN(newValue)) {
        if (precision !== undefined) {
          newValue = Math.round(newValue * Math.pow(10, precision)) / Math.pow(10, precision);
        }
        onChange(newValue);
      }
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
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
          className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner min-h-[44px]"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {helperText && (
        <p className="mt-1 text-[11px] text-slate-400 leading-normal">
          {helperText}
        </p>
      )}
    </div>
  );
};