"use client";

import { forwardRef, useId, useState, type ComponentProps, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  icon?: ReactNode;
  error?: string;
  hint?: ReactNode;
  trailing?: ReactNode;
  labelAside?: ReactNode;
};

/** Labelled input with leading icon, focus ring, inline error and an eye toggle for passwords. */
const AuthField = forwardRef<HTMLInputElement, Props>(function AuthField(
  { label, icon, error, hint, trailing, labelAside, type = "text", className, ...props },
  ref,
) {
  const id = useId();
  const t = useTranslations("auth");
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className="grid content-start gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold">{label}</label>
        {labelAside}
      </div>
      <div
        className={cn(
          "group flex h-11 items-center gap-2.5 rounded-xl border bg-card px-3.5 shadow-glass transition focus-within:ring-4",
          error ? "border-danger/60 focus-within:ring-danger/15" : "border-border focus-within:border-primary/50 focus-within:ring-primary/15",
        )}
      >
        {icon && <span className={cn("shrink-0 text-muted-foreground transition group-focus-within:text-foreground [&>svg]:size-[1.15rem]", error && "text-danger")}>{icon}</span>}
        <input
          ref={ref}
          id={id}
          type={isPassword && show ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn("h-full min-w-0 flex-1 bg-transparent text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground/70", className)}
          {...props}
        />
        {trailing}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? t("hidePassword") : t("showPassword")}
            title={show ? t("hidePassword") : t("showPassword")}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {show ? <EyeOff className="size-[1.1rem]" /> : <Eye className="size-[1.1rem]" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <div id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
});

export default AuthField;

/** Live password checklist shown under new-password fields. */
export function PasswordRules({ value }: { value: string }) {
  const t = useTranslations("auth");
  const rules: [string, boolean][] = [
    [t("ruleLength"), value.length >= 10],
    [t("ruleCase"), /[a-z]/.test(value) && /[A-Z]/.test(value)],
    [t("ruleNumber"), /[0-9]/.test(value)],
    [t("ruleSymbol"), /[^A-Za-z0-9]/.test(value)],
  ];
  const score = rules.filter(([, ok]) => ok).length;
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-4 gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1 rounded-full transition-colors", i < score ? (score < 3 ? "bg-[#f2a541]" : score < 4 ? "bg-[#7fc8a9]" : "bg-[#23824a]") : "bg-muted")} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {rules.map(([label, ok]) => (
          <li key={label} className={cn("flex items-center gap-1.5", ok ? "text-foreground" : "text-muted-foreground")}>
            <span className={cn("grid size-3.5 place-items-center rounded-full text-[9px] font-bold", ok ? "bg-[#23824a] text-white" : "bg-muted")}>{ok ? "✓" : ""}</span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const strongPassword = (v: string) => v.length >= 10 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
export const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const USERNAME_RE = /^[a-z0-9._]{3,20}$/;
