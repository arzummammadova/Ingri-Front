"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { flashcardService } from "@/services/contentService";
import type { UserFlashcard } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/toast";

type Draft = { word: string; translation: string; example: string; category: string };
const EMPTY: Draft = { word: "", translation: "", example: "", category: "" };

/** CRUD for the user's own cards ("Mənim kartlarım"). */
export default function MyCards({ cards }: { cards: UserFlashcard[] }) {
  const f = useTranslations("flash");
  const client = useQueryClient();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const refresh = () => client.invalidateQueries({ queryKey: ["my-flashcards"] });
  const save = useMutation({
    mutationFn: () => (editing && editing !== "new" ? flashcardService.update(editing, draft) : flashcardService.create(draft)),
    onSuccess: () => { notify.success(f("saved")); setEditing(null); setDraft(EMPTY); refresh(); },
    onError: () => notify.error(f("error")),
  });
  const remove = useMutation({
    mutationFn: (id: string) => flashcardService.remove(id),
    onSuccess: () => { notify.success(f("deleted")); refresh(); },
    onError: () => notify.error(f("error")),
  });
  const open = (card?: UserFlashcard) => {
    setEditing(card ? card._id : "new");
    setDraft(card ? { word: card.word, translation: card.translation, example: card.example || "", category: card.category || "" } : EMPTY);
  };

  const form = (
    <form
      className="grid gap-2 rounded-xl border border-border bg-card p-3"
      onSubmit={(e) => { e.preventDefault(); if (draft.word.trim() && draft.translation.trim()) save.mutate(); }}
    >
      <Input required maxLength={120} placeholder={f("word")} aria-label={f("word")} value={draft.word} onChange={(e) => setDraft({ ...draft, word: e.target.value })} />
      <Input required maxLength={200} placeholder={f("translation")} aria-label={f("translation")} value={draft.translation} onChange={(e) => setDraft({ ...draft, translation: e.target.value })} />
      <Input maxLength={400} placeholder={f("example")} aria-label={f("example")} value={draft.example} onChange={(e) => setDraft({ ...draft, example: e.target.value })} />
      <Input maxLength={60} placeholder={f("categoryOpt")} aria-label={f("categoryOpt")} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>{f("cancel")}</Button>
        <Button type="submit" size="sm" disabled={save.isPending}>{f("save")}</Button>
      </div>
    </form>
  );

  return (
    <section className="glass grid gap-3 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{f("myCards")}</h2>
          <p className="text-sm text-muted-foreground">{f("myCardsText")}</p>
        </div>
        {editing !== "new" && <Button size="sm" variant="lilac" onClick={() => open()}><Plus className="size-4" />{f("add")}</Button>}
      </div>
      {editing === "new" && form}
      {cards.length === 0 && editing !== "new" && <p className="text-sm text-muted-foreground">{f("noCards")}</p>}
      <ul className="grid gap-2">
        {cards.map((card) =>
          editing === card._id ? (
            <li key={card._id}>{form}</li>
          ) : (
            <li key={card._id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{card.word} <span className="font-normal text-muted-foreground">— {card.translation}</span></p>
                {(card.category || card.example) && <p className="truncate text-xs text-muted-foreground">{[card.category, card.example].filter(Boolean).join(" · ")}</p>}
              </div>
              <button type="button" aria-label={f("edit")} title={f("edit")} onClick={() => open(card)} className="grid size-8 place-items-center rounded-full hover:bg-muted"><Pencil className="size-4" /></button>
              <button type="button" aria-label={f("delete")} title={f("delete")} onClick={() => { if (window.confirm(f("confirmDelete"))) remove.mutate(card._id); }} className="grid size-8 place-items-center rounded-full text-danger hover:bg-muted"><Trash2 className="size-4" /></button>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
