export function normalize(text: string) {
  return text
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/\s+/g, " ")
    .trim();
}

export function areaFromText(text: string) {
  const t = normalize(text);
  if (/поясниц|спин/.test(t)) return "back";
  if (/колен/.test(t)) return "knee";
  if (/плеч/.test(t)) return "shoulder";
  if (/бег/.test(t)) return "run";
  if (/ног/.test(t)) return "legs";
  if (/пресс|кор/.test(t)) return "core";
  return undefined;
}

export function focusFromArea(area: string) {
  if (area === "legs" || area === "knee") return "lower" as const;
  if (area === "run") return "conditioning" as const;
  if (area === "core") return "core" as const;
  if (area === "shoulder" || area === "back") return "upper" as const;
  return "full" as const;
}
