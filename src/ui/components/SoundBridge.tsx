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
    window.addEventListener(CELEBRATE_EVENT, on);
    document.addEventListener("click", onClick, true);
    return () => { window.removeEventListener(CELEBRATE_EVENT, on); document.removeEventListener("click", onClick, true); };
  }, []);
  return null;
}
