"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { QUIZ_PASS, contentService, progressService } from "@/services/contentService";
import { Button } from "@/components/ui/button";
import QueryState from "@/ui/components/QueryState";
import { speak, stopSpeech } from "@/lib/speech";
import { routes } from "@/config/routes";
import { CELEBRATE_EVENT } from "@/hooks/useCompletion";
import ItemProgress from "@/ui/components/ItemProgress";
import { playSound } from "@/lib/sound";

export default function ListeningExercise({ slug }: { slug: string }) {
  const t = useTranslations("listening");
  const common = useTranslations("common");
  const qz = useTranslations("quiz");
  const query = useQuery({ queryKey: ["listening", slug], queryFn: () => contentService.listeningOne(slug) });
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (score: number) => progressService.listening(slug, score),
    onSuccess: (data, score) => {
      client.setQueryData(["progress"], data);
      setResult({ passed: data.passed ?? score >= QUIZ_PASS, awarded: data.awarded || 0 });
      if (data.awarded) { client.invalidateQueries({ queryKey: ["me"] }); window.dispatchEvent(new CustomEvent(CELEBRATE_EVENT, { detail: { kind: "listening", slug, title: query.data?.title } })); }
    },
  });
  const [result, setResult] = useState<null | { passed: boolean; awarded: number }>(null);
  const [finishedAudio, setFinishedAudio] = useState(false);
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [showText, setShowText] = useState(false);
  const item = query.data;

  function play() {
    if (!item) return;
    stopSpeech();
    const lines = [...item.lines];
    const step = (index: number) => {
      if (index >= lines.length) { setFinishedAudio(true); setOpen(true); playSound("complete"); return; }
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
    if (Object.keys(answers).length < item.questions.length) return;
    const hits = item.questions.filter((question, index) => answers[index] === question.answer).length;
    const next = Math.round((hits / item.questions.length) * 100);
    setScore(next);
    playSound(next >= QUIZ_PASS ? "correct" : "wrong");
    setShowText(true);
    setResult(null);
    save.mutate(next);
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
          {finishedAudio && score === null && (
            <div className="rounded-xl bg-lilac p-4 text-ink" role="status">
              <p className="font-semibold">{qz("prompt")}</p>
              <p className="text-sm">{qz("promptText", { pass: QUIZ_PASS })}</p>
            </div>
          )}
          {open && (
            <div className="grid gap-4">
              {item.questions.map((question, index) => (
                <fieldset key={question.prompt} className="glass rounded-xl p-5">
                  <legend className="font-semibold">{question.prompt}</legend>
                  <p className="text-sm text-muted-foreground">{question.promptAz}</p>
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option, optionIndex) => {
                      const checked = score !== null;
                      const state = !checked ? "bg-muted" : optionIndex === question.answer ? "bg-mint text-ink" : answers[index] === optionIndex ? "bg-peach text-ink" : "bg-muted opacity-70";
                      return (
                        <label key={option} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${state}`}>
                          <input type="radio" name={`q-${index}`} disabled={checked} checked={answers[index] === optionIndex} onChange={() => { setAnswers({ ...answers, [index]: optionIndex }); playSound("click"); }} />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                  {score !== null && (
                    <p className={`mt-2 text-sm font-semibold ${answers[index] === question.answer ? "text-emerald-600" : "text-danger"}`}>
                      {answers[index] === question.answer ? `✓ ${qz("correct")}` : `✗ ${qz("wrong")} · ${qz("correctAnswer", { answer: question.options[question.answer] })}`}
                    </p>
                  )}
                </fieldset>
              ))}
              <p className="text-xs text-muted-foreground">{qz("required", { pass: QUIZ_PASS })}</p>
              {score === null ? (
                <Button onClick={submit} disabled={Object.keys(answers).length < item.questions.length} title={qz("answerAll")}>{t("submit")}</Button>
              ) : (
                <div className={`rounded-xl p-4 text-ink ${score >= QUIZ_PASS ? "bg-mint" : "bg-peach"}`}>
                  <p className="text-xl font-bold">{common("score")}: {score}%</p>
                  <p className="text-sm">{score >= QUIZ_PASS ? qz("passed") : qz("failed", { pass: QUIZ_PASS })}</p>
                  {result && result.awarded > 0 && <p className="text-sm font-semibold">{qz("points", { points: result.awarded })}</p>}
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => { setScore(null); setAnswers({}); setResult(null); setShowText(false); }}>{qz("retry")}</Button>
                </div>
              )}
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
