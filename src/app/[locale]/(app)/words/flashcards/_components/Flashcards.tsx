"use client";

import { useState } from "react";
import { useExitGuard } from "@/ui/components/ExitGuard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { contentService, progressService } from "@/services/contentService";
import { Button } from "@/components/ui/button";
import QueryState from "@/ui/components/QueryState";
import { SectionTitle } from "@/ui/components/primitives";
import { speak } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

export default function Flashcards() {
  const t = useTranslations("words");
  const f = useTranslations("flash");
  const common = useTranslations("common");
  const query = useQuery({ queryKey: ["words"], queryFn: contentService.words });
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (slug: string) => progressService.word(slug, "known"),
    onSuccess: () => client.invalidateQueries({ queryKey: ["progress"] }),
  });
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const total = query.data?.length || 0;
  const word = query.data?.[index];
  useExitGuard(index > 0 && index < total - 1);

  const say = (event: React.SyntheticEvent, text: string) => {
    event.stopPropagation();
    speak(text, 0.9, { respectSound: true });
  };
  const next = () => {
    playSound("pop");
    setFlipped(false);
    window.setTimeout(() => setIndex((value) => (value + 1) % (total || 1)), flipped ? 180 : 0);
  };

  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} empty={!total} onRetry={() => query.refetch()}>
      <SectionTitle title={t("cardsTitle")} text={t("cardsText")} />
      {word && (
        <div className="mx-auto grid w-full max-w-md gap-4">
          <p className="text-center text-xs font-semibold text-muted-foreground">{index + 1} / {total}</p>
          <div className="flip-scene">
            <div
              role="button"
              tabIndex={0}
              aria-pressed={flipped}
              aria-label={f("flipHint")}
              onClick={() => { setFlipped((v) => !v); playSound("click"); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((v) => !v); } }}
              className={cn("flip-card relative min-h-72 cursor-pointer select-none", flipped && "is-flipped")}
            >
              <div className="flip-face glass absolute inset-0 grid place-items-center rounded-2xl p-8 text-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{f("flipHint")}</p>
                  <button type="button" onClick={(e) => say(e, word.en)} className="mt-6 inline-flex items-center gap-2 rounded-xl px-3 py-1 text-display font-semibold transition hover:bg-lilac/40">
                    {word.en}
                    <Volume2 className="size-5 text-muted-foreground" />
                  </button>
                  {word.ipa && <p className="mt-2 text-muted-foreground">{word.ipa}</p>}
                </div>
              </div>
              <div className="flip-face flip-back absolute inset-0 grid place-items-center rounded-2xl bg-lilac p-8 text-center text-ink shadow-soft">
                <div>
                  <button type="button" onClick={(e) => say(e, word.en)} aria-label={f("speak")} className="inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm font-semibold opacity-80 transition hover:bg-paper/40">
                    {word.en}<Volume2 className="size-4" />
                  </button>
                  <button type="button" onClick={(e) => say(e, word.en)} className="mt-3 block w-full rounded-xl px-3 py-1 text-display font-semibold transition hover:bg-paper/30">
                    {word.az}
                  </button>
                  {word.exampleAz && <p className="mt-3 text-sm opacity-80">{word.exampleAz}</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => speak(word.en, 0.9, { respectSound: true })}><Volume2 className="size-4" />{common("pronounce")}</Button>
            <Button variant="mint" onClick={() => { save.mutate(word.slug); playSound("saved"); }}>{t("markKnown")}</Button>
            <Button onClick={next}>{common("next")}</Button>
          </div>
          <Link href={`${routes.words}/${word.slug}`} className="text-center text-sm font-semibold">{word.en}</Link>
        </div>
      )}
    </QueryState>
  );
}
