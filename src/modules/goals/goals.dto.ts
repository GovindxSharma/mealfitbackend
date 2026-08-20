import { z } from 'zod';

export const CalculateBiometricsSchema = z.object({
  body: z.object({
    currentWeightKg: z.number().min(30).max(250),
    heightCm: z.number().min(50).max(250),
    age: z.number().min(10).max(120),
    gender: z.enum(['male', 'female', 'other']),
    activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active']),
    targetWeightKg: z.number().min(30).max(250),
    durationWeeks: z.number().min(1).max(52).optional(),
    goalType: z.enum(['fat_loss', 'muscle_gain', 'maintenance']).optional(),
  }),
});

export const CreateGoalSchema = z.object({
  body: z.object({
    targetWeightKg: z.number().min(30).max(250),
    targetDate: z.string().or(z.date()).transform((val) => new Date(val)),
    calculatedTdee: z.number().min(500),
    dailyCalorieTarget: z.number().min(800),
    proteinTargetG: z.number().min(30),
    carbTargetG: z.number().min(30),
    fatTargetG: z.number().min(10),
    goalType: z.enum(['fat_loss', 'muscle_gain', 'maintenance']).default('fat_loss'),
  }),
});
