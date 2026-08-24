import { z } from 'zod';

export const RegisterUserSchema = z.object({
  body: z.preprocess((val: any) => {
    if (!val || typeof val !== 'object') return {};
    
    let genderVal = (val.gender || 'male').toString().toLowerCase().trim();
    if (genderVal === 'm') genderVal = 'male';
    if (genderVal === 'f') genderVal = 'female';
    if (!['male', 'female', 'other'].includes(genderVal)) genderVal = 'male';

    let dietVal = (val.dietaryPreference || 'veg').toString().toLowerCase().trim();
    if (!['veg', 'jain', 'eggetarian', 'non_veg'].includes(dietVal)) dietVal = 'veg';

    const dob = val.dateOfBirth || val.dob || new Date('2000-01-01').toISOString();

    return {
      ...val,
      fullName: (val.fullName || 'MealFit Member').toString().trim(),
      email: (val.email || '').toString().toLowerCase().trim(),
      gender: genderVal,
      dateOfBirth: dob,
      heightCm: Number(val.heightCm) || 170,
      weightKg: Number(val.weightKg) || 70,
      targetWeightKg: Number(val.targetWeightKg) || 65,
      dietaryPreference: dietVal,
      weeklyBudgetInr: Number(val.weeklyBudgetInr) || 1000,
      preferredLanguage: (val.preferredLanguage || 'en').toString().trim(),
      city: (val.city || 'delhi').toString().trim(),
      password: (val.password || '').toString(),
    };
  }, z.object({
    fullName: z.string().min(1, 'Full name is required').default('MealFit Member'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    gender: z.enum(['male', 'female', 'other']).default('male'),
    dateOfBirth: z.string().or(z.date()).transform((val) => new Date(val)),
    heightCm: z.number().min(40).max(280).default(170),
    weightKg: z.number().optional(),
    targetWeightKg: z.number().optional(),
    goalType: z.string().optional(),
    dietaryPreference: z.enum(['veg', 'jain', 'eggetarian', 'non_veg']).default('veg'),
    weeklyBudgetInr: z.number().min(100).default(1000),
    preferredLanguage: z.string().default('en'),
    city: z.string().default('delhi'),
  })),
});

export const LoginUserSchema = z.object({
  body: z.preprocess((val: any) => {
    if (!val || typeof val !== 'object') return {};
    return {
      ...val,
      email: (val.email || '').toString().toLowerCase().trim(),
      password: (val.password || '').toString(),
    };
  }, z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  })),
});

export const UpdateProfileSchema = z.object({
  body: z.preprocess((val: any) => {
    if (!val || typeof val !== 'object') return {};
    const result: any = { ...val };
    if (val.email) result.email = val.email.toString().toLowerCase().trim();
    if (val.fullName) result.fullName = val.fullName.toString().trim();
    if (val.heightCm) result.heightCm = Number(val.heightCm);
    if (val.weightKg) result.weightKg = Number(val.weightKg);
    if (val.targetWeightKg) result.targetWeightKg = Number(val.targetWeightKg);
    if (val.weeklyBudgetInr) result.weeklyBudgetInr = Number(val.weeklyBudgetInr);
    if (val.city) result.city = val.city.toString().trim();
    if (val.goalType) result.goalType = val.goalType.toString().trim();
    if (val.dailyCalorieTarget) result.dailyCalorieTarget = Number(val.dailyCalorieTarget);
    if (val.proteinTargetG) result.proteinTargetG = Number(val.proteinTargetG);
    if (val.carbsTargetG) result.carbsTargetG = Number(val.carbsTargetG);
    if (val.fatTargetG) result.fatTargetG = Number(val.fatTargetG);
    if (val.avatarUrl) result.avatarUrl = val.avatarUrl.toString();
    if (val.dietaryPreference) {
      const diet = val.dietaryPreference.toString().toLowerCase().trim();
      if (['veg', 'jain', 'eggetarian', 'non_veg'].includes(diet)) {
        result.dietaryPreference = diet;
      }
    }
    return result;
  }, z.object({
    fullName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    heightCm: z.number().min(40).max(280).optional(),
    weightKg: z.number().optional(),
    targetWeightKg: z.number().optional(),
    goalType: z.string().optional(),
    dietaryPreference: z.enum(['veg', 'jain', 'eggetarian', 'non_veg']).optional(),
    weeklyBudgetInr: z.number().min(100).optional(),
    preferredLanguage: z.string().optional(),
    city: z.string().optional(),
    avatarUrl: z.string().optional(),
    dailyCalorieTarget: z.number().optional(),
    proteinTargetG: z.number().optional(),
    carbsTargetG: z.number().optional(),
    fatTargetG: z.number().optional(),
  })),
});
