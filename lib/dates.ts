export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(date = new Date()) {
  return toISODate(date);
}

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(iso: string, days: number) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function weekdayMon0(iso: string) {
  return (parseISODate(iso).getDay() + 6) % 7;
}

export function mondayOf(iso: string) {
  return addDays(iso, -weekdayMon0(iso));
}

export function nextMonday(iso: string) {
  const delta = (7 - weekdayMon0(iso)) % 7;
  return addDays(iso, delta === 0 ? 7 : delta);
}

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
export const WEEKDAYS_FULL = [
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
  "воскресенье",
];

export function formatLong(iso: string) {
  const date = parseISODate(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatShort(iso: string) {
  const date = parseISODate(iso);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

export function formatWeekday(iso: string) {
  return WEEKDAYS_SHORT[weekdayMon0(iso)];
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

export function timeNow() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function timeFor(pref: "morning" | "day" | "evening") {
  if (pref === "morning") return "07:30";
  if (pref === "day") return "13:00";
  return "18:30";
}

export function timeLabel(pref: "morning" | "day" | "evening") {
  if (pref === "morning") return "утром";
  if (pref === "day") return "днём";
  return "вечером";
}

export const WEEKDAY_PATTERNS: { index: number; re: RegExp }[] = [
  { index: 0, re: /понедельник\w*|пн\b/ },
  { index: 1, re: /вторник\w*|вт\b/ },
  { index: 2, re: /сред[ауы]\w*|ср\b/ },
  { index: 3, re: /четверг\w*|чт\b/ },
  { index: 4, re: /пятниц\w*|пт\b/ },
  { index: 5, re: /суббот\w*|сб\b/ },
  { index: 6, re: /воскресень\w*|вс\b/ },
];

export function mentionedWeekdays(text: string) {
  return WEEKDAY_PATTERNS.filter((item) => item.re.test(text)).map((item) => item.index);
}

export function daysBetween(a: string, b: string) {
  const ms = parseISODate(b).getTime() - parseISODate(a).getTime();
  return Math.round(ms / 86400000);
}
