"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

const QUICK = [
  { label: "Скорректировать тренировку", draft: "Скорректируй сегодняшнюю тренировку: сегодня у меня только 30 минут" },
  { label: "Записать еду", href: "/nutrition/log" },
  { label: "Добавить вес", draft: "Добавь вес " },
  { label: "Спланировать неделю", href: "/planner" },
  { label: "Спросить шефа", href: "/chef" },
  { label: "Оставить отзыв", href: "/workouts" },
];

export function Composer() {
  const draft = useApp((state) => state.draft);
  const setDraft = useApp((state) => state.setDraft);
  const submit = useApp((state) => state.submitUtterance);
  const messages = useApp((state) => state.messages);
  const confirm = useApp((state) => state.confirmProposal);
  const dismiss = useApp((state) => state.dismissProposal);
  const undo = useApp((state) => state.undo);
  const [open, setOpen] = useState(false);
  const last = messages.at(-1);

  return (
    <div className="relative min-w-0 flex-1">
      <form
        className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3 shadow-[var(--shadow)]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          submit(draft);
          setOpen(true);
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Спросите AI-тренера…"
          className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <Button size="sm" type="submit">
          Отправить
        </Button>
      </form>
      {open && last?.role === "assistant" ? (
        <div className="absolute left-0 right-0 top-14 z-30 rise rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow)]">
          <p className="whitespace-pre-wrap text-sm leading-6">{last.text}</p>
          {last.link ? (
            <Link href={last.link.href} className="mt-3 inline-block text-sm text-accent" onClick={() => setOpen(false)}>
              {last.link.label}
            </Link>
          ) : null}
          {last.proposal?.status === "pending" ? (
            <div className="mt-4 rounded-xl bg-sand p-3">
              <p className="text-sm font-medium">{last.proposal.title}</p>
              <p className="mt-1 text-sm text-muted">{last.proposal.summary}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => confirm(last.id)}>
                  Применить
                </Button>
                <Button size="sm" variant="ghost" onClick={() => dismiss(last.id)}>
                  Не сейчас
                </Button>
              </div>
            </div>
          ) : null}
          {last.undoable ? (
            <button type="button" className="mt-3 text-sm text-muted" onClick={undo}>
              Отменить
            </button>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK.map((item) =>
              item.href ? (
                <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="rounded-full border border-line px-3 py-1.5 text-xs text-muted">
                  {item.label}
                </Link>
              ) : (
                <button key={item.label} type="button" className="rounded-full border border-line px-3 py-1.5 text-xs text-muted" onClick={() => setDraft(item.draft || "")}>
                  {item.label}
                </button>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function QuickActions() {
  const setDraft = useApp((state) => state.setDraft);
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {QUICK.map((item) =>
        item.href ? (
          <Link key={item.label} href={item.href} className="shrink-0 rounded-full border border-line bg-surface px-3 py-2 text-sm text-ink">
            {item.label}
          </Link>
        ) : (
          <button key={item.label} type="button" onClick={() => setDraft(item.draft || "")} className="shrink-0 rounded-full border border-line bg-surface px-3 py-2 text-sm">
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
