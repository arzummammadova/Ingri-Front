"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, Check, Headphones, Lock, Mic, Star, Trophy } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LEVEL_UNLOCK_PERCENT, LEVEL_UNLOCK_RATIO, progressService, type PathItem, type PathLevel } from "@/services/contentService";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import { IngriMark } from "@/ui/layout/Logo";
import { isNew } from "@/ui/components/ContentList";

/** Horizontal offsets (px) that make the path wind left and right like a trail. */
const WAVE = [0, 44, 70, 44, 0, -44, -70, -44];
const ICONS = [Headphones, Star, Mic, BookOpen];
const CHEST_EVERY = 4;

/** Brand colours for each part of the path (face / 3D edge). Completed nodes use the episode accent. */
const ACCENT: Record<string, { face: string; edge: string }> = {
  lilac: { face: "bg-[#c9a3ec]", edge: "shadow-[0_7px_0_#9d72c9]" },
  mint: { face: "bg-[#9fe0b0]", edge: "shadow-[0_7px_0_#6cbf84]" },
  peach: { face: "bg-[#f6cf7e]", edge: "shadow-[0_7px_0_#d8a94a]" },
  aqua: { face: "bg-[#9ddbe4]", edge: "shadow-[0_7px_0_#62b3bf]" },
};

function ChestIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden="true">
      {open ? (
        <>
          <path d="M8 22 L14 6 H50 L56 22 Z" fill="#f6cf7e" stroke="#0d0d0d" strokeWidth="3" strokeLinejoin="round" />
          <path d="M20 22 l4-8 h16 l4 8" fill="#fff6dc" />
          <circle cx="26" cy="15" r="3" fill="#ffd84d" />
          <circle cx="36" cy="13" r="2.4" fill="#ffd84d" />
        </>
      ) : (
        <path d="M6 24 C6 12 14 8 32 8 C50 8 58 12 58 24 Z" fill="#f6cf7e" stroke="#0d0d0d" strokeWidth="3" strokeLinejoin="round" />
      )}
      <rect x="6" y="24" width="52" height="26" rx="5" fill="#e9b35a" stroke="#0d0d0d" strokeWidth="3" />
      <rect x="27" y="20" width="10" height="14" rx="3" fill="#c9a3ec" stroke="#0d0d0d" strokeWidth="3" />
      <path d="M6 36 H27 M37 36 H58" stroke="#0d0d0d" strokeWidth="3" />
    </svg>
  );
}

type PathT = ReturnType<typeof useTranslations<"path">>;
/** "B1 opens after 80% of A2 (5/8)" — falls back to a generic line when the server sent no gate. */
function lockedLevelText(t: PathT, l: PathLevel) {
  return l.gate
    ? t("lockedLevelGate", { level: l.level, prev: l.gate.level, percent: LEVEL_UNLOCK_PERCENT, done: l.gate.done, required: l.gate.required })
    : t("lockedLevel", { level: l.level, percent: LEVEL_UNLOCK_PERCENT });
}

function LevelChips({ levels, value, onChange }: { levels: PathLevel[]; value: string; onChange: (level: string) => void }) {
  const t = useTranslations("path");
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="tablist" aria-label={t("title")}>
      {levels.map((l) => (
        <button
          key={l.level}
          type="button"
          role="tab"
          aria-selected={value === l.level}
          onClick={() => (l.unlocked ? onChange(l.level) : notify.info(lockedLevelText(t, l)))}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition",
            value === l.level ? "border-foreground bg-primary text-primary-foreground" : "border-border bg-card",
            !l.unlocked && "opacity-60",
          )}
        >
          {!l.unlocked ? <Lock className="size-3.5" /> : l.complete && l.total > 0 ? <Check className="size-3.5" /> : null}
          {l.level}
          {l.unlocked && l.total > 0 && <span className="text-[11px] font-semibold opacity-70">{l.done}/{l.total}</span>}
        </button>
      ))}
    </div>
  );
}

function Node({ item, index, title }: { item: PathItem; index: number; title: string }) {
  const t = useTranslations("path");
  const Icon = ICONS[index % ICONS.length];
  const accent = ACCENT[item.accent || "lilac"] || ACCENT.lilac;
  const face = item.locked
    ? "bg-[#e3e6ea] text-[#9aa3ad] shadow-[0_7px_0_#c3c9d0] dark:bg-[#2a2a2a] dark:text-[#6b6b6b] dark:shadow-[0_7px_0_#1a1a1a]"
    : item.completed
      ? `${accent.face} ${accent.edge} text-ink`
      : "bg-primary text-primary-foreground shadow-[0_7px_0_#5b5b5b] dark:shadow-[0_7px_0_#9a9a9a]";
  const body = (
    <span className="relative grid place-items-center">
      {item.current && (
        <>
          <span className="absolute -top-12 z-[2] animate-bounce whitespace-nowrap rounded-xl border-2 border-border bg-card px-3 py-1.5 text-xs font-extrabold tracking-wide text-foreground shadow-sm">
            {item.percent > 0 ? t("continue").toUpperCase() : t("start")}
            <span className="absolute -bottom-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-border bg-card" />
          </span>
          <span className="absolute size-[5.6rem] rounded-full border-[6px] border-[var(--lilac)] opacity-90" />
        </>
      )}
      <span className={cn("relative grid size-[4.5rem] place-items-center rounded-full transition-transform duration-150 active:translate-y-1.5 active:shadow-none", face)}>
        {/* glossy highlight for a soft 3D look */}
        <span className="pointer-events-none absolute left-3 top-2 h-3 w-7 rounded-full bg-white/35" />
        {item.locked ? <Lock className="size-7" /> : <Icon className="size-8" strokeWidth={2.6} fill={item.completed && Icon === Star ? "currentColor" : "none"} />}
        {item.completed && (
          <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-card bg-[#1f9d55] text-white">
            <Check className="size-3.5" strokeWidth={3.5} />
          </span>
        )}
        {!item.completed && !item.locked && isNew(item) && (
          <span className="absolute -right-2 -top-1 rounded-full bg-[#ff5d8f] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">{t("new")}</span>
        )}
      </span>
    </span>
  );
  const label = <span className={cn("mt-3 line-clamp-2 max-w-[9.5rem] text-center text-xs font-semibold leading-tight", item.locked && "text-muted-foreground")}>{title}</span>;
  if (item.locked) {
    return (
      <button type="button" aria-label={`${title} · ${t("locked")}`} onClick={() => notify.info(t("lockedText"))} className="grid cursor-not-allowed justify-items-center">
        {body}
        {label}
      </button>
    );
  }
  return (
    <Link href={`${routes.podcasts}/${item.slug}`} aria-label={title} className="grid justify-items-center focus-visible:outline-none">
      {body}
      {label}
    </Link>
  );
}

export default function PodcastPath() {
  const t = useTranslations("path");
  const locale = useLocale();
  const { user } = useAuth();
  const [level, setLevel] = useState<string>("");
  useEffect(() => {
    if (!level && user) setLevel(user.activeLevel || user.level || "A1");
  }, [user, level]);
  const query = useQuery({
    queryKey: ["path", "podcast", level],
    queryFn: () => progressService.path("podcast", level),
    enabled: !!user && !!level,
  });
  const data = query.data;
  const titleOf = (item: PathItem) => (locale === "az" && item.titleAz) || item.title || item.slug;
  const current = data?.items.find((item) => item.current);
  const lvl = data?.levels.find((l) => l.level === data.level);
  const nextLevel = data ? data.levels[data.levels.findIndex((l) => l.level === data.level) + 1] : undefined;
  const percent = lvl && lvl.total ? Math.round((lvl.done / lvl.total) * 100) : 0;
  const currentIndex = data?.items.findIndex((item) => item.current) ?? -1;
  const mascotAt = currentIndex >= 0 ? currentIndex : Math.max(0, (data?.items.length || 1) - 1);

  const rows = useMemo(() => {
    if (!data) return [];
    const out: ({ type: "node"; item: PathItem; index: number } | { type: "chest"; open: boolean; left: number; key: string })[] = [];
    data.items.forEach((item, index) => {
      out.push({ type: "node", item, index });
      if ((index + 1) % CHEST_EVERY === 0 && index < data.items.length - 1) {
        const group = data.items.slice(index + 1 - CHEST_EVERY, index + 1);
        out.push({ type: "chest", open: group.every((g) => g.completed), left: group.filter((g) => !g.completed).length, key: `chest-${index}` });
      }
    });
    return out;
  }, [data]);

  if (!user) return null;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
      <div className="grid min-w-0 gap-4">
        {data && <LevelChips levels={data.levels} value={data.level} onChange={setLevel} />}

        {/* unit banner */}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#7c4dbd] px-5 py-4 text-white shadow-[0_5px_0_#5b3592]">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-white/75">{t("title")}</p>
            <p className="text-lg font-bold">{t("unit", { level: data?.level || level })}</p>
            {lvl && <p className="text-sm text-white/85">{t("progress", { done: lvl.done, total: lvl.total })}</p>}
          </div>
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15 text-sm font-extrabold">{percent}%</div>
        </div>

        {query.isLoading || !data ? (
          <div className="grid justify-items-center gap-10 py-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="size-[4.5rem] animate-pulse rounded-full bg-card" style={{ transform: `translateX(${WAVE[i % WAVE.length]}px)` }} />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <div className="glass rounded-xl p-6 text-center text-sm text-muted-foreground">{t("empty")}</div>
        ) : (
          <ol className="relative mx-auto grid w-full max-w-md justify-items-center gap-14 pb-10 pt-14">
            {rows.map((row, i) => {
              const x = WAVE[i % WAVE.length];
              if (row.type === "chest") {
                return (
                  <li key={row.key} style={{ transform: `translateX(${x}px)` }}>
                    <button
                      type="button"
                      onClick={() => notify.info(row.open ? t("chestOpen") : t("chestClosed", { n: row.left }))}
                      aria-label={t("chest")}
                      className={cn("grid size-20 place-items-center rounded-2xl transition hover:scale-105", !row.open && "grayscale-[0.6] opacity-80")}
                    >
                      <ChestIcon open={row.open} className="w-16 drop-shadow-[0_5px_0_rgb(13_13_13/18%)]" />
                    </button>
                  </li>
                );
              }
              const side = x >= 0 ? "right-full mr-6" : "left-full ml-6";
              return (
                <Fragment key={row.item.slug}>
                  <li className="relative" style={{ transform: `translateX(${x}px)` }}>
                    <Node item={row.item} index={row.index} title={titleOf(row.item)} />
                    {row.index === mascotAt && (
                      <div className={cn("pointer-events-none absolute top-0 hidden w-28 flex-col items-center gap-1 min-[380px]:flex", side)}>
                        <span className="rounded-xl bg-card px-2 py-1 text-center text-[10px] font-semibold shadow-sm">{t("mascot")}</span>
                        <IngriMark className="size-16 animate-[ingri-float_3s_ease-in-out_infinite] drop-shadow-[0_6px_0_rgb(13_13_13/12%)]" />
                      </div>
                    )}
                  </li>
                </Fragment>
              );
            })}
            {/* level badge at the end of the unit */}
            <li className="mt-2 grid justify-items-center gap-2 text-center">
              <span className={cn("grid size-24 place-items-center rounded-full border-4 text-2xl font-extrabold", lvl?.complete ? "border-[#e9b35a] bg-[#fbe6b5] text-ink shadow-[0_7px_0_#d8a94a]" : "border-border bg-card text-muted-foreground shadow-[0_7px_0_rgb(13_13_13/10%)]")}>
                {lvl?.complete ? <Trophy className="size-10" /> : data.level}
              </span>
              <p className="text-sm font-bold">{lvl?.complete ? t("allDone") : t("unit", { level: data.level })}</p>
              {nextLevel && (
                <p className="text-xs text-muted-foreground">
                  {nextLevel.unlocked ? (
                    `→ ${nextLevel.level}`
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Lock className="size-3" />
                      {nextLevel.gate ? t("unlockProgress", { done: nextLevel.gate.done, required: nextLevel.gate.required, level: nextLevel.level }) : `${nextLevel.level} · ${t("levelLocked")}`}
                    </span>
                  )}
                </p>
              )}
            </li>
          </ol>
        )}
      </div>

      {/* desktop side panel */}
      <aside className="hidden gap-4 lg:sticky lg:top-24 lg:grid">
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("unit", { level: data?.level || level })}</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-[#7c4dbd] transition-all" style={{ width: `${percent}%` }} />
          </div>
          {lvl && <p className="mt-2 text-sm font-semibold">{t("progress", { done: lvl.done, total: lvl.total })}</p>}
          {lvl && nextLevel && lvl.total > 0 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {nextLevel.unlocked ? (
                t("nextOpen", { level: nextLevel.level })
              ) : (
                <>
                  <Lock className="size-3" />
                  {t("unlockHint", { percent: LEVEL_UNLOCK_PERCENT, level: nextLevel.level, left: Math.max(0, (lvl.required ?? Math.ceil(lvl.total * LEVEL_UNLOCK_RATIO)) - lvl.done) })}
                </>
              )}
            </p>
          )}
        </div>
        {current ? (
          <Link href={`${routes.podcasts}/${current.slug}`} className="glass grid gap-2 rounded-xl p-5 transition hover:-translate-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("nextUp")}</p>
            <p className="font-semibold">{titleOf(current)}</p>
            {(current.summaryAz || current.summary) && <p className="line-clamp-3 text-sm text-muted-foreground">{locale === "az" ? current.summaryAz || current.summary : current.summary}</p>}
            <span className="mt-1 w-fit rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{current.percent > 0 ? t("continue") : t("start")}</span>
          </Link>
        ) : (
          lvl?.complete && <div className="glass rounded-xl p-5 text-sm font-semibold">{t("allDone")}</div>
        )}
        <div className="flex items-center gap-3 rounded-xl bg-lilac p-4 text-ink">
          <IngriMark className="size-12" />
          <p className="text-sm font-semibold">{t("mascot")}</p>
        </div>
      </aside>
    </div>
  );
}
