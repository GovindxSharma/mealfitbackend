import bcrypt from 'bcryptjs';
import { User } from './user.model';

export const seedAdminUsers = async () => {
  try {
    const adminAccounts = [
      {
        email: 'govindsharma2839@gmail.com',
        fullName: 'Govind Sharma',
        passwordRaw: 'govind@1184',
        role: 'super_admin',
        city: 'Delhi',
        weeklyBudgetInr: 450,
      },
      {
        email: 'govind@mealfit.in',
        fullName: 'Govind Sharma (Lead Admin)',
        passwordRaw: 'govind@1184',
        role: 'super_admin',
        city: 'Delhi',
        weeklyBudgetInr: 450,
      },
    ];

    for (const acc of adminAccounts) {
      const existing = await User.findOne({ email: acc.email.toLowerCase() });
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(acc.passwordRaw, salt);

      if (existing) {
        existing.fullName = acc.fullName;
        existing.passwordHash = passwordHash;
        existing.role = 'super_admin';
        await existing.save();
        console.log(`[MealFit Seeder] Verified & Updated Super Admin: ${acc.email}`);
      } else {
        await User.create({
          fullName: acc.fullName,
          email: acc.email.toLowerCase(),
          passwordHash,
          role: 'super_admin',
          gender: 'male',
          dateOfBirth: new Date('1998-05-15'),
          heightCm: 175,
          weightKg: 72,
          targetWeightKg: 68,
          goalType: 'muscle_gain',
          dietaryPreference: 'veg',
          weeklyBudgetInr: acc.weeklyBudgetInr,
          preferredLanguage: 'en',
          city: acc.city,
          dailyCalorieTarget: 2200,
          proteinTargetG: 140,
          carbsTargetG: 220,
          fatTargetG: 60,
        });
        console.log(`[MealFit Seeder] Seeded New Super Admin: ${acc.email}`);
      }
    }
  } catch (err: any) {
    console.error('[MealFit Seeder] Seeding notice:', err?.message || err);
  }
};
