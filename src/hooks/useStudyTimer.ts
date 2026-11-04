"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { progressService } from "@/services/contentService";

export function useStudyTimer(skill: "listening" | "reading" | "speaking" | "grammar" | "words") {
  const { user } = useAuth();
  const level = user?.activeLevel || "A1";
  const pending = useRef(0);

  useEffect(() => {
    if (!user) return;
    const flush = () => {
      const seconds = pending.current;
      if (seconds < 15) return;
      pending.current = 0;
      progressService.time({ skill, seconds, level }).catch(() => undefined);
    };
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      pending.current += 15;
      if (pending.current >= 60) flush();
    }, 15000);
    const onHide = () => flush();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", onHide);
      flush();
    };
  }, [skill, level, user]);
}
