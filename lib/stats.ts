import { addDays, formatWeekday, mondayOf, todayISO } from "./dates";
import { sumMacros, targetsFor } from "./nutrition";
import type { Meal, Measurement, Session, Workout } from "./types";

export function weekSeries(workouts: Workout[], sessions: Session[], anchor = todayISO()) {
  const start = mondayOf(anchor);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const session = sessions.find((item) => item.finishedAt && item.finishedAt.slice(0, 10) === date);
    const workout = workouts.find((item) => item.id === session?.workoutId) || workouts.find((item) => item.date === date && item.status === "done");
    const minutes = session?.durationMin || (workout?.status === "done" ? workout.durationMin : 0);
    return { date, label: formatWeekday(date), minutes };
  });
}

export function monthSeries(workouts: Workout[], sessions: Session[], anchor = todayISO()) {
  const start = mondayOf(addDays(anchor, -27));
  return Array.from({ length: 4 }, (_, index) => {
    const from = addDays(start, index * 7);
    const to = addDays(from, 6);
    const minutes = sessions
      .filter((session) => {
        const date = (session.finishedAt || "").slice(0, 10);
        return date >= from && date <= to;
      })
      .reduce((sum, session) => sum + session.durationMin, 0);
    const fallback = workouts
      .filter((workout) => workout.status === "done" && workout.date >= from && workout.date <= to && !sessions.some((session) => session.workoutId === workout.id))
      .reduce((sum, workout) => sum + workout.durationMin, 0);
    return { label: `${index + 1} нед.`, minutes: minutes + fallback };
  });
}

export function nutritionSeries(meals: Meal[], anchor = todayISO(), days = 7) {
  const targets = { kcal: 0 };
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(anchor, -(days - 1 - index));
    const dayMeals = meals.filter((meal) => meal.date === date);
    const totals = sumMacros(dayMeals.flatMap((meal) => meal.items));
    return { date, label: formatWeekday(date), ...totals, placeholder: targets.kcal };
  });
}

export function weightSeries(measurements: Measurement[]) {
  return measurements
    .filter((item) => item.kind === "weight")
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({ date: item.date, value: item.value }));
}

export function todayTotals(meals: Meal[], date = todayISO()) {
  return sumMacros(meals.filter((meal) => meal.date === date).flatMap((meal) => meal.items));
}

export function progressSummary(workouts: Workout[], sessions: Session[], meals: Meal[], profileWeight: number) {
  const done = workouts.filter((item) => item.status === "done");
  const skipped = workouts.filter((item) => item.status === "skipped");
  const minutes = sessions.reduce((sum, session) => sum + session.durationMin, 0) || done.reduce((sum, item) => sum + item.durationMin, 0);
  const plannedRecent = workouts.filter((item) => item.date <= todayISO() && item.date >= addDays(todayISO(), -28));
  const doneRecent = plannedRecent.filter((item) => item.status === "done").length;
  const regularity = plannedRecent.length ? Math.round((doneRecent / plannedRecent.length) * 100) : 0;
  const variety = new Set(done.map((item) => item.focus)).size;
  const targets = meals.length ? targetsForPlaceholder(meals) : null;
  return {
    workouts: done.length,
    skipped: skipped.length,
    hours: Math.round((minutes / 60) * 10) / 10,
    minutes,
    regularity,
    variety,
    profileWeight,
    targets,
  };
}

function targetsForPlaceholder(meals: Meal[]) {
  const days = new Set(meals.map((meal) => meal.date)).size || 1;
  const totals = sumMacros(meals.flatMap((meal) => meal.items));
  return { kcal: Math.round(totals.kcal / days), protein: Math.round(totals.protein / days) };
}

export function calorieTargetOf(profile: Parameters<typeof targetsFor>[0]) {
  return targetsFor(profile);
}
