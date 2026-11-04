"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Copy } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { contentService } from "@/services/contentService";
import { progressService } from "@/services/contentService";
import { useProgress } from "@/hooks/useProgress";
import { avatarSrc, formatClock, formatMinutes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PersonAvatar, StatTile } from "@/ui/components/primitives";
import MotionReveal from "@/ui/components/MotionReveal";
import QueryState from "@/ui/components/QueryState";
import { BookScene, ChatScene, HeadphonesScene } from "@/ui/illustrations/Decor";
import { routes } from "@/config/routes";
import LevelPanel from "./LevelPanel";
import CompletionPanel from "./CompletionPanel";

const tones = ["bg-lilac", "bg-mint", "bg-peach", "bg-aqua"] as const;

export default function DashboardView() {
  const t = useTranslations("dashboard");
  const common = useTranslations("common");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const progress = useProgress();
  const leaders = useQuery({ queryKey: ["leaders"], queryFn: contentService.leaders });
  const [copied, setCopied] = useState(false);
  const data = progress.data;

  const azWeek = ["B.", "B.e.", "Ç.a.", "Ç.", "C.a.", "C.", "Ş."];
  const week = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        label: locale === "az" ? azWeek[date.getDay()] : new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date),
        minutes: data?.user.dailyMinutes.find((row) => row.date === key)?.minutes || 0,
      };
    });
  }, [data, locale]);
  const max = Math.max(...week.map((day) => day.minutes), 1);
  const themes = data?.completed.filter((item) => /^(grammar|podcast|listening):/.test(item)).length || 0;
  const continuePodcast = data?.podcastSeconds["directions-in-baku"] ? "directions-in-baku" : "morning-routine";
  const seconds = data?.podcastSeconds[continuePodcast] || 0;

  const month = new Date();
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1).getDay();
  const offset = (first + 6) % 7;
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const activeDays = new Set(data?.user.dailyMinutes.map((row) => row.date));

  return (
    <QueryState isLoading={progress.isLoading} isError={progress.isError} onRetry={() => progress.refetch()}>
      <div className="grid gap-6">
        <MotionReveal>
          <section className="relative overflow-hidden rounded-xl bg-ink p-6 text-paper shadow-soft sm:p-8">
            <div className="blob -right-6 -top-10 size-40 bg-lilac" />
            <div className="blob bottom-0 left-1/2 size-32 bg-mint" />
            <div className="relative grid items-center gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div>
                <div className="flex flex-wrap gap-2"><Badge variant="peach">{common("streak")} {data?.user.streak || 0}</Badge><Badge variant="mint">{data?.user.activeLevel || data?.user.level || "A1"}</Badge></div>
                <h1 className="mt-4 text-display font-semibold">{t("hello", { name: data?.user.name.split(" ")[0] || "" })}</h1>
                <p className="mt-3 max-w-xl text-paper/80">{t("ready")}</p>
                <Button asChild variant="peach" className="mt-6">
                  <Link href={`${routes.podcasts}/${continuePodcast}`}>{t("continue")}</Link>
                </Button>
              </div>
              <PersonAvatar src={avatarSrc(data?.user)} alt="" className="mx-auto size-40" />
            </div>
          </section>
        </MotionReveal>

        <LevelPanel />
        <CompletionPanel />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label={t("totalTime")} value={formatMinutes(data?.user.totalMinutes || 0)} tone="bg-lilac" />
          <StatTile label={t("themes")} value={`${themes}/12`} tone="bg-mint" />
          <StatTile label={common("xp")} value={String(data?.user.xp || 0)} tone="bg-peach" />
          <StatTile label={common("streak")} value={`${data?.user.streak || 0}`} tone="bg-aqua" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold">{t("weekly")}</h2>
            <div className="mt-6 flex h-48 items-end gap-3">
              {week.map((day) => (
                <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end rounded-lg bg-muted">
                    <div className="w-full rounded-lg bg-lilac-deep" style={{ height: `${Math.max(8, (day.minutes / max) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold">{t("calendar")}</h2>
            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs">
              {Array.from({ length: offset }, (_, index) => <span key={`b-${index}`} />)}
              {Array.from({ length: days }, (_, index) => {
                const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
                return (
                  <span key={date} className={`grid size-8 place-items-center rounded-full ${activeDays.has(date) ? "bg-mint text-ink" : "bg-muted"}`}>
                    {index + 1}
                  </span>
                );
              })}
            </div>
          </section>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Link href={`${routes.podcasts}/${continuePodcast}`} className="glass flex items-center gap-4 rounded-xl p-5">
            <div className="grid size-16 place-items-center rounded-full bg-peach text-ink">▶</div>
            <div>
              <p className="text-sm text-muted-foreground">{t("continueHint")} {formatClock(Math.max(0, 90 - seconds))}</p>
              <p className="text-lg font-semibold">{t("continue")}</p>
            </div>
          </Link>
          <div className="rounded-xl bg-lilac p-5 text-ink">
            <div className="flex items-center gap-3">
              <PersonAvatar src="/avatars/avatar-nigar.jpg" alt="" className="size-12" />
              <div>
                <h2 className="font-semibold">{t("inviteTitle")}</h2>
                <p className="text-sm">{t("inviteText")}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-4 border-transparent bg-white text-ink shadow-sm hover:bg-white/80 dark:bg-white dark:text-ink dark:hover:bg-white/85"
              onClick={async () => {
                await navigator.clipboard.writeText(`${window.location.origin}/${locale}${routes.register}`);
                setCopied(true);
              }}
            >
              <Copy className="size-4" /> {copied ? common("copied") : common("copy")}
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-title font-semibold">{t("courses")}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              [routes.podcasts, nav("podcasts"), HeadphonesScene],
              [routes.grammar, nav("grammar"), BookScene],
              [routes.listening, nav("listening"), HeadphonesScene],
              [routes.speaking, nav("speaking"), ChatScene],
            ].map(([href, label, Art], index) => (
              <Link key={String(href)} href={String(href)} className="glass rounded-xl p-5 transition duration-200 hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{String(label)}</h3>
                  <ArrowUpRight className="size-4" />
                </div>
                {(() => {
                  const Illustration = Art as typeof BookScene;
                  return <Illustration className="mt-2 h-28" />;
                })()}
                <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold text-ink ${tones[index]}`}>{common("start")}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="glass rounded-xl p-5 lg:col-span-1">
            <h2 className="font-semibold">{t("schedule")}</h2>
            <ul className="mt-4 grid gap-3 text-sm">
              {[t("slot1"), t("slot2"), t("slot3")].map((slot) => (
                <li key={slot} className="rounded-lg bg-muted px-3 py-3">{slot}</li>
              ))}
            </ul>
          </article>
          <article className="glass rounded-xl p-5">
            <h2 className="font-semibold">{t("tasks")}</h2>
            <ul className="mt-4 grid gap-3 text-sm">
              {(data?.tasks || []).map((task) => (
                <li key={task.key} className="flex items-center justify-between rounded-lg bg-muted px-3 py-3">
                  <span>{t(`task${task.key[0].toUpperCase()}${task.key.slice(1)}` as "taskWords")}</span>
                  <button
                    type="button"
                    aria-pressed={task.done}
                    onClick={() => progressService.task(task.key, !task.done).then(() => progress.refetch())}
                    className={`size-5 rounded-full ${task.done ? "bg-mint" : "bg-muted ring-1 ring-inset ring-black/10 dark:ring-white/15"}`}
                  />
                </li>
              ))}
            </ul>
          </article>
          <article className="glass rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{nav("leaderboard")}</h2>
              <Link href={routes.leaderboard} className="text-sm font-semibold">{common("next")}</Link>
            </div>
            <ol className="mt-4 grid gap-3">
              {(leaders.data || []).slice(0, 3).map((person) => (
                <li key={person.id}>
                  <Link href={`${routes.leaderboard}/${person.id}`} className="flex items-center gap-3">
                    <PersonAvatar src={avatarSrc(person)} alt="" className="size-11" crowned={person.rank === 1} />
                    <div className="flex-1">
                      <p className="font-semibold">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.xp} XP</p>
                    </div>
                    <span className="text-sm font-bold">#{person.rank}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            [t("feature1"), t("feature1t"), "bg-ink text-paper"],
            [t("feature2"), t("feature2t"), "glass"],
            [t("feature3"), t("feature3t"), "glass"],
          ].map(([title, text, tone]) => (
            <article key={title} className={`relative min-h-52 overflow-hidden rounded-xl p-6 ${tone}`}>
              <span className="absolute -right-6 -bottom-10 size-32 rounded-full border-[20px] border-lilac/30" />
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 opacity-80">{text}</p>
            </article>
          ))}
        </section>

        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold">{t("faq")}</h2>
          <div className="mt-4 grid gap-3">
            {[1, 2, 3].map((item) => (
              <details key={item} className="rounded-lg bg-muted px-4 py-3">
                <summary className="cursor-pointer font-semibold">{t(`q${item}` as "q1")}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{t(`a${item}` as "a1")}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </QueryState>
  );
}

/* ingri-completion */
