"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ScheduleCard } from "@/components/cards/cards";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/primitives";
import { addDays, formatLong, mondayOf, parseISODate, todayISO, WEEKDAYS_FULL, WEEKDAYS_SHORT, weekdayMon0 } from "@/lib/dates";
import { timeLabel } from "@/lib/dates";
import { useApp } from "@/lib/store";

export default function PlannerPage() {
  const profile = useApp((state) => state.profile);
  const workouts = useApp((state) => state.workouts);
  const meals = useApp((state) => state.meals);
  const reminders = useApp((state) => state.remindersOn);
  const [cursor, setCursor] = useState(todayISO());
  const [selected, setSelected] = useState(todayISO());
  const month = parseISODate(cursor);
  const grid = useMemo(() => buildMonth(cursor), [cursor]);
  const weekStart = mondayOf(todayISO());
  const week = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const dayWorkouts = workouts.filter((item) => item.date === selected);
  const dayMeals = meals.filter((item) => item.date === selected);
  const weekCount = workouts.filter((item) => item.date >= weekStart && item.date < addDays(weekStart, 7) && item.status !== "skipped").length;

  return (
    <div>
      <PageHeader
        eyebrow="План"
        title={`${profile.daysPerWeek} тренировки в неделю`}
        text={`${profile.availableDays.map((day) => WEEKDAYS_FULL[day]).join(", ")} · ${timeLabel(profile.preferredTime)}. ${profile.scheduleNote}`}
        action={<Link href="/coach"><Button variant="ghost">Изменить фразой</Button></Link>}
      />
      <div className="grid gap-3 md:grid-cols-7">
        {week.map((date) => {
          const workout = workouts.find((item) => item.date === date && item.status !== "skipped");
          return (
            <button key={date} type="button" onClick={() => setSelected(date)} className={`rounded-2xl border px-3 py-3 text-left ${selected === date ? "border-accent bg-surface" : "border-line bg-surface"}`}>
              <p className="text-xs text-muted">{WEEKDAYS_SHORT[weekdayMon0(date)]}</p>
              <p className="mt-2 text-sm font-medium">{workout ? workout.name : "Восстановление"}</p>
              <p className="mt-1 text-xs text-muted">{workout ? `${workout.durationMin} мин` : "без сессии"}</p>
            </button>
          );
        })}
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold capitalize">{month.toLocaleString("ru-RU", { month: "long", year: "numeric" })}</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setCursor(shiftMonth(cursor, -1))}>Назад</Button>
              <Button size="sm" variant="ghost" onClick={() => setCursor(shiftMonth(cursor, 1))}>Дальше</Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
            {WEEKDAYS_SHORT.map((day) => <div key={day}>{day}</div>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {grid.map((date) => {
              const inMonth = date.slice(0, 7) === cursor.slice(0, 7);
              const hasWorkout = workouts.some((item) => item.date === date && item.status === "planned");
              const done = workouts.some((item) => item.date === date && item.status === "done");
              return (
                <button key={date} type="button" onClick={() => setSelected(date)} className={`h-10 rounded-lg text-sm ${selected === date ? "bg-sand" : ""} ${inMonth ? "text-ink" : "text-muted/50"}`}>
                  {Number(date.slice(-2))}
                  <span className={`mx-auto mt-0.5 block h-1 w-1 rounded-full ${done ? "bg-accent" : hasWorkout ? "bg-mist" : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>
        </section>
        <div className="space-y-3">
          <ScheduleCard title={dayWorkouts[0]?.name || "Восстановление"} meta={dayWorkouts[0] ? `${dayWorkouts[0].time} · ${dayWorkouts[0].durationMin} мин` : "День без тренировки"} status={formatLong(selected)} />
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="font-medium">Питание</h3>
            {dayMeals.length === 0 ? <p className="mt-2 text-sm text-muted">Записей за этот день нет.</p> : dayMeals.map((meal) => <p key={meal.id} className="mt-2 text-sm">{meal.time} · {meal.title}</p>)}
          </section>
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="font-medium">Напоминания</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {reminders ? `На этой неделе ${weekCount} сессий. Напоминания живут внутри приложения, без пушей браузера.` : "Напоминания выключены в настройках."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function buildMonth(iso: string) {
  const date = parseISODate(iso);
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
}

function shiftMonth(iso: string, delta: number) {
  const date = parseISODate(iso);
  date.setMonth(date.getMonth() + delta);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}
