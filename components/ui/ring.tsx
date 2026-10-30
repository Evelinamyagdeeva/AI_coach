export function Ring({ value, label, sub }: { value: number; label: string; sub?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex items-center gap-4">
      <svg width="92" height="92" viewBox="0 0 92 92" className="-rotate-90">
        <circle cx="46" cy="46" r={radius} fill="none" stroke="var(--sand)" strokeWidth="8" />
        <circle
          cx="46"
          cy="46"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{label}</p>
        {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
      </div>
    </div>
  );
}

export function MacroLine({ label, value, total, tone = "accent" }: { label: string; value: number; total: number; tone?: "accent" | "mist" | "sand" }) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const color = tone === "mist" ? "bg-mist" : tone === "sand" ? "bg-[#d9cbb8]" : "bg-accent";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums">
          {Math.round(value)} <span className="text-muted">/ {Math.round(total)} г</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-sand">
        <div className={`bar-grow h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
