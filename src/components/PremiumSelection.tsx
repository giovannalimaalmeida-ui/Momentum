import React, { useState, useEffect } from "react";
import { Check, CreditCard, Clipboard, CheckCircle, RefreshCw, Smartphone, Heart, Mail, Lock, Eye, EyeOff, Sparkles, Trophy, Flame, X } from "lucide-react";
import OwlLogo from "./OwlLogo";
import { UserProfile, PlanType } from "../types";
import { auth, googleProvider, isFirebaseConfigured } from "../lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup 
} from "firebase/auth";

interface PremiumSelectionProps {
  user: UserProfile;
  onPlanUpdate: (updatedUser: UserProfile) => void;
  onSkip: () => void;
  isInsideApp?: boolean;
  onRegisterRequired?: () => void;
  onUserUpdate?: (updatedUser: UserProfile) => void;
}

export default function PremiumSelection({ user, onPlanUpdate, onSkip, isInsideApp = false, onRegisterRequired, onUserUpdate }: PremiumSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual" | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStep = params.get("step");
    if (urlStep === "payment") {
      return "monthly";
    }
    return null;
  });
  const [paymentMode, setPaymentMode] = useState<"card" | "pix" | null>("card");
  const [step, setStep] = useState<"selection" | "payment" | "success" | "register-mandatory">(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStep = params.get("step");
    if (urlStep === "payment") {
      return "payment";
    }
    if (urlStep === "register") {
      return "register-mandatory";
    }
    return "selection";
  });
  const [showX, setShowX] = useState(true);

  useEffect(() => {
    const justRegistered = sessionStorage.getItem("momentum_just_registered");
    if (justRegistered === "true") {
      setShowX(false);
      const timer = setTimeout(() => {
        setShowX(true);
        sessionStorage.removeItem("momentum_just_registered");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Inline Account Registration States
  const [isRegLogin, setIsRegLogin] = useState(false);
  const [regEmailForm, setRegEmailForm] = useState(false);
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [isRegLoading, setIsRegLoading] = useState(false);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Pix state
  const [pixCopied, setPixCopied] = useState(false);
  const [isVerifyingPix, setIsVerifyingPix] = useState(false);

  // Form error
  const [errorMess, setErrorMess] = useState("");

  const planPriceMap = {
    monthly: "R$ 9,99",
    annual: "R$ 29,99",
  };

  const planLabelMap = {
    monthly: "Mensal",
    annual: "Anual",
  };

  const getPixCode = () => {
    const val = selectedPlan === "monthly" ? "9.99" : "29.99";
    return `00020101021226840014br.gov.bcb.pix2562pix.momentum.app/checkout/pay_${val}5204000053039865405${val}5802BR5915MomentumAppLtda6009Salvador61084200000062250521pay_momentum_${selectedPlan}6304FC7D`;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess("");

    if (cardNumber.replace(/\s/g, "").length < 16) {
      setErrorMess("Número do cartão inválido (mínimo de 16 algarismos).");
      return;
    }
    if (!cardName) {
      setErrorMess("Por favor preencha o nome do titular do cartão.");
      return;
    }
    if (cardExpiry.length < 5) {
      setErrorMess("Formato de data de validade incorreto (MM/AA).");
      return;
    }
    if (cardCvv.length < 3) {
      setErrorMess("Código de segurança (CVV) inválido.");
      return;
    }

    // Process payment success
    completePremiumPayment();
  };

  const simulatePixVerification = () => {
    setIsVerifyingPix(true);
    setErrorMess("");
    // Simulate payment checked by gateway
    setTimeout(() => {
      setIsVerifyingPix(false);
      completePremiumPayment();
    }, 3000);
  };

  const completePremiumPayment = () => {
    const updatedUser: UserProfile = {
      ...user,
      plan: "premium",
    };

    // Save profile premium state
    if (updatedUser.email && updatedUser.email !== "guest@momentum.app") {
      localStorage.setItem(`momentum_profile_${updatedUser.email}`, JSON.stringify(updatedUser));
    } else {
      // Temporary guest premium saving
      sessionStorage.setItem("momentum_guest_profile", JSON.stringify(updatedUser));
    }

    setStep("success");
  };

  const handleInlineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!regEmail || !regPassword) {
      setRegError("Por favor, preencha todos os campos.");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsRegLoading(true);

    try {
      let registeredUser: UserProfile;

      if (auth) {
        if (isRegLogin) {
          // Sign In
          const userCredential = await signInWithEmailAndPassword(auth, regEmail, regPassword);
          const fUser = userCredential.user;
          const uEmail = fUser.email || regEmail;

          const savedProfile = localStorage.getItem(`momentum_profile_${uEmail}`);
          if (savedProfile) {
            try {
              registeredUser = JSON.parse(savedProfile);
              registeredUser.isLogged = true;
            } catch {
              registeredUser = {
                ...user,
                username: fUser.displayName || uEmail.split("@")[0],
                email: uEmail,
                isLogged: true,
                isGuest: false,
              };
            }
          } else {
            registeredUser = {
              ...user,
              username: fUser.displayName || uEmail.split("@")[0],
              email: uEmail,
              isLogged: true,
              isGuest: false,
            };
          }
        } else {
          // Sign Up
          const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
          const fUser = userCredential.user;
          const uEmail = fUser.email || regEmail;

          registeredUser = {
            ...user,
            username: uEmail.split("@")[0],
            email: uEmail,
            isLogged: true,
            isGuest: false,
          };
        }
      } else {
        // Local simulation backup fallback (Modo Desenvolvimento)
        const savedAccountsStr = localStorage.getItem("momentum_accounts") || "{}";
        let saved: Record<string, string> = {};
        try {
          saved = JSON.parse(savedAccountsStr);
        } catch {
          saved = {};
        }

        if (isRegLogin) {
          if (saved[regEmail] && saved[regEmail] === regPassword) {
            const savedProfile = localStorage.getItem(`momentum_profile_${regEmail}`);
            if (savedProfile) {
              registeredUser = JSON.parse(savedProfile);
              registeredUser.isLogged = true;
            } else {
              registeredUser = {
                ...user,
                username: regEmail.split("@")[0],
                email: regEmail,
                isLogged: true,
                isGuest: false,
              };
            }
          } else {
            setRegError("E-mail ou senha incorretos.");
            setIsRegLoading(false);
            return;
          }
        } else {
          if (saved[regEmail]) {
            setRegError("Este e-mail já possui uma conta cadastrada. Faça login!");
            setIsRegLoading(false);
            return;
          }
          saved[regEmail] = regPassword;
          localStorage.setItem("momentum_accounts", JSON.stringify(saved));

          registeredUser = {
            ...user,
            username: regEmail.split("@")[0],
            email: regEmail,
            isLogged: true,
            isGuest: false,
          };
        }
      }

      // Clear guest profile
      localStorage.removeItem("momentum_guest_profile");
      sessionStorage.removeItem("momentum_guest_profile");

      // Save user account
      localStorage.setItem(`momentum_profile_${registeredUser.email}`, JSON.stringify(registeredUser));

      if (!isRegLogin) {
        sessionStorage.setItem("momentum_just_registered", "true");
      }

      if (onUserUpdate) {
        onUserUpdate(registeredUser);
      } else {
        onPlanUpdate(registeredUser);
      }

      setRegSuccess(isRegLogin ? "Sessão iniciada com sucesso!" : "Conta criada com sucesso! Redirecionando para o pagamento...");
      setTimeout(() => {
        setIsRegLoading(false);
        setStep("payment");
      }, 1000);

    } catch (err: any) {
      console.error("Inline SignUp/SignIn error:", err);
      let pMsg = err.message || "Erro na autenticação.";
      if (err.code === "auth/email-already-in-use") {
        pMsg = "Este e-mail já possui cadastro. Use outro ou tente entrar.";
      } else if (err.code === "auth/invalid-email") {
        pMsg = "Insira um formato de e-mail válido.";
      } else if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        pMsg = "E-mail ou senha incorretos.";
      } else if (err.code === "auth/weak-password") {
        pMsg = "A senha deve ter pelo menos 6 de seus caracteres.";
      }
      setRegError(pMsg);
      setIsRegLoading(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(getPixCode());
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  return (
    <div
      id="premium-selection-container"
      className="relative min-h-screen bg-[#F3EEFA] flex flex-col items-center justify-center p-5 md:py-12"
    >
      {/* Decorative Cloud background */}
      <div id="cloud-premium-top" className="absolute top-[-20px] opacity-30 select-none pointer-events-none">
        <svg width="300" height="200" viewBox="0 0 100 80" fill="none">
          <path d="M10,50 Q25,25 50,45 Q75,25 90,50 Q105,75 50,75 Q10,75 10,50 Z" fill="#E4D6F5" stroke="#D1BBEA" strokeWidth="2.5" />
        </svg>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 z-10 flex flex-col items-center relative transition-all duration-300">
        
        {/* Conditional "X" Close Button */}
        {showX && (
          <button
            id="premium-close-x-btn"
            onClick={onSkip}
            className="absolute top-4 right-4 text-purple-400 hover:text-purple-750 hover:bg-purple-50 p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer z-20"
            aria-label="Skip to free plan"
          >
            <X size={18} className="stroke-[3]" />
          </button>
        )}
        
        {step === "selection" && (
          <div id="premium-features-view" className="w-full flex flex-col items-center">
            <OwlLogo className="mb-3" size={75} />
            
            <h2 className="text-2xl font-black text-[#5D3A8C] text-center font-sans tracking-tight leading-6">
              Desbloqueie todos
            </h2>
            <h3 className="text-2xl font-black text-[#5D3A8C] mb-4 text-center font-sans tracking-tight">
              os recursos
            </h3>

            {/* List of custom features */}
            <ul id="features-highlights-list" className="w-full space-y-3 mb-6">
              {[
                { title: "Tarefas Diárias & Rituais", desc: "Monitore rituais e hábitos repetitivos com bônus de XP" },
                { title: "Foco Livre de Poluição", desc: "Modo cronômetro limpo de bobeiras e distrações" },
                { title: "Sugestões de IA Avançadas", desc: "Sugestões inteligentes com nossa mascote Coruja" },
                { title: "Divisão de Tarefas & Metas", desc: "Particione atividades acadêmicas com o Kanban inteligente" },
                { title: "Temas Personalizados", desc: "Mude cores e aparência do aplicativo" }
              ].map((f, i) => (
                <li key={i} className="flex items-start space-x-3 bg-[#FBF9FE] p-2.5 rounded-2xl border border-purple-100/50">
                  <div className="mt-0.5 bg-purple-100 p-1 rounded-full text-purple-600 flex-shrink-0">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-purple-950 font-sans">{f.title}</h4>
                    <p className="text-xs text-purple-700/60 font-sans">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Plan Boxes (Page 2) */}
            <div id="pricing-boxes-container" className="grid grid-cols-2 gap-4 w-full mb-6">
              {/* Plan Monthly */}
              <button
                id="plan-monthly-btn"
                onClick={() => setSelectedPlan("monthly")}
                className={`flex flex-col items-center justify-between p-4 rounded-2xl border-2 text-center transition-all ${
                  selectedPlan === "monthly"
                    ? "border-purple-600 bg-purple-50/70"
                    : "border-purple-200 bg-white hover:border-purple-400"
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">Por mês</div>
                <div className="text-2xl font-extrabold text-[#5D3A8C] mb-1">R$ 9,99</div>
                <div className="text-[10px] text-purple-500 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
                  Faturado mensalmente
                </div>
              </button>

              {/* Plan Annual */}
              <button
                id="plan-annual-btn"
                onClick={() => setSelectedPlan("annual")}
                className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 text-center transition-all ${
                  selectedPlan === "annual"
                    ? "border-purple-600 bg-purple-50/70 shadow-lg"
                    : "border-purple-200 bg-white hover:border-purple-400"
                }`}
              >
                <div className="absolute top-[-10px] bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow">
                  Melhor Valor
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">Anual</div>
                <div className="text-2xl font-extrabold text-[#5D3A8C] mb-1">R$ 29,99</div>
                <div className="text-[10px] text-purple-800 font-semibold bg-purple-200 px-2 py-0.5 rounded-full">
                  R$ 0,57/semana
                </div>
              </button>
            </div>

            {/* Premium action button */}
            <button
              id="unlock-premium-action-btn"
              disabled={!selectedPlan}
              onClick={() => {
                if (user.isGuest || user.email === "guest@momentum.app") {
                  setStep("register-mandatory");
                } else {
                  setStep("payment");
                }
              }}
              className={`w-full py-4 rounded-full font-bold transition-all text-center ${
                selectedPlan
                  ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md active:scale-[0.98]"
                  : "bg-purple-200 text-purple-400 cursor-not-allowed"
              }`}
            >
              Confirmar Plano {selectedPlan ? `(${planLabelMap[selectedPlan]})` : ""}
            </button>

            {/* Skip Option */}
            {showX && (
              <button
                id="skip-premium-btn"
                onClick={onSkip}
                className="text-xs text-purple-600 hover:text-purple-800 font-bold tracking-wide mt-5 focus:outline-none underline decoration-purple-300"
              >
                {isInsideApp ? "Voltar ao aplicativo" : "Continuar gratuitamente"}
              </button>
            )}
          </div>
        )}

        {step === "payment" && selectedPlan && (
          <div id="payment-gateway-view" className="w-full flex flex-col">
            <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-purple-100">
              <OwlLogo size={40} />
              <div>
                <h3 className="font-bold text-purple-950 text-sm">Assinatura Momentum {planLabelMap[selectedPlan]}</h3>
                <p className="text-xs text-purple-600 font-bold bg-purple-100 inline-block px-2 py-0.5 rounded-md mt-0.5">
                  Valor devido: {planPriceMap[selectedPlan]}
                </p>
              </div>
            </div>

            {/* Select Checkout Mode */}
            <div id="payment-tabs" className="grid grid-cols-2 gap-2 mb-4 bg-purple-50 p-1 rounded-xl">
              <button
                id="mode-card-tab"
                type="button"
                onClick={() => {
                  setPaymentMode("card");
                  setErrorMess("");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  paymentMode === "card" ? "bg-white text-purple-950 shadow-sm" : "text-purple-650 hover:bg-pink-50/40"
                }`}
              >
                <CreditCard size={15} />
                <span>Cartão de Crédito</span>
              </button>
              <button
                id="mode-pix-tab"
                type="button"
                onClick={() => {
                  setPaymentMode("pix");
                  setErrorMess("");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  paymentMode === "pix" ? "bg-white text-purple-950 shadow-sm" : "text-purple-650 hover:bg-pink-50/40"
                }`}
              >
                <Smartphone size={15} />
                <span>PIX Instantâneo</span>
              </button>
            </div>

            {/* CARD payment layout */}
            {paymentMode === "card" && (
              <form id="credit-card-form" onSubmit={handleCardPayment} className="space-y-3">
                <div className="flex flex-col space-y-0.5">
                  <label className="text-[10px] font-bold text-purple-900 ml-1 uppercase">Número do Cartão</label>
                  <input
                    id="card-number-input"
                    type="text"
                    required
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full bg-[#FBF9FE] border border-purple-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-purple-400 font-mono"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  />
                </div>

                <div className="flex flex-col space-y-0.5">
                  <label className="text-[10px] font-bold text-purple-900 ml-1 uppercase">Nome no Cartão</label>
                  <input
                    id="card-name-input"
                    type="text"
                    required
                    placeholder="CARLOS A SILVA"
                    className="w-full bg-[#FBF9FE] border border-purple-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-purple-400 placeholder:text-purple-300"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-0.5">
                    <label className="text-[10px] font-bold text-purple-900 ml-1 uppercase">Validade</label>
                    <input
                      id="card-expiry-input"
                      type="text"
                      required
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full bg-[#FBF9FE] border border-purple-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-purple-400 text-center font-mono"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    />
                  </div>
                  <div className="flex flex-col space-y-0.5">
                    <label className="text-[10px] font-bold text-purple-900 ml-1 uppercase">CVC / CVV</label>
                    <input
                      id="card-cvv-input"
                      type="password"
                      required
                      placeholder="123"
                      maxLength={4}
                      className="w-full bg-[#FBF9FE] border border-purple-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1.5 focus:ring-purple-400 text-center font-mono"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                  </div>
                </div>

                {errorMess && (
                  <p id="card-error" className="text-xs text-red-600 bg-red-50 p-2 rounded-lg text-center border border-red-100">
                    {errorMess}
                  </p>
                )}

                <button
                  id="submit-card-payment-btn"
                  type="submit"
                  className="w-full bg-purple-600 text-white py-3 rounded-full text-sm font-bold shadow hover:bg-purple-700 transition-all transform active:scale-95 flex items-center justify-center space-x-1.5 mt-2"
                >
                  <CreditCard size={16} />
                  <span>Concluir Assinatura</span>
                </button>
              </form>
            )}

            {/* PIX payment layout */}
            {paymentMode === "pix" && (
              <div id="pix-payment-details" className="flex flex-col items-center py-2 space-y-4">
                {/* Simulated PIX QR Code with Momentum branding inside */}
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 flex flex-col items-center relative">
                  <div className="w-44 h-44 bg-white rounded-xl p-2 flex items-center justify-center border border-purple-200">
                    <div className="relative">
                      {/* Artistic representation of a QR Code */}
                      <div className="grid grid-cols-4 gap-1 w-36 h-36">
                        {[...Array(16)].map((_, idx) => {
                          const isCorner = idx === 0 || idx === 3 || idx === 12 || idx === 15;
                          return (
                            <div
                              key={idx}
                              className={`rounded-sm ${
                                isCorner
                                  ? "bg-purple-950 border-2 border-purple-600"
                                  : (idx * 17) % 3 === 0
                                  ? "bg-purple-800"
                                  : "bg-purple-100"
                              }`}
                            />
                          );
                        })}
                      </div>
                      {/* Embedded cute coruja eye in the center */}
                      <div className="absolute inset-0 m-auto w-8 h-8 bg-purple-600 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px]">
                        🦉
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-700/60 font-bold uppercase mt-2 select-none tracking-wider">
                    QR CODE PIX ATIVO
                  </span>
                </div>

                <div className="w-full space-y-2">
                  <p className="text-xs text-center text-purple-950">
                    Copie a chave Pix abaixo ou escaneie o código com seu aplicativo do banco.
                  </p>

                  <div className="bg-[#FBF9FE] border border-purple-200 rounded-xl p-2 flex items-center justify-between text-xs">
                    <input
                      id="pix-key-input"
                      type="text"
                      readOnly
                      value={getPixCode().substring(0, 38) + "..."}
                      className="font-mono text-purple-900 bg-transparent flex-1 outline-none text-[10px] select-all px-1"
                    />
                    <button
                      type="button"
                      id="copy-pix-key-btn"
                      onClick={handleCopyPix}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-950 px-2 py-1 rounded-lg font-bold flex items-center space-x-1 text-[10px]"
                    >
                      <Clipboard size={12} />
                      <span>{pixCopied ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Verification trigger */}
                <div className="w-full pt-1">
                  <button
                    id="verify-pix-payment-btn"
                    onClick={simulatePixVerification}
                    disabled={isVerifyingPix}
                    className="w-full bg-purple-600 text-white py-3 rounded-full text-sm font-bold shadow hover:bg-purple-700 transition-all flex items-center justify-center space-x-2"
                  >
                    {isVerifyingPix ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        <span>Verificando transação...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Já realizei o pagamento Pix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Static pay instructions */}
            {!paymentMode && (
              <div id="payment-prompt" className="flex flex-col items-center py-8 text-center space-y-2 select-none">
                <CreditCard size={40} className="text-purple-300 animate-bounce" />
                <p className="text-sm font-bold text-[#5D3A8C]">Selecione a forma de pagamento acima</p>
                <p className="text-xs text-purple-600/70 max-w-xs">
                  Pagamento 100% criptografado e seguro. Liberação imediata dos seus recursos.
                </p>
              </div>
            )}

            {/* Back button */}
            <button
              id="back-to-selection-btn"
              onClick={() => {
                setStep("selection");
                setPaymentMode(null);
                setErrorMess("");
              }}
              className="text-xs text-[#5D3A8C] hover:underline font-bold text-center mt-4 self-center focus:outline-none"
            >
              Voltar aos Planos
            </button>
          </div>
        )}

        {step === "success" && (
          <div id="payment-success-congrats" className="w-full flex flex-col items-center text-center py-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-scaleUp shadow-inner">
              <CheckCircle size={50} className="stroke-[2.5]" />
            </div>

            <h3 className="text-2xl font-black text-emerald-700 font-sans tracking-tight leading-7">
              Parabéns!
            </h3>
            <p className="text-lg font-bold text-[#5D3A8C] mt-1 font-sans">
              Você é Premium!
            </p>
            
            <p className="text-xs text-[#777] max-w-xs mt-3 leading-relaxed">
              Todos os recursos avançados de IA e customização da coruja do <strong>Momentum</strong> foram ativados com sucesso em sua conta.
            </p>

            <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100/50 mt-4 flex items-center space-x-2 text-left self-stretch">
              <span className="text-xl">💝</span>
              <p className="text-[10px] text-purple-950 font-medium">
                Sua assinatura nos ajuda a manter a plataforma livre de distrações e focar inteiramente em sua produtividade!
              </p>
            </div>

            <button
              id="success-conclude-premium-btn"
              onClick={() => onPlanUpdate({ ...user, plan: "premium" })}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full text-sm font-bold shadow-md active:scale-[0.98] transition-all mt-6"
            >
              Começar a Usar Recursos Premium
            </button>
          </div>
        )}

        {step === "register-mandatory" && (
          <div id="register-required-view" className="w-full flex flex-col items-center py-4 space-y-6">
            
            {/* Pulsing Owl Logo & Main Introduction Header */}
            <div id="auth-inline-brand-header" className="flex flex-col items-center text-center mt-2 z-10 transition-transform duration-300">
              <OwlLogo className="mb-3 drop-shadow-md" size={90} pulse />
              <h1 className="text-2xl font-extrabold tracking-tight text-[#5D3A8C] mt-1 font-sans">
                {isRegLogin ? "Acesse sua conta no" : "Crie sua conta no"}
              </h1>
              <h2 className="text-4xl font-black text-[#8565C4] tracking-wide mt-0.5 font-sans">
                Momentum
              </h2>
              <p className="text-[#888] text-xs mt-1.5 max-w-xs font-sans leading-relaxed">
                Para prosseguir com sua assinatura Premium e sincronizar seus dados em qualquer dispositivo, precisamos autenticar você.
              </p>
            </div>

            {/* Micro App Description Cards Banners */}
            <div id="app-features-description-grid" className="w-full space-y-2.5 max-w-sm px-1.5">
              <div className="bg-white/40 backdrop-blur-sm border border-purple-100/50 p-3 rounded-2xl flex items-start space-x-2.5 shadow-xs transition-all hover:bg-white/60">
                <span className="text-lg">🦉</span>
                <div className="flex-1">
                  <h4 className="text-xs font-black text-purple-950 font-sans">Cronômetro Pomodoro Adaptativo</h4>
                  <p className="text-[10px] text-purple-800/80 leading-normal font-medium font-sans">Foco inteligente livre de distrações, com sonoridades e bobeiras bloqueadas.</p>
                </div>
              </div>
              <div className="bg-white/40 backdrop-blur-sm border border-purple-100/50 p-3 rounded-2xl flex items-start space-x-2.5 shadow-xs transition-all hover:bg-white/60">
                <span className="text-lg">⚡</span>
                <div className="flex-1">
                  <h4 className="text-xs font-black text-purple-950 font-sans">Atividades & Pesos de Esforço</h4>
                  <p className="text-[10px] text-purple-800/80 leading-normal font-medium font-sans">Divida seus afazeres acadêmicos e defina prioridades com facilidade no Kanban.</p>
                </div>
              </div>
              <div className="bg-white/40 backdrop-blur-sm border border-purple-100/50 p-3 rounded-2xl flex items-start space-x-2.5 shadow-xs transition-all hover:bg-white/60">
                <span className="text-lg">🏆</span>
                <div className="flex-1">
                  <h4 className="text-xs font-black text-purple-950 font-sans">Gamificação Ativa de Avanço</h4>
                  <p className="text-[10px] text-purple-800/80 leading-normal font-medium font-sans">Ganhe moedas, suba de nível e compre skins exclusivas de corujas e novas cores.</p>
                </div>
              </div>
            </div>

            {/* Interactive Form/Modes Container (Exactly styled like AuthScreen.tsx card) */}
            <div id="auth-actions-card" className="w-full max-w-sm bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/80 z-10">

              <form id="email-credentials-form" onSubmit={handleInlineRegister} className="space-y-4">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-wider text-purple-600 font-extrabold block">
                    {isRegLogin ? "Acessar Conta" : "Criar nova conta"}
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
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={isRegLoading}
                  />
                </div>

                {/* Input Senha */}
                <div className="flex flex-col space-y-1 relative">
                  <label className="text-xs font-semibold text-purple-700 ml-1">Senha</label>
                  <div className="relative">
                    <input
                      id="form-password-input"
                      type={showRegPassword ? "text" : "password"}
                      required
                      className="w-full bg-[#F3EEFA] border border-purple-200 rounded-2xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-sans"
                      placeholder="Mínimo de 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      disabled={isRegLoading}
                    />
                    <button
                      type="button"
                      id="toggle-password-visibility"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3.5 text-purple-500 hover:text-purple-700 font-sans cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {regError && (
                  <div id="auth-error" className="bg-red-50 text-red-600 text-xs py-2 px-3 rounded-xl border border-red-100 text-center font-semibold font-sans leading-normal">
                    ⚠️ {regError}
                  </div>
                )}

                {regSuccess && (
                  <div id="auth-success" className="bg-emerald-50 text-emerald-700 text-xs py-2 px-3 rounded-xl border border-emerald-100 text-center font-bold font-sans leading-normal">
                    ✨ {regSuccess}
                  </div>
                )}

                {/* Proceed Actions */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    id="cancel-email-form"
                    onClick={() => {
                      setStep("selection");
                      setRegError("");
                    }}
                    disabled={isRegLoading}
                    className="flex-1 border border-purple-300 text-purple-700 py-3 rounded-full text-sm font-semibold hover:bg-purple-50 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    id="submit-auth-form"
                    disabled={isRegLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full text-sm font-semibold shadow active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {isRegLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Carregando...</span>
                      </>
                    ) : (
                      <>
                        <span>{isRegLogin ? "Entrar" : "Cadastrar"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Alternate Login / Sign up State Link */}
              <div className="text-center mt-5">
                <button
                  id="toggle-login-mode"
                  type="button"
                  onClick={() => {
                    setIsRegLogin(!isRegLogin);
                    setRegError("");
                    setRegSuccess("");
                  }}
                  className="text-xs text-[#5D3A8C] hover:underline font-bold transition-all focus:outline-none cursor-pointer"
                >
                  {isRegLogin ? (
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
          </div>
        )}

      </div>
    </div>
  );
}
