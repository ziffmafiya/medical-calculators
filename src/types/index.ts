
// Типы для калькулятора коррекции калия
export interface PotassiumCorrectionInputs {
  currentPotassium: number | null; // ммоль/л
  weight: number | null; // кг
  useAsparkam: boolean; // использовать аспаркам или калия хлорид
}

export interface PotassiumCorrectionResult {
  deficit: number; // ммоль
  asparkamDose: number; // мл 10% раствора
  potassiumChlorideDose: number; // мл 7.5% раствора
  infusionRate: number; // мл/час
  duration: number; // часы
}

// Типы для общего калькулятора электролитов
export type ElectrolyteType = 'potassium' | 'sodium' | 'magnesium' | 'calcium';
export type CorrectionType = 'hypo' | 'hyper';

export interface ElectrolyteCorrectionInputs {
  electrolyteType: ElectrolyteType;
  correctionType: CorrectionType;
  currentLevel: number | null; // ммоль/л или мг/дл
  weight: number | null; // кг
  albumin: number | null; // г/дл (для коррекции кальция и магния)
  hasEcgChanges: boolean; // для гиперкалиемии
  hasSymptoms: boolean; // для гиперкалиемии
  renalFunction: 'normal' | 'mild' | 'moderate' | 'severe'; // для гиперкалиемии
  age: number | null; // возраст пациента (лет)
  gender: 'male' | 'female'; // пол пациента
}

export interface ElectrolyteCorrectionResult {
  correctedLevel?: number; // скорректированный уровень
  deficit?: number; // дефицит (для гипо)
  excess?: number; // избыток (для гипер)
  recommendedDoses: RecommendedDose[];
  infusionRate?: number;
  duration?: number;
  warnings: string[];
  recommendations: string[];
  emergencyActions?: string[]; // для гиперкалиемии
}

export interface RecommendedDose {
  medication: string;
  dose: number;
  unit: string;
  route: string;
  frequency?: string;
  notes?: string;
}

// Типы для калькулятора антибиотикопрофилактики
export interface AntibioticProphylaxisInputs {
  // Шаг 1: Первичная оценка
  woundType: 'clean' | 'open-fracture' | 'contaminated' | 'bite' | 'water-fresh' | 'water-salt' | 'gunshot' | 'abdominal' | 'crush' | 'farm';
  woundLocation: 'hand-foot' | 'face' | 'perineum' | 'groin' | 'armpit' | 'joint' | 'bone' | 'other';
  contaminationType: 'none' | 'soil' | 'feces' | 'saliva' | 'foreign-body' | 'high-energy' | 'crush-injury';

  // Шаг 2: Факторы пациента
  patientAge: number | null; // лет
  patientWeight: number | null; // кг
  hasDiabetes: boolean;
  hasImmunodeficiency: boolean;
  hasVascularDisease: boolean;
  hasMalnutrition: boolean;
  timeFromInjury: number | null; // часы

  // Шаг 3: Аллергии и функции
  hasAllergies: boolean;
  allergies: string[];
  renalFunction: 'normal' | 'mild' | 'moderate' | 'severe';

  // Дополнительные параметры
  surgeryDuration: number | null; // минуты
  isDelayedClosure: boolean;
}

export interface AntibioticProphylaxisResult {
  // Основные рекомендации
  isAntibioticNeeded: boolean;
  recommendedAntibiotic: string;
  dose: number; // мг
  frequency: string;
  duration: string;
  route: string;
  additionalDoses: number;

  // Детальная информация
  riskDomains: string[];
  riskLevel: 'low' | 'medium' | 'high';
  immediateIndication: boolean;
  notes: string[];
  warnings: string[];
}

// Типы для калькулятора детских доз
export interface PediatricDoseInputs {
  age: number | null; // годы
  weight: number | null; // кг
  height: number | null; // см
  medication: string; // название препарата
  indication: string; // показание к применению
  route: 'oral' | 'iv' | 'im' | 'sc'; // путь введения
}

export interface MedicationInfo {
  name: string;
  category: string;
  minAge: number; // минимальный возраст в годах
  minWeight: number; // минимальный вес в кг
  contraindications: string[];
  warnings: string[];
  dosingMethods: DosingMethod[];
}

export interface DosingMethod {
  type: 'weight' | 'age' | 'bsa' | 'fixed';
  unit: string;
  minDose: number;
  maxDose: number;
  frequency: string;
  notes: string;
}

export interface PediatricDoseResult {
  isSafe: boolean;
  isContraindicated: boolean;
  contraindicationReason?: string;
  recommendedDose: number;
  doseUnit: string;
  frequency: string;
  totalDailyDose: number;
  bsa?: number; // площадь поверхности тела
  warnings: string[];
  notes: string[];
  alternativeDosing?: string;
}

// Общие типы
export interface CalculatorProps {
  onCalculate: (result: PotassiumCorrectionResult | AntibioticProphylaxisResult) => void;
  onReset: () => void;
}

export interface LeanBodyWeightInputs {
  weight: number | null; // кг
  height: number | null; // см (для расчета BMI)
  bmi: number | null; // или прямой ввод BMI
  gender: 'male' | 'female';
}

export interface LeanBodyWeightResult {
  idealBodyWeight: number; // кг
  leanBodyMass: number; // кг
  resultInfo: string[]; // дополнительная информация
}

// Типы для калькулятора инфузионной терапии
export interface InfusionTherapyInputs {
  // Основные параметры пациента
  weight: number | null; // кг
  height: number | null; // см
  age: number | null; // годы
  gender: 'male' | 'female';

  // Клинические параметры
  currentWeight: number | null; // текущий вес (может отличаться от идеального)
  hasEdema: boolean;
  hasDehydration: boolean;
  hasOverhydration: boolean;

  // Лабораторные показатели
  serumSodium: number | null; // ммоль/л
  serumPotassium: number | null; // ммоль/л
  serumChloride: number | null; // ммоль/л
  serumGlucose: number | null; // ммоль/л
  serumCreatinine: number | null; // мкмоль/л
  serumAlbumin: number | null; // г/л

  // Гемодинамические параметры
  bloodPressure: {
    systolic: number | null; // мм рт.ст.
    diastolic: number | null; // мм рт.ст.
  };
  heartRate: number | null; // уд/мин
  centralVenousPressure: number | null; // см вод.ст.

  // Диурез и потери
  urineOutput: number | null; // мл/час
  hasVomiting: boolean;
  hasDiarrhea: boolean;
  hasFever: boolean;
  feverTemperature: number | null; // °C

  // Хирургические факторы
  isPostoperative: boolean;
  surgeryDuration: number | null; // минуты
  bloodLoss: number | null; // мл
  thirdSpaceLoss: number | null; // мл

  // Дополнительные факторы
  hasBurns: boolean;
  burnSurfaceArea: number | null; // % поверхности тела
  hasSepsis: boolean;
  hasKidneyFailure: boolean;
}

export interface InfusionTherapyResult {
  // Расчеты объема
  totalBodyWater: number; // л
  extracellularFluid: number; // л
  intracellularFluid: number; // л

  // Суточные потребности
  maintenanceFluid: number; // мл/сут
  maintenanceRate: number; // мл/час

  // Дефицит жидкости
  fluidDeficit: number; // мл
  deficitCorrectionRate: number; // мл/час
  deficitCorrectionTime: number; // часы

  // Текущие потери
  ongoingLosses: number; // мл/сут
  ongoingLossesRate: number; // мл/час

  // Общий объем инфузии
  totalInfusionVolume: number; // мл/сут
  totalInfusionRate: number; // мл/час

  // Рекомендации по растворам
  recommendedSolutions: RecommendedSolution[];

  // Мониторинг
  monitoringParameters: MonitoringParameter[];

  // Предупреждения и противопоказания
  warnings: string[];
  contraindications: string[];

  // Дополнительные рекомендации
  additionalRecommendations: string[];
}

export interface RecommendedSolution {
  solution: string;
  volume: number; // мл
  rate: number; // мл/час
  duration: number; // часы
  indication: string;
  notes?: string;
}

export interface MonitoringParameter {
  parameter: string;
  frequency: string;
  target: string;
  criticalValues: string[];
}
