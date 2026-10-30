import { addDays, timeFor, todayISO, weekdayMon0 } from "./dates";
import { EXERCISES, type Exercise } from "./exercises";
import { uid } from "./id";
import { GOAL_LABEL } from "./labels";
import type { Focus, Profile, Workout } from "./types";

const SPLITS: Record<number, Focus[]> = {
  1: ["full"],
  2: ["full", "upper"],
  3: ["full", "lower", "upper"],
  4: ["upper", "lower", "full", "conditioning"],
  5: ["push", "pull", "lower", "upper", "conditioning"],
  6: ["push", "pull", "lower", "upper", "conditioning", "core"],
};

export function splitFor(days: number) {
  return SPLITS[Math.min(Math.max(days, 1), 6)];
}

export function canDo(exercise: Exercise, equipment: string[]) {
  if (exercise.equipment.includes("bodyweight")) return true;
  return exercise.equipment.some((item) => equipment.includes(item) || (item === "mat" && equipment.includes("bodyweight")));
}

export function isBlocked(exercise: Exercise, profile: Profile) {
  const areas = new Set(profile.restrictions.map((item) => item.area).filter(Boolean));
  const text = profile.restrictions.map((item) => item.text.toLowerCase()).join(" ");
  if ((areas.has("run") || /бег/.test(text)) && exercise.sensitive.includes("run")) return true;
  if ((areas.has("back") || /спин|поясниц/.test(text)) && exercise.sensitive.includes("back")) return true;
  if ((areas.has("knee") || /колен/.test(text)) && exercise.sensitive.includes("knee")) return true;
  if ((areas.has("shoulder") || /плеч/.test(text)) && exercise.sensitive.includes("shoulder")) return true;
  return false;
}

function slotSize(minutes: number, easier: boolean) {
  const base = minutes <= 30 ? { count: 4, sets: 3 } : minutes <= 40 ? { count: 5, sets: 3 } : minutes <= 50 ? { count: 6, sets: 3 } : { count: 7, sets: 4 };
  return { count: base.count, sets: easier ? Math.max(2, base.sets - 1) : base.sets };
}

function repsFor(exercise: Exercise, profile: Profile) {
  if (exercise.focus.includes("recovery") && exercise.id !== "plank") return "6–8 дыханий";
  if (exercise.id === "plank" || exercise.id === "wall-sit" || exercise.id === "side-plank") return profile.level === "beginner" ? "20–30 сек" : "30–40 сек";
  if (exercise.id === "walk" || exercise.id === "easy-run" || exercise.id === "farmer-march") return profile.durationMin <= 30 ? "6–8 мин" : "8–12 мин";
  if (profile.level === "beginner" || profile.adaptation.easier) return "10–12";
  if (profile.level === "advanced") return "6–8";
  return "8–10";
}

function loadFor(exercise: Exercise, profile: Profile) {
  if (exercise.id === "walk" || exercise.id === "easy-run" || exercise.id === "farmer-march" || exercise.focus.includes("recovery")) return "спокойный темп";
  if (exercise.equipment.includes("dumbbell") && profile.equipment.includes("dumbbell")) {
    if (profile.level === "beginner" || profile.adaptation.easier) return "лёгкие гантели";
    if (profile.level === "advanced") return "рабочий вес";
    return "комфортный вес";
  }
  if (exercise.equipment.includes("band") && profile.equipment.includes("band")) return "средняя резинка";
  return "вес тела";
}

function restFor(exercise: Exercise, profile: Profile) {
  if (exercise.focus.includes("recovery") || exercise.id === "walk") return 30;
  if (profile.level === "beginner" || profile.adaptation.easier) return 60;
  return 90;
}

function pickExercises(focus: Focus, profile: Profile, seed: number) {
  const { count } = slotSize(profile.durationMin, profile.adaptation.easier);
  const pool = EXERCISES.filter((exercise) => exercise.focus.includes(focus) && canDo(exercise, profile.equipment) && !isBlocked(exercise, profile));
  const fallback = EXERCISES.filter((exercise) => exercise.focus.includes("recovery") && !isBlocked(exercise, profile));
  const source = pool.length ? pool : fallback;
  const start = source.length ? seed % source.length : 0;
  const rotated = source.slice(start).concat(source.slice(0, start));
  const unique: Exercise[] = [];
  for (const exercise of rotated) {
    if (unique.some((item) => item.id === exercise.id)) continue;
    unique.push(exercise);
    if (unique.length >= count) break;
  }
  return unique;
}

function volumeLabel(exercises: { sets: number; reps: string }[]) {
  const reps = exercises.reduce((sum, item) => {
    const match = item.reps.match(/\d+/);
    return sum + item.sets * (match ? Number(match[0]) : 8);
  }, 0);
  return `${reps} повторений`;
}

export function createWorkout(profile: Profile, date: string, focus: Focus, seed = 0, adjustment?: string): Workout {
  const chosen = pickExercises(focus, profile, seed);
  const { sets } = slotSize(profile.durationMin, profile.adaptation.easier);
  const id = uid("w");
  const exercises = chosen.map((exercise, index) => ({
    id: `${id}_${exercise.id}_${index}`,
    exerciseId: exercise.id,
    sets: exercise.id === "walk" || exercise.id === "easy-run" ? 1 : sets,
    reps: repsFor(exercise, profile),
    load: loadFor(exercise, profile),
    restSec: restFor(exercise, profile),
  }));
  const names: Record<Focus, string> = {
    upper: "Верх тела",
    lower: "Низ тела",
    full: "Всё тело",
    push: "Жимовая",
    pull: "Тяговая",
    core: "Кор и осанка",
    conditioning: profile.restrictions.some((item) => item.area === "run") ? "Кардио без бега" : "Спокойное кардио",
    recovery: "Восстановление",
  };
  return {
    id,
    date,
    time: timeFor(profile.preferredTime),
    name: names[focus],
    durationMin: profile.durationMin,
    goal: GOAL_LABEL[profile.goal],
    focus,
    difficulty: profile.adaptation.easier || profile.level === "beginner" ? "лёгкая" : profile.level === "advanced" ? "высокая" : "средняя",
    warmup: warmupFor(focus),
    cooldown: ["Спокойное дыхание 1 минута", "Мягкая растяжка бёдер и груди"],
    exercises,
    status: "planned",
    volumeLabel: volumeLabel(exercises),
    adjustment,
  };
}

function warmupFor(focus: Focus) {
  if (focus === "lower") return ["Марш на месте 2 минуты", "Круги тазом и присед без веса"];
  if (focus === "upper" || focus === "push" || focus === "pull") return ["Круги плечами", "Лёгкие отведения рук"];
  if (focus === "recovery") return ["Дыхание лёжа", "Кошка и корова"];
  return ["Марш на месте 2 минуты", "Круги руками и тазом"];
}

export function buildHorizon(profile: Profile, from: string, days: number) {
  const focuses = splitFor(profile.availableDays.length || profile.daysPerWeek);
  const workouts: Workout[] = [];
  let cursor = 0;
  for (let i = 0; i < days; i += 1) {
    const date = addDays(from, i);
    if (!profile.availableDays.includes(weekdayMon0(date))) continue;
    workouts.push(createWorkout(profile, date, focuses[cursor % focuses.length], i + profile.availableDays.length));
    cursor += 1;
  }
  return workouts;
}

export function replaceFuture(profile: Profile, workouts: Workout[], from = todayISO()) {
  const kept = workouts.filter((workout) => workout.status !== "planned" || workout.date < from);
  const taken = new Set(kept.map((workout) => workout.date));
  const fresh = buildHorizon(profile, from, 14).filter((workout) => !taken.has(workout.date));
  return [...kept, ...fresh].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export function shortenWorkout(workout: Workout, minutes: number, profile: Profile) {
  const next = createWorkout({ ...profile, durationMin: minutes }, workout.date, workout.focus, minutes, `Длительность ${minutes} минут`);
  return { ...next, id: workout.id, time: workout.time, status: workout.status, adjustment: `Сегодня ${minutes} минут — короче обычного плана.` };
}

export function retargetWorkout(workout: Workout, focus: Focus, profile: Profile, adjustment: string) {
  const next = createWorkout(profile, workout.date, focus, focus.length + workout.date.length, adjustment);
  return { ...next, id: workout.id, time: workout.time, status: workout.status, adjustment };
}
