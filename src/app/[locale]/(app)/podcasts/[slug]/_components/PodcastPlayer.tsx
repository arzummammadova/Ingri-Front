"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Headphones, Pause, Play, RotateCcw, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { QUIZ_PASS, contentService, progressService } from "@/services/contentService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QueryState from "@/ui/components/QueryState";
import { speak, stopSpeech } from "@/lib/speech";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import { formatClock } from "@/lib/utils";
import { routes } from "@/config/routes";
import { CELEBRATE_EVENT, useReachedEnd, useTrackItem } from "@/hooks/useCompletion";
import ItemProgress from "@/ui/components/ItemProgress";
import { playSound } from "@/lib/sound";

const SPEEDS = [0.75, 1, 1.25];

export default function PodcastPlayer({ slug }: { slug: string }) {
  const t = useTranslations("podcasts");
  const common = useTranslations("common");
  const query = useQuery({ queryKey: ["podcast", slug], queryFn: () => contentService.podcast(slug) });
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (body: { seconds: number; completed: boolean }) => progressService.podcast({ slug, ...body }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["progress"] }),
  });
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [result, setResult] = useState<null | { score: number; passed: boolean; awarded: number }>(null);
  const [promptQuiz, setPromptQuiz] = useState(false);
  const quizRef = useRef<HTMLElement>(null);
  const qz = useTranslations("quiz");
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSave = useRef(0);
  useStudyTimer("listening");
  const item = query.data;
  const sentences = item?.sentences ?? [];
  const hasTranscript = sentences.length > 0 && item?.transcriptAvailable !== false;
  const audioUrl = item?.audioUrl;
  const track = useTrackItem("podcast", item?.slug, item?.level, item?.title);
  // Reaching the end never completes a podcast — it only prompts the quiz.
  const noQuiz = !!item && !(item.quiz?.length);
  const askQuiz = useCallback(() => {
    setPromptQuiz(true);
    // Podcasts without a quiz complete on reaching the end (server accepts it as a 100% check).
    if (noQuiz) progressService.podcastQuiz(slug, 100).then((data) => client.setQueryData(["progress"], data)).catch(() => undefined);
  }, [noQuiz, slug, client]);
  const endRef = useReachedEnd(askQuiz, !!item && hasTranscript);
  const ttsTotal = (sentences.length || 1) * 8;
  const left = audioUrl ? Math.max((duration || (item?.minutes ?? 0) * 60) - time, 0) : Math.max(ttsTotal - index * 8, 0);
  const quiz = item?.quiz ?? [];
  const question = quiz[step];

  useEffect(() => () => stopSpeech(), []);
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed; }, [speed]);

  /* ---------- real audio ---------- */
  function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }
  function onTime() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setTime(audio.currentTime);
    const ratio = audio.currentTime / audio.duration;
    if (hasTranscript) setIndex(Math.min(sentences.length - 1, Math.floor(ratio * sentences.length)));
    if (audio.currentTime - lastSave.current > 15) {
      lastSave.current = audio.currentTime;
      track.report(ratio * 100);
      save.mutate({ seconds: Math.round(audio.currentTime), completed: false });
    }
  }
  function onEnded() {
    setPlaying(false);
    save.mutate({ seconds: Math.round(audioRef.current?.duration || 0), completed: true });
    track.report(95);
    askQuiz();
    playSound("complete");
  }
  function seek(value: number) {
    const audio = audioRef.current;
    if (audio) audio.currentTime = value;
    setTime(value);
  }
  function jumpTo(lineIndex: number) {
    if (audioUrl) {
      const audio = audioRef.current;
      if (audio?.duration && sentences.length) {
        seek((lineIndex / sentences.length) * audio.duration);
        void audio.play().catch(() => undefined);
      }
    } else playFrom(lineIndex);
  }

  /* ---------- TTS fallback ---------- */
  function playFrom(start: number) {
    if (!item || !sentences.length) return;
    setPlaying(true);
    const stepTo = (cursor: number) => {
      if (cursor >= sentences.length) {
        setPlaying(false);
        save.mutate({ seconds: ttsTotal, completed: true });
        askQuiz();
        playSound("complete");
        return;
      }
      setIndex(cursor);
      track.report((cursor / sentences.length) * 100);
      const utterance = new SpeechSynthesisUtterance(sentences[cursor].en);
      utterance.lang = "en-US";
      utterance.rate = 0.92 * speed;
      utterance.onend = () => stepTo(cursor + 1);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };
    stepTo(start);
  }
  function toggle() {
    if (audioUrl) return toggleAudio();
    if (playing) { stopSpeech(); setPlaying(false); } else playFrom(index);
  }

  /* ---------- quiz ---------- */
  function choose(option: number) {
    if (!question || picked !== null) return;
    setPicked(option);
    const ok = option === question.answer;
    if (ok) setCorrect((value) => value + 1);
    playSound(ok ? "correct" : "wrong");
  }
  function nextQuestion() {
    playSound("next");
    if (step + 1 >= quiz.length) {
      const score = Math.round((correct / quiz.length) * 100);
      setQuizDone(true);
      const passed = score >= QUIZ_PASS;
      setResult({ score, passed, awarded: 0 });
      playSound(passed ? "complete" : "wrong");
      progressService.podcastQuiz(slug, score).then((data) => {
        client.setQueryData(["progress"], data);
        setResult({ score, passed: data.passed ?? passed, awarded: data.awarded || 0 });
        if (data.awarded) { client.invalidateQueries({ queryKey: ["me"] }); window.dispatchEvent(new CustomEvent(CELEBRATE_EVENT, { detail: { kind: "podcast", slug, title: item?.title } })); }
      }).catch(() => undefined);
      return;
    }
    setStep(step + 1);
    setPicked(null);
  }
  function resetQuiz() { setStep(0); setPicked(null); setCorrect(0); setQuizDone(false); setResult(null); }

  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      {item && (
        <div className="grid gap-6">
          <Link href={routes.podcasts} className="text-sm font-semibold">{common("back")}</Link>
          <header className="glass rounded-xl p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={item.accent}>{item.level}</Badge>
              {audioUrl && <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-0.5 text-xs font-semibold text-ink"><Headphones className="size-3.5" />{t("realAudio")}</span>}
            </div>
            <h1 className="mt-3 text-title font-semibold">{item.title}</h1>
            <p className="text-muted-foreground">{item.titleAz}</p>
            {item.summary && <p className="mt-2 max-w-2xl text-sm">{item.summary}</p>}
            <ItemProgress kind="podcast" slug={item.slug} showEmpty className="max-w-sm" />
            <p className="mt-4 text-sm font-semibold">{t("keep", { time: formatClock(Math.round(left)) })}</p>

            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); event.currentTarget.playbackRate = speed; }}
                onTimeUpdate={onTime}
                onEnded={onEnded}
                className="hidden"
              />
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={toggle} disabled={!audioUrl && !sentences.length} className="gap-2">
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                {playing ? common("pause") : common("play")}
              </Button>
              {audioUrl && (
                <Button variant="outline" size="icon" aria-label={t("restart")} title={t("restart")} onClick={() => seek(0)}>
                  <RotateCcw className="size-4" />
                </Button>
              )}
              {!audioUrl && sentences.length > 0 && (
                <Button variant="outline" onClick={() => speak(sentences.map((line) => line.en).join(" "))}>{common("listen")}</Button>
              )}
              <div role="group" aria-label={t("speed")} className="flex rounded-full border border-border bg-card p-1">
                {SPEEDS.map((value) => (
                  <button key={value} type="button" aria-pressed={speed === value} onClick={() => setSpeed(value)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${speed === value ? "bg-primary text-primary-foreground" : ""}`}>
                    {value}×
                  </button>
                ))}
              </div>
            </div>
            {audioUrl && (
              <div className="mt-4 flex items-center gap-3 text-xs tabular-nums text-muted-foreground">
                <span>{formatClock(Math.round(time))}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.5}
                  value={Math.min(time, duration || 0)}
                  onChange={(event) => seek(Number(event.target.value))}
                  aria-label={t("seek")}
                  className="h-2 flex-1 cursor-pointer accent-[var(--primary)]"
                />
                <span>{formatClock(Math.round(duration))}</span>
              </div>
            )}
          </header>

          <section className="glass rounded-xl p-6">
            <h2 className="font-semibold">{t("transcript")}</h2>
            {hasTranscript ? (
              <ol className="mt-4 grid gap-3">
                {sentences.map((line, lineIndex) => (
                  <li key={`${lineIndex}-${line.en.slice(0, 24)}`}>
                    <button type="button" onClick={() => jumpTo(lineIndex)}
                      className={`w-full rounded-lg px-4 py-3 text-left transition-colors ${lineIndex === index && playing ? "bg-lilac text-ink" : "bg-muted hover:bg-muted/70"}`}>
                      <p className="font-medium">{line.en}</p>
                      <p className="text-sm opacity-80">{line.az}</p>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-lg bg-muted px-4 py-4 text-sm">
                <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{t("noTranscript")}</p>
                  <p className="text-muted-foreground">{t("noTranscriptText")}</p>
                </div>
              </div>
            )}
            <div ref={endRef} aria-hidden="true" className="h-px" />
          </section>

          {item.glossary?.length > 0 && (
            <section className="glass rounded-xl p-6">
              <h2 className="font-semibold">{t("glossary")}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {item.glossary.map((word) => (
                  <li key={word.en} className="rounded-lg bg-peach/70 p-4 text-ink">
                    <button type="button" className="font-semibold" onClick={() => speak(word.en)}>{word.en}</button>
                    <p className="text-sm">{word.ipa}</p>
                    <p>{word.az}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {promptQuiz && quiz.length > 0 && !quizDone && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lilac p-4 text-ink" role="status">
              <div>
                <p className="font-semibold">{qz("prompt")}</p>
                <p className="text-sm">{qz("promptText", { pass: QUIZ_PASS })}</p>
              </div>
              <Button size="sm" data-sound="next" onClick={() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>{qz("start")}</Button>
            </div>
          )}

          {question && (
            <section ref={quizRef} className="glass scroll-mt-24 rounded-xl p-6">
              {!quizDone && step === 0 && picked === null && <p className="mb-3 text-xs text-muted-foreground">{qz("required", { pass: QUIZ_PASS })}</p>}
              {quizDone ? (
                <div className="grid gap-3">
                  <h2 className="font-semibold">{t("quizDone", { correct, total: quiz.length })}</h2>
                  {result && (
                    <div className={`rounded-lg p-3 text-ink ${result.passed ? "bg-mint" : "bg-peach"}`}>
                      <p className="font-bold">{qz("score", { score: result.score })}</p>
                      <p className="text-sm">{result.passed ? qz("passed") : qz("failed", { pass: QUIZ_PASS })}</p>
                      {result.awarded > 0 && <p className="text-sm font-semibold">{qz("points", { points: result.awarded })}</p>}
                    </div>
                  )}
                  <Button variant="outline" className="w-fit" onClick={resetQuiz}>{result && !result.passed ? qz("retry") : t("quizRetry")}</Button>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold text-muted-foreground">{t("quizStep", { step: step + 1, total: quiz.length })}</p>
                  <h2 className="mt-1 font-semibold">{question.prompt}</h2>
                  {question.promptAz && <p className="text-sm text-muted-foreground">{question.promptAz}</p>}
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option, optionIndex) => {
                      const state = picked === null ? "bg-muted" : optionIndex === question.answer ? "bg-mint text-ink" : optionIndex === picked ? "bg-peach text-ink" : "bg-muted opacity-70";
                      return (
                        <button key={option} type="button" disabled={picked !== null} className={`rounded-lg px-4 py-3 text-left ${state}`} onClick={() => choose(optionIndex)}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {picked !== null && (
                    <div className="mt-3 grid gap-3">
                      <p className="text-sm">
                        <strong className={picked === question.answer ? "text-emerald-600" : "text-danger"}>{picked === question.answer ? `✓ ${common("correct")}` : `✗ ${common("incorrect")}`}</strong>
                        {picked !== question.answer && <> · {qz("correctAnswer", { answer: question.options[question.answer] })}</>}
                        {question.explainAz ? ` · ${question.explainAz}` : question.explain ? ` · ${question.explain}` : ""}
                      </p>
                      <Button className="w-fit" onClick={nextQuestion}>{step + 1 >= quiz.length ? t("quizFinish") : t("quizNext")}</Button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      )}
    </QueryState>
  );
}

/* ingri-completion */
