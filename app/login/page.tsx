"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/auth-frame";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/primitives";
import { useApp } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const hydrated = useApp((state) => state.hydrated);
  const profile = useApp((state) => state.profile);
  const loadDemo = useApp((state) => state.loadDemo);

  return (
    <AuthFrame title="С возвращением" text="Профиль хранится только на этом устройстве. Пароль не нужен.">
      {hydrated && profile.onboarded ? (
        <div className="space-y-4">
          <p className="text-lg font-medium">{profile.name}</p>
          <p className="text-sm text-muted">{profile.email || "Локальный профиль"}</p>
          <Button className="w-full" onClick={() => router.push("/dashboard")}>
            Продолжить
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Имя" placeholder="Как к вам обращаться" disabled />
          <p className="text-sm leading-6 text-muted">Сохранённого профиля пока нет. Можно начать заново или открыть пример.</p>
          <Link href="/signup" className="block">
            <Button className="w-full">Создать профиль</Button>
          </Link>
        </div>
      )}
      <Button
        variant="ghost"
        className="mt-3 w-full"
        onClick={() => {
          loadDemo();
          router.push("/dashboard");
        }}
      >
        Открыть пример
      </Button>
    </AuthFrame>
  );
}

