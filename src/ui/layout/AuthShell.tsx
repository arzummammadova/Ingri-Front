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
    { en: "brave", tr: "cəsur", cls: "left-[6%] top-[14%] -rotate-6 bg-peach", delay: "0s" },
    { en: "journey", tr: "səyahət", cls: "right-[6%] top-[22%] rotate-3 bg-mint", delay: "1.2s" },
    { en: "dream", tr: "arzu", cls: "right-[12%] bottom-[10%] -rotate-3 bg-lilac", delay: "0.6s" },
  ];
  return (
    <div className="relative grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <style>{AUTH_CSS}</style>
      <aside className="auth-panel relative hidden overflow-hidden bg-gradient-to-br from-[#fff1e6] via-[#efe7ff] to-[#dff6f3] text-ink dark:from-[#1b1530] dark:via-[#2a1f4d] dark:to-[#0f2b3a] dark:text-white lg:flex lg:flex-col lg:justify-between lg:p-8 xl:p-10">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-lilac/50 blur-3xl dark:bg-lilac/35" aria-hidden="true" />
        <div className="absolute -bottom-28 -left-16 size-80 rounded-full bg-aqua/50 blur-3xl dark:bg-aqua/25" aria-hidden="true" />
        <RouteArt />
        <div className="relative z-10"><Logo size="sm" href="/" /></div>
        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-4">
          {words.map((w) => (
            <div key={w.en} style={{ animationDelay: w.delay }} className={`auth-anim absolute ${w.cls} rounded-xl px-3 py-2 text-ink shadow-lg motion-safe:animate-[ingri-float_6s_ease-in-out_infinite]`}>
              <p className="font-brand text-base font-semibold leading-none">{w.en}</p>
              <p className="mt-0.5 text-[0.7rem] opacity-70">{w.tr}</p>
            </div>
          ))}
          <div className="relative grid size-44 place-items-center rounded-full bg-white/50 ring-1 ring-ink/10 backdrop-blur-sm dark:bg-white/10 dark:ring-white/15 xl:size-52">
            <img src="/brand/ingri-mark.svg" alt="" className="auth-anim size-28 drop-shadow-2xl motion-safe:animate-[ingri-float_5s_ease-in-out_infinite] xl:size-32" draggable={false} />
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="font-brand text-[1.9rem] font-semibold leading-tight xl:text-[2.1rem]">{t("brandTitle")}</h2>
          <p className="mt-2 text-sm text-ink/70 dark:text-white/75">{t("brandText")}</p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 rounded-xl bg-white/60 px-2.5 py-2 text-xs font-medium backdrop-blur-sm dark:bg-white/10">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/80 dark:bg-white/15"><Icon className="size-3.5" /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="relative flex min-h-dvh flex-col overflow-hidden">
        <OrbitDecor />
        <div className="relative z-header flex items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <div className="lg:invisible"><Logo size="sm" href="/" /></div>
          <div className="flex items-center gap-1.5 rounded-full bg-card/70 p-1 shadow-glass backdrop-blur-md">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <main className="relative z-10 mx-auto flex w-full max-w-[520px] flex-1 items-center px-4 pb-6 sm:px-6">
          <div className="w-full">{children}</div>
        </main>
      </section>
    </div>
  );
}

const FLIGHT = "M 40 520 C 160 380, 60 260, 220 230 S 420 300, 380 160 S 250 70, 300 60";
const HEART = "M 300 60 C 300 40, 270 30, 262 50 C 254 70, 300 92, 300 104 C 300 92, 346 70, 338 50 C 330 30, 300 40, 300 60 Z";

const AUTH_CSS = `
@keyframes auth-dash { to { stroke-dashoffset: -400; } }
@keyframes auth-fly { 0% { offset-distance: 0%; opacity: 0; } 5% { opacity: 1; } 45% { offset-distance: 100%; opacity: 1; } 50%,100% { offset-distance: 100%; opacity: 0; } }
@keyframes auth-trail { 0% { stroke-dashoffset: 1000; opacity: .9; } 45% { stroke-dashoffset: 0; opacity: .9; } 85% { opacity: .9; } 100% { stroke-dashoffset: 0; opacity: 0; } }
@keyframes auth-heart { 0%,45% { stroke-dashoffset: 260; opacity: 0; } 47% { opacity: 1; } 65% { stroke-dashoffset: 0; opacity: 1; } 70% { fill-opacity: 0; } 80% { fill-opacity: .35; opacity: 1; } 100% { stroke-dashoffset: 0; fill-opacity: .35; opacity: 0; } }
.auth-route { stroke-dasharray: 6 10; animation: auth-dash 40s linear infinite; }
.auth-plane { offset-path: path("${FLIGHT}"); offset-rotate: auto 45deg; animation: auth-fly 9s cubic-bezier(.55,.1,.35,1) infinite; }
.auth-trail { stroke-dasharray: 1000; animation: auth-trail 9s cubic-bezier(.55,.1,.35,1) infinite; }
.auth-heart { stroke-dasharray: 260; fill-opacity: 0; animation: auth-heart 9s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .auth-route, .auth-plane, .auth-trail, .auth-heart, .auth-anim { animation: none !important; }
  .auth-plane { offset-distance: 100%; } .auth-heart { stroke-dashoffset: 0; fill-opacity: .35; opacity: 1; } .auth-trail { stroke-dashoffset: 0; }
}
[data-motion="reduce"] .auth-route, [data-motion="reduce"] .auth-plane, [data-motion="reduce"] .auth-trail, [data-motion="reduce"] .auth-heart, [data-motion="reduce"] .auth-anim { animation: none !important; }
[data-motion="reduce"] .auth-plane { offset-distance: 100%; }
[data-motion="reduce"] .auth-heart { stroke-dashoffset: 0; fill-opacity: .35; opacity: 1; }
[data-motion="reduce"] .auth-trail { stroke-dashoffset: 0; }
`;

/** Curvy dashed "travel routes" plus a paper plane that flies a dashed path and draws a heart. */
function RouteArt() {
  return (
    <svg className="pointer-events-none absolute inset-0 size-full text-ink/25 dark:text-white/25" viewBox="0 0 440 600" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <path className="auth-route" d="M -20 120 C 80 60, 160 180, 260 120 S 420 40, 470 110" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path className="auth-route" d="M -30 330 C 90 260, 140 420, 260 360 S 400 250, 480 320" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ animationDuration: "55s" }} />
      <path className="auth-route" d="M 20 620 C 120 520, 260 600, 330 500 S 460 430, 470 380" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ animationDuration: "48s", animationDirection: "reverse" }} />
      <circle cx="260" cy="120" r="4" fill="currentColor" />
      <circle cx="260" cy="360" r="4" fill="currentColor" />
      <path className="auth-trail text-[#7c5cff] dark:text-[#b9a6ff]" d={FLIGHT} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1000" />
      <path className="auth-heart text-[#ff5d8f]" d={HEART} stroke="currentColor" fill="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <g className="auth-plane text-ink dark:text-white">
        <path d="M -12 -2 L 12 -10 L 2 12 L -1 3 Z" fill="currentColor" />
        <path d="M -1 3 L 12 -10" stroke="white" strokeOpacity=".6" strokeWidth="1" className="dark:stroke-ink" />
      </g>
    </svg>
  );
}

export function AuthCard({ title, text, children, footer }: { title: string; text?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="glass liquid-card rounded-[1.5rem] p-5 sm:p-7">
      <h1 className="font-brand text-[1.6rem] font-semibold leading-tight">{title}</h1>
      {text && <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>}
      <div className="mt-4">{children}</div>
      {footer && <div className="mt-4 border-t border-border pt-4 text-center text-sm">{footer}</div>}
    </div>
  );
}
