"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DISCLAIMER } from "@/lib/labels";
import { useApp } from "@/lib/store";

export default function CoachPage() {
  const messages = useApp((state) => state.messages);
  const confirm = useApp((state) => state.confirmProposal);
  const dismiss = useApp((state) => state.dismissProposal);
  const undo = useApp((state) => state.undo);
  const setDraft = useApp((state) => state.setDraft);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages.length, messages.at(-1)?.text]);

  return (
    <div className="mx-auto flex h-[calc(100dvh-13rem)] max-w-3xl flex-col lg:h-[calc(100dvh-9rem)]">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="px-2 py-16 text-center">
            <p className="text-2xl font-semibold tracking-tight">Можно просто написать</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Я меняю план, дневник и прогресс. Сначала показываю, что именно изменится.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Сегодня у меня только 30 минут", "Съел омлет из трёх яиц и два тоста", "Врач запретил мне бегать"].map((phrase) => (
                <button key={phrase} type="button" className="rounded-full border border-line px-3 py-2 text-left text-sm" onClick={() => setDraft(phrase)}>
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((message) => (
          <article key={message.id} className={message.role === "user" ? "ml-auto max-w-[80%] rounded-3xl bg-button px-4 py-3 text-button-text" : "max-w-[80%] px-1 py-1"}>
            <p className="whitespace-pre-wrap text-sm leading-6">{message.text.replace(/\*\*/g, "")}</p>
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
        <div ref={end} />
      </div>
      <p className="shrink-0 pt-3 text-xs leading-5 text-muted">{DISCLAIMER}</p>
    </div>
  );
}
