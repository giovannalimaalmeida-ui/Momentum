import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Star,
  Check,
  Trash2,
  Brain,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  CalendarCheck,
  Award,
  BookOpen,
  Info,
  Maximize2,
  AlertTriangle,
  FileText,
  BadgeAlert,
  ArrowRight,
  RotateCcw,
  Target
} from "lucide-react";
import OwlLogo from "./OwlLogo";
import { UserProfile, NoteTask, SubTask, PomodoroSession, DailyTask } from "../types";
import { translations } from "../translations";
import WiseOwlChat from "./WiseOwlChat";
import { toast } from "sonner";
import RotatingAdSlot from "./AdSlot";

interface DashboardProps {
  user: UserProfile;
  activeTab: string;
  onOpenPremiumPaywall: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

function AdSlot({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div
      id="sponsored-ad-slot"
      className="w-full bg-gradient-to-r from-amber-50 to-orange-50/20 border border-amber-200/50 rounded-2xl p-3.5 flex items-center justify-between text-left mb-5 relative animate-fadeIn select-none"
    >
      <div className="absolute top-1.5 right-3 text-[7px] text-amber-500 font-extrabold uppercase tracking-wider">
        Patrocinado
      </div>
      
      <div className="flex items-center space-x-3 text-purple-950">
        <span className="text-md">🦉</span>
        <div>
          <span className="text-[10px] font-black block">Momentum Sem Anúncios</span>
          <p className="text-[9px] text-[#777] leading-tight">Remova banners promocionais, ative a IA e altere suas cores.</p>
        </div>
      </div>
      
      <button
        id="ad-upgrade-btn"
        type="button"
        onClick={onUpgrade}
        className="bg-purple-650 hover:bg-purple-750 text-white font-black text-[8px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-xs shrink-0 cursor-pointer"
      >
        Upgrade Premium ⚡
      </button>
    </div>
  );
}

export default function Dashboard({ user, activeTab, onOpenPremiumPaywall, onUpdateUser }: DashboardProps) {
  const isGuest = user.isGuest || !user.email || user.email === "guest@momentum.app";
  // Persistence key
  const notesStorageKey = `momentum_notes_${user.email || "guest"}`;

  const lang = user.language || "pt";
  const t = translations[lang];

  // Map category names dynamically
  const categoryLabels: Record<string, string> = {
    "Todos": t.allCategory,
    "Trabalho": t.workCategory,
    "Pessoal": t.personalCategory,
    "Estudos": t.studyCategory,
    "Concluídas": "Concluídas"
  };

  // State Management
  const [notes, setNotes] = useState<NoteTask[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week">("all");
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<NoteTask> | null>(null);

  // Active Focus Task for Pomodoro Session
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => {
    return localStorage.getItem("momentum_selected_focus_task_id") || null;
  });

  const selectedFocusTask = notes.find((n) => n.id === selectedTaskId) || null;

  const handleSelectFocusTask = (taskId: string | null) => {
    setSelectedTaskId(taskId);
    if (taskId) {
      localStorage.setItem("momentum_selected_focus_task_id", taskId);
      const note = notes.find((n) => n.id === taskId);
      if (note) {
        toast.success(`🎯 Atividade "${note.title}" selecionada para foco no Pomodoro!`);
      }
    } else {
      localStorage.removeItem("momentum_selected_focus_task_id");
    }
  };

  // Automatically clear active focus task if it was completed, deleted or no longer active
  useEffect(() => {
    if (selectedTaskId && notes.length > 0) {
      const isTaskStillActive = notes.some((n) => n.id === selectedTaskId && !n.completed);
      if (!isTaskStillActive) {
        setSelectedTaskId(null);
        localStorage.removeItem("momentum_selected_focus_task_id");
      }
    }
  }, [notes, selectedTaskId]);

  // Advertising states (triggered every 2 newly created tasks)
  const [newTasksSinceAd, setNewTasksSinceAd] = useState(() => {
    const saved = localStorage.getItem("momentum_tasks_since_ad");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [activeAd, setActiveAd] = useState<{ title: string; desc: string; cta: string; emoji: string } | null>(null);

  // Date conversion & helper functions
  const ddmmyyyyToYyyymmdd = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    return dateStr;
  };

  const yyyymmddToDdmmyyyy = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
    }
    return dateStr;
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  };

  const isToday = (dateStr: string) => {
    const d = parseDate(dateStr);
    if (!d) return false;
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (dateStr: string) => {
    const d = parseDate(dateStr);
    if (!d) return false;
    
    const today = new Date();
    const dateTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    
    // Calculate start and end of current week (Monday to Sunday)
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday ...
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + distanceToMonday);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    
    // Normalize times (midnight to end of day)
    const startOfWeek = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()).getTime();
    const endOfWeek = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59).getTime();
    
    return dateTime >= startOfWeek && dateTime <= endOfWeek;
  };

  // New Note default categories
  const categories = ["Todos", "Trabalho", "Pessoal", "Estudos", "Concluídas"];

  // AI Insights State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [compiledInsights, setCompiledInsights] = useState<{
    subtasks?: string[];
    routineRecommendations?: string[];
    predictiveReport?: string;
  } | null>(null);

  // Pomodoro Study Timer State
  const [pomodoro, setPomodoro] = useState<PomodoroSession>({
    totalDurationSeconds: 1500, // 25 mins
    remainingSeconds: 1500,
    isPaused: true,
    state: "idle",
    distractionSeconds: 0,
    interruptionClass: "none",
    productivityScore: 100,
    unlockedRewards: []
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const awayTimestampRef = useRef<number | null>(null);

  // Load Notes
  useEffect(() => {
    const saved = isGuest ? sessionStorage.getItem(notesStorageKey) : localStorage.getItem(notesStorageKey);
    if (saved) {
      try {
        const parsed: NoteTask[] = JSON.parse(saved);
        // Clean out any previously seeded "Estudar Engenharia de Software" note (with id 'seed-1' or similar title)
        const cleaned = parsed.filter(n => {
          if (!n) return false;
          const lowerTitle = n.title ? n.title.toLowerCase() : "";
          const isSeedId = n.id === "seed-1";
          const isSeedTitle = 
            lowerTitle.includes("engenharia de software") || 
            lowerTitle.includes("software engineering") || 
            lowerTitle.includes("ingeniería de software") ||
            (lowerTitle.includes("estudar") && lowerTitle.includes("software")) ||
            (lowerTitle.includes("estudiar") && lowerTitle.includes("software")) ||
            (lowerTitle.includes("study") && lowerTitle.includes("software"));
          
          return !isSeedId && !isSeedTitle;
        });

        if (cleaned.length !== parsed.length) {
          setNotes(cleaned);
          if (isGuest) {
            sessionStorage.setItem(notesStorageKey, JSON.stringify(cleaned));
          } else {
            localStorage.setItem(notesStorageKey, JSON.stringify(cleaned));
          }
        } else {
          setNotes(parsed);
        }
      } catch (e) {
        console.error("Erro ao carregar notas:", e);
      }
    } else {
      // Seed empty note list
      const seed: NoteTask[] = [];
      setNotes(seed);
      if (isGuest) {
        sessionStorage.setItem(notesStorageKey, JSON.stringify(seed));
      } else {
        localStorage.setItem(notesStorageKey, JSON.stringify(seed));
      }
    }
  }, [notesStorageKey, isGuest]);

  // Sync Notes to Local Storage
  const saveNotes = (updated: NoteTask[]) => {
    setNotes(updated);
    if (isGuest) {
      sessionStorage.setItem(notesStorageKey, JSON.stringify(updated));
    } else {
      localStorage.setItem(notesStorageKey, JSON.stringify(updated));
    }
  };

  // --- Daily Tasks (Premium feature) ---
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [newDailyName, setNewDailyName] = useState("");
  const [newDailyTarget, setNewDailyTarget] = useState(1);
  const [showDailyCongrats, setShowDailyCongrats] = useState<{ taskName: string; xpGain: number } | null>(null);

  const dailyStorageKey = `momentum_daily_tasks_${user.email || "guest"}`;

  // Load daily tasks from storage & reset tasks completed on previous calendar days
  useEffect(() => {
    const saved = isGuest ? sessionStorage.getItem(dailyStorageKey) : localStorage.getItem(dailyStorageKey);
    const todayStr = new Date().toDateString();

    if (saved) {
      try {
        const parsed: DailyTask[] = JSON.parse(saved);
        const updated = parsed.map((task) => {
          if (task.lastCompletedAt) {
            const lastDate = new Date(task.lastCompletedAt).toDateString();
            if (lastDate !== todayStr) {
              return { ...task, completedCount: 0, lastCompletedAt: null };
            }
          }
          return task;
        });
        setDailyTasks(updated);
        // Sync back immediately if resets happened
        const serialized = JSON.stringify(updated);
        if (isGuest) {
          sessionStorage.setItem(dailyStorageKey, serialized);
        } else {
          localStorage.setItem(dailyStorageKey, serialized);
        }
      } catch (e) {
        console.error("Erro ao carregar tarefas diárias estruturadas:", e);
      }
    } else {
      setDailyTasks([]);
    }
  }, [dailyStorageKey, isGuest]);

  const saveDailyTasks = (updated: DailyTask[]) => {
    setDailyTasks(updated);
    const serialized = JSON.stringify(updated);
    if (isGuest) {
      sessionStorage.setItem(dailyStorageKey, serialized);
    } else {
      localStorage.setItem(dailyStorageKey, serialized);
    }
  };

  const awardDailyXp = (xpGained: number, taskName: string) => {
    const oldLevel = user.level || 1;
    const currentXp = user.xp || 0;
    const totalXp = currentXp + xpGained;
    
    let newXp = totalXp;
    let newLevel = oldLevel;
    if (newXp >= 70) {
      newLevel += Math.floor(newXp / 70);
      newXp = newXp % 70;
    }
    
    onUpdateUser({
      ...user,
      xp: newXp,
      level: newLevel
    });

    if (newLevel > oldLevel) {
      toast.success(`🦉 SUBIU DE NÍVEL! Nível ${newLevel}! Parabéns por concluir "${taskName}"! 🎉`);
    } else {
      toast.success(`+${xpGained} XP! Parabéns por evoluir! 🎉`);
    }
  };

  const handleAddDailyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDailyName.trim()) {
      toast.error("Por favor, digite o nome da atividade!");
      return;
    }
    const target = Math.max(1, Math.min(6, newDailyTarget));
    const newTask: DailyTask = {
      id: "daily-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      name: newDailyName.trim(),
      targetCount: target,
      completedCount: 0,
      lastCompletedAt: null
    };

    const updated = [newTask, ...dailyTasks];
    saveDailyTasks(updated);
    setNewDailyName("");
    setNewDailyTarget(1);
    toast.success(`Atividade diária "${newTask.name}" criada com sucesso!`);
  };

  const handleCheckDailySquare = (taskId: string, index: number) => {
    const task = dailyTasks.find((t) => t.id === taskId);
    if (!task) return;

    let newCompletedCount = task.completedCount;
    // Toggle check index behavior: if clicked an already checked box, reset back to that count; else set to index + 1
    if (index < task.completedCount) {
      newCompletedCount = index;
    } else {
      newCompletedCount = index + 1;
    }

    const wasFullyCompleted = task.completedCount === task.targetCount;
    const isNowFullyCompleted = newCompletedCount === task.targetCount;

    const updated = dailyTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          completedCount: newCompletedCount,
          lastCompletedAt: isNowFullyCompleted ? new Date().toISOString() : (newCompletedCount < t.targetCount ? null : t.lastCompletedAt)
        };
      }
      return t;
    });

    saveDailyTasks(updated);

    if (isNowFullyCompleted && !wasFullyCompleted) {
      awardDailyXp(15, task.name);
      setShowDailyCongrats({ taskName: task.name, xpGain: 15 });
    }
  };

  const handleRestoreDailyTask = (taskId: string) => {
    const task = dailyTasks.find((t) => t.id === taskId);
    if (!task) return;

    const updated = dailyTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          completedCount: 0,
          lastCompletedAt: null
        };
      }
      return t;
    });

    saveDailyTasks(updated);
    toast.info(`Progresso de "${task.name}" reiniciado.`);
  };

  const handleDeleteDailyTask = (taskId: string) => {
    const updated = dailyTasks.filter((t) => t.id !== taskId);
    saveDailyTasks(updated);
    toast.info("Atividade diária removida.");
  };
  // -------------------------------------

  // Pomodoro Tick Handler
  useEffect(() => {
    if (pomodoro.state === "focus" && !pomodoro.isPaused) {
      timerRef.current = setInterval(() => {
        setPomodoro((prev) => {
          if (prev.remainingSeconds <= 1) {
            clearInterval(timerRef.current!);
            return {
              ...prev,
              remainingSeconds: 0,
              state: "completed",
              productivityScore: prev.productivityScore,
              unlockedRewards: [...prev.unlockedRewards, "Medalha de Foco Absoluto 🥇"]
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pomodoro.state, pomodoro.isPaused]);

  // Tab/Browser Absence Detection for Pomodoro Performance
  useEffect(() => {
    const handleLeave = () => {
      if (pomodoro.state === "focus" && !pomodoro.isPaused) {
        if (!awayTimestampRef.current) {
          awayTimestampRef.current = Date.now();
        }
      }
    };

    const handleReturn = () => {
      if (pomodoro.state === "focus" && !pomodoro.isPaused) {
        const timestamp = awayTimestampRef.current;
        if (timestamp) {
          awayTimestampRef.current = null;
          const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
          if (elapsedSeconds >= 120) {
            const minutesAway = Math.floor(elapsedSeconds / 60);
            const blocks = Math.floor(elapsedSeconds / 120);
            const decrement = Math.min(100, blocks * 15);
            setPomodoro((prev) => {
              const newScore = Math.max(0, prev.productivityScore - decrement);
              return {
                ...prev,
                productivityScore: newScore,
                distractionSeconds: prev.distractionSeconds + elapsedSeconds,
              };
            });
            toast.error(
              `🦉 Haste e vento! Você se distanciou do navegador por ${minutesAway} minutos. Seu aproveitamento do Pomodoro foi reduzido em -${decrement}%!`
            );
          }
        }
      } else {
        awayTimestampRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleLeave();
      } else {
        handleReturn();
      }
    };

    const handleBlur = () => {
      handleLeave();
    };

    const handleFocus = () => {
      handleReturn();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [pomodoro.state, pomodoro.isPaused]);

  // Gamification: Award XP on successful Pomodoro completion
  const awardedSessionRef = useRef<string | null>(null);
  useEffect(() => {
    if (pomodoro.state === "completed") {
      if (awardedSessionRef.current !== "awarded") {
        awardedSessionRef.current = "awarded";
        const xpGained = 20;
        const oldLevel = user.level || 1;
        const currentXp = user.xp || 0;
        const totalXp = currentXp + xpGained;
        
        let newXp = totalXp;
        let newLevel = oldLevel;
        if (newXp >= 70) {
          newLevel += Math.floor(newXp / 70);
          newXp = newXp % 70;
        }
        
        onUpdateUser({
          ...user,
          xp: newXp,
          level: newLevel
        });

        if (newLevel > oldLevel) {
          toast.success(`🦉 Huu-Huu! SUBIU DE NÍVEL! Nível ${newLevel}! Foco extraordinário! 🥇`);
        } else {
          toast.success(`+20 XP! Ciclo Pomodoro concluído com sucesso! 🥇`);
        }

        if (selectedTaskId) {
          const focusedTask = notes.find((n) => n.id === selectedTaskId);
          if (focusedTask) {
            toast.success(`🎯 Incrível! Você concluiu um ciclo de foco na atividade: "${focusedTask.title}"! 💪`);
          }
        }
      }
    } else if (pomodoro.state === "focus") {
      awardedSessionRef.current = null;
    }
  }, [pomodoro.state, user.xp, user.level, selectedTaskId, notes]);

  // Handle Notes Management
  const handleOpenCreateNote = () => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(
      today.getMonth() + 1
    ).padStart(2, "0")}/${today.getFullYear()}`;

    setCurrentNote({
      id: "note-" + Date.now(),
      title: "",
      content: "",
      date: formattedDate,
      category: "Todos",
      isStarred: false,
      completed: false,
      difficulty: "medio",
      subtasks: []
    });
    setIsEditing(true);
  };

  const handleEditNote = (note: NoteTask) => {
    setCurrentNote({ ...note });
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!currentNote || !currentNote.title?.trim()) return;

    const noteToSave: NoteTask = {
      id: currentNote.id || "note-" + Date.now(),
      title: currentNote.title,
      content: currentNote.content || "",
      date: currentNote.date || "09/06/2026",
      category: currentNote.category && currentNote.category !== "Todos" ? currentNote.category : "Trabalho",
      isStarred: !!currentNote.isStarred,
      completed: !!currentNote.completed,
      difficulty: currentNote.difficulty || "medio",
      completed_at: currentNote.completed_at,
      subtasks: currentNote.subtasks || [],
      aiSuggestions: currentNote.aiSuggestions
    };

    let updatedList: NoteTask[];
    const exists = notes.some((n) => n.id === noteToSave.id);

    if (exists) {
      updatedList = notes.map((n) => (n.id === noteToSave.id ? noteToSave : n));
    } else {
      updatedList = [...notes, noteToSave];
      if (user.plan !== "premium") {
        const adOptions = [
          {
            title: "CorujaFitness Suplementos",
            desc: "Ganhe energia para seus Pomodoros! Cupom FOCO15 para 15% OFF.",
            cta: "Comprar Agora",
            emoji: "🦉💪"
          },
          {
            title: "CorujaPoliglota Inglês",
            desc: "Aulas ao vivo individuais com professores nativos. Teste grátis!",
            cta: "Aprender Mais",
            emoji: "🦉🗣️"
          },
          {
            title: "CorujaCafé Premium",
            desc: "Grãos selecionados com torra fresca para manter seu cérebro ativo.",
            cta: "Quero Café",
            emoji: "🦉☕"
          }
        ];
        const nextCount = newTasksSinceAd + 1;
        if (nextCount >= 2) {
          setNewTasksSinceAd(0);
          localStorage.setItem("momentum_tasks_since_ad", "0");
          const randomAd = adOptions[Math.floor(Math.random() * adOptions.length)];
          setActiveAd(randomAd);
          setShowAdPopup(true);
          toast.info("Anúncio patrocinado carregado!");
        } else {
          setNewTasksSinceAd(nextCount);
          localStorage.setItem("momentum_tasks_since_ad", nextCount.toString());
        }
      }
    }

    saveNotes(updatedList);
    setIsEditing(false);
    setCurrentNote(null);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = notes.filter((n) => n.id !== id);
    saveNotes(filtered);
    if (currentNote?.id === id) {
      setIsEditing(false);
      setCurrentNote(null);
    }
  };

  const toggleStarNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.map((n) => (n.id === id ? { ...n, isStarred: !n.isStarred } : n));
    saveNotes(updated);
  };

  const toggleCompleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let xpGained = 0;
    const updated = notes.map((n) => {
      if (n.id === id) {
        const nextCompleted = !n.completed;
        if (nextCompleted) {
          const diff = n.difficulty || "medio";
          xpGained = diff === "facil" ? 10 : diff === "dificil" ? 25 : 15;
          return { ...n, completed: true, completed_at: new Date().toISOString() };
        } else {
          return { ...n, completed: false };
        }
      }
      return n;
    });
    saveNotes(updated);

    if (xpGained > 0) {
      const oldLevel = user.level || 1;
      const currentXp = user.xp || 0;
      const totalXp = currentXp + xpGained;
      
      let newXp = totalXp;
      let newLevel = oldLevel;
      if (newXp >= 70) {
        newLevel += Math.floor(newXp / 70);
        newXp = newXp % 70;
      }
      
      const updatedUser: UserProfile = {
        ...user,
        xp: newXp,
        level: newLevel
      };
      
      onUpdateUser(updatedUser);

      if (newLevel > oldLevel) {
        toast.success(`🦉 Huu-Huu! SUBIU DE NÍVEL! Nível ${newLevel}! Sua sabedoria e foco cresceram!`);
      } else {
        toast.success(`+${xpGained} XP de sabedoria! Continue focado!`);
      }
    }
  };

  // Subtask management
  const handleAddSubtask = (title: string) => {
    if (!currentNote || !title.trim()) return;
    const newSub: SubTask = {
      id: "sub-" + Date.now(),
      title: title.trim(),
      completed: false
    };
    setCurrentNote({
      ...currentNote,
      subtasks: [...(currentNote.subtasks || []), newSub]
    });
  };

  const handleToggleSubtask = (id: string) => {
    if (!currentNote || !currentNote.subtasks) return;
    const updated = currentNote.subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s));
    setCurrentNote({
      ...currentNote,
      subtasks: updated
    });
  };

  const handleRemoveSubtask = (id: string) => {
    if (!currentNote || !currentNote.subtasks) return;
    const filtered = currentNote.subtasks.filter((s) => s.id !== id);
    setCurrentNote({
      ...currentNote,
      subtasks: filtered
    });
  };

  // AI-Powered Actions (Call Server endpoints)
  const fetchBasicAISuggestions = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          plan: user.plan,
          tasks: notes.map((n) => ({ title: n.title, completed: n.completed }))
        })
      });
      const data = await response.json();
      setAiSuggestions(data.suggestions || []);
    } catch (e) {
      console.error(e);
      setAiSuggestions([
        "IA offline: Priorize as tarefas com estrela hoje.",
        "IA offline: Inicie um Pomodoro de 25 minutos para ter mais energia.",
        "IA offline: Divida suas notas longas em tópicos menores."
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchAdvancedAIInsights = async () => {
    if (user.plan !== "premium") {
      onOpenPremiumPaywall();
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          plan: "premium",
          tasks: notes.map((n) => ({ title: n.title, completed: n.completed }))
        })
      });
      const data = await response.json();
      setCompiledInsights({
        routineRecommendations: data.routineRecommendations,
        predictiveReport: data.predictiveReport
      });
    } catch (e) {
      console.error(e);
      setCompiledInsights({
        routineRecommendations: [
          "Dica adaptativa: Agrupe atividades de estudo.",
          "Estabilidade: Seu cansaço é menor se estudar por blocos.",
          "Análise comportamental: 90% de taxa de conclusão antes das 18h."
        ],
        predictiveReport: "Offline: alta performance de estudos prevista."
      });
    } finally {
      setAiLoading(false);
    }
  };

  const triggerAISubtaskBreakdown = async () => {
    if (!currentNote || !currentNote.title?.trim()) return;

    if (user.plan !== "premium") {
      onOpenPremiumPaywall();
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          plan: "premium",
          noteTitle: currentNote.title,
          actionType: "split"
        })
      });
      const data = await response.json();
      const generatedSubs: SubTask[] = (data.subtasks || []).map((titleStr: string, index: number) => ({
        id: `ai-sub-${index}-${Date.now()}`,
        title: titleStr,
        completed: false
      }));

      const nextNote = {
        ...currentNote,
        subtasks: [...(currentNote.subtasks || []), ...generatedSubs]
      };
      setCurrentNote(nextNote);

      const updatedNotes = notes.map((n) => (n.id === currentNote.id ? nextNote : n));
      saveNotes(updatedNotes);
      toast.success("Subtarefas sequenciais geradas com sucesso pela inteligência IA!");
    } catch (e) {
      console.error(e);
      // Fallback
      const genericSubs: SubTask[] = [
        { id: `ai-1-${Date.now()}`, title: `Planejar os materiais de estudo/foco para ${currentNote.title}`, completed: false },
        { id: `ai-2-${Date.now()}`, title: "Dividir em blocos Pomodoro sem distrações na aba Foco", completed: false },
        { id: `ai-3-${Date.now()}`, title: "Realizar uma verificação rápida do progresso final", completed: false }
      ];
      const nextNote = {
        ...currentNote,
        subtasks: [...(currentNote.subtasks || []), ...genericSubs]
      };
      setCurrentNote(nextNote);

      const updatedNotes = notes.map((n) => (n.id === currentNote.id ? nextNote : n));
      saveNotes(updatedNotes);
      toast.info("Sugestões adaptativas geradas em modo offline de alta fidelidade!");
    } finally {
      setAiLoading(false);
    }
  };

  // POMODORO INTERACTIVE RULES SIMULATOR (Page 4 of PDF 2)
  const handleStartPomodoro = () => {
    setPomodoro((prev) => ({
      ...prev,
      state: "focus",
      isPaused: false,
      remainingSeconds: 1500,
      distractionSeconds: 0,
      interruptionClass: "none",
      productivityScore: 100
    }));
  };

  const handlePausePomodoro = () => {
    setPomodoro((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleResetPomodoro = () => {
    setPomodoro({
      totalDurationSeconds: 1500,
      remainingSeconds: 1500,
      isPaused: true,
      state: "idle",
      distractionSeconds: 0,
      interruptionClass: "none",
      productivityScore: 100,
      unlockedRewards: []
    });
  };

  // Custom Simulator for Business Focus Rules (Até 2m, 2-5m, >5m, >10m)
  const simulateInterruption = (minutes: number) => {
    if (pomodoro.state !== "focus") {
      alert("Por favor, inicie um cronômetro Pomodoro de foco antes de simular a interrupção.");
      return;
    }

    const seconds = minutes * 60;
    let className: "none" | "short" | "medium" | "long" | "abandoned" = "none";
    let score = 100;
    let desc = "";
    let sessionState = pomodoro.state;
    let rewards = [...pomodoro.unlockedRewards];

    if (minutes <= 2) {
      className = "short";
      score = 100;
      desc = "Interrupção Curta (até 2 min): Sessão continua normalmente. Sem penalidade.";
    } else if (minutes > 2 && minutes <= 5) {
      className = "medium";
      score = 80;
      desc = "Interrupção Média (2 a 5 min): Alerta de perda de foco emitido. Pequena redução na pontuação.";
    } else if (minutes > 5 && minutes <= 10) {
      className = "long";
      score = 40;
      desc = "Interrupção Longa (acima de 5 min): Sessão marcada como parcialmente concluída. Recompensas reduzidas.";
      sessionState = "completed";
      rewards.push("Recompensa Parcial (Bronze) 🥉");
    } else {
      className = "abandoned";
      score = 0;
      desc = "Abandono (acima de 10 min): Sessão considerada abandonada. Encerrada automaticamente sem recompensas.";
      sessionState = "abandoned";
    }

    setPomodoro((prev) => ({
      ...prev,
      distractionSeconds: seconds,
      interruptionClass: className,
      productivityScore: score,
      state: sessionState,
      unlockedRewards: rewards
    }));

    alert(`Simulação de Interrupção de ${minutes} minutos:\n\n${desc}`);
  };

  // Filter notes based on category selection AND time filter
  const filteredNotes = notes.filter((n) => {
    // 1. Tab check
    if (activeTab === "star" && !n.isStarred) return false;

    // 2. Time check
    if (timeFilter === "today" && !isToday(n.date)) return false;
    if (timeFilter === "week" && !isThisWeek(n.date)) return false;

    // 3. Category tag check
    if (selectedCategory === "Concluídas") {
      return !!n.completed;
    } else {
      if (n.completed) return false;
      if (selectedCategory === "Todos") return true;
      return n.category?.toLowerCase() === selectedCategory.toLowerCase();
    }
  });

  const todayCount = notes.filter((n) => !n.completed && isToday(n.date)).length;
  const weekCount = notes.filter((n) => !n.completed && isThisWeek(n.date)).length;

  return (
    <div id="dashboard-wrapper" className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-60px)] bg-[#FDFBFE]">
      
      {/* Tab Filter & Notes Feed */}
      <div id="notes-feed-container" className="flex-1 p-6 flex flex-col items-center">
        
        {/* RECTANGLE PANEL FOR MAJOR ACTIVITIES (TODAY & THIS WEEK DEADBANDS) */}
        {!isEditing && (
          <div
            id="major-activities-rectangle"
            className="w-full bg-white rounded-3xl p-5 mb-5 shadow-md border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden"
          >
            {/* Ambient subtle back decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-150 rounded-full filter blur-xl opacity-20 -mr-6 -mt-6" />
            
            <div className="flex items-center space-x-3 text-left">
              <div className="p-3 bg-purple-100/80 text-[#5D3A8C] rounded-2xl shadow-inner shrink-0">
                <Calendar size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-purple-950 tracking-tight font-sans">
                  {t.primaryActivitiesTitle}
                </h4>
                <p className="text-[10px] text-purple-600/70 max-w-xs font-sans">
                  {t.primaryActivitiesDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto self-stretch sm:self-center justify-center sm:justify-end shrink-0">
              {/* BUTTON FOR TODAY */}
              <button
                id="btn-filter-today"
                onClick={() => setTimeFilter(timeFilter === "today" ? "all" : "today")}
                className={`flex-1 sm:flex-none py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer select-none ${
                  timeFilter === "today"
                    ? "bg-[#5D3A8C] text-white shadow-md scale-105"
                    : "bg-[#F3EEFA] text-[#5D3A8C] hover:bg-[#E8DEF8] border border-purple-100"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="capitalize">{t.todayLabel}:</span>
                <span className={`font-extrabold font-mono px-2 py-0.5 rounded-full text-[11px] ${timeFilter === "today" ? "bg-white/20 text-white" : "bg-purple-100 text-[#5D3A8C]"}`}>
                  {todayCount}
                </span>
                <span className="text-[10px] opacity-90">{t.tasksCountLabel}</span>
              </button>

              {/* BUTTON FOR THIS WEEK */}
              <button
                id="btn-filter-week"
                onClick={() => setTimeFilter(timeFilter === "week" ? "all" : "week")}
                className={`flex-1 sm:flex-none py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer select-none ${
                  timeFilter === "week"
                    ? "bg-[#5D3A8C] text-white shadow-md scale-105"
                    : "bg-[#F3EEFA] text-[#5D3A8C] hover:bg-[#E8DEF8] border border-purple-100"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                <span className="capitalize">{t.thisWeekLabel}:</span>
                <span className={`font-extrabold font-mono px-2 py-0.5 rounded-full text-[11px] ${timeFilter === "week" ? "bg-white/20 text-white" : "bg-purple-100 text-[#5D3A8C]"}`}>
                  {weekCount}
                </span>
                <span className="text-[10px] opacity-90">{t.tasksCountLabel}</span>
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE TIMEFILTER HEADER TITLE */}
        {!isEditing && timeFilter !== "all" && (
          <div className="w-full flex items-center justify-between bg-purple-50/50 p-3 rounded-2xl border border-purple-100 mb-4 animate-fadeIn">
            <h3 className="text-sm font-black text-[#5D3A8C] flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span>{timeFilter === "today" ? t.todayTasksTitle : t.thisWeekTasksTitle}</span>
              <span className="bg-purple-100 font-mono text-[10px] px-2 py-0.5 rounded-full text-purple-700 font-black">
                {filteredNotes.length} {t.tasksCountLabel}
              </span>
            </h3>
            <button
              id="clear-time-filter-btn"
              onClick={() => setTimeFilter("all")}
              className="text-xs font-extrabold text-[#5D3A8C] hover:text-purple-900 bg-[#E8DEF8] hover:bg-[#D5C2F5] px-4 py-1.5 rounded-full transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>{t.backToAllButton}</span>
              <ArrowRight size={12} className="rotate-180" />
            </button>
          </div>
        )}

        {/* Category tags selector (Screenshot 3) */}
        {!isEditing && activeTab !== "star" && activeTab !== "diarias" && (
          <div id="category-chips-bar" className="flex space-x-2 mb-6 overflow-x-auto self-start py-1 no-scrollbar w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`chip-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#DBCFFA] text-[#5D3A8C] shadow-sm scale-105"
                    : "bg-[#F3EEFA] text-[#8565C4] hover:bg-[#E8DEF8]"
                }`}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        )}

        {/* Conditional Ad Slot for Free Tier (with premium checkout redirection CTA) */}
        {!isEditing && user.plan === "free" && localStorage.getItem("momentum_disable_ads") !== "true" && (
          <div className="w-full mb-5 select-none">
            <RotatingAdSlot plan="free" />
          </div>
        )}

        {/* DIARIAS TAB TITLE */}
        {activeTab === "diarias" && (
          <div className="self-start text-left mb-6 w-full animate-fadeIn">
            <h2 className="text-xl font-bold font-sans text-purple-950 flex flex-wrap items-center gap-2">
              <CalendarCheck className="text-purple-600 shrink-0" size={22} />
              <span>Tarefas Diárias</span>
              <span className="text-[9px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">★ PREMIUM</span>
            </h2>
            <p className="text-xs text-purple-600/70 mt-1">Configure seus comportamentos diários e marque o checklist ao realizá-los. Complete repetições para faturar +15 XP!</p>
          </div>
        )}

        {/* STAR TAB TITLE */}
        {activeTab === "star" && (
          <div className="self-start text-left mb-6">
            <h2 className="text-xl font-bold font-sans text-purple-950 flex items-center space-x-2">
              <Star className="fill-amber-400 stroke-amber-500" size={20} />
              <span>{t.starredNotesTitle}</span>
            </h2>
            <p className="text-xs text-purple-600/70">{t.starredNotesDesc}</p>
          </div>
        )}

        {/* CENTRAL VIEW LAYOUT (Screenshot 3 - Principais atividades) */}
        {activeTab === "diarias" ? (
          /* RICH PREMIUM DAILY TASKS COCKPIT */
          <div id="daily-tasks-screen" className="w-full flex-1 flex flex-col space-y-6 animate-fadeIn">
            {/* Form Card */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-purple-100 w-full text-left">
              <h3 className="text-xs font-black text-[#5D3A8C] font-sans uppercase tracking-wider mb-4 flex items-center space-x-2">
                <Sparkles size={14} className="text-[#8565C4] animate-pulse" />
                <span>Adicionar Ritual Recorrente</span>
              </h3>
              <form onSubmit={handleAddDailyTask} className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 w-full text-left">
                  <label className="block text-[10px] font-extrabold text-purple-900/60 mb-2 font-mono uppercase tracking-wide">
                    Qual o nome deste ritual diário?
                  </label>
                  <input
                    type="text"
                    value={newDailyName}
                    onChange={(e) => setNewDailyName(e.target.value)}
                    placeholder="Ex: Beber 2L de Água, Meditar 15 min, Exercícios, Leitura..."
                    className="w-full bg-[#F3EEFA]/40 border border-purple-100 rounded-2xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-purple-300 focus:bg-white text-purple-950 transition-all font-sans"
                  />
                </div>
                <div className="w-full md:w-72 text-left shrink-0">
                  <label className="block text-[10px] font-extrabold text-purple-900/60 mb-2 font-mono uppercase tracking-wide">
                    Meta de repetições por dia ({newDailyTarget}x)
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setNewDailyTarget(num)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                          newDailyTarget === num
                            ? "bg-[#5D3A8C] text-white shadow-sm scale-105"
                            : "bg-[#F3EEFA]/70 text-purple-700 hover:bg-[#E8DEF8]"
                        }`}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-[#5D3A8C] hover:bg-[#4A2D70] active:scale-95 text-white font-extrabold text-xs py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
                >
                  <Plus size={15} className="stroke-[3]" />
                  <span>Adicionar</span>
                </button>
              </form>
            </div>

            {/* Daily tasks list grids */}
            {dailyTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-purple-100/70 shadow-xs p-6 text-center animate-scaleUp">
                <OwlLogo size={55} className="mb-4 opacity-75" />
                <h3 className="text-sm font-bold text-purple-950 font-sans">Nenhum ritual diário cadastrado</h3>
                <p className="text-xs text-purple-600/70 mt-1.5 max-w-sm leading-relaxed font-sans">
                  Use os rituais diários para focar em metas recorrentes de micro-hábitos. Configure-os acima para começar! 🦉
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {dailyTasks.map((task) => {
                  const isFullyCompleted = task.completedCount === task.targetCount;
                  return (
                    <div
                      key={task.id}
                      className={`rounded-3xl p-5 border shadow-xs transition-all flex flex-col justify-between relative overflow-hidden h-44 text-left ${
                        isFullyCompleted
                          ? "bg-gradient-to-tr from-[#ECFDF5]/80 to-[#D1FAE5]/50 border-emerald-250 shadow-inner"
                          : "bg-white border-purple-100"
                      }`}
                    >
                      {/* Colored top visual border accent */}
                      <div className={`absolute top-0 left-0 w-full h-1 ${isFullyCompleted ? "bg-[#34D399]" : "bg-purple-300"}`} />

                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isFullyCompleted ? "bg-emerald-100 text-emerald-800" : "bg-purple-50 text-purple-700"
                        }`}>
                          {isFullyCompleted ? "Ritual Concluído de Hoje! ✨" : `Metas de hoje: ${task.completedCount}/${task.targetCount}`}
                        </span>

                        <div className="flex items-center space-x-1 z-10">
                          {/* Restoration trigger button for accidental click */}
                          {(isFullyCompleted || task.completedCount > 0) && (
                            <button
                              onClick={() => handleRestoreDailyTask(task.id)}
                              title="Restaurar meta diária"
                              className="p-1 px-1.5 rounded-lg bg-white border border-purple-100 text-purple-600 hover:text-purple-800 shadow-2xs hover:shadow-xs transition-all active:scale-90 flex items-center justify-center cursor-pointer"
                            >
                              <RotateCcw size={10} className="stroke-[3]" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDailyTask(task.id)}
                            title="Remover ritual"
                            className="p-1 px-1.5 rounded-lg bg-white border border-purple-100 text-red-500 hover:bg-red-50 hover:text-red-700 shadow-2xs transition-all active:scale-90 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      <h4 className={`text-xs font-black text-purple-950 tracking-tight leading-snug line-clamp-2 mt-1 mb-2 ${
                        isFullyCompleted ? "line-through opacity-50 text-emerald-950" : ""
                      }`}>
                        {task.name}
                      </h4>

                      {/* Repetitive checkbox badges */}
                      <div className="mt-auto flex items-center space-x-2">
                        <span className="text-[9px] font-extrabold text-purple-900/40 uppercase font-mono tracking-wider shrink-0">Repetições:</span>
                        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
                          {Array.from({ length: task.targetCount }).map((_, idx) => {
                            const isChecked = idx < task.completedCount;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleCheckDailySquare(task.id, idx)}
                                className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center cursor-pointer select-none border ${
                                  isChecked
                                    ? "bg-emerald-500 border-emerald-600 text-white shadow-inner scale-105"
                                    : "bg-[#F3EEFA]/70 hover:bg-purple-150 border-purple-100 text-purple-500 font-bold"
                                }`}
                              >
                                {isChecked ? "✓" : idx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : !isEditing && filteredNotes.length === 0 ? (
          <div id="empty-state-card" className="flex-1 flex flex-col items-center justify-center max-w-sm mt-8 relative select-none">
            
            {/* Mascot Center Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100 flex flex-col items-center text-center self-stretch mb-24 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-300 via-pink-400 to-indigo-300" />
               <OwlLogo size={70} className="mb-4" />
               <h3 className="text-xl font-black text-purple-950 tracking-tight font-sans">
                 {selectedCategory === "Concluídas" ? "Nenhuma atividade concluída" : t.primaryActivitiesTitle}
               </h3>
               <p className="text-xs text-[#888] mt-2 max-w-xs leading-relaxed font-sans">
                 {selectedCategory === "Concluídas" 
                   ? "Suas tarefas finalizadas aparecerão aqui. Complete atividades para ganhar XP e subir de nível!"
                   : t.primaryActivitiesDesc}
               </p>
            </div>

            {/* Bubble help tutorial "Clique aqui para criar sua primeira tarefa" (Screenshot 3) */}
            {notes.length === 0 && (
              <div
                id="help-bubble"
                className="absolute bottom-28 right-0 bg-[#E8DEF8] border border-purple-200 text-[#5D3A8C] text-xs font-bold py-3.5 px-5 rounded-2xl shadow-lg flex flex-col items-center animate-bounce z-20"
              >
                <span>{t.firstTaskHelp}</span>
                <span className="text-[#8565C4] font-black uppercase text-[10px] tracking-wider mt-0.5">{t.firstTaskLabel}</span>
                
                {/* Cute speech bubble bottom tail arrow */}
                <div className="absolute bottom-[-10px] right-8 w-5 h-5 bg-[#E8DEF8] border-r border-b border-purple-200 transform rotate-45" />
              </div>
            )}

            {/* Floating Action '+' Purple Button at bottom right */}
            <button
              id="floating-create-task"
              onClick={handleOpenCreateNote}
              className="absolute bottom-4 right-4 bg-[#DBCFFA] hover:bg-[#CDBCF7] text-[#5D3A8C] p-4 rounded-full shadow-2xl transition-all transform active:scale-90 hover:scale-110 z-20"
            >
              <Plus size={36} className="stroke-[2.5]" />
            </button>
          </div>
        ) : !isEditing ? (
          /* NOT EMPTY GRID (Screenshot 5) */
          <div className="w-full flex-1 relative">
            <div id="notes-masonry-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
               {filteredNotes.map((note) => {
                 const fallsToday = isToday(note.date);
                 return (
                   <div
                     key={note.id}
                     id={`note-card-${note.id}`}
                     onClick={() => handleEditNote(note)}
                     className={`rounded-2xl p-5 shadow-md border hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                       selectedTaskId === note.id
                         ? "ring-2 ring-purple-600 ring-offset-2 border-purple-400 bg-purple-50/40 shadow-lg scale-[1.01]"
                         : note.completed 
                           ? "border-emerald-200/80 bg-emerald-50/10" 
                           : fallsToday
                             ? "border-[#A88AE6] bg-[#ECE2FC] shadow-inner" 
                             : "border-purple-100/80 bg-white"
                     }`}
                   >
                     {/* Category marker */}
                     <div className="absolute top-0 right-0 h-1.5 w-12 bg-purple-400 rounded-bl-lg" />
  
                     <div>
                       <div className="flex justify-between items-start mb-2 pr-6">
                         <h4 className={`font-bold font-sans text-sm tracking-tight flex items-center space-x-1.5 ${note.completed ? "line-through text-purple-950/40" : "text-purple-950"}`}>
                           {fallsToday && (
                             <span className="flex items-center justify-center bg-purple-700 text-white font-extrabold rounded-full w-4.5 h-4.5 text-[11px] px-1.5 shadow-sm border border-purple-800 shrink-0" title="Hoje!">
                               !
                             </span>
                           )}
                           <span>{note.title}</span>
                         </h4>
                      <div className="flex items-center space-x-1.5 absolute right-2 top-3 z-10" onClick={(e) => e.stopPropagation()}>
                        {note.completed && (
                          <button
                            id={`restore-btn-${note.id}`}
                            onClick={(e) => {
                              toggleCompleteNote(note.id, e);
                            }}
                            title="Restaurar atividade"
                            className="bg-purple-150 hover:bg-purple-250 text-[#5D3A8C] px-2.5 py-1 rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5 text-[10px] font-extrabold cursor-pointer select-none"
                          >
                            <RotateCcw size={10} className="stroke-[3] text-purple-700" />
                            <span>Restaurar</span>
                          </button>
                        )}
                        <button
                          id={`star-btn-${note.id}`}
                          onClick={(e) => toggleStarNote(note.id, e)}
                          className="text-amber-400 hover:text-amber-500 p-0.5"
                        >
                          <Star size={16} fill={note.isStarred ? "currentColor" : "none"} />
                        </button>
                        <button
                          id={`complete-btn-${note.id}`}
                          onClick={(e) => toggleCompleteNote(note.id, e)}
                          className={`p-0.5 rounded ${note.completed ? "text-emerald-600 bg-emerald-100" : "text-purple-400 hover:text-emerald-500"}`}
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed mb-4 text-purple-900/70 truncate-2-lines`}>
                      {note.content || t.noContentPlaceholder}
                    </p>

                    {/* Subtasks brief status indicator */}
                    {note.subtasks && note.subtasks.length > 0 && (
                      <div className="mb-4 bg-purple-50/50 p-2 rounded-xl border border-purple-100/50" onClick={(e) => e.stopPropagation()}>
                        <div className="text-[10px] uppercase font-black text-purple-900 tracking-wider mb-1">
                          {t.subtasksLabel} ({note.subtasks.filter((s) => s.completed).length}/{note.subtasks.length})
                        </div>
                        <div className="space-y-1">
                          {note.subtasks.slice(0, 2).map((s) => (
                            <div key={s.id} className="flex items-center space-x-1 text-[10px]">
                              <span className={s.completed ? "text-emerald-600" : "text-purple-300"}>●</span>
                              <span className={`truncate ${s.completed ? "line-through text-purple-800/40" : "text-purple-900"}`}>{s.title}</span>
                            </div>
                          ))}
                          {note.subtasks.length > 2 && (
                            <div className="text-[9px] text-[#888] italic">+ {note.subtasks.length - 2} mais</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Difficulty indicator */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2 mt-1 select-none" onClick={(e) => e.stopPropagation()}>
                      <span className={`text-[8.5px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider border ${
                        (note.difficulty || "medio") === "facil"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : (note.difficulty || "medio") === "dificil"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {(note.difficulty || "medio") === "facil" ? "Fácil • +10 XP" : (note.difficulty || "medio") === "dificil" ? "Difícil • +25 XP" : "Médio • +15 XP"}
                      </span>

                      {!note.completed && (
                        <button
                          id={`select-focus-${note.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectFocusTask(selectedTaskId === note.id ? null : note.id);
                          }}
                          className={`text-[8.5px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider flex items-center space-x-1 border shadow-2xs transition-all active:scale-95 cursor-pointer z-10 ${
                            selectedTaskId === note.id
                              ? "bg-purple-600 text-white border-purple-700 font-extrabold animate-pulse"
                              : "bg-purple-50 text-[#5D3A8C] border-purple-150 hover:bg-purple-100"
                          }`}
                        >
                          <Target size={10} className={selectedTaskId === note.id ? "animate-spin" : ""} />
                          <span>{selectedTaskId === note.id ? "Em Foco 🎯" : "Focar 🎯"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Note Footer metadata */}
                  <div className="flex items-center justify-between text-[10px] text-purple-500/70 pt-2 border-t border-purple-50 mt-2" onClick={(e) => e.stopPropagation()}>
                    <span className="flex items-center space-x-1 font-mono font-bold">
                      <Calendar size={10} />
                      <span>{note.date}</span>
                    </span>
                    <span className="bg-purple-100/80 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                      {note.category}
                    </span>
                    <button
                      id={`delete-btn-${note.id}`}
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="text-[#999] hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

            {/* Floating Action '+' Purple Button always on top */}
            <button
              id="notes-float-add"
              onClick={handleOpenCreateNote}
              className="fixed bottom-6 right-6 bg-[#DBCFFA] hover:bg-[#CDBCF7] text-[#5D3A8C] p-4.5 rounded-full shadow-2xl transition-all transform active:scale-95 z-20 hover:scale-105 border-2 border-white"
            >
              <Plus size={32} className="stroke-[3]" />
            </button>
          </div>
        ) : (
          /* ACTIVE NOTE EDITING VIEW (Screenshot 4) */
          <div id="note-editor-card" className="w-full bg-white rounded-3xl p-6 shadow-xl border border-purple-100 flex flex-col justify-between self-stretch relative animate-scaleUp">
            <div className="space-y-4">
              
              {/* Note Header Toolbar */}
              <div className="flex justify-between items-center bg-purple-50/40 p-2 rounded-2xl border border-purple-100">
                <div className="flex space-x-1.5">
                  <span className="w-3.5 h-3.5 bg-red-400 rounded-full" />
                  <span className="w-3.5 h-3.5 bg-amber-400 rounded-full" />
                  <span className="w-3.5 h-3.5 bg-green-400 rounded-full" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    id="editor-star-btn"
                    onClick={() => setCurrentNote({ ...currentNote, isStarred: !currentNote?.isStarred })}
                    className={`p-1.5 rounded-lg border ${
                      currentNote?.isStarred
                        ? "bg-amber-100 border-amber-300 text-amber-500"
                        : "bg-white border-purple-100 text-purple-400 hover:text-amber-500"
                    }`}
                  >
                    <Star size={14} fill={currentNote?.isStarred ? "currentColor" : "none"} />
                  </button>
                  <span className="text-[10px] text-purple-500 font-bold bg-white border border-purple-100 px-3 py-1 rounded-lg">
                    {categoryLabels[currentNote?.category || "Todos"] || currentNote?.category}
                  </span>
                </div>
              </div>

              {/* Note Title Input with screenshot style "Atividade 1" (Screenshot 4) */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 pb-1 border-b border-purple-100">
                <input
                  id="note-editor-title"
                  type="text"
                  required
                  className="text-xl font-bold font-sans text-purple-950 focus:outline-none placeholder:text-purple-300 flex-1 w-full"
                  placeholder={t.noteTitlePlaceholder}
                  value={currentNote?.title || ""}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                />
                
                {/* Data display (Screenshot 4: 'Data / /') */}
                <div className="flex items-center space-x-1.5 bg-[#FBF9FE] px-3.5 py-1.5 rounded-full border border-purple-100 shadow-sm">
                  <span className="text-[10px] font-black text-[#5D3A8C] uppercase tracking-wider">{t.dateLabel}</span>
                  <input
                    id="note-editor-date"
                    type="date"
                    className="text-xs text-purple-900 border-none bg-transparent focus:outline-none cursor-pointer font-mono font-bold w-32"
                    value={currentNote?.date ? ddmmyyyyToYyyymmdd(currentNote.date) : ""}
                    onChange={(e) => {
                      const newYmd = e.target.value;
                      const newDmy = yyyymmddToDdmmyyyy(newYmd);
                      setCurrentNote({ ...currentNote, date: newDmy });
                    }}
                  />
                </div>
              </div>

              {/* Category picker inside editor */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold text-purple-950 uppercase">{t.categoryLabel}</span>
                <div className="flex space-x-1">
                  {categories.filter((c) => c !== "Todos" && c !== "Concluídas").map((cat) => (
                    <button
                      key={cat}
                      id={`editor-cat-chip-${cat}`}
                      type="button"
                      onClick={() => setCurrentNote({ ...currentNote, category: cat })}
                      className={`text-[9px] font-bold px-2 py-1 rounded-full transition-all ${
                        currentNote?.category === cat ? "bg-purple-600 text-white shadow-sm" : "bg-purple-55 text-[#8565C4] hover:bg-purple-100"
                      }`}
                    >
                      {categoryLabels[cat] || cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Difficulty Picker (Gamification extension) */}
              <div className="flex items-center space-x-2 border-t border-purple-50 pt-3">
                <span className="text-[10px] font-extrabold text-purple-950 uppercase">Dificuldade / XP:</span>
                <div className="flex space-x-1.5">
                  {[
                    { id: "facil", label: "Fácil (10 XP)", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100", activeColor: "bg-emerald-600 text-white" },
                    { id: "medio", label: "Médio (15 XP)", color: "bg-amber-50 text-amber-700 hover:bg-amber-100", activeColor: "bg-amber-500 text-white" },
                    { id: "dificil", label: "Difícil (25 XP)", color: "bg-red-50 text-red-700 hover:bg-red-100", activeColor: "bg-red-600 text-white" }
                  ].map((level) => {
                    const isSelected = (currentNote?.difficulty || "medio") === level.id;
                    return (
                      <button
                        key={level.id}
                        id={`editor-difficulty-${level.id}`}
                        type="button"
                        onClick={() => setCurrentNote({ ...currentNote, difficulty: level.id as "facil" | "medio" | "dificil" })}
                        className={`text-[9px] font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                          isSelected ? level.activeColor : `${level.color} border border-transparent`
                        }`}
                      >
                        {level.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rich input description (Screenshot 4 style "Comece a escrever...") */}
              <div className="flex flex-col space-y-1">
                <textarea
                  id="note-editor-content"
                  className="w-full min-h-[140px] focus:outline-none text-purple-950 text-sm placeholder:text-purple-300 leading-relaxed font-sans"
                  placeholder={t.startWritingPlaceholder}
                  value={currentNote?.content || ""}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                />
              </div>

              {/* Subtasks Section with Dynamic Intelligent AI helper breakdown (RF04) */}
              <div className="mt-4 border-t border-purple-50 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-[11px] font-black text-[#5D3A8C] uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers size={13} className="text-purple-500" />
                    <span>{t.subtasksExecHeader}</span>
                  </h5>

                  {/* Intelligent split with IA */}
                  <button
                    id="split-with-ia-btn"
                    type="button"
                    onClick={triggerAISubtaskBreakdown}
                    disabled={aiLoading}
                    className="text-[9px] font-extrabold text-purple-700 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded-full flex items-center space-x-1 focus:outline-none transition-all shadow-sm"
                  >
                    <Brain size={11} className="text-purple-600" />
                    <span>{aiLoading ? t.consultingAi : t.splitWithAiButton}</span>
                  </button>
                </div>

                {/* Subtask Adder */}
                <div className="flex space-x-2 mb-3">
                  <input
                    id="subtask-add-input"
                    type="text"
                    placeholder={t.addManualSubtaskPlaceholder}
                    className="flex-1 bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = e.currentTarget.value;
                        if (val.trim()) {
                          handleAddSubtask(val);
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                  <button
                    id="subtask-add-btn"
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("subtask-add-input") as HTMLInputElement;
                      if (input && input.value.trim()) {
                        handleAddSubtask(input.value);
                        input.value = "";
                      }
                    }}
                    className="bg-[#DBCFFA] hover:bg-purple-200 text-[#5D3A8C] px-3 rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                {/* Subtasks checklist */}
                <div id="subtasks-checklist" className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                  {currentNote?.subtasks && currentNote.subtasks.length > 0 ? (
                    currentNote.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                          sub.completed ? "bg-emerald-50/20 border-emerald-100" : "bg-[#FBF9FE] border-purple-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <button
                            id={`toggle-sub-${sub.id}`}
                            type="button"
                            onClick={() => handleToggleSubtask(sub.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              sub.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-purple-300 bg-white"
                            }`}
                          >
                            {sub.completed && <Check size={10} className="stroke-[3]" />}
                          </button>
                          <span className={`font-medium ${sub.completed ? "line-through text-[#aaa]" : "text-purple-950"}`}>
                            {sub.title}
                          </span>
                        </div>
                        <button
                          id={`del-sub-${sub.id}`}
                          type="button"
                          onClick={() => handleRemoveSubtask(sub.id)}
                          className="text-[#bbb] hover:text-red-500 p-0.5"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-purple-600/70 italic text-center py-2 select-none">
                      {t.noSubtasksYet}
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Note Editor Control buttons */}
            <div className="flex space-x-3 pt-6 border-t border-purple-50 mt-6 md:justify-end">
              <button
                id="cancel-editor-btn"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentNote(null);
                }}
                className="flex-1 md:flex-none border border-purple-300 text-purple-700 font-bold px-6 py-2.5 rounded-full text-xs hover:bg-purple-50 active:scale-95 transition-all"
              >
                {t.cancelButton}
              </button>
              <button
                id="save-editor-btn"
                onClick={handleSaveNote}
                className="flex-1 md:flex-none bg-[#5D3A8C] text-white font-bold px-8 py-2.5 rounded-full text-xs hover:bg-[#4E3175] active:scale-95 transition-all shadow-md"
              >
                {t.saveActivityBtn}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT UTILITY COLUMN: FOCUS WORKSPACE (POMODORO ENGINE + SMART IA ASSISTANT) */}
      <div id="right-workspace-column" className="w-full md:w-80 bg-[#F4EFFB] border-t md:border-t-0 md:border-l border-purple-100/40 p-5 space-y-6">
        
        {/* SECTION 1: INTERACTIVE DEEPMIND POMODORO STUDY TIMER WITH BUSINESS FOCUS RULES */}
        <div id="pomodoro-workspace" className="bg-white rounded-3xl p-5 shadow-md border border-purple-100/80">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="text-purple-600" size={18} />
            <span className="text-xs font-black text-purple-950 tracking-tight uppercase">{t.strictFocusTimerTitle}</span>
          </div>

          {/* USER LEVEL & XP GAUGE PANELIST - PURPLE MERGED BACKGROUND (GRADIENT) */}
          <div
            id="xp-level-panel"
            className="mb-4 bg-gradient-to-br from-[#7C4DFF] via-[#5D3A8C] to-[#3B1E61] text-white p-4 rounded-2xl shadow-md relative overflow-hidden select-none border border-purple-500/30 flex flex-col gap-3"
          >
            {/* Ambient decorative glowing circles */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-indigo-500/20 rounded-full blur-lg pointer-events-none" />

            <div className="flex items-center space-x-3.5 relative z-10">
              {/* Shield/Container for the cute Owl Logo */}
              <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl border border-white/20 shadow-inner flex items-center justify-center shrink-0">
                <OwlLogo size={42} color="text-white fill-white/10" pulse />
              </div>

              <div className="flex flex-col justify-center min-w-0">
                <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest leading-none mb-1">
                  EVOLUÇÃO OWL
                </span>
                <span className="text-sm font-black tracking-tight text-white leading-tight">
                  Seu nível é {user.level || 1}
                </span>
              </div>
            </div>

            {/* XP PROGRESS BAR SECTION */}
            <div className="relative z-10 flex flex-col gap-1.5 pt-1">
              <div className="flex justify-between items-center text-[9px] font-bold tracking-wide">
                <span className="text-purple-200 uppercase">Evolução do Foco</span>
                <span className="text-amber-300 font-mono bg-white/10 px-2 py-0.5 rounded-full border border-white/5 shadow-xs">
                  {user.xp || 0} / 70 XP
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-3 bg-purple-950/40 rounded-full p-[2px] border border-white/10 shadow-inner overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                  style={{ width: `${Math.min(((user.xp || 0) / 70) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center py-4 bg-purple-50/35 rounded-2xl border border-purple-100 text-center relative overflow-hidden">
            
            {/* Display time formatted */}
            <div id="pomodoro-countdown" className="text-4xl font-extrabold font-mono text-[#5D3A8C] mb-1 tracking-tight">
              {Math.floor(pomodoro.remainingSeconds / 60)}:
              {String(pomodoro.remainingSeconds % 60).padStart(2, "0")}
            </div>

            <div className="text-[10px] font-black uppercase tracking-wider text-purple-600/80 mb-4">
              {t.sessionWord}: {pomodoro.state === "focus" ? t.activeFocusText : t.pendingText}
            </div>

            {/* Active Focus Activity Dropdown Selector */}
            <div className="w-full px-4 mb-3 text-left z-10">
              <label className="block text-[8px] font-black text-purple-900/60 uppercase tracking-widest mb-1 font-mono">
                🎯 Atividade em Foco:
              </label>
              {selectedFocusTask ? (
                <div className="bg-white border border-purple-100 rounded-xl p-2 flex items-center justify-between shadow-2xs">
                  <div className="flex flex-col min-w-0 pr-1 text-left">
                    <span className="text-[10px] font-bold text-purple-950 truncate leading-snug">
                      {selectedFocusTask.title}
                    </span>
                    <span className="text-[8.5px] text-purple-600/70 font-bold uppercase tracking-wider font-mono">
                      {selectedFocusTask.category} • {selectedFocusTask.difficulty === "facil" ? "Fácil" : selectedFocusTask.difficulty === "dificil" ? "Difícil" : "Médio"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectFocusTask(null)}
                    className="text-[9px] bg-purple-50 hover:bg-purple-100 text-[#5D3A8C] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 cursor-pointer border border-purple-150 transition-colors"
                  >
                    Mudar
                  </button>
                </div>
              ) : (
                <select
                  id="pomo-focus-task-select"
                  value={selectedTaskId || ""}
                  onChange={(e) => handleSelectFocusTask(e.target.value || null)}
                  className="w-full bg-white border border-purple-200 rounded-xl p-1.5 text-[10px] font-bold text-purple-900 focus:outline-none focus:border-purple-300 shadow-2xs cursor-pointer"
                >
                  <option value="">-- Selecionar atividade --</option>
                  {notes.filter(n => !n.completed).map((note) => (
                    <option key={note.id} value={note.id}>
                      {note.title} ({note.category || "Sem Categ."})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Productivity indicator */}
            <div className="mb-4 flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-purple-100">
              <span className="text-[9px] font-extrabold text-purple-950">{t.productivityScoreLabel}</span>
              <span className={`text-[9px] font-black ${pomodoro.productivityScore >= 80 ? "text-emerald-600" : pomodoro.productivityScore >= 40 ? "text-amber-600" : "text-red-500"}`}>
                {pomodoro.productivityScore}%
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2 z-10">
              {pomodoro.state === "idle" ? (
                <button
                  id="pomo-start"
                  onClick={handleStartPomodoro}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-4 py-2 rounded-full shadow transition-all active:scale-95 uppercase tracking-wide"
                >
                  {t.startFocusBtn}
                </button>
              ) : (
                <>
                  <button
                    id="pomo-pause"
                    onClick={handlePausePomodoro}
                    className="bg-purple-100 hover:bg-purple-200 text-[#5D3A8C] font-bold text-[10px] px-4 py-2 rounded-full transition-all active:scale-95 uppercase tracking-wide"
                  >
                    {pomodoro.isPaused ? t.resumeBtn : t.pauseBtn}
                  </button>
                  <button
                    id="pomo-reset"
                    onClick={handleResetPomodoro}
                    className="border border-purple-200 hover:bg-purple-50 text-purple-700 font-bold text-[10px] px-4 py-2 rounded-full transition-all active:scale-95 uppercase tracking-wide"
                  >
                    {t.resetBtn}
                  </button>
                </>
              )}
            </div>

            {/* Reward trophy box if completed */}
            {pomodoro.unlockedRewards.length > 0 && (
              <div id="pomo-rewards-chest" className="mt-4 p-2 bg-amber-50 rounded-xl border border-amber-200 text-center animate-scaleUp self-stretch mx-3">
                <span className="text-[9px] font-extrabold text-amber-800 uppercase tracking-wider block mb-1">{t.unlockedRewardsLabel}</span>
                {pomodoro.unlockedRewards.map((reward, i) => {
                  // Map rewards dynamically to translated names if listed
                  let rewardDisplay = reward;
                  if (reward.includes("Medalha de Foco Absoluto")) rewardDisplay = t.absoluteFocusReward;
                  else if (reward.includes("Recompensa Parcial (Bronze)")) rewardDisplay = t.partialBronzeReward;
                  return <div key={i} className="text-[10px] font-black text-[#5D3A8C]">{rewardDisplay}</div>;
                })}
              </div>
            )}
          </div>

          {/* ACTIVE INTERRUPTIONS CONTROLLER / TESTER (Page 4 specifications) */}
          <div className="mt-4 border-t border-purple-50 pt-4">
            <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider block mb-2 flex items-center space-x-1">
              <BadgeAlert size={12} className="text-purple-600" />
              <span>{t.interruptionSimulatorTitle}</span>
            </span>
            <p className="text-[9px] text-purple-700/60 leading-3 mb-3">
              {t.interruptionSimulatorDesc}
            </p>

            <div className="space-y-1.5">
              <button
                id="sim-short-interruption"
                onClick={() => simulateInterruption(1.5)}
                className="w-full bg-[#FBF9FE] hover:bg-purple-50 text-purple-950 font-bold py-1.5 px-3 rounded-xl border border-purple-100 text-left text-[9px] flex justify-between items-center"
              >
                <span>{t.shortInterruptionBtn}</span>
                <span className="text-emerald-600 text-[8px] font-bold uppercase">{t.noPenaltyLabel}</span>
              </button>
              <button
                id="sim-medium-interruption"
                onClick={() => simulateInterruption(3.5)}
                className="w-full bg-[#FBF9FE] hover:bg-purple-50 text-purple-950 font-bold py-1.5 px-3 rounded-xl border border-purple-100 text-left text-[9px] flex justify-between items-center"
              >
                <span>{t.mediumInterruptionBtn}</span>
                <span className="text-amber-600 text-[8px] font-bold uppercase">{t.alertFocusLabel}</span>
              </button>
              <button
                id="sim-long-interruption"
                onClick={() => simulateInterruption(7)}
                className="w-full bg-[#FBF9FE] hover:bg-purple-50 text-purple-950 font-bold py-1.5 px-3 rounded-xl border border-purple-100 text-left text-[9px] flex justify-between items-center"
              >
                <span>{t.longInterruptionBtn}</span>
                <span className="text-pink-600 text-[8px] font-bold uppercase">{t.reducedLabel}</span>
              </button>
              <button
                id="sim-abandon-interruption"
                onClick={() => simulateInterruption(12)}
                className="w-full bg-[#FBF9FE] hover:bg-purple-50 text-purple-950 font-bold py-1.5 px-3 rounded-xl border border-purple-100 text-left text-[9px] flex justify-between items-center"
              >
                <span>{t.abandonInterruptionBtn}</span>
                <span className="text-red-500 text-[8px] font-bold uppercase">{t.canceledLabel}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: INTELLIGENT AI COPILOT ASSISTANT (RF03 & RF04) */}
        <WiseOwlChat
          user={user}
          tasks={notes}
          onOpenPremiumPaywall={onOpenPremiumPaywall}
        />

      </div>

      {showAdPopup && activeAd && (
        <div id="ad-popup-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div id="ad-popup-modal" className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 relative overflow-hidden flex flex-col space-y-4 animate-scaleUp text-purple-950">
            
            <div className="absolute top-2 right-2 bg-purple-100 text-purple-750 text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase">
              Anúncio Patrocinado
            </div>

            <div className="text-center pt-4 space-y-3">
              <span className="text-5xl select-none block animate-bounce">{activeAd.emoji}</span>
              <div>
                <h4 className="text-md font-black text-purple-900 font-sans tracking-tight leading-snug">{activeAd.title}</h4>
                <p className="text-xs text-[#555] font-sans leading-relaxed mt-2 px-2">{activeAd.desc}</p>
              </div>
            </div>

            <div className="flex flex-col space-y-2 pt-3">
              <button
                id="ad-popup-cta-btn"
                onClick={() => {
                  toast.success("Redirecionando para o parceiro patrocinado...");
                  setShowAdPopup(false);
                }}
                className="w-full bg-[#5D3A8C] hover:bg-purple-900 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md transition-all active:scale-95 text-center cursor-pointer"
              >
                {activeAd.cta}
              </button>
              <button
                id="ad-popup-close-btn"
                onClick={() => setShowAdPopup(false)}
                className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs py-2.5 rounded-2xl transition-all active:scale-95 text-center cursor-pointer"
              >
                Fechar Anúncio
              </button>
            </div>
            
            <div className="text-center text-[9px] text-[#aaa] font-semibold">
              Adquira o ⚡ <button onClick={() => { setShowAdPopup(false); onOpenPremiumPaywall(); }} className="text-[#5D3A8C] font-black underline hover:text-purple-900 cursor-pointer">Momentum Premium</button> para remover anúncios.
            </div>
          </div>
        </div>
      )}

      {/* RICH DAILY TASKS CONGRATS MODAL */}
      {showDailyCongrats && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-purple-150 relative animate-scaleUp">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-emerald-200 animate-bounce">
              <OwlLogo size={55} />
            </div>

            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full tracking-wider">
              Ritual Completo! 🦉✨
            </span>

            <h3 className="text-xl font-black text-purple-950 mt-4 tracking-tight">
              Parabéns! 🎉
            </h3>
            
            <p className="text-xs text-purple-900/70 mt-2 leading-relaxed">
              Você completou todas os rituais diários para: <strong>"{showDailyCongrats.taskName}"</strong>!
            </p>

            <div className="my-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 border border-emerald-100 inline-flex items-center space-x-2">
              <span className="text-emerald-500 text-lg font-black font-sans shrink-0">XP +{showDailyCongrats.xpGain}</span>
              <span className="text-[10px] text-emerald-800 font-bold uppercase font-mono tracking-wide">de foco e sabedoria!</span>
            </div>

            <p className="text-[11px] text-[#888] italic mb-6">
              "Sua consistência molda sua maestria. Este ritual resetará e estará pronto para você novamente amanhã!"
            </p>

            <button
              onClick={() => setShowDailyCongrats(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs py-3 px-6 rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Continuar focado
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
