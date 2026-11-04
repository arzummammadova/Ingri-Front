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
      return new Intl.DateTimeFormat(locale === "az" ? "az-Latn-AZ" : locale === "ru" ? "ru-RU" : "en-GB", { hour: "2-digit", minute: "2-digit" }).format(date);
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
  const [peek, setPeek] = useState(false);
  const openRef = useRef(false);
  openRef.current = open;
  // Occasionally expand the pill by itself: ~4s after load, then every ~50s (desktop); mobile just bounces.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    let hide: number | undefined;
    const run = () => {
      if (openRef.current || document.visibilityState !== "visible") return;
      if (!desktop.matches) return setBounce((n) => n + 1);
      setPeek(true);
      hide = window.setTimeout(() => setPeek(false), 4000);
    };
    const first = window.setTimeout(run, 4000);
    const every = window.setInterval(run, 45000 + Math.round(Math.random() * 15000));
    return () => { clearTimeout(first); clearInterval(every); clearTimeout(hide); };
  }, []);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const history = useQuery({ queryKey: ["chat"], queryFn: chatService.history, enabled: open && !!user });

  const streamingRef = useRef(false);
  streamingRef.current = streaming;
  // Sync from server only when fresh history arrives, never when a stream ends
  // (that used to overwrite just-sent messages with stale history).
  useEffect(() => {
    if (!history.data || streamingRef.current) return;
    const items = history.data.items;
    setLocal((cur) => (items.length >= cur.filter((m) => m.content).length ? items : cur));
  }, [history.data]);

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
    let gotReply = false;
    try {
      await chatService.stream(message, locale, (e) => {
        if (e.delta && !gotReply) { gotReply = true; playSound("pop"); }
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
        data-peek={peek && !open ? "true" : undefined}
        className={cn(
          "group ingri-chat-anchor fixed bottom-24 right-4 z-nav flex h-16 items-center rounded-full p-0 transition-all duration-300 ease-fluid lg:bottom-6",
          "lg:hover:bg-white lg:data-[peek=true]:bg-white lg:hover:p-1.5 lg:data-[peek=true]:p-1.5 lg:hover:pr-5 lg:data-[peek=true]:pr-5 lg:hover:shadow-[0_10px_30px_-8px_rgba(30,20,60,0.28)] lg:data-[peek=true]:shadow-[0_10px_30px_-8px_rgba(30,20,60,0.28)] lg:hover:ring-1 lg:data-[peek=true]:ring-1 lg:hover:ring-black/5 lg:data-[peek=true]:ring-black/5",
          "dark:lg:hover:bg-card dark:lg:data-[peek=true]:bg-card dark:lg:hover:ring-white/10 dark:lg:data-[peek=true]:ring-white/10",
          open && "max-sm:hidden",
        )}
      >
        <span className="ingri-fab relative grid size-16 shrink-0 place-items-center transition-all duration-300 lg:group-hover:size-[3.25rem] lg:group-data-[peek=true]:size-[3.25rem]">
          <span className="ingri-blob absolute inset-0 transition-opacity duration-300 lg:group-hover:opacity-0 lg:group-data-[peek=true]:opacity-0" aria-hidden="true" />
          <span className="absolute inset-0 rounded-full bg-lilac/60 opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100 lg:group-data-[peek=true]:opacity-100 dark:bg-lilac/25" aria-hidden="true" />
          <Mascot key={bounce} className={cn("relative size-11 drop-shadow transition-all duration-300 lg:group-hover:size-9 lg:group-data-[peek=true]:size-9", bounce > 0 && "ingri-mascot-bounce")} />
        </span>
        <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-left opacity-0 transition-all duration-300 ease-fluid lg:block lg:group-hover:ml-3 lg:group-data-[peek=true]:ml-3 lg:group-hover:max-w-44 lg:group-data-[peek=true]:max-w-44 lg:group-hover:opacity-100 lg:group-data-[peek=true]:opacity-100">
          <span className="block text-sm font-bold leading-tight text-ink dark:text-foreground">Ingri AI</span>
          <span className="block text-xs leading-tight text-muted-foreground">{t("fabHint")}</span>
        </span>
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Ingri"
          className="ingri-chat-anchor fixed inset-0 z-overlay flex flex-col overflow-hidden bg-background sm:inset-auto sm:bottom-24 sm:right-4 sm:h-[min(42rem,calc(100dvh-8rem))] sm:w-[26rem] sm:rounded-2xl sm:border sm:border-border sm:shadow-soft lg:bottom-6 motion-safe:animate-[ingri-pop_0.2s_ease-out]"
        >
          {/* Header */}
          <header className="relative flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <div className="relative shrink-0">
              <span className="grid size-10 place-items-center rounded-full bg-white shadow-sm">
                <Mascot className="size-8" />
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-primary bg-emerald-400" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-brand text-lg font-bold leading-none">Ingri</p>
              <p className="mt-1 truncate text-xs text-primary-foreground/75">
                {streaming ? t("thinking") : t("online")} · {t("subtitle", { level: user?.activeLevel || "A1" })}
              </p>
            </div>
            {local.length > 0 && (
              <button type="button" onClick={clear} aria-label={t("clear")} title={t("clear")} className="grid size-9 place-items-center rounded-full text-primary-foreground/85 transition hover:bg-white/15 hover:text-primary-foreground">
                <Trash2 className="size-4" />
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="grid size-9 place-items-center rounded-full text-primary-foreground/85 transition hover:bg-white/15 hover:text-primary-foreground">
              <X className="size-5" />
            </button>
          </header>

          {/* Messages */}
          <div ref={listRef} onScroll={onScroll} className="relative flex-1 overflow-y-auto overscroll-contain bg-muted/40 px-3 py-4" aria-live="polite">
            {history.isLoading && (
              <div className="space-y-3">
                <div className="h-14 w-3/4 animate-pulse rounded-2xl bg-card" />
                <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-card" />
              </div>
            )}

            {empty && (
              <div className="grid gap-3">
                <div className="flex items-end gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5 dark:bg-card dark:ring-white/10"><Mascot className="size-6" /></span>
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-foreground shadow-sm ring-1 ring-black/5 dark:bg-card dark:ring-white/10">
                    <p className="font-semibold">{t("hello", { name: firstName })}</p>
                    <p className="mt-1 text-muted-foreground">{t("intro")}</p>
                    <p className="mt-1 text-right text-[10px] text-muted-foreground">{clock()}</p>
                  </div>
                </div>
                <p className="mt-1 pl-9 text-xs font-semibold text-muted-foreground">{t("pickQuestion")}</p>
                <div className="grid gap-2 pl-9">
                  {GROUPS.flatMap(({ key, icon: Icon, tone }) =>
                    (["p1"] as const).map((p) => (
                      <button
                        key={key + p}
                        type="button"
                        onClick={() => ask(t(`groups.${key}.${p}`))}
                        className="flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2 text-left text-sm text-foreground shadow-sm ring-1 ring-black/5 transition hover:-translate-y-px hover:ring-primary/40 focus-visible:outline-2 focus-visible:outline-ring dark:bg-card dark:ring-white/10"
                      >
                        <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg text-ink dark:text-foreground", tone)}><Icon className="size-3.5" /></span>
                        <span className="min-w-0 flex-1">{t(`groups.${key}.${p}`)}</span>
                        <Send className="size-3.5 shrink-0 text-muted-foreground" />
                      </button>
                    )),
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {local.map((m, i) => {
                const time = clock(m.createdAt || m.at);
                if (m.role === "user") {
                  return (
                    <div key={i} className="flex items-end justify-end gap-2">
                      <div className="max-w-[82%]">
                        <div className="whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground shadow-sm">
                          {m.content}
                          <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-primary-foreground/70">{time}<Check className="size-3" /></p>
                        </div>
                      </div>
                      {user && <img src={avatarSrc(user)} alt="" className="size-7 shrink-0 rounded-full object-cover" />}
                    </div>
                  );
                }
                if (!m.content) return null;
                const live = streaming && i === local.length - 1;
                return (
                  <div key={i} className="group flex items-end gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5 dark:bg-card dark:ring-white/10"><Mascot className="size-6" /></span>
                    <div className="min-w-0 max-w-[85%]">
                      <div className="ingri-md rounded-2xl rounded-bl-md bg-white px-3.5 py-2 text-sm text-foreground shadow-sm ring-1 ring-black/5 dark:bg-card dark:ring-white/10">
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
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm ring-1 ring-black/5 dark:bg-card dark:ring-white/10" aria-label={t("typing")}>
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
            <div className="flex gap-2 overflow-x-auto border-t border-border/60 bg-background px-3 pb-1 pt-2 [scrollbar-width:none]">
              {GROUPS.map(({ key, icon: Icon }) => (
                <button key={key} type="button" onClick={() => ask(t(`groups.${key}.p1`))} className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-primary hover:text-primary-foreground">
                  <Icon className="size-3.5" />
                  {t(`groups.${key}.title`)}
                </button>
              ))}
            </div>
          )}

          {/* Sticky composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); ask(input); }}
            className="sticky bottom-0 bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur"
          >
            <div className="flex items-end gap-2 rounded-full border border-border bg-card p-1.5 pl-4 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/15">
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
                className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
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
