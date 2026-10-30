"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Field, PageHeader } from "@/components/ui/primitives";
import { useApp } from "@/lib/store";

export default function SettingsPage() {
  const profile = useApp((state) => state.profile);
  const update = useApp((state) => state.updateProfile);
  const reminders = useApp((state) => state.remindersOn);
  const setReminders = useApp((state) => state.setReminders);

  return (
    <div className="max-w-xl">
      <PageHeader eyebrow="Настройки" title="Как выглядит Aera" text="Тема, имя и напоминания внутри приложения." />
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm text-muted">Тема</p>
          <ThemeToggle />
        </div>
        <Field label="Имя" value={profile.name} onChange={(event) => update({ name: event.target.value })} />
        <label className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
          Напоминания в приложении
          <input type="checkbox" checked={reminders} onChange={(event) => setReminders(event.target.checked)} />
        </label>
        <p className="text-sm text-muted">Единицы: килограммы и сантиметры.</p>
        <Link href="/privacy" className="text-sm text-accent">Приватность и удаление данных</Link>
      </div>
    </div>
  );
}
