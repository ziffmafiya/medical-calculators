# Medical Calculators Project Summary

## Project Overview

A comprehensive web application providing medical calculators for healthcare professionals, built with Next.js, TypeScript, and Tailwind CSS. The application features a modern, responsive design with dark theme and intuitive navigation.

## Available Calculators

### 1. Potassium Correction Calculator
- Calculates potassium correction doses using aspartame or 7.5% potassium chloride
- Accounts for current and target potassium levels
- Weight-based dose adjustment
- Infusion rate and monitoring recommendations

### 2. Antibiotic Prophylaxis Calculator
- Antibiotic selection based on modern guidelines
- Wound classification (clean, clean-contaminated, contaminated, dirty)
- Weight and renal function dose adjustment
- Allergy history consideration
- Duration and frequency recommendations

### 3. Pediatric Dose Calculator
- Age and weight-based pediatric dosing
- Common pediatric medications
- Safety checks and dose range validation
- Age-appropriate formulations

### 4. Sodium Correction Calculator ⭐ **NEW**
- **Hyponatremia correction** using Adrogue-Madias formula
- **Hypernatremia correction** using free water deficit formula
- Patient-specific total body water calculation (gender, age, weight)
- Multiple IV fluid type support
- Safe correction protocols with monitoring recommendations

## Technical Features

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React** for UI components
- Responsive design for all devices

### Key Components
- Reusable UI components (Button, Card, NumberInput, Select)
- Form validation and error handling
- Real-time calculations
- Clinical recommendations and safety warnings

## Medical Algorithms Implemented

### Sodium Correction
- **Adrogue-Madias Formula**: Δ[Na] = ([Na]IVF - [Na]serum) / (TBW + 1)
- **Free Water Deficit**: TBW × ([Na]current / [Na]target - 1)
- **Total Body Water**: Gender and age-specific calculations

### Potassium Correction
- Weight-based dosing algorithms
- Infusion rate calculations
- Safety monitoring protocols

### Antibiotic Prophylaxis
- Evidence-based antibiotic selection
- Renal function dose adjustments
- Allergy-safe alternatives

## Safety Features

- **Conservative correction rates** for electrolyte disorders
- **Clinical warnings** for severe cases requiring specialist consultation
- **Monitoring recommendations** with specific timeframes
- **Educational disclaimers** emphasizing clinical judgment
- **Input validation** to prevent calculation errors

## Clinical Guidelines Followed

- European Society of Endocrinology hyponatremia guidelines
- American Society of Nephrology recommendations
- Infectious Diseases Society of America prophylaxis guidelines
- Pediatric dosing references and safety standards

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/            # Reusable UI components
├── calculators/           # Medical calculators
│   ├── PotassiumCorrectionCalculator.tsx
│   ├── AntibioticProphylaxisCalculator.tsx
│   ├── PediatricDoseCalculator.tsx
│   └── SodiumCorrectionCalculator.tsx
├── i18n/                  # Internationalization
├── types/                 # TypeScript definitions
└── data/                  # Medical data and references
```

## Development Status

- ✅ Potassium Correction Calculator
- ✅ Antibiotic Prophylaxis Calculator  
- ✅ Pediatric Dose Calculator
- ✅ Sodium Correction Calculator
- 🔄 Additional calculators planned

## Future Enhancements

- Glasgow Coma Scale Calculator
- Creatinine Clearance Calculator
- Drug Interaction Checker
- Multi-language support expansion
- Mobile app version

## Medical Disclaimer

⚠️ **Important**: These calculators are designed for educational and clinical decision support purposes. They should be used in conjunction with clinical judgment and appropriate medical supervision. All treatment decisions should be made by qualified healthcare professionals considering individual patient factors.

## References

- Adrogue HJ, Madias NE. Hyponatremia. N Engl J Med. 2000;342(21):1581-1589.
- Adrogue HJ, Madias NE. Hypernatremia. N Engl J Med. 2000;342(20):1493-1499.
- Sterns RH, et al. Treatment Guidelines for Hyponatremia: Stay the Course. J Am Soc Nephrol. 2023.
- Spasovski G, et al. Hyponatraemia-treatment standard 2024. Nephrol Dial Transplant. 2024. 