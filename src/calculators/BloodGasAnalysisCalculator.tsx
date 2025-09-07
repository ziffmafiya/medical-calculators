import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NumberInput } from '../components/NumberInput';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';

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
  // Новые поля согласно алгоритму
  glucose: number | null; // Для расчета осмолярного промежутка
  bun: number | null; // Азот мочевины крови для осмолярного промежутка
  ethanol: number | null; // Этанол для осмолярного промежутка
  // Мочевые показатели для NAGMA
  urineNa: number | null;
  urineK: number | null;
  urineCl: number | null;
  // Поля для расчета BE по формуле Zander-van Slyke
  hemoglobin: number | null; // Концентрация гемоглобина (g/dL)
  oxygenSaturation: number | null; // Насыщение кислородом (0.0-1.0)
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
  // Новые расчеты согласно алгоритму
  osmolarGap: number | null; // Осмолярный промежуток
  urineAnionGap: number | null; // Мочевой анионный промежуток для NAGMA
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
    // Новые поля интерпретации
    osmolarGapStatus: string;
    urineAnionGapStatus: string;
    chronicity: string; // Острое/хроническое нарушение
  };
  // Добавляем поле для советов по лечению
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

// Константы нормальных значений
const NORMAL_VALUES = {
  ph: { min: 7.35, max: 7.45, unit: '' },
  pco2: { min: 35, max: 45, unit: 'mmHg' },
  hco3: { min: 22, max: 26, unit: 'mmol/L' },
  pao2: { min: 80, max: 100, unit: 'mmHg' },
  na: { min: 135, max: 145, unit: 'mmol/L' },
  cl: { min: 96, max: 106, unit: 'mmol/L' },
  k: { min: 3.5, max: 5.0, unit: 'mmol/L' },
  anionGap: { min: 8, max: 16, unit: 'mmol/L' },
  hemoglobin: { min: 12.0, max: 16.0, unit: 'g/dL' },
  oxygenSaturation: { min: 0.95, max: 1.0, unit: '' },
};

export const BloodGasAnalysisCalculator: React.FC = () => {
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
    // Новые поля согласно алгоритму
    glucose: 100,
    bun: 15,
    ethanol: 0,
    urineNa: 50,
    urineK: 20,
    urineCl: 60,
    // Поля для расчета BE по формуле Zander-van Slyke
    hemoglobin: 14.0,
    oxygenSaturation: 0.98,
  });

  const [result, setResult] = useState<BloodGasResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDecisionLogic, setShowDecisionLogic] = useState(false);

  // Calculate anion gap
  const calculateAnionGap = (na: number | null, cl: number | null, hco3: number | null, k?: number | null, includeK: boolean = false): number => {
    if (na === null || cl === null || hco3 === null) {
      return 0;
    }
    
    if (includeK && k !== undefined && k !== null) {
      return na - (cl + hco3 + k);
    }
    return na - (cl + hco3);
  };

  // Calculate expected PaCO2 using Winter's formula
  const calculateExpectedPaCO2Winter = (hco3: number | null): number => {
    if (hco3 === null) return 0;
    return 1.5 * hco3 + 8;
  };

  // Calculate expected PaCO2 for metabolic alkalosis
  const calculateExpectedPaCO2Metabolic = (hco3: number | null): number => {
    if (hco3 === null) return 0;
    return 0.7 * hco3 + 20;
  };

  // Calculate delta/delta ratio
  const calculateDeltaDelta = (anionGap: number, hco3: number | null): number | null => {
    if (hco3 === null) return null;
    
    const normalAG = 12;
    const normalHCO3 = 24;
    const denominator = normalHCO3 - hco3;
    
    if (Math.abs(denominator) < 0.1) {
      return null;
    }
    
    return (anionGap - normalAG) / denominator;
  };

  // Calculate corrected anion gap for hypoalbuminemia
  const calculateCorrectedAnionGap = (anionGap: number, albumin: number | null): number => {
    if (albumin === null) return anionGap;
    
    // Convert g/L to g/dL (divide by 10)
    const albuminGdL = albumin / 10;
    return anionGap + 2.5 * (4.0 - albuminGdL);
  };

  // Analyze PaO2 status
  const analyzePaO2 = (pao2: number | null, fio2: number = 0.21): { status: string; oxygenationIndex?: number } => {
    if (pao2 === null) return { status: 'PaO2 не указан' };
    
    const oxygenationIndex = fio2 > 0 ? pao2 / fio2 : undefined;
    
    if (pao2 < 60) {
      return { 
        status: 'Тяжелая гипоксемия (PaO2 < 60 mmHg)', 
        oxygenationIndex 
      };
    } else if (pao2 < 80) {
      return { 
        status: 'Умеренная гипоксемия (PaO2 60-80 mmHg)', 
        oxygenationIndex 
      };
    } else if (pao2 <= 100) {
      return { 
        status: 'Нормальная оксигенация (PaO2 80-100 mmHg)', 
        oxygenationIndex 
      };
    } else if (pao2 <= 120) {
      return { 
        status: 'Легкая гипероксемия (PaO2 100-120 mmHg)', 
        oxygenationIndex 
      };
    } else {
      return { 
        status: 'Гипероксемия (PaO2 > 120 mmHg)', 
        oxygenationIndex 
      };
    }
  };

  // Calculate Total CO2
  const calculateTotalCO2 = (hco3: number | null, pco2: number | null): number => {
    if (hco3 === null || pco2 === null) return 0;
    return hco3 + (pco2 * 0.0307); // HCO3 + (PCO2 * 0.0307)
  };

  // Calculate Base Excess using Zander-van Slyke formula
  const calculateBaseExcess = (
    ph: number | null, 
    pco2: number | null, 
    hemoglobin: number | null, 
    oxygenSaturation: number | null
  ): number => {
    if (ph === null || pco2 === null || hemoglobin === null || oxygenSaturation === null) return 0;
    
    // BE = (1 – 0.0143 × cHb) × [[0.0304 × PaCO₂ × 10^(pH – 6.1) – 24.26] + (9.5 + 1.63 × cHb) × (pH – 7.4)] – 0.2 × cHb × (1 – sO₂)
    
    const cHb = hemoglobin; // Концентрация гемоглобина в g/dL
    const sO2 = oxygenSaturation; // Насыщение кислородом (0.0-1.0)
    const PaCO2 = pco2; // Парциальное давление CO2 в mmHg
    
    // Первая часть: (1 – 0.0143 × cHb)
    const firstPart = 1 - 0.0143 * cHb;
    
    // Вторая часть: [0.0304 × PaCO₂ × 10^(pH – 6.1) – 24.26]
    const secondPart = 0.0304 * PaCO2 * Math.pow(10, ph - 6.1) - 24.26;
    
    // Третья часть: (9.5 + 1.63 × cHb) × (pH – 7.4)
    const thirdPart = (9.5 + 1.63 * cHb) * (ph - 7.4);
    
    // Четвертая часть: 0.2 × cHb × (1 – sO₂)
    const fourthPart = 0.2 * cHb * (1 - sO2);
    
    // Итоговый расчет
    const baseExcess = firstPart * (secondPart + thirdPart) - fourthPart;
    
    // Проверка на корректность результата
    if (isNaN(baseExcess) || !isFinite(baseExcess)) {
      return 0;
    }
    
    return baseExcess;
  };

  // Calculate Hydrogen Ion
  const calculateHydrogenIon = (ph: number | null): number => {
    if (ph === null) return 0;
    // [H+] = 10^(-pH) in mol/L, convert to nM (nanomolar)
    return Math.pow(10, -ph) * 1e9;
  };

  // Calculate A-a O2 Gradient
  const calculateAaGradient = (pao2: number | null, fio2: number = 0.21, ph: number | null, pco2: number | null, age: number | null): number | null => {
    if (pao2 === null || fio2 === null || ph === null || pco2 === null || age === null) return null;

    const expectedPaO2 = 100 * (fio2 * 100 + (1 - fio2) * 20); // Expected PaO2 based on FiO2

    const aaGradient = pao2 - expectedPaO2;
    return aaGradient;
  };

  // Новые функции согласно алгоритму
  
  // Проверка внутренней согласованности по уравнению Гендерсона-Гассельбаха
  const checkInternalConsistency = (ph: number | null, pco2: number | null, hco3: number | null) => {
    if (ph === null || pco2 === null || hco3 === null) {
      return {
        isValid: false,
        hydrogenIon: 0,
        expectedHydrogenIon: 0,
        deviation: 0,
      };
    }

    // [H+] = (24 × PaCO2) / HCO3
    const calculatedHydrogenIon = (24 * pco2) / hco3;
    
    // Конвертируем pH в [H+]: [H+] = 10^(-pH) × 10^9 nM
    const expectedHydrogenIon = Math.pow(10, -ph) * 1e9;
    
    // Проверяем согласованность (допустимое отклонение ±10%)
    const deviation = Math.abs(calculatedHydrogenIon - expectedHydrogenIon) / expectedHydrogenIon;
    const isValid = deviation <= 0.1;

    return {
      isValid,
      hydrogenIon: calculatedHydrogenIon,
      expectedHydrogenIon,
      deviation,
    };
  };

  // Расчет осмолярного промежутка
  const calculateOsmolarGap = (na: number | null, glucose: number | null, bun: number | null, ethanol: number | null) => {
    if (na === null || glucose === null || bun === null || ethanol === null) {
      return null;
    }

    // Рассчитанная осмолярность = 2×Na + глюкоза/18 + BUN/2.8 + этанол/4.6
    const calculatedOsmolarity = 2 * na + glucose / 18 + bun / 2.8 + ethanol / 4.6;
    
    // Нормальная осмолярность = 275-295 mOsm/kg
    const normalOsmolarity = 285; // среднее значение
    
    const osmolarGap = calculatedOsmolarity - normalOsmolarity;
    return osmolarGap;
  };

  // Расчет мочевого анионного промежутка для NAGMA
  const calculateUrineAnionGap = (urineNa: number | null, urineK: number | null, urineCl: number | null) => {
    if (urineNa === null || urineK === null || urineCl === null) {
      return null;
    }

    // Мочевой анионный промежуток = Na + K - Cl
    const urineAnionGap = urineNa + urineK - urineCl;
    return urineAnionGap;
  };

  // Interpret acid-base status with detailed reasoning
  const interpretAcidBaseStatus = (data: BloodGasData, result: BloodGasResult): BloodGasResult['interpretation'] => {
    const warnings: string[] = [];
    const reasoning: string[] = [];
    
    // Check sample type warnings
    if (data.sampleType === 'venous') {
      warnings.push('Внимание: Венозная кровь - pH обычно ниже, PCO2 выше артериальных значений');
      reasoning.push('Образец венозной крови выбран. Венозная кровь имеет систематические отличия от артериальной: pH обычно на 0.02-0.04 ниже, PCO2 на 3-8 mmHg выше.');
    }

    // Проверка внутренней согласованности по уравнению Гендерсона-Гассельбаха
    const consistency = checkInternalConsistency(data.ph, data.pco2, data.hco3);
    if (!consistency.isValid) {
      warnings.push('Внимание: АБГ может быть недействительным - нарушена внутренняя согласованность');
      reasoning.push(`Проверка внутренней согласованности: [H+] = (24 × ${data.pco2}) / ${data.hco3} = ${consistency.hydrogenIon.toFixed(1)} nM`);
      reasoning.push(`Ожидаемый [H+] из pH ${data.ph} = ${consistency.expectedHydrogenIon.toFixed(1)} nM`);
      reasoning.push(`Отклонение = ${(consistency.deviation * 100).toFixed(1)}% > 10% → АБГ может быть недействительным`);
    } else {
      reasoning.push(`Проверка внутренней согласованности: [H+] = (24 × ${data.pco2}) / ${data.hco3} = ${consistency.hydrogenIon.toFixed(1)} nM`);
      reasoning.push(`Ожидаемый [H+] из pH ${data.ph} = ${consistency.expectedHydrogenIon.toFixed(1)} nM`);
      reasoning.push(`Отклонение = ${(consistency.deviation * 100).toFixed(1)}% ≤ 10% → АБГ внутренне согласован`);
    }

    // Информация о новом методе расчета BE
    if (data.hemoglobin !== null && data.oxygenSaturation !== null) {
      reasoning.push(`BE рассчитан по формуле Zander-van Slyke с учетом гемоглобина (${data.hemoglobin} г/дл) и насыщения O2 (${(data.oxygenSaturation * 100).toFixed(1)}%)`);
      reasoning.push('Формула Zander-van Slyke: BE = (1 – 0.0143 × cHb) × [[0.0304 × PaCO₂ × 10^(pH – 6.1) – 24.26] + (9.5 + 1.63 × cHb) × (pH – 7.4)] – 0.2 × cHb × (1 – sO₂)');
    } else {
      reasoning.push('BE рассчитан по упрощенной формуле (требуются гемоглобин и насыщение O2 для точного расчета по Zander-van Slyke)');
    }

    // Determine primary acid-base disorder with reasoning
    let primaryDisorder = '';
    let compensation = '';
    let mixedDisorder = false;
    let mixedDisorderExplanation = '';
    let chronicity = '';

    // Check pH status
    if (data.ph === null) {
      primaryDisorder = 'Ошибка: pH не указан';
      reasoning.push('pH не указан - невозможно определить кислотно-щелочной статус.');
      return {
        primaryDisorder,
        compensation,
        mixedDisorder,
        mixedDisorderExplanation,
        anionGapStatus: '',
        deltaDeltaInterpretation: '',
        reasoning,
        warnings,
        osmolarGapStatus: '',
        urineAnionGapStatus: '',
        chronicity,
      };
    }

    // pH analysis with reasoning
    if (data.ph < 7.35) {
      primaryDisorder = 'Ацидемия (pH < 7.35)';
      reasoning.push(`pH = ${data.ph} < 7.35 → ацидемия (повышенная кислотность крови)`);
    } else if (data.ph > 7.45) {
      primaryDisorder = 'Алкалемия (pH > 7.45)';
      reasoning.push(`pH = ${data.ph} > 7.45 → алкалемия (повышенная щелочность крови)`);
    } else {
      primaryDisorder = 'Нормальный pH (7.35-7.45)';
      reasoning.push(`pH = ${data.ph} в пределах нормы (7.35-7.45) → нормальный кислотно-щелочной баланс`);
    }

    // Determine if metabolic or respiratory with detailed reasoning
    if (data.hco3 === null || data.pco2 === null) {
      primaryDisorder = 'Ошибка: HCO3 или PCO2 не указаны';
      reasoning.push('HCO3 или PCO2 не указаны - невозможно определить тип нарушения.');
      return {
        primaryDisorder,
        compensation,
        mixedDisorder,
        mixedDisorderExplanation,
        anionGapStatus: '',
        deltaDeltaInterpretation: '',
        reasoning,
        warnings,
        osmolarGapStatus: '',
        urineAnionGapStatus: '',
        chronicity,
      };
    }

    // Analyze HCO3 and PCO2 patterns
    const hco3Normal = data.hco3 >= 22 && data.hco3 <= 26;
    const pco2Normal = data.pco2 >= 35 && data.pco2 <= 45;
    
    reasoning.push(`HCO3 = ${data.hco3} mmol/L (норма: 22-26) → ${hco3Normal ? 'нормальный' : 'нарушенный'}`);
    reasoning.push(`PCO2 = ${data.pco2} mmHg (норма: 35-45) → ${pco2Normal ? 'нормальный' : 'нарушенный'}`);

    const isMetabolicAcidosis = data.hco3 < 22 && data.ph < 7.35;
    const isMetabolicAlkalosis = data.hco3 > 26 && data.ph > 7.45;
    const isRespiratoryAcidosis = data.pco2 > 45 && data.ph < 7.35;
    const isRespiratoryAlkalosis = data.pco2 < 35 && data.ph > 7.45;

    if (isMetabolicAcidosis) {
      primaryDisorder = 'Метаболический ацидоз';
      reasoning.push(`HCO3 = ${data.hco3} < 22 mmol/L + pH = ${data.ph} < 7.35 → метаболический ацидоз`);
      reasoning.push('Метаболический ацидоз: снижение HCO3 приводит к снижению pH. Организм компенсирует увеличением вентиляции (снижение PCO2).');
      
      const expectedPaCO2 = result.expectedPaCO2Winter;
      const tolerance = 2;
      const pco2Deviation = Math.abs(data.pco2 - expectedPaCO2);
      
      reasoning.push(`Ожидаемый PCO2 по формуле Винтера: 1.5 × ${data.hco3} + 8 = ${expectedPaCO2.toFixed(1)} mmHg`);
      reasoning.push(`Измеренный PCO2 = ${data.pco2} mmHg, отклонение = ${pco2Deviation.toFixed(1)} mmHg`);
      
      if (pco2Deviation > tolerance) {
        mixedDisorder = true;
        if (data.pco2 > expectedPaCO2 + tolerance) {
          mixedDisorderExplanation = 'Смешанное расстройство: метаболический ацидоз + респираторный ацидоз';
          reasoning.push(`PCO2 выше ожидаемого на ${(data.pco2 - expectedPaCO2).toFixed(1)} mmHg → дополнительный респираторный ацидоз`);
        } else {
          mixedDisorderExplanation = 'Смешанное расстройство: метаболический ацидоз + респираторный алкалоз';
          reasoning.push(`PCO2 ниже ожидаемого на ${(expectedPaCO2 - data.pco2).toFixed(1)} mmHg → дополнительный респираторный алкалоз`);
        }
      } else {
        compensation = 'Адекватная респираторная компенсация (формула Винтера)';
        reasoning.push('PCO2 соответствует ожидаемому по формуле Винтера → адекватная респираторная компенсация');
      }
    } else if (isMetabolicAlkalosis) {
      primaryDisorder = 'Метаболический алкалоз';
      reasoning.push(`HCO3 = ${data.hco3} > 26 mmol/L + pH = ${data.ph} > 7.45 → метаболический алкалоз`);
      reasoning.push('Метаболический алкалоз: увеличение HCO3 приводит к увеличению pH. Организм компенсирует снижением вентиляции (увеличение PCO2).');
      
      const expectedPaCO2 = result.expectedPaCO2Metabolic;
      const tolerance = 1.5;
      const pco2Deviation = Math.abs(data.pco2 - expectedPaCO2);
      
      reasoning.push(`Ожидаемый PCO2 при метаболическом алкалозе: 0.7 × ${data.hco3} + 20 = ${expectedPaCO2.toFixed(1)} mmHg`);
      reasoning.push(`Измеренный PCO2 = ${data.pco2} mmHg, отклонение = ${pco2Deviation.toFixed(1)} mmHg`);
      
      if (pco2Deviation > tolerance) {
        mixedDisorder = true;
        mixedDisorderExplanation = 'Смешанное расстройство: метаболический алкалоз + респираторное нарушение';
        reasoning.push(`PCO2 отклоняется от ожидаемого на ${pco2Deviation.toFixed(1)} mmHg > 1.5 mmHg → смешанное расстройство`);
      } else {
        compensation = 'Адекватная респираторная компенсация';
        reasoning.push('PCO2 соответствует ожидаемому → адекватная респираторная компенсация');
      }
    } else if (isRespiratoryAcidosis) {
      primaryDisorder = 'Респираторный ацидоз';
      reasoning.push(`PCO2 = ${data.pco2} > 45 mmHg + pH = ${data.ph} < 7.35 → респираторный ацидоз`);
      reasoning.push('Респираторный ацидоз: увеличение PCO2 приводит к снижению pH. Организм компенсирует увеличением HCO3.');
      
      // Calculate expected HCO3 for respiratory compensation
      const pco2Change = data.pco2 - 40; // Normal PCO2 = 40
      const expectedHCO3Acute = 24 + (pco2Change / 10) * 1;
      const expectedHCO3Chronic = 24 + (pco2Change / 10) * 3.5;
      
      reasoning.push(`Острый: ожидаемый HCO3 = 24 + (${pco2Change}/10) × 1 = ${expectedHCO3Acute.toFixed(1)} mmol/L`);
      reasoning.push(`Хронический: ожидаемый HCO3 = 24 + (${pco2Change}/10) × 3.5 = ${expectedHCO3Chronic.toFixed(1)} mmol/L`);
      reasoning.push(`Измеренный HCO3 = ${data.hco3} mmol/L`);
      
      if (Math.abs(data.hco3 - expectedHCO3Acute) <= 3) {
        compensation = 'Острый респираторный ацидоз с метаболической компенсацией';
        chronicity = 'Острый';
        reasoning.push(`HCO3 близок к ожидаемому для острого состояния (отклонение ≤ 3) → острый респираторный ацидоз`);
      } else if (Math.abs(data.hco3 - expectedHCO3Chronic) <= 2) {
        compensation = 'Хронический респираторный ацидоз с метаболической компенсацией';
        chronicity = 'Хронический';
        reasoning.push(`HCO3 близок к ожидаемому для хронического состояния (отклонение ≤ 2) → хронический респираторный ацидоз`);
      } else {
        mixedDisorder = true;
        mixedDisorderExplanation = 'Смешанное расстройство: респираторный ацидоз + метаболическое нарушение';
        reasoning.push(`HCO3 не соответствует ни острому, ни хроническому состоянию → смешанное расстройство`);
      }
    } else if (isRespiratoryAlkalosis) {
      primaryDisorder = 'Респираторный алкалоз';
      reasoning.push(`PCO2 = ${data.pco2} < 35 mmHg + pH = ${data.ph} > 7.45 → респираторный алкалоз`);
      reasoning.push('Респираторный алкалоз: снижение PCO2 приводит к увеличению pH. Организм компенсирует снижением HCO3.');
      
      // Calculate expected HCO3 for respiratory compensation
      const pco2Change = 35 - data.pco2; // Normal PCO2 = 35
      const expectedHCO3Acute = 24 - (pco2Change / 10) * 2;
      const expectedHCO3Chronic = 24 - (pco2Change / 10) * 6;
      
      reasoning.push(`Острый: ожидаемый HCO3 = 24 - (${pco2Change}/10) × 2 = ${expectedHCO3Acute.toFixed(1)} mmol/L`);
      reasoning.push(`Хронический: ожидаемый HCO3 = 24 - (${pco2Change}/10) × 6 = ${expectedHCO3Chronic.toFixed(1)} mmol/L`);
      reasoning.push(`Измеренный HCO3 = ${data.hco3} mmol/L`);
      
      if (Math.abs(data.hco3 - expectedHCO3Acute) <= 2) {
        compensation = 'Острый респираторный алкалоз с метаболической компенсацией';
        chronicity = 'Острый';
        reasoning.push(`HCO3 близок к ожидаемому для острого состояния (отклонение ≤ 2) → острый респираторный алкалоз`);
      } else if (Math.abs(data.hco3 - expectedHCO3Chronic) <= 2) {
        compensation = 'Хронический респираторный алкалоз с метаболической компенсацией';
        chronicity = 'Хронический';
        reasoning.push(`HCO3 близок к ожидаемому для хронического состояния (отклонение ≤ 2) → хронический респираторный алкалоз`);
      } else {
        mixedDisorder = true;
        mixedDisorderExplanation = 'Смешанное расстройство: респираторный алкалоз + метаболическое нарушение';
        reasoning.push(`HCO3 не соответствует ни острому, ни хроническому состоянию → смешанное расстройство`);
      }
    } else {
      // Normal or mixed pattern
      if (data.ph >= 7.35 && data.ph <= 7.45) {
        if (hco3Normal && pco2Normal) {
          primaryDisorder = 'Нормальный кислотно-щелочной баланс';
          reasoning.push('Все показатели в пределах нормы → нормальный кислотно-щелочной баланс');
        } else {
          primaryDisorder = 'Смешанное расстройство с нормальным pH';
          reasoning.push('pH в норме, но HCO3 или PCO2 нарушены → компенсированное смешанное расстройство');
        }
      } else {
        primaryDisorder = 'Сложное смешанное расстройство';
        reasoning.push('Сложная картина: pH, HCO3 и PCO2 не соответствуют типичным паттернам → сложное смешанное расстройство');
      }
    }

    // Anion gap interpretation with reasoning
    let anionGapStatus = '';
    if (result.anionGap > 16) {
      anionGapStatus = 'Повышенный AnionGap (AG) (HAGMA)';
      reasoning.push(`AnionGap (AG) = ${result.anionGap.toFixed(1)} > 16 → повышенный (HAGMA)`);
      reasoning.push('HAGMA указывает на наличие неучтенных анионов (лактат, кетоны, токсины)');
      reasoning.push('Причины HAGMA (OMUDPILES): оксопролин, метанол, уремия, ДКА, паральдегид, ИНА, лактат, этиленгликоль, салицилаты');
    } else if (result.anionGap < 8) {
      anionGapStatus = 'Сниженный AnionGap (AG)';
      reasoning.push(`AnionGap (AG) = ${result.anionGap.toFixed(1)} < 8 → сниженный`);
      reasoning.push('Сниженный AnionGap (AG) может указывать на гипоальбуминемию, гиперкальциемию, гипермагниемию');
    } else {
      anionGapStatus = 'Нормальный AnionGap (AG) (8-16)';
      reasoning.push(`AnionGap (AG) = ${result.anionGap.toFixed(1)} в пределах нормы (8-16)`);
    }

    // Delta/delta interpretation with reasoning
    let deltaDeltaInterpretation = '';
    if (result.deltaDelta !== null) {
      reasoning.push(`Δ/Δ = (${result.anionGap.toFixed(1)} - 12) / (24 - ${data.hco3}) = ${result.deltaDelta.toFixed(2)}`);
      
      if (result.deltaDelta < 0.8) {
        deltaDeltaInterpretation = 'Δ/Δ < 0.8: Возможна дополнительная метаболическая алкалемия';
        reasoning.push(`Δ/Δ = ${result.deltaDelta.toFixed(2)} < 0.8 → возможна дополнительная метаболическая алкалемия`);
        reasoning.push('Низкий Δ/Δ указывает на то, что снижение HCO3 больше ожидаемого для данного AnionGap (AG)');
      } else if (result.deltaDelta >= 0.8 && result.deltaDelta <= 2.0) {
        deltaDeltaInterpretation = 'Δ/Δ 0.8-2.0: Изолированный метаболический ацидоз';
        reasoning.push(`Δ/Δ = ${result.deltaDelta.toFixed(2)} в пределах 0.8-2.0 → изолированный метаболический ацидоз`);
        reasoning.push('Нормальный Δ/Δ указывает на то, что снижение HCO3 соответствует повышению AnionGap (AG)');
      } else {
        deltaDeltaInterpretation = 'Δ/Δ > 2.0: Возможна дополнительная метаболическая ацидемия';
        reasoning.push(`Δ/Δ = ${result.deltaDelta.toFixed(2)} > 2.0 → возможна дополнительная метаболическая ацидемия`);
        reasoning.push('Высокий Δ/Δ указывает на то, что снижение HCO3 меньше ожидаемого для данного AnionGap (AG)');
      }
    } else {
      deltaDeltaInterpretation = 'Δ/Δ не вычисляется (знаменатель ≈ 0)';
      reasoning.push(`Δ/Δ не вычисляется: знаменатель (24 - ${data.hco3}) ≈ 0`);
      reasoning.push('Это происходит когда HCO3 близок к нормальному значению 24 mmol/L');
    }

    // Осмолярный промежуток
    let osmolarGapStatus = '';
    if (result.osmolarGap !== null) {
      if (result.osmolarGap > 10) {
        osmolarGapStatus = 'Повышенный осмолярный промежуток (> 10 mOsm/kg)';
        reasoning.push(`Осмолярный промежуток = ${result.osmolarGap.toFixed(1)} > 10 mOsm/kg → повышенный`);
        reasoning.push('Повышенный осмолярный промежуток указывает на наличие осмотически активных веществ (токсины, спирты)');
      } else if (result.osmolarGap < -10) {
        osmolarGapStatus = 'Сниженный осмолярный промежуток (< -10 mOsm/kg)';
        reasoning.push(`Осмолярный промежуток = ${result.osmolarGap.toFixed(1)} < -10 mOsm/kg → сниженный`);
        reasoning.push('Сниженный осмолярный промежуток может указывать на гипонатриемию разведения');
      } else {
        osmolarGapStatus = 'Нормальный осмолярный промежуток (-10 до +10 mOsm/kg)';
        reasoning.push(`Осмолярный промежуток = ${result.osmolarGap.toFixed(1)} в пределах нормы (-10 до +10 mOsm/kg)`);
      }
    } else {
      osmolarGapStatus = 'Осмолярный промежуток не вычисляется';
    }

    // Мочевой анионный промежуток для NAGMA
    let urineAnionGapStatus = '';
    if (result.urineAnionGap !== null) {
      if (result.urineAnionGap > 10) {
        urineAnionGapStatus = 'Положительный мочевой анионный промежуток (> 10) - почечная причина NAGMA';
        reasoning.push(`Мочевой анионный промежуток = ${result.urineAnionGap.toFixed(1)} > 10 → почечная причина NAGMA`);
        reasoning.push('Положительный мочевой анионный промежуток указывает на нарушение почечной функции');
      } else if (result.urineAnionGap < -10) {
        urineAnionGapStatus = 'Отрицательный мочевой анионный промежуток (< -10) - внепочечная причина NAGMA';
        reasoning.push(`Мочевой анионный промежуток = ${result.urineAnionGap.toFixed(1)} < -10 → внепочечная причина NAGMA`);
        reasoning.push('Отрицательный мочевой анионный промежуток указывает на нормальную почечную функцию');
        reasoning.push('Причины NAGMA (HARDUP): гипералиментация, ацетазоламид, РТА, диарея, уретеро-кишечные свищи, панкреатический свищ, поствентиляция');
      } else {
        urineAnionGapStatus = 'Нормальный мочевой анионный промежуток (-10 до +10)';
        reasoning.push(`Мочевой анионный промежуток = ${result.urineAnionGap.toFixed(1)} в пределах нормы (-10 до +10)`);
      }
    } else {
      urineAnionGapStatus = 'Мочевой анионный промежуток не вычисляется';
    }

    return {
      primaryDisorder,
      compensation,
      mixedDisorder,
      mixedDisorderExplanation,
      anionGapStatus,
      deltaDeltaInterpretation,
      reasoning,
      warnings,
      osmolarGapStatus,
      urineAnionGapStatus,
      chronicity,
    };
  };

  // Функция для генерации советов по лечению только для выявленных нарушений
  const generateTreatmentAdvice = (data: BloodGasData, result: BloodGasResult): BloodGasResult['treatmentAdvice'] => {
    const detectedDisorders: string[] = [];
    const specificAdvice: Array<{
      disorder: string;
      advice: string[];
      warnings?: string[];
      critical?: boolean;
    }> = [];
    const generalPrinciples: string[] = [
      'Лечить основную причину - всегда начинать с устранения этиологического фактора',
      'Оценить тяжесть - определить, требует ли нарушение немедленного вмешательства',
      'Мониторинг - регулярно контролировать показатели АБГ и клиническое состояние',
      'Постепенная коррекция - избегать быстрых изменений pH (не более 0.1/час)',
      'Предотвращение осложнений - учитывать риски перекоррекции'
    ];

    // Проверяем pH для определения ацидемии/алкалемии
    if (data.ph !== null) {
      if (data.ph < 7.35) {
        detectedDisorders.push('Ацидемия');
      } else if (data.ph > 7.45) {
        detectedDisorders.push('Алкалемия');
      }
    }

    // Проверяем метаболический ацидоз
    if (data.hco3 !== null && data.ph !== null && data.hco3 < 22 && data.ph < 7.35) {
      detectedDisorders.push('Метаболический ацидоз');
      
      if (result.anionGap > 16) {
        detectedDisorders.push('HAGMA');
        specificAdvice.push({
          disorder: 'HAGMA (AnionGap > 16)',
          advice: [
            'ДКА: Инсулин, регидратация, коррекция электролитов',
            'Лактоацидоз: Лечение шока, сепсиса, улучшение перфузии',
            'Отравления: Антидоты, диализ, форсированный диурез',
            'Уремия: Диализ, коррекция почечной функции'
          ],
          warnings: ['При pH < 7.1 с симптомами рассмотреть NaHCO3'],
          critical: data.ph !== null && data.ph < 7.0
        });
      } else {
        detectedDisorders.push('NAGMA');
        specificAdvice.push({
          disorder: 'NAGMA (AnionGap нормальный)',
          advice: [
            'Диарея: Регидратация, антибиотики при инфекции',
            'РТА: Цитрат калия, тиазидные диуретики',
            'Ацетазоламид: Отмена препарата'
          ]
        });
      }
    }

    // Проверяем метаболический алкалоз
    if (data.hco3 !== null && data.ph !== null && data.hco3 > 26 && data.ph > 7.45) {
      detectedDisorders.push('Метаболический алкалоз');
      specificAdvice.push({
        disorder: 'Метаболический алкалоз',
        advice: [
          'Гиповолемия: Восстановление ОЦК (0.9% NaCl)',
          'Гипокалиемия: Коррекция K+ (цель: 4.0-4.5)',
          'Гипохлоремия: Восстановление Cl- (0.9% NaCl)',
          'Гиперальдостеронизм: Спиронолактон'
        ],
        warnings: ['Противопоказания к HCl: почечная, печеночная, сердечная недостаточность']
      });
    }

    // Проверяем респираторный ацидоз
    if (data.pco2 !== null && data.ph !== null && data.pco2 > 45 && data.ph < 7.35) {
      detectedDisorders.push('Респираторный ацидоз');
      
      const isAcute = result.interpretation.chronicity === 'Острый';
      specificAdvice.push({
        disorder: `Респираторный ацидоз (${isAcute ? 'острый' : 'хронический'})`,
        advice: isAcute ? [
          'Немедленно: Обеспечить проходимость дыхательных путей',
          'ИВЛ: При угнетении дыхания',
          'Бронходилататоры: При обструкции',
          'Антибиотики: При инфекции'
        ] : [
          'Длительная О2-терапия: При гипоксемии',
          'НИВЛ: При ХОБЛ',
          'Лечение основного заболевания'
        ],
        warnings: ['Не применять NaHCO3 без коррекции вентиляции!'],
        critical: isAcute
      });
    }

    // Проверяем респираторный алкалоз
    if (data.pco2 !== null && data.ph !== null && data.pco2 < 35 && data.ph > 7.45) {
      detectedDisorders.push('Респираторный алкалоз');
      specificAdvice.push({
        disorder: 'Респираторный алкалоз',
        advice: [
          'Лечение причины: Лихорадка, боль, тревога',
          'Коррекция гипоксии: О2-терапия при необходимости',
          'Седация: При психогенной гипервентиляции',
          'Лечение основного заболевания'
        ],
        warnings: ['Респираторный алкалоз редко требует специфического лечения']
      });
    }

    // Проверяем нарушение внутренней согласованности
    if (!result.internalConsistency.isValid) {
      detectedDisorders.push('Нарушение внутренней согласованности АБГ');
      specificAdvice.push({
        disorder: 'Нарушение внутренней согласованности АБГ',
        advice: [
          'Немедленно: Повторить анализ газов крови',
          'Проверить: Технику забора и транспортировки образца',
          'Оценить: Клиническую картину пациента',
          'Рассмотреть: Альтернативные методы (венозная кровь)'
        ],
        warnings: ['Данные АБГ могут быть недостоверными для принятия клинических решений'],
        critical: true
      });
    }

    // Проверяем осмолярный промежуток
    if (result.osmolarGap !== null && Math.abs(result.osmolarGap) > 10) {
      detectedDisorders.push('Нарушение осмолярного промежутка');
      specificAdvice.push({
        disorder: result.osmolarGap > 10 ? 'Повышенный осмолярный промежуток' : 'Сниженный осмолярный промежуток',
        advice: result.osmolarGap > 10 ? [
          'Исключить отравления: Токсины, спирты',
          'Токсикологический скрининг',
          'Рассмотреть диализ при тяжелых отравлениях'
        ] : [
          'Исключить гипонатриемию разведения',
          'Коррекция водного баланса'
        ]
      });
    }

    // Проверяем мочевой анионный промежуток
    if (result.urineAnionGap !== null && Math.abs(result.urineAnionGap) > 10) {
      detectedDisorders.push('Нарушение мочевого анионного промежутка');
      specificAdvice.push({
        disorder: result.urineAnionGap > 10 ? 'Почечная причина NAGMA' : 'Внепочечная причина NAGMA',
        advice: result.urineAnionGap > 10 ? [
          'Оценка почечной функции',
          'Коррекция почечных нарушений'
        ] : [
          'Лечение внепочечных причин (диарея, свищи)',
          'Коррекция электролитов'
        ]
      });
    }

    // Проверяем критические значения pH
    if (data.ph !== null) {
      if (data.ph < 7.0) {
        detectedDisorders.push('Критическая ацидемия');
        specificAdvice.push({
          disorder: 'Критическая ацидемия (pH < 7.0)',
          advice: [
            'Немедленная госпитализация в ОРИТ',
            'Мониторинг жизненных функций',
            'Рассмотреть NaHCO3 при метаболическом ацидозе',
            'ИВЛ при респираторных нарушениях'
          ],
          critical: true
        });
      } else if (data.ph > 7.7) {
        detectedDisorders.push('Критическая алкалемия');
        specificAdvice.push({
          disorder: 'Критическая алкалемия (pH > 7.7)',
          advice: [
            'Опасность судорог и аритмий',
            'Немедленная коррекция',
            'Мониторинг ЭКГ'
          ],
          critical: true
        });
      }
    }

    return {
      detectedDisorders,
      specificAdvice,
      generalPrinciples
    };
  };

  const handleCalculate = () => {
    // Проверяем, что все обязательные поля заполнены
    if (data.ph === null || data.pco2 === null || data.hco3 === null || data.na === null || data.cl === null) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const anionGap = calculateAnionGap(data.na, data.cl, data.hco3, data.k, data.includeK);
    const expectedPaCO2Winter = calculateExpectedPaCO2Winter(data.hco3);
    const expectedPaCO2Metabolic = calculateExpectedPaCO2Metabolic(data.hco3);
    const deltaDelta = calculateDeltaDelta(anionGap, data.hco3);
    
    // Анализ PaO2
    const pao2Analysis = analyzePaO2(data.pao2, data.fio2 || 0.21);
    
    let anionGapCorrected: number | null = null;
    if (data.albumin !== null) {
      anionGapCorrected = calculateCorrectedAnionGap(anionGap, data.albumin);
    }

    const totalCO2 = calculateTotalCO2(data.hco3, data.pco2);
    let baseExcess = calculateBaseExcess(data.ph, data.pco2, data.hemoglobin, data.oxygenSaturation);
    
    // Дополнительная проверка
    if (baseExcess === null || baseExcess === undefined || isNaN(baseExcess)) {
      baseExcess = 0;
    }
    const hydrogenIon = calculateHydrogenIon(data.ph);
    const aaGradient = calculateAaGradient(data.pao2, data.fio2 || 0.21, data.ph, data.pco2, data.age);

    // Новые расчеты согласно алгоритму
    const osmolarGap = calculateOsmolarGap(data.na, data.glucose, data.bun, data.ethanol);
    const urineAnionGap = calculateUrineAnionGap(data.urineNa, data.urineK, data.urineCl);
    const internalConsistency = checkInternalConsistency(data.ph, data.pco2, data.hco3);

    const baseResult: BloodGasResult = {
      anionGap,
      anionGapCorrected,
      expectedPaCO2Winter,
      expectedPaCO2Metabolic,
      deltaDelta,
      pao2Status: pao2Analysis.status,
      oxygenationIndex: pao2Analysis.oxygenationIndex,
      totalCO2,
      baseExcess,
      hydrogenIon,
      aaGradient,
      osmolarGap,
      urineAnionGap,
      internalConsistency,
      interpretation: {
        primaryDisorder: '',
        compensation: '',
        mixedDisorder: false,
        mixedDisorderExplanation: '',
        anionGapStatus: '',
        deltaDeltaInterpretation: '',
        reasoning: [],
        warnings: [],
        osmolarGapStatus: '',
        urineAnionGapStatus: '',
        chronicity: '',
      },
      treatmentAdvice: {
        detectedDisorders: [],
        specificAdvice: [],
        generalPrinciples: []
      }
    };

    // Add interpretation
    baseResult.interpretation = interpretAcidBaseStatus(data, baseResult);
    
    // Add treatment advice
    baseResult.treatmentAdvice = generateTreatmentAdvice(data, baseResult);
    
    setResult(baseResult);
  };

  const handleCopyReport = () => {
    if (!result) return;
    
    const report = `
Анализ газов крови
==================
pH: ${data.ph || 'не указан'} (норма: 7.35-7.45)
PCO2: ${data.pco2 || 'не указан'} mmHg (норма: 35-45)
HCO3: ${data.hco3 || 'не указан'} mmol/L (норма: 22-26)
PaO2: ${data.pao2 || 'не указан'} mmHg (норма: 80-100)
Na: ${data.na || 'не указан'} mmol/L (норма: 135-145)
Cl: ${data.cl || 'не указан'} mmol/L (норма: 96-106)
K: ${data.k || 'не указан'} mmol/L (норма: 3.5-5.0)
Тип образца: ${data.sampleType === 'arterial' ? 'артериальная' : 'венозная'} кровь
Альбумин: ${data.albumin || 'не указан'} г/л
FiO2: ${data.fio2 || 'не указан'}
Возраст: ${data.age || 'не указан'} лет

Дополнительные параметры:
=========================
Глюкоза: ${data.glucose || 'не указан'} мг/дл
BUN: ${data.bun || 'не указан'} мг/дл
Этанол: ${data.ethanol || 'не указан'} мг/дл
Моча Na: ${data.urineNa || 'не указан'} мэкв/л
Моча K: ${data.urineK || 'не указан'} мэкв/л
Моча Cl: ${data.urineCl || 'не указан'} мэкв/л

Результаты:
===========
AnionGap (AG): ${result.anionGap.toFixed(1)} mmol/L (норма: 8-16)
${result.anionGapCorrected !== null ? `Скорректированный AnionGap (AG): ${result.anionGapCorrected.toFixed(1)} mmol/L` : ''}
Ожидаемый PaCO2 (Винтер): ${result.expectedPaCO2Winter.toFixed(1)} ± 2 mmHg
Ожидаемый PaCO2 (метаб. алкалоз): ${result.expectedPaCO2Metabolic.toFixed(1)} ± 1.5 mmHg
Δ/Δ: ${result.deltaDelta !== null ? result.deltaDelta.toFixed(2) : 'не вычисляется'}
${data.pao2 ? `PaO2: ${data.pao2} mmHg - ${result.pao2Status}` : ''}
${result.oxygenationIndex ? `Индекс оксигенации: ${result.oxygenationIndex.toFixed(0)}` : ''}
Общая концентрация CO2: ${result.totalCO2.toFixed(1)} mmol/L
Избыток оснований: ${result.baseExcess !== null && result.baseExcess !== undefined ? result.baseExcess.toFixed(1) : 'Н/Д'} mmol/L (по формуле Zander-van Slyke)
Концентрация [H+]: ${result.hydrogenIon.toFixed(10)} nM
Альвеолярно-артериальный градиент O2: ${result.aaGradient !== null && result.aaGradient !== undefined ? result.aaGradient.toFixed(1) : 'не вычисляется'} mmHg

Новые расчеты согласно алгоритму:
=================================
Внутренняя согласованность АБГ: ${result.internalConsistency.isValid ? '✓ Согласован' : '⚠️ Нарушена'}
[H+] = (24 × PCO2) / HCO3 = ${result.internalConsistency.hydrogenIon.toFixed(1)} nM
${result.osmolarGap !== null ? `Осмолярный промежуток: ${result.osmolarGap.toFixed(1)} mOsm/kg` : 'Осмолярный промежуток: не вычисляется'}
${result.urineAnionGap !== null ? `Мочевой анионный промежуток: ${result.urineAnionGap.toFixed(1)} мэкв/л` : 'Мочевой анионный промежуток: не вычисляется'}

${!result.internalConsistency.isValid ? `
⚠️ ВНИМАНИЕ: Нарушена внутренняя согласованность АБГ!
====================================================
Что это означает:
Внутренняя согласованность нарушена, когда результаты pH, PCO2 и HCO3 не соответствуют друг другу по уравнению Гендерсона-Гассельбаха.

Возможные причины:
• Технические ошибки лаборатории (калибровка, транспортировка)
• Проблемы с образцом (воздушные пузырьки, долгое хранение)
• Ошибки при заборе (смешивание крови, попадание тканевой жидкости)
• Экстремальные клинические ситуации

Рекомендуемые действия:
• НЕМЕДЛЕННО: Повторить анализ газов крови
• Проверить технику забора и транспортировки образца
• Оценить клиническую картину пациента
• Рассмотреть альтернативные методы (венозная кровь)

ВАЖНО: Нарушение внутренней согласованности не исключает наличие кислотно-щелочных нарушений у пациента, но означает, что данные АБГ могут быть недостоверными для принятия клинических решений.
` : ''}

Интерпретация:
==============
Основное нарушение: ${result.interpretation.primaryDisorder}
Компенсация: ${result.interpretation.compensation || 'нет данных'}
${result.interpretation.chronicity ? `Хроничность: ${result.interpretation.chronicity}` : ''}
${result.interpretation.mixedDisorder ? `Смешанное расстройство: ${result.interpretation.mixedDisorderExplanation}` : ''}
Статус AnionGap (AG): ${result.interpretation.anionGapStatus}
Интерпретация Δ/Δ: ${result.interpretation.deltaDeltaInterpretation}
${result.interpretation.osmolarGapStatus ? `Осмолярный промежуток: ${result.interpretation.osmolarGapStatus}` : ''}
${result.interpretation.urineAnionGapStatus ? `Мочевой анионный промежуток: ${result.interpretation.urineAnionGapStatus}` : ''}

Логика принятия решений:
========================
${result.interpretation.reasoning.map((reason, index) => `${index + 1}. ${reason}`).join('\n')}

${result.interpretation.warnings.length > 0 ? `Предупреждения: ${result.interpretation.warnings.join(', ')}` : ''}

Советы по лечению:
==================
${result.treatmentAdvice.detectedDisorders.length > 0 ? 
  `Обнаруженные нарушения: ${result.treatmentAdvice.detectedDisorders.join(', ')}` : 
  'Нарушений не обнаружено - специфическое лечение не требуется'
}

${result.treatmentAdvice.specificAdvice.length > 0 ? 
  result.treatmentAdvice.specificAdvice.map(advice => 
    `${advice.disorder}${advice.critical ? ' (КРИТИЧНО)' : ''}:\n${advice.advice.map(item => `• ${item}`).join('\n')}${advice.warnings ? `\nПредупреждения: ${advice.warnings.join(', ')}` : ''}`
  ).join('\n\n') : 
  ''
}
    `.trim();

    navigator.clipboard.writeText(report);
    alert('Отчет скопирован в буфер обмена');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleInputChange = (field: keyof BloodGasData, value: number | null | string | boolean) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <Card 
        title="🩸 Калькулятор анализа газов крови"
        subtitle="Расчет анионного промежутка, формулы Винтера, BE по Zander-van Slyke, интерпретация кислотно-щелочного баланса"
        className="w-full bg-slate-800 border-slate-700 text-slate-100"
      >
        <div className="space-y-8">
          {/* Основные параметры */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NumberInput
              label="pH"
              value={data.ph}
              onChange={(value) => handleInputChange('ph', value)}
              min={6.8}
              max={8.0}
              step={0.01}
              precision={2}
              required
            />
            
            <NumberInput
              label="PCO2 (mmHg)"
              value={data.pco2}
              onChange={(value) => handleInputChange('pco2', value)}
              min={20}
              max={100}
              step={0.1}
              precision={1}
              required
            />
            
            <NumberInput
              label="PaO2 (mmHg)"
              value={data.pao2}
              onChange={(value) => handleInputChange('pao2', value)}
              min={30}
              max={200}
              step={1}
              precision={0}
              required={false}
              helperText="Артериальное парциальное давление кислорода"
            />
            
            <NumberInput
              label="HCO3 (mmol/L)"
              value={data.hco3}
              onChange={(value) => handleInputChange('hco3', value)}
              min={10}
              max={50}
              step={0.1}
              precision={1}
              required
            />
            
            <NumberInput
              label="Na (mmol/L)"
              value={data.na}
              onChange={(value) => handleInputChange('na', value)}
              min={120}
              max={180}
              step={1}
              precision={0}
              required
            />
            
            <NumberInput
              label="Cl (mmol/L)"
              value={data.cl}
              onChange={(value) => handleInputChange('cl', value)}
              min={80}
              max={130}
              step={1}
              precision={0}
              required
            />
            
            <NumberInput
              label="K (mmol/L)"
              value={data.k}
              onChange={(value) => handleInputChange('k', value)}
              min={2.0}
              max={8.0}
              step={0.1}
              precision={1}
              required={false}
            />
            
            <Select
              label="Тип образца"
              value={data.sampleType}
              onChange={(value) => handleInputChange('sampleType', value as 'arterial' | 'venous')}
              options={[
                { value: 'arterial', label: 'Артериальная кровь' },
                { value: 'venous', label: 'Венозная кровь' },
              ]}
              required
            />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeK"
                checked={data.includeK}
                onChange={(checked) => handleInputChange('includeK', checked)}
              >
                                  <span className="text-sm font-medium">Включить K в расчет AnionGap (AG)</span>
              </Checkbox>
            </div>
          </div>

          <div className="mb-6">
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 font-medium"
            >
              {showAdvanced ? '🔽 Скрыть' : '🔼 Показать'} дополнительные параметры
            </Button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-6 bg-slate-700 rounded-lg border border-slate-600">
              <NumberInput
                label="Альбумин (г/л)"
                value={data.albumin}
                onChange={(value) => handleInputChange('albumin', value)}
                min={1.0}
                max={6.0}
                step={0.1}
                precision={1}
                required={false}
                helperText="Для коррекции AnionGap (AG) при гипоальбуминемии"
              />
              <NumberInput
                label="FiO2"
                value={data.fio2}
                onChange={(value) => handleInputChange('fio2', value)}
                min={0.1}
                max={1.0}
                step={0.01}
                precision={2}
                required={false}
                helperText="Парциальное давление кислорода в дыхательной смеси"
              />
              <NumberInput
                label="Возраст (лет)"
                value={data.age}
                onChange={(value) => handleInputChange('age', value)}
                min={0}
                max={120}
                step={1}
                precision={0}
                required={false}
                helperText="Для расчета альвеолярно-артериального градиента O2"
              />
              
              {/* Новые поля согласно алгоритму */}
              <NumberInput
                label="Глюкоза (мг/дл)"
                value={data.glucose}
                onChange={(value) => handleInputChange('glucose', value)}
                min={50}
                max={800}
                step={1}
                precision={0}
                required={false}
                helperText="Для расчета осмолярного промежутка"
              />
              <NumberInput
                label="BUN (мг/дл)"
                value={data.bun}
                onChange={(value) => handleInputChange('bun', value)}
                min={5}
                max={100}
                step={1}
                precision={0}
                required={false}
                helperText="Азот мочевины крови для осмолярного промежутка"
              />
              <NumberInput
                label="Этанол (мг/дл)"
                value={data.ethanol}
                onChange={(value) => handleInputChange('ethanol', value)}
                min={0}
                max={500}
                step={1}
                precision={0}
                required={false}
                helperText="Концентрация этанола для осмолярного промежутка"
              />
              
              {/* Мочевые показатели для NAGMA */}
              <NumberInput
                label="Моча Na (мэкв/л)"
                value={data.urineNa}
                onChange={(value) => handleInputChange('urineNa', value)}
                min={10}
                max={200}
                step={1}
                precision={0}
                required={false}
                helperText="Натрий в моче для расчета мочевого анионного промежутка"
              />
              <NumberInput
                label="Моча K (мэкв/л)"
                value={data.urineK}
                onChange={(value) => handleInputChange('urineK', value)}
                min={5}
                max={100}
                step={1}
                precision={0}
                required={false}
                helperText="Калий в моче для расчета мочевого анионного промежутка"
              />
              <NumberInput
                label="Моча Cl (мэкв/л)"
                value={data.urineCl}
                onChange={(value) => handleInputChange('urineCl', value)}
                min={10}
                max={200}
                step={1}
                precision={0}
                required={false}
                helperText="Хлорид в моче для расчета мочевого анионного промежутка"
              />
              
              {/* Поля для расчета BE по формуле Siggaard-Andersen */}
              <NumberInput
                label="Гемоглобин (г/дл)"
                value={data.hemoglobin}
                onChange={(value) => handleInputChange('hemoglobin', value)}
                min={5.0}
                max={25.0}
                step={0.1}
                precision={1}
                required={false}
                helperText="Концентрация гемоглобина для расчета BE по формуле Zander-van Slyke"
              />
              <NumberInput
                label="Насыщение O2 (0.0-1.0)"
                value={data.oxygenSaturation}
                onChange={(value) => handleInputChange('oxygenSaturation', value)}
                min={0.0}
                max={1.0}
                step={0.01}
                precision={2}
                required={false}
                helperText="Насыщение кислородом (0.0-1.0) для расчета BE по формуле Zander-van Slyke"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleCalculate} variant="primary" className="text-lg px-8 py-3 bg-slate-700 hover:bg-slate-600 border-slate-700">
              🧮 Рассчитать
            </Button>
          </div>
        </div>
      </Card>

      {result && (
        <Card>
          <div className="space-y-6">
            {/* Interpretation - MOVED TO THE BEGINNING */}
            <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
              <h3 className="text-xl lg:text-2xl font-bold text-slate-100 mb-4 text-center">
                🔍 Интерпретация
              </h3>
              
              {/* Critical Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Internal Consistency */}
                <div className={`p-3 rounded-lg border ${
                  result.internalConsistency.isValid 
                    ? 'bg-green-900/20 border-green-600' 
                    : 'bg-red-900/20 border-red-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">Внутренняя согласованность</span>
                    <span className={`text-sm font-bold ${
                      result.internalConsistency.isValid ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.internalConsistency.isValid ? '✓ Согласован' : '⚠️ Нарушена'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    [H+] = (24 × PCO2) / HCO3 = {result.internalConsistency.hydrogenIon.toFixed(1)} nM
                  </div>
                </div>
                
                {/* Primary Disorder */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">Основное нарушение</span>
                    <span className="text-sm font-bold text-slate-100">{result.interpretation.primaryDisorder}</span>
                  </div>
                </div>
              </div>
              
              {/* Acid-Base Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {result.interpretation.compensation && (
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-600">
                    <div className="text-xs text-slate-400 mb-1">Компенсация</div>
                    <div className="text-sm font-medium text-slate-100">{result.interpretation.compensation}</div>
                  </div>
                )}
                
                {result.interpretation.chronicity && (
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-600">
                    <div className="text-xs text-slate-400 mb-1">Хроничность</div>
                    <div className="text-sm font-medium text-slate-100">{result.interpretation.chronicity}</div>
                  </div>
                )}
                
                {result.interpretation.mixedDisorder && (
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-600">
                    <div className="text-xs text-slate-400 mb-1">Смешанное расстройство</div>
                    <div className="text-sm font-medium text-slate-100">{result.interpretation.mixedDisorderExplanation}</div>
                  </div>
                )}
              </div>
              
              {/* Laboratory Values Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-600">
                  <div className="text-xs text-slate-400 mb-1">AnionGap (AG)</div>
                  <div className="text-sm font-medium text-slate-100">{result.interpretation.anionGapStatus}</div>
                </div>
                
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-600">
                  <div className="text-xs text-slate-400 mb-1">Δ/Δ</div>
                  <div className="text-sm font-medium text-slate-100">{result.interpretation.deltaDeltaInterpretation}</div>
                </div>
                
                {result.interpretation.osmolarGapStatus && (
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-600">
                    <div className="text-xs text-slate-400 mb-1">Осмолярный промежуток</div>
                    <div className="text-sm font-medium text-slate-100">{result.interpretation.osmolarGapStatus}</div>
                  </div>
                )}
                
                {result.interpretation.urineAnionGapStatus && (
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-600">
                    <div className="text-xs text-slate-400 mb-1">Мочевой анионный промежуток</div>
                    <div className="text-sm font-medium text-slate-100">{result.interpretation.urineAnionGapStatus}</div>
                  </div>
                )}
              </div>
              
              {/* Critical Warning for Internal Consistency */}
              {!result.internalConsistency.isValid && (
                <div className="bg-red-900/20 p-3 rounded-lg border border-red-600">
                  <div className="flex items-start">
                    <span className="text-red-400 mr-2 text-sm">⚠️</span>
                    <div className="text-xs text-slate-200">
                      <div className="font-medium text-red-300 mb-1">Нарушена внутренняя согласованность АБГ!</div>
                      <div className="text-slate-300">
                        <strong>Действия:</strong> Повторить анализ, проверить технику забора, оценить клиническую картину. 
                        Данные могут быть недостоверными.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Results */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-8 text-center">
                📊 Основные результаты
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                  <div className="text-center">
                    <div className="text-lg text-slate-300 font-medium mb-2">AnionGap (AG)</div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.anionGap.toFixed(1)}</div>
                    <div className="text-sm text-slate-400 mt-2">mmol/L</div>
                    <div className="text-xs text-slate-500 mt-1">Норма: 8-16</div>
                  </div>
                </div>
                
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                  <div className="text-center">
                    <div className="text-lg text-slate-300 font-medium mb-2">Текущий CO2</div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-100">{data.pco2}</div>
                    <div className="text-sm text-slate-400 mt-2">mmHg</div>
                    <div className="text-xs text-slate-500 mt-1">Норма: 35-45</div>
                  </div>
                </div>
                
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                  <div className="text-center">
                    <div className="text-lg text-slate-300 font-medium mb-2">Δ/Δ</div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-100">
                      {result.deltaDelta !== null ? result.deltaDelta.toFixed(2) : 'Н/Д'}
                    </div>
                    <div className="text-sm text-slate-400 mt-2">Ratio</div>
                    <div className="text-xs text-slate-500 mt-1">Норма: 0.8-2.0</div>
                  </div>
                </div>
                
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                  <div className="text-center">
                    <div className="text-lg text-slate-300 font-medium mb-2">PaO2</div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-100">{data.pao2 || 'Н/Д'}</div>
                    <div className="text-sm text-slate-400 mt-2">mmHg</div>
                    <div className="text-xs text-slate-500 mt-1">Норма: 80-100</div>
                  </div>
                </div>
                
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                  <div className="text-center">
                    <div className="text-lg text-slate-300 font-medium mb-2">Ожидаемый PaCO2</div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.expectedPaCO2Winter.toFixed(1)}</div>
                    <div className="text-sm text-slate-400 mt-2">± 2 mmHg</div>
                  </div>
                </div>
                
                {result.anionGapCorrected !== null && (
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                    <div className="text-center">
                      <div className="text-base text-slate-300 font-medium mb-2 leading-tight">Скорр. AG</div>
                      <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.anionGapCorrected.toFixed(1)}</div>
                      <div className="text-sm text-slate-400 mt-2">mmol/L</div>
                      <div className="text-xs text-slate-500 mt-1">Норма: 8-16</div>
                    </div>
                  </div>
                )}
                
                {result.osmolarGap !== null && (
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                    <div className="text-center">
                      <div className="text-lg text-slate-300 font-medium mb-2">Осмолярный промежуток</div>
                      <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.osmolarGap.toFixed(1)}</div>
                      <div className="text-sm text-slate-400 mt-2">mOsm/kg</div>
                      <div className="text-xs text-slate-500 mt-1">Норма: -10 до +10</div>
                    </div>
                  </div>
                )}
                
                {result.urineAnionGap !== null && (
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                    <div className="text-center">
                      <div className="text-lg text-slate-300 font-medium mb-2">Мочевой анионный промежуток</div>
                      <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.urineAnionGap.toFixed(1)}</div>
                      <div className="text-sm text-slate-400 mt-2">мэкв/л</div>
                      <div className="text-xs text-slate-500 mt-1">Норма: -10 до +10</div>
                    </div>
                  </div>
                )}
                
                {/* Base Excess - перемещен в основные результаты */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                  <div className="text-center">
                    <div className="text-lg text-slate-300 font-medium mb-2">Избыток оснований (BE)</div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-100">
                      {result.baseExcess !== null && result.baseExcess !== undefined ? result.baseExcess.toFixed(1) : 'Н/Д'}
                    </div>
                    <div className="text-sm text-slate-400 mt-2">mmol/L</div>
                    <div className="text-xs text-slate-500 mt-1">
                      По формуле Zander-van Slyke
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Normal Values Reference */}
            <div className="p-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border border-slate-600 shadow-md">
              <h3 className="text-xl font-bold text-slate-100 mb-4 text-center">
                📋 Нормальные значения
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-slate-300 font-medium">pH</div>
                  <div className="text-slate-100 font-bold">{NORMAL_VALUES.ph.min}-{NORMAL_VALUES.ph.max}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">PCO2</div>
                  <div className="text-slate-100 font-bold">{NORMAL_VALUES.pco2.min}-{NORMAL_VALUES.pco2.max} {NORMAL_VALUES.pco2.unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">HCO3</div>
                  <div className="text-slate-100 font-bold">{NORMAL_VALUES.hco3.min}-{NORMAL_VALUES.hco3.max} {NORMAL_VALUES.hco3.unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">PaO2</div>
                  <div className="text-slate-100 font-bold">{NORMAL_VALUES.pao2.min}-{NORMAL_VALUES.pao2.max} {NORMAL_VALUES.pao2.unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">Na</div>
                  <div className="text-slate-100 font-bold">{NORMAL_VALUES.na.min}-{NORMAL_VALUES.na.max} {NORMAL_VALUES.na.unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">Cl</div>
                  <div className="text-slate-100 font-bold">{NORMAL_VALUES.cl.min}-{NORMAL_VALUES.cl.max} {NORMAL_VALUES.cl.unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">K</div>
                  <div className="text-slate-100 font-bold">{NORMAL_VALUES.k.min}-{NORMAL_VALUES.k.max} {NORMAL_VALUES.k.unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">AnionGap (AG)</div>
                  <div className="text-slate-100 font-bold">{NORMAL_VALUES.anionGap.min}-{NORMAL_VALUES.anionGap.max} {NORMAL_VALUES.anionGap.unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">Гемоглобин</div>
                  <div className="text-slate-100 font-bold">{NORMAL_VALUES.hemoglobin.min}-{NORMAL_VALUES.hemoglobin.max} {NORMAL_VALUES.hemoglobin.unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">Насыщение O2</div>
                  <div className="text-slate-100 font-bold">{NORMAL_VALUES.oxygenSaturation.min}-{NORMAL_VALUES.oxygenSaturation.max}</div>
                </div>
                
                {/* Новые нормальные значения согласно алгоритму */}
                <div className="text-center">
                  <div className="text-slate-300 font-medium">Глюкоза</div>
                  <div className="text-slate-100 font-bold">70-100 мг/дл</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">BUN</div>
                  <div className="text-slate-100 font-bold">7-20 мг/дл</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">Осмолярность</div>
                  <div className="text-slate-100 font-bold">275-295 mOsm/kg</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">Осмолярный промежуток</div>
                  <div className="text-slate-100 font-bold">-10 до +10 mOsm/kg</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-medium">Мочевой анионный промежуток</div>
                  <div className="text-slate-100 font-bold">-10 до +10 мэкв/л</div>
                </div>
              </div>
            </div>

            {/* PaO2 Analysis */}
            {data.pao2 && (
              <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-6 text-center">
                  🫁 Анализ оксигенации
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                    <div className="text-center mb-4">
                      <div className="text-lg text-slate-300 font-medium mb-2">Статус PaO2</div>
                      <div className="text-xl text-slate-200 font-semibold">{result.pao2Status}</div>
                    </div>
                  </div>
                  
                  {result.oxygenationIndex && (
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                      <div className="text-center mb-4">
                        <div className="text-lg text-slate-300 font-medium mb-2">Индекс оксигенации</div>
                        <div className="text-3xl lg:text-4xl font-bold text-slate-200">{result.oxygenationIndex.toFixed(0)}</div>
                        <div className="text-sm text-slate-400 mt-2">PaO2/FiO2</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Calculated Parameters */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-6 text-center">
                🧮 Дополнительные расчеты
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                  <div className="text-center">
                    <div className="text-lg text-slate-300 font-medium mb-2">Общая концентрация CO2</div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.totalCO2.toFixed(1)}</div>
                    <div className="text-sm text-slate-400 mt-2">mmol/L</div>
                    <div className="text-xs text-slate-500 mt-1">Норма: 22-28</div>
                  </div>
                </div>
                
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                  <div className="text-center">
                    <div className="text-lg text-slate-300 font-medium mb-2">Концентрация [H+]</div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.hydrogenIon.toFixed(1)}</div>
                    <div className="text-sm text-slate-400 mt-2">nM</div>
                    <div className="text-xs text-slate-500 mt-1">Норма: 35-45</div>
                  </div>
                </div>
                
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                  <div className="text-center">
                    <div className="text-lg text-slate-300 font-medium mb-2">A-a градиент O2</div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-100">
                      {result.aaGradient !== null ? result.aaGradient.toFixed(1) : 'Н/Д'}
                    </div>
                    <div className="text-sm text-slate-400 mt-2">mmHg</div>
                    <div className="text-xs text-slate-500 mt-1">Норма: &lt; 20</div>
                  </div>
                </div>
                
                {/* Expected Values moved here */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                  <div className="text-center">
                    <div className="text-lg text-slate-300 font-medium mb-2">Ожидаемый PaCO2 (метаб. алкалоз)</div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.expectedPaCO2Metabolic.toFixed(1)}</div>
                    <div className="text-sm text-slate-400 mt-2">± 1.5 mmHg</div>
                    <div className="text-xs text-slate-500 mt-1">Норма: 35-45</div>
                  </div>
                </div>
                
                {result.anionGapCorrected && (
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                    <div className="text-center">
                      <div className="text-base text-slate-300 font-medium mb-2 leading-tight">Скорр. AG</div>
                      <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.anionGapCorrected.toFixed(1)}</div>
                      <div className="text-sm text-slate-400 mt-2">mmol/L</div>
                      <div className="text-xs text-slate-500 mt-1">Норма: 8-16</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Reasoning */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-100">
                  🧠 Логика принятия решений
                </h3>
                <Button
                  onClick={() => setShowDecisionLogic(!showDecisionLogic)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {showDecisionLogic ? '🔽 Скрыть' : '🔼 Показать'} логику
                </Button>
              </div>
              
              {showDecisionLogic && (
                <div className="space-y-4">
                  {result.interpretation.reasoning.map((reason, index) => (
                    <div key={index} className="bg-slate-900 p-4 rounded-xl border border-slate-600 shadow-md">
                      <div className="flex items-start">
                        <span className="text-slate-400 mr-4 text-xl">💡</span>
                        <span className="text-base text-slate-200">{reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>



            {/* Warnings */}
            {result.interpretation.warnings.length > 0 && (
              <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
                <h4 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-6 text-center">
                  ⚠️ Предупреждения
                </h4>
                <div className="space-y-4">
                  {result.interpretation.warnings.map((warning, index) => (
                    <div key={index} className="bg-slate-900 p-4 rounded-xl border border-slate-600 shadow-md">
                      <div className="flex items-start">
                        <span className="text-slate-400 mr-4 text-xl">⚠️</span>
                        <span className="text-base text-slate-200 font-medium">{warning}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Расширенная подсказка о внутренней согласованности */}
                  {!result.internalConsistency.isValid && (
                    <div className="bg-slate-900 p-6 rounded-xl border border-red-600 shadow-md">
                      <div className="flex items-start">
                        <span className="text-red-400 mr-4 text-xl">🔬</span>
                        <div className="flex-1">
                          <h5 className="text-lg font-bold text-red-300 mb-3">Нарушение внутренней согласованности АБГ</h5>
                          <div className="text-sm text-slate-300 space-y-3">
                            <div>
                              <div className="font-medium text-slate-200 mb-2">Что это означает:</div>
                              <p>Внутренняя согласованность нарушена, когда результаты pH, PCO2 и HCO3 не соответствуют друг другу по уравнению Гендерсона-Гассельбаха. Это может указывать на технические ошибки или проблемы с образцом.</p>
                            </div>
                            
                            <div>
                              <div className="font-medium text-slate-200 mb-2">Возможные причины:</div>
                              <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Технические ошибки лаборатории (калибровка, транспортировка)</li>
                                <li>Проблемы с образцом (воздушные пузырьки, долгое хранение)</li>
                                <li>Ошибки при заборе (смешивание крови, попадание тканевой жидкости)</li>
                                <li>Экстремальные клинические ситуации</li>
                              </ul>
                            </div>
                            
                            <div>
                              <div className="font-medium text-slate-200 mb-2">Рекомендуемые действия:</div>
                              <ul className="list-disc list-inside space-y-1 ml-4">
                                <li><strong>Немедленно:</strong> Повторить анализ газов крови</li>
                                <li><strong>Проверить:</strong> Технику забора и транспортировки образца</li>
                                <li><strong>Оценить:</strong> Клиническую картину пациента</li>
                                <li><strong>Рассмотреть:</strong> Альтернативные методы (венозная кровь)</li>
                              </ul>
                            </div>
                            
                            <div className="bg-red-900/30 p-3 rounded-lg border border-red-500">
                              <div className="font-medium text-red-300 mb-1">⚠️ Важно помнить:</div>
                              <p className="text-xs text-red-200">Нарушение внутренней согласованности не исключает наличие кислотно-щелочных нарушений у пациента, но означает, что данные АБГ могут быть недостоверными для принятия клинических решений.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Причины нарушений согласно алгоритму */}
            {result.treatmentAdvice.detectedDisorders.length > 0 && (
              <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
                <h4 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-6 text-center">
                  📚 Причины нарушений согласно алгоритму
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Показываем только релевантные причины для обнаруженных нарушений */}
                  {(result.treatmentAdvice.detectedDisorders.includes('HAGMA') || result.treatmentAdvice.detectedDisorders.includes('Метаболический ацидоз')) && (
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                      <h5 className="text-lg font-bold text-slate-100 mb-4">Причины HAGMA (OMUDPILES)</h5>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li>• <strong>O</strong>ксопролин</li>
                        <li>• <strong>M</strong>етанол</li>
                        <li>• <strong>U</strong>ремия</li>
                        <li>• <strong>D</strong>КА (диабетический кетоацидоз)</li>
                        <li>• <strong>P</strong>аральдегид</li>
                        <li>• <strong>I</strong>НА (изониазид)</li>
                        <li>• <strong>L</strong>актат</li>
                        <li>• <strong>E</strong>тиленгликоль</li>
                        <li>• <strong>S</strong>алицилаты</li>
                      </ul>
                    </div>
                  )}
                  
                  {(result.treatmentAdvice.detectedDisorders.includes('NAGMA') || result.treatmentAdvice.detectedDisorders.includes('Метаболический ацидоз')) && (
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                      <h5 className="text-lg font-bold text-slate-100 mb-4">Причины NAGMA (HARDUP)</h5>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li>• <strong>H</strong>ипералиментация</li>
                        <li>• <strong>A</strong>цетазоламид</li>
                        <li>• <strong>R</strong>ТА (почечный тубулярный ацидоз)</li>
                        <li>• <strong>D</strong>иарея</li>
                        <li>• <strong>U</strong>ретеро-кишечные свищи</li>
                        <li>• <strong>P</strong>анкреатический свищ</li>
                        <li>• <strong>P</strong>остгипервентиляция</li>
                      </ul>
                    </div>
                  )}
                  
                  {result.treatmentAdvice.detectedDisorders.includes('Респираторный ацидоз') && (
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                      <h5 className="text-lg font-bold text-slate-100 mb-4">Причины респираторного ацидоза</h5>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li>• Обструкция дыхательных путей</li>
                        <li>• ХОБЛ, астма</li>
                        <li>• Депрессия ЦНС</li>
                        <li>• ОАС, ОГС</li>
                        <li>• Нервно-мышечные нарушения</li>
                        <li>• Ограничение вентиляции</li>
                        <li>• Повышенная продукция CO2</li>
                      </ul>
                    </div>
                  )}
                  
                  {result.treatmentAdvice.detectedDisorders.includes('Респираторный алкалоз') && (
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                      <h5 className="text-lg font-bold text-slate-100 mb-4">Причины респираторного алкалоза</h5>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li>• Стимуляция ЦНС (лихорадка, боль, страх)</li>
                        <li>• Гипоксемия, гипоксия</li>
                        <li>• Легочные заболевания</li>
                        <li>• Салицилаты, катехоламины</li>
                        <li>• Беременность</li>
                        <li>• Заболевания печени</li>
                        <li>• Сепсис, гипертиреоз</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Советы по лечению обнаруженных расстройств */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
              <h4 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-6 text-center">
                💊 Советы по лечению обнаруженных расстройств
              </h4>
              
              {/* Обнаруженные нарушения */}
              {result.treatmentAdvice.detectedDisorders.length > 0 ? (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md mb-6">
                  <h5 className="text-lg font-bold text-slate-100 mb-4">🎯 Обнаруженные нарушения:</h5>
                  <div className="flex flex-wrap gap-2">
                    {result.treatmentAdvice.detectedDisorders.map((disorder, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                        {disorder}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 p-6 rounded-xl border border-green-600 shadow-md mb-6">
                  <h5 className="text-lg font-bold text-green-300 mb-2">✅ Нарушений не обнаружено</h5>
                  <p className="text-slate-300">Все показатели в пределах нормы. Специфическое лечение не требуется.</p>
                </div>
              )}

              {/* Общие принципы лечения */}
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md mb-6">
                <h5 className="text-lg font-bold text-slate-100 mb-4">🎯 Общие принципы лечения</h5>
                <div className="text-sm text-slate-300 space-y-3">
                  {result.treatmentAdvice.generalPrinciples.map((principle, index) => (
                    <p key={index}><strong>{index + 1}.</strong> {principle}</p>
                  ))}
                </div>
              </div>

              {/* Специфические советы по лечению */}
              {result.treatmentAdvice.specificAdvice.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {result.treatmentAdvice.specificAdvice.map((advice, index) => (
                    <div key={index} className={`bg-slate-900 p-6 rounded-xl border shadow-md ${
                      advice.critical ? 'border-red-600 bg-red-900/20' : 'border-slate-600'
                    }`}>
                      <div className="flex items-center mb-4">
                        <h6 className={`text-lg font-bold ${
                          advice.critical ? 'text-red-300' : 'text-slate-100'
                        }`}>
                          {advice.disorder}
                        </h6>
                        {advice.critical && (
                          <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                            КРИТИЧНО
                          </span>
                        )}
                      </div>
                      
                      <ul className="text-sm text-slate-300 space-y-2 mb-4">
                        {advice.advice.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className="text-slate-400 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {advice.warnings && advice.warnings.length > 0 && (
                        <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-600">
                          <h6 className="text-sm font-semibold text-yellow-300 mb-2">⚠️ Предупреждения:</h6>
                          <ul className="text-xs text-slate-300 space-y-1">
                            {advice.warnings.map((warning, warningIndex) => (
                              <li key={warningIndex} className="flex items-start">
                                <span className="text-yellow-400 mr-2 mt-1">•</span>
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900 p-6 rounded-xl border border-green-600 shadow-md mb-6">
                  <div className="text-center">
                    <h5 className="text-lg font-bold text-green-300 mb-2">✅ Специфическое лечение не требуется</h5>
                    <p className="text-slate-300">Все показатели в пределах нормы. Рекомендуется только общий мониторинг.</p>
                  </div>
                </div>
              )}

              {/* Дополнительные рекомендации */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Мониторинг и контроль */}
                <div className="bg-green-900/20 p-6 rounded-xl border border-green-600 shadow-md">
                  <h5 className="text-lg font-bold text-green-300 mb-4">📊 Мониторинг и контроль</h5>
                  <div className="text-sm text-slate-300 space-y-3">
                    <div>
                      <h6 className="text-base font-semibold text-green-200 mb-2">Частота контроля:</h6>
                      <ul className="space-y-1 text-xs">
                        <li>• Критические нарушения: каждые 2-4 часа</li>
                        <li>• Умеренные нарушения: каждые 6-12 часов</li>
                        <li>• Легкие нарушения: ежедневно</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h6 className="text-base font-semibold text-green-200 mb-2">Дополнительные исследования:</h6>
                      <ul className="space-y-1 text-xs">
                        <li>• Электролиты, креатинин</li>
                        <li>• Лактат, кетоны</li>
                        <li>• Токсикологический скрининг</li>
                        <li>• Рентгенография грудной клетки</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Предупреждения */}
                <div className="bg-yellow-900/20 p-6 rounded-xl border border-yellow-600 shadow-md">
                  <h5 className="text-lg font-bold text-yellow-300 mb-4">⚠️ Важные предупреждения</h5>
                  <div className="text-sm text-slate-300 space-y-3">
                    <div>
                      <h6 className="text-base font-semibold text-yellow-200 mb-2">Не применять NaHCO3:</h6>
                      <ul className="space-y-1 text-xs">
                        <li>• При респираторном ацидозе</li>
                        <li>• При pH &gt; 7.5</li>
                        <li>• Без коррекции основной причины</li>
                        <li>• При гипернатриемии</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h6 className="text-base font-semibold text-yellow-200 mb-2">Осторожность с:</h6>
                      <ul className="space-y-1 text-xs">
                        <li>• Быстрой коррекцией pH</li>
                        <li>• Перекоррекцией</li>
                        <li>• Игнорированием основной причины</li>
                        <li>• Самолечением</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Предупреждение о консультации */}
              <div className="mt-6 bg-blue-900/20 p-6 rounded-xl border border-blue-600 shadow-md">
                <div className="text-center">
                  <p className="text-sm text-blue-200 font-medium">
                    💡 <strong>Помните:</strong> Данные рекомендации носят информационный характер и не заменяют консультацию врача. 
                    Всегда консультируйтесь со специалистом для индивидуального подхода к лечению.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleCopyReport} variant="outline" className="text-lg px-8 py-3 border-slate-600 text-slate-300 hover:bg-slate-700">
                📋 Скопировать отчёт
              </Button>
              <Button onClick={handlePrint} variant="outline" className="text-lg px-8 py-3 border-slate-600 text-slate-300 hover:bg-slate-700">
                🖨️ Печать/Экспорт
              </Button>
            </div>

            {/* Новые расчеты согласно алгоритму */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg">
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-6 text-center">
                🔬 Новые расчеты согласно алгоритму
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                  <div className="text-center">
                    <div className="text-lg text-slate-300 font-medium mb-2">Внутренняя согласованность</div>
                    <div className={`text-3xl lg:text-4xl font-bold ${result.internalConsistency.isValid ? 'text-green-400' : 'text-red-400'}`}>
                      {result.internalConsistency.isValid ? '✓' : '⚠️'}
                    </div>
                    <div className="text-sm text-slate-400 mt-2">
                      {result.internalConsistency.isValid ? 'Согласован' : 'Нарушена'}
                    </div>
                  </div>
                </div>
                
                {result.osmolarGap !== null && (
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                    <div className="text-center">
                      <div className="text-lg text-slate-300 font-medium mb-2">Осмолярный промежуток</div>
                      <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.osmolarGap.toFixed(1)}</div>
                      <div className="text-sm text-slate-400 mt-2">mOsm/kg</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {result.osmolarGap > 10 ? 'Повышен' : result.osmolarGap < -10 ? 'Снижен' : 'Норма'}
                      </div>
                    </div>
                  </div>
                )}
                
                {result.urineAnionGap !== null && (
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 shadow-md">
                    <div className="text-center">
                      <div className="text-lg text-slate-300 font-medium mb-2">Мочевой анионный промежуток</div>
                      <div className="text-3xl lg:text-4xl font-bold text-slate-100">{result.urineAnionGap.toFixed(1)}</div>
                      <div className="text-sm text-slate-400 mt-2">мэкв/л</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {result.urineAnionGap > 10 ? 'Почечная причина' : result.urineAnionGap < -10 ? 'Внепочечная причина' : 'Норма'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
