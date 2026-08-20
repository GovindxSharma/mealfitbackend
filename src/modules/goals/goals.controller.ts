import { Request, Response } from 'express';
import { Goal } from './goal.model';
import { BiometricsService } from './biometrics.service';
import { asyncHandler, AppError } from '../../shared/errorHandler';
import { createSuccessResponse, AuthRequest } from '../../shared/types';

export class GoalsController {
  static calculateBiometrics = asyncHandler(async (req: Request, res: Response) => {
    const result = BiometricsService.calculate(req.body);
    return res.status(200).json(createSuccessResponse(result, 'Biometrics calculated successfully'));
  });

  static createGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Set any previous active goals to completed or abandoned
    await Goal.updateMany({ userId, status: 'active' }, { status: 'abandoned' });

    const goal = await Goal.create({
      userId,
      ...req.body,
      status: 'active',
    });

    return res.status(201).json(createSuccessResponse(goal, 'New goal activated'));
  });

  static getActiveGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const goal = await Goal.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });

    if (!goal) {
      return res.status(200).json(createSuccessResponse(null, 'No active goal found'));
    }

    return res.status(200).json(createSuccessResponse(goal, 'Active goal retrieved'));
  });
}
