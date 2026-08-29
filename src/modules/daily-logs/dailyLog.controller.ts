import { Response } from 'express';
import { DailyLog } from './dailyLog.model';
import { asyncHandler, AppError } from '../../shared/errorHandler';
import { createSuccessResponse, AuthRequest } from '../../shared/types';

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export class DailyLogController {
  // Get daily log for a specific date (defaults to today)
  static getDailyLog = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const logDate = (req.query.date as string) || getTodayString();

    let log = await DailyLog.findOne({ userId, logDate });
    if (!log) {
      // Return a blank template if not yet created
      log = new DailyLog({
        userId,
        logDate,
        waterConsumedMl: 0,
        waterTargetMl: 3000,
        stepsCount: 0,
        activeCaloriesBurned: 0,
        adherenceScore: 0,
        meals: [],
      });
    }

    // Calculate daily aggregates
    const totalCalories = log.meals.reduce((acc, m) => acc + (m.calories || 0), 0);
    const totalProteinG = log.meals.reduce((acc, m) => acc + (m.proteinG || 0), 0);
    const totalCostInr = log.meals.reduce((acc, m) => acc + (m.costInr || 0), 0);

    return res.status(200).json(
      createSuccessResponse({
        log,
        aggregates: {
          totalCalories,
          totalProteinG: parseFloat(totalProteinG.toFixed(1)),
          totalCostInr: parseFloat(totalCostInr.toFixed(2)),
          mealsCount: log.meals.length,
          hydrationPercent: Math.min(100, Math.round((log.waterConsumedMl / (log.waterTargetMl || 1)) * 100)),
        },
      }, `Daily log for ${logDate}`)
    );
  });

  // Log a single meal with Indian portion units or custom macro details
  static logMeal = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const {
      customId,
      logDate = getTodayString(),
      mealType = 'lunch',
      dishName,
      hindiName,
      portionKatoris = 1,
      rotiCount = 0,
      gheeAdded = false,
      calories = 0,
      proteinG = 0,
      carbsG = 0,
      fatG = 0,
      slot = 'lunch',
      quantity = '1 Serving',
      costInr = 25,
      time,
      imageUrl,
    } = req.body;

    // Additional calorie calibration for ghee on rotis/tadka (+45 kcal per tsp if marked)
    const calibratedCalories = gheeAdded ? calories + (rotiCount > 0 ? rotiCount * 45 : 45) : calories;

    let log = await DailyLog.findOne({ userId, logDate });
    if (!log) {
      log = new DailyLog({
        userId,
        logDate,
        waterConsumedMl: 0,
        waterTargetMl: 3000,
        stepsCount: 0,
        activeCaloriesBurned: 0,
        adherenceScore: 70,
        meals: [],
      });
    }

    log.meals.push({
      customId: customId || `meal_${Date.now()}`,
      mealType,
      dishName,
      hindiName,
      portionKatoris,
      rotiCount,
      gheeAdded,
      calories: calibratedCalories,
      proteinG,
      carbsG,
      fatG,
      slot,
      quantity,
      costInr,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl,
    });

    await log.save();

    return res.status(201).json(createSuccessResponse(log, 'Meal logged successfully in MongoDB'));
  });

  // Delete a logged meal by its MongoDB _id or customId
  static deleteMeal = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { mealId } = req.params;
    const logDate = (req.query.date as string) || getTodayString();

    const log = await DailyLog.findOne({ userId, logDate });
    if (log) {
      log.meals = log.meals.filter(
        (m: any) => m._id?.toString() !== mealId && m.customId !== mealId
      );
      await log.save();
    }

    return res.status(200).json(createSuccessResponse(log, 'Meal deleted successfully from MongoDB'));
  });

  // Increment water or update steps / weight
  static updateMetrics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const {
      logDate = getTodayString(),
      waterConsumedMlDelta = 0,
      stepsDelta = 0,
      weightKg,
      activeCaloriesBurnedDelta = 0,
      weatherTempC,
      aqiIndex,
    } = req.body;

    let log = await DailyLog.findOne({ userId, logDate });
    if (!log) {
      log = new DailyLog({
        userId,
        logDate,
        waterConsumedMl: 0,
        waterTargetMl: 3000,
        stepsCount: 0,
        activeCaloriesBurned: 0,
        adherenceScore: 70,
        meals: [],
      });
    }

    if (waterConsumedMlDelta) {
      log.waterConsumedMl = Math.max(0, log.waterConsumedMl + waterConsumedMlDelta);
    }
    if (stepsDelta) {
      log.stepsCount = Math.max(0, log.stepsCount + stepsDelta);
    }
    if (weightKg !== undefined) {
      log.weightKg = weightKg;
    }
    if (activeCaloriesBurnedDelta) {
      log.activeCaloriesBurned = Math.max(0, log.activeCaloriesBurned + activeCaloriesBurnedDelta);
    }
    if (weatherTempC !== undefined) log.weatherTempC = weatherTempC;
    if (aqiIndex !== undefined) log.aqiIndex = aqiIndex;

    await log.save();

    return res.status(200).json(createSuccessResponse(log, 'Daily metrics updated in MongoDB'));
  });
}
