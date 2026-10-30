"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WorkoutCard } from "@/components/cards/cards";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { EXERCISES } from "@/lib/exercises";
import { formatLong, todayISO } from "@/lib/dates";
import { useApp } from "@/lib/store";

export default function WorkoutsPage() {
  const workouts = useApp((state) => state.workouts);
  const [query, setQuery] = useState("");
  const today = todayISO();
  const upcoming = workouts.filter((item) => item.date >= today).slice(0, 6);
  const history = workouts.filter((item) => item.status !== "planned").slice(-4).reverse();
  const library = useMemo(
    () => EXERCISES.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div>
      <PageHeader eyebrow="Тренировки" title="Ваш план" text="Каждая сессия собрана из цели, оборудования, времени и ограничений." />
      {upcoming.length === 0 ? (
        <EmptyState title="Тренировок пока нет" text="Персональный план появится здесь после короткого разговора." action={<Link href="/onboarding"><Button>Собрать план</Button></Link>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.map((workout) => (
            <div key={workout.id}>
              <p className="mb-2 text-sm text-muted">{formatLong(workout.date)}</p>
              <WorkoutCard workout={workout} href={`/workouts/${workout.id}`} />
            </div>
          ))}
        </div>
      )}
      {history.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">История</h2>
          <div className="grid gap-3">
            {history.map((workout) => (
              <Link key={workout.id} href={`/workouts/${workout.id}/summary`} className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3">
                <span>{workout.name}</span>
                <span className="text-sm text-muted">{formatLong(workout.date)} · {workout.status === "done" ? "выполнена" : "пропущена"}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">Библиотека</h2>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти упражнение" className="h-11 rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-accent" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {library.map((exercise) => (
            <article key={exercise.id} className="rounded-2xl border border-line bg-surface p-4">
              <p className="text-sm text-muted">{exercise.muscle}</p>
              <h3 className="mt-1 font-medium">{exercise.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{exercise.steps[0]}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
