'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Checkbox } from '@/components/Checkbox';
import { Button } from '@/components/Button';
import { AntibioticProphylaxisInputs, AntibioticProphylaxisResult } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { antibioticOptions } from '@/i18n/antibioticOptions';

export const AntibioticProphylaxisCalculator: React.FC = () => {
  const { t, language } = useLanguage();
  const options = antibioticOptions[language];
  const [inputs, setInputs] = useState<AntibioticProphylaxisInputs>({
    // Шаг 1: Первичная оценка
    woundType: 'clean',
    woundLocation: 'other',
    contaminationType: 'none',
    
    // Шаг 2: Факторы пациента
    patientAge: 45,
    patientWeight: 70,
    hasDiabetes: false,
    hasImmunodeficiency: false,
    hasVascularDisease: false,
    hasMalnutrition: false,
    timeFromInjury: 2,
    
    // Шаг 3: Аллергии и функции
    hasAllergies: false,
    allergies: [],
    renalFunction: 'normal',
    
    // Дополнительные параметры
    surgeryDuration: 60,
    isDelayedClosure: false,
  });

  const [result, setResult] = useState<AntibioticProphylaxisResult | null>(null);

  const calculateProphylaxis = () => {
    // Проверяем, что все необходимые поля заполнены
    if (inputs.patientAge === null || inputs.patientWeight === null || 
        inputs.timeFromInjury === null || inputs.surgeryDuration === null) {
      alert(t.pleaseFillAllFields);
      return;
    }

    const riskDomains: string[] = [];
    const notes: string[] = [];
    const warnings: string[] = [];
    let immediateIndication = false;
    let isAntibioticNeeded = false;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Шаг 1: Проверка немедленных показаний
    if (inputs.woundType === 'open-fracture') {
      immediateIndication = true;
      isAntibioticNeeded = true;
      riskLevel = 'high';
      notes.push('Открытый перелом - немедленное назначение антибиотиков');
    }

    if (inputs.woundType === 'gunshot') {
      immediateIndication = true;
      isAntibioticNeeded = true;
      riskLevel = 'high';
      notes.push('Огнестрельное ранение - антибиотикотерапия, а не профилактика');
    }

    if (inputs.timeFromInjury > 6) {
      immediateIndication = true;
      isAntibioticNeeded = true;
      riskLevel = 'high';
      notes.push(`Позднее обращение (${inputs.timeFromInjury} часов) - высокий риск инфицирования`);
    }

    if (inputs.contaminationType === 'feces' || inputs.contaminationType === 'soil') {
      immediateIndication = true;
      isAntibioticNeeded = true;
      riskLevel = 'high';
      notes.push('Грубая контаминация - немедленное назначение антибиотиков');
    }

    // Шаг 2: Оценка доменов риска (если нет немедленных показаний)
    if (!immediateIndication) {
      // Домен A: Вид и степень загрязнения
      if (inputs.contaminationType !== 'none') {
        riskDomains.push('Домен A: Загрязнение');
      }

      // Домен B: Анатомическое место
      if (['hand-foot', 'face', 'perineum', 'groin', 'armpit', 'joint', 'bone'].includes(inputs.woundLocation)) {
        riskDomains.push('Домен B: Анатомическое расположение');
      }

      // Домен C: Факторы пациента
      if (inputs.patientAge >= 65) {
        riskDomains.push('Домен C: Возраст ≥65 лет');
      }
      if (inputs.hasDiabetes) {
        riskDomains.push('Домен C: Сахарный диабет');
      }
      if (inputs.hasImmunodeficiency) {
        riskDomains.push('Домен C: Иммунодефицит');
      }
      if (inputs.hasVascularDisease) {
        riskDomains.push('Домен C: Сосудистая болезнь');
      }
      if (inputs.hasMalnutrition) {
        riskDomains.push('Домен C: Недостаточность питания');
      }

      // Принятие решения на основе доменов
      if (riskDomains.length === 0) {
        isAntibioticNeeded = false;
        riskLevel = 'low';
        notes.push('0 доменов высокого риска - антибиотик обычно не обязателен');
      } else if (riskDomains.length === 1) {
        isAntibioticNeeded = false; // клиническое усмотрение
        riskLevel = 'medium';
        notes.push('1 домен высокого риска - клиническое усмотрение');
      } else {
        isAntibioticNeeded = true;
        riskLevel = 'high';
        notes.push(`${riskDomains.length} домена высокого риска - антибиотик необходим`);
      }
    }

    // Шаг 3: Выбор схемы антибиотикопрофилактики
    let recommendedAntibiotic = '';
    let dose = 0;
    let frequency = '';
    let duration = '';
    let route = '';
    let additionalDoses = 0;

    if (isAntibioticNeeded) {
      const hasBetaLactamAllergy = inputs.hasAllergies && inputs.allergies.includes('beta-lactam');
      
      switch (inputs.woundType) {
        case 'clean':
          if (hasBetaLactamAllergy) {
            recommendedAntibiotic = 'Клиндамицин';
            dose = 600;
            frequency = 'Однократно';
            route = 'Внутривенно';
          } else {
            recommendedAntibiotic = 'Цефазолин';
            dose = 1000;
            frequency = 'Однократно';
            route = 'Внутривенно';
          }
          duration = '≤24 часов';
          break;

        case 'open-fracture':
          if (hasBetaLactamAllergy) {
            recommendedAntibiotic = 'Клиндамицин';
            dose = 600;
            frequency = 'Каждые 8 часов';
            route = 'Внутривенно';
            additionalDoses = 2;
          } else {
            recommendedAntibiotic = 'Цефазолин';
            dose = 1000;
            frequency = 'Каждые 8 часов';
            route = 'Внутривенно';
            additionalDoses = 2;
          }
          duration = '48-72 часа';
          break;

        case 'contaminated':
        case 'crush':
          if (hasBetaLactamAllergy) {
            recommendedAntibiotic = 'Пиперациллин/Тазобактам';
            dose = 4000;
            frequency = 'Каждые 6 часов';
            route = 'Внутривенно';
            additionalDoses = 3;
          } else {
            recommendedAntibiotic = 'Цефазолин + Гентамицин';
            dose = 1000;
            frequency = 'Цефазолин каждые 8 часов, Гентамицин 5 мг/кг однократно';
            route = 'Внутривенно';
            additionalDoses = 2;
          }
          duration = '48-72 часа';
          break;

        case 'bite':
          if (hasBetaLactamAllergy) {
            recommendedAntibiotic = 'Клиндамицин + ТМП/СМХ';
            dose = 450;
            frequency = 'Клиндамицин 4 раза в день, ТМП/СМХ 2 раза в день';
            route = 'Перорально';
            additionalDoses = 4;
          } else {
            recommendedAntibiotic = 'Амоксициллин-клавуланат';
            dose = 875;
            frequency = '2 раза в день';
            route = 'Перорально';
            additionalDoses = 2;
          }
          duration = '3-5 дней';
          break;

        case 'water-fresh':
          recommendedAntibiotic = 'Ципрофлоксацин';
          dose = 500;
          frequency = '2 раза в сутки';
          route = 'Перорально/внутривенно';
          additionalDoses = 2;
          duration = '3-5 дней';
          break;

        case 'water-salt':
          recommendedAntibiotic = 'Доксициклин + Цефтриаксон';
          dose = 100;
          frequency = 'Доксициклин 2 раза в день, Цефтриаксон 1 раз в сутки';
          route = 'Перорально/внутривенно';
          additionalDoses = 2;
          duration = '3-5 дней';
          break;

        case 'gunshot':
          recommendedAntibiotic = 'Цефазолин';
          dose = 2000;
          frequency = '3-4 раза в сутки';
          route = 'Внутривенно';
          additionalDoses = 3;
          duration = '24 часа';
          break;

        case 'abdominal':
          recommendedAntibiotic = 'Цефазолин + Метронидазол';
          dose = 1000;
          frequency = 'Каждые 8 часов';
          route = 'Внутривенно';
          additionalDoses = 2;
          duration = '24 часа';
          break;

        case 'farm':
          recommendedAntibiotic = 'Цефазолин + Гентамицин + Пенициллин G';
          dose = 1000;
          frequency = 'Цефазолин каждые 8 часов, Гентамицин 5 мг/кг однократно, Пенициллин G 2 млн ЕД 4 раза в день';
          route = 'Внутривенно';
          additionalDoses = 3;
          duration = '48-72 часа';
          break;

        default:
          recommendedAntibiotic = 'Цефазолин';
          dose = 1000;
          frequency = 'Однократно';
          route = 'Внутривенно';
          duration = '≤24 часов';
      }

      // Коррекция дозы по весу
      if (inputs.patientWeight > 100) {
        dose = Math.round(dose * (inputs.patientWeight / 70));
        notes.push(`Коррекция дозы по весу пациента (${inputs.patientWeight} кг)`);
      }

      // Коррекция дозы по функции почек
      if (inputs.renalFunction !== 'normal') {
        const renalCorrection = {
          mild: 0.8,
          moderate: 0.6,
          severe: 0.4,
        };
        dose = Math.round(dose * renalCorrection[inputs.renalFunction]);
        notes.push(`Коррекция дозы при ${options.renalFunctionOptions.find(opt => opt.value === inputs.renalFunction)?.label.toLowerCase()}`);
      }

      // Дополнительные дозы при длительных операциях
      if (inputs.surgeryDuration > 120) {
        additionalDoses += 1;
        notes.push('Дополнительная доза при операции более 2 часов');
      }

      // Дополнительные дозы при отсроченном закрытии
      if (inputs.isDelayedClosure) {
        additionalDoses += 1;
        notes.push('Дополнительная доза при отсроченном закрытии раны');
      }
    }

    // Предупреждения
    warnings.push('Антибиотики являются дополнением, а не заменой тщательной хирургической обработки раны');
    warnings.push('Профилактика столбняка является ОБЯЗАТЕЛЬНОЙ и НЕ ЗАМЕНЯЕТСЯ антибиотиками');
    warnings.push('Антибиотик должен быть введен не позднее 60 минут до начала хирургической обработки');
    
    if (inputs.timeFromInjury > 6) {
      warnings.push('Позднее обращение - рассмотрите переход на терапевтический режим');
    }

    setResult({
      isAntibioticNeeded,
      recommendedAntibiotic,
      dose,
      frequency,
      duration,
      route,
      additionalDoses,
      riskDomains,
      riskLevel,
      immediateIndication,
      notes,
      warnings,
    });
  };

  const resetCalculator = () => {
    setInputs({
      woundType: 'clean',
      woundLocation: 'other',
      contaminationType: 'none',
      patientAge: 45,
      patientWeight: 70,
      hasDiabetes: false,
      hasImmunodeficiency: false,
      hasVascularDisease: false,
      hasMalnutrition: false,
      timeFromInjury: 2,
      hasAllergies: false,
      allergies: [],
      renalFunction: 'normal',
      surgeryDuration: 60,
      isDelayedClosure: false,
    });
    setResult(null);
  };

  return (
    <Card 
      title="Калькулятор антибиотикопрофилактики ран" 
      subtitle="Алгоритм принятия решения о назначении антибиотикопрофилактики"
      className="max-w-4xl mx-auto"
    >
      <div className="space-y-6">
        {/* Шаг 1: Первичная оценка */}
        <div className="p-4 bg-accent/20 rounded-lg border border-accent/30">
                      <h3 className="text-lg font-semibold text-accent-foreground mb-4">{t.step1WoundAssessment}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Select
               label={t.woundType}
               value={inputs.woundType}
               onChange={(value) => setInputs({ ...inputs, woundType: value as 'clean' | 'open-fracture' | 'contaminated' | 'bite' | 'water-fresh' | 'water-salt' | 'gunshot' | 'abdominal' | 'crush' | 'farm' })}
               options={options.woundTypeOptions}
               required
             />
             <Select
               label={t.woundLocation}
               value={inputs.woundLocation}
               onChange={(value) => setInputs({ ...inputs, woundLocation: value as 'hand-foot' | 'face' | 'perineum' | 'groin' | 'armpit' | 'joint' | 'bone' | 'other' })}
               options={options.woundLocationOptions}
               required
             />
             <Select
               label="Тип загрязнения"
               value={inputs.contaminationType}
               onChange={(value) => setInputs({ ...inputs, contaminationType: value as 'none' | 'soil' | 'feces' | 'saliva' | 'foreign-body' | 'high-energy' | 'crush-injury' })}
               options={options.contaminationTypeOptions}
               required
             />
            <NumberInput
              label={t.timeFromInjury}
              value={inputs.timeFromInjury}
              onChange={(value) => setInputs({ ...inputs, timeFromInjury: value })}
              min={0}
              max={72}
              step={0.5}
              unit="часов"
              required
            />
          </div>
        </div>

        {/* Шаг 2: Факторы пациента */}
        <div className="p-4 bg-accent/20 rounded-lg border border-accent/30">
                      <h3 className="text-lg font-semibold text-accent-foreground mb-4">{t.step2PatientFactors}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberInput
              label={t.patientAge}
              value={inputs.patientAge}
              onChange={(value) => setInputs({ ...inputs, patientAge: value })}
              min={0}
              max={120}
              step={1}
              unit="лет"
              required
            />
            <NumberInput
              label={t.patientWeight}
              value={inputs.patientWeight}
              onChange={(value) => setInputs({ ...inputs, patientWeight: value })}
              min={20}
              max={200}
              step={0.5}
              unit="кг"
              required
            />
                         <Select
               label={t.renalFunction}
               value={inputs.renalFunction}
               onChange={(value) => setInputs({ ...inputs, renalFunction: value as 'normal' | 'mild' | 'moderate' | 'severe' })}
               options={options.renalFunctionOptions}
               required
             />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Checkbox
              id="hasDiabetes"
              checked={inputs.hasDiabetes}
              onChange={(checked) => setInputs({ ...inputs, hasDiabetes: checked })}
            >
              {t.hasDiabetes}
            </Checkbox>
            <Checkbox
              id="hasImmunodeficiency"
              checked={inputs.hasImmunodeficiency}
              onChange={(checked) => setInputs({ ...inputs, hasImmunodeficiency: checked })}
            >
              {t.hasImmunodeficiency}
            </Checkbox>
            <Checkbox
              id="hasVascularDisease"
              checked={inputs.hasVascularDisease}
              onChange={(checked) => setInputs({ ...inputs, hasVascularDisease: checked })}
            >
              Сосудистая болезнь
            </Checkbox>
            <Checkbox
              id="hasMalnutrition"
              checked={inputs.hasMalnutrition}
              onChange={(checked) => setInputs({ ...inputs, hasMalnutrition: checked })}
            >
              Недостаточность питания
            </Checkbox>
          </div>
        </div>

        {/* Шаг 3: Аллергии и дополнительные параметры */}
        <div className="p-4 bg-accent/20 rounded-lg border border-accent/30">
                      <h3 className="text-lg font-semibold text-accent-foreground mb-4">{t.step3AllergiesAndAdditional}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              id="hasAllergies"
              checked={inputs.hasAllergies}
              onChange={(checked) => setInputs({ ...inputs, hasAllergies: checked })}
            >
              Аллергия на β-лактамы
            </Checkbox>
            <Checkbox
              id="isDelayedClosure"
              checked={inputs.isDelayedClosure}
              onChange={(checked) => setInputs({ ...inputs, isDelayedClosure: checked })}
            >
              Отсроченное закрытие раны
            </Checkbox>
            <NumberInput
              label={t.surgeryDuration}
              value={inputs.surgeryDuration}
              onChange={(value) => setInputs({ ...inputs, surgeryDuration: value })}
              min={15}
              max={480}
              step={15}
              unit="минут"
              required
            />
          </div>
        </div>

        <div className="flex space-x-4">
                      <Button onClick={calculateProphylaxis} variant="primary">
              {t.calculate}
            </Button>
            <Button onClick={resetCalculator} variant="outline">
              {t.reset}
            </Button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent/30">
            <h3 className="text-lg font-semibold text-accent-foreground mb-4">
              Результаты оценки
            </h3>
            
            {/* Основной результат */}
            <div className="mb-4 p-3 bg-card rounded border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-card-foreground">Необходимость антибиотиков:</span>
                <span className={`font-bold ${result.isAntibioticNeeded ? 'text-red-500' : 'text-green-500'}`}>
                  {result.isAntibioticNeeded ? 'НЕОБХОДИМЫ' : 'НЕ ОБЯЗАТЕЛЬНЫ'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-card-foreground">Уровень риска:</span>
                <span className={`font-bold ${
                  result.riskLevel === 'high' ? 'text-red-500' : 
                  result.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {result.riskLevel === 'high' ? 'ВЫСОКИЙ' : 
                   result.riskLevel === 'medium' ? 'СРЕДНИЙ' : 'НИЗКИЙ'}
                </span>
              </div>
            </div>

            {/* Домены риска */}
            {result.riskDomains.length > 0 && (
              <div className="mb-4 p-3 bg-card rounded border border-border">
                <h4 className="font-medium text-card-foreground mb-2">Домены высокого риска:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {result.riskDomains.map((domain, index) => (
                    <li key={index}>• {domain}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Рекомендации по антибиотикам */}
            {result.isAntibioticNeeded && (
              <div className="mb-4 p-3 bg-card rounded border border-border">
                <h4 className="font-medium text-card-foreground mb-2">Рекомендации по антибиотикам:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t.medication}:</span>
                    <span className="font-medium">{result.recommendedAntibiotic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Доза:</span>
                    <span className="font-medium">{result.dose} мг</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Частота:</span>
                    <span className="font-medium">{result.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Путь введения:</span>
                    <span className="font-medium">{result.route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Длительность:</span>
                    <span className="font-medium">{result.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Дополнительные дозы:</span>
                    <span className="font-medium">{result.additionalDoses}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Примечания */}
            {result.notes.length > 0 && (
              <div className="mb-4 p-3 bg-card rounded border border-border">
                <h4 className="font-medium text-card-foreground mb-2">Примечания:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {result.notes.map((note, index) => (
                    <li key={index}>• {note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Предупреждения */}
            <div className="p-3 bg-red-900/20 rounded border border-red-500/30">
              <h4 className="font-medium text-red-400 mb-2">⚠️ Важные предупреждения:</h4>
              <ul className="text-xs text-red-300 space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}; 