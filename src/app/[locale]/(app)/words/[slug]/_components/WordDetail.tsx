"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { contentService, progressService } from "@/services/contentService";
import { Button } from "@/components/ui/button";
import QueryState from "@/ui/components/QueryState";
import { speak } from "@/lib/speech";
import { routes } from "@/config/routes";

export default function WordDetail({ slug }: { slug: string }) {
  const t = useTranslations("words");
  const common = useTranslations("common");
  const query = useQuery({ queryKey: ["word", slug], queryFn: () => contentService.word(slug) });
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (status: "learning" | "known") => progressService.word(slug, status),
    onSuccess: () => client.invalidateQueries({ queryKey: ["progress"] }),
  });
  const word = query.data;
  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      {word && (
        <article className="mx-auto grid max-w-xl gap-4">
          <Link href={routes.words} className="text-sm font-semibold">{common("back")}</Link>
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-display font-semibold">{word.en}</p>
            <p className="mt-2 text-muted-foreground">{word.ipa}</p>
            <p className="mt-4 text-2xl">{word.az}</p>
          </div>
          <section className="rounded-xl bg-mint p-5 text-ink">
            <h2 className="font-semibold">{t("example")}</h2>
            <p className="mt-2">{word.example}</p>
            <p className="text-sm">{word.exampleAz}</p>
          </section>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => speak(word.en)}>{common("pronounce")}</Button>
            <Button variant="lilac" onClick={() => save.mutate("learning")}>{t("learning")}</Button>
            <Button onClick={() => save.mutate("known")}>{t("known")}</Button>
          </div>
        </article>
      )}
    </QueryState>
  );
}
