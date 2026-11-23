"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { BellRing } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/contentService";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { IngriMark } from "@/ui/layout/Logo";

const SNOOZE_KEY = "ingri:reminder-prompt";

/**
 * Asks once (after sign-in) whether the learner wants a daily email reminder.
 * The answer is stored on the account (reminders.asked) so it never shows again; closing the dialog without
 * answering only hides it for this browser session.
 */
export default function ReminderPrompt() {
  const t = useTranslations("reminders");
  const { user } = useAuth();
  const pathname = usePathname();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const onboarding = pathname?.includes("/onboarding");

  useEffect(() => {
    if (!user || onboarding || user.placementCompleted === false) return;
    if (user.reminders?.asked) return;
    if (window.sessionStorage.getItem(SNOOZE_KEY)) return;
    const id = window.setTimeout(() => setOpen(true), 1500);
    return () => window.clearTimeout(id);
  }, [user, onboarding]);

  const answer = useMutation({
    mutationFn: (email: boolean) => profileService.setReminders({ email }),
    onSuccess: (next, email) => {
      client.setQueryData(["me"], next);
      setOpen(false);
      if (email) notify.success(t("saved"));
      else notify.info(t("declined"));
    },
  });

  const close = (value: boolean) => {
    if (!value) window.sessionStorage.setItem(SNOOZE_KEY, "1");
    setOpen(value);
  };

  if (!user) return null;
  return (
    <DialogPrimitive.Root open={open} onOpenChange={close}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-md rounded-2xl bg-card p-6 shadow-soft outline-none data-[state=open]:animate-[ingri-pop_0.25s_ease-out] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[28rem] sm:-translate-x-1/2 sm:-translate-y-1/2">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <IngriMark className="size-14" />
              <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-lilac text-ink shadow-sm"><BellRing className="size-4" /></span>
            </div>
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-lg font-semibold">{t("title")}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">{t("text")}</DialogPrimitive.Description>
              {!user.isVerified && <p className="mt-2 rounded-lg bg-peach px-3 py-2 text-xs text-ink">{t("verifyFirst")}</p>}
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button onClick={() => answer.mutate(true)} disabled={answer.isPending}>{t("yes")}</Button>
            <Button variant="outline" onClick={() => answer.mutate(false)} disabled={answer.isPending}>{t("no")}</Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
