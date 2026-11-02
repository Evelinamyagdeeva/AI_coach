import { polzaChat } from "@/lib/server/polza";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      context?: string;
      history?: { role?: string; text?: string }[];
    };
    const text = body.text?.trim();
    if (!text) return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
    const history = (body.history || [])
      .filter((item) => item.text && (item.role === "user" || item.role === "assistant"))
      .slice(-8)
      .map((item) => ({ role: item.role as "user" | "assistant", content: item.text as string }));
    const reply = await polzaChat([
      {
        role: "system",
        content: [
          "Ты Aera, тренер по тренировкам и питанию. Отвечай по-русски, коротко, на «вы».",
          "Не ставь диагнозы и не отменяй назначения врача. При боли предложи снизить нагрузку и обратиться к специалисту, если она резкая.",
          "Калории называй оценкой. Если человек сообщает еду, прикинь ккал и БЖУ и скажи, что это оценка.",
          "Не выдумывай, что уже изменила план: смена тренировок применяется отдельно.",
          body.context ? `Контекст человека:\n${body.context.slice(0, 2000)}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      },
      ...history,
      { role: "user", content: text },
    ]);
    return NextResponse.json({ reply: reply.trim() || "Не получилось сформулировать ответ." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Тренер сейчас недоступен";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
