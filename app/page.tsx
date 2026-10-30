"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

const phrases = [
  ["Сегодня после приседа болела спина", "Заметка и более спокойный план"],
  ["Съела омлет из трёх яиц", "Запись в дневнике"],
  ["В среду не смогу тренироваться", "Перенос сессии"],
  ["Что приготовить из курицы и риса", "Ужин от шефа"],
];

export default function LandingPage() {
  const router = useRouter();
  const hydrated = useApp((state) => state.hydrated);
  const profile = useApp((state) => state.profile);
  const loadDemo = useApp((state) => state.loadDemo);

  return (
    <div className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="text-lg font-semibold tracking-tight">Aera</span>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle compact />
          </div>
          <Link href="/login">
            <Button variant="quiet">Войти</Button>
          </Link>
          <Link href="/signup">
            <Button>Начать</Button>
          </Link>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-16 px-5 pb-20 pt-8 md:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm text-muted">Тренер, питание и прогресс в одном месте</p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Напишите, что произошло. План обновится сам.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted">
            Aera помнит цели, график, ограничения и еду. Не нужно заполнять десяток форм: достаточно обычной фразы.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button>Собрать мой план</Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                loadDemo();
                router.push("/dashboard");
              }}
            >
              Открыть пример
            </Button>
            {hydrated && profile.onboarded ? (
              <Link href="/dashboard">
                <Button variant="secondary">Продолжить как {profile.name}</Button>
              </Link>
            ) : null}
          </div>
        </div>
        <div className="rise rounded-[20px] border border-line bg-surface p-6 shadow-[var(--shadow)]">
          <p className="text-sm text-muted">Сегодня</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Верх тела</h2>
          <p className="mt-2 text-muted">45 мин · сегодня · 18:30</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["Калории", "830"],
              ["Белок", "75 г"],
              ["Сон", "спокойно"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-sand px-3 py-4">
                <p className="text-xs text-muted">{label}</p>
                <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-line px-4 py-3 text-sm text-muted">Спросите AI-тренера…</div>
        </div>
      </main>
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-2xl font-semibold tracking-tight">Одна фраза вместо отдельного приложения</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {phrases.map(([phrase, result]) => (
            <div key={phrase} className="rounded-2xl border border-line bg-surface px-5 py-4">
              <p className="text-base">{phrase}</p>
              <p className="mt-2 text-sm text-muted">{result}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-24 md:grid-cols-3">
        {[
          ["Тренировки", "План под оборудование, время и самочувствие. Во время сессии на экране только текущее упражнение."],
          ["Питание и шеф", "Текст, голос или фото с подтверждением. Меню на неделю и список покупок."],
          ["Прогресс", "Вес, измерения и личные фото остаются на этом устройстве."],
        ].map(([title, text]) => (
          <article key={title} className="rounded-2xl bg-sand p-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
