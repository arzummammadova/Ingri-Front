"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { routes } from "@/config/routes";
import { AuthCard } from "@/ui/layout/AuthShell";
import AuthField, { PasswordRules, strongPassword } from "@/ui/auth/AuthField";
import { notify } from "@/lib/toast";

export default function ResetForm() {
  const t = useTranslations("auth");
  const token = useSearchParams().get("token") || "";
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!strongPassword(password) || password !== confirm) return;
    setPending(true);
    try {
      await authService.csrf();
      await authService.reset(token, password);
      notify.success(t("PASSWORD_UPDATED"));
      router.replace(routes.login);
    } catch {
      notify.error(t("INVALID_TOKEN"));
      setPending(false);
    }
  }

  return (
    <AuthCard title={t("resetTitle")} text={t("resetText")}
      footer={<Link href={routes.login} className="font-semibold hover:underline">{t("backToLogin")}</Link>}>
      {!token && <p className="mb-4 rounded-xl bg-peach/70 px-4 py-3 text-sm text-ink">{t("INVALID_TOKEN")}</p>}
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <AuthField label={t("newPassword")} icon={<Lock />} type="password" autoComplete="new-password" value={password}
          onChange={(e) => setPassword(e.target.value)} error={touched && !strongPassword(password) ? t("passwordWeak") : ""}
          hint={<PasswordRules value={password} />} />
        <AuthField label={t("confirm")} icon={<ShieldCheck />} type="password" autoComplete="new-password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} error={touched && confirm !== password ? t("mismatch") : ""} />
        <Button type="submit" disabled={pending || !token} className="h-12 rounded-xl">
          {pending && <Loader2 className="size-4 animate-spin" />}{t("updatePassword")}
        </Button>
      </form>
    </AuthCard>
  );
}
