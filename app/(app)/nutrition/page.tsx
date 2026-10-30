"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState, Metric, PageHeader } from "@/components/ui/primitives";
import { MacroLine, Ring } from "@/components/ui/ring";
import { formatLong, todayISO } from "@/lib/dates";
import { sumMacros, targetsFor } from "@/lib/nutrition";
import { useApp } from "@/lib/store";

export default function NutritionPage() {
  const profile = useApp((state) => state.profile);
  const meals = useApp((state) => state.meals);
  const remove = useApp((state) => state.removeMeal);
  const today = todayISO();
  const day = meals.filter((meal) => meal.date === today);
  const totals = sumMacros(day.flatMap((meal) => meal.items));
  const targets = targetsFor(profile);

  return (
    <div>
      <PageHeader
        eyebrow="Питание"
        title="Дневник"
        text="Калории и БЖУ — оценка по цели, весу и активности, не лабораторный анализ."
        action={<Link href="/nutrition/log"><Button>Записать еду</Button></Link>}
      />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <Ring value={(totals.kcal / targets.kcal) * 100} label={`${totals.kcal}`} sub={`из ${targets.kcal} ккал`} />
          <div className="mt-6 space-y-4">
            <MacroLine label="Белки" value={totals.protein} total={targets.protein} />
            <MacroLine label="Жиры" value={totals.fat} total={targets.fat} tone="sand" />
            <MacroLine label="Углеводы" value={totals.carbs} total={targets.carbs} tone="mist" />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Metric label="Осталось" value={`${Math.max(targets.kcal - totals.kcal, 0)}`} hint="ккал" />
            <Metric label="Белок" value={`${Math.max(targets.protein - Math.round(totals.protein), 0)}`} hint="г" />
            <Metric label="Приёмы" value={`${day.length}`} />
          </div>
        </section>
        <section>
          {day.length === 0 ? (
            <EmptyState title="Сегодня ещё ничего нет" text="Напишите AI-тренеру, что вы съели, или добавьте приём здесь." action={<Link href="/nutrition/log"><Button>Записать еду</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {day.map((meal) => {
                const macros = sumMacros(meal.items);
                return (
                  <article key={meal.id} className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted">{meal.time} · {sourceLabel(meal.source)}{meal.approximate ? " · оценка" : ""}</p>
                        <h3 className="mt-1 text-lg font-medium">{meal.title}</h3>
                      </div>
                      <button type="button" className="text-sm text-muted" onClick={() => remove(meal.id)}>Удалить</button>
                    </div>
                    <p className="mt-3 text-sm text-muted">{macros.kcal} ккал · Б {grams(macros.protein)} · Ж {grams(macros.fat)} · У {grams(macros.carbs)}</p>
                    <ul className="mt-2 text-sm leading-6">
                      {meal.items.map((item) => <li key={item.id}>{item.name} · {item.grams} г</li>)}
                    </ul>
                  </article>
                );
              })}
            </div>
          )}
          <p className="mt-4 text-xs text-muted">{formatLong(today)}. Распознавание текста — приблизительная оценка, её можно удалить и записать заново.</p>
        </section>
      </div>
    </div>
  );
}

function grams(value: number) {
  return String(Math.round(value * 10) / 10).replace(".", ",");
}

function sourceLabel(source: string) {
  if (source === "voice") return "голос";
  if (source === "photo") return "фото";
  if (source === "manual") return "вручную";
  return "текст";
}
