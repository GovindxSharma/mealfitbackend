import { Request, Response } from 'express';
import { WORKOUT_ROUTINES } from './workout.data';
import { asyncHandler } from '../../shared/errorHandler';
import { createSuccessResponse } from '../../shared/types';

export class WorkoutsController {
  // Get all routines or filter by zero-noise / equipment
  static getRoutines = asyncHandler(async (req: Request, res: Response) => {
    const { equipment, noiseFreeOnly } = req.query;

    let routines = [...WORKOUT_ROUTINES];

    if (noiseFreeOnly === 'true') {
      routines = routines.filter(r => r.isZeroNoiseFloorSafe);
    }

    if (equipment && typeof equipment === 'string') {
      routines = routines.filter(r => r.equipmentRequired.toLowerCase().includes(equipment.toLowerCase()));
    }

    return res.status(200).json(createSuccessResponse(routines, `Found ${routines.length} workout routines`));
  });

  // Get single routine details
  static getRoutineById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const routine = WORKOUT_ROUTINES.find(r => r.id === id);

    if (!routine) {
      return res.status(404).json(createSuccessResponse(null, 'Workout routine not found'));
    }

    return res.status(200).json(createSuccessResponse(routine, 'Routine found'));
  });
}
