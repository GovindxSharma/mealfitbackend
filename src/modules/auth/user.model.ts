import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash?: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: Date;
  heightCm: number;
  dietaryPreference: 'veg' | 'jain' | 'eggetarian' | 'non_veg';
  weeklyBudgetInr: number;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dateOfBirth: { type: Date, required: true },
    heightCm: { type: Number, required: true, min: 50, max: 250 },
    dietaryPreference: {
      type: String,
      enum: ['veg', 'jain', 'eggetarian', 'non_veg'],
      required: true,
      default: 'veg',
    },
    weeklyBudgetInr: { type: Number, default: 1000, min: 200 },
    preferredLanguage: { type: String, default: 'en' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
