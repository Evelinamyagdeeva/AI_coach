"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { todayISO } from "@/lib/dates";
import { uid } from "@/lib/id";
import { clearPhotos, deletePhoto, listPhotos, savePhoto, type ProgressPhoto } from "@/lib/photos";
import { useApp } from "@/lib/store";

export default function PhotosPage() {
  const enabled = useApp((state) => state.photosEnabled);
  const setEnabled = useApp((state) => state.setPhotosEnabled);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (enabled) void listPhotos().then(setPhotos);
  }, [enabled]);

  if (!enabled) {
    return (
      <EmptyState
        title="Фотоархив выключен"
        text="Снимки не хранятся, пока отслеживание выключено. Включить можно только для этого браузера."
        action={<Button onClick={() => setEnabled(true)}>Включить</Button>}
      />
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Только вы" title="Фото прогресса" text="Снимки лежат в этом браузере и не уходят на сервер." />
      <label className="block max-w-md rounded-2xl border border-dashed border-line bg-surface p-5 text-sm">
        Добавить снимок
        <input
          type="file"
          accept="image/*"
          className="mt-3 block w-full"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async () => {
              const photo = { id: uid("photo"), date: todayISO(), note, dataUrl: String(reader.result || "") };
              await savePhoto(photo);
              setPhotos(await listPhotos());
              setNote("");
            };
            reader.readAsDataURL(file);
          }}
        />
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Короткая заметка" className="mt-3 h-11 w-full rounded-xl border border-line px-3 outline-none" />
      </label>
      {photos.length === 0 ? <p className="mt-8 text-sm text-muted">Архив пуст.</p> : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <figure key={photo.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
              {/* Local private archive, stored only in this browser. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.dataUrl} alt={photo.note || "Фото прогресса"} className="h-64 w-full object-cover" />
              <figcaption className="flex items-center justify-between px-3 py-3 text-sm">
                <span>{photo.date} {photo.note}</span>
                <button type="button" className="text-muted" onClick={async () => { await deletePhoto(photo.id); setPhotos(await listPhotos()); }}>Удалить</button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <Button className="mt-8" variant="quiet" onClick={async () => { await clearPhotos(); setPhotos([]); }}>Удалить все фото</Button>
    </div>
  );
}
