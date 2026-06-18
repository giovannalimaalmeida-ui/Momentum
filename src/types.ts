export type PlanType = "free" | "premium";
export type LanguageType = "pt" | "en" | "es";

export interface UserProfile {
  username: string;
  email: string;
  plan: PlanType;
  avatar: string; // url or emoji/preset
  isLogged: boolean;
  isGuest: boolean;
  language?: LanguageType;
  picture?: string;
  xp?: number;
  level?: number;
  theme?: "lavanda" | "menta" | "coral" | "indigo";
  avatar_id?: string;
  onboarded?: boolean;
  daily_goal?: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface NoteTask {
  id: string;
  title: string;
  content: string;
  date: string;
  category: "Todos" | "Trabalho" | "Pessoal" | string;
  isStarred: boolean;
  completed: boolean;
  difficulty?: "facil" | "medio" | "dificil";
  completed_at?: string;
  subtasks: SubTask[];
  aiSuggestions?: string[];
}

export interface PomodoroSession {
  totalDurationSeconds: number;
  remainingSeconds: number;
  isPaused: boolean;
  state: "idle" | "focus" | "paused" | "completed" | "abandoned";
  distractionSeconds: number;
  interruptionClass: "none" | "short" | "medium" | "long" | "abandoned";
  productivityScore: number; // Max 100
  unlockedRewards: string[];
}

export interface DailyTask {
  id: string;
  name: string;
  targetCount: number;
  completedCount: number;
  lastCompletedAt: string | null; // ISO string
}
