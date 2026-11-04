import { api } from "./api";

export const NOTE_COLORS = ["paper", "lilac", "mint", "peach", "aqua", "rose"] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

export type NoteContext = { type?: string; slug?: string; title?: string; url?: string };
export type Note = {
  _id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  context?: NoteContext;
  createdAt: string;
  updatedAt: string;
};
export type NoteInput = { title?: string; content: string; color?: NoteColor; pinned?: boolean; context?: NoteContext };
export type NoteQuery = {
  q?: string;
  color?: NoteColor;
  pinned?: "true" | "false";
  sort?: "updated" | "created" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};
export type NoteList = { items: Note[]; total: number; page: number; pages: number };

export const noteService = {
  list: async (query: NoteQuery = {}) => {
    const params = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== ""));
    return (await api.get<NoteList>("/notes", { params })).data;
  },
  create: async (body: NoteInput) => (await api.post<{ item: Note }>("/notes", body)).data.item,
  update: async (id: string, body: Partial<NoteInput>) => (await api.patch<{ item: Note }>(`/notes/${id}`, body)).data.item,
  pin: async (id: string) => (await api.patch<{ item: Note }>(`/notes/${id}/pin`)).data.item,
  remove: async (id: string) => (await api.delete(`/notes/${id}`)).data,
  bulkRemove: async (ids: string[]) => (await api.post<{ deleted: number }>("/notes/bulk-delete", { ids })).data,
};

export const noteColorClass: Record<NoteColor, string> = {
  paper: "bg-card text-card-foreground",
  lilac: "bg-lilac text-ink",
  mint: "bg-mint text-ink",
  peach: "bg-peach text-ink",
  aqua: "bg-aqua text-ink",
  rose: "bg-[#f9d4dc] text-ink",
};
