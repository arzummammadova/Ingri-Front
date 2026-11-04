"use client";

import { NotebookPen, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNoteMutations, useNotes } from "@/hooks/useNotes";
import { noteColorClass, type NoteColor } from "@/services/noteService";
import NoteColorPicker from "./NoteColorPicker";
import { notify } from "@/lib/toast";

function pageContext(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const title = typeof document !== "undefined" ? document.title.split("|")[0].trim() : "";
  return { type: parts[0] || "dashboard", slug: parts[1] || "", title: title.slice(0, 200), url: pathname.slice(0, 400) || "/" };
}

export default function NotesPanel() {
  const t = useTranslations("notes");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteColor>("lilac");
  const recent = useNotes({ limit: 5 });
  const { create } = useNoteMutations();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname.startsWith(routes.notes) || pathname.startsWith(routes.onboarding)) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    create.mutate(
      { title: title.trim(), content: content.trim(), color, context: pageContext(pathname) },
      { onSuccess: () => { setTitle(""); setContent(""); notify.success(t("saved")); }, onError: () => notify.error(t("error")) },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("open")}
        className="fixed right-0 top-1/2 z-nav flex -translate-y-1/2 items-center gap-2 rounded-l-lg bg-sidebar px-2 py-3 text-sidebar-foreground shadow-soft transition duration-200 ease-fluid hover:pr-3 [writing-mode:vertical-rl]"
      >
        <NotebookPen className="size-4 rotate-90" />
        <span className="text-xs font-bold tracking-wide">{t("tab")}</span>
      </button>

      <div
        className={cn("fixed inset-0 z-overlay bg-ink/40 transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("panelTitle")}
        className={cn(
          "fixed inset-y-0 right-0 z-overlay flex w-full max-w-sm flex-col gap-4 overflow-y-auto border-l border-border bg-background p-5 shadow-soft transition-transform duration-300 ease-fluid",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("panelTitle")}</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label={t("close")}>
            <X className="size-5" />
          </Button>
        </div>
        <form onSubmit={save} className={cn("grid gap-3 rounded-xl p-4 shadow-soft", noteColorClass[color])}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("titlePlaceholder")} maxLength={120} />
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t("contentPlaceholder")} rows={5} maxLength={5000} required />
          <NoteColorPicker value={color} onChange={setColor} />
          <p className="truncate text-xs opacity-70">{t("attached")}: {pathname}</p>
          <Button type="submit" disabled={create.isPending || !content.trim()}>
            {create.isPending ? t("saving") : t("save")}
          </Button>
        </form>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">{t("recent")}</h3>
          <Link href={routes.notes} onClick={() => setOpen(false)} className="text-sm font-semibold underline-offset-4 hover:underline">
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid gap-2">
          {recent.isLoading && [0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-card" />)}
          {recent.data?.items.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
          {recent.data?.items.map((n) => (
            <article key={n._id} className={cn("rounded-lg p-3 text-sm", noteColorClass[n.color])}>
              {n.title && <p className="font-semibold">{n.title}</p>}
              <p className="line-clamp-2 opacity-80">{n.content}</p>
            </article>
          ))}
        </div>
      </aside>
    </>
  );
}
