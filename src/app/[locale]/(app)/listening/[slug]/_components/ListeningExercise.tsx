"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { contentService, progressService } from "@/services/contentService";
import { Button } from "@/components/ui/button";
import QueryState from "@/ui/components/QueryState";
import { speak, stopSpeech } from "@/lib/speech";
import { routes } from "@/config/routes";
import { useTrackItem } from "@/hooks/useCompletion";
import ItemProgress from "@/ui/components/ItemProgress";
import { playSound } from "@/lib/sound";

export default function ListeningExercise({ slug }: { slug: string }) {
  const t = useTranslations("listening");
  const common = useTranslations("common");
  const query = useQuery({ queryKey: ["listening", slug], queryFn: () => contentService.listeningOne(slug) });
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (score: number) => progressService.listening(slug, score),
    onSuccess: () => client.invalidateQueries({ queryKey: ["progress"] }),
  });
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [showText, setShowText] = useState(false);
  const item = query.data;
  const track = useTrackItem("listening", item?.slug || slug, item?.level, item?.title);

  function play() {
    if (!item) return;
    stopSpeech();
    const lines = [...item.lines];
    const step = (index: number) => {
      if (index >= lines.length) return;
      const utterance = new SpeechSynthesisUtterance(`${lines[index].speaker}. ${lines[index].en}`);
      utterance.lang = "en-US";
      utterance.rate = 0.92;
      utterance.onend = () => step(index + 1);
      window.speechSynthesis.speak(utterance);
    };
    step(0);
  }

  function submit() {
    if (!item) return;
    const hits = item.questions.filter((question, index) => answers[index] === question.answer).length;
    const next = Math.round((hits / item.questions.length) * 100);
    setScore(next);
    playSound(next >= 70 ? "correct" : "wrong");
    setShowText(true);
    save.mutate(next);
    if (next >= 70) track.complete();
  }

  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      {item && (
        <div className="grid gap-5">
          <Link href={routes.listening} className="text-sm font-semibold">{common("back")}</Link>
          <h1 className="text-title font-semibold">{item.title}</h1>
          <ItemProgress kind="listening" slug={item.slug || slug} className="mt-0 max-w-sm" />
          <p className="text-muted-foreground">{item.titleAz}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={play}>{t("play")}</Button>
            <Button variant="outline" onClick={() => setOpen(true)}>{t("unlock")}</Button>
          </div>
          {open && (
            <div className="grid gap-4">
              {item.questions.map((question, index) => (
                <fieldset key={question.prompt} className="glass rounded-xl p-5">
                  <legend className="font-semibold">{question.prompt}</legend>
                  <p className="text-sm text-muted-foreground">{question.promptAz}</p>
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={option} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                        <input type="radio" name={`q-${index}`} onChange={() => setAnswers({ ...answers, [index]: optionIndex })} />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <Button onClick={submit}>{t("submit")}</Button>
              {score !== null && <p className="text-xl font-bold">{common("score")}: {score}%</p>}
            </div>
          )}
          {showText && (
            <section className="glass rounded-xl p-5">
              <h2 className="font-semibold">{t("show")}</h2>
              {item.lines.map((line) => (
                <p key={line.en} className="mt-3"><strong>{line.speaker}:</strong> {line.en}<br /><span className="text-sm text-muted-foreground">{line.az}</span></p>
              ))}
            </section>
          )}
        </div>
      )}
    </QueryState>
  );
}

/* ingri-completion */
