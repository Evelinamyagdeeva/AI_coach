"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Chip, Field } from "@/components/ui/primitives";
import { todayISO, timeNow } from "@/lib/dates";
import { emptyItem, foodFromPer100, parseMealText, scaleFood, searchLocalFoods, searchOpenFoodFacts, type RemoteFood } from "@/lib/foods";
import { uid } from "@/lib/id";
import { useApp } from "@/lib/store";
import type { AmountUnit, FoodItem, MealSource } from "@/lib/types";

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
  const [remoteFoods, setRemoteFoods] = useState<RemoteFood[]>([]);
  const [searching, setSearching] = useState(false);
  const [photoOver, setPhotoOver] = useState(false);
  const [photoStatus, setPhotoStatus] = useState("");
  const [photoQuery, setPhotoQuery] = useState("");
  const [photoRemote, setPhotoRemote] = useState<RemoteFood[]>([]);
  const [photoSearching, setPhotoSearching] = useState(false);

  useEffect(() => {
    const query = text.trim();
    if ((mode !== "text" && mode !== "voice") || query.length < 2) {
      setRemoteFoods([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(() => {
      searchOpenFoodFacts(query)
        .then(setRemoteFoods)
        .catch(() => setRemoteFoods([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [text, mode]);

  useEffect(() => {
    const query = photoQuery.trim();
    if (mode !== "photo" || query.length < 2) {
      setPhotoRemote([]);
      setPhotoSearching(false);
      return;
    }
    setPhotoSearching(true);
    const timer = window.setTimeout(() => {
      searchOpenFoodFacts(query)
        .then(setPhotoRemote)
        .catch(() => setPhotoRemote([]))
        .finally(() => setPhotoSearching(false));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [photoQuery, mode]);

  function addProduct(name: string, per100: RemoteFood["per100"]) {
    setItems((current) => [...current, foodFromPer100(name, per100)]);
    if (!title || title === "Приём пищи" || title === "Тарелка") setTitle(name);
    setPhotoQuery("");
    setPhotoRemote([]);
  }

  function readPhoto(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setPhoto(dataUrl);
      void recognizePhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function recognizePhoto(dataUrl: string) {
    setPhotoStatus("Смотрю на фото…");
    setItems([]);
    try {
      const image = await shrinkImage(dataUrl);
      const response = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = (await response.json()) as {
        title?: string;
        note?: string;
        error?: string;
        items?: { name: string; grams: number; kcal: number; protein: number; fat: number; carbs: number; per100?: FoodItem["per100"] }[];
      };
      if (!response.ok) throw new Error(data.error || "Не получилось разобрать фото");
      setTitle(data.title || "Приём пищи");
      setItems(
        (data.items || []).map((item) => ({
          id: uid("food"),
          name: item.name,
          grams: item.grams,
          unit: "g" as const,
          kcal: item.kcal,
          protein: item.protein,
          fat: item.fat,
          carbs: item.carbs,
          per100: item.per100,
        })),
      );
      setPhotoStatus(data.note || "Список можно поправить.");
    } catch (error) {
      setPhotoStatus(error instanceof Error ? error.message : "Не получилось разобрать фото. Добавьте продукты вручную.");
    }
  }

  function clearPhoto() {
    setPhoto("");
    setItems([]);
    setTitle("Приём пищи");
    setPhotoQuery("");
    setPhotoStatus("");
  }

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
          <FoodSuggestions
            local={searchLocalFoods(text)}
            remote={remoteFoods}
            loading={searching}
            onPickLocal={(name, per100) => {
              const next = foodFromPer100(name, per100);
              setItems([next]);
              setTitle(name);
            }}
            onCustom={() => {
              setItems([{ ...emptyItem(), name: text.trim() }]);
              setTitle(text.trim() || "Приём пищи");
            }}
          />
        </div>
      ) : null}
      {mode === "photo" ? (
        <div className="mt-6 space-y-4">
          <label
            onDragEnter={(event) => { event.preventDefault(); setPhotoOver(true); }}
            onDragOver={(event) => { event.preventDefault(); setPhotoOver(true); }}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setPhotoOver(false); }}
            onDrop={(event) => {
              event.preventDefault();
              setPhotoOver(false);
              readPhoto(event.dataTransfer.files?.[0]);
            }}
            className={`block cursor-pointer rounded-2xl border border-dashed bg-surface px-4 py-8 text-center text-sm text-muted ${photoOver ? "border-accent bg-sand" : "border-line"}`}
          >
            {photo ? (
              // Local preview of a file the user just picked. Next/Image cannot optimize a data URL.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Загруженное блюдо" className="mx-auto max-h-56 rounded-xl object-contain" />
            ) : (
              <span className="block">Перетащите фото сюда или выберите файл</span>
            )}
            <input type="file" accept="image/*" className="mt-3 block w-full text-sm" onChange={(event) => readPhoto(event.target.files?.[0])} />
          </label>
          {photo ? (
            <div className="flex justify-end">
              <Button variant="quiet" onClick={clearPhoto}>Удалить фото</Button>
            </div>
          ) : null}
          {photoStatus ? <p className="rounded-xl bg-sand px-4 py-3 text-sm leading-6">{photoStatus}</p> : null}
          <input
            value={photoQuery}
            onChange={(event) => setPhotoQuery(event.target.value)}
            placeholder="Добавить продукт: апельсин, курица…"
            className="h-11 w-full rounded-xl border border-line bg-surface px-4 outline-none focus:border-accent"
          />
          <FoodSuggestions
            local={searchLocalFoods(photoQuery)}
            remote={photoRemote}
            loading={photoSearching}
            onPickLocal={addProduct}
            onCustom={() => {
              const name = photoQuery.trim();
              if (!name) return;
              setItems((current) => [...current, { ...emptyItem(), name }]);
              if (!title || title === "Приём пищи" || title === "Тарелка") setTitle(name);
              setPhotoQuery("");
            }}
          />
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
          <div className="hidden gap-2 px-3 text-xs text-muted md:grid md:grid-cols-[minmax(0,1.4fr)_9rem_repeat(4,minmax(0,1fr))]">
            <span>Продукт</span>
            <span>Количество</span>
            <span>Ккал</span>
            <span>Белки</span>
            <span>Жиры</span>
            <span>Углеводы</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid gap-2 rounded-2xl border border-line bg-surface p-3 md:grid-cols-[minmax(0,1.4fr)_9rem_repeat(4,minmax(0,1fr))]">
              <Labeled label="Продукт">
                <input className="h-10 w-full rounded-lg border border-line bg-transparent px-2" value={item.name} onChange={(event) => update(item.id, { name: event.target.value })} placeholder="Продукт" />
              </Labeled>
              <Labeled label="Количество">
                <div className="flex gap-1">
                  <input className="h-10 w-16 rounded-lg border border-line bg-transparent px-2" value={item.grams} onChange={(event) => updateAmount(item.id, { grams: Number(event.target.value.replace(",", ".")) || 0 })} />
                  <select
                    className="h-10 flex-1 rounded-lg border border-line bg-transparent px-1 text-sm"
                    value={item.unit || "g"}
                    onChange={(event) => updateAmount(item.id, { unit: event.target.value as AmountUnit })}
                  >
                    <option value="g">г</option>
                    <option value="ml">мл</option>
                    <option value="portion">порция</option>
                  </select>
                </div>
                {item.unit === "portion" ? (
                  <label className="mt-1 block">
                    <span className="mb-1 block text-xs text-muted">Вес порции, г</span>
                    <input
                      className="h-10 w-full rounded-lg border border-line bg-transparent px-2"
                      value={item.portionWeight || 100}
                      onChange={(event) => updateAmount(item.id, { portionWeight: Number(event.target.value.replace(",", ".")) || 0 })}
                    />
                  </label>
                ) : null}
              </Labeled>
              <Labeled label="Ккал">
                <input className="h-10 w-full rounded-lg border border-line bg-transparent px-2" value={item.kcal} onChange={(event) => updateManual(item.id, { kcal: Number(event.target.value) || 0 })} />
              </Labeled>
              <Labeled label="Белки">
                <input className="h-10 w-full rounded-lg border border-line bg-transparent px-2" value={item.protein} onChange={(event) => updateManual(item.id, { protein: Number(event.target.value) || 0 })} />
              </Labeled>
              <Labeled label="Жиры">
                <input className="h-10 w-full rounded-lg border border-line bg-transparent px-2" value={item.fat} onChange={(event) => updateManual(item.id, { fat: Number(event.target.value) || 0 })} />
              </Labeled>
              <Labeled label="Углеводы">
                <input className="h-10 w-full rounded-lg border border-line bg-transparent px-2" value={item.carbs} onChange={(event) => updateManual(item.id, { carbs: Number(event.target.value) || 0 })} />
              </Labeled>
              <button type="button" className="text-left text-xs text-muted md:col-span-full" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}>Убрать</button>
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

  function updateAmount(id: string, patch: Partial<FoodItem>) {
    setItems((current) => current.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, ...patch };
      if (patch.unit && patch.unit !== item.unit) {
        if (patch.unit === "portion") {
          next.portionWeight = item.unit === "portion" ? item.portionWeight : item.grams || 100;
          next.grams = 1;
        } else if (item.unit === "portion") {
          next.grams = Math.round((item.grams || 1) * (item.portionWeight || 100));
        }
      }
      return scaleFood(next);
    }));
  }

  function updateManual(id: string, patch: Partial<FoodItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch, per100: undefined } : item)));
  }
}

function FoodSuggestions({
  local,
  remote,
  loading,
  onPickLocal,
  onCustom,
}: {
  local: { name: string; kcal: number; protein: number; fat: number; carbs: number }[];
  remote: RemoteFood[];
  loading: boolean;
  onPickLocal: (name: string, per100: RemoteFood["per100"]) => void;
  onCustom: () => void;
}) {
  if (!local.length && !remote.length && !loading) return null;
  return (
    <div className="rounded-2xl border border-line bg-surface p-2">
      <p className="px-2 py-1 text-xs text-muted">Выберите продукт или оставьте свою запись. Данные из базы — оценка на 100 г.</p>
      {local.map((food) => (
        <button key={food.name} type="button" className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-sand" onClick={() => onPickLocal(food.name, food)}>
          <span>{food.name}</span>
          <span className="text-muted">из списка · {food.kcal} ккал</span>
        </button>
      ))}
      {remote.map((food) => (
        <button key={food.id} type="button" className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-sand" onClick={() => onPickLocal(food.name, food.per100)}>
          <span>{food.name}</span>
          <span className="shrink-0 text-muted">база продуктов · {Math.round(food.per100.kcal)} ккал</span>
        </button>
      ))}
      {loading ? <p className="px-3 py-2 text-sm text-muted">Ищу в базе продуктов…</p> : null}
      <button type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm text-muted hover:bg-sand" onClick={onCustom}>
        Записать самостоятельно
      </button>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted md:hidden">{label}</span>
      {children}
    </label>
  );
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  }
}

function shrinkImage(dataUrl: string) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 768 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => reject(new Error("Не читается изображение"));
    image.src = dataUrl;
  });
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
