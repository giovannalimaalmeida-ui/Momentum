import React, { useState, useEffect } from "react";
import { Megaphone, ExternalLink } from "lucide-react";

interface AdSlotProps {
  plan: "free" | "premium";
}

export default function AdSlot({ plan }: AdSlotProps) {
  const [adIndex, setAdIndex] = useState(0);

  const ads = [
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

  useEffect(() => {
    if (plan !== "free") return;
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % ads.length);
    }, 8000); // Rotate ads every 8 seconds
    return () => clearInterval(interval);
  }, [plan]);

  if (plan !== "free") return null;

  const currentAd = ads[adIndex];

  return (
    <div
      id="advertisement-banner"
      className="bg-purple-50/50 border border-purple-100 p-3 rounded-2xl flex items-center justify-between space-x-3 text-left animate-scaleUp select-none"
    >
      <div className="flex items-center space-x-2.5">
        <span className="text-2xl">{currentAd.emoji}</span>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-extrabold text-purple-950 font-sans truncate">
              {currentAd.title}
            </span>
            <span className="bg-purple-100 text-purple-700 text-[7px] font-black tracking-wider px-1 py-0.5 rounded uppercase">
              Patrocinado
            </span>
          </div>
          <p className="text-[10px] text-[#777] leading-normal truncate max-w-[200px] sm:max-w-xs">
            {currentAd.desc}
          </p>
        </div>
      </div>
      
      <button
        id="ad-action-btn"
        className="bg-white border hover:bg-purple-50 border-purple-200 text-purple-700 font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap cursor-pointer transition-all shrink-0"
      >
        <span>{currentAd.cta}</span>
        <ExternalLink size={8} />
      </button>
    </div>
  );
}
