"use client";

import { useState } from "react";
import { useExitGuard } from "@/ui/components/ExitGuard";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { contentService, progressService } from "@/services/contentService";
import { Button } from "@/components/ui/button";
import QueryState from "@/ui/components/QueryState";
import { routes } from "@/config/routes";
import { useTrackItem } from "@/hooks/useCompletion";
import ItemProgress from "@/ui/components/ItemProgress";
import { playSound } from "@/lib/sound";

export default function GrammarQuiz({ slug }: { slug: string }) {
  const t = useTranslations("grammar");
  const common = useTranslations("common");
  const locale = useLocale();
  const query = useQuery({ queryKey: ["grammar", slug], queryFn: () => contentService.grammarOne(slug) });
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (score: number) => progressService.quiz(slug, score),
    onSuccess: () => client.invalidateQueries({ queryKey: ["progress"] }),
  });
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const item = query.data;
  const track = useTrackItem("grammar", item?.slug || slug, item?.level, item?.title);
  const question = item?.quiz[step];
  useExitGuard(!done && (step > 0 || picked !== null));

  function choose(option: number) {
    if (!question || picked !== null) return;
    setPicked(option);
    if (option === question.answer) setCorrect((value) => value + 1);
    playSound(option === question.answer ? "correct" : "wrong");
  }

  function next() {
    if (!item) return;
    playSound("next");
    if (step + 1 >= item.quiz.length) {
      const score = Math.round((correct / item.quiz.length) * 100);
      setDone(true);
      save.mutate(score);
    if (score >= 70) track.complete();
      return;
    }
    setStep((value) => value + 1);
    setPicked(null);
  }

  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      {item && (
        <div className="mx-auto grid max-w-2xl gap-4">
          <Link href={`${routes.grammar}/${slug}`} className="text-sm font-semibold">{common("back")}</Link>
          <h1 className="text-title font-semibold">{item.title}</h1>
          <ItemProgress kind="grammar" slug={item.slug || slug} className="mt-0 max-w-sm" />
          {done ? (
            <div className="glass rounded-xl p-6">
              <p className="text-2xl font-bold">{t("result", { score: Math.round((correct / item.quiz.length) * 100) })}</p>
              <Button className="mt-4" onClick={() => { setDone(false); setStep(0); setCorrect(0); setPicked(null); }}>{t("again")}</Button>
            </div>
          ) : question && (
            <div className="glass rounded-xl p-6">
              <p className="text-sm text-muted-foreground">{t("question", { n: step + 1, total: item.quiz.length })}</p>
              <h2 className="mt-2 text-xl font-semibold">{question.prompt}</h2>
              <p className="text-sm text-muted-foreground">{question.promptAz}</p>
              <div className="mt-4 grid gap-2">
                {question.options.map((option, index) => {
                  const state = picked === null ? "" : index === question.answer ? "bg-mint text-ink" : index === picked ? "bg-peach text-ink" : "";
                  return (
                    <button key={option} type="button" onClick={() => choose(index)} className={`rounded-lg bg-muted px-4 py-3 text-left font-medium ${state}`}>
                      {option}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <p className="mt-4 text-sm">{locale === "az" ? question.explainAz : question.explain}</p>
              )}
              <Button className="mt-4" disabled={picked === null} onClick={next}>{t("check")}</Button>
            </div>
          )}
        </div>
      )}
    </QueryState>
  );
}

/* ingri-completion */
