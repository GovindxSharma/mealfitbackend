import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  avatarUrl?: string;
  authProvider: 'local' | 'google';
  role: 'user' | 'super_admin' | 'admin';
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
  heightCm: number;
  weightKg?: number;
  targetWeightKg?: number;
  goalType?: string;
  dietaryPreference: 'veg' | 'jain' | 'eggetarian' | 'non_veg';
  weeklyBudgetInr: number;
  city?: string;
  dailyCalorieTarget?: number;
  proteinTargetG?: number;
  carbsTargetG?: number;
  fatTargetG?: number;
  preferredLanguage: string;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true, default: 'MealFit Member' },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true },
    avatarUrl: { type: String },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    role: { type: String, enum: ['user', 'super_admin', 'admin'], default: 'user' },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    dateOfBirth: { type: Date },
    heightCm: { type: Number, default: 170, min: 40, max: 280 },
    weightKg: { type: Number, default: 70 },
    targetWeightKg: { type: Number, default: 65 },
    goalType: { type: String, default: 'fat_loss' },
    dietaryPreference: {
      type: String,
      enum: ['veg', 'jain', 'eggetarian', 'non_veg'],
      default: 'veg',
    },
    weeklyBudgetInr: { type: Number, default: 1000, min: 100 },
    city: { type: String, default: 'delhi' },
    dailyCalorieTarget: { type: Number, default: 1800 },
    proteinTargetG: { type: Number, default: 120 },
    carbsTargetG: { type: Number, default: 180 },
    fatTargetG: { type: Number, default: 50 },
    preferredLanguage: { type: String, default: 'en' },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
