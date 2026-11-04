"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { contentService } from "@/services/contentService";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/hooks/useAuth";
import { DAILY_GOAL, type Cefr } from "@/lib/levels";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import LevelSwitcher from "@/ui/components/LevelSwitcher";

const skills = ["listening", "reading", "speaking", "grammar", "words"] as const;

export default function LevelPanel() {
  const t = useTranslations("dashboard");
  const time = useTranslations("time");
  const locale = useLocale();
  const { user } = useAuth();
  const progress = useProgress();
  const podcasts = useQuery({ queryKey: ["podcasts"], queryFn: contentService.podcasts });
  const grammar = useQuery({ queryKey: ["grammar"], queryFn: contentService.grammar });
  const active = (user?.activeLevel || "A1") as Cefr;
  const levels = user?.levels?.length ? user.levels : [active];
  const plan = user?.plans?.find((item) => item.level === active);
  const goal = plan?.dailyMinutes || DAILY_GOAL[active] || 15;
  const picks = [
    ...(podcasts.data || []).filter((item) => item.level === active).slice(0, 2).map((item) => ({ href: `${routes.podcasts}/${item.slug}`, title: item.title, meta: locale === "az" ? item.titleAz : item.summary })),
    ...(grammar.data || []).filter((item) => item.level === active).slice(0, 2).map((item) => ({ href: `${routes.grammar}/${item.slug}`, title: item.title, meta: item.titleAz })),
  ];
  const clock = progress.data?.time;

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="mint">{active}</Badge>
          <h2 className="text-lg font-semibold">{t("forLevel", { level: active })}</h2>
        </div>
        <LevelSwitcher />
      </div>
      <p className="text-sm text-muted-foreground">{t("dailyGoal", { minutes: goal })}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {skills.map((skill) => (
          <article key={skill} className="rounded-xl bg-card p-4 shadow-soft">
            <p className="text-xs font-semibold text-muted-foreground">{time(skill)}</p>
            <p className="mt-2 text-sm">{time("today")}: {Math.round((clock?.byLevel?.[active]?.today?.[skill] || 0) / 60)}m</p>
            <p className="text-sm">{time("week")}: {Math.round((clock?.byLevel?.[active]?.week?.[skill] || 0) / 60)}m</p>
            <p className="text-sm">{time("total")}: {Math.round((clock?.total?.[skill] || 0) / 60)}m</p>
          </article>
        ))}
      </div>
      <div>
        <h3 className="mb-2 font-semibold">{t("perLevel")}</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => {
            const done = (progress.data?.completed || []).length;
            const levelItems = (grammar.data || []).filter((item) => item.level === level).length || 1;
            const levelDone = (grammar.data || []).filter((item) => item.level === level && progress.data?.completed?.includes(`grammar:${item.slug}`)).length;
            const percent = Math.round((levelDone / levelItems) * 100);
            return (
              <article key={level} className="rounded-xl bg-lilac/70 p-4 text-ink">
                <p className="font-bold">{level}</p>
                <p className="text-sm">{percent}% · {done} {t("themes").toLowerCase()}</p>
                <div className="mt-2 h-2 rounded-full bg-paper/70"><div className="h-2 rounded-full bg-ink" style={{ width: `${percent}%` }} /></div>
              </article>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">{t("recommend")}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {picks.map((item) => (
            <Link key={item.href} href={item.href} className="glass rounded-xl p-4">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.meta}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
