"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { authService } from "@/services/authService";
import { profileService } from "@/services/contentService";
import { LEVELS } from "@/lib/levels";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import QueryState from "@/ui/components/QueryState";
import { playSound } from "@/lib/sound";

export default function OnboardingView() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const client = useQueryClient();
  const questions = useQuery({ queryKey: ["placement"], queryFn: authService.placement });
  const [answers, setAnswers] = useState<number[]>([]);
  const [suggested, setSuggested] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string[]>(["A1"]);
  const scoreMut = useMutation({
    mutationFn: () => authService.scorePlacement(answers),
    onSuccess: (result) => {
      setSuggested(result.suggested);
      setScore(result.score);
      playSound("levelup");
      setPicked([result.suggested]);
    },
  });
  const save = useMutation({
    mutationFn: () => profileService.setLevels({ levels: picked, activeLevel: picked[0], placementCompleted: true, suggestedLevel: suggested || picked[0] }),
    onSuccess: (user) => {
      client.setQueryData(["me"], user);
      router.replace(routes.home);
    },
  });
  return (
    <QueryState isLoading={questions.isLoading} isError={questions.isError} onRetry={() => questions.refetch()}>
      <div className="mx-auto grid max-w-2xl gap-4">
        <h1 className="text-title font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("text")}</p>
        {(questions.data || []).map((question, index) => (
          <fieldset key={question.prompt} className="glass rounded-xl p-4">
            <legend className="font-semibold">{question.level}. {question.prompt}</legend>
            <div className="mt-3 grid gap-2">
              {question.options.map((option, optionIndex) => (
                <label key={option} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <input type="radio" name={`q${index}`} onChange={() => {
                    const next = [...answers];
                    next[index] = optionIndex;
                    setAnswers(next);
                    playSound("click");
                  }} />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <Button onClick={() => scoreMut.mutate()} disabled={answers.length < (questions.data?.length || 0)}>{t("check")}</Button>
        {suggested && <p className="text-lg font-semibold">{t("suggested", { level: suggested, score })}</p>}
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <button key={level} type="button" aria-pressed={picked.includes(level)} onClick={() => setPicked(picked.includes(level) ? picked.filter((item) => item !== level) : [...picked, level])} className={`rounded-full px-3 py-2 font-semibold ${picked.includes(level) ? "bg-mint text-ink" : "bg-card"}`}>
              {level}
            </button>
          ))}
        </div>
        <Button variant="peach" disabled={!picked.length} onClick={() => save.mutate()}>{suggested && picked.length === 1 && picked[0] === suggested ? t("accept") : t("save")}</Button>
      </div>
    </QueryState>
  );
}
