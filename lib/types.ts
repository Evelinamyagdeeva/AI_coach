export type Goal = "lose" | "maintain" | "gain" | "strength" | "endurance" | "health";
export type Level = "beginner" | "intermediate" | "advanced";
export type Activity = "low" | "light" | "medium" | "high";
export type Sex = "female" | "male";
export type DayTime = "morning" | "day" | "evening";
export type Focus = "upper" | "lower" | "full" | "push" | "pull" | "core" | "conditioning" | "recovery";
export type Difficulty = "лёгкая" | "средняя" | "высокая";
export type WorkoutStatus = "planned" | "done" | "skipped";
export type SetMark = "done" | "skipped" | "easy" | "ok" | "hard" | "pain";
export type MealSource = "text" | "voice" | "photo" | "manual";
export type MetricKind = "weight" | "waist" | "chest" | "hips" | "arms" | "custom";
export type Slot = "breakfast" | "lunch" | "dinner" | "snack";
export type Sensitive = "back" | "knee" | "shoulder" | "run" | "legs";

export interface Restriction {
  id: string;
  text: string;
  kind: "pain" | "doctor" | "preference";
  area?: string;
  createdAt: string;
}

export interface JournalNote {
  id: string;
  date: string;
  text: string;
  area?: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  level: Level;
  activity: Activity;
  preferredWorkouts: string[];
  daysPerWeek: number;
  availableDays: number[];
  preferredTime: DayTime;
  durationMin: number;
  equipment: string[];
  dietStyle: string;
  allergies: string[];
  dislikes: string[];
  pantry: string[];
  restrictions: Restriction[];
  recoveryNotes: string;
  wishes: string;
  scheduleNote: string;
  journal: JournalNote[];
  adaptation: { easier: boolean };
  onboarded: boolean;
  createdAt: string;
}

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string;
  load: string;
  restSec: number;
}

export interface Workout {
  id: string;
  date: string;
  time: string;
  name: string;
  durationMin: number;
  goal: string;
  focus: Focus;
  difficulty: Difficulty;
  warmup: string[];
  cooldown: string[];
  exercises: PlannedExercise[];
  status: WorkoutStatus;
  volumeLabel: string;
  adjustment?: string;
}

export interface SetLog {
  plannedId: string;
  setIndex: number;
  mark: SetMark;
}

export interface Feedback {
  wellbeing: number;
  difficulty: "easy" | "ok" | "hard";
  pain: string;
  energy: number;
  mood: number;
  comment: string;
}

export interface Session {
  id: string;
  workoutId: string;
  startedAt: string;
  finishedAt?: string;
  durationMin: number;
  logs: SetLog[];
  feedback?: Feedback;
}

export interface ActiveSession {
  workoutId: string;
  exerciseIndex: number;
  setIndex: number;
  logs: SetLog[];
  startedAt: string;
  restUntil?: number;
  completed?: boolean;
  painNote?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface Meal {
  id: string;
  date: string;
  time: string;
  title: string;
  source: MealSource;
  items: FoodItem[];
  approximate: boolean;
}

export interface Measurement {
  id: string;
  date: string;
  kind: MetricKind;
  label: string;
  value: number;
  unit: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  href?: string;
  createdAt: string;
  read: boolean;
}

export interface PlannedDish {
  slot: Slot;
  recipeId: string;
}

export interface DayMenu {
  date: string;
  meals: PlannedDish[];
}

export interface MealPlan {
  id: string;
  createdAt: string;
  days: DayMenu[];
}

export type CoachAction =
  | { type: "log_meal"; meal: Meal }
  | { type: "log_weight"; value: number; date: string }
  | { type: "skip_workout"; date: string }
  | { type: "move_workout"; date: string }
  | { type: "set_duration"; date: string; minutes: number }
  | { type: "avoid_focus"; date: string; area: string }
  | { type: "add_restriction"; restriction: Restriction }
  | {
      type: "set_schedule";
      daysPerWeek: number;
      availableDays: number[];
      preferredTime: DayTime;
      note?: string;
      from: string;
    }
  | { type: "set_pantry"; items: string[] }
  | { type: "journal"; note: JournalNote }
  | { type: "easier" }
  | { type: "generate_menu" }
  | { type: "request_focus"; date: string; focus: Focus };

export interface Proposal {
  id: string;
  title: string;
  summary: string;
  actions: CoachAction[];
  status: "pending" | "applied" | "dismissed";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
  proposal?: Proposal;
  link?: { href: string; label: string };
  undoable?: boolean;
}

export interface Targets {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface Snapshot {
  profile: Profile;
  workouts: Workout[];
  meals: Meal[];
  measurements: Measurement[];
  mealPlan: MealPlan | null;
  notifications: AppNotification[];
  sessions: Session[];
}
