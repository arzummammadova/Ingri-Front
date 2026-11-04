"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useProgress } from "@/hooks/useProgress";
import ContentList from "@/ui/components/ContentList";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import ItemProgress from "@/ui/components/ItemProgress";
import type { ListeningItem } from "@/types";

export default function ListeningList() {
  const t = useTranslations("listening");
  const common = useTranslations("common");
  const d = useTranslations("datatable");
  const progress = useProgress();
  const score = (slug: string) => progress.data?.listeningScores?.[slug];
  return (
    <ContentList<ListeningItem>
      path="/listening"
      queryKey="listening"
      title={t("title")}
      text={t("text")}
      defaultSort="newest"
      levelDefault="all"
      hrefFor={(item) => `${routes.listening}/${item.slug}`}
      sortOptions={[{ value: "newest", label: d("newest") }, { value: "order", label: d("recommended") }, { value: "title", label: d("col.title") }, { value: "level", label: d("level") }, { value: "minutes", label: d("col.minutes") }]}
      columns={[
        { id: "title", header: d("col.title"), sortKey: "title", primary: true, cell: (l) => <span>{l.title}<span className="block text-xs font-normal text-muted-foreground">{l.titleAz}</span></span> },
        { id: "level", header: d("level"), sortKey: "level", cell: (l) => <Badge variant={l.accent}>{l.level}</Badge> },
        { id: "minutes", header: d("col.minutes"), sortKey: "minutes", cell: (l) => (l.minutes ? `${l.minutes}′` : "—") },
        { id: "score", header: common("score"), align: "right", cell: (l) => score(l.slug) ?? "—" },
        { id: "progress", header: d("col.progress"), className: "w-40", cell: (l) => <ItemProgress kind="listening" slug={l.slug} /> },
      ]}
      renderCard={(item) => (
        <Link href={`${routes.listening}/${item.slug}`} className="glass rounded-xl p-5">
          <Badge variant={item.accent}>{item.level}</Badge>
          <h2 className="mt-3 text-xl font-semibold">{item.title}</h2>
          <p className="text-sm text-muted-foreground">{item.titleAz}</p>
          <p className="mt-3 text-xs font-semibold">{common("score")} {score(item.slug) ?? "—"}</p>
          <ItemProgress kind="listening" slug={item.slug} />
        </Link>
      )}
    />
  );
}

/* ingri-completion */
