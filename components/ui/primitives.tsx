import { cn } from "@/lib/cn";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow)]", className)}>{children}</section>;
}

export function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm text-muted">{label}</span> : null}
      <input
        className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-ink outline-none transition focus:border-accent"
        {...props}
      />
    </label>
  );
}

export function TextArea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm text-muted">{label}</span> : null}
      <textarea
        className="min-h-28 w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition focus:border-accent"
        {...props}
      />
    </label>
  );
}

export function Chip({
  active,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border px-3 py-2 text-sm transition active:scale-[0.98]",
        active ? "border-accent bg-soft/40 text-ink" : "border-line bg-surface text-ink hover:border-accent",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{text}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-sm text-muted">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        {text ? <p className="mt-2 text-sm leading-6 text-muted">{text}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export function Disclaimer({ children }: { children?: React.ReactNode }) {
  return <p className="text-xs leading-5 text-muted">{children}</p>;
}
