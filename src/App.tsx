import React, { useState, useEffect } from "react";
import { Menu, Star, Shield, Palette, Settings, User as UserIcon, HelpCircle, Sparkles, LogOut, ShieldOff, LineChart, Layers } from "lucide-react";
import AuthScreen from "./components/AuthScreen";
import ProfileSetup from "./components/ProfileSetup";
import PremiumSelection from "./components/PremiumSelection";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import OwlLogo from "./components/OwlLogo";
import { UserProfile, NoteTask } from "./types";
import { translations } from "./translations";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Extended components & alerts
import IntroScreen from "./components/IntroScreen";
import OnboardingPlan from "./components/OnboardingPlan";
import ThemeSelector from "./components/ThemeSelector";
import AcompanhamentoTab from "./components/AcompanhamentoTab";
import PremiumFeatures from "./components/PremiumFeatures";
import { Toaster, toast } from "sonner";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<"auth" | "profile_setup" | "premium_selection" | "home">("auth");
  const [activeTab, setActiveTab] = useState<string>("atividades");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Custom Themes Support (Premium customizable) - defaults to lavender
  const [currentTheme, setCurrentTheme] = useState<string>("lavender");

  // Routing and Navigation States (Incremental Extension)
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [configSubTab, setConfigSubTab] = useState<"geral" | "acompanhamento">("geral");

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Retrieve tasks dynamically for analytic charts and calendar markers
  const [userTasks, setUserTasks] = useState<NoteTask[]>([]);
  useEffect(() => {
    if (currentUser) {
      const storageKey = `momentum_notes_${currentUser.email || "guest"}`;
      const isGuest = currentUser.isGuest || !currentUser.email || currentUser.email === "guest@momentum.app";
      const saved = isGuest ? sessionStorage.getItem(storageKey) : localStorage.getItem(storageKey);
      if (saved) {
        try {
          setUserTasks(JSON.parse(saved));
        } catch (err) {
          console.error("Erro ao carregar notas para estatísticas:", err);
        }
      } else {
        setUserTasks([]);
      }
    }
  }, [currentUser, activeTab, currentPath]);

  // Watch & Apply OKLCH Custom Themes list to root html element
  useEffect(() => {
    const resolvedTheme = currentUser?.theme || "lavanda";
    const themesList = ["theme-lavanda", "theme-menta", "theme-coral", "theme-indigo"];
    themesList.forEach(t => document.documentElement.classList.remove(t));
    document.documentElement.classList.add(`theme-${resolvedTheme}`);
  }, [currentUser?.theme]);

  // Synchronize path and session routing
  useEffect(() => {
    if (currentUser === null) {
      if (currentPath !== "/intro" && currentPath !== "/auth") {
        navigate("/intro");
      }
    } else {
      if (!currentUser.onboarded) {
        if (currentPath !== "/onboarding/plan" && currentPath !== "/onboarding/profile" && currentPath !== "/paywall") {
          navigate("/onboarding/plan");
        }
      } else {
        if (currentPath === "/intro" || currentPath.startsWith("/onboarding") || currentPath === "/auth") {
          navigate("/app");
        }
      }
    }
  }, [currentUser, currentPath]);

  // Premium tabs access guard
  useEffect(() => {
    const premiumTabs = [
      "foco_clean",
      "sugestoes_ia",
      "divisao_metas",
      "graficos_performance",
      "temas_personalizados",
      "diarias"
    ];

    if (currentUser && premiumTabs.includes(activeTab) && currentUser.plan !== "premium") {
      // Revert screen immediately to activities tab
      setActiveTab("atividades");

      const isVisitor = currentUser.isGuest || !currentUser.email || currentUser.email === "guest@momentum.app";
      if (isVisitor) {
        toast.error("Para acessar este recurso premium, você precisa criar ou entrar em uma conta!");
        navigate("/paywall?step=register");
      } else {
        toast.error("Opa! Este é um recurso premium. Direcionamos você para a tela de pagamento!");
        navigate("/paywall?step=payment");
      }
    }
  }, [activeTab, currentUser]);

  const lang = currentUser?.language || "pt";
  const t = translations[lang];

  const themeClasses: Record<string, { bg: string; text: string; primary: string; card: string; header: string }> = {
    lavender: {
      bg: "bg-[#F3EEFA]",
      text: "text-purple-950",
      primary: "bg-[#5D3A8C]",
      card: "bg-white",
      header: "bg-white border-purple-100"
    },
    dark: {
      bg: "bg-[#1C1823]",
      text: "text-purple-100",
      primary: "bg-[#8565C4]",
      card: "bg-[#2A2435]",
      header: "bg-[#252030] border-purple-900/30"
    },
    sakura: {
      bg: "bg-[#FFF2F5]",
      text: "text-rose-950",
      primary: "bg-[#E35D7A]",
      card: "bg-white",
      header: "bg-white border-rose-100"
    },
    mint: {
      bg: "bg-[#EFFBF5]",
      text: "text-emerald-950",
      primary: "bg-[#38A169]",
      card: "bg-white",
      header: "bg-white border-emerald-100"
    },
    ocean: {
      bg: "bg-[#EFF8FF]",
      text: "text-blue-950",
      primary: "bg-[#2B6CB0]",
      card: "bg-white",
      header: "bg-white border-blue-100"
    }
  };

  // Safe checks for existing session inside local storage on mounting
  useEffect(() => {
    // If Firebase Auth is loaded and initialized, use onAuthStateChanged
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const uEmail = firebaseUser.email || "";
          const savedProfile = localStorage.getItem(`momentum_profile_${uEmail}`);
          if (savedProfile) {
            try {
              const parsed = JSON.parse(savedProfile);
              parsed.isLogged = true;
              setCurrentUser(parsed);
              setCurrentScreen("home");
              return;
            } catch (e) {
              console.error(e);
            }
          }

          // Otherwise create a fresh default profile
          const defaultProf: UserProfile = {
            username: firebaseUser.displayName || uEmail.split("@")[0] || "User",
            email: uEmail,
            plan: "free",
            avatar: "🦉",
            isLogged: true,
            isGuest: false,
            picture: firebaseUser.photoURL || undefined
          };
          localStorage.setItem(`momentum_profile_${uEmail}`, JSON.stringify(defaultProf));
          setCurrentUser(defaultProf);
          setCurrentScreen("home");
        } else {
          // If no active Firebase user, check for guests or offline session
          const lastSessionEmail = localStorage.getItem("momentum_last_session");
          if (lastSessionEmail) {
            const savedProfile = localStorage.getItem(`momentum_profile_${lastSessionEmail}`);
            if (savedProfile) {
              try {
                const parsed = JSON.parse(savedProfile);
                parsed.isLogged = true;
                setCurrentUser(parsed);
                setCurrentScreen("home");
              } catch (e) {
                console.error(e);
              }
            }
          } else {
            const guestSaved = sessionStorage.getItem("momentum_guest_profile");
            if (guestSaved) {
              try {
                const parsed = JSON.parse(guestSaved);
                setCurrentUser(parsed);
                setCurrentScreen("home");
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      });
      return () => unsubscribe();
    } else {
      // Local fallback if Firebase environment secrets are missing
      const lastSessionEmail = localStorage.getItem("momentum_last_session");
      if (lastSessionEmail) {
        const savedProfile = localStorage.getItem(`momentum_profile_${lastSessionEmail}`);
        if (savedProfile) {
          try {
            const parsed = JSON.parse(savedProfile);
            parsed.isLogged = true;
            setCurrentUser(parsed);
            setCurrentScreen("home");
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        const guestSaved = sessionStorage.getItem("momentum_guest_profile");
        if (guestSaved) {
          try {
            const parsed = JSON.parse(guestSaved);
            setCurrentUser(parsed);
            setCurrentScreen("home");
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  }, []);

  const handleCompleteAuth = (user: UserProfile, screenToShow: "profile_setup" | "premium_selection" | "home") => {
    setCurrentUser(user);
    
    if (user.email && !user.isGuest) {
      localStorage.setItem("momentum_last_session", user.email);
    }
    
    setCurrentScreen(screenToShow);
  };

  const handleConcludeProfile = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    
    // Immediately display option to buy Premium as on Slide requirements, or direct to principal
    // Redirecting directly to Home screen, where users can go premium manually or via side prompts
    setCurrentScreen("home");
  };

  const handlePlanUpdate = (premiumUser: UserProfile) => {
    setCurrentUser(premiumUser);
    setCurrentScreen("home");
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Erro no logout Firebase:", err);
      }
    }
    localStorage.removeItem("momentum_last_session");
    localStorage.removeItem("momentum_guest_profile");
    sessionStorage.removeItem("momentum_guest_profile");
    setCurrentUser(null);
    setCurrentScreen("auth");
    setActiveTab("atividades");
    setCurrentTheme("lavender");
  };

  const themeConfig = themeClasses[currentUser?.theme || "lavanda"] || themeClasses.lavender;

  // Render resolver for path-based routing (Intro vs Auth vs Onboarding vs App)
  if (currentUser === null) {
    if (currentPath === "/auth") {
      return (
        <>
          <Toaster position="top-center" richColors />
          <AuthScreen
            onCompleteAuth={(user) => {
              setCurrentUser(user);
              if (user.onboarded) {
                navigate("/app");
              } else {
                navigate("/onboarding/plan");
              }
            }}
          />
        </>
      );
    }
    // Default to intro
    return (
      <>
        <Toaster position="top-center" richColors />
        <IntroScreen onNext={() => navigate("/auth")} />
      </>
    );
  }

  // Authenticated, but onboarding is incomplete
  if (!currentUser.onboarded) {
    if (currentPath === "/onboarding/profile") {
      return (
        <>
          <Toaster position="top-center" richColors />
          <ProfileSetup
            user={currentUser}
            onConcludeProfile={(updatedUser) => {
              const fullUser: UserProfile = { ...updatedUser, onboarded: true };
              setCurrentUser(fullUser);
              if (fullUser.email && fullUser.email !== "guest@momentum.app") {
                localStorage.setItem(`momentum_profile_${fullUser.email}`, JSON.stringify(fullUser));
              } else {
                sessionStorage.setItem("momentum_guest_profile", JSON.stringify(fullUser));
              }
              navigate("/app");
            }}
          />
        </>
      );
    }
    if (currentPath === "/paywall") {
      return (
        <>
          <Toaster position="top-center" richColors />
          <PremiumSelection
            user={currentUser}
            onUserUpdate={(updatedUser) => {
              setCurrentUser(updatedUser);
              if (updatedUser.email) {
                localStorage.setItem("momentum_last_session", updatedUser.email);
              }
            }}
            onPlanUpdate={(premiumUser) => {
              setCurrentUser(premiumUser);
              if (premiumUser.email && premiumUser.email !== "guest@momentum.app") {
                localStorage.setItem(`momentum_profile_${premiumUser.email}`, JSON.stringify(premiumUser));
              } else {
                sessionStorage.setItem("momentum_guest_profile", JSON.stringify(premiumUser));
              }
              navigate("/onboarding/profile");
            }}
            onSkip={() => {
              navigate("/onboarding/profile");
            }}
            onRegisterRequired={() => {
              localStorage.removeItem("momentum_guest_profile");
              sessionStorage.removeItem("momentum_guest_profile");
              localStorage.removeItem("momentum_last_session");
              setCurrentUser(null);
              navigate("/auth");
            }}
          />
        </>
      );
    }
    // Default onboarding slide plan
    return (
      <>
        <Toaster position="top-center" richColors />
        <OnboardingPlan
          onSelectPremium={() => navigate("/paywall")}
          onSelectFree={() => navigate("/onboarding/profile")}
        />
      </>
    );
  }

  // Fully Onboarded - Checkout simulation access
  if (currentPath === "/paywall") {
    return (
      <>
        <Toaster position="top-center" richColors />
        <PremiumSelection
          user={currentUser}
          onUserUpdate={(updatedUser) => {
            setCurrentUser(updatedUser);
            if (updatedUser.email) {
              localStorage.setItem("momentum_last_session", updatedUser.email);
            }
          }}
          onPlanUpdate={(premiumUser) => {
            setCurrentUser(premiumUser);
            if (premiumUser.email && premiumUser.email !== "guest@momentum.app") {
              localStorage.setItem(`momentum_profile_${premiumUser.email}`, JSON.stringify(premiumUser));
            } else {
              sessionStorage.setItem("momentum_guest_profile", JSON.stringify(premiumUser));
            }
            navigate("/app");
          }}
          onSkip={() => {
            navigate("/app");
          }}
          onRegisterRequired={() => {
            localStorage.removeItem("momentum_guest_profile");
            sessionStorage.removeItem("momentum_guest_profile");
            localStorage.removeItem("momentum_last_session");
            setCurrentUser(null);
            navigate("/auth");
          }}
        />
      </>
    );
  }

  return (
    <div id="momentum-app-root" className={`min-h-screen ${themeConfig.bg} ${themeConfig.text} transition-colors duration-300 font-sans flex flex-col`}>
      
      {/* HEADER BAR (Custom, responsive, matched mockup theme colors) */}
      <header id="main-header" className={`sticky top-0 z-30 flex items-center justify-between px-5 py-3.5 border-b shadow-sm ${themeConfig.header} transition-colors`}>
        <div className="flex items-center space-x-3">
          <button
            id="toggle-menu-btn"
            onClick={() => setSidebarOpen(true)}
            className="p-1 px-1.5 text-purple-700 hover:bg-purple-100 rounded-xl transition"
          >
            <Menu size={22} className="stroke-[2.5]" />
          </button>

          <div className="flex items-center space-x-2">
            <OwlLogo size={32} />
            <span className="text-lg font-black text-[#5D3A8C] tracking-tight">
              Momentum
            </span>
          </div>
        </div>

        {/* Upgrade alert if user is standard, or checkmark premium status */}
        <div className="flex items-center space-x-3.5">
          {currentUser?.plan === "free" ? (
            <button
              id="header-upgrade-btn"
              onClick={() => navigate("/paywall")}
              className="text-[10px] font-black uppercase text-white bg-purple-600 hover:bg-purple-700 px-3.5 py-1.5 rounded-full shadow-md transition-all active:scale-95 flex items-center space-x-1"
            >
              <span>{t.getPremium}</span>
            </button>
          ) : (
            <div className="bg-purple-100 text-purple-700 text-[10px] uppercase font-black px-3 py-1.5 rounded-full flex items-center space-x-1 border border-purple-200">
              <span className="animate-pulse">💎</span>
              <span>{t.premiumActive}</span>
            </div>
          )}

          {/* Quick Avatar/Account Action */}
          <button
            id="header-avatar-btn"
            onClick={() => setActiveTab("conta")}
            className="w-8.5 h-8.5 bg-purple-100 rounded-full flex items-center justify-center text-xl border border-purple-200 shadow-inner hover:scale-105 transition-transform"
          >
            {currentUser?.avatar || "🦉"}
          </button>
        </div>
      </header>

      {/* COLLAPSIBLE SIDEBAR DRAWER (Page 6) */}
      {currentUser && (
        <Sidebar
          user={currentUser}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenPremiumPaywall={() => navigate("/paywall")}
        />
      )}

      {/* SECONDARY SCREEN TAB ROUTING SHEET */}
      <main className="flex-1 flex flex-col">
        {["foco_clean", "sugestoes_ia", "divisao_metas", "graficos_performance", "temas_personalizados"].includes(activeTab) ? (
          <PremiumFeatures
            user={currentUser!}
            activeTab={activeTab}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              if (updated.email && updated.email !== "guest@momentum.app") {
                localStorage.setItem(`momentum_profile_${updated.email}`, JSON.stringify(updated));
              } else {
                sessionStorage.setItem("momentum_guest_profile", JSON.stringify(updated));
              }
            }}
            currentTheme={currentUser!.theme || "lavanda"}
            onThemeChange={(themeId) => {
              const updated = { ...currentUser!, theme: themeId };
              setCurrentUser(updated);
              if (updated.email && updated.email !== "guest@momentum.app") {
                localStorage.setItem(`momentum_profile_${updated.email}`, JSON.stringify(updated));
              } else {
                sessionStorage.setItem("momentum_guest_profile", JSON.stringify(updated));
              }
              toast.success(`Tema alterado para ${themeId === "lavanda" ? "Lavanda" : themeId === "menta" ? "Menta" : themeId === "coral" ? "Coral" : "Índigo"}!`);
            }}
            onOpenPremiumPaywall={() => navigate("/paywall")}
            tasks={userTasks}
            onUpdateTasks={(updatedTasks) => {
              setUserTasks(updatedTasks);
              const storageKey = `momentum_notes_${currentUser!.email || "guest"}`;
              const isGuest = currentUser!.isGuest || !currentUser!.email || currentUser!.email === "guest@momentum.app";
              if (isGuest) {
                sessionStorage.setItem(storageKey, JSON.stringify(updatedTasks));
              } else {
                localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
              }
            }}
          />
        ) : ["atividades", "star", "diarias"].includes(activeTab) ? (
          <Dashboard
            user={currentUser!}
            activeTab={activeTab}
            onOpenPremiumPaywall={() => navigate("/paywall")}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              if (updated.email && updated.email !== "guest@momentum.app") {
                localStorage.setItem(`momentum_profile_${updated.email}`, JSON.stringify(updated));
              } else {
                sessionStorage.setItem("momentum_guest_profile", JSON.stringify(updated));
              }
            }}
          />
        ) : activeTab === "conta" ? (
          /* CONTA PREVIEW DETAILS */
          <div className="max-w-md mx-auto w-full p-6 bg-white/70 backdrop-blur rounded-3xl shadow-xl mt-8 border border-purple-100 animate-scaleUp text-center space-y-6 m-4 self-center">
            <h3 className="text-sm font-black text-purple-950 font-sans uppercase tracking-wider border-b pb-2">{t.yourProfileHeader}</h3>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-4xl shadow-md border-3 border-white">
                {currentUser?.avatar || "🦉"}
              </div>
              <div className="font-bold text-md text-purple-950">{currentUser?.username || "Guest"}</div>
              <div className="text-xs text-[#888] font-mono">{currentUser?.email || "guest@momentum.app"}</div>
            </div>

            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50 space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-purple-650 font-semibold">{t.subscriptionStatusLabel}</span>
                <span className="font-bold text-purple-950 capitalize">{currentUser?.plan === "premium" ? t.premiumOption : t.freeOption}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-650 font-semibold">{t.accessTypeLabel}</span>
                <span className="font-bold text-purple-950">{currentUser?.isGuest ? t.freeGuestSession : t.registeredUser}</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <button
                id="edit-profile-btn"
                onClick={() => {
                  if (currentUser) {
                    const u = { ...currentUser, onboarded: false };
                    setCurrentUser(u);
                    if (u.email && u.email !== "guest@momentum.app") {
                      localStorage.setItem(`momentum_profile_${u.email}`, JSON.stringify(u));
                    } else {
                      sessionStorage.setItem("momentum_guest_profile", JSON.stringify(u));
                    }
                  }
                  navigate("/onboarding/profile");
                }}
                className="w-full bg-purple-100 hover:bg-purple-200 text-[#5D3A8C] py-2.5 rounded-full font-bold text-xs"
              >
                {t.customizeAvatarName}
              </button>
              {currentUser?.plan === "free" ? (
                <button
                  id="account-upgrade-btn"
                  onClick={() => navigate("/paywall")}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-full font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95"
                >
                  {t.upgradeText}
                </button>
              ) : (
                <button
                  id="account-downgrade-btn"
                  onClick={() => {
                    if (currentUser) {
                      const updated = { ...currentUser, plan: "free" as const };
                      setCurrentUser(updated);
                      if (updated.email && updated.email !== "guest@momentum.app") {
                        localStorage.setItem(`momentum_profile_${updated.email}`, JSON.stringify(updated));
                      } else {
                        sessionStorage.setItem("momentum_guest_profile", JSON.stringify(updated));
                      }
                      toast.success("Plano alterado para Gratuito! Banners de propaganda e anúncios popup reativados com sucesso!");
                    }
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-full font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Mudar para Plano Gratuito (Testar Anúncios)
                </button>
              )}
              <button
                id="profile-logout-btn"
                onClick={handleLogout}
                className="w-full border border-purple-300 hover:bg-purple-50 text-purple-700 py-2.5 rounded-full font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <LogOut size={14} />
                <span>{t.logoutAccount}</span>
              </button>
            </div>
          </div>
        ) : activeTab === "temas" ? (
          /* CUSTOM THEMES GRID (PREMIUM EXCLUSIVE AS COMMITTED IN REQUIREMENTS) */
          <div className="max-w-md mx-auto w-full p-2 mt-4 animate-scaleUp self-center">
            <ThemeSelector
              user={currentUser}
              currentTheme={currentUser.theme || "lavanda"}
              onThemeChange={(themeId) => {
                const updated = { ...currentUser, theme: themeId };
                setCurrentUser(updated);
                if (updated.email && updated.email !== "guest@momentum.app") {
                  localStorage.setItem(`momentum_profile_${updated.email}`, JSON.stringify(updated));
                } else {
                  sessionStorage.setItem("momentum_guest_profile", JSON.stringify(updated));
                }
                toast.success(`Tema alterado para ${themeId === "lavanda" ? "Lavanda" : themeId === "menta" ? "Menta" : themeId === "coral" ? "Coral" : "Índigo"}!`);
              }}
              onOpenPremiumPaywall={() => navigate("/paywall")}
            />
          </div>
        ) : (
          /* CONFIGURACOES VIEW WITH INTERACTIVE SUBTABS */
          <div className="max-w-md mx-auto w-full p-6 bg-white rounded-3xl shadow-xl mt-8 border border-purple-100 animate-scaleUp text-left space-y-5 m-4 self-center">
            <h3 className="text-sm font-black text-purple-950 font-sans uppercase tracking-wider text-center border-b pb-2">
              {configSubTab === "geral" ? "Configurações Gerais" : "Análise & Acompanhamento"}
            </h3>

            {/* Sub-tab selection row */}
            <div className="flex space-x-1 bg-purple-50 p-1 rounded-2xl border border-purple-100/50 select-none">
              <button
                id="btn-subtab-geral"
                onClick={() => setConfigSubTab("geral")}
                className={`flex-1 text-center py-2 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                  configSubTab === "geral"
                    ? "bg-[#5D3A8C] text-white shadow-sm"
                    : "text-purple-400 hover:text-purple-600"
                }`}
              >
                Geral
              </button>
              <button
                id="btn-subtab-acompanhamento"
                onClick={() => setConfigSubTab("acompanhamento")}
                className={`flex-1 text-center py-2 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                  configSubTab === "acompanhamento"
                    ? "bg-[#5D3A8C] text-white shadow-sm"
                    : "text-purple-400 hover:text-purple-600"
                }`}
              >
                📊 Acompanhamento
              </button>
            </div>

            {configSubTab === "geral" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-[#FBF9FE] p-3 rounded-2xl border border-purple-100">
                  <div>
                    <h4 className="text-xs font-bold text-purple-950 font-sans">Proteção contra Anúncios</h4>
                    <p className="text-[9.5px] text-[#888] leading-normal">Oculte todos os blocos promocionais integrados do app</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-lg shrink-0 ml-2 ${
                    currentUser?.plan === "premium" ? "text-[#38A169] bg-[#EFFBF5]" : "text-[#5D3A8C] bg-purple-100"
                  }`}>
                    {currentUser?.plan === "premium" ? "ATIVADO" : "CONTA PREMIUM"}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#FBF9FE] p-3 rounded-2xl border border-purple-100">
                  <div>
                    <h4 className="text-xs font-bold text-purple-950 font-sans">{t.localDataSyncLabel}</h4>
                    <p className="text-[9.5px] text-[#888] leading-normal">{t.localDataSyncDesc}</p>
                  </div>
                  <span className="text-[10px] text-[#38A169] font-bold bg-[#EFFBF5] px-2 py-1 rounded-lg shrink-0 ml-2">{t.activeWord}</span>
                </div>

                <div className="flex justify-between items-center bg-[#FBF9FE] p-3 rounded-2xl border border-purple-100">
                  <div>
                    <h4 className="text-xs font-bold text-purple-950 font-sans">{t.owlCompanionLabel}</h4>
                    <p className="text-[9.5px] text-[#888] leading-normal">{t.owlCompanionDesc}</p>
                  </div>
                  <span className="text-[10px] text-[#38A169] font-bold bg-[#EFFBF5] px-2 py-1 rounded-lg shrink-0 ml-2">{t.activeWord}</span>
                </div>
              </div>
            ) : (
              <AcompanhamentoTab user={currentUser} tasks={userTasks} />
            )}

            <div className="pt-2 border-t border-purple-100">
              <button
                id="settings-logout-btn"
                onClick={handleLogout}
                className="w-full bg-[#FAF5F5] border border-red-200 hover:bg-red-50 text-red-600 py-2.5 rounded-full font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-inner"
              >
                <LogOut size={14} className="text-red-500" />
                <span>{t.logoutAccount}</span>
              </button>
            </div>

            <div className="border-t border-purple-50 pt-4 text-center pb-2">
              <p className="text-[9px] text-[#aaa]">{t.appVersionFooter}</p>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
