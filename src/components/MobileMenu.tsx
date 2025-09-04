'use client';

import React from 'react';
import { Button } from './Button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculatorSelect: (calculator: string) => void;
  activeCalculator: string;
  t: {
    home: string;
    electrolyteCorrection: string;
    wounds: string;
    children: string;
  };
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onCalculatorSelect,
  activeCalculator,
  t
}) => {
  const menuItems = [
    { key: 'home', label: t.home },
    { key: 'electrolyte', label: t.electrolyteCorrection },
    { key: 'antibiotic', label: t.wounds },
    { key: 'pediatric', label: t.children },
    { key: 'bloodGas', label: 'Анализ газов крови' },
    { key: 'infusionTherapy', label: 'Инфузионная терапия' }
  ];

  const handleItemClick = (calculatorKey: string) => {
    onCalculatorSelect(calculatorKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border z-50 transform transition-transform duration-300 ease-in-out md:hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-card-foreground">Меню</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Закрыть меню"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleItemClick(item.key)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  activeCalculator === item.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
