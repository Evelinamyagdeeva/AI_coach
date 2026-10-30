"use client";

import Link from "next/link";
import { QuickActions } from "@/components/ai/composer";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/primitives";
import { DISCLAIMER } from "@/lib/labels";
import { useApp } from "@/lib/store";

export default function CoachPage() {
  const messages = useApp((state) => state.messages);
  const confirm = useApp((state) => state.confirmProposal);
  const dismiss = useApp((state) => state.dismissProposal);
  const undo = useApp((state) => state.undo);
  const setDraft = useApp((state) => state.setDraft);

  return (
    <div>
      <PageHeader eyebrow="AI-тренер" title="Можно просто написать" text="Я меняю план, дневник и прогресс. Сначала показываю, что именно изменится." />
      <QuickActions />
      <div className="mt-6 space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line px-5 py-10">
            <p className="text-lg">Пока тихо. Напишите, как прошёл день.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Сегодня у меня только 30 минут", "Съел омлет из трёх яиц и два тоста", "Врач запретил мне бегать"].map((phrase) => (
                <button key={phrase} type="button" className="rounded-full border border-line px-3 py-2 text-left text-sm" onClick={() => setDraft(phrase)}>
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((message) => (
          <article key={message.id} className={message.role === "user" ? "ml-auto max-w-xl rounded-2xl bg-sand px-4 py-3" : "max-w-2xl rounded-2xl border border-line bg-surface px-4 py-4"}>
            <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
            {message.link ? (
              <Link href={message.link.href} className="mt-3 inline-block text-sm text-accent">
                {message.link.label}
              </Link>
            ) : null}
            {message.proposal ? (
              <div className="mt-4 rounded-xl bg-sand p-3">
                <p className="text-sm font-medium">{message.proposal.title}</p>
                <p className="mt-1 text-sm text-muted">{message.proposal.summary}</p>
                {message.proposal.status === "pending" ? (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => confirm(message.id)}>Применить</Button>
                    <Button size="sm" variant="ghost" onClick={() => dismiss(message.id)}>Не сейчас</Button>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted">{message.proposal.status === "applied" ? "Изменение применено" : "Оставлено как есть"}</p>
                )}
              </div>
            ) : null}
            {message.undoable ? (
              <button type="button" className="mt-3 text-sm text-muted" onClick={undo}>
                Отменить
              </button>
            ) : null}
          </article>
        ))}
      </div>
      <p className="mt-8 text-xs leading-5 text-muted">{DISCLAIMER}</p>
    </div>
  );
}
