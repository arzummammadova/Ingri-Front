"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { applyPreferences, readPreferences, usePreferencesSync } from "@/hooks/usePreferences";

/** Keeps appearance prefs in sync: local (instant) <-> profile (cross-device). */
export default function PreferencesSync() {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  useEffect(() => applyPreferences(readPreferences()), []);
  usePreferencesSync(user?.preferences, setTheme);
  return null;
}
