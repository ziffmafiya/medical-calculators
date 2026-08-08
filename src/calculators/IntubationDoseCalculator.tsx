'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/Card';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Alert } from '@/components/Alert';
import { StatCard } from '@/components/StatCard';
import { Checkbox } from '@/components/Checkbox';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  IntubationInputs, 
  AnthropometricsResult, 
  DrugDoseDetail 
} from '@/types';

const MaleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="14" r="5" />
    <path d="M19 5L13.5 10.5" />
    <path d="M19 5H14" />
    <path d="M19 5V10" />
  </svg>
);

const FemaleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="5" />
    <path d="M12 14v7" />
    <path d="M9 18h6" />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-sky-400 mt-0.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

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
      drugName: t.propofolName || 'Propofol',
      category: 'hypnotic',
      phase: 'induction',
      weightMetricUsed: 'LBW',
      weightValue: selectedLbw,
      dosePerKgRange: `1.0 – 3.0 ${t.unitMgKg || 'mg/kg'}`,
      selectedDosePerKg: inputs.propofolInductionDosePerKg,
      unitPerKg: t.unitMgKg || 'mg/kg',
      totalDoseMin: propIndMinMg,
      totalDoseMax: propIndMaxMg,
      selectedTotalDose: propIndSelectedMg,
      totalDoseUnit: 'mg',
      volumeMinMl: propIndMinMg / propConc,
      volumeMaxMl: propIndMaxMg / propConc,
      selectedVolumeMl: propIndSelectedMg / propConc,
      concentrationStr: `${propConc} mg/ml (${propConc / 10}%)`,
      explanation: t.propofolInductionExp || 'Dose is calculated on LBW (lean body weight) to avoid severe hemodynamic instability in overweight patients.',
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
      drugName: t.propofolMaintName || 'Propofol (Infusion)',
      category: 'hypnotic',
      phase: 'maintenance',
      weightMetricUsed: 'TBW',
      weightValue: tbw,
      dosePerKgRange: `50 – 200 ${t.unitMcgKgMin || 'mcg/kg/min'}`,
      selectedDosePerKg: inputs.propofolMaintDosePerKgMin,
      unitPerKg: t.unitMcgKgMin || 'mcg/kg/min',
      totalDoseMin: propMaintMinMgH,
      totalDoseMax: propMaintMaxMgH,
      selectedTotalDose: propMaintSelectedMgH,
      totalDoseUnit: t.unitMgHour || 'mg/h',
      rateMinMlHour: propMaintMinMgH / propConc,
      rateMaxMlHour: propMaintMaxMgH / propConc,
      selectedRateMlHour: propMaintSelectedMgH / propConc,
      concentrationStr: `${propConc} mg/ml (${propConc / 10}%)`,
      explanation: t.propofolMaintExp || 'Anesthesia maintenance is calculated on TBW (actual body weight) or TCI target concentration models.',
    });

    // 3. Fentanyl Induction (LBW)
    const fentIndMinMcg = 0.5 * selectedLbw;
    const fentIndMaxMcg = 1.0 * selectedLbw;
    const fentIndSelectedMcg = inputs.fentanylInductionDosePerKg * selectedLbw;
    const fentConc = inputs.fentanylConcMcgMl > 0 ? inputs.fentanylConcMcgMl : 50;

    details.push({
      id: 'fentanyl-induction',
      drugName: t.fentanylName || 'Fentanyl',
      category: 'analgesic',
      phase: 'induction',
      weightMetricUsed: 'LBW',
      weightValue: selectedLbw,
      dosePerKgRange: `0.5 – 1.0 ${t.unitMcgKg || 'mcg/kg'}`,
      selectedDosePerKg: inputs.fentanylInductionDosePerKg,
      unitPerKg: t.unitMcgKg || 'mcg/kg',
      totalDoseMin: fentIndMinMcg,
      totalDoseMax: fentIndMaxMcg,
      selectedTotalDose: fentIndSelectedMcg,
      totalDoseUnit: 'mcg',
      volumeMinMl: fentIndMinMcg / fentConc,
      volumeMaxMl: fentIndMaxMcg / fentConc,
      selectedVolumeMl: fentIndSelectedMcg / fentConc,
      concentrationStr: `${fentConc} mcg/ml (0.005%)`,
      explanation: t.fentanylInductionExp || 'Analgesia induction is calculated on lean body weight (LBW).',
    });

    // 4. Fentanyl Maintenance (LBW)
    const fentMaintMinMcgH = 1.0 * selectedLbw;
    const fentMaintMaxMcgH = 2.0 * selectedLbw;
    const fentMaintSelectedMcgH = inputs.fentanylMaintDosePerKgHour * selectedLbw;

    details.push({
      id: 'fentanyl-maintenance',
      drugName: t.fentanylMaintName || 'Fentanyl (Infusion)',
      category: 'analgesic',
      phase: 'maintenance',
      weightMetricUsed: 'LBW',
      weightValue: selectedLbw,
      dosePerKgRange: `1.0 – 2.0 ${t.unitMcgKgHour || 'mcg/kg/h'}`,
      selectedDosePerKg: inputs.fentanylMaintDosePerKgHour,
      unitPerKg: t.unitMcgKgHour || 'mcg/kg/h',
      totalDoseMin: fentMaintMinMcgH,
      totalDoseMax: fentMaintMaxMcgH,
      selectedTotalDose: fentMaintSelectedMcgH,
      totalDoseUnit: t.unitMcgHour || 'mcg/h',
      rateMinMlHour: fentMaintMinMcgH / fentConc,
      rateMaxMlHour: fentMaintMaxMcgH / fentConc,
      selectedRateMlHour: fentMaintSelectedMcgH / fentConc,
      concentrationStr: `${fentConc} mcg/ml (0.005%)`,
      explanation: t.fentanylMaintExp || 'Fentanyl maintenance is dosed on lean body weight (LBW).',
    });

    // 5. Rocuronium (IBW)
    if (inputs.selectedRelaxant === 'rocuronium' || inputs.selectedRelaxant === 'both') {
      const rocMinMg = 0.6 * ibw;
      const rocMaxMg = 1.2 * ibw;
      const rocSelectedMg = inputs.rocuroniumDosePerKg * ibw;
      const rocConc = inputs.rocuroniumConcMgMl > 0 ? inputs.rocuroniumConcMgMl : 10;

      details.push({
        id: 'rocuronium-induction',
        drugName: t.rocuroniumName || 'Rocuronium',
        category: 'relaxant',
        phase: 'induction',
        weightMetricUsed: 'IBW',
        weightValue: ibw,
        dosePerKgRange: `0.6 – 1.2 ${t.unitMgKg || 'mg/kg'}`,
        selectedDosePerKg: inputs.rocuroniumDosePerKg,
        unitPerKg: t.unitMgKg || 'mg/kg',
        totalDoseMin: rocMinMg,
        totalDoseMax: rocMaxMg,
        selectedTotalDose: rocSelectedMg,
        totalDoseUnit: 'mg',
        volumeMinMl: rocMinMg / rocConc,
        volumeMaxMl: rocMaxMg / rocConc,
        selectedVolumeMl: rocSelectedMg / rocConc,
        concentrationStr: `${rocConc} mg/ml`,
        explanation: t.rocuroniumExp || 'Muscle relaxant dose is calculated on ideal body weight (IBW) to prevent dangerous prolongation of neuromuscular blockade.',
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
        drugName: t.atracuriumName || 'Atracurium',
        category: 'relaxant',
        phase: 'induction',
        weightMetricUsed: 'IBW',
        weightValue: ibw,
        dosePerKgRange: `0.4 – 0.5 ${t.unitMgKg || 'mg/kg'}`,
        selectedDosePerKg: inputs.atracuriumDosePerKg,
        unitPerKg: t.unitMgKg || 'mg/kg',
        totalDoseMin: atrMinMg,
        totalDoseMax: atrMaxMg,
        selectedTotalDose: atrSelectedMg,
        totalDoseUnit: 'mg',
        volumeMinMl: atrMinMg / atrConc,
        volumeMaxMl: atrMaxMg / atrConc,
        selectedVolumeMl: atrSelectedMg / atrConc,
        concentrationStr: `${atrConc} mg/ml`,
        explanation: t.atracuriumExp || 'Dosed on ideal body weight (IBW) to prevent prolonged blockade.',
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

  const renderSlider = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    unit: string,
    field: keyof IntubationInputs,
    presets: { val: number; label: string }[]
  ) => (
    <div className="bg-[#101828] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-all shadow-xs h-full">
      <div className="flex justify-between items-center h-6">
        <span className="text-sm font-semibold text-slate-200 truncate pr-2">{label}</span>
        <Badge variant="brand" className="font-mono text-xs shrink-0">
          {value.toFixed(step >= 1 ? 0 : step >= 0.1 ? 1 : 2)} {unit}
        </Badge>
      </div>

      <div className="flex items-center gap-3 py-1">
        <button
          type="button"
          onClick={() => setInputs({ ...inputs, [field]: Math.max(min, +(value - step).toFixed(2)) })}
          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center font-bold text-sm shrink-0"
        >
          −
        </button>
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setInputs({ ...inputs, [field]: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-900 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-hidden"
          />
        </div>
        <button
          type="button"
          onClick={() => setInputs({ ...inputs, [field]: Math.min(max, +(value + step).toFixed(2)) })}
          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center font-bold text-sm shrink-0"
        >
          +
        </button>
      </div>

      <div className="flex justify-between items-center pt-1 border-t border-slate-800/40 mt-auto">
        <div className="flex gap-2">
          {presets.map((p, i) => {
            const isActive = Math.abs(value - p.val) < 0.001;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setInputs({ ...inputs, [field]: p.val })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <span className="text-[11px] font-mono text-slate-500 shrink-0">
          [{min} – {max}]
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Hero Title Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="brand" dot className="px-3 py-1 text-xs uppercase tracking-wider font-semibold">
            {t.anesthesiologyDepartment || 'Anesthesiology & ICU'}
          </Badge>
          <span className="text-xs text-slate-500 font-mono">v2.4 • Janmahasatian / Devine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.intubationTitle || 'Intubation & Body Weight Drug Dosage Calculator'}
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          {t.intubationSubtitle || 'Accurate dosage calculation for hypnotics (Propofol), analgesics (Fentanyl), and muscle relaxants (Rocuronium / Atracurium) considering anthropometric parameters (TBW, IBW, LBW, ABW) and mechanical ventilation.'}
        </p>
      </div>

      {/* SECTION 1: Patient Data & Anthropometrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
              1
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t.patientDataSection || '1. Patient Data'}
            </h2>
          </div>
          <Button onClick={handleReset} variant="outline" size="xs" className="text-slate-400 hover:text-white">
            {t.reset || 'Reset'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Patient Form Input Card */}
          <div className="lg:col-span-6 bg-[#101828] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm h-full">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  {t.genderLabel || 'Gender'}
                </label>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1 grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setInputs({ ...inputs, gender: 'male' })}
                    className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      inputs.gender === 'male'
                        ? 'bg-sky-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <MaleIcon />
                    <span>{t.maleGender || 'Male'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputs({ ...inputs, gender: 'female' })}
                    className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      inputs.gender === 'female'
                        ? 'bg-sky-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <FemaleIcon />
                    <span>{t.femaleGender || 'Female'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NumberInput
                  label={t.ageYearsLabel || 'Age (years)'}
                  value={inputs.age}
                  onChange={(val) => setInputs({ ...inputs, age: val })}
                  min={1}
                  max={120}
                  placeholder="45"
                />
                <NumberInput
                  label={t.heightCmLabel || 'Height (cm)'}
                  value={inputs.height}
                  onChange={(val) => setInputs({ ...inputs, height: val })}
                  min={50}
                  max={250}
                  placeholder="175"
                />
                <NumberInput
                  label={t.actualWeightTbwLabel || 'Weight TBW (kg)'}
                  value={inputs.weight}
                  onChange={(val) => setInputs({ ...inputs, weight: val })}
                  min={10}
                  max={300}
                  placeholder="85"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label={t.lbwFormulaLabel || 'LBW Formula'}
                  value={inputs.lbwFormula}
                  onChange={(val) => setInputs({ ...inputs, lbwFormula: val as 'janmahasatian' | 'james' })}
                  options={[
                    { value: 'janmahasatian', label: t.janmahasatianGoldStandard || 'Janmahasatian (2005) — Gold Standard' },
                    { value: 'james', label: t.jamesClassic || 'James (1976) — Classic' },
                  ]}
                />
                <Select
                  label={t.relaxantForIntubationLabel || 'Muscle Relaxant'}
                  value={inputs.selectedRelaxant}
                  onChange={(val) => setInputs({ ...inputs, selectedRelaxant: val as 'rocuronium' | 'atracurium' | 'both' })}
                  options={[
                    { value: 'both', label: t.showBothRelaxants || 'Show Rocuronium & Atracurium' },
                    { value: 'rocuronium', label: t.rocuroniumDoseRangeOption || 'Rocuronium (0.6 - 1.2 mg/kg)' },
                    { value: 'atracurium', label: t.atracuriumDoseRangeOption || 'Atracurium (0.4 - 0.5 mg/kg)' },
                  ]}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/60 mt-auto">
              <Checkbox
                id="advanced-conc"
                label={t.showConcSettings || 'Solution Concentration Settings (mg/ml)'}
                checked={showAdvancedConc}
                onChange={(checked) => setShowAdvancedConc(checked)}
              />

              {showAdvancedConc && (
                <div className="mt-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up">
                  <NumberInput
                    label={t.propofolConcLabel || 'Propofol (mg/ml)'}
                    value={inputs.propofolConcMgMl}
                    onChange={(val) => setInputs({ ...inputs, propofolConcMgMl: val || 10 })}
                  />
                  <NumberInput
                    label={t.fentanylConcLabel || 'Fentanyl (mcg/ml)'}
                    value={inputs.fentanylConcMcgMl}
                    onChange={(val) => setInputs({ ...inputs, fentanylConcMcgMl: val || 50 })}
                  />
                  <NumberInput
                    label={t.rocuroniumConcLabel || 'Rocuronium (mg/ml)'}
                    value={inputs.rocuroniumConcMgMl}
                    onChange={(val) => setInputs({ ...inputs, rocuroniumConcMgMl: val || 10 })}
                  />
                  <NumberInput
                    label={t.atracuriumConcLabel || 'Atracurium (mg/ml)'}
                    value={inputs.atracuriumConcMgMl}
                    onChange={(val) => setInputs({ ...inputs, atracuriumConcMgMl: val || 10 })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Anthropometric Matrix Stat Cards */}
          <div className="lg:col-span-6 h-full">
            {anthropometrics ? (
              <div className="bg-[#101828] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm h-full">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {t.anthropometricMatrixTitle || 'Anthropometric Matrix'}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    BMI: <strong className="text-white font-bold">{anthropometrics.bmi.toFixed(1)}</strong> kg/m²
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 flex-1">
                  <StatCard 
                    label={t.tbwMatrixLabel || 'TBW (Actual)'} 
                    value={anthropometrics.tbw.toFixed(1)} 
                    unit={t.kg || 'kg'} 
                  />
                  <StatCard 
                    label={t.ibwMatrixLabel || 'IBW (Ideal)'} 
                    value={anthropometrics.ibw.toFixed(1)} 
                    unit={t.kg || 'kg'} 
                  />
                  <StatCard 
                    label={t.lbwJanMatrixLabel || 'LBW (Lean)'} 
                    value={anthropometrics.selectedLbw.toFixed(1)} 
                    unit={t.kg || 'kg'} 
                  />
                  <StatCard 
                    label={t.abwMatrixLabel || 'ABW (Adjusted)'} 
                    value={anthropometrics.abw.toFixed(1)} 
                    unit={t.kg || 'kg'} 
                  />
                </div>

                {/* Tidal Volume Highlight Box */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      {t.ventilationVtParamLabel || 'Ventilation Tidal Vol (Vt):'}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      6–8 {t.unitMl || 'ml'}/kg IBW
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-sky-400 tracking-tight">
                      {anthropometrics.vtMin} – {anthropometrics.vtMax}
                    </span>
                    <span className="text-xs font-medium text-slate-400 ml-1">{t.unitMl || 'ml'}</span>
                  </div>
                </div>

                {anthropometrics.isObese && (
                  <Alert
                    variant="warning"
                    title={t.obesityWarningTitle || 'Warning (Obesity BMI ≥ 30)'}
                  >
                    {t.obesityWarningText || 'Actual weight (TBW) significantly exceeds ideal weight. Using TBW for Propofol induction or muscle relaxants will cause severe overdose!'}
                  </Alert>
                )}
              </div>
            ) : (
              <div className="bg-[#101828] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm h-full flex items-center justify-center">
                {t.enterHeightWeightPrompt || 'Enter height & weight to calculate matrix.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Interactive Target Dosage Tuning */}
      {anthropometrics && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
              2
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t.dosageFineTuningTitle || '2. Interactive Target Dosage Tuning'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {renderSlider(
              t.propofolInductionSliderLabel || 'Propofol Induction (LBW):',
              inputs.propofolInductionDosePerKg,
              1.0, 3.0, 0.1,
              t.unitMgKg || 'mg/kg',
              'propofolInductionDosePerKg',
              [
                { val: 1.0, label: '1.0' },
                { val: 2.0, label: `2.0 (${t.standardLabel || 'Standard'})` },
                { val: 3.0, label: '3.0' }
              ]
            )}

            {renderSlider(
              t.propofolMaintSliderLabel || 'Propofol Infusion (TBW):',
              inputs.propofolMaintDosePerKgMin,
              50, 200, 5,
              t.unitMcgKgMin || 'mcg/kg/min',
              'propofolMaintDosePerKgMin',
              [
                { val: 50, label: '50' },
                { val: 100, label: '100' },
                { val: 200, label: '200' }
              ]
            )}

            {renderSlider(
              t.fentanylInductionSliderLabel || 'Fentanyl Induction (LBW):',
              inputs.fentanylInductionDosePerKg,
              0.5, 1.0, 0.05,
              t.unitMcgKg || 'mcg/kg',
              'fentanylInductionDosePerKg',
              [
                { val: 0.5, label: '0.5' },
                { val: 0.75, label: '0.75' },
                { val: 1.0, label: '1.0' }
              ]
            )}

            {renderSlider(
              t.fentanylMaintSliderLabel || 'Fentanyl Infusion (LBW):',
              inputs.fentanylMaintDosePerKgHour,
              1.0, 2.0, 0.1,
              t.unitMcgKgHour || 'mcg/kg/h',
              'fentanylMaintDosePerKgHour',
              [
                { val: 1.0, label: '1.0' },
                { val: 1.5, label: '1.5' },
                { val: 2.0, label: '2.0' }
              ]
            )}

            {(inputs.selectedRelaxant === 'rocuronium' || inputs.selectedRelaxant === 'both') && renderSlider(
              t.rocuroniumInductionSliderLabel || 'Rocuronium Induction (IBW):',
              inputs.rocuroniumDosePerKg,
              0.6, 1.2, 0.1,
              t.unitMgKg || 'mg/kg',
              'rocuroniumDosePerKg',
              [
                { val: 0.6, label: '0.6' },
                { val: 1.0, label: '1.0 (RSI)' },
                { val: 1.2, label: '1.2' }
              ]
            )}

            {(inputs.selectedRelaxant === 'atracurium' || inputs.selectedRelaxant === 'both') && renderSlider(
              t.atracuriumInductionSliderLabel || 'Atracurium Induction (IBW):',
              inputs.atracuriumDosePerKg,
              0.4, 0.5, 0.01,
              t.unitMgKg || 'mg/kg',
              'atracuriumDosePerKg',
              [
                { val: 0.4, label: '0.4' },
                { val: 0.45, label: '0.45' },
                { val: 0.5, label: '0.5' }
              ]
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: Summary Dosing Cards */}
      {drugDetails.length > 0 && anthropometrics && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
              3
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t.summaryTableTitle || '3. Summary Dosing Table'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {drugDetails.map((drug) => (
              <div 
                key={drug.id} 
                className="bg-[#101828] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-sm hover:border-slate-700/80 transition-all h-full"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 min-h-[52px]">
                  <div>
                    <h3 className="font-bold text-white text-lg tracking-tight leading-snug">{drug.drugName}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant={drug.phase === 'induction' ? 'brand' : 'gray'}>
                        {drug.phase === 'induction' ? 'Induction' : 'Maintenance'}
                      </Badge>
                      <span className="text-xs font-mono text-slate-400">{drug.concentrationStr}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      {t.colBaseWeight || 'Base Weight'}
                    </span>
                    <Badge variant="gray" className="font-mono">
                      {drug.weightMetricUsed} ({drug.weightValue.toFixed(1)} {t.kg || 'kg'})
                    </Badge>
                  </div>
                </div>

                {/* Calculation Numbers Grid */}
                <div className="grid grid-cols-2 gap-4 bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      {t.colCalculatedDose || 'Calculated Dose'}
                    </span>
                    <div className="text-2xl font-bold font-mono text-white tracking-tight">
                      {drug.selectedTotalDose.toFixed(1)}{' '}
                      <span className="text-xs font-normal text-slate-400">{drug.totalDoseUnit}</span>
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      [{drug.totalDoseMin.toFixed(1)} – {drug.totalDoseMax.toFixed(1)}]
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      {t.colVolumeOrSpeed || 'Volume / Rate'}
                    </span>
                    <div className="text-2xl font-bold font-mono text-sky-400 tracking-tight">
                      {drug.phase === 'induction' ? (
                        <>
                          {drug.selectedVolumeMl?.toFixed(1)}{' '}
                          <span className="text-xs font-normal text-slate-400">{t.unitMl || 'ml'}</span>
                        </>
                      ) : (
                        <>
                          {drug.selectedRateMlHour?.toFixed(1)}{' '}
                          <span className="text-xs font-normal text-slate-400">{t.unitMlHour || 'ml/h'}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      {drug.phase === 'induction' 
                        ? `[${drug.volumeMinMl?.toFixed(1)}–${drug.volumeMaxMl?.toFixed(1)}]`
                        : `[${drug.rateMinMlHour?.toFixed(1)}–${drug.rateMaxMlHour?.toFixed(1)}]`
                      }
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="pt-3 flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 mt-auto min-h-[52px]">
                  <InfoIcon />
                  <span className="flex-1">{drug.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Cheat Sheet Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
            4
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {t.cheatSheetTitle || 'Cheat Sheet: Body Weight Scalar Usage in ICU & Anesthesiology'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {[
            { param: t.paramVentVt || 'Ventilation Parameters (Vt)', scalar: 'IBW', rationale: t.rationaleVentVt || 'Lung size depends on height and gender, not fat mass. Prevents volutrauma.' },
            { param: t.paramPropInduction || 'Propofol (Induction)', scalar: 'LBW', rationale: t.rationalePropInduction || 'Prevents severe vasodilation and profound hypotension in obese patients.' },
            { param: t.paramPropMaintenance || 'Propofol (Infusion / TCI)', scalar: 'TBW / TCI', rationale: t.rationalePropMaintenance || 'Redistribution into adipose tissue during continuous infusion requires considering clearance and actual weight.' },
            { param: t.paramRelaxants || 'Muscle Relaxants (Rocuronium, Vecuronium, Atracurium)', scalar: 'IBW', rationale: t.rationaleRelaxants || 'Volume of distribution for hydrophilic relaxants does not scale with fat mass. Protects against prolonged block.' },
            { param: t.paramSuxamethonium || 'Succinylcholine (Suxamethonium)', scalar: 'TBW', rationale: t.rationaleSuxamethonium || 'Plasma pseudocholinesterase activity and blood volume are increased in obesity.' },
            { param: t.paramFentanyl || 'Fentanyl (Induction & Maintenance Infusion)', scalar: 'LBW', rationale: t.rationaleFentanyl || 'Lipophilic opioid, but primary central effects and pharmacokinetics correlate best with lean body mass.' },
            { param: t.paramAminoglycosides || 'Aminoglycosides / Vancomycin', scalar: 'ABW', rationale: t.rationaleAminoglycosides || 'Adipose tissue contains ~20-30% extracellular water. Correction prevents nephrotoxicity.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#101828] border border-slate-800/80 rounded-xl p-4.5 space-y-2.5 hover:border-slate-700 transition-colors shadow-xs h-full flex flex-col justify-between">
              <div className="flex justify-between items-start gap-2">
                <span className="font-semibold text-white text-sm leading-snug">{item.param}</span>
                <Badge variant="gray" className="font-mono text-[11px] shrink-0">{item.scalar}</Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-auto pt-2">
                {item.rationale}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
