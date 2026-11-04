"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { routes } from "@/config/routes";

export default function ResetForm() {
  const t = useTranslations("auth");
  const token = useSearchParams().get("token") || "";
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirm"))) {
      setError(t("mismatch"));
      return;
    }
    setPending(true);
    try {
      await authService.reset(token, password);
      router.replace(routes.login);
    } catch {
      setError(t("INVALID_TOKEN"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-xl p-6">
      <h1 className="text-title font-semibold">{t("resetTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("resetText")}</p>
      <div className="mt-6 grid gap-4">
        <div className="grid gap-2"><Label htmlFor="password">{t("newPassword")}</Label><Input id="password" name="password" type="password" required minLength={10} /></div>
        <div className="grid gap-2"><Label htmlFor="confirm">{t("confirm")}</Label><Input id="confirm" name="confirm" type="password" required /></div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button disabled={pending || !token}>{t("updatePassword")}</Button>
      </div>
    </form>
  );
}
