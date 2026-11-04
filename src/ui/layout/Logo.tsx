import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Four-point star used as the dot of the "i" in the Ingri wordmark. */
export function BrandStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 0c.9 6.2 5.8 11.1 12 12-6.2.9-11.1 5.8-12 12-.9-6.2-5.8-11.1-12-12C6.2 11.1 11.1 6.2 12 0Z" fill="currentColor" />
    </svg>
  );
}

export function IngriMark({ className }: { className?: string }) {
  return <img src="/brand/ingri-mark.svg" alt="" className={cn("size-12 shrink-0 select-none", className)} draggable={false} />;
}

/**
 * Wordmark: "Ingr" + dotless ı with a star dot, in the Fredoka brand font.
 * The star sits right above the ı stem, just over x-height, like a normal tittle.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex items-baseline whitespace-nowrap font-brand font-bold leading-none tracking-tight", className)}>
      Ingr
      <span className="relative inline-block">
        ı
        <BrandStar className="absolute left-1/2 top-[0.06em] size-[0.32em] -translate-x-1/2" />
      </span>
    </span>
  );
}

type Tone = "auto" | "inverse";

const SIZES = {
  sm: ["size-10", "text-[1.6rem]"],
  md: ["size-11 sm:size-[3.25rem]", "text-[1.7rem] sm:text-[2rem]"],
  lg: ["size-16 sm:size-[4.5rem]", "text-[2.4rem] sm:text-[2.75rem]"],
} as const;

export default function Logo({
  tone = "auto",
  href = "/",
  className,
  size = "md",
  markOnly = false,
  hideWordmarkOnTiny = false,
}: {
  tone?: Tone;
  href?: string;
  className?: string;
  size?: keyof typeof SIZES;
  markOnly?: boolean;
  /** Hide the wordmark below 380px so a crowded header never overflows. */
  hideWordmarkOnTiny?: boolean;
}) {
  const [mark, text] = SIZES[size];
  return (
    <Link href={href} aria-label="Ingri" className={cn("flex min-w-0 shrink-0 items-center gap-2.5", className)}>
      <IngriMark className={mark} />
      {!markOnly && (
        <Wordmark
          className={cn(
            text,
            hideWordmarkOnTiny && "max-[379px]:hidden",
            tone === "inverse" ? "text-[#f5f6fb]" : "text-[#1b2453] dark:text-[#f5f6fb]",
          )}
        />
      )}
    </Link>
  );
}
