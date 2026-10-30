"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { formatWeekday, formatShort } from "@/lib/dates";
import { SLOT_LABEL } from "@/lib/labels";
import { recipeById } from "@/lib/recipes";
import { useApp } from "@/lib/store";

export default function WeekMenuPage() {
  const plan = useApp((state) => state.mealPlan);
  const generate = useApp((state) => state.generateMenu);
  if (!plan) {
    return <EmptyState title="Меню ещё не собрано" text="Шеф разложит завтрак, обед, ужин и перекус на семь дней." action={<Button onClick={generate}>Составить меню</Button>} />;
  }
  return (
    <div>
      <PageHeader eyebrow="Неделя" title="Меню" text="Калории указаны на порцию и остаются оценкой." action={<Link href="/chef/shopping"><Button variant="ghost">Список покупок</Button></Link>} />
      <div className="space-y-4">
        {plan.days.map((day) => {
          const kcal = day.meals.reduce((sum, meal) => sum + (recipeById(meal.recipeId)?.kcal || 0), 0);
          return (
            <article key={day.date} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-medium">{formatWeekday(day.date)} · {formatShort(day.date)}</h2>
                <p className="text-sm text-muted">{kcal} ккал</p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {day.meals.map((meal) => {
                  const recipe = recipeById(meal.recipeId);
                  if (!recipe) return null;
                  return (
                    <Link key={meal.slot} href={`/chef/recipes/${recipe.id}`} className="rounded-xl bg-sand px-3 py-3">
                      <p className="text-xs text-muted">{SLOT_LABEL[meal.slot]}</p>
                      <p className="mt-1 text-sm font-medium">{recipe.title}</p>
                    </Link>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
