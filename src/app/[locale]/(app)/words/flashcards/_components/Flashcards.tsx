"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { contentService, progressService } from "@/services/contentService";
import { Button } from "@/components/ui/button";
import QueryState from "@/ui/components/QueryState";
import { SectionTitle } from "@/ui/components/primitives";
import { speak } from "@/lib/speech";
import { routes } from "@/config/routes";

export default function Flashcards() {
  const t = useTranslations("words");
  const common = useTranslations("common");
  const query = useQuery({ queryKey: ["words"], queryFn: contentService.words });
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (slug: string) => progressService.word(slug, "known"),
    onSuccess: () => client.invalidateQueries({ queryKey: ["progress"] }),
  });
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = query.data?.[index];

  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} empty={!query.data?.length} onRetry={() => query.refetch()}>
      <SectionTitle title={t("cardsTitle")} text={t("cardsText")} />
      {word && (
        <div className="mx-auto grid max-w-md gap-4">
          <button type="button" onClick={() => setFlipped((value) => !value)} className="glass min-h-64 rounded-xl p-8 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{flipped ? word.az : t("flip")}</p>
            <p className="mt-6 text-display font-semibold">{flipped ? word.az : word.en}</p>
            <p className="mt-2 text-muted-foreground">{flipped ? word.exampleAz : word.ipa}</p>
          </button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => speak(word.en)}>{common("pronounce")}</Button>
            <Button variant="mint" onClick={() => save.mutate(word.slug)}>{t("markKnown")}</Button>
            <Button onClick={() => { setFlipped(false); setIndex((value) => (value + 1) % (query.data?.length || 1)); }}>{common("next")}</Button>
          </div>
          <Link href={`${routes.words}/${word.slug}`} className="text-sm font-semibold">{word.en}</Link>
        </div>
      )}
    </QueryState>
  );
}
