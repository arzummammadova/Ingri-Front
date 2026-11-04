"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { AZ, GB } from "country-flag-icons/react/3x2";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Popover } from "./Popover";

const flags = { az: AZ, en: GB };
const names: Record<Locale, string> = { az: "Azərbaycan", en: "English" };

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const Flag = flags[locale];

  return (
    <>
      <button
        ref={ref}
        type="button"
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("language")}: ${names[locale]}`}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-[3.75rem] shrink-0 items-center justify-center gap-1 rounded-full border border-border bg-card text-foreground sm:h-10"
      >
        <Flag title={names[locale]} className="h-4 w-6 rounded-sm" />
        <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <Popover anchorRef={ref} open={open} onClose={close} align="end" minWidth={176} role="presentation">
        <ul role="listbox" aria-label={t("language")}>
          {routing.locales.map((item) => {
            const ItemFlag = flags[item];
            return (
              <li key={item} role="option" aria-selected={item === locale}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    startTransition(() => router.replace(pathname, { locale: item }));
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${item === locale ? "bg-lilac font-semibold text-ink" : "hover:bg-muted"}`}
                >
                  <ItemFlag className="h-4 w-6 rounded-sm" />
                  {names[item]}
                </button>
              </li>
            );
          })}
        </ul>
      </Popover>
    </>
  );
}
