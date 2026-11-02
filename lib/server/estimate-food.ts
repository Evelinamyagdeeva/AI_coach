import { searchLocalFoods, searchOpenFoodFacts } from "../foods";
import { parseJson, polzaChat } from "./polza";

export interface EstimatedItem {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  per100: { kcal: number; protein: number; fat: number; carbs: number };
  checked: string;
}

interface Guess {
  title?: string;
  items?: { name?: string; grams?: number; kcal?: number; protein?: number; fat?: number; carbs?: number }[];
}

const SHAPE = `Верни только JSON без пояснений: {"title":"короткое название","items":[{"name":"продукт по-русски","grams":число,"kcal":число,"protein":число,"fat":число,"carbs":число}]}. Ккал и БЖУ — на эти граммы, не на 100 г. Если еды нет, items пустой.`;

export async function estimateFood(input: { text?: string; image?: string }) {
  const first = input.image
    ? await polzaChat(
        [
          {
            role: "user",
            content: [
              { type: "text", text: `Перечисли продукты на фото и оцени вес порции. ${SHAPE}` },
              { type: "image_url", image_url: { url: input.image } },
            ],
          },
        ],
        process.env.POLZA_VISION_MODEL || "google/gemini-2.5-flash",
      )
    : await polzaChat([
        { role: "system", content: `Ты оцениваешь съеденную еду. ${SHAPE}` },
        { role: "user", content: input.text || "" },
      ]);

  const guess = parseJson<Guess>(first);
  const draft = (guess?.items || [])
    .map((item) => ({
      name: String(item.name || "").trim(),
      grams: clamp(item.grams, 1, 1500, 100),
      kcal: clamp(item.kcal, 0, 4000, 0),
      protein: clamp(item.protein, 0, 300, 0),
      fat: clamp(item.fat, 0, 300, 0),
      carbs: clamp(item.carbs, 0, 400, 0),
    }))
    .filter((item) => item.name)
    .slice(0, 6);

  if (!draft.length) return { title: "Приём пищи", items: [] as EstimatedItem[], note: "На снимке или в фразе не вижу еды. Добавьте продукт вручную." };

  const references = await Promise.all(
    draft.map(async (item) => {
      const local = searchLocalFoods(item.name).slice(0, 3).map((food) => ({
        name: food.name,
        per100: { kcal: food.kcal, protein: food.protein, fat: food.fat, carbs: food.carbs },
      }));
      const remote = await searchOpenFoodFacts(item.name).catch(() => []);
      return { guess: item, database: [...local, ...remote.slice(0, 3).map((food) => ({ name: food.name, per100: food.per100 }))] };
    }),
  );

  const second = await polzaChat([
    {
      role: "system",
      content: `Сверь свою оценку со справочником на 100 г. Если продукт совпадает, возьми ккал и БЖУ из справочника и умножь на граммы/100. Если совпадения нет, оставь свою оценку. ${SHAPE} Добавь в каждый item поле "source": "база" или "оценка".`,
    },
    { role: "user", content: JSON.stringify(references) },
  ]);
  const checked = parseJson<Guess & { items?: { source?: string }[] }>(second);
  const items = (checked?.items?.length ? checked.items : draft).slice(0, 6).map((item, index) => {
    const base = draft[index] || draft[0];
    const grams = clamp(item.grams, 1, 1500, base.grams);
    const kcal = clamp(item.kcal, 0, 4000, base.kcal);
    const protein = clamp(item.protein, 0, 300, base.protein);
    const fat = clamp(item.fat, 0, 300, base.fat);
    const carbs = clamp(item.carbs, 0, 400, base.carbs);
    const factor = grams > 0 ? 100 / grams : 1;
    return {
      name: String(item.name || base.name).trim() || base.name,
      grams,
      kcal,
      protein,
      fat,
      carbs,
      per100: {
        kcal: Math.round(kcal * factor),
        protein: round1(protein * factor),
        fat: round1(fat * factor),
        carbs: round1(carbs * factor),
      },
      checked: "source" in item && item.source === "база" ? "сверено с базой" : "оценка модели",
    };
  });

  return {
    title: String(checked?.title || guess?.title || items.map((item) => item.name).slice(0, 3).join(", ")),
    items,
    note: "Цифры прикинула модель и сверила со справочником, где нашлось совпадение. Порцию можно поправить.",
  };
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.round(Math.min(max, Math.max(min, number)) * 10) / 10;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
