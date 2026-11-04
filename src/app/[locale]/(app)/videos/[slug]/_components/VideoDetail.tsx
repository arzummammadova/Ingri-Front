"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { contentService, progressService } from "@/services/contentService";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import QueryState from "@/ui/components/QueryState";
import { useMiniPlayer } from "@/ui/components/MiniPlayer";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useTrackItem, useYouTubeCompletion } from "@/hooks/useCompletion";
import ItemProgress from "@/ui/components/ItemProgress";

export default function VideoDetail({ slug }: { slug: string }) {
  const t = useTranslations("videos");
  const common = useTranslations("common");
  const az = useLocale() === "az";
  const query = useQuery({ queryKey: ["video", slug], queryFn: () => contentService.video(slug) });
  const client = useQueryClient();
  const [wide, setWide] = useState(false);
  const { play, setSlot, fullscreen } = useMiniPlayer();
  useStudyTimer("listening");
  const item = query.data;
  const track = useTrackItem("video", item?.slug, item?.level, item?.title);
  useYouTubeCompletion(item?.youtubeId, track.report, (item?.minutes || 10) * 60);

  useEffect(() => {
    if (item?.youtubeId) play({ youtubeId: item.youtubeId, title: item.title, href: `${routes.videos}/${item.slug}` });
  }, [item, play]);
  useEffect(() => () => setSlot(null), [setSlot]);

  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      {item && (
        <div className="grid gap-4">
          <Link href={routes.videos} className="text-sm font-semibold">{common("back")}</Link>
          <div className={wide ? "grid gap-6" : "grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start"}>
            <div className="grid gap-3">
              <div ref={setSlot} className="aspect-video rounded-xl bg-ink" />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setWide((w) => !w)}>
                  {wide ? (az ? "Kiçilt" : "Shrink") : (az ? "Geniş görünüş" : "Wide view")}
                </Button>
                <Button variant="outline" size="sm" onClick={fullscreen}>
                  {az ? "Tam ekran" : "Full screen"}
                </Button>
              </div>
            </div>
            <div className="grid content-start gap-3">
              <h1 className="text-title font-semibold">{item.title}</h1>
              <p className="text-sm text-muted-foreground">{item.channel} · {item.level} · {item.skill}</p>
              {"description" in item && (item as { description?: string }).description && (
                <p className="text-sm leading-relaxed">{(item as { description?: string }).description}</p>
              )}
              <ItemProgress kind="video" slug={item.slug} showEmpty />
              <Button className="w-fit" onClick={track.complete}>{t("watched")}</Button>
            </div>
          </div>
        </div>
      )}
    </QueryState>
  );
}
/* ingri-completion */
