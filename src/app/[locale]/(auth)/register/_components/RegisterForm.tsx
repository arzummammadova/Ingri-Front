"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { routes } from "@/config/routes";

export default function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await authService.csrf();
      await authService.register({
        name: String(data.get("name")),
        email: String(data.get("email")),
        password: String(data.get("password")),
        locale,
      });
      setMessage(t("CHECK_EMAIL"));
    } catch {
      setError(t("VALIDATION"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass liquid-card rounded-xl p-6">
      <h1 className="text-title font-semibold">{t("registerTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("registerText")}</p>
      <div className="mt-6 grid gap-4">
        <div className="grid gap-2"><Label htmlFor="name">{t("name")}</Label><Input id="name" name="name" required minLength={2} /></div>
        <div className="grid gap-2"><Label htmlFor="email">{t("email")}</Label><Input id="email" name="email" type="email" required /></div>
        <div className="grid gap-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" />
          <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
        </div>
        {message && <p className="text-sm">{message}</p>}
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={pending}>{t("submitRegister")}</Button>
      </div>
      <p className="mt-4 text-sm">{t("hasAccount")} <Link href={routes.login} className="font-semibold">{t("submitLogin")}</Link></p>
    </form>
  );
}
