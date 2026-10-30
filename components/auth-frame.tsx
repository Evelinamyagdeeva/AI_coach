import Link from "next/link";

export function AuthFrame({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Aera
        </Link>
        <h1 className="mt-10 text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
