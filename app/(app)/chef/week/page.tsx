"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { formatWeekday, formatShort } from "@/lib/dates";
import { SLOT_LABEL } from "@/lib/labels";
import { targetsFor } from "@/lib/nutrition";
import { recipeById, scaledRecipe } from "@/lib/recipes";
import { useApp } from "@/lib/store";

export default function WeekMenuPage() {
  const plan = useApp((state) => state.mealPlan);
  const profile = useApp((state) => state.profile);
  const generate = useApp((state) => state.generateMenu);
  const targets = targetsFor(profile);
  if (!plan) {
    return <EmptyState title="Меню ещё не собрано" text="Шеф разложит завтрак, обед, ужин и перекус на семь дней." action={<Button onClick={generate}>Составить меню</Button>} />;
  }
  return (
    <div>
      <PageHeader eyebrow="Неделя" title="Меню" text={`Порции подогнаны под ${targets.kcal} ккал, белки ${targets.protein} г, жиры ${targets.fat} г, углеводы ${targets.carbs} г. Это оценка.`} action={<div className="flex gap-2"><Button variant="ghost" onClick={generate}>Собрать заново</Button><Link href="/chef/shopping"><Button variant="ghost">Список покупок</Button></Link></div>} />
      <div className="space-y-4">
        {plan.days.map((day) => {
          const macros = day.meals.reduce(
            (sum, meal) => {
              const recipe = recipeById(meal.recipeId);
              if (!recipe) return sum;
              const scaled = scaledRecipe(recipe, meal.factor);
              return { kcal: sum.kcal + scaled.kcal, protein: sum.protein + scaled.protein, fat: sum.fat + scaled.fat, carbs: sum.carbs + scaled.carbs };
            },
            { kcal: 0, protein: 0, fat: 0, carbs: 0 },
          );
          return (
            <article key={day.date} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-medium">{formatWeekday(day.date)} · {formatShort(day.date)}</h2>
                <p className="text-right text-sm text-muted">{macros.kcal} из {targets.kcal} ккал · Б {macros.protein} · Ж {macros.fat} · У {macros.carbs}</p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {day.meals.map((meal) => {
                  const recipe = recipeById(meal.recipeId);
                  if (!recipe) return null;
                  return (
                    <Link key={meal.slot} href={`/chef/recipes/${recipe.id}`} className="rounded-xl bg-sand px-3 py-3">
                      <p className="text-xs text-muted">{SLOT_LABEL[meal.slot]}</p>
                      <p className="mt-1 text-sm font-medium">{recipe.title}</p>
                      <p className="mt-1 text-xs text-muted">{scaledRecipe(recipe, meal.factor).kcal} ккал</p>
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
