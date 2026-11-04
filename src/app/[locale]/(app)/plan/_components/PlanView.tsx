"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { contentService, profileService } from "@/services/contentService";
import { useProgress } from "@/hooks/useProgress";
import { DAILY_GOAL, LEVELS, NEXT_LEVEL, type Cefr } from "@/lib/levels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/ui/components/primitives";

export default function PlanView() {
  const t = useTranslations("plan");
  const { user } = useAuth();
  const progress = useProgress();
  const grammar = useQuery({ queryKey: ["grammar"], queryFn: contentService.grammar });
  const client = useQueryClient();
  const active = (user?.activeLevel || "A1") as Cefr;
  const existing = user?.plans?.find((plan) => plan.level === active);
  const [minutes, setMinutes] = useState(existing?.dailyMinutes || DAILY_GOAL[active]);
  const [target, setTarget] = useState(existing?.targetLevel || NEXT_LEVEL[active]);
  const [date, setDate] = useState(existing?.targetDate || "2027-06-01");
  const save = useMutation({
    mutationFn: () => profileService.savePlan({ level: active, dailyMinutes: Number(minutes), targetLevel: target, targetDate: date }),
    onSuccess: (next) => client.setQueryData(["me"], next),
  });
  const items = (grammar.data || []).filter((item) => item.level === active);
  const done = items.filter((item) => progress.data?.completed?.includes(`grammar:${item.slug}`)).length;
  const percent = items.length ? Math.round((done / items.length) * 100) : 0;
  const weeks = Math.max(1, Math.min(8, Math.ceil((new Date(date).getTime() - Date.now()) / 604800000)));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <div className="grid gap-4">
      <SectionTitle title={t("title")} text={t("text")} />
      <form onSubmit={onSubmit} className="glass grid gap-3 rounded-xl p-5 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold">{t("minutes")}<Input type="number" min={5} max={180} value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} /></label>
        <label className="grid gap-1 text-sm font-semibold">{t("target")}
          <select value={target} onChange={(event) => setTarget(event.target.value)} className="h-11 rounded-md border border-border bg-card px-3">{LEVELS.map((level) => <option key={level}>{level}</option>)}</select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">{t("date")}<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <Button className="sm:col-span-3" type="submit">{t("save")}</Button>
      </form>
      <section className="rounded-xl bg-mint p-5 text-ink">
        <p className="text-sm">{t("progress")}</p>
        <p className="text-3xl font-bold">{percent}%</p>
        <div className="mt-2 h-2 rounded-full bg-paper/70"><div className="h-2 rounded-full bg-ink" style={{ width: `${percent}%` }} /></div>
        <ul className="mt-4 grid gap-2 text-sm">
          {[25, 50, 75, 100].map((mark) => <li key={mark}>{t("milestone")} {mark}% {percent >= mark ? "✓" : ""}</li>)}
        </ul>
      </section>
      <section className="grid gap-2">
        {Array.from({ length: weeks }, (_, index) => (
          <article key={index} className="glass rounded-xl p-4">{t("week", { n: index + 1, minutes: Number(minutes) * 5 })}</article>
        ))}
      </section>
    </div>
  );
}
