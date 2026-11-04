"use client";

import { ArrowDown, BookOpen, Check, Copy, Languages, Mic, Send, SpellCheck, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService, type ChatMessage } from "@/services/chatService";
import { useAuth } from "@/hooks/useAuth";
import { Markdown } from "@/lib/markdown";
import { avatarSrc, cn } from "@/lib/utils";
import { playSound, SOUND_EVENT } from "@/lib/sound";

type Msg = ChatMessage & { at?: number };

function CopyButton({ text }: { text: string }) {
  const t = useTranslations("chat");
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={t("copy")}
      title={t("copy")}
      onClick={() => navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })}
      className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function Mascot({ className }: { className?: string }) {
  return <img src="/brand/ingri-mark.svg" alt="" className={cn("select-none", className)} draggable={false} />;
}

function useClock(locale: string) {
  return useCallback(
    (value?: string | number) => {
      const date = value ? new Date(value) : new Date();
      if (Number.isNaN(date.getTime())) return "";
      return new Intl.DateTimeFormat(locale === "az" ? "az-Latn-AZ" : "en-GB", { hour: "2-digit", minute: "2-digit" }).format(date);
    },
    [locale],
  );
}

const GROUPS = [
  { key: "grammar", icon: BookOpen, tone: "bg-lilac/70 dark:bg-lilac/20" },
  { key: "translate", icon: Languages, tone: "bg-aqua/80 dark:bg-aqua/15" },
  { key: "correct", icon: SpellCheck, tone: "bg-peach/80 dark:bg-peach/15" },
  { key: "speaking", icon: Mic, tone: "bg-mint/80 dark:bg-mint/15" },
] as const;

export default function IngriChat() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const clock = useClock(locale);
  const { user } = useAuth();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [local, setLocal] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const [bounce, setBounce] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const history = useQuery({ queryKey: ["chat"], queryFn: chatService.history, enabled: open && !!user });

  useEffect(() => {
    if (history.data && !streaming) setLocal(history.data.items);
  }, [history.data, streaming]);

  const scrollDown = useCallback((smooth = true) => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);
  useEffect(() => {
    if (atBottom) scrollDown(!streaming);
  }, [local, open, atBottom, scrollDown, streaming]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(id); };
  }, [open]);
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    const on = (e: Event) => { if (!(e as CustomEvent).detail?.reduced) setBounce((n) => n + 1); };
    window.addEventListener(SOUND_EVENT, on);
    return () => window.removeEventListener(SOUND_EVENT, on);
  }, []);
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input, open]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 48);
  }

  async function ask(text: string) {
    const message = text.trim();
    if (!message || streaming) return;
    setInput("");
    setError("");
    setStreaming(true);
    setAtBottom(true);
    playSound("send");
    const now = Date.now();
    setLocal((cur) => [...cur, { role: "user", content: message, at: now }, { role: "assistant", content: "", at: now }]);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await chatService.stream(message, locale, (e) => {
        if (e.delta) setLocal((cur) => {
          const next = [...cur];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + e.delta };
          return next;
        });
        if (e.error) setError(t(`errors.${e.error === "RATE_LIMITED" || e.error === "BAD_KEY" ? e.error : "generic"}`));
      }, ctrl.signal);
    } catch {
      if (!ctrl.signal.aborted) setError(t("errors.generic"));
    } finally {
      setLocal((cur) => (cur[cur.length - 1]?.role === "assistant" && !cur[cur.length - 1].content ? cur.slice(0, -1) : cur));
      setStreaming(false);
      playSound("pop");
      client.invalidateQueries({ queryKey: ["chat"] });
    }
  }

  async function clear() {
    abortRef.current?.abort();
    await chatService.clear();
    setLocal([]);
    client.invalidateQueries({ queryKey: ["chat"] });
  }

  const waiting = streaming && local[local.length - 1]?.role === "assistant" && !local[local.length - 1].content;
  const empty = !history.isLoading && local.length === 0;
  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("open")}
        aria-expanded={open}
        className={cn("ingri-fab ingri-chat-anchor fixed bottom-24 left-4 z-nav grid size-16 place-items-center lg:bottom-6", open && "max-sm:hidden")}
      >
        <span className="ingri-blob absolute inset-0" aria-hidden="true" />
        <Mascot key={bounce} className={cn("relative size-11 drop-shadow", bounce > 0 && "ingri-mascot-bounce")} />
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Ingri"
          className="ingri-chat-anchor fixed inset-0 z-overlay flex flex-col overflow-hidden bg-background sm:inset-auto sm:bottom-24 sm:left-4 sm:h-[min(42rem,calc(100dvh-8rem))] sm:w-[26rem] sm:rounded-2xl sm:border sm:border-border sm:shadow-soft lg:bottom-6 motion-safe:animate-[ingri-pop_0.2s_ease-out]"
        >
          {/* Header */}
          <header className="relative flex items-center gap-3 bg-gradient-to-br from-lilac via-aqua to-mint px-4 py-3 text-ink dark:from-lilac/25 dark:via-aqua/15 dark:to-mint/20 dark:text-foreground">
            <div className="relative shrink-0">
              <span className="grid size-11 place-items-center rounded-full bg-white/80 shadow-soft dark:bg-white/10">
                <Mascot className="size-9" />
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-background" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-brand text-xl font-bold leading-none">Ingri</p>
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs opacity-80">
                {streaming ? t("thinking") : t("online")} · {t("subtitle", { level: user?.activeLevel || "A1" })}
              </p>
            </div>
            {local.length > 0 && (
              <button type="button" onClick={clear} aria-label={t("clear")} title={t("clear")} className="grid size-9 place-items-center rounded-full hover:bg-white/50 dark:hover:bg-white/10">
                <Trash2 className="size-4" />
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="grid size-9 place-items-center rounded-full hover:bg-white/50 dark:hover:bg-white/10">
              <X className="size-5" />
            </button>
          </header>

          {/* Messages */}
          <div ref={listRef} onScroll={onScroll} className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
            {history.isLoading && (
              <div className="space-y-3">
                <div className="h-14 w-3/4 animate-pulse rounded-2xl bg-card" />
                <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-card" />
              </div>
            )}

            {empty && (
              <div className="flex flex-col items-center pt-2 text-center">
                <div className="relative">
                  <span className="absolute inset-0 -z-10 scale-125 rounded-full bg-gradient-to-br from-lilac via-aqua to-mint opacity-60 blur-xl dark:opacity-30" />
                  <Mascot className="size-20 motion-safe:animate-[ingri-float_4s_ease-in-out_infinite]" />
                </div>
                <h3 className="mt-3 font-brand text-2xl font-bold">{t("hello", { name: firstName })}</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">{t("intro")}</p>
                <div className="mt-5 grid w-full gap-3 text-left">
                  {GROUPS.map(({ key, icon: Icon, tone }) => (
                    <div key={key} className="rounded-2xl border border-border bg-card p-3 shadow-soft">
                      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        <span className={cn("grid size-7 place-items-center rounded-lg text-ink dark:text-foreground", tone)}>
                          <Icon className="size-4" />
                        </span>
                        {t(`groups.${key}.title`)}
                      </p>
                      <div className="grid gap-1.5">
                        {(["p1", "p2"] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => ask(t(`groups.${key}.${p}`))}
                            className="rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                          >
                            {t(`groups.${key}.${p}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {local.map((m, i) => {
                const time = clock(m.createdAt || m.at);
                if (m.role === "user") {
                  return (
                    <div key={i} className="flex items-end justify-end gap-2">
                      <div className="max-w-[82%]">
                        <div className="whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground shadow-soft">{m.content}</div>
                        <p className="mt-1 text-right text-[10px] text-muted-foreground">{time}</p>
                      </div>
                      {user && <img src={avatarSrc(user)} alt="" className="size-7 shrink-0 rounded-full object-cover" />}
                    </div>
                  );
                }
                if (!m.content) return null;
                const live = streaming && i === local.length - 1;
                return (
                  <div key={i} className="group flex items-end gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-card shadow-soft"><Mascot className="size-6" /></span>
                    <div className="min-w-0 max-w-[85%]">
                      <div className="ingri-md rounded-2xl rounded-bl-md border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft">
                        <Markdown text={m.content} />
                        {live && <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-foreground/60" aria-hidden="true" />}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>Ingri · {time}</span>
                        {!live && <span className="opacity-60 transition group-hover:opacity-100"><CopyButton text={m.content} /></span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {waiting && (
                <div className="flex items-end gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-card shadow-soft"><Mascot className="size-6" /></span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-card px-3.5 py-3 shadow-soft" aria-label={t("typing")}>
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="size-2 rounded-full bg-muted-foreground motion-safe:animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              {error && <p className="rounded-xl bg-peach px-3 py-2 text-xs text-ink">{error}</p>}
            </div>
          </div>

          {!atBottom && local.length > 0 && (
            <button
              type="button"
              onClick={() => { setAtBottom(true); scrollDown(); }}
              aria-label={t("scrollDown")}
              className="absolute bottom-24 left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full border border-border bg-card shadow-soft"
            >
              <ArrowDown className="size-4" />
            </button>
          )}

          {/* Quick chips once a conversation exists */}
          {!streaming && !empty && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
              {GROUPS.map(({ key, icon: Icon }) => (
                <button key={key} type="button" onClick={() => ask(t(`groups.${key}.p1`))} className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                  <Icon className="size-3.5" />
                  {t(`groups.${key}.title`)}
                </button>
              ))}
            </div>
          )}

          {/* Sticky composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); ask(input); }}
            className="sticky bottom-0 border-t border-border bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-1.5 pl-3 focus-within:ring-2 focus-within:ring-ring">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
                placeholder={t("placeholder")}
                aria-label={t("placeholder")}
                rows={1}
                maxLength={2000}
                className="max-h-40 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                aria-label={t("send")}
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              >
                <Send className="size-4" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">{t("hint")}</p>
          </form>
        </section>
      )}
    </>
  );
}
