"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { exerciseById } from "@/lib/exercises";
import { MARK_LABEL } from "@/lib/labels";
import { useApp } from "@/lib/store";
import type { SetMark } from "@/lib/types";

const MARKS: SetMark[] = ["done", "skipped", "easy", "ok", "hard", "pain"];

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const workout = useApp((state) => state.workouts.find((item) => item.id === params.id));
  const session = useApp((state) => state.activeSession);
  const start = useApp((state) => state.startSession);
  const mark = useApp((state) => state.markSet);
  const skipRest = useApp((state) => state.skipRest);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (workout && (!session || session.workoutId !== workout.id)) start(workout.id);
  }, [workout, session, start]);

  useEffect(() => {
    if (!session?.restUntil) return;
    const timer = setInterval(() => setTick((value) => value + 1), 250);
    return () => clearInterval(timer);
  }, [session?.restUntil]);

  useEffect(() => {
    if (session?.restUntil && Date.now() >= session.restUntil) skipRest();
  }, [session?.restUntil, skipRest, tick]);

  if (!workout || !session || session.workoutId !== workout.id) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted">Собираю тренировку…</div>;
  }

  if (session.completed) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="pop max-w-md text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-2xl text-white">✓</div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">Сессия закрыта</h1>
          <p className="mt-3 text-muted">Осталось коротко отметить, как вы себя чувствуете.</p>
          <Link href={`/workouts/${workout.id}/summary`} className="mt-8 inline-flex">
            <Button>Перейти к отзыву</Button>
          </Link>
        </div>
      </div>
    );
  }

  const exercisePlan = workout.exercises[session.exerciseIndex];
  const exercise = exerciseById(exercisePlan.exerciseId);
  const restLeft = session.restUntil ? Math.max(0, Math.ceil((session.restUntil - Date.now()) / 1000)) : 0;
  const resting = restLeft > 0;
  const doneSets = workout.exercises.slice(0, session.exerciseIndex).reduce((sum, item) => sum + item.sets, 0) + session.setIndex;
  const totalSets = workout.exercises.reduce((sum, item) => sum + item.sets, 0);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <Link href={`/workouts/${workout.id}`}>Выйти</Link>
        <span>{session.exerciseIndex + 1} / {workout.exercises.length}</span>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-sand">
        <div className="h-full bg-accent transition-all" style={{ width: `${Math.round((doneSets / totalSets) * 100)}%` }} />
      </div>
      {resting ? (
        <div className="grid flex-1 place-items-center text-center">
          <div>
            <p className="text-sm text-muted">Отдых</p>
            <p className="mt-3 text-7xl font-semibold tabular-nums tracking-tight">{restLeft}</p>
            <Button className="mt-8" variant="ghost" onClick={skipRest}>Дальше</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-sm text-muted">{exercise?.muscle}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{exercise?.name}</h1>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <Stat label="Подход" value={`${session.setIndex + 1}/${exercisePlan.sets}`} />
            <Stat label="Повторы" value={exercisePlan.reps} />
            <Stat label="Вес" value={exercisePlan.load} />
          </div>
          <div className="mt-8 grid gap-2">
            {MARKS.map((item) => (
              <Button key={item} variant={item === "pain" ? "secondary" : "ghost"} onClick={() => mark(item)}>
                {MARK_LABEL[item]}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-sand px-3 py-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold leading-tight">{value}</p>
    </div>
  );
}
