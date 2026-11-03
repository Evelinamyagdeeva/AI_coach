"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const inChat = pathname.startsWith("/coach");
  const last = messages.at(-1);

  return (
    <div className="fixed inset-x-0 bottom-16 z-20 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:bottom-0 lg:left-[248px]">
      {!inChat && last?.role === "assistant" ? (
        <div className="mx-auto mb-3 max-w-3xl rounded-2xl border border-line bg-surface shadow-[var(--shadow)]">
          <button type="button" className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-muted" onClick={() => setOpen((value) => !value)}>
            <span>{open ? "Ответ тренера" : last.text.replace(/\*\*/g, "").replace(/\s+/g, " ").slice(0, 72)}</span>
            <span>{open ? "Свернуть" : "Развернуть"}</span>
          </button>
          {open ? (
            <div className="max-h-64 overflow-y-auto px-4 pb-4">
              <p className="whitespace-pre-wrap text-sm leading-6">{last.text.replace(/\*\*/g, "")}</p>
              {last.link ? (
                <Link href={last.link.href} className="mt-3 inline-block text-sm text-accent">
                  {last.link.label}
                </Link>
              ) : null}
              {last.proposal?.status === "pending" ? (
                <div className="mt-4 rounded-xl bg-sand p-3">
                  <p className="text-sm font-medium">{last.proposal.title}</p>
                  <p className="mt-1 text-sm text-muted">{last.proposal.summary}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => confirm(last.id)}>Применить</Button>
                    <Button size="sm" variant="ghost" onClick={() => dismiss(last.id)}>Не сейчас</Button>
                  </div>
                </div>
              ) : null}
              {last.undoable ? (
                <button type="button" className="mt-3 text-sm text-muted" onClick={undo}>Отменить</button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <form
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-line bg-surface px-3 py-2 shadow-[var(--shadow)]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          submit(draft);
          if (!inChat) setOpen(true);
        }}
      >
        <textarea
          value={draft}
          rows={1}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Напишите тренеру…"
          className="max-h-36 min-h-11 min-w-0 flex-1 resize-none bg-transparent py-2.5 text-sm outline-none placeholder:text-muted"
        />
        <Button size="sm" type="submit">
          Отправить
        </Button>
      </form>
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
