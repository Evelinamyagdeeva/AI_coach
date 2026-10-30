"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const options = [
  { id: "light", label: "Светлая", icon: Sun },
  { id: "dark", label: "Тёмная", icon: Moon },
  { id: "system", label: "Система", icon: Monitor },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-10" />;

  return (
    <div className={cn("grid gap-1 rounded-xl bg-sand p-1", compact ? "grid-cols-3" : "grid-cols-3")}>
      {options.map((option) => {
        const Icon = option.icon;
        const active = theme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setTheme(option.id)}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-[9px] text-xs transition",
              active ? "bg-surface text-ink shadow-[var(--shadow)]" : "text-muted hover:text-ink",
            )}
            aria-label={option.label}
          >
            <Icon size={14} strokeWidth={1.75} />
            {compact ? null : <span className="hidden xl:inline">{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
