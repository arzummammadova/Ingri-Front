"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { contentService } from "@/services/contentService";
import QueryState from "@/ui/components/QueryState";
import { PersonAvatar } from "@/ui/components/primitives";
import { avatarSrc, formatMinutes } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { routes } from "@/config/routes";

export default function PeerView({ id }: { id: string }) {
  const t = useTranslations("leaderboard");
  const common = useTranslations("common");
  const query = useQuery({ queryKey: ["leader", id], queryFn: () => contentService.leader(id) });
  const person = query.data;
  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()}>
      {person && (
        <article className="mx-auto max-w-lg">
          <Link href={routes.leaderboard} className="text-sm font-semibold">{common("back")}</Link>
          <div className="glass mt-4 rounded-xl p-8 text-center">
            <PersonAvatar src={avatarSrc(person)} alt="" className="mx-auto size-32" crowned={person.rank === 1} />
            <p className="mt-4 text-sm font-bold">#{person.rank}</p>
            <h1 className="text-title font-semibold">{person.name}</h1>
            <p className="text-muted-foreground">{person.city}</p>
            <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-lilac p-3 text-ink"><dt>{common("xp")}</dt><dd className="text-xl font-bold">{person.xp}</dd></div>
              <div className="rounded-lg bg-mint p-3 text-ink"><dt>{common("streak")}</dt><dd className="text-xl font-bold">{person.streak}</dd></div>
              <div className="rounded-lg bg-peach p-3 text-ink"><dt>{t("city")}</dt><dd className="text-sm font-bold">{formatMinutes(person.totalMinutes)}</dd></div>
            </dl>
          </div>
        </article>
      )}
    </QueryState>
  );
}
