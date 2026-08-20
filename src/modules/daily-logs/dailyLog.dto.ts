import { z } from 'zod';

export const LogMealSchema = z.object({
  body: z.object({
    logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
    mealType: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
    dishName: z.string().min(1),
    portionKatoris: z.number().min(0).default(1),
    rotiCount: z.number().min(0).default(0),
    gheeAdded: z.boolean().default(false),
    calories: z.number().min(0),
    proteinG: z.number().min(0),
    costInr: z.number().min(0).optional(),
    imageUrl: z.string().url().optional(),
  }),
});

export const UpdateDailyMetricsSchema = z.object({
  body: z.object({
    logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
    waterConsumedMlDelta: z.number().optional(),
    stepsDelta: z.number().optional(),
    weightKg: z.number().optional(),
    activeCaloriesBurnedDelta: z.number().optional(),
    weatherTempC: z.number().optional(),
    aqiIndex: z.number().optional(),
  }),
});
