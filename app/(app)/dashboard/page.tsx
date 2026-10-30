"use client";

import Link from "next/link";
import { QuickActions } from "@/components/ai/composer";
import { AiCard, WorkoutCard } from "@/components/cards/cards";
import { Bars } from "@/components/charts/bars";
import { Card, Metric } from "@/components/ui/primitives";
import { Ring, MacroLine } from "@/components/ui/ring";
import { Button } from "@/components/ui/button";
import { formatLong, greeting, todayISO, WEEKDAYS_FULL, weekdayMon0 } from "@/lib/dates";
import { useApp } from "@/lib/store";
import { todayTotals, weekSeries } from "@/lib/stats";
import { targetsFor } from "@/lib/nutrition";

export default function DashboardPage() {
  const profile = useApp((state) => state.profile);
  const workouts = useApp((state) => state.workouts);
  const meals = useApp((state) => state.meals);
  const sessions = useApp((state) => state.sessions);
  const startSession = useApp((state) => state.startSession);
  const today = todayISO();
  const todayWorkout = workouts.find((item) => item.date === today && item.status !== "skipped");
  const next = workouts.find((item) => item.date >= today && item.status === "planned");
  const focus = todayWorkout?.status === "planned" ? todayWorkout : next;
  const totals = todayTotals(meals, today);
  const targets = targetsFor(profile);
  const week = weekSeries(workouts, sessions, today);
  const minutes = week.reduce((sum, day) => sum + day.minutes, 0);
  const recovery = !todayWorkout || todayWorkout.status === "done";

  return (
    <div className="rise space-y-8">
      <header>
        <h1 className="text-4xl font-semibold tracking-tight">
          {greeting()}, {profile.name}
        </h1>
        <p className="mt-2 text-muted">Ваш план на сегодня</p>
      </header>
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="flex flex-col justify-between bg-surface">
          <div>
            <p className="text-sm text-muted">Фокус дня</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">{focus ? focus.name : "Восстановление"}</h2>
            <p className="mt-3 text-muted">
              {focus ? `${focus.durationMin} мин · ${focus.date === today ? "сегодня" : formatLong(focus.date)} · ${focus.time}` : "Сегодня без тренировки. Это тоже часть плана."}
            </p>
            {focus?.adjustment ? <p className="mt-3 max-w-md text-sm leading-6">{focus.adjustment}</p> : null}
          </div>
          {focus && focus.status === "planned" ? (
            <div className="mt-8">
              <Link href={`/workouts/${focus.id}/session`} onClick={() => startSession(focus.id)}>
                <Button>Начать тренировку</Button>
              </Link>
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">{WEEKDAYS_FULL[weekdayMon0(today)]} · {recovery ? "день можно оставить тихим" : "сессия уже закрыта"}</p>
          )}
        </Card>
        <AiCard text="Как ты себя чувствуешь сегодня?" />
      </section>
      <QuickActions />
      <section>
        <h2 className="mb-4 text-sm text-muted">Сегодня</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="xl:col-span-2">
            <Ring value={targets.kcal ? (totals.kcal / targets.kcal) * 100 : 0} label={`${totals.kcal}`} sub={`из ${targets.kcal} ккал`} />
          </Card>
          <Card>
            <Metric label="Белок" value={`${Math.round(totals.protein)} г`} hint={`из ${targets.protein} г`} />
            <div className="mt-4">
              <MacroLine label="Белок" value={totals.protein} total={targets.protein} />
            </div>
          </Card>
          <Card>
            <Metric label="Активность" value={`${minutes}`} hint="минут за неделю" />
          </Card>
          <Card>
            <Metric label="Восстановление" value={recovery ? "Тихо" : "Нагрузка"} hint={profile.restrictions[0]?.text || "Ограничений нет"} />
          </Card>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Неделя</h2>
            <p className="text-sm text-muted">{minutes} мин</p>
          </div>
          <Bars data={week} />
        </Card>
        {focus ? <WorkoutCard workout={focus} href={focus.status === "done" ? `/workouts/${focus.id}/summary` : `/workouts/${focus.id}`} /> : <Card><p className="text-muted">Ближайшая тренировка появится в плане.</p></Card>}
      </section>
    </div>
  );
}
