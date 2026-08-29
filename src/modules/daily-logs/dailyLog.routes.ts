import { Router } from 'express';
import { DailyLogController } from './dailyLog.controller';
import { authenticateJwt, validateRequest } from '../../shared/validate';
import { LogMealSchema, UpdateDailyMetricsSchema } from './dailyLog.dto';

const router = Router();

router.get('/', authenticateJwt, DailyLogController.getDailyLog);
router.post('/meals', authenticateJwt, validateRequest(LogMealSchema), DailyLogController.logMeal);
router.post('/meal', authenticateJwt, validateRequest(LogMealSchema), DailyLogController.logMeal);
router.delete('/meals/:mealId', authenticateJwt, DailyLogController.deleteMeal);
router.delete('/meal/:mealId', authenticateJwt, DailyLogController.deleteMeal);
router.patch('/metrics', authenticateJwt, validateRequest(UpdateDailyMetricsSchema), DailyLogController.updateMetrics);

export const dailyLogRoutes = router;
