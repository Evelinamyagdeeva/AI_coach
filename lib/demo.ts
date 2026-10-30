import { applyActions } from "./apply";
import { addDays, todayISO, weekdayMon0 } from "./dates";
import { mealFromParsed, parseMealText } from "./foods";
import { uid } from "./id";
import { buildMealPlan } from "./recipes";
import { buildHorizon } from "./plan";
import type { Meal, Measurement, Profile, Session, Snapshot, Workout } from "./types";

export function blankProfile(name: string, email = ""): Profile {
  return {
    id: uid("user"),
    name: name.trim() || "Друг",
    email,
    sex: "female",
    age: 30,
    heightCm: 168,
    weightKg: 64,
    goal: "health",
    level: "beginner",
    activity: "light",
    preferredWorkouts: [],
    daysPerWeek: 3,
    availableDays: [0, 2, 4],
    preferredTime: "evening",
    durationMin: 45,
    equipment: ["bodyweight", "mat"],
    dietStyle: "Обычное",
    allergies: [],
    dislikes: [],
    pantry: [],
    restrictions: [],
    recoveryNotes: "",
    wishes: "",
    scheduleNote: "",
    journal: [],
    adaptation: { easier: false },
    onboarded: false,
    createdAt: new Date().toISOString(),
  };
}

export function emptySnapshot(profile: Profile): Snapshot {
  return { profile, workouts: [], meals: [], measurements: [], mealPlan: null, notifications: [], sessions: [] };
}

export function planForNewProfile(profile: Profile): Snapshot {
  const onboarded = { ...profile, onboarded: true };
  const workouts = buildHorizon(onboarded, todayISO(), 14);
  return {
    ...emptySnapshot(onboarded),
    workouts,
    measurements: [
      {
        id: uid("m"),
        date: todayISO(),
        kind: "weight",
        label: "Вес",
        value: onboarded.weightKg,
        unit: "кг",
      },
    ],
    notifications: [
      {
        id: uid("n"),
        title: "План собран",
        body: "Тренировки на две недели уже в календаре.",
        href: "/planner",
        createdAt: new Date().toISOString(),
        read: false,
      },
    ],
  };
}

export function demoSnapshot(): Snapshot {
  const today = todayISO();
  const weekday = weekdayMon0(today);
  const availableDays = [1, 3, 5];
  if (!availableDays.includes(weekday)) availableDays.push(weekday);
  const profile: Profile = {
    ...blankProfile("Алина", "alina@example.com"),
    sex: "female",
    age: 29,
    heightCm: 168,
    weightKg: 64.2,
    goal: "strength",
    level: "intermediate",
    activity: "medium",
    preferredWorkouts: ["Силовые", "Мобилити"],
    daysPerWeek: availableDays.length,
    availableDays,
    preferredTime: "evening",
    durationMin: 45,
    equipment: ["bodyweight", "dumbbell", "band", "mat"],
    dietStyle: "Больше белка",
    allergies: [],
    dislikes: ["печень"],
    pantry: ["яйца", "курица", "рис", "авокадо", "овощи", "йогурт"],
    recoveryNotes: "После тяжёлого дня нужен более короткий сон и спокойная ходьба.",
    wishes: "Хочу увереннее приседать и не пропускать ужины.",
    scheduleNote: "По будням свободна после 18:00.",
    onboarded: true,
  };

  const past: Workout[] = [];
  const sessions: Session[] = [];
  for (let offset = 28; offset >= 1; offset -= 1) {
    const date = addDays(today, -offset);
    if (!availableDays.includes(weekdayMon0(date))) continue;
    const [workout] = buildHorizon({ ...profile, availableDays: [weekdayMon0(date)] }, date, 1);
    if (!workout) continue;
    const done: Workout = { ...workout, status: offset % 11 === 0 ? "skipped" : "done" };
    past.push(done);
    if (done.status === "done") {
      sessions.push({
        id: uid("ses"),
        workoutId: done.id,
        startedAt: new Date(`${date}T18:30:00`).toISOString(),
        finishedAt: new Date(`${date}T19:10:00`).toISOString(),
        durationMin: done.durationMin - (offset % 5),
        logs: done.exercises.flatMap((exercise) =>
          Array.from({ length: exercise.sets }, (_, index) => ({
            plannedId: exercise.id,
            setIndex: index,
            mark: offset % 9 === 0 && index === exercise.sets - 1 ? "hard" as const : "ok" as const,
          })),
        ),
      });
    }
  }

  const upcoming = buildHorizon(profile, today, 14);
  const meals: Meal[] = [];
  const breakfast = parseMealText("Съела омлет из трёх яиц и два тоста");
  const lunch = parseMealText("Съела 150 грамм курицы, рис и салат");
  if (breakfast) meals.push(mealFromParsed(breakfast, "text", today, "08:40"));
  if (lunch) meals.push(mealFromParsed(lunch, "text", today, "13:20"));
  for (let offset = 1; offset <= 6; offset += 1) {
    const date = addDays(today, -offset);
    const bowl = parseMealText("Курица, рис и овощи");
    if (bowl) meals.push(mealFromParsed(bowl, "text", date, "19:10"));
  }

  const measurements: Measurement[] = [0, 7, 14, 21, 28].map((offset, index) => ({
    id: uid("m"),
    date: addDays(today, -offset),
    kind: "weight" as const,
    label: "Вес",
    value: Math.round((64.2 - index * 0.15) * 10) / 10,
    unit: "кг",
  }));
  measurements.push({ id: uid("m"), date: addDays(today, -10), kind: "waist", label: "Талия", value: 72, unit: "см" });

  let snapshot: Snapshot = {
    profile,
    workouts: [...past, ...upcoming].sort((a, b) => a.date.localeCompare(b.date)),
    meals,
    measurements: measurements.sort((a, b) => b.date.localeCompare(a.date)),
    mealPlan: buildMealPlan(profile, today),
    notifications: [
      {
        id: uid("n"),
        title: "Сегодняшняя сессия",
        body: "Вечером в плане тренировка. Можно начать, когда будете готовы.",
        href: "/dashboard",
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: uid("n"),
        title: "Белка ещё есть запас",
        body: "Шеф может собрать ужин из курицы, риса и овощей.",
        href: "/chef",
        createdAt: new Date().toISOString(),
        read: false,
      },
    ],
    sessions,
  };

  snapshot = applyActions(snapshot, []);
  return snapshot;
}
