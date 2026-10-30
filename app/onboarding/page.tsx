"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/primitives";
import { WEEKDAYS_FULL, WEEKDAYS_SHORT } from "@/lib/dates";
import { DISCLAIMER, ACTIVITIES, DIETS, DURATIONS, EQUIPMENT, GOALS, LEVELS, TIMES, WORKOUT_TYPES } from "@/lib/labels";
import { targetsFor } from "@/lib/nutrition";
import { useApp } from "@/lib/store";
import type { Activity, DayTime, Goal, Level, Profile, Sex } from "@/lib/types";

type StepId =
  | "goal"
  | "level"
  | "activity"
  | "types"
  | "days"
  | "schedule"
  | "duration"
  | "time"
  | "equipment"
  | "sex"
  | "age"
  | "height"
  | "weight"
  | "diet"
  | "allergies"
  | "dislikes"
  | "pantry"
  | "limits"
  | "recovery"
  | "wishes"
  | "review";

const ORDER: StepId[] = [
  "goal",
  "level",
  "activity",
  "types",
  "days",
  "schedule",
  "duration",
  "time",
  "equipment",
  "sex",
  "age",
  "height",
  "weight",
  "diet",
  "allergies",
  "dislikes",
  "pantry",
  "limits",
  "recovery",
  "wishes",
  "review",
];

export default function OnboardingPage() {
  const router = useRouter();
  const hydrated = useApp((state) => state.hydrated);
  const current = useApp((state) => state.profile);
  const complete = useApp((state) => state.completeOnboarding);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [step, setStep] = useState(0);
  const [text, setText] = useState("");
  const [multi, setMulti] = useState<string[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (current.onboarded) {
      router.replace("/dashboard");
      return;
    }
    setDraft((existing) => existing ?? current);
  }, [hydrated, current, router]);

  const id = ORDER[step];
  const progress = Math.round((step / (ORDER.length - 1)) * 100);

  const prompt = useMemo(() => (draft ? question(id, draft) : ""), [id, draft]);

  if (!draft) return <div className="grid min-h-screen place-items-center text-sm text-muted">Aera</div>;

  function patch(partial: Partial<Profile>, skipText = false) {
    const next = { ...draft!, ...partial };
    setDraft(next);
    setText("");
    setMulti([]);
    if (!skipText) setStep((value) => Math.min(value + 1, ORDER.length - 1));
  }

  function finish() {
    const equipment = draft!.equipment.includes("bodyweight") ? draft!.equipment : ["bodyweight", ...draft!.equipment];
    complete({ ...draft!, equipment, onboarded: true });
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>Aera</span>
        <span>{progress}%</span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-sand">
        <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-10 flex-1">
        <p className="text-sm text-muted">{draft.name}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">{prompt}</h1>
        <div className="mt-8">
          {id === "goal" ? (
            <Choice options={GOALS.map((item) => ({ id: item.id, label: item.label }))} onPick={(value) => patch({ goal: value as Goal })} />
          ) : null}
          {id === "level" ? <Choice options={LEVELS} onPick={(value) => patch({ level: value as Level })} /> : null}
          {id === "activity" ? <Choice options={ACTIVITIES} onPick={(value) => patch({ activity: value as Activity })} /> : null}
          {id === "types" ? (
            <Multi
              options={WORKOUT_TYPES.map((item) => ({ id: item, label: item }))}
              selected={multi.length ? multi : draft.preferredWorkouts}
              onToggle={(value) => setMulti((items) => (items.includes(value) ? items.filter((item) => item !== value) : [...items, value]))}
              onNext={() => patch({ preferredWorkouts: multi.length ? multi : draft.preferredWorkouts })}
            />
          ) : null}
          {id === "days" ? (
            <Multi
              options={WEEKDAYS_SHORT.map((label, index) => ({ id: String(index), label }))}
              selected={(multi.length ? multi : draft.availableDays.map(String))}
              onToggle={(value) => setMulti((items) => (items.includes(value) ? items.filter((item) => item !== value) : [...items, value]))}
              onNext={() => {
                const days = (multi.length ? multi : draft.availableDays.map(String)).map(Number);
                patch({ availableDays: days.sort((a, b) => a - b), daysPerWeek: days.length || 3 });
              }}
            />
          ) : null}
          {id === "time" ? <Choice options={TIMES} onPick={(value) => patch({ preferredTime: value as DayTime })} /> : null}
          {id === "duration" ? (
            <Choice options={DURATIONS.map((item) => ({ id: String(item), label: `${item} мин` }))} onPick={(value) => patch({ durationMin: Number(value) })} />
          ) : null}
          {id === "equipment" ? (
            <Multi
              options={EQUIPMENT}
              selected={multi.length ? multi : draft.equipment}
              onToggle={(value) => setMulti((items) => (items.includes(value) ? items.filter((item) => item !== value) : [...items, value]))}
              onNext={() => patch({ equipment: multi.length ? multi : draft.equipment })}
            />
          ) : null}
          {id === "sex" ? (
            <Choice
              options={[
                { id: "female", label: "Женский" },
                { id: "male", label: "Мужской" },
              ]}
              onPick={(value) => patch({ sex: value as Sex })}
            />
          ) : null}
          {id === "diet" ? <Choice options={DIETS.map((item) => ({ id: item, label: item }))} onPick={(value) => patch({ dietStyle: value })} /> : null}
          {id === "age" || id === "height" || id === "weight" ? (
            <NumberStep
              value={text}
              placeholder={id === "age" ? "30" : id === "height" ? "168" : "64"}
              onChange={setText}
              onNext={() => {
                const value = Number(text.replace(",", "."));
                if (!value) return;
                if (id === "age") patch({ age: value });
                if (id === "height") patch({ heightCm: value });
                if (id === "weight") patch({ weightKg: value });
              }}
            />
          ) : null}
          {id === "schedule" || id === "allergies" || id === "dislikes" || id === "pantry" || id === "limits" || id === "recovery" || id === "wishes" ? (
            <TextStep
              value={text}
              onChange={setText}
              placeholder={placeholder(id)}
              onSkip={() => patch({})}
              onNext={() => {
                const value = text.trim();
                if (id === "schedule") patch({ scheduleNote: value });
                if (id === "allergies") patch({ allergies: splitList(value) });
                if (id === "dislikes") patch({ dislikes: splitList(value) });
                if (id === "pantry") patch({ pantry: splitList(value) });
                if (id === "limits") {
                  patch({
                    restrictions: value && !/^нет\b/.test(value.toLowerCase())
                      ? [{ id: `lim_${Date.now()}`, text: value, kind: /врач|запрет/.test(value.toLowerCase()) ? "doctor" : "pain", createdAt: new Date().toISOString() }]
                      : draft.restrictions,
                  });
                }
                if (id === "recovery") patch({ recoveryNotes: value });
                if (id === "wishes") patch({ wishes: value });
              }}
            />
          ) : null}
          {id === "review" ? <Review draft={draft} onFinish={finish} /> : null}
        </div>
      </div>
      <p className="mt-8 text-xs leading-5 text-muted">{DISCLAIMER}</p>
    </div>
  );
}

function question(id: StepId, draft: Profile) {
  const map: Record<StepId, string> = {
    goal: "Какая цель сейчас важнее всего?",
    level: "Как вы чувствуете себя в тренировках?",
    activity: "Сколько движения уже есть в неделе?",
    types: "Какие форматы вам ближе?",
    days: "В какие дни реально тренироваться?",
    schedule: "Есть ли ограничения по времени? Можно пропустить.",
    duration: "Сколько минут обычно есть на тренировку?",
    time: "Когда удобнее заниматься?",
    equipment: "Что есть под рукой?",
    sex: "Это нужно только для оценки калорий.",
    age: "Сколько вам лет?",
    height: "Какой рост в сантиметрах?",
    weight: "Какой вес сейчас, в килограммах?",
    diet: "Как вам ближе питаться?",
    allergies: "Есть аллергии? Если нет, напишите «нет».",
    dislikes: "Какие продукты не любите?",
    pantry: "Что обычно есть дома?",
    limits: "Есть боль, запрет врача или другое ограничение?",
    recovery: "Что важно для восстановления?",
    wishes: "Что ещё стоит помнить?",
    review: `${draft.name}, вот система, которую я собрала.`,
  };
  return map[id];
}

function placeholder(id: StepId) {
  if (id === "schedule") return "По понедельникам пары до 18:00";
  if (id === "allergies") return "нет";
  if (id === "dislikes") return "печень, грибы";
  if (id === "pantry") return "яйца, курица, рис, овощи";
  if (id === "limits") return "Врач запретил бегать";
  if (id === "recovery") return "Плохо сплю, если тренировка слишком поздняя";
  return "Хочу спокойный прогресс без гонки";
}

function splitList(value: string) {
  if (!value || /^нет\b/i.test(value)) return [];
  return value.split(/,| и /).map((item) => item.trim()).filter(Boolean);
}

function Choice({ options, onPick }: { options: { id: string; label: string }[]; onPick: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Chip key={option.id} onClick={() => onPick(option.id)}>
          {option.label}
        </Chip>
      ))}
    </div>
  );
}

function Multi({
  options,
  selected,
  onToggle,
  onNext,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip key={option.id} active={selected.includes(option.id)} onClick={() => onToggle(option.id)}>
            {option.label}
          </Chip>
        ))}
      </div>
      <Button className="mt-6" onClick={onNext} disabled={!selected.length}>
        Дальше
      </Button>
    </div>
  );
}

function NumberStep({ value, onChange, onNext, placeholder }: { value: string; onChange: (value: string) => void; onNext: () => void; placeholder: string }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onNext();
      }}
    >
      <input
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full rounded-xl border border-line bg-surface px-4 text-2xl outline-none focus:border-accent"
      />
      <Button className="mt-4" type="submit">
        Дальше
      </Button>
    </form>
  );
}

function TextStep({
  value,
  onChange,
  onNext,
  onSkip,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  placeholder: string;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onNext();
      }}
    >
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
      />
      <div className="mt-4 flex gap-2">
        <Button type="submit">Дальше</Button>
        <Button variant="quiet" onClick={onSkip}>
          Пропустить
        </Button>
      </div>
    </form>
  );
}

function Review({ draft, onFinish }: { draft: Profile; onFinish: () => void }) {
  const targets = targetsFor(draft);
  const days = draft.availableDays.map((day) => WEEKDAYS_FULL[day]).join(", ");
  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm text-muted">Цели</p>
        <p className="mt-2 text-lg">{GOALS.find((item) => item.id === draft.goal)?.label}</p>
      </article>
      <article className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm text-muted">Тренировки</p>
        <p className="mt-2">{draft.daysPerWeek} дн. в неделю · {draft.durationMin} мин · {days}</p>
      </article>
      <article className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm text-muted">Питание, оценка</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{targets.kcal} ккал</p>
        <p className="mt-1 text-sm text-muted">Белки {targets.protein} г · жиры {targets.fat} г · углеводы {targets.carbs} г</p>
      </article>
      <article className="rounded-2xl bg-sand p-5">
        <p className="text-sm text-muted">Восстановление</p>
        <p className="mt-2 text-sm leading-6">{draft.restrictions[0]?.text || draft.recoveryNotes || "Ограничений пока нет. Если они появятся, напишите об этом тренеру."}</p>
      </article>
      <Button onClick={onFinish}>Открыть мой план</Button>
    </div>
  );
}
