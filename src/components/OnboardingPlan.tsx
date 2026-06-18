import React from "react";
import OwlLogo from "./OwlLogo";
import { Check, ShieldOff, Sparkles, LineChart, Palette, ArrowRight } from "lucide-react";

interface OnboardingPlanProps {
  onSelectPremium: () => void;
  onSelectFree: () => void;
}

export default function OnboardingPlan({ onSelectPremium, onSelectFree }: OnboardingPlanProps) {
  const premiumFeatures = [
    { icon: <ShieldOff size={16} className="text-purple-600" />, text: "Remover Propagandas" },
    { icon: <Sparkles size={16} className="text-purple-600" />, text: "Sugestões de IA Avançadas" },
    { icon: <LineChart size={16} className="text-purple-600" />, text: "Acompanhamento Preditivo" },
    { icon: <Palette size={16} className="text-purple-600" />, text: "Temas Personalizados" },
  ];

  return (
    <div id="onboarding-plan-container" className="min-h-screen bg-[#F3EEFA] flex flex-col justify-between p-6 font-sans">
      
      {/* Top logo */}
      <div className="flex flex-col items-center pt-8">
        <OwlLogo size={48} pulse />
        <span className="text-xl font-black text-[#5D3A8C] tracking-tight mt-1.5">
          Momentum
        </span>
      </div>

      {/* Pricing / Plan Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-purple-100 flex-1 max-w-sm w-full mx-auto my-6 flex flex-col justify-between items-center text-center animate-scaleUp">
        
        <div className="w-full space-y-4 my-auto">
          <span className="bg-purple-100 text-purple-800 font-extrabold text-[9px] tracking-wider px-3 py-1 rounded-full uppercase">
            ESCOLHA SEU PLANO
          </span>
          
          <h2 className="text-lg font-black text-purple-950 leading-snug">
            Acelere sua produtividade
          </h2>
          <p className="text-xs text-purple-700/60 leading-relaxed px-2">
            Desbloqueie todo o potencial da inteligência artificial da Coruja Momentum com o plano Premium.
          </p>

          {/* Premium Plan Highlight Box */}
          <div className="border bg-gradient-to-tr from-purple-50/50 to-indigo-50/40 p-4 rounded-2xl border-purple-200 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-[#5D3A8C]">★ MOMENTUM PREMIUM</span>
              <span className="text-xs font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">R$ 9,99/mês</span>
            </div>
            
            <div className="space-y-2 border-t border-purple-100 pt-2.5">
              {premiumFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-[11px] text-purple-950 font-medium">
                  {feat.icon}
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Standards Free Box details */}
          <div className="bg-[#FBF9FE] border border-purple-100 p-3 rounded-2xl text-left flex justify-between items-center">
            <div>
              <span className="text-[11px] font-bold text-purple-900 block">Plano Padrão</span>
              <span className="text-[10px] text-purple-500">Recursos básicos + anúncios</span>
            </div>
            <span className="text-xs font-black text-[#5D3A8C] bg-purple-100 px-2 py-0.5 rounded-full">Grátis</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="max-w-sm w-full mx-auto pb-8 space-y-3">
        <button
          id="assinar-premium-onboarding-btn"
          onClick={onSelectPremium}
          className="w-full bg-[#5D3A8C] hover:bg-purple-900 text-white font-extrabold text-sm py-4 rounded-full flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-98 cursor-pointer"
        >
          <span>Assinar Premium</span>
          <ArrowRight size={16} />
        </button>

        <button
          id="continuar-gratis-onboarding-btn"
          onClick={onSelectFree}
          className="w-full text-xs font-bold text-purple-650 hover:text-purple-800 tracking-wide text-center hover:underline block pb-2 cursor-pointer"
        >
          Continuar Grátis
        </button>
      </div>
    </div>
  );
}
