'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Checkbox } from '@/components/Checkbox';
import { StatCard } from '@/components/StatCard';
import { Alert } from '@/components/Alert';
import { Badge } from '@/components/Badge';
import { InfusionTherapyInputs, InfusionTherapyResult, RecommendedSolution } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

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

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-400 mt-0.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const InfusionTherapyCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<InfusionTherapyInputs>({
    weight: 70,
    height: 170,
    age: 40,
    gender: 'male',
    currentWeight: 70,
    hasEdema: false,
    hasDehydration: false,
    hasOverhydration: false,
    serumSodium: 140,
    serumPotassium: 4.0,
    serumChloride: 104,
    serumGlucose: 5.5,
    serumCreatinine: 80,
    serumAlbumin: 40,
    bloodPressure: {
      systolic: 120,
      diastolic: 80
    },
    heartRate: 80,
    centralVenousPressure: 8,
    urineOutput: 50,
    hasVomiting: false,
    hasDiarrhea: false,
    hasFever: false,
    feverTemperature: 37.0,
    isPostoperative: false,
    surgeryDuration: 0,
    bloodLoss: 0,
    thirdSpaceLoss: 0,
    hasBurns: false,
    burnSurfaceArea: 0,
    hasSepsis: false,
    hasKidneyFailure: false
  });

  const [result, setResult] = useState<InfusionTherapyResult | null>(null);

  const calculateTotalBodyWater = (weight: number, height: number, age: number, gender: 'male' | 'female'): number => {
    if (gender === 'male') {
      return 2.447 - (0.09156 * age) + (0.1074 * height) + (0.3362 * weight);
    } else {
      return -2.097 + (0.1069 * height) + (0.2466 * weight);
    }
  };

  const calculateFluidDeficit = (weight: number, hasDehydration: boolean, hasEdema: boolean, hasOverhydration: boolean): number => {
    if (hasOverhydration || hasEdema) return 0;
    let deficit = 0;
    if (hasDehydration) {
      deficit = weight * 0.05;
    }
    return deficit * 1000;
  };

  const calculateOngoingLosses = (
    weight: number,
    hasVomiting: boolean,
    hasDiarrhea: boolean,
    hasFever: boolean,
    feverTemperature: number | null,
    isPostoperative: boolean,
    surgeryDuration: number | null,
    hasBurns: boolean,
    burnSurfaceArea: number | null
  ): number => {
    let losses = 0;
    losses += weight * 15;
    
    if (hasFever && feverTemperature && feverTemperature > 37.0) {
      const tempIncrease = feverTemperature - 37.0;
      losses += tempIncrease * 100;
    }
    
    if (hasVomiting) losses += 500;
    if (hasDiarrhea) losses += 1000;
    
    if (isPostoperative && surgeryDuration) {
      if (surgeryDuration < 60) losses += 200;
      else if (surgeryDuration < 120) losses += 400;
      else losses += 600;
    }
    
    if (hasBurns && burnSurfaceArea) {
      losses += burnSurfaceArea * 4 * weight;
    }
    
    return losses;
  };

  const calculateMaintenanceFluid = (weight: number, age: number): number => {
    if (age < 1) return weight * 100;
    if (age < 10) return weight * 80;
    if (age < 20) return weight * 60;
    return weight * 30;
  };

  const handleCalculate = () => {
    if (!data.weight || !data.height || !data.age) {
      alert(t.pleaseFillAllFields);
      return;
    }

    const totalBodyWater = calculateTotalBodyWater(data.weight, data.height, data.age, data.gender);
    const extracellularFluid = totalBodyWater * 0.4;
    const intracellularFluid = totalBodyWater * 0.6;
    
    const maintenanceFluid = calculateMaintenanceFluid(data.weight, data.age);
    const maintenanceRate = maintenanceFluid / 24;
    
    const fluidDeficit = calculateFluidDeficit(data.weight, data.hasDehydration, data.hasEdema, data.hasOverhydration);
    const deficitCorrectionRate = fluidDeficit > 0 ? Math.min(fluidDeficit / 8, 1000) : 0;
    const deficitCorrectionTime = fluidDeficit > 0 ? fluidDeficit / deficitCorrectionRate : 0;
    
    const ongoingLosses = calculateOngoingLosses(
      data.weight,
      data.hasVomiting,
      data.hasDiarrhea,
      data.hasFever,
      data.feverTemperature,
      data.isPostoperative,
      data.surgeryDuration,
      data.hasBurns,
      data.burnSurfaceArea
    );
    
    const totalInfusionVolume = maintenanceFluid + fluidDeficit + ongoingLosses;
    const totalInfusionRate = totalInfusionVolume / 24;

    const recommendedSolutions: RecommendedSolution[] = [];
    
    if (fluidDeficit > 0) {
      recommendedSolutions.push({
        solution: 'NaCl 0.9% / Ringer',
        volume: Math.min(fluidDeficit, 2000),
        rate: deficitCorrectionRate,
        duration: Math.min(deficitCorrectionTime, 8),
        indication: t.fluidDeficitLabel || 'Коррекция дефицита жидкости',
        notes: 'Быстрая инфузия для восстановления объема'
      });
    }
    
    recommendedSolutions.push({
      solution: 'Dextrose 5% + NaCl 0.18%',
      volume: maintenanceFluid,
      rate: maintenanceRate,
      duration: 24,
      indication: t.maintenanceFluidLabel || 'Поддерживающая терапия',
      notes: 'Базовые потребности в жидкости и электролитах'
    });

    const monitoringParameters = [
      {
        parameter: t.diuresisLabel || 'Диурез',
        frequency: 'Каждый час',
        target: '0.5-1.0 мл/кг/час',
        criticalValues: ['< 0.3 мл/кг/час', '> 2.0 мл/кг/час']
      },
      {
        parameter: t.bloodPressureLabel || 'АД',
        frequency: 'Каждые 15-30 минут',
        target: 'САД > 90 мм рт.ст.',
        criticalValues: ['САД < 90 мм рт.ст.', 'ДАД < 60 мм рт.ст.']
      },
      {
        parameter: t.heartRateLabel || 'ЧСС',
        frequency: 'Постоянно',
        target: '60-100 уд/мин',
        criticalValues: ['> 120 уд/мин', '< 50 уд/мин']
      },
    ];

    const warnings: string[] = [];
    if (data.hasKidneyFailure) {
      warnings.push(t.kidneyFailureLabel || 'Осторожно с объемом жидкости при почечной недостаточности');
    }
    if (data.hasSepsis) {
      warnings.push(t.sepsisLabel || 'При сепсисе может потребоваться больший объем жидкости');
    }

    const contraindications: string[] = [];
    if (data.hasOverhydration) {
      contraindications.push('Противопоказана дополнительная инфузия при гипергидратации');
    }

    setResult({
      totalBodyWater,
      extracellularFluid,
      intracellularFluid,
      maintenanceFluid,
      maintenanceRate,
      fluidDeficit,
      deficitCorrectionRate,
      deficitCorrectionTime,
      ongoingLosses,
      ongoingLossesRate: ongoingLosses / 24,
      totalInfusionVolume,
      totalInfusionRate,
      recommendedSolutions,
      monitoringParameters,
      warnings,
      contraindications,
      additionalRecommendations: []
    });
  };

  const resetCalculator = () => {
    setData({
      weight: 70,
      height: 170,
      age: 40,
      gender: 'male',
      currentWeight: 70,
      hasEdema: false,
      hasDehydration: false,
      hasOverhydration: false,
      serumSodium: 140,
      serumPotassium: 4.0,
      serumChloride: 104,
      serumGlucose: 5.5,
      serumCreatinine: 80,
      serumAlbumin: 40,
      bloodPressure: { systolic: 120, diastolic: 80 },
      heartRate: 80,
      centralVenousPressure: 8,
      urineOutput: 50,
      hasVomiting: false,
      hasDiarrhea: false,
      hasFever: false,
      feverTemperature: 37.0,
      isPostoperative: false,
      surgeryDuration: 0,
      bloodLoss: 0,
      thirdSpaceLoss: 0,
      hasBurns: false,
      burnSurfaceArea: 0,
      hasSepsis: false,
      hasKidneyFailure: false
    });
    setResult(null);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Hero Title Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="brand" dot className="px-3 py-1 text-xs uppercase tracking-wider font-semibold">
            Инфузиология & Анестезиология
          </Badge>
          <span className="text-xs text-slate-500 font-mono">Watson Formula • Parkland Protocol</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.infusionTherapyTitle || 'Калькулятор инфузионной терапии и баланса жидкости'}
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          {t.infusionTherapySubtitle || 'Расчет общей воды организма, дефицита жидкости, поддерживающей инфузии, текущих потерь и подбор растворов.'}
        </p>
      </div>

      {/* Main Input Form */}
      <div className="bg-[#101828] border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
              1
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Параметры больного и потери
            </h2>
          </div>
          <Button onClick={resetCalculator} variant="outline" size="xs" className="text-slate-400 hover:text-white">
            {t.reset || 'Сбросить'}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumberInput label={t.patientWeight || 'Вес (кг)'} value={data.weight} onChange={(val) => setData({ ...data, weight: val || 70 })} min={20} max={250} required />
          <NumberInput label={t.heightCmLabel || 'Рост (см)'} value={data.height} onChange={(val) => setData({ ...data, height: val || 170 })} min={50} max={250} required />
          <NumberInput label={t.ageYearsLabel || 'Возраст (лет)'} value={data.age} onChange={(val) => setData({ ...data, age: val || 40 })} min={1} max={120} required />
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t.genderLabel || 'Пол'}
            </label>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setData({ ...data, gender: 'male' })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  data.gender === 'male'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MaleIcon />
                <span>Муж</span>
              </button>
              <button
                type="button"
                onClick={() => setData({ ...data, gender: 'female' })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  data.gender === 'female'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FemaleIcon />
                <span>Жен</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pathological Losses Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <Checkbox id="hasDehydration" checked={data.hasDehydration} onChange={(checked) => setData({ ...data, hasDehydration: checked })}>
            Дегидратация / Обезвоживание (5%)
          </Checkbox>
          <Checkbox id="hasVomiting" checked={data.hasVomiting} onChange={(checked) => setData({ ...data, hasVomiting: checked })}>
            {t.vomitingLabel || 'Рвота / Желудочные потери'}
          </Checkbox>
          <Checkbox id="hasDiarrhea" checked={data.hasDiarrhea} onChange={(checked) => setData({ ...data, hasDiarrhea: checked })}>
            {t.diarrheaLabel || 'Диарея / Кишечные потери'}
          </Checkbox>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={handleCalculate} variant="primary" size="lg" className="px-8 font-semibold shadow-md">
            {t.calculate || 'Рассчитать баланс'}
          </Button>
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      {result && (
        <div className="space-y-8 animate-slide-up">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
                2
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Расчетные объемы инфузии
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label={t.totalBodyWaterLabel || 'Общая вода организма'} value={`${result.totalBodyWater.toFixed(1)} L`} sublabel="Формула Watson" status="normal" />
              <StatCard label={t.maintenanceFluidLabel || 'Поддерживающая инфузия'} value={`${Math.round(result.maintenanceFluid)} ml`} sublabel={`${Math.round(result.maintenanceRate)} ml/h`} status="normal" />
              <StatCard label={t.fluidDeficitLabel || 'Дефицит жидкости'} value={`${Math.round(result.fluidDeficit)} ml`} status={result.fluidDeficit > 0 ? "warning" : "normal"} />
              <StatCard label={t.totalInfusionVolumeLabel || 'Общий объем (24ч)'} value={`${Math.round(result.totalInfusionVolume)} ml`} sublabel={`${Math.round(result.totalInfusionRate)} ml/h`} status="critical" />
            </div>
          </div>

          {/* Recommended Solutions */}
          {result.recommendedSolutions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
                  3
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {t.recommendedSolutionsLabel || 'Рекомендуемые инфузионные растворы'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {result.recommendedSolutions.map((sol, idx) => (
                  <div key={idx} className="bg-[#101828] border border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-base">{sol.solution}</span>
                      <Badge variant="brand">{sol.indication}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Объем</span>
                        <span className="text-xl font-bold font-mono text-white">{sol.volume} мл</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Скорость</span>
                        <span className="text-xl font-bold font-mono text-sky-400">{Math.round(sol.rate)} мл/ч</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2 flex items-start gap-2">
                      <CheckIcon />
                      <span>{sol.notes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
