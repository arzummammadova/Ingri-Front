"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { contentService, progressService } from "@/services/contentService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import QueryState from "@/ui/components/QueryState";
import { createRecognizer, speak } from "@/lib/speech";
import { scorePhrase } from "@/lib/utils";
import { routes } from "@/config/routes";
import { useTrackItem } from "@/hooks/useCompletion";
import ItemProgress from "@/ui/components/ItemProgress";
import { playSound } from "@/lib/sound";

export default function SpeakingPractice({ slug }: { slug: string }) {
  const t = useTranslations("speaking");
  const common = useTranslations("common");
  const locale = useLocale();
  const query = useQuery({ queryKey: ["speaking", slug], queryFn: () => contentService.speakingOne(slug) });
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (score: number) => progressService.speaking(slug, score),
    onSuccess: () => client.invalidateQueries({ queryKey: ["progress"] }),
  });
  const [heard, setHeard] = useState("");
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const recognizer = useRef<ReturnType<typeof createRecognizer> | null>(null);
  const item = query.data;
  const track = useTrackItem("speaking", item?.slug || slug, item?.level, item?.en);

  function grade(value: string) {
    if (!item) return;
    const next = scorePhrase(item.en, value);
    setScore(next);
    playSound(next >= 80 ? "correct" : "wrong");
    save.mutate(next);
    if (next >= 80) track.complete();
  }

  function toggleMic() {
    if (!item) return;
    if (!recognizer.current) {
      recognizer.current = createRecognizer(
        (text) => {
          setHeard(text);
          grade(text);
        },
        () => setListening(false),
      );
    }
    if (!recognizer.current.supported) {
      setUnsupported(true);
      return;
    }
    if (listening) recognizer.current.stop();
    else {
      setListening(true);
      recognizer.current.start();
    }
  }

  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      {item && (
        <div className="mx-auto grid max-w-2xl gap-5">
          <Link href={routes.speaking} className="text-sm font-semibold">{common("back")}</Link>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{locale === "az" ? item.categoryAz : item.category}</p>
          <h1 className="text-title font-semibold">{item.en}</h1>
          <ItemProgress kind="speaking" slug={item.slug || slug} className="mt-0 max-w-sm" />
          <p className="text-muted-foreground">{item.az}</p>
          <p className="rounded-lg bg-peach p-4 text-sm text-ink">{locale === "az" ? item.tipAz : item.tip}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => speak(item.en)}>{common("pronounce")}</Button>
            <Button onClick={toggleMic}>{listening ? t("stop") : t("hold")}</Button>
          </div>
          {unsupported && <p className="text-sm">{t("unsupported")}</p>}
          <div>
            <p className="mb-2 text-sm font-semibold">{t("heard")}</p>
            <p className="min-h-12 rounded-lg bg-muted p-4">{heard || "—"}</p>
          </div>
          <label className="grid gap-2 text-sm font-semibold">
            {t("type")}
            <Textarea value={typed} onChange={(event) => setTyped(event.target.value)} />
          </label>
          <Button variant="mint" onClick={() => grade(typed || heard)}>{common("score")}</Button>
          {score !== null && (
            <p className="text-2xl font-bold">{score}% · {score >= 80 ? t("great") : t("again")}</p>
          )}
        </div>
      )}
    </QueryState>
  );
}

/* ingri-completion */
