# Sodium Correction Calculator

## Overview

The Sodium Correction Calculator is a comprehensive tool for calculating sodium correction in patients with hyponatremia and hypernatremia. It implements established medical algorithms including the Adrogue-Madias formula for hyponatremia correction and the free water deficit formula for hypernatremia correction.

## Features

### Hyponatremia Correction
- **Adrogue-Madias Formula**: Calculates expected sodium change per liter of IV fluid
- **Multiple Fluid Types**: Supports various IV fluids (3% saline, 0.9% saline, 0.45% saline, D5W, Lactated Ringer's)
- **Safe Correction Rates**: Implements conservative correction guidelines (8 mEq/L/day maximum)
- **Patient-Specific Calculations**: Accounts for gender, age, and weight for total body water estimation

### Hypernatremia Correction
- **Free Water Deficit Formula**: Calculates total free water deficit
- **Safe Correction Protocol**: Implements 48-72 hour correction guidelines
- **Hypotonic Fluid Recommendations**: Suggests appropriate fluid types for correction

## Algorithms Used

### Adrogue-Madias Formula (Hyponatremia)
```
Δ[Na] = ([Na]IVF - [Na]serum) / (TBW + 1)
```
Where:
- Δ[Na] = Change in serum sodium per liter of IV fluid
- [Na]IVF = Sodium concentration of IV fluid
- [Na]serum = Current serum sodium
- TBW = Total body water

### Free Water Deficit Formula (Hypernatremia)
```
Free Water Deficit = TBW × ([Na]current / [Na]target - 1)
```
Where:
- TBW = Total body water (calculated based on gender and age)
- [Na]current = Current serum sodium
- [Na]target = Target serum sodium

### Total Body Water Calculation
- **Adult Males**: 60% of body weight
- **Adult Females**: 50% of body weight  
- **Elderly Males (≥65)**: 50% of body weight
- **Elderly Females (≥65)**: 45% of body weight

## Fluid Concentrations

| Fluid Type | Sodium Concentration (mEq/L) |
|------------|------------------------------|
| 3% Hypertonic Saline | 513 |
| 0.9% Normal Saline | 154 |
| 0.45% Half Normal Saline | 77 |
| 5% Dextrose in Water | 0 |
| Lactated Ringer's | 130 |

## Safety Guidelines

### Hyponatremia Correction
- **Maximum daily correction**: 8 mEq/L/day (conservative approach)
- **Monitoring frequency**: Every 2-4 hours initially
- **Stop criteria**: Symptoms improve or sodium reaches 125-130 mEq/L
- **Overcorrection prevention**: Consider desmopressin if needed

### Hypernatremia Correction
- **Maximum daily correction**: 10 mEq/L/day
- **Correction time**: 48-72 hours minimum
- **Monitoring frequency**: Every 2-4 hours initially
- **Fluid type**: Hypotonic fluids (D5W or 0.45% saline)

## Clinical Recommendations

### For Large Sodium Deficits (>20 mEq/L)
- Consider consultation with nephrology
- More frequent monitoring required
- May need ICU monitoring for severe cases

### For Severe Hypernatremia (>160 mEq/L)
- Consider ICU monitoring
- More aggressive monitoring and intervention
- Address underlying cause (diabetes insipidus, inadequate intake)

## Important Notes

1. **Educational Purpose**: This tool is for educational purposes and should not replace clinical judgment
2. **Individualized Care**: Always consider patient-specific factors and underlying conditions
3. **Frequent Monitoring**: Serum sodium levels should be monitored frequently during correction
4. **Underlying Causes**: Address the root cause of the sodium disorder
5. **Specialist Consultation**: Consider specialist consultation for complex cases

## References

1. Adrogue HJ, Madias NE. Hyponatremia. N Engl J Med. 2000;342(21):1581-1589.
2. Adrogue HJ, Madias NE. Hypernatremia. N Engl J Med. 2000;342(20):1493-1499.
3. Sterns RH, et al. Treatment Guidelines for Hyponatremia: Stay the Course. J Am Soc Nephrol. 2023;34(1):1-3.
4. Spasovski G, et al. Hyponatraemia-treatment standard 2024. Nephrol Dial Transplant. 2024;39(Suppl 1):i1-i47.

## Usage Instructions

1. **Select Correction Type**: Choose between hyponatremia or hypernatremia
2. **Enter Patient Data**: Input gender, age, weight, current sodium, and target sodium
3. **Select IV Fluid** (for hyponatremia): Choose appropriate IV fluid type
4. **Calculate**: Click "Calculate Sodium Correction" to get results
5. **Review Results**: Check calculated values and clinical recommendations
6. **Monitor**: Follow the monitoring and safety recommendations provided

## Disclaimer

This calculator is designed for educational and clinical decision support purposes. It should be used in conjunction with clinical judgment and appropriate medical supervision. The authors are not responsible for any clinical decisions made based on the results of this calculator.