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
      customId: val.customId || val.id || undefined,
      logDate: val.logDate || val.date || todayStr,
      mealType: meal,
      dishName: (val.dishName || val.name || 'Indian Home Meal').toString().trim(),
      hindiName: val.hindiName ? val.hindiName.toString().trim() : undefined,
      portionKatoris: Number(val.portionKatoris ?? val.katoris ?? 1) || 1,
      rotiCount: Number(val.rotiCount ?? val.rotis ?? 0) || 0,
      gheeAdded: Boolean(val.gheeAdded ?? val.hasGhee ?? false),
      calories: Math.max(0, Math.round(Number(val.calories) || 0)),
      proteinG: Math.max(0, parseFloat(Number((val.proteinG ?? val.protein) || 0).toFixed(1))),
      carbsG: Math.max(0, Math.round(Number((val.carbsG ?? val.carbs) || 0))),
      fatG: Math.max(0, Math.round(Number((val.fatG ?? val.fat) || 0))),
      slot: val.slot || meal,
      quantity: val.quantity || '1 Serving',
      costInr: val.costInr !== undefined ? Math.round(Number(val.costInr)) : 25,
      time: val.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: val.imageUrl ? val.imageUrl.toString() : undefined,
    };
  }, z.object({
    customId: z.string().optional(),
    logDate: z.string().optional(),
    mealType: z.enum(['breakfast', 'lunch', 'snack', 'dinner']).default('lunch'),
    dishName: z.string().min(1).default('Indian Home Meal'),
    hindiName: z.string().optional(),
    portionKatoris: z.number().min(0).default(1),
    rotiCount: z.number().min(0).default(0),
    gheeAdded: z.boolean().default(false),
    calories: z.number().min(0).default(0),
    proteinG: z.number().min(0).default(0),
    carbsG: z.number().min(0).default(0),
    fatG: z.number().min(0).default(0),
    slot: z.string().default('lunch'),
    quantity: z.string().default('1 Serving'),
    costInr: z.number().min(0).default(25),
    time: z.string().optional(),
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
