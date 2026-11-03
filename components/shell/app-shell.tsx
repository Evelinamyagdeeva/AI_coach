"use client";

import { Bell, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Composer } from "@/components/ai/composer";
import { ThemeToggle } from "@/components/theme-toggle";
import { BOTTOM, MORE, NAV, NavLink, isActive } from "@/components/shell/nav";
import { useApp } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useApp((state) => state.hydrated);
  const onboarded = useApp((state) => state.profile.onboarded);
  const unread = useApp((state) => state.notifications.filter((item) => !item.read).length);
  const [more, setMore] = useState(false);
  const focus = pathname.includes("/session");

  useEffect(() => {
    if (hydrated && !onboarded) router.replace("/");
  }, [hydrated, onboarded, router]);

  if (!hydrated || !onboarded) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="text-sm tracking-[0.18em] text-muted uppercase">Aera</p>
      </div>
    );
  }

  if (focus) return <div className="min-h-screen bg-bg">{children}</div>;

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href="/dashboard" className="px-3 text-lg font-semibold tracking-tight">
          Aera
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="space-y-2 border-t border-line pt-4">
          <NavLink href="/notifications" label={unread ? `Уведомления · ${unread}` : "Уведомления"} icon={Bell} />
          <NavLink href="/settings" label="Настройки" icon={Settings} />
          <NavLink href="/profile" label="Профиль" icon={UserRound} />
          <ThemeToggle compact />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line/80 bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            Aera
          </Link>
          <Link href="/notifications" className="relative grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface">
            <Bell size={18} strokeWidth={1.75} />
            {unread ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" /> : null}
          </Link>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 pb-40 md:px-8 md:py-8 lg:pb-32">{children}</main>
        <Composer />
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 px-2 py-2 backdrop-blur lg:hidden">
        {BOTTOM.map((item) => {
          const Icon = item.icon;
          const active = item.href === "#more" ? more : isActive(pathname, item.href);
          if (item.href === "#more") {
            return (
              <button key={item.label} type="button" onClick={() => setMore(true)} className="flex flex-col items-center gap-1 text-[11px] text-muted">
                <Icon size={18} strokeWidth={1.75} />
                {item.label}
              </button>
            );
          }
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 text-[11px] ${active ? "text-ink" : "text-muted"}`}>
              <Icon size={18} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {more ? (
        <div className="fixed inset-0 z-40 bg-ink/20 lg:hidden" onClick={() => setMore(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-line bg-surface p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <div className="grid gap-1">
              {MORE.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
            <div className="mt-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
