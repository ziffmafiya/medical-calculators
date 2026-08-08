'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Checkbox } from '@/components/Checkbox';
import { Alert } from '@/components/Alert';
import { Badge } from '@/components/Badge';
import { StatCard } from '@/components/StatCard';
import { useLanguage } from '@/i18n/LanguageContext';

interface BloodGasData {
  ph: number | null;
  pco2: number | null;
  hco3: number | null;
  pao2: number | null;
  na: number | null;
  cl: number | null;
  k: number | null;
  sampleType: 'arterial' | 'venous';
  albumin: number | null;
  includeK: boolean;
  fio2: number | null;
  age: number | null;
  glucose: number | null;
  bun: number | null;
  ethanol: number | null;
  urineNa: number | null;
  urineK: number | null;
  urineCl: number | null;
  hemoglobin: number | null;
  oxygenSaturation: number | null;
}

interface BloodGasResult {
  anionGap: number;
  anionGapCorrected: number | null;
  expectedPaCO2Winter: number;
  expectedPaCO2Metabolic: number;
  deltaDelta: number | null;
  pao2Status: string;
  oxygenationIndex?: number;
  totalCO2: number;
  baseExcess: number;
  hydrogenIon: number;
  aaGradient: number | null;
  expectedAaGradient?: number;
  osmolarGap: number | null;
  urineAnionGap: number | null;
  internalConsistency: {
    isValid: boolean;
    hydrogenIon: number;
    expectedHydrogenIon: number;
    deviation: number;
  };
  interpretation: {
    primaryDisorder: string;
    compensation: string;
    mixedDisorder: boolean;
    mixedDisorderExplanation: string;
    anionGapStatus: string;
    deltaDeltaInterpretation: string;
    reasoning: string[];
    warnings: string[];
    osmolarGapStatus: string;
    urineAnionGapStatus: string;
    chronicity: string;
  };
  treatmentAdvice: {
    detectedDisorders: string[];
    specificAdvice: Array<{
      disorder: string;
      advice: string[];
      warnings?: string[];
      critical?: boolean;
    }>;
    generalPrinciples: string[];
  };
}

export const BloodGasAnalysisCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<BloodGasData>({
    ph: 7.4,
    pco2: 40,
    hco3: 24,
    pao2: 100,
    na: 140,
    cl: 104,
    k: 4.0,
    sampleType: 'arterial',
    albumin: 4.0,
    includeK: false,
    fio2: 0.21,
    age: 30,
    glucose: 100,
    bun: 15,
    ethanol: 0,
    urineNa: 50,
    urineK: 20,
    urineCl: 60,
    hemoglobin: 14.0,
    oxygenSaturation: 0.98,
  });

  const [result, setResult] = useState<BloodGasResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof BloodGasData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateAnionGap = (na: number | null, cl: number | null, hco3: number | null, k?: number | null, includeK: boolean = false): number => {
    if (na === null || cl === null || hco3 === null) return 0;
    if (includeK && k !== undefined && k !== null) {
      return na - (cl + hco3 + k);
    }
    return na - (cl + hco3);
  };

  const calculateExpectedPaCO2Winter = (hco3: number | null): number => {
    if (hco3 === null) return 0;
    return 1.5 * hco3 + 8;
  };

  const calculateExpectedPaCO2Metabolic = (hco3: number | null): number => {
    if (hco3 === null) return 0;
    return 0.7 * hco3 + 20;
  };

  const calculateDeltaDelta = (anionGap: number, hco3: number | null): number | null => {
    if (hco3 === null) return null;
    const normalAG = 12;
    const normalHCO3 = 24;
    const denominator = normalHCO3 - hco3;
    if (Math.abs(denominator) < 0.1) return null;
    return (anionGap - normalAG) / denominator;
  };

  const calculateCorrectedAnionGap = (anionGap: number, albumin: number | null): number => {
    if (albumin === null) return anionGap;
    const albuminGdL = albumin / 10;
    return anionGap + 2.5 * (4.0 - albuminGdL);
  };

  const analyzePaO2 = (pao2: number | null, fio2: number = 0.21): { status: string; oxygenationIndex?: number } => {
    if (pao2 === null) return { status: 'PaO2 N/A' };
    const oxygenationIndex = fio2 > 0 ? pao2 / fio2 : undefined;
    if (pao2 < 60) {
      return { status: t.severeHypoxemia || 'Severe Hypoxemia (PaO2 < 60 mmHg)', oxygenationIndex };
    } else if (pao2 < 80) {
      return { status: t.moderateHypoxemia || 'Moderate Hypoxemia (PaO2 60-80 mmHg)', oxygenationIndex };
    } else if (pao2 <= 100) {
      return { status: t.normalOxygenation || 'Normal Oxygenation (PaO2 80-100 mmHg)', oxygenationIndex };
    } else {
      return { status: t.hyperoxemia || 'Hyperoxemia (PaO2 > 100 mmHg)', oxygenationIndex };
    }
  };

  const handleCalculate = () => {
    if (data.ph === null || data.pco2 === null || data.hco3 === null || data.na === null || data.cl === null) {
      alert(t.pleaseFillAllFields);
      return;
    }

    const anionGap = calculateAnionGap(data.na, data.cl, data.hco3, data.k, data.includeK);
    const anionGapCorrected = calculateCorrectedAnionGap(anionGap, data.albumin);
    const expectedPaCO2Winter = calculateExpectedPaCO2Winter(data.hco3);
    const expectedPaCO2Metabolic = calculateExpectedPaCO2Metabolic(data.hco3);
    const deltaDelta = calculateDeltaDelta(anionGapCorrected || anionGap, data.hco3);
    const pao2Analysis = analyzePaO2(data.pao2, data.fio2 || 0.21);
    
    const hydrogenIon = Math.pow(10, -data.ph) * 1e9; // nM
    const expectedHydrogenIon = 24 * (data.pco2 / data.hco3);
    const deviation = Math.abs(hydrogenIon - expectedHydrogenIon);
    const isValid = deviation < 5;

    let primaryDisorder = t.normalAcidBase || 'Normal Acid-Base Balance';
    let compensation = '';
    let mixedDisorder = false;
    let mixedDisorderExplanation = '';
    let anionGapStatus = t.normalAnionGapStatus || 'Normal Anion Gap (8-16)';
    let deltaDeltaInterpretation = '';
    let chronicity = '';
    const reasoning: string[] = [];
    const warnings: string[] = [];

    if (data.ph < 7.35) {
      if (data.pco2 > 45) {
        primaryDisorder = t.respiratoryAcidosis || 'Respiratory Acidosis';
        if (data.hco3 > 26) {
          compensation = t.partialMetabolicCompensation || 'Partial Metabolic Compensation';
        } else {
          compensation = t.uncompensatedAcute || 'Uncompensated (Acute)';
        }
      } else if (data.hco3 < 22) {
        primaryDisorder = t.metabolicAcidosis || 'Metabolic Acidosis';
        if (Math.abs(data.pco2 - expectedPaCO2Winter) <= 2) {
          compensation = t.adequateRespiratoryCompensation || 'Adequate Respiratory Compensation (Winter\'s Formula)';
        } else if (data.pco2 < expectedPaCO2Winter - 2) {
          mixedDisorder = true;
          mixedDisorderExplanation = t.coexistingRespAlkalosis || 'Coexisting Respiratory Alkalosis';
        } else {
          mixedDisorder = true;
          mixedDisorderExplanation = t.coexistingRespAcidosis || 'Coexisting Respiratory Acidosis';
        }
      }
    } else if (data.ph > 7.45) {
      if (data.pco2 < 35) {
        primaryDisorder = t.respiratoryAlkalosis || 'Respiratory Alkalosis';
        if (data.hco3 < 22) {
          compensation = t.partialMetabolicCompensation || 'Partial Metabolic Compensation';
        }
      } else if (data.hco3 > 26) {
        primaryDisorder = t.metabolicAlkalosis || 'Metabolic Alkalosis';
        if (Math.abs(data.pco2 - expectedPaCO2Metabolic) <= 1.5) {
          compensation = t.adequateRespiratoryCompensation || 'Adequate Respiratory Compensation';
        }
      }
    }

    if (anionGapCorrected > 16) {
      anionGapStatus = t.highAnionGapHagma || 'High Anion Gap Metabolic Acidosis (HAGMA)';
    } else if (anionGapCorrected < 8) {
      anionGapStatus = t.lowAnionGapStatus || 'Low Anion Gap';
    }

    if (deltaDelta !== null) {
      if (deltaDelta < 0.8) {
        deltaDeltaInterpretation = t.combinationHagmaNagma || 'Combination of HAGMA and NAGMA';
      } else if (deltaDelta <= 2.0) {
        deltaDeltaInterpretation = t.pureHagma || 'Pure HAGMA';
      } else {
        deltaDeltaInterpretation = t.combinationHagmaMetAlkalosis || 'Combination of HAGMA and Metabolic Alkalosis';
      }
    }

    const detectedDisorders: string[] = [primaryDisorder];
    if (mixedDisorder) detectedDisorders.push(mixedDisorderExplanation);
    if (anionGapCorrected > 16) detectedDisorders.push('Высокий анионный интервал (HAGMA)');

    const treatmentAdvice = {
      detectedDisorders,
      specificAdvice: [
        {
          disorder: primaryDisorder,
          advice: [
            'Устраните первопричину нарушения (гипоксия, сепсис, шок, интоксикация).',
            'Обеспечьте адекватную вентиляцию и оксигенацию.',
            'Контролируйте электролиты крови каждые 2-4 часа.'
          ],
          critical: data.ph < 7.1 || data.ph > 7.6
        }
      ],
      generalPrinciples: [
        'Лечите пациента, а не только показатели газов крови.',
        'Корректируйте гиповолемию изотоническими растворами.',
        'Избегайте рутинного введения соды без показаний (pH < 7.1).'
      ]
    };

    setResult({
      anionGap,
      anionGapCorrected,
      expectedPaCO2Winter,
      expectedPaCO2Metabolic,
      deltaDelta,
      pao2Status: pao2Analysis.status,
      oxygenationIndex: pao2Analysis.oxygenationIndex,
      totalCO2: data.hco3 + (data.pco2 * 0.0307),
      baseExcess: (1 - 0.0143 * (data.hemoglobin || 14)) * ((0.0304 * data.pco2 * Math.pow(10, data.ph - 6.1) - 24.26) + (9.5 + 1.63 * (data.hemoglobin || 14)) * (data.ph - 7.4)),
      hydrogenIon,
      aaGradient: (150 - (data.pco2 / 0.8)) - (data.pao2 || 0),
      osmolarGap: null,
      urineAnionGap: (data.urineNa || 0) + (data.urineK || 0) - (data.urineCl || 0),
      internalConsistency: {
        isValid,
        hydrogenIon,
        expectedHydrogenIon,
        deviation,
      },
      interpretation: {
        primaryDisorder,
        compensation,
        mixedDisorder,
        mixedDisorderExplanation,
        anionGapStatus,
        deltaDeltaInterpretation,
        reasoning,
        warnings,
        osmolarGapStatus: 'Норма',
        urineAnionGapStatus: (data.urineNa || 0) + (data.urineK || 0) - (data.urineCl || 0) > 0 ? 'Положительный UAG' : 'Отрицательный UAG',
        chronicity,
      },
      treatmentAdvice,
    });
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="brand" dot className="px-3 py-1 text-xs uppercase tracking-wider font-semibold">
            Пульмонология & Реанимация
          </Badge>
          <span className="text-xs text-slate-500 font-mono">Winter / Henderson-Hasselbalch</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.bloodGasTitle || 'Анализ газов крови и кислотно-основного состояния'}
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          {t.bloodGasSubtitle || 'Комплексная интерпретация артериальных газов, анионного промежутка, Δ/Δ, ожидаемого PaCO2, осмолярного промежутка и клинических рекомендаций.'}
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
              Параметры артериальной / венозной пробы
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumberInput label="pH" value={data.ph} onChange={(val) => handleInputChange('ph', val)} min={6.8} max={8.0} step={0.01} precision={2} required />
          <NumberInput label="PaCO2 (mmHg)" value={data.pco2} onChange={(val) => handleInputChange('pco2', val)} min={15} max={120} step={0.1} precision={1} required />
          <NumberInput label="HCO3- (mmol/L)" value={data.hco3} onChange={(val) => handleInputChange('hco3', val)} min={5} max={60} step={0.1} precision={1} required />
          <NumberInput label="PaO2 (mmHg)" value={data.pao2} onChange={(val) => handleInputChange('pao2', val)} min={20} max={300} step={1} precision={0} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumberInput label="Na+ (mmol/L)" value={data.na} onChange={(val) => handleInputChange('na', val)} min={100} max={180} step={1} precision={0} required />
          <NumberInput label="Cl- (mmol/L)" value={data.cl} onChange={(val) => handleInputChange('cl', val)} min={70} max={140} step={1} precision={0} required />
          <NumberInput label="K+ (mmol/L)" value={data.k} onChange={(val) => handleInputChange('k', val)} min={1.5} max={8.5} step={0.1} precision={1} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select 
            label={t.sampleTypeLabel || 'Тип образца'} 
            value={data.sampleType} 
            onChange={(val) => handleInputChange('sampleType', val)} 
            options={[
              { value: 'arterial', label: t.arterialSample || 'Артериальная кровь' }, 
              { value: 'venous', label: t.venousSample || 'Венозная кровь' }
            ]} 
          />
          <div className="flex items-center pt-6">
            <Checkbox id="includeK" checked={data.includeK} onChange={(checked) => handleInputChange('includeK', checked)}>
              Включить K+ в расчет анионного промежутка (AG)
            </Checkbox>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/60">
          <Button onClick={() => setShowAdvanced(!showAdvanced)} variant="outline" size="sm" className="w-full text-slate-300">
            {showAdvanced ? 'Скрыть дополнительные параметры (Альбумин, FiO2, Моча)' : 'Показать дополнительные параметры (Альбумин, FiO2, Глюкоза, Моча)'}
          </Button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
              <NumberInput label="Альбумин (г/л)" value={data.albumin} onChange={(val) => handleInputChange('albumin', val)} min={10} max={60} step={1} helperText="Для коррекции AG" />
              <NumberInput label="FiO2 (0.21-1.0)" value={data.fio2} onChange={(val) => handleInputChange('fio2', val)} min={0.21} max={1.0} step={0.01} helperText="Фракция O2 во вдохе" />
              <NumberInput label="Возраст (лет)" value={data.age} onChange={(val) => handleInputChange('age', val)} min={1} max={120} step={1} helperText="Для А-а градиента" />
              <NumberInput label="Глюкоза (мг/дл)" value={data.glucose} onChange={(val) => handleInputChange('glucose', val)} min={30} max={1000} step={1} helperText="Для осмолярности" />
              <NumberInput label="BUN (мг/дл)" value={data.bun} onChange={(val) => handleInputChange('bun', val)} min={1} max={150} step={1} helperText="Азот мочевины" />
              <NumberInput label="Моча Na+ (мЭкв/л)" value={data.urineNa} onChange={(val) => handleInputChange('urineNa', val)} min={0} max={200} step={1} helperText="Для NAGMA" />
              <NumberInput label="Моча K+ (мЭкв/л)" value={data.urineK} onChange={(val) => handleInputChange('urineK', val)} min={0} max={200} step={1} helperText="Для NAGMA" />
              <NumberInput label="Моча Cl- (мЭкв/л)" value={data.urineCl} onChange={(val) => handleInputChange('urineCl', val)} min={0} max={200} step={1} helperText="Для NAGMA" />
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={handleCalculate} variant="primary" size="lg" className="px-8 font-semibold shadow-md">
            {t.calculate || 'Рассчитать показатели'}
          </Button>
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      {result && (
        <div className="space-y-8 animate-slide-up">
          {/* Section 2: Main Interpretation Cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
                2
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Интерпретация газов крови
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label={t.primaryDisorderLabel || 'Основное нарушение'} value={result.interpretation.primaryDisorder} status="critical" />
              {result.interpretation.compensation && (
                <StatCard label={t.compensationLabel || 'Компенсация'} value={result.interpretation.compensation} status="warning" />
              )}
              <StatCard label={t.anionGapStatusLabel || 'Анионный промежуток (AG)'} value={`${result.anionGap.toFixed(1)} mmol/L`} sublabel={result.interpretation.anionGapStatus} status="normal" />
              {result.deltaDelta !== null && (
                <StatCard label={t.deltaDeltaLabel || 'Δ/Δ Соотношение'} value={result.deltaDelta.toFixed(2)} sublabel={result.interpretation.deltaDeltaInterpretation} status="normal" />
              )}
              <StatCard label="PaO2 Оксигенация" value={result.pao2Status} status="normal" />
              <StatCard label="Избыток оснований (BE)" value={`${result.baseExcess.toFixed(1)} mmol/L`} sublabel="Zander-van Slyke" status="normal" />
            </div>
          </div>

          {/* Section 3: Treatment Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
                3
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {t.treatmentAdviceLabel || 'Рекомендации по тактике лечения'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {result.treatmentAdvice.specificAdvice.map((item, idx) => (
                <div key={idx} className="bg-[#101828] border border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">{item.disorder}</h3>
                    {item.critical && <Badge variant="error">КРИТИЧЕСКИ</Badge>}
                  </div>
                  <ul className="space-y-2">
                    {item.advice.map((adv, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-sky-400 font-bold">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
