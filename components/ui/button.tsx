import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "quiet";
  size?: "md" | "sm";
};

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        size === "md" ? "h-11 rounded-[10px] px-4 text-sm" : "h-9 rounded-[10px] px-3 text-sm",
        variant === "primary" && "bg-button text-button-text hover:brightness-110",
        variant === "secondary" && "bg-sand text-ink hover:brightness-95",
        variant === "ghost" && "border border-line bg-surface text-ink hover:border-accent",
        variant === "quiet" && "text-muted hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}
