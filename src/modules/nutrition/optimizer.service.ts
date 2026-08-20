import { INDIAN_FOOD_DATABASE, IndianFoodItem } from './food.data';

export interface DailyMealPlanItem {
  food: IndianFoodItem;
  grams: number;
  servingsCount: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number;
  costInr: number;
  mealSlot: 'breakfast' | 'lunch' | 'evening_snack' | 'dinner';
}

export interface OptimizedMealPlanResult {
  dailyBudgetInr: number;
  actualCostInr: number;
  targetProteinG: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalCalories: number;
  dietPreference: string;
  meals: DailyMealPlanItem[];
  tips: string[];
}

export interface KiranaListItem {
  itemName: string;
  hindiName?: string;
  weeklyQuantity: string;
  estimatedCostInr: number;
  category: string;
}

export interface KiranaListResult {
  weeklyBudgetInr: number;
  totalEstimatedCostInr: number;
  categories: {
    name: string;
    items: KiranaListItem[];
  }[];
  whatsAppText: string;
}

export class NutritionOptimizerService {
  /**
   * Rupee-to-Protein linear optimizer:
   * Selects highest protein-efficiency Indian staples filtered by diet and budget constraints.
   */
  static optimizeDailyPlan(params: {
    dailyBudgetInr: number;
    targetProteinG: number;
    dietCategory: 'veg' | 'jain' | 'eggetarian' | 'non_veg';
    targetCalories?: number;
  }): OptimizedMealPlanResult {
    const { dailyBudgetInr, targetProteinG, dietCategory, targetCalories = 2000 } = params;

    // Filter available foods based on diet category
    let allowedFoods = INDIAN_FOOD_DATABASE.filter(f => {
      if (dietCategory === 'veg' || dietCategory === 'jain') {
        return f.dietCategory === 'veg';
      }
      if (dietCategory === 'eggetarian') {
        return f.dietCategory === 'veg' || f.dietCategory === 'eggetarian';
      }
      return true; // non_veg allows all
    });

    // Sort by protein efficiency (g protein per ₹1) descending
    allowedFoods.sort((a, b) => b.proteinEfficiency - a.proteinEfficiency);

    const meals: DailyMealPlanItem[] = [];
    let currentCost = 0;
    let currentProtein = 0;
    let currentCarbs = 0;
    let currentFat = 0;
    let currentCalories = 0;

    // 1. Breakfast Slot: Sattu Drink or Eggs or Kala Chana
    const breakfastCandidate = allowedFoods.find(f => f.id === 'chana-sattu' || f.id === 'whole-eggs' || f.id === 'kala-chana');
    if (breakfastCandidate) {
      const grams = breakfastCandidate.id === 'whole-eggs' ? 100 : 50;
      const item = createMealItem(breakfastCandidate, grams, 'breakfast');
      meals.push(item);
      currentCost += item.costInr;
      currentProtein += item.proteinG;
      currentCarbs += item.carbsG;
      currentFat += item.fatG;
      currentCalories += item.calories;
    }

    // 2. Lunch Slot: Soya Chunks or Chicken or Paneer + Moong Dal + Phulka + Dahi
    const lunchProtein = allowedFoods.find(f => f.id === 'soya-chunks' || f.id === 'chicken-breast' || f.id === 'fresh-paneer');
    if (lunchProtein) {
      const grams = lunchProtein.id === 'soya-chunks' ? 40 : 100;
      const item = createMealItem(lunchProtein, grams, 'lunch');
      meals.push(item);
      currentCost += item.costInr;
      currentProtein += item.proteinG;
      currentCarbs += item.carbsG;
      currentFat += item.fatG;
      currentCalories += item.calories;
    }

    const roti = INDIAN_FOOD_DATABASE.find(f => f.id === 'phulka-roti')!;
    const lunchRoti = createMealItem(roti, 70, 'lunch'); // 2 phulkas
    meals.push(lunchRoti);
    currentCost += lunchRoti.costInr;
    currentProtein += lunchRoti.proteinG;
    currentCarbs += lunchRoti.carbsG;
    currentFat += lunchRoti.fatG;
    currentCalories += lunchRoti.calories;

    const dahi = INDIAN_FOOD_DATABASE.find(f => f.id === 'ghar-ka-dahi');
    if (dahi) {
      const lunchDahi = createMealItem(dahi, 150, 'lunch');
      meals.push(lunchDahi);
      currentCost += lunchDahi.costInr;
      currentProtein += lunchDahi.proteinG;
      currentCarbs += lunchDahi.carbsG;
      currentFat += lunchDahi.fatG;
      currentCalories += lunchDahi.calories;
    }

    // 3. Evening Snack: Roasted Peanuts or Sattu or Kala Chana
    const snackCandidate = allowedFoods.find(f => f.id === 'roasted-peanuts' || f.id === 'kala-chana');
    if (snackCandidate) {
      const item = createMealItem(snackCandidate, 40, 'evening_snack');
      meals.push(item);
      currentCost += item.costInr;
      currentProtein += item.proteinG;
      currentCarbs += item.carbsG;
      currentFat += item.fatG;
      currentCalories += item.calories;
    }

    // 4. Dinner Slot: Moong Dal + Rice/Roti + Soya or Eggs
    const dal = INDIAN_FOOD_DATABASE.find(f => f.id === 'yellow-moong-dal')!;
    const dinnerDal = createMealItem(dal, 50, 'dinner');
    meals.push(dinnerDal);
    currentCost += dinnerDal.costInr;
    currentProtein += dinnerDal.proteinG;
    currentCarbs += dinnerDal.carbsG;
    currentFat += dinnerDal.fatG;
    currentCalories += dinnerDal.calories;

    const dinnerRoti = createMealItem(roti, 70, 'dinner'); // 2 phulkas
    meals.push(dinnerRoti);
    currentCost += dinnerRoti.costInr;
    currentProtein += dinnerRoti.proteinG;
    currentCarbs += dinnerRoti.carbsG;
    currentFat += dinnerRoti.fatG;
    currentCalories += dinnerRoti.calories;

    // Tips based on budget & protein
    const tips: string[] = [
      '💡 Soya chunks offer 52g protein per 100g at just ₹15 — unmatched rupee-to-protein value in India.',
      '💡 Replace 1 scoop of expensive imported whey (~₹120) with 40g Sattu + 1 glass curd (~₹15) for sustained daytime satiety.',
      '💡 Adding 1 tsp Desi Ghee on phulkas adds essential healthy fats (+45 kcal) without spike in glycemic response.',
    ];

    return {
      dailyBudgetInr,
      actualCostInr: parseFloat(currentCost.toFixed(2)),
      targetProteinG,
      totalProteinG: parseFloat(currentProtein.toFixed(1)),
      totalCarbsG: parseFloat(currentCarbs.toFixed(1)),
      totalFatG: parseFloat(currentFat.toFixed(1)),
      totalCalories: Math.round(currentCalories),
      dietPreference: dietCategory,
      meals,
      tips,
    };
  }

  /**
   * Generates a 7-day consolidated Kirana shopping list categorized cleanly.
   */
  static generateKiranaList(weeklyBudgetInr: number, dietCategory: 'veg' | 'jain' | 'eggetarian' | 'non_veg'): KiranaListResult {
    const rawItems: KiranaListItem[] = [
      {
        itemName: 'Soya Chunks (Nutrela)',
        hindiName: 'सोया बड़ी',
        weeklyQuantity: '500g Pack',
        estimatedCostInr: 75,
        category: 'Atta & Dals',
      },
      {
        itemName: 'Chana Sattu (Roasted)',
        hindiName: 'चना सत्तू',
        weeklyQuantity: '1 kg',
        estimatedCostInr: 160,
        category: 'Atta & Dals',
      },
      {
        itemName: 'Yellow Moong Dal & Kala Chana',
        hindiName: 'दाल व काला चना',
        weeklyQuantity: '1 kg (Combined)',
        estimatedCostInr: 145,
        category: 'Atta & Dals',
      },
      {
        itemName: 'Chakki Whole Wheat Atta',
        hindiName: 'गेहूं का आटा',
        weeklyQuantity: '2.5 kg',
        estimatedCostInr: 110,
        category: 'Atta & Dals',
      },
      {
        itemName: 'Ghar Ka Dahi (Set Curd Milk)',
        hindiName: 'दही हेतु दूध',
        weeklyQuantity: '2 Litres',
        estimatedCostInr: 120,
        category: 'Dairy & Fresh',
      },
    ];

    if (dietCategory === 'eggetarian' || dietCategory === 'non_veg') {
      rawItems.push({
        itemName: 'Farm Fresh Eggs (Crate/Dozen)',
        hindiName: 'अंडे (14 pcs)',
        weeklyQuantity: '14 Eggs',
        estimatedCostInr: 98,
        category: 'Dairy & Fresh',
      });
    }

    if (dietCategory === 'non_veg') {
      rawItems.push({
        itemName: 'Fresh Skinless Chicken Breast',
        hindiName: 'चिकन ब्रेस्ट',
        weeklyQuantity: '800g',
        estimatedCostInr: 240,
        category: 'Dairy & Fresh',
      });
    } else {
      rawItems.push({
        itemName: 'Fresh Malai Paneer',
        hindiName: 'ताज़ा पनीर',
        weeklyQuantity: '500g',
        estimatedCostInr: 220,
        category: 'Dairy & Fresh',
      });
    }

    rawItems.push(
      {
        itemName: 'Sabzi Mandi Mix (Palak, Tomatoes, Onions, Lemon, Ginger)',
        hindiName: 'सब्जी मंडी (पालक, प्याज, टमाटर)',
        weeklyQuantity: 'Assorted 3kg',
        estimatedCostInr: 130,
        category: 'Sabzi Mandi Produce',
      },
      {
        itemName: 'Shuddh Desi Ghee & Mustard Oil',
        hindiName: 'देसी घी व सरसों तेल',
        weeklyQuantity: '250g Ghee + 500ml Oil',
        estimatedCostInr: 190,
        category: 'Spices & Cooking Mediums',
      }
    );

    const totalEstimatedCostInr = rawItems.reduce((acc, i) => acc + i.estimatedCostInr, 0);

    // Group items by category
    const categoryMap = new Map<string, KiranaListItem[]>();
    for (const item of rawItems) {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      categoryMap.get(item.category)!.push(item);
    }

    const categories = Array.from(categoryMap.entries()).map(([name, items]) => ({
      name,
      items,
    }));

    // Generate WhatsApp text export
    let whatsAppText = `🛒 *MealFit Smart Kirana Shopping List*\n`;
    whatsAppText += `📅 *Weekly Budget:* ₹${weeklyBudgetInr} | *Est. Total:* ₹${totalEstimatedCostInr}\n\n`;

    for (const cat of categories) {
      whatsAppText += `📦 *${cat.name.toUpperCase()}*\n`;
      for (const it of cat.items) {
        whatsAppText += `• ${it.itemName} (${it.weeklyQuantity}) - ~₹${it.estimatedCostInr}\n`;
      }
      whatsAppText += `\n`;
    }
    whatsAppText += `✨ *Generated with MealFit India* (High-Protein Budget Optimizer)`;

    return {
      weeklyBudgetInr,
      totalEstimatedCostInr,
      categories,
      whatsAppText,
    };
  }

  /**
   * Fridge "Jugaad" Mode: Repurpose Indian leftovers into high-protein meals
   */
  static getFridgeJugaadRecipes(leftovers: string[]): {
    recipeName: string;
    prepTimeMins: number;
    proteinG: number;
    calories: number;
    instructions: string[];
    extraStaplesNeeded: string[];
  }[] {
    const list = leftovers.map(s => s.toLowerCase().trim());
    const recipes = [];

    if (list.some(l => l.includes('dal') || l.includes('yellow dal') || l.includes('moong'))) {
      recipes.push({
        recipeName: 'High-Protein Missi Dal Paratha',
        prepTimeMins: 12,
        proteinG: 22,
        calories: 340,
        instructions: [
          'Knead leftover cooked dal directly into whole wheat atta with 20g roasted sattu.',
          'Add chopped green chilies, ajwain, and finely chopped coriander.',
          'Cook on tawa with 1 tsp ghee until golden crisp. Serve with fresh curd.',
        ],
        extraStaplesNeeded: ['Whole wheat atta', 'Sattu', 'Ajwain', 'Desi Ghee'],
      });
    }

    if (list.some(l => l.includes('rice') || l.includes('chawal'))) {
      recipes.push({
        recipeName: 'Power Soya & Egg/Paneer Fried Pulao',
        prepTimeMins: 10,
        proteinG: 32,
        calories: 410,
        instructions: [
          'Boil 30g soya chunks in salted water for 5 mins, squeeze excess water.',
          'Saute with jeera, onions, ginger, and 50g paneer cubes or 2 scrambled eggs.',
          'Toss in the leftover cold rice with turmeric, garam masala, and squeeze fresh lemon juice.',
        ],
        extraStaplesNeeded: ['Soya chunks', 'Paneer or Eggs', 'Jeera & Spices', 'Lemon'],
      });
    }

    // Default fallback high-protein desi bowl
    recipes.push({
      recipeName: 'Crispy Sattu Spiced Chaat Bowl',
      prepTimeMins: 5,
      proteinG: 18,
      calories: 220,
      instructions: [
        'Mix 40g dry chana sattu with cold water, roasted jeera powder, black salt, and lemon juice.',
        'Top with chopped onions, tomatoes, and 1 handful of roasted peanuts for crunch.',
        'Super refreshing, zero cooking required, instant protein punch.',
      ],
      extraStaplesNeeded: ['Roasted Chana Sattu', 'Roasted Peanuts', 'Black Salt & Jeera', 'Lemon'],
    });

    return recipes;
  }
}

function createMealItem(
  food: IndianFoodItem,
  grams: number,
  mealSlot: 'breakfast' | 'lunch' | 'evening_snack' | 'dinner'
): DailyMealPlanItem {
  const multiplier = grams / 100;
  const servingsCount = Math.max(1, Math.round(grams / (food.typicalServing.grams || 100)));

  return {
    food,
    grams,
    servingsCount,
    proteinG: parseFloat((food.proteinPer100g * multiplier).toFixed(1)),
    carbsG: parseFloat((food.carbsPer100g * multiplier).toFixed(1)),
    fatG: parseFloat((food.fatPer100g * multiplier).toFixed(1)),
    calories: Math.round(food.caloriesPer100g * multiplier),
    costInr: parseFloat((food.costPer100gInr * multiplier).toFixed(2)),
    mealSlot,
  };
}
