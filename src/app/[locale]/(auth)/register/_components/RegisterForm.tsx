"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AtSign, Check, Loader2, Lock, Mail, MailCheck, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { routes } from "@/config/routes";
import { AuthCard } from "@/ui/layout/AuthShell";
import AuthField, { PasswordRules, USERNAME_RE, strongPassword, validEmail } from "@/ui/auth/AuthField";
import GoogleButton, { AuthDivider } from "@/ui/auth/GoogleButton";
import { errorCode, notify } from "@/lib/toast";

type Availability = "idle" | "checking" | "free" | "taken";

export default function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [availability, setAvailability] = useState<Availability>("idle");
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState("");

  useEffect(() => {
    if (!USERNAME_RE.test(username)) return setAvailability("idle");
    setAvailability("checking");
    const timer = window.setTimeout(() => {
      authService.usernameAvailable(username)
        .then((free) => setAvailability(free ? "free" : "taken"))
        .catch(() => setAvailability("idle"));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [username]);

  const show = (key: string) => touched[key];
  const usernameError = show("username") && !USERNAME_RE.test(username) ? t("usernameInvalid") : availability === "taken" ? t("USERNAME_TAKEN") : "";
  const emailError = show("email") && !validEmail(email) ? t("emailInvalid") : "";
  const passwordError = show("password") && !strongPassword(password) ? t("passwordWeak") : "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ username: true, email: true, password: true });
    if (!USERNAME_RE.test(username) || !validEmail(email) || !strongPassword(password) || availability === "taken") return;
    setPending(true);
    try {
      await authService.csrf();
      await authService.register({ username, email: email.trim(), password, locale });
      setSentTo(email.trim());
      notify.success(t("registered"), t("CHECK_EMAIL"));
    } catch (err) {
      const code = errorCode(err, "VALIDATION");
      if (code === "USERNAME_TAKEN") setAvailability("taken");
      notify.error(t.has(code) ? t(code as "VALIDATION") : t("VALIDATION"));
    } finally {
      setPending(false);
    }
  }

  if (sentTo) {
    return (
      <AuthCard title={t("checkInboxTitle")} text={t("checkInboxText", { email: sentTo })}
        footer={<Link href={routes.login} className="font-semibold text-primary hover:underline">{t("submitLogin")}</Link>}>
        <div className="grid place-items-center rounded-2xl bg-mint/60 p-8 text-ink"><MailCheck className="size-14" /></div>
      </AuthCard>
    );
  }

  const usernameStatus = availability === "checking" ? <Loader2 className="size-4 animate-spin text-muted-foreground" />
    : availability === "free" ? <Check className="size-4 text-[#23824a]" />
    : availability === "taken" ? <X className="size-4 text-danger" /> : null;

  return (
    <AuthCard
      title={t("registerTitle")}
      text={t("registerText")}
      footer={<>{t("hasAccount")} <Link href={routes.login} className="font-semibold text-primary underline-offset-4 hover:underline">{t("submitLogin")}</Link></>}
    >
      <GoogleButton />
      <AuthDivider />
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <AuthField label={t("username")} icon={<AtSign />} name="username" autoComplete="username" placeholder="aysel.22" maxLength={20}
          value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
          onBlur={() => setTouched((v) => ({ ...v, username: true }))}
          error={usernameError} trailing={usernameStatus}
          hint={availability === "free" ? <span className="text-[#23824a]">{t("usernameFree")}</span> : t("usernameHint")} />
        <AuthField label={t("email")} icon={<Mail />} type="email" name="email" autoComplete="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((v) => ({ ...v, email: true }))} error={emailError} />
        <AuthField label={t("password")} icon={<Lock />} type="password" name="password" autoComplete="new-password" placeholder="••••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched((v) => ({ ...v, password: true }))}
          error={passwordError} hint={<PasswordRules value={password} />} />
        {passwordError && <PasswordRules value={password} />}
        <Button type="submit" disabled={pending} className="mt-1 h-12 rounded-xl text-[0.95rem]">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {pending ? t("creating") : t("submitRegister")}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{t("terms")}</p>
      </form>
    </AuthCard>
  );
}
