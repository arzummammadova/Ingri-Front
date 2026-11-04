"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/contentService";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Select from "@/ui/components/Select";
import type { User } from "@/types";

export default function LevelSwitcher() {
  const t = useTranslations("common");
  const az = useLocale() === "az";
  const { user } = useAuth();
  const client = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: profileService.setActiveLevel,
    onSuccess: (next) => {
      client.setQueryData(["me"], next);
      client.invalidateQueries();
      setPending(null);
    },
  });
  if (!user) return null;
  const levels = user.levels?.length ? user.levels : [user.activeLevel || "A1"];
  const current = user.activeLevel || levels[0];
  return (
    <>
      <Select
        ariaLabel={t("level")}
        value={current}
        align="end"
        minWidth={140}
        size="sm"
        className="w-[4.75rem] sm:w-[5.5rem]"
        options={levels.map((level) => ({ value: level, label: level, hint: level === current ? "✓" : undefined }))}
        renderValue={(option) => (
          <>
            <GraduationCap className="hidden size-4 shrink-0 sm:block" aria-hidden="true" />
            <span>{option?.label || current}</span>
          </>
        )}
        onChange={(value) => {
          // open the confirm dialog after the list has closed and focus has settled
          if (value !== current) window.setTimeout(() => setPending(value), 0);
        }}
      />
      <Dialog open={!!pending} onOpenChange={(open) => { if (!open && !save.isPending) setPending(null); }}>
        <DialogContent>
          <DialogTitle>{az ? "Səviyyəni dəyişmək istədiyinizə əminsiniz?" : "Are you sure you want to switch level?"}</DialogTitle>
          <p className="mt-3 text-sm text-muted-foreground">
            {az
              ? `Aktiv səviyyə ${current} → ${pending} olacaq. Dashboard, tövsiyələr və plan yeni səviyyəyə uyğunlaşacaq. ${current} üzrə irəliləyişiniz saxlanılır.`
              : `Your active level will change from ${current} to ${pending}. Dashboard, recommendations and plan will follow the new level. Your ${current} progress is kept.`}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPending(null)} disabled={save.isPending}>{az ? "Ləğv et" : "Cancel"}</Button>
            <Button onClick={() => pending && save.mutate(pending)} disabled={save.isPending}>
              {save.isPending ? (az ? "Dəyişdirilir..." : "Switching...") : (az ? "Bəli, dəyiş" : "Yes, switch")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function applyUser(clientUser: User) {
  return clientUser;
}
