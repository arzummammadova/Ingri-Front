"use client";

import { useTranslations } from "next-intl";
import { cn, defaultAvatar } from "@/lib/utils";

export type Gender = "female" | "male" | "";

/** Optional gender segmented control (female / male / not set). */
export default function GenderPicker({ value, onChange, className }: { value: Gender; onChange: (value: Gender) => void; className?: string }) {
  const t = useTranslations("auth");
  const options: { value: Gender; label: string }[] = [
    { value: "female", label: t("genderFemale") },
    { value: "male", label: t("genderMale") },
    { value: "", label: t("genderSkip") },
  ];
  return (
    <fieldset className={cn("grid gap-1.5", className)}>
      <legend className="mb-1.5 text-sm font-semibold">
        {t("gender")} <span className="font-normal text-muted-foreground">({t("optional")})</span>
      </legend>
      <div role="radiogroup" className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-muted/50 p-1">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value || "none"}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200",
                active ? "bg-card text-foreground shadow-sm ring-1 ring-lilac-deep/40" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <img src={defaultAvatar(option.value)} alt="" className={cn("size-6 rounded-full transition", !active && "opacity-70 grayscale-[30%]")} />
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
