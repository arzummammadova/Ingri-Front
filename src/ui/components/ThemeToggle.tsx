"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { savePreferences } from "@/hooks/usePreferences";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const dark = ready && resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label={dark ? "Light mode" : "Dark mode"}
      onClick={() => {
        const next = dark ? "light" : "dark";
        setTheme(next);
        savePreferences({ theme: next });
      }}
      className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground sm:size-10"
    >
      {dark ? <Sun className="size-[1.1rem]" /> : <Moon className="size-[1.1rem]" />}
    </button>
  );
}
