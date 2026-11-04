"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/contentService";
import { LEVELS } from "@/lib/levels";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/ui/components/primitives";
import Select from "@/ui/components/Select";
import AppearanceSection from "./AppearanceSection";

export default function SettingsView() {
  const t = useTranslations("settings");
  const { user } = useAuth();
  const client = useQueryClient();
  const [levels, setLevels] = useState<string[]>(user?.levels || ["A1"]);
  const [active, setActive] = useState(user?.activeLevel || "A1");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!user) return;
    setLevels(user.levels?.length ? user.levels : ["A1"]);
    setActive(user.activeLevel || "A1");
  }, [user]);
  const save = useMutation({
    mutationFn: () => profileService.setLevels({ levels, activeLevel: levels.includes(active) ? active : levels[0] }),
    onSuccess: (next) => {
      client.setQueryData(["me"], next);
      setMessage(t("saved"));
    },
  });
  if (!user) return null;
  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <SectionTitle title={t("title")} text={t("text")} />
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("title")}>
        {LEVELS.map((level) => {
          const on = levels.includes(level);
          return (
            <button
              key={level}
              type="button"
              aria-pressed={on}
              onClick={() => {
                const next = on ? levels.filter((item) => item !== level) : [...levels, level];
                const safe = next.length ? next : [level];
                setLevels(safe);
                if (!safe.includes(active)) setActive(safe[0]);
              }}
              className={`rounded-full px-4 py-2 font-semibold ${on ? "bg-lilac text-ink" : "bg-card"}`}
            >
              {level}
            </button>
          );
        })}
      </div>
      <label className="grid gap-2 text-sm font-semibold">
        {t("active")}
        <Select ariaLabel={t("active")} value={levels.includes(active) ? active : levels[0]} onChange={(value) => setActive(value)} options={levels.map((level) => ({ value: level, label: level }))} className="w-full sm:w-60" />
      </label>
      {message && <p className="text-sm">{message}</p>}
      <Button onClick={() => save.mutate()} disabled={save.isPending}>{t("save")}</Button>
      <AppearanceSection />
    </div>
  );
}
