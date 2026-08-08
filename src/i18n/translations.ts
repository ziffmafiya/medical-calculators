export type Language = 'en' | 'ru' | 'uk';

export interface Translations {
  // Navigation
  home: string;
  potassium: string;
  wounds: string;
  children: string;
  about: string;
  
  // Header
  welcome: string;
  welcomeSubtitle: string;
  
  // Calculator titles and descriptions
  potassiumCorrection: string;
  potassiumCorrectionDesc: string;
  antibioticProphylaxis: string;
  antibioticProphylaxisDesc: string;
  pediatricDoses: string;
  pediatricDosesDesc: string;
  intubationDoses: string;
  intubationDosesDesc: string;
  bloodGas: string;
  bloodGasDesc: string;
  infusionTherapy: string;
  infusionTherapyDesc: string;
  glasgowComaScale: string;
  glasgowComaScaleDesc: string;
  comingSoon: string;
  
  // Actions
  startCalculation: string;
  backToCalculators: string;
  
  // Footer
  copyright: string;
  
  // Calculator specific
  currentPotassiumLevel: string;
  patientWeight: string;
  mmolL: string;
  kg: string;
  targetPotassiumLevel: string;
  targetPotassiumLevelDesc: string;
  useAsparkam: string;
  useAsparkamDesc: string;
  calculate: string;
  reset: string;
  pleaseFillAllFields: string;
  
  // Results
  potassiumDeficit: string;
  asparkamDose: string;
  potassiumChlorideDose: string;
  infusionRate: string;
  duration: string;
  ml: string;
  mmolHour: string;
  
  // Wound calculator
  woundType: string;
  woundLocation: string;
  woundAge: string;
  patientAge: string;
  diabetes: string;
  immunosuppression: string;
  woundDepth: string;
  contaminationLevel: string;
  selectWoundType: string;
  selectLocation: string;
  selectDepth: string;
  selectContamination: string;
  superficial: string;
  deep: string;
  clean: string;
  contaminated: string;
  dirty: string;
  head: string;
  neck: string;
  trunk: string;
  extremities: string;
  hands: string;
  feet: string;
  laceration: string;
  puncture: string;
  bite: string;
  burn: string;
  abrasion: string;
  avulsion: string;
  crush: string;
  gunshot: string;
  other: string;
  lessThan6Hours: string;
  moreThan6Hours: string;
  lessThan50: string;
  moreThan50: string;
  yes: string;
  no: string;
  antibioticRecommended: string;
  antibioticNotRecommended: string;
  recommendation: string;
  reasoning: string;
  
  // Pediatric calculator
  medicationName: string;
  childAge: string;
  childWeight: string;
  childHeight: string;
  years: string;
  months: string;
  cm: string;
  selectMedication: string;
  recommendedDose: string;
  maxDose: string;
  contraindications: string;
  notes: string;
  mg: string;
  mgKg: string;
  every4Hours: string;
  every6Hours: string;
  every8Hours: string;
  every12Hours: string;
  daily: string;
  asNeeded: string;
  none: string;
  every4to6Hours: string;
  every6to8Hours: string;
  every8to12Hours: string;
  once: string;
  

  ageRestriction: string;
  weightRestriction: string;
  allergy: string;
  renalImpairment: string;
  hepaticImpairment: string;
  
  // Recommendations
  calculationResults: string;
  recommendations: string;
  maxInfusionRate: string;
  monitorPotassium: string;
  stopInfusion: string;
  ecgMonitoring: string;
  
  // Antibiotic calculator specific
  timeFromInjury: string;
  surgeryDuration: string;
  hasDiabetes: string;
  hasImmunodeficiency: string;
  hasVascularDisease: string;
  hasMalnutrition: string;
  hasAllergies: string;
  allergies: string;
  renalFunction: string;
  isDelayedClosure: string;
  hours: string;
  minutes: string;
  riskLevel: string;
  low: string;
  medium: string;
  high: string;
  immediateIndication: string;
  antibioticNeeded: string;
  antibioticNotNeeded: string;
  riskFactors: string;
  patientFactors: string;
  woundFactors: string;
  environmentalFactors: string;
  
  // Section headers
  step1WoundAssessment: string;
  step2PatientFactors: string;
  step3AllergiesAndAdditional: string;
  
  // Route options
  oral: string;
  intravenous: string;
  intramuscular: string;
  subcutaneous: string;
  routeOfAdministration: string;
  indication: string;
  indicationPlaceholder: string;
  safety: string;
  safe: string;
  notSafe: string;
  contraindication: string;
  contraindicationReason: string;
  medicationNotFound: string;
  consultDoctor: string;
  contraindicatedForAge: string;
  contraindicatedForWeight: string;
  dosingRecommendations: string;
  doseRange: string;
  frequency: string;
  dailyDose: string;
  bodySurfaceArea: string;
  importantWarnings: string;
  disclaimer: string;
  disclaimerText: string;
  age: string;
  weight: string;
  route: string;
  category: string;
  notSpecified: string;
  availableMedications: string;
  medications: string;
  medication: string;
  verified: string;
  medicationCategories: string;
  speciallyAdded: string;
  verifiedDoses: string;
  emergencyMedications: string;
  quickSearch: string;
  searchPlaceholder: string;
  allCategories: string;
  clickToSelect: string;
  hideMedicationList: string;
  showMedicationList: string;
  
  // Electrolyte correction calculator
  electrolyteCorrection: string;
  electrolyteCorrectionDesc: string;
  selectElectrolyte: string;
  selectCorrectionType: string;
  currentLevel: string;
  albumin: string;
  gdL: string;
  hasEcgChanges: string;
  hasSymptoms: string;
  normal: string;
  mild: string;
  moderate: string;
  severe: string;
  correctedLevel: string;
  deficit: string;
  excess: string;
  recommendedDoses: string;
  emergencyActions: string;
  warnings: string;
  
  // Electrolyte types
  electrolytePotassium: string;
  electrolyteSodium: string;
  electrolyteMagnesium: string;
  electrolyteCalcium: string;
  
  // Correction types
  correctionHypo: string;
  correctionHyper: string;
  
  // Units
  unitMgdL: string;
  unitMEqL: string;
  unitGL: string;
  
  // Additional electrolyte calculator translations
  mmol: string;
  tablets: string;
  timesPerDay: string;
  takeAfterMeals: string;
  maxSpeed: string;
  infusion24Hours: string;
  alternativeToAsparkam: string;
  slowCorrection: string;
  osmoticDemyelination: string;
  monitorSodium: string;
  tendonReflexes: string;
  monitorMagnesium: string;
  maxSpeed1gHour: string;
  maxSpeed10mEqHour: string;
  monitorECG: string;
  monitorCalcium: string;
  severeHyperkalemia: string;
  emergencyCare: string;
  significantSodiumDeviation: string;
  carefulCorrection: string;
  membraneStabilization: string;
  insulinGlucose: string;
  sodiumBicarbonate: string;
  acidosis: string;
  salbutamol: string;
  inhaled: string;
  furosemide: string;
  preservedKidneyFunction: string;
  continuousECG: string;
  monitorPotassiumEvery: string;
  considerHemodialysis: string;
  dextrose5: string;
  magnesiumAntagonist: string;
  enhanceExcretion: string;
  considerHemodialysisMagnesium: string;
  calcitonin: string;
  zoledronicAcid: string;
  infusion60Minutes: string;
  hydration: string;
  physiologicalSolution: string;
  monitorKidneyFunction: string;
  severeHypokalemia: string;
  every2to4Hours: string;
  stopInfusionIfPotassiumHigh: string;
  oralCourse3to4Weeks: string;
  forBetterTolerability: string;
  toPrevent: string;
  every6to12Hours: string;
  severeHypocalcemia: string;
  notMoreThan: string;
  moreConcentratedSolution: string;

  // Intubation calculator specific
  intubationTitle: string;
  intubationSubtitle: string;
  patientDataSection: string;
  genderLabel: string;
  maleGender: string;
  femaleGender: string;
  ageYearsLabel: string;
  heightCmLabel: string;
  actualWeightTbwLabel: string;
  lbwFormulaLabel: string;
  janmahasatianGoldStandard: string;
  jamesClassic: string;
  relaxantForIntubationLabel: string;
  showBothRelaxants: string;
  rocuroniumDoseRangeOption: string;
  atracuriumDoseRangeOption: string;
  showConcSettings: string;
  hideConcSettings: string;
  propofolConcLabel: string;
  fentanylConcLabel: string;
  rocuroniumConcLabel: string;
  atracuriumConcLabel: string;
  anthropometricMatrixTitle: string;
  tbwMatrixLabel: string;
  ibwMatrixLabel: string;
  lbwJanMatrixLabel: string;
  lbwJamesMatrixLabel: string;
  abwMatrixLabel: string;
  bmiMatrixLabel: string;
  ventilationVtParamLabel: string;
  obesityWarningText: string;
  dosageFineTuningTitle: string;
  propofolInductionSliderLabel: string;
  propofolMaintSliderLabel: string;
  fentanylInductionSliderLabel: string;
  fentanylMaintSliderLabel: string;
  rocuroniumInductionSliderLabel: string;
  atracuriumInductionSliderLabel: string;
  standardLabel: string;
  minLabel: string;
  maxLabel: string;
  summaryTableTitle: string;
  colDrugAndPhase: string;
  colBaseWeight: string;
  colDoseRange: string;
  colCalculatedDose: string;
  colVolumeOrSpeed: string;
  colWeightRationale: string;
  propofolInductionExp: string;
  propofolMaintExp: string;
  fentanylInductionExp: string;
  fentanylMaintExp: string;
  rocuroniumExp: string;
  atracuriumExp: string;
  cheatSheetTitle: string;
  cheatSheetSubtitle: string;
  colClinicalParam: string;
  colScalarUsed: string;
  colPhysioRationale: string;
  paramVentVt: string;
  rationaleVentVt: string;
  paramPropInduction: string;
  rationalePropInduction: string;
  paramPropMaintenance: string;
  rationalePropMaintenance: string;
  paramRelaxants: string;
  rationaleRelaxants: string;
  paramSuxamethonium: string;
  rationaleSuxamethonium: string;
  paramFentanyl: string;
  rationaleFentanyl: string;
  paramAminoglycosides: string;
  rationaleAminoglycosides: string;
  propofolName: string;
  propofolMaintName: string;
  fentanylName: string;
  fentanylMaintName: string;
  rocuroniumName: string;
  atracuriumName: string;
  unitMgKg: string;
  unitMcgKgMin: string;
  unitMcgKg: string;
  unitMcgKgHour: string;
  unitMgHour: string;
  unitMcgHour: string;
  unitMl: string;
  unitMlHour: string;

  // Blood Gas & Infusion therapy additions
  bloodGasTitle: string;
  bloodGasSubtitle: string;
  primaryDisorderLabel: string;
  compensationLabel: string;
  mixedDisorderLabel: string;
  anionGapStatusLabel: string;
  deltaDeltaLabel: string;
  treatmentAdviceLabel: string;
  generalPrinciplesLabel: string;
  internalConsistencyLabel: string;
  sampleTypeLabel: string;
  arterialSample: string;
  venousSample: string;

  infusionTherapyTitle: string;
  infusionTherapySubtitle: string;
  totalBodyWaterLabel: string;
  extracellularFluidLabel: string;
  intracellularFluidLabel: string;
  maintenanceFluidLabel: string;
  fluidDeficitLabel: string;
  ongoingLossesLabel: string;
  totalInfusionVolumeLabel: string;
  recommendedSolutionsLabel: string;
  monitoringParametersLabel: string;
  diuresisLabel: string;
  bloodPressureLabel: string;
  heartRateLabel: string;
  cvpLabel: string;
  vomitingLabel: string;
  diarrheaLabel: string;
  feverLabel: string;
  postoperativeLabel: string;
  burnsLabel: string;
  sepsisLabel: string;
  kidneyFailureLabel: string;
  anesthesiologyDepartment: string;
  obesityWarningTitle: string;
  overweightWarningTitle: string;
  overweightWarningText: string;
  enterHeightWeightPrompt: string;
  inductionDoseLabel: string;
  maintenanceInfusionLabel: string;
  clickToExpandLabel: string;
  clickToCollapseLabel: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    home: 'Home',
    potassium: 'Potassium',
    wounds: 'Wounds',
    children: 'Children',
    about: 'About',
    
    // Header
    welcome: 'Welcome to MDcalc',
    welcomeSubtitle: 'Your reliable assistant in medical calculations',
    
    // Calculator titles and descriptions
    potassiumCorrection: 'Potassium Level Correction',
    potassiumCorrectionDesc: 'Calculation of Asparkam and KCl dose for potassium correction considering patient weight and target level.',
    antibioticProphylaxis: 'Wound Antibiotic Prophylaxis',
    antibioticProphylaxisDesc: 'Decision algorithm for antibiotic prophylaxis according to modern recommendations.',
    pediatricDoses: 'Pediatric Drug Doses',
    pediatricDosesDesc: 'Calculation of pediatric drug doses considering age and weight. Safety check and contraindications.',
    intubationDoses: 'Intubation Drug Doses',
    intubationDosesDesc: 'Dosing calculator for Propofol, Fentanyl, Atracurium, Rocuronium based on TBW, IBW, and LBW (Janmahasatian/James) anthropometrics.',
    bloodGas: 'Blood Gas Analysis',
    bloodGasDesc: 'Interpretation of arterial blood gas and acid-base disorders.',
    infusionTherapy: 'Infusion Therapy',
    infusionTherapyDesc: 'Calculation of maintenance fluids and deficit correction.',
    glasgowComaScale: 'Glasgow Coma Scale (GCS)',
    glasgowComaScaleDesc: 'Assessment of patient consciousness level using Glasgow scale.',
    comingSoon: 'Coming Soon',
    
    // Actions
    startCalculation: 'Start Calculation',
    backToCalculators: '← Back to Calculators',
    
    // Footer
    copyright: '© 2025 MDcalc. All rights reserved.',
    
    // Calculator specific
    currentPotassiumLevel: 'Current potassium level',
    patientWeight: 'Patient weight',
    mmolL: 'mmol/L',
    kg: 'kg',
    targetPotassiumLevel: 'Target potassium level',
    targetPotassiumLevelDesc: 'Target potassium level: 4.5 mmol/L (fixed value)',
    useAsparkam: 'Use Asparkam',
    useAsparkamDesc: 'If not checked, potassium chloride 7.5% will be used',
    calculate: 'Calculate',
    reset: 'Reset',
    pleaseFillAllFields: 'Please fill in all required fields',
    
    // Results
    potassiumDeficit: 'Potassium deficit',
    asparkamDose: 'Asparkam dose',
    potassiumChlorideDose: 'Potassium chloride dose',
    infusionRate: 'Infusion rate',
    duration: 'Duration',
    ml: 'ml',
    mmolHour: 'mmol/hour',
    
    // Wound calculator
    woundType: 'Wound type',
    woundLocation: 'Wound location',
    woundAge: 'Wound age',
    patientAge: 'Patient age',
    diabetes: 'Diabetes',
    immunosuppression: 'Immunosuppression',
    woundDepth: 'Wound depth',
    contaminationLevel: 'Contamination level',
    selectWoundType: 'Select wound type',
    selectLocation: 'Select location',
    selectDepth: 'Select depth',
    selectContamination: 'Select contamination level',
    superficial: 'Superficial',
    deep: 'Deep',
    clean: 'Clean',
    contaminated: 'Contaminated',
    dirty: 'Dirty',
    head: 'Head',
    neck: 'Neck',
    trunk: 'Trunk',
    extremities: 'Extremities',
    hands: 'Hands',
    feet: 'Feet',
    laceration: 'Laceration',
    puncture: 'Puncture',
    bite: 'Bite',
    burn: 'Burn',
    abrasion: 'Abrasion',
    avulsion: 'Avulsion',
    crush: 'Crush',
    gunshot: 'Gunshot',
    other: 'Other',
    lessThan6Hours: 'Less than 6 hours',
    moreThan6Hours: 'More than 6 hours',
    lessThan50: 'Less than 50 years',
    moreThan50: 'More than 50 years',
    yes: 'Yes',
    no: 'No',
    antibioticRecommended: 'Antibiotic prophylaxis is recommended',
    antibioticNotRecommended: 'Antibiotic prophylaxis is not recommended',
    recommendation: 'Recommendation',
    reasoning: 'Reasoning',
    
    // Pediatric calculator
    medicationName: 'Medication name',
    childAge: 'Child age',
    childWeight: 'Child weight',
    childHeight: 'Child height',
    years: 'years',
    months: 'months',
    cm: 'cm',
    selectMedication: 'Select medication',
    recommendedDose: 'Recommended dose',
    maxDose: 'Maximum dose',
    contraindications: 'Contraindications',
    notes: 'Notes',
    mg: 'mg',
    mgKg: 'mg/kg',
    every4Hours: 'every 4 hours',
    every6Hours: 'every 6 hours',
    every8Hours: 'every 8 hours',
    every12Hours: 'every 12 hours',
    daily: 'daily',
    asNeeded: 'as needed',
    none: 'None',
    every4to6Hours: 'every 4-6 hours',
    every6to8Hours: 'every 6-8 hours',
    every8to12Hours: 'every 8-12 hours',
    once: 'once',
    ageRestriction: 'Age restriction',
    weightRestriction: 'Weight restriction',
    allergy: 'Allergy',
    renalImpairment: 'Renal impairment',
    hepaticImpairment: 'Hepatic impairment',
    
    // Recommendations
    calculationResults: 'Calculation Results',
    recommendations: 'Recommendations:',
    maxInfusionRate: '• Maximum potassium infusion rate: 20 mmol/hour',
    monitorPotassium: '• Monitor potassium level every 2-4 hours',
    stopInfusion: '• Stop infusion if potassium level > 5.5 mmol/L',
    ecgMonitoring: '• ECG monitoring for severe hypokalemia',
    
    // Antibiotic calculator specific
    timeFromInjury: 'Time from injury',
    surgeryDuration: 'Surgery duration',
    hasDiabetes: 'Diabetes',
    hasImmunodeficiency: 'Immunodeficiency',
    hasVascularDisease: 'Vascular disease',
    hasMalnutrition: 'Malnutrition',
    hasAllergies: 'Allergies',
    allergies: 'Allergies',
    renalFunction: 'Renal function',
    isDelayedClosure: 'Delayed closure',
    hours: 'hours',
    minutes: 'minutes',
    riskLevel: 'Risk level',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    immediateIndication: 'Immediate indication',
    antibioticNeeded: 'Antibiotic prophylaxis needed',
    antibioticNotNeeded: 'Antibiotic prophylaxis not needed',
    riskFactors: 'Risk factors',
    patientFactors: 'Patient factors',
    woundFactors: 'Wound factors',
    environmentalFactors: 'Environmental factors',
    
    // Section headers
    step1WoundAssessment: 'Step 1: Wound Assessment',
    step2PatientFactors: 'Step 2: Patient Factors',
    step3AllergiesAndAdditional: 'Step 3: Allergies and Additional Parameters',
    
    // Route options
    oral: 'Oral',
    intravenous: 'Intravenous',
    intramuscular: 'Intramuscular',
    subcutaneous: 'Subcutaneous',
    routeOfAdministration: 'Route of administration',
    indication: 'Indication',
    indicationPlaceholder: 'For example: Fever, Pain, Infection...',
    safety: 'Safety',
    safe: 'SAFE',
    notSafe: 'NOT SAFE',
    contraindication: 'Contraindication',
    contraindicationReason: 'Contraindication reason',
    medicationNotFound: 'Medication not found in database',
    consultDoctor: 'Consult a doctor for accurate dosing information',
    contraindicatedForAge: 'Medication is contraindicated for children under',
    contraindicatedForWeight: 'years or weighing less than',
    dosingRecommendations: 'Dosing recommendations',
    doseRange: 'Dose range',
    frequency: 'Frequency',
    dailyDose: 'Daily dose',
    bodySurfaceArea: 'Body surface area',
    importantWarnings: 'Important warnings',
    disclaimer: 'Important',
    disclaimerText: 'This calculator is for informational purposes only. All prescriptions should be made by qualified medical personnel taking into account individual patient characteristics and clinical situation.',
    age: 'Age',
    weight: 'Weight',
    route: 'Route',
    category: 'Category',
    notSpecified: 'Not specified',
    availableMedications: 'Available medications in database',
    medications: 'medications',
    medication: 'Medication',
    verified: 'Verified',
    medicationCategories: 'Medication categories',
    speciallyAdded: 'Specially added medications',
    verifiedDoses: 'Verified doses',
    emergencyMedications: 'Emergency medications',
    quickSearch: 'Quick medication search',
    searchPlaceholder: 'Enter medication name to search...',
    allCategories: 'All categories',
    clickToSelect: 'Click to select',
    hideMedicationList: 'Hide medication list',
    showMedicationList: 'Show medication list',
    
    // Electrolyte correction calculator
    electrolyteCorrection: 'Electrolyte Correction Calculator',
    electrolyteCorrectionDesc: 'Comprehensive calculator for correction of potassium, sodium, magnesium, and calcium disorders',
    selectElectrolyte: 'Select electrolyte',
    selectCorrectionType: 'Select correction type',
    currentLevel: 'Current level',
    albumin: 'Albumin',
    gdL: 'g/dL',
    hasEcgChanges: 'ECG changes present',
    hasSymptoms: 'Symptoms present',
    normal: 'Normal',
    mild: 'Mild',
    moderate: 'Moderate',
    severe: 'Severe',
    correctedLevel: 'Corrected level',
    deficit: 'Deficit',
    excess: 'Excess',
    recommendedDoses: 'Recommended doses',
    emergencyActions: 'Emergency actions',
    warnings: 'Warnings',
    
    // Electrolyte types
    electrolytePotassium: 'Potassium',
    electrolyteSodium: 'Sodium',
    electrolyteMagnesium: 'Magnesium',
    electrolyteCalcium: 'Calcium',
    
    // Correction types
    correctionHypo: 'Hypo',
    correctionHyper: 'Hyper',
    
    // Units
    unitMgdL: 'mg/dL',
    unitMEqL: 'mEq/L',
    unitGL: 'g/L',
    
    // Additional electrolyte calculator translations
    mmol: 'mmol',
    tablets: 'tablets',
    timesPerDay: 'times per day',
    takeAfterMeals: 'Take after meals',
    maxSpeed: 'Maximum speed',
    infusion24Hours: 'Infusion 24 hours',
    alternativeToAsparkam: 'Alternative to Asparkam',
    slowCorrection: 'Slow correction',
    osmoticDemyelination: 'osmotic demyelination',
    monitorSodium: 'Monitor sodium level',
    tendonReflexes: 'Monitor tendon reflexes',
    monitorMagnesium: 'Monitor magnesium level',
    maxSpeed1gHour: 'Maximum speed 1 g/hour',
    maxSpeed10mEqHour: 'Maximum speed 10 mEq/hour',
    monitorECG: 'Monitor ECG',
    monitorCalcium: 'Monitor calcium level',
    severeHyperkalemia: 'Severe hyperkalemia',
    emergencyCare: 'Emergency care required',
    significantSodiumDeviation: 'Significant sodium deviation',
    carefulCorrection: 'Careful correction required',
    membraneStabilization: 'membrane stabilization',
    insulinGlucose: 'Insulin 10 units + glucose 50% 50 ml IV',
    sodiumBicarbonate: 'Sodium bicarbonate 50-100 mEq IV',
    acidosis: 'in acidosis',
    salbutamol: 'Salbutamol 10-20 mg',
    inhaled: 'inhaled',
    furosemide: 'Furosemide',
    preservedKidneyFunction: 'With preserved kidney function',
    continuousECG: 'Continuous ECG monitoring',
    monitorPotassiumEvery: 'Monitor potassium level every 1-2 hours',
    considerHemodialysis: 'Consider hemodialysis at level > 7.0 mmol/L',
    dextrose5: 'Dextrose 5%',
    magnesiumAntagonist: 'Magnesium antagonist',
    enhanceExcretion: 'Enhance excretion',
    considerHemodialysisMagnesium: 'Consider hemodialysis for severe hypermagnesemia',
    calcitonin: 'Calcitonin',
    zoledronicAcid: 'Zoledronic acid',
    infusion60Minutes: 'Infusion 60 minutes',
    hydration: 'Hydration',
    physiologicalSolution: 'with physiological solution',
    monitorKidneyFunction: 'Monitor kidney function',
    severeHypokalemia: 'in severe hypokalemia',
    every2to4Hours: 'every 2-4 hours',
    stopInfusionIfPotassiumHigh: 'Stop infusion if potassium level > 5.5 mmol/L',
    oralCourse3to4Weeks: 'Oral course: 3-4 weeks with possibility of repetition',
    forBetterTolerability: 'for better tolerability',
    toPrevent: 'to prevent',
    every6to12Hours: 'every 6-12 hours',
    severeHypocalcemia: 'in severe hypocalcemia',
    notMoreThan: 'not more than',
    moreConcentratedSolution: 'More concentrated solution',

    // Intubation calculator specific
    intubationTitle: 'Intubation & Body Weight Drug Dosage Calculator',
    intubationSubtitle: 'Accurate dosage calculation for hypnotics (Propofol), analgesics (Fentanyl), and muscle relaxants (Rocuronium / Atracurium) for induction and maintenance considering anthropometric parameters (TBW, IBW, LBW Janmahasatian/James, ABW) and mechanical ventilation parameters (Vt).',
    patientDataSection: 'Patient Data',
    genderLabel: 'Gender',
    maleGender: 'Male',
    femaleGender: 'Female',
    ageYearsLabel: 'Age (years)',
    heightCmLabel: 'Height (cm)',
    actualWeightTbwLabel: 'Actual Body Weight TBW (kg)',
    lbwFormulaLabel: 'LBW Formula (Lean Body Weight)',
    janmahasatianGoldStandard: 'Janmahasatian (2005) — Gold Standard',
    jamesClassic: 'James (1976) — Classic',
    relaxantForIntubationLabel: 'Muscle Relaxant for Intubation',
    showBothRelaxants: 'Show Rocuronium & Atracurium',
    rocuroniumDoseRangeOption: 'Rocuronium (0.6 - 1.2 mg/kg)',
    atracuriumDoseRangeOption: 'Atracurium (0.4 - 0.5 mg/kg)',
    showConcSettings: 'Solution Concentration Settings (mg/ml)',
    hideConcSettings: 'Hide Concentration Settings',
    propofolConcLabel: 'Propofol (mg/ml)',
    fentanylConcLabel: 'Fentanyl (mcg/ml)',
    rocuroniumConcLabel: 'Rocuronium (mg/ml)',
    atracuriumConcLabel: 'Atracurium (mg/ml)',
    anthropometricMatrixTitle: 'Anthropometric Matrix',
    tbwMatrixLabel: 'TBW (Actual weight):',
    ibwMatrixLabel: 'IBW (Ideal weight - Devine):',
    lbwJanMatrixLabel: 'LBW (Lean weight - Janmahasatian):',
    lbwJamesMatrixLabel: 'LBW (Lean weight - James):',
    abwMatrixLabel: 'ABW (Adjusted weight):',
    bmiMatrixLabel: 'BMI:',
    ventilationVtParamLabel: 'Ventilation Tidal Vol (Vt):',
    obesityWarningText: '⚠️ Warning (Obesity BMI ≥ 30): Actual weight significantly exceeds ideal weight. Using TBW for Propofol induction or muscle relaxants will cause severe overdose!',
    dosageFineTuningTitle: 'Interactive Target Dosage Tuning',
    propofolInductionSliderLabel: 'Propofol Induction (LBW):',
    propofolMaintSliderLabel: 'Propofol Infusion (TBW):',
    fentanylInductionSliderLabel: 'Fentanyl Induction (LBW):',
    fentanylMaintSliderLabel: 'Fentanyl Infusion (LBW):',
    rocuroniumInductionSliderLabel: 'Rocuronium Induction (IBW):',
    atracuriumInductionSliderLabel: 'Atracurium Induction (IBW):',
    standardLabel: 'Standard',
    minLabel: 'Min',
    maxLabel: 'Max',
    summaryTableTitle: 'Summary Dosing Table',
    colDrugAndPhase: 'Drug & Phase',
    colBaseWeight: 'Base Weight (kg)',
    colDoseRange: 'Dose Range',
    colCalculatedDose: 'Calculated Dose',
    colVolumeOrSpeed: 'Volume / Rate',
    colWeightRationale: 'Weight Category Rationale',
    propofolInductionExp: 'Dose is calculated on LBW (lean body weight) to avoid severe hemodynamic instability in overweight patients.',
    propofolMaintExp: 'Anesthesia maintenance is calculated on TBW (actual body weight) or TCI target concentration models.',
    fentanylInductionExp: 'Analgesia induction is calculated on lean body weight (LBW).',
    fentanylMaintExp: 'Fentanyl maintenance is dosed on lean body weight (LBW).',
    rocuroniumExp: 'Muscle relaxant dose is calculated on ideal body weight (IBW) to prevent dangerous prolongation of neuromuscular blockade.',
    atracuriumExp: 'Dosed on ideal body weight (IBW) to prevent prolonged blockade.',
    cheatSheetTitle: 'Cheat Sheet: Body Weight Scalar Usage in ICU & Anesthesiology',
    cheatSheetSubtitle: 'Guide for applying body weight scalars in clinical tasks:',
    colClinicalParam: 'Clinical Parameter / Drug',
    colScalarUsed: 'Calculated Body Weight',
    colPhysioRationale: 'Physiological Rationale',
    paramVentVt: 'Ventilation Parameters (Vt)',
    rationaleVentVt: 'Lung size depends on height and gender, not fat mass. Prevents volutrauma.',
    paramPropInduction: 'Propofol (Induction)',
    rationalePropInduction: 'Prevents severe vasodilation and profound hypotension in obese patients.',
    paramPropMaintenance: 'Propofol (Infusion / TCI)',
    rationalePropMaintenance: 'Redistribution into adipose tissue during continuous infusion requires considering clearance and actual weight.',
    paramRelaxants: 'Muscle Relaxants (Rocuronium, Vecuronium, Atracurium)',
    rationaleRelaxants: 'Volume of distribution for hydrophilic relaxants does not scale with fat mass. Protects against prolonged block.',
    paramSuxamethonium: 'Succinylcholine (Suxamethonium)',
    rationaleSuxamethonium: 'Plasma pseudocholinesterase activity and blood volume are increased in obesity.',
    paramFentanyl: 'Fentanyl (Induction & Maintenance Infusion)',
    rationaleFentanyl: 'Lipophilic opioid, but primary central effects and pharmacokinetics correlate best with lean body mass.',
    paramAminoglycosides: 'Aminoglycosides / Vancomycin',
    rationaleAminoglycosides: 'Adipose tissue contains ~20-30% extracellular water. Correction prevents nephrotoxicity.',
    propofolName: 'Propofol',
    propofolMaintName: 'Propofol (Infusion)',
    fentanylName: 'Fentanyl',
    fentanylMaintName: 'Fentanyl (Infusion)',
    rocuroniumName: 'Rocuronium',
    atracuriumName: 'Atracurium',
    unitMgKg: 'mg/kg',
    unitMcgKgMin: 'mcg/kg/min',
    unitMcgKg: 'mcg/kg',
    unitMcgKgHour: 'mcg/kg/h',
    unitMgHour: 'mg/h',
    unitMcgHour: 'mcg/h',
    unitMl: 'ml',
    unitMlHour: 'ml/h',

    // Blood Gas & Infusion therapy additions
    bloodGasTitle: 'Arterial Blood Gas Analysis & Acid-Base Balance',
    bloodGasSubtitle: 'Interpretation of blood gases, anion gap, Delta/Delta, expected PaCO2, osmolar gap, and treatment recommendations.',
    primaryDisorderLabel: 'Primary Disorder',
    compensationLabel: 'Compensation',
    mixedDisorderLabel: 'Mixed Disorder',
    anionGapStatusLabel: 'Anion Gap Status',
    deltaDeltaLabel: 'Delta/Delta Ratio',
    treatmentAdviceLabel: 'Treatment Advice & Strategy',
    generalPrinciplesLabel: 'General Principles of Management',
    internalConsistencyLabel: 'Internal Consistency Check',
    sampleTypeLabel: 'Sample Type',
    arterialSample: 'Arterial Blood',
    venousSample: 'Venous Blood',

    infusionTherapyTitle: 'Infusion Therapy & Fluid Calculator',
    infusionTherapySubtitle: 'Calculation of total body water, fluid deficit, maintenance fluid requirements, ongoing losses, and solution selection.',
    totalBodyWaterLabel: 'Total Body Water (TBW)',
    extracellularFluidLabel: 'Extracellular Fluid (ECF)',
    intracellularFluidLabel: 'Intracellular Fluid (ICF)',
    maintenanceFluidLabel: 'Maintenance Fluids',
    fluidDeficitLabel: 'Fluid Deficit',
    ongoingLossesLabel: 'Ongoing Losses',
    totalInfusionVolumeLabel: 'Total 24h Infusion Volume',
    recommendedSolutionsLabel: 'Recommended Infusion Solutions',
    monitoringParametersLabel: 'Monitoring & Safety Parameters',
    diuresisLabel: 'Urine Output (Diuresis)',
    bloodPressureLabel: 'Blood Pressure (BP)',
    heartRateLabel: 'Heart Rate (HR)',
    cvpLabel: 'Central Venous Pressure (CVP)',
    vomitingLabel: 'Vomiting / Gastric Drainage',
    diarrheaLabel: 'Diarrhea / Intestinal Loss',
    feverLabel: 'Fever / Hyperthermia',
    postoperativeLabel: 'Postoperative Losses',
    burnsLabel: 'Burn Surface Area',
    sepsisLabel: 'Sepsis / Septic Shock',
    kidneyFailureLabel: 'Renal Failure / Oliguria',
    anesthesiologyDepartment: 'Anesthesiology & ICU',
    obesityWarningTitle: 'Warning (Obesity BMI ≥ 30)',
    overweightWarningTitle: 'Warning (Overweight: TBW > 120% IBW)',
    overweightWarningText: 'Actual weight exceeds ideal weight by more than 20%. Use LBW for Propofol induction and IBW for muscle relaxants to avoid overdose.',
    enterHeightWeightPrompt: 'Enter height & weight to calculate matrix.',
    inductionDoseLabel: 'Induction Dose',
    maintenanceInfusionLabel: 'Maintenance Infusion',
    clickToExpandLabel: 'Details & Infusion',
    clickToCollapseLabel: 'Hide Details',
  },
  
  ru: {
    // Navigation
    home: 'Главная',
    potassium: 'Калий',
    wounds: 'Раны',
    children: 'Дети',
    about: 'О нас',
    
    // Header
    welcome: 'Добро пожаловать в MDcalc',
    welcomeSubtitle: 'Ваш надежный помощник в медицинских расчетах',
    
    // Calculator titles and descriptions
    potassiumCorrection: 'Коррекция уровня калия',
    potassiumCorrectionDesc: 'Расчет дозы Аспаркама и KCl для коррекции калия с учетом веса пациента и целевого уровня.',
    antibioticProphylaxis: 'Антибиотикопрофилактика при ранах',
    antibioticProphylaxisDesc: 'Алгоритм принятия решения о назначении антибиотикопрофилактики согласно современным рекомендациям.',
    pediatricDoses: 'Детские дозы препаратов',
    pediatricDosesDesc: 'Расчет детских доз препаратов с учетом возраста и веса ребенка. Проверка безопасности и противопоказаний.',
    intubationDoses: 'Препараты для интубации',
    intubationDosesDesc: 'Расчет доз Пропофола, Фентанила, Атракуриума и Рокурония с учетом антропометрических параметров (TBW, IBW, LBW, ABW) и ИВЛ.',
    bloodGas: 'Анализ газов крови',
    bloodGasDesc: 'Интерпретация артериальных газов крови и кислотно-основных нарушений.',
    infusionTherapy: 'Инфузионная терапия',
    infusionTherapyDesc: 'Расчет поддерживающей инфузии и коррекции дефицита.',
    glasgowComaScale: 'Шкала комы Глазго (ШКГ)',
    glasgowComaScaleDesc: 'Оценка уровня сознания пациента по шкале Глазго.',
    comingSoon: 'Скоро',
    
    // Actions
    startCalculation: 'Начать расчет',
    backToCalculators: '← Назад к калькуляторам',
    
    // Footer
    copyright: '© 2025 MDcalc. Все права защищены.',
    
    // Calculator specific
    currentPotassiumLevel: 'Текущий уровень калия',
    patientWeight: 'Вес пациента',
    mmolL: 'ммоль/л',
    kg: 'кг',
    targetPotassiumLevel: 'Целевой уровень калия',
    targetPotassiumLevelDesc: 'Целевой уровень калия: 4.5 ммоль/л (фиксированное значение)',
    useAsparkam: 'Использовать аспаркам',
    useAsparkamDesc: 'Если не отмечено, будет использован калия хлорид 7.5%',
    calculate: 'Рассчитать',
    reset: 'Сбросить',
    pleaseFillAllFields: 'Пожалуйста, заполните все необходимые поля',
    
    // Results
    potassiumDeficit: 'Дефицит калия',
    asparkamDose: 'Доза аспаркама',
    potassiumChlorideDose: 'Доза калия хлорида',
    infusionRate: 'Скорость инфузии',
    duration: 'Длительность',
    ml: 'мл',
    mmolHour: 'ммоль/час',
    
    // Wound calculator
    woundType: 'Тип раны',
    woundLocation: 'Локализация раны',
    woundAge: 'Возраст раны',
    patientAge: 'Возраст пациента',
    diabetes: 'Сахарный диабет',
    immunosuppression: 'Иммуносупрессия',
    woundDepth: 'Глубина раны',
    contaminationLevel: 'Уровень загрязнения',
    selectWoundType: 'Выберите тип раны',
    selectLocation: 'Выберите локализацию',
    selectDepth: 'Выберите глубину',
    selectContamination: 'Выберите уровень загрязнения',
    superficial: 'Поверхностная',
    deep: 'Глубокая',
    clean: 'Чистая',
    contaminated: 'Загрязненная',
    dirty: 'Грязная',
    head: 'Голова',
    neck: 'Шея',
    trunk: 'Туловище',
    extremities: 'Конечности',
    hands: 'Кисти',
    feet: 'Стопы',
    laceration: 'Рваная',
    puncture: 'Колотая',
    bite: 'Укус',
    burn: 'Ожог',
    abrasion: 'Ссадина',
    avulsion: 'Отрывная',
    crush: 'Размозженная',
    gunshot: 'Огнестрельная',
    other: 'Другая',
    lessThan6Hours: 'Менее 6 часов',
    moreThan6Hours: 'Более 6 часов',
    lessThan50: 'Менее 50 лет',
    moreThan50: 'Более 50 лет',
    yes: 'Да',
    no: 'Нет',
    antibioticRecommended: 'Антибиотикопрофилактика рекомендуется',
    antibioticNotRecommended: 'Антибиотикопрофилактика не рекомендуется',
    recommendation: 'Рекомендация',
    reasoning: 'Обоснование',
    
    // Pediatric calculator
    medicationName: 'Название препарата',
    childAge: 'Возраст ребенка',
    childWeight: 'Вес ребенка',
    childHeight: 'Рост ребенка',
    years: 'лет',
    months: 'месяцев',
    cm: 'см',
    selectMedication: 'Выберите препарат',
    recommendedDose: 'Рекомендуемая доза',
    maxDose: 'Максимальная доза',
    contraindications: 'Противопоказания',
    notes: 'Примечания',
    mg: 'мг',
    mgKg: 'мг/кг',
    every4Hours: 'каждые 4 часа',
    every6Hours: 'каждые 6 часов',
    every8Hours: 'каждые 8 часов',
    every12Hours: 'каждые 12 часов',
    daily: 'в сутки',
    asNeeded: 'по необходимости',
    none: 'Нет',
    every4to6Hours: 'каждые 4-6 часов',
    every6to8Hours: 'каждые 6-8 часов',
    every8to12Hours: 'каждые 8-12 часов',
    once: 'однократно',
    ageRestriction: 'Возрастное ограничение',
    weightRestriction: 'Ограничение по весу',
    allergy: 'Аллергия',
    renalImpairment: 'Почечная недостаточность',
    hepaticImpairment: 'Печеночная недостаточность',
    
    // Recommendations
    calculationResults: 'Результаты расчета',
    recommendations: 'Рекомендации:',
    maxInfusionRate: '• Максимальная скорость инфузии калия: 20 ммоль/час',
    monitorPotassium: '• Контролировать уровень калия каждые 2-4 часа',
    stopInfusion: '• При уровне калия > 5.5 ммоль/л прекратить инфузию',
    ecgMonitoring: '• Мониторинг ЭКГ при тяжелой гипокалиемии',
    
    // Antibiotic calculator specific
    timeFromInjury: 'Время с момента травмы',
    surgeryDuration: 'Длительность операции',
    hasDiabetes: 'Сахарный диабет',
    hasImmunodeficiency: 'Иммунодефицит',
    hasVascularDisease: 'Сосудистые заболевания',
    hasMalnutrition: 'Недоедание',
    hasAllergies: 'Аллергии',
    allergies: 'Аллергии',
    renalFunction: 'Функция почек',
    isDelayedClosure: 'Отсроченное закрытие',
    hours: 'часов',
    minutes: 'минут',
    riskLevel: 'Уровень риска',
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    immediateIndication: 'Немедленное показание',
    antibioticNeeded: 'Антибиотикопрофилактика необходима',
    antibioticNotNeeded: 'Антибиотикопрофилактика не необходима',
    riskFactors: 'Факторы риска',
    patientFactors: 'Факторы пациента',
    woundFactors: 'Факторы раны',
    environmentalFactors: 'Факторы окружающей среды',
    
    // Section headers
    step1WoundAssessment: 'Шаг 1: Первичная оценка раны',
    step2PatientFactors: 'Шаг 2: Факторы пациента',
    step3AllergiesAndAdditional: 'Шаг 3: Аллергии и дополнительные параметры',
    
    // Route options
    oral: 'Перорально',
    intravenous: 'Внутривенно',
    intramuscular: 'Внутримышечно',
    subcutaneous: 'Подкожно',
    routeOfAdministration: 'Путь введения',
    indication: 'Показание к применению',
    indicationPlaceholder: 'Например: Лихорадка, Боль, Инфекция...',
    safety: 'Безопасность',
    safe: 'БЕЗОПАСЕН',
    notSafe: 'НЕ БЕЗОПАСЕН',
    contraindication: 'Противопоказание',
    contraindicationReason: 'Причина противопоказания',
    medicationNotFound: 'Препарат не найден в базе данных',
    consultDoctor: 'Проконсультируйтесь с врачом для получения точной информации о дозировке',
    contraindicatedForAge: 'Препарат противопоказан детям младше',
    contraindicatedForWeight: 'лет или весом менее',
    dosingRecommendations: 'Рекомендации по дозировке',
    doseRange: 'Диапазон доз',
    frequency: 'Частота приема',
    dailyDose: 'Суточная доза',
    bodySurfaceArea: 'Площадь поверхности тела',
    importantWarnings: 'Важные предупреждения',
    disclaimer: 'Важно',
    disclaimerText: 'Данный калькулятор предназначен только для информационных целей. Все назначения должны производиться квалифицированным медицинским персоналом с учетом индивидуальных особенностей пациента и клинической ситуации.',
    age: 'Возраст',
    weight: 'Вес',
    route: 'Путь введения',
    category: 'Категория',
    notSpecified: 'Не указан',
    availableMedications: 'Доступные препараты в базе',
    medications: 'препаратов',
    medication: 'Препарат',
    verified: 'Проверено',
    medicationCategories: 'Категории препаратов',
    speciallyAdded: 'Специально добавленные препараты',
    verifiedDoses: 'Проверенные дозировки',
    emergencyMedications: 'Препараты неотложной помощи',
    quickSearch: 'Быстрый поиск препаратов',
    searchPlaceholder: 'Введите название препарата для поиска...',
    allCategories: 'Все категории',
    clickToSelect: 'Кликните для выбора',
    hideMedicationList: 'Скрыть список препаратов',
    showMedicationList: 'Показать список препаратов',
    
    // Electrolyte correction calculator
    electrolyteCorrection: 'Калькулятор коррекции электролитов',
    electrolyteCorrectionDesc: 'Комплексный калькулятор для коррекции нарушений калия, натрия, магния и кальция',
    selectElectrolyte: 'Выберите электролит',
    selectCorrectionType: 'Выберите тип коррекции',
    currentLevel: 'Текущий уровень',
    albumin: 'Альбумин',
    gdL: 'г/дл',
    hasEcgChanges: 'Изменения на ЭКГ',
    hasSymptoms: 'Симптомы присутствуют',
    normal: 'Нормальная',
    mild: 'Легкая',
    moderate: 'Умеренная',
    severe: 'Тяжелая',
    correctedLevel: 'Скорректированный уровень',
    deficit: 'Дефицит',
    excess: 'Избыток',
    recommendedDoses: 'Рекомендуемые дозы',
    emergencyActions: 'Неотложные действия',
    warnings: 'Предупреждения',
    
    // Electrolyte types
    electrolytePotassium: 'Калий',
    electrolyteSodium: 'Натрий',
    electrolyteMagnesium: 'Магний',
    electrolyteCalcium: 'Кальций',
    
    // Correction types
    correctionHypo: 'Гипо',
    correctionHyper: 'Гипер',
    
    // Units
    unitMgdL: 'мг/дл',
    unitMEqL: 'мЭкв/л',
    unitGL: 'г/л',
    
    // Additional electrolyte calculator translations
    mmol: 'ммоль',
    tablets: 'таблеток',
    timesPerDay: 'раз в день',
    takeAfterMeals: 'Принимать после еды',
    maxSpeed: 'Максимальная скорость',
    infusion24Hours: 'Инфузия 24 часа',
    alternativeToAsparkam: 'Альтернатива аспаркаму',
    slowCorrection: 'Медленная коррекция',
    osmoticDemyelination: 'осмотической демиелинизации',
    monitorSodium: 'Контроль уровня натрия',
    tendonReflexes: 'Мониторинг сухожильных рефлексов',
    monitorMagnesium: 'Контроль уровня магния',
    maxSpeed1gHour: 'Максимальная скорость 1 г/час',
    maxSpeed10mEqHour: 'Максимальная скорость 10 мЭкв/час',
    monitorECG: 'Мониторинг ЭКГ',
    monitorCalcium: 'Контроль уровня кальция',
    severeHyperkalemia: 'Тяжелая гиперкалиемия',
    emergencyCare: 'требуется неотложная помощь',
    significantSodiumDeviation: 'Значительное отклонение натрия',
    carefulCorrection: 'требуется осторожная коррекция',
    membraneStabilization: 'стабилизация мембран',
    insulinGlucose: 'Инсулин 10 ЕД + глюкоза 50% 50 мл IV',
    sodiumBicarbonate: 'Натрия бикарбонат 50-100 мЭкв IV',
    acidosis: 'при ацидозе',
    salbutamol: 'Сальбутамол 10-20 мг',
    inhaled: 'ингаляционно',
    furosemide: 'Фуросемид',
    preservedKidneyFunction: 'При сохранной функции почек',
    continuousECG: 'Непрерывный мониторинг ЭКГ',
    monitorPotassiumEvery: 'Контроль уровня калия каждые 1-2 часа',
    considerHemodialysis: 'Рассмотреть гемодиализ при уровне > 7.0 ммоль/л',
    dextrose5: 'Декстроза 5%',
    magnesiumAntagonist: 'Антагонист магния',
    enhanceExcretion: 'Усиление экскреции',
    considerHemodialysisMagnesium: 'Рассмотреть гемодиализ при тяжелой гипермагниемии',
    calcitonin: 'Кальцитонин',
    zoledronicAcid: 'Золедроновая кислота',
    infusion60Minutes: 'Инфузия 60 минут',
    hydration: 'Гидратация',
    physiologicalSolution: 'физиологическим раствором',
    monitorKidneyFunction: 'Мониторинг функции почек',
    severeHypokalemia: 'при тяжелой гипокалиемии',
    every2to4Hours: 'каждые 2-4 часа',
    stopInfusionIfPotassiumHigh: 'При уровне калия > 5.5 ммоль/л прекратить инфузию',
    oralCourse3to4Weeks: 'Пероральный курс: 3-4 недели с возможностью повторения',
    forBetterTolerability: 'для лучшей переносимости',
    toPrevent: 'для предотвращения',
    every6to12Hours: 'каждые 6-12 часов',
    severeHypocalcemia: 'при тяжелой гипокальциемии',
    notMoreThan: 'не более',
    moreConcentratedSolution: 'Более концентрированный раствор',

    // Intubation calculator specific
    intubationTitle: 'Калькулятор доз препаратов для интубации и параметров масс тела',
    intubationSubtitle: 'Точный расчет дозировок гипнотиков (Пропофол), анальгетиков (Фентанил) и миорелаксантов (Рокуроний / Атракуриум) для индукции и поддержания анестезии с учетом антропометрических показателей (TBW, IBW, LBW Жанмахасатиан/Джеймс, ABW) и параметров ИВЛ (Vt).',
    patientDataSection: 'Данные пациента',
    genderLabel: 'Пол',
    maleGender: 'Мужской',
    femaleGender: 'Женский',
    ageYearsLabel: 'Возраст (лет)',
    heightCmLabel: 'Рост (см)',
    actualWeightTbwLabel: 'Фактическая масса тела TBW (кг)',
    lbwFormulaLabel: 'Формула LBW (Тощая масса)',
    janmahasatianGoldStandard: 'Janmahasatian (2005) — Золотой стандарт',
    jamesClassic: 'James (1976) — Классическая',
    relaxantForIntubationLabel: 'Миорелаксант для интубации',
    showBothRelaxants: 'Показать Рокуроний и Атракуриум',
    rocuroniumDoseRangeOption: 'Рокуроний (0.6 - 1.2 мг/кг)',
    atracuriumDoseRangeOption: 'Атракуриум (0.4 - 0.5 мг/кг)',
    showConcSettings: 'Настройки концентраций растворов (мг/мл)',
    hideConcSettings: 'Скрыть настройки концентраций',
    propofolConcLabel: 'Пропофол (мг/мл)',
    fentanylConcLabel: 'Фентанил (мкг/мл)',
    rocuroniumConcLabel: 'Рокуроний (мг/мл)',
    atracuriumConcLabel: 'Атракуриум (мг/мл)',
    anthropometricMatrixTitle: 'Антропометрическая матрица',
    tbwMatrixLabel: 'TBW (Фактический вес):',
    ibwMatrixLabel: 'IBW (Идеальный вес - Devine):',
    lbwJanMatrixLabel: 'LBW (Тощий вес - Janmahasatian):',
    lbwJamesMatrixLabel: 'LBW (Тощий вес - James):',
    abwMatrixLabel: 'ABW (Скорректированный):',
    bmiMatrixLabel: 'ИМТ (BMI):',
    ventilationVtParamLabel: 'ИВЛ Параметр ДО (Vt):',
    obesityWarningText: '⚠️ Внимание (Ожирение ИМТ ≥ 30): Фактический вес значительно превосходит идеальный. Использование TBW для индукции пропофола или релаксантов приведет к тяжелой передозировке!',
    dosageFineTuningTitle: 'Интерактивная настройка целевых дозировок',
    propofolInductionSliderLabel: 'Пропофол Индукция (LBW):',
    propofolMaintSliderLabel: 'Пропофол Инфузия (TBW):',
    fentanylInductionSliderLabel: 'Фентанил Индукция (LBW):',
    fentanylMaintSliderLabel: 'Фентанил Инфузия (LBW):',
    rocuroniumInductionSliderLabel: 'Рокуроний Индукция (IBW):',
    atracuriumInductionSliderLabel: 'Атракуриум Индукция (IBW):',
    standardLabel: 'Стандарт',
    minLabel: 'Мин',
    maxLabel: 'Макс',
    summaryTableTitle: 'Сводная таблица дозирования препаратов',
    colDrugAndPhase: 'Препарат и Этап',
    colBaseWeight: 'Базовый вес (кг)',
    colDoseRange: 'Диапазон дозы',
    colCalculatedDose: 'Рассчитанная доза',
    colVolumeOrSpeed: 'Объем / Скорость',
    colWeightRationale: 'Обоснование весовой категории',
    propofolInductionExp: 'Доза рассчитывается по LBW (тощей массе) во избежание выраженной гемодинамической нестабильности у пациентов с избыточным весом.',
    propofolMaintExp: 'Поддержание анестезии рассчитывается по TBW (фактическому весу) или целевой концентрации TCI.',
    fentanylInductionExp: 'Индукция анальгезии рассчитывается по тощей массе тела (LBW).',
    fentanylMaintExp: 'Поддержание фентанилом дозируется по тощей массе тела (LBW).',
    rocuroniumExp: 'Доза миорелаксанта рассчитывается по идеальной массе (IBW) во избежание опасного удлинения нервно-мышечного блока.',
    atracuriumExp: 'Дозируется по идеальной массе тела (IBW) для предотвращения пролонгированного блока.',
    cheatSheetTitle: 'Шпаргалка применения массы тела в ОРИТ и анестезиологии',
    cheatSheetSubtitle: 'Определяющий ориентир применения антропометрических масс при различных клинических задачах:',
    colClinicalParam: 'Клинический параметр / Препарат',
    colScalarUsed: 'Расчетная масса тела',
    colPhysioRationale: 'Физиологическое обоснование',
    paramVentVt: 'Параметры ИВЛ (Vt)',
    rationaleVentVt: 'Размер легких зависит от роста и пола человека, а не от объема жировой ткани. Предотвращает волюмотравму.',
    paramPropInduction: 'Пропофол (Индукция)',
    rationalePropInduction: 'Предотвращает тяжелую вазодилатацию и глубокую гипотензию у пациентов с ожирением.',
    paramPropMaintenance: 'Пропофол (Инфузия / TCI)',
    rationalePropMaintenance: 'Перераспределение препарата в жировую ткань при продолжительном введении требует учета клиренса и фактической массы.',
    paramRelaxants: 'Миорелаксанты (Рокуроний, Векуроний, Атракуриум)',
    rationaleRelaxants: 'Объем распределения гидрофильных релаксантов не увеличивается пропорционально жировой массе. Защищает от затяжного блока.',
    paramSuxamethonium: 'Суксаметоний (Дитилин)',
    rationaleSuxamethonium: 'При ожирении уровень псевдохолинэстеразы плазмы и объем крови повышены.',
    paramFentanyl: 'Фентанил (Индукция и поддерживающая инфузия)',
    rationaleFentanyl: 'Липофильный опиоид, но первичный центральный эффект и фармакодинамика зависят от метаболически активных органов.',
    paramAminoglycosides: 'Аминогликозиды / Ванкомицин',
    rationaleAminoglycosides: 'Жировая ткань содержит ~20-30% внеклеточной жидкости. Коррекция предотвращает нефротоксичность.',
    propofolName: 'Пропофол (Propofol)',
    propofolMaintName: 'Пропофол (Инфузия)',
    fentanylName: 'Фентанил (Fentanyl)',
    fentanylMaintName: 'Фентанил (Инфузия)',
    rocuroniumName: 'Рокуроний (Rocuronium)',
    atracuriumName: 'Атракуриум (Atracurium)',
    unitMgKg: 'мг/кг',
    unitMcgKgMin: 'мкг/кг/мин',
    unitMcgKg: 'мкг/кг',
    unitMcgKgHour: 'мкг/кг/час',
    unitMgHour: 'мг/час',
    unitMcgHour: 'мкг/час',
    unitMl: 'мл',
    unitMlHour: 'мл/час',

    // Blood Gas & Infusion therapy additions
    bloodGasTitle: 'Анализ газов крови и кислотно-основного состояния',
    bloodGasSubtitle: 'Интерпретация артериальных газов, анионного промежутка, Δ/Δ, ожидаемого PaCO2, осмолярного промежутка и тактики лечения.',
    primaryDisorderLabel: 'Основное нарушение',
    compensationLabel: 'Компенсация',
    mixedDisorderLabel: 'Смешанное нарушение',
    anionGapStatusLabel: 'Анионный промежуток',
    deltaDeltaLabel: 'Соотношение Δ/Δ',
    treatmentAdviceLabel: 'Рекомендации по тактике лечения',
    generalPrinciplesLabel: 'Общие принципы терапии',
    internalConsistencyLabel: 'Проверка внутренней согласованности',
    sampleTypeLabel: 'Тип пробы',
    arterialSample: 'Артериальная кровь',
    venousSample: 'Венозная кровь',

    infusionTherapyTitle: 'Калькулятор инфузионной терапии и баланса жидкости',
    infusionTherapySubtitle: 'Расчет общей воды организма, дефицита жидкости, поддерживающей инфузии, текущих потерь и подбор растворов.',
    totalBodyWaterLabel: 'Общая вода организма (ОВоО)',
    extracellularFluidLabel: 'Внеклеточная жидкость (ВКЖ)',
    intracellularFluidLabel: 'Внутриклеточная жидкость (ВКЖ)',
    maintenanceFluidLabel: 'Поддерживающая инфузия',
    fluidDeficitLabel: 'Дефицит жидкости',
    ongoingLossesLabel: 'Текущие потери',
    totalInfusionVolumeLabel: 'Общий объем инфузии (24ч)',
    recommendedSolutionsLabel: 'Рекомендуемые растворы',
    monitoringParametersLabel: 'Параметры мониторинга и безопасности',
    diuresisLabel: 'Диурез (выделение мочи)',
    bloodPressureLabel: 'Артериальное давление (АД)',
    heartRateLabel: 'Частота сердечных сокращений (ЧСС)',
    cvpLabel: 'Центральное венозное давление (ЦВД)',
    vomitingLabel: 'Рвота / Желудочные потери',
    diarrheaLabel: 'Диарея / Кишечные потери',
    feverLabel: 'Лихорадка / Повышенная температура',
    postoperativeLabel: 'Послеоперационные потери',
    burnsLabel: 'Ожоговая поверхность',
    sepsisLabel: 'Сепсис / Септический шок',
    kidneyFailureLabel: 'Почечная недостаточность / Олигурия',
    anesthesiologyDepartment: 'Анестезиология & Реанимация',
    obesityWarningTitle: 'Внимание (Ожирение ИМТ ≥ 30)',
    overweightWarningTitle: 'Внимание (Избыточный вес: TBW > 120% IBW)',
    overweightWarningText: 'Фактическая масса превышает идеальную более чем на 20%. Используйте LBW для индукции пропофола и IBW для миорелаксантов во избежание передозировки.',
    enterHeightWeightPrompt: 'Введите рост и вес пациента для расчета матрицы.',
    inductionDoseLabel: 'Доза индукции',
    maintenanceInfusionLabel: 'Поддерживающая инфузия',
    clickToExpandLabel: 'Детали и инфузия',
    clickToCollapseLabel: 'Свернуть',
  },
  
  uk: {
    // Navigation
    home: 'Головна',
    potassium: 'Калій',
    wounds: 'Рани',
    children: 'Діти',
    about: 'Про нас',
    
    // Header
    welcome: 'Ласкаво просимо до MDcalc',
    welcomeSubtitle: 'Ваш надійний помічник у медичних розрахунках',
    
    // Calculator titles and descriptions
    potassiumCorrection: 'Корекція рівня калію',
    potassiumCorrectionDesc: 'Розрахунок дози Аспаркаму та KCl для корекції калію з урахуванням ваги пацієнта та цільового рівня.',
    antibioticProphylaxis: 'Антибіотикопрофілактика при ранах',
    antibioticProphylaxisDesc: 'Алгоритм прийняття рішення про призначення антибіотикопрофілактики згідно з сучасними рекомендаціями.',
    pediatricDoses: 'Дитячі дози препаратів',
    pediatricDosesDesc: 'Розрахунок дитячих доз препаратів з урахуванням віку та ваги дитини. Перевірка безпеки та протипоказань.',
    intubationDoses: 'Препарати для інтубації',
    intubationDosesDesc: 'Розрахунок доз Пропофолу, Фентанілу, Атракуріуму та Рокуронію з урахуванням антропометричних параметрів (TBW, IBW, LBW, ABW) та ШВЛ.',
    bloodGas: 'Аналіз газів крові',
    bloodGasDesc: 'Інтерпретація артеріальних газів крові та кислотно-основних порушень.',
    infusionTherapy: 'Інфузійна терапія',
    infusionTherapyDesc: 'Розрахунок підтримуючої інфузії та корекції дефіциту.',
    glasgowComaScale: 'Шкала коми Глазго (ШКГ)',
    glasgowComaScaleDesc: 'Оцінка рівня свідомості пацієнта за шкалою Глазго.',
    comingSoon: 'Незабаром',
    
    // Actions
    startCalculation: 'Почати розрахунок',
    backToCalculators: '← Назад до калькуляторів',
    
    // Footer
    copyright: '© 2025 MDcalc. Всі права захищені.',
    
    // Calculator specific
    currentPotassiumLevel: 'Поточний рівень калію',
    patientWeight: 'Вага пацієнта',
    mmolL: 'ммоль/л',
    kg: 'кг',
    targetPotassiumLevel: 'Цільовий рівень калію',
    targetPotassiumLevelDesc: 'Цільовий рівень калію: 4.5 ммоль/л (фіксоване значення)',
    useAsparkam: 'Використовувати аспаркам',
    useAsparkamDesc: 'Якщо не відмічено, буде використаний калію хлорид 7.5%',
    calculate: 'Розрахувати',
    reset: 'Скинути',
    pleaseFillAllFields: 'Будь ласка, заповніть всі необхідні поля',
    
    // Results
    potassiumDeficit: 'Дефіцит калію',
    asparkamDose: 'Доза аспаркаму',
    potassiumChlorideDose: 'Доза калію хлориду',
    infusionRate: 'Швидкість інфузії',
    duration: 'Тривалість',
    ml: 'мл',
    mmolHour: 'ммоль/год',
    
    // Wound calculator
    woundType: 'Тип рани',
    woundLocation: 'Локалізація рани',
    woundAge: 'Вік рани',
    patientAge: 'Вік пацієнта',
    diabetes: 'Цукровий діабет',
    immunosuppression: 'Імуносупресія',
    woundDepth: 'Глибина рани',
    contaminationLevel: 'Рівень забруднення',
    selectWoundType: 'Виберіть тип рани',
    selectLocation: 'Виберіть локалізацію',
    selectDepth: 'Виберіть глибину',
    selectContamination: 'Виберіть рівень забруднення',
    superficial: 'Поверхнева',
    deep: 'Глибока',
    clean: 'Чиста',
    contaminated: 'Забруднена',
    dirty: 'Брудна',
    head: 'Голова',
    neck: 'Шия',
    trunk: 'Тулуб',
    extremities: 'Кінцівки',
    hands: 'Кисті',
    feet: 'Стопи',
    laceration: 'Рвана',
    puncture: 'Колота',
    bite: 'Укус',
    burn: 'Опік',
    abrasion: 'Подряпина',
    avulsion: 'Відривна',
    crush: 'Розчавлена',
    gunshot: 'Куляна',
    other: 'Інша',
    lessThan6Hours: 'Менше 6 годин',
    moreThan6Hours: 'Більше 6 годин',
    lessThan50: 'Менше 50 років',
    moreThan50: 'Більше 50 років',
    yes: 'Так',
    no: 'Ні',
    antibioticRecommended: 'Антибіотикопрофілактика рекомендується',
    antibioticNotRecommended: 'Антибіотикопрофілактика не рекомендується',
    recommendation: 'Рекомендація',
    reasoning: 'Обґрунтування',
    
    // Pediatric calculator
    medicationName: 'Назва препарату',
    childAge: 'Вік дитини',
    childWeight: 'Вага дитини',
    childHeight: 'Зріст дитини',
    years: 'років',
    months: 'місяців',
    cm: 'см',
    selectMedication: 'Виберіть препарат',
    recommendedDose: 'Рекомендована доза',
    maxDose: 'Максимальна доза',
    contraindications: 'Протипоказання',
    notes: 'Примітки',
    mg: 'мг',
    mgKg: 'мг/кг',
    every4Hours: 'кожні 4 години',
    every6Hours: 'кожні 6 годин',
    every8Hours: 'кожні 8 годин',
    every12Hours: 'кожні 12 годин',
    daily: 'на добу',
    asNeeded: 'за необхідності',
    none: 'Немає',
    every4to6Hours: 'кожні 4-6 годин',
    every6to8Hours: 'кожні 6-8 годин',
    every8to12Hours: 'кожні 8-12 годин',
    once: 'одноразово',
    ageRestriction: 'Вікове обмеження',
    weightRestriction: 'Обмеження за вагою',
    allergy: 'Алергія',
    renalImpairment: 'Ниркова недостатність',
    hepaticImpairment: 'Печінкова недостатність',
    
    // Recommendations
    calculationResults: 'Результати розрахунку',
    recommendations: 'Рекомендації:',
    maxInfusionRate: '• Максимальна швидкість інфузії калію: 20 ммоль/год',
    monitorPotassium: '• Контролювати рівень калію кожні 2-4 години',
    stopInfusion: '• При рівні калію > 5.5 ммоль/л припинити інфузію',
    ecgMonitoring: '• Моніторинг ЕКГ при важкій гіпокаліємії',
    
    // Antibiotic calculator specific
    timeFromInjury: 'Час з моменту травми',
    surgeryDuration: 'Тривалість операції',
    hasDiabetes: 'Цукровий діабет',
    hasImmunodeficiency: 'Імунодефіцит',
    hasVascularDisease: 'Судінні захворювання',
    hasMalnutrition: 'Недоїдання',
    hasAllergies: 'Алергії',
    allergies: 'Алергії',
    renalFunction: 'Функція нирок',
    isDelayedClosure: 'Відстрочене закриття',
    hours: 'годин',
    minutes: 'хвилин',
    riskLevel: 'Рівень ризику',
    low: 'Низький',
    medium: 'Середній',
    high: 'Високий',
    immediateIndication: 'Негайне показання',
    antibioticNeeded: 'Антибіотикопрофілактика необхідна',
    antibioticNotNeeded: 'Антибіотикопрофілактика не необхідна',
    riskFactors: 'Фактори ризику',
    patientFactors: 'Фактори пацієнта',
    woundFactors: 'Фактори рани',
    environmentalFactors: 'Фактори навколишнього середовища',
    
    // Section headers
    step1WoundAssessment: 'Крок 1: Первинна оцінка рани',
    step2PatientFactors: 'Крок 2: Фактори пацієнта',
    step3AllergiesAndAdditional: 'Крок 3: Алергії та додаткові параметри',
    
    // Route options
    oral: 'Перорально',
    intravenous: 'Внутрішньовенно',
    intramuscular: 'Внутрішньом\'язово',
    subcutaneous: 'Підшкірно',
    routeOfAdministration: 'Шлях введення',
    indication: 'Показання до застосування',
    indicationPlaceholder: 'Наприклад: Лихоманка, Біль, Інфекція...',
    safety: 'Безпека',
    safe: 'БЕЗПЕЧНИЙ',
    notSafe: 'НЕ БЕЗПЕЧНИЙ',
    contraindication: 'Протипоказання',
    contraindicationReason: 'Причина протипоказання',
    medicationNotFound: 'Препарат не знайдено в базі даних',
    consultDoctor: 'Проконсультуйтесь з лікарем для отримання точної інформації про дозування',
    contraindicatedForAge: 'Препарат протипоказаний дітям молодше',
    contraindicatedForWeight: 'років або вагою менше',
    dosingRecommendations: 'Рекомендації щодо дозування',
    doseRange: 'Діапазон доз',
    frequency: 'Частота прийому',
    dailyDose: 'Добова доза',
    bodySurfaceArea: 'Площа поверхні тіла',
    importantWarnings: 'Важливі попередження',
    disclaimer: 'Важливо',
    disclaimerText: 'Даний калькулятор призначений тільки для інформаційних цілей. Всі призначення повинні проводитися кваліфікованим медичним персоналом з урахуванням індивідуальних особливостей пацієнта та клінічної ситуації.',
    age: 'Вік',
    weight: 'Вага',
    route: 'Шлях введення',
    category: 'Категорія',
    notSpecified: 'Не вказано',
    availableMedications: 'Доступні препарати в базі',
    medications: 'препаратів',
    medication: 'Препарат',
    verified: 'Перевірено',
    medicationCategories: 'Категорії препаратів',
    speciallyAdded: 'Спеціально додані препарати',
    verifiedDoses: 'Перевірені дозування',
    emergencyMedications: 'Препарати невідкладної допомоги',
    quickSearch: 'Швидкий пошук препаратів',
    searchPlaceholder: 'Введіть назву препарату для пошуку...',
    allCategories: 'Всі категорії',
    clickToSelect: 'Клікніть для вибору',
    hideMedicationList: 'Сховати список препаратів',
    showMedicationList: 'Показати список препаратів',
    
    // Electrolyte correction calculator
    electrolyteCorrection: 'Калькулятор корекції електролітів',
    electrolyteCorrectionDesc: 'Комплексний калькулятор для корекції порушень калію, натрію, магнію та кальцію',
    selectElectrolyte: 'Виберіть електроліт',
    selectCorrectionType: 'Виберіть тип корекції',
    currentLevel: 'Поточний рівень',
    albumin: 'Альбумін',
    gdL: 'г/дл',
    hasEcgChanges: 'Зміни на ЕКГ',
    hasSymptoms: 'Симптоми присутні',
    normal: 'Нормальна',
    mild: 'Легка',
    moderate: 'Помірна',
    severe: 'Важка',
    correctedLevel: 'Скоригований рівень',
    deficit: 'Дефіцит',
    excess: 'Надлишок',
    recommendedDoses: 'Рекомендовані дози',
    emergencyActions: 'Термінові дії',
    warnings: 'Попередження',
    
    // Electrolyte types
    electrolytePotassium: 'Калій',
    electrolyteSodium: 'Натрій',
    electrolyteMagnesium: 'Магній',
    electrolyteCalcium: 'Кальцій',
    
    // Correction types
    correctionHypo: 'Гіпо',
    correctionHyper: 'Гіпер',
    
    // Units
    unitMgdL: 'мг/дл',
    unitMEqL: 'мЕкв/л',
    unitGL: 'г/л',
    
    // Additional electrolyte calculator translations
    mmol: 'ммоль',
    tablets: 'таблеток',
    timesPerDay: 'разів на день',
    takeAfterMeals: 'Приймати після їжі',
    maxSpeed: 'Максимальна швидкість',
    infusion24Hours: 'Інфузія 24 години',
    alternativeToAsparkam: 'Альтернатива аспаркаму',
    slowCorrection: 'Повільна корекція',
    osmoticDemyelination: 'осмотичної демієлінізації',
    monitorSodium: 'Контроль рівня натрію',
    tendonReflexes: 'Моніторинг сухожильних рефлексів',
    monitorMagnesium: 'Контроль рівня магнію',
    maxSpeed1gHour: 'Максимальна швидкість 1 г/год',
    maxSpeed10mEqHour: 'Максимальна швидкість 10 мЕкв/год',
    monitorECG: 'Моніторинг ЕКГ',
    monitorCalcium: 'Контроль рівня кальцію',
    severeHyperkalemia: 'Важка гіперкаліємія',
    emergencyCare: 'потребує невідкладної допомоги',
    significantSodiumDeviation: 'Значне відхилення натрію',
    carefulCorrection: 'потребує обережної корекції',
    membraneStabilization: 'стабілізація мембран',
    insulinGlucose: 'Інсулін 10 ОД + глюкоза 50% 50 мл IV',
    sodiumBicarbonate: 'Натрію бікарбонат 50-100 мЕкв IV',
    acidosis: 'при ацидозі',
    salbutamol: 'Сальбутамол 10-20 мг',
    inhaled: 'інгаляційно',
    furosemide: 'Фуросемід',
    preservedKidneyFunction: 'При збереженій функції нирок',
    continuousECG: 'Безперервний моніторинг ЕКГ',
    monitorPotassiumEvery: 'Контроль рівня калію кожні 1-2 години',
    considerHemodialysis: 'Розглянути гемодіаліз при рівні > 7.0 ммоль/л',
    dextrose5: 'Декстроза 5%',
    magnesiumAntagonist: 'Антагоніст магнію',
    enhanceExcretion: 'Посилення екскреції',
    considerHemodialysisMagnesium: 'Розглянути гемодіаліз при важкій гіпермагніємії',
    calcitonin: 'Кальцитонін',
    zoledronicAcid: 'Золедронова кислота',
    infusion60Minutes: 'Інфузія 60 хвилин',
    hydration: 'Гідратація',
    physiologicalSolution: 'фізіологічним розчином',
    monitorKidneyFunction: 'Моніторинг функції нирок',
    severeHypokalemia: 'при важкій гіпокаліємії',
    every2to4Hours: 'кожні 2-4 години',
    stopInfusionIfPotassiumHigh: 'При рівні калію > 5.5 ммоль/л припинити інфузію',
    oralCourse3to4Weeks: 'Пероральний курс: 3-4 тижні з можливістю повторення',
    forBetterTolerability: 'для кращої переносимості',
    toPrevent: 'для запобігання',
    every6to12Hours: 'кожні 6-12 годин',
    severeHypocalcemia: 'при важкій гіпокальціємії',
    notMoreThan: 'не більше',
    moreConcentratedSolution: 'Більш концентрований розчин',

    // Intubation calculator specific
    intubationTitle: 'Калькулятор доз препаратів для інтубації та параметрів мас тіла',
    intubationSubtitle: 'Точний розрахунок дозувань гіпнотиків (Пропофол), анальгетиків (Фентаніл) та міорелаксантів (Рокуроній / Атракуріум) для індукції та підтримання анестезії з урахуванням антропометричних показників (TBW, IBW, LBW Жанмахасатіан/Джеймс, ABW) та параметрів ШВЛ (Vt).',
    patientDataSection: 'Дані пацієнта',
    genderLabel: 'Стать',
    maleGender: 'Чоловіча',
    femaleGender: 'Жіноча',
    ageYearsLabel: 'Вік (років)',
    heightCmLabel: 'Зріст (см)',
    actualWeightTbwLabel: 'Фактична маса тіла TBW (кг)',
    lbwFormulaLabel: 'Формула LBW (Тоща маса)',
    janmahasatianGoldStandard: 'Janmahasatian (2005) — Золотий стандарт',
    jamesClassic: 'James (1976) — Класична',
    relaxantForIntubationLabel: 'Міорелаксант для інтубації',
    showBothRelaxants: 'Показати Рокуроній та Атракуріум',
    rocuroniumDoseRangeOption: 'Рокуроній (0.6 - 1.2 мг/кг)',
    atracuriumDoseRangeOption: 'Атракуріум (0.4 - 0.5 мг/кг)',
    showConcSettings: 'Налаштування концентрацій розчинів (мг/мл)',
    hideConcSettings: 'Сховати налаштування концентрацій',
    propofolConcLabel: 'Пропофол (мг/мл)',
    fentanylConcLabel: 'Фентаніл (мкг/мл)',
    rocuroniumConcLabel: 'Рокуроній (мг/мл)',
    atracuriumConcLabel: 'Атракуріум (мг/мл)',
    anthropometricMatrixTitle: 'Антропометрична матриця',
    tbwMatrixLabel: 'TBW (Фактична вага):',
    ibwMatrixLabel: 'IBW (Ідеальна вага - Devine):',
    lbwJanMatrixLabel: 'LBW (Тоща вага - Janmahasatian):',
    lbwJamesMatrixLabel: 'LBW (Тоща вага - James):',
    abwMatrixLabel: 'ABW (Скоригована вага):',
    bmiMatrixLabel: 'ІМТ (BMI):',
    ventilationVtParamLabel: 'ШВЛ Параметр ДОб (Vt):',
    obesityWarningText: '⚠️ Увага (Ожиріння ІМТ ≥ 30): Фактична вага значно перевищує ідеальну. Використання TBW для індукції пропофолу або релаксантів призведе до тяжкого передозирування!',
    dosageFineTuningTitle: 'Інтерактивне налаштування цільових дозувань',
    propofolInductionSliderLabel: 'Пропофол Індукція (LBW):',
    propofolMaintSliderLabel: 'Пропофол Інфузія (TBW):',
    fentanylInductionSliderLabel: 'Фентаніл Індукція (LBW):',
    fentanylMaintSliderLabel: 'Фентаніл Інфузія (LBW):',
    rocuroniumInductionSliderLabel: 'Рокуроній Індукція (IBW):',
    atracuriumInductionSliderLabel: 'Атракуріум Індукція (IBW):',
    standardLabel: 'Стандарт',
    minLabel: 'Мін',
    maxLabel: 'Макс',
    summaryTableTitle: 'Зведена таблиця дозування препаратів',
    colDrugAndPhase: 'Препарат та Етап',
    colBaseWeight: 'Базова вага (кг)',
    colDoseRange: 'Діапазон дози',
    colCalculatedDose: 'Розрахована доза',
    colVolumeOrSpeed: 'Об\'єм / Швидкість',
    colWeightRationale: 'Обґрунтування ваговій категорії',
    propofolInductionExp: 'Доза розраховується за LBW (тощою масою) для уникнення вираженої гемодинамічної нестабільності у пацієнтів із надмірною вагою.',
    propofolMaintExp: 'Підтримання анестезії розраховується за TBW (фактичною вагою) або цільовою концентрацією TCI.',
    fentanylInductionExp: 'Індукція анальгезії розраховується за щойною масою тіла (LBW).',
    fentanylMaintExp: 'Підтримання фентанілом дозується за щойною масою тіла (LBW).',
    rocuroniumExp: 'Доза міорелаксанту розраховується за ідеальною масою (IBW) для уникнення небезпечного подовження нервово-м\'язового блоку.',
    atracuriumExp: 'Дозується за ідеальною масою тіла (IBW) для запобігання пролонгованому блоку.',
    cheatSheetTitle: 'Шпаргалка застосування маси тіла в ВІТ та анестезіології',
    cheatSheetSubtitle: 'Визначальний орієнтир застосування антропометричних мас при різних клінічних завданнях:',
    colClinicalParam: 'Клінічний параметр / Препарат',
    colScalarUsed: 'Розрахункова маса тіла',
    colPhysioRationale: 'Фізіологічне обґрунтування',
    paramVentVt: 'Параметри ШВЛ (Vt)',
    rationaleVentVt: 'Розмір легень залежить від зросту та статі людини, а не від об\'єму жирової тканини. Запобігає волюмотравмі.',
    paramPropInduction: 'Пропофол (Індукція)',
    rationalePropInduction: 'Запобігає тяжкій вазодилатації та глибокій гіпотензії у пацієнтів з ожирінням.',
    paramPropMaintenance: 'Пропофол (Інфузія / TCI)',
    rationalePropMaintenance: 'Перерозподіл препарату у жирову тканину при тривалому введенні вимагає урахування кліренсу та фактичної маси.',
    paramRelaxants: 'Міорелаксанти (Рокуроній, Векуроній, Атракуріум)',
    rationaleRelaxants: 'Об\'єм розподілу гідрофільних релаксантів не збільшується пропорційно жировій масі. Захищає від затяжного блоку.',
    paramSuxamethonium: 'Суксаметоний (Дитилін)',
    rationaleSuxamethonium: 'При ожирінні рівень псевдохолінестерази плазми та об\'єм крові підвищені.',
    paramFentanyl: 'Фентаніл (Індукція та підтримуюча інфузія)',
    rationaleFentanyl: 'Ліпофільний опіоїд, але первинний центральний ефект та фармакодинаміка залежать від метаболічно активних органів.',
    paramAminoglycosides: 'Аміноглікозиди / Ванкоміцин',
    rationaleAminoglycosides: 'Жирова тканина містить ~20-30% позаклітинної рідини. Корекція запобігає нефротоксичності.',
    propofolName: 'Пропофол (Propofol)',
    propofolMaintName: 'Пропофол (Інфузія)',
    fentanylName: 'Фентаніл (Fentanyl)',
    fentanylMaintName: 'Фентаніл (Інфузія)',
    rocuroniumName: 'Рокуроній (Rocuronium)',
    atracuriumName: 'Атракуріум (Atracurium)',
    unitMgKg: 'мг/кг',
    unitMcgKgMin: 'мкг/кг/хв',
    unitMcgKg: 'мкг/кг',
    unitMcgKgHour: 'мкг/кг/год',
    unitMgHour: 'мг/год',
    unitMcgHour: 'мкг/год',
    unitMl: 'мл',
    unitMlHour: 'мл/год',

    // Blood Gas & Infusion therapy additions
    bloodGasTitle: 'Аналіз газів крові та кислотно-основного стану',
    bloodGasSubtitle: 'Інтерпретація артеріальних газів, аніонного проміжку, Δ/Δ, очікуваного PaCO2, осмолярного проміжку та тактики лікування.',
    primaryDisorderLabel: 'Основне порушення',
    compensationLabel: 'Компенсація',
    mixedDisorderLabel: 'Змішане порушення',
    anionGapStatusLabel: 'Аніонний проміжок',
    deltaDeltaLabel: 'Співвідношення Δ/Δ',
    treatmentAdviceLabel: 'Рекомендації щодо тактики лікування',
    generalPrinciplesLabel: 'Загальні принципи терапії',
    internalConsistencyLabel: 'Перевірка внутрішньої узгодженості',
    sampleTypeLabel: 'Тип проби',
    arterialSample: 'Артеріальна кров',
    venousSample: 'Венозна кров',

    infusionTherapyTitle: 'Калькулятор інфузійної терапії та балансу рідини',
    infusionTherapySubtitle: 'Розрахунок загальної води організму, дефіциту рідини, підтримуючої інфузії, поточних втрат та підбір розчинів.',
    totalBodyWaterLabel: 'Загальна вода організму (ЗВО)',
    extracellularFluidLabel: 'Позаклітинна рідина (ПКР)',
    intracellularFluidLabel: 'Внутрішньоклітинна рідина (ВКР)',
    maintenanceFluidLabel: 'Підтримуюча інфузія',
    fluidDeficitLabel: 'Дефіцит рідини',
    ongoingLossesLabel: 'Поточні втрати',
    totalInfusionVolumeLabel: 'Загальний об\'єм інфузії (24год)',
    recommendedSolutionsLabel: 'Рекомендовані розчини',
    monitoringParametersLabel: 'Параметри моніторингу та безпеки',
    diuresisLabel: 'Диурез (виділення сечі)',
    bloodPressureLabel: 'Артеріальний тиск (АТ)',
    heartRateLabel: 'Частота серцевих скорочень (ЧСС)',
    cvpLabel: 'Центральний венозний тиск (ЦВТ)',
    vomitingLabel: 'Блювання / Шлункові втрати',
    diarrheaLabel: 'Діарея / Кишкові втрати',
    feverLabel: 'Лихоманка / Підвищена температура',
    postoperativeLabel: 'Післяопераційні втрати',
    burnsLabel: 'Опікова поверхня',
    sepsisLabel: 'Сепсис / Септичний шок',
    kidneyFailureLabel: 'Ниркова недостатність / Олігурія',
    anesthesiologyDepartment: 'Анестезіологія & Реанімація',
    obesityWarningTitle: 'Увага (Ожиріння ІМТ ≥ 30)',
    overweightWarningTitle: 'Увага (Надмірна вага: TBW > 120% IBW)',
    overweightWarningText: 'Фактична маса перевищує ідеальну більше ніж на 20%. Використовуйте LBW для індукції пропофолу та IBW для міорелаксантів для запобігання передозуванню.',
    enterHeightWeightPrompt: 'Введіть зріст та вагу пацієнта для розрахунку матриці.',
    inductionDoseLabel: 'Доза індукції',
    maintenanceInfusionLabel: 'Підтримуюча інфузія',
    clickToExpandLabel: 'Деталі та інфузія',
    clickToCollapseLabel: 'Згорнути',
  },
}; 