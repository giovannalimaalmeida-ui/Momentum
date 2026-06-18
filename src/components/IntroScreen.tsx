import React, { useState } from "react";
import OwlLogo from "./OwlLogo";
import { Layers, Clock, Award, ChevronRight } from "lucide-react";

interface IntroScreenProps {
  onNext: () => void;
}

export default function IntroScreen({ onNext }: IntroScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Organize suas tarefas sem procrastinar",
      desc: "Divida seus afazeres de forma prática, defina pesos de dificuldade e atinja metas acadêmicas consistentes sem se sobrecarregar.",
      icon: <Layers size={42} className="text-purple-600 animate-pulse" />,
      accent: "from-purple-500 to-indigo-500",
      bgLight: "bg-purple-400/10"
    },
    {
      title: "Foque com o Pomodoro adaptativo",
      desc: "Minimize interrupções por ciclos de foco estruturados e alertas de autoajuda inteligentes desenhados para proteger sua saúde mental.",
      icon: <Clock size={42} className="text-pink-600 animate-spin-slow" />,
      accent: "from-pink-500 to-rose-500",
      bgLight: "bg-rose-400/10"
    },
    {
      title: "Colete moedas e suba de nível",
      desc: "Conquiste moedas virtuais por suas vitórias e conquiste seu pódio de produtividade com gamificação real.",
      icon: <Award size={42} className="text-amber-500" />,
      accent: "from-amber-400 to-orange-500",
      bgLight: "bg-amber-400/10"
    }
  ];

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onNext();
    }
  };

  return (
    <div id="intro-screen-container" className="min-h-screen bg-gradient-to-b from-[#FAF8FF] via-[#F4EEFC] to-[#FAF8FF] flex flex-col justify-between p-6 font-sans relative overflow-hidden">
      
      {/* Decorative Blur Background Lights */}
      <div className="absolute top-[-10%] left-[-20%] w-72 h-72 rounded-full bg-purple-300/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-25%] w-80 h-80 rounded-full bg-pink-200/20 blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-64 h-64 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />

      {/* Top Header Section */}
      <div className="flex flex-col items-center pt-6 z-10">
        <div className="bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-purple-100/60 shadow-sm flex items-center space-x-2.5 hover:scale-102 transition-transform duration-300">
          <OwlLogo size={34} pulse={currentSlide === 2} />
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm font-black text-purple-950 tracking-tight font-sans">
              Momentum
            </span>
            <span className="text-[9px] uppercase tracking-wider text-purple-500 font-bold">
              Estudos & Foco
            </span>
          </div>
        </div>
      </div>

      {/* Slide Card - Glassmorphic Aesthetic Frame */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-6.5 shadow-[0_20px_40px_rgba(93,58,140,0.06)] border border-white/60 flex-1 max-w-sm w-full mx-auto my-5 flex flex-col justify-between items-center text-center relative z-10 transition-all duration-300 group hover:shadow-[0_25px_50px_rgba(93,58,140,0.1)]">
        
        {/* Subtle shine band on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[32px]" />

        {/* Central Animated Illustration Frame and Content */}
        <div className="flex flex-col items-center my-auto space-y-6 w-full">
          
          {/* Central Animated Illustration Frame */}
          <div className={`w-22 h-22 rounded-3xl ${slides[currentSlide].bgLight} border border-white flex items-center justify-center relative shadow-[inset_0_2px_8px_rgba(255,255,255,1)]`}>
            {/* Outer soft orbit ring */}
            <div className="absolute inset-[-6px] rounded-[30px] border border-purple-300/20 animate-spin-slow pointer-events-none" />
            {slides[currentSlide].icon}
          </div>

          {/* Texts details with better typographical rhythms */}
          <div className="space-y-3.5 px-3">
            <h2 className="text-2xl font-black text-purple-950 tracking-tight leading-snug drop-shadow-xs">
              {slides[currentSlide].title}
            </h2>
            <p className="text-sm text-purple-800/80 leading-relaxed font-semibold">
              {slides[currentSlide].desc}
            </p>
          </div>
        </div>

        {/* Interactive progress bar dots */}
        <div className="flex items-center space-x-2.5 mt-5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              id={`intro-dot-${idx}`}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                currentSlide === idx 
                  ? "w-8 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-sm" 
                  : "w-2.5 bg-purple-200/60 hover:bg-purple-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Beautiful actionable controller buttons */}
      <div className="max-w-sm w-full mx-auto pb-6 flex flex-col items-center space-y-4 z-10">
        <button
          id="intro-action-btn"
          onClick={handleNextSlide}
          className="w-full bg-gradient-to-r from-[#5D3A8C] to-[#45276B] hover:from-[#4C2E75] hover:to-[#381E57] text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-[0_10px_20px_rgba(93,58,140,0.2)] transition-all hover:translate-y-[-1px] active:translate-y-[1px] active:scale-[0.99] cursor-pointer"
        >
          <span>{currentSlide === slides.length - 1 ? "Começar Jornada" : "Próximo"}</span>
          <ChevronRight size={15} />
        </button>

        {currentSlide < slides.length - 1 ? (
          <button
            id="intro-skip-btn"
            onClick={onNext}
            className="text-[11px] font-black text-[#5D3A8C]/70 hover:text-purple-900 tracking-wider uppercase transition-colors py-1 cursor-pointer"
          >
            Pular Introdução
          </button>
        ) : (
          <div className="h-4" /> // Spacing matching
        )}
      </div>
    </div>
  );
}

