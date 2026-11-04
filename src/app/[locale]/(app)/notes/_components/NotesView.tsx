"use client";

import { CheckSquare, Pencil, Pin, PinOff, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Container, SectionTitle } from "@/ui/components/primitives";
import NoteColorPicker from "@/ui/components/NoteColorPicker";
import { cn } from "@/lib/utils";
import { useNoteMutations, useNotes } from "@/hooks/useNotes";
import { NOTE_COLORS, noteColorClass, type Note, type NoteColor } from "@/services/noteService";

type Draft = { id?: string; title: string; content: string; color: NoteColor };

export default function NotesView() {
  const t = useTranslations("notes");
  const locale = useLocale();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [color, setColor] = useState<NoteColor | "">("");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [sort, setSort] = useState<"updated" | "created" | "title">("updated");
  const [page, setPage] = useState(1);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirm, setConfirm] = useState<string[] | null>(null);

  useEffect(() => {
    const id = setTimeout(() => { setDebounced(q.trim()); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [q]);

  const notes = useNotes({
    q: debounced || undefined,
    color: color || undefined,
    pinned: pinnedOnly ? "true" : undefined,
    sort,
    order: sort === "title" ? "asc" : "desc",
    page,
    limit: 24,
  });
  const m = useNoteMutations();
  const items = notes.data?.items ?? [];

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const saveDraft = () => {
    if (!draft || !draft.content.trim()) return;
    const body = { title: draft.title.trim(), content: draft.content.trim(), color: draft.color };
    const done = { onSuccess: () => setDraft(null) };
    if (draft.id) m.update.mutate({ id: draft.id, body }, done);
    else m.create.mutate(body, done);
  };
  const doDelete = () => {
    if (!confirm) return;
    const ids = confirm;
    const after = { onSuccess: () => { setConfirm(null); setSelected((s) => s.filter((x) => !ids.includes(x))); } };
    if (ids.length === 1) m.remove.mutate(ids[0], after);
    else m.bulkRemove.mutate(ids, after);
  };
  const fmt = (d: string) => new Date(d).toLocaleDateString(locale === "az" ? "az-AZ" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionTitle kicker={t("kicker")} title={t("title")} text={t("text")} />
        <Button onClick={() => setDraft({ title: "", content: "", color: "lilac" })}>
          <Plus className="size-4" /> {t("new")}
        </Button>
      </div>

      <div className="glass mb-6 grid gap-3 rounded-xl p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1); }}
            className="h-9 rounded-full border border-border bg-card px-3 text-xs font-semibold"
            aria-label={t("sort")}
          >
            <option value="updated">{t("sortUpdated")}</option>
            <option value="created">{t("sortCreated")}</option>
            <option value="title">{t("sortTitle")}</option>
          </select>
          <Button size="sm" variant={pinnedOnly ? "peach" : "outline"} onClick={() => { setPinnedOnly((v) => !v); setPage(1); }}>
            <Pin className="size-3.5" /> {t("pinned")}
          </Button>
          <Button size="sm" variant={selecting ? "lilac" : "outline"} onClick={() => { setSelecting((v) => !v); setSelected([]); }}>
            <CheckSquare className="size-3.5" /> {selecting ? t("cancelSelect") : t("select")}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:col-span-2">
          <span className="text-xs font-semibold text-muted-foreground">{t("color")}:</span>
          <button type="button" onClick={() => { setColor(""); setPage(1); }} className={cn("rounded-full border border-border px-3 py-1 text-xs font-semibold", !color && "bg-primary text-primary-foreground")}>
            {t("all")}
          </button>
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={t(`colors.${c}`)}
              title={t(`colors.${c}`)}
              onClick={() => { setColor(c); setPage(1); }}
              className={cn("size-7 rounded-full border border-border", noteColorClass[c], color === c && "ring-2 ring-ring ring-offset-2 ring-offset-background")}
            />
          ))}
        </div>
      </div>

      {selecting && (
        <div className="glass sticky top-24 z-10 mb-4 flex flex-wrap items-center gap-3 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold">{t("selectedCount", { count: selected.length })}</span>
          <Button size="sm" variant="ghost" onClick={() => setSelected(selected.length === items.length ? [] : items.map((n) => n._id))}>
            {selected.length === items.length && items.length ? t("clearAll") : t("selectAll")}
          </Button>
          <Button size="sm" className="ml-auto bg-danger text-white" disabled={!selected.length} onClick={() => setConfirm(selected)}>
            <Trash2 className="size-3.5" /> {t("deleteSelected")}
          </Button>
        </div>
      )}

      {notes.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-xl bg-card" />)}
        </div>
      ) : notes.isError ? (
        <div className="glass rounded-xl p-6">
          <p>{t("error")}</p>
          <Button className="mt-4" onClick={() => notes.refetch()}>{t("retry")}</Button>
        </div>
      ) : items.length === 0 ? (
        <div className="glass grid place-items-center gap-4 rounded-xl p-10 text-center">
          <svg viewBox="0 0 120 100" className="w-32" aria-hidden="true">
            <rect x="18" y="14" width="70" height="78" rx="12" className="fill-lilac" />
            <rect x="32" y="8" width="70" height="78" rx="12" className="fill-mint" />
            <path d="M46 32h42M46 46h42M46 60h26" className="stroke-ink" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <p className="font-semibold">{debounced || color || pinnedOnly ? t("noResults") : t("emptyTitle")}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{t("emptyText")}</p>
          <Button onClick={() => setDraft({ title: "", content: "", color: "lilac" })}><Plus className="size-4" /> {t("new")}</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((n: Note) => {
            const isSel = selected.includes(n._id);
            return (
              <article
                key={n._id}
                onClick={selecting ? () => toggle(n._id) : undefined}
                className={cn(
                  "group relative flex min-h-44 flex-col gap-2 rounded-xl p-5 shadow-soft transition duration-200 ease-fluid hover:-translate-y-0.5",
                  noteColorClass[n.color],
                  selecting && "cursor-pointer",
                  isSel && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                )}
              >
                <div className="flex items-start gap-2">
                  {selecting && (
                    <input type="checkbox" checked={isSel} onChange={() => toggle(n._id)} onClick={(e) => e.stopPropagation()} className="mt-1 size-4" aria-label={t("select")} />
                  )}
                  <h3 className="flex-1 font-semibold leading-snug">{n.title || t("untitled")}</h3>
                  {n.pinned && <Pin className="size-4 fill-current" aria-label={t("pinned")} />}
                </div>
                <p className="line-clamp-6 whitespace-pre-wrap text-sm opacity-85">{n.content}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs opacity-70">
                  <span>{fmt(n.updatedAt)}</span>
                  {n.context?.url && (
                    <Link href={n.context.url} onClick={(e) => e.stopPropagation()} className="truncate underline-offset-2 hover:underline">
                      · {n.context.title || n.context.url}
                    </Link>
                  )}
                </div>
                {!selecting && (
                  <div className="flex items-center gap-1 pt-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    <Button size="sm" variant="ghost" onClick={() => m.pin.mutate(n._id)} aria-label={n.pinned ? t("unpin") : t("pin")}>
                      {n.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDraft({ id: n._id, title: n.title, content: n.content, color: n.color })} aria-label={t("edit")}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirm([n._id])} aria-label={t("delete")}>
                      <Trash2 className="size-4" />
                    </Button>
                    <div className="ml-auto flex gap-1">
                      {NOTE_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-label={t(`colors.${c}`)}
                          onClick={() => c !== n.color && m.update.mutate({ id: n._id, body: { color: c } })}
                          className={cn("size-4 rounded-full border border-ink/20", noteColorClass[c])}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {notes.data && notes.data.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t("prev")}</Button>
          <span className="text-sm font-semibold">{page} / {notes.data.pages}</span>
          <Button size="sm" variant="outline" disabled={page >= notes.data.pages} onClick={() => setPage((p) => p + 1)}>{t("next")}</Button>
        </div>
      )}

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          <DialogTitle>{draft?.id ? t("editTitle") : t("new")}</DialogTitle>
          {draft && (
            <form onSubmit={(e) => { e.preventDefault(); saveDraft(); }} className={cn("mt-4 grid gap-3 rounded-xl p-4", noteColorClass[draft.color])}>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={t("titlePlaceholder")} maxLength={120} />
              <Textarea value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} placeholder={t("contentPlaceholder")} rows={8} maxLength={5000} required />
              <NoteColorPicker value={draft.color} onChange={(c) => setDraft({ ...draft, color: c })} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDraft(null)}>{t("cancel")}</Button>
                <Button type="submit" disabled={!draft.content.trim() || m.create.isPending || m.update.isPending}>{t("save")}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogTitle>{t("confirmTitle")}</DialogTitle>
          <p className="mt-2 text-sm text-muted-foreground">{t("confirmText", { count: confirm?.length ?? 0 })}</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)}><X className="size-4" /> {t("cancel")}</Button>
            <Button className="bg-danger text-white" disabled={m.remove.isPending || m.bulkRemove.isPending} onClick={doDelete}>
              <Trash2 className="size-4" /> {t("delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
