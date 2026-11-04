"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { NOTE_COLORS, noteColorClass, type NoteColor } from "@/services/noteService";

export default function NoteColorPicker({ value, onChange }: { value: NoteColor; onChange: (c: NoteColor) => void }) {
  const t = useTranslations("notes");
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("color")}>
      {NOTE_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={t(`colors.${c}`)}
          title={t(`colors.${c}`)}
          onClick={() => onChange(c)}
          className={cn(
            "grid size-8 place-items-center rounded-full border border-border transition",
            noteColorClass[c],
            value === c && "ring-2 ring-ring ring-offset-2 ring-offset-background",
          )}
        >
          {value === c && <Check className="size-4" />}
        </button>
      ))}
    </div>
  );
}
