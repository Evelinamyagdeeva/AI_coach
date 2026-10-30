"use client";

import { useParams } from "next/navigation";
import { recipeById } from "@/lib/recipes";

export default function RecipePage() {
  const params = useParams<{ id: string }>();
  const recipe = recipeById(params.id);
  if (!recipe) return <p className="text-muted">Рецепт не найден.</p>;
  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-sm text-muted">{recipe.minutes} мин · {recipe.servings} порция</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{recipe.title}</h1>
      <p className="mt-4 text-muted">{recipe.summary}</p>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {[
          ["Ккал", recipe.kcal],
          ["Белки", recipe.protein],
          ["Жиры", recipe.fat],
          ["Углеводы", recipe.carbs],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-3">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-8 text-lg font-semibold">Состав</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {recipe.ingredients.map((item) => <li key={item.name}>{item.name} · {item.amount}</li>)}
      </ul>
      <h2 className="mt-8 text-lg font-semibold">Шаги</h2>
      <ol className="mt-3 space-y-3 text-sm leading-6">
        {recipe.steps.map((step, index) => <li key={step}>{index + 1}. {step}</li>)}
      </ol>
    </article>
  );
}
