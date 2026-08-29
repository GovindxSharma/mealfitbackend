import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSavedMeal {
  id: string;
  name: string;
  dishDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  costInr: number;
  slot: string;
  createdAt: string;
}

export interface IUserNotifications {
  water: boolean;
  meals: boolean;
  workouts: boolean;
}

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
  savedMeals?: IUserSavedMeal[];
  notifications?: IUserNotifications;
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
    savedMeals: [
      {
        id: { type: String },
        name: { type: String },
        dishDescription: { type: String },
        calories: { type: Number },
        proteinG: { type: Number },
        carbsG: { type: Number },
        fatG: { type: Number },
        costInr: { type: Number },
        slot: { type: String },
        createdAt: { type: String },
      },
    ],
    notifications: {
      water: { type: Boolean, default: true },
      meals: { type: Boolean, default: true },
      workouts: { type: Boolean, default: true },
    },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ lastActiveAt: -1 });
UserSchema.index({ updatedAt: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);

