import { Request, Response } from 'express';
import { INDIAN_FOOD_DATABASE } from './food.data';
import { NutritionOptimizerService } from './optimizer.service';
import { asyncHandler } from '../../shared/errorHandler';
import { createSuccessResponse } from '../../shared/types';

export class NutritionController {
  // Get entire ICMR-NIN food dataset or filter by category / diet
  static getFoods = asyncHandler(async (req: Request, res: Response) => {
    const { diet, category, search } = req.query;

    let foods = [...INDIAN_FOOD_DATABASE];

    if (diet && typeof diet === 'string') {
      foods = foods.filter(f => {
        if (diet === 'veg' || diet === 'jain') return f.dietCategory === 'veg';
        if (diet === 'eggetarian') return f.dietCategory === 'veg' || f.dietCategory === 'eggetarian';
        return true;
      });
    }

    if (category && typeof category === 'string') {
      foods = foods.filter(f => f.category === category);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      foods = foods.filter(f => 
        f.name.toLowerCase().includes(q) || 
        (f.hindiName && f.hindiName.toLowerCase().includes(q))
      );
    }

    return res.status(200).json(createSuccessResponse(foods, `Found ${foods.length} Indian food items`));
  });

  // Calculate Rupee-to-Protein Daily Meal Plan
  static optimizeMealPlan = asyncHandler(async (req: Request, res: Response) => {
    const { dailyBudgetInr = 100, targetProteinG = 120, dietCategory = 'veg', targetCalories = 2000 } = req.body;

    const plan = NutritionOptimizerService.optimizeDailyPlan({
      dailyBudgetInr: Number(dailyBudgetInr),
      targetProteinG: Number(targetProteinG),
      dietCategory: dietCategory as any,
      targetCalories: Number(targetCalories),
    });

    return res.status(200).json(createSuccessResponse(plan, 'Optimized Indian meal plan generated'));
  });

  // Generate 7-day categorized Kirana Store List with WhatsApp export
  static generateKiranaList = asyncHandler(async (req: Request, res: Response) => {
    const { weeklyBudgetInr = 1000, dietCategory = 'veg' } = req.body;

    const list = NutritionOptimizerService.generateKiranaList(
      Number(weeklyBudgetInr),
      dietCategory as any
    );

    return res.status(200).json(createSuccessResponse(list, 'Kirana shopping list generated'));
  });

  // Fridge "Jugaad" Mode (Leftover Chef)
  static getFridgeJugaad = asyncHandler(async (req: Request, res: Response) => {
    const { leftovers = ['yellow dal', 'boiled rice'] } = req.body;

    const recipes = NutritionOptimizerService.getFridgeJugaadRecipes(leftovers);
    return res.status(200).json(createSuccessResponse(recipes, 'Fridge Jugaad recipes generated'));
  });
}
