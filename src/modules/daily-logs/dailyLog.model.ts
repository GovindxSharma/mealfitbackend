import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMealLog {
  customId?: string;
  mealType: 'breakfast' | 'lunch' | 'evening_snack' | 'dinner' | 'snack';
  dishName: string;
  hindiName?: string;
  portionKatoris?: number;
  rotiCount?: number;
  gheeAdded?: boolean;
  calories: number;
  proteinG: number;
  carbsG?: number;
  fatG?: number;
  slot?: string;
  quantity?: string;
  costInr?: number;
  time?: string;
  imageUrl?: string;
}

export interface IDailyLog extends Document {
  userId: Types.ObjectId;
  logDate: string; // YYYY-MM-DD
  weightKg?: number;
  waterConsumedMl: number;
  waterTargetMl: number;
  stepsCount: number;
  activeCaloriesBurned: number;
  weatherTempC?: number;
  aqiIndex?: number;
  adherenceScore: number;
  meals: IMealLog[];
  createdAt: Date;
  updatedAt: Date;
}

const DailyLogSchema = new Schema<IDailyLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    logDate: { type: String, required: true, index: true },
    weightKg: { type: Number },
    waterConsumedMl: { type: Number, default: 0 },
    waterTargetMl: { type: Number, required: true, default: 2500 },
    stepsCount: { type: Number, default: 0 },
    activeCaloriesBurned: { type: Number, default: 0 },
    weatherTempC: { type: Number },
    aqiIndex: { type: Number },
    adherenceScore: { type: Number, default: 0 },
    meals: [
      {
        customId: { type: String },
        mealType: {
          type: String,
          enum: ['breakfast', 'lunch', 'evening_snack', 'dinner', 'snack'],
          default: 'lunch',
        },
        dishName: { type: String, required: true },
        hindiName: { type: String },
        portionKatoris: { type: Number, default: 1 },
        rotiCount: { type: Number, default: 0 },
        gheeAdded: { type: Boolean, default: false },
        calories: { type: Number, required: true, default: 0 },
        proteinG: { type: Number, required: true, default: 0 },
        carbsG: { type: Number, default: 0 },
        fatG: { type: Number, default: 0 },
        slot: { type: String, default: 'lunch' },
        quantity: { type: String, default: '1 Serving' },
        costInr: { type: Number, default: 25 },
        time: { type: String },
        imageUrl: { type: String },
      },
    ],
  },
  { timestamps: true }
);

DailyLogSchema.index({ userId: 1, logDate: 1 }, { unique: true });

export const DailyLog = mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);
