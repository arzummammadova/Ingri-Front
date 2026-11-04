"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { api } from "@/services/api";

export type Accent = "ink" | "lilac" | "aqua" | "peach" | "mint" | "rose" | "blue";
export type FontSize = "small" | "normal" | "large";
export type ThemePref = "light" | "dark" | "system";
export type Preferences = { theme: ThemePref; accent: Accent; fontSize: FontSize; reducedMotion: boolean; sound: boolean; volume: number; updatedAt: number };

import { PREFS_KEY } from "@/lib/prefsBoot";

export { PREFS_KEY };
export const ACCENTS: Accent[] = ["ink", "lilac", "aqua", "peach", "mint", "rose", "blue"];
export const DEFAULT_PREFS: Preferences = { theme: "light", accent: "ink", fontSize: "normal", reducedMotion: false, sound: true, volume: 0.6, updatedAt: 0 };

const listeners = new Set<() => void>();
let cache: Preferences | null = null;

export function readPreferences(): Preferences {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    cache = { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") };
  } catch {
    cache = DEFAULT_PREFS;
  }
  return cache!;
}

/** Applies accent / font size / motion as data-attributes on <html> (same as the pre-paint script). */
export function applyPreferences(prefs: Preferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.accent = prefs.accent;
  root.dataset.font = prefs.fontSize;
  root.dataset.motion = prefs.reducedMotion ? "reduce" : "full";
}

let syncTimer: ReturnType<typeof setTimeout> | undefined;

export function savePreferences(patch: Partial<Preferences>, { sync = true }: { sync?: boolean } = {}) {
  const next: Preferences = { ...readPreferences(), ...patch, updatedAt: patch.updatedAt ?? Date.now() };
  cache = next;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    if (patch.theme) localStorage.setItem("theme", patch.theme);
  } catch {
    /* private mode */
  }
  applyPreferences(next);
  listeners.forEach((fn) => fn());
  if (sync) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      api.patch("/profile/preferences", next).catch(() => undefined);
    }, 600);
  }
  return next;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function usePreferences() {
  const prefs = useSyncExternalStore(subscribe, readPreferences, () => DEFAULT_PREFS);
  const set = useCallback((patch: Partial<Preferences>) => savePreferences(patch), []);
  return { prefs, set };
}

/** Pulls server-side preferences when they are newer than the local copy (e.g. another device). */
export function usePreferencesSync(server?: Partial<Preferences> | null, setTheme?: (theme: string) => void) {
  useEffect(() => {
    if (!server?.updatedAt) return;
    const local = readPreferences();
    if (server.updatedAt > (local.updatedAt || 0)) {
      const next = savePreferences({ ...server, updatedAt: server.updatedAt }, { sync: false });
      setTheme?.(next.theme);
    }
  }, [server?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps
}
