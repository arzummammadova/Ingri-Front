"use client";

import { useTranslations } from "next-intl";
import { BookOpen, Headphones, Mic, Sparkles } from "lucide-react";
import Logo from "./Logo";
import LanguageSwitcher from "@/ui/components/LanguageSwitcher";
import ThemeToggle from "@/ui/components/ThemeToggle";
import { OrbitDecor } from "@/ui/illustrations/Decor";

/** Header-less split auth layout: branded visual panel (lg+) on the left, form on the right; mobile shows only the form. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth");
  const perks = [
    { icon: Headphones, text: t("perkListen") },
    { icon: BookOpen, text: t("perkGrammar") },
    { icon: Mic, text: t("perkSpeak") },
    { icon: Sparkles, text: t("perkAi") },
  ];
  const words = [
    { en: "brave", tr: "cəsur", cls: "left-[8%] top-[22%] -rotate-6 bg-peach", delay: "0s" },
    { en: "journey", tr: "səyahət", cls: "right-[10%] top-[30%] rotate-3 bg-mint", delay: "1.2s" },
    { en: "listen", tr: "dinlə", cls: "left-[14%] bottom-[24%] rotate-2 bg-aqua", delay: "2.1s" },
    { en: "dream", tr: "arzu", cls: "right-[14%] bottom-[18%] -rotate-3 bg-lilac", delay: "0.6s" },
  ];
  return (
    <div className="relative grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#1b1530] via-[#2a1f4d] to-[#0f2b3a] text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-lilac/40 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-28 -left-16 size-96 rounded-full bg-aqua/30 blur-3xl" aria-hidden="true" />
        <div className="absolute left-1/3 top-1/2 size-56 rounded-full bg-peach/20 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 [&_*]:text-white"><Logo size="sm" href="/" /></div>
        <div className="relative z-10 flex flex-1 items-center justify-center">
          {words.map((w) => (
            <div key={w.en} style={{ animationDelay: w.delay }} className={`absolute ${w.cls} rounded-2xl px-4 py-2.5 text-ink shadow-xl motion-safe:animate-[ingri-float_6s_ease-in-out_infinite]`}>
              <p className="font-brand text-lg font-semibold leading-none">{w.en}</p>
              <p className="mt-1 text-xs opacity-70">{w.tr}</p>
            </div>
          ))}
          <div className="relative grid size-64 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-sm xl:size-72">
            <img src="/brand/ingri-mark.svg" alt="" className="size-40 drop-shadow-2xl motion-safe:animate-[ingri-float_5s_ease-in-out_infinite] xl:size-44" draggable={false} />
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <h2 className="font-brand text-[2.4rem] font-semibold leading-tight">{t("brandTitle")}</h2>
          <p className="mt-3 text-base text-white/75">{t("brandText")}</p>
          <ul className="mt-6 grid grid-cols-2 gap-2.5">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-3 py-2.5 text-sm font-medium backdrop-blur-sm">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/15"><Icon className="size-4" /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="relative flex min-h-dvh flex-col overflow-hidden">
        <OrbitDecor />
        <div className="relative z-header flex items-center justify-between gap-2 p-4 sm:p-6">
          <div className="lg:invisible"><Logo size="sm" href="/" /></div>
          <div className="flex items-center gap-1.5 rounded-full bg-card/70 p-1 shadow-glass backdrop-blur-md">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 items-center px-5 pb-12 pt-4 sm:px-6">
          <div className="w-full">{children}</div>
        </main>
      </section>
    </div>
  );
}

export function AuthCard({ title, text, children, footer }: { title: string; text?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="glass liquid-card rounded-[1.75rem] p-6 sm:p-8">
      <h1 className="font-brand text-[1.9rem] font-semibold leading-tight">{title}</h1>
      {text && <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>}
      <div className="mt-6">{children}</div>
      {footer && <div className="mt-6 border-t border-border pt-5 text-center text-sm">{footer}</div>}
    </div>
  );
}
