"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import Select from "./Select";
import { PAGE_SIZES } from "@/hooks/useListParams";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Server sort key; makes the header clickable. */
  sortKey?: string;
  className?: string;
  /** Shown as the card title on mobile. */
  primary?: boolean;
  /** Hidden in the mobile card. */
  hideOnMobile?: boolean;
  align?: "left" | "right" | "center";
};

type SortState = { sort: string; order: "asc" | "desc"; onSort: (sort: string, order: "asc" | "desc") => void };

export function Pagination({
  page,
  pages,
  total,
  limit,
  onPage,
  onLimit,
  className,
}: {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
  className?: string;
}) {
  const t = useTranslations("datatable");
  const from = total ? (page - 1) * limit + 1 : 0;
  const to = Math.min(total, page * limit);
  const btn = "grid size-9 place-items-center rounded-full border border-border bg-card transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40";
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <p className="text-xs text-muted-foreground" aria-live="polite">{t("range", { from, to, total })}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{t("rows")}</span>
        <Select
          size="sm"
          ariaLabel={t("rows")}
          value={String(limit)}
          minWidth={96}
          className="w-[4.5rem]"
          options={PAGE_SIZES.map((n) => ({ value: String(n), label: String(n) }))}
          onChange={(v) => onLimit(Number(v))}
        />
        <span className="mx-1 text-xs font-semibold tabular-nums">{t("pageOf", { page, pages })}</span>
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(1)} aria-label={t("first")}><ChevronsLeft className="size-4" /></button>
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={t("prev")}><ChevronLeft className="size-4" /></button>
        <button type="button" className={btn} disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label={t("next")}><ChevronRight className="size-4" /></button>
        <button type="button" className={btn} disabled={page >= pages} onClick={() => onPage(pages)} aria-label={t("last")}><ChevronsRight className="size-4" /></button>
      </div>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title?: ReactNode; text?: ReactNode; action?: ReactNode }) {
  const t = useTranslations("datatable");
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-lilac/60 text-ink dark:bg-lilac/20 dark:text-foreground"><Inbox className="size-6" /></span>
      <p className="mt-1 font-semibold">{title ?? t("emptyTitle")}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{text ?? t("emptyText")}</p>
      {action}
    </div>
  );
}

function SortHeader<T>({ column, sort }: { column: DataTableColumn<T>; sort?: SortState }) {
  const t = useTranslations("datatable");
  if (!column.sortKey || !sort) return <>{column.header}</>;
  const active = sort.sort === column.sortKey;
  const Icon = !active ? ArrowUpDown : sort.order === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => sort.onSort(column.sortKey!, active && sort.order === "asc" ? "desc" : "asc")}
      className={cn("-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted", active && "text-foreground")}
      aria-label={`${t("sortBy")} ${typeof column.header === "string" ? column.header : column.id}`}
    >
      {column.header}
      <Icon className={cn("size-3.5", !active && "opacity-50")} />
    </button>
  );
}

/**
 * Reusable server-driven DataTable: table on md+, stacked cards on mobile,
 * sortable headers, loading skeleton, empty state and pagination footer.
 */
export default function DataTable<T>({
  rows,
  columns,
  getRowKey,
  loading,
  fetching,
  sort,
  onRowClick,
  rowHref,
  renderLink,
  pagination,
  empty,
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  fetching?: boolean;
  sort?: SortState;
  onRowClick?: (row: T) => void;
  rowHref?: (row: T) => string;
  renderLink?: (href: string, children: ReactNode, className?: string) => ReactNode;
  pagination?: Parameters<typeof Pagination>[0];
  empty?: ReactNode;
}) {
  const align = (a?: string) => (a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left");
  const primary = columns.find((c) => c.primary) || columns[0];
  const rest = columns.filter((c) => c !== primary && !c.hideOnMobile);
  const skeletonRows = Array.from({ length: Math.min(pagination?.limit || 6, 8) });

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-opacity", fetching && !loading && "opacity-70")} aria-busy={loading || fetching}>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th key={c.id} scope="col" className={cn("h-11 px-4 font-semibold", align(c.align), c.className)} aria-sort={sort?.sort === c.sortKey ? (sort?.order === "asc" ? "ascending" : "descending") : undefined}>
                  <SortHeader column={c} sort={sort} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? skeletonRows.map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {columns.map((c) => (
                      <td key={c.id} className="px-4 py-3.5"><div className="h-4 w-3/4 animate-pulse rounded bg-muted" /></td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => {
                  const href = rowHref?.(row);
                  return (
                    <tr
                      key={getRowKey(row)}
                      tabIndex={onRowClick ? 0 : undefined}
                      onClick={(event) => {
                        if ((event.target as HTMLElement).closest("a,button,input,select,textarea,[role=button],[role=combobox]")) return;
                        onRowClick?.(row);
                      }}
                      onKeyDown={(event) => {
                        if (onRowClick && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onRowClick(row); }
                      }}
                      className={cn("border-b border-border transition-colors last:border-0 hover:bg-muted/50", (onRowClick || href) && "cursor-pointer")}
                    >
                      {columns.map((c) => (
                        <td key={c.id} className={cn("px-4 py-3 align-middle", align(c.align), c.className)}>
                          {c === primary && href && renderLink ? renderLink(href, c.cell(row), "font-semibold hover:underline") : c.cell(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-border md:hidden">
        {loading
          ? skeletonRows.map((_, i) => (
              <li key={i} className="space-y-2 p-4"><div className="h-4 w-2/3 animate-pulse rounded bg-muted" /><div className="h-3 w-1/2 animate-pulse rounded bg-muted" /></li>
            ))
          : rows.map((row) => {
              const href = rowHref?.(row);
              const body = (
                <>
                  <div className="font-semibold">{primary.cell(row)}</div>
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    {rest.map((c) => (
                      <div key={c.id} className="min-w-0">
                        <dt className="text-muted-foreground">{c.header}</dt>
                        <dd className="truncate font-medium">{c.cell(row)}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              );
              return (
                <li key={getRowKey(row)} className="p-4" onClick={() => onRowClick?.(row)}>
                  {href && renderLink ? renderLink(href, body, "block") : body}
                </li>
              );
            })}
      </ul>

      {!loading && rows.length === 0 && (empty ?? <EmptyState />)}

      {pagination && pagination.total > 0 && <Pagination {...pagination} className="border-t border-border px-4 py-3" />}
    </div>
  );
}
