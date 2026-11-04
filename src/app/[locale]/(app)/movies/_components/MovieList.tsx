"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ContentList from "@/ui/components/ContentList";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import ItemProgress from "@/ui/components/ItemProgress";
import type { MovieItem } from "@/types";

export default function MovieList() {
  const t = useTranslations("movies");
  const d = useTranslations("datatable");
  const locale = useLocale();
  return (
    <ContentList<MovieItem>
      path="/movies"
      queryKey="movies"
      title={t("title")}
      text={t("text")}
      defaultSort="order"
      defaultView="grid"
      hrefFor={(item) => `${routes.movies}/${item.slug}`}
      sortOptions={[{ value: "order", label: d("recommended") }, { value: "title", label: d("col.title") }, { value: "level", label: d("level") }, { value: "year", label: d("col.year") }]}
      gridClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      columns={[
        { id: "title", header: d("col.title"), sortKey: "title", primary: true, cell: (m) => m.title },
        { id: "year", header: d("col.year"), sortKey: "year", cell: (m) => m.year || "—" },
        { id: "level", header: d("level"), sortKey: "level", cell: (m) => <Badge variant="peach">{m.level}</Badge> },
        { id: "why", header: d("col.about"), hideOnMobile: true, className: "max-w-md", cell: (m) => <span className="line-clamp-2 text-muted-foreground">{locale === "az" ? m.whyAz : m.why}</span> },
        { id: "progress", header: d("col.progress"), className: "w-40", cell: (m) => <ItemProgress kind="movie" slug={m.slug} /> },
      ]}
      renderCard={(item) => (
        <Link href={`${routes.movies}/${item.slug}`} className="glass group overflow-hidden rounded-xl">
          {item.trailerId && <img src={`https://i.ytimg.com/vi/${item.trailerId}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full object-cover transition group-hover:scale-[1.02]" />}
          <div className="p-5">
            <Badge variant="peach">{item.level}</Badge>
            <h2 className="mt-2 font-semibold">{item.title}{item.year ? ` (${item.year})` : ""}</h2>
            <p className="line-clamp-3 text-sm text-muted-foreground">{locale === "az" ? item.whyAz : item.why}</p>
            <ItemProgress kind="movie" slug={item.slug} />
          </div>
        </Link>
      )}
    />
  );
}

/* ingri-completion */
