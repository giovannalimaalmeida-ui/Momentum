import React, { useState } from "react";
import OwlLogo from "./OwlLogo";
import { UserProfile, LanguageType } from "../types";
import { User, Check, Sparkles, Languages, ArrowLeft, ArrowRight, Target } from "lucide-react";

interface ProfileSetupProps {
  user: UserProfile;
  onConcludeProfile: (updatedUser: UserProfile) => void;
}

export default function ProfileSetup({ user, onConcludeProfile }: ProfileSetupProps) {
  const [step, setStep] = useState<"customization" | "language">("customization");
  const [username, setUsername] = useState(user.username || "");
  const [selectedAvatarId, setSelectedAvatarId] = useState(user.avatar_id || "owl-lavanda");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>("pt");

  // Pre-defined SVG owls in 6 distinct branding colors
  const owlPresets = [
    { id: "owl-lavanda", name: "Coruja Clássica", colorClass: "text-purple-500", emoji: "🦉" },
    { id: "owl-indigo", name: "Coruja Estudiosa", colorClass: "text-indigo-600", emoji: "🦉🎓" },
    { id: "owl-pink", name: "Coruja Criativa", colorClass: "text-pink-500", emoji: "🦉✨" },
    { id: "owl-blue", name: "Coruja Dorminhoca", colorClass: "text-blue-500", emoji: "🦉💤" },
    { id: "owl-amber", name: "Coruja Trabalhadora", colorClass: "text-amber-500", emoji: "🦉💼" },
    { id: "owl-emerald", name: "Coruja Produtiva", colorClass: "text-emerald-600", emoji: "🦉🚀" },
  ];

  const currentPreset = owlPresets.find((p) => p.id === selectedAvatarId) || owlPresets[0];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("language");
  };

  const handleConclude = () => {
    const finalUsername = username.trim() || "Guest";
    const finalAvatar = currentPreset.emoji;

    const updatedUser: UserProfile = {
      ...user,
      username: finalUsername,
      avatar: finalAvatar,
      avatar_id: selectedAvatarId,
      language: selectedLanguage,
      onboarded: true, // Mark onboarded as true
    };

    // Save profile to local storage under their e-mail
    if (user.email && user.email !== "guest@momentum.app") {
      localStorage.setItem(`momentum_profile_${user.email}`, JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem("momentum_guest_profile", JSON.stringify(updatedUser));
    }

    onConcludeProfile(updatedUser);
  };

  return (
    <div
      id="profile-setup-container"
      className="relative min-h-screen bg-[#F3EEFA] flex flex-col items-center justify-center p-6 md:py-12 font-sans"
    >
      {/* Decorative Cloud background */}
      <div id="cloud-setup-bg" className="absolute bottom-5 right-5 opacity-30 select-none pointer-events-none">
        <svg width="240" height="150" viewBox="0 0 100 80" fill="none">
          <path d="M10,50 Q25,30 45,45 Q65,30 85,50 Q105,75 50,75 Q10,75 10,50 Z" fill="#E4D6F5" stroke="#D1BBEA" strokeWidth="2" />
        </svg>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 z-10 flex flex-col items-center animate-scaleUp">
        
        {/* Progress indicator */}
        <div className="flex items-center space-x-1.5 mb-6 bg-purple-50 px-3.5 py-1.5 rounded-full text-[10px] uppercase font-black text-purple-700 tracking-wider">
          {step === "customization" ? (
            <>
              <Sparkles size={11} className="text-purple-600" />
              <span>Passo 1: Mascote & Nome</span>
            </>
          ) : (
            <>
              <Languages size={11} className="text-purple-650" />
              <span>Passo 2: Idioma / Language</span>
            </>
          )}
        </div>

        {step === "customization" ? (
          /* STEP 1: Name and Mascot Choice */
          <div className="w-full flex flex-col items-center">
            {/* Big SVG Mascot Display */}
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-4xl select-none container-center">
                <OwlLogo size={70} color={currentPreset.colorClass} />
              </div>
              <div className="absolute right-0 bottom-0 bg-purple-600 text-white rounded-full p-1.5 shadow border-2 border-white">
                <User size={14} className="stroke-[2.5]" />
              </div>
            </div>

            <h2 className="text-lg font-black text-purple-950 text-center mb-1 font-sans">
              Como quer ser chamado?
            </h2>
            <p className="text-[11px] text-purple-500/70 text-center mb-6 max-w-xs leading-relaxed">
              Escolha seu nome e o estilo visual de sua coruja assistente em traço fino!
            </p>

            <form onSubmit={handleNextStep} className="w-full space-y-5">
              {/* Nome Input */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-900 ml-1">Nome do Usuário</label>
                <input
                  id="username-setup-input"
                  type="text"
                  required
                  className="w-full bg-[#FBF9FE] border border-purple-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-sans"
                  placeholder="Ex: Giovanna"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                />
              </div>

              {/* Avatar Preset Grid Selector */}
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-purple-900 ml-1">Estilo da Mascote Coruja:</label>
                <div className="grid grid-cols-3 gap-2">
                  {owlPresets.map((preset) => (
                    <button
                      key={preset.id}
                      id={`avatar-preset-${preset.id}`}
                      type="button"
                      onClick={() => setSelectedAvatarId(preset.id)}
                      className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedAvatarId === preset.id
                          ? "border-purple-600 bg-purple-50"
                          : "border-purple-100 bg-white hover:border-purple-300"
                      }`}
                    >
                      <OwlLogo size={36} color={preset.colorClass} className="mb-1" />
                      <span className="text-[8px] text-purple-950 font-bold text-center leading-3 truncate max-w-full">
                        {preset.name.split(" ")[1]}
                      </span>
                      {selectedAvatarId === preset.id && (
                        <div className="absolute top-1 right-1 bg-purple-600 text-white rounded-full p-0.5">
                          <Check size={8} className="stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue to language step */}
              <button
                id="next-step-setup-btn"
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-4 flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Escolher Idioma</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2 (Formerly 3): Language selection */
          <div className="w-full flex flex-col items-center">
            {/* Big Languages icon */}
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-md text-purple-650 mb-5">
              <Languages size={32} />
            </div>

            <h2 className="text-lg font-black text-[#5D3A8C] text-center mb-1 font-sans">
              Idioma do Momentum
            </h2>
            <p className="text-[11px] text-purple-500/70 text-center mb-6 max-w-xs leading-relaxed">
              Caso escolhido em Inglês ou Espanhol, traduziremos automaticamente a interface para você!
            </p>

            <div className="w-full space-y-3">
              {[
                { id: "pt", flag: "🇧🇷", label: "Português", desc: "Brasil" },
                { id: "en", flag: "🇺🇸", label: "English", desc: "United States" },
                { id: "es", flag: "🇪🇸", label: "Español", desc: "España / Latinoamérica" }
              ].map((lang) => (
                <button
                  key={lang.id}
                  id={`lang-sel-${lang.id}`}
                  onClick={() => setSelectedLanguage(lang.id as LanguageType)}
                  className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all text-left cursor-pointer ${
                    selectedLanguage === lang.id
                      ? "border-purple-600 bg-purple-50"
                      : "border-purple-100 bg-white hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl select-none leading-none">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-purple-950 font-sans">{lang.label}</span>
                      <span className="text-[10px] text-[#888] font-semibold">{lang.desc}</span>
                    </div>
                  </div>
                  {selectedLanguage === lang.id && (
                    <div className="bg-purple-600 text-white rounded-full p-1 shadow">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}

              <div className="flex space-x-3 pt-6 w-full">
                <button
                  id="back-setup-step-btn"
                  onClick={() => setStep("customization")}
                  className="flex-1 py-3 text-xs bg-purple-50 hover:bg-purple-100 text-[#5D3A8C] border border-purple-200 font-bold rounded-full flex items-center justify-center space-x-1 transition-all cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Voltar</span>
                </button>
                <button
                  id="conclude-profile-setup-btn"
                  onClick={handleConclude}
                  className="flex-[2] py-3 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  Confirmar e Concluir
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
