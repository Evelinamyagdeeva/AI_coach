import { addDays, todayISO } from "./dates";
import { uid } from "./id";
import { targetsFor } from "./nutrition";
import type { DayMenu, MealPlan, Profile, Slot } from "./types";

export interface Ingredient {
  name: string;
  amount: string;
  category: string;
  keys: string[];
}

export interface Recipe {
  id: string;
  title: string;
  slots: Slot[];
  minutes: number;
  servings: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  summary: string;
  steps: string[];
  ingredients: Ingredient[];
  tags: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: "omelette",
    title: "Омлет с овощами",
    slots: ["breakfast", "dinner"],
    minutes: 15,
    servings: 1,
    kcal: 420,
    protein: 28,
    fat: 26,
    carbs: 12,
    summary: "Быстрый белковый завтрак из яиц и овощей.",
    steps: ["Взбейте 3 яйца с щепоткой соли.", "Обжарьте овощи 3 минуты.", "Залейте яйцами и готовьте на среднем огне до мягкой середины."],
    ingredients: [
      { name: "Яйца", amount: "3 шт", category: "Белок", keys: ["яйц"] },
      { name: "Овощи", amount: "150 г", category: "Овощи", keys: ["овощ"] },
      { name: "Масло", amount: "5 г", category: "Прочее", keys: ["масл"] },
    ],
    tags: ["много белка", "быстро"],
  },
  {
    id: "toast-egg",
    title: "Тосты с яйцом и авокадо",
    slots: ["breakfast"],
    minutes: 12,
    servings: 1,
    kcal: 480,
    protein: 18,
    fat: 24,
    carbs: 46,
    summary: "Сытный завтрак, если дома есть хлеб и авокадо.",
    steps: ["Подсушите тосты.", "Разомните авокадо.", "Сверху положите яйцо пашот или глазунью."],
    ingredients: [
      { name: "Тосты", amount: "2 шт", category: "Крупы", keys: ["тост", "хлеб"] },
      { name: "Яйцо", amount: "1 шт", category: "Белок", keys: ["яйц"] },
      { name: "Авокадо", amount: "80 г", category: "Овощи", keys: ["авокадо"] },
    ],
    tags: ["завтрак"],
  },
  {
    id: "oats",
    title: "Овсянка с йогуртом",
    slots: ["breakfast"],
    minutes: 10,
    servings: 1,
    kcal: 390,
    protein: 18,
    fat: 9,
    carbs: 58,
    summary: "Мягкий завтрак, который легко взять с собой.",
    steps: ["Залейте овсянку горячей водой на 5 минут.", "Добавьте йогурт.", "По желанию положите ягоды или банан."],
    ingredients: [
      { name: "Овсянка", amount: "60 г", category: "Крупы", keys: ["овсян"] },
      { name: "Йогурт", amount: "150 г", category: "Молочное", keys: ["йогурт"] },
      { name: "Банан", amount: "1 шт", category: "Фрукты", keys: ["банан"] },
    ],
    tags: ["утро"],
  },
  {
    id: "cottage",
    title: "Творог с яблоком",
    slots: ["breakfast", "snack"],
    minutes: 5,
    servings: 1,
    kcal: 280,
    protein: 28,
    fat: 8,
    carbs: 24,
    summary: "Короткий белковый приём без готовки.",
    steps: ["Выложите творог в миску.", "Нарежьте яблоко.", "Перемешайте."],
    ingredients: [
      { name: "Творог", amount: "180 г", category: "Молочное", keys: ["творог"] },
      { name: "Яблоко", amount: "1 шт", category: "Фрукты", keys: ["яблок"] },
    ],
    tags: ["много белка", "без готовки"],
  },
  {
    id: "chicken-rice",
    title: "Курица, рис и салат",
    slots: ["lunch", "dinner"],
    minutes: 30,
    servings: 1,
    kcal: 620,
    protein: 48,
    fat: 12,
    carbs: 72,
    summary: "Ровная тарелка на обед или ужин.",
    steps: ["Отварите или запеките курицу.", "Приготовьте рис.", "Соберите тарелку с салатом."],
    ingredients: [
      { name: "Курица", amount: "160 г", category: "Белок", keys: ["куриц"] },
      { name: "Рис", amount: "70 г", category: "Крупы", keys: ["рис"] },
      { name: "Салат", amount: "100 г", category: "Овощи", keys: ["салат", "овощ"] },
    ],
    tags: ["много белка"],
  },
  {
    id: "chicken-bowl",
    title: "Боул с курицей и овощами",
    slots: ["lunch", "dinner"],
    minutes: 25,
    servings: 1,
    kcal: 540,
    protein: 44,
    fat: 16,
    carbs: 48,
    summary: "Тёплая миска, если хочется меньше гарнира и больше овощей.",
    steps: ["Нарежьте курицу и овощи.", "Обжарьте на среднем огне 10 минут.", "Подавайте с половиной порции риса."],
    ingredients: [
      { name: "Курица", amount: "150 г", category: "Белок", keys: ["куриц"] },
      { name: "Овощи", amount: "200 г", category: "Овощи", keys: ["овощ"] },
      { name: "Рис", amount: "50 г", category: "Крупы", keys: ["рис"] },
    ],
    tags: ["ужин"],
  },
  {
    id: "rice-egg",
    title: "Рис с яйцом и авокадо",
    slots: ["lunch", "dinner"],
    minutes: 20,
    servings: 1,
    kcal: 610,
    protein: 22,
    fat: 28,
    carbs: 68,
    summary: "Ужин из того, что часто уже есть дома.",
    steps: ["Отварите рис.", "Сделайте яйцо.", "Добавьте авокадо и овощи."],
    ingredients: [
      { name: "Рис", amount: "70 г", category: "Крупы", keys: ["рис"] },
      { name: "Яйца", amount: "2 шт", category: "Белок", keys: ["яйц"] },
      { name: "Авокадо", amount: "70 г", category: "Овощи", keys: ["авокадо"] },
      { name: "Овощи", amount: "100 г", category: "Овощи", keys: ["овощ"] },
    ],
    tags: ["из дома"],
  },
  {
    id: "turkey-buckwheat",
    title: "Индейка с гречкой",
    slots: ["lunch", "dinner"],
    minutes: 30,
    servings: 1,
    kcal: 560,
    protein: 46,
    fat: 12,
    carbs: 58,
    summary: "Плотный обед с понятными продуктами.",
    steps: ["Обжарьте индейку до готовности.", "Отварите гречку.", "Рядом положите овощи."],
    ingredients: [
      { name: "Индейка", amount: "160 г", category: "Белок", keys: ["индейк"] },
      { name: "Гречка", amount: "70 г", category: "Крупы", keys: ["греч"] },
      { name: "Овощи", amount: "150 г", category: "Овощи", keys: ["овощ"] },
    ],
    tags: ["много белка"],
  },
  {
    id: "yogurt-nuts",
    title: "Йогурт с орехами",
    slots: ["snack"],
    minutes: 3,
    servings: 1,
    kcal: 280,
    protein: 14,
    fat: 16,
    carbs: 18,
    summary: "Короткий перекус между делами.",
    steps: ["Выложите йогурт.", "Добавьте небольшую горсть орехов."],
    ingredients: [
      { name: "Йогурт", amount: "180 г", category: "Молочное", keys: ["йогурт"] },
      { name: "Орехи", amount: "15 г", category: "Прочее", keys: ["орех"] },
    ],
    tags: ["перекус"],
  },
  {
    id: "cottage-snack",
    title: "Творожный перекус",
    slots: ["snack"],
    minutes: 3,
    servings: 1,
    kcal: 220,
    protein: 26,
    fat: 6,
    carbs: 12,
    summary: "Если до конца дня не хватает белка.",
    steps: ["Положите творог в миску.", "Добавьте ягоды или просто съешьте так."],
    ingredients: [{ name: "Творог", amount: "150 г", category: "Молочное", keys: ["творог"] }],
    tags: ["много белка", "перекус"],
  },
  {
    id: "veg-stew",
    title: "Овощное рагу с курицей",
    slots: ["dinner"],
    minutes: 35,
    servings: 2,
    kcal: 430,
    protein: 36,
    fat: 14,
    carbs: 32,
    summary: "Кастрюля на два приёма, если не хочется стоять у плиты каждый день.",
    steps: ["Нарежьте курицу и овощи.", "Тушите под крышкой 25 минут.", "Посолите в конце."],
    ingredients: [
      { name: "Курица", amount: "150 г", category: "Белок", keys: ["куриц"] },
      { name: "Овощи", amount: "250 г", category: "Овощи", keys: ["овощ"] },
    ],
    tags: ["ужин", "на два дня"],
  },
  {
    id: "salmon-veg",
    title: "Рыба с овощами",
    slots: ["dinner", "lunch"],
    minutes: 25,
    servings: 1,
    kcal: 520,
    protein: 38,
    fat: 28,
    carbs: 18,
    summary: "Лёгкий ужин, если рыба есть под рукой.",
    steps: ["Запеките рыбу 15 минут.", "Рядом обжарьте или отварите овощи."],
    ingredients: [
      { name: "Лосось", amount: "140 г", category: "Белок", keys: ["лосос", "рыб"] },
      { name: "Овощи", amount: "200 г", category: "Овощи", keys: ["овощ"] },
    ],
    tags: ["ужин"],
  },
];

export function recipeById(id: string) {
  return RECIPES.find((recipe) => recipe.id === id);
}

function blocked(recipe: Recipe, profile: Profile) {
  const avoid = [...profile.allergies, ...profile.dislikes].map((item) => item.toLowerCase());
  if (profile.dietStyle === "Без молочного" && recipe.ingredients.some((item) => item.category === "Молочное")) return true;
  if (profile.dietStyle === "Растительное" && recipe.ingredients.some((item) => item.category === "Белок" && !item.keys.includes("яйц"))) {
    if (recipe.ingredients.some((item) => ["куриц", "индейк", "лосос", "рыб"].some((key) => item.keys.includes(key)))) return true;
  }
  return recipe.ingredients.some((item) => item.keys.some((key) => avoid.some((word) => word && (word.includes(key) || key.includes(word)))));
}

function pantryScore(recipe: Recipe, pantry: string[]) {
  const hay = pantry.join(" ").toLowerCase();
  if (!hay) return 0;
  return recipe.ingredients.reduce((score, item) => {
    const hit = item.keys.some((key) => hay.includes(key));
    return score + (hit ? 2 : 0);
  }, 0);
}

export function suggestRecipes(profile: Profile, slot: Slot = "dinner", limit = 3) {
  return RECIPES.filter((recipe) => recipe.slots.includes(slot) && !blocked(recipe, profile))
    .map((recipe) => ({ recipe, score: pantryScore(recipe, profile.pantry) + recipe.protein / 40 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.recipe);
}

const SLOT_SHARE: Record<Slot, number> = { breakfast: 0.25, lunch: 0.35, dinner: 0.3, snack: 0.1 };

export function scaledRecipe(recipe: Recipe, factor = 1) {
  const scale = factor > 0 ? factor : 1;
  return {
    kcal: Math.round(recipe.kcal * scale),
    protein: Math.round(recipe.protein * scale),
    fat: Math.round(recipe.fat * scale),
    carbs: Math.round(recipe.carbs * scale),
  };
}

export function buildMealPlan(profile: Profile, from = todayISO()): MealPlan {
  const targets = targetsFor(profile);
  const likes = (profile.likes || []).map((item) => item.toLowerCase());
  const days: DayMenu[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 7; i += 1) {
    const date = addDays(from, i);
    const meals = (["breakfast", "lunch", "dinner", "snack"] as Slot[]).map((slot) => {
      const pool = RECIPES.filter((recipe) => recipe.slots.includes(slot) && !blocked(recipe, profile));
      const ranked = [...pool].sort((a, b) => scoreRecipe(b, slot, targets, likes, used) - scoreRecipe(a, slot, targets, likes, used));
      const recipe = ranked[0] || RECIPES.find((item) => item.slots.includes(slot)) || RECIPES[0];
      used.add(`${date}-${recipe.id}`);
      const goal = targets.kcal * SLOT_SHARE[slot];
      const factor = Math.round(Math.min(1.6, Math.max(0.7, goal / recipe.kcal)) * 100) / 100;
      return { slot, recipeId: recipe.id, factor };
    });
    days.push({ date, meals });
  }
  return { id: uid("menu"), createdAt: new Date().toISOString(), days };
}

function scoreRecipe(recipe: Recipe, slot: Slot, targets: { kcal: number; protein: number; fat: number; carbs: number }, likes: string[], used: Set<string>) {
  const share = SLOT_SHARE[slot];
  const factor = Math.min(1.6, Math.max(0.7, (targets.kcal * share) / recipe.kcal));
  const scaled = scaledRecipe(recipe, factor);
  const gap = (value: number, goal: number) => Math.abs(value - goal * share) / Math.max(goal, 1);
  const liked = recipe.ingredients.some((item) => item.keys.some((key) => likes.some((word) => word.includes(key) || key.includes(word))));
  const recent = [...used].filter((key) => key.endsWith(`-${recipe.id}`)).length;
  return -(gap(scaled.protein, targets.protein) + gap(scaled.fat, targets.fat) + gap(scaled.carbs, targets.carbs)) + (liked ? 0.6 : 0) - recent * 0.2;
}

export function shoppingList(plan: MealPlan) {
  const map = new Map<string, { name: string; category: string; amounts: string[] }>();
  for (const day of plan.days) {
    for (const meal of day.meals) {
      const recipe = recipeById(meal.recipeId);
      if (!recipe) continue;
      for (const item of recipe.ingredients) {
        const current = map.get(item.name) || { name: item.name, category: item.category, amounts: [] };
        current.amounts.push(scaleAmount(item.amount, meal.factor || 1));
        map.set(item.name, current);
      }
    }
  }
  return [...map.values()]
    .map((item) => ({ ...item, amount: combineAmounts(item.amounts) }))
    .sort((a, b) => a.category.localeCompare(b.category, "ru"));
}

function scaleAmount(amount: string, factor: number) {
  if (factor === 1) return amount;
  return amount.replace(/(\d+(?:[.,]\d+)?)/, (_, raw: string) => String(Math.max(1, Math.round(Number(raw.replace(",", ".")) * factor))));
}

function combineAmounts(amounts: string[]) {
  const parsed = amounts.map((amount) => {
    const match = amount.match(/(\d+(?:[.,]\d+)?)\s*(шт|г|мл)/);
    if (!match) return null;
    return { n: Number(match[1].replace(",", ".")), unit: match[2] };
  });
  if (parsed.some((item) => !item)) return amounts.join(" + ");
  const unit = parsed[0]?.unit;
  if (!unit || parsed.some((item) => item?.unit !== unit)) return amounts.join(" + ");
  const sum = parsed.reduce((total, item) => total + (item?.n || 0), 0);
  return `${Math.round(sum)} ${unit}`;
}
