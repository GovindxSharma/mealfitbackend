import { z } from 'zod';

export const RegisterUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    gender: z.enum(['male', 'female', 'other']),
    dateOfBirth: z.string().or(z.date()).transform((val) => new Date(val)),
    heightCm: z.number().min(50).max(250),
    dietaryPreference: z.enum(['veg', 'jain', 'eggetarian', 'non_veg']),
    weeklyBudgetInr: z.number().min(200).default(1000),
    preferredLanguage: z.string().default('en'),
  }),
});

export const LoginUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const UpdateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    heightCm: z.number().min(50).max(250).optional(),
    dietaryPreference: z.enum(['veg', 'jain', 'eggetarian', 'non_veg']).optional(),
    weeklyBudgetInr: z.number().min(200).optional(),
    preferredLanguage: z.string().optional(),
  }),
});
