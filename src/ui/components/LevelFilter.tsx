"use client";

import { useTranslations } from "next-intl";
import type { useLevelFilter } from "@/hooks/useLevelFilter";

export default function LevelFilter({ filter }: { filter: ReturnType<typeof useLevelFilter> }) {
  const t = useTranslations("levels");
  const options = [
    ["active", t("activeOnly")],
    ["selected", t("selectedLevels")],
    ["all", t("allLevels")],
  ] as const;
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t("filter")}>
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          aria-pressed={filter.mode === key}
          onClick={() => filter.setMode(key)}
          className={`rounded-full px-3 py-2 text-sm font-semibold ${filter.mode === key ? "bg-lilac text-ink" : "bg-card text-foreground"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
