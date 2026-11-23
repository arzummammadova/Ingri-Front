"use client";

import { useEffect } from "react";
import { CELEBRATE_EVENT } from "@/hooks/useCompletion";
import { playSound, type SoundName } from "@/lib/sound";

/** Plays data-sound clicks and the completion fanfare whenever an item is completed anywhere in the app. */
export default function SoundBridge() {
  useEffect(() => {
    const on = () => playSound("fanfare");
    // Any element with data-sound="next|back|click|..." plays that sound on click.
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-sound]");
      if (!el || el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return;
      playSound(el.dataset.sound as SoundName);
    };
    // After a new deploy, old chunk URLs 404: reload once instead of leaving dead buttons.
    const onChunk = (e: ErrorEvent | PromiseRejectionEvent) => {
      const msg = String((e as ErrorEvent).message || (e as PromiseRejectionEvent).reason?.message || "");
      if (!/Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module/i.test(msg)) return;
      if (sessionStorage.getItem("ingri:chunk-reload")) return;
      sessionStorage.setItem("ingri:chunk-reload", "1");
      window.location.reload();
    };
    window.setTimeout(() => sessionStorage.removeItem("ingri:chunk-reload"), 10000);
    window.addEventListener("error", onChunk);
    window.addEventListener("unhandledrejection", onChunk);
    window.addEventListener(CELEBRATE_EVENT, on);
    document.addEventListener("click", onClick, true);
    return () => { window.removeEventListener("error", onChunk); window.removeEventListener("unhandledrejection", onChunk); window.removeEventListener(CELEBRATE_EVENT, on); document.removeEventListener("click", onClick, true); };
  }, []);
  return null;
}
