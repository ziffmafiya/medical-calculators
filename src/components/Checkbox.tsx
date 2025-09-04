import React from 'react';

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  children,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
      />
      {children && (
        <label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {children}
        </label>
      )}
    </div>
  );
}; 