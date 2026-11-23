"use client";

import { Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LockInfo } from "@/types";
import { LEVEL_UNLOCK_PERCENT } from "@/services/contentService";

/** Shown instead of a lesson that is not open yet (sequential path). */
export default function LockedNotice({ lock, base, title }: { lock?: LockInfo; base: string; title?: string }) {
  const t = useTranslations("path");
  const locale = useLocale();
  const prevTitle = lock?.prev ? (locale === "az" && lock.prev.titleAz) || lock.prev.title : "";
  return (
    <div className="mx-auto grid max-w-xl gap-4 py-6">
      <Link href={base} className="text-sm font-semibold">← {t("backToPath")}</Link>
      <div className="glass grid justify-items-center gap-3 rounded-xl p-8 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-muted text-muted-foreground shadow-[0_6px_0_rgb(13_13_13/12%)]">
          <Lock className="size-9" />
        </span>
        {title && <p className="text-sm font-semibold text-muted-foreground">{title}</p>}
        <h1 className="text-xl font-semibold">{t("lockedTitle")}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {lock?.reason === "level"
            ? lock.gate
              ? t("lockedLevelGate", { level: lock.level || "", prev: lock.gate.level, percent: lock.ratio ? Math.round(lock.ratio * 100) : LEVEL_UNLOCK_PERCENT, done: lock.gate.done, required: lock.gate.required })
              : t("lockedLevel", { level: lock.level || "", percent: LEVEL_UNLOCK_PERCENT })
            : prevTitle ? t("lockedPrev", { title: prevTitle }) : t("lockedText")}
        </p>
        {lock?.reason === "level" && lock.gate && lock.gate.required > 0 && (
          <div className="w-full max-w-xs">
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-[#7c4dbd]" style={{ width: `${Math.min(100, Math.round((lock.gate.done / lock.gate.required) * 100))}%` }} />
            </div>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{t("unlockProgress", { done: lock.gate.done, required: lock.gate.required, level: lock.level || "" })}</p>
          </div>
        )}
        {lock?.prev && (
          <Link href={`${base}/${lock.prev.slug}`} className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            {t("goPrev")}
          </Link>
        )}
      </div>
    </div>
  );
}
