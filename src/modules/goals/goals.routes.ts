import { Router } from 'express';
import { GoalsController } from './goals.controller';
import { validateRequest, authenticateJwt } from '../../shared/validate';
import { CalculateBiometricsSchema, CreateGoalSchema } from './goals.dto';

const router = Router();

// Public calculation endpoint (useful for instant onboarding & interactive landing)
router.post('/calculate', validateRequest(CalculateBiometricsSchema), GoalsController.calculateBiometrics);

// Authenticated user goal management
router.post('/', authenticateJwt, validateRequest(CreateGoalSchema), GoalsController.createGoal);
router.get('/active', authenticateJwt, GoalsController.getActiveGoal);

export const goalRoutes = router;
