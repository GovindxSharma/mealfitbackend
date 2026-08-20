import { Router } from 'express';
import { WorkoutsController } from './workouts.controller';

const router = Router();

router.get('/', WorkoutsController.getRoutines);
router.get('/:id', WorkoutsController.getRoutineById);

export const workoutRoutes = router;
