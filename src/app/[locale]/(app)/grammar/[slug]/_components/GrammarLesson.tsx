"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { contentService } from "@/services/contentService";
import QueryState from "@/ui/components/QueryState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import ItemProgress from "@/ui/components/ItemProgress";

export default function GrammarLesson({ slug }: { slug: string }) {
  const t = useTranslations("grammar");
  const common = useTranslations("common");
  const locale = useLocale();
  const query = useQuery({ queryKey: ["grammar", slug], queryFn: () => contentService.grammarOne(slug) });
  const item = query.data;
  const az = locale === "az";
  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      {item && (
        <article className="grid gap-6">
          <Link href={routes.grammar} className="text-sm font-semibold">{common("back")}</Link>
          <header>
            <Badge variant={item.accent}>{item.level}</Badge>
            <h1 className="mt-3 text-title font-semibold">{item.title}</h1>
            <ItemProgress kind="grammar" slug={item.slug} className="max-w-sm" />
            <p className="text-muted-foreground">{item.titleAz}</p>
          </header>
          <section className="glass rounded-xl p-6">
            <h2 className="font-semibold">{t("explain")}</h2>
            <p className="mt-3 leading-7">{az ? item.explanationAz : item.explanation}</p>
            <p className="mt-2 text-sm text-muted-foreground">{az ? item.explanation : item.explanationAz}</p>
          </section>
          <section className="glass rounded-xl p-6">
            <h2 className="font-semibold">{t("rules")}</h2>
            <ul className="mt-3 grid gap-2">
              {(az ? item.rulesAz : item.rules).map((rule) => (
                <li key={rule} className="rounded-lg bg-muted px-4 py-3">{rule}</li>
              ))}
            </ul>
          </section>
          <section className="glass rounded-xl p-6">
            <h2 className="font-semibold">{t("examples")}</h2>
            <ul className="mt-3 grid gap-3">
              {item.examples.map((example) => (
                <li key={example.en} className="rounded-lg bg-mint/60 p-4 text-ink">
                  <p className="font-semibold">{example.en}</p>
                  <p className="text-sm">{example.az}</p>
                </li>
              ))}
            </ul>
          </section>
          <Button asChild><Link href={`${routes.grammar}/${item.slug}/quiz`}>{t("quiz")}</Link></Button>
        </article>
      )}
    </QueryState>
  );
}

/* ingri-completion */
