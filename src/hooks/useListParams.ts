"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

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

type Stored = Partial<Omit<ListState, "filters">> & { filters?: Record<string, string> };

const storeKey = (pathname: string) => `ingri:list:${pathname.replace(/^\/(az|en|ru)(?=\/|$)/, "") || "/"}`;
function readStored(key: string): Stored {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(key) || "{}") as Stored;
  } catch {
    return {};
  }
}

/**
 * List state (page / limit / sort / order / q / view / filters) kept in client state and
 * persisted per page in sessionStorage — never in the URL query string.
 */
export function useListParams({
  filterKeys,
  defaults,
}: {
  filterKeys: string[];
  defaults: { sort: string; order?: "asc" | "desc"; view?: "table" | "grid"; limit?: number; filters?: Record<string, string> };
}) {
  const pathname = usePathname();
  const key = storeKey(pathname);
  const [stored, setStored] = useState<Stored>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStored(readStored(key));
    setReady(true);
    // Drop any legacy ?page=&sort=… params from old links without a navigation.
    if (window.location.search) window.history.replaceState(window.history.state, "", window.location.pathname + window.location.hash);
  }, [key]);

  const state: ListState = useMemo(() => {
    const filters: Record<string, string> = {};
    for (const k of filterKeys) filters[k] = stored.filters?.[k] ?? defaults.filters?.[k] ?? "all";
    const limit = Number(stored.limit) || defaults.limit || 12;
    return {
      page: Math.max(1, Number(stored.page) || 1),
      limit: Math.min(50, Math.max(1, limit)),
      sort: stored.sort || defaults.sort,
      order: stored.order || defaults.order || "asc",
      q: stored.q || "",
      view: stored.view || defaults.view || "grid",
      filters,
    };
  }, [stored, filterKeys, defaults.sort, defaults.order, defaults.view, defaults.limit, defaults.filters]);

  const set = useCallback(
    (patch: Partial<Omit<ListState, "filters">> & { filters?: Record<string, string> }, { resetPage = true } = {}) => {
      setStored((cur) => {
        const next: Stored = { ...cur, ...patch, filters: patch.filters ? { ...cur.filters, ...patch.filters } : cur.filters };
        if (patch.page === undefined && resetPage && (patch.q !== undefined || patch.filters || patch.limit || patch.sort || patch.order)) next.page = 1;
        try {
          sessionStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* storage full / disabled */
        }
        return next;
      });
    },
    [key],
  );

  return { state, set, ready };
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
