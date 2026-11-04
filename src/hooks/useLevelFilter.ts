"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useLevelFilter() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"active" | "selected" | "all">("active");
  const active = user?.activeLevel || user?.level || "A1";
  const selected = user?.levels?.length ? user.levels : [active];
  function allows(level?: string) {
    if (!level || mode === "all") return true;
    if (mode === "selected") return selected.includes(level);
    return level === active;
  }
  return { mode, setMode, allows, active, selected };
}
