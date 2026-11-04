"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CELEBRATE_EVENT } from "@/hooks/useCompletion";

type Toast = { id: number; kind: string; title?: string };

export default function Celebration() {
  const t = useTranslations("completion");
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ kind: string; title?: string }>).detail;
      const id = Date.now() + Math.random();
      setToasts((list) => [...list.slice(-2), { id, kind: d.kind, title: d.title }]);
      setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 4500);
    };
    window.addEventListener(CELEBRATE_EVENT, on);
    return () => window.removeEventListener(CELEBRATE_EVENT, on);
  }, []);
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-overlay grid w-[min(92vw,22rem)] -translate-x-1/2 gap-2" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto relative overflow-hidden rounded-xl bg-ink p-4 text-paper shadow-soft motion-safe:animate-[ingri-pop_.5s_var(--ease-fluid)]">
          <svg viewBox="0 0 200 60" className="pointer-events-none absolute inset-0 size-full opacity-70 motion-reduce:hidden" aria-hidden="true">
            {[["#e3c8f5", 20, 10], ["#c8f0d0", 60, 45], ["#fbe6b5", 120, 8], ["#ddf4f7", 170, 40], ["#e3c8f5", 150, 20], ["#fbe6b5", 40, 30]].map(([fill, x, y], i) => (
              <circle key={i} cx={x as number} cy={y as number} r="3" fill={fill as string} />
            ))}
          </svg>
          <p className="relative text-sm font-bold">🎉 {t("toastTitle")}</p>
          <p className="relative text-xs opacity-80">{toast.title ? `${toast.title} · ` : ""}{t(`kinds.${toast.kind}`)}</p>
        </div>
      ))}
    </div>
  );
}
