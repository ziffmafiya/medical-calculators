'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { StatCard } from '@/components/StatCard';
import { Alert } from '@/components/Alert';
import { Badge } from '@/components/Badge';
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

  const medicationsDatabase = pediatricMedicationsDatabase;

  const routeOptions = [
    { value: 'oral', label: t.oral },
    { value: 'iv', label: t.intravenous },
    { value: 'im', label: t.intramuscular },
    { value: 'sc', label: t.subcutaneous },
  ];

  const calculateDose = () => {
    if (inputs.age === null || inputs.weight === null || !inputs.medication) {
      alert(t.pleaseFillAllFields);
      return;
    }

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

    const dosingMethod = medication.dosingMethods[0];
    let recommendedDose = 0;
    let totalDailyDose = 0;
    let doseRange = '';

    switch (dosingMethod.type) {
      case 'weight':
        let selectedDose = dosingMethod.minDose;
        let routeSpecificDose = null;
        
        const notes = dosingMethod.notes;
        
        if (medication.name.toLowerCase().includes('парацетамол')) {
          if (inputs.route === 'iv') {
            if (inputs.age >= 2 && inputs.age <= 12 && inputs.weight < 50) {
              selectedDose = 15;
              routeSpecificDose = 15;
            } else if (inputs.age >= 1 && inputs.age < 2) {
              selectedDose = 15;
              routeSpecificDose = 15;
            }
          } else if (inputs.route === 'oral') {
            selectedDose = 15;
            routeSpecificDose = 15;
          }
        }
        else if (medication.name.toLowerCase().includes('кеторолак')) {
          if (inputs.route === 'iv') {
            selectedDose = 0.5;
            routeSpecificDose = 0.5;
          } else if (inputs.route === 'im') {
            selectedDose = 1;
            routeSpecificDose = 1;
          }
        }
        else if (medication.name.toLowerCase().includes('ондасетрон')) {
          if (inputs.route === 'iv') {
            selectedDose = 0.2;
            routeSpecificDose = 0.2;
          }
        }
        else {
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
            selectedDose = (dosingMethod.minDose + dosingMethod.maxDose) / 2;
          }
        }
        
        const dosePerWeight = selectedDose * inputs.weight;
        
        let maxSingleDose = Infinity;
        if (notes.includes('макс.') || notes.includes('максимальная доза:')) {
          const maxDoseMatch = notes.match(/(?:макс\.|максимальная доза:)\s*(\d+(?:\.\d+)?)\s*мг/);
          if (maxDoseMatch) {
            maxSingleDose = parseFloat(maxDoseMatch[1]);
          }
        }
        
        recommendedDose = Math.min(dosePerWeight, maxSingleDose);
        
        if (routeSpecificDose !== null) {
          doseRange = `${routeSpecificDose} ${dosingMethod.unit} (${inputs.route === 'iv' ? 'IV' : inputs.route === 'im' ? 'IM' : inputs.route === 'oral' ? 'PO' : inputs.route})`;
        } else if (notes.includes('IV:') && notes.includes('IM:')) {
          doseRange = `IV: ${dosingMethod.minDose} ${dosingMethod.unit}, IM: ${dosingMethod.maxDose} ${dosingMethod.unit}`;
        } else if (notes.includes('PO:') && notes.includes('IV:')) {
          doseRange = `PO: ${dosingMethod.minDose}-${dosingMethod.maxDose} ${dosingMethod.unit}, IV: ${dosingMethod.minDose} ${dosingMethod.unit}`;
        } else {
          doseRange = `${dosingMethod.minDose}-${dosingMethod.maxDose} ${dosingMethod.unit}`;
        }
        
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
        if (inputs.height) {
          const bsa = Math.sqrt((inputs.weight * inputs.height) / 3600);
          recommendedDose = (dosingMethod.minDose + dosingMethod.maxDose) / 2 * bsa;
          doseRange = `${dosingMethod.minDose}-${dosingMethod.maxDose} ${dosingMethod.unit}`;
          totalDailyDose = recommendedDose;
        }
        break;
    }

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

    let displayUnit = dosingMethod.unit;
    if (dosingMethod.type === 'weight' && dosingMethod.unit.includes('/кг')) {
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
    setShowMedicationsList(false);
  };

  const categories = Array.from(new Set(medicationsDatabase.map(med => med.category)));

  return (
    <Card 
      title={t.pediatricDoses} 
      subtitle={t.pediatricDosesDesc}
      className="max-w-4xl mx-auto"
      padding="lg"
    >
      <div className="space-y-8">
        
        {/* Basic Parameters */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">{t.childAge}</h3>
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

        <div className="h-px bg-[var(--border)] w-full" />

        {/* Medication Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">{t.medicationName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-[var(--gray-300)] mb-1.5">
                {t.medicationName} <span className="text-[var(--error-500)]">*</span>
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
                className="w-full px-3.5 py-2.5 bg-[var(--gray-900)] border border-[var(--input-border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--gray-500)] text-sm h-11 transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:border-[var(--primary)]"
              />
              
              {showAutocomplete && inputs.medication.length > 0 && (
                <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto border border-[var(--border)] rounded-lg bg-[var(--card)] shadow-[var(--shadow-lg)]">
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
                        className="px-4 py-2 hover:bg-[var(--accent)] cursor-pointer text-sm border-b border-[var(--border)] last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-[var(--foreground)]">{med.name}</div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{med.category}</div>
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
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-[var(--gray-300)] mb-1.5">
              {t.indication}
            </label>
            <input
              type="text"
              value={inputs.indication}
              onChange={(e) => setInputs({ ...inputs, indication: e.target.value })}
              placeholder={t.indicationPlaceholder}
              className="w-full px-3.5 py-2.5 bg-[var(--gray-900)] border border-[var(--input-border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--gray-500)] text-sm h-11 transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="flex space-x-4 pt-2">
          <Button onClick={calculateDose} variant="primary">
            {t.calculate}
          </Button>
          <Button onClick={resetCalculator} variant="outline">
            {t.reset}
          </Button>
        </div>

        {/* Calculation Results */}
        {result && (
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2">
              {t.calculationResults}
            </h3>
            
            {result.isContraindicated ? (
              <Alert variant="error" title={t.contraindication}>
                {result.contraindicationReason}
              </Alert>
            ) : (
              <Alert variant="success" title={t.safe}>
                {t.safeParametersMsg || 'The requested dosage and medication are within safe parameters.'}
              </Alert>
            )}

            {result.isSafe && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  label={t.recommendedDose}
                  value={result.recommendedDose}
                  unit={result.doseUnit}
                  status="normal"
                  className="md:col-span-2 lg:col-span-2 bg-[rgba(54,191,250,0.06)] border-[rgba(54,191,250,0.2)]"
                />
                <StatCard 
                  label={t.frequency}
                  value={result.frequency}
                />
                <StatCard 
                  label={t.dailyDose}
                  value={result.totalDailyDose}
                  unit={result.doseUnit}
                />
                {result.bsa && (
                  <StatCard 
                    label={t.bodySurfaceArea}
                    value={result.bsa}
                    unit="m²"
                  />
                )}
                <div className="md:col-span-2 lg:col-span-4 bg-[var(--gray-900)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                   <span className="text-sm font-medium text-[var(--muted-foreground)]">{t.doseRange}</span>
                   <span className="text-sm font-semibold text-[var(--primary)]">
                     {result.notes.find(note => note.includes(`${t.doseRange}:`))?.replace(`${t.doseRange}: `, '') || t.notSpecified}
                   </span>
                </div>
              </div>
            )}

            {result.notes.length > 0 && (
              <Card padding="sm" variant="outlined">
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">{t.notes}:</h4>
                <ul className="text-sm text-[var(--muted-foreground)] space-y-2 list-disc pl-5">
                  {result.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </Card>
            )}

            {result.warnings.length > 0 && (
              <Alert variant="warning" title={t.importantWarnings}>
                <ul className="list-disc pl-4 space-y-1 mt-1">
                  {result.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <Alert variant="error" title={t.disclaimer}>
              {t.disclaimerText}
            </Alert>
          </div>
        )}

        <div className="pt-6 flex justify-center">
          <Button 
            onClick={() => setShowMedicationsList(!showMedicationsList)}
            variant="ghost"
            className="text-[var(--muted-foreground)]"
            trailingIcon={
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${showMedicationsList ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            }
          >
            {showMedicationsList ? t.hideMedicationList : t.showMedicationList}
          </Button>
        </div>

        {/* Available Medications Dictionary */}
        {showMedicationsList && (
          <Card padding="md" variant="outlined" className="mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h4 className="text-base font-semibold text-[var(--foreground)]">
                  {t.availableMedications}
                </h4>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {medicationsDatabase.length} {t.medications}
                </p>
              </div>
              <Badge variant="success">Verified Database</Badge>
            </div>
            
            {/* Search and filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--gray-900)] border border-[var(--input-border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--gray-500)] text-sm h-10 transition-all focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:border-[var(--primary)]"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-[var(--gray-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <select 
                className="w-full px-3.5 py-2 bg-[var(--gray-900)] border border-[var(--input-border)] rounded-lg text-[var(--foreground)] text-sm h-10 transition-all focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:border-[var(--primary)]"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">{t.allCategories}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Quick Filter Categories as Badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(category => {
                const count = medicationsDatabase.filter(med => med.category === category).length;
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(isSelected ? 'all' : category)}
                    className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-full"
                  >
                    <Badge 
                      variant={isSelected ? 'brand' : 'gray'} 
                      className="cursor-pointer hover:bg-[var(--accent)]"
                    >
                      {category} <span className="ml-1.5 opacity-60">{count}</span>
                    </Badge>
                  </button>
                );
              })}
            </div>

            {/* Category Groups */}
            <div className="space-y-6">
              {categories
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
                    <div key={category} className="space-y-3">
                      <h5 className="text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2">
                        {category} <span className="text-[var(--muted-foreground)] ml-1 font-normal">({categoryMeds.length})</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {categoryMeds.map((med, index) => (
                          <div 
                            key={index} 
                            className="px-3 py-2 bg-[var(--gray-900)] border border-[var(--border)] rounded-md text-sm text-[var(--gray-300)] hover:border-[var(--primary)] hover:bg-[rgba(54,191,250,0.05)] cursor-pointer transition-colors truncate"
                            onClick={() => {
                              setInputs({ ...inputs, medication: med.name });
                              setShowMedicationsList(false);
                            }}
                            title={med.name}
                          >
                            {med.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
};