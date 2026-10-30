"use client";

import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { shoppingList } from "@/lib/recipes";
import { useApp } from "@/lib/store";

export default function ShoppingPage() {
  const plan = useApp((state) => state.mealPlan);
  if (!plan) return <EmptyState title="Список появится вместе с меню" text="Сначала соберите неделю у шефа." />;
  const items = shoppingList(plan);
  const groups = [...new Set(items.map((item) => item.category))];
  return (
    <div>
      <PageHeader eyebrow="Покупки" title="На всю неделю" text="Одинаковые продукты сложены в одну строку." />
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <section key={group} className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-medium">{group}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {items.filter((item) => item.category === group).map((item) => (
                <li key={item.name} className="flex justify-between gap-3">
                  <span>{item.name}</span>
                  <span className="text-muted">{item.amount}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
