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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M14 10h6" />
    <path d="M20 10v-4" />
    <path d="M17 7l3 3" />
  </svg>
);

const FemaleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M12 16v6" />
    <path d="M9 19h6" />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <Badge variant="brand">{value.toFixed(step >= 1 ? 0 : step >= 0.1 ? 1 : 2)} {unit}</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setInputs({ ...inputs, [field]: Math.max(min, +(value - step).toFixed(2)) })}
          className="w-8 h-8 p-0 flex items-center justify-center shrink-0"
        >
          -
        </Button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setInputs({ ...inputs, [field]: parseFloat(e.target.value) })}
          className="flex-1 accent-primary bg-[var(--gray-700)] h-1.5 rounded-lg appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(54,191,250,0.24)]"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setInputs({ ...inputs, [field]: Math.min(max, +(value + step).toFixed(2)) })}
          className="w-8 h-8 p-0 flex items-center justify-center shrink-0"
        >
          +
        </Button>
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        {presets.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setInputs({ ...inputs, [field]: p.val })}
            className={`transition-colors duration-200 hover:text-[var(--primary)] ${value === p.val ? 'text-[var(--primary)] font-medium' : ''}`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {t.intubationTitle || 'Калькулятор доз препаратов для интубации'}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          {t.intubationSubtitle || 'Расчет дозировок гипнотиков, анальгетиков и миорелаксантов на основе антропометрических масс (TBW, IBW, LBW, ABW) и параметров ШВЛ ($V_t$).'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {t.patientDataSection || '1. Данные пациента'}
            </h2>
            <Button onClick={handleReset} variant="outline" size="sm">
              {t.reset || 'Сброс'}
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t.genderLabel || 'Стать'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={inputs.gender === 'male' ? 'primary' : 'outline'}
                onClick={() => setInputs({ ...inputs, gender: 'male' })}
                className="w-full flex items-center justify-center gap-2"
              >
                <MaleIcon />
                <span>{t.maleGender || 'Мужской'}</span>
              </Button>
              <Button
                type="button"
                variant={inputs.gender === 'female' ? 'primary' : 'outline'}
                onClick={() => setInputs({ ...inputs, gender: 'female' })}
                className="w-full flex items-center justify-center gap-2"
              >
                <FemaleIcon />
                <span>{t.femaleGender || 'Женский'}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              label={t.actualWeightTbwLabel || 'Вес TBW (кг)'}
              value={inputs.weight}
              onChange={(val) => setInputs({ ...inputs, weight: val })}
              min={10}
              max={300}
              placeholder="85"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t.lbwFormulaLabel || 'Формула LBW'}
              value={inputs.lbwFormula}
              onChange={(val) => setInputs({ ...inputs, lbwFormula: val as 'janmahasatian' | 'james' })}
              options={[
                { value: 'janmahasatian', label: t.janmahasatianGoldStandard || 'Janmahasatian (2005)' },
                { value: 'james', label: t.jamesClassic || 'James (1976)' },
              ]}
            />
            <Select
              label={t.relaxantForIntubationLabel || 'Миорелаксант'}
              value={inputs.selectedRelaxant}
              onChange={(val) => setInputs({ ...inputs, selectedRelaxant: val as 'rocuronium' | 'atracurium' | 'both' })}
              options={[
                { value: 'both', label: t.showBothRelaxants || 'Рокуроний + Атракуриум' },
                { value: 'rocuronium', label: t.rocuroniumDoseRangeOption || 'Рокуроний' },
                { value: 'atracurium', label: t.atracuriumDoseRangeOption || 'Атракуриум' },
              ]}
            />
          </div>

          <div className="pt-2">
            <Checkbox
              id="advanced-conc"
              label={t.showConcSettings || 'Настройки концентрации растворов'}
              checked={showAdvancedConc}
              onChange={(checked) => setShowAdvancedConc(checked)}
            />

            {showAdvancedConc && (
              <div className="mt-4 p-4 bg-[var(--background)] border border-[var(--border)] rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
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

        <Card className="lg:col-span-5 p-6 flex flex-col">
          <div className="border-b border-[var(--border)] pb-4 mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {t.anthropometricMatrixTitle || 'Антропометрическая матрица'}
            </h2>
          </div>

          {anthropometrics ? (
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  title="TBW (Фактический)" 
                  value={anthropometrics.tbw.toFixed(1)} 
                  unit={t.kg || 'кг'} 
                />
                <StatCard 
                  title="IBW (Идеальный)" 
                  value={anthropometrics.ibw.toFixed(1)} 
                  unit={t.kg || 'кг'} 
                />
                <StatCard 
                  title="LBW (Тощий)" 
                  value={anthropometrics.selectedLbw.toFixed(1)} 
                  unit={t.kg || 'кг'} 
                />
                <StatCard 
                  title="ABW (Скоригован)" 
                  value={anthropometrics.abw.toFixed(1)} 
                  unit={t.kg || 'кг'} 
                />
              </div>

              <StatCard
                title={`${t.ventilationVtParamLabel || 'ИВЛ Параметр ДО (Vt)'} (BMI: ${anthropometrics.bmi.toFixed(1)})`}
                value={`${anthropometrics.vtMin} - ${anthropometrics.vtMax}`}
                unit={t.unitMl || 'мл'}
                helpText={`6–8 ${t.unitMl || 'мл'}/kg IBW`}
              />

              {anthropometrics.isObese && (
                <Alert
                  variant="warning"
                  title={t.obesityWarningText || 'Ожирение (ИМТ ≥ 30)'}
                >
                  Фактическая масса значительно превосходит идеальную. Не используйте TBW для индукции!
                </Alert>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--muted-foreground)] text-sm">
              Enter weight & height.
            </div>
          )}
        </Card>
      </div>

      {anthropometrics && (
        <Card className="p-6 space-y-6">
          <div className="border-b border-[var(--border)] pb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {t.dosageFineTuningTitle || '2. Настройка целевых дозировок'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSlider(
              t.propofolInductionSliderLabel || 'Пропофол Индукция (LBW):',
              inputs.propofolInductionDosePerKg,
              1.0, 3.0, 0.1,
              t.unitMgKg || 'мг/кг',
              'propofolInductionDosePerKg',
              [
                { val: 1.0, label: '1.0' },
                { val: 2.0, label: '2.0 (Стандарт)' },
                { val: 3.0, label: '3.0' }
              ]
            )}

            {renderSlider(
              t.propofolMaintSliderLabel || 'Пропофол Инфузия (TBW):',
              inputs.propofolMaintDosePerKgMin,
              50, 200, 5,
              t.unitMcgKgMin || 'мкг/кг/мин',
              'propofolMaintDosePerKgMin',
              [
                { val: 50, label: '50' },
                { val: 100, label: '100' },
                { val: 200, label: '200' }
              ]
            )}

            {renderSlider(
              t.fentanylInductionSliderLabel || 'Фентанил Индукция (LBW):',
              inputs.fentanylInductionDosePerKg,
              0.5, 1.0, 0.05,
              t.unitMcgKg || 'мкг/кг',
              'fentanylInductionDosePerKg',
              [
                { val: 0.5, label: '0.5' },
                { val: 0.75, label: '0.75' },
                { val: 1.0, label: '1.0' }
              ]
            )}

            {renderSlider(
              t.fentanylMaintSliderLabel || 'Фентанил Инфузия (LBW):',
              inputs.fentanylMaintDosePerKgHour,
              1.0, 2.0, 0.1,
              t.unitMcgKgHour || 'мкг/кг/час',
              'fentanylMaintDosePerKgHour',
              [
                { val: 1.0, label: '1.0' },
                { val: 1.5, label: '1.5' },
                { val: 2.0, label: '2.0' }
              ]
            )}

            {(inputs.selectedRelaxant === 'rocuronium' || inputs.selectedRelaxant === 'both') && renderSlider(
              t.rocuroniumInductionSliderLabel || 'Рокуроний Индукция (IBW):',
              inputs.rocuroniumDosePerKg,
              0.6, 1.2, 0.1,
              t.unitMgKg || 'мг/кг',
              'rocuroniumDosePerKg',
              [
                { val: 0.6, label: '0.6' },
                { val: 1.0, label: '1.0 (RSI)' },
                { val: 1.2, label: '1.2' }
              ]
            )}

            {(inputs.selectedRelaxant === 'atracurium' || inputs.selectedRelaxant === 'both') && renderSlider(
              t.atracuriumInductionSliderLabel || 'Атракуриум Индукция (IBW):',
              inputs.atracuriumDosePerKg,
              0.4, 0.5, 0.01,
              t.unitMgKg || 'мг/кг',
              'atracuriumDosePerKg',
              [
                { val: 0.4, label: '0.4' },
                { val: 0.45, label: '0.45' },
                { val: 0.5, label: '0.5' }
              ]
            )}
          </div>
        </Card>
      )}

      {drugDetails.length > 0 && anthropometrics && (
        <Card className="p-6 space-y-6">
          <div className="border-b border-[var(--border)] pb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {t.summaryTableTitle || '3. Сводные дозировки препаратов'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drugDetails.map((drug) => (
              <Card key={drug.id} className="p-5 flex flex-col space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] text-lg">{drug.drugName}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant={drug.phase === 'induction' ? 'brand' : 'gray'}>
                        {drug.phase === 'induction' ? 'Induction' : 'Maintenance'}
                      </Badge>
                      <span className="text-xs text-[var(--muted-foreground)]">{drug.concentrationStr}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">
                      {t.colBaseWeight || 'Базовый вес'}
                    </span>
                    <Badge variant="gray">
                      {drug.weightMetricUsed} ({drug.weightValue.toFixed(1)} {t.kg || 'кг'})
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase">
                      {t.colCalculatedDose || 'Рассчитанная доза'}
                    </span>
                    <div className="text-xl font-bold text-[var(--foreground)]">
                      {drug.selectedTotalDose.toFixed(1)} <span className="text-sm font-normal text-[var(--muted-foreground)]">{drug.totalDoseUnit}</span>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      [{drug.totalDoseMin.toFixed(1)} – {drug.totalDoseMax.toFixed(1)}]
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase">
                      {t.colVolumeOrSpeed || 'Объем / Скорость'}
                    </span>
                    <div className="text-xl font-bold text-[var(--primary)]">
                      {drug.phase === 'induction' ? (
                        <>
                          {drug.selectedVolumeMl?.toFixed(1)} <span className="text-sm font-normal text-[var(--muted-foreground)]">{t.unitMl || 'мл'}</span>
                        </>
                      ) : (
                        <>
                          {drug.selectedRateMlHour?.toFixed(1)} <span className="text-sm font-normal text-[var(--muted-foreground)]">{t.unitMlHour || 'мл/ч'}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {drug.phase === 'induction' 
                        ? `[${drug.volumeMinMl?.toFixed(1)}–${drug.volumeMaxMl?.toFixed(1)}]`
                        : `[${drug.rateMinMlHour?.toFixed(1)}–${drug.rateMaxMlHour?.toFixed(1)}]`
                      }
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex items-start gap-2 text-sm text-[var(--muted-foreground)] border-t border-[var(--border)]">
                  <InfoIcon />
                  <span className="flex-1">{drug.explanation}</span>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 space-y-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {t.cheatSheetTitle || 'Шпаргалка применения массы тела'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { param: t.paramVentVt || 'Параметры ИВЛ (Vt)', scalar: 'IBW', rationale: t.rationaleVentVt },
            { param: t.paramPropInduction || 'Пропофол (Индукция)', scalar: 'LBW', rationale: t.rationalePropInduction },
            { param: t.paramPropMaintenance || 'Пропофол (Инфузия)', scalar: 'TBW / TCI', rationale: t.rationalePropMaintenance },
            { param: t.paramRelaxants || 'Миорелаксанты', scalar: 'IBW', rationale: t.rationaleRelaxants },
            { param: t.paramSuxamethonium || 'Суксаметоний', scalar: 'TBW', rationale: t.rationaleSuxamethonium },
            { param: t.paramFentanyl || 'Фентанил', scalar: 'LBW', rationale: t.rationaleFentanyl },
            { param: t.paramAminoglycosides || 'Аминогликозиды / Ванкомицин', scalar: 'ABW', rationale: t.rationaleAminoglycosides }
          ].map((item, idx) => (
            <div key={idx} className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <span className="font-medium text-[var(--foreground)] text-sm">{item.param}</span>
                <Badge variant="gray">{item.scalar}</Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {item.rationale}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
