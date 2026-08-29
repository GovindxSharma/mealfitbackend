import { Router } from 'express';
import { WorkoutsController } from './workouts.controller';
import { cacheRoute } from '../../shared/redisCache';

const router = Router();

router.get('/', cacheRoute(3600, 'master:workouts'), WorkoutsController.getRoutines);
router.get('/:id', cacheRoute(3600, 'master:workouts'), WorkoutsController.getRoutineById);

export const workoutRoutes = router;
