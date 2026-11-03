import Link from "next/link";

export function NutritionTabs({ current }: { current: "diary" | "taste" }) {
  return (
    <div className="mt-4 flex gap-2">
      <Link href="/nutrition" className={`rounded-full border px-4 py-2 text-sm ${current === "diary" ? "border-transparent bg-button text-button-text" : "border-line text-muted"}`}>Дневник</Link>
      <Link href="/nutrition/taste" className={`rounded-full border px-4 py-2 text-sm ${current === "taste" ? "border-transparent bg-button text-button-text" : "border-line text-muted"}`}>Вкусы</Link>
    </div>
  );
}
