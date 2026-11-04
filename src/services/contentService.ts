import { api } from "./api";
import type { GrammarLesson, ListeningItem, Peer, Podcast, Progress, SpeakingItem, User, Word } from "@/types";

const list = async <T>(path: string) => (await api.get<{ items: T[] }>(path)).data.items;
const one = async <T>(path: string) => (await api.get<{ item: T }>(path)).data.item;

export const contentService = {
  podcasts: () => list<Podcast>("/podcasts"),
  podcast: (slug: string) => one<Podcast>(`/podcasts/${slug}`),
  grammar: () => list<GrammarLesson>("/grammar"),
  grammarOne: (slug: string) => one<GrammarLesson>(`/grammar/${slug}`),
  listening: () => list<ListeningItem>("/listening"),
  listeningOne: (slug: string) => one<ListeningItem>(`/listening/${slug}`),
  speaking: () => list<SpeakingItem>("/speaking"),
  speakingOne: (slug: string) => one<SpeakingItem>(`/speaking/${slug}`),
  words: () => list<Word>("/words"),
  word: (slug: string) => one<Word>(`/words/${slug}`),
  leaders: () => list<Peer>("/leaderboard"),
  leader: (id: string) => one<Peer>(`/leaderboard/${id}`),
  videos: () => list<import("@/types").VideoItem>("/videos"),
  video: (slug: string) => one<import("@/types").VideoItem>(`/videos/${slug}`),
  movies: () => list<import("@/types").MovieItem>("/movies"),
  movie: (slug: string) => one<import("@/types").MovieItem>(`/movies/${slug}`),
  books: () => list<import("@/types").BookItem>("/books"),
  book: (slug: string) => one<import("@/types").BookItem>(`/books/${slug}`),
  lookup: async (q: string) => (await api.get<{ item: import("@/types").Word | null }>(`/words/lookup?q=${encodeURIComponent(q)}`)).data.item,
};

export type PointsSummary = {
  total: number;
  level: { level: number; into: number; next: number; percent: number };
  rules: { source: string; points: number; note: string; variable?: boolean }[];
  breakdown: { source: string; points: number; count: number }[];
  history: { source: string; points: number; ref: string; at: string }[];
};

export const progressService = {
  get: async () => (await api.get<Progress>("/progress")).data,
  points: async () => (await api.get<PointsSummary>("/progress/points")).data,
  flashcards: async (cards: number) => (await api.post<{ awarded: number }>("/progress/flashcards", { cards })).data,
  podcast: (body: { slug: string; seconds: number; completed: boolean }) =>
    api.post<Progress>("/progress/podcast", body).then((r) => r.data),
  quiz: (slug: string, score: number) => api.post<Progress>("/progress/quiz", { slug, score }).then((r) => r.data),
  listening: (slug: string, score: number) =>
    api.post<QuizResult>("/progress/listening", { slug, score }).then((r) => r.data),
  speaking: (slug: string, score: number) =>
    api.post<Progress>("/progress/speaking", { slug, score }).then((r) => r.data),
  word: (slug: string, status: string) => api.post<Progress>("/progress/word", { slug, status }).then((r) => r.data),
  task: (key: string, done: boolean) => api.post<Progress>("/progress/task", { key, done }).then((r) => r.data),
  podcastQuiz: (slug: string, score: number) =>
    api.post<QuizResult>("/progress/podcast-quiz", { slug, score }).then((r) => r.data),
  time: (body: { skill: string; seconds: number; level: string }) =>
    api.post<Progress>("/progress/time", body).then((r) => r.data),
  watch: (kind: "video" | "movie", id: string) => api.post<Progress>("/progress/watch", { kind, id }).then((r) => r.data),
  favorite: (slug: string) => api.post<Progress>("/progress/favorite", { slug }).then((r) => r.data),
  item: (body: { kind: import("@/types").ItemKind; slug: string; level?: string; percent: number; completed?: boolean }) =>
    api.post<Progress & { justCompleted?: boolean }>("/progress/item", body).then((r) => r.data),
  summary: async () => (await api.get<import("@/types").ProgressSummary>("/progress/summary")).data,
};

export const profileService = {
  update: async (body: Partial<User> & { learningGoals?: string[] }) =>
    (await api.patch<{ user: User }>("/profile", body)).data.user,
  preset: async (preset: string) => (await api.post<{ user: User }>("/profile/avatar/preset", { preset })).data.user,
  upload: async (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return (await api.post<{ user: User }>("/profile/avatar", form)).data.user;
  },
  removeAvatar: async () => (await api.delete<{ user: User }>("/profile/avatar")).data.user,
  setLevels: async (body: { levels: string[]; activeLevel?: string; placementCompleted?: boolean; suggestedLevel?: string }) =>
    (await api.patch<{ user: User }>("/profile/levels", body)).data.user,
  setActiveLevel: async (activeLevel: string) =>
    (await api.patch<{ user: User }>("/profile/active-level", { activeLevel })).data.user,
  savePlan: async (body: { level: string; dailyMinutes: number; targetLevel: string; targetDate: string }) =>
    (await api.put<{ user: User }>("/profile/plan", body)).data.user,
};

type CardInput = { word: string; translation: string; example?: string; category?: string };
export const flashcardService = {
  list: async () => (await api.get<{ items: import("@/types").UserFlashcard[] }>("/flashcards")).data.items,
  create: async (body: CardInput) => (await api.post<{ item: import("@/types").UserFlashcard }>("/flashcards", body)).data.item,
  update: async (id: string, body: Partial<CardInput> & { status?: "new" | "learning" | "known" }) =>
    (await api.patch<{ item: import("@/types").UserFlashcard }>(`/flashcards/${id}`, body)).data.item,
  remove: async (id: string) => (await api.delete(`/flashcards/${id}`)).data,
};

export type QuizResult = Progress & { passed?: boolean; awarded?: number; passMark?: number };
export const QUIZ_PASS = 60;
