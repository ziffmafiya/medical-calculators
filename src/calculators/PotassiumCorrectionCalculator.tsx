'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { NumberInput } from '@/components/NumberInput';
import { Checkbox } from '@/components/Checkbox';
import { Button } from '@/components/Button';
import { PotassiumCorrectionInputs, PotassiumCorrectionResult } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

export const PotassiumCorrectionCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [inputs, setInputs] = useState<PotassiumCorrectionInputs>({
    currentPotassium: 3.0,
    weight: 70,
    useAsparkam: true,
  });

  const [result, setResult] = useState<PotassiumCorrectionResult | null>(null);

  const calculateCorrection = () => {
    // Проверяем, что все необходимые поля заполнены
    if (inputs.currentPotassium === null || inputs.weight === null) {
      alert(t.pleaseFillAllFields);
      return;
    }

    // Расчет дефицита калия до 4.5 ммоль/л (ммоль)
    const potassiumDeficit = (4.5 - inputs.currentPotassium) * 0.2 * inputs.weight;
    
    // Расчет дозы аспаркама 7.5% (мл) по формуле: дефицит * 39.1 / 10.33
    const asparkamDose = (potassiumDeficit * 39.1) / 10.33;
    
    // Расчет дозы KCl 7.5% (мл) по формуле: (дефицит * 39.1) / 75
    const potassiumChlorideDose = (potassiumDeficit * 39.1) / 75;
    
    // Скорость инфузии (максимум 20 ммоль/час для безопасности)
    const maxInfusionRate = 20; // ммоль/час
    const infusionRate = Math.min(maxInfusionRate, potassiumDeficit);
    
    // Длительность инфузии
    const duration = potassiumDeficit / infusionRate;

    setResult({
      deficit: Math.round(potassiumDeficit * 10) / 10,
      asparkamDose: Math.round(asparkamDose * 10) / 10,
      potassiumChlorideDose: Math.round(potassiumChlorideDose * 10) / 10,
      infusionRate: Math.round(infusionRate * 10) / 10,
      duration: Math.round(duration * 10) / 10,
    });
  };

  const resetCalculator = () => {
    setInputs({
      currentPotassium: 3.0,
      weight: 70,
      useAsparkam: true,
    });
    setResult(null);
  };

  return (
    <Card 
      title={t.potassiumCorrection} 
      subtitle={t.potassiumCorrectionDesc}
      className="max-w-2xl mx-auto"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberInput
            label={t.currentPotassiumLevel}
            value={inputs.currentPotassium}
            onChange={(value) => setInputs({ ...inputs, currentPotassium: value })}
            min={1.0}
            max={8.0}
            step={0.1}
            unit={t.mmolL}
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
        </div>
        
        <div className="p-4 bg-accent/20 rounded-lg border border-accent/30">
          <p className="text-sm text-accent-foreground">
            <strong>{t.targetPotassiumLevel}:</strong> 4.5 {t.mmolL} ({t.targetPotassiumLevelDesc})
          </p>
        </div>

        <Checkbox
          id="useAsparkam"
          checked={inputs.useAsparkam}
          onChange={(checked) => setInputs({ ...inputs, useAsparkam: checked })}
        >
          {t.useAsparkam}
        </Checkbox>

        <div className="flex space-x-4">
          <Button onClick={calculateCorrection} variant="primary">
            {t.calculate}
          </Button>
          <Button onClick={resetCalculator} variant="outline">
            {t.reset}
          </Button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent/30">
            <h3 className="text-lg font-semibold text-accent-foreground mb-4">
              {t.calculationResults}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t.potassiumDeficit}:</span>
                <span className="font-medium">{result.deficit} mmol</span>
              </div>
              <div className="flex justify-between">
                <span>{t.asparkamDose}:</span>
                <span className="font-medium">{result.asparkamDose} {t.ml}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.potassiumChlorideDose}:</span>
                <span className="font-medium">{result.potassiumChlorideDose} {t.ml}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.infusionRate}:</span>
                <span className="font-medium">{result.infusionRate} {t.mmolHour}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.duration}:</span>
                <span className="font-medium">{result.duration} {t.hours}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-card rounded border border-border">
              <h4 className="font-medium text-card-foreground mb-2">{t.recommendations}</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>{t.maxInfusionRate}</li>
                <li>{t.monitorPotassium}</li>
                <li>{t.stopInfusion}</li>
                <li>{t.ecgMonitoring}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}; 