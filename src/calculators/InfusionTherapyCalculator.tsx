import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NumberInput } from '../components/NumberInput';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';
import { InfusionTherapyInputs, InfusionTherapyResult, RecommendedSolution } from '../types';

export const InfusionTherapyCalculator: React.FC = () => {
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

  // Расчет общего количества воды в организме по формуле Watson
  const calculateTotalBodyWater = (weight: number, height: number, age: number, gender: 'male' | 'female'): number => {
    if (gender === 'male') {
      return 2.447 - (0.09156 * age) + (0.1074 * height) + (0.3362 * weight);
    } else {
      return -2.097 + (0.1069 * height) + (0.2466 * weight);
    }
  };

  // Расчет дефицита жидкости
  const calculateFluidDeficit = (weight: number, hasDehydration: boolean, hasEdema: boolean, hasOverhydration: boolean): number => {
    if (hasOverhydration) return 0;
    if (hasEdema) return 0;
    
    let deficit = 0;
    if (hasDehydration) {
      // Оценка дегидратации по весу
      deficit = weight * 0.05; // 5% от веса тела
    }
    return deficit * 1000; // переводим в мл
  };

  // Расчет текущих потерь
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
    
    // Базовые потери через кожу и легкие
    losses += weight * 15; // 15 мл/кг/сут
    
    // Лихорадка
    if (hasFever && feverTemperature && feverTemperature > 37.0) {
      const tempIncrease = feverTemperature - 37.0;
      losses += tempIncrease * 100; // 100 мл на каждый градус выше 37°C
    }
    
    // Рвота и диарея
    if (hasVomiting) losses += 500; // 500 мл/сут
    if (hasDiarrhea) losses += 1000; // 1000 мл/сут
    
    // Послеоперационные потери
    if (isPostoperative && surgeryDuration) {
      if (surgeryDuration < 60) losses += 200;
      else if (surgeryDuration < 120) losses += 400;
      else losses += 600;
    }
    
    // Ожоги
    if (hasBurns && burnSurfaceArea) {
      losses += burnSurfaceArea * 4 * weight; // формула Паркленда
    }
    
    return losses;
  };

  // Расчет поддерживающей жидкости
  const calculateMaintenanceFluid = (weight: number, age: number): number => {
    if (age < 1) return weight * 100; // 100 мл/кг/сут для младенцев
    if (age < 10) return weight * 80; // 80 мл/кг/сут для детей
    if (age < 20) return weight * 60; // 60 мл/кг/сут для подростков
    return weight * 30; // 30 мл/кг/сут для взрослых
  };

  const handleCalculate = () => {
    if (!data.weight || !data.height || !data.age) {
      alert('Пожалуйста, заполните основные параметры пациента');
      return;
    }

    const totalBodyWater = calculateTotalBodyWater(data.weight, data.height, data.age, data.gender);
    const extracellularFluid = totalBodyWater * 0.4; // 40% от общего объема
    const intracellularFluid = totalBodyWater * 0.6; // 60% от общего объема
    
    const maintenanceFluid = calculateMaintenanceFluid(data.weight, data.age);
    const maintenanceRate = maintenanceFluid / 24;
    
    const fluidDeficit = calculateFluidDeficit(data.weight, data.hasDehydration, data.hasEdema, data.hasOverhydration);
    const deficitCorrectionRate = fluidDeficit > 0 ? Math.min(fluidDeficit / 8, 1000) : 0; // максимум 1000 мл/час
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
    const ongoingLossesRate = ongoingLosses / 24;
    
    const totalInfusionVolume = maintenanceFluid + fluidDeficit + ongoingLosses;
    const totalInfusionRate = totalInfusionVolume / 24;

    // Рекомендации по растворам
    const recommendedSolutions: RecommendedSolution[] = [];
    
    if (fluidDeficit > 0) {
      recommendedSolutions.push({
        solution: '0.9% NaCl или Рингера',
        volume: Math.min(fluidDeficit, 2000),
        rate: deficitCorrectionRate,
        duration: Math.min(deficitCorrectionTime, 8),
        indication: 'Коррекция дефицита жидкости',
        notes: 'Быстрая инфузия для восстановления объема'
      });
    }
    
    if (data.serumSodium && data.serumSodium < 135) {
      recommendedSolutions.push({
        solution: '0.9% NaCl',
        volume: 1000,
        rate: 125,
        duration: 8,
        indication: 'Коррекция гипонатриемии',
        notes: 'Медленная коррекция для предотвращения осмотической демиелинизации'
      });
    }
    
    if (data.serumPotassium && data.serumPotassium < 3.5) {
      recommendedSolutions.push({
        solution: 'KCl в 0.9% NaCl',
        volume: 1000,
        rate: 125,
        duration: 8,
        indication: 'Коррекция гипокалиемии',
        notes: 'Концентрация K+ не более 40 ммоль/л'
      });
    }
    
    // Поддерживающая терапия
    recommendedSolutions.push({
      solution: '5% глюкоза + 0.18% NaCl',
      volume: maintenanceFluid,
      rate: maintenanceRate,
      duration: 24,
      indication: 'Поддерживающая терапия',
      notes: 'Базовые потребности в жидкости и электролитах'
    });

    // Параметры мониторинга
    const monitoringParameters = [
      {
        parameter: 'Диурез',
        frequency: 'Каждый час',
        target: '0.5-1.0 мл/кг/час',
        criticalValues: ['< 0.3 мл/кг/час', '> 2.0 мл/кг/час']
      },
      {
        parameter: 'АД',
        frequency: 'Каждые 15-30 минут',
        target: 'САД > 90 мм рт.ст.',
        criticalValues: ['САД < 90 мм рт.ст.', 'ДАД < 60 мм рт.ст.']
      },
      {
        parameter: 'ЧСС',
        frequency: 'Постоянно',
        target: '60-100 уд/мин',
        criticalValues: ['> 120 уд/мин', '< 50 уд/мин']
      },
      {
        parameter: 'ЦВД',
        frequency: 'Каждые 2-4 часа',
        target: '8-12 см вод.ст.',
        criticalValues: ['< 5 см вод.ст.', '> 15 см вод.ст.']
      }
    ];

    // Предупреждения
    const warnings: string[] = [];
    if (data.hasKidneyFailure) {
      warnings.push('Осторожно с объемом жидкости при почечной недостаточности');
    }
    if (data.hasSepsis) {
      warnings.push('При сепсисе может потребоваться больший объем жидкости');
    }
    if (data.hasBurns && data.burnSurfaceArea && data.burnSurfaceArea > 20) {
      warnings.push('При обширных ожогах требуется специальный протокол инфузии');
    }

    // Противопоказания
    const contraindications: string[] = [];
    if (data.hasOverhydration) {
      contraindications.push('Противопоказана дополнительная инфузия при гипергидратации');
    }
    if (data.hasEdema) {
      contraindications.push('Осторожно с объемом при отеках');
    }

    // Дополнительные рекомендации
    const additionalRecommendations = [
      'Регулярно оценивать клинические признаки гипо/гипергидратации',
      'Корректировать скорость инфузии в зависимости от ответа пациента',
      'При необходимости использовать диуретики для выведения избыточной жидкости',
      'Мониторить электролиты каждые 6-12 часов'
    ];

    const result: InfusionTherapyResult = {
      totalBodyWater,
      extracellularFluid,
      intracellularFluid,
      maintenanceFluid,
      maintenanceRate,
      fluidDeficit,
      deficitCorrectionRate,
      deficitCorrectionTime,
      ongoingLosses,
      ongoingLossesRate,
      totalInfusionVolume,
      totalInfusionRate,
      recommendedSolutions,
      monitoringParameters,
      warnings,
      contraindications,
      additionalRecommendations
    };

    setResult(result);
  };

  const handleReset = () => {
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
    setResult(null);
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Калькулятор инфузионной терапии
          </h1>
          <p className="text-muted-foreground">
            Расчет потребности в жидкости, коррекция дефицита и рекомендации по инфузии
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма ввода */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Параметры пациента</h2>
            
            <div className="space-y-6">
              {/* Основные параметры */}
              <div>
                <h3 className="text-lg font-medium mb-3">Основные параметры</h3>
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="Вес (кг)"
                    value={data.weight}
                    onChange={(value) => setData({ ...data, weight: value })}
                    min={1}
                    max={300}
                    step={0.1}
                  />
                  <NumberInput
                    label="Рост (см)"
                    value={data.height}
                    onChange={(value) => setData({ ...data, height: value })}
                    min={50}
                    max={250}
                    step={1}
                  />
                  <NumberInput
                    label="Возраст (годы)"
                    value={data.age}
                    onChange={(value) => setData({ ...data, age: value })}
                    min={0}
                    max={120}
                    step={1}
                  />
                  <Select
                    label="Пол"
                    value={data.gender}
                    onChange={(value) => setData({ ...data, gender: value as 'male' | 'female' })}
                    options={[
                      { value: 'male', label: 'Мужской' },
                      { value: 'female', label: 'Женский' }
                    ]}
                  />
                </div>
              </div>

              {/* Клинические параметры */}
              <div>
                <h3 className="text-lg font-medium mb-3">Клинические параметры</h3>
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="Текущий вес (кг)"
                    value={data.currentWeight}
                    onChange={(value) => setData({ ...data, currentWeight: value })}
                    min={1}
                    max={300}
                    step={0.1}
                  />
                  <Checkbox
                    checked={data.hasEdema}
                    onChange={(checked) => setData({ ...data, hasEdema: checked })}
                  >
                    Отеки
                  </Checkbox>
                  <Checkbox
                    checked={data.hasDehydration}
                    onChange={(checked) => setData({ ...data, hasDehydration: checked })}
                  >
                    Дегидратация
                  </Checkbox>
                  <Checkbox
                    checked={data.hasOverhydration}
                    onChange={(checked) => setData({ ...data, hasOverhydration: checked })}
                  >
                    Гипергидратация
                  </Checkbox>
                </div>
              </div>

              {/* Лабораторные показатели */}
              <div>
                <h3 className="text-lg font-medium mb-3">Лабораторные показатели</h3>
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="Na+ (ммоль/л)"
                    value={data.serumSodium}
                    onChange={(value) => setData({ ...data, serumSodium: value })}
                    min={100}
                    max={180}
                    step={0.1}
                  />
                  <NumberInput
                    label="K+ (ммоль/л)"
                    value={data.serumPotassium}
                    onChange={(value) => setData({ ...data, serumPotassium: value })}
                    min={2}
                    max={8}
                    step={0.1}
                  />
                  <NumberInput
                    label="Cl- (ммоль/л)"
                    value={data.serumChloride}
                    onChange={(value) => setData({ ...data, serumChloride: value })}
                    min={80}
                    max={120}
                    step={0.1}
                  />
                  <NumberInput
                    label="Глюкоза (ммоль/л)"
                    value={data.serumGlucose}
                    onChange={(value) => setData({ ...data, serumGlucose: value })}
                    min={1}
                    max={50}
                    step={0.1}
                  />
                  <NumberInput
                    label="Креатинин (мкмоль/л)"
                    value={data.serumCreatinine}
                    onChange={(value) => setData({ ...data, serumCreatinine: value })}
                    min={30}
                    max={1000}
                    step={1}
                  />
                  <NumberInput
                    label="Альбумин (г/л)"
                    value={data.serumAlbumin}
                    onChange={(value) => setData({ ...data, serumAlbumin: value })}
                    min={20}
                    max={60}
                    step={0.1}
                  />
                </div>
              </div>

              {/* Гемодинамические параметры */}
              <div>
                <h3 className="text-lg font-medium mb-3">Гемодинамические параметры</h3>
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="САД (мм рт.ст.)"
                    value={data.bloodPressure.systolic}
                    onChange={(value) => setData({ 
                      ...data, 
                      bloodPressure: { ...data.bloodPressure, systolic: value }
                    })}
                    min={60}
                    max={250}
                    step={1}
                  />
                  <NumberInput
                    label="ДАД (мм рт.ст.)"
                    value={data.bloodPressure.diastolic}
                    onChange={(value) => setData({ 
                      ...data, 
                      bloodPressure: { ...data.bloodPressure, diastolic: value }
                    })}
                    min={40}
                    max={150}
                    step={1}
                  />
                  <NumberInput
                    label="ЧСС (уд/мин)"
                    value={data.heartRate}
                    onChange={(value) => setData({ ...data, heartRate: value })}
                    min={40}
                    max={200}
                    step={1}
                  />
                  <NumberInput
                    label="ЦВД (см вод.ст.)"
                    value={data.centralVenousPressure}
                    onChange={(value) => setData({ ...data, centralVenousPressure: value })}
                    min={-5}
                    max={25}
                    step={0.5}
                  />
                </div>
              </div>

              {/* Диурез и потери */}
              <div>
                <h3 className="text-lg font-medium mb-3">Диурез и потери</h3>
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="Диурез (мл/час)"
                    value={data.urineOutput}
                    onChange={(value) => setData({ ...data, urineOutput: value })}
                    min={0}
                    max={500}
                    step={5}
                  />
                  <Checkbox
                    checked={data.hasVomiting}
                    onChange={(checked) => setData({ ...data, hasVomiting: checked })}
                  >
                    Рвота
                  </Checkbox>
                  <Checkbox
                    checked={data.hasDiarrhea}
                    onChange={(checked) => setData({ ...data, hasDiarrhea: checked })}
                  >
                    Диарея
                  </Checkbox>
                  <Checkbox
                    checked={data.hasFever}
                    onChange={(checked) => setData({ ...data, hasFever: checked })}
                  >
                    Лихорадка
                  </Checkbox>
                  {data.hasFever && (
                    <NumberInput
                      label="Температура (°C)"
                      value={data.feverTemperature}
                      onChange={(value) => setData({ ...data, feverTemperature: value })}
                      min={37.1}
                      max={42}
                      step={0.1}
                    />
                  )}
                </div>
              </div>

              {/* Хирургические факторы */}
              <div>
                <h3 className="text-lg font-medium mb-3">Хирургические факторы</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Checkbox
                    checked={data.isPostoperative}
                    onChange={(checked) => setData({ ...data, isPostoperative: checked })}
                  >
                    Послеоперационный период
                  </Checkbox>
                  {data.isPostoperative && (
                    <NumberInput
                      label="Длительность операции (мин)"
                      value={data.surgeryDuration}
                      onChange={(value) => setData({ ...data, surgeryDuration: value })}
                      min={0}
                      max={600}
                      step={15}
                    />
                  )}
                  <NumberInput
                    label="Кровопотеря (мл)"
                    value={data.bloodLoss}
                    onChange={(value) => setData({ ...data, bloodLoss: value })}
                    min={0}
                    max={5000}
                    step={50}
                  />
                  <NumberInput
                    label="Потери в третье пространство (мл)"
                    value={data.thirdSpaceLoss}
                    onChange={(value) => setData({ ...data, thirdSpaceLoss: value })}
                    min={0}
                    max={3000}
                    step={50}
                  />
                </div>
              </div>

              {/* Дополнительные факторы */}
              <div>
                <h3 className="text-lg font-medium mb-3">Дополнительные факторы</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Checkbox
                    checked={data.hasBurns}
                    onChange={(checked) => setData({ ...data, hasBurns: checked })}
                  >
                    Ожоги
                  </Checkbox>
                  {data.hasBurns && (
                    <NumberInput
                      label="Площадь ожогов (%)"
                      value={data.burnSurfaceArea}
                      onChange={(value) => setData({ ...data, burnSurfaceArea: value })}
                      min={1}
                      max={100}
                      step={1}
                    />
                  )}
                  <Checkbox
                    checked={data.hasSepsis}
                    onChange={(checked) => setData({ ...data, hasSepsis: checked })}
                  >
                    Сепсис
                  </Checkbox>
                  <Checkbox
                    checked={data.hasKidneyFailure}
                    onChange={(checked) => setData({ ...data, hasKidneyFailure: checked })}
                  >
                    Почечная недостаточность
                  </Checkbox>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button onClick={handleCalculate} className="flex-1">
                Рассчитать
              </Button>
              <Button onClick={handleReset} variant="outline">
                Сбросить
              </Button>
            </div>
          </Card>

          {/* Результаты */}
          {result && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Результаты расчета</h2>
              
              <div className="space-y-6">
                {/* Объемы жидкости */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Объемы жидкости</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span>Общее количество воды в организме:</span>
                      <span className="font-semibold">{result.totalBodyWater.toFixed(1)} л</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Внеклеточная жидкость:</span>
                      <span className="font-semibold">{result.extracellularFluid.toFixed(1)} л</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Внутриклеточная жидкость:</span>
                      <span className="font-semibold">{result.intracellularFluid.toFixed(1)} л</span>
                    </div>
                  </div>
                </div>

                {/* Суточные потребности */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Суточные потребности</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span>Поддерживающая жидкость:</span>
                      <span className="font-semibold">{result.maintenanceFluid.toFixed(0)} мл/сут</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Скорость поддерживающей инфузии:</span>
                      <span className="font-semibold">{result.maintenanceRate.toFixed(1)} мл/час</span>
                    </div>
                  </div>
                </div>

                {/* Дефицит жидкости */}
                {result.fluidDeficit > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Дефицит жидкости</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between">
                        <span>Объем дефицита:</span>
                        <span className="font-semibold">{result.fluidDeficit.toFixed(0)} мл</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Скорость коррекции:</span>
                        <span className="font-semibold">{result.deficitCorrectionRate.toFixed(0)} мл/час</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Время коррекции:</span>
                        <span className="font-semibold">{result.deficitCorrectionTime.toFixed(1)} часов</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Текущие потери */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Текущие потери</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span>Суточные потери:</span>
                      <span className="font-semibold">{result.ongoingLosses.toFixed(0)} мл/сут</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Скорость восполнения потерь:</span>
                      <span className="font-semibold">{result.ongoingLossesRate.toFixed(1)} мл/час</span>
                    </div>
                  </div>
                </div>

                {/* Общий объем инфузии */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Общий объем инфузии</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span>Суточный объем:</span>
                      <span className="font-semibold">{result.totalInfusionVolume.toFixed(0)} мл/сут</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Средняя скорость:</span>
                      <span className="font-semibold">{result.totalInfusionRate.toFixed(1)} мл/час</span>
                    </div>
                  </div>
                </div>

                {/* Рекомендуемые растворы */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Рекомендуемые растворы</h3>
                  <div className="space-y-3">
                    {result.recommendedSolutions.map((solution, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="font-medium text-primary">{solution.solution}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Объем: {solution.volume} мл | Скорость: {solution.rate} мл/час | 
                          Длительность: {solution.duration} ч
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium">Показание:</span> {solution.indication}
                        </div>
                        {solution.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {solution.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Параметры мониторинга */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Параметры мониторинга</h3>
                  <div className="space-y-3">
                    {result.monitoringParameters.map((param, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="font-medium">{param.parameter}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Частота: {param.frequency}
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium">Цель:</span> {param.target}
                        </div>
                        <div className="text-sm text-red-600 mt-1">
                          <span className="font-medium">Критические значения:</span> {param.criticalValues.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Предупреждения */}
                {result.warnings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-yellow-600">Предупреждения</h3>
                    <div className="space-y-2">
                      {result.warnings.map((warning, index) => (
                        <div key={index} className="text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                          ⚠️ {warning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Противопоказания */}
                {result.contraindications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-red-600">Противопоказания</h3>
                    <div className="space-y-2">
                      {result.contraindications.map((contraindication, index) => (
                        <div key={index} className="text-red-700 bg-red-50 p-3 rounded-lg">
                          🚫 {contraindication}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                                 {/* Дополнительные рекомендации */}
                 <div>
                   <h3 className="text-lg font-medium mb-3">Дополнительные рекомендации</h3>
                   <div className="space-y-2">
                     {result.additionalRecommendations.map((recommendation, index) => (
                       <div key={index} className="text-sm p-3 rounded-lg border">
                         💡 {recommendation}
                       </div>
                     ))}
                   </div>
                 </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
