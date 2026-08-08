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

const SlidersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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

    selectedHypnotic: 'propofol',
    selectedAnalgesic: 'fentanyl',
    selectedRelaxant: 'atracurium',

    propofolInductionDosePerKg: 2.0,
    propofolMaintDosePerKgMin: 100,

    midazolamInductionDosePerKg: 0.2,

    ketamineInductionDosePerKg: 1.5,
    hasShock: false,

    thiopentalInductionDosePerKg: 4.0,

    fentanylInductionDosePerKg: 0.75,
    fentanylMaintDosePerKgHour: 1.5,

    remifentanilInductionDosePerKgMin: 0.75,
    remifentanilMaintDosePerKgMin: 0.25,

    atracuriumDosePerKg: 0.45,
    rocuroniumDosePerKg: 0.6,
    succinylcholineDosePerKg: 0.6,

    propofolConcMgMl: 10,
    midazolamConcMgMl: 5,
    ketamineConcMgMl: 50,
    thiopentalConcMgMl: 25,
    fentanylConcMcgMl: 50,
    remifentanilConcMcgMl: 50,
    atracuriumConcMgMl: 10,
    rocuroniumConcMgMl: 10,
    succinylcholineConcMgMl: 20,
  });

  const [showAdvancedConc, setShowAdvancedConc] = useState(false);
  const [showSection2, setShowSection2] = useState(false);
  const [showSection4, setShowSection4] = useState(false);
  const [showMatrixDetails, setShowMatrixDetails] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpandCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

    const isObese = bmi >= 30;
    const isOverweight = weight > 1.2 * ibw && bmi < 30;

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
      isOverweight,
    };
  }, [inputs.weight, inputs.height, inputs.gender, inputs.lbwFormula]);

  // Drug calculations
  const drugDetails = useMemo<DrugDoseDetail[]>(() => {
    if (!anthropometrics) return [];

    const details: DrugDoseDetail[] = [];
    const { tbw, ibw, selectedLbw } = anthropometrics;

    const showPropofol = inputs.selectedHypnotic === 'propofol' || inputs.selectedHypnotic === 'all';
    const showMidazolam = inputs.selectedHypnotic === 'midazolam' || inputs.selectedHypnotic === 'all';
    const showKetamine = inputs.selectedHypnotic === 'ketamine' || inputs.selectedHypnotic === 'all';
    const showThiopental = inputs.selectedHypnotic === 'thiopental' || inputs.selectedHypnotic === 'all';

    const showFentanyl = inputs.selectedAnalgesic === 'fentanyl' || inputs.selectedAnalgesic === 'all';
    const showRemifentanil = inputs.selectedAnalgesic === 'remifentanil' || inputs.selectedAnalgesic === 'all';

    const showRocuronium = inputs.selectedRelaxant === 'rocuronium' || inputs.selectedRelaxant === 'both' || inputs.selectedRelaxant === 'all';
    const showAtracurium = inputs.selectedRelaxant === 'atracurium' || inputs.selectedRelaxant === 'both' || inputs.selectedRelaxant === 'all';
    const showSuccinylcholine = inputs.selectedRelaxant === 'succinylcholine' || inputs.selectedRelaxant === 'all';

    // --- 1. HYPNOTIC SELECTOR ---
    if (showPropofol) {
      // Propofol Induction (LBW)
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

      // Propofol Maintenance (TBW)
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
    }

    if (showMidazolam) {
      // Midazolam Induction (LBW)
      const midMinMg = 0.1 * selectedLbw;
      const midMaxMg = 0.3 * selectedLbw;
      const midSelectedMg = inputs.midazolamInductionDosePerKg * selectedLbw;
      const midConc = inputs.midazolamConcMgMl > 0 ? inputs.midazolamConcMgMl : 5;

      details.push({
        id: 'midazolam-induction',
        drugName: t.midazolamName || 'Midazolam',
        category: 'hypnotic',
        phase: 'induction',
        weightMetricUsed: 'LBW',
        weightValue: selectedLbw,
        dosePerKgRange: `0.1 – 0.3 ${t.unitMgKg || 'mg/kg'}`,
        selectedDosePerKg: inputs.midazolamInductionDosePerKg,
        unitPerKg: t.unitMgKg || 'mg/kg',
        totalDoseMin: midMinMg,
        totalDoseMax: midMaxMg,
        selectedTotalDose: midSelectedMg,
        totalDoseUnit: 'mg',
        volumeMinMl: midMinMg / midConc,
        volumeMaxMl: midMaxMg / midConc,
        selectedVolumeMl: midSelectedMg / midConc,
        concentrationStr: `${midConc} mg/ml`,
        explanation: t.midazolamInductionExp || 'Benzodiazepine hypnotic dosed on LBW. Reduce dose by 50% in elderly, severe shock or hemodynamically compromised patients.',
      });
    }

    if (showKetamine) {
      // Ketamine Induction (TBW)
      const maxRange = inputs.hasShock ? 1.0 : 2.0;
      const ketMinMg = 0.5 * tbw;
      const ketMaxMg = maxRange * tbw;
      const ketSelectedMg = inputs.ketamineInductionDosePerKg * tbw;
      const ketConc = inputs.ketamineConcMgMl > 0 ? inputs.ketamineConcMgMl : 50;

      details.push({
        id: 'ketamine-induction',
        drugName: t.ketamineName || 'Ketamine',
        category: 'hypnotic',
        phase: 'induction',
        weightMetricUsed: 'TBW',
        weightValue: tbw,
        dosePerKgRange: inputs.hasShock ? `0.5 – 1.0 ${t.unitMgKg || 'mg/kg'} (Shock)` : `0.5 – 2.0 ${t.unitMgKg || 'mg/kg'}`,
        selectedDosePerKg: inputs.ketamineInductionDosePerKg,
        unitPerKg: t.unitMgKg || 'mg/kg',
        totalDoseMin: ketMinMg,
        totalDoseMax: ketMaxMg,
        selectedTotalDose: ketSelectedMg,
        totalDoseUnit: 'mg',
        volumeMinMl: ketMinMg / ketConc,
        volumeMaxMl: ketMaxMg / ketConc,
        selectedVolumeMl: ketSelectedMg / ketConc,
        concentrationStr: `${ketConc} mg/ml`,
        explanation: inputs.hasShock 
          ? (t.ketamineInductionShockExp || 'Dissociative anesthetic with sympathetic activation. Reduced to 0.5-1.0 mg/kg in shock state due to potential direct myocardial depression.')
          : (t.ketamineInductionNormExp || 'Dissociative anesthetic. Maintains blood pressure and respiratory drive via sympathetic system stimulation.'),
      });
    }

    if (showThiopental) {
      // Thiopental Induction (LBW)
      const thioMinMg = 3.0 * selectedLbw;
      const thioMaxMg = 5.0 * selectedLbw;
      const thioSelectedMg = inputs.thiopentalInductionDosePerKg * selectedLbw;
      const thioConc = inputs.thiopentalConcMgMl > 0 ? inputs.thiopentalConcMgMl : 25;

      details.push({
        id: 'thiopental-induction',
        drugName: t.thiopentalName || 'Thiopental',
        category: 'hypnotic',
        phase: 'induction',
        weightMetricUsed: 'LBW',
        weightValue: selectedLbw,
        dosePerKgRange: `3.0 – 5.0 ${t.unitMgKg || 'mg/kg'}`,
        selectedDosePerKg: inputs.thiopentalInductionDosePerKg,
        unitPerKg: t.unitMgKg || 'mg/kg',
        totalDoseMin: thioMinMg,
        totalDoseMax: thioMaxMg,
        selectedTotalDose: thioSelectedMg,
        totalDoseUnit: 'mg',
        volumeMinMl: thioMinMg / thioConc,
        volumeMaxMl: thioMaxMg / thioConc,
        selectedVolumeMl: thioSelectedMg / thioConc,
        concentrationStr: `${thioConc} mg/ml (2.5%)`,
        explanation: t.thiopentalInductionExp || 'Barbiturate hypnotic dosed on LBW to avoid severe vasodilation, myocardial depression, and prolonged awakening.',
      });
    }

    // --- 2. ANALGESIC SELECTOR ---
    if (showFentanyl) {
      // Fentanyl Induction (LBW)
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

      // Fentanyl Maintenance (LBW)
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
    }

    if (showRemifentanil) {
      // Remifentanil Continuous Infusion Induction (LBW)
      const remiIndMinMcgMin = 0.5 * selectedLbw;
      const remiIndMaxMcgMin = 1.0 * selectedLbw;
      const remiIndSelectedMcgMin = inputs.remifentanilInductionDosePerKgMin * selectedLbw;
      const remiConc = inputs.remifentanilConcMcgMl > 0 ? inputs.remifentanilConcMcgMl : 50;

      const remiIndMinMcgH = remiIndMinMcgMin * 60;
      const remiIndMaxMcgH = remiIndMaxMcgMin * 60;
      const remiIndSelectedMcgH = remiIndSelectedMcgMin * 60;

      details.push({
        id: 'remifentanil-induction',
        drugName: t.remifentanilName || 'Remifentanil',
        category: 'analgesic',
        phase: 'induction',
        weightMetricUsed: 'LBW',
        weightValue: selectedLbw,
        dosePerKgRange: `0.5 – 1.0 ${t.unitMcgKgMin || 'mcg/kg/min'}`,
        selectedDosePerKg: inputs.remifentanilInductionDosePerKgMin,
        unitPerKg: t.unitMcgKgMin || 'mcg/kg/min',
        totalDoseMin: remiIndMinMcgH,
        totalDoseMax: remiIndMaxMcgH,
        selectedTotalDose: remiIndSelectedMcgH,
        totalDoseUnit: t.unitMcgHour || 'mcg/h',
        volumeMinMl: remiIndMinMcgH / remiConc,
        volumeMaxMl: remiIndMaxMcgH / remiConc,
        selectedVolumeMl: remiIndSelectedMcgH / remiConc,
        concentrationStr: `${remiConc} mcg/ml`,
        explanation: t.remifentanilInductionExp || 'Ultra-short acting mu-opioid agonist metabolized by plasma esterases. Induction IV continuous infusion: 0.5–1.0 mcg/kg/min.',
      });

      // Remifentanil Maintenance (LBW)
      const remiMaintMinMcgMin = 0.05 * selectedLbw;
      const remiMaintMaxMcgMin = 2.0 * selectedLbw;
      const remiMaintSelectedMcgMin = inputs.remifentanilMaintDosePerKgMin * selectedLbw;

      const remiMaintMinMcgH = remiMaintMinMcgMin * 60;
      const remiMaintMaxMcgH = remiMaintMaxMcgMin * 60;
      const remiMaintSelectedMcgH = remiMaintSelectedMcgMin * 60;

      details.push({
        id: 'remifentanil-maintenance',
        drugName: t.remifentanilMaintName || 'Remifentanil (Infusion)',
        category: 'analgesic',
        phase: 'maintenance',
        weightMetricUsed: 'LBW',
        weightValue: selectedLbw,
        dosePerKgRange: `0.05 – 2.0 ${t.unitMcgKgMin || 'mcg/kg/min'}`,
        selectedDosePerKg: inputs.remifentanilMaintDosePerKgMin,
        unitPerKg: t.unitMcgKgMin || 'mcg/kg/min',
        totalDoseMin: remiMaintMinMcgH,
        totalDoseMax: remiMaintMaxMcgH,
        selectedTotalDose: remiMaintSelectedMcgH,
        totalDoseUnit: t.unitMcgHour || 'mcg/h',
        rateMinMlHour: remiMaintMinMcgH / remiConc,
        rateMaxMlHour: remiMaintMaxMcgH / remiConc,
        selectedRateMlHour: remiMaintSelectedMcgH / remiConc,
        concentrationStr: `${remiConc} mcg/ml`,
        explanation: t.remifentanilMaintExp || 'Anesthesia maintenance with propofol: IV 0.25 mcg/kg/min (range: 0.05 to 2.0 mcg/kg/min). Dosed on LBW.',
      });
    }

    // --- 3. MUSCLE RELAXANT SELECTOR ---
    if (showRocuronium) {
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

    if (showAtracurium) {
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

    if (showSuccinylcholine) {
      const suxMinMg = 0.3 * tbw;
      const suxMaxMg = 1.5 * tbw;
      const suxSelectedMg = inputs.succinylcholineDosePerKg * tbw;
      const suxConc = inputs.succinylcholineConcMgMl > 0 ? inputs.succinylcholineConcMgMl : 20;

      details.push({
        id: 'succinylcholine-induction',
        drugName: t.succinylcholineName || 'Succinylcholine',
        category: 'relaxant',
        phase: 'induction',
        weightMetricUsed: 'TBW',
        weightValue: tbw,
        dosePerKgRange: `0.3 – 1.5 ${t.unitMgKg || 'mg/kg'} (RSI 1.0–1.5)`,
        selectedDosePerKg: inputs.succinylcholineDosePerKg,
        unitPerKg: t.unitMgKg || 'mg/kg',
        totalDoseMin: suxMinMg,
        totalDoseMax: suxMaxMg,
        selectedTotalDose: suxSelectedMg,
        totalDoseUnit: 'mg',
        volumeMinMl: suxMinMg / suxConc,
        volumeMaxMl: suxMaxMg / suxConc,
        selectedVolumeMl: suxSelectedMg / suxConc,
        concentrationStr: `${suxConc} mg/ml (2%)`,
        explanation: t.succinylcholineInductionExp || 'Depolarizing muscle relaxant dosed on TBW (actual body weight). Standard intubation: 0.6 mg/kg (0.3-1.1 mg/kg); Rapid-Sequence Intubation (RSI): 1.0-1.5 mg/kg.',
      });
    }

    return details;
  }, [anthropometrics, inputs, t]);

  const groupedDrugs = useMemo(() => {
    if (!drugDetails.length) return [];

    const map: Record<string, {
      id: string;
      name: string;
      category: 'hypnotic' | 'analgesic' | 'relaxant';
      concentrationStr: string;
      induction?: DrugDoseDetail;
      maintenance?: DrugDoseDetail;
    }> = {};

    drugDetails.forEach(d => {
      let key = d.id.includes('propofol') ? 'propofol' :
                d.id.includes('midazolam') ? 'midazolam' :
                d.id.includes('ketamine') ? 'ketamine' :
                d.id.includes('thiopental') ? 'thiopental' :
                d.id.includes('fentanyl') ? 'fentanyl' :
                d.id.includes('remifentanil') ? 'remifentanil' :
                d.id.includes('rocuronium') ? 'rocuronium' :
                d.id.includes('succinylcholine') ? 'succinylcholine' : 'atracurium';
      
      if (!map[key]) {
        map[key] = {
          id: key,
          name: d.drugName.replace(' (Infusion)', '').replace(' (Инфузия)', '').replace(' (Інфузія)', ''),
          category: d.category,
          concentrationStr: d.concentrationStr,
        };
      }
      if (d.phase === 'induction') map[key].induction = d;
      if (d.phase === 'maintenance') map[key].maintenance = d;
    });

    return Object.values(map);
  }, [drugDetails]);

  const handleReset = () => {
    setInputs({
      gender: 'male',
      age: 45,
      height: 175,
      weight: 85,
      lbwFormula: 'janmahasatian',

      selectedHypnotic: 'propofol',
      selectedAnalgesic: 'fentanyl',
      selectedRelaxant: 'atracurium',

      propofolInductionDosePerKg: 2.0,
      propofolMaintDosePerKgMin: 100,

      midazolamInductionDosePerKg: 0.2,

      ketamineInductionDosePerKg: 1.5,
      hasShock: false,

      thiopentalInductionDosePerKg: 4.0,

      fentanylInductionDosePerKg: 0.75,
      fentanylMaintDosePerKgHour: 1.5,

      remifentanilInductionDosePerKgMin: 0.75,
      remifentanilMaintDosePerKgMin: 0.25,

      atracuriumDosePerKg: 0.45,
      rocuroniumDosePerKg: 0.6,
      succinylcholineDosePerKg: 0.6,

      propofolConcMgMl: 10,
      midazolamConcMgMl: 5,
      ketamineConcMgMl: 50,
      thiopentalConcMgMl: 25,
      fentanylConcMcgMl: 50,
      remifentanilConcMcgMl: 50,
      atracuriumConcMgMl: 10,
      rocuroniumConcMgMl: 10,
      succinylcholineConcMgMl: 20,
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
              {t.patientDataSection || 'Patient Data'}
            </h2>
          </div>
          <Button onClick={handleReset} variant="outline" size="xs" className="text-slate-400 hover:text-white">
            {t.reset || 'Reset'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Patient Form Input Card */}
          <div className="lg:col-span-6 bg-[#101828] border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm">
            {/* Gender Toggle */}
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

            {/* Age, Height, Weight */}
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

            {/* LBW Formula */}
            <div>
              <Select
                label={t.lbwFormulaLabel || 'LBW Formula'}
                value={inputs.lbwFormula}
                onChange={(val) => setInputs({ ...inputs, lbwFormula: val as 'janmahasatian' | 'james' })}
                options={[
                  { value: 'janmahasatian', label: t.janmahasatianGoldStandard || 'Janmahasatian (2005) — Gold Standard' },
                  { value: 'james', label: t.jamesClassic || 'James (1976) — Classic' },
                ]}
              />
            </div>

            {/* DRUG SELECTOR DROPDOWNS (1 Hypnotic, 1 Analgesic, 1 Relaxant) */}
            <div className="pt-3 border-t border-slate-800/60 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-sky-400">
                {t.drugSelectionTitle || 'Intubation Drug Selection (Hypnotic + Analgesic + Relaxant)'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label={t.hypnoticSelectLabel || 'Hypnotic / Sedative'}
                  value={inputs.selectedHypnotic}
                  onChange={(val) => setInputs({ ...inputs, selectedHypnotic: val as any })}
                  options={[
                    { value: 'all', label: t.allHypnoticsOption || '★ Show All Hypnotics' },
                    { value: 'propofol', label: t.propofolName || 'Propofol' },
                    { value: 'midazolam', label: t.midazolamName || 'Midazolam' },
                    { value: 'ketamine', label: t.ketamineName || 'Ketamine' },
                    { value: 'thiopental', label: t.thiopentalName || 'Thiopental' },
                  ]}
                />

                <Select
                  label={t.analgesicSelectLabel || 'Analgesic / Opioid'}
                  value={inputs.selectedAnalgesic}
                  onChange={(val) => setInputs({ ...inputs, selectedAnalgesic: val as any })}
                  options={[
                    { value: 'all', label: t.allAnalgesicsOption || '★ Show All Analgesics' },
                    { value: 'fentanyl', label: t.fentanylName || 'Fentanyl' },
                    { value: 'remifentanil', label: t.remifentanilName || 'Remifentanil' },
                  ]}
                />

                <Select
                  label={t.relaxantForIntubationLabel || 'Muscle Relaxant'}
                  value={inputs.selectedRelaxant}
                  onChange={(val) => setInputs({ ...inputs, selectedRelaxant: val as any })}
                  options={[
                    { value: 'all', label: t.allRelaxantsOption || '★ Show All Muscle Relaxants' },
                    { value: 'both', label: t.showBothRelaxants || 'Rocuronium + Atracurium' },
                    { value: 'rocuronium', label: t.rocuroniumName || 'Rocuronium' },
                    { value: 'atracurium', label: t.atracuriumName || 'Atracurium' },
                    { value: 'succinylcholine', label: t.succinylcholineName || 'Succinylcholine' },
                  ]}
                />
              </div>

              {(inputs.selectedHypnotic === 'ketamine' || inputs.selectedHypnotic === 'all') && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Checkbox
                    id="ketamine-shock"
                    checked={inputs.hasShock}
                    onChange={(checked) => setInputs({ ...inputs, hasShock: checked })}
                  >
                    {t.hasShockLabel || 'Patient in shock state (dose 0.5–1.0 mg/kg)'}
                  </Checkbox>
                </div>
              )}
            </div>

            {/* Concentration Settings Accordion Toggle */}
            <div className="pt-3 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setShowAdvancedConc(!showAdvancedConc)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 rounded-xl transition-all text-xs font-semibold text-slate-300 hover:text-white group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
                    <SlidersIcon />
                  </div>
                  <span>{t.showConcSettings || 'Solution Concentration Settings (mg/ml)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-400">
                    {showAdvancedConc ? (t.hideLabel || 'Hide') : (t.configureLabel || 'Configure')}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showAdvancedConc ? 'rotate-180 text-sky-400' : ''}`} />
                </div>
              </button>

              {showAdvancedConc && (
                <div className="mt-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up">
                  <NumberInput label={`${t.propofolName || 'Propofol'} (${t.unitMgMl || 'mg/ml'})`} value={inputs.propofolConcMgMl} onChange={(val) => setInputs({ ...inputs, propofolConcMgMl: val || 10 })} />
                  <NumberInput label={`${t.midazolamName || 'Midazolam'} (${t.unitMgMl || 'mg/ml'})`} value={inputs.midazolamConcMgMl} onChange={(val) => setInputs({ ...inputs, midazolamConcMgMl: val || 5 })} />
                  <NumberInput label={`${t.ketamineName || 'Ketamine'} (${t.unitMgMl || 'mg/ml'})`} value={inputs.ketamineConcMgMl} onChange={(val) => setInputs({ ...inputs, ketamineConcMgMl: val || 50 })} />
                  <NumberInput label={`${t.thiopentalName || 'Thiopental'} (${t.unitMgMl || 'mg/ml'})`} value={inputs.thiopentalConcMgMl} onChange={(val) => setInputs({ ...inputs, thiopentalConcMgMl: val || 25 })} />
                  <NumberInput label={`${t.fentanylName || 'Fentanyl'} (${t.unitMcgMl || 'mcg/ml'})`} value={inputs.fentanylConcMcgMl} onChange={(val) => setInputs({ ...inputs, fentanylConcMcgMl: val || 50 })} />
                  <NumberInput label={`${t.remifentanilName || 'Remifentanil'} (${t.unitMcgMl || 'mcg/ml'})`} value={inputs.remifentanilConcMcgMl} onChange={(val) => setInputs({ ...inputs, remifentanilConcMcgMl: val || 50 })} />
                  <NumberInput label={`${t.rocuroniumName || 'Rocuronium'} (${t.unitMgMl || 'mg/ml'})`} value={inputs.rocuroniumConcMgMl} onChange={(val) => setInputs({ ...inputs, rocuroniumConcMgMl: val || 10 })} />
                  <NumberInput label={`${t.atracuriumName || 'Atracurium'} (${t.unitMgMl || 'mg/ml'})`} value={inputs.atracuriumConcMgMl} onChange={(val) => setInputs({ ...inputs, atracuriumConcMgMl: val || 10 })} />
                  <NumberInput label={`${t.succinylcholineName || 'Succinylcholine'} (${t.unitMgMl || 'mg/ml'})`} value={inputs.succinylcholineConcMgMl} onChange={(val) => setInputs({ ...inputs, succinylcholineConcMgMl: val || 20 })} />
                </div>
              )}
            </div>
          </div>

          {/* Anthropometric Matrix Stat Cards (Compact & Expandable) */}
          <div className="lg:col-span-6">
            {anthropometrics ? (
              <div 
                className="bg-[#101828] border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-sm transition-all text-left cursor-pointer group/matrix"
                onClick={() => setShowMatrixDetails(!showMatrixDetails)}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider group-hover/matrix:text-sky-400 transition-colors">
                      {t.anthropometricMatrixTitle || 'Anthropometric Matrix'}
                    </h3>
                    <Badge variant="gray" className="font-mono text-xs">
                      BMI: {anthropometrics.bmi.toFixed(1)} kg/m²
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 group-hover/matrix:text-slate-200">
                      {showMatrixDetails ? 'Hide' : 'Details'}
                    </span>
                    <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showMatrixDetails ? 'rotate-180 text-sky-400' : ''}`} />
                  </div>
                </div>

                {/* Mini Summary Grid (Always Visible) */}
                <div className="grid grid-cols-4 gap-2 bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-center">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">TBW</span>
                    <span className="text-sm font-bold font-mono text-white">{anthropometrics.tbw.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">kg</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">IBW</span>
                    <span className="text-sm font-bold font-mono text-white">{anthropometrics.ibw.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">kg</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">LBW</span>
                    <span className="text-sm font-bold font-mono text-white">{anthropometrics.selectedLbw.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">kg</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Vt (6-8)</span>
                    <span className="text-sm font-bold font-mono text-sky-400">{anthropometrics.vtMin}–{anthropometrics.vtMax} <span className="text-[10px] text-slate-400 font-normal">ml</span></span>
                  </div>
                </div>

                {/* Expanded Detailed Matrix */}
                {showMatrixDetails && (
                  <div className="space-y-4 pt-3 border-t border-slate-800/60 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-2 gap-3.5">
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
                        {t.obesityWarningText || 'Actual weight (TBW) significantly exceeds ideal weight (BMI ≥ 30). Using TBW for Propofol induction or muscle relaxants will cause severe overdose!'}
                      </Alert>
                    )}

                    {anthropometrics.isOverweight && (
                      <Alert
                        variant="warning"
                        title={t.overweightWarningTitle || 'Warning (Overweight: TBW > 120% IBW)'}
                      >
                        {t.overweightWarningText || 'Actual weight exceeds ideal weight by more than 20%. Use LBW for Propofol induction and IBW for muscle relaxants to avoid overdose.'}
                      </Alert>
                    )}
                  </div>
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

      {/* SECTION 2: Interactive Target Dosage Tuning (Collapsible) */}
      {anthropometrics && (
        <div className="space-y-4">
          <div
            onClick={() => setShowSection2(!showSection2)}
            className="flex items-center justify-between cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
                2
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight group-hover:text-sky-400 transition-colors">
                {t.dosageFineTuningTitle || 'Interactive Target Dosage Tuning'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 group-hover:text-slate-200">
                {showSection2 ? (t.hideLabel || 'Hide Sliders') : (t.configureLabel || 'Configure Sliders')}
              </span>
              <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showSection2 ? 'rotate-180 text-sky-400' : ''}`} />
            </div>
          </div>

          {showSection2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch animate-slide-up">
              {/* HYPNOTIC SLIDERS */}
              {(inputs.selectedHypnotic === 'propofol' || inputs.selectedHypnotic === 'all') && (
                <>
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
                </>
              )}

              {(inputs.selectedHypnotic === 'midazolam' || inputs.selectedHypnotic === 'all') && renderSlider(
                t.midazolamInductionSliderLabel || 'Midazolam Induction (LBW):',
                inputs.midazolamInductionDosePerKg,
                0.1, 0.3, 0.01,
                t.unitMgKg || 'mg/kg',
                'midazolamInductionDosePerKg',
                [
                  { val: 0.1, label: '0.1' },
                  { val: 0.2, label: `0.2 (${t.standardLabel || 'Standard'})` },
                  { val: 0.3, label: '0.3' }
                ]
              )}

              {(inputs.selectedHypnotic === 'ketamine' || inputs.selectedHypnotic === 'all') && renderSlider(
                t.ketamineInductionSliderLabel || 'Ketamine Induction (TBW):',
                inputs.ketamineInductionDosePerKg,
                0.5, inputs.hasShock ? 1.0 : 2.0, 0.1,
                t.unitMgKg || 'mg/kg',
                'ketamineInductionDosePerKg',
                inputs.hasShock ? [
                  { val: 0.5, label: '0.5' },
                  { val: 0.75, label: '0.75' },
                  { val: 1.0, label: '1.0 (Shock Max)' }
                ] : [
                  { val: 0.5, label: '0.5' },
                  { val: 1.0, label: '1.0' },
                  { val: 1.5, label: '1.5' },
                  { val: 2.0, label: '2.0' }
                ]
              )}

              {(inputs.selectedHypnotic === 'thiopental' || inputs.selectedHypnotic === 'all') && renderSlider(
                t.thiopentalInductionSliderLabel || 'Thiopental Induction (LBW):',
                inputs.thiopentalInductionDosePerKg,
                3.0, 5.0, 0.1,
                t.unitMgKg || 'mg/kg',
                'thiopentalInductionDosePerKg',
                [
                  { val: 3.0, label: '3.0' },
                  { val: 4.0, label: `4.0 (${t.standardLabel || 'Standard'})` },
                  { val: 5.0, label: '5.0' }
                ]
              )}

              {/* ANALGESIC SLIDERS */}
              {(inputs.selectedAnalgesic === 'fentanyl' || inputs.selectedAnalgesic === 'all') && (
                <>
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
                </>
              )}

              {(inputs.selectedAnalgesic === 'remifentanil' || inputs.selectedAnalgesic === 'all') && (
                <>
                  {renderSlider(
                    t.remifentanilInductionSliderLabel || 'Remifentanil Infusion (LBW):',
                    inputs.remifentanilInductionDosePerKgMin,
                    0.5, 1.0, 0.05,
                    t.unitMcgKgMin || 'mcg/kg/min',
                    'remifentanilInductionDosePerKgMin',
                    [
                      { val: 0.5, label: '0.5' },
                      { val: 0.75, label: '0.75' },
                      { val: 1.0, label: '1.0' }
                    ]
                  )}
                  {renderSlider(
                    t.remifentanilMaintSliderLabel || 'Remifentanil Maintenance (LBW):',
                    inputs.remifentanilMaintDosePerKgMin,
                    0.05, 2.0, 0.05,
                    t.unitMcgKgMin || 'mcg/kg/min',
                    'remifentanilMaintDosePerKgMin',
                    [
                      { val: 0.05, label: '0.05' },
                      { val: 0.25, label: '0.25 (Propofol)' },
                      { val: 1.0, label: '1.0' },
                      { val: 2.0, label: '2.0' }
                    ]
                  )}
                </>
              )}

              {/* RELAXANT SLIDERS */}
              {(inputs.selectedRelaxant === 'rocuronium' || inputs.selectedRelaxant === 'both' || inputs.selectedRelaxant === 'all') && renderSlider(
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

              {(inputs.selectedRelaxant === 'atracurium' || inputs.selectedRelaxant === 'both' || inputs.selectedRelaxant === 'all') && renderSlider(
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

              {(inputs.selectedRelaxant === 'succinylcholine' || inputs.selectedRelaxant === 'all') && renderSlider(
                t.succinylcholineInductionSliderLabel || 'Succinylcholine Induction (TBW):',
                inputs.succinylcholineDosePerKg,
                0.3, 1.5, 0.05,
                t.unitMgKg || 'mg/kg',
                'succinylcholineDosePerKg',
                [
                  { val: 0.6, label: '0.6 (Std)' },
                  { val: 1.0, label: '1.0 (RSI)' },
                  { val: 1.5, label: '1.5 (RSI Max)' }
                ]
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Summary Dosing Cards (Ultra-Compact & Expandable) */}
      {groupedDrugs.length > 0 && anthropometrics && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
              3
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t.summaryTableTitle || 'Summary Dosing Table'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
            {groupedDrugs.map((group) => {
              const isExpanded = !!expandedCards[group.id];
              const ind = group.induction;
              const maint = group.maintenance;

              return (
                <div 
                  key={group.id} 
                  className="bg-[#101828] border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 transition-all shadow-sm cursor-pointer group/card text-left"
                  onClick={() => toggleExpandCard(group.id)}
                >
                  {/* Ultra-Compact Top Row (Name, Category & Dose in mg/mcg) */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <h3 className="font-bold text-white text-base tracking-tight truncate group-hover/card:text-sky-400 transition-colors">
                        {group.name}
                      </h3>
                      <Badge variant={group.category === 'hypnotic' ? 'brand' : group.category === 'analgesic' ? 'warning' : 'gray'} className="capitalize shrink-0">
                        {group.category}
                      </Badge>
                    </div>

                    {ind && (
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-lg font-bold font-mono text-white tracking-tight">
                            {ind.selectedTotalDose.toFixed(1)} <span className="text-xs font-normal text-slate-400">{ind.totalDoseUnit}</span>
                          </span>
                          <span className="text-xs text-sky-400 font-mono block -mt-0.5">
                            ({ind.selectedVolumeMl?.toFixed(1)} {t.unitMl || 'ml'})
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover/card:text-white transition-colors">
                          <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-sky-400' : ''}`} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Detailed Breakdown */}
                  {isExpanded && (
                    <div className="space-y-4 pt-4 mt-3 border-t border-slate-800/60 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                      {/* Concentration & Weight Metric Banner */}
                      <div className="flex items-center justify-between text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="font-mono text-slate-400">{group.concentrationStr}</span>
                        {ind && (
                          <Badge variant="gray" className="font-mono">
                            {t.colBaseWeight || 'Base Weight'}: {ind.weightMetricUsed} ({ind.weightValue.toFixed(1)} {t.kg || 'kg'})
                          </Badge>
                        )}
                      </div>

                      {/* Induction Details Breakdown */}
                      {ind && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">{t.inductionDoseLabel || 'Induction Dose'}:</span>
                            <span className="font-mono text-slate-200">{ind.selectedDosePerKg} {ind.unitPerKg}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">{t.colDoseRange || 'Dose Range'}:</span>
                            <span className="font-mono text-slate-200">{ind.dosePerKgRange}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">Calculated Range:</span>
                            <span className="font-mono text-slate-200">[{ind.totalDoseMin.toFixed(1)} – {ind.totalDoseMax.toFixed(1)} {ind.totalDoseUnit}]</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">Volume Range:</span>
                            <span className="font-mono text-sky-400">[{ind.volumeMinMl?.toFixed(1)} – {ind.volumeMaxMl?.toFixed(1)} ml]</span>
                          </div>
                          <p className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                            {ind.explanation}
                          </p>
                        </div>
                      )}

                      {/* Maintenance Infusion Section */}
                      {maint && (
                        <div className="space-y-2 pt-3 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                              {t.maintenanceInfusionLabel || 'Maintenance Infusion'} ({maint.weightMetricUsed})
                            </span>
                            <Badge variant="gray" className="font-mono text-[11px]">
                              {maint.weightValue.toFixed(1)} {t.kg || 'kg'}
                            </Badge>
                          </div>

                          <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] text-slate-400 block">Rate / Hour</span>
                              <span className="text-xl font-bold font-mono text-sky-400">
                                {maint.selectedRateMlHour?.toFixed(1)} <span className="text-xs text-slate-400">{t.unitMlHour || 'ml/h'}</span>
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] text-slate-400 block">Calculated Rate</span>
                              <span className="text-sm font-bold font-mono text-white">
                                {maint.selectedTotalDose.toFixed(1)} <span className="text-xs text-slate-400">{maint.totalDoseUnit}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">Infusion Range:</span>
                            <span className="font-mono text-slate-200">{maint.dosePerKgRange}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-medium">Rate Range:</span>
                            <span className="font-mono text-sky-400">[{maint.rateMinMlHour?.toFixed(1)} – {maint.rateMaxMlHour?.toFixed(1)} ml/h]</span>
                          </div>
                          <p className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                            {maint.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: Cheat Sheet Section (Collapsible) */}
      <div className="space-y-4">
        <div
          onClick={() => setShowSection4(!showSection4)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
              4
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight group-hover:text-sky-400 transition-colors">
              {t.cheatSheetTitle || 'Cheat Sheet: Body Weight Scalar Usage in ICU & Anesthesiology'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 group-hover:text-slate-200">
              {showSection4 ? (t.hideLabel || 'Hide') : (t.configureLabel || 'Show')}
            </span>
            <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showSection4 ? 'rotate-180 text-sky-400' : ''}`} />
          </div>
        </div>

        {showSection4 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch animate-slide-up">
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
        )}
      </div>
    </div>
  );
};
