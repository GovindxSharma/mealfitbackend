import { z } from 'zod';

export const CalculateBiometricsSchema = z.object({
  body: z.preprocess((val: any) => {
    if (!val || typeof val !== 'object') return {};
    
    // Support weight aliases
    const currentWeight = val.currentWeightKg ?? val.weightKg ?? val.weight ?? 70;
    const targetWeight = val.targetWeightKg ?? val.targetWeight ?? currentWeight;
    const height = val.heightCm ?? val.height ?? 170;
    const ageVal = val.age ?? 25;
    
    // Normalize gender
    let genderVal = (val.gender || 'male').toString().toLowerCase().trim();
    if (genderVal === 'm') genderVal = 'male';
    if (genderVal === 'f') genderVal = 'female';
    if (!['male', 'female', 'other'].includes(genderVal)) genderVal = 'male';

    // Normalize activity level
    let actVal = (val.activityLevel || 'moderately_active').toString().toLowerCase().trim();
    if (actVal === 'moderate') actVal = 'moderately_active';
    if (actVal === 'light') actVal = 'lightly_active';
    if (actVal === 'active' || actVal === 'heavy') actVal = 'very_active';
    if (!['sedentary', 'lightly_active', 'moderately_active', 'very_active'].includes(actVal)) {
      actVal = 'moderately_active';
    }

    // Normalize goal type
    let goal = (val.goalType || val.primaryGoal || 'fat_loss').toString().toLowerCase().trim();
    if (goal === 'recomp' || goal === 'low_gi_pcod') goal = 'fat_loss';
    if (!['fat_loss', 'muscle_gain', 'maintenance'].includes(goal)) goal = 'fat_loss';

    return {
      ...val,
      currentWeightKg: Number(currentWeight) || 70,
      targetWeightKg: Number(targetWeight) || 70,
      heightCm: Number(height) || 170,
      age: Number(ageVal) || 25,
      gender: genderVal,
      activityLevel: actVal,
      goalType: goal,
      durationWeeks: val.durationWeeks ? Number(val.durationWeeks) : undefined,
    };
  }, z.object({
    currentWeightKg: z.number().min(20).max(350).default(70),
    heightCm: z.number().min(40).max(280).default(170),
    age: z.number().min(5).max(120).default(25),
    gender: z.enum(['male', 'female', 'other']).default('male'),
    activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active']).default('moderately_active'),
    targetWeightKg: z.number().min(20).max(350).default(70),
    durationWeeks: z.number().min(1).max(104).optional(),
    goalType: z.enum(['fat_loss', 'muscle_gain', 'maintenance']).default('fat_loss'),
  })),
});

export const CreateGoalSchema = z.object({
  body: z.preprocess((val: any) => {
    if (!val || typeof val !== 'object') return {};
    const targetWeight = val.targetWeightKg ?? val.targetWeight ?? 70;
    const tdee = val.calculatedTdee ?? val.tdee ?? 2000;
    const calories = val.dailyCalorieTarget ?? val.calorieTarget ?? 1800;
    const protein = val.proteinTargetG ?? val.protein ?? 120;
    const carbs = val.carbTargetG ?? val.carbsTargetG ?? val.carbs ?? 180;
    const fat = val.fatTargetG ?? val.fat ?? 50;

    let goal = (val.goalType || val.primaryGoal || 'fat_loss').toString().toLowerCase().trim();
    if (goal === 'recomp' || goal === 'low_gi_pcod') goal = 'fat_loss';
    if (!['fat_loss', 'muscle_gain', 'maintenance'].includes(goal)) goal = 'fat_loss';

    return {
      ...val,
      targetWeightKg: Number(targetWeight) || 70,
      calculatedTdee: Number(tdee) || 2000,
      dailyCalorieTarget: Number(calories) || 1800,
      proteinTargetG: Number(protein) || 120,
      carbTargetG: Number(carbs) || 180,
      fatTargetG: Number(fat) || 50,
      goalType: goal,
      targetDate: val.targetDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }, z.object({
    targetWeightKg: z.number().min(20).max(350).default(70),
    targetDate: z.string().or(z.date()).transform((val) => new Date(val)),
    calculatedTdee: z.number().min(400).default(2000),
    dailyCalorieTarget: z.number().min(600).default(1800),
    proteinTargetG: z.number().min(20).default(120),
    carbTargetG: z.number().min(20).default(180),
    fatTargetG: z.number().min(5).default(50),
    goalType: z.enum(['fat_loss', 'muscle_gain', 'maintenance']).default('fat_loss'),
  })),
});
