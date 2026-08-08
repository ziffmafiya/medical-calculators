'use client';

import React, { useEffect } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculatorSelect: (calculator: string) => void;
  activeCalculator: string;
  t: {
    home: string;
    electrolyteCorrection: string;
    wounds: string; // fallback for antibiotic
    children: string; // pediatric
    intubationDoses?: string;
    bloodGas?: string;
    infusionTherapy?: string;
  };
}

export default function MobileMenu({ isOpen, onClose, onCalculatorSelect, activeCalculator, t }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (calc: string) => {
    onCalculatorSelect(calc);
    onClose();
  };

  const menuItems = [
    { id: 'home', label: t.home || 'Главная', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { id: 'intubation', label: t.intubationDoses || 'Изолированная интубация', badge: 'NEW', category: 'АНЕСТЕЗИОЛОГИЯ', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /> },
    { id: 'electrolyte', label: t.electrolyteCorrection || 'Электролиты', category: 'ЭЛЕКТРОЛИТЫ', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> },
    { id: 'bloodGas', label: t.bloodGas || 'Анализ газов крови', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /> },
    { id: 'antibiotic', label: t.wounds || 'Антибиотики', category: 'ТЕРАПИЯ', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /> },
    { id: 'pediatric', label: t.children || 'Педиатрия', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
    { id: 'infusionTherapy', label: t.infusionTherapy || 'Инфузионная терапия', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in" 
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-[var(--gray-900)] border-l border-[var(--border)] z-50 shadow-[var(--shadow-2xl)] animate-slide-right flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center font-bold text-lg">
              M
            </div>
            <span className="font-bold text-lg text-[var(--foreground)]">MDcalc</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(54,191,250,0.24)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable nav items */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item, index) => {
            const isActive = activeCalculator === item.id;
            return (
              <React.Fragment key={item.id}>
                {item.category && (
                  <div className={`text-overline text-[var(--muted-foreground)] px-3 mb-2 ${index > 0 ? 'mt-6' : 'mt-2'}`}>
                    {item.category}
                  </div>
                )}
                <button
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 mx-2 w-[calc(100%-16px)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(54,191,250,0.24)] ${
                    isActive 
                      ? 'bg-[rgba(54,191,250,0.08)] text-[var(--primary)] border-l-2 border-[var(--primary)] rounded-l-none'
                      : 'text-[var(--gray-300)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon}
                  </svg>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[rgba(54,191,250,0.12)] text-[var(--primary)]">
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--gray-600)] text-center">
            v1.0.0
          </p>
        </div>
      </div>
    </>
  );
}
