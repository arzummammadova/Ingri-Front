"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { BellRing } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/contentService";
import { notify } from "@/lib/toast";
import Select from "@/ui/components/Select";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 … 22:00

/** Settings: daily email reminder on/off + hour (Baku time). */
export default function ReminderSection() {
  const t = useTranslations("reminders");
  const { user } = useAuth();
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (body: { email: boolean; hour?: number }) => profileService.setReminders(body),
    onSuccess: (next) => {
      client.setQueryData(["me"], next);
      notify.success(next.reminders?.email ? t("saved") : t("declined"));
    },
  });
  if (!user) return null;
  const on = !!user.reminders?.email;
  const hour = user.reminders?.hour ?? 19;
  return (
    <section className="glass grid gap-3 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lilac text-ink"><BellRing className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{t("settingsTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("settingsText")}</p>
          {!user.isVerified && <p className="mt-2 text-xs font-semibold text-danger">{t("verifyFirst")}</p>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={t("settingsTitle")}
          disabled={save.isPending}
          onClick={() => save.mutate({ email: !on, hour })}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
        >
          <span className={`absolute top-1 size-5 rounded-full bg-card shadow transition-all ${on ? "left-6" : "left-1"}`} />
        </button>
      </div>
      {on && (
        <label className="flex items-center gap-3 text-sm font-semibold">
          {t("hour")}
          <Select
            ariaLabel={t("hour")}
            value={String(hour)}
            onChange={(value) => save.mutate({ email: true, hour: Number(value) })}
            options={HOURS.map((h) => ({ value: String(h), label: `${String(h).padStart(2, "0")}:00` }))}
            className="w-32"
          />
        </label>
      )}
    </section>
  );
}
