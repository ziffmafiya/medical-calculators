'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/Card';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { 
  IntubationInputs, 
  AnthropometricsResult, 
  DrugDoseDetail 
} from '@/types';

export const IntubationDoseCalculator: React.FC = () => {
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
    // Prevent paradoxical drop in James formula for extreme obesity
    if (lbwJames <= 0 || lbwJames > weight) {
      lbwJames = lbwJanmahasatian;
    }

    const selectedLbw = inputs.lbwFormula === 'janmahasatian' ? lbwJanmahasatian : lbwJames;

    // ABW (Adjusted Body Weight)
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
      drugName: 'Пропофол (Propofol)',
      category: 'hypnotic',
      phase: 'induction',
      weightMetricUsed: 'LBW',
      weightValue: selectedLbw,
      dosePerKgRange: '1.0 – 3.0 мг/кг',
      selectedDosePerKg: inputs.propofolInductionDosePerKg,
      unitPerKg: 'мг/кг',
      totalDoseMin: propIndMinMg,
      totalDoseMax: propIndMaxMg,
      selectedTotalDose: propIndSelectedMg,
      totalDoseUnit: 'мг',
      volumeMinMl: propIndMinMg / propConc,
      volumeMaxMl: propIndMaxMg / propConc,
      selectedVolumeMl: propIndSelectedMg / propConc,
      concentrationStr: `${propConc} мг/мл (${propConc / 10}%)`,
      explanation: 'Доза рассчитывается по LBW (тощей массе) во избежание выраженной гемодинамической нестабильности у пациентов с избыточным весом.',
    });

    // 2. Propofol Maintenance (TBW)
    const propMaintMinMcgMin = 50 * tbw;
    const propMaintMaxMcgMin = 200 * tbw;
    const propMaintSelectedMcgMin = inputs.propofolMaintDosePerKgMin * tbw;

    // In mg/h: (mcg/min * 60) / 1000
    const propMaintMinMgH = (propMaintMinMcgMin * 60) / 1000;
    const propMaintMaxMgH = (propMaintMaxMcgMin * 60) / 1000;
    const propMaintSelectedMgH = (propMaintSelectedMcgMin * 60) / 1000;

    // Rate in ml/h = mg/h / mg/ml
    details.push({
      id: 'propofol-maintenance',
      drugName: 'Пропофол (Инфузия)',
      category: 'hypnotic',
      phase: 'maintenance',
      weightMetricUsed: 'TBW',
      weightValue: tbw,
      dosePerKgRange: '50 – 200 мкг/кг/мин',
      selectedDosePerKg: inputs.propofolMaintDosePerKgMin,
      unitPerKg: 'мкг/кг/мин',
      totalDoseMin: propMaintMinMgH,
      totalDoseMax: propMaintMaxMgH,
      selectedTotalDose: propMaintSelectedMgH,
      totalDoseUnit: 'мг/час',
      rateMinMlHour: propMaintMinMgH / propConc,
      rateMaxMlHour: propMaintMaxMgH / propConc,
      selectedRateMlHour: propMaintSelectedMgH / propConc,
      concentrationStr: `${propConc} мг/мл (${propConc / 10}%)`,
      explanation: 'Поддержание анестезии рассчитывается по TBW (фактическому весу) или целевой концентрации TCI.',
    });

    // 3. Fentanyl Induction (LBW)
    const fentIndMinMcg = 0.5 * selectedLbw;
    const fentIndMaxMcg = 1.0 * selectedLbw;
    const fentIndSelectedMcg = inputs.fentanylInductionDosePerKg * selectedLbw;
    const fentConc = inputs.fentanylConcMcgMl > 0 ? inputs.fentanylConcMcgMl : 50;

    details.push({
      id: 'fentanyl-induction',
      drugName: 'Фентанил (Fentanyl)',
      category: 'analgesic',
      phase: 'induction',
      weightMetricUsed: 'LBW',
      weightValue: selectedLbw,
      dosePerKgRange: '0.5 – 1.0 мкг/кг',
      selectedDosePerKg: inputs.fentanylInductionDosePerKg,
      unitPerKg: 'мкг/кг',
      totalDoseMin: fentIndMinMcg,
      totalDoseMax: fentIndMaxMcg,
      selectedTotalDose: fentIndSelectedMcg,
      totalDoseUnit: 'мкг',
      volumeMinMl: fentIndMinMcg / fentConc,
      volumeMaxMl: fentIndMaxMcg / fentConc,
      selectedVolumeMl: fentIndSelectedMcg / fentConc,
      concentrationStr: `${fentConc} мкг/мл (0.005%)`,
      explanation: 'Индукция анальгезии рассчитывается по тощей массе тела (LBW).',
    });

    // 4. Fentanyl Maintenance (LBW)
    const fentMaintMinMcgH = 1.0 * selectedLbw;
    const fentMaintMaxMcgH = 2.0 * selectedLbw;
    const fentMaintSelectedMcgH = inputs.fentanylMaintDosePerKgHour * selectedLbw;

    details.push({
      id: 'fentanyl-maintenance',
      drugName: 'Фентанил (Инфузия)',
      category: 'analgesic',
      phase: 'maintenance',
      weightMetricUsed: 'LBW',
      weightValue: selectedLbw,
      dosePerKgRange: '1.0 – 2.0 мкг/кг/час',
      selectedDosePerKg: inputs.fentanylMaintDosePerKgHour,
      unitPerKg: 'мкг/кг/час',
      totalDoseMin: fentMaintMinMcgH,
      totalDoseMax: fentMaintMaxMcgH,
      selectedTotalDose: fentMaintSelectedMcgH,
      totalDoseUnit: 'мкг/час',
      rateMinMlHour: fentMaintMinMcgH / fentConc,
      rateMaxMlHour: fentMaintMaxMcgH / fentConc,
      selectedRateMlHour: fentMaintSelectedMcgH / fentConc,
      concentrationStr: `${fentConc} мкг/мл (0.005%)`,
      explanation: 'Поддержание фентанилом дозируется по тощей массе тела (LBW).',
    });

    // 5. Rocuronium (IBW)
    if (inputs.selectedRelaxant === 'rocuronium' || inputs.selectedRelaxant === 'both') {
      const rocMinMg = 0.6 * ibw;
      const rocMaxMg = 1.2 * ibw;
      const rocSelectedMg = inputs.rocuroniumDosePerKg * ibw;
      const rocConc = inputs.rocuroniumConcMgMl > 0 ? inputs.rocuroniumConcMgMl : 10;

      details.push({
        id: 'rocuronium-induction',
        drugName: 'Рокуроний (Rocuronium)',
        category: 'relaxant',
        phase: 'induction',
        weightMetricUsed: 'IBW',
        weightValue: ibw,
        dosePerKgRange: '0.6 – 1.2 мг/кг',
        selectedDosePerKg: inputs.rocuroniumDosePerKg,
        unitPerKg: 'мг/кг',
        totalDoseMin: rocMinMg,
        totalDoseMax: rocMaxMg,
        selectedTotalDose: rocSelectedMg,
        totalDoseUnit: 'мг',
        volumeMinMl: rocMinMg / rocConc,
        volumeMaxMl: rocMaxMg / rocConc,
        selectedVolumeMl: rocSelectedMg / rocConc,
        concentrationStr: `${rocConc} мг/мл`,
        explanation: 'Доза миорелаксанта рассчитывается по идеальной массе (IBW) во избежание опасного удлинения нервно-мышечного блока.',
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
        drugName: 'Атракуриум (Atracurium)',
        category: 'relaxant',
        phase: 'induction',
        weightMetricUsed: 'IBW',
        weightValue: ibw,
        dosePerKgRange: '0.4 – 0.5 мг/кг',
        selectedDosePerKg: inputs.atracuriumDosePerKg,
        unitPerKg: 'мг/кг',
        totalDoseMin: atrMinMg,
        totalDoseMax: atrMaxMg,
        selectedTotalDose: atrSelectedMg,
        totalDoseUnit: 'мг',
        volumeMinMl: atrMinMg / atrConc,
        volumeMaxMl: atrMaxMg / atrConc,
        selectedVolumeMl: atrSelectedMg / atrConc,
        concentrationStr: `${atrConc} мг/мл`,
        explanation: 'Дозируется по идеальной массе тела (IBW) для предотвращения пролонгированного блока.',
      });
    }

    return details;
  }, [anthropometrics, inputs]);

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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Description Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 rounded-xl p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400 mt-1 hidden sm:block">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Калькулятор доз препаратов для интубации и параметров масс тела
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Точный расчет дозировок гипнотиков (Пропофол), анальгетиков (Фентанил) и миорелаксантов (Рокуроний / Атракуриум) для индукции и поддержания анестезии с учетом антропометрических показателей (TBW, IBW, LBW Жанмахасатиан/Джеймс, ABW) и параметров ИВЛ ($V_t$).
            </p>
          </div>
        </div>
      </div>

      {/* Input Parameters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-border space-y-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            1. Данные пациента
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Пол</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInputs({ ...inputs, gender: 'male' })}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    inputs.gender === 'male'
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'bg-accent/50 text-muted-foreground hover:bg-accent'
                  }`}
                >
                  Мужской
                </button>
                <button
                  type="button"
                  onClick={() => setInputs({ ...inputs, gender: 'female' })}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    inputs.gender === 'female'
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'bg-accent/50 text-muted-foreground hover:bg-accent'
                  }`}
                >
                  Женский
                </button>
              </div>
            </div>

            <div>
              <NumberInput
                label="Возраст (лет)"
                value={inputs.age}
                onChange={(val) => setInputs({ ...inputs, age: val })}
                min={1}
                max={120}
                placeholder="45"
              />
            </div>

            <div>
              <NumberInput
                label="Рост (см)"
                value={inputs.height}
                onChange={(val) => setInputs({ ...inputs, height: val })}
                min={50}
                max={250}
                placeholder="175"
              />
            </div>

            <div>
              <NumberInput
                label="Фактическая масса тела TBW (кг)"
                value={inputs.weight}
                onChange={(val) => setInputs({ ...inputs, weight: val })}
                min={10}
                max={300}
                placeholder="85"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Формула LBW (Тощая масса)
              </label>
              <Select
                value={inputs.lbwFormula}
                onChange={(val) => setInputs({ ...inputs, lbwFormula: val as 'janmahasatian' | 'james' })}
                options={[
                  { value: 'janmahasatian', label: 'Janmahasatian (2005) — Золотой стандарт' },
                  { value: 'james', label: 'James (1976) — Классическая' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Миорелаксант для интубации
              </label>
              <Select
                value={inputs.selectedRelaxant}
                onChange={(val) => setInputs({ ...inputs, selectedRelaxant: val as 'rocuronium' | 'atracurium' | 'both' })}
                options={[
                  { value: 'both', label: 'Показать Рокуроний и Атракуриум' },
                  { value: 'rocuronium', label: 'Рокуроний (0.6 - 1.2 мг/кг)' },
                  { value: 'atracurium', label: 'Атракуриум (0.4 - 0.5 мг/кг)' },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setShowAdvancedConc(!showAdvancedConc)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {showAdvancedConc ? 'Скрыть настройки концентраций' : 'Настройки концентраций растворов (мг/мл)'}
            </button>

            <Button onClick={handleReset} variant="outline" size="sm">
              Сброс
            </Button>
          </div>

          {showAdvancedConc && (
            <div className="p-4 bg-accent/30 rounded-lg border border-border space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Концентрация ампул/растворов:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <NumberInput
                  label="Пропофол (мг/мл)"
                  value={inputs.propofolConcMgMl}
                  onChange={(val) => setInputs({ ...inputs, propofolConcMgMl: val || 10 })}
                  min={1}
                />
                <NumberInput
                  label="Фентанил (мкг/мл)"
                  value={inputs.fentanylConcMcgMl}
                  onChange={(val) => setInputs({ ...inputs, fentanylConcMcgMl: val || 50 })}
                  min={1}
                />
                <NumberInput
                  label="Рокуроний (мг/мл)"
                  value={inputs.rocuroniumConcMgMl}
                  onChange={(val) => setInputs({ ...inputs, rocuroniumConcMgMl: val || 10 })}
                  min={1}
                />
                <NumberInput
                  label="Атракуриум (мг/мл)"
                  value={inputs.atracuriumConcMgMl}
                  onChange={(val) => setInputs({ ...inputs, atracuriumConcMgMl: val || 10 })}
                  min={1}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Quick Summary Anthropometrics Card */}
        <Card className="p-6 border-border bg-card/60 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3 mb-4">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Антропометрическая матрица
            </h2>

            {anthropometrics ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
                  <span className="text-muted-foreground">TBW (Фактический вес):</span>
                  <span className="font-semibold text-foreground">{anthropometrics.tbw} кг</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
                  <span className="text-muted-foreground">IBW (Идеальный вес - Devine):</span>
                  <span className="font-semibold text-blue-400">{anthropometrics.ibw.toFixed(1)} кг</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
                  <span className="text-muted-foreground">LBW (Тощий вес - Janmahasatian):</span>
                  <span className="font-semibold text-emerald-400">{anthropometrics.lbwJanmahasatian.toFixed(1)} кг</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
                  <span className="text-muted-foreground">LBW (Тощий вес - James):</span>
                  <span className="font-medium text-foreground">{anthropometrics.lbwJames.toFixed(1)} кг</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
                  <span className="text-muted-foreground">ABW (Скорректированный):</span>
                  <span className="font-medium text-foreground">{anthropometrics.abw.toFixed(1)} кг</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
                  <span className="text-muted-foreground">ИМТ (BMI):</span>
                  <span className={`font-semibold ${anthropometrics.bmi >= 30 ? 'text-amber-400' : 'text-foreground'}`}>
                    {anthropometrics.bmi.toFixed(1)} кг/м²
                  </span>
                </div>

                <div className="mt-4 p-3 bg-blue-950/40 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-300 font-semibold mb-1">ИВЛ Параметр ДО ($V_t$):</div>
                  <div className="text-lg font-bold text-blue-400">
                    {anthropometrics.vtMin} – {anthropometrics.vtMax} мл
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    (6–8 мл/кг IBW = {anthropometrics.ibw.toFixed(1)} кг)
                  </div>
                </div>

                {anthropometrics.isObese && (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-lg text-xs text-amber-300">
                    ⚠️ <strong>Внимание (Ожирение ИМТ ≥ 30):</strong> Фактический вес значительно превосходит идеальный. Использование TBW для индукции пропофола или релаксантов приведет к тяжелой передозировке!
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Введите рост и вес пациента для расчета антропометрии.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Target Dosage Sliders & Interactive Fine Tuning */}
      {anthropometrics && (
        <Card className="p-6 border-border space-y-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            2. Интерактивная настройка целевых дозировок
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Propofol Induction Slider */}
            <div className="p-4 bg-accent/20 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Пропофол Индукция (LBW):</span>
                <span className="text-sm font-bold text-primary">{inputs.propofolInductionDosePerKg} мг/кг</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={inputs.propofolInductionDosePerKg}
                onChange={(e) => setInputs({ ...inputs, propofolInductionDosePerKg: parseFloat(e.target.value) })}
                className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1.0 мг/кг (Мин)</span>
                <span>2.0 мг/кг (Стандарт)</span>
                <span>3.0 мг/кг (Макс)</span>
              </div>
            </div>

            {/* Propofol Maintenance Slider */}
            <div className="p-4 bg-accent/20 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Пропофол Инфузия (TBW):</span>
                <span className="text-sm font-bold text-primary">{inputs.propofolMaintDosePerKgMin} мкг/кг/мин</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                step="5"
                value={inputs.propofolMaintDosePerKgMin}
                onChange={(e) => setInputs({ ...inputs, propofolMaintDosePerKgMin: parseFloat(e.target.value) })}
                className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>50 мкг/кг/мин</span>
                <span>100 мкг/кг/мин</span>
                <span>200 мкг/кг/мин</span>
              </div>
            </div>

            {/* Fentanyl Induction Slider */}
            <div className="p-4 bg-accent/20 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Фентанил Индукция (LBW):</span>
                <span className="text-sm font-bold text-purple-400">{inputs.fentanylInductionDosePerKg} мкг/кг</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={inputs.fentanylInductionDosePerKg}
                onChange={(e) => setInputs({ ...inputs, fentanylInductionDosePerKg: parseFloat(e.target.value) })}
                className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0.5 мкг/кг</span>
                <span>0.75 мкг/кг</span>
                <span>1.0 мкг/кг</span>
              </div>
            </div>

            {/* Fentanyl Maintenance Slider */}
            <div className="p-4 bg-accent/20 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Фентанил Инфузия (LBW):</span>
                <span className="text-sm font-bold text-purple-400">{inputs.fentanylMaintDosePerKgHour} мкг/кг/час</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={inputs.fentanylMaintDosePerKgHour}
                onChange={(e) => setInputs({ ...inputs, fentanylMaintDosePerKgHour: parseFloat(e.target.value) })}
                className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1.0 мкг/кг/ч</span>
                <span>1.5 мкг/кг/ч</span>
                <span>2.0 мкг/кг/ч</span>
              </div>
            </div>

            {/* Rocuronium Slider */}
            {(inputs.selectedRelaxant === 'rocuronium' || inputs.selectedRelaxant === 'both') && (
              <div className="p-4 bg-accent/20 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Рокуроний Индукция (IBW):</span>
                  <span className="text-sm font-bold text-emerald-400">{inputs.rocuroniumDosePerKg} мг/кг</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.2"
                  step="0.1"
                  value={inputs.rocuroniumDosePerKg}
                  onChange={(e) => setInputs({ ...inputs, rocuroniumDosePerKg: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.6 мг/кг (Стандарт)</span>
                  <span>1.0 мг/кг (RSI)</span>
                  <span>1.2 мг/кг (Макс RSI)</span>
                </div>
              </div>
            )}

            {/* Atracurium Slider */}
            {(inputs.selectedRelaxant === 'atracurium' || inputs.selectedRelaxant === 'both') && (
              <div className="p-4 bg-accent/20 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Атракуриум Индукция (IBW):</span>
                  <span className="text-sm font-bold text-emerald-400">{inputs.atracuriumDosePerKg} мг/кг</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="0.5"
                  step="0.01"
                  value={inputs.atracuriumDosePerKg}
                  onChange={(e) => setInputs({ ...inputs, atracuriumDosePerKg: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.4 мг/кг</span>
                  <span>0.45 мг/кг</span>
                  <span>0.5 мг/кг</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Main Results Table & Drug Cards */}
      {drugDetails.length > 0 && anthropometrics && (
        <Card className="p-6 border-border space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              3. Сводная таблица дозирования препаратов
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-accent/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">Препарат и Этап</th>
                  <th className="p-3">Базовый вес (кг)</th>
                  <th className="p-3">Диапазон дозы</th>
                  <th className="p-3">Рассчитанная доза</th>
                  <th className="p-3">Объем / Скорость</th>
                  <th className="p-3">Обоснование весовой категории</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {drugDetails.map((drug) => (
                  <tr key={drug.id} className="hover:bg-accent/20 transition-colors">
                    <td className="p-3 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          drug.category === 'hypnotic' ? 'bg-blue-400' :
                          drug.category === 'analgesic' ? 'bg-purple-400' : 'bg-emerald-400'
                        }`} />
                        <div>
                          <div>{drug.drugName}</div>
                          <div className="text-[11px] font-normal text-muted-foreground">{drug.concentrationStr}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-bold text-primary">{drug.weightMetricUsed}</span>
                      <span className="text-muted-foreground ml-1">({drug.weightValue.toFixed(1)} кг)</span>
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {drug.dosePerKgRange}
                    </td>
                    <td className="p-3 whitespace-nowrap font-semibold text-foreground">
                      {drug.selectedTotalDose.toFixed(1)} {drug.totalDoseUnit}
                      <div className="text-[11px] font-normal text-muted-foreground">
                        [{drug.totalDoseMin.toFixed(1)} – {drug.totalDoseMax.toFixed(1)} {drug.totalDoseUnit}]
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap font-bold text-emerald-400">
                      {drug.phase === 'induction' ? (
                        <>
                          {drug.selectedVolumeMl?.toFixed(1)} мл
                          <div className="text-[11px] font-normal text-muted-foreground">
                            [{drug.volumeMinMl?.toFixed(1)} – {drug.volumeMaxMl?.toFixed(1)} мл]
                          </div>
                        </>
                      ) : (
                        <>
                          {drug.selectedRateMlHour?.toFixed(1)} мл/час
                          <div className="text-[11px] font-normal text-muted-foreground">
                            [{drug.rateMinMlHour?.toFixed(1)} – {drug.rateMaxMlHour?.toFixed(1)} мл/ч]
                          </div>
                        </>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground leading-relaxed max-w-xs">
                      {drug.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Clinical Reference Cheat Sheet Table */}
      <Card className="p-6 border-border space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-4">
          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Шпаргалка применения массы тела в ОРИТ и анестезиологии
        </h2>

        <p className="text-sm text-muted-foreground">
          Определяющий ориентир применения антропометрических масс при различных клинических задачах:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-accent/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-3">Клинический параметр / Препарат</th>
                <th className="p-3">Расчетная масса тела</th>
                <th className="p-3">Физиологическое обоснование</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-foreground">
              <tr className="hover:bg-accent/20">
                <td className="p-3 font-semibold text-blue-400">Параметры ИВЛ ($V_t$)</td>
                <td className="p-3"><span className="font-bold text-blue-400">IBW</span> (Идеальная масса)</td>
                <td className="p-3 text-xs text-muted-foreground">Размер легких зависит от роста и пола человека, а не от объема жировой ткани. Предотвращает волюмотравму.</td>
              </tr>
              <tr className="hover:bg-accent/20">
                <td className="p-3 font-semibold text-emerald-400">Пропофол (Индукция)</td>
                <td className="p-3"><span className="font-bold text-emerald-400">LBW</span> (Тощая масса)</td>
                <td className="p-3 text-xs text-muted-foreground">Предотвращает тяжелую вазодилатацию и глубокую гипотензию у пациентов с ожирением.</td>
              </tr>
              <tr className="hover:bg-accent/20">
                <td className="p-3 font-semibold text-indigo-400">Пропофол (Инфузия / TCI)</td>
                <td className="p-3"><span className="font-bold text-indigo-400">TBW</span> или TCI (Marsh/Schnider)</td>
                <td className="p-3 text-xs text-muted-foreground">Перераспределение препарата в жировую ткань при продолжительном введении требует учета клиренса и фактической массы.</td>
              </tr>
              <tr className="hover:bg-accent/20">
                <td className="p-3 font-semibold text-purple-400">Миорелаксанты (Рокуроний, Векуроний, Атракуриум)</td>
                <td className="p-3"><span className="font-bold text-purple-400">IBW</span> (Идеальная масса)</td>
                <td className="p-3 text-xs text-muted-foreground">Объем распределения гидрофильных релаксантов не увеличивается пропорционально жировой массе. Защищает от затяжного блока.</td>
              </tr>
              <tr className="hover:bg-accent/20">
                <td className="p-3 font-semibold text-red-400">Суксаметоний (Дитилин)</td>
                <td className="p-3"><span className="font-bold text-red-400">TBW</span> (Фактическая масса)</td>
                <td className="p-3 text-xs text-muted-foreground">При ожирении уровень псевдохолинэстеразы плазмы и объем крови повышены.</td>
              </tr>
              <tr className="hover:bg-accent/20">
                <td className="p-3 font-semibold text-cyan-400">Фентанил (Индукция и поддерживающая инфузия)</td>
                <td className="p-3"><span className="font-bold text-cyan-400">LBW</span> (Тощая масса)</td>
                <td className="p-3 text-xs text-muted-foreground">Липофильный опиоид, но первичный центральный эффект и фармакодинамика зависят от метаболически активных органов.</td>
              </tr>
              <tr className="hover:bg-accent/20">
                <td className="p-3 font-semibold text-amber-400">Аминогликозиды / Ванкомицин</td>
                <td className="p-3"><span className="font-bold text-amber-400">ABW</span> (Скорректированная)</td>
                <td className="p-3 text-xs text-muted-foreground">Жировая ткань содержит ~20-30% внеклеточной жидкости. Коррекция предотвращает нефротоксичность.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
