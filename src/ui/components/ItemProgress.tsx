"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useItemProgress } from "@/hooks/useCompletion";
import { cn } from "@/lib/utils";
import type { ItemKind } from "@/types";

export function CompletedBadge({ className }: { className?: string }) {
  const t = useTranslations("completion");
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-ink", className)}>
      <CheckCircle2 className="size-3.5" /> {t("completed")}
    </span>
  );
}

export default function ItemProgress({
  kind,
  slug,
  className,
  showEmpty = false,
}: {
  kind: ItemKind;
  slug: string;
  className?: string;
  showEmpty?: boolean;
}) {
  const t = useTranslations("completion");
  const item = useItemProgress(kind, slug);
  const percent = item?.completed ? 100 : Math.round(item?.percent || 0);
  if (!item && !showEmpty) return null;
  return (
    <div className={cn("mt-3 grid gap-1.5", className)}>
      {item?.completed ? (
        <CompletedBadge className="w-fit" />
      ) : (
        <span className="text-xs font-semibold text-muted-foreground">{t("progress", { percent })}</span>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn("h-full rounded-full transition-[width] duration-500 ease-fluid", item?.completed ? "bg-mint-deep" : "bg-lilac-deep")} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
