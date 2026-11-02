export async function polzaChat(messages: unknown[], model = process.env.POLZA_AI_MODEL_NAME) {
  const key = process.env.POLZA_AI_API_KEY;
  const base = (process.env.POLZA_AI_BASE_URL || "https://polza.ai/api/v1").replace(/\/$/, "");
  if (!key || !model) throw new Error("Нет ключа Polza");
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, temperature: 0.2 }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail.slice(0, 180) || "Polza не ответила");
  }
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content || "";
}

export function parseJson<T>(raw: string): T | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = (fenced?.[1] || raw).trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
