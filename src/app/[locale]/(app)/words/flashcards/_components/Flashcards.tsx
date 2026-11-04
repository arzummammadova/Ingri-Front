"use client";

import { useEffect, useMemo, useState } from "react";
import { useExitGuard } from "@/ui/components/ExitGuard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Check, Volume2, X } from "lucide-react";
import { contentService, flashcardService, progressService } from "@/services/contentService";
import { useProgress } from "@/hooks/useProgress";
import { Button } from "@/components/ui/button";
import QueryState from "@/ui/components/QueryState";
import { SectionTitle } from "@/ui/components/primitives";
import { speak } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import MyCards from "./MyCards";

type Card = { id: string; front: string; back: string; example?: string; kind: "word" | "mine" };
type DeckType = "all" | "level" | "category" | "mine" | "wrong";
type Session = { ids: string[]; index: number; known: string[]; unknown: string[]; label: string };
const KEY = "ingri:flash:session";
const COUNTS = [10, 20, 30];

const loadSession = (): Session | null => {
  try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return s && Array.isArray(s.ids) && s.ids.length ? s : null; } catch { return null; }
};
const storeSession = (s: Session | null) => { try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); } catch {} };
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export default function Flashcards() {
  const t = useTranslations("words");
  const f = useTranslations("flash");
  const common = useTranslations("common");
  const client = useQueryClient();
  const words = useQuery({ queryKey: ["words"], queryFn: contentService.words });
  const mine = useQuery({ queryKey: ["my-flashcards"], queryFn: flashcardService.list });
  const progress = useProgress();

  const cards = useMemo(() => {
    const map = new Map<string, Card & { level?: string; category?: string; wrong?: boolean }>();
    const status = progress.data?.wordStatus || {};
    for (const w of words.data || []) map.set(`w:${w.slug}`, { id: `w:${w.slug}`, front: w.en, back: w.az, example: w.exampleAz, kind: "word", level: w.level, category: w.categoryAz || w.category, wrong: status[w.slug] === "learning" });
    for (const c of mine.data || []) map.set(`m:${c._id}`, { id: `m:${c._id}`, front: c.word, back: c.translation, example: c.example, kind: "mine", category: c.category, wrong: c.status === "learning" });
    return map;
  }, [words.data, mine.data, progress.data]);

  const [deck, setDeck] = useState<DeckType>("all");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [count, setCount] = useState(20);
  const [custom, setCustom] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [resume, setResume] = useState<Session | null>(null);
  const [summary, setSummary] = useState<null | { known: string[]; unknown: string[]; points: number }>(null);
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { setResume(loadSession()); }, []);

  const all = [...cards.values()];
  const levels = [...new Set(all.map((c) => c.level).filter(Boolean) as string[])].sort();
  const categories = [...new Set(all.map((c) => c.category).filter(Boolean) as string[])].sort();
  const pool = all.filter((c) =>
    deck === "mine" ? c.kind === "mine" : deck === "wrong" ? c.wrong : deck === "level" ? (!level || c.level === level) && c.kind === "word" : deck === "category" ? !category || c.category === category : c.kind === "word",
  );
  const wanted = Math.max(1, Math.min(500, custom ? Number.parseInt(custom, 10) || 20 : count));

  const start = (ids: string[], label: string) => {
    if (!ids.length) return;
    const s = { ids, index: 0, known: [], unknown: [], label };
    setSession(s); storeSession(s); setSummary(null); setResume(null); setFlipped(false);
    playSound("next");
  };
  const deckLabel = deck === "level" ? `${f("deckLevel")}${level ? `: ${level}` : ""}` : deck === "category" ? `${f("deckCategory")}${category ? `: ${category}` : ""}` : f(({ all: "deckAll", mine: "deckMine", wrong: "deckWrong" } as const)[deck as "all" | "mine" | "wrong"]);

  const finish = async (s: Session) => {
    storeSession(null);
    setSession(null);
    let points = 0;
    try {
      const r = await progressService.flashcards(s.ids.length);
      points = r.awarded || 0;
      client.invalidateQueries({ queryKey: ["me"] });
    } catch {}
    playSound("fanfare");
    setSummary({ known: s.known, unknown: s.unknown, points });
  };

  const answer = (knows: boolean) => {
    if (!session) return;
    const card = cards.get(session.ids[session.index]);
    playSound(knows ? "correct" : "wrong");
    if (card) {
      const st = knows ? "known" : "learning";
      const p = card.kind === "word" ? progressService.word(card.id.slice(2), st) : flashcardService.update(card.id.slice(2), { status: st });
      p.then(() => client.invalidateQueries({ queryKey: [card.kind === "word" ? "progress" : "my-flashcards"] })).catch(() => undefined);
    }
    const next: Session = {
      ...session,
      index: session.index + 1,
      known: knows ? [...session.known, session.ids[session.index]] : session.known,
      unknown: knows ? session.unknown : [...session.unknown, session.ids[session.index]],
    };
    setFlipped(false);
    if (next.index >= next.ids.length) void finish(next);
    else { setSession(next); storeSession(next); } // only seen cards are saved; not complete until the end
  };

  // Leaving mid-session asks first and never marks it complete (progress stays resumable).
  useExitGuard(!!session && session.index < session.ids.length);

  const loading = words.isLoading || mine.isLoading;
  const card = session ? cards.get(session.ids[session.index]) : undefined;
  const say = (e: React.SyntheticEvent, text: string) => { e.stopPropagation(); speak(text, 0.9, { respectSound: true }); };
  const chip = (active: boolean) => cn("rounded-full border px-3.5 py-2 text-sm font-semibold transition", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted");
  const selectCls = "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm";

  return (
    <QueryState isLoading={loading} isError={words.isError} onRetry={() => words.refetch()}>
      <SectionTitle title={t("cardsTitle")} text={t("cardsText")} />

      {summary && (
        <div className="mx-auto grid w-full max-w-md gap-4 text-center">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold">{f("summaryTitle")}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-mint p-3 text-ink"><p className="text-2xl font-bold">{summary.known.length}</p><p className="text-xs font-semibold">{f("known")}</p></div>
              <div className="rounded-xl bg-peach p-3 text-ink"><p className="text-2xl font-bold">{summary.unknown.length}</p><p className="text-xs font-semibold">{f("unknown")}</p></div>
            </div>
            <p className="mt-4 font-semibold">{summary.points ? f("points", { points: summary.points }) : <span className="text-sm text-muted-foreground">{f("noPoints")}</span>}</p>
            {summary.unknown.length > 0 && (
              <ul className="mt-4 grid gap-1 text-left text-sm">
                {summary.unknown.map((id) => { const c = cards.get(id); return c ? <li key={id} className="rounded-lg bg-muted px-3 py-1.5"><b>{c.front}</b> — {c.back}</li> : null; })}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {summary.unknown.length > 0 && <Button variant="peach" onClick={() => start(shuffle(summary.unknown), f("reviewWrong"))}>{f("reviewWrong")}</Button>}
            <Button onClick={() => setSummary(null)}>{f("again")}</Button>
          </div>
        </div>
      )}

      {!summary && !session && (
        <div className="mx-auto grid w-full max-w-2xl gap-5">
          {resume && (
            <div className="rounded-2xl bg-aqua p-5 text-ink">
              <h2 className="font-semibold">{f("resumeTitle")} · {resume.label}</h2>
              <p className="text-sm">{f("resumeText", { done: resume.index, total: resume.ids.length })}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => { const ids = resume.ids.filter((id) => cards.has(id)); const s = { ...resume, ids }; if (s.index >= ids.length) { void finish(s); return; } setSession(s); setResume(null); }}>{f("resume")}</Button>
                <Button size="sm" variant="outline" onClick={() => { storeSession(null); setResume(null); }}>{f("discard")}</Button>
              </div>
            </div>
          )}
          <section className="glass grid gap-4 rounded-2xl p-5">
            <div><h2 className="font-semibold">{f("setupTitle")}</h2><p className="text-sm text-muted-foreground">{f("setupText")}</p></div>
            <div className="grid gap-2">
              <p className="text-sm font-semibold">{f("deck")}</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "level", "category", "mine", "wrong"] as const).map((d) => (
                  <button key={d} type="button" data-sound="click" onClick={() => setDeck(d)} className={chip(deck === d)} aria-pressed={deck === d}>
                    {f(({ all: "deckAll", level: "deckLevel", category: "deckCategory", mine: "deckMine", wrong: "deckWrong" } as const)[d])}
                  </button>
                ))}
              </div>
              {deck === "level" && (
                <select aria-label={f("level")} className={selectCls} value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="">{f("level")}: —</option>
                  {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              )}
              {deck === "category" && (
                <select aria-label={f("category")} className={selectCls} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">{f("category")}: —</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
            <div className="grid gap-2">
              <p className="text-sm font-semibold">{f("count")}</p>
              <div className="flex flex-wrap items-center gap-2">
                {COUNTS.map((n) => (
                  <button key={n} type="button" data-sound="click" onClick={() => { setCount(n); setCustom(""); }} className={chip(!custom && count === n)} aria-pressed={!custom && count === n}>{n}</button>
                ))}
                <input type="number" min={1} max={500} inputMode="numeric" placeholder={f("custom")} aria-label={f("custom")} value={custom} onChange={(e) => setCustom(e.target.value)} className={cn("h-10 w-24 rounded-full border bg-card px-3 text-sm", custom ? "border-primary" : "border-border")} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{pool.length ? f("available", { count: pool.length }) : f("empty")}</p>
            <Button disabled={!pool.length} onClick={() => start(shuffle(pool).slice(0, wanted).map((c) => c.id), deckLabel)}>{f("start")} · {Math.min(wanted, pool.length)}</Button>
          </section>
          <MyCards cards={mine.data || []} />
        </div>
      )}

      {session && card && (
        <div className="mx-auto grid w-full max-w-md gap-4">
          <div className="grid gap-1.5">
            <p className="text-center text-xs font-semibold text-muted-foreground">{session.label} · {session.index + 1} / {session.ids.length}</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(session.index / session.ids.length) * 100}%` }} /></div>
          </div>
          <div className="flip-scene">
            <div
              role="button"
              tabIndex={0}
              aria-pressed={flipped}
              aria-label={f("flipHint")}
              onClick={() => { setFlipped((v) => !v); playSound("click"); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((v) => !v); } }}
              className={cn("flip-card relative min-h-72 cursor-pointer select-none", flipped && "is-flipped")}
            >
              <div className="flip-face glass absolute inset-0 grid place-items-center rounded-2xl p-8 text-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{f("flipHint")}</p>
                  <button type="button" onClick={(e) => say(e, card.front)} className="mt-6 inline-flex items-center gap-2 rounded-xl px-3 py-1 text-display font-semibold transition hover:bg-lilac/40">
                    {card.front}<Volume2 className="size-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="flip-face flip-back absolute inset-0 grid place-items-center rounded-2xl bg-lilac p-8 text-center text-ink shadow-soft">
                <div>
                  <p className="text-sm font-semibold opacity-80">{card.front}</p>
                  <p className="mt-3 text-display font-semibold">{card.back}</p>
                  {card.example && <p className="mt-3 text-sm opacity-80">{card.example}</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="peach" onClick={() => answer(false)}><X className="size-4" />{f("dontKnow")}</Button>
            <Button variant="mint" onClick={() => answer(true)}><Check className="size-4" />{f("know")}</Button>
          </div>
          <Button variant="outline" onClick={() => speak(card.front, 0.9, { respectSound: true })}><Volume2 className="size-4" />{common("pronounce")}</Button>
        </div>
      )}
    </QueryState>
  );
}
