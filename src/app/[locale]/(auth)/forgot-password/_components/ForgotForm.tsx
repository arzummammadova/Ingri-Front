"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { routes } from "@/config/routes";
import { AuthCard } from "@/ui/layout/AuthShell";
import AuthField, { validEmail } from "@/ui/auth/AuthField";
import { notify } from "@/lib/toast";

export default function ForgotForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!validEmail(email)) return;
    setPending(true);
    try {
      await authService.csrf();
      await authService.forgot(email.trim());
    } catch {
      /* same answer either way, to avoid revealing accounts */
    }
    setSent(true);
    setPending(false);
    notify.info(t("CHECK_EMAIL"));
  }

  const back = <Link href={routes.login} className="inline-flex items-center gap-1.5 font-semibold hover:underline"><ArrowLeft className="size-4" />{t("backToLogin")}</Link>;

  if (sent) {
    return (
      <AuthCard title={t("checkInboxTitle")} text={t("checkInboxText", { email })} footer={back}>
        <div className="grid place-items-center rounded-2xl bg-mint/60 p-8 text-ink"><MailCheck className="size-14" /></div>
      </AuthCard>
    );
  }
  return (
    <AuthCard title={t("forgotTitle")} text={t("forgotText")} footer={back}>
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <AuthField label={t("email")} icon={<Mail />} type="email" name="email" autoComplete="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} error={touched && !validEmail(email) ? t("emailInvalid") : ""} />
        <Button type="submit" disabled={pending} className="h-12 rounded-xl">
          {pending && <Loader2 className="size-4 animate-spin" />}{t("sendLink")}
        </Button>
      </form>
    </AuthCard>
  );
}
