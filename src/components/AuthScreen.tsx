import React, { useState, useEffect } from "react";
import { Mail, ArrowRight, Eye, EyeOff, HelpCircle } from "lucide-react";
import OwlLogo from "./OwlLogo";
import { UserProfile } from "../types";
import { auth, googleProvider, isFirebaseConfigured } from "../lib/firebase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

interface AuthScreenProps {
  onCompleteAuth: (user: UserProfile, screenToShow: "profile_setup" | "premium_selection" | "home") => void;
}

export default function AuthScreen({ onCompleteAuth }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [emailForm, setEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMess, setErrorMess] = useState("");
  const [successMess, setSuccessMess] = useState("");
  const [isDomainError, setIsDomainError] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);

  const [storedAccounts, setStoredAccounts] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem("momentum_accounts");
    if (saved) {
      try {
        setStoredAccounts(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess("");
    setSuccessMess("");

    if (!email || !password) {
      setErrorMess("Por favor preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setErrorMess("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (auth) {
      try {
        if (isLogin) {
          // Sign In
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const uEmail = user.email || email;

          const savedProfile = localStorage.getItem(`momentum_profile_${uEmail}`);
          let loadedUser: UserProfile;

          if (savedProfile) {
            try {
              loadedUser = JSON.parse(savedProfile);
              loadedUser.isLogged = true;
            } catch {
              loadedUser = {
                username: user.displayName || uEmail.split("@")[0],
                email: uEmail,
                plan: "free",
                avatar: "🦉",
                isLogged: true,
                isGuest: false,
              };
            }
          } else {
            loadedUser = {
              username: user.displayName || uEmail.split("@")[0],
              email: uEmail,
              plan: "free",
              avatar: "🦉",
              isLogged: true,
              isGuest: false,
            };
          }

          setSuccessMess("Sessão iniciada com sucesso!");
          setTimeout(() => {
            onCompleteAuth(loadedUser, "home");
          }, 1000);
        } else {
          // Sign Up
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const uEmail = user.email || email;

          const newUser: UserProfile = {
            username: uEmail.split("@")[0],
            email: uEmail,
            plan: "free",
            avatar: "🦉",
            isLogged: true,
            isGuest: false,
          };

          localStorage.setItem(`momentum_profile_${uEmail}`, JSON.stringify(newUser));
          localStorage.removeItem(`momentum_notes_${uEmail}`);
          sessionStorage.setItem("momentum_just_registered", "true");

          setSuccessMess("Conta criada com sucesso no Firebase!");
          setTimeout(() => {
            onCompleteAuth(newUser, "profile_setup");
          }, 1100);
        }
      } catch (err: any) {
        console.error("Firebase auth error:", err);
        let pMsg = err.message || "Ocorreu um erro ao realizar a autenticação.";
        if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
          pMsg = "E-mail ou senha incorretos.";
        } else if (err.code === "auth/email-already-in-use") {
          pMsg = "Este e-mail já possui uma conta cadastrada no Firebase. Faça login!";
        } else if (err.code === "auth/invalid-email") {
          pMsg = "Insira um formato de e-mail válido.";
        } else if (err.code === "auth/weak-password") {
          pMsg = "A senha é muito fraca. Digite pelo menos 6 de seus caracteres.";
        }
        setErrorMess(pMsg);
      }
    } else {
      // Local storage offline-testing fallback logic
      const saved = { ...storedAccounts };
      if (isLogin) {
        if (saved[email] && saved[email] === password) {
          const savedProfile = localStorage.getItem(`momentum_profile_${email}`);
          let loadedUser: UserProfile;
          if (savedProfile) {
            try {
              loadedUser = JSON.parse(savedProfile);
              loadedUser.isLogged = true;
            } catch {
              loadedUser = {
                username: email.split("@")[0],
                email,
                plan: "free",
                avatar: "🦉",
                isLogged: true,
                isGuest: false,
              };
            }
          } else {
            loadedUser = {
              username: email.split("@")[0],
              email,
              plan: "free",
              avatar: "🦉",
              isLogged: true,
              isGuest: false,
            };
          }

          setSuccessMess("Sessão iniciada localmente (Modo Desenvolvimento)!");
          setTimeout(() => {
            onCompleteAuth(loadedUser, "home");
          }, 1000);
        } else {
          setErrorMess("E-mail ou senha incorretos (ou o Firebase está offline).");
        }
      } else {
        if (saved[email]) {
          setErrorMess("Este e-mail já possui uma conta local. Faça login!");
          return;
        }
        saved[email] = password;
        localStorage.setItem("momentum_accounts", JSON.stringify(saved));
        setStoredAccounts(saved);

        const newUser: UserProfile = {
          username: email.split("@")[0],
          email,
          plan: "free",
          avatar: "🦉",
          isLogged: true,
          isGuest: false,
        };

        localStorage.setItem(`momentum_profile_${email}`, JSON.stringify(newUser));
        localStorage.removeItem(`momentum_notes_${email}`);
        sessionStorage.setItem("momentum_just_registered", "true");

        setSuccessMess("Conta local criada com sucesso!");
        setTimeout(() => {
          onCompleteAuth(newUser, "profile_setup");
        }, 1000);
      }
    }
  };

  const handleForgotPassword = async () => {
    setErrorMess("");
    setSuccessMess("");

    if (!email) {
      setErrorMess("Por favor preencha o campo de E-mail para solicitar a redefinição.");
      return;
    }

    if (!auth) {
      setErrorMess("Redefinição offline não suportada. Configure o Firebase no .env.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMess(`Enviamos um e-mail de redefinição de senha para ${email}. Verifique sua caixa de entrada.`);
    } catch (err: any) {
      console.error(err);
      let pMsg = err.message || "Não foi possível enviar o e-mail de recuperação.";
      if (err.code === "auth/user-not-found") {
        pMsg = "Nenhum usuário cadastrado com este e-mail.";
      } else if (err.code === "auth/invalid-email") {
        pMsg = "Insira um e-mail com formato válido.";
      }
      setErrorMess(pMsg);
    }
  };

  const handleContinueAsGuest = () => {
    const guestUser: UserProfile = {
      username: "Guest",
      email: "guest@momentum.app",
      plan: "free",
      avatar: "👤",
      isLogged: false,
      isGuest: true,
    };
    onCompleteAuth(guestUser, "home");
  };

  return (
    <div
      id="auth-container"
      className="relative min-h-screen bg-[#F3EEFA] flex flex-col items-center justify-between p-6 overflow-hidden md:py-12"
    >
      {/* Dynamic Background Custom Decorative Slate Clouds in Lavender */}
      <div id="cloud-decor-top-left" className="absolute top-[-40px] left-[-40px] opacity-40 select-none pointer-events-none transform -rotate-12">
        <svg width="200" height="150" viewBox="0 0 100 80" fill="none">
          <path d="M10,50 Q25,30 45,45 Q65,25 85,50 Q105,75 50,75 Q10,75 10,50 Z" fill="#E4D6F5" stroke="#D1BBEA" strokeWidth="2" />
        </svg>
      </div>

      <div id="cloud-decor-top-right" className="absolute top-12 right-[-20px] opacity-50 select-none pointer-events-none">
        <svg width="140" height="110" viewBox="0 0 100 80" fill="none">
          <path d="M15,45 Q30,20 50,35 Q70,20 85,45 Q100,70 50,70 Q15,70 15,45 Z" fill="#E4D6F5" stroke="#D1BBEA" strokeWidth="2" />
          <circle cx="95" cy="55" r="4" fill="#D1BBEA" />
          <circle cx="103" cy="63" r="2.5" fill="#D1BBEA" />
        </svg>
      </div>

      <div id="cloud-decor-bottom-left" className="absolute bottom-8 left-[-10px] opacity-50 select-none pointer-events-none">
        <svg width="150" height="110" viewBox="0 0 100 80" fill="none">
          <path d="M10,45 Q25,18 45,35 Q65,18 80,45 Q95,70 50,70 Q10,70 10,45 Z" fill="#E4D6F5" stroke="#D1BBEA" strokeWidth="2" />
        </svg>
      </div>

      <div id="cloud-decor-bottom-right" className="absolute bottom-[-30px] right-[-30px] opacity-40 select-none pointer-events-none">
        <svg width="240" height="170" viewBox="0 0 100 80" fill="none">
          <path d="M10,50 Q25,30 50,45 Q75,30 90,50 Q105,75 50,75 Q10,75 10,50 Z" fill="#E4D6F5" stroke="#D1BBEA" strokeWidth="2" />
          <circle cx="10" cy="15" r="4.5" fill="#D1BBEA" />
          <circle cx="18" cy="23" r="2.5" fill="#D1BBEA" />
        </svg>
      </div>

      {/* Main Brand Section */}
      <div id="brand-header" className="flex flex-col items-center text-center mt-12 z-10 transition-transform duration-300">
        <OwlLogo className="mb-4 drop-shadow-md" size={120} pulse />
        <h1 className="text-3xl font-bold tracking-tight text-[#5D3A8C] mt-2 font-sans">
          Bem-vindo(a) ao
        </h1>
        <h2 className="text-5xl font-black text-[#8565C4] tracking-wide mt-1 font-sans">
          Momentum
        </h2>
        <p className="text-[#888] text-sm mt-2 max-w-xs">
          O seu assistente de produtividade pessoal anti-procrastinação.
        </p>
      </div>

      {/* Interactive Form/Modes Container */}
      <div id="auth-actions-card" className="w-full max-w-sm bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/80 z-10 my-6">

        {isDomainError && (
          <div className="bg-red-50 border border-red-200 text-red-950 rounded-2xl p-4 mb-4 text-xs font-sans animate-fadeIn">
            <div className="flex items-start space-x-2">
              <span className="text-base mt-0.5">⚠️</span>
              <div>
                <strong className="block text-red-900 font-bold mb-1">Domínio não Autorizado no Firebase Auth</strong>
                <p className="text-gray-600 mb-2.5 leading-relaxed">
                  Para permitir o login por Google, você precisa autorizar o domínio de visualização deste app no Console do Firebase.
                </p>
                <div id="domain-copy-container" className="bg-white/90 border border-red-100 rounded-xl p-2.5 flex items-center justify-between font-mono text-[11px] text-gray-700 select-all mb-2.5 shadow-sm">
                  <span className="truncate max-w-[180px]">{window.location.hostname}</span>
                  <button
                    id="copy-unauth-domain-btn"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.hostname);
                      setDomainCopied(true);
                      setTimeout(() => setDomainCopied(false), 2000);
                    }}
                    className={`ml-2 px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer select-none transition-all ${
                      domainCopied 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                    }`}
                  >
                    {domainCopied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">
                  <strong>Instruções:</strong> Acesse seu <strong>Console do Firebase &rarr; Authentication &rarr; aba Settings (Configurações) &rarr; Authorized domains (Domínios autorizados)</strong> e adicione o domínio acima.
                </p>
              </div>
            </div>
          </div>
        )}

        <form id="email-credentials-form" onSubmit={handleEmailAction} className="space-y-4">
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-purple-600 font-bold">
              {isLogin ? "Acessar Conta" : "Criar Conta com E-mail"}
            </span>
          </div>

          {/* Input E-mail */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-purple-700 ml-1">E-mail</label>
            <input
              id="form-email-input"
              type="email"
              required
              className="w-full bg-[#F3EEFA] border border-purple-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-sans"
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Input Senha */}
          <div className="flex flex-col space-y-1 relative">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold text-purple-700">Senha</label>
              {isLogin && isFirebaseConfigured && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-purple-600 hover:underline hover:text-purple-850 font-semibold cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="form-password-input"
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-[#F3EEFA] border border-purple-200 rounded-2xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-sans"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-purple-500 hover:text-purple-700 font-sans cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMess && (
            <div id="auth-error" className="bg-red-50 text-red-600 text-xs py-2 px-3 rounded-lg border border-red-100 text-center font-medium font-sans leading-normal">
              {errorMess}
            </div>
          )}

          {successMess && (
            <div id="auth-success" className="bg-emerald-50 text-emerald-600 text-xs py-2 px-3 rounded-lg border border-emerald-100 text-center font-medium font-sans leading-normal">
              {successMess}
            </div>
          )}

          {/* Proceed Actions */}
          <div className="pt-2">
            <button
              type="submit"
              id="submit-auth-form"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-full text-sm font-semibold shadow active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-center"
            >
              <span>{isLogin ? "Entrar" : "Confirmar"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* Alternate Login / Sign up State Link */}
        <div className="text-center mt-5">
          <button
            id="toggle-login-mode"
            onClick={() => {
              setIsLogin(!isLogin);
              setEmailForm(false);
              setErrorMess("");
              setSuccessMess("");
            }}
            className="text-xs text-[#5D3A8C] hover:underline font-bold transition-all focus:outline-none cursor-pointer"
          >
            {isLogin ? (
              <>
                Primeira vez aqui? <span className="text-purple-650 font-black">Registre-se</span>
              </>
            ) : (
              <>
                Já possui uma conta? <span className="text-purple-650 font-black">Entrar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Guest/Anon Option as requested */}
      <div id="guest-action-footer" className="mb-8 z-10 text-center">
        <button
          id="continue-gratuitamente-btn"
          onClick={handleContinueAsGuest}
          className="text-[#5D3A8C] hover:text-purple-700 font-semibold px-4 py-2 border-b-2 border-purple-300 hover:border-purple-600 transition-all font-sans text-sm focus:outline-none cursor-pointer"
        >
          Continuar gratuitamente
        </button>
      </div>
    </div>
  );
}
