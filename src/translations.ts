export interface TranslationKeys {
  // Common
  appName: string;
  premiumActive: string;
  getPremium: string;
  logoutButton: string;
  logoutAccount: string;
  cancelButton: string;
  activeWord: string;
  lockedWord: string;

  // Sidebar
  myActivities: string;
  accountTab: string;
  starTasks: string;
  themesTab: string;
  settingsTab: string;
  owlMascotSub: string;
  standardPlanLabel: string;
  blockDistractionsTitle: string;
  blockDistractionsDesc: string;
  unlockNow: string;

  // Dashboard / Notes Feed
  allCategory: string;
  workCategory: string;
  personalCategory: string;
  studyCategory: string;
  starredNotesTitle: string;
  starredNotesDesc: string;
  primaryActivitiesTitle: string;
  primaryActivitiesDesc: string;
  firstTaskHelp: string;
  firstTaskLabel: string;
  subtasksLabel: string;
  noContentPlaceholder: string;
  noteTitlePlaceholder: string;
  categoryLabel: string;
  dateLabel: string;
  startWritingPlaceholder: string;
  subtasksExecHeader: string;
  splitWithAiButton: string;
  consultingAi: string;
  addManualSubtaskPlaceholder: string;
  addBtn: string;
  noSubtasksYet: string;
  saveActivityBtn: string;

  // Pomodoro timer
  strictFocusTimerTitle: string;
  sessionWord: string;
  activeFocusText: string;
  pendingText: string;
  completedText: string;
  abandonedText: string;
  productivityScoreLabel: string;
  startFocusBtn: string;
  pauseBtn: string;
  resumeBtn: string;
  resetBtn: string;
  unlockedRewardsLabel: string;
  absoluteFocusReward: string;
  partialGoldReward: string;
  partialBronzeReward: string;
  interruptionSimulatorTitle: string;
  interruptionSimulatorDesc: string;
  shortInterruptionBtn: string;
  mediumInterruptionBtn: string;
  longInterruptionBtn: string;
  abandonInterruptionBtn: string;
  noPenaltyLabel: string;
  alertFocusLabel: string;
  reducedLabel: string;
  canceledLabel: string;

  // Pomodoro alerts / simulation descriptions
  shortInterDesc: string;
  mediumInterDesc: string;
  longInterDesc: string;
  abandonInterDesc: string;
  alertNoticeHeader: string;

  // AI Assistant Owl
  owlAssistantTitle: string;
  premiumAiActive: string;
  basicAiStandard: string;
  freeAiIntro: string;
  premiumAiIntro: string;
  getBasicSuggestionBtn: string;
  getAdvancedReportBtn: string;
  generatingReport: string;
  routineGoalsHeader: string;
  predictiveHeader: string;

  // Profile Form
  yourProfileHeader: string;
  customizeAvatarName: string;
  upgradeText: string;
  subscriptionStatusLabel: string;
  freeOption: string;
  premiumOption: string;
  accessTypeLabel: string;
  freeGuestSession: string;
  registeredUser: string;
  customThemesTitle: string;
  customThemesDesc: string;
  exclusivePremiumHeader: string;
  themeSwitchLockedDesc: string;
  classicLavender: string;
  spaceSlate: string;
  sakuraPink: string;
  calmMint: string;
  deepBlue: string;

  // Configuration View
  generalSettingsTitle: string;
  blockDistractingLabel: string;
  blockDistractingDesc: string;
  defaultActiveBadge: string;
  localDataSyncLabel: string;
  localDataSyncDesc: string;
  owlCompanionLabel: string;
  owlCompanionDesc: string;
  appVersionFooter: string;
  todayLabel: string;
  thisWeekLabel: string;
  tasksCountLabel: string;
  backToAllButton: string;
  todayTasksTitle: string;
  thisWeekTasksTitle: string;
  pwaModalTitle: string;
  pwaModalDesc: string;
  pwaContinueBrowser: string;
  pwaTransformApp: string;
  pwaInstallOption: string;
  pwaInstallInstructionsTitle: string;
}

export const translations: Record<"pt" | "en" | "es", TranslationKeys> = {
  pt: {
    appName: "Momentum",
    premiumActive: "Premium Ativo",
    getPremium: "Seja Premium 🌟",
    logoutButton: "Sair",
    logoutAccount: "Sair da Conta",
    cancelButton: "Cancelar",
    activeWord: "Ativo",
    lockedWord: "Bloqueado",

    myActivities: "Minhas Atividades",
    accountTab: "Conta",
    starTasks: "Star Tasks",
    themesTab: "Temas",
    settingsTab: "Configurações",
    owlMascotSub: "Mascote Coruja",
    standardPlanLabel: "Plano Padrão (Seja Premium)",
    blockDistractionsTitle: "Bloquear Distrações?",
    blockDistractionsDesc: "Assine o Premium para customizar sua lista de aplicativos proibidos.",
    unlockNow: "Desbloquear agora",

    allCategory: "Todos",
    workCategory: "Trabalho",
    personalCategory: "Pessoal",
    studyCategory: "Estudos",
    starredNotesTitle: "Notas Estreladas",
    starredNotesDesc: "Atividades de altíssima prioridade monitoradas pela coruja.",
    primaryActivitiesTitle: "Principais atividades",
    primaryActivitiesDesc: "Organize seu dia sem procrastinação. Crie notas, agende subtarefas e inicie o foco Pomodoro com a mascote do Momentum.",
    firstTaskHelp: "Crie aqui sua",
    firstTaskLabel: "primeira tarefa",
    subtasksLabel: "Subtarefas",
    noContentPlaceholder: "Nenhum conteúdo adicional...",
    noteTitlePlaceholder: "Nome da atividade (ex: Atividade 1)",
    categoryLabel: "Categoria:",
    dateLabel: "Data:",
    startWritingPlaceholder: "Começe a escrever...",
    subtasksExecHeader: "Subtarefas de Execução",
    splitWithAiButton: "Dividir com IA Premium",
    consultingAi: "Consultando IA...",
    addManualSubtaskPlaceholder: "Adicionar subtarefa manual...",
    addBtn: "Add",
    noSubtasksYet: "Nenhuma subtarefa adicionada ainda.",
    saveActivityBtn: "Salvar Atividade",

    strictFocusTimerTitle: "Cronômetro de Foco strict",
    sessionWord: "Sessão",
    activeFocusText: "Foco Ativo 🧘",
    pendingText: "Pendente ⏱️",
    completedText: "Concluído 🎉",
    abandonedText: "Abandonado ❌",
    productivityScoreLabel: "Aproveitamento:",
    startFocusBtn: "Iniciar Foco",
    pauseBtn: "Pausar",
    resumeBtn: "Retomar",
    resetBtn: "Reset",
    unlockedRewardsLabel: "Recompensas Desbloqueadas:",
    absoluteFocusReward: "Medalha de Foco Absoluto 🥇",
    partialGoldReward: "Recompensa Parcial (Bronze) 🥉",
    partialBronzeReward: "Recompensa Parcial (Bronze) 🥉",
    interruptionSimulatorTitle: "Simulador de Interrupções",
    interruptionSimulatorDesc: "Teste as regras estritas da grade da disciplina simulando eventos de interrupção fora do app:",
    shortInterruptionBtn: "Curta (≤ 2 Minutos)",
    mediumInterruptionBtn: "Média (2 a 5 Minutos)",
    longInterruptionBtn: "Longa (5 a 10 Minutos)",
    abandonInterruptionBtn: "Abandono (> 10 Minutos)",
    noPenaltyLabel: "Sem punição",
    alertFocusLabel: "Foco Alerta",
    reducedLabel: "Parcial / Reduzida",
    canceledLabel: "Cancelada",

    shortInterDesc: "Interrupção Curta (até 2 min): Sessão continua normalmente. Sem penalidade.",
    mediumInterDesc: "Interrupção Média (2 a 5 min): Alerta de perda de foco emitido. Pequena redução na pontuação.",
    longInterDesc: "Interrupção Longa (acima de 5 min): Sessão marcada como parcialmente concluída. Recompensas reduzidas.",
    abandonInterDesc: "Abandono (acima de 10 min): Sessão considerada abandonada. Encerrada automaticamente sem recompensas.",
    alertNoticeHeader: "Simulação de Interrupção",

    owlAssistantTitle: "Coruja Assistente de IA",
    premiumAiActive: "AI Premium Ativa",
    basicAiStandard: "AI Básica Padrão",
    freeAiIntro: "Obtenha sugestões básicas para organizar seu dia e reagendar tarefas recomendadas pela nossa IA.",
    premiumAiIntro: "Acesso total aos relatórios estatísticos e recomendações adaptativas baseadas em seu histórico de foco.",
    getBasicSuggestionBtn: "Solicitar Sugestão Básica",
    getAdvancedReportBtn: "Gerar Relatório de IA Avançado",
    generatingReport: "Gerando Análise Completa...",
    routineGoalsHeader: "Rotina e Metas Adaptativas:",
    predictiveHeader: "Acompanhamento Preditivo:",

    yourProfileHeader: "Seu Perfil Momentum",
    customizeAvatarName: "Personalizar Nome ou Avatar",
    upgradeText: "Fazer Upgrade Premium (+ Recursos)",
    subscriptionStatusLabel: "Status de Assinatura:",
    freeOption: "Grátis",
    premiumOption: "Premium",
    accessTypeLabel: "Tipo de Acesso:",
    freeGuestSession: "Sessão Gratuita de Convidado",
    registeredUser: "Usuário Registrado",
    customThemesTitle: "Temas Personalizados",
    customThemesDesc: "Escolha a paleta de cores ideal para deixar seu Momentum mais focado e produtivo.",
    exclusivePremiumHeader: "Recurso Exclusivo Premium",
    themeSwitchLockedDesc: "Conforme os requisitos da disciplina, a troca de temas está disponível apenas para usuários do plano Premium. Clique em \"Seja Premium\" acima para desbloquear!",
    classicLavender: "Lilás Clássico (Amostra)",
    spaceSlate: "Slate Espacial (Escuro)",
    sakuraPink: "Rosa Flor de Cerejeira",
    calmMint: "Verde Menta Calmo",
    deepBlue: "Azul Foco Profundo",

    generalSettingsTitle: "Configurações Gerais",
    blockDistractingLabel: "Bloquear Aplicações Distrativas",
    blockDistractingDesc: "O sistema possui uma lista padrão (Instagram, TikTok, Twitter).",
    defaultActiveBadge: "Padrão Ativo",
    localDataSyncLabel: "Sincronização de Dados local",
    localDataSyncDesc: "Seus dados e notas são persistidos localmente de forma segura e imediata.",
    owlCompanionLabel: "Mascote Coruja",
    owlCompanionDesc: "Lembretes motivacionais e análises preditivas integradas nas suas rotinas de foco.",
    appVersionFooter: "Versão do App: v1.0.2 (2026.1) | Projeto da Disciplina Haroldo Peon",
    todayLabel: "hoje",
    thisWeekLabel: "essa semana",
    tasksCountLabel: "tarefas",
    backToAllButton: "Ver Todas Atividades",
    todayTasksTitle: "Atividades de Hoje 📅",
    thisWeekTasksTitle: "Atividades desta Semana 🗓️",
    pwaModalTitle: "Instalar Momentum PWA 📱",
    pwaModalDesc: "Deseja continuar utilizando o Momentum diretamente no seu navegador ou transformá-lo em um aplicativo nativo (PWA) de alta performance para acesso rápido?",
    pwaContinueBrowser: "Continuar no Navegador",
    pwaTransformApp: "Transformar em PWA",
    pwaInstallOption: "Transformar em PWA 📱",
    pwaInstallInstructionsTitle: "Como instalar o Momentum"
  },
  en: {
    appName: "Momentum",
    premiumActive: "Premium Active",
    getPremium: "Go Premium 🌟",
    logoutButton: "Logout",
    logoutAccount: "Log Out of Account",
    cancelButton: "Cancel",
    activeWord: "Active",
    lockedWord: "Locked",

    myActivities: "My Activities",
    accountTab: "Account",
    starTasks: "Starred Tasks",
    themesTab: "Themes",
    settingsTab: "Settings",
    owlMascotSub: "Owl Companion",
    standardPlanLabel: "Standard Plan (Go Premium)",
    blockDistractionsTitle: "Block Distractions?",
    blockDistractionsDesc: "Subscribe to Premium to customize your block list of forbidden applications.",
    unlockNow: "Unlock now",

    allCategory: "All",
    workCategory: "Work",
    personalCategory: "Personal",
    studyCategory: "Studies",
    starredNotesTitle: "Starred Notes",
    starredNotesDesc: "High-priority activities monitored by the owl companion.",
    primaryActivitiesTitle: "Primary Activities",
    primaryActivitiesDesc: "Organize your day without procrastination. Create notes, schedule subtasks and start Pomodoro focus with the Momentum mascot.",
    firstTaskHelp: "Create your",
    firstTaskLabel: "first task here",
    subtasksLabel: "Subtasks",
    noContentPlaceholder: "No additional content...",
    noteTitlePlaceholder: "Activity name (e.g., Activity 1)",
    categoryLabel: "Category:",
    dateLabel: "Date:",
    startWritingPlaceholder: "Start writing...",
    subtasksExecHeader: "Execution Subtasks",
    splitWithAiButton: "Split with Premium AI",
    consultingAi: "Consulting AI...",
    addManualSubtaskPlaceholder: "Add subtask manually...",
    addBtn: "Add",
    noSubtasksYet: "No subtasks added yet.",
    saveActivityBtn: "Save Activity",

    strictFocusTimerTitle: "Strict Focus Timer",
    sessionWord: "Session",
    activeFocusText: "Active Focus 🧘",
    pendingText: "Pending ⏱️",
    completedText: "Completed 🎉",
    abandonedText: "Abandoned ❌",
    productivityScoreLabel: "Efficiency Score:",
    startFocusBtn: "Start Focus",
    pauseBtn: "Pause",
    resumeBtn: "Resume",
    resetBtn: "Reset",
    unlockedRewardsLabel: "Unlocked Rewards:",
    absoluteFocusReward: "Absolute Focus Medal 🥇",
    partialGoldReward: "Partial Bronze Award 🥉",
    partialBronzeReward: "Partial Bronze Award 🥉",
    interruptionSimulatorTitle: "Interruption Simulator",
    interruptionSimulatorDesc: "Test strict academic focus constraints from the syllabus by triggering simulated distraction events:",
    shortInterruptionBtn: "Short (≤ 2 Minutes)",
    mediumInterruptionBtn: "Medium (2 to 5 Minutes)",
    longInterruptionBtn: "Long (5 to 10 Minutes)",
    abandonInterruptionBtn: "Abandonment (> 10 Minutes)",
    noPenaltyLabel: "No penalty",
    alertFocusLabel: "Focus Alert",
    reducedLabel: "Partial / Reduced",
    canceledLabel: "Canceled",

    shortInterDesc: "Short Interruption (up to 2 min): Session continues normally. No penalty applied.",
    mediumInterDesc: "Medium Interruption (2 to 5 min): Focus warning issued. Slight reduction in score.",
    longInterDesc: "Long Interruption (over 5 min): Session marked partially complete. Reduced score & rewards.",
    abandonInterDesc: "Abandonment (over 10 min): Session considered abandoned. Ended automatically with zero rewards.",
    alertNoticeHeader: "Interruption Simulation",

    owlAssistantTitle: "Owl AI Assistant",
    premiumAiActive: "Premium AI Active",
    basicAiStandard: "Basic Standard AI",
    freeAiIntro: "Get basic suggestions to organize your day and reschedule tasks recommended by our native AI.",
    premiumAiIntro: "Full access to detailed analytics reports and adaptive recommendations tailored to your focus metrics.",
    getBasicSuggestionBtn: "Request Basic Suggestion",
    getAdvancedReportBtn: "Generate Advanced AI Report",
    generatingReport: "Generating Complete Diagnostics...",
    routineGoalsHeader: "Adaptive Routine & Goals:",
    predictiveHeader: "Predictive Diagnostics:",

    yourProfileHeader: "Your Momentum Profile",
    customizeAvatarName: "Customize Name or Avatar",
    upgradeText: "Upgrade to Premium (+ Features)",
    subscriptionStatusLabel: "Subscription Status:",
    freeOption: "Free",
    premiumOption: "Premium",
    accessTypeLabel: "Access Level:",
    freeGuestSession: "Free Guest Session",
    registeredUser: "Registered User",
    customThemesTitle: "Custom Themes",
    customThemesDesc: "Choose the perfect color palette to keep your Momentum focused and aesthetically customized.",
    exclusivePremiumHeader: "Exclusive Premium Feature",
    themeSwitchLockedDesc: "According to course specifications, custom theme selection is exclusive to Premium subscribers. Click \"Go Premium\" above to unlock!",
    classicLavender: "Classic Lavender (Sample)",
    spaceSlate: "Space Slate (Dark)",
    sakuraPink: "Cherry Blossom Sakura",
    calmMint: "Calm Mint Green",
    deepBlue: "Deep Focus Ocean Blue",

    generalSettingsTitle: "General Settings",
    blockDistractingLabel: "Block Distractive Apps",
    blockDistractingDesc: "The system runs a default blacklist (Instagram, TikTok, Twitter).",
    defaultActiveBadge: "Active Default",
    localDataSyncLabel: "Local Data Synchronization",
    localDataSyncDesc: "Your tasks and notes are securely and instantly stored locally on your device.",
    owlCompanionLabel: "Owl Mascot Coach",
    owlCompanionDesc: "Smart motivational recommendations and predictive diagnostics built directly into your active routines.",
    appVersionFooter: "App Version: v1.0.2 (2026.1) | Course Project - Harold Peon",
    todayLabel: "today",
    thisWeekLabel: "this week",
    tasksCountLabel: "tasks",
    backToAllButton: "View All Activities",
    todayTasksTitle: "Today's Activities 📅",
    thisWeekTasksTitle: "This Week's Activities 🗓️",
    pwaModalTitle: "Install Momentum PWA 📱",
    pwaModalDesc: "Would you like to continue using Momentum in your browser or transform it into a native high-performance app (PWA) for quicker access?",
    pwaContinueBrowser: "Continue in Browser",
    pwaTransformApp: "Transform into PWA",
    pwaInstallOption: "Transform into PWA 📱",
    pwaInstallInstructionsTitle: "How to Install Momentum"
  },
  es: {
    appName: "Momentum",
    premiumActive: "Premium Activo",
    getPremium: "Hazte Premium 🌟",
    logoutButton: "Salir",
    logoutAccount: "Cerrar Sesión de la Cuenta",
    cancelButton: "Cancelar",
    activeWord: "Activo",
    lockedWord: "Bloqueado",

    myActivities: "Mis Actividades",
    accountTab: "Cuenta",
    starTasks: "Tareas Estrella",
    themesTab: "Temas",
    settingsTab: "Configuraciones",
    owlMascotSub: "Mascota Búho",
    standardPlanLabel: "Plan Estándar (Consigue Premium)",
    blockDistractionsTitle: "¿Bloquear Distracciones?",
    blockDistractionsDesc: "Suscríbete a Premium para personalizar tu lista de aplicaciones prohibidas.",
    unlockNow: "Desbloquear ahora",

    allCategory: "Todos",
    workCategory: "Trabajo",
    personalCategory: "Personal",
    studyCategory: "Estudios",
    starredNotesTitle: "Notas Estrella",
    starredNotesDesc: "Actividades de alta prioridad monitoreadas de cerca por la lechuza guía.",
    primaryActivitiesTitle: "Actividades principales",
    primaryActivitiesDesc: "Organiza tu día sin procrastinar. Crea notas, programa subtareas e inicia el estudio Pomodoro con el búho de Momentum.",
    firstTaskHelp: "Crea aquí tu",
    firstTaskLabel: "primera tarea",
    subtasksLabel: "Subtareas",
    noContentPlaceholder: "Sin contenido adicional...",
    noteTitlePlaceholder: "Nombre de la tarea (ej: Actividad 1)",
    categoryLabel: "Categoría:",
    dateLabel: "Fecha:",
    startWritingPlaceholder: "Comienza a escribir...",
    subtasksExecHeader: "Subtareas de Ejecución",
    splitWithAiButton: "Dividir con Inteligencia Artificial Premium",
    consultingAi: "Consultando IA...",
    addManualSubtaskPlaceholder: "Agregar subtarea manual...",
    addBtn: "Add",
    noSubtasksYet: "Aún no se han agregado subtareas.",
    saveActivityBtn: "Guardar Actividad",

    strictFocusTimerTitle: "Cronómetro de Enfoque Estricto",
    sessionWord: "Sesión",
    activeFocusText: "Enfoque Activo 🧘",
    pendingText: "Pendiente ⏱️",
    completedText: "Completado 🎉",
    abandonedText: "Abandonado ❌",
    productivityScoreLabel: "Rendimiento:",
    startFocusBtn: "Iniciar Enfoque",
    pauseBtn: "Pausar",
    resumeBtn: "Reanudar",
    resetBtn: "Reset",
    unlockedRewardsLabel: "Recompensas Desbloqueadas:",
    absoluteFocusReward: "Medalla de Enfoque Absoluto 🥇",
    partialGoldReward: "Recompensa Parcial (Bronce) 🥉",
    partialBronzeReward: "Recompensa Parcial (Bronce) 🥉",
    interruptionSimulatorTitle: "Simulador de Interrupciones",
    interruptionSimulatorDesc: "Prueba las estrictas restricciones de la disciplina simulando alertas de distracciones externas:",
    shortInterruptionBtn: "Corta (≤ 2 Minutos)",
    mediumInterruptionBtn: "Media (2 a 5 Minutos)",
    longInterruptionBtn: "Larga (5 a 10 Minutos)",
    abandonInterruptionBtn: "Abandono (> 10 Minutos)",
    noPenaltyLabel: "Sin sanción",
    alertFocusLabel: "Enfoque Alerta",
    reducedLabel: "Parcial / Reducida",
    canceledLabel: "Cancelada",

    shortInterDesc: "Interrupción Corta (hasta 2 min): La sesión continúa normalmente. Sin penalización.",
    mediumInterDesc: "Interrupción Media (2 a 5 min): Alerta de pérdida de atención. Pequeña baja en rendimiento.",
    longInterDesc: "Interrupción Larga (más de 5 min): Sesión marcada parcialmente completa. Descuento en puntaje.",
    abandonInterDesc: "Abandono (más de 10 min): Sesión considerada abandonada. Cerrada automáticamente sin premios.",
    alertNoticeHeader: "Simulación de Interrupción",

    owlAssistantTitle: "Búho Asistente con IA",
    premiumAiActive: "IA Premium Activa",
    basicAiStandard: "IA Básica Estándar",
    freeAiIntro: "Obtén recomendaciones directas para estructurar tu día y reprogramar tareas sugeridas por nuestra IA.",
    premiumAiIntro: "Acceso ilimitado a diagnósticos completos y optimizaciones diarias basadas en tus ritmos de trabajo.",
    getBasicSuggestionBtn: "Solicitar Sugerencia Básica",
    getAdvancedReportBtn: "Generar Informe de IA Avanzado",
    generatingReport: "Generando Diagnóstico Completo...",
    routineGoalsHeader: "Rutina y Metas Adaptativas:",
    predictiveHeader: "Análisis Predictivo:",

    yourProfileHeader: "Tu Perfil en Momentum",
    customizeAvatarName: "Personalizar Nombre o Avatar",
    upgradeText: "Mejorar a Premium (+ Funciones)",
    subscriptionStatusLabel: "Estado de la Suscripción:",
    freeOption: "Gratis",
    premiumOption: "Premium",
    accessTypeLabel: "Tipo de Acceso:",
    freeGuestSession: "Sesión de Invitado Gratuita",
    registeredUser: "Usuario Registrado",
    customThemesTitle: "Temas Personalizados",
    customThemesDesc: "Elige la combinación de colores ideal para incentivar un ambiente enfocado y de alta concentración.",
    exclusivePremiumHeader: "Función Premium Exclusiva",
    themeSwitchLockedDesc: "Basado en los lineamientos de la rúbrica, la personalización de interfaz solo está disponible para usuarios de la versión Premium. ¡Haz clic en \"Hazte Premium\" para canjear!",
    classicLavender: "Lavanda Clásico (Muestra)",
    spaceSlate: "Slate Espacial (Oscuro)",
    sakuraPink: "Cerezo en Flor",
    calmMint: "Verde Menta Calmante",
    deepBlue: "Azul Océano Enfoque",

    generalSettingsTitle: "Configuraciones Generales",
    blockDistractingLabel: "Bloquear Apps Distractoras",
    blockDistractingDesc: "El sistema mantiene una lista negra estándar (Instagram, TikTok, Twitter).",
    defaultActiveBadge: "Activo por Defecto",
    localDataSyncLabel: "Sincronización de Datos Local",
    localDataSyncDesc: "Tus datos y apuntes se almacenan localmente en tu terminal de manera inmediata.",
    owlCompanionLabel: "Mascota Búho Guía",
    owlCompanionDesc: "Comentarios motivacionales y reportes de comportamento predictivo incorporados en tiempo real.",
    appVersionFooter: "Versión de la App: v1.0.2 (2026.1) | Proyecto de Cátedra - Haroldo Peón",
    todayLabel: "hoy",
    thisWeekLabel: "esta semana",
    tasksCountLabel: "tareas",
    backToAllButton: "Ver Todas las Actividades",
    todayTasksTitle: "Actividades de Hoy 📅",
    thisWeekTasksTitle: "Actividades de esta Semana 🗓️",
    pwaModalTitle: "Instalar Momentum PWA 📱",
    pwaModalDesc: "¿Deseas seguir utilizando Momentum directamente en tu navegador o prefieres transformarlo en una aplicación nativa (PWA) de alto rendimiento para un acceso veloz?",
    pwaContinueBrowser: "Continuar en Navegador",
    pwaTransformApp: "Transformar en PWA",
    pwaInstallOption: "Transformar en PWA 📱",
    pwaInstallInstructionsTitle: "Cómo instalar Momentum"
  }
};
