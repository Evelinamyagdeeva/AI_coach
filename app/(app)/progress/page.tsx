"use client";

import Link from "next/link";
import { useState } from "react";
import { MeasurementCard } from "@/components/cards/cards";
import { Bars, WeightChart } from "@/components/charts/bars";
import { Button } from "@/components/ui/button";
import { Chip, EmptyState, Metric, PageHeader } from "@/components/ui/primitives";
import { formatShort } from "@/lib/dates";
import { monthSeries, nutritionSeries, progressSummary, weekSeries, weightSeries } from "@/lib/stats";
import { useApp } from "@/lib/store";

export default function ProgressPage() {
  const profile = useApp((state) => state.profile);
  const workouts = useApp((state) => state.workouts);
  const sessions = useApp((state) => state.sessions);
  const meals = useApp((state) => state.meals);
  const measurements = useApp((state) => state.measurements);
  const [range, setRange] = useState<"week" | "month">("week");
  const summary = progressSummary(workouts, sessions, meals, profile.weightKg);
  const activity = range === "week" ? weekSeries(workouts, sessions) : monthSeries(workouts, sessions);
  const nutrition = nutritionSeries(meals);
  const weights = weightSeries(measurements);
  const delta = weights.length > 1 ? Math.round((weights[weights.length - 1].value - weights[0].value) * 10) / 10 : 0;

  return (
    <div>
      <PageHeader eyebrow="Прогресс" title="Динамика" text="Тренировки, еда и измерения собираются из того, что вы уже сделали." action={<Link href="/progress/measurements"><Button variant="ghost">Измерения</Button></Link>} />
      {summary.workouts === 0 ? (
        <EmptyState title="Прогресс начинается здесь" text="Завершите первую тренировку, и здесь появится история." action={<Link href="/workouts"><Button>К тренировкам</Button></Link>} />
      ) : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <section className="rounded-2xl border border-line bg-surface p-5"><Metric label="Тренировки" value={String(summary.workouts)} hint={`${summary.skipped} пропущено`} /></section>
        <section className="rounded-2xl border border-line bg-surface p-5"><Metric label="Часы" value={String(summary.hours)} hint={`${summary.minutes} минут`} /></section>
        <section className="rounded-2xl border border-line bg-surface p-5"><Metric label="Регулярность" value={`${summary.regularity}%`} hint="за 28 дней" /></section>
        <section className="rounded-2xl border border-line bg-surface p-5"><Metric label="Разнообразие" value={String(summary.variety)} hint="типов сессий" /></section>
      </div>
      <section className="mt-4 rounded-2xl border border-line bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Активность</h2>
          <div className="flex gap-2">
            <Chip active={range === "week"} onClick={() => setRange("week")}>Неделя</Chip>
            <Chip active={range === "month"} onClick={() => setRange("month")}>Месяц</Chip>
          </div>
        </div>
        <Bars data={activity} />
      </section>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Питание</h2>
          <p className="mt-1 text-sm text-muted">Калории в дни, где есть записи.</p>
          <div className="mt-4">
            <Bars data={nutrition.map((item) => ({ label: item.label, minutes: item.kcal }))} />
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-surface p-5">
          <MeasurementCard label="Вес" value={`${profile.weightKg.toString().replace(".", ",")} кг`} delta={weights.length > 1 ? `${delta > 0 ? "+" : ""}${delta.toString().replace(".", ",")} кг за период` : "Мало точек для динамики"} />
          <WeightChart data={weights} />
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {weights.slice(-4).reverse().map((item) => <li key={item.date}>{formatShort(item.date)} · {item.value} кг</li>)}
          </ul>
        </section>
      </div>
      <div className="mt-4">
        <Link href="/progress/photos" className="text-sm text-accent">Личный фотоархив</Link>
      </div>
    </div>
  );
}
