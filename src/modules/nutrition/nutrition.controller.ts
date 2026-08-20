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
    const dailyBudgetInr = Math.max(30, Number(req.body.dailyBudgetInr ?? req.body.budget) || 100);
    const targetProteinG = Math.max(30, Number(req.body.targetProteinG ?? req.body.protein) || 120);
    const targetCalories = Math.max(800, Number(req.body.targetCalories ?? req.body.calories) || 2000);
    
    let diet = (req.body.dietCategory || req.body.diet || 'veg').toString().toLowerCase().trim();
    if (!['veg', 'jain', 'eggetarian', 'non_veg'].includes(diet)) diet = 'veg';

    const plan = NutritionOptimizerService.optimizeDailyPlan({
      dailyBudgetInr,
      targetProteinG,
      dietCategory: diet as any,
      targetCalories,
    });

    return res.status(200).json(createSuccessResponse(plan, 'Optimized Indian meal plan generated'));
  });

  // Generate 7-day categorized Kirana Store List with WhatsApp export
  static generateKiranaList = asyncHandler(async (req: Request, res: Response) => {
    const weeklyBudgetInr = Math.max(200, Number(req.body.weeklyBudgetInr ?? req.body.budget) || 1000);
    let diet = (req.body.dietCategory || req.body.diet || 'veg').toString().toLowerCase().trim();
    if (!['veg', 'jain', 'eggetarian', 'non_veg'].includes(diet)) diet = 'veg';

    const list = NutritionOptimizerService.generateKiranaList(
      weeklyBudgetInr,
      diet as any
    );

    return res.status(200).json(createSuccessResponse(list, 'Kirana shopping list generated'));
  });

  // Fridge "Jugaad" Mode (Leftover Chef)
  static getFridgeJugaad = asyncHandler(async (req: Request, res: Response) => {
    let leftovers = req.body.leftovers || req.body.ingredients;
    if (typeof leftovers === 'string') {
      leftovers = leftovers.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(leftovers) || leftovers.length === 0) {
      leftovers = ['yellow dal', 'boiled rice'];
    }

    const recipes = NutritionOptimizerService.getFridgeJugaadRecipes(leftovers);
    return res.status(200).json(createSuccessResponse(recipes, 'Fridge Jugaad recipes generated'));
  });
}
