"use client";

import { LayoutGrid, Rows3, Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Select, { type SelectOption } from "./Select";
import { useDebouncedSearch } from "@/hooks/useListParams";
import { cn } from "@/lib/utils";

export type FilterDef = { key: string; label: string; options: SelectOption[]; allLabel?: string };

/**
 * Search (debounced) + filter selects + sort + view toggle, with removable chips.
 * Fully controlled by URL state (see useListParams).
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

  return (
    <div className="mb-4 grid gap-3">
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
