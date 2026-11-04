"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { progressService } from "@/services/contentService";
import { useAuth } from "@/hooks/useAuth";
import { CompletedBadge } from "@/ui/components/ItemProgress";
import { routes } from "@/config/routes";

const KINDS = ["podcast", "grammar", "listening", "speaking", "video", "movie", "book"] as const;
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const hrefFor: Record<string, string> = {
  podcast: routes.podcasts, grammar: routes.grammar, listening: routes.listening, speaking: routes.speaking,
  video: routes.videos, movie: routes.movies, book: routes.books,
};

export default function CompletionPanel() {
  const t = useTranslations("completion");
  const { user } = useAuth();
  const summary = useQuery({ queryKey: ["progress", "summary"], queryFn: progressService.summary });
  const data = summary.data;
  const level = user?.activeLevel || "A1";
  const done = Object.values(data?.byLevel[level] || {}).reduce((a, b) => a + b, 0);
  const total = Object.values(data?.totals[level] || {}).reduce((a, b) => a + b, 0);
  const planPct = total ? Math.round((done / total) * 100) : 0;
  const levels = LEVELS.filter((lv) => user?.levels?.includes(lv) || data?.byLevel[lv]);

  if (summary.isLoading) return <div className="h-56 animate-pulse rounded-xl bg-card" />;
  if (!data) return null;
  return (
    <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="glass rounded-xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t("dashboardTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("planProgress", { level, done, total })}</p>
          </div>
          <span className="text-3xl font-bold">{planPct}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-mint-deep transition-[width] duration-700 ease-fluid" style={{ width: `${planPct}%` }} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KINDS.map((kind) => (
            <Link key={kind} href={hrefFor[kind]} className="rounded-lg bg-muted p-3 transition hover:-translate-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground">{t(`kinds.${kind}`)}</p>
              <p className="mt-1 text-xl font-bold">
                {data.byLevel[level]?.[kind] || 0}
                <span className="text-sm font-medium text-muted-foreground">/{data.totals[level]?.[kind] || 0}</span>
              </p>
            </Link>
          ))}
        </div>
        {levels.length > 0 && (
          <div className="mt-5 grid gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{t("byLevel")}</p>
            {levels.map((lv) => {
              const d = Object.values(data.byLevel[lv] || {}).reduce((a, b) => a + b, 0);
              const tot = Object.values(data.totals[lv] || {}).reduce((a, b) => a + b, 0);
              const pct = tot ? Math.round((d / tot) * 100) : 0;
              return (
                <div key={lv} className="flex items-center gap-3 text-sm">
                  <span className="w-8 font-bold">{lv}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-lilac-deep" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-16 text-right text-xs text-muted-foreground">{d}/{tot}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">{t("recent")}</h2>
        {data.recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("noneYet")}</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {data.recent.map((item) => (
              <li key={`${item.kind}:${item.slug}`}>
                <Link href={`${hrefFor[item.kind] || routes.home}/${item.slug}`} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
                  <span className="flex-1 truncate font-semibold">{item.slug.replace(/-/g, " ")}</span>
                  <span className="text-xs text-muted-foreground">{t(`kinds.${item.kind}`)}</span>
                  <CompletedBadge className="hidden sm:inline-flex" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
