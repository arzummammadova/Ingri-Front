"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";

export default function ForgotForm() {
  const t = useTranslations("auth");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const data = new FormData(event.currentTarget);
    await authService.csrf();
    await authService.forgot(String(data.get("email"))).catch(() => undefined);
    setMessage(t("CHECK_EMAIL"));
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-xl p-6">
      <h1 className="text-title font-semibold">{t("forgotTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("forgotText")}</p>
      <div className="mt-6 grid gap-4">
        <div className="grid gap-2"><Label htmlFor="email">{t("email")}</Label><Input id="email" name="email" type="email" required /></div>
        {message && <p className="text-sm">{message}</p>}
        <Button disabled={pending}>{t("sendLink")}</Button>
      </div>
    </form>
  );
}
