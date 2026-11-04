"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useProgress } from "@/hooks/useProgress";
import ContentList from "@/ui/components/ContentList";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import ItemProgress from "@/ui/components/ItemProgress";
import type { SpeakingItem } from "@/types";

export default function SpeakingList() {
  const t = useTranslations("speaking");
  const common = useTranslations("common");
  const d = useTranslations("datatable");
  const locale = useLocale();
  const progress = useProgress();
  const best = (slug: string) => progress.data?.speakingBest?.[slug];
  return (
    <ContentList<SpeakingItem>
      path="/speaking"
      queryKey="speaking"
      title={t("title")}
      text={t("text")}
      defaultSort="newest"
      levelDefault="all"
      hrefFor={(item) => `${routes.speaking}/${item.slug}`}
      facets={[{ key: "category", label: d("category") }]}
      sortOptions={[{ value: "newest", label: d("newest") }, { value: "order", label: d("recommended") }, { value: "en", label: d("col.phrase") }, { value: "level", label: d("level") }, { value: "category", label: d("category") }]}
      columns={[
        { id: "en", header: d("col.phrase"), sortKey: "en", primary: true, cell: (s) => <span>{s.en}<span className="block text-xs font-normal text-muted-foreground">{s.az}</span></span> },
        { id: "category", header: d("category"), sortKey: "category", cell: (s) => (locale === "az" ? s.categoryAz : s.category) },
        { id: "level", header: d("level"), sortKey: "level", cell: (s) => <Badge variant="mint">{s.level}</Badge> },
        { id: "score", header: common("score"), align: "right", cell: (s) => best(s.slug) ?? "—" },
        { id: "progress", header: d("col.progress"), className: "w-40", cell: (s) => <ItemProgress kind="speaking" slug={s.slug} /> },
      ]}
      renderCard={(item) => (
        <Link href={`${routes.speaking}/${item.slug}`} className="glass rounded-xl p-5">
          <Badge variant="mint">{item.level}</Badge>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{locale === "az" ? item.categoryAz : item.category}</p>
          <h2 className="mt-1 text-lg font-semibold">{item.en}</h2>
          <p className="text-sm text-muted-foreground">{common("score")} {best(item.slug) ?? "—"}</p>
          <ItemProgress kind="speaking" slug={item.slug} />
        </Link>
      )}
    />
  );
}

/* ingri-completion */
