"use client";

import { useEffect } from "react";
import { YT_EVENT, type YtProgress } from "@/lib/youtube";

/** Translates YouTube iframe postMessage events into window "ingri:yt" events. */
export default function YouTubeBridge() {
  useEffect(() => {
    const durations = new Map<string, number>();
    const onMessage = (event: MessageEvent) => {
      if (!/youtube(-nocookie)?\.com$/.test(new URL(event.origin || "http://x").hostname)) return;
      let data: { event?: string; id?: string; info?: { currentTime?: number; duration?: number } };
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (data?.event !== "infoDelivery" || !data.id || !data.info) return;
      if (data.info.duration) durations.set(data.id, data.info.duration);
      const duration = durations.get(data.id) || 0;
      const currentTime = data.info.currentTime;
      if (currentTime === undefined || !duration) return;
      const detail: YtProgress = { id: data.id, currentTime, duration, percent: Math.min(100, (currentTime / duration) * 100) };
      window.dispatchEvent(new CustomEvent(YT_EVENT, { detail }));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return null;
}
