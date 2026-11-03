"use client";

import { useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/primitives";
import { FOODS } from "@/lib/foods";
import { useApp } from "@/lib/store";
import { NutritionTabs } from "@/components/nutrition/tabs";

export default function TastePage() {
  const profile = useApp((state) => state.profile);
  const rate = useApp((state) => state.rateFood);
  const likes = profile.likes || [];
  const queue = useMemo(
    () => FOODS.filter((food) => !likes.includes(food.name) && !profile.dislikes.includes(food.name)),
    [likes, profile.dislikes],
  );
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const food = queue[index];

  function finish(liked: boolean) {
    if (!food) return;
    rate(food.name, liked);
    setDrag(0);
    setIndex(0);
  }

  return (
    <div>
      <PageHeader eyebrow="Питание" title="Вкусы" text="Вправо — нравится, влево — нет. Меню будет чаще брать то, что вы оставили." />
      <NutritionTabs current="taste" />
      <div className="mx-auto mt-8 max-w-sm">
        {food ? (
          <article
            className="touch-pan-y select-none rounded-[28px] border border-line bg-surface px-6 py-16 text-center shadow-[var(--shadow)]"
            style={{ transform: `translateX(${drag}px) rotate(${drag / 25}deg)` }}
            onPointerDown={(event) => {
              start.current = event.clientX;
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (start.current === null) return;
              setDrag(event.clientX - start.current);
            }}
            onPointerUp={() => {
              if (drag > 90) finish(true);
              else if (drag < -90) finish(false);
              else setDrag(0);
              start.current = null;
            }}
            onPointerCancel={() => {
              setDrag(0);
              start.current = null;
            }}
          >
            <p className="text-xs uppercase tracking-wide text-muted">{drag > 40 ? "Нравится" : drag < -40 ? "Не хочу" : "Свайп"}</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">{food.name}</h2>
            <p className="mt-3 text-sm text-muted">{food.kcal} ккал на 100 г · Б {food.protein} · Ж {food.fat} · У {food.carbs}</p>
          </article>
        ) : (
          <p className="rounded-2xl border border-dashed border-line px-5 py-12 text-center text-sm text-muted">Все продукты из списка разобраны. Меню можно собрать заново у шефа.</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" className="h-12 rounded-full border border-line px-5 text-sm" onClick={() => food && finish(false)}>Не хочу</button>
          <button type="button" className="h-12 rounded-full bg-button px-5 text-sm text-button-text" onClick={() => food && finish(true)}>Нравится</button>
        </div>
        <p className="mt-6 text-center text-sm text-muted">Нравится: {likes.length ? likes.join(", ") : "пока пусто"}</p>
        <p className="mt-2 text-center text-sm text-muted">Не хочу: {profile.dislikes.length ? profile.dislikes.join(", ") : "пока пусто"}</p>
      </div>
    </div>
  );
}
