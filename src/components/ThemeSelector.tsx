import React from "react";
import { UserProfile } from "../types";
import { Palette, Lock, Check } from "lucide-react";

interface ThemeSelectorProps {
  user: UserProfile;
  currentTheme: "lavanda" | "menta" | "coral" | "indigo";
  onThemeChange: (theme: "lavanda" | "menta" | "coral" | "indigo") => void;
  onOpenPremiumPaywall: () => void;
}

export default function ThemeSelector({
  user,
  currentTheme,
  onThemeChange,
  onOpenPremiumPaywall
}: ThemeSelectorProps) {
  const themes = [
    {
      id: "lavanda" as const,
      name: "Lavanda Clássico",
      desc: "Branding original do Momentum",
      colors: ["bg-purple-100", "bg-purple-500", "bg-purple-800"],
      colorBadge: "bg-purple-500"
    },
    {
      id: "menta" as const,
      name: "Menta Mental",
      desc: "Verde sálvia calmante anti-estresse",
      colors: ["bg-emerald-100", "bg-emerald-500", "bg-emerald-850"],
      colorBadge: "bg-emerald-500"
    },
    {
      id: "coral" as const,
      name: "Coral Energético",
      desc: "Laranja avermelhado com alta energia",
      colors: ["bg-orange-100", "bg-rose-500", "bg-rose-800"],
      colorBadge: "bg-rose-500"
    },
    {
      id: "indigo" as const,
      name: "Índigo Profundo",
      desc: "Azul escuro espacial ultra-focado",
      colors: ["bg-indigo-100", "bg-indigo-505", "bg-indigo-900"],
      colorBadge: "bg-indigo-600"
    }
  ];

  const handleSelectTheme = (themeId: "lavanda" | "menta" | "coral" | "indigo") => {
    if (user.plan !== "premium" && themeId !== "lavanda") {
      onOpenPremiumPaywall();
      return;
    }
    onThemeChange(themeId);
  };

  return (
    <div id="theme-selector-card" className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-purple-50 pb-3">
        <div className="bg-purple-100 text-purple-600 p-1.5 rounded-xl">
          <Palette size={16} />
        </div>
        <div>
          <h3 className="text-xs font-bold text-purple-950 font-sans">Aparência & Cores</h3>
          <p className="text-[10px] text-[#888]">Mude o visual do Momentum de acordo com seu humor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {themes.map((t) => {
          const isSelected = currentTheme === t.id;
          const isLocked = user.plan !== "premium" && t.id !== "lavanda";

          return (
            <button
              key={t.id}
              id={`theme-btn-${t.id}`}
              onClick={() => handleSelectTheme(t.id)}
              className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between text-left transition-all relative cursor-pointer ${
                isSelected
                  ? "border-purple-600 bg-purple-50/50 shadow-sm"
                  : "border-purple-100 bg-white hover:border-purple-300"
              }`}
            >
              <div className="flex items-center space-x-3.5">
                {/* Visual live colors thumbnail */}
                <div className="flex -space-x-1.5 shrink-0 select-none">
                  <div className={`w-5 h-5 rounded-full border border-white ${t.colors[0]}`} />
                  <div className={`w-5 h-5 rounded-full border border-white ${t.colors[1]}`} />
                  <div className={`w-5 h-5 rounded-full border border-white ${t.colors[2] || "bg-purple-950"}`} />
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-purple-950 font-sans flex items-center space-x-1">
                    <span>{t.name}</span>
                    {isSelected && (
                      <span className="text-[9px] bg-purple-600 text-white font-black px-1.5 py-0.5 rounded-md uppercase ml-1.5">
                        Ativo
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] text-[#888] font-sans leading-normal">
                    {t.desc}
                  </span>
                </div>
              </div>

              {isLocked ? (
                <div className="bg-purple-100/50 text-purple-500 p-1.5 rounded-xl shrink-0">
                  <Lock size={12} className="stroke-[2.5]" />
                </div>
              ) : (
                isSelected && (
                  <div className="bg-purple-600 text-white p-1 rounded-full shrink-0 shadow-sm">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                )
              )}
            </button>
          );
        })}
      </div>

      {user.plan !== "premium" && (
        <div
          id="theme-unlock-cta"
          onClick={onOpenPremiumPaywall}
          className="bg-gradient-to-tr from-purple-100/80 to-pink-50/20 border border-purple-200/50 p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center space-x-2 text-left">
            <span className="text-sm">🎨</span>
            <div>
              <span className="text-[10px] font-extrabold text-purple-950 block">Desbloqueie Temas Exclusivos</span>
              <p className="text-[9px] text-purple-600/70">Mude o visual do aplicativo para Menta, Coral ou Índigo.</p>
            </div>
          </div>
          <span className="text-xs font-black text-purple-700">Premium →</span>
        </div>
      )}
    </div>
  );
}
