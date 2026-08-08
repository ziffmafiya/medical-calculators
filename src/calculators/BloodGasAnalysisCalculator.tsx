import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NumberInput } from '../components/NumberInput';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { StatCard } from '../components/StatCard';

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
        title="Калькулятор анализа газов крови"
        subtitle="Расчет анионного промежутка, формулы Винтера, BE по Zander-van Slyke, интерпретация кислотно-щелочного баланса"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NumberInput label="pH" value={data.ph} onChange={(value) => handleInputChange('ph', value)} min={6.8} max={8.0} step={0.01} precision={2} required />
            <NumberInput label="PCO2 (mmHg)" value={data.pco2} onChange={(value) => handleInputChange('pco2', value)} min={20} max={100} step={0.1} precision={1} required />
            <NumberInput label="PaO2 (mmHg)" value={data.pao2} onChange={(value) => handleInputChange('pao2', value)} min={30} max={200} step={1} precision={0} required={false} helperText="Артериальное парциальное давление кислорода" />
            <NumberInput label="HCO3 (mmol/L)" value={data.hco3} onChange={(value) => handleInputChange('hco3', value)} min={10} max={50} step={0.1} precision={1} required />
            <NumberInput label="Na (mmol/L)" value={data.na} onChange={(value) => handleInputChange('na', value)} min={120} max={180} step={1} precision={0} required />
            <NumberInput label="Cl (mmol/L)" value={data.cl} onChange={(value) => handleInputChange('cl', value)} min={80} max={130} step={1} precision={0} required />
            <NumberInput label="K (mmol/L)" value={data.k} onChange={(value) => handleInputChange('k', value)} min={2.0} max={8.0} step={0.1} precision={1} required={false} />
            <Select label="Тип образца" value={data.sampleType} onChange={(value) => handleInputChange('sampleType', value)} options={[{ value: 'arterial', label: 'Артериальная кровь' }, { value: 'venous', label: 'Венозная кровь' }]} required />
            <div className="flex items-center pt-8">
              <Checkbox id="includeK" checked={data.includeK} onChange={(checked) => handleInputChange('includeK', checked)}>
                <span className="text-sm font-medium">Включить K в расчет AnionGap (AG)</span>
              </Checkbox>
            </div>
          </div>

          <div className="mb-6">
            <Button onClick={() => setShowAdvanced(!showAdvanced)} variant="outline" className="w-full">
              {showAdvanced ? 'Скрыть дополнительные параметры' : 'Показать дополнительные параметры'}
            </Button>
          </div>

          {showAdvanced && (
            <Card className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/50">
              <NumberInput label="Альбумин (г/л)" value={data.albumin} onChange={(value) => handleInputChange('albumin', value)} min={1.0} max={6.0} step={0.1} precision={1} required={false} helperText="Для коррекции AnionGap (AG) при гипоальбуминемии" />
              <NumberInput label="FiO2" value={data.fio2} onChange={(value) => handleInputChange('fio2', value)} min={0.1} max={1.0} step={0.01} precision={2} required={false} helperText="Парциальное давление кислорода в дыхательной смеси" />
              <NumberInput label="Возраст (лет)" value={data.age} onChange={(value) => handleInputChange('age', value)} min={0} max={120} step={1} precision={0} required={false} helperText="Для расчета альвеолярно-артериального градиента O2" />
              <NumberInput label="Глюкоза (мг/дл)" value={data.glucose} onChange={(value) => handleInputChange('glucose', value)} min={50} max={800} step={1} precision={0} required={false} helperText="Для расчета осмолярного промежутка" />
              <NumberInput label="BUN (мг/дл)" value={data.bun} onChange={(value) => handleInputChange('bun', value)} min={5} max={100} step={1} precision={0} required={false} helperText="Азот мочевины крови для осмолярного промежутка" />
              <NumberInput label="Этанол (мг/дл)" value={data.ethanol} onChange={(value) => handleInputChange('ethanol', value)} min={0} max={500} step={1} precision={0} required={false} helperText="Концентрация этанола для осмолярного промежутка" />
              <NumberInput label="Моча Na (мэкв/л)" value={data.urineNa} onChange={(value) => handleInputChange('urineNa', value)} min={10} max={200} step={1} precision={0} required={false} helperText="Натрий в моче" />
              <NumberInput label="Моча K (мэкв/л)" value={data.urineK} onChange={(value) => handleInputChange('urineK', value)} min={5} max={100} step={1} precision={0} required={false} helperText="Калий в моче" />
              <NumberInput label="Моча Cl (мэкв/л)" value={data.urineCl} onChange={(value) => handleInputChange('urineCl', value)} min={10} max={200} step={1} precision={0} required={false} helperText="Хлорид в моче" />
              <NumberInput label="Гемоглобин (г/дл)" value={data.hemoglobin} onChange={(value) => handleInputChange('hemoglobin', value)} min={5.0} max={25.0} step={0.1} precision={1} required={false} helperText="Концентрация гемоглобина для расчета BE" />
              <NumberInput label="Насыщение O2 (0.0-1.0)" value={data.oxygenSaturation} onChange={(value) => handleInputChange('oxygenSaturation', value)} min={0.0} max={1.0} step={0.01} precision={2} required={false} helperText="Насыщение кислородом для расчета BE" />
            </Card>
          )}

          <div className="flex justify-center">
            <Button onClick={handleCalculate} variant="primary" className="text-lg px-8 py-3">Рассчитать</Button>
          </div>
        </div>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card title="Интерпретация">
            <div className="space-y-6">
              {!result.internalConsistency.isValid && (
                <Alert variant="error" title="Нарушена внутренняя согласованность АБГ!">
                  Повторите анализ, проверьте технику забора, оцените клиническую картину. Данные могут быть недостоверными.
                  <br />[H+] = (24 × PCO2) / HCO3 = {result.internalConsistency.hydrogenIon.toFixed(1)} nM
                </Alert>
              )}
              {result.internalConsistency.isValid && (
                <Alert variant="success" title="АБГ внутренне согласован">
                  [H+] = (24 × PCO2) / HCO3 = {result.internalConsistency.hydrogenIon.toFixed(1)} nM
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="Основное нарушение" value={result.interpretation.primaryDisorder} />
                {result.interpretation.compensation && <StatCard label="Компенсация" value={result.interpretation.compensation} />}
                {result.interpretation.chronicity && <StatCard label="Хроничность" value={result.interpretation.chronicity} />}
                {result.interpretation.mixedDisorder && <StatCard label="Смешанное расстройство" value={result.interpretation.mixedDisorderExplanation} />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <StatCard label="AnionGap (AG)" value={result.interpretation.anionGapStatus} />
                <StatCard label="Δ/Δ" value={result.interpretation.deltaDeltaInterpretation} />
                {result.interpretation.osmolarGapStatus && <StatCard label="Осмолярный промежуток" value={result.interpretation.osmolarGapStatus} />}
                {result.interpretation.urineAnionGapStatus && <StatCard label="Мочевой анионный промежуток" value={result.interpretation.urineAnionGapStatus} />}
              </div>
            </div>
          </Card>

          <Card title="Основные результаты">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="AnionGap (AG)" value={result.anionGap.toFixed(1)} unit="mmol/L" sublabel="Норма: 8-16" />
              <StatCard label="Текущий CO2" value={data.pco2} unit="mmHg" sublabel="Норма: 35-45" />
              <StatCard label="Δ/Δ" value={result.deltaDelta !== null ? result.deltaDelta.toFixed(2) : 'Н/Д'} unit="Ratio" sublabel="Норма: 0.8-2.0" />
              <StatCard label="PaO2" value={data.pao2 || 'Н/Д'} unit="mmHg" sublabel="Норма: 80-100" />
              <StatCard label="Ожидаемый PaCO2" value={result.expectedPaCO2Winter.toFixed(1)} unit="± 2 mmHg" />
              {result.anionGapCorrected !== null && <StatCard label="Скорр. AG" value={result.anionGapCorrected.toFixed(1)} unit="mmol/L" sublabel="Норма: 8-16" />}
              {result.osmolarGap !== null && <StatCard label="Осмолярный промежуток" value={result.osmolarGap.toFixed(1)} unit="mOsm/kg" sublabel="Норма: -10 до +10" />}
              {result.urineAnionGap !== null && <StatCard label="Мочевой анионный промежуток" value={result.urineAnionGap.toFixed(1)} unit="мэкв/л" sublabel="Норма: -10 до +10" />}
              <StatCard label="Избыток оснований (BE)" value={result.baseExcess !== null && result.baseExcess !== undefined ? result.baseExcess.toFixed(1) : 'Н/Д'} unit="mmol/L" sublabel="По формуле Zander-van Slyke" />
            </div>
          </Card>

          {data.pao2 && (
            <Card title="Анализ оксигенации">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <StatCard label="Статус PaO2" value={result.pao2Status} />
                {result.oxygenationIndex && <StatCard label="Индекс оксигенации" value={result.oxygenationIndex.toFixed(0)} unit="PaO2/FiO2" />}
              </div>
            </Card>
          )}

          <Card title="Дополнительные расчеты">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label="Общая концентрация CO2" value={result.totalCO2.toFixed(1)} unit="mmol/L" sublabel="Норма: 22-28" />
              <StatCard label="Концентрация [H+]" value={result.hydrogenIon.toFixed(1)} unit="nM" sublabel="Норма: 35-45" />
              <StatCard label="A-a градиент O2" value={result.aaGradient !== null ? result.aaGradient.toFixed(1) : 'Н/Д'} unit="mmHg" sublabel="Норма: < 20" />
              <StatCard label="Ожидаемый PaCO2 (метаб. алкалоз)" value={result.expectedPaCO2Metabolic.toFixed(1)} unit="± 1.5 mmHg" sublabel="Норма: 35-45" />
            </div>
          </Card>

          {result.interpretation.warnings.length > 0 && (
            <Card title="Предупреждения">
              <div className="space-y-4">
                {result.interpretation.warnings.map((warning, index) => (
                  <Alert key={index} variant="warning">{warning}</Alert>
                ))}
              </div>
            </Card>
          )}

          <Card title="Логика принятия решений">
             <div className="mb-4">
              <Button onClick={() => setShowDecisionLogic(!showDecisionLogic)} variant="outline">
                {showDecisionLogic ? 'Скрыть логику' : 'Показать логику'}
              </Button>
            </div>
            {showDecisionLogic && (
              <div className="space-y-2">
                {result.interpretation.reasoning.map((reason, index) => (
                  <Alert key={index} variant="info">{reason}</Alert>
                ))}
              </div>
            )}
          </Card>

          <Card title="Советы по лечению">
            <div className="space-y-6">
              {result.treatmentAdvice.detectedDisorders.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.treatmentAdvice.detectedDisorders.map((disorder, index) => (
                    <Badge key={index} variant="brand">{disorder}</Badge>
                  ))}
                </div>
              ) : (
                <Alert variant="success" title="Специфическое лечение не требуется">
                  Все показатели в пределах нормы. Рекомендуется только общий мониторинг.
                </Alert>
              )}

              {result.treatmentAdvice.specificAdvice.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {result.treatmentAdvice.specificAdvice.map((advice, index) => (
                    <Card key={index} title={advice.disorder} className={advice.critical ? "border-[var(--error-500)]" : ""}>
                      {advice.critical && <Badge variant="error" className="mb-2">КРИТИЧНО</Badge>}
                      <ul className="list-disc list-inside space-y-1 text-sm text-[var(--gray-300)]">
                        {advice.advice.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                      {advice.warnings && advice.warnings.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {advice.warnings.map((w, i) => <Alert key={i} variant="warning">{w}</Alert>)}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              <div>
                <h4 className="text-lg font-medium text-[var(--foreground)] mb-2">Общие принципы лечения</h4>
                <ul className="list-decimal list-inside space-y-1 text-sm text-[var(--gray-300)]">
                  {result.treatmentAdvice.generalPrinciples.map((principle, index) => (
                    <li key={index}>{principle}</li>
                  ))}
                </ul>
              </div>

              <Alert variant="info">
                Данные рекомендации носят информационный характер и не заменяют консультацию врача. Всегда консультируйтесь со специалистом для индивидуального подхода к лечению.
              </Alert>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleCopyReport} variant="outline">Скопировать отчёт</Button>
            <Button onClick={handlePrint} variant="outline">Печать/Экспорт</Button>
          </div>
        </div>
      )}
    </div>
  );
};
