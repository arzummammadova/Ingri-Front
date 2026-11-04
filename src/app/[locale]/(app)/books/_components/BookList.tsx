"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ContentList from "@/ui/components/ContentList";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import ItemProgress from "@/ui/components/ItemProgress";
import type { BookItem } from "@/types";

export default function BookList() {
  const t = useTranslations("books");
  const d = useTranslations("datatable");
  const locale = useLocale();
  return (
    <ContentList<BookItem>
      path="/books"
      queryKey="books"
      title={t("title")}
      text={t("text")}
      defaultSort="newest"
      defaultView="grid"
      hrefFor={(item) => `${routes.books}/${item.slug}`}
      sortOptions={[{ value: "newest", label: d("newest") }, { value: "order", label: d("recommended") }, { value: "title", label: d("col.title") }, { value: "author", label: d("col.author") }, { value: "level", label: d("level") }, { value: "year", label: d("col.year") }]}
      columns={[
        { id: "title", header: d("col.title"), sortKey: "title", primary: true, cell: (b) => b.title },
        { id: "author", header: d("col.author"), sortKey: "author", cell: (b) => b.author },
        { id: "level", header: d("level"), sortKey: "level", cell: (b) => <Badge variant="aqua">{b.level}</Badge> },
        { id: "year", header: d("col.year"), sortKey: "year", hideOnMobile: true, cell: (b) => b.year || "—" },
        { id: "progress", header: d("col.progress"), className: "w-40", cell: (b) => <ItemProgress kind="book" slug={b.slug} /> },
      ]}
      renderCard={(item) => (
        <Link href={`${routes.books}/${item.slug}`} className="glass rounded-xl p-5">
          <Badge variant="aqua">{item.level}</Badge>
          <h2 className="mt-2 font-semibold">{item.title}</h2>
          <p className="text-sm text-muted-foreground">{item.author}</p>
          <p className="mt-2 line-clamp-3 text-sm">{locale === "az" ? item.descriptionAz : item.description}</p>
          <ItemProgress kind="book" slug={item.slug} />
        </Link>
      )}
    />
  );
}

/* ingri-completion */
