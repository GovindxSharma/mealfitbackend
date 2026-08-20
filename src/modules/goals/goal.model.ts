import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGoal extends Document {
  userId: Types.ObjectId;
  targetWeightKg: number;
  targetDate: Date;
  calculatedTdee: number;
  dailyCalorieTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  goalType: 'fat_loss' | 'muscle_gain' | 'maintenance';
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetWeightKg: { type: Number, required: true },
    targetDate: { type: Date, required: true },
    calculatedTdee: { type: Number, required: true },
    dailyCalorieTarget: { type: Number, required: true },
    proteinTargetG: { type: Number, required: true },
    carbTargetG: { type: Number, required: true },
    fatTargetG: { type: Number, required: true },
    goalType: {
      type: String,
      enum: ['fat_loss', 'muscle_gain', 'maintenance'],
      default: 'fat_loss',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
