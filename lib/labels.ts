import type { Activity, DayTime, Focus, Goal, Level, MetricKind, SetMark, Slot } from "./types";

export const DISCLAIMER =
  "Это ориентир по тренировкам и питанию, не медицинская рекомендация. При боли, травме или запрете врача обратитесь к специалисту.";

export const GOALS: { id: Goal; label: string; hint: string }[] = [
  { id: "lose", label: "Снизить вес", hint: "Спокойный дефицит и сила" },
  { id: "maintain", label: "Поддерживать форму", hint: "Ровный ритм без качелей" },
  { id: "gain", label: "Набрать массу", hint: "Еда и силовая работа" },
  { id: "strength", label: "Стать сильнее", hint: "Прогрессия и восстановление" },
  { id: "endurance", label: "Выносливость", hint: "Дыхание и ровная нагрузка" },
  { id: "health", label: "Самочувствие", hint: "Движение, сон, еда" },
];

export const LEVELS: { id: Level; label: string }[] = [
  { id: "beginner", label: "Начинаю" },
  { id: "intermediate", label: "Уже тренируюсь" },
  { id: "advanced", label: "Уверенный уровень" },
];

export const ACTIVITIES: { id: Activity; label: string }[] = [
  { id: "low", label: "Почти без тренировок" },
  { id: "light", label: "1–2 раза в неделю" },
  { id: "medium", label: "3–4 раза в неделю" },
  { id: "high", label: "Почти каждый день" },
];

export const WORKOUT_TYPES = ["Силовые", "Функциональные", "Мобилити", "Кардио", "Дома"];

export const EQUIPMENT = [
  { id: "bodyweight", label: "Вес тела" },
  { id: "dumbbell", label: "Гантели" },
  { id: "band", label: "Резинка" },
  { id: "mat", label: "Коврик" },
  { id: "bar", label: "Турник" },
];

export const TIMES: { id: DayTime; label: string }[] = [
  { id: "morning", label: "Утро" },
  { id: "day", label: "День" },
  { id: "evening", label: "Вечер" },
];

export const DURATIONS = [30, 40, 45, 60];

export const DIETS = ["Обычное", "Больше белка", "Без молочного", "Без глютена", "Растительное"];

export const FOCUS_LABEL: Record<Focus, string> = {
  upper: "Верх тела",
  lower: "Низ тела",
  full: "Всё тело",
  push: "Жимовая",
  pull: "Тяговая",
  core: "Кор и осанка",
  conditioning: "Спокойное кардио",
  recovery: "Восстановление",
};

export const GOAL_LABEL: Record<Goal, string> = Object.fromEntries(GOALS.map((g) => [g.id, g.label])) as Record<Goal, string>;
export const LEVEL_LABEL: Record<Level, string> = Object.fromEntries(LEVELS.map((g) => [g.id, g.label])) as Record<Level, string>;
export const ACTIVITY_LABEL: Record<Activity, string> = Object.fromEntries(
  ACTIVITIES.map((g) => [g.id, g.label]),
) as Record<Activity, string>;

export const SLOT_LABEL: Record<Slot, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

export const METRICS: { kind: MetricKind; label: string; unit: string }[] = [
  { kind: "weight", label: "Вес", unit: "кг" },
  { kind: "waist", label: "Талия", unit: "см" },
  { kind: "chest", label: "Грудь", unit: "см" },
  { kind: "hips", label: "Бёдра", unit: "см" },
  { kind: "arms", label: "Руки", unit: "см" },
];

export const MARK_LABEL: Record<SetMark, string> = {
  done: "Выполнено",
  skipped: "Пропущено",
  easy: "Слишком легко",
  ok: "Нормально",
  hard: "Слишком тяжело",
  pain: "Боль или дискомфорт",
};

export function goalPhrase(goal: Goal) {
  return GOAL_LABEL[goal].toLowerCase();
}
