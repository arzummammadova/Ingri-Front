"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { progressService } from "@/services/contentService";
import { useProgress } from "@/hooks/useProgress";
import { YT_EVENT, type YtProgress } from "@/lib/youtube";
import type { ItemKind } from "@/types";

export const CELEBRATE_EVENT = "ingri:completed";

export function useItemProgress(kind: ItemKind, slug: string) {
  const progress = useProgress();
  return progress.data?.items?.[`${kind}:${slug}`];
}

/** Report progress for one content item; throttled, idempotent, celebrates first completion. */
export function useTrackItem(kind: ItemKind, slug: string | undefined, level?: string, title?: string) {
  const client = useQueryClient();
  const existing = useItemProgress(kind, slug || "");
  const sent = useRef(0);
  const done = useRef(false);
  done.current = done.current || !!existing?.completed;
  sent.current = Math.max(sent.current, existing?.percent || 0);

  const mutation = useMutation({
    mutationFn: (body: { percent: number; completed?: boolean }) =>
      progressService.item({ kind, slug: slug!, level: level || "", ...body }),
    onSuccess: (data) => {
      const { justCompleted, ...rest } = data;
      client.setQueryData(["progress"], rest);
      client.invalidateQueries({ queryKey: ["progress"] });
      if (justCompleted) window.dispatchEvent(new CustomEvent(CELEBRATE_EVENT, { detail: { kind, slug, title } }));
    },
  });
  const { mutate } = mutation;

  const report = useCallback(
    (percent: number, completed = false) => {
      if (!slug || done.current) return;
      const pct = Math.min(100, Math.max(0, Math.round(percent)));
      const finished = completed || pct >= 90;
      if (!finished && pct < sent.current + 10) return;
      sent.current = pct;
      if (finished) done.current = true;
      mutate({ percent: pct, completed: finished });
    },
    [slug, mutate],
  );
  const complete = useCallback(() => report(100, true), [report]);
  return { report, complete, item: existing, isPending: mutation.isPending };
}

/** Track a YouTube video by its id; falls back to active watch time when duration is unknown. */
export function useYouTubeCompletion(youtubeId: string | undefined, report: (p: number) => void, fallbackSeconds = 600) {
  useEffect(() => {
    if (!youtubeId) return;
    let gotApi = false;
    let active = 0;
    const onYt = (e: Event) => {
      const d = (e as CustomEvent<YtProgress>).detail;
      if (d.id !== youtubeId) return;
      gotApi = true;
      report(d.percent);
    };
    const timer = setInterval(() => {
      if (gotApi || document.visibilityState !== "visible") return;
      active += 5;
      report((active / fallbackSeconds) * 100);
    }, 5000);
    window.addEventListener(YT_EVENT, onYt);
    return () => {
      clearInterval(timer);
      window.removeEventListener(YT_EVENT, onYt);
    };
  }, [youtubeId, report, fallbackSeconds]);
}

/** Calls `onEnd` once when the sentinel element scrolls into view. */
export function useReachedEnd(onEnd: () => void, enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        onEnd();
        io.disconnect();
      }
    }, { threshold: 1 });
    io.observe(el);
    return () => io.disconnect();
  }, [onEnd, enabled]);
  return ref;
}
