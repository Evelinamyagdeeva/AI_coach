"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/primitives";
import { WEEKDAYS_FULL } from "@/lib/dates";
import { ACTIVITY_LABEL, GOAL_LABEL, LEVEL_LABEL } from "@/lib/labels";
import { targetsFor } from "@/lib/nutrition";
import { useApp } from "@/lib/store";

export default function ProfilePage() {
  const profile = useApp((state) => state.profile);
  const targets = targetsFor(profile);
  const rows = [
    ["Имя", profile.name],
    ["Почта", profile.email || "не указана"],
    ["Цель", GOAL_LABEL[profile.goal]],
    ["Уровень", LEVEL_LABEL[profile.level]],
    ["Активность", ACTIVITY_LABEL[profile.activity]],
    ["Дни", profile.availableDays.map((day) => WEEKDAYS_FULL[day]).join(", ")],
    ["Длительность", `${profile.durationMin} мин`],
    ["Питание", profile.dietStyle],
    ["Оценка", `${targets.kcal} ккал · Б ${targets.protein} / Ж ${targets.fat} / У ${targets.carbs}`],
    ["Аллергии", profile.allergies.join(", ") || "нет"],
    ["Не любит", profile.dislikes.join(", ") || "нет"],
    ["Дома", profile.pantry.join(", ") || "не указано"],
    ["Ограничения", profile.restrictions.map((item) => item.text).join("; ") || "нет"],
    ["Восстановление", profile.recoveryNotes || "не указано"],
    ["Пожелания", profile.wishes || "нет"],
  ];
  return (
    <div>
      <PageHeader eyebrow="Профиль" title={profile.name} text="Эти ответы можно поменять у тренера обычной фразой." />
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 md:grid-cols-[180px_1fr]">
            <p className="text-sm text-muted">{label}</p>
            <p className="text-sm leading-6">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/settings" className="text-accent">Настройки</Link>
        <Link href="/privacy" className="text-accent">Данные и приватность</Link>
      </div>
    </div>
  );
}
