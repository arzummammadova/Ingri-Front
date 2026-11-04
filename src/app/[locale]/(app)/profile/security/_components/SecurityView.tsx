"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { notify, errorCode } from "@/lib/toast";

export default function SecurityView() {
  const t = useTranslations("profile");
  const auth = useTranslations("auth");
  const locale = useLocale();
  const { user } = useAuth();
  const isGoogle = user?.authProvider === "google";
  const [busy, setBusy] = useState(false);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirm"))) {
      notify.error(auth("mismatch"));
      return;
    }
    setBusy(true);
    try {
      await authService.changePassword(String(data.get("currentPassword") || ""), password);
      notify.success(auth("PASSWORD_UPDATED"));
      form.reset();
    } catch (error) {
      const code = errorCode(error, "INVALID_CREDENTIALS");
      notify.error(auth.has(code) ? auth(code) : auth("INVALID_CREDENTIALS"));
    } finally {
      setBusy(false);
    }
  }

  async function remove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await authService.deleteAccount(String(data.get("password") || ""));
      window.location.href = `/${locale}${routes.register}`;
    } catch {
      notify.error(auth("INVALID_CREDENTIALS"));
    }
  }

  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <Link href={routes.profile} className="text-sm font-semibold">← {t("title")}</Link>
      <div>
        <h1 className="text-title font-semibold">{t("securityTitle")}</h1>
        <p className="text-sm text-muted-foreground">{isGoogle ? t("setPasswordText") : t("securityText")}</p>
      </div>
      <form onSubmit={changePassword} className="glass grid gap-4 rounded-xl p-6">
        {!isGoogle && (
          <>
            <Label htmlFor="current">{auth("currentPassword")}</Label>
            <Input id="current" name="currentPassword" type="password" required />
          </>
        )}
        <Label htmlFor="password">{auth("newPassword")}</Label>
        <Input id="password" name="password" type="password" required minLength={10} />
        <p className="text-xs text-muted-foreground">{auth("passwordHint")}</p>
        <Label htmlFor="confirm">{auth("confirm")}</Label>
        <Input id="confirm" name="confirm" type="password" required />
        <Button disabled={busy}>{auth("updatePassword")}</Button>
      </form>
      <form onSubmit={remove} className="rounded-xl bg-peach p-6 text-ink">
        <h2 className="font-semibold">{t("deleteAccount")}</h2>
        <p className="mt-2 text-sm">{t("deleteWarn")}</p>
        <Input name="password" type="password" required={!isGoogle} className="mt-4 bg-paper" />
        <Button className="mt-4 bg-danger text-paper">{t("confirmDelete")}</Button>
      </form>
    </div>
  );
}
