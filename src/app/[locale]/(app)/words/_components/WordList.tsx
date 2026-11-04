"use client";

import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { useProgress } from "@/hooks/useProgress";
import ContentList from "@/ui/components/ContentList";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { speak } from "@/lib/speech";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import { progressService } from "@/services/contentService";
import type { Word } from "@/types";

export default function WordList() {
  const t = useTranslations("words");
  const common = useTranslations("common");
  const d = useTranslations("datatable");
  const progress = useProgress();
  const client = useQueryClient();
  useStudyTimer("words");
  const status = (slug: string) => (progress.data?.wordStatus?.[slug] ? t(progress.data.wordStatus[slug]) : t("new"));
  const cat = (value: string) => (t.has(value) ? t(value) : value);
  const actions = (word: Word) => (
    <div className="flex items-center justify-end gap-2">
      <button type="button" aria-label={t("favorite")} onClick={() => progressService.favorite(word.slug).then((data) => client.setQueryData(["progress"], data))} className="grid size-9 place-items-center rounded-full bg-lilac text-ink">★</button>
      <button type="button" aria-label={common("pronounce")} onClick={() => speak(word.en)} className="grid size-9 place-items-center rounded-full bg-peach text-ink">♪</button>
    </div>
  );
  return (
    <ContentList<Word>
      path="/words"
      completable={false}
      queryKey="words"
      title={t("title")}
      text={t("text")}
      defaultSort="newest"
      hrefFor={(word) => `${routes.words}/${word.slug}`}
      facets={[{ key: "category", label: d("category"), format: cat }]}
      sortOptions={[{ value: "newest", label: d("newest") }, { value: "rank", label: d("recommended") }, { value: "en", label: d("col.word") }, { value: "level", label: d("level") }, { value: "category", label: d("category") }]}
      headerExtra={
        <div className="flex flex-wrap items-center gap-2">
          <a className="rounded-full bg-peach px-4 py-2 text-sm font-semibold text-ink" href="/api/words/export.pdf">{t("pdf")}</a>
          <Link href={routes.flashcards} className="rounded-full bg-lilac px-4 py-2 text-sm font-semibold text-ink">{t("cardsTitle")}</Link>
          <p className="basis-full text-xs text-muted-foreground">{t("credit")}</p>
        </div>
      }
      columns={[
        { id: "en", header: d("col.word"), sortKey: "en", primary: true, cell: (w) => <span>{w.en}{w.ipa && <span className="ml-2 text-xs font-normal text-muted-foreground">{w.ipa}</span>}</span> },
        { id: "az", header: d("col.translation"), cell: (w) => w.az },
        { id: "level", header: d("level"), sortKey: "level", cell: (w) => <Badge variant="lilac">{w.level}</Badge> },
        { id: "category", header: d("category"), sortKey: "category", hideOnMobile: true, cell: (w) => (w.category ? cat(w.category) : "—") },
        { id: "status", header: d("col.status"), cell: (w) => <Badge variant="aqua">{status(w.slug)}</Badge> },
        { id: "actions", header: <span className="sr-only">{d("col.actions")}</span>, align: "right", hideOnMobile: true, cell: actions },
      ]}
      renderCard={(word) => (
        <div className="glass flex items-center justify-between gap-3 rounded-xl p-4">
          <Link href={`${routes.words}/${word.slug}`} className="min-w-0">
            <p className="font-semibold">{word.en}</p>
            <p className="text-sm text-muted-foreground">{word.az}</p>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="aqua">{status(word.slug)}</Badge>
            {actions(word)}
          </div>
        </div>
      )}
    />
  );
}
