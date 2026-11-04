"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, Mail, MailWarning } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { routes } from "@/config/routes";
import { AuthCard } from "@/ui/layout/AuthShell";
import AuthField, { validEmail } from "@/ui/auth/AuthField";
import { notify } from "@/lib/toast";

type State = "idle" | "verifying" | "done" | "failed";

export default function VerifyForm() {
  const t = useTranslations("auth");
  const token = useSearchParams().get("token") || "";
  const [state, setState] = useState<State>(token ? "verifying" : "idle");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    authService.csrf()
      .then(() => authService.verify(token))
      .then(() => { setState("done"); notify.success(t("EMAIL_VERIFIED")); })
      .catch(() => { setState("failed"); notify.error(t("INVALID_TOKEN")); });
  }, [token, t]);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validEmail(email)) return notify.error(t("emailInvalid"));
    setPending(true);
    await authService.csrf().then(() => authService.resend(email.trim())).catch(() => undefined);
    setPending(false);
    notify.info(t("CHECK_EMAIL"));
  }

  const login = <Link href={routes.login} className="font-semibold hover:underline">{t("submitLogin")}</Link>;

  return (
    <AuthCard title={t("verifyTitle")} text={t("verifyText")} footer={login}>
      <div className="mb-6 grid place-items-center gap-3 rounded-2xl bg-muted p-6 text-center">
        {state === "verifying" && <><Loader2 className="size-12 animate-spin" /><p className="text-sm font-semibold">{t("verifying")}</p></>}
        {state === "done" && <><CheckCircle2 className="size-12 text-[#23824a]" /><p className="text-sm font-semibold">{t("EMAIL_VERIFIED")}</p>
          <Link href={routes.login} className="mt-1 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">{t("submitLogin")}</Link></>}
        {(state === "failed" || state === "idle") && <><MailWarning className="size-12 text-muted-foreground" /><p className="text-sm">{state === "failed" ? t("INVALID_TOKEN") : t("verifyResendText")}</p></>}
      </div>
      {state !== "done" && (
        <form onSubmit={resend} noValidate className="grid gap-3">
          <AuthField label={t("email")} icon={<Mail />} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button variant="outline" type="submit" disabled={pending} className="h-12 rounded-xl">
            {pending && <Loader2 className="size-4 animate-spin" />}{t("resend")}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
