"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Lock, Mail } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { routes } from "@/config/routes";
import { AuthCard } from "@/ui/layout/AuthShell";
import AuthField, { validEmail } from "@/ui/auth/AuthField";
import GoogleButton, { AuthDivider } from "@/ui/auth/GoogleButton";
import { errorCode, notify } from "@/lib/toast";

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    if (params.get("error") === "google") notify.error(t("googleError"));
  }, [params, t]);

  const emailError = touched && !validEmail(email) ? t("emailInvalid") : "";
  const passwordError = touched && !password ? t("required") : "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!validEmail(email) || !password) return;
    setPending(true);
    try {
      const next = params.get("next") || routes.home;
      const stripped = next.replace(/^\/(az|en|ru)(?=\/|$)/, "") || routes.home;
      await authService.csrf();
      await authService.login({ email: email.trim(), password });
      notify.success(t("welcomeBack"));
      router.replace(stripped.startsWith("/") ? stripped : routes.home);
      router.refresh();
    } catch (err) {
      const code = errorCode(err);
      notify.error(t.has(code) ? t(code as "INVALID_CREDENTIALS") : t("SERVER_ERROR"));
      setPending(false);
    }
  }

  return (
    <AuthCard
      title={t("loginTitle")}
      text={t("loginText")}
      footer={<>{t("noAccount")} <Link href={routes.register} className="font-semibold text-primary underline-offset-4 hover:underline">{t("submitRegister")}</Link></>}
    >
      <GoogleButton />
      <AuthDivider />
      <form onSubmit={onSubmit} noValidate className="grid gap-3">
        <AuthField label={t("email")} icon={<Mail />} type="email" name="email" autoComplete="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} />
        <AuthField label={t("password")} icon={<Lock />} type="password" name="password" autoComplete="current-password" placeholder="••••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)} error={passwordError}
          labelAside={<Link href={routes.forgot} className="text-xs font-semibold text-muted-foreground hover:text-foreground">{t("forgot")}</Link>} />
        <Button type="submit" disabled={pending} className="mt-1 h-11 rounded-xl text-[0.95rem]">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {pending ? t("signingIn") : t("submitLogin")}
        </Button>
      </form>
    </AuthCard>
  );
}
