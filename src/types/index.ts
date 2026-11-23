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
  gender?: "female" | "male" | "";
  role: "user" | "admin";
  isVerified: boolean;
  xp: number;
  streak: number;
  totalMinutes: number;
  dailyMinutes: { date: string; minutes: number }[];
  city: string;
  locale: "az" | "en" | "ru";
  username?: string;
  authProvider?: "local" | "google";
  lastActiveDate: string;
  longestStreak?: number;
  timezone?: string;
  reminders?: { email: boolean; asked: boolean; hour: number };
  preferences?: { theme?: "light" | "dark" | "system"; accent?: "ink" | "lilac" | "aqua" | "peach" | "mint" | "rose" | "blue"; fontSize?: "small" | "normal" | "large"; reducedMotion?: boolean; sound?: boolean; volume?: number; updatedAt?: number };
};

export type Peer = {
  id: string;
  name: string;
  level: string;
  avatarType: User["avatarType"];
  avatarPreset: string;
  avatarUrl: string;
  gender?: "female" | "male" | "";
  xp: number;
  streak: number;
  totalMinutes: number;
  city: string;
  rank: number;
};

export type Sentence = { en: string; az: string; speaker?: string; start?: number; end?: number };
export type Glossary = { en: string; az: string; ipa: string; example?: string };

/** Sequential path state the API adds for signed-in users (podcast, grammar, listening, speaking). */
export type LockInfo = { reason: "previous" | "level"; prev: { slug: string; title: string; titleAz?: string } | null; level?: string; gate?: LevelGate | null; ratio?: number };
/** Progress of the previous level toward opening a locked level (server: LEVEL_UNLOCK_RATIO of its items). */
export type LevelGate = { level: string; done: number; required: number };
export type PathFlags = { locked?: boolean; current?: boolean; completed?: boolean; lock?: LockInfo };

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
  publishedAt?: string;
  durationSec?: number;
} & PathFlags;

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
} & PathFlags;

export type ListeningItem = {
  slug: string;
  title: string;
  titleAz: string;
  level: string;
  minutes: number;
  accent: Podcast["accent"];
  lines: Sentence[];
  questions: QuizQuestion[];
} & PathFlags;

export type SpeakingItem = {
  slug: string;
  category: string;
  categoryAz: string;
  en: string;
  az: string;
  tip: string;
  tipAz: string;
  level: string;
} & PathFlags;

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

export type UserFlashcard = {
  _id: string;
  word: string;
  translation: string;
  example: string;
  category: string;
  status: "new" | "learning" | "known";
  createdAt: string;
};
