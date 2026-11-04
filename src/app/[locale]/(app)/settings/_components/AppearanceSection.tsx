"use client";

import { Check, Monitor, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { playSound } from "@/lib/sound";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ACCENTS, usePreferences, type Accent, type FontSize, type ThemePref } from "@/hooks/usePreferences";
import { cn } from "@/lib/utils";

const SWATCH: Record<Accent, string> = {
  ink: "#1b2453",
  lilac: "#b994ec",
  aqua: "#6fd0dc",
  peach: "#f7b98a",
  mint: "#8edba7",
  rose: "#f3a3bd",
  blue: "#8fb2f7",
};

function Segmented<V extends string>({ value, options, onChange, label }: { value: V; options: { value: V; label: string; icon?: React.ReactNode }[]; onChange: (v: V) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-1 rounded-full border border-border bg-card p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex h-9 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition",
            value === o.value ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted",
          )}
        >
          {o.icon}
          <span className="truncate">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function AppearanceSection() {
  const t = useTranslations("appearance");
  const { theme, setTheme } = useTheme();
  const { prefs, set } = usePreferences();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const currentTheme = (ready ? (theme as ThemePref) : prefs.theme) || "light";

  return (
    <section aria-labelledby="appearance-title" className="glass mt-4 grid gap-6 rounded-xl p-5">
      <div>
        <h2 id="appearance-title" className="text-lg font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("text")}</p>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-semibold">{t("theme")}</p>
        <Segmented<ThemePref>
          label={t("theme")}
          value={currentTheme}
          onChange={(v) => { setTheme(v); set({ theme: v }); }}
          options={[
            { value: "light", label: t("light"), icon: <Sun className="size-4" /> },
            { value: "dark", label: t("dark"), icon: <Moon className="size-4" /> },
            { value: "system", label: t("system"), icon: <Monitor className="size-4" /> },
          ]}
        />
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-semibold">{t("accent")}</p>
        <div role="radiogroup" aria-label={t("accent")} className="flex flex-wrap gap-3">
          {ACCENTS.map((accent) => (
            <button
              key={accent}
              type="button"
              role="radio"
              aria-checked={prefs.accent === accent}
              aria-label={t(`accents.${accent}`)}
              title={t(`accents.${accent}`)}
              onClick={() => set({ accent })}
              className={cn(
                "grid size-11 place-items-center rounded-full border-2 transition hover:scale-105",
                prefs.accent === accent ? "border-foreground" : "border-transparent",
              )}
              style={{ background: SWATCH[accent] }}
            >
              {prefs.accent === accent && <Check className={cn("size-5", accent === "ink" ? "text-white" : "text-ink")} />}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-semibold">{t("fontSize")}</p>
        <Segmented<FontSize>
          label={t("fontSize")}
          value={prefs.fontSize}
          onChange={(v) => set({ fontSize: v })}
          options={[
            { value: "small", label: t("small") },
            { value: "normal", label: t("normal") },
            { value: "large", label: t("large") },
          ]}
        />
      </div>

      <label className="flex items-center justify-between gap-4">
        <span>
          <span className="block text-sm font-semibold">{t("reducedMotion")}</span>
          <span className="block text-xs text-muted-foreground">{t("reducedMotionHint")}</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={prefs.reducedMotion}
          onClick={() => set({ reducedMotion: !prefs.reducedMotion })}
          className={cn("relative h-7 w-12 shrink-0 rounded-full transition", prefs.reducedMotion ? "bg-primary" : "bg-muted")}
        >
          <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-all", prefs.reducedMotion ? "left-6" : "left-1")} />
        </button>
      </label>
      <div className="grid gap-3 border-t border-border pt-5">
        <label className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            {prefs.sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            <span>
              <span className="block text-sm font-semibold">{t("sound")}</span>
              <span className="block text-xs text-muted-foreground">{t("soundHint")}</span>
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.sound}
            onClick={() => { const on = !prefs.sound; set({ sound: on }); if (on) setTimeout(() => playSound("pop"), 30); }}
            className={cn("relative h-7 w-12 shrink-0 rounded-full transition", prefs.sound ? "bg-primary" : "bg-muted")}
          >
            <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-all", prefs.sound ? "left-6" : "left-1")} />
          </button>
        </label>
        <div className={cn("flex items-center gap-3", !prefs.sound && "pointer-events-none opacity-50")}>
          <span className="w-20 text-sm font-semibold">{t("volume")}</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round(prefs.volume * 100)}
            aria-label={t("volume")}
            onChange={(e) => set({ volume: Number(e.target.value) / 100 })}
            onPointerUp={() => playSound("correct")}
            onKeyUp={() => playSound("click")}
            className="h-2 flex-1 cursor-pointer accent-[var(--primary)]"
          />
          <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{Math.round(prefs.volume * 100)}%</span>
          <button type="button" onClick={() => playSound("fanfare")} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">{t("test")}</button>
        </div>
      </div>
    </section>
  );
}
