"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/primitives";
import { exerciseById } from "@/lib/exercises";
import { DISCLAIMER } from "@/lib/labels";
import { useApp } from "@/lib/store";
import type { Feedback } from "@/lib/types";

export default function SummaryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const workout = useApp((state) => state.workouts.find((item) => item.id === params.id));
  const session = useApp((state) => state.sessions.find((item) => item.workoutId === params.id));
  const active = useApp((state) => state.activeSession);
  const save = useApp((state) => state.saveFeedback);
  const [feedback, setFeedback] = useState<Feedback>({ wellbeing: 3, difficulty: "ok", pain: "", energy: 3, mood: 3, comment: "" });
  const [saved, setSaved] = useState(Boolean(session?.feedback));

  if (!workout) return <p className="text-muted">Тренировка не найдена.</p>;
  const logs = session?.logs || (active?.workoutId === workout.id ? active.logs : []);
  const painful = logs.some((item) => item.mark === "pain") || Boolean(feedback.pain);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-muted">Итог</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{workout.name}</h1>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Tile label="Минуты" value={String(session?.durationMin || workout.durationMin)} />
        <Tile label="Отметки" value={String(logs.length)} />
        <Tile label="Объём" value={workout.volumeLabel.split(" ")[0]} />
      </div>
      <ul className="mt-6 space-y-2 text-sm text-muted">
        {workout.exercises.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2">
            <span className="text-ink">{exerciseById(item.exerciseId)?.name}</span>
            <span>{logs.filter((log) => log.plannedId === item.id && log.mark !== "skipped").length}/{item.sets}</span>
          </li>
        ))}
      </ul>
      {saved || session?.feedback ? (
        <div className="mt-8 rounded-2xl bg-sand p-5">
          <p className="text-lg font-medium">{painful || session?.feedback?.difficulty === "hard" ? "Следующие тренировки станут мягче." : "Отзыв сохранён. План остаётся спокойным."}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{painful ? "Я не ставлю диагноз. Если боль держится, покажите это специалисту." : "Можно вернуться к дню или записать еду."}</p>
          <Link href="/dashboard" className="mt-4 inline-flex"><Button>На главную</Button></Link>
        </div>
      ) : (
        <form
          className="mt-8 space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            save(workout.id, feedback);
            setSaved(true);
            router.refresh();
          }}
        >
          <Scale label="Самочувствие" value={feedback.wellbeing} onChange={(wellbeing) => setFeedback({ ...feedback, wellbeing })} />
          <div>
            <p className="text-sm text-muted">Сложность</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {([["easy", "Легко"], ["ok", "Нормально"], ["hard", "Тяжело"]] as const).map(([id, label]) => (
                <Chip key={id} active={feedback.difficulty === id} onClick={() => setFeedback({ ...feedback, difficulty: id })}>{label}</Chip>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-sm text-muted">Боль или дискомфорт</span>
            <input value={feedback.pain} onChange={(event) => setFeedback({ ...feedback, pain: event.target.value })} placeholder="Если не было — оставьте пустым" className="mt-2 h-12 w-full rounded-xl border border-line bg-surface px-3 outline-none focus:border-accent" />
          </label>
          <Scale label="Энергия" value={feedback.energy} onChange={(energy) => setFeedback({ ...feedback, energy })} />
          <Scale label="Настроение" value={feedback.mood} onChange={(mood) => setFeedback({ ...feedback, mood })} />
          <label className="block">
            <span className="text-sm text-muted">Комментарий</span>
            <textarea value={feedback.comment} onChange={(event) => setFeedback({ ...feedback, comment: event.target.value })} className="mt-2 min-h-24 w-full rounded-xl border border-line bg-surface px-3 py-3 outline-none focus:border-accent" />
          </label>
          <Button type="submit">Сохранить отзыв</Button>
        </form>
      )}
      <p className="mt-8 text-xs leading-5 text-muted">{DISCLAIMER}</p>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Scale({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-2 flex gap-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <Chip key={item} active={value === item} onClick={() => onChange(item)}>{item}</Chip>
        ))}
      </div>
    </div>
  );
}
