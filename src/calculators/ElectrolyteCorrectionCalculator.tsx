'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Checkbox } from '@/components/Checkbox';
import { Button } from '@/components/Button';
import { 
  ElectrolyteCorrectionInputs, 
  ElectrolyteCorrectionResult, 
  ElectrolyteType, 
  CorrectionType,
  RecommendedDose 
} from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

export const ElectrolyteCorrectionCalculator: React.FC = () => {
  const { t } = useLanguage();
     const [inputs, setInputs] = useState<ElectrolyteCorrectionInputs>({
     electrolyteType: 'potassium',
     correctionType: 'hypo',
     currentLevel: 3.0,
     weight: 70,
     albumin: 40, // г/л вместо г/дл
     hasEcgChanges: false,
     hasSymptoms: false,
     renalFunction: 'normal',
     age: 30, // возраст пациента по умолчанию
     gender: 'male', // пол пациента по умолчанию
   });

  const [result, setResult] = useState<ElectrolyteCorrectionResult | null>(null);

     // Константы для нормальных значений электролитов
   const ELECTROLYTE_NORMS = {
     potassium: { min: 3.5, max: 5.0, unit: 'mmol/L', target: 4.5 },
     sodium: { min: 135, max: 145, unit: 'mmol/L', target: 140 },
     magnesium: { min: 0.7, max: 0.9, unit: 'mmol/L', target: 0.8 }, // переведено из мг/дл в ммоль/л
     calcium: { min: 2.1, max: 2.6, unit: 'mmol/L', target: 2.35 }, // переведено из мг/дл в ммоль/л
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

         // Коррекция для альбумина (кальций и магний)
     // Альбумин вводится в г/л, но формула использует г/дл, поэтому делим на 10
     if (inputs.electrolyteType === 'calcium' && inputs.albumin) {
       correctedLevel = inputs.currentLevel + 0.8 * (40 - inputs.albumin); // 40 г/л = 4.0 г/дл
     } else if (inputs.electrolyteType === 'magnesium' && inputs.albumin) {
       correctedLevel = inputs.currentLevel + 0.005 * (40 - inputs.albumin); // 40 г/л = 4.0 г/дл
     } else {
       correctedLevel = inputs.currentLevel;
     }

    if (inputs.correctionType === 'hypo') {
      // Расчет дефицита
      deficit = (norms.target - correctedLevel) * 0.2 * inputs.weight;
      
      // Рекомендации по коррекции гипо
      switch (inputs.electrolyteType) {
                 case 'potassium':
           const asparkamDose = (deficit * 39.1) / 10.33;
           const kclDose = (deficit * 39.1) / 75;
           
           // Расчет скорости инфузии (мл/час) - только для KCl
           const kclInfusionRate = Math.round(kclDose / 24); // за 24 часа
           
                       // Расчет пероральной дозы Аспаркама
            // 1 таблетка = 175 мг калия аспарагината ≈ 12.12 мг элементарного калия
            // Биодоступность ~90%, поэтому для компенсации дефицита нужно больше
            // Исправляем расчет: делим на количество мг в таблетке, а не на 1000
            const oralAsparkamDose = Math.ceil((deficit * 39.1) / (12.12 * 0.9)); // в таблетках
            
            recommendedDoses = [
              {
                medication: 'Asparkam 10%',
                dose: Math.round(asparkamDose * 10) / 10,
                unit: 'ml',
                route: 'IV',
                frequency: `${t.infusion24Hours}`,
                notes: `${t.maxSpeed} 20 ${t.mmol}/час. ${t.infusion24Hours}. Развести в 100-200 мл 0.9% NaCl для безболезненного введения.`,
              },
              {
                medication: 'KCl 7.5%',
                dose: Math.round(kclDose * 10) / 10,
                unit: 'ml',
                route: 'IV',
                frequency: `${kclInfusionRate} ${t.ml}/час`,
                notes: `${t.alternativeToAsparkam}. ${t.infusion24Hours}. Развести в 100-200 мл 0.9% NaCl для безболезненного введения.`,
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

                 case 'sodium':
           // Новый алгоритм коррекции гипонатриемии
           // Добавляем поля для возраста и пола в inputs
           const patientAge = inputs.age || 30; // возраст пациента
           const patientGender = inputs.gender || 'male'; // пол пациента
           
           // Определяем коэффициент K в зависимости от возраста и пола
           let coefficientK = 0.6; // по умолчанию
           if (patientAge >= 0 && patientAge <= 17) {
             coefficientK = 0.6; // для обоих полов
           } else if (patientAge >= 18 && patientAge <= 59) {
             coefficientK = patientGender === 'male' ? 0.6 : 0.5;
           } else if (patientAge >= 60) {
             coefficientK = patientGender === 'male' ? 0.5 : 0.45;
           }
           
           // Расчет дефицита натрия по формуле: DNa = K * W * (NaT - NaP)
           const targetSodium = 140; // целевой уровень натрия (ммоль/л)
           const currentSodium = inputs.currentLevel || 0; // текущий уровень натрия пациента
           const sodiumDeficit = coefficientK * inputs.weight * (targetSodium - currentSodium);
           
           // Концентрации натрия в растворах (ммоль/л)
           const nacl3PercentConcentration = 513; // 3% NaCl
           const nacl09PercentConcentration = 153.9; // 0.9% NaCl
           const nacl045PercentConcentration = 76.95; // 0.45% NaCl
           const ringerLactateConcentration = 129.3; // Рингер-лактат
           
           // Расчет объемов растворов для коррекции
           const nacl3PercentVolume = Math.round((sodiumDeficit / nacl3PercentConcentration) * 1000 * 10) / 10; // мл
           const nacl09PercentVolume = Math.round((sodiumDeficit / nacl09PercentConcentration) * 1000 * 10) / 10; // мл
           const nacl045PercentVolume = Math.round((sodiumDeficit / nacl045PercentConcentration) * 1000 * 10) / 10; // мл
           const ringerLactateVolume = Math.round((sodiumDeficit / ringerLactateConcentration) * 1000 * 10) / 10; // мл
           
           // Расчет скорости вливания с учетом максимальной скорости 0.5 ммоль/л/ч
           const maxCorrectionRate = 0.5; // ммоль/л/ч
           const timeToTarget = Math.max(24, Math.ceil((targetSodium - currentSodium) / maxCorrectionRate)); // часы
           
           // Скорости вливания (мл/час)
           const nacl3PercentRate = Math.round(nacl3PercentVolume / timeToTarget);
           const nacl09PercentRate = Math.round(nacl09PercentVolume / timeToTarget);
           const nacl045PercentRate = Math.round(nacl045PercentVolume / timeToTarget);
           const ringerLactateRate = Math.round(ringerLactateVolume / timeToTarget);
           
           // Округляем объемы до практичных значений (кратно 50 мл)
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
               notes: `Физиологический раствор. Безопасная коррекция со скоростью не более ${maxCorrectionRate} ммоль/л/ч. Время коррекции: ${timeToTarget} часов.`,
             },
             {
               medication: 'NaCl 3%',
               dose: nacl3PercentPractical,
               unit: 'ml',
               route: 'IV',
               frequency: `${Math.round(nacl3PercentPractical / timeToTarget)} ${t.ml}/час`,
               notes: `Гипертонический раствор. Требует осторожности! Скорость не более ${maxCorrectionRate} ммоль/л/ч. Время коррекции: ${timeToTarget} часов.`,
             },
             {
               medication: 'NaCl 0.45%',
               dose: nacl045PercentPractical,
               unit: 'ml',
               route: 'IV',
               frequency: `${Math.round(nacl045PercentPractical / timeToTarget)} ${t.ml}/час`,
               notes: `Гипотонический раствор. Медленная коррекция. Скорость не более ${maxCorrectionRate} ммоль/л/ч. Время коррекции: ${timeToTarget} часов.`,
             },
             {
               medication: 'Рингер-лактат',
               dose: ringerLactatePractical,
               unit: 'ml',
               route: 'IV',
               frequency: `${Math.round(ringerLactatePractical / timeToTarget)} ${t.ml}/час`,
               notes: `Сбалансированный раствор. Скорость не более ${maxCorrectionRate} ммоль/л/ч. Время коррекции: ${timeToTarget} часов.`,
             },
           ];
           
           recommendations = [
             `Безопасная скорость коррекции: не более ${maxCorrectionRate} ммоль/л/ч`,
             `Время коррекции: ${timeToTarget} часов`,
             `Коэффициент K = ${coefficientK} (возраст: ${patientAge} лет, пол: ${patientGender === 'male' ? 'мужской' : 'женский'})`,
             'Начинать с 0.9% NaCl для медленной и безопасной коррекции',
             'При тяжелой гипонатриемии (< 120 ммоль/л) рассмотреть 3% NaCl',
             'Мониторинг натрия каждые 2-4 часа во время коррекции',
             'При появлении неврологических симптомов - немедленно прекратить коррекцию',
           ];
          break;

                 case 'magnesium':
           const magnesiumDeficit = (0.8 - correctedLevel) * 0.3 * inputs.weight; // целевой уровень 0.8 ммоль/л
           const mgso4Dose = Math.round(magnesiumDeficit * 10) / 10;
           const mgso4InfusionRate = Math.round(mgso4Dose / 24); // мл/час за 24 часа
           
                       recommendedDoses = [
              {
                medication: 'MgSO4 25%',
                dose: mgso4Dose,
                unit: 'ml',
                route: 'IV',
                frequency: `${mgso4InfusionRate} ${t.ml}/час`,
                notes: `${t.maxSpeed1gHour}. ${t.infusion24Hours}. Развести в 100-200 мл 0.9% NaCl для безболезненного введения.`,
              },
            ];
           recommendations = [
             t.tendonReflexes,
             `${t.monitorMagnesium} ${t.every6to12Hours}`,
           ];
          break;

                 case 'calcium':
           const calciumDeficit = (2.35 - correctedLevel) * 0.3 * inputs.weight; // целевой уровень 2.35 ммоль/л
           const caGluconateDose = Math.round(calciumDeficit * 10) / 10;
           const caGluconateInfusionRate = Math.round(caGluconateDose / 24); // мл/час за 24 часа
           
                       recommendedDoses = [
              {
                medication: 'Ca gluconate 10%',
                dose: caGluconateDose,
                unit: 'ml',
                route: 'IV',
                frequency: `${caGluconateInfusionRate} ${t.ml}/час`,
                notes: `${t.maxSpeed10mEqHour}. ${t.infusion24Hours}. Развести в 100-200 мл 0.9% NaCl для безболезненного введения.`,
              },
            ];
           recommendations = [
             `${t.monitorECG} ${t.severeHypocalcemia}`,
             `${t.monitorCalcium} ${t.every4to6Hours}`,
           ];
          break;
      }
    } else {
      // Расчет избытка для гипер
      excess = (correctedLevel - norms.target) * 0.2 * inputs.weight;
      
      // Рекомендации по коррекции гипер
      switch (inputs.electrolyteType) {
        case 'potassium':
                     if (inputs.hasEcgChanges || inputs.currentLevel > 6.5) {
             emergencyActions = [
               `Кальция глюконат 10% 10-20 мл IV (${t.membraneStabilization}) - развести в 50-100 мл 0.9% NaCl`,
               t.insulinGlucose,
               `${t.sodiumBicarbonate} (${t.acidosis})`,
               `${t.salbutamol} ${t.inhaled}`,
             ];
           }
           recommendedDoses = [
             {
               medication: t.furosemide,
               dose: 20,
               unit: 'mg',
               route: 'IV',
               notes: t.preservedKidneyFunction,
             },
           ];
           recommendations = [
             t.continuousECG,
             t.monitorPotassiumEvery,
             t.considerHemodialysis,
           ];
          break;

                 case 'sodium':
           recommendedDoses = [
             {
               medication: t.dextrose5,
               dose: 1000,
               unit: 'ml',
               route: 'IV',
               notes: `${t.slowCorrection} не более 8-12 ${t.mmol}/л/сутки`,
             },
           ];
           recommendations = [
             `${t.slowCorrection} для предотвращения ${t.osmoticDemyelination}`,
             `${t.monitorSodium} каждые 4-6 часов`,
           ];
          break;

                 case 'magnesium':
           recommendedDoses = [
             {
               medication: 'Кальция глюконат 10%',
               dose: 10,
               unit: 'ml',
               route: 'IV',
               notes: `${t.magnesiumAntagonist}. Развести в 50-100 мл 0.9% NaCl для безболезненного введения.`,
             },
             {
               medication: t.furosemide,
               dose: 20,
               unit: 'mg',
               route: 'IV',
               notes: t.enhanceExcretion,
             },
           ];
           recommendations = [
             t.tendonReflexes,
             `${t.monitorMagnesium} ${t.every6to12Hours}`,
             t.considerHemodialysisMagnesium,
           ];
          break;

                 case 'calcium':
           recommendedDoses = [
             {
               medication: t.calcitonin,
               dose: 4,
               unit: 'units/kg',
               route: 'SC',
               notes: t.every12Hours,
             },
             {
               medication: t.zoledronicAcid,
               dose: 4,
               unit: 'mg',
               route: 'IV',
               notes: t.infusion60Minutes,
             },
           ];
           recommendations = [
             `${t.hydration} ${t.physiologicalSolution}`,
             `${t.monitorCalcium} ${t.every4to6Hours}`,
             t.monitorKidneyFunction,
           ];
          break;
      }
    }

         // Общие предупреждения
     if (inputs.electrolyteType === 'potassium' && inputs.currentLevel > 6.0) {
       warnings.push(`${t.severeHyperkalemia} - ${t.emergencyCare}`);
     }
     if (inputs.electrolyteType === 'sodium' && Math.abs(inputs.currentLevel - 140) > 15) {
       warnings.push(`${t.significantSodiumDeviation} - ${t.carefulCorrection}`);
     }

    setResult({
      correctedLevel: Math.round(correctedLevel * 100) / 100,
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
       albumin: 40, // г/л вместо г/дл
       hasEcgChanges: false,
       hasSymptoms: false,
       renalFunction: 'normal',
       age: 30, // возраст пациента по умолчанию
       gender: 'male', // пол пациента по умолчанию
     });
     setResult(null);
   };

  const getElectrolyteOptions = () => [
    { value: 'potassium', label: t.electrolytePotassium },
    { value: 'sodium', label: t.electrolyteSodium },
    { value: 'magnesium', label: t.electrolyteMagnesium },
    { value: 'calcium', label: t.electrolyteCalcium },
  ];

  const getCorrectionTypeOptions = () => [
    { value: 'hypo', label: t.correctionHypo },
    { value: 'hyper', label: t.correctionHyper },
  ];

  const getRenalFunctionOptions = () => [
    { value: 'normal', label: t.normal },
    { value: 'mild', label: t.mild },
    { value: 'moderate', label: t.moderate },
    { value: 'severe', label: t.severe },
  ];

  const norms = ELECTROLYTE_NORMS[inputs.electrolyteType];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Card 
        title={t.electrolyteCorrection} 
        subtitle={t.electrolyteCorrectionDesc}
        className="w-full glass-panel border-slate-800 text-white"
      >
        <div className="space-y-6">
          {/* Выбор электролита и типа коррекции */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Select
              label={t.selectElectrolyte}
              value={inputs.electrolyteType}
              onChange={(value) => setInputs({ ...inputs, electrolyteType: value as ElectrolyteType })}
              options={getElectrolyteOptions()}
              required
            />
            <Select
              label={t.selectCorrectionType}
              value={inputs.correctionType}
              onChange={(value) => setInputs({ ...inputs, correctionType: value as CorrectionType })}
              options={getCorrectionTypeOptions()}
              required
            />
          </div>

          {/* Основные параметры */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <NumberInput
              label={`${t.currentLevel} (${norms.min}-${norms.max} ${norms.unit})`}
              value={inputs.currentLevel}
              onChange={(value) => setInputs({ ...inputs, currentLevel: value })}
              min={norms.min * 0.5}
              max={norms.max * 2}
              step={0.1}
              unit={norms.unit}
              required
            />
            <NumberInput
              label={t.patientWeight}
              value={inputs.weight}
              onChange={(value) => setInputs({ ...inputs, weight: value })}
              min={20}
              max={200}
              step={0.5}
              unit={t.kg}
              required
            />
            <NumberInput
              label="Возраст (лет)"
              value={inputs.age}
              onChange={(value) => setInputs({ ...inputs, age: value })}
              min={0}
              max={120}
              step={1}
              unit="лет"
              required
            />
            <Select
              label="Пол"
              value={inputs.gender}
              onChange={(value) => setInputs({ ...inputs, gender: value as 'male' | 'female' })}
              options={[
                { value: 'male', label: 'Мужской (♂)' },
                { value: 'female', label: 'Женский (♀)' },
              ]}
              required
            />
            {(inputs.electrolyteType === 'calcium' || inputs.electrolyteType === 'magnesium') && (
              <NumberInput
                label={t.albumin}
                value={inputs.albumin}
                onChange={(value) => setInputs({ ...inputs, albumin: value })}
                min={10}
                max={60}
                step={1}
                unit="г/л"
              />
            )}
          </div>

          {/* Дополнительные параметры для гиперкалиемии */}
          {inputs.electrolyteType === 'potassium' && inputs.correctionType === 'hyper' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <Checkbox
                id="hasEcgChanges"
                checked={inputs.hasEcgChanges}
                onChange={(checked) => setInputs({ ...inputs, hasEcgChanges: checked })}
              >
                {t.hasEcgChanges}
              </Checkbox>
              <Checkbox
                id="hasSymptoms"
                checked={inputs.hasSymptoms}
                onChange={(checked) => setInputs({ ...inputs, hasSymptoms: checked })}
              >
                {t.hasSymptoms}
              </Checkbox>
              <Select
                label={t.renalFunction}
                value={inputs.renalFunction}
                onChange={(value) => setInputs({ ...inputs, renalFunction: value as 'normal' | 'mild' | 'moderate' | 'severe' })}
                options={getRenalFunctionOptions()}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button onClick={calculateCorrection} variant="primary" size="lg" className="w-full sm:w-auto px-8">
              {t.calculate}
            </Button>
            <Button onClick={resetCalculator} variant="outline" size="lg" className="w-full sm:w-auto px-8">
              {t.reset}
            </Button>
          </div>

                 {result && (
           <div className="mt-8 space-y-6">
             {/* Основные результаты */}
             <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
               <h3 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-8 text-center">
                 📊 {t.calculationResults}
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {result.correctedLevel && (
                   <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                     <div className="text-center">
                       <div className="text-lg text-slate-300 font-medium mb-2">{t.correctedLevel}</div>
                       <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.correctedLevel}</div>
                       <div className="text-sm text-slate-400 mt-2">{norms.unit}</div>
                     </div>
                   </div>
                 )}
                 {result.deficit && (
                   <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                     <div className="text-center">
                       <div className="text-lg text-slate-300 font-medium mb-2">{t.deficit}</div>
                       <div className="text-3xl lg:text-4xl font-bold text-slate-100">{Math.round(result.deficit * 100) / 100}</div>
                       <div className="text-sm text-slate-400 mt-2">{t.mmol}</div>
                       {/* Добавляем отображение в мг вещества */}
                       {inputs.electrolyteType === 'potassium' && (
                         <div className="text-xs text-slate-500 mt-1">
                           {Math.round(result.deficit * 39.1)} мг K+
                         </div>
                       )}
                       {inputs.electrolyteType === 'sodium' && (
                         <div className="text-xs text-slate-500 mt-1">
                           {Math.round(result.deficit * 23)} мг Na+
                         </div>
                       )}
                       {inputs.electrolyteType === 'magnesium' && (
                         <div className="text-xs text-slate-500 mt-1">
                           {Math.round(result.deficit * 24.3)} мг Mg2+
                         </div>
                       )}
                       {inputs.electrolyteType === 'calcium' && (
                         <div className="text-xs text-slate-500 mt-1">
                           {Math.round(result.deficit * 40.1)} мг Ca2+
                         </div>
                       )}
                       {/* Добавляем отображение коэффициента K для натрия */}
                       {inputs.electrolyteType === 'sodium' && (
                         <div className="text-xs text-slate-400 mt-2 border-t border-slate-600 pt-2">
                           Коэффициент K = {inputs.age && inputs.age <= 17 ? 0.6 : inputs.age && inputs.age <= 59 ? (inputs.gender === 'male' ? 0.6 : 0.5) : (inputs.gender === 'male' ? 0.5 : 0.45)}
                         </div>
                       )}
                     </div>
                   </div>
                 )}
                 {result.excess && (
                   <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                     <div className="text-center">
                       <div className="text-lg text-slate-300 font-medium mb-2">{t.excess}</div>
                       <div className="text-3xl lg:text-4xl font-bold text-slate-100">{Math.round(result.excess * 100) / 100}</div>
                       <div className="text-sm text-slate-400 mt-2">{t.mmol}</div>
                     </div>
                   </div>
                 )}
               </div>
             </div>

                         {/* Рекомендуемые дозы */}
             {result.recommendedDoses.length > 0 && (
               <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
                 <h4 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-6 text-center">
                   💊 {t.recommendedDoses}
                 </h4>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {result.recommendedDoses.map((dose, index) => (
                     <div key={index} className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md hover:shadow-lg transition-shadow">
                       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                         <span className="font-bold text-slate-100 text-xl mb-2 sm:mb-0">{dose.medication}</span>
                         <span className="text-sm bg-slate-800 text-slate-200 px-3 py-1 rounded-full font-medium self-start">
                           {dose.route}
                         </span>
                       </div>
                       <div className="text-center mb-4">
                         <div className="text-3xl lg:text-4xl font-bold text-slate-200">{dose.dose}</div>
                         <div className="text-lg text-slate-300">{dose.unit}</div>
                       </div>
                       {dose.frequency && (
                         <div className="text-base text-slate-200 bg-slate-800 p-3 rounded-lg mb-3 text-center">
                           <span className="font-medium">⏱️ {dose.frequency}</span>
                         </div>
                       )}
                       {dose.notes && (
                         <div className="text-sm text-slate-300 bg-slate-800 p-3 rounded-lg border-l-4 border-slate-600">
                           <span className="font-medium">💡 </span>{dose.notes}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}

                         {/* Неотложные действия */}
             {result.emergencyActions && result.emergencyActions.length > 0 && (
               <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
                 <h4 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-6 text-center">
                   🚨 {t.emergencyActions}
                 </h4>
                 <div className="space-y-4">
                   {result.emergencyActions.map((action, index) => (
                     <div key={index} className="bg-slate-900 p-4 rounded-xl border border-slate-600 shadow-md">
                       <div className="flex items-start">
                         <span className="text-slate-400 mr-4 text-xl">⚡</span>
                         <span className="text-base text-slate-200 font-medium">{action}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Рекомендации */}
             {result.recommendations.length > 0 && (
               <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
                 <h4 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-6 text-center">
                   📋 {t.recommendations}
                 </h4>
                 <div className="space-y-4">
                   {result.recommendations.map((rec, index) => (
                     <div key={index} className="bg-slate-900 p-4 rounded-xl border border-slate-600 shadow-md">
                       <div className="flex items-start">
                         <span className="text-slate-400 mr-4 text-xl">✓</span>
                         <span className="text-base text-slate-200">{rec}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Предупреждения */}
             {result.warnings.length > 0 && (
               <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
                 <h4 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-6 text-center">
                   ⚠️ {t.warnings}
                 </h4>
                 <div className="space-y-4">
                   {result.warnings.map((warning, index) => (
                     <div key={index} className="bg-slate-900 p-4 rounded-xl border border-slate-600 shadow-md">
                       <div className="flex items-start">
                         <span className="text-slate-400 mr-4 text-xl">⚠</span>
                         <span className="text-base text-slate-200 font-medium">{warning}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        )}
      </div>
    </Card>
  </div>
);
};