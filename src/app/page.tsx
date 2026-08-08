'use client';

import React, { useState } from 'react';
import { ElectrolyteCorrectionCalculator } from '@/calculators/ElectrolyteCorrectionCalculator';
import { AntibioticProphylaxisCalculator } from '@/calculators/AntibioticProphylaxisCalculator';
import { PediatricDoseCalculator } from '@/calculators/PediatricDoseCalculator';
import { BloodGasAnalysisCalculator } from '@/calculators/BloodGasAnalysisCalculator';
import { InfusionTherapyCalculator } from '@/calculators/InfusionTherapyCalculator';
import { IntubationDoseCalculator } from '@/calculators/IntubationDoseCalculator';
import { Button } from '@/components/Button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { MobileMenu } from '@/components/MobileMenu';
import { useLanguage } from '@/i18n/LanguageContext';

type CalculatorType = 'home' | 'electrolyte' | 'antibiotic' | 'pediatric' | 'bloodGas' | 'infusionTherapy' | 'intubation';

export default function Home() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-30 bg-card/85 backdrop-blur-md border-b border-border/80 shadow-sm">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 md:space-x-8">
              <button
                onClick={() => setActiveCalculator('home')}
                className="text-xl md:text-2xl font-bold tracking-tight text-card-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-base font-extrabold">M</span>
                <span>MDcalc</span>
              </button>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setActiveCalculator('home')}
                  className={`text-sm font-medium transition-colors ${
                    activeCalculator === 'home' 
                      ? 'text-primary font-semibold' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.home}
                </button>
                <button
                  onClick={() => setActiveCalculator('intubation')}
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeCalculator === 'intubation' 
                      ? 'text-primary font-semibold' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{t.intubationDoses}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold">NEW</span>
                </button>
                <button
                  onClick={() => setActiveCalculator('electrolyte')}
                  className={`text-sm font-medium transition-colors ${
                    activeCalculator === 'electrolyte' 
                      ? 'text-primary font-semibold' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.electrolyteCorrection}
                </button>
                <button
                  onClick={() => setActiveCalculator('antibiotic')}
                  className={`text-sm font-medium transition-colors ${
                    activeCalculator === 'antibiotic' 
                      ? 'text-primary font-semibold' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.wounds}
                </button>
                <button
                  onClick={() => setActiveCalculator('pediatric')}
                  className={`text-sm font-medium transition-colors ${
                    activeCalculator === 'pediatric' 
                      ? 'text-primary font-semibold' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.children}
                </button>
                <button
                  onClick={() => setActiveCalculator('bloodGas')}
                  className={`text-sm font-medium transition-colors ${
                    activeCalculator === 'bloodGas' 
                      ? 'text-primary font-semibold' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Анализ газов крови
                </button>
                <button
                  onClick={() => setActiveCalculator('infusionTherapy')}
                  className={`text-sm font-medium transition-colors ${
                    activeCalculator === 'infusionTherapy' 
                      ? 'text-primary font-semibold' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Инфузионная терапия
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <LanguageSelector />
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg transition-all"
                aria-label="Открыть меню"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Quick-Pill Navigation Scrollbar */}
        <div className="md:hidden flex overflow-x-auto py-2 px-3 gap-2 border-t border-border/40 bg-accent/15 no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveCalculator('home')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCalculator === 'home'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'bg-card/70 text-muted-foreground border border-border/50 hover:bg-accent'
            }`}
          >
            {t.home}
          </button>
          <button
            onClick={() => setActiveCalculator('intubation')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              activeCalculator === 'intubation'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/50'
            }`}
          >
            <span>{t.intubationDoses}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveCalculator('electrolyte')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCalculator === 'electrolyte'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'bg-card/70 text-muted-foreground border border-border/50 hover:bg-accent'
            }`}
          >
            {t.electrolyteCorrection}
          </button>
          <button
            onClick={() => setActiveCalculator('antibiotic')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCalculator === 'antibiotic'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'bg-card/70 text-muted-foreground border border-border/50 hover:bg-accent'
            }`}
          >
            {t.wounds}
          </button>
          <button
            onClick={() => setActiveCalculator('pediatric')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCalculator === 'pediatric'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'bg-card/70 text-muted-foreground border border-border/50 hover:bg-accent'
            }`}
          >
            {t.children}
          </button>
          <button
            onClick={() => setActiveCalculator('bloodGas')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCalculator === 'bloodGas'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'bg-card/70 text-muted-foreground border border-border/50 hover:bg-accent'
            }`}
          >
            Газы крови
          </button>
          <button
            onClick={() => setActiveCalculator('infusionTherapy')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCalculator === 'infusionTherapy'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'bg-card/70 text-muted-foreground border border-border/50 hover:bg-accent'
            }`}
          >
            Инфузия
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {activeCalculator === 'home' && (
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
                {t.welcome}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground px-4 md:px-0">
                {t.welcomeSubtitle}
              </p>
            </div>

            {/* Calculator Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
              {/* Electrolyte Calculator Card */}
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200 cursor-pointer group card-hover"
                   onClick={() => setActiveCalculator('electrolyte')}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    {t.electrolyteCorrection}
                  </h3>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t.electrolyteCorrectionDesc}
                </p>
              </div>

              {/* Antibiotic Calculator Card */}
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200 cursor-pointer group card-hover"
                   onClick={() => setActiveCalculator('antibiotic')}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    {t.antibioticProphylaxis}
                  </h3>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t.antibioticProphylaxisDesc}
                </p>
              </div>

              {/* Pediatric Doses Calculator Card */}
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200 cursor-pointer group card-hover"
                   onClick={() => setActiveCalculator('pediatric')}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    {t.pediatricDoses}
                  </h3>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t.pediatricDosesDesc}
                </p>
              </div>

              {/* Blood Gas Analysis Calculator Card */}
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200 cursor-pointer group card-hover"
                   onClick={() => setActiveCalculator('bloodGas')}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    Анализ газов крови
                  </h3>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Расчет анионного промежутка, формулы Винтера, интерпретация кислотно-щелочного баланса
                </p>
              </div>

              {/* Infusion Therapy Calculator Card */}
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200 cursor-pointer group card-hover"
                   onClick={() => setActiveCalculator('infusionTherapy')}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    Инфузионная терапия
                  </h3>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Расчет потребности в жидкости, коррекция дефицита и рекомендации по инфузии
                </p>
              </div>

              {/* Intubation Doses Calculator Card */}
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200 cursor-pointer group card-hover"
                   onClick={() => setActiveCalculator('intubation')}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    {t.intubationDoses}
                  </h3>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t.intubationDosesDesc}
                </p>
              </div>

              {/* Coming Soon Card */}
              <div className="bg-card border border-border rounded-lg p-6 opacity-60">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-muted-foreground">
                    {t.glasgowComaScale}
                  </h3>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    {t.comingSoon}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t.glasgowComaScaleDesc}
                </p>
              </div>
            </div>

                          {/* Back to Calculators Button */}
              <div className="text-center mt-8 md:mt-12 px-4 md:px-0">
                <Button
                  onClick={() => setActiveCalculator('electrolyte')}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {t.startCalculation}
                </Button>
              </div>
          </div>
        )}

        {activeCalculator === 'electrolyte' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setActiveCalculator('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1 px-2.5 rounded-lg bg-card/60 border border-border/50"
              >
                {t.backToCalculators}
              </button>
            </div>
            <ElectrolyteCorrectionCalculator />
          </div>
        )}

        {activeCalculator === 'antibiotic' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setActiveCalculator('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1 px-2.5 rounded-lg bg-card/60 border border-border/50"
              >
                {t.backToCalculators}
              </button>
            </div>
            <AntibioticProphylaxisCalculator />
          </div>
        )}

        {activeCalculator === 'pediatric' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setActiveCalculator('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1 px-2.5 rounded-lg bg-card/60 border border-border/50"
              >
                {t.backToCalculators}
              </button>
            </div>
            <PediatricDoseCalculator />
          </div>
        )}

        {activeCalculator === 'bloodGas' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setActiveCalculator('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1 px-2.5 rounded-lg bg-card/60 border border-border/50"
              >
                {t.backToCalculators}
              </button>
            </div>
            <BloodGasAnalysisCalculator />
          </div>
        )}

        {activeCalculator === 'infusionTherapy' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setActiveCalculator('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1 px-2.5 rounded-lg bg-card/60 border border-border/50"
              >
                {t.backToCalculators}
              </button>
            </div>
            <InfusionTherapyCalculator />
          </div>
        )}

        {activeCalculator === 'intubation' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setActiveCalculator('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1 px-2.5 rounded-lg bg-card/60 border border-border/50"
              >
                {t.backToCalculators}
              </button>
            </div>
            <IntubationDoseCalculator />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground text-sm">
            <p>{t.copyright}</p>
            <p className="mt-2">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onCalculatorSelect={(calculator) => setActiveCalculator(calculator as CalculatorType)}
        activeCalculator={activeCalculator}
        t={t}
      />
    </div>
  );
}
