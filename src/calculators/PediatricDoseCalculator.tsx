'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { PediatricDoseInputs, PediatricDoseResult } from '@/types';
import { pediatricMedicationsDatabase } from '@/data/pediatricMedications';
import { useLanguage } from '@/i18n/LanguageContext';

export const PediatricDoseCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [inputs, setInputs] = useState<PediatricDoseInputs>({
    age: null,
    weight: null,
    height: null,
    medication: '',
    indication: '',
    route: 'oral',
  });

  const [result, setResult] = useState<PediatricDoseResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showMedicationsList, setShowMedicationsList] = useState(false);

  // Используем расширенную базу данных препаратов
  const medicationsDatabase = pediatricMedicationsDatabase;

  const routeOptions = [
    { value: 'oral', label: t.oral },
    { value: 'iv', label: t.intravenous },
    { value: 'im', label: t.intramuscular },
    { value: 'sc', label: t.subcutaneous },
  ];

  const calculateDose = () => {
    // Проверяем, что все необходимые поля заполнены
    if (inputs.age === null || inputs.weight === null || !inputs.medication) {
      alert(t.pleaseFillAllFields);
      return;
    }

    // Находим препарат в базе данных
    const medication = medicationsDatabase.find(med => 
      med.name.toLowerCase().includes(inputs.medication.toLowerCase())
    );

    if (!medication) {
      setResult({
        isSafe: false,
        isContraindicated: true,
        contraindicationReason: t.medicationNotFound,
        recommendedDose: 0,
        doseUnit: '',
        frequency: '',
        totalDailyDose: 0,
        warnings: [t.consultDoctor],
        notes: [],
      });
      return;
    }

    // Проверяем возраст и вес
    const isAgeSafe = inputs.age >= medication.minAge;
    const isWeightSafe = inputs.weight >= medication.minWeight;

    if (!isAgeSafe || !isWeightSafe) {
      setResult({
        isSafe: false,
        isContraindicated: true,
        contraindicationReason: `${t.contraindicatedForAge} ${medication.minAge} ${t.years} ${t.contraindicatedForWeight} ${medication.minWeight} ${t.kg}`,
        recommendedDose: 0,
        doseUnit: '',
        frequency: '',
        totalDailyDose: 0,
        warnings: medication.warnings,
        notes: [],
      });
      return;
    }

    // Рассчитываем дозу
    const dosingMethod = medication.dosingMethods[0]; // Берем первый метод дозирования
    let recommendedDose = 0;
    let totalDailyDose = 0;
    let doseRange = '';

    switch (dosingMethod.type) {
      case 'weight':
        // Рассчитываем дозу с учетом пути введения
        let selectedDose = dosingMethod.minDose;
        let routeSpecificDose = null;
        
        // Парсим примечания для поиска специфичных доз по путям введения
        const notes = dosingMethod.notes;
        
        // Для парацетамола - специальная логика
        if (medication.name.toLowerCase().includes('парацетамол')) {
          if (inputs.route === 'iv') {
            // Внутривенно: 15 мг/кг каждые 6 часов для детей 2-12 лет <50 кг
            if (inputs.age >= 2 && inputs.age <= 12 && inputs.weight < 50) {
              selectedDose = 15;
              routeSpecificDose = 15;
            } else if (inputs.age >= 1 && inputs.age < 2) {
              // Младенцы 1-23 месяца: 7.5-15 мг/кг каждые 6 часов
              selectedDose = 15;
              routeSpecificDose = 15;
            }
          } else if (inputs.route === 'oral') {
            // Перорально: 10-15 мг/кг каждые 4-6 часов
            selectedDose = 15;
            routeSpecificDose = 15;
          }
        }
        // Для кеторолака
        else if (medication.name.toLowerCase().includes('кеторолак')) {
          if (inputs.route === 'iv') {
            selectedDose = 0.5;
            routeSpecificDose = 0.5;
          } else if (inputs.route === 'im') {
            selectedDose = 1;
            routeSpecificDose = 1;
          }
        }
        // Для ондасетрона
        else if (medication.name.toLowerCase().includes('ондасетрон')) {
          if (inputs.route === 'iv') {
            selectedDose = 0.1;
            routeSpecificDose = 0.1;
          }
        }
        // Для других препаратов - общая логика
        else {
          // Проверяем примечания на наличие информации о путях введения
          if (notes.includes('IV:') && notes.includes('IM:')) {
            if (inputs.route === 'iv') {
              const ivMatch = notes.match(/IV:\s*([^,]+)/);
              if (ivMatch) {
                const ivDose = parseFloat(ivMatch[1].match(/(\d+(?:\.\d+)?)/)?.[1] || dosingMethod.minDose.toString());
                selectedDose = ivDose;
                routeSpecificDose = ivDose;
              }
            } else if (inputs.route === 'im') {
              const imMatch = notes.match(/IM:\s*([^,]+)/);
              if (imMatch) {
                const imDose = parseFloat(imMatch[1].match(/(\d+(?:\.\d+)?)/)?.[1] || dosingMethod.maxDose.toString());
                selectedDose = imDose;
                routeSpecificDose = imDose;
              }
            } else {
              // Перорально или подкожно - берем среднюю дозу
              selectedDose = (dosingMethod.minDose + dosingMethod.maxDose) / 2;
            }
          } else if (notes.includes('PO:') && notes.includes('IV:')) {
            if (inputs.route === 'oral') {
              const poMatch = notes.match(/PO:\s*([^,]+)/);
              if (poMatch) {
                const poDose = parseFloat(poMatch[1].match(/(\d+(?:\.\d+)?)/)?.[1] || dosingMethod.minDose.toString());
                selectedDose = poDose;
                routeSpecificDose = poDose;
              }
            } else if (inputs.route === 'iv') {
              const ivMatch = notes.match(/IV:\s*([^,]+)/);
              if (ivMatch) {
                const ivDose = parseFloat(ivMatch[1].match(/(\d+(?:\.\d+)?)/)?.[1] || dosingMethod.minDose.toString());
                selectedDose = ivDose;
                routeSpecificDose = ivDose;
              }
            }
          } else {
            // Если нет специфичной информации о путях введения, берем среднюю дозу
            selectedDose = (dosingMethod.minDose + dosingMethod.maxDose) / 2;
          }
        }
        
        // Рассчитываем дозу на основе веса
        const dosePerWeight = selectedDose * inputs.weight;
        
        // Проверяем максимальные дозы из примечаний
        let maxSingleDose = Infinity;
        if (notes.includes('макс.') || notes.includes('максимальная доза:')) {
          // Ищем "макс. 30 мг" или "максимальная доза: 30 мг"
          const maxDoseMatch = notes.match(/(?:макс\.|максимальная доза:)\s*(\d+(?:\.\d+)?)\s*мг/);
          if (maxDoseMatch) {
            maxSingleDose = parseFloat(maxDoseMatch[1]);
          }
        }
        
        // Ограничиваем дозу максимальным значением
        recommendedDose = Math.min(dosePerWeight, maxSingleDose);
        
        // Формируем строку диапазона доз с указанием пути введения
        if (routeSpecificDose !== null) {
          doseRange = `${routeSpecificDose} ${dosingMethod.unit} (${inputs.route === 'iv' ? 'IV' : inputs.route === 'im' ? 'IM' : inputs.route === 'oral' ? 'PO' : inputs.route})`;
        } else if (notes.includes('IV:') && notes.includes('IM:')) {
          doseRange = `IV: ${dosingMethod.minDose} ${dosingMethod.unit}, IM: ${dosingMethod.maxDose} ${dosingMethod.unit}`;
        } else if (notes.includes('PO:') && notes.includes('IV:')) {
          doseRange = `PO: ${dosingMethod.minDose}-${dosingMethod.maxDose} ${dosingMethod.unit}, IV: ${dosingMethod.minDose} ${dosingMethod.unit}`;
        } else {
          doseRange = `${dosingMethod.minDose}-${dosingMethod.maxDose} ${dosingMethod.unit}`;
        }
        
        // Рассчитываем суточную дозу на основе частоты
        const frequencyPerDay = dosingMethod.frequency.includes(t.every4Hours) || dosingMethod.frequency.includes(t.every4to6Hours) ? 6 :
                               dosingMethod.frequency.includes(t.every6Hours) || dosingMethod.frequency.includes(t.every6to8Hours) ? 4 :
                               dosingMethod.frequency.includes(t.every8Hours) || dosingMethod.frequency.includes(t.every8to12Hours) ? 3 :
                               dosingMethod.frequency.includes(t.every12Hours) ? 2 :
                               dosingMethod.frequency.includes(t.once) ? 1 : 2;
        totalDailyDose = recommendedDose * frequencyPerDay;
        break;
      
      case 'age':
        recommendedDose = (dosingMethod.minDose + dosingMethod.maxDose) / 2 * inputs.age;
        doseRange = `${dosingMethod.minDose}-${dosingMethod.maxDose} ${dosingMethod.unit}`;
        totalDailyDose = recommendedDose;
        break;
      
      case 'fixed':
        recommendedDose = dosingMethod.minDose;
        doseRange = `${dosingMethod.minDose} ${dosingMethod.unit}`;
        totalDailyDose = recommendedDose;
        break;
      
      case 'bsa':
        // Расчет площади поверхности тела по формуле Дюбуа
        if (inputs.height) {
          const bsa = Math.sqrt((inputs.weight * inputs.height) / 3600);
          recommendedDose = (dosingMethod.minDose + dosingMethod.maxDose) / 2 * bsa;
          doseRange = `${dosingMethod.minDose}-${dosingMethod.maxDose} ${dosingMethod.unit}`;
          totalDailyDose = recommendedDose;
        }
        break;
    }

    // Проверяем максимальные дозы
    const maxDailyDose = dosingMethod.maxDose * inputs.weight * 
      (dosingMethod.frequency.includes(t.every4Hours) || dosingMethod.frequency.includes(t.every4to6Hours) ? 6 :
       dosingMethod.frequency.includes(t.every6Hours) || dosingMethod.frequency.includes(t.every6to8Hours) ? 4 :
       dosingMethod.frequency.includes(t.every8Hours) || dosingMethod.frequency.includes(t.every8to12Hours) ? 3 :
       dosingMethod.frequency.includes(t.every12Hours) ? 2 :
       dosingMethod.frequency.includes(t.once) ? 1 : 2);

    if (totalDailyDose > maxDailyDose) {
      recommendedDose = maxDailyDose / (dosingMethod.frequency.includes(t.every4Hours) || dosingMethod.frequency.includes(t.every4to6Hours) ? 6 :
                                       dosingMethod.frequency.includes(t.every6Hours) || dosingMethod.frequency.includes(t.every6to8Hours) ? 4 :
                                       dosingMethod.frequency.includes(t.every8Hours) || dosingMethod.frequency.includes(t.every8to12Hours) ? 3 :
                                       dosingMethod.frequency.includes(t.every12Hours) ? 2 :
                                       dosingMethod.frequency.includes(t.once) ? 1 : 2);
      totalDailyDose = maxDailyDose;
    }

    // Определяем правильную единицу измерения для отображения
    let displayUnit = dosingMethod.unit;
    if (dosingMethod.type === 'weight' && dosingMethod.unit.includes('/кг')) {
      // Если доза рассчитана на кг, то итоговая доза будет в мг/мкг/г
      displayUnit = dosingMethod.unit.replace('/кг', '');
    }

    setResult({
      isSafe: true,
      isContraindicated: false,
      recommendedDose: Math.round(recommendedDose * 10) / 10,
      doseUnit: displayUnit,
      frequency: dosingMethod.frequency,
      totalDailyDose: Math.round(totalDailyDose * 10) / 10,
      bsa: inputs.height ? Math.round(Math.sqrt((inputs.weight * inputs.height) / 3600) * 100) / 100 : undefined,
      warnings: medication.warnings,
      notes: [
        `${t.age}: ${inputs.age} ${t.years}`,
        `${t.weight}: ${inputs.weight} ${t.kg}`,
        `${t.route}: ${routeOptions.find(opt => opt.value === inputs.route)?.label || inputs.route}`,
        `${t.doseRange}: ${doseRange}`,
        dosingMethod.notes,
        `${t.category}: ${medication.category}`,
      ],
    });
  };

  const resetCalculator = () => {
    setInputs({
      age: null,
      weight: null,
      height: null,
      medication: '',
      indication: '',
      route: 'oral',
    });
    setResult(null);
    setSearchTerm('');
    setSelectedCategory('all');
    setShowAutocomplete(false);
    setShowMedicationsList(true);
  };

  return (
    <Card 
      title={t.pediatricDoses} 
      subtitle={t.pediatricDosesDesc}
      className="max-w-4xl mx-auto"
    >
      <div className="space-y-6">
        {/* Основные параметры */}
        <div className="p-4 bg-accent/20 rounded-lg border border-accent/30">
          <h3 className="text-lg font-semibold text-accent-foreground mb-4">{t.childAge}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberInput
              label={t.childAge}
              value={inputs.age}
              onChange={(value) => setInputs({ ...inputs, age: value })}
              min={0}
              max={18}
              step={0.1}
              unit={t.years}
              required
            />
            <NumberInput
              label={t.childWeight}
              value={inputs.weight}
              onChange={(value) => setInputs({ ...inputs, weight: value })}
              min={1}
              max={100}
              step={0.1}
              unit={t.kg}
              required
            />
            <NumberInput
              label={t.childHeight}
              value={inputs.height}
              onChange={(value) => setInputs({ ...inputs, height: value })}
              min={30}
              max={200}
              step={1}
              unit={t.cm}
            />
          </div>
        </div>

        {/* Выбор препарата */}
        <div className="p-4 bg-accent/20 rounded-lg border border-accent/30">
          <h3 className="text-lg font-semibold text-accent-foreground mb-4">{t.medicationName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t.medicationName} <span className="text-red-500">*</span>
              </label>
                             <input
                 type="text"
                 value={inputs.medication}
                 onChange={(e) => {
                   setInputs({ ...inputs, medication: e.target.value });
                   setShowAutocomplete(true);
                 }}
                 onFocus={() => setShowAutocomplete(true)}
                 placeholder={t.searchPlaceholder}
                 className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
               />
               {/* Автодополнение */}
               {showAutocomplete && inputs.medication.length > 0 && (
                 <div className="mt-2 max-h-40 overflow-y-auto border border-border rounded-md bg-card">
                   {medicationsDatabase
                     .filter(med => 
                       med.name.toLowerCase().includes(inputs.medication.toLowerCase()) ||
                       med.category.toLowerCase().includes(inputs.medication.toLowerCase())
                     )
                     .slice(0, 6)
                     .map((med, index) => (
                       <div
                         key={index}
                         onClick={() => {
                           setInputs({ ...inputs, medication: med.name });
                           setShowAutocomplete(false);
                         }}
                         className="px-3 py-2 hover:bg-accent cursor-pointer text-sm border-b border-border last:border-b-0"
                       >
                         <div className="font-medium text-foreground">{med.name}</div>
                         <div className="text-xs text-muted-foreground">{med.category}</div>
                       </div>
                     ))}
                 </div>
               )}              
            </div>
            <Select
              label={t.routeOfAdministration}
              value={inputs.route}
              onChange={(value) => setInputs({ ...inputs, route: value as 'oral' | 'iv' | 'im' | 'sc' })}
              options={routeOptions}
              required
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.indication}
            </label>
            <input
              type="text"
              value={inputs.indication}
              onChange={(e) => setInputs({ ...inputs, indication: e.target.value })}
              placeholder={t.indicationPlaceholder}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

                 <div className="flex space-x-4">
           <Button onClick={calculateDose} variant="primary">
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
             
             {/* Основной результат */}
             <div className="mb-4 p-3 bg-card rounded border border-border">
               <div className="flex items-center justify-between mb-2">
                 <span className="font-medium text-card-foreground">{t.safety}:</span>
                 <span className={`font-bold ${result.isSafe ? 'text-green-500' : 'text-red-500'}`}>
                   {result.isSafe ? t.safe : t.notSafe}
                 </span>
               </div>
               {result.isContraindicated && (
                 <div className="text-red-500 text-sm mt-2">
                   <strong>{t.contraindication}:</strong> {result.contraindicationReason}
                 </div>
               )}
             </div>

             {/* Рекомендации по дозировке */}
             {result.isSafe && (
               <div className="mb-4 p-3 bg-card rounded border border-border">
                 <h4 className="font-medium text-card-foreground mb-2">{t.dosingRecommendations}:</h4>
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                     <span className="font-semibold text-blue-900">{t.recommendedDose}:</span>
                     <span className="font-bold text-xl text-blue-900">{result.recommendedDose} {result.doseUnit}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>{t.doseRange}:</span>
                     <span className="font-medium text-blue-500">
                       {result.notes.find(note => note.includes(`${t.doseRange}:`))?.replace(`${t.doseRange}: `, '') || t.notSpecified}
                     </span>
                   </div>
                   <div className="flex justify-between">
                     <span>{t.frequency}:</span>
                     <span className="font-medium">{result.frequency}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>{t.dailyDose}:</span>
                     <span className="font-medium">{result.totalDailyDose} {result.doseUnit}</span>
                   </div>
                   {result.bsa && (
                     <div className="flex justify-between">
                       <span>{t.bodySurfaceArea}:</span>
                       <span className="font-medium">{result.bsa} m²</span>
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* Примечания */}
             {result.notes.length > 0 && (
               <div className="mb-4 p-3 bg-card rounded border border-border">
                 <h4 className="font-medium text-card-foreground mb-2">{t.notes}:</h4>
                 <ul className="text-xs text-muted-foreground space-y-1">
                   {result.notes.map((note, index) => (
                     <li key={index}>• {note}</li>
                   ))}
                 </ul>
               </div>
             )}

             {/* Предупреждения */}
             {result.warnings.length > 0 && (
               <div className="p-3 bg-yellow-900/20 rounded border border-yellow-500/30">
                 <h4 className="font-medium text-yellow-400 mb-2">⚠️ {t.importantWarnings}:</h4>
                 <ul className="text-xs text-yellow-300 space-y-1">
                   {result.warnings.map((warning, index) => (
                     <li key={index}>• {warning}</li>
                   ))}
                 </ul>
               </div>
             )}

             {/* Дисклеймер */}
             <div className="mt-4 p-3 bg-red-900/20 rounded border border-red-500/30">
               <p className="text-xs text-red-300">
                 <strong>{t.disclaimer}:</strong> {t.disclaimerText}
               </p>
             </div>
           </div>
         )}

         {/* Кнопка показа/скрытия списка препаратов */}
         <div className="flex justify-center mb-4">
           <Button 
             onClick={() => setShowMedicationsList(!showMedicationsList)}
             variant="outline"
             className="flex items-center gap-2 hover:bg-accent/50 transition-colors"
           >
             {showMedicationsList ? (
               <>
                 <span>📋 {t.hideMedicationList}</span>
                 <span className="text-lg transition-transform">▼</span>
               </>
             ) : (
               <>
                 <span>📋 {t.showMedicationList}</span>
                 <span className="text-lg transition-transform">▶</span>
               </>
             )}
           </Button>
         </div>

         {/* Доступные препараты */}
         {showMedicationsList && (
           <div className="p-4 bg-card rounded border border-border transition-all duration-300 ease-in-out">
             <h4 className="font-medium text-card-foreground mb-3">
               {t.availableMedications} ({medicationsDatabase.length} {t.medications}) ✅ {t.verified}
             </h4>
           
           {/* Статистика по категориям */}
           <div className="mb-4 p-3 bg-muted/20 rounded-lg">
             <div className="text-xs text-muted-foreground mb-2">{t.medicationCategories}:</div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
               {Array.from(new Set(medicationsDatabase.map(med => med.category))).map(category => {
                 const count = medicationsDatabase.filter(med => med.category === category).length;
                 return (
                   <div key={category} className="flex justify-between">
                     <span className="text-foreground">{category}:</span>
                     <span className="text-muted-foreground">{count}</span>
                   </div>
                 );
               })}
             </div>
           </div>
           
           {/* Специально запрошенные препараты */}
           <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
             <h5 className="font-medium text-blue-400 mb-2 text-sm">⭐ {t.speciallyAdded}:</h5>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
               <div className="p-2 bg-blue-900/30 rounded text-blue-300">Кеторолак (НПВС)</div>
               <div className="p-2 bg-blue-900/30 rounded text-blue-300">Метамизол/Анальгин (Анальгетики)</div>
               <div className="p-2 bg-blue-900/30 rounded text-blue-300">Метоклопрамид (Противорвотные)</div>
               <div className="p-2 bg-blue-900/30 rounded text-blue-300">Ондасетрон (Противорвотные) ✅</div>
             </div>
           </div>
           
           {/* Проверенные дозировки */}
           <div className="mb-4 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
             <h5 className="font-medium text-green-400 mb-2 text-sm">✅ {t.verifiedDoses}:</h5>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
               <div className="p-2 bg-green-900/30 rounded text-green-300">Парацетамол (15 {t.mgKg})</div>
               <div className="p-2 bg-green-900/30 rounded text-green-300">Ибупрофен (10 {t.mgKg})</div>
               <div className="p-2 bg-green-900/30 rounded text-green-300">Дифенгидрамин (1.25 {t.mgKg})</div>
               <div className="p-2 bg-green-900/30 rounded text-green-300">Хлорфенирамин (0.35 {t.mgKg}) ⭐</div>
               <div className="p-2 bg-green-900/30 rounded text-green-300">Декстрометорфан (0.5-1 {t.mgKg}) ⭐</div>
             </div>
           </div>
           
           {/* Препараты неотложной помощи */}
           <div className="mb-4 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
             <h5 className="font-medium text-red-400 mb-2 text-sm">🚨 {t.emergencyMedications}:</h5>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
               <div className="p-2 bg-red-900/30 rounded text-red-300">Адреналин (10 мкг/кг) ⭐</div>
               <div className="p-2 bg-red-900/30 rounded text-red-300">Атропин (0.02 {t.mgKg}) ⭐</div>
               <div className="p-2 bg-red-900/30 rounded text-red-300">Аденозин (0.1 {t.mgKg}) ⭐</div>
               <div className="p-2 bg-red-900/30 rounded text-red-300">Налоксон (0.01-0.1 {t.mgKg}) ⭐</div>
             </div>
           </div>
         
                       {/* Поиск и фильтр */}
            <div className="mb-4 space-y-2">
              <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <h5 className="font-medium text-blue-400 mb-2 text-sm">🔍 {t.quickSearch}:</h5>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    className="flex-1 px-3 py-2 bg-input border border-border rounded-md text-foreground text-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-md text-muted-foreground text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="mt-2 text-xs text-blue-300">
                  💡 {t.clickToSelect}
                </div>
              </div>
             <select 
               className="px-3 py-2 bg-input border border-border rounded-md text-foreground text-sm"
               value={selectedCategory}
               onChange={(e) => setSelectedCategory(e.target.value)}
             >
               <option value="all">{t.allCategories}</option>
               <option value="Анальгетики/Жаропонижающие">Анальгетики/Жаропонижающие</option>
               <option value="НПВС">НПВС</option>
               <option value="Антибиотики">Антибиотики</option>
               <option value="Противорвотные">Противорвотные</option>
               <option value="Антигистаминные">Антигистаминные</option>
               <option value="Бронходилататоры">Бронходилататоры</option>
               <option value="Противокашлевые">Противокашлевые</option>
               <option value="Неотложная помощь">Неотложная помощь</option>
               <option value="Опиоиды">Опиоиды</option>
               <option value="Антидоты">Антидоты</option>
               <option value="Глюкокортикоиды">Глюкокортикоиды</option>
               <option value="Противосудорожные">Противосудорожные</option>
               <option value="Антиаритмические">Антиаритмические</option>
               <option value="Диуретики">Диуретики</option>
               <option value="Антикоагулянты">Антикоагулянты</option>
               <option value="Антигипертензивные">Антигипертензивные</option>
               <option value="Антидепрессанты">Антидепрессанты</option>
               <option value="Стимуляторы ЦНС">Стимуляторы ЦНС</option>
               <option value="Противогрибковые">Противогрибковые</option>
               <option value="Противовирусные">Противовирусные</option>
               <option value="Иммунодепрессанты">Иммунодепрессанты</option>
             </select>
           </div>

           {/* Группировка по категориям */}
           <div className="space-y-4">
             {Array.from(new Set(medicationsDatabase.map(med => med.category)))
               .filter(category => selectedCategory === 'all' || category === selectedCategory)
               .map(category => {
                 const categoryMeds = medicationsDatabase
                   .filter(med => med.category === category)
                   .filter(med => 
                     searchTerm === '' || 
                     med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     med.category.toLowerCase().includes(searchTerm.toLowerCase())
                   );
                 
                 if (categoryMeds.length === 0) return null;
                 
                 return (
                   <div key={category} className="border border-border rounded-lg p-3">
                     <h5 className="font-medium text-card-foreground mb-2 text-sm">
                       {category} ({categoryMeds.length})
                     </h5>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 text-xs">
                       {categoryMeds.map((med, index) => (
                                                   <div 
                            key={index} 
                            className="p-1 bg-muted/10 rounded text-muted-foreground hover:bg-muted/20 cursor-pointer"
                            onClick={() => {
                              setInputs({ ...inputs, medication: med.name });
                              setShowAutocomplete(false);
                            }}
                            title={`${t.clickToSelect} ${med.name}`}
                          >
                           {med.name}
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               })}
           </div>
         </div>
         )}
      </div>
    </Card>
  );
}; 