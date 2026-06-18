import React, { useState, useEffect, useRef } from "react";
import { UserProfile, NoteTask } from "../types";
import { Sparkles, Send, Sparkle, Bot, AlertCircle, RefreshCw } from "lucide-react";
import OwlLogo from "./OwlLogo";

interface WiseOwlChatProps {
  user: UserProfile;
  tasks: NoteTask[];
  onOpenPremiumPaywall: () => void;
}

interface Message {
  sender: "user" | "owl";
  text: string;
  timestamp: string;
}

export default function WiseOwlChat({ user, tasks, onOpenPremiumPaywall }: WiseOwlChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "owl",
      text: `Olá, **${user.username || "amigo"}**! Sou a **Coruja Sábia**, sua mentora de produtividade. Estou aqui para bater asas e empurrar a procrastinação para longe! Pergunte qualquer coisa ou peça conselhos sobre suas metas de hoje!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Rotating tips for free plan
  const rotatingTips = [
    "Dividir uma tarefa em blocos de foco de 25 minutos (Pomodoro) reduz o cansaço acumulado.",
    "O primeiro passo é sempre o mais duro: tente a regra dos 5 minutos para engatar.",
    "Evite realizar tarefas paralelas. Foque em riscar uma única atividade por vez.",
    "Planeje o seu dia na noite anterior para acordar com foco total nas prioridades.",
    "Comemore suas vitórias diárias: cada progresso te traz mais perto do seu próximo nível!",
    "Faça pausas de 5 minutos distantes de telas para manter sua energia renovada."
  ];

  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (user.plan === "premium") return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % rotatingTips.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [user.plan]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    if (user.plan !== "premium") {
      onOpenPremiumPaywall();
      return;
    }

    const userMessageText = inputVal.trim();
    setInputVal("");
    
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { sender: "user", text: userMessageText, timestamp: timeStr };
    
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          prompt: userMessageText,
          plan: user.plan,
          tasks: tasks.map(t => ({
            title: t.title,
            completed: t.completed,
            difficulty: t.difficulty,
            category: t.category,
            content: t.content,
            isStarred: t.isStarred,
            date: t.date
          })),
          history: messages.map(m => ({ role: m.sender === "user" ? "user" : "model", text: m.text }))
        })
      });

      const data = await response.json();
      const owlMsg: Message = {
        sender: "owl",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, owlMsg]);
    } catch (err) {
      console.error(err);
      // Fallback response with beautiful mentoring
      setTimeout(() => {
        const errorReply: Message = {
          sender: "owl",
          text: `🦉 *Huu-Huu!* Eu bati minhas asas, mas tive uma falha de conexão temporária. 

Sua lista de tarefas tem **${tasks.filter(t => !t.completed).length} itens em aberto**. Minha dica de ouro hoje é focar na de maior dificuldade e completá-la primeiro para destravar mais XP! Vamos focar?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, errorReply]);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let formatted = line;
      // Bold text replacement
      const boldRegex = /\*\*(.*?)\*\*/g;
      formatted = formatted.replace(boldRegex, "<strong>$1</strong>");
      
      // Italic text replacement
      const italicRegex = /\*(.*?)\*/g;
      formatted = formatted.replace(italicRegex, "<em>$1</em>");

      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const pureText = formatted.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-[11px] text-purple-950/80 mb-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: pureText }} />
        );
      }
      
      if (line.trim() === "") {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="text-[11px] text-purple-950/85 leading-relaxed font-sans" dangerouslySetInnerHTML={{ __html: formatted }} style={{ wordBreak: "break-word" }} />
      );
    });
  };

  if (user.plan !== "premium") {
    // FREE / STANDARD OWL INTERFACE (Tip Carousel)
    return (
      <div id="free-owl-assistant" className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-purple-50 pb-3">
          <div className="bg-purple-100/80 text-purple-600 p-2 rounded-2xl shrink-0">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-purple-950 font-sans flex items-center space-x-1">
              <span>Conselho da Coruja Sábia</span>
              <span className="bg-purple-50 text-purple-600 font-extrabold text-[7px] tracking-wider px-1.5 py-0.5 rounded ml-1 uppercase">PLAN padrão</span>
            </h3>
            <p className="text-[9.5px] text-[#888]">Tips rotativas gratuitas de nossa mascote mentora</p>
          </div>
        </div>

        {/* Floating carousel box */}
        <div className="bg-[#FBF9FE] border border-purple-100 rounded-2xl p-4 flex items-start space-x-3 text-left min-h-[75px] animate-scaleUp">
          <div className="shrink-0 container-center mt-0.5 text-xl">
            🦉
          </div>
          <div className="space-y-1 flex-1">
            <span className="text-[9px] font-black tracking-wider text-purple-500 uppercase">Foco & Disciplina</span>
            <p className="text-[11px] text-purple-950/80 leading-relaxed font-sans">{rotatingTips[tipIndex]}</p>
          </div>
          <button
            id="rotate-tip-btn"
            onClick={() => setTipIndex((prev) => (prev + 1) % rotatingTips.length)}
            className="text-purple-400 hover:text-purple-600 p-1 rounded-lg transition-colors cursor-pointer shrink-0 mt-0.5"
          >
            <RefreshCw size={12} />
          </button>
        </div>

        {/* Premium Upgrade callout */}
        <div
          id="owl-premium-chat-unlock"
          onClick={onOpenPremiumPaywall}
          className="bg-gradient-to-tr from-purple-100/90 to-indigo-50/20 border border-purple-200/50 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-xs transition-shadow text-left"
        >
          <div className="flex items-center space-x-3.5">
            <OwlLogo size={36} pulse />
            <div>
              <span className="text-[10px] font-extrabold text-purple-950 block">Converse com a Coruja Sábia 💬</span>
              <p className="text-[9px] text-[#666] leading-normal">
                Faça perguntas em tempo real, divida projetos e resolva bloqueios de procrastinação via IA.
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-purple-700 font-sans shrink-0 ml-2">Premium →</span>
        </div>
      </div>
    );
  }

  // PREMIUM INTUITIVE CHAT SYSTEM
  return (
    <div id="premium-owl-assistant" className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm flex flex-col space-y-3.5 max-h-[460px]">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-purple-50 pb-2.5 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="bg-purple-100 text-purple-600 p-2 rounded-2xl select-none relative">
            <Bot size={18} />
            <div className="absolute top-[-2px] right-[-2px] w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-purple-950 font-sans flex items-center space-x-1">
              <span>Coruja Sábia AI</span>
              <Sparkles size={11} className="text-amber-500 fill-amber-500" />
            </h3>
            <p className="text-[9.5px] text-emerald-600 font-bold">Ativa • Respondendo em segundos</p>
          </div>
        </div>
        <span className="text-[8px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase select-none">
          Membro Premium
        </span>
      </div>

      {/* Messages viewport */}
      <div
        id="owl-messages-history-viewport"
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 min-h-[160px] max-h-[220px] pr-1.5 no-scrollbar py-1"
      >
        {messages.map((m, idx) => {
          const isOwl = m.sender === "owl";
          return (
            <div
              key={idx}
              className={`flex items-start ${isOwl ? "justify-start text-left" : "justify-end text-right"} space-x-2 animate-scaleUp`}
            >
              {isOwl && (
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs shrink-0 select-none border border-purple-150">
                  🦉
                </div>
              )}
              
              <div className="max-w-[82%] flex flex-col space-y-0.5">
                <div
                  className={`p-3 rounded-2xl text-xs space-y-1 shadow-sm leading-relaxed ${
                    isOwl
                      ? "bg-[#FBF9FE] text-purple-950 border border-purple-100/50 rounded-tl-sm text-left"
                      : "bg-[#5D3A8C] text-white rounded-tr-sm text-left"
                  }`}
                >
                  {isOwl ? renderContent(m.text) : <p className="font-sans leading-snug">{m.text}</p>}
                </div>
                <span className="text-[8px] text-purple-400 font-bold px-1">{m.timestamp}</span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-2 text-left animate-pulse">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs shrink-0 select-none">
              🦉
            </div>
            <div className="bg-[#FBF9FE] border border-purple-100/50 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-1.5">
              <span className="text-[10px] text-purple-500 font-bold tracking-wide">Coruja Sábia escrevendo</span>
              <div className="flex space-x-0.5 mt-0.5">
                <span className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message input form */}
      <form onSubmit={handleSend} id="wise-owl-chat-form" className="flex items-center space-x-2 shrink-0">
        <input
          id="owl-chat-prompt-input"
          type="text"
          maxLength={150}
          disabled={loading}
          placeholder="Pergunte sobre foco, tarefas ou produtividade..."
          className="flex-1 bg-[#FBF9FE] border border-purple-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-1.5 focus:ring-purple-400 font-sans disabled:opacity-60"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <button
          id="owl-chat-send-btn"
          type="submit"
          disabled={loading || !inputVal.trim()}
          className="bg-[#5D3A8C] hover:bg-purple-900 disabled:opacity-50 text-white p-3 rounded-2xl shadow transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <Send size={14} className="stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
