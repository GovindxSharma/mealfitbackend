import { Router } from 'express';
import { NutritionController } from './nutrition.controller';
import { cacheRoute } from '../../shared/redisCache';

const router = Router();

router.get('/foods', cacheRoute(3600, 'master:foods'), NutritionController.getFoods);
router.post('/optimize', NutritionController.optimizeMealPlan);
router.post('/kirana-list', NutritionController.generateKiranaList);
router.post('/fridge-jugaad', NutritionController.getFridgeJugaad);

export const nutritionRoutes = router;
