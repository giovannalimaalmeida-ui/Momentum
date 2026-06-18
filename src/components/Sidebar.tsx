import React, { useState, useEffect } from "react";
import { User, Layers, Star, Palette, Settings, LogOut, ArrowLeft, ShieldOff, Sparkles, LineChart, Lock, Eye, Cpu, Split, BarChart3, TrendingUp, ChevronDown, ChevronUp, CalendarCheck } from "lucide-react";
import OwlLogo from "./OwlLogo";
import { UserProfile } from "../types";
import { translations } from "../translations";

interface SidebarProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPremiumPaywall: () => void;
}

export default function Sidebar({
  user,
  isOpen,
  onClose,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenPremiumPaywall,
}: SidebarProps) {
  if (!isOpen) return null;

  const lang = user.language || "pt";
  const t = translations[lang];

  const premiumIds = [
    "diarias",
    "foco_clean",
    "sugestoes_ia",
    "divisao_metas",
    "graficos_performance",
    "temas_personalizados"
  ];

  const [isPremiumExpanded, setIsPremiumExpanded] = useState(() => premiumIds.includes(activeTab));

  useEffect(() => {
    if (premiumIds.includes(activeTab)) {
      setIsPremiumExpanded(true);
    }
  }, [activeTab]);

  const standardItems = [
    { id: "atividades", label: t.myActivities, icon: <Layers size={18} /> },
    { id: "conta", label: t.accountTab, icon: <User size={18} /> },
    { id: "star", label: t.starTasks, icon: <Star size={18} /> },
    { id: "configuracoes", label: t.settingsTab, icon: <Settings size={18} /> },
  ];

  const premiumFeatures = [
    { id: "diarias", label: "Tarefas Diárias", icon: <CalendarCheck size={18} className="text-purple-600" /> },
    { id: "foco_clean", label: "Foco Livre de Poluição", icon: <Eye size={18} className="text-emerald-500" /> },
    { id: "sugestoes_ia", label: "Sugestões de IA Avançadas", icon: <Cpu size={18} className="text-indigo-500 animate-pulse" /> },
    { id: "divisao_metas", label: "Divisão de Tarefas & Metas", icon: <Split size={18} className="text-amber-500" /> },
    { id: "graficos_performance", label: "Gráficos & Performance", icon: <BarChart3 size={18} className="text-[#5D3A8C]" /> },
    { id: "temas_personalizados", label: "Temas Personalizados", icon: <Palette size={18} className="text-pink-500" /> },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        id="sidebar-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40 transition-opacity duration-300"
      />

      {/* Main Drawer Shell */}
      <div
        id="sidebar-drawer"
        className="fixed top-0 left-0 h-full w-72 bg-white flex flex-col justify-between z-50 shadow-2xl animate-slideRight border-r border-purple-100/30"
      >
        <div id="sidebar-upper-container" className="flex flex-col">
          {/* Header section (Page 6) with brand and close arrow */}
          <div className="p-5 flex items-center justify-between border-b border-purple-50">
            <div className="flex items-center space-x-3">
              <OwlLogo size={42} />
              <div className="flex flex-col">
                <span className="text-xl font-black text-[#5D3A8C] tracking-tight font-sans">
                  Momentum
                </span>
                <span className="text-[10px] text-[#888] font-semibold uppercase tracking-wider">
                  {t.owlMascotSub}
                </span>
              </div>
            </div>
            <button
               id="close-sidebar-btn"
              onClick={onClose}
              className="p-1 px-2 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          </div>

          {/* User Profile Info Summary inside drawer */}
          <div className="p-5 bg-gradient-to-r from-purple-50/50 to-pink-50/30 flex items-center space-x-3">
            <div className="w-11 h-11 bg-white border-2 border-purple-200 rounded-full flex items-center justify-center text-2xl shadow-sm">
              {user.avatar || "🦉"}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-bold text-xs text-purple-950 truncate">{user.username || "Guest"}</div>
              <div className="text-[9px] text-[#888] truncate">{user.email || "guest@momentum.app"}</div>
              
              <div className="mt-1 flex items-center">
                <span
                  id="user-badge"
                  onClick={() => {
                    if (user.plan === "free") {
                      onOpenPremiumPaywall();
                      onClose();
                    }
                  }}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                    user.plan === "premium"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  }`}
                >
                  {user.plan === "premium" ? "★ Premium" : t.standardPlanLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav id="sidebar-navigation" className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
            {/* Standard menu items first */}
            {standardItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === item.id
                    ? "bg-purple-100 text-[#5D3A8C] shadow-sm"
                    : "text-purple-900 hover:bg-purple-50/70"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`${activeTab === item.id ? "text-[#5D3A8C]" : "text-purple-500"}`}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
              </button>
            ))}

            {/* Premium Divider & Header Option */}
            <div className="pt-2">
              <button
                id="nav-recursos-premium-trigger"
                onClick={() => setIsPremiumExpanded(!isPremiumExpanded)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  premiumIds.includes(activeTab)
                    ? "bg-purple-50 text-[#5D3A8C] border border-purple-100"
                    : "text-purple-900 hover:bg-purple-50/70"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="text-amber-500">
                    <Sparkles size={18} className="fill-amber-100 animate-pulse" />
                  </div>
                  <span>Recursos Premium</span>
                </div>
                <div className="text-purple-500">
                  {isPremiumExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Nested Premium options */}
              {isPremiumExpanded && (
                <div id="nested-premium-links" className="pl-3 mt-1 border-l-2 border-purple-100 space-y-1 ml-6 animate-fadeIn py-1">
                  {premiumFeatures.map((item) => (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                        activeTab === item.id
                          ? "bg-purple-100 text-[#5D3A8C] font-bold shadow-xs"
                          : "text-purple-800 hover:bg-purple-50/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className={`${activeTab === item.id ? "text-[#5D3A8C]" : "text-purple-400"}`}>
                          {item.icon}
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {user.plan !== "premium" && (
                        <Lock size={10} className="text-purple-400 stroke-[2.5] shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Footer/Logout Area */}
        <div id="sidebar-footer" className="p-4 border-t border-purple-50 bg-purple-50/20">
          {user.plan !== "premium" && (
            <div id="premium-locked-drawer" className="bg-gradient-to-tr from-[#FAF5FF] to-[#F1E8FC] p-4 rounded-3xl border border-purple-200 mb-4 space-y-3 shadow-xs text-left">
              <span className="text-[10px] font-black uppercase text-purple-950 tracking-wider flex items-center space-x-1.5">
                <Lock size={12} className="text-purple-600 stroke-[2.5]" />
                <span>Desbloquear Premium</span>
              </span>
              
              <ul className="space-y-2 pointer-events-none">
                <li className="flex items-center space-x-2 text-[9.5px]">
                  <Eye size={13} className="text-purple-600" />
                  <span className="font-bold text-purple-950">Foco Livre de Poluição</span>
                </li>
                <li className="flex items-center space-x-2 text-[9.5px]">
                  <Sparkles size={13} className="text-purple-600" />
                  <span className="font-bold text-purple-950">IA Avançada (Coruja Sábia Chat)</span>
                </li>
                <li className="flex items-center space-x-2 text-[9.5px]">
                  <Split size={13} className="text-purple-600" />
                  <span className="font-bold text-purple-950">Divisão de Tarefas & Metas</span>
                </li>
                <li className="flex items-center space-x-2 text-[9.5px]">
                  <Palette size={13} className="text-purple-600" />
                  <span className="font-bold text-purple-950">Temas de Cores Exclusivos</span>
                </li>
              </ul>

              <button
                id="sidebar-unlock-btn"
                onClick={() => {
                  onOpenPremiumPaywall();
                  onClose();
                }}
                className="w-full text-center bg-[#5D3A8C] hover:bg-purple-900 text-white font-extrabold text-[10px] py-1.5 rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors mt-1"
              >
                <span>Escolher Plano</span>
                <span>→</span>
              </button>
            </div>
          )}

          {/* Logout button (Page 6) */}
          <button
            id="sair-sidebar-btn"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <LogOut size={18} />
            <span>{t.logoutButton}</span>
          </button>
        </div>
      </div>
    </>
  );
}
