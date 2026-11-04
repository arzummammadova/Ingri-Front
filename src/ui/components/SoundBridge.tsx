"use client";

import { useEffect } from "react";
import { CELEBRATE_EVENT } from "@/hooks/useCompletion";
import { playSound } from "@/lib/sound";

/** Plays the completion fanfare whenever an item is completed anywhere in the app. */
export default function SoundBridge() {
  useEffect(() => {
    const on = () => playSound("fanfare");
    window.addEventListener(CELEBRATE_EVENT, on);
    return () => window.removeEventListener(CELEBRATE_EVENT, on);
  }, []);
  return null;
}
