"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exerciseById } from "@/lib/exercises";
import { formatLong } from "@/lib/dates";
import { DISCLAIMER } from "@/lib/labels";
import { useApp } from "@/lib/store";

export default function WorkoutDetailPage() {
  const params = useParams<{ id: string }>();
  const workout = useApp((state) => state.workouts.find((item) => item.id === params.id));
  const start = useApp((state) => state.startSession);
  const [open, setOpen] = useState<string | null>(null);

  if (!workout) return <p className="text-muted">Тренировка не найдена.</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm text-muted">{formatLong(workout.date)} · {workout.time}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{workout.name}</h1>
      <p className="mt-3 text-muted">{workout.durationMin} мин · {workout.goal} · {workout.difficulty}</p>
      {workout.adjustment ? <p className="mt-4 rounded-2xl bg-sand px-4 py-3 text-sm leading-6">{workout.adjustment}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted">
        <span>{workout.volumeLabel}</span>
        <span>Отдых между подходами указан у упражнения</span>
      </div>
      {workout.status === "planned" ? (
        <Link href={`/workouts/${workout.id}/session`} onClick={() => start(workout.id)} className="mt-6 inline-flex">
          <Button>Начать тренировку</Button>
        </Link>
      ) : (
        <Link href={`/workouts/${workout.id}/summary`} className="mt-6 inline-flex">
          <Button variant="ghost">Открыть итог</Button>
        </Link>
      )}
      <section className="mt-10">
        <h2 className="text-sm text-muted">Разминка</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          {workout.warmup.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="mt-8 space-y-3">
        {workout.exercises.map((item, index) => {
          const exercise = exerciseById(item.exerciseId);
          const opened = open === item.id;
          return (
            <article key={item.id} className="rounded-2xl border border-line bg-surface">
              <button type="button" className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left" onClick={() => setOpen(opened ? null : item.id)}>
                <div>
                  <p className="text-sm text-muted">0{index + 1}</p>
                  <h3 className="mt-1 text-lg font-medium">{exercise?.name}</h3>
                  <p className="mt-1 text-sm text-muted">{item.sets} подхода · {item.reps} · {item.load} · отдых {item.restSec} сек</p>
                </div>
              </button>
              {opened && exercise ? (
                <div className="space-y-4 border-t border-line px-4 py-4 text-sm leading-6">
                  <div className="rounded-xl bg-sand p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Техника</p>
                    <ol className="mt-3 space-y-2">
                      {exercise.steps.map((step, stepIndex) => <li key={step}>{stepIndex + 1}. {step}</li>)}
                    </ol>
                  </div>
                  <Block title="Подсказки" items={exercise.cues} />
                  <Block title="Частые ошибки" items={exercise.mistakes} />
                  <p><span className="text-muted">Проще: </span>{exercise.easier}</p>
                  <p><span className="text-muted">Сложнее: </span>{exercise.harder}</p>
                  <p><span className="text-muted">Замены: </span>{exercise.alternatives.map((id) => exerciseById(id)?.name).filter(Boolean).join(", ")}</p>
                  <p className="text-muted">{exercise.note}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
      <section className="mt-8">
        <h2 className="text-sm text-muted">Заминка</h2>
        <ul className="mt-3 space-y-2 text-sm">{workout.cooldown.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <p className="mt-8 text-xs leading-5 text-muted">{DISCLAIMER}</p>
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-muted">{title}</p>
      <ul className="mt-1">{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
