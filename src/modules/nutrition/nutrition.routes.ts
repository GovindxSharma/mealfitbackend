import { Router } from 'express';
import { NutritionController } from './nutrition.controller';

const router = Router();

router.get('/foods', NutritionController.getFoods);
router.post('/optimize', NutritionController.optimizeMealPlan);
router.post('/kirana-list', NutritionController.generateKiranaList);
router.post('/fridge-jugaad', NutritionController.getFridgeJugaad);

export const nutritionRoutes = router;
