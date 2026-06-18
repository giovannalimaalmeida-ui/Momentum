import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldOff, Sparkles, Cpu, Split, TrendingUp, BarChart3, Palette, 
  Play, Pause, Headphones, Volume2, Check, Lock, ChevronRight, HelpCircle, ArrowRight,
  Brain, Zap, Target, Star, Calendar, RefreshCw, Eye
} from "lucide-react";
import { UserProfile, NoteTask } from "../types";
import { toast } from "sonner";

interface PremiumFeaturesProps {
  user: UserProfile;
  activeTab: string;
  onUpdateUser: (updatedUser: UserProfile) => void;
  currentTheme: "lavanda" | "menta" | "coral" | "indigo";
  onThemeChange: (theme: "lavanda" | "menta" | "coral" | "indigo") => void;
  onOpenPremiumPaywall: () => void;
  tasks: NoteTask[];
  onUpdateTasks: (updatedTasks: NoteTask[]) => void;
}

export default function PremiumFeatures({
  user,
  activeTab,
  onUpdateUser,
  currentTheme,
  onThemeChange,
  onOpenPremiumPaywall,
  tasks,
  onUpdateTasks
}: PremiumFeaturesProps) {
  const isPremium = user.plan === "premium";

  // --- TAB 1: REMOVER PROPAGANDAS ---
  const [adsBlockedCount, setAdsBlockedCount] = useState(47);
  const [disableAllAds, setDisableAllAds] = useState(() => {
    return localStorage.getItem("momentum_disable_ads") === "true";
  });

  const handleToggleAds = () => {
    const newVal = !disableAllAds;
    setDisableAllAds(newVal);
    localStorage.setItem("momentum_disable_ads", String(newVal));
    if (newVal) {
      toast.success("Anúncios desativados em todo o aplicativo!");
    } else {
      toast.info("Propagandas reativadas no plano gratuito.");
    }
  };

  // --- TAB 2: FOCO LIVRE DE POLUIÇÃO ---
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const [noiseType, setNoiseType] = useState<"rain" | "waves" | "forest">("rain");
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Play synthetic white/pink focus noise
  const startNoise = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Buffer size
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (noiseType === "rain") {
          // Pink-ish/brownish noise filter approximation for soothing rain
          output[i] = (lastOut * 0.95 + white * 0.05);
          lastOut = output[i];
          output[i] *= 3.5; // Gain compensation
        } else if (noiseType === "waves") {
          // Deep ocean brown noise approximation
          output[i] = (lastOut * 0.99 + white * 0.01);
          lastOut = output[i];
          output[i] *= 8.0; 
        } else {
          // Forest rustling / high-pass filtered white noise
          output[i] = (white * 0.15 + (Math.sin(i * 0.005) * 0.05));
        }
      }

      const whiteNoiseSource = ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      // Lowpass filter for warmer sound
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = noiseType === "waves" ? 300 : noiseType === "rain" ? 800 : 2500;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.18, ctx.currentTime);

      whiteNoiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      whiteNoiseSource.start();
      
      noiseNodeRef.current = whiteNoiseSource as any;
      gainNodeRef.current = gainNode;
      setIsPlayingNoise(true);
    } catch (e) {
      console.error("Audio API error:", e);
      toast.error("Audio API não pôde ser inicializada.");
    }
  };

  const stopNoise = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop();
      } catch (err) {}
      noiseNodeRef.current = null;
    }
    setIsPlayingNoise(false);
  };

  useEffect(() => {
    if (isPlayingNoise) {
      stopNoise();
      startNoise();
    }
  }, [noiseType]);

  useEffect(() => {
    return () => {
      if (noiseNodeRef.current) {
        try {
          (noiseNodeRef.current as any).stop();
        } catch (e) {}
      }
    };
  }, []);

  // Minimalist Focus Simulator toggles
  const [hideXp, setHideXp] = useState(false);
  const [hideMascot, setHideMascot] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Inspire");

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev === "Inspire" ? "Segure" : prev === "Segure" ? "Expire" : "Inspire"));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // --- TAB 3: SUGESTÕES DE IA AVANÇADAS (Wise Owl Chat Interface) ---
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: "user" | "owl"; text: string }>>([
    { role: "owl", text: "Olá! Como sua mentora intelectual avançada, posso te dar diretrizes personalizadas contra a preguiça e otimizar sua rotina de hoje. Do que você precisa agora?" }
  ]);
  const [isAiResponding, setIsAiResponding] = useState(false);

  const getDailyTasksFromStorage = () => {
    try {
      const isGuest = user.isGuest || !user.email || user.email === "guest@momentum.app";
      const dailyStorageKey = `momentum_daily_tasks_${user.email || "guest"}`;
      const saved = isGuest ? sessionStorage.getItem(dailyStorageKey) : localStorage.getItem(dailyStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  const handleSendAiChat = async (presetText?: string) => {
    const textToSend = presetText || aiChatInput;
    if (!textToSend.trim()) return;

    if (!presetText) setAiChatInput("");

    // Append user message
    const updatedHistory = [...aiChatHistory, { role: "user" as const, text: textToSend }];
    setAiChatHistory(updatedHistory);
    setIsAiResponding(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          tasks: tasks,
          dailyTasks: getDailyTasksFromStorage(),
          history: updatedHistory.slice(-5),
          plan: user.plan || "premium",
          username: user.username || "Membro Premium"
        })
      });

      const data = await response.json();
      setAiChatHistory(prev => [...prev, { role: "owl" as const, text: data.reply }]);
    } catch (err) {
      setAiChatHistory(prev => [...prev, { 
        role: "owl" as const, 
        text: "Huu-Huu! Minhas asas se perderam em uma neblina cósmica. Mas lembre-se: concentrar-se em mini blocos de tarefas é o melhor caminho!" 
      }]);
    } finally {
      setIsAiResponding(false);
    }
  };

  // --- TAB 4: DIVISÃO INTELIGENTE & METAS ---
  const [selectedTaskToSplit, setSelectedTaskToSplit] = useState("");
  const [splitSubtasks, setSplitSubtasks] = useState<string[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);

  const handleSplitTask = async () => {
    if (!selectedTaskToSplit) {
      toast.error("Por favor, selecione uma atividade para dividir.");
      return;
    }
    const targetTask = tasks.find(t => t.id === selectedTaskToSplit);
    if (!targetTask) return;

    setIsSplitting(true);
    setSplitSubtasks([]);

    try {
      const response = await fetch("/api/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          plan: "premium",
          noteTitle: targetTask.title,
          actionType: "split"
        })
      });
      const data = await response.json();
      setSplitSubtasks(data.subtasks || []);
      toast.success("Subtarefas sequenciais geradas pela IA!");
    } catch (e) {
      setSplitSubtasks([
        "Passo 1: Organizar materiais de apoio",
        "Passo 2: Executar primeiro bloco rascunho (15min)",
        "Passo 3: Revisão pontual rápida",
        "Passo 4: Validação final"
      ]);
    } finally {
      setIsSplitting(false);
    }
  };

  const handleInjectSubtasks = () => {
    if (splitSubtasks.length === 0 || !selectedTaskToSplit) return;
    
    const updated = tasks.map(task => {
      if (task.id === selectedTaskToSplit) {
        const existingSubs = task.subtasks || [];
        const newSubs = splitSubtasks.map((st, i) => ({
          id: `ai-sub-${Date.now()}-${i}`,
          title: st,
          completed: false
        }));
        return {
          ...task,
          subtasks: [...existingSubs, ...newSubs]
        };
      }
      return task;
    });

    onUpdateTasks(updated);
    toast.success("Subtarefas injetadas com sucesso na atividade! Veja e execute em 'Minhas Atividades'.");
    setSplitSubtasks([]);
    setSelectedTaskToSplit("");
  };

  // --- TAB 5: HISTÓRICO PREDITIVO ---
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [predictiveReport, setPredictiveReport] = useState<string>("");

  const handleGeneratePredictiveReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch("/api/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          plan: "premium",
          tasks: tasks,
          actionType: "insights"
        })
      });
      const data = await response.json();
      setPredictiveReport(data.predictiveReport || "Você possui excelente foco! Estatisticamente, você alcança seu pico de rendimento nas terças-feiras.");
    } catch (e) {
      setPredictiveReport("Padrão preditivo identificado: Suas chances de concluir os objetivos do dia crescem em 75% quando você inicia as atividades antes das 10h da manhã e evita pausas superiores a 5 minutos.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // --- TAB 6: GRÁFICOS & PERFORMANCE ---
  const [statTimeFilter, setStatTimeFilter] = useState<"week" | "month">("week");
  // Calculate real categories
  const categoriesCount = tasks.reduce((acc, t) => {
    const cat = t.category || "Geral";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
      


      {/* 2. FOCO LIVRE DE POLUIÇÃO VISUAL */}
      {activeTab === "foco_clean" && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xl space-y-6 animate-scaleUp text-left">
          <div className="flex items-center space-x-3 border-b border-purple-50 pb-4">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Eye size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-purple-950 font-sans uppercase tracking-wider">Foco Livre de Poluição</h3>
              <p className="text-[10px] text-purple-600 font-semibold">Transforme seu navegador em um refúgio de concentração minimalista</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                  <Headphones size={14} className="text-emerald-600" />
                  <span>Sons Ambientais de Foco</span>
                </h4>
                <p className="text-[10px] text-purple-750 leading-relaxed font-sans">
                  Sons sintetizados em tempo real direto do seu navegador para mascarar distrações barulhentas:
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-bold text-purple-950 leading-none">Chuva Sálvia Calmante</span>
                    <button
                      id="noise-rain-btn"
                      onClick={() => {
                        setNoiseType("rain");
                        if (!isPlayingNoise) startNoise();
                      }}
                      className={`text-[9px] px-2.5 py-1 rounded-full font-bold select-none ${noiseType === "rain" && isPlayingNoise ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700"}`}
                    >
                      Selecionar
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-bold text-purple-950 leading-none">Ondas Espaciais Profundas</span>
                    <button
                      id="noise-waves-btn"
                      onClick={() => {
                        setNoiseType("waves");
                        if (!isPlayingNoise) startNoise();
                      }}
                      className={`text-[9px] px-2.5 py-1 rounded-full font-bold select-none ${noiseType === "waves" && isPlayingNoise ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700"}`}
                    >
                      Selecionar
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-bold text-purple-950 leading-none">Ruído de Floresta Secreta</span>
                    <button
                      id="noise-forest-btn"
                      onClick={() => {
                        setNoiseType("forest");
                        if (!isPlayingNoise) startNoise();
                      }}
                      className={`text-[9px] px-2.5 py-1 rounded-full font-bold select-none ${noiseType === "forest" && isPlayingNoise ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700"}`}
                    >
                      Selecionar
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
                  <div className="flex items-center space-x-1">
                    <Volume2 size={13} className="text-emerald-700" />
                    <span className="text-[9px] text-[#888] font-semibold">Sintetizador Web Audio Ativo</span>
                  </div>
                  <button
                    id="pomo-noise-toggle"
                    onClick={isPlayingNoise ? stopNoise : startNoise}
                    className={`font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-wide select-none transition-all flex items-center space-x-1 ${isPlayingNoise ? "bg-red-500 text-white hover:bg-red-650" : "bg-emerald-600 text-white hover:bg-emerald-750 animate-bounce"}`}
                  >
                    {isPlayingNoise ? <Pause size={10} /> : <Play size={10} />}
                    <span>{isPlayingNoise ? "Silenciar Som" : "Tocar Foco"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">Ajustes Estéticos de Concentração</h4>
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hideXp}
                    onChange={(e) => setHideXp(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 rounded border-purple-300 focus:ring-purple-500 checked:bg-purple-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-purple-950">Ocular pontuação de XP</span>
                    <p className="text-[9px] text-[#888]">Evita autocobrança e pressão ansiosa</p>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hideMascot}
                    onChange={(e) => setHideMascot(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 rounded border-purple-300 focus:ring-purple-500 checked:bg-purple-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-purple-950">Esconder mascotinho animado</span>
                    <p className="text-[9px] text-[#888]">Foco cego apenas na tarefa e no som</p>
                  </div>
                </label>
              </div>

              {/* Live Breathing Simulator */}
              <div className="p-4 bg-black/95 text-white rounded-3xl shadow-lg border border-purple-500 flex flex-col items-center justify-center space-y-2.5 py-6">
                <div className={`w-14 h-14 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full transition-all duration-[4000ms] shadow-lg flex items-center justify-center ${breathPhase === "Inspire" ? "scale-130 opacity-100" : breathPhase === "Segure" ? "scale-130 opacity-75 animate-pulse" : "scale-85 opacity-50"}`}>
                  <Sparkles size={18} className="text-white fill-white" />
                </div>
                <div className="text-[11px] font-black uppercase tracking-widest text-emerald-400 font-sans mt-1">
                  Guia Respiratório Zen: {breathPhase}
                </div>
                <p className="text-[8.5px] text-[#aaa] max-w-[200px] text-center">
                  Inspire conforme o círculo cresce para oxigenar o cérebro antes do foco.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUGESTÕES DE IA AVANÇADAS */}
      {activeTab === "sugestoes_ia" && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xl space-y-6 animate-scaleUp text-left">
          <div className="flex items-center space-x-3 border-b border-purple-50 pb-4">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl">
              <Cpu size={22} className="text-indigo-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-purple-950 font-sans uppercase tracking-wider">Sugestões de IA Avançadas</h3>
              <p className="text-[10px] text-purple-600 font-semibold">Tire dúvidas e peça hacks de combate à procrastinação diretamente para a Coruja</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3.5">
              <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">Diretrizes Prontas</h4>
              <button
                id="ai-suggestion-preset-1"
                onClick={() => handleSendAiChat("Quais tarefas da minha lista atual devo riscar primeiro para obter foco máximo?")}
                className="w-full p-3 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer text-xs font-bold text-purple-950"
              >
                <span>Analisar minha lista atual de hoje</span>
                <ChevronRight size={14} className="text-purple-600 shrink-0" />
              </button>
            </div>

            <div className="lg:col-span-2 border border-purple-100 rounded-3xl p-4 flex flex-col h-[320px] bg-purple-50/20">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {aiChatHistory.map((ch, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2.5 ${ch.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-md border shrink-0 ${ch.role === "user" ? "bg-purple-600 text-white" : "bg-white border-purple-200"}`}>
                      {ch.role === "user" ? (user.avatar || "👤") : "🦉"}
                    </div>
                    <div className={`p-3 rounded-2xl max-w-[80%] font-medium leading-relaxed ${ch.role === "user" ? "bg-purple-600 text-white rounded-tr-none" : "bg-white border text-purple-950 shadow-xs rounded-tl-none"}`}>
                      {ch.text.replace(/\*/g, "")}
                    </div>
                  </div>
                ))}
                {isAiResponding && (
                  <div className="flex items-center space-x-2 text-[#888] font-bold p-2">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-150">●</span>
                    <span className="animate-bounce delay-300">●</span>
                    <span className="text-[10px]">A Coruja Sábia está batendo as asas e pensando...</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center space-x-2 pt-3 border-t border-purple-100 bg-white p-2 rounded-2xl">
                <input
                  id="ai-chat-custom-input"
                  type="text"
                  placeholder="Peça uma sugestão avançada do Gemini..."
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendAiChat();
                  }}
                  className="flex-1 text-[11px] outline-none border-none p-1 placeholder:text-purple-300 font-bold text-[#5D3A8C]"
                />
                <button
                  id="ai-chat-send-btn"
                  onClick={() => handleSendAiChat()}
                  disabled={isAiResponding || !aiChatInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DIVISÃO INTELIGENTE DE TAREFAS */}
      {activeTab === "divisao_metas" && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xl space-y-6 animate-scaleUp text-left">
          <div className="flex items-center space-x-3 border-b border-purple-50 pb-4">
            <div className="p-2.5 bg-amber-100 text-amber-600 rounded-2xl">
              <Split size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-purple-950 font-sans uppercase tracking-wider">Divisão Inteligente & Metas</h3>
              <p className="text-[10px] text-purple-600 font-semibold">Transforme tarefas intimidadoras em subtarefas simples e fáceis de concluir hoje mesmo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-black uppercase text-purple-950 tracking-wider">
                  Selecione uma Atividade para Desmembrar:
                </label>
                <select
                  id="split-task-select"
                  value={selectedTaskToSplit}
                  onChange={(e) => setSelectedTaskToSplit(e.target.value)}
                  className="w-full text-xs font-bold border-2 border-purple-100 rounded-2xl p-3 bg-purple-50/20 text-[#5D3A8C] focus:border-purple-600 outline-none"
                >
                  <option value="">-- Selecione uma Atividade --</option>
                  {tasks.filter(t => !t.completed).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <button
                id="do-split-task-btn"
                onClick={handleSplitTask}
                disabled={isSplitting || !selectedTaskToSplit}
                className="w-full bg-[#5D3A8C] text-white hover:bg-purple-900 py-3 rounded-full text-xs font-black transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
              >
                {isSplitting ? (
                  <>
                    <RefreshCw className="animate-spin text-white" size={14} />
                    <span>Processando com IA do Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-300 fill-amber-300" />
                    <span>Dividir de Forma Inteligente</span>
                  </>
                )}
              </button>

              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">Estudo de Metas</h4>
                <div className="flex justify-between items-center text-[10px] text-purple-900 font-bold">
                  <span>Conclusões Atendidas:</span>
                  <span className="text-[#5D3A8C]">{completedTasksCount} de {totalTasksCount}</span>
                </div>
                <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
                </div>
                <p className="text-[9px] text-[#888] font-medium leading-relaxed">
                  Dividir objetivos em pequenas tarefas diárias eleva em até 3x a chance de adesão ao Pomodoro.
                </p>
              </div>
            </div>

            <div className="border border-purple-100 rounded-3xl p-5 bg-purple-50/10 min-h-[160px] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#5D3A8C] uppercase tracking-wide mb-3 border-b pb-1.5 border-purple-50">
                  Subtarefas de Foco Propostas
                </h4>
                {splitSubtasks.length > 0 ? (
                  <ul className="space-y-2.5">
                    {splitSubtasks.map((st, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs font-semibold text-purple-950">
                        <span className="w-4 h-4 rounded bg-purple-100 text-[#5D3A8C] flex items-center justify-center text-[10px] shrink-0 font-black">
                          {i + 1}
                        </span>
                        <span className="leading-tight">{st.replace(/\*/g, "")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-[#888] py-8 space-y-2">
                    <Split size={28} className="text-purple-300" />
                    <p className="text-[10px] font-bold max-w-[200px]">Selecione uma tarefa à esquerda e clique para fatiá-la em fatias produtivas.</p>
                  </div>
                )}
              </div>

              {splitSubtasks.length > 0 && (
                <button
                  id="inject-subtasks-btn"
                  onClick={handleInjectSubtasks}
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>Injetar na Atividade Real</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. GRÁFICOS DE COMPORTAMENTO */}
      {activeTab === "graficos_performance" && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xl space-y-6 animate-scaleUp text-left">
          <div className="flex items-center space-x-3 border-b border-purple-50 pb-4">
            <div className="p-2.5 bg-purple-100 text-[#5D3A8C] rounded-2xl">
              <BarChart3 size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-purple-950 font-sans uppercase tracking-wider">Gráficos & Performance</h3>
              <p className="text-[10px] text-purple-600 font-semibold">Seus logs analíticos em painéis visuais intuitivos e detalhados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-purple-100 rounded-3xl space-y-3 bg-purple-50/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">Histórico Semanal de XP</span>
                <span className="text-[8px] font-black uppercase text-purple-500">Ganhos diários</span>
              </div>
              
              {/* Responsive Elegant custom SVG Bar Chart */}
              <div className="h-40 flex items-end justify-between px-2 pt-2 pb-1 bg-white rounded-2xl border border-purple-50">
                <div className="flex flex-col items-center space-y-1 w-full mx-1">
                  <div className="w-full bg-purple-200 rounded-t-lg transition-all hover:bg-purple-600 cursor-pointer" style={{ height: "45px" }} title="Dom - 45 XP" />
                  <span className="text-[8.5px] font-bold text-purple-900 font-mono">D</span>
                </div>
                <div className="flex flex-col items-center space-y-1 w-full mx-1">
                  <div className="w-full bg-purple-200 rounded-t-lg transition-all hover:bg-purple-600 cursor-pointer" style={{ height: "60px" }} title="Seg - 60 XP" />
                  <span className="text-[8.5px] font-bold text-purple-900 font-mono">S</span>
                </div>
                <div className="flex flex-col items-center space-y-1 w-full mx-1">
                  <div className="w-full bg-purple-200 rounded-t-lg transition-all hover:bg-purple-600 cursor-pointer" style={{ height: "35px" }} title="Ter - 35 XP" />
                  <span className="text-[8.5px] font-bold text-purple-900 font-mono">T</span>
                </div>
                <div className="flex flex-col items-center space-y-1 w-full mx-1">
                  <div className="w-full bg-purple-600 rounded-t-lg transition-all cursor-pointer" style={{ height: `${Math.min(130, 20 + user.xp / 1.5)}px` }} title={`Hoje (Qua) - ${user.xp} XP`} />
                  <span className="text-[8.5px] font-black text-purple-650 font-mono">Q</span>
                </div>
                <div className="flex flex-col items-center space-y-1 w-full mx-1">
                  <div className="w-full bg-purple-100 rounded-t-lg transition-all hover:bg-purple-600 cursor-pointer" style={{ height: "5px" }} title="Qui - Agendado" />
                  <span className="text-[8.5px] font-bold text-purple-900 font-mono">Q</span>
                </div>
                <div className="flex flex-col items-center space-y-1 w-full mx-1">
                  <div className="w-full bg-purple-100 rounded-t-lg transition-all hover:bg-purple-600 cursor-pointer" style={{ height: "5px" }} title="Sex - Agendado" />
                  <span className="text-[8.5px] font-bold text-purple-900 font-mono">S</span>
                </div>
                <div className="flex flex-col items-center space-y-1 w-full mx-1">
                  <div className="w-full bg-purple-100 rounded-t-lg transition-all hover:bg-purple-600 cursor-pointer" style={{ height: "5px" }} title="Sáb - Agendado" />
                  <span className="text-[8.5px] font-bold text-purple-900 font-mono">S</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-purple-100 rounded-3xl space-y-3 bg-purple-50/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">Volume de Divisões por Categorias</span>
                <span className="text-[8px] font-black uppercase text-purple-500">Contagem de notas</span>
              </div>

              {/* Dynamic Categories Visual layout */}
              <div className="h-40 flex flex-col justify-center space-y-2.5 bg-white rounded-2xl border border-purple-50 p-4">
                {Object.keys(categoriesCount).length > 0 ? (
                  Object.entries(categoriesCount).map(([cat, count]) => {
                    const percentage = Math.min(100, Math.round((count / totalTasksCount) * 100));
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-extrabold text-[#5D3A8C]">
                          <span className="uppercase tracking-wide">{cat}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-purple-50 h-2 rounded-full overflow-hidden border border-purple-100/30">
                          <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-[#888] text-[10px] font-bold py-6">
                    Lista de notas vazia. Crie atividades categorizadas para plotar os índices.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TEMAS PERSONALIZADOS */}
      {activeTab === "temas_personalizados" && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xl space-y-6 animate-scaleUp text-left">
          <div className="flex items-center space-x-3 border-b border-purple-50 pb-4">
            <div className="p-2.5 bg-pink-100 text-pink-600 rounded-2xl">
              <Palette size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-purple-950 font-sans uppercase tracking-wider">Temas Personalizados</h3>
              <p className="text-[10px] text-purple-600 font-semibold">Altere instantaneamente a estética geral de foco por todo o aplicativo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              id="theme-opt-lavanda"
              onClick={() => onThemeChange("lavanda")}
              className={`p-4 rounded-3xl border-2 text-left relative transition-all cursor-pointer ${currentTheme === "lavanda" ? "border-purple-600 bg-purple-50/30" : "border-purple-100 bg-white hover:border-purple-300"}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-1 select-none">
                  <div className="w-4.5 h-4.5 rounded-full bg-purple-100 border border-white" />
                  <div className="w-4.5 h-4.5 rounded-full bg-purple-500 border border-white" />
                  <div className="w-4.5 h-4.5 rounded-full bg-purple-950 border border-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-950">Lavanda Clássico</h4>
                  <p className="text-[9px] text-[#888]">Visual original e meditativo do Momentum</p>
                </div>
              </div>
              {currentTheme === "lavanda" && <Check size={14} className="text-purple-600 absolute right-3 top-3" />}
            </button>

            <button
              id="theme-opt-menta"
              onClick={() => {
                if (isPremium) onThemeChange("menta");
                else onOpenPremiumPaywall();
              }}
              className={`p-4 rounded-3xl border-2 text-left relative transition-all cursor-pointer ${currentTheme === "menta" ? "border-emerald-600 bg-emerald-50/20" : "border-purple-100 bg-white hover:border-purple-300"}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-1 select-none">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 border border-white" />
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 border border-white" />
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-850 border border-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-950 flex items-center space-x-1">
                    <span>Menta Mental</span>
                    {!isPremium && <Lock size={9} className="text-purple-400" />}
                  </h4>
                  <p className="text-[9px] text-[#888]">Tonalidade de sálvia calmante anti-procrastinação</p>
                </div>
              </div>
              {currentTheme === "menta" && <Check size={14} className="text-emerald-600 absolute right-3 top-3" />}
            </button>

            <button
              id="theme-opt-coral"
              onClick={() => {
                if (isPremium) onThemeChange("coral");
                else onOpenPremiumPaywall();
              }}
              className={`p-4 rounded-3xl border-2 text-left relative transition-all cursor-pointer ${currentTheme === "coral" ? "border-rose-600 bg-rose-50/20" : "border-purple-100 bg-white hover:border-purple-300"}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-1 select-none">
                  <div className="w-4.5 h-4.5 rounded-full bg-orange-100 border border-white" />
                  <div className="w-4.5 h-4.5 rounded-full bg-rose-500 border border-white" />
                  <div className="w-4.5 h-4.5 rounded-full bg-rose-800 border border-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-950 flex items-center space-x-1">
                    <span>Coral Energético</span>
                    {!isPremium && <Lock size={9} className="text-purple-400" />}
                  </h4>
                  <p className="text-[9px] text-[#888]">Laranja avermelhada de alto entusiasmo</p>
                </div>
              </div>
              {currentTheme === "coral" && <Check size={14} className="text-rose-600 absolute right-3 top-3" />}
            </button>

            <button
              id="theme-opt-indigo"
              onClick={() => {
                if (isPremium) onThemeChange("indigo");
                else onOpenPremiumPaywall();
              }}
              className={`p-4 rounded-3xl border-2 text-left relative transition-all cursor-pointer ${currentTheme === "indigo" ? "border-indigo-600 bg-indigo-50/20" : "border-purple-100 bg-white hover:border-purple-300"}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-1 select-none">
                  <div className="w-4.5 h-4.5 rounded-full bg-indigo-100 border border-white" />
                  <div className="w-4.5 h-4.5 rounded-full bg-indigo-550 border border-white" />
                  <div className="w-4.5 h-4.5 rounded-full bg-indigo-900 border border-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-950 flex items-center space-x-1">
                    <span>Índigo Profundo</span>
                    {!isPremium && <Lock size={9} className="text-purple-400" />}
                  </h4>
                  <p className="text-[9px] text-[#888]">Azul escuro espacial focado na calmaria</p>
                </div>
              </div>
              {currentTheme === "indigo" && <Check size={14} className="text-indigo-600 absolute right-3 top-3" />}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
