"use client";

import Link from "next/link";
import { useEffect } from "react";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { useApp } from "@/lib/store";

export default function NotificationsPage() {
  const items = useApp((state) => state.notifications);
  const mark = useApp((state) => state.markAllRead);
  useEffect(() => { mark(); }, [mark]);

  return (
    <div>
      <PageHeader eyebrow="Внутри приложения" title="Уведомления" text="Здесь только события плана. Браузерные пуши не используются." />
      {items.length === 0 ? <EmptyState title="Пока тихо" text="Когда план, еда или вес изменятся, здесь появится короткая запись." /> : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link key={item.id} href={item.href || "/dashboard"} className="block rounded-2xl border border-line bg-surface px-4 py-4">
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{item.body}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
