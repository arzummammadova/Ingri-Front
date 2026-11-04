"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type ListState = {
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
  q: string;
  view: "table" | "grid";
  filters: Record<string, string>;
};

export const PAGE_SIZES = [12, 24, 50] as const;

/**
 * List state synced to the URL (?page=2&limit=24&sort=title&order=asc&q=..&level=A1&view=grid),
 * so filters survive reloads, back/forward and are shareable.
 */
export function useListParams({
  filterKeys,
  defaults,
}: {
  filterKeys: string[];
  defaults: { sort: string; order?: "asc" | "desc"; view?: "table" | "grid"; limit?: number; filters?: Record<string, string> };
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state: ListState = useMemo(() => {
    const filters: Record<string, string> = {};
    for (const key of filterKeys) filters[key] = sp.get(key) ?? defaults.filters?.[key] ?? "all";
    const limit = Number(sp.get("limit")) || defaults.limit || 12;
    return {
      page: Math.max(1, Number(sp.get("page")) || 1),
      limit: Math.min(50, Math.max(1, limit)),
      sort: sp.get("sort") || defaults.sort,
      order: (sp.get("order") as "asc" | "desc") || defaults.order || "asc",
      q: sp.get("q") || "",
      view: (sp.get("view") as "table" | "grid") || defaults.view || "grid",
      filters,
    };
  }, [sp, filterKeys, defaults.sort, defaults.order, defaults.view, defaults.limit, defaults.filters]);

  const set = useCallback(
    (patch: Partial<Omit<ListState, "filters">> & { filters?: Record<string, string> }, { resetPage = true } = {}) => {
      const next = new URLSearchParams(sp.toString());
      const write = (key: string, value: string | number | undefined, fallback?: string | number) => {
        if (value === undefined) return;
        if (value === "" || String(value) === String(fallback ?? "")) next.delete(key);
        else next.set(key, String(value));
      };
      write("limit", patch.limit, defaults.limit || 12);
      write("sort", patch.sort, defaults.sort);
      write("order", patch.order, defaults.order || "asc");
      write("q", patch.q, "");
      write("view", patch.view, defaults.view || "grid");
      if (patch.filters) for (const [key, value] of Object.entries(patch.filters)) write(key, value, defaults.filters?.[key] ?? "all");
      if (patch.page !== undefined) write("page", patch.page, 1);
      else if (resetPage && (patch.q !== undefined || patch.filters || patch.limit || patch.sort || patch.order)) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [sp, router, pathname, defaults.limit, defaults.sort, defaults.order, defaults.view, defaults.filters],
  );

  return { state, set };
}

/** Debounced mirror of a value (search box). */
export function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Local input state for search that pushes to the URL after a debounce. */
export function useDebouncedSearch(urlValue: string, onCommit: (q: string) => void, delay = 350) {
  const [text, setText] = useState(urlValue);
  const debounced = useDebounced(text, delay);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;
  const lastUrl = useRef(urlValue);
  useEffect(() => {
    if (urlValue !== lastUrl.current) {
      lastUrl.current = urlValue;
      setText(urlValue);
    }
  }, [urlValue]);
  useEffect(() => {
    if (debounced.trim() !== urlValue) {
      lastUrl.current = debounced.trim();
      commitRef.current(debounced.trim());
    }
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps
  return [text, setText] as const;
}
