"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { progressService, type PointsSummary } from "@/services/contentService";
import QueryState from "@/ui/components/QueryState";
import { SectionTitle } from "@/ui/components/primitives";

export default function PointsView() {
  const t = useTranslations("points");
  const locale = useLocale();
  const query = useQuery<PointsSummary>({ queryKey: ["points"], queryFn: progressService.points });
  const data = query.data;
  const label = (source: string) => (t.has(`src.${source}`) ? t(`src.${source}` as "src.earlier") : source);
  const fmt = (at: string) => new Intl.DateTimeFormat(locale === "az" ? "az-Latn-AZ" : locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(at));

  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      <SectionTitle title={t("title")} text={t("text")} />
      {data && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section className="glass rounded-2xl p-6">
            <p className="text-sm font-semibold text-muted-foreground">{t("total")}</p>
            <p className="mt-1 flex items-center gap-2 text-5xl font-bold"><Sparkles className="size-8 text-lilac-deep" />{data.total}</p>
            <div className="mt-6">
              <div className="flex justify-between text-sm font-semibold">
                <span>{t("level", { n: data.level.level })}</span>
                <span className="text-muted-foreground">{data.level.into} / {data.level.next}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-lilac-deep transition-all duration-700" style={{ width: `${data.level.percent}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{t("toNext", { n: data.level.next - data.level.into, level: data.level.level + 1 })}</p>
            </div>
            <h2 className="mt-8 font-semibold">{t("breakdown")}</h2>
            {data.breakdown.length ? (
              <ul className="mt-3 grid gap-2">
                {data.breakdown.map((row) => (
                  <li key={row.source} className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-3 py-2 text-sm">
                    <span>{label(row.source)}{row.count > 0 && <span className="text-muted-foreground"> × {row.count}</span>}</span>
                    <span className="font-bold">+{row.points}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-muted-foreground">{t("empty")}</p>}
            <h2 className="mt-8 font-semibold">{t("history")}</h2>
            {data.history.length ? (
              <ul className="mt-3 grid gap-1.5">
                {data.history.map((row, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 border-b border-border/50 py-2 text-sm last:border-0">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{label(row.source)}</span>
                      <span className="block truncate text-xs text-muted-foreground">{fmt(row.at)}{row.ref ? ` · ${row.ref}` : ""}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-mint px-2 py-0.5 text-xs font-bold text-ink">+{row.points}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-muted-foreground">{t("empty")}</p>}
          </section>
          <section className="glass h-fit rounded-2xl p-6">
            <h2 className="font-semibold">{t("howTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("howText", { per: data.level.next })}</p>
            <ul className="mt-4 grid gap-2">
              {data.rules.map((rule) => (
                <li key={rule.source} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5 text-sm">
                  <span>
                    <span className="block font-semibold">{label(rule.source)}</span>
                    <span className="block text-xs text-muted-foreground">{t.has(`rule.${rule.source}`) ? t(`rule.${rule.source}` as "rule.placement") : rule.note}</span>
                  </span>
                  <span className="shrink-0 font-bold text-lilac-deep">{rule.variable ? t("upTo", { n: rule.points }) : `+${rule.points}`}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">{t("serverNote")}</p>
          </section>
        </div>
      )}
    </QueryState>
  );
}
