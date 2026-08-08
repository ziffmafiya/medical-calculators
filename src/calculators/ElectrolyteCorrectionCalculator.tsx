'use client';

import React, { useState } from 'react';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Checkbox } from '@/components/Checkbox';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Alert } from '@/components/Alert';
import { StatCard } from '@/components/StatCard';
import { 
  ElectrolyteCorrectionInputs, 
  ElectrolyteCorrectionResult, 
  ElectrolyteType, 
  CorrectionType,
  RecommendedDose 
} from '@/types';
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

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-sky-400 mt-0.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-400 mt-0.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const ElectrolyteCorrectionCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [inputs, setInputs] = useState<ElectrolyteCorrectionInputs>({
    electrolyteType: 'potassium',
    correctionType: 'hypo',
    currentLevel: 3.0,
    weight: 70,
    albumin: 40,
    hasEcgChanges: false,
    hasSymptoms: false,
    renalFunction: 'normal',
    age: 30,
    gender: 'male',
  });

  const [result, setResult] = useState<ElectrolyteCorrectionResult | null>(null);

  const ELECTROLYTE_NORMS = {
    potassium: { min: 3.5, max: 5.0, unit: 'mmol/L', target: 4.5 },
    sodium: { min: 135, max: 145, unit: 'mmol/L', target: 140 },
    magnesium: { min: 0.7, max: 0.9, unit: 'mmol/L', target: 0.8 },
    calcium: { min: 2.1, max: 2.6, unit: 'mmol/L', target: 2.35 },
  };

  const calculateCorrection = () => {
    if (inputs.currentLevel === null || inputs.weight === null) {
      alert(t.pleaseFillAllFields);
      return;
    }

    const norms = ELECTROLYTE_NORMS[inputs.electrolyteType];
    let correctedLevel: number | undefined;
    let deficit: number | undefined;
    let excess: number | undefined;
    let recommendedDoses: RecommendedDose[] = [];
    const warnings: string[] = [];
    let recommendations: string[] = [];
    let emergencyActions: string[] = [];

    if (inputs.electrolyteType === 'calcium' && inputs.albumin) {
      correctedLevel = inputs.currentLevel + 0.8 * (40 - inputs.albumin);
    } else if (inputs.electrolyteType === 'magnesium' && inputs.albumin) {
      correctedLevel = inputs.currentLevel + 0.005 * (40 - inputs.albumin);
    } else {
      correctedLevel = inputs.currentLevel;
    }

    if (inputs.correctionType === 'hypo') {
      deficit = (norms.target - correctedLevel) * 0.2 * inputs.weight;
      
      switch (inputs.electrolyteType) {
        case 'potassium': {
          const asparkamDose = (deficit * 39.1) / 10.33;
          const kclDose = (deficit * 39.1) / 75;
          const kclInfusionRate = Math.round(kclDose / 24);
          const oralAsparkamDose = Math.ceil((deficit * 39.1) / (12.12 * 0.9));
          
          recommendedDoses = [
            {
              medication: 'Asparkam 10%',
              dose: Math.round(asparkamDose * 10) / 10,
              unit: 'ml',
              route: 'IV',
              frequency: `${t.infusion24Hours}`,
              notes: `${t.maxSpeed} 20 ${t.mmol}/час. ${t.infusion24Hours}. Развести в 100-200 мл 0.9% NaCl.`,
            },
            {
              medication: 'KCl 7.5%',
              dose: Math.round(kclDose * 10) / 10,
              unit: 'ml',
              route: 'IV',
              frequency: `${kclInfusionRate} ${t.ml}/час`,
              notes: `${t.alternativeToAsparkam}. ${t.infusion24Hours}. Развести в 100-200 мл 0.9% NaCl.`,
            },
            {
              medication: `Asparkam ${t.tablets}`,
              dose: oralAsparkamDose,
              unit: t.tablets,
              route: 'PO',
              frequency: `1-2 ${t.tablets} 3 ${t.timesPerDay}`,
              notes: `175 мг калия + 175 мг магния на таблетку. ${t.takeAfterMeals}`,
            },
          ];
          recommendations = [
            `${t.monitorECG} ${t.severeHypokalemia}`,
            `${t.monitorPotassium} ${t.every2to4Hours}`,
            `${t.stopInfusionIfPotassiumHigh}`,
            `${t.oralCourse3to4Weeks}`,
            `${t.takeAfterMeals} ${t.forBetterTolerability}`,
          ];
          break;
        }
        case 'sodium': {
          const patientAge = inputs.age || 30;
          const patientGender = inputs.gender || 'male';
          
          let coefficientK = 0.6;
          if (patientAge >= 0 && patientAge <= 17) {
            coefficientK = 0.6;
          } else if (patientAge >= 18 && patientAge <= 59) {
            coefficientK = patientGender === 'male' ? 0.6 : 0.5;
          } else if (patientAge >= 60) {
            coefficientK = patientGender === 'male' ? 0.5 : 0.45;
          }
          
          const targetSodium = 140;
          const currentSodium = inputs.currentLevel || 0;
          const sodiumDeficit = coefficientK * inputs.weight * (targetSodium - currentSodium);
          
          const nacl3PercentConcentration = 513;
          const nacl09PercentConcentration = 153.9;
          const nacl045PercentConcentration = 76.95;
          const ringerLactateConcentration = 129.3;
          
          const nacl3PercentVolume = Math.round((sodiumDeficit / nacl3PercentConcentration) * 1000 * 10) / 10;
          const nacl09PercentVolume = Math.round((sodiumDeficit / nacl09PercentConcentration) * 1000 * 10) / 10;
          const nacl045PercentVolume = Math.round((sodiumDeficit / nacl045PercentConcentration) * 1000 * 10) / 10;
          const ringerLactateVolume = Math.round((sodiumDeficit / ringerLactateConcentration) * 1000 * 10) / 10;
          
          const maxCorrectionRate = 0.5;
          const timeToTarget = Math.max(24, Math.ceil((targetSodium - currentSodium) / maxCorrectionRate));
          
          const roundToPractical = (volume: number) => Math.ceil(volume / 50) * 50;
          
          const nacl3PercentPractical = roundToPractical(nacl3PercentVolume);
          const nacl09PercentPractical = roundToPractical(nacl09PercentVolume);
          const nacl045PercentPractical = roundToPractical(nacl045PercentVolume);
          const ringerLactatePractical = roundToPractical(ringerLactateVolume);
          
          recommendedDoses = [
            {
              medication: 'NaCl 0.9%',
              dose: nacl09PercentPractical,
              unit: 'ml',
              route: 'IV',
              frequency: `${Math.round(nacl09PercentPractical / timeToTarget)} ${t.ml}/час`,
              notes: `Физиологический раствор. Безопасная коррекция со скоростью не более ${maxCorrectionRate} ммоль/л/ч. Время: ${timeToTarget} часов.`,
            },
            {
              medication: 'NaCl 3%',
              dose: nacl3PercentPractical,
              unit: 'ml',
              route: 'IV',
              frequency: `${Math.round(nacl3PercentPractical / timeToTarget)} ${t.ml}/час`,
              notes: `Гипертонический раствор. Осторожно! Скорость не более ${maxCorrectionRate} ммоль/л/ч. Время: ${timeToTarget} часов.`,
            },
            {
              medication: 'NaCl 0.45%',
              dose: nacl045PercentPractical,
              unit: 'ml',
              route: 'IV',
              frequency: `${Math.round(nacl045PercentPractical / timeToTarget)} ${t.ml}/час`,
              notes: `Гипотонический раствор. Медленная коррекция. Время: ${timeToTarget} часов.`,
            },
            {
              medication: 'Рингер-лактат',
              dose: ringerLactatePractical,
              unit: 'ml',
              route: 'IV',
              frequency: `${Math.round(ringerLactatePractical / timeToTarget)} ${t.ml}/час`,
              notes: `Сбалансированный раствор. Время коррекции: ${timeToTarget} часов.`,
            },
          ];
          recommendations = [
            `${t.slowCorrection} - ${t.notMoreThan} 8-10 ${t.unitMEqL}/24 ${t.hours} ${t.toPrevent} ${t.osmoticDemyelination}`,
            `${t.monitorSodium} ${t.every2to4Hours}`,
          ];
          break;
        }
        case 'magnesium': {
          const mgSulfateDose = (deficit * 243.5) / 200;
          recommendedDoses = [
            {
              medication: 'MgSO4 25%',
              dose: Math.round(mgSulfateDose * 10) / 10,
              unit: 'ml',
              route: 'IV',
              frequency: `${t.maxSpeed1gHour}`,
              notes: `${t.maxSpeed1gHour}. ${t.infusion24Hours}. Развести в 100 мл 0.9% NaCl.`,
            },
          ];
          recommendations = [
            `${t.monitorECG} и ${t.tendonReflexes}`,
            `${t.monitorMagnesium} ${t.every6to12Hours}`,
          ];
          break;
        }
        case 'calcium': {
          const caGluconateDose = (deficit * 400.8) / 9.3;
          recommendedDoses = [
            {
              medication: 'Calcium Gluconate 10%',
              dose: Math.round(caGluconateDose * 10) / 10,
              unit: 'ml',
              route: 'IV',
              frequency: '10-20 мл за 10 мин',
              notes: `${t.severeHypocalcemia}. Развести в 100 мл 5% глюкозы.`,
            },
          ];
          recommendations = [
            `${t.monitorECG} при ${t.severeHypocalcemia}`,
            `${t.monitorCalcium} ${t.every2to4Hours}`,
          ];
          break;
        }
      }
    } else {
      excess = (correctedLevel - norms.max) * 0.2 * inputs.weight;
      switch (inputs.electrolyteType) {
        case 'potassium':
          if (correctedLevel > 6.5 || inputs.hasEcgChanges) {
            emergencyActions.push(`${t.severeHyperkalemia}! ${t.emergencyCare}: ${t.membraneStabilization}, ${t.insulinGlucose}`);
          }
          recommendedDoses = [
            {
              medication: 'Calcium Gluconate 10%',
              dose: 10,
              unit: 'ml',
              route: 'IV',
              frequency: 'За 2-3 минуты',
              notes: `Для ${t.membraneStabilization}. Действует 30-60 мин.`,
            },
            {
              medication: 'Insulin + Glucose 50%',
              dose: 50,
              unit: 'ml',
              route: 'IV',
              frequency: `${t.once}`,
              notes: `${t.insulinGlucose}. Переносит калий в клетки.`,
            },
          ];
          recommendations = [
            `${t.continuousECG}`,
            `${t.monitorPotassiumEvery}`,
            `${t.considerHemodialysis}`,
          ];
          break;
        case 'sodium':
          recommendedDoses = [
            {
              medication: 'Dextrose 5%',
              dose: Math.round(excess * 10),
              unit: 'ml',
              route: 'IV',
              frequency: `${t.infusion24Hours}`,
              notes: `${t.dextrose5} для снижения натрия.`,
            },
          ];
          recommendations = [
            `${t.slowCorrection} - ${t.notMoreThan} 10 ${t.unitMEqL}/24 ${t.hours}`,
            `${t.monitorSodium} ${t.every2to4Hours}`,
          ];
          break;
        case 'magnesium':
          recommendedDoses = [
            {
              medication: 'Calcium Gluconate 10%',
              dose: 10,
              unit: 'ml',
              route: 'IV',
              frequency: `${t.once}`,
              notes: `${t.magnesiumAntagonist}.`,
            },
          ];
          recommendations = [
            `${t.hydration} ${t.physiologicalSolution} и ${t.furosemide} для ${t.enhanceExcretion}`,
            `${t.considerHemodialysisMagnesium}`,
          ];
          break;
        case 'calcium':
          recommendedDoses = [
            {
              medication: 'NaCl 0.9%',
              dose: 1000,
              unit: 'ml',
              route: 'IV',
              frequency: '200-300 мл/час',
              notes: `${t.hydration} ${t.physiologicalSolution}.`,
            },
            {
              medication: 'Furosemide',
              dose: 40,
              unit: 'mg',
              route: 'IV',
              frequency: 'Каждые 4-6 часов',
              notes: `После восполнения ОЦК.`,
            },
          ];
          recommendations = [
            `${t.monitorKidneyFunction}`,
            `${t.monitorCalcium} ${t.every2to4Hours}`,
          ];
          break;
      }
    }

    setResult({
      correctedLevel,
      deficit,
      excess,
      recommendedDoses,
      warnings,
      recommendations,
      emergencyActions,
    });
  };

  const resetCalculator = () => {
    setInputs({
      electrolyteType: 'potassium',
      correctionType: 'hypo',
      currentLevel: 3.0,
      weight: 70,
      albumin: 40,
      hasEcgChanges: false,
      hasSymptoms: false,
      renalFunction: 'normal',
      age: 30,
      gender: 'male',
    });
    setResult(null);
  };

  const getElectrolyteOptions = () => [
    { value: 'potassium', label: t.electrolytePotassium },
    { value: 'sodium', label: t.electrolyteSodium },
    { value: 'magnesium', label: t.electrolyteMagnesium },
    { value: 'calcium', label: t.electrolyteCalcium },
  ];

  const getRenalFunctionOptions = () => [
    { value: 'normal', label: t.normal },
    { value: 'mild', label: t.mild },
    { value: 'moderate', label: t.moderate },
    { value: 'severe', label: t.severe },
  ];

  const norms = ELECTROLYTE_NORMS[inputs.electrolyteType];

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Hero Title Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="brand" dot className="px-3 py-1 text-xs uppercase tracking-wider font-semibold">
            {t.icuNephrologyTag || 'ICU & Nephrology'}
          </Badge>
          <span className="text-xs text-slate-500 font-mono">v2.1 • Adrogué-Madias & Devine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.electrolyteCorrection || 'Калькулятор коррекции электролитов'}
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          {t.electrolyteCorrectionDesc || 'Комплексный калькулятор для точного расчета дефицита или избытка калия, натрия, магния и кальция с учетом массы тела, возраста и альбумина.'}
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
              {t.patientAndElectrolyteParams || 'Patient & Electrolyte Parameters'}
            </h2>
          </div>
          <Button onClick={resetCalculator} variant="outline" size="xs" className="text-slate-400 hover:text-white">
            {t.reset || 'Сбросить'}
          </Button>
        </div>

        {/* Row 1: Electrolyte & Correction Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            label={t.selectElectrolyte || 'Выберите электролит'}
            value={inputs.electrolyteType}
            onChange={(value) => setInputs({ ...inputs, electrolyteType: value as ElectrolyteType })}
            options={getElectrolyteOptions()}
            required
          />
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t.correctionTypeLabel || 'Correction Type'}
            </label>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setInputs({ ...inputs, correctionType: 'hypo' })}
                className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  inputs.correctionType === 'hypo'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{t.hypoDeficit || 'Hypo (Deficit)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setInputs({ ...inputs, correctionType: 'hyper' })}
                className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  inputs.correctionType === 'hyper'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{t.hyperExcess || 'Hyper (Excess)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Level, Weight, Age, Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumberInput
            label={`${t.currentLevel || 'Текущий уровень'} (${norms.min}-${norms.max} ${norms.unit})`}
            value={inputs.currentLevel}
            onChange={(value) => setInputs({ ...inputs, currentLevel: value })}
            min={norms.min * 0.5}
            max={norms.max * 2}
            step={0.1}
            unit={norms.unit}
            required
          />
          <NumberInput
            label={t.patientWeight || 'Вес пациента'}
            value={inputs.weight}
            onChange={(value) => setInputs({ ...inputs, weight: value })}
            min={20}
            max={200}
            step={0.5}
            unit={t.kg || 'кг'}
            required
          />
          <NumberInput
            label={`${t.patientAge || 'Age'} (${t.yearsUnit || 'years'})`}
            value={inputs.age}
            onChange={(value) => setInputs({ ...inputs, age: value })}
            min={0}
            max={120}
            step={1}
            unit={t.yearsUnit || 'years'}
            required
          />
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t.genderLabel || 'Gender'}
            </label>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setInputs({ ...inputs, gender: 'male' })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  inputs.gender === 'male'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MaleIcon />
                <span>{t.maleShort || 'Male'}</span>
              </button>
              <button
                type="button"
                onClick={() => setInputs({ ...inputs, gender: 'female' })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  inputs.gender === 'female'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FemaleIcon />
                <span>{t.femaleShort || 'Female'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conditional Calcium/Magnesium Albumin input */}
        {(inputs.electrolyteType === 'calcium' || inputs.electrolyteType === 'magnesium') && (
          <div className="w-full sm:w-1/2 lg:w-1/4">
            <NumberInput
              label={t.albumin || 'Альбумин'}
              value={inputs.albumin}
              onChange={(value) => setInputs({ ...inputs, albumin: value })}
              min={10}
              max={60}
              step={1}
              unit="г/л"
            />
          </div>
        )}

        {/* Hyperkalemia Additional Toggles */}
        {inputs.electrolyteType === 'potassium' && inputs.correctionType === 'hyper' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <Checkbox
              id="hasEcgChanges"
              checked={inputs.hasEcgChanges}
              onChange={(checked) => setInputs({ ...inputs, hasEcgChanges: checked })}
            >
              {t.hasEcgChanges || 'Изменения на ЭКГ'}
            </Checkbox>
            <Checkbox
              id="hasSymptoms"
              checked={inputs.hasSymptoms}
              onChange={(checked) => setInputs({ ...inputs, hasSymptoms: checked })}
            >
              {t.hasSymptoms || 'Клинические симптомы'}
            </Checkbox>
            <Select
              label={t.renalFunction || 'Почечная функция'}
              value={inputs.renalFunction}
              onChange={(value) => setInputs({ ...inputs, renalFunction: value as 'normal' | 'mild' | 'moderate' | 'severe' })}
              options={getRenalFunctionOptions()}
            />
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button onClick={calculateCorrection} variant="primary" size="lg" className="px-8 font-semibold shadow-md">
            {t.calculate || 'Рассчитать дозы'}
          </Button>
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      {result && (
        <div className="space-y-8 animate-slide-up">
          {/* Section 2: Calculated Metrics */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
                2
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {t.calculatedMetricsTitle || 'Calculated Correction Metrics'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.correctedLevel && (
                <StatCard
                  label={t.correctedLevel || 'Скорректированный уровень'}
                  value={result.correctedLevel.toFixed(2)}
                  unit={norms.unit}
                  status="normal"
                />
              )}
              
              {result.deficit && (
                <StatCard
                  label={t.deficit || 'Дефицит электролита'}
                  value={(Math.round(result.deficit * 100) / 100).toFixed(1)}
                  unit={t.mmol || 'ммоль'}
                  status="warning"
                  description={
                    <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded-md border border-slate-800 inline-block">
                      {inputs.electrolyteType === 'potassium' && `${Math.round(result.deficit * 39.1)} мг элементарного K+`}
                      {inputs.electrolyteType === 'sodium' && `${Math.round(result.deficit * 23)} мг элементарного Na+`}
                      {inputs.electrolyteType === 'magnesium' && `${Math.round(result.deficit * 24.3)} мг элементарного Mg2+`}
                      {inputs.electrolyteType === 'calcium' && `${Math.round(result.deficit * 40.1)} мг элементарного Ca2+`}
                    </div>
                  }
                />
              )}

              {result.excess && (
                <StatCard
                  label={t.excess || 'Избыток электролита'}
                  value={(Math.round(result.excess * 100) / 100).toFixed(1)}
                  unit={t.mmol || 'ммоль'}
                  status="critical"
                />
              )}
            </div>
          </div>

          {/* Section 3: Recommended Doses */}
          {result.recommendedDoses.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
                  3
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {t.recommendedDoses || 'Рекомендуемые дозы препаратов'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {result.recommendedDoses.map((dose, index) => (
                  <div 
                    key={index} 
                    className="bg-[#101828] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-700/80 transition-all"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-white text-base tracking-tight">{dose.medication}</span>
                      <Badge variant={dose.route === 'IV' ? 'brand' : 'success'} className="font-mono">
                        {dose.route}
                      </Badge>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                        {t.calculatedDoseLabel || 'Calculated Dose'}
                      </span>
                      <div className="text-2xl font-bold font-mono text-white tracking-tight">
                        {dose.dose}{' '}
                        <span className="text-xs font-normal text-slate-400">{dose.unit}</span>
                      </div>
                    </div>

                    {dose.frequency && (
                      <div className="text-xs font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 p-2.5 rounded-xl flex items-center gap-2">
                        <span className="shrink-0 font-bold">⏱</span>
                        <span>{dose.frequency}</span>
                      </div>
                    )}

                    {dose.notes && (
                      <div className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3 flex items-start gap-2">
                        <InfoIcon />
                        <span>{dose.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Emergency Actions */}
          {result.emergencyActions && result.emergencyActions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-rose-400 tracking-tight flex items-center gap-2">
                <span>🚨</span> {t.emergencyActions || 'Неотложные мероприятия'}
              </h3>
              {result.emergencyActions.map((action, index) => (
                <Alert key={index} variant="error" title={t.emergencyActions || "Неотложная помощь"}>
                  {action}
                </Alert>
              ))}
            </div>
          )}

          {/* Section 5: Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-amber-400 tracking-tight flex items-center gap-2">
                <span>⚠️</span> {t.warnings || 'Предостережения'}
              </h3>
              {result.warnings.map((warning, index) => (
                <Alert key={index} variant="warning" title={t.warnings || "Предостережение"}>
                  {warning}
                </Alert>
              ))}
            </div>
          )}

          {/* Section 6: Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
                  4
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {t.recommendations || 'Рекомендации по ведению'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className="bg-[#101828] border border-slate-800/80 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-300 shadow-xs"
                  >
                    <CheckIcon />
                    <span className="leading-relaxed">{rec}</span>
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