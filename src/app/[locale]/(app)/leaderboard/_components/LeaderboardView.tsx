"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { contentService } from "@/services/contentService";
import { useAuth } from "@/hooks/useAuth";
import QueryState from "@/ui/components/QueryState";
import { PersonAvatar, SectionTitle } from "@/ui/components/primitives";
import { avatarSrc } from "@/lib/utils";
import { routes } from "@/config/routes";

export default function LeaderboardView() {
  const t = useTranslations("leaderboard");
  const common = useTranslations("common");
  const query = useQuery({ queryKey: ["leaders"], queryFn: contentService.leaders });
  const { user } = useAuth();
  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} empty={!query.data?.length} onRetry={() => query.refetch()}>
      <SectionTitle title={t("title")} text={t("text")} />
      <ol className="grid gap-3">
        {query.data?.map((person) => (
          <li key={person.id}>
            <Link href={`${routes.leaderboard}/${person.id}`} className={`glass flex items-center gap-4 rounded-xl p-4 ${person.id === user?.id ? "ring-2 ring-lilac-deep" : ""}`}>
              <span className="w-8 text-lg font-bold">{person.rank}</span>
              <PersonAvatar src={avatarSrc(person)} alt="" className="size-14" crowned={person.rank === 1} />
              <div className="flex-1">
                <p className="font-semibold">{person.name} {person.id === user?.id && <span className="text-xs">· {common("you")}</span>}</p>
                <p className="text-sm text-muted-foreground">{person.city} · {person.level}</p>
              </div>
              <p className="font-bold">{person.xp} XP</p>
            </Link>
          </li>
        ))}
      </ol>
    </QueryState>
  );
}
