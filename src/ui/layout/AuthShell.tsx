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
        <span className="orbit left-10 top-24 size-36 opacity-60" aria-hidden="true" />
        <span className="orbit right-12 bottom-40 size-24 opacity-60" aria-hidden="true" />
        <span className="blob -left-8 top-28 size-44 bg-lilac/70" aria-hidden="true" />
        <span className="blob right-6 top-10 size-36 bg-peach/70" aria-hidden="true" />
        <span className="blob -right-6 bottom-0 size-52 bg-mint/70" aria-hidden="true" />
        <RouteArt />
        <div className="relative z-10"><Logo size="sm" href="/" /></div>
        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-4">
          {words.map((w) => (
            <div key={w.en} style={{ animationDelay: w.delay }} className={`auth-anim absolute ${w.cls} rounded-2xl px-4 py-2.5 text-ink shadow-lg motion-safe:animate-[ingri-float_6s_ease-in-out_infinite]`}>
              <p className="font-brand text-xl font-semibold leading-none">{w.en}</p>
              <p className="mt-1 text-sm opacity-70">{w.tr}</p>
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

const FLIGHT = "M 30 540 C 150 420, 50 300, 190 270 S 370 320, 330 210 S 230 140, 290 130";
const HEART = "M 290 130 C 290 104, 254 92, 244 118 C 234 144, 290 172, 290 188 C 290 172, 346 144, 336 118 C 326 92, 290 104, 290 130 Z";

const AUTH_CSS = `
@keyframes auth-dash { to { stroke-dashoffset: -400; } }
@keyframes auth-fly { 0% { offset-distance: 0%; opacity: 0; } 4% { opacity: 1; } 40% { offset-distance: 100%; opacity: 1; } 44%,100% { offset-distance: 100%; opacity: 0; } }
@keyframes auth-trail { 0% { stroke-dashoffset: 100; opacity: 1; } 40% { stroke-dashoffset: 0; opacity: 1; } 88% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
@keyframes auth-heart { 0%,40% { stroke-dashoffset: 100; fill-opacity: 0; opacity: 1; } 62% { stroke-dashoffset: 0; fill-opacity: 0; } 72%,88% { stroke-dashoffset: 0; fill-opacity: .55; opacity: 1; transform: scale(1); } 80% { transform: scale(1.08); } 100% { stroke-dashoffset: 0; fill-opacity: .55; opacity: 0; } }
.auth-route { stroke-dasharray: 6 10; animation: auth-dash 40s linear infinite; }
.auth-plane { offset-path: path("${FLIGHT}"); offset-rotate: auto; animation: auth-fly 9s cubic-bezier(.55,.1,.35,1) infinite; }
.auth-trail { stroke-dasharray: 2 3; stroke-dashoffset: 0; }
.auth-trail-mask { stroke-dasharray: 100; animation: auth-trail 9s cubic-bezier(.55,.1,.35,1) infinite; }
.auth-heart { stroke-dasharray: 100; transform-box: fill-box; transform-origin: center; animation: auth-heart 9s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .auth-route, .auth-plane, .auth-trail-mask, .auth-heart, .auth-anim { animation: none !important; }
  .auth-plane { offset-distance: 100%; opacity: 0; } .auth-heart { stroke-dashoffset: 0; fill-opacity: .55; } .auth-trail-mask { stroke-dashoffset: 0; }
}
[data-motion="reduce"] .auth-route, [data-motion="reduce"] .auth-plane, [data-motion="reduce"] .auth-trail-mask, [data-motion="reduce"] .auth-heart, [data-motion="reduce"] .auth-anim { animation: none !important; }
[data-motion="reduce"] .auth-plane { offset-distance: 100%; opacity: 0; }
[data-motion="reduce"] .auth-heart { stroke-dashoffset: 0; fill-opacity: .55; }
[data-motion="reduce"] .auth-trail-mask { stroke-dashoffset: 0; }
`;

const PLANE = "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";

/** Curvy dashed "travel routes" plus an airplane that flies a dashed path and draws a heart. */
function RouteArt() {
  return (
    <svg className="pointer-events-none absolute inset-0 size-full text-ink/25 dark:text-white/25" viewBox="0 0 440 600" preserveAspectRatio="xMidYMid meet" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="auth-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".12" stopColor="#fff" stopOpacity="1" />
          <stop offset=".88" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="auth-edge"><rect width="440" height="600" fill="url(#auth-fade)" /></mask>
        <mask id="auth-reveal" maskUnits="userSpaceOnUse">
          <path className="auth-trail-mask" d={FLIGHT} pathLength={100} stroke="#fff" strokeWidth="8" fill="none" />
        </mask>
      </defs>
      <g mask="url(#auth-edge)">
        <path className="auth-route" d="M 10 110 C 90 60, 160 170, 240 120 S 380 60, 430 100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path className="auth-route" d="M 10 340 C 100 280, 150 420, 250 370 S 380 280, 430 320" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ animationDuration: "55s" }} />
        <path className="auth-route" d="M 20 590 C 120 510, 250 580, 320 500 S 410 440, 430 420" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ animationDuration: "48s", animationDirection: "reverse" }} />
        <circle cx="240" cy="120" r="3.5" fill="currentColor" />
        <circle cx="250" cy="370" r="3.5" fill="currentColor" />
      </g>
      <path className="auth-trail text-[#7c5cff] dark:text-[#b9a6ff]" d={FLIGHT} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" mask="url(#auth-reveal)" />
      <path className="auth-heart text-[#ff4f87]" d={HEART} pathLength={100} stroke="currentColor" fill="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <g className="auth-plane text-[#2b2147] dark:text-white">
        <g transform="rotate(45) translate(-14 -14) scale(1.15)">
          <path d={PLANE} fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
        </g>
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
