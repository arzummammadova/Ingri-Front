"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useProgress } from "@/hooks/useProgress";
import ContentList from "@/ui/components/ContentList";
import { Badge } from "@/components/ui/badge";
import { formatClock } from "@/lib/utils";
import { routes } from "@/config/routes";
import type { Podcast } from "@/types";
import ItemProgress from "@/ui/components/ItemProgress";

const tone = { lilac: "lilac", mint: "mint", peach: "peach", aqua: "aqua" } as const;
const bubble = { lilac: "bg-lilac", mint: "bg-mint", peach: "bg-peach", aqua: "bg-aqua" } as const;

export default function PodcastList() {
  const t = useTranslations("podcasts");
  const d = useTranslations("datatable");
  const progress = useProgress();
  const locale = useLocale();
  const remain = (item: Podcast) => Math.max(item.minutes * 60 - (progress.data?.podcastSeconds?.[item.slug] || 0), 0) || item.minutes * 60;
  return (
    <ContentList<Podcast>
      path="/podcasts"
      queryKey="podcasts"
      title={t("title")}
      text={t("text")}
      defaultSort="order"
      levelDefault="all"
      hrefFor={(item) => `${routes.podcasts}/${item.slug}`}
      sortOptions={[{ value: "order", label: d("recommended") }, { value: "title", label: d("col.title") }, { value: "level", label: d("level") }, { value: "minutes", label: d("col.minutes") }]}
      columns={[
        { id: "title", header: d("col.title"), sortKey: "title", primary: true, cell: (p) => <span>{p.title}<span className="block text-xs font-normal text-muted-foreground">{locale === "az" ? p.titleAz : p.summary}</span></span> },
        { id: "level", header: d("level"), sortKey: "level", cell: (p) => <Badge variant={tone[p.accent]}>{p.level}</Badge> },
        { id: "minutes", header: d("col.minutes"), sortKey: "minutes", cell: (p) => `${p.minutes}′` },
        { id: "left", header: d("col.left"), hideOnMobile: true, cell: (p) => formatClock(remain(p)) },
        { id: "progress", header: d("col.progress"), className: "w-40", cell: (p) => <ItemProgress kind="podcast" slug={p.slug} /> },
      ]}
      renderCard={(item) => (
        <Link href={`${routes.podcasts}/${item.slug}`} className="glass flex items-center gap-4 rounded-xl p-4">
          <div className={`grid size-16 shrink-0 place-items-center rounded-full text-lg text-ink ${bubble[item.accent]}`}>▶</div>
          <div className="min-w-0 flex-1">
            <Badge variant={tone[item.accent]}>{item.level}</Badge>
            <h2 className="mt-2 font-semibold">{item.title}</h2>
            <p className="text-sm text-muted-foreground">{locale === "az" ? item.titleAz : item.summary}</p>
            <p className="mt-2 text-xs font-semibold">{t("keep", { time: formatClock(remain(item)) })}</p>
            <ItemProgress kind="podcast" slug={item.slug} />
          </div>
        </Link>
      )}
    />
  );
}

/* ingri-completion */
