"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Clock, Flag, Sparkles } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { authService } from "@/services/authService";
import { profileService } from "@/services/contentService";
import { LEVELS } from "@/lib/levels";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import QueryState from "@/ui/components/QueryState";
import { playSound } from "@/lib/sound";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

const TOTAL_SECONDS = 15 * 60;
const LETTERS = ["A", "B", "C", "D", "E", "F"];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function OnboardingView() {
  const t = useTranslations("onboarding");
  const common = useTranslations("common");
  const router = useRouter();
  const client = useQueryClient();
  const questions = useQuery({ queryKey: ["placement"], queryFn: authService.placement });
  const list = questions.data || [];
  const total = list.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [left, setLeft] = useState(TOTAL_SECONDS);
  const [suggested, setSuggested] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string[]>(["A1"]);
  const finishedRef = useRef(false);

  const scoreMut = useMutation({
    mutationFn: (all: number[]) => authService.scorePlacement(all),
    onSuccess: (result) => {
      setSuggested(result.suggested);
      setScore(result.score);
      setPicked([result.suggested]);
      playSound("levelup");
    },
    onError: () => {
      finishedRef.current = false;
      notify.error(common("saveError"));
    },
  });

  const finish = useCallback(
    (reason: "done" | "timeout") => {
      if (finishedRef.current || !total) return;
      finishedRef.current = true;
      const all = Array.from({ length: total }, (_, i) => (typeof answers[i] === "number" ? answers[i] : -1));
      if (reason === "timeout") notify.info(t("timeUp"), t("timeUpText"));
      scoreMut.mutate(all);
    },
    [answers, total, scoreMut, t],
  );

  const running = total > 0 && !suggested && !scoreMut.isPending;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (left === 0 && running) finish("timeout");
  }, [left, running, finish]);

  const save = useMutation({
    mutationFn: () => profileService.setLevels({ levels: picked, activeLevel: picked[0], placementCompleted: true, suggestedLevel: suggested || picked[0] }),
    onSuccess: (user) => {
      client.setQueryData(["me"], user);
      router.replace(routes.home);
    },
    onError: () => notify.error(common("saveError")),
  });

  const question = list[step];
  const answeredCount = answers.filter((a) => typeof a === "number").length;
  const pct = total ? Math.round(((step + 1) / total) * 100) : 0;
  const low = left <= 60;
  const isLast = step === total - 1;

  function choose(optionIndex: number) {
    const next = [...answers];
    next[step] = optionIndex;
    setAnswers(next);
    playSound("click");
  }

  return (
    <QueryState isLoading={questions.isLoading} isError={questions.isError} onRetry={() => questions.refetch()}>
      <div className="mx-auto grid w-full max-w-2xl gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-brand text-title font-semibold">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>
          </div>
          {!suggested && (
            <div
              role="timer"
              aria-live={low ? "assertive" : "off"}
              aria-label={t("timeLeft")}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 font-mono text-lg font-bold tabular-nums shadow-sm transition-colors",
                low ? "bg-danger text-white motion-safe:animate-pulse" : left <= 180 ? "bg-peach text-ink" : "bg-mint text-ink",
              )}
            >
              <Clock className="size-4" /> {formatTime(left)}
            </div>
          )}
        </div>

        {!suggested && question && (
          <section className="glass grid gap-5 rounded-2xl p-5 sm:p-7">
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>{t("stepOf", { step: step + 1, total })}</span>
                <span>{t("answered", { count: answeredCount, total })}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5" aria-hidden="true">
                {list.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    tabIndex={-1}
                    onClick={() => setStep(i)}
                    className={cn(
                      "size-2.5 rounded-full transition",
                      i === step ? "w-6 bg-primary" : typeof answers[i] === "number" ? "bg-primary/45" : "bg-muted-foreground/25",
                    )}
                  />
                ))}
              </div>
            </div>

            <div key={step} className="grid gap-4 motion-safe:animate-[ingri-pop_0.2s_ease-out]">
              <div>
                <span className="inline-flex rounded-full bg-lilac px-2.5 py-1 text-xs font-bold text-ink">{question.level}</span>
                <h2 className="mt-3 text-xl font-semibold leading-snug">{question.prompt}</h2>
              </div>
              <div className="grid gap-2.5" role="radiogroup" aria-label={question.prompt}>
                {question.options.map((option, optionIndex) => {
                  const active = answers[step] === optionIndex;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => choose(optionIndex)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[0.95rem] font-medium transition",
                        active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-foreground hover:bg-muted/70 hover:ring-1 hover:ring-primary/30",
                      )}
                    >
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold", active ? "bg-white/20" : "bg-card")}>
                        {active ? <Check className="size-4" /> : LETTERS[optionIndex]}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                <ArrowLeft className="size-4" /> {common("back")}
              </Button>
              {isLast ? (
                <Button onClick={() => finish("done")} disabled={scoreMut.isPending}>
                  <Flag className="size-4" /> {t("finish")}
                </Button>
              ) : (
                <Button onClick={() => setStep((s) => Math.min(total - 1, s + 1))}>
                  {common("next")} <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </section>
        )}

        {suggested && (
          <section className="glass grid gap-5 rounded-2xl p-6 text-center sm:p-8">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-mint text-ink">
              <Sparkles className="size-9" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("resultIntro")}</p>
              <p className="mt-1 font-brand text-4xl font-bold">{suggested}</p>
              <p className="mt-2 text-sm">{t("suggested", { level: suggested, score })}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={picked.includes(level)}
                  onClick={() => setPicked(picked.includes(level) ? picked.filter((item) => item !== level) : [...picked, level])}
                  className={cn("rounded-full px-4 py-2 font-semibold transition", picked.includes(level) ? "bg-mint text-ink" : "bg-muted text-foreground hover:bg-muted/70")}
                >
                  {level}
                </button>
              ))}
            </div>
            <Button variant="peach" disabled={!picked.length || save.isPending} onClick={() => save.mutate()}>
              {picked.length === 1 && picked[0] === suggested ? t("accept") : t("save")}
            </Button>
          </section>
        )}
      </div>
    </QueryState>
  );
}
