"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { contentService, progressService } from "@/services/contentService";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import QueryState from "@/ui/components/QueryState";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useReachedEnd, useTrackItem } from "@/hooks/useCompletion";
import { useProgress } from "@/hooks/useProgress";
import ItemProgress, { CompletedBadge } from "@/ui/components/ItemProgress";

export default function BookReader({ slug }: { slug: string }) {
  const t = useTranslations("books");
  const common = useTranslations("common");
  const locale = useLocale();
  const query = useQuery({ queryKey: ["book", slug], queryFn: () => contentService.book(slug) });
  const [note, setNote] = useState("");
  useStudyTimer("reading");
  const item = query.data;
  const book = useTrackItem("book", item?.slug, item?.level, item?.title);
  const items = useProgress().data?.items;
  const chapterDone = (i: number) => !!items?.[`chapter:${slug}~${i}`]?.completed;
  const totalChapters = item?.chapters.length || 0;
  const doneCount = Array.from({ length: totalChapters }, (_, i) => chapterDone(i)).filter(Boolean).length;
  const bookReport = book.report;
  useEffect(() => {
    if (totalChapters && doneCount) bookReport((doneCount / totalChapters) * 100, doneCount >= totalChapters);
  }, [doneCount, totalChapters, bookReport]);
  async function lookup(token: string) {
    const found = await contentService.lookup(token.replace(/[^A-Za-z'-]/g, ""));
    setNote(found ? `${found.en} — ${found.az}` : token);
  }
  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      {item && (
        <article className="mx-auto grid max-w-3xl gap-4">
          <Link href={routes.books} className="text-sm font-semibold">{common("back")}</Link>
          <h1 className="text-title font-semibold">{item.title}</h1>
          <p className="text-sm text-muted-foreground">{item.author}</p>
          <ItemProgress kind="book" slug={item.slug} showEmpty className="mt-0 max-w-sm" />
          <p>{locale === "az" ? item.descriptionAz : item.description}</p>
          <p className="text-sm">{t("tap")}</p>
          {note && <p className="rounded-lg bg-peach p-3 text-ink" role="status">{note} <Button variant="outline" className="ml-2" onClick={() => progressService.favorite(note.split(" — ")[0] || "")}>{common("save")}</Button></p>}
          {item.chapters.map((chapter, chapterIndex) => (
            <section key={chapter.title} className="glass rounded-xl p-5 leading-7">
              <h2 className="mb-3 flex flex-wrap items-center gap-2 font-semibold">{chapter.title}{chapterDone(chapterIndex) && <CompletedBadge />}</h2>
              <p>
                {chapter.text.split(/(\s+)/).map((part, index) =>
                  /\s+/.test(part) ? part : (
                    <button key={`${chapter.title}-${index}`} type="button" className="rounded px-0.5 hover:bg-lilac" onClick={() => lookup(part)}>{part}</button>
                  ),
                )}
              </p>
              <ChapterEnd slug={slug} index={chapterIndex} level={item.level} />
            </section>
          ))}
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <a href={item.sourceUrl} target="_blank" rel="noreferrer">{t("source")}</a>
            <a href={item.downloadUrl} target="_blank" rel="noreferrer">{t("download")}</a>
          </div>
        </article>
      )}
    </QueryState>
  );
}

function ChapterEnd({ slug, index, level }: { slug: string; index: number; level?: string }) {
  const track = useTrackItem("chapter", `${slug}~${index}`, level);
  const ref = useReachedEnd(track.complete, !track.item?.completed);
  return <div ref={ref} aria-hidden="true" className="h-px" />;
}

/* ingri-completion */
