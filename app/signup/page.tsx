"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFrame } from "@/components/auth-frame";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/primitives";
import { useApp } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const startFresh = useApp((state) => state.startFresh);
  const onboarded = useApp((state) => state.profile.onboarded);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState(false);

  function start() {
    if (!name.trim()) return;
    if (onboarded && !confirm) {
      setConfirm(true);
      return;
    }
    startFresh(name, email);
    router.push("/onboarding");
  }

  return (
    <AuthFrame title="Создать профиль" text="Дальше будет короткий разговор, не анкета на десять страниц.">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          start();
        }}
      >
        <Field label="Имя" value={name} onChange={(event) => setName(event.target.value)} placeholder="Алина" required />
        <Field label="Почта" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="для себя, никуда не отправляется" />
        {confirm ? <p className="text-sm leading-6 text-muted">На этом устройстве уже есть профиль. Новый старт заменит его только здесь.</p> : null}
        <Button className="w-full" type="submit">
          {confirm ? "Заменить и продолжить" : "Продолжить"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Уже есть профиль?{" "}
        <Link href="/login" className="text-ink">
          Войти
        </Link>
      </p>
    </AuthFrame>
  );
}
