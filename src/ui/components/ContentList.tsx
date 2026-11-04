"use client";

import { Suspense, useMemo, type ReactNode } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchPage } from "@/services/listService";
import { useListParams } from "@/hooks/useListParams";
import { useAuth } from "@/hooks/useAuth";
import { LEVELS } from "@/lib/levels";
import { SectionTitle } from "./primitives";
import DataTable, { EmptyState, Pagination, type DataTableColumn } from "./DataTable";
import FilterBar, { type FilterDef } from "./FilterBar";
import type { SelectOption } from "./Select";

export type FacetFilter = { key: string; label: string; format?: (value: string) => ReactNode };

export type ContentListProps<T> = {
  /** API path, e.g. "/videos" */
  path: string;
  queryKey: string;
  title: string;
  text?: string;
  columns: DataTableColumn<T>[];
  renderCard: (item: T) => ReactNode;
  hrefFor: (item: T) => string;
  getKey?: (item: T) => string;
  /** Extra filters whose options come from the server facets. */
  facets?: FacetFilter[];
  sortOptions: SelectOption[];
  defaultSort: string;
  defaultView?: "table" | "grid";
  gridClassName?: string;
  headerExtra?: ReactNode;
  /** Default the level filter to the user's active level (like the old "active only" mode). */
  levelDefault?: "active" | "all";
};

function Inner<T extends { slug: string }>(props: ContentListProps<T>) {
  const t = useTranslations("datatable");
  const { user } = useAuth();
  const activeLevel = user?.activeLevel || user?.level || "";
  const filterKeys = useMemo(() => ["level", ...(props.facets || []).map((f) => f.key)], [props.facets]);
  const defaultFilters = useMemo(
    () => ({ level: props.levelDefault === "all" || !activeLevel ? "all" : activeLevel }),
    [props.levelDefault, activeLevel],
  );
  const defaults = useMemo(
    () => ({ sort: props.defaultSort, view: props.defaultView || "grid", limit: 12, filters: defaultFilters }),
    [props.defaultSort, props.defaultView, defaultFilters],
  );
  const { state, set } = useListParams({ filterKeys, defaults });

  const params = { page: state.page, limit: state.limit, sort: state.sort, order: state.order, q: state.q, ...state.filters };
  const query = useQuery({
    queryKey: [props.queryKey, "page", params],
    queryFn: () => fetchPage<T>(props.path, params),
    placeholderData: keepPreviousData,
    enabled: !!user || props.levelDefault === "all",
  });
  const data = query.data;
  const facets = data?.facets || {};

  const filters: FilterDef[] = [
    { key: "level", label: t("level"), options: (facets.level?.length ? facets.level : [...LEVELS]).map((l) => ({ value: l, label: l, hint: l === activeLevel ? t("active") : undefined })) },
    ...(props.facets || []).map((f) => ({
      key: f.key,
      label: f.label,
      options: (facets[f.key] || []).map((v) => ({ value: v, label: f.format ? f.format(v) : v })),
    })),
  ];

  const pagination = data
    ? {
        page: data.page,
        pages: data.pages,
        total: data.total,
        limit: data.limit,
        onPage: (page: number) => { set({ page }, { resetPage: false }); window.scrollTo({ top: 0, behavior: "smooth" }); },
        onLimit: (limit: number) => set({ limit }),
      }
    : undefined;

  const loading = query.isLoading || (!data && query.isFetching);
  const empty = (
    <EmptyState
      action={
        <button type="button" onClick={() => set({ q: "", filters: Object.fromEntries(filterKeys.map((k) => [k, "all"])) })} className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {t("clearAll")}
        </button>
      }
    />
  );

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <SectionTitle title={props.title} text={props.text} />
        {props.headerExtra}
      </div>
      <FilterBar
        q={state.q}
        onSearch={(q) => set({ q })}
        filters={filters}
        values={state.filters}
        defaults={defaultFilters}
        onFilter={(patch) => set({ filters: patch })}
        sortOptions={props.sortOptions}
        sort={state.sort}
        order={state.order}
        onSort={(sort, order) => set({ sort, order })}
        view={state.view}
        onView={(view) => set({ view }, { resetPage: false })}
        total={data?.total}
      />
      {query.isError ? (
        <div className="glass rounded-xl p-6">
          <p>{t("error")}</p>
          <button type="button" onClick={() => query.refetch()} className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{t("retry")}</button>
        </div>
      ) : state.view === "grid" ? (
        <div>
          {loading ? (
            <div className={props.gridClassName || "grid gap-4 md:grid-cols-2"}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-xl bg-card" />)}
            </div>
          ) : data && data.items.length ? (
            <div className={`${props.gridClassName || "grid gap-4 md:grid-cols-2"} transition-opacity ${query.isFetching ? "opacity-70" : ""}`}>
              {data.items.map((item) => (
                <div key={props.getKey?.(item) || item.slug} className="relative grid">
                  {props.renderCard(item)}
                  {isNew(item) && <NewBadge />}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl">{empty}</div>
          )}
          {pagination && pagination.total > 0 && <Pagination {...pagination} className="glass mt-4 rounded-xl px-4 py-3" />}
        </div>
      ) : (
        <DataTable<T>
          rows={data?.items || []}
          columns={props.columns}
          getRowKey={(row) => props.getKey?.(row) || row.slug}
          loading={loading}
          fetching={query.isFetching}
          sort={{ sort: state.sort, order: state.order, onSort: (sort, order) => set({ sort, order }) }}
          rowHref={props.hrefFor}
          renderLink={(href, children, className) => <Link href={href} className={className}>{children}</Link>}
          pagination={pagination}
          empty={empty}
        />
      )}
    </div>
  );
}

const NEW_MS = 14 * 24 * 60 * 60 * 1000;
export function isNew(item: unknown) {
  const raw = (item as { publishedAt?: string; createdAt?: string })?.publishedAt || (item as { createdAt?: string })?.createdAt;
  const at = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(at) && Date.now() - at < NEW_MS;
}

export function NewBadge({ className = "" }: { className?: string }) {
  const t = useTranslations("common");
  return (
    <span className={`pointer-events-none absolute right-3 top-3 z-[1] rounded-full bg-[#ff5d8f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${className}`}>
      {t("new")}
    </span>
  );
}

/** Generic, URL-synced, server-paginated list page (table + grid views). */
export default function ContentList<T extends { slug: string }>(props: ContentListProps<T>) {
  return (
    <Suspense fallback={<div className="grid gap-4"><div className="h-10 animate-pulse rounded-full bg-card" /><div className="h-64 animate-pulse rounded-xl bg-card" /></div>}>
      <Inner {...props} />
    </Suspense>
  );
}
