import { uid } from "./id";
import { round1 } from "./nutrition";
import type { FoodItem, Meal, MealSource } from "./types";
import { normalize } from "./body";

export interface FoodDef {
  id: string;
  name: string;
  keys: string[];
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  defaultGrams: number;
  pieceGrams?: number;
}

export const FOODS: FoodDef[] = [
  { id: "chicken", name: "Курица", keys: ["куриц", "курин"], kcal: 165, protein: 31, fat: 3.6, carbs: 0, defaultGrams: 150 },
  { id: "turkey", name: "Индейка", keys: ["индейк", "индюш"], kcal: 135, protein: 29, fat: 1, carbs: 0, defaultGrams: 150 },
  { id: "beef", name: "Говядина", keys: ["говядин", "стейк"], kcal: 187, protein: 19, fat: 12, carbs: 0, defaultGrams: 150 },
  { id: "salmon", name: "Лосось", keys: ["лосос", "семг"], kcal: 208, protein: 20, fat: 13, carbs: 0, defaultGrams: 120 },
  { id: "tuna", name: "Тунец", keys: ["тунец"], kcal: 130, protein: 29, fat: 1, carbs: 0, defaultGrams: 100 },
  { id: "egg", name: "Яйцо", keys: ["яйц", "яиц"], kcal: 155, protein: 13, fat: 11, carbs: 1.1, defaultGrams: 50, pieceGrams: 50 },
  { id: "toast", name: "Тост", keys: ["тост"], kcal: 265, protein: 9, fat: 3.2, carbs: 49, defaultGrams: 30, pieceGrams: 30 },
  { id: "bread", name: "Хлеб", keys: ["хлеб"], kcal: 265, protein: 9, fat: 3.2, carbs: 49, defaultGrams: 40, pieceGrams: 40 },
  { id: "rice", name: "Рис", keys: ["рис"], kcal: 130, protein: 2.7, fat: 0.3, carbs: 28, defaultGrams: 150 },
  { id: "buckwheat", name: "Гречка", keys: ["греч"], kcal: 110, protein: 4.2, fat: 1.1, carbs: 21, defaultGrams: 150 },
  { id: "oats", name: "Овсянка", keys: ["овсян", "геркулес"], kcal: 88, protein: 3, fat: 1.7, carbs: 12, defaultGrams: 250 },
  { id: "pasta", name: "Паста", keys: ["паста", "макарон"], kcal: 131, protein: 5, fat: 1.1, carbs: 25, defaultGrams: 180 },
  { id: "potato", name: "Картофель", keys: ["картоф"], kcal: 77, protein: 2, fat: 0.1, carbs: 17, defaultGrams: 200 },
  { id: "quinoa", name: "Киноа", keys: ["киноа"], kcal: 120, protein: 4.4, fat: 1.9, carbs: 21, defaultGrams: 150 },
  { id: "salad", name: "Салат", keys: ["салат"], kcal: 25, protein: 1.5, fat: 0.3, carbs: 3, defaultGrams: 100 },
  { id: "veg", name: "Овощи", keys: ["овощ"], kcal: 35, protein: 2, fat: 0.3, carbs: 6, defaultGrams: 150 },
  { id: "broccoli", name: "Брокколи", keys: ["брокколи"], kcal: 34, protein: 2.8, fat: 0.4, carbs: 7, defaultGrams: 150 },
  { id: "cucumber", name: "Огурец", keys: ["огурец", "огурц"], kcal: 15, protein: 0.7, fat: 0.1, carbs: 3, defaultGrams: 100 },
  { id: "tomato", name: "Помидор", keys: ["помидор", "томат"], kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9, defaultGrams: 100 },
  { id: "avocado", name: "Авокадо", keys: ["авокадо"], kcal: 160, protein: 2, fat: 15, carbs: 9, defaultGrams: 80 },
  { id: "cottage", name: "Творог", keys: ["творог"], kcal: 120, protein: 17, fat: 5, carbs: 3, defaultGrams: 150 },
  { id: "yogurt", name: "Йогурт", keys: ["йогурт"], kcal: 61, protein: 4.3, fat: 1.6, carbs: 7, defaultGrams: 150 },
  { id: "milk", name: "Молоко", keys: ["молок"], kcal: 60, protein: 3.2, fat: 3.2, carbs: 4.8, defaultGrams: 200 },
  { id: "cheese", name: "Сыр", keys: ["сыр"], kcal: 350, protein: 25, fat: 27, carbs: 1, defaultGrams: 30 },
  { id: "banana", name: "Банан", keys: ["банан"], kcal: 89, protein: 1.1, fat: 0.3, carbs: 23, defaultGrams: 120, pieceGrams: 120 },
  { id: "apple", name: "Яблоко", keys: ["яблок"], kcal: 52, protein: 0.3, fat: 0.2, carbs: 14, defaultGrams: 180, pieceGrams: 180 },
  { id: "nuts", name: "Орехи", keys: ["орех"], kcal: 607, protein: 20, fat: 54, carbs: 16, defaultGrams: 30 },
  { id: "protein", name: "Протеин", keys: ["протеин"], kcal: 380, protein: 75, fat: 5, carbs: 8, defaultGrams: 30 },
];

const NUMBER_WORDS: [string, number][] = [
  ["десять", 10],
  ["девять", 9],
  ["восемь", 8],
  ["семь", 7],
  ["шесть", 6],
  ["пять", 5],
  ["четыре", 4],
  ["трех", 3],
  ["три", 3],
  ["две", 2],
  ["два", 2],
  ["одна", 1],
  ["один", 1],
  ["одно", 1],
];

export function parseMealText(raw: string): { title: string; items: FoodItem[] } | null {
  const text = normalize(raw);
  const chunks = text
    .split(/,| и | \+ /)
    .map((part) => part.trim())
    .filter(Boolean);
  const items: FoodItem[] = [];

  for (const chunk of chunks) {
    let matches = FOODS.filter((food) => food.keys.some((key) => chunk.includes(key)));
    if (matches.some((food) => food.id === "egg") && matches.some((food) => food.id === "toast" || food.id === "bread")) {
      matches = matches.filter((food) => food.id !== "toast" && food.id !== "bread" ? true : true);
    }
    if (matches.some((food) => food.id === "egg") && /омлет/.test(chunk)) {
      matches = matches.filter((food) => food.id === "egg");
    }
    const food = matches.sort((a, b) => Math.max(...b.keys.map((k) => k.length)) - Math.max(...a.keys.map((k) => k.length)))[0];
    if (!food) continue;
    const grams = amountFor(chunk, food);
    items.push(itemFrom(food, grams));
  }

  if (/омлет/.test(text) && !items.some((item) => item.name === "Яйцо")) {
    const eggs = FOODS.find((food) => food.id === "egg");
    if (eggs) items.unshift(itemFrom(eggs, amountFor(text, eggs)));
  }

  if (!items.length) return null;
  return { title: mealTitle(text, items), items };
}

function amountFor(chunk: string, food: FoodDef) {
  const grams = chunk.match(/(\d+(?:[.,]\d+)?)\s*(?:грамм\w*|гр\b|г\b)/);
  if (grams) return Number(grams[1].replace(",", "."));
  const word = NUMBER_WORDS.find(([w]) => chunk.includes(w));
  const digit = chunk.match(/(\d+)/);
  const count = word ? word[1] : digit ? Number(digit[1]) : null;
  if (count && food.pieceGrams && !grams) return count * food.pieceGrams;
  return food.defaultGrams;
}

function itemFrom(food: FoodDef, grams: number): FoodItem {
  const per100 = { kcal: food.kcal, protein: food.protein, fat: food.fat, carbs: food.carbs };
  return scaleFood({ id: uid("food"), name: food.name, grams, unit: "g", portionWeight: 100, per100, kcal: 0, protein: 0, fat: 0, carbs: 0 });
}

export function searchLocalFoods(query: string) {
  const text = normalize(query);
  if (text.length < 2) return [];
  return FOODS.filter((food) => food.name.toLowerCase().includes(text) || food.keys.some((key) => text.includes(key) || key.includes(text))).slice(0, 6);
}

export interface RemoteFood {
  id: string;
  name: string;
  per100: { kcal: number; protein: number; fat: number; carbs: number };
}

export async function searchOpenFoodFacts(query: string): Promise<RemoteFood[]> {
  const text = query.trim();
  if (text.length < 2) return [];
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(text)}&search_simple=1&action=process&json=1&page_size=6&lc=ru&fields=code,product_name,nutriments`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = (await response.json()) as {
    products?: { code?: string; product_name?: string; nutriments?: Record<string, number> }[];
  };
  return (data.products || [])
    .map((product) => {
      const nutriments = product.nutriments || {};
      const kcal = numberOf(nutriments["energy-kcal_100g"]);
      const name = (product.product_name || "").trim();
      if (!name || kcal === null) return null;
      return {
        id: product.code || name,
        name,
        per100: {
          kcal,
          protein: numberOf(nutriments.proteins_100g) || 0,
          fat: numberOf(nutriments.fat_100g) || 0,
          carbs: numberOf(nutriments.carbohydrates_100g) || 0,
        },
      };
    })
    .filter((item): item is RemoteFood => Boolean(item))
    .slice(0, 6);
}

function numberOf(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function foodFromPer100(name: string, per100: RemoteFood["per100"], grams = 100): FoodItem {
  return scaleFood({
    id: uid("food"),
    name,
    grams,
    unit: "g",
    portionWeight: 100,
    per100,
    kcal: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });
}

export function scaleFood(item: FoodItem): FoodItem {
  if (!item.per100) return item;
  const portion = item.portionWeight && item.portionWeight > 0 ? item.portionWeight : 100;
  const base = item.unit === "portion" ? (item.grams * portion) / 100 : item.grams / 100;
  return {
    ...item,
    kcal: Math.round(item.per100.kcal * base),
    protein: round1(item.per100.protein * base),
    fat: round1(item.per100.fat * base),
    carbs: round1(item.per100.carbs * base),
  };
}

export function amountLabel(item: FoodItem) {
  if (item.unit === "ml") return `${item.grams} мл`;
  if (item.unit === "portion") return `${item.grams} × ${item.portionWeight || 100} г`;
  return `${item.grams} г`;
}

function mealTitle(text: string, items: FoodItem[]) {
  if (/омлет/.test(text)) return "Омлет";
  if (/завтрак/.test(text)) return "Завтрак";
  if (/обед/.test(text)) return "Обед";
  if (/ужин/.test(text)) return "Ужин";
  if (/перекус/.test(text)) return "Перекус";
  return items.map((item) => item.name).slice(0, 3).join(", ");
}

export function mealFromParsed(
  parsed: { title: string; items: FoodItem[] },
  source: MealSource,
  date: string,
  time: string,
): Meal {
  return {
    id: uid("meal"),
    date,
    time,
    title: parsed.title,
    source,
    items: parsed.items,
    approximate: source !== "manual",
  };
}

export function emptyItem(): FoodItem {
  return { id: uid("food"), name: "", grams: 100, kcal: 0, protein: 0, fat: 0, carbs: 0 };
}
