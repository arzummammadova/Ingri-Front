import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-page", className)} {...props} />;
}

export function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("relative py-section", className)} {...props} />;
}

export function SectionTitle({
  kicker,
  title,
  text,
}: {
  kicker?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mb-6 max-w-2xl">
      {kicker && <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{kicker}</p>}
      <h1 className="text-title font-semibold text-foreground">{title}</h1>
      {text && <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>}
    </div>
  );
}

export function IconBox({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid size-12 place-items-center rounded-lg", className)}>{children}</div>;
}

export function StatTile({
  label,
  value,
  tone = "bg-lilac",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <article className={cn("rounded-xl p-5 text-ink shadow-soft", tone)}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
    </article>
  );
}

export function PersonAvatar({
  src,
  alt,
  className,
  crowned = false,
}: {
  src: string;
  alt: string;
  className?: string;
  crowned?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      {crowned && (
        <svg viewBox="0 0 64 36" className="absolute -top-4 left-1/2 z-10 w-8 -translate-x-1/2" aria-hidden="true">
          <path d="M6 30 12 10l12 12L32 4l8 18 12-12 6 20Z" className="fill-peach" />
          <path d="M8 32h48" className="stroke-peach" strokeWidth="4" />
        </svg>
      )}
      <img src={src} alt={alt} className="size-full rounded-full object-cover ring-2 ring-paper" />
    </div>
  );
}
