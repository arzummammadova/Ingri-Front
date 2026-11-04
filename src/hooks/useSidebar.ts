"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export const SIDEBAR_KEY = "ingri:sidebar";
const listeners = new Set<() => void>();

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "collapsed";
  } catch {
    return false;
  }
}

function apply(collapsed: boolean) {
  if (typeof document !== "undefined") document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";
}

/** Desktop sidebar collapsed/expanded state, persisted in localStorage and mirrored to <html data-sidebar>. */
export function useSidebar() {
  const collapsed = useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    read,
    () => false,
  );
  useEffect(() => apply(collapsed), [collapsed]);
  const setCollapsed = useCallback((value: boolean) => {
    try { localStorage.setItem(SIDEBAR_KEY, value ? "collapsed" : "expanded"); } catch { /* ignore */ }
    apply(value);
    listeners.forEach((fn) => fn());
  }, []);
  const toggle = useCallback(() => setCollapsed(!read()), [setCollapsed]);
  return { collapsed, setCollapsed, toggle };
}
