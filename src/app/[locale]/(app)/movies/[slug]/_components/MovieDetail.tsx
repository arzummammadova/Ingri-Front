"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { contentService, progressService } from "@/services/contentService";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import QueryState from "@/ui/components/QueryState";
import YouTubeFrame from "@/ui/components/YouTubeFrame";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useTrackItem, useYouTubeCompletion } from "@/hooks/useCompletion";
import ItemProgress from "@/ui/components/ItemProgress";

export default function MovieDetail({ slug }: { slug: string }) {
  const t = useTranslations("movies");
  const common = useTranslations("common");
  const locale = useLocale();
  const query = useQuery({ queryKey: ["movie", slug], queryFn: () => contentService.movie(slug) });
  const client = useQueryClient();
  useStudyTimer("listening");
  const item = query.data;
  const track = useTrackItem("movie", item?.slug, item?.level, item?.title);
  useYouTubeCompletion(item?.trailerId, track.report, 150);
  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      {item && (
        <article className="grid gap-4">
          <Link href={routes.movies} className="text-sm font-semibold">{common("back")}</Link>
          <h1 className="text-title font-semibold">{item.title}</h1>
          <ItemProgress kind="movie" slug={item.slug} showEmpty className="mt-0 max-w-sm" />
          <p>{locale === "az" ? item.whyAz : item.why}</p>
          <YouTubeFrame id={item.trailerId} title={`${item.title} trailer`} />
          <ul className="flex flex-wrap gap-2">{item.vocabulary.map((word) => <li key={word.en} className="rounded-full bg-peach px-3 py-1 text-sm text-ink">{word.en} — {word.az}</li>)}</ul>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <a href={item.justwatch} target="_blank" rel="noreferrer">{t("legal")}</a>
            <a href={item.imdb} target="_blank" rel="noreferrer">{t("imdb")}</a>
          </div>
          <Button onClick={track.complete}>{t("watched")}</Button>
        </article>
      )}
    </QueryState>
  );
}

/* ingri-completion */
