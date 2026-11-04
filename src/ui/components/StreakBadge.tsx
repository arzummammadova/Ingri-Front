"use client";

import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip } from "./Popover";
import { cn } from "@/lib/utils";
import { playSound } from "@/lib/sound";

const SEEN_KEY = "ingri:streak-seen";

/** Header flame with the current daily streak; pops when the number goes up. */
export default function StreakBadge() {
  const t = useTranslations("streak");
  const { user } = useAuth();
  const streak = user?.streak ?? 0;
  const longest = Math.max(user?.longestStreak ?? 0, streak);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (!user) return;
    let seen = 0;
    try { seen = Number(localStorage.getItem(SEEN_KEY) || 0); } catch { /* ignore */ }
    if (streak > seen) {
      setBump(true);
      if (seen > 0) playSound("streak");
      const id = setTimeout(() => setBump(false), 1400);
      try { localStorage.setItem(SEEN_KEY, String(streak)); } catch { /* ignore */ }
      return () => clearTimeout(id);
    }
    if (streak < seen) try { localStorage.setItem(SEEN_KEY, String(streak)); } catch { /* ignore */ }
  }, [streak, user]);

  if (!user) return null;
  const active = streak > 0;
  const label = t("tooltip", { count: streak, longest });
  return (
    <Tooltip side="bottom" content={label}>
      <span
        tabIndex={0}
        aria-label={label}
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-2.5 text-sm font-bold tabular-nums sm:h-10 sm:px-3",
          active ? "bg-gradient-to-br from-[#ffe1b8] to-[#ffc2a1] text-[#8a3b0a]" : "border border-border bg-card text-muted-foreground",
          bump && "ingri-streak-bump",
        )}
      >
        <Flame className={cn("size-[1.1rem]", active ? "fill-[#ff8a3d] text-[#e8590c]" : "")} aria-hidden="true" />
        <span>{streak}</span>
      </span>
    </Tooltip>
  );
}
