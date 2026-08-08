'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/Card';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  IntubationInputs, 
  AnthropometricsResult, 
  DrugDoseDetail 
} from '@/types';

export const IntubationDoseCalculator: React.FC = () => {
  const { t } = useLanguage();

  const [inputs, setInputs] = useState<IntubationInputs>({
    gender: 'male',
    age: 45,
    height: 175,
    weight: 85,
    lbwFormula: 'janmahasatian',
    selectedRelaxant: 'both',
    propofolInductionDosePerKg: 2.0,
    propofolMaintDosePerKgMin: 100,
    fentanylInductionDosePerKg: 0.75,
    fentanylMaintDosePerKgHour: 1.5,
    atracuriumDosePerKg: 0.45,
    rocuroniumDosePerKg: 0.6,
    propofolConcMgMl: 10,
    fentanylConcMcgMl: 50,
    atracuriumConcMgMl: 10,
    rocuroniumConcMgMl: 10,
  });

  const [showAdvancedConc, setShowAdvancedConc] = useState(false);

  // Anthro calculations
  const anthropometrics = useMemo<AnthropometricsResult | null>(() => {
    if (!inputs.weight || !inputs.height || inputs.weight <= 0 || inputs.height <= 0) {
      return null;
    }

    const weight = inputs.weight; // TBW
    const heightCm = inputs.height;
    const heightM = heightCm / 100;

    // BMI
    const bmi = weight / (heightM * heightM);

    // IBW (Devine 1974)
    const baseIbw = inputs.gender === 'male' ? 50 : 45.5;
    const ibw = Math.max(30, baseIbw + 0.9 * (heightCm - 152.4));

    // LBW (Janmahasatian 2005)
    let lbwJanmahasatian = 0;
    if (inputs.gender === 'male') {
      lbwJanmahasatian = (9270 * weight) / (6680 + 216 * bmi);
    } else {
      lbwJanmahasatian = (9270 * weight) / (8780 + 244 * bmi);
    }

    // LBW (James 1976)
    let lbwJames = 0;
    const weightHeightRatioSq = Math.pow(weight / heightCm, 2);
    if (inputs.gender === 'male') {
      lbwJames = 1.10 * weight - 128 * weightHeightRatioSq;
    } else {
      lbwJames = 1.07 * weight - 148 * weightHeightRatioSq;
    }
    if (lbwJames <= 0 || lbwJames > weight) {
      lbwJames = lbwJanmahasatian;
    }

    const selectedLbw = inputs.lbwFormula === 'janmahasatian' ? lbwJanmahasatian : lbwJames;

    // ABW
    const abw = ibw + 0.4 * (weight - ibw);

    // Tidal Volume (6-8 ml/kg IBW)
    const vtMin = Math.round(6 * ibw);
    const vtMax = Math.round(8 * ibw);

    const isObese = weight > 1.2 * ibw || bmi >= 30;

    return {
      tbw: weight,
      ibw,
      lbwJanmahasatian,
      lbwJames,
      selectedLbw,
      abw,
      bmi,
      vtMin,
      vtMax,
      isObese,
    };
  }, [inputs.weight, inputs.height, inputs.gender, inputs.lbwFormula]);

  // Drug calculations
  const drugDetails = useMemo<DrugDoseDetail[]>(() => {
    if (!anthropometrics) return [];

    const details: DrugDoseDetail[] = [];
    const { tbw, ibw, selectedLbw } = anthropometrics;

    // 1. Propofol Induction (LBW)
    const propIndMinMg = 1.0 * selectedLbw;
    const propIndMaxMg = 3.0 * selectedLbw;
    const propIndSelectedMg = inputs.propofolInductionDosePerKg * selectedLbw;
    const propConc = inputs.propofolConcMgMl > 0 ? inputs.propofolConcMgMl : 10;

    details.push({
      id: 'propofol-induction',
      drugName: t.propofolName || 'Пропофол (Propofol)',
      category: 'hypnotic',
      phase: 'induction',
      weightMetricUsed: 'LBW',
      weightValue: selectedLbw,
      dosePerKgRange: `1.0 – 3.0 ${t.unitMgKg || 'мг/кг'}`,
      selectedDosePerKg: inputs.propofolInductionDosePerKg,
      unitPerKg: t.unitMgKg || 'мг/кг',
      totalDoseMin: propIndMinMg,
      totalDoseMax: propIndMaxMg,
      selectedTotalDose: propIndSelectedMg,
      totalDoseUnit: 'mg',
      volumeMinMl: propIndMinMg / propConc,
      volumeMaxMl: propIndMaxMg / propConc,
      selectedVolumeMl: propIndSelectedMg / propConc,
      concentrationStr: `${propConc} mg/ml (${propConc / 10}%)`,
      explanation: t.propofolInductionExp || 'Доза рассчитывается по LBW (тощей массе) во избежание гипотензии.',
    });

    // 2. Propofol Maintenance (TBW)
    const propMaintMinMcgMin = 50 * tbw;
    const propMaintMaxMcgMin = 200 * tbw;
    const propMaintSelectedMcgMin = inputs.propofolMaintDosePerKgMin * tbw;

    const propMaintMinMgH = (propMaintMinMcgMin * 60) / 1000;
    const propMaintMaxMgH = (propMaintMaxMcgMin * 60) / 1000;
    const propMaintSelectedMgH = (propMaintSelectedMcgMin * 60) / 1000;

    details.push({
      id: 'propofol-maintenance',
      drugName: t.propofolMaintName || 'Пропофол (Инфузия)',
      category: 'hypnotic',
      phase: 'maintenance',
      weightMetricUsed: 'TBW',
      weightValue: tbw,
      dosePerKgRange: `50 – 200 ${t.unitMcgKgMin || 'мкг/кг/мин'}`,
      selectedDosePerKg: inputs.propofolMaintDosePerKgMin,
      unitPerKg: t.unitMcgKgMin || 'мкг/кг/мин',
      totalDoseMin: propMaintMinMgH,
      totalDoseMax: propMaintMaxMgH,
      selectedTotalDose: propMaintSelectedMgH,
      totalDoseUnit: t.unitMgHour || 'мг/час',
      rateMinMlHour: propMaintMinMgH / propConc,
      rateMaxMlHour: propMaintMaxMgH / propConc,
      selectedRateMlHour: propMaintSelectedMgH / propConc,
      concentrationStr: `${propConc} mg/ml (${propConc / 10}%)`,
      explanation: t.propofolMaintExp || 'Поддержание анестезии рассчитывается по TBW (фактическому весу) или TCI.',
    });

    // 3. Fentanyl Induction (LBW)
    const fentIndMinMcg = 0.5 * selectedLbw;
    const fentIndMaxMcg = 1.0 * selectedLbw;
    const fentIndSelectedMcg = inputs.fentanylInductionDosePerKg * selectedLbw;
    const fentConc = inputs.fentanylConcMcgMl > 0 ? inputs.fentanylConcMcgMl : 50;

    details.push({
      id: 'fentanyl-induction',
      drugName: t.fentanylName || 'Фентанил (Fentanyl)',
      category: 'analgesic',
      phase: 'induction',
      weightMetricUsed: 'LBW',
      weightValue: selectedLbw,
      dosePerKgRange: `0.5 – 1.0 ${t.unitMcgKg || 'мкг/кг'}`,
      selectedDosePerKg: inputs.fentanylInductionDosePerKg,
      unitPerKg: t.unitMcgKg || 'мкг/кг',
      totalDoseMin: fentIndMinMcg,
      totalDoseMax: fentIndMaxMcg,
      selectedTotalDose: fentIndSelectedMcg,
      totalDoseUnit: 'mcg',
      volumeMinMl: fentIndMinMcg / fentConc,
      volumeMaxMl: fentIndMaxMcg / fentConc,
      selectedVolumeMl: fentIndSelectedMcg / fentConc,
      concentrationStr: `${fentConc} mcg/ml (0.005%)`,
      explanation: t.fentanylInductionExp || 'Индукция анальгезии рассчитывается по тощей массе тела (LBW).',
    });

    // 4. Fentanyl Maintenance (LBW)
    const fentMaintMinMcgH = 1.0 * selectedLbw;
    const fentMaintMaxMcgH = 2.0 * selectedLbw;
    const fentMaintSelectedMcgH = inputs.fentanylMaintDosePerKgHour * selectedLbw;

    details.push({
      id: 'fentanyl-maintenance',
      drugName: t.fentanylMaintName || 'Фентанил (Инфузия)',
      category: 'analgesic',
      phase: 'maintenance',
      weightMetricUsed: 'LBW',
      weightValue: selectedLbw,
      dosePerKgRange: `1.0 – 2.0 ${t.unitMcgKgHour || 'мкг/кг/час'}`,
      selectedDosePerKg: inputs.fentanylMaintDosePerKgHour,
      unitPerKg: t.unitMcgKgHour || 'мкг/кг/час',
      totalDoseMin: fentMaintMinMcgH,
      totalDoseMax: fentMaintMaxMcgH,
      selectedTotalDose: fentMaintSelectedMcgH,
      totalDoseUnit: t.unitMcgHour || 'мкг/час',
      rateMinMlHour: fentMaintMinMcgH / fentConc,
      rateMaxMlHour: fentMaintMaxMcgH / fentConc,
      selectedRateMlHour: fentMaintSelectedMcgH / fentConc,
      concentrationStr: `${fentConc} mcg/ml (0.005%)`,
      explanation: t.fentanylMaintExp || 'Поддержание фентанилом дозируется по тощей массе тела (LBW).',
    });

    // 5. Rocuronium (IBW)
    if (inputs.selectedRelaxant === 'rocuronium' || inputs.selectedRelaxant === 'both') {
      const rocMinMg = 0.6 * ibw;
      const rocMaxMg = 1.2 * ibw;
      const rocSelectedMg = inputs.rocuroniumDosePerKg * ibw;
      const rocConc = inputs.rocuroniumConcMgMl > 0 ? inputs.rocuroniumConcMgMl : 10;

      details.push({
        id: 'rocuronium-induction',
        drugName: t.rocuroniumName || 'Рокуроний (Rocuronium)',
        category: 'relaxant',
        phase: 'induction',
        weightMetricUsed: 'IBW',
        weightValue: ibw,
        dosePerKgRange: `0.6 – 1.2 ${t.unitMgKg || 'мг/кг'}`,
        selectedDosePerKg: inputs.rocuroniumDosePerKg,
        unitPerKg: t.unitMgKg || 'мг/кг',
        totalDoseMin: rocMinMg,
        totalDoseMax: rocMaxMg,
        selectedTotalDose: rocSelectedMg,
        totalDoseUnit: 'mg',
        volumeMinMl: rocMinMg / rocConc,
        volumeMaxMl: rocMaxMg / rocConc,
        selectedVolumeMl: rocSelectedMg / rocConc,
        concentrationStr: `${rocConc} mg/ml`,
        explanation: t.rocuroniumExp || 'Доза миорелаксанта рассчитывается по идеальной массе (IBW).',
      });
    }

    // 6. Atracurium (IBW)
    if (inputs.selectedRelaxant === 'atracurium' || inputs.selectedRelaxant === 'both') {
      const atrMinMg = 0.4 * ibw;
      const atrMaxMg = 0.5 * ibw;
      const atrSelectedMg = inputs.atracuriumDosePerKg * ibw;
      const atrConc = inputs.atracuriumConcMgMl > 0 ? inputs.atracuriumConcMgMl : 10;

      details.push({
        id: 'atracurium-induction',
        drugName: t.atracuriumName || 'Атракуриум (Atracurium)',
        category: 'relaxant',
        phase: 'induction',
        weightMetricUsed: 'IBW',
        weightValue: ibw,
        dosePerKgRange: `0.4 – 0.5 ${t.unitMgKg || 'мг/кг'}`,
        selectedDosePerKg: inputs.atracuriumDosePerKg,
        unitPerKg: t.unitMgKg || 'мг/кг',
        totalDoseMin: atrMinMg,
        totalDoseMax: atrMaxMg,
        selectedTotalDose: atrSelectedMg,
        totalDoseUnit: 'mg',
        volumeMinMl: atrMinMg / atrConc,
        volumeMaxMl: atrMaxMg / atrConc,
        selectedVolumeMl: atrSelectedMg / atrConc,
        concentrationStr: `${atrConc} mg/ml`,
        explanation: t.atracuriumExp || 'Дозируется по идеальной массе тела (IBW) для предотвращения пролонгированного блока.',
      });
    }

    return details;
  }, [anthropometrics, inputs, t]);

  const handleReset = () => {
    setInputs({
      gender: 'male',
      age: 45,
      height: 175,
      weight: 85,
      lbwFormula: 'janmahasatian',
      selectedRelaxant: 'both',
      propofolInductionDosePerKg: 2.0,
      propofolMaintDosePerKgMin: 100,
      fentanylInductionDosePerKg: 0.75,
      fentanylMaintDosePerKgHour: 1.5,
      atracuriumDosePerKg: 0.45,
      rocuroniumDosePerKg: 0.6,
      propofolConcMgMl: 10,
      fentanylConcMcgMl: 50,
      atracuriumConcMgMl: 10,
      rocuroniumConcMgMl: 10,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Sleek Hero Header Banner (Single Unified Header) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950/70 via-indigo-950/60 to-purple-950/70 border border-sky-500/30 p-5 sm:p-7 shadow-2xl shadow-sky-950/30">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-gradient-to-br from-sky-500/20 to-indigo-500/30 border border-sky-400/30 rounded-xl text-sky-400 shrink-0 hidden sm:flex shadow-lg shadow-sky-500/20">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              ICU & Anesthesia Dosing
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {t.intubationTitle || 'Калькулятор доз препаратов для интубации'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-3xl">
              {t.intubationSubtitle || 'Расчет дозировок гипнотиков, анальгетиков и миорелаксантов на основе антропометрических масс (TBW, IBW, LBW, ABW) и параметров ШВЛ ($V_t$).'}
            </p>
          </div>
        </div>
      </div>

      {/* Patient Input & Anthropometric Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Patient Data Form Card */}
        <Card className="lg:col-span-7 glass-panel p-5 sm:p-6 rounded-2xl border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t.patientDataSection || '1. Данные пациента'}
            </h2>
            <Button onClick={handleReset} variant="outline" size="sm" className="text-xs h-8 px-3">
              {t.reset || 'Сброс'}
            </Button>
          </div>

          {/* Gender Segmented Pill Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">{t.genderLabel || 'Стать'}</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setInputs({ ...inputs, gender: 'male' })}
                className={`py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  inputs.gender === 'male'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>♂</span>
                <span>{t.maleGender || 'Мужской'}</span>
              </button>
              <button
                type="button"
                onClick={() => setInputs({ ...inputs, gender: 'female' })}
                className={`py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  inputs.gender === 'female'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>♀</span>
                <span>{t.femaleGender || 'Женский'}</span>
              </button>
            </div>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumberInput
              label={t.ageYearsLabel || 'Возраст (лет)'}
              value={inputs.age}
              onChange={(val) => setInputs({ ...inputs, age: val })}
              min={1}
              max={120}
              placeholder="45"
            />
            <NumberInput
              label={t.heightCmLabel || 'Рост (см)'}
              value={inputs.height}
              onChange={(val) => setInputs({ ...inputs, height: val })}
              min={50}
              max={250}
              placeholder="175"
            />
            <NumberInput
              label={t.actualWeightTbwLabel || 'Фактический вес TBW (кг)'}
              value={inputs.weight}
              onChange={(val) => setInputs({ ...inputs, weight: val })}
              min={10}
              max={300}
              placeholder="85"
            />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
            <Select
              label={t.lbwFormulaLabel || 'Формула LBW (Тощая масса)'}
              value={inputs.lbwFormula}
              onChange={(val) => setInputs({ ...inputs, lbwFormula: val as 'janmahasatian' | 'james' })}
              options={[
                { value: 'janmahasatian', label: t.janmahasatianGoldStandard || 'Janmahasatian (2005) — Золотой стандарт' },
                { value: 'james', label: t.jamesClassic || 'James (1976) — Классическая' },
              ]}
            />
            <Select
              label={t.relaxantForIntubationLabel || 'Миорелаксант'}
              value={inputs.selectedRelaxant}
              onChange={(val) => setInputs({ ...inputs, selectedRelaxant: val as 'rocuronium' | 'atracurium' | 'both' })}
              options={[
                { value: 'both', label: t.showBothRelaxants || 'Рокуроний + Атракуриум' },
                { value: 'rocuronium', label: t.rocuroniumDoseRangeOption || 'Рокуроний (0.6-1.2 мг/кг)' },
                { value: 'atracurium', label: t.atracuriumDoseRangeOption || 'Атракуриум (0.4-0.5 мг/кг)' },
              ]}
            />
          </div>

          {/* Advanced Conc Drawer */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvancedConc(!showAdvancedConc)}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1.5 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {showAdvancedConc ? (t.hideConcSettings || 'Скрыть настройки растворов') : (t.showConcSettings || 'Настройки концентрации растворов (мг/мл)')}
            </button>

            {showAdvancedConc && (
              <div className="mt-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
                <NumberInput
                  label={t.propofolConcLabel || 'Пропофол (мг/мл)'}
                  value={inputs.propofolConcMgMl}
                  onChange={(val) => setInputs({ ...inputs, propofolConcMgMl: val || 10 })}
                />
                <NumberInput
                  label={t.fentanylConcLabel || 'Фентанил (мкг/мл)'}
                  value={inputs.fentanylConcMcgMl}
                  onChange={(val) => setInputs({ ...inputs, fentanylConcMcgMl: val || 50 })}
                />
                <NumberInput
                  label={t.rocuroniumConcLabel || 'Рокуроний (мг/мл)'}
                  value={inputs.rocuroniumConcMgMl}
                  onChange={(val) => setInputs({ ...inputs, rocuroniumConcMgMl: val || 10 })}
                />
                <NumberInput
                  label={t.atracuriumConcLabel || 'Атракуриум (мг/мл)'}
                  value={inputs.atracuriumConcMgMl}
                  onChange={(val) => setInputs({ ...inputs, atracuriumConcMgMl: val || 10 })}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Anthropometric Dashboard Matrix (Section 2 - Stat Tiles) */}
        <Card className="lg:col-span-5 glass-panel p-5 sm:p-6 rounded-2xl border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t.anthropometricMatrixTitle || 'Антропометрическая матрица'}
              </h2>
            </div>

            {anthropometrics ? (
              <div className="space-y-3">
                {/* 6 Stat Cards Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">TBW (Фактический)</span>
                    <div className="text-lg font-extrabold text-white mt-0.5">{anthropometrics.tbw} <span className="text-xs font-normal text-slate-400">{t.kg || 'кг'}</span></div>
                  </div>

                  <div className="bg-sky-950/30 border border-sky-500/30 p-3 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-sky-300 block tracking-wider">IBW (Идеальный)</span>
                    <div className="text-lg font-extrabold text-sky-400 mt-0.5">{anthropometrics.ibw.toFixed(1)} <span className="text-xs font-normal text-sky-300/80">{t.kg || 'кг'}</span></div>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">LBW (Тощий)</span>
                    <div className="text-lg font-extrabold text-emerald-400 mt-0.5">{anthropometrics.selectedLbw.toFixed(1)} <span className="text-xs font-normal text-emerald-300/80">{t.kg || 'кг'}</span></div>
                  </div>

                  <div className="bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-indigo-300 block tracking-wider">ABW (Скоригован)</span>
                    <div className="text-lg font-extrabold text-indigo-400 mt-0.5">{anthropometrics.abw.toFixed(1)} <span className="text-xs font-normal text-indigo-300/80">{t.kg || 'кг'}</span></div>
                  </div>
                </div>

                {/* BMI & Ventilator Vt Tile */}
                <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-300 font-semibold">{t.ventilationVtParamLabel || 'ИВЛ Параметр ДО (Vt):'}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${anthropometrics.isObese ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-blue-500/20 text-blue-300'}`}>
                      BMI {anthropometrics.bmi.toFixed(1)} kg/m²
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-blue-400 tracking-tight">
                    {anthropometrics.vtMin} – {anthropometrics.vtMax} <span className="text-sm font-semibold">{t.unitMl || 'мл'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    (6–8 {t.unitMl || 'мл'}/kg IBW = {anthropometrics.ibw.toFixed(1)} {t.kg || 'кг'})
                  </div>
                </div>

                {anthropometrics.isObese && (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300 leading-normal flex items-start gap-2">
                    <span className="text-base shrink-0">⚠️</span>
                    <div>
                      <strong>{t.obesityWarningText || 'Ожирение (ИМТ ≥ 30):'}</strong> Фактическая масса значительно превосходит идеальную. Не используйте TBW для индукции!
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Enter weight & height.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Target Dosage Sliders with Steppers (+ / -) */}
      {anthropometrics && (
        <Card className="glass-panel p-5 sm:p-6 rounded-2xl border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {t.dosageFineTuningTitle || '2. Интерактивная настройка целевых дозировок'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Propofol Induction Slider Card */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-semibold text-slate-200">{t.propofolInductionSliderLabel || 'Пропофол Индукция (LBW):'}</span>
                <span className="text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  {inputs.propofolInductionDosePerKg} {t.unitMgKg || 'мг/кг'}
                </span>
              </div>

              {/* Slider with +/- buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInputs({ ...inputs, propofolInductionDosePerKg: Math.max(1.0, +(inputs.propofolInductionDosePerKg - 0.1).toFixed(1)) })}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={inputs.propofolInductionDosePerKg}
                  onChange={(e) => setInputs({ ...inputs, propofolInductionDosePerKg: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setInputs({ ...inputs, propofolInductionDosePerKg: Math.min(3.0, +(inputs.propofolInductionDosePerKg + 0.1).toFixed(1)) })}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Presets */}
              <div className="flex justify-between text-[11px] text-slate-400">
                <button type="button" onClick={() => setInputs({ ...inputs, propofolInductionDosePerKg: 1.0 })} className="hover:text-sky-400">1.0 (Мин)</button>
                <button type="button" onClick={() => setInputs({ ...inputs, propofolInductionDosePerKg: 2.0 })} className="hover:text-sky-400 font-bold text-sky-300">2.0 (Стандарт)</button>
                <button type="button" onClick={() => setInputs({ ...inputs, propofolInductionDosePerKg: 3.0 })} className="hover:text-sky-400">3.0 (Макс)</button>
              </div>
            </div>

            {/* Propofol Maintenance Slider Card */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-semibold text-slate-200">{t.propofolMaintSliderLabel || 'Пропофол Инфузия (TBW):'}</span>
                <span className="text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  {inputs.propofolMaintDosePerKgMin} {t.unitMcgKgMin || 'мкг/кг/мин'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInputs({ ...inputs, propofolMaintDosePerKgMin: Math.max(50, inputs.propofolMaintDosePerKgMin - 5) })}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={inputs.propofolMaintDosePerKgMin}
                  onChange={(e) => setInputs({ ...inputs, propofolMaintDosePerKgMin: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setInputs({ ...inputs, propofolMaintDosePerKgMin: Math.min(200, inputs.propofolMaintDosePerKgMin + 5) })}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <button type="button" onClick={() => setInputs({ ...inputs, propofolMaintDosePerKgMin: 50 })} className="hover:text-sky-400">50 мкг</button>
                <button type="button" onClick={() => setInputs({ ...inputs, propofolMaintDosePerKgMin: 100 })} className="hover:text-sky-400 font-bold text-sky-300">100 мкг</button>
                <button type="button" onClick={() => setInputs({ ...inputs, propofolMaintDosePerKgMin: 200 })} className="hover:text-sky-400">200 мкг</button>
              </div>
            </div>

            {/* Fentanyl Induction Slider Card */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-semibold text-slate-200">{t.fentanylInductionSliderLabel || 'Фентанил Индукция (LBW):'}</span>
                <span className="text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {inputs.fentanylInductionDosePerKg} {t.unitMcgKg || 'мкг/кг'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInputs({ ...inputs, fentanylInductionDosePerKg: Math.max(0.5, +(inputs.fentanylInductionDosePerKg - 0.05).toFixed(2)) })}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={inputs.fentanylInductionDosePerKg}
                  onChange={(e) => setInputs({ ...inputs, fentanylInductionDosePerKg: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setInputs({ ...inputs, fentanylInductionDosePerKg: Math.min(1.0, +(inputs.fentanylInductionDosePerKg + 0.05).toFixed(2)) })}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <button type="button" onClick={() => setInputs({ ...inputs, fentanylInductionDosePerKg: 0.5 })} className="hover:text-purple-300">0.5 мкг</button>
                <button type="button" onClick={() => setInputs({ ...inputs, fentanylInductionDosePerKg: 0.75 })} className="hover:text-purple-300 font-bold text-purple-300">0.75 мкг</button>
                <button type="button" onClick={() => setInputs({ ...inputs, fentanylInductionDosePerKg: 1.0 })} className="hover:text-purple-300">1.0 мкг</button>
              </div>
            </div>

            {/* Fentanyl Maintenance Slider Card */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-semibold text-slate-200">{t.fentanylMaintSliderLabel || 'Фентанил Инфузия (LBW):'}</span>
                <span className="text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {inputs.fentanylMaintDosePerKgHour} {t.unitMcgKgHour || 'мкг/кг/час'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInputs({ ...inputs, fentanylMaintDosePerKgHour: Math.max(1.0, +(inputs.fentanylMaintDosePerKgHour - 0.1).toFixed(1)) })}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.1"
                  value={inputs.fentanylMaintDosePerKgHour}
                  onChange={(e) => setInputs({ ...inputs, fentanylMaintDosePerKgHour: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setInputs({ ...inputs, fentanylMaintDosePerKgHour: Math.min(2.0, +(inputs.fentanylMaintDosePerKgHour + 0.1).toFixed(1)) })}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <button type="button" onClick={() => setInputs({ ...inputs, fentanylMaintDosePerKgHour: 1.0 })} className="hover:text-purple-300">1.0 мкг/ч</button>
                <button type="button" onClick={() => setInputs({ ...inputs, fentanylMaintDosePerKgHour: 1.5 })} className="hover:text-purple-300 font-bold text-purple-300">1.5 мкг/ч</button>
                <button type="button" onClick={() => setInputs({ ...inputs, fentanylMaintDosePerKgHour: 2.0 })} className="hover:text-purple-300">2.0 мкг/ч</button>
              </div>
            </div>

            {/* Rocuronium Slider Card */}
            {(inputs.selectedRelaxant === 'rocuronium' || inputs.selectedRelaxant === 'both') && (
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">{t.rocuroniumInductionSliderLabel || 'Рокуроний Индукция (IBW):'}</span>
                  <span className="text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {inputs.rocuroniumDosePerKg} {t.unitMgKg || 'мг/кг'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInputs({ ...inputs, rocuroniumDosePerKg: Math.max(0.6, +(inputs.rocuroniumDosePerKg - 0.1).toFixed(1)) })}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.6"
                    max="1.2"
                    step="0.1"
                    value={inputs.rocuroniumDosePerKg}
                    onChange={(e) => setInputs({ ...inputs, rocuroniumDosePerKg: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setInputs({ ...inputs, rocuroniumDosePerKg: Math.min(1.2, +(inputs.rocuroniumDosePerKg + 0.1).toFixed(1)) })}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <button type="button" onClick={() => setInputs({ ...inputs, rocuroniumDosePerKg: 0.6 })} className="hover:text-emerald-400 font-bold text-emerald-300">0.6 (Стандарт)</button>
                  <button type="button" onClick={() => setInputs({ ...inputs, rocuroniumDosePerKg: 1.0 })} className="hover:text-emerald-400">1.0 (RSI)</button>
                  <button type="button" onClick={() => setInputs({ ...inputs, rocuroniumDosePerKg: 1.2 })} className="hover:text-emerald-400">1.2 (Макс RSI)</button>
                </div>
              </div>
            )}

            {/* Atracurium Slider Card */}
            {(inputs.selectedRelaxant === 'atracurium' || inputs.selectedRelaxant === 'both') && (
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">{t.atracuriumInductionSliderLabel || 'Атракуриум Индукция (IBW):'}</span>
                  <span className="text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {inputs.atracuriumDosePerKg} {t.unitMgKg || 'мг/кг'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInputs({ ...inputs, atracuriumDosePerKg: Math.max(0.4, +(inputs.atracuriumDosePerKg - 0.01).toFixed(2)) })}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.4"
                    max="0.5"
                    step="0.01"
                    value={inputs.atracuriumDosePerKg}
                    onChange={(e) => setInputs({ ...inputs, atracuriumDosePerKg: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setInputs({ ...inputs, atracuriumDosePerKg: Math.min(0.5, +(inputs.atracuriumDosePerKg + 0.01).toFixed(2)) })}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shrink-0 transition-all active:scale-95 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <button type="button" onClick={() => setInputs({ ...inputs, atracuriumDosePerKg: 0.4 })} className="hover:text-emerald-400">0.4 мг</button>
                  <button type="button" onClick={() => setInputs({ ...inputs, atracuriumDosePerKg: 0.45 })} className="hover:text-emerald-400 font-bold text-emerald-300">0.45 мг</button>
                  <button type="button" onClick={() => setInputs({ ...inputs, atracuriumDosePerKg: 0.5 })} className="hover:text-emerald-400">0.5 мг</button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Main Results Grid Cards Section */}
      {drugDetails.length > 0 && anthropometrics && (
        <Card className="glass-panel p-5 sm:p-6 rounded-2xl border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              {t.summaryTableTitle || '3. Сводные дозировки препаратов'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drugDetails.map((drug) => (
              <div 
                key={drug.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 transition-all hover:border-slate-700 shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Top Pill Tag & Title */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        drug.category === 'hypnotic' ? 'bg-sky-400 shadow-sm shadow-sky-400/50' :
                        drug.category === 'analgesic' ? 'bg-purple-400 shadow-sm shadow-purple-400/50' : 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                      }`} />
                      <span className="font-bold text-white text-sm sm:text-base">{drug.drugName}</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {drug.concentrationStr}
                    </span>
                  </div>

                  {/* Weight Scalar Badge */}
                  <div className="flex justify-between items-center text-xs mb-3 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 font-medium">{t.colBaseWeight || 'Базовый вес'}:</span>
                    <div className="font-bold text-white">
                      <span className="text-sky-400 mr-1">{drug.weightMetricUsed}</span>
                      <span>({drug.weightValue.toFixed(1)} {t.kg || 'кг'})</span>
                    </div>
                  </div>

                  {/* Readout Boxes */}
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t.colCalculatedDose || 'Рассчитанная доза'}</span>
                      <div className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                        {drug.selectedTotalDose.toFixed(1)} <span className="text-xs font-normal text-slate-400">{drug.totalDoseUnit}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        [{drug.totalDoseMin.toFixed(1)} – {drug.totalDoseMax.toFixed(1)}]
                      </div>
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-lg">
                      <span className="text-[10px] text-emerald-300 uppercase font-semibold block">{t.colVolumeOrSpeed || 'Объем / Скорость'}</span>
                      <div className="text-base sm:text-lg font-extrabold text-emerald-400 mt-0.5">
                        {drug.phase === 'induction' ? (
                          <>
                            {drug.selectedVolumeMl?.toFixed(1)} <span className="text-xs font-normal">{t.unitMl || 'мл'}</span>
                          </>
                        ) : (
                          <>
                            {drug.selectedRateMlHour?.toFixed(1)} <span className="text-xs font-normal">{t.unitMlHour || 'мл/ч'}</span>
                          </>
                        )}
                      </div>
                      <div className="text-[10px] text-emerald-400/80 mt-0.5">
                        {drug.phase === 'induction' 
                          ? `[${drug.volumeMinMl?.toFixed(1)}–${drug.volumeMaxMl?.toFixed(1)} ${t.unitMl || 'мл'}]`
                          : `[${drug.rateMinMlHour?.toFixed(1)}–${drug.rateMaxMlHour?.toFixed(1)} ${t.unitMlHour || 'мл/ч'}]`
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="text-[11px] text-slate-400 leading-normal bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  💡 {drug.explanation}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Clinical Reference Cheat Sheet Section */}
      <Card className="glass-panel p-5 sm:p-6 rounded-2xl border-slate-800/80 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {t.cheatSheetTitle || 'Шпаргалка применения массы тела в ОРИТ и анестезиологии'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { param: t.paramVentVt || 'Параметры ИВЛ (Vt)', scalar: 'IBW', color: 'border-blue-500/40 text-blue-400 bg-blue-950/30', rationale: t.rationaleVentVt },
            { param: t.paramPropInduction || 'Пропофол (Индукция)', scalar: 'LBW', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30', rationale: t.rationalePropInduction },
            { param: t.paramPropMaintenance || 'Пропофол (Инфузия)', scalar: 'TBW / TCI', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/30', rationale: t.rationalePropMaintenance },
            { param: t.paramRelaxants || 'Миорелаксанты', scalar: 'IBW', color: 'border-purple-500/40 text-purple-400 bg-purple-950/30', rationale: t.rationaleRelaxants },
            { param: t.paramSuxamethonium || 'Суксаметоний', scalar: 'TBW', color: 'border-red-500/40 text-red-400 bg-red-950/30', rationale: t.rationaleSuxamethonium },
            { param: t.paramFentanyl || 'Фентанил', scalar: 'LBW', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30', rationale: t.rationaleFentanyl },
            { param: t.paramAminoglycosides || 'Аминогликозиды / Ванкомицин', scalar: 'ABW', color: 'border-amber-500/40 text-amber-400 bg-amber-950/30', rationale: t.rationaleAminoglycosides }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">{item.param}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.color} whitespace-nowrap`}>
                  {item.scalar}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {item.rationale}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
