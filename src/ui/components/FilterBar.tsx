"use client";

import { LayoutGrid, Rows3, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import Select, { type SelectOption } from "./Select";
import { useDebouncedSearch } from "@/hooks/useListParams";
import { cn } from "@/lib/utils";

export type FilterDef = { key: string; label: string; options: SelectOption[]; allLabel?: string };

/**
 * Search (debounced) + filter selects + sort + view toggle, with removable chips.
 * Controlled by session list state (see useListParams). On mobile, filters/sort live in a bottom sheet.
 */
export default function FilterBar({
  q,
  onSearch,
  filters,
  values,
  defaults,
  onFilter,
  sortOptions,
  sort,
  order,
  onSort,
  view,
  onView,
  total,
  extra,
  hideCompleted,
}: {
  q: string;
  onSearch: (q: string) => void;
  filters: FilterDef[];
  values: Record<string, string>;
  defaults?: Record<string, string>;
  onFilter: (patch: Record<string, string>) => void;
  sortOptions?: SelectOption[];
  sort?: string;
  order?: "asc" | "desc";
  onSort?: (sort: string, order: "asc" | "desc") => void;
  view?: "table" | "grid";
  onView?: (view: "table" | "grid") => void;
  total?: number;
  extra?: React.ReactNode;
  hideCompleted?: { value: boolean; onChange: (value: boolean) => void };
}) {
  const t = useTranslations("datatable");
  const [text, setText] = useDebouncedSearch(q, onSearch);
  const chips = filters.filter((f) => values[f.key] && values[f.key] !== "all");
  const hasAny = chips.length > 0 || !!q;
  const reset = () => {
    setText("");
    onFilter(Object.fromEntries(filters.map((f) => [f.key, "all"])));
    if (q) onSearch("");
  };

  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [draftSort, setDraftSort] = useState("");
  const [draftHide, setDraftHide] = useState(false);
  useEffect(() => {
    if (!sheet) return;
    setDraft(Object.fromEntries(filters.map((f) => [f.key, values[f.key] || "all"])));
    setDraftSort(`${sort}:${order}`);
    setDraftHide(!!hideCompleted?.value);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet]);
  const apply = () => {
    onFilter(draft);
    if (hideCompleted && draftHide !== hideCompleted.value) hideCompleted.onChange(draftHide);
    if (onSort && draftSort && draftSort !== `${sort}:${order}`) { const [s2, d2] = draftSort.split(":"); onSort(s2, d2 as "asc" | "desc"); }
    setSheet(false);
  };
  const resetDraft = () => {
    setDraft(Object.fromEntries(filters.map((f) => [f.key, "all"])));
    if (sortOptions?.[0]) setDraftSort(`${sortOptions[0].value}:desc`);
    setDraftHide(false);
  };
  const selectCls = "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const sheetEl = sheet && typeof document !== "undefined" ? createPortal(
    <div className="fixed inset-0 z-[80] sm:hidden" role="dialog" aria-modal="true" aria-label={t("filters")}>
      <button type="button" aria-label={t("close")} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setSheet(false)} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-background p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("filters")}</h2>
          <button type="button" onClick={() => setSheet(false)} aria-label={t("close")} className="grid size-9 place-items-center rounded-full hover:bg-muted"><X className="size-4" /></button>
        </div>
        <div className="grid gap-4">
          {filters.map((f) => (
            <label key={f.key} className="grid gap-1.5 text-sm font-semibold">
              {f.label}
              <select className={selectCls} value={draft[f.key] || "all"} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}>
                <option value="all">{t("all")}</option>
                {f.options.map((o) => <option key={o.value} value={o.value}>{typeof o.label === "string" ? o.label : o.value}</option>)}
              </select>
            </label>
          ))}
          {sortOptions && onSort && (
            <label className="grid gap-1.5 text-sm font-semibold">
              {t("sortBy")}
              <select className={selectCls} value={draftSort} onChange={(e) => setDraftSort(e.target.value)}>
                {sortOptions.flatMap((o) => [
                  <option key={`${o.value}:asc`} value={`${o.value}:asc`}>{typeof o.label === "string" ? o.label : o.value} ↑</option>,
                  <option key={`${o.value}:desc`} value={`${o.value}:desc`}>{typeof o.label === "string" ? o.label : o.value} ↓</option>,
                ])}
              </select>
            </label>
          )}
          {hideCompleted && (
            <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold">
              {t("hideCompleted")}
              <input type="checkbox" className="size-5 accent-[var(--primary)]" checked={draftHide} onChange={(e) => setDraftHide(e.target.checked)} />
            </label>
          )}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={resetDraft} className="h-11 rounded-full border border-border font-semibold">{t("reset")}</button>
          <button type="button" onClick={apply} className="h-11 rounded-full bg-primary font-semibold text-primary-foreground">{t("apply")}</button>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div className="mb-4 grid gap-3">
      {sheetEl}
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[12rem] flex-1 basis-full sm:basis-64">
          <span className="sr-only">{t("search")}</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-9 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          />
          {text && (
            <button type="button" onClick={() => setText("")} aria-label={t("clearSearch")} className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full hover:bg-muted">
              <X className="size-3.5" />
            </button>
          )}
        </label>
        {(filters.length > 0 || (sortOptions && onSort)) && (
          <button type="button" onClick={() => setSheet(true)} aria-label={t("filters")} className="relative grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card sm:hidden">
            <SlidersHorizontal className="size-4" />
            {(chips.length + (hideCompleted?.value ? 1 : 0)) > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{chips.length + (hideCompleted?.value ? 1 : 0)}</span>}
          </button>
        )}
        <div className="hidden sm:contents">
        <span className="hidden items-center text-muted-foreground sm:flex" aria-hidden="true"><SlidersHorizontal className="size-4" /></span>
        {filters.map((f) => (
          <Select
            key={f.key}
            ariaLabel={f.label}
            value={values[f.key] || "all"}
            minWidth={170}
            className="w-[9.5rem] max-sm:flex-1"
            options={[{ value: "all", label: f.allLabel || `${f.label}: ${t("all")}` }, ...f.options]}
            renderValue={(o) => (
              <span className="truncate">
                <span className="text-muted-foreground">{f.label}: </span>
                {o && o.value !== "all" ? o.label : t("all")}
              </span>
            )}
            onChange={(v) => onFilter({ [f.key]: v })}
          />
        ))}
        {sortOptions && onSort && (
          <Select
            ariaLabel={t("sortBy")}
            value={`${sort}:${order}`}
            minWidth={200}
            align="end"
            className="w-[10.5rem] max-sm:flex-1"
            options={sortOptions.flatMap((o) => [
              { value: `${o.value}:asc`, label: <>{o.label} ↑</> },
              { value: `${o.value}:desc`, label: <>{o.label} ↓</> },
            ])}
            renderValue={(o) => <span className="truncate"><span className="text-muted-foreground">{t("sort")}: </span>{o?.label}</span>}
            onChange={(v) => { const [s, d] = v.split(":"); onSort(s, d as "asc" | "desc"); }}
          />
        )}
        {hideCompleted && (
          <button
            type="button"
            role="switch"
            aria-checked={hideCompleted.value}
            data-sound="click"
            onClick={() => hideCompleted.onChange(!hideCompleted.value)}
            className={cn("inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition", hideCompleted.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}
          >
            <span className={cn("relative h-4 w-7 rounded-full transition", hideCompleted.value ? "bg-primary-foreground/40" : "bg-muted")}>
              <span className={cn("absolute top-0.5 size-3 rounded-full bg-current transition-all", hideCompleted.value ? "left-3.5" : "left-0.5")} />
            </span>
            {t("hideCompleted")}
          </button>
        )}
        </div>
        {view && onView && (
          <div role="group" aria-label={t("view")} className="ml-auto flex shrink-0 rounded-full border border-border bg-card p-1">
            {(["table", "grid"] as const).map((v) => {
              const Icon = v === "table" ? Rows3 : LayoutGrid;
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  aria-label={t(v)}
                  title={t(v)}
                  onClick={() => onView(v)}
                  className={cn("grid size-8 place-items-center rounded-full transition", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>
        )}
        {extra}
      </div>
      {(hasAny || total !== undefined) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {total !== undefined && <span className="font-semibold text-muted-foreground">{t("results", { count: total })}</span>}
          {q && (
            <button type="button" onClick={() => { setText(""); onSearch(""); }} className="inline-flex items-center gap-1 rounded-full bg-lilac px-2.5 py-1 font-semibold text-ink">
              “{q}” <X className="size-3" />
            </button>
          )}
          {chips.map((f) => {
            const option = f.options.find((o) => o.value === values[f.key]);
            const isDefault = defaults?.[f.key] === values[f.key];
            return (
              <button key={f.key} type="button" onClick={() => onFilter({ [f.key]: "all" })} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-ink", isDefault ? "bg-aqua" : "bg-mint")} aria-label={`${t("remove")} ${f.label}`}>
                {f.label}: {option?.label ?? values[f.key]} <X className="size-3" />
              </button>
            );
          })}
          {hasAny && (
            <button type="button" onClick={reset} className="font-semibold text-muted-foreground underline-offset-2 hover:underline">{t("clearAll")}</button>
          )}
        </div>
      )}
    </div>
  );
}
