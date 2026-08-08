'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import MobileMenu from '@/components/MobileMenu';
import { translations } from '@/i18n/translations';

// Calculators
import { ElectrolyteCorrectionCalculator } from '@/calculators/ElectrolyteCorrectionCalculator';
import { AntibioticProphylaxisCalculator } from '@/calculators/AntibioticProphylaxisCalculator';
import { PediatricDoseCalculator } from '@/calculators/PediatricDoseCalculator';
import { BloodGasAnalysisCalculator } from '@/calculators/BloodGasAnalysisCalculator';
import { InfusionTherapyCalculator } from '@/calculators/InfusionTherapyCalculator';
import { IntubationDoseCalculator } from '@/calculators/IntubationDoseCalculator';

type CalculatorType = 'home' | 'electrolyte' | 'antibiotic' | 'pediatric' | 'bloodGas' | 'infusionTherapy' | 'intubation';

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Desktop nav items mapping
  const navItems = [
    { id: 'intubation', label: t.intubationDoses || 'Изолированная интубация' },
    { id: 'electrolyte', label: t.electrolyteCorrection || 'Электролиты' },
    { id: 'antibiotic', label: t.wounds || 'Антибиотики' },
    { id: 'pediatric', label: t.children || 'Педиатрия' },
    { id: 'bloodGas', label: t.bloodGas || 'Анализ газов крови' },
    { id: 'infusionTherapy', label: t.infusionTherapy || 'Инфузионная терапия' }
  ] as const;

  const calculators = [
    {
      id: 'intubation',
      title: t.intubationDoses || 'Изолированная интубация',
      description: 'Дозировки препаратов для интубации и седации',
      iconBg: 'bg-sky-500/10 text-sky-500',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
      badge: 'NEW'
    },
    {
      id: 'electrolyte',
      title: t.electrolyteCorrection || 'Электролиты',
      description: 'Расчет коррекции калия, натрия и других электролитов',
      iconBg: 'bg-blue-500/10 text-blue-500',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    },
    {
      id: 'antibiotic',
      title: t.wounds || 'Антибиотики',
      description: 'Дозировки антибиотиков и других препаратов',
      iconBg: 'bg-amber-500/10 text-amber-500',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    },
    {
      id: 'pediatric',
      title: t.children || 'Педиатрия',
      description: 'Педиатрические дозировки и расчеты',
      iconBg: 'bg-emerald-500/10 text-emerald-500',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    },
    {
      id: 'bloodGas',
      title: t.bloodGas || 'Анализ газов крови',
      description: 'Интерпретация результатов КЩС',
      iconBg: 'bg-rose-500/10 text-rose-500',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    },
    {
      id: 'infusionTherapy',
      title: t.infusionTherapy || 'Инфузионная терапия',
      description: 'Расчет скорости и объема инфузии',
      iconBg: 'bg-cyan-500/10 text-cyan-500',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    }
  ];

  const getActiveCalculatorTitle = () => {
    if (activeCalculator === 'home') return t.home || 'Главная';
    const calc = calculators.find(c => c.id === activeCalculator);
    return calc ? calc.title : activeCalculator;
  };

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'electrolyte': return <ElectrolyteCorrectionCalculator />;
      case 'antibiotic': return <AntibioticProphylaxisCalculator />;
      case 'pediatric': return <PediatricDoseCalculator />;
      case 'bloodGas': return <BloodGasAnalysisCalculator />;
      case 'infusionTherapy': return <InfusionTherapyCalculator />;
      case 'intubation': return <IntubationDoseCalculator />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button 
            className="flex items-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[rgba(54,191,250,0.24)] rounded-lg p-1" 
            onClick={() => setActiveCalculator('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center font-bold text-lg">
              M
            </div>
            <span className="font-bold text-lg text-[var(--foreground)]">MDcalc</span>
          </button>

          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveCalculator(item.id as CalculatorType)}
                className={`text-sm font-medium transition-colors duration-150 px-1 pt-1 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[rgba(54,191,250,0.24)] rounded ${
                  activeCalculator === item.id 
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] pb-[18px]' 
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] pb-[20px]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button 
              className="md:hidden p-2 rounded-lg text-[var(--gray-300)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[rgba(54,191,250,0.24)]"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onCalculatorSelect={(id) => setActiveCalculator(id as CalculatorType)}
        activeCalculator={activeCalculator}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t={t as any}
      />

      <main className="flex-1 w-full px-4 sm:px-6 py-6 sm:py-10">
        {activeCalculator === 'home' ? (
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-10 sm:py-16">
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
                {t.welcome || 'Добро пожаловать в MDcalc'}
              </h1>
              <p className="text-lg text-[var(--muted-foreground)] mt-3 max-w-2xl mx-auto">
                {t.welcomeSubtitle || 'Набор медицинских калькуляторов для врачей'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {calculators.map((calc) => (
                <button 
                  key={calc.id}
                  onClick={() => setActiveCalculator(calc.id as CalculatorType)}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 cursor-pointer group transition-all duration-200 hover:border-[var(--primary)]/40 hover:shadow-[var(--shadow-md)] text-left focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[rgba(54,191,250,0.24)] focus-visible:border-[var(--primary)]"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${calc.iconBg}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {calc.icon}
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-150">
                      {calc.title}
                    </h2>
                    {calc.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[rgba(54,191,250,0.12)] text-[var(--primary)] ml-2">
                        {calc.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                    {calc.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] mb-6">
              <button 
                onClick={() => setActiveCalculator('home')}
                className="hover:text-[var(--foreground)] transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[rgba(54,191,250,0.24)] rounded px-1"
              >
                {t.home || 'Главная'}
              </button>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[var(--foreground)] font-medium px-1">
                {getActiveCalculatorTitle()}
              </span>
            </div>
            
            <div className="animate-fade-in">
              {renderCalculator()}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} MDcalc. Все права защищены.
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Приложение предназначено только для медицинских работников.
          </p>
        </div>
      </footer>
    </div>
  );
}
