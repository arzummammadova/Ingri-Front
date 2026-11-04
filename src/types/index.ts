export type User = {
  id: string;
  name: string;
  email: string;
  bio: string;
  level: string;
  levels: string[];
  activeLevel: string;
  placementCompleted: boolean;
  suggestedLevel: string;
  plans: { level: string; dailyMinutes: number; targetLevel: string; targetDate: string }[];
  learningGoals: string[];
  avatarType: "preset" | "upload" | "none";
  avatarPreset: string;
  avatarUrl: string;
  role: "user" | "admin";
  isVerified: boolean;
  xp: number;
  streak: number;
  totalMinutes: number;
  dailyMinutes: { date: string; minutes: number }[];
  city: string;
  locale: "az" | "en";
  lastActiveDate: string;
  longestStreak?: number;
  timezone?: string;
  preferences?: { theme?: "light" | "dark" | "system"; accent?: "ink" | "lilac" | "aqua" | "peach" | "mint" | "rose" | "blue"; fontSize?: "small" | "normal" | "large"; reducedMotion?: boolean; sound?: boolean; volume?: number; updatedAt?: number };
};

export type Peer = {
  id: string;
  name: string;
  level: string;
  avatarType: User["avatarType"];
  avatarPreset: string;
  avatarUrl: string;
  xp: number;
  streak: number;
  totalMinutes: number;
  city: string;
  rank: number;
};

export type Sentence = { en: string; az: string; speaker?: string };
export type Glossary = { en: string; az: string; ipa: string };

export type Podcast = {
  slug: string;
  title: string;
  titleAz: string;
  level: string;
  minutes: number;
  accent: "lilac" | "mint" | "peach" | "aqua";
  summary: string;
  summaryAz: string;
  sentences: Sentence[];
  glossary: Glossary[];
  quiz?: QuizQuestion[];
  audioUrl?: string;
  transcriptAvailable?: boolean;
  alsoFor?: string[];
};

export type QuizQuestion = {
  prompt: string;
  promptAz: string;
  options: string[];
  answer: number;
  explain?: string;
  explainAz?: string;
};

export type GrammarLesson = {
  slug: string;
  title: string;
  titleAz: string;
  level: string;
  minutes: number;
  accent: Podcast["accent"];
  explanation: string;
  explanationAz: string;
  rules: string[];
  rulesAz: string[];
  examples: { en: string; az: string }[];
  quiz: QuizQuestion[];
};

export type ListeningItem = {
  slug: string;
  title: string;
  titleAz: string;
  level: string;
  minutes: number;
  accent: Podcast["accent"];
  lines: Sentence[];
  questions: QuizQuestion[];
};

export type SpeakingItem = {
  slug: string;
  category: string;
  categoryAz: string;
  en: string;
  az: string;
  tip: string;
  tipAz: string;
  level: string;
};

export type Word = {
  slug: string;
  en: string;
  az: string;
  ipa: string;
  pos?: string;
  unit?: number;
  rank?: number;
  example: string;
  exampleAz: string;
  category: string;
  categoryAz: string;
  level?: string;
};

export type VideoItem = {
  slug: string;
  title: string;
  channel: string;
  level: string;
  skill: string;
  topic: string;
  minutes: number;
  youtubeId: string;
};

export type MovieItem = {
  slug: string;
  title: string;
  year?: number;
  level: string;
  why: string;
  whyAz: string;
  vocabulary: { en: string; az: string }[];
  trailerId: string;
  imdb: string;
  justwatch: string;
};

export type BookItem = {
  slug: string;
  title: string;
  author: string;
  year?: number;
  level: string;
  description: string;
  descriptionAz: string;
  sourceUrl: string;
  downloadUrl: string;
  chapters: { title: string; text: string }[];
};

export type SkillSeconds = Record<"listening" | "reading" | "speaking" | "grammar" | "words", number>;

export type Progress = {
  completed: string[];
  quizScores: Record<string, number>;
  wordStatus: Record<string, "new" | "learning" | "known">;
  podcastSeconds: Record<string, number>;
  listeningScores: Record<string, number>;
  speakingBest: Record<string, number>;
  tasks: { key: string; done: boolean }[];
  podcastQuiz?: Record<string, number>;
  favoriteWords?: string[];
  watchedVideos?: string[];
  watchedMovies?: string[];
  items?: Record<string, ProgressItem>;
  time?: {
    total: SkillSeconds;
    today: SkillSeconds;
    week: SkillSeconds;
    byLevel: Record<string, { total: SkillSeconds; today: SkillSeconds; week: SkillSeconds }>;
  };
  user: User;
};

export type ApiError = { code?: string; details?: { path: string; type: string }[] };

export type ItemKind = "video" | "movie" | "podcast" | "book" | "chapter" | "grammar" | "listening" | "speaking";
export type ProgressItem = { kind: ItemKind; slug: string; level?: string; percent: number; completed: boolean; completedAt?: string };
export type ProgressSummary = {
  byKind: Record<string, number>;
  byLevel: Record<string, Record<string, number>>;
  totals: Record<string, Record<string, number>>;
  recent: ProgressItem[];
  inProgress: number;
};
