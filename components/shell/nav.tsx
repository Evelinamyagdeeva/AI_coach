"use client";

import {
  Bell,
  CalendarDays,
  ChefHat,
  Dumbbell,
  Home,
  Menu,
  MessageCircle,
  Salad,
  Settings,
  TrendingUp,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export const NAV = [
  { href: "/dashboard", label: "Главная", icon: Home },
  { href: "/coach", label: "AI-тренер", icon: MessageCircle },
  { href: "/workouts", label: "Тренировки", icon: Dumbbell },
  { href: "/planner", label: "План", icon: CalendarDays },
  { href: "/nutrition", label: "Питание", icon: Salad },
  { href: "/chef", label: "Шеф", icon: ChefHat },
  { href: "/progress", label: "Прогресс", icon: TrendingUp },
];

export const MORE = [
  { href: "/coach", label: "AI-тренер", icon: MessageCircle },
  { href: "/planner", label: "План", icon: CalendarDays },
  { href: "/chef", label: "Шеф", icon: ChefHat },
  { href: "/notifications", label: "Уведомления", icon: Bell },
  { href: "/profile", label: "Профиль", icon: UserRound },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export const BOTTOM = [
  { href: "/dashboard", label: "Главная", icon: Home },
  { href: "/workouts", label: "Тренировки", icon: Dumbbell },
  { href: "/nutrition", label: "Питание", icon: Salad },
  { href: "/progress", label: "Прогресс", icon: TrendingUp },
  { href: "#more", label: "Ещё", icon: Menu },
];

export function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({ href, label, icon: Icon, collapsed = false }: { href: string; label: string; icon: typeof Home; collapsed?: boolean }) {
  const pathname = usePathname();
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
        active ? "bg-sand text-ink" : "text-muted hover:bg-sand/70 hover:text-ink",
      )}
    >
      <Icon size={18} strokeWidth={1.75} />
      {collapsed ? null : label}
    </Link>
  );
}
