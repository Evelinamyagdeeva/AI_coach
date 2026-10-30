import type { Activity, Goal, Profile, Targets } from "./types";

const ACTIVITY_FACTOR: Record<Activity, number> = {
  low: 1.2,
  light: 1.375,
  medium: 1.55,
  high: 1.725,
};

export function targetsFor(profile: Pick<Profile, "sex" | "age" | "heightCm" | "weightKg" | "activity" | "goal">): Targets {
  const base =
    10 * profile.weightKg +
    6.25 * profile.heightCm -
    5 * profile.age +
    (profile.sex === "male" ? 5 : -161);
  const tdee = base * ACTIVITY_FACTOR[profile.activity];
  const kcal = Math.round(tdee + goalDelta(profile.goal));
  const protein = Math.round(profile.weightKg * proteinPerKg(profile.goal));
  const fat = Math.round(profile.weightKg * 0.85);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, fat, carbs };
}

function goalDelta(goal: Goal) {
  if (goal === "lose") return -400;
  if (goal === "gain") return 300;
  if (goal === "strength") return 250;
  if (goal === "endurance") return 150;
  return 0;
}

function proteinPerKg(goal: Goal) {
  if (goal === "endurance") return 1.5;
  if (goal === "maintain" || goal === "health") return 1.6;
  return 1.8;
}

export function sumMacros(items: { kcal: number; protein: number; fat: number; carbs: number }[]) {
  return items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein: acc.protein + item.protein,
      fat: acc.fat + item.fat,
      carbs: acc.carbs + item.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}
