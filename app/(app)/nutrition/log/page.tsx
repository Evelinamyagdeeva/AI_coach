"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip, Field } from "@/components/ui/primitives";
import { todayISO, timeNow } from "@/lib/dates";
import { emptyItem, parseMealText } from "@/lib/foods";
import { uid } from "@/lib/id";
import { useApp } from "@/lib/store";
import type { FoodItem, MealSource } from "@/lib/types";

const MODES: { id: MealSource; label: string }[] = [
  { id: "text", label: "Текст" },
  { id: "voice", label: "Голос" },
  { id: "photo", label: "Фото" },
  { id: "manual", label: "Вручную" },
];

export default function LogMealPage() {
  const router = useRouter();
  const addMeal = useApp((state) => state.addMeal);
  const [mode, setMode] = useState<MealSource>("text");
  const [text, setText] = useState("");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [title, setTitle] = useState("Приём пищи");
  const [photo, setPhoto] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");

  function previewFrom(sourceText: string) {
    const parsed = parseMealText(sourceText);
    if (!parsed) {
      setItems([]);
      return;
    }
    setTitle(parsed.title);
    setItems(parsed.items);
  }

  function save() {
    const clean = items.filter((item) => item.name.trim());
    if (!clean.length) return;
    addMeal({
      id: uid("meal"),
      date: todayISO(),
      time: timeNow(),
      title: title || "Приём пищи",
      source: mode,
      items: clean,
      approximate: mode !== "manual",
    });
    router.push("/nutrition");
  }

  function listen() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) {
      setVoiceNote("В этом браузере нет распознавания речи. Можно вписать фразу ниже.");
      return;
    }
    const recognition = new Speech();
    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const said = event.results[0]?.[0]?.transcript || "";
      setText(said);
      previewFrom(said);
      setListening(false);
    };
    recognition.onerror = () => {
      setVoiceNote("Не получилось распознать. Впишите фразу вручную.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-4xl font-semibold tracking-tight">Записать еду</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Оценка приблизительная. Перед сохранением можно поправить продукты и вес.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {MODES.map((item) => (
          <Chip key={item.id} active={mode === item.id} onClick={() => { setMode(item.id); setItems([]); }}>{item.label}</Chip>
        ))}
      </div>
      {mode === "text" || mode === "voice" ? (
        <div className="mt-6 space-y-3">
          {mode === "voice" ? (
            <Button variant="secondary" onClick={listen}>{listening ? "Слушаю…" : "Говорить"}</Button>
          ) : null}
          {voiceNote ? <p className="text-sm text-muted">{voiceNote}</p> : null}
          <textarea value={text} onChange={(event) => { setText(event.target.value); previewFrom(event.target.value); }} placeholder="Съел омлет из трёх яиц и два тоста" className="min-h-28 w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-accent" />
        </div>
      ) : null}
      {mode === "photo" ? (
        <div className="mt-6 space-y-4">
          <label className="block rounded-2xl border border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-muted">
            {photo ? (
              // Local preview of a file the user just picked. Next/Image cannot optimize a data URL.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Загруженное блюдо" className="mx-auto mb-4 max-h-56 rounded-xl object-cover" />
            ) : (
              "Выберите фото тарелки"
            )}
            <input type="file" accept="image/*" className="mt-3 block w-full text-sm" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                setPhoto(String(reader.result || ""));
                setTitle("Тарелка");
                setItems([
                  { ...emptyItem(), name: "Основное", grams: 150, kcal: 220, protein: 20, fat: 8, carbs: 16 },
                  { ...emptyItem(), name: "Гарнир", grams: 120, kcal: 150, protein: 4, fat: 1, carbs: 30 },
                ]);
              };
              reader.readAsDataURL(file);
            }} />
          </label>
          <p className="rounded-xl bg-sand px-4 py-3 text-sm leading-6">Это не распознавание изображения. Черновик порции нужно поправить перед сохранением.</p>
        </div>
      ) : null}
      {mode === "manual" && items.length === 0 ? (
        <div className="mt-6">
          <Button variant="ghost" onClick={() => setItems([{ ...emptyItem(), name: "" }])}>Добавить продукт</Button>
        </div>
      ) : null}
      {items.length ? (
        <div className="mt-6 space-y-3">
          <Field label="Название" value={title} onChange={(event) => setTitle(event.target.value)} />
          {items.map((item) => (
            <div key={item.id} className="grid gap-2 rounded-2xl border border-line bg-surface p-3 md:grid-cols-6">
              <input className="h-10 rounded-lg border border-line px-2 md:col-span-2" value={item.name} onChange={(event) => update(item.id, { name: event.target.value })} placeholder="Продукт" />
              <input className="h-10 rounded-lg border border-line px-2" value={item.grams} onChange={(event) => update(item.id, { grams: Number(event.target.value) })} placeholder="г" />
              <input className="h-10 rounded-lg border border-line px-2" value={item.kcal} onChange={(event) => update(item.id, { kcal: Number(event.target.value) })} placeholder="ккал" />
              <input className="h-10 rounded-lg border border-line px-2" value={item.protein} onChange={(event) => update(item.id, { protein: Number(event.target.value) })} placeholder="Б" />
              <input className="h-10 rounded-lg border border-line px-2" value={item.fat} onChange={(event) => update(item.id, { fat: Number(event.target.value) })} placeholder="Ж" />
              <input className="h-10 rounded-lg border border-line px-2 md:col-span-1" value={item.carbs} onChange={(event) => update(item.id, { carbs: Number(event.target.value) })} placeholder="У" />
            </div>
          ))}
          <Button variant="quiet" onClick={() => setItems([...items, emptyItem()])}>Ещё продукт</Button>
          <Button onClick={save}>Добавить в дневник</Button>
        </div>
      ) : null}
    </div>
  );

  function update(id: string, patch: Partial<FoodItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  }
}

interface SpeechCtor {
  new (): {
    lang: string;
    interimResults: boolean;
    start: () => void;
    onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
  };
}
