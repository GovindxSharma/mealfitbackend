export interface BiometricsInput {
  currentWeightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  targetWeightKg: number;
  durationWeeks?: number;
  goalType?: 'fat_loss' | 'muscle_gain' | 'maintenance';
}

export interface BiometricsCalculationResult {
  bmi: number;
  bmiCategory: string;
  estimatedBodyFatPercentage: number;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  weeklyDeltaKg: number;
  targetDurationWeeks: number;
  macros: {
    proteinG: number;
    proteinCalories: number;
    carbG: number;
    carbCalories: number;
    fatG: number;
    fatCalories: number;
  };
  hydrationTargetMl: number;
}

export class BiometricsService {
  static calculate(input: BiometricsInput): BiometricsCalculationResult {
    const weight = Math.max(20, Math.min(300, Number(input.currentWeightKg) || 70));
    const height = Math.max(40, Math.min(260, Number(input.heightCm) || 170));
    const userAge = Math.max(10, Math.min(120, Number(input.age) || 25));
    const targetWeight = Math.max(20, Math.min(300, Number(input.targetWeightKg) || (weight - 5)));
    const gender = input.gender || 'male';
    const activityLevel = input.activityLevel || 'sedentary';

    // 1. BMI Calculation (Guaranteed non-zero denominator)
    const heightM = height / 100;
    const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
    
    let bmiCategory = 'Normal';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 23 && bmi < 27.5) bmiCategory = 'Overweight (Asian-Indian Standard)';
    else if (bmi >= 27.5) bmiCategory = 'Obese (Asian-Indian Standard)';

    // 2. Deurenberg Body Fat Percentage Formula
    const sexFactor = gender === 'female' ? 0 : 1;
    const rawBodyFat = (1.20 * bmi) + (0.23 * userAge) - (10.8 * sexFactor) - 5.4;
    const estimatedBodyFatPercentage = Math.max(5, Math.min(60, parseFloat(rawBodyFat.toFixed(1))));

    // 3. Mifflin-St Jeor BMR
    let bmr = 0;
    if (gender === 'female') {
      bmr = (10 * weight) + (6.25 * height) - (5 * userAge) - 161;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * userAge) + 5;
    }
    bmr = Math.round(bmr);

    // 4. Activity Multiplier -> TDEE
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
    };
    const multiplier = activityMultipliers[activityLevel] || 1.2;
    const tdee = Math.round(bmr * multiplier);

    // 5. Goal Analysis & Safe Bounds
    const weightDifferenceKg = targetWeight - weight;
    let goalType: 'fat_loss' | 'muscle_gain' | 'maintenance' = input.goalType || 'maintenance';
    
    if (Math.abs(weightDifferenceKg) < 0.5) {
      goalType = 'maintenance';
    } else if (weightDifferenceKg < 0) {
      goalType = 'fat_loss';
    } else {
      goalType = 'muscle_gain';
    }

    // Default duration calculation (safe bound: 0.5kg/week)
    const safeRateKgPerWeek = 0.5;
    const targetDurationWeeks = Math.max(1, input.durationWeeks || Math.max(4, Math.ceil(Math.abs(weightDifferenceKg) / safeRateKgPerWeek)));
    const weeklyDeltaKg = parseFloat((weightDifferenceKg / targetDurationWeeks).toFixed(2));

    // Daily Caloric Adjustment (7700 kcal per 1kg fat)
    const dailyCaloricDelta = Math.round((weeklyDeltaKg * 7700) / 7);
    
    // Bounds check to avoid unsafe extremes (minimum 1200 kcal for women, 1400 for men)
    const minSafeCalories = gender === 'female' ? 1200 : 1400;
    const dailyCalorieTarget = Math.max(minSafeCalories, tdee + dailyCaloricDelta);

    // 6. Macro Allocations (High Protein Indian Standard)
    const proteinG = Math.round(weight * 1.8);
    const proteinCalories = proteinG * 4;

    // Fat: 25% of total daily calories
    const fatCalories = Math.round(dailyCalorieTarget * 0.25);
    const fatG = Math.round(fatCalories / 9);

    // Carbs: Remaining calories
    const carbCalories = Math.max(200, dailyCalorieTarget - proteinCalories - fatCalories);
    const carbG = Math.round(carbCalories / 4);

    // 7. Base Hydration (35ml per kg bodyweight)
    const hydrationTargetMl = Math.round(weight * 35);

    return {
      bmi,
      bmiCategory,
      estimatedBodyFatPercentage,
      bmr,
      tdee,
      dailyCalorieTarget,
      weeklyDeltaKg,
      targetDurationWeeks,
      macros: {
        proteinG,
        proteinCalories,
        carbG,
        carbCalories,
        fatG,
        fatCalories,
      },
      hydrationTargetMl,
    };
  }
}
