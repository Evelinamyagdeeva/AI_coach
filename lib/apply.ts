import { addDays, todayISO } from "./dates";
import { uid } from "./id";
import { buildMealPlan } from "./recipes";
import { replaceFuture, retargetWorkout, shortenWorkout } from "./plan";
import type { AppNotification, CoachAction, Focus, Profile, Snapshot, Workout } from "./types";

export function applyActions(state: Snapshot, actions: CoachAction[], now = new Date()): Snapshot {
  return actions.reduce((current, action) => applyOne(current, action, now), state);
}

function applyOne(state: Snapshot, action: CoachAction, now: Date): Snapshot {
  const profile = state.profile;
  if (action.type === "log_meal") {
    return {
      ...state,
      meals: [action.meal, ...state.meals],
      notifications: [notice("Еда записана", action.meal.title, "/nutrition", now), ...state.notifications],
    };
  }
  if (action.type === "log_weight") {
    return {
      ...state,
      profile: { ...profile, weightKg: action.value },
      measurements: [
        { id: uid("m"), date: action.date, kind: "weight", label: "Вес", value: action.value, unit: "кг" },
        ...state.measurements,
      ],
      notifications: [notice("Вес обновлён", `${action.value.toString().replace(".", ",")} кг`, "/progress", now), ...state.notifications],
    };
  }
  if (action.type === "journal") {
    return { ...state, profile: { ...profile, journal: [action.note, ...profile.journal] } };
  }
  if (action.type === "set_pantry") {
    const pantry = [...new Set([...profile.pantry, ...action.items])];
    return { ...state, profile: { ...profile, pantry } };
  }
  if (action.type === "generate_menu") {
    const plan = buildMealPlan(profile, todayISO(now));
    return {
      ...state,
      mealPlan: plan,
      notifications: [notice("Меню на неделю", "Завтрак, обед, ужин и перекусы собраны.", "/chef/week", now), ...state.notifications],
    };
  }
  if (action.type === "easier") {
    const nextProfile = { ...profile, adaptation: { easier: true } };
    return {
      ...state,
      profile: nextProfile,
      workouts: replaceFuture(nextProfile, state.workouts, todayISO(now)),
      notifications: [notice("Нагрузка мягче", "Следующие тренировки станут спокойнее.", "/workouts", now), ...state.notifications],
    };
  }
  if (action.type === "add_restriction") {
    const exists = profile.restrictions.some((item) => item.text === action.restriction.text);
    const nextProfile: Profile = {
      ...profile,
      restrictions: exists ? profile.restrictions : [action.restriction, ...profile.restrictions],
    };
    return {
      ...state,
      profile: nextProfile,
      workouts: replaceFuture(nextProfile, state.workouts, todayISO(now)),
      notifications: [notice("Ограничение учтено", action.restriction.text, "/planner", now), ...state.notifications],
    };
  }
  if (action.type === "skip_workout") {
    return {
      ...state,
      workouts: state.workouts.map((workout) =>
        workout.date === action.date && workout.status === "planned" ? { ...workout, status: "skipped" } : workout,
      ),
      notifications: [notice("Тренировка пропущена", "День отмечен. Следующая сессия остаётся в плане.", "/planner", now), ...state.notifications],
    };
  }
  if (action.type === "move_workout") {
    const workout = state.workouts.find((item) => item.date === action.date && item.status === "planned");
    if (!workout) return state;
    const target = nextOpenDate(state.workouts, action.date);
    return {
      ...state,
      workouts: state.workouts.map((item) => (item.id === workout.id ? { ...item, date: target, adjustment: "Перенесено" } : item)),
      notifications: [notice("Тренировка перенесена", `Новая дата: ${target}`, "/planner", now), ...state.notifications],
    };
  }
  if (action.type === "set_duration") {
    return {
      ...state,
      workouts: state.workouts.map((workout) =>
        workout.date === action.date && workout.status === "planned" ? shortenWorkout(workout, action.minutes, profile) : workout,
      ),
    };
  }
  if (action.type === "avoid_focus") {
    return {
      ...state,
      workouts: state.workouts.map((workout) => {
        if (workout.date !== action.date || workout.status !== "planned") return workout;
        const focus: Focus = action.area === "legs" || action.area === "knee" ? "upper" : action.area === "run" ? "conditioning" : "core";
        const text = action.area === "legs" ? "Сегодня без ног: собрала верх тела." : "Сегодня более спокойный фокус.";
        return retargetWorkout(workout, focus, profile, text);
      }),
    };
  }
  if (action.type === "request_focus") {
    return {
      ...state,
      workouts: mapOrCreate(state, profile, action.date, action.focus),
    };
  }
  if (action.type === "set_schedule") {
    const nextProfile: Profile = {
      ...profile,
      daysPerWeek: action.daysPerWeek,
      availableDays: [...action.availableDays].sort((a, b) => a - b),
      preferredTime: action.preferredTime,
      scheduleNote: action.note || profile.scheduleNote,
    };
    return {
      ...state,
      profile: nextProfile,
      workouts: replaceFuture(nextProfile, state.workouts, action.from),
      notifications: [notice("Расписание обновлено", "Будущие тренировки перестроены.", "/planner", now), ...state.notifications],
    };
  }
  return state;
}

function mapOrCreate(state: Snapshot, profile: Profile, date: string, focus: Focus): Workout[] {
  const existing = state.workouts.find((workout) => workout.date === date && workout.status === "planned");
  if (existing) {
    return state.workouts.map((workout) => (workout.id === existing.id ? retargetWorkout(workout, focus, profile, "Фокус изменён по запросу.") : workout));
  }
  const created = retargetWorkout(
    {
      id: uid("w"),
      date,
      time: "18:30",
      name: "",
      durationMin: profile.durationMin,
      goal: "",
      focus,
      difficulty: "средняя",
      warmup: [],
      cooldown: [],
      exercises: [],
      status: "planned",
      volumeLabel: "",
    },
    focus,
    profile,
    "Добавлена по запросу.",
  );
  return [...state.workouts, created].sort((a, b) => a.date.localeCompare(b.date));
}

function nextOpenDate(workouts: Workout[], from: string) {
  let cursor = addDays(from, 1);
  for (let i = 0; i < 10; i += 1) {
    if (!workouts.some((workout) => workout.date === cursor && workout.status === "planned")) return cursor;
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

function notice(title: string, body: string, href: string, now: Date): AppNotification {
  return { id: uid("n"), title, body, href, createdAt: now.toISOString(), read: false };
}

export function snapshotOf(state: Snapshot): Snapshot {
  return structuredClone(state);
}
