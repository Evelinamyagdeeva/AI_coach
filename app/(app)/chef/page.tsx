"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/primitives";
import { todayISO } from "@/lib/dates";
import { sumMacros, targetsFor } from "@/lib/nutrition";
import { suggestRecipes } from "@/lib/recipes";
import { useApp } from "@/lib/store";

export default function ChefPage() {
  const profile = useApp((state) => state.profile);
  const meals = useApp((state) => state.meals);
  const generate = useApp((state) => state.generateMenu);
  const update = useApp((state) => state.updateProfile);
  const targets = targetsFor(profile);
  const eaten = sumMacros(meals.filter((meal) => meal.date === todayISO()).flatMap((meal) => meal.items));
  const left = {
    kcal: Math.max(targets.kcal - eaten.kcal, 0),
    protein: Math.max(targets.protein - eaten.protein, 0),
  };
  const ideas = suggestRecipes(profile, "dinner", 3);

  return (
    <div>
      <PageHeader eyebrow="Шеф" title="Что приготовить" text="Блюда учитывают цель, остаток калорий, аллергии и то, что есть дома." action={<Button onClick={generate}>Меню на неделю</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Info label="Осталось ккал" value={String(left.kcal)} />
        <Info label="Осталось белка" value={`${Math.round(left.protein)} г`} />
        <Info label="Дома" value={profile.pantry.slice(0, 3).join(", ") || "пока пусто"} />
      </div>
      <label className="mt-6 block max-w-xl">
        <span className="text-sm text-muted">Продукты дома</span>
        <input
          defaultValue={profile.pantry.join(", ")}
          onBlur={(event) => update({ pantry: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
          className="mt-2 h-12 w-full rounded-xl border border-line bg-surface px-3 outline-none focus:border-accent"
        />
      </label>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {ideas.map((recipe) => (
          <Link key={recipe.id} href={`/chef/recipes/${recipe.id}`} className="rounded-2xl border border-line bg-surface p-5 transition hover:border-accent">
            <p className="text-sm text-muted">{recipe.minutes} мин · {recipe.tags[0]}</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight">{recipe.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{recipe.summary}</p>
            <p className="mt-4 text-sm">{recipe.kcal} ккал · {recipe.protein} г белка</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Link href="/chef/week"><Button variant="ghost">Открыть неделю</Button></Link>
        <Link href="/chef/shopping"><Button variant="ghost">Список покупок</Button></Link>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
