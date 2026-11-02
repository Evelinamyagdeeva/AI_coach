import { estimateFood } from "@/lib/server/estimate-food";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string; image?: string };
    if (!body.text?.trim() && !body.image) {
      return NextResponse.json({ error: "Нужна фраза или фото" }, { status: 400 });
    }
    if (body.image && body.image.length > 2_000_000) {
      return NextResponse.json({ error: "Фото слишком большое" }, { status: 413 });
    }
    const result = await estimateFood({ text: body.text?.trim(), image: body.image });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не получилось оценить еду";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
