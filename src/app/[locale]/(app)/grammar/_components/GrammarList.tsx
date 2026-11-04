"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useProgress } from "@/hooks/useProgress";
import ContentList from "@/ui/components/ContentList";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import ItemProgress from "@/ui/components/ItemProgress";
import type { GrammarLesson } from "@/types";

export default function GrammarList() {
  const t = useTranslations("grammar");
  const common = useTranslations("common");
  const d = useTranslations("datatable");
  const progress = useProgress();
  useStudyTimer("grammar");
  const score = (slug: string) => progress.data?.quizScores?.[slug];
  return (
    <ContentList<GrammarLesson>
      path="/grammar"
      queryKey="grammar"
      title={t("title")}
      text={t("text")}
      defaultSort="order"
      hrefFor={(item) => `${routes.grammar}/${item.slug}`}
      sortOptions={[{ value: "order", label: d("recommended") }, { value: "title", label: d("col.title") }, { value: "level", label: d("level") }, { value: "minutes", label: d("col.minutes") }]}
      columns={[
        { id: "title", header: d("col.title"), sortKey: "title", primary: true, cell: (g) => <span>{g.title}<span className="block text-xs font-normal text-muted-foreground">{g.titleAz}</span></span> },
        { id: "level", header: d("level"), sortKey: "level", cell: (g) => <Badge variant={g.accent}>{g.level}</Badge> },
        { id: "minutes", header: d("col.minutes"), sortKey: "minutes", cell: (g) => (g.minutes ? `${g.minutes}′` : "—") },
        { id: "score", header: common("score"), align: "right", cell: (g) => score(g.slug) ?? "—" },
        { id: "progress", header: d("col.progress"), className: "w-40", cell: (g) => <ItemProgress kind="grammar" slug={g.slug} /> },
      ]}
      renderCard={(item) => (
        <Link href={`${routes.grammar}/${item.slug}`} className="glass rounded-xl p-5">
          <Badge variant={item.accent}>{item.level}</Badge>
          <h2 className="mt-3 text-xl font-semibold">{item.title}</h2>
          <p className="text-sm text-muted-foreground">{item.titleAz}</p>
          <p className="mt-3 text-xs font-semibold">{common("score")} {score(item.slug) ?? "—"}</p>
          <ItemProgress kind="grammar" slug={item.slug} />
        </Link>
      )}
    />
  );
}

/* ingri-completion */
