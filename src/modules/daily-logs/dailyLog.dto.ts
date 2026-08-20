import { z } from 'zod';

export const LogMealSchema = z.object({
  body: z.preprocess((val: any) => {
    if (!val || typeof val !== 'object') return {};
    
    let meal = (val.mealType || val.slot || 'lunch').toString().toLowerCase().trim();
    if (meal === 'evening_snack') meal = 'snack';
    if (!['breakfast', 'lunch', 'snack', 'dinner'].includes(meal)) meal = 'lunch';

    const todayStr = new Date().toISOString().split('T')[0];

    return {
      ...val,
      logDate: val.logDate || val.date || todayStr,
      mealType: meal,
      dishName: (val.dishName || val.name || 'Indian Home Meal').toString().trim(),
      portionKatoris: Number(val.portionKatoris ?? val.katoris ?? 1) || 1,
      rotiCount: Number(val.rotiCount ?? val.rotis ?? 0) || 0,
      gheeAdded: Boolean(val.gheeAdded ?? val.hasGhee ?? false),
      calories: Number(val.calories) || 0,
      proteinG: Number(val.proteinG ?? val.protein) || 0,
      costInr: val.costInr !== undefined ? Number(val.costInr) : undefined,
      imageUrl: val.imageUrl ? val.imageUrl.toString() : undefined,
    };
  }, z.object({
    logDate: z.string().optional(),
    mealType: z.enum(['breakfast', 'lunch', 'snack', 'dinner']).default('lunch'),
    dishName: z.string().min(1).default('Indian Home Meal'),
    portionKatoris: z.number().min(0).default(1),
    rotiCount: z.number().min(0).default(0),
    gheeAdded: z.boolean().default(false),
    calories: z.number().min(0).default(0),
    proteinG: z.number().min(0).default(0),
    costInr: z.number().min(0).optional(),
    imageUrl: z.string().optional(),
  })),
});

export const UpdateDailyMetricsSchema = z.object({
  body: z.preprocess((val: any) => {
    if (!val || typeof val !== 'object') return {};
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      ...val,
      logDate: val.logDate || val.date || todayStr,
      waterConsumedMlDelta: val.waterConsumedMlDelta !== undefined ? Number(val.waterConsumedMlDelta) : undefined,
      stepsDelta: val.stepsDelta !== undefined ? Number(val.stepsDelta) : undefined,
      weightKg: val.weightKg !== undefined ? Number(val.weightKg) : undefined,
      activeCaloriesBurnedDelta: val.activeCaloriesBurnedDelta !== undefined ? Number(val.activeCaloriesBurnedDelta) : undefined,
      weatherTempC: val.weatherTempC !== undefined ? Number(val.weatherTempC) : undefined,
      aqiIndex: val.aqiIndex !== undefined ? Number(val.aqiIndex) : undefined,
    };
  }, z.object({
    logDate: z.string().optional(),
    waterConsumedMlDelta: z.number().optional(),
    stepsDelta: z.number().optional(),
    weightKg: z.number().optional(),
    activeCaloriesBurnedDelta: z.number().optional(),
    weatherTempC: z.number().optional(),
    aqiIndex: z.number().optional(),
  })),
});
