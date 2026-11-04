"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { routes } from "@/config/routes";

export default function VerifyForm() {
  const t = useTranslations("auth");
  const token = useSearchParams().get("token") || "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function verify() {
    try {
      await authService.verify(token);
      setMessage(t("EMAIL_VERIFIED"));
      setError("");
    } catch {
      setError(t("INVALID_TOKEN"));
    }
  }

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await authService.resend(String(data.get("email"))).catch(() => undefined);
    setMessage(t("CHECK_EMAIL"));
  }

  return (
    <div className="glass rounded-xl p-6">
      <h1 className="text-title font-semibold">{t("verifyTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("verifyText")}</p>
      {token && <Button className="mt-6" onClick={verify}>{t("verifyAction")}</Button>}
      {message && <p className="mt-4 text-sm">{message}</p>}
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      <form onSubmit={resend} className="mt-6 grid gap-3">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required />
        <Button variant="outline" type="submit">{t("resend")}</Button>
      </form>
      <Link href={routes.login} className="mt-4 inline-block text-sm font-semibold">{t("submitLogin")}</Link>
    </div>
  );
}
