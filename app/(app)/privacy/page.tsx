"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/primitives";
import { clearPhotos } from "@/lib/photos";
import { useApp } from "@/lib/store";

export default function PrivacyPage() {
  const router = useRouter();
  const photos = useApp((state) => state.photosEnabled);
  const setPhotos = useApp((state) => state.setPhotosEnabled);
  const erase = useApp((state) => state.erase);
  const [ask, setAsk] = useState<string | null>(null);

  async function run(scope: "workouts" | "meals" | "measurements" | "chat" | "photos" | "all") {
    if (scope === "photos" || scope === "all") await clearPhotos();
    erase(scope);
    setAsk(null);
    if (scope === "all") router.push("/");
  }

  return (
    <div className="max-w-2xl">
      <PageHeader eyebrow="Приватность" title="Ваши данные" text="Профиль, тренировки, еда, измерения и фото хранятся в этом браузере. Сервера Aera в этой версии нет." />
      <label className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-4 text-sm">
        Хранить фото прогресса
        <input type="checkbox" checked={photos} onChange={(event) => setPhotos(event.target.checked)} />
      </label>
      <div className="mt-6 space-y-3">
        {[
          ["workouts", "Удалить историю тренировок"],
          ["meals", "Удалить дневник питания"],
          ["measurements", "Удалить измерения"],
          ["chat", "Удалить диалог с тренером"],
          ["photos", "Удалить фото"],
          ["all", "Удалить всё на этом устройстве"],
        ].map(([scope, label]) => (
          <div key={scope} className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3">
            <span className="text-sm">{label}</span>
            {ask === scope ? (
              <span className="flex gap-2">
                <Button size="sm" onClick={() => run(scope as "all")}>Да</Button>
                <Button size="sm" variant="ghost" onClick={() => setAsk(null)}>Нет</Button>
              </span>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setAsk(scope)}>Удалить</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
