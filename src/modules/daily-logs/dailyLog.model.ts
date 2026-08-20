import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMealLog {
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  dishName: string;
  portionKatoris: number;
  rotiCount: number;
  gheeAdded: boolean;
  calories: number;
  proteinG: number;
  costInr?: number;
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
        mealType: {
          type: String,
          enum: ['breakfast', 'lunch', 'snack', 'dinner'],
          required: true,
        },
        dishName: { type: String, required: true },
        portionKatoris: { type: Number, default: 1 },
        rotiCount: { type: Number, default: 0 },
        gheeAdded: { type: Boolean, default: false },
        calories: { type: Number, required: true },
        proteinG: { type: Number, required: true },
        costInr: { type: Number },
        imageUrl: { type: String },
      },
    ],
  },
  { timestamps: true }
);

DailyLogSchema.index({ userId: 1, logDate: 1 }, { unique: true });

export const DailyLog = mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);
