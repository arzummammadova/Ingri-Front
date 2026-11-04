"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/* Tiny global registry: any content screen in progress registers a guard. */
let count = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const isGuarded = () => count > 0;
let bypass = false;

/** Call with true while the user is in the middle of unfinished content. Leaving never marks it completed. */
export function useExitGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    count += 1;
    emit();
    return () => { count -= 1; emit(); };
  }, [active]);
}

/** Mounted once in the app shell: intercepts in-app links, the back button and tab close. */
export function ExitGuardHost() {
  const t = useTranslations("exitGuard");
  const router = useRouter();
  const guarded = useSyncExternalStore(subscribe, isGuarded, () => false);
  const [pending, setPending] = useState<null | { href?: string; back?: boolean }>(null);
  const trapped = useRef(false);

  useEffect(() => {
    if (!guarded) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (bypass) return;
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => {
      if (bypass || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      e.preventDefault();
      e.stopPropagation();
      setPending({ href: url.pathname + url.search + url.hash });
    };
    // Back button: keep one extra history entry so "back" lands on us first.
    if (!trapped.current) {
      history.pushState({ ingriGuard: true }, "", location.href);
      trapped.current = true;
    }
    const onPop = () => {
      if (bypass) return;
      history.pushState({ ingriGuard: true }, "", location.href);
      setPending({ back: true });
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, [guarded]);

  useEffect(() => {
    if (guarded || !trapped.current) return;
    trapped.current = false;
  }, [guarded]);

  if (!pending) return null;
  const leave = () => {
    const target = pending;
    setPending(null);
    bypass = true;
    window.setTimeout(() => { bypass = false; }, 800);
    if (target.back) history.go(-2);
    else if (target.href) {
      // Strip the locale prefix; the i18n router adds it back.
      const href = target.href.replace(/^\/(az|en|ru)(?=\/|$)/, "") || "/";
      router.push(href);
    }
  };

  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="exit-guard-title" className="fixed inset-0 z-[90] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm menu-item-in">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
        <p className="text-3xl" aria-hidden="true">⏳</p>
        <h2 id="exit-guard-title" className="mt-2 text-lg font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={leave}>{t("leave")}</Button>
          <Button autoFocus onClick={() => setPending(null)}>{t("stay")}</Button>
        </div>
      </div>
    </div>
  );
}
