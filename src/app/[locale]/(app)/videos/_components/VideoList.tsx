"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useProgress } from "@/hooks/useProgress";
import ContentList from "@/ui/components/ContentList";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import ItemProgress from "@/ui/components/ItemProgress";
import type { VideoItem } from "@/types";

export default function VideoList() {
  const t = useTranslations("videos");
  const d = useTranslations("datatable");
  const progress = useProgress();
  const watched = (slug: string) => progress.data?.watchedVideos?.includes(slug);
  return (
    <ContentList<VideoItem>
      path="/videos"
      queryKey="videos"
      title={t("title")}
      text={t("text")}
      defaultSort="newest"
      defaultView="grid"
      hrefFor={(item) => `${routes.videos}/${item.slug}`}
      facets={[{ key: "skill", label: d("skill") }, { key: "topic", label: d("topic") }]}
      sortOptions={[{ value: "newest", label: d("newest") }, { value: "order", label: d("recommended") }, { value: "title", label: d("col.title") }, { value: "level", label: d("level") }, { value: "minutes", label: d("col.minutes") }]}
      gridClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      columns={[
        { id: "title", header: d("col.title"), sortKey: "title", primary: true, cell: (v) => v.title },
        { id: "level", header: d("level"), sortKey: "level", cell: (v) => <Badge variant="lilac">{v.level}</Badge> },
        { id: "channel", header: d("col.channel"), cell: (v) => v.channel, hideOnMobile: true },
        { id: "topic", header: d("topic"), cell: (v) => v.topic },
        { id: "minutes", header: d("col.minutes"), sortKey: "minutes", align: "right", cell: (v) => (v.minutes ? `${v.minutes}′` : "—") },
        { id: "progress", header: d("col.progress"), className: "w-40", cell: (v) => <ItemProgress kind="video" slug={v.slug} /> },
      ]}
      renderCard={(item) => (
        <Link href={`${routes.videos}/${item.slug}`} className="glass group overflow-hidden rounded-xl">
          {item.youtubeId && (
            <img src={`https://i.ytimg.com/vi/${item.youtubeId}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full object-cover transition group-hover:scale-[1.02]" />
          )}
          <div className="p-5">
            <Badge variant="lilac">{item.level}</Badge>
            <h2 className="mt-2 font-semibold">{item.title}</h2>
            <p className="text-sm text-muted-foreground">{item.channel} · {item.topic}</p>
            {watched(item.slug) && <p className="mt-2 text-xs font-semibold">{t("watched")}</p>}
            <ItemProgress kind="video" slug={item.slug} />
          </div>
        </Link>
      )}
    />
  );
}

/* ingri-completion */
