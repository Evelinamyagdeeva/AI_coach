"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { applyActions, snapshotOf } from "./apply";
import { normalize } from "./body";
import { todayISO, timeNow } from "./dates";
import { demoSnapshot, emptySnapshot, planForNewProfile, blankProfile } from "./demo";
import { uid } from "./id";
import { interpret, type IntentResult } from "./intents";
import { replaceFuture } from "./plan";
import { clearPhotos } from "./photos";
import type {
  ActiveSession,
  ChatMessage,
  Feedback,
  FoodItem,
  Meal,
  Measurement,
  MetricKind,
  Profile,
  Session,
  SetMark,
  Snapshot,
} from "./types";

interface AppStore extends Snapshot {
  hydrated: boolean;
  messages: ChatMessage[];
  activeSession: ActiveSession | null;
  lastUndo: Snapshot | null;
  metricEnabled: Record<MetricKind, boolean>;
  photosEnabled: boolean;
  remindersOn: boolean;
  draft: string;
  setHydrated: () => void;
  setDraft: (draft: string) => void;
  startFresh: (name: string, email: string) => void;
  loadDemo: () => void;
  completeOnboarding: (profile: Profile) => void;
  submitUtterance: (text: string) => void;
  confirmProposal: (messageId: string) => void;
  dismissProposal: (messageId: string) => void;
  undo: () => void;
  startSession: (workoutId: string) => void;
  markSet: (mark: SetMark) => void;
  skipRest: () => void;
  saveFeedback: (workoutId: string, feedback: Feedback) => void;
  addMeal: (meal: Meal) => void;
  removeMeal: (id: string) => void;
  addMeasurement: (measurement: Omit<Measurement, "id">) => void;
  removeMeasurement: (id: string) => void;
  setMetricEnabled: (kind: MetricKind, enabled: boolean) => void;
  clearMeasurements: (kind?: MetricKind) => void;
  setPhotosEnabled: (enabled: boolean) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  rateFood: (name: string, liked: boolean) => void;
  markAllRead: () => void;
  setReminders: (enabled: boolean) => void;
  generateMenu: () => void;
  erase: (scope: "workouts" | "meals" | "measurements" | "chat" | "photos" | "all") => void;
}

const metricsOn = (): Record<MetricKind, boolean> => ({
  weight: true,
  waist: true,
  chest: true,
  hips: true,
  arms: true,
  custom: true,
});

const empty = emptySnapshot(blankProfile(""));

export const useApp = create<AppStore>()(
  persist(
    (set, get) => ({
      ...empty,
      hydrated: false,
      messages: [],
      activeSession: null,
      lastUndo: null,
      metricEnabled: metricsOn(),
      photosEnabled: true,
      remindersOn: true,
      draft: "",
      setHydrated: () => set({ hydrated: true }),
      setDraft: (draft) => set({ draft }),
      startFresh: (name, email) => {
        const profile = blankProfile(name, email);
        set({
          ...emptySnapshot(profile),
          messages: [],
          activeSession: null,
          lastUndo: null,
          metricEnabled: metricsOn(),
          photosEnabled: true,
          remindersOn: true,
          draft: "",
          hydrated: true,
        });
      },
      loadDemo: () => {
        const demo = demoSnapshot();
        set({
          ...demo,
          messages: [
            {
              id: uid("c"),
              role: "assistant",
              text: "Я рядом. Можно написать, как прошла тренировка, что вы съели или что изменилось в графике.",
              createdAt: new Date().toISOString(),
            },
          ],
          activeSession: null,
          lastUndo: null,
          hydrated: true,
        });
      },
      completeOnboarding: (profile) => {
        const next = planForNewProfile(profile);
        set({
          ...next,
          messages: [
            {
              id: uid("c"),
              role: "assistant",
              text: "План собран из ваших ответов. Его можно поменять обычной фразой: короче тренировка, другой день, другая еда.",
              createdAt: new Date().toISOString(),
            },
          ],
          activeSession: null,
          lastUndo: null,
        });
      },
      submitUtterance: (text) => {
        const state = get();
        if (!state.profile?.onboarded) return;
        const trimmed = text.trim();
        if (!trimmed) return;
        const result = interpret(trimmed, snapshotOf(pickSnapshot(state)));
        const mealOnly = Boolean(result.actions?.length) && result.actions!.every((action) => action.type === "log_meal") && !result.proposal;
        const foodish = /(съел|съела|поел|поела|завтракал|завтракала|обедал|обедала|ужинал|ужинала)/.test(normalize(trimmed));
        const generic = !result.actions?.length && !result.proposal && result.link?.href === "/coach";
        const user: ChatMessage = { id: uid("c"), role: "user", text: trimmed, createdAt: new Date().toISOString() };
        if ((mealOnly || foodish) && !result.proposal) {
          const pendingId = uid("c");
          set({
            messages: [...state.messages, user, { id: pendingId, role: "assistant", text: "Смотрю…", createdAt: new Date().toISOString() }],
            draft: "",
          });
          void completeMeal(trimmed, pendingId, result);
          return;
        }
        if (generic) {
          const pendingId = uid("c");
          set({
            messages: [...state.messages, user, { id: pendingId, role: "assistant", text: "Смотрю…", createdAt: new Date().toISOString() }],
            draft: "",
          });
          void completeChat(trimmed, pendingId);
          return;
        }
        let next = pickSnapshot(state);
        let undo = state.lastUndo;
        if (result.actions?.length) {
          if (result.undoable) undo = snapshotOf(next);
          next = applyActions(next, result.actions);
        }
        const assistant: ChatMessage = {
          id: uid("c"),
          role: "assistant",
          text: result.reply,
          createdAt: new Date().toISOString(),
          link: result.link,
          undoable: Boolean(result.undoable && result.actions?.length),
          proposal: result.proposal
            ? { id: uid("p"), title: result.proposal.title, summary: result.proposal.summary, actions: result.proposal.actions, status: "pending" }
            : undefined,
        };
        set({ ...next, messages: [...state.messages, user, assistant], lastUndo: undo, draft: "" });
      },
      confirmProposal: (messageId) => {
        const state = get();
        const message = state.messages.find((item) => item.id === messageId);
        if (!message?.proposal || message.proposal.status !== "pending") return;
        const undo = snapshotOf(pickSnapshot(state));
        const next = applyActions(pickSnapshot(state), message.proposal.actions);
        set({
          ...next,
          lastUndo: undo,
          messages: state.messages.map((item) =>
            item.id === messageId && item.proposal ? { ...item, proposal: { ...item.proposal, status: "applied" }, undoable: true } : item,
          ),
        });
      },
      dismissProposal: (messageId) => {
        set({
          messages: get().messages.map((item) =>
            item.id === messageId && item.proposal ? { ...item, proposal: { ...item.proposal, status: "dismissed" } } : item,
          ),
        });
      },
      undo: () => {
        const undo = get().lastUndo;
        if (!undo) return;
        set({ ...undo, lastUndo: null, messages: [...get().messages, { id: uid("c"), role: "assistant", text: "Отменила последнее изменение.", createdAt: new Date().toISOString() }] });
      },
      startSession: (workoutId) => {
        set({
          activeSession: { workoutId, exerciseIndex: 0, setIndex: 0, logs: [], startedAt: new Date().toISOString() },
        });
      },
      markSet: (mark) => {
        const session = get().activeSession;
        const workout = get().workouts.find((item) => item.id === session?.workoutId);
        if (!session || !workout) return;
        const exercise = workout.exercises[session.exerciseIndex];
        if (!exercise) return;
        const logs = [...session.logs, { plannedId: exercise.id, setIndex: session.setIndex, mark }];
        const painNote = mark === "pain" ? "Во время подхода отмечена боль." : session.painNote;
        const restUntil = mark === "skipped" || mark === "pain" ? undefined : Date.now() + exercise.restSec * 1000;
        if (session.setIndex + 1 < exercise.sets) {
          set({ activeSession: { ...session, logs, setIndex: session.setIndex + 1, restUntil, painNote } });
          return;
        }
        if (session.exerciseIndex + 1 < workout.exercises.length) {
          set({
            activeSession: {
              ...session,
              logs,
              exerciseIndex: session.exerciseIndex + 1,
              setIndex: 0,
              restUntil,
              painNote,
            },
          });
          return;
        }
        set({ activeSession: { ...session, logs, restUntil: undefined, completed: true, painNote } });
      },
      skipRest: () => {
        const session = get().activeSession;
        if (!session) return;
        set({ activeSession: { ...session, restUntil: undefined } });
      },
      saveFeedback: (workoutId, feedback) => {
        const state = get();
        const active = state.activeSession?.workoutId === workoutId ? state.activeSession : null;
        const started = active?.startedAt ? new Date(active.startedAt).getTime() : Date.now();
        const durationMin = Math.max(1, Math.round((Date.now() - started) / 60000));
        const session: Session = {
          id: uid("ses"),
          workoutId,
          startedAt: active?.startedAt || new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          durationMin,
          logs: active?.logs || [],
          feedback,
        };
        let profile = state.profile;
        if (feedback.difficulty === "hard") profile = { ...profile, adaptation: { easier: true } };
        if (feedback.pain.trim()) {
          profile = {
            ...profile,
            restrictions: [
              {
                id: uid("lim"),
                text: feedback.pain.trim(),
                kind: "pain",
                area: /спин|поясниц/.test(feedback.pain.toLowerCase()) ? "back" : /колен/.test(feedback.pain.toLowerCase()) ? "knee" : /плеч/.test(feedback.pain.toLowerCase()) ? "shoulder" : undefined,
                createdAt: new Date().toISOString(),
              },
              ...profile.restrictions,
            ],
            journal: [{ id: uid("j"), date: new Date().toISOString().slice(0, 10), text: feedback.pain.trim() }, ...profile.journal],
          };
        }
        const workouts = state.workouts.map((workout) => (workout.id === workoutId ? { ...workout, status: "done" as const } : workout));
        const future = replaceFuture(profile, workouts);
        set({
          profile,
          workouts: future,
          sessions: [session, ...state.sessions],
          activeSession: null,
          notifications: [
            {
              id: uid("n"),
              title: "Тренировка сохранена",
              body: feedback.difficulty === "hard" || feedback.pain ? "Следующие сессии станут мягче." : "Отзыв учтён.",
              href: "/progress",
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        });
      },
      addMeal: (meal) => {
        const undo = snapshotOf(pickSnapshot(get()));
        set({ meals: [meal, ...get().meals], lastUndo: undo });
      },
      removeMeal: (id) => set({ meals: get().meals.filter((meal) => meal.id !== id) }),
      addMeasurement: (measurement) => {
        if (!get().metricEnabled[measurement.kind]) return;
        const next = { ...measurement, id: uid("m") };
        const profile = measurement.kind === "weight" ? { ...get().profile, weightKg: measurement.value } : get().profile;
        set({ measurements: [next, ...get().measurements], profile });
      },
      removeMeasurement: (id) => set({ measurements: get().measurements.filter((item) => item.id !== id) }),
      setMetricEnabled: (kind, enabled) => set({ metricEnabled: { ...get().metricEnabled, [kind]: enabled } }),
      clearMeasurements: (kind) => set({ measurements: kind ? get().measurements.filter((item) => item.kind !== kind) : [] }),
      setPhotosEnabled: (enabled) => set({ photosEnabled: enabled }),
      updateProfile: (patch) => set({ profile: { ...get().profile, ...patch } }),
      rateFood: (name, liked) => {
        const profile = get().profile;
        const likes = (profile.likes || []).filter((item) => item !== name);
        const dislikes = profile.dislikes.filter((item) => item !== name);
        set({
          profile: {
            ...profile,
            likes: liked ? [...likes, name] : likes,
            dislikes: liked ? dislikes : [...dislikes, name],
          },
        });
      },
      markAllRead: () => set({ notifications: get().notifications.map((item) => ({ ...item, read: true })) }),
      setReminders: (enabled) => set({ remindersOn: enabled }),
      generateMenu: () => {
        const next = applyActions(pickSnapshot(get()), [{ type: "generate_menu" }]);
        set(next);
      },
      erase: (scope) => {
        const state = get();
        if (scope === "all") {
          set({
            ...emptySnapshot(blankProfile("")),
            profile: { ...blankProfile(""), onboarded: false },
            messages: [],
            activeSession: null,
            lastUndo: null,
          });
          void clearPhotos();
          return;
        }
        if (scope === "workouts") set({ workouts: state.workouts.filter((item) => item.status === "planned"), sessions: [] });
        if (scope === "meals") set({ meals: [] });
        if (scope === "measurements") set({ measurements: [] });
        if (scope === "chat") set({ messages: [] });
        if (scope === "photos") void clearPhotos();
      },
    }),
    {
      name: "aera-store-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({
        profile: state.profile,
        workouts: state.workouts,
        meals: state.meals,
        measurements: state.measurements,
        mealPlan: state.mealPlan,
        notifications: state.notifications,
        sessions: state.sessions,
        messages: state.messages,
        activeSession: state.activeSession,
        lastUndo: state.lastUndo,
        metricEnabled: state.metricEnabled,
        photosEnabled: state.photosEnabled,
        remindersOn: state.remindersOn,
      }),
    },
  ),
);

function finishPending(id: string, message: ChatMessage, extra: Partial<Snapshot> & { lastUndo?: Snapshot | null } = {}) {
  const state = useApp.getState();
  useApp.setState({
    ...extra,
    messages: state.messages.map((item) => (item.id === id ? message : item)),
  });
}

async function completeChat(text: string, pendingId: string) {
  const state = useApp.getState();
  const profile = state.profile;
  const today = todayISO();
  const workout = state.workouts.find((item) => item.date === today && item.status === "planned");
  const context = profile
    ? `${profile.name}, ${profile.weightKg} кг, цель ${profile.goal}. Сегодня: ${workout ? `${workout.name}, ${workout.durationMin} мин` : "тренировки нет"}. Ограничения: ${profile.restrictions.map((item) => item.text).join("; ") || "нет"}.`
    : "";
  try {
    const response = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        context,
        history: state.messages.slice(-8, -1).map((item) => ({ role: item.role, text: item.text })),
      }),
    });
    const data = (await response.json()) as { reply?: string; error?: string };
    finishPending(pendingId, {
      id: pendingId,
      role: "assistant",
      text: data.reply || data.error || "Не получилось ответить.",
      createdAt: new Date().toISOString(),
    });
  } catch {
    finishPending(pendingId, {
      id: pendingId,
      role: "assistant",
      text: "Связь с тренером не удалась. Фразу можно повторить.",
      createdAt: new Date().toISOString(),
    });
  }
}

async function completeMeal(text: string, pendingId: string, fallback: IntentResult) {
  try {
    const response = await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = (await response.json()) as { title?: string; note?: string; items?: EstimatedFood[]; error?: string };
    if (!response.ok || !data.items?.length) throw new Error(data.error || "empty");
    const meal: Meal = {
      id: uid("meal"),
      date: todayISO(),
      time: timeNow(),
      title: data.title || "Приём пищи",
      source: "text",
      items: data.items.map(toFoodItem),
      approximate: true,
    };
    const state = useApp.getState();
    const undo = snapshotOf(pickSnapshot(state));
    const next = applyActions(pickSnapshot(state), [{ type: "log_meal", meal }]);
    const totals = meal.items.reduce((sum, item) => sum + item.kcal, 0);
    finishPending(
      pendingId,
      {
        id: pendingId,
        role: "assistant",
        text: `${data.note || "Записала приём пищи."} «${meal.title}», около ${Math.round(totals)} ккал.`,
        createdAt: new Date().toISOString(),
        link: { href: "/nutrition", label: "Открыть питание" },
        undoable: true,
      },
      { ...next, lastUndo: undo },
    );
  } catch {
    const state = useApp.getState();
    let next = pickSnapshot(state);
    let undo = state.lastUndo;
    if (fallback.actions?.length) {
      undo = snapshotOf(next);
      next = applyActions(next, fallback.actions);
    }
    finishPending(
      pendingId,
      {
        id: pendingId,
        role: "assistant",
        text: fallback.reply,
        createdAt: new Date().toISOString(),
        link: fallback.link,
        undoable: Boolean(fallback.undoable && fallback.actions?.length),
      },
      { ...next, lastUndo: undo },
    );
  }
}

function toFoodItem(item: EstimatedFood): FoodItem {
  return {
    id: uid("food"),
    name: item.name,
    grams: item.grams,
    unit: "g",
    kcal: item.kcal,
    protein: item.protein,
    fat: item.fat,
    carbs: item.carbs,
    per100: item.per100,
  };
}

interface EstimatedFood {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  per100: FoodItem["per100"];
}

function pickSnapshot(state: AppStore): Snapshot {
  return {
    profile: state.profile,
    workouts: state.workouts,
    meals: state.meals,
    measurements: state.measurements,
    mealPlan: state.mealPlan,
    notifications: state.notifications,
    sessions: state.sessions,
  };
}

