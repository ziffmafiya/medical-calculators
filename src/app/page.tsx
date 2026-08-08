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

            {/* Calculator Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 md:px-0">
              {/* Intubation Doses Calculator Card (Featured) */}
              <div 
                className="glass-panel border border-sky-500/30 rounded-2xl p-6 hover:border-sky-400 transition-all duration-300 cursor-pointer group shadow-xl shadow-sky-950/20 hover:scale-[1.01] flex flex-col justify-between"
                onClick={() => setActiveCalculator('intubation')}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      NEW
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                    {t.intubationDoses}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {t.intubationDosesDesc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
                  <span>Открыть калькулятор →</span>
                </div>
              </div>

              {/* Electrolyte Calculator Card */}
              <div 
                className="glass-panel border border-slate-800/80 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group shadow-xl shadow-slate-950/40 hover:scale-[1.01] flex flex-col justify-between"
                onClick={() => setActiveCalculator('electrolyte')}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {t.electrolyteCorrection}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {t.electrolyteCorrectionDesc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Открыть калькулятор →</span>
                </div>
              </div>

              {/* Antibiotic Calculator Card */}
              <div 
                className="glass-panel border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300 cursor-pointer group shadow-xl shadow-slate-950/40 hover:scale-[1.01] flex flex-col justify-between"
                onClick={() => setActiveCalculator('antibiotic')}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {t.antibioticProphylaxis}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {t.antibioticProphylaxisDesc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Открыть калькулятор →</span>
                </div>
              </div>

              {/* Pediatric Doses Calculator Card */}
              <div 
                className="glass-panel border border-slate-800/80 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group shadow-xl shadow-slate-950/40 hover:scale-[1.01] flex flex-col justify-between"
                onClick={() => setActiveCalculator('pediatric')}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {t.pediatricDoses}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {t.pediatricDosesDesc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Открыть калькулятор →</span>
                </div>
              </div>

              {/* Blood Gas Analysis Calculator Card */}
              <div 
                className="glass-panel border border-slate-800/80 rounded-2xl p-6 hover:border-rose-500/50 transition-all duration-300 cursor-pointer group shadow-xl shadow-slate-950/40 hover:scale-[1.01] flex flex-col justify-between"
                onClick={() => setActiveCalculator('bloodGas')}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">
                    Анализ газов крови
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Расчет анионного промежутка, формулы Винтера, интерпретация кислотно-щелочного баланса
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform">
                  <span>Открыть калькулятор →</span>
                </div>
              </div>

              {/* Infusion Therapy Calculator Card */}
              <div 
                className="glass-panel border border-slate-800/80 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group shadow-xl shadow-slate-950/40 hover:scale-[1.01] flex flex-col justify-between"
                onClick={() => setActiveCalculator('infusionTherapy')}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    Инфузионная терапия
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Расчет потребности в жидкости, коррекция дефицита и рекомендации по инфузии
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Открыть калькулятор →</span>
                </div>
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
