"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function QueryState({
  isLoading,
  isError,
  onRetry,
  empty,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  empty?: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations("common");
  if (isLoading) {
    return (
      <div className="grid gap-4">
        <div className="h-28 animate-pulse rounded-xl bg-card" />
        <div className="h-28 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="glass rounded-xl p-6">
        <p>{t("error")}</p>
        {onRetry && (
          <Button className="mt-4" onClick={onRetry}>
            {t("retry")}
          </Button>
        )}
      </div>
    );
  }
  if (empty) return <div className="glass rounded-xl p-6 text-muted-foreground">{t("empty")}</div>;
  return children;
}
