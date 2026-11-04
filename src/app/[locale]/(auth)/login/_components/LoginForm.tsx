"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { routes } from "@/config/routes";

function codeOf(error: unknown) {
  return (error as { response?: { data?: { code?: string } } })?.response?.data?.code || "SERVER_ERROR";
}

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const next = params.get("next") || routes.home;
      const stripped = next.replace(/^\/(az|en)/, "") || routes.home;
      await authService.csrf();
      await authService.login({
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      router.replace(stripped.startsWith("/") ? stripped : routes.home);
      router.refresh();
    } catch (err) {
      setError(t(codeOf(err) as "INVALID_CREDENTIALS"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass liquid-card rounded-xl p-6">
      <h1 className="text-title font-semibold">{t("loginTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("loginText")}</p>
      <div className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={pending}>{t("submitLogin")}</Button>
      </div>
      <div className="mt-4 flex flex-col gap-2 text-sm">
        <Link href={routes.forgot} className="font-semibold">{t("forgot")}</Link>
        <p>
          {t("noAccount")} <Link href={routes.register} className="font-semibold">{t("submitRegister")}</Link>
        </p>
      </div>
    </form>
  );
}
