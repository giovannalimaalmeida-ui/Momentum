import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
let API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  API_KEY = API_KEY.trim();
  if (API_KEY.startsWith('"') && API_KEY.endsWith('"')) {
    API_KEY = API_KEY.substring(1, API_KEY.length - 1);
  } else if (API_KEY.startsWith("'") && API_KEY.endsWith("'")) {
    API_KEY = API_KEY.substring(1, API_KEY.length - 1);
  }
}

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY" && API_KEY !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API cliente inicializado com sucesso.");
  } catch (error) {
    console.error("Erro ao inicializar o cliente Gemini API:", error);
  }
} else {
  console.log("Chave de API do Gemini (GEMINI_API_KEY) ausente ou padrão. Ativando respostas pré-programadas ultra interativas.");
}

// Interactive chat with the Wise Owl helper (Premium Only)
app.post("/api/ai/chat", async (req, res) => {
  const { username, prompt, tasks, dailyTasks, history, plan } = req.body;

  // Server-side premium verification
  if (plan !== "premium") {
    return res.status(403).json({
      reply: "🦉 *Huu-Huu!* O chat interativo personalizado com a Coruja Sábia é um privilégio exclusivo para membros do plano **Premium**. Faça o upgrade do seu plano para decolar!"
    });
  }

  const systemInstruction = `Você é a Coruja Sábia, o mascote e mentor de produtividade inteligente do aplicativo MOMENTUM. Seu objetivo é ajudar o usuário a vencer a procrastinação com conselhos práticos, acolhedores e focados em ação rápida.
Você tem ciência absoluta de todas as atividades, tarefas e subtarefas do usuário em tempo real. Se o usuário fizer qualquer pergunta relacionada a suas tarefas ou diárias (como listar, contar, perguntar qual é a mais rápida ou difícil, pedir para focar, analisar prazos, sugerir priorização, etc.), você DEVE responder de forma altamente informada, citando os nomes reais das atividades dele de maneira amigável, clara e estruturada. Use tom motivador, por vezes brincalhão (como uma coruja sábia que digita asas e faz piadas de voo, foco e silêncio), mas sempre focado em soluções acionáveis. Divida tarefas grandes, sugira técnicas de foco (como Pomodoro, regra dos 5 minutos, engasgar o sapo) e responda de forma estruturada. Nunca seja prolixo.`;

  const query = (prompt || "").toLowerCase();

  // Helper function for ultra-rich fallback responses when Gemini is offline or rate limited
  const generateOfflineChatResponse = (queryText: string, userDisplayName: string, taskList: any[], dailyTaskList: any[]): string => {
    const q = queryText.toLowerCase();
    const activeTasks = (taskList || []).filter((t: any) => !t.completed);
    const completedTasks = (taskList || []).filter((t: any) => t.completed);
    const activeDaily = (dailyTaskList || []).filter((d: any) => !d.completed);
    const completedDaily = (dailyTaskList || []).filter((d: any) => d.completed);
    
    const totalTasks = (taskList || []).length;
    const totalDaily = (dailyTaskList || []).length;
    
    const greeting = `🦉 *Huu-Huu!* Olá, ${userDisplayName || "Membro Premium"}! Sou a Coruja Sábia, sua mentora intelectual integrada ao Momentum. `;

    // 1. Query about tasks list
    if (q.includes("quais") || q.includes("listar") || q.includes("ver") || q.includes("tarefa") || q.includes("atividade") || q.includes("atividades") || q.includes("lista") || q.includes("diaria") || q.includes("diária") || q.includes("diárias")) {
      if (totalTasks === 0 && totalDaily === 0) {
        return greeting + `Analisei seu painel com meus olhos agudos e vi que você não possui tarefas normais criadas ou rituais diários cadastrados hoje. Que tal dar o primeiro passo adicionando uma atividade?`;
      }
      
      let replyText = greeting + `Fiz uma varredura aérea no seu painel! Aqui estão as atividades marcadas no seu voo:\n\n`;
      
      if (activeTasks.length > 0) {
        replyText += `📌 **Tarefas Regulares Ativas (${activeTasks.length}):**\n` + 
          activeTasks.map((t: any) => `• **${t.title}** [${t.category || "Geral"}] - *${t.difficulty || "Média"}*`).join("\n") + "\n\n";
      }
      
      if (activeDaily.length > 0) {
        replyText += `📅 **Tarefas Diárias Pendentes (${activeDaily.length}):**\n` + 
          activeDaily.map((d: any) => `• **${d.title}** (Ritual Diário)`).join("\n") + "\n\n";
      }

      if (completedTasks.length > 0 || completedDaily.length > 0) {
        replyText += `✅ **Concluídas Hoje:**\n`;
        if (completedTasks.length > 0) {
          replyText += completedTasks.map((t: any) => `• ~~${t.title}~~ (Tarefa Regular)`).join("\n") + "\n";
        }
        if (completedDaily.length > 0) {
          replyText += completedDaily.map((d: any) => `• ~~${d.title}~~ (Hábito Diário)`).join("\n") + "\n";
        }
        replyText += "\n";
      }

      replyText += `Minha mentoria recomenda focar agora na tarefa mais urgente ou em uma tarefa diária simples de marcar como pronta para energizar o cérebro! Qual escolhemos?`;
      return replyText;
    }

    // 2. Query about count or statistics
    if (q.includes("quantas") || q.includes("quantos") || q.includes("número") || q.includes("numero") || q.includes("total") || q.includes("xp") || q.includes("estatística") || q.includes("progresso") || q.includes("estatisticas") || q.includes("nível") || q.includes("nivel")) {
      return greeting + `Mapeei suas estatísticas em tempo real para o voo de hoje:\n\n` +
        `📊 **Relatório de Desempenho:**\n` +
        `- Tarefas Regulares: **${totalTasks}** (⏳ **${activeTasks.length}** pendentes, ✅ **${completedTasks.length}** concluídas)\n` +
        `- Tarefas Diárias: **${totalDaily}** (⏳ **${activeDaily.length}** pendentes hoje, ✅ **${completedDaily.length}** feitas)\n\n` +
        `Continue subindo alto! Cada pendência resolvida te rende valiosos Pontos de Experiência (XP). Qual o rumo ideal para nossa próxima decolagem?`;
    }

    // 3. Query about priority / difficult / what to focus on first
    if (q.includes("difícil") || q.includes("dificil") || q.includes("fácil") || q.includes("facil") || q.includes("prioridade") || q.includes("priorizar") || q.includes("foco") || q.includes("ajuda") || q.includes("por onde") || q.includes("sugere") || q.includes("recomenda")) {
      const hardTasks = activeTasks.filter((t: any) => t.difficulty === "dificil" || t.difficulty === "medio" || t.difficulty === "Lendária");
      
      if (hardTasks.length > 0) {
        return greeting + `Para otimizar o consumo das suas asas de produtividade, identifiquei as metas de maior prioridade em aberto:\n\n` +
          hardTasks.map((t: any) => `• **${t.title}** (Nível: *${t.difficulty}*)`).join("\n") + 
          `\n\n💡 **Tática Recomendada:** Utilize o método *Engolir o Sapo*! Ataque a tarefa de maior complexidade **${hardTasks[0].title}** com o cronômetro configurado por 25 minutos livre de distração. Vencendo o maior desafio primeiro, seu dia fluirá incrivelmente leve!`;
      } else if (activeTasks.length > 0) {
        return greeting + `Seu painel não possui tarefas complexas em aberto no momento! Isso é formidável.\n\n` +
          `Sua melhor decolagem imediata seria focar na tarefa "**${activeTasks[0].title}**". O que acha de iniciarmos um timer de 25 minutos nela agora mesmo?`;
      } else if (activeDaily.length > 0) {
        return greeting + `Você zerou suas tarefas acadêmicas normais! Mas sua tarefa diária "**${activeDaily[0].title}**" ainda está pendente. Cumprir hábitos diários sedimenta a estabilidade do seu voo diário. Vamos realizá-la?`;
      } else {
        return greeting + `Seu painel está perfeitamente limpo hoje! Nenhuma tarefa acadêmica pendente e todas as obrigações diárias cumpridas. Desfrute de um merecido descanso ou comece a rascunhar seus projetos futuros de asas bem relaxadas!`;
      }
    }

    // 4. Query about splitting / breaking down or specific task mention
    if (q.includes("dividir") || q.includes("como fazer") || q.includes("quebrar") || q.includes("subtarefa") || q.includes("subtarefas") || q.includes("ajuda com")) {
      const matchedTask = activeTasks.find((t: any) => q.includes(t.title.toLowerCase()) || t.title.toLowerCase().split(" ").some((word: string) => word.length > 4 && q.includes(word)));
      
      if (matchedTask) {
        return greeting + `Decisão brilhante! Quebrar a atividade "**${matchedTask.title}**" em etapas claras é a melhor forma de eliminar a procrastinação.\n\n` +
          `1️⃣ **Preparação (5 min):** Esboce rapidamente em um papel ou bloco de texto o objetivo central sobre *${matchedTask.title}*.\n` +
          `2️⃣ **Passo Inicial (20 min):** Escreva o rascunho de forma simples e rápida, sem focar em perfeição.\n` +
          `3️⃣ **Revisão e Acabamento (15 min):** Ajuste os detalhes finais e marque-a como cumprida.\n\n` +
          `Vamos ligar o nosso temporizador de Foco e vencer essa meta?`;
      } else if (activeTasks.length > 0) {
        return greeting + `Diga o nome de uma tarefa específica que você precisa quebrar para que eu possa gerar a escala perfeita! Por exemplo: *"Dividir a tarefa ${activeTasks[0].title}"*. Enquanto isso, que tal segmentar **"${activeTasks[0].title}"** em 3 pequenos passos práticos? Isso deixará a inércia no chão!`;
      }
    }

    // 5. Query about procrastination / tiredness / laziness / emotional support
    if (q.includes("preguiça") || q.includes("procrastinal") || q.includes("procrastinar") || q.includes("procrastinando") || q.includes("cansado") || q.includes("desanimado") || q.includes("difícil") || q.includes("dificuldade")) {
      const targetName = activeTasks.length > 0 ? `**${activeTasks[0].title}**` : (activeDaily.length > 0 ? `**${activeDaily[0].title}**` : "sua primeira atividade");
      return greeting + `A preguiça e a inércia às vezes pesam sobre as nossas asas de forma inevitável. \n\n💡 **Regra de Ouro da Coruja:** Experimente o *Desafio dos 2 Minutos* para a atividade ${targetName}. Assuma o compromisso de focar por exatos 120 segundos. Se depois desse tempo pequeno você quiser parar, pare sem culpa! Mas dou minhas penas que seu cérebro vai pegar no tranco! Vamos experimentar?`;
    }

    // 6. If they match any active tasks or daily tasks names
    const matchedAnyActive = activeTasks.find((t: any) => q.includes(t.title.toLowerCase()) || t.title.toLowerCase().split(" ").some((word: string) => word.length > 4 && q.includes(word)));
    if (matchedAnyActive) {
      return greeting + `Notei que você tocou num ponto importante sobre a tarefa "**${matchedAnyActive.title}**". Como ela está aberta no seu painel [${matchedAnyActive.category || "Geral"}], recomendo começarmos agora um bloco de foco concentrado nela por 15 a 20 minutos com seu telefone em outro cômodo. O que acha?`;
    }

    const matchedAnyDaily = activeDaily.find((d: any) => q.includes(d.title.toLowerCase()) || d.title.toLowerCase().split(" ").some((word: string) => d.title.length > 4 && q.includes(word)));
    if (matchedAnyDaily) {
      return greeting + `Percebi que você citou seu ritual diário "**${matchedAnyDaily.title}**". Lembre-se, rituais diários são quem moldam hábitos de alta qualidade acadêmica. Complete-o hoje para esticar sua sequência de streaks e somar XP multiplicador!`;
    }

    // 7. Dynamic Default catch-all
    if (activeTasks.length > 0) {
      const firstActive = activeTasks[0].title;
      return greeting + `Com minhas orelhas em pé e visão aguçada, estou de olho no seu painel. O segredo da decolagem de produtividade é sempre fracionar os problemas!\n\n` +
        `Você possui atualmente **${activeTasks.length} atividades acadêmicas em aberto**, e a prioridade imediata recomendada seria focar em "**${firstActive}**".\n\n` +
        `Posso te ajudar a priorizar sua lista de hoje, dividir uma tarefa complexa em etapas assimiláveis ou dar conselhos focados contra procrastinação. Qual o seu maior desafio de produtividade agora?`;
    } else {
      return greeting + `Diga-me o que está te desafiando hoje! Seu painel está limpo de tarefas pendentes, o que é um ótimo indicador. Posso te dar dicas de como planejar seus próximos rituais de produtividade acadêmica, orientar novas rotinas ou debater técnicas de estudo de alto nível! Do que você gostaria de tratar?`;
    }
  };

  // Handle case when Gemini Client is offline or API key is not configured, delivering high-fidelity responsive fallback
  if (!ai) {
    const reply = generateOfflineChatResponse(prompt || "", username || "Membro Premium", tasks || [], dailyTasks || []);
    return res.json({ reply });
  }

  // Handle case with Google GenAI model active and running
  try {
    let historyText = "";
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        const roleLabel = h.role === "user" ? "Usuário" : "Coruja Sábia";
        historyText += `${roleLabel}: ${h.text}\n`;
      });
    }

    const activeTasks = (tasks || []).filter((t: any) => !t.completed);
    const completedTasks = (tasks || []).filter((t: any) => t.completed);
    const activeDaily = (dailyTasks || []).filter((d: any) => !d.completed);
    const completedDaily = (dailyTasks || []).filter((d: any) => d.completed);

    const contextualPrompt = `(CONTEXTO EM TEMPO REAL DAS ATIVIDADES DO USUÁRIO:
O painel de tarefas atual do usuário ${username || "Usuário"} possui as seguintes informações reais:
A) TAREFAS REGULARES ACADÊMICAS:
   - Total registradas: ${tasks?.length || 0}
   - Atividades pendentes (em aberto): ${JSON.stringify(activeTasks)}
   - Atividades concluídas: ${JSON.stringify(completedTasks)}

B) TAREFAS DIÁRIAS (RITUAIS/HÁBITOS DE PRODUTIVIDADE):
   - Total cadastradas hoje: ${dailyTasks?.length || 0}
   - Rituais pendentes de hoje: ${JSON.stringify(activeDaily)}
   - Rituais concluídos hoje: ${JSON.stringify(completedDaily)}

DIRETRIZ DE CIÊNCIA: O usuário está conversando ou tirando uma dúvida com você. Você DEVE demonstrar total consciência sobre todas as suas tarefas do painel (regulares ou rituais diários) listadas acima sempre que fizer sentido na conversa, como quando ele perguntar sobre o que fazer, o que está pendente, pedir ajuda para organizar o dia, priorizar ou dar conselhos. Use os nomes reais das atividades dele de maneira orgânica e amigável!)

${historyText ? `HISTÓRICO DA CONVERSA ATUAL:\n${historyText}\n` : ""}
Dúvida/pergunta atual do usuário: ${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contextualPrompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return res.json({ reply: response.text || "Huu-Huu! Estou batendo minhas asas e pensando. Vamos focar em organizar nossas prioridades de hoje?" });
  } catch (error) {
    console.error("Erro ao gerar resposta com Coruja Sábia AI:", error);
    const reply = generateOfflineChatResponse(prompt || "", username || "Membro Premium", tasks || [], dailyTasks || []);
    return res.json({ reply });
  }
});

// API endpoint for AI Insights & Suggestions (Momentum Intelligent Assistant)
app.post("/api/ai/suggestion", async (req, res) => {
  const { username, plan, tasks, noteTitle, actionType } = req.body;
  const isPremium = plan === "premium";

  // Default rich fallback responses to ensure excellent immediate preview performance
  const pendingTasks = (tasks || []).filter((t: any) => !t.completed);
  const taskToFocus = pendingTasks[0]?.title || "sua primeira atividade";
  const freeSuggestions = [
    `Dica de Foco: Que tal iniciar um Pomodoro de 25 minutos para focar em "${taskToFocus}"?`,
    pendingTasks.length > 2 
      ? `Reagendamento Sugerido: Você possui ${pendingTasks.length} pendências hoje. Mova as metas de baixa prioridade para amanhã e foque nas urgentes!` 
      : "Reagendamento: Mantenha sempre um limite saudável de no máximo 3 grandes metas diárias para evitar a ansiedade.",
    "Mentalidade: Vencer a procrastinação começa com um pequeno passo de apenas 2 minutos. Vamos dar as primeiros asas hoje?"
  ];

  const premiumSubtasks = [
    "Dividir tarefa em blocos de 10 min",
    "Fazer pesquisa e rascunho rápido",
    "Revisar o conteúdo e concluir"
  ];

  const premiumInsights = {
    subtasks: premiumSubtasks,
    routineRecommendations: [
      "Seus horários mostram maior foco no período da tarde. Sugerimos programar suas atividades mais críticas entre 14h e 16h.",
      "Redução adaptativa de metas ativada: Notamos que a lista está lotada. Sugerimos agrupar tarefas semelhantes para economizar energia mental.",
      "Recomendação do assistente: Pratique 5 minutos de respiração consciente antes de iniciar a próxima sessão de foco."
    ],
    predictiveReport: "Com base em seu histórico de foco, você tem 85% de chance de concluir suas metas se mantiver o Pomodoro sem interrupções maiores de 2 minutos."
  };

  if (!ai) {
    // Return high quality customized static suggestions for immediate interactive feel
    if (!isPremium) {
      return res.json({
        plan: "free",
        suggestions: freeSuggestions,
        message: "Gemini AI rodando em modo simulação offline de alta fidelidade"
      });
    } else {
      // Premium fallback
      if (actionType === "split" && noteTitle) {
        const titleLower = noteTitle.toLowerCase();
        let customSubtasks = [
          `Definir escopo inicial para: ${noteTitle}`,
          `Pesquisa de referências e materiais de apoio`,
          `Executar rascunho ou protótipo rápido`,
          `Refinamento final e validação dos resultados`
        ];

        if (titleLower.includes("estudar") || titleLower.includes("prova") || titleLower.includes("ler") || titleLower.includes("livro") || titleLower.includes("aula")) {
          customSubtasks = [
            `Separar material didático e anotações necessárias para estudar: ${noteTitle}`,
            `Ler os tópicos mais importantes por 15 minutos sem distrações`,
            `Fazer um resumo manuscrito ou mental das fórmulas/passos chave`,
            `Resolver pelo menos 3 exercícios práticos para fixação`,
            `Revisar os erros e marcar a matéria como dominada`
          ];
        } else if (titleLower.includes("trabalho") || titleLower.includes("projeto") || titleLower.includes("escrever") || titleLower.includes("relatório") || titleLower.includes("artigo") || titleLower.includes("apresentação")) {
          customSubtasks = [
            `Rascunhar a estrutura/tópicos principais de: ${noteTitle}`,
            `Realizar pesquisa rápida de referências (máximo de 15 minutos)`,
            `Focar em escrever a primeira página/código sem se preocupar com perfeição`,
            `Revisar a coerência dos argumentos, ortografia ou bugs de sintaxe`,
            `Salvar a versão final e marcar a tarefa no Momentum`
          ];
        } else if (titleLower.includes("comprar") || titleLower.includes("mercado") || titleLower.includes("lista")) {
          customSubtasks = [
            `Verificar o que de fato é urgente e o que pode esperar para: ${noteTitle}`,
            `Elaborar a lista organizada por setores/categorias`,
            `Pesquisar preços ou escolher o local com melhor custo-benefício`,
            `Finalizar a compra focado estritamente na lista`,
            `Concluir a aquisição rápida e conferir os itens`
          ];
        } else if (titleLower.includes("limpar") || titleLower.includes("organizar") || titleLower.includes("quarto") || titleLower.includes("casa") || titleLower.includes("lavar")) {
          customSubtasks = [
            `Definir o cômodo ou área de foco inicial para organizar: ${noteTitle}`,
            `Recolher o lixo visível e colocar as coisas espalhadas de volta no lugar`,
            `Passar um pano geral nas superfícies mais expostas`,
            `Varrer ou focar no chão para finalizar a etapa física`,
            `Ligar um incenso/aromatizador de vitória e desfrutar do ambiente limpo`
          ];
        }

        return res.json({
          plan: "premium",
          subtasks: customSubtasks,
          message: "Subtarefas personalizadas geradas com IA em modo simulação offline de alta fidelidade"
        });
      }
      return res.json({
        plan: "premium",
        ...premiumInsights,
        message: "Insights integrados gerados com IA premium em modo simulação offline"
      });
    }
  }

  try {
    if (!isPremium) {
      // Free suggestions (RF03)
      const prompt = `Você é o assistente inteligente do Momentum, um aplicativo de produtividade com foco em combater a procrastinação. O usuário se chama ${username || "Guest"} e está no plano Gratuito.
Aqui está a lista de tarefas/atividades atuais dele: ${JSON.stringify(tasks || [])}.
Forneça exatamente 3 sugestões curtas de produtividade, escritas de forma motivadora e acolhedora em Português. Uma deve sugerir reagendar alguma tarefa se fizer sentido (ou organizar o dia) e outra deve sugerir iniciar uma sessão de foco Pomodoro.
Retorne o resultado estritamente em formato JSON com uma chave 'suggestions' contendo uma lista de strings.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 sugestões de até 15 palavras cada.",
              }
            },
            required: ["suggestions"],
          }
        }
      });

      let textResult = response.text || "{}";
      textResult = textResult.trim();
      if (textResult.startsWith("```")) {
        textResult = textResult.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      const data = JSON.parse(textResult);
      return res.json({ plan: "free", suggestions: data.suggestions || freeSuggestions });
    } else {
      // Premium actions (RF04)
      if (actionType === "split") {
        // Automatic subtask breakdown
        const prompt = `Você é a IA assistente avançada do Momentum. O usuário premium ${username || "Guest"} deseja dividir a tarefa/atividade intitulada "${noteTitle}" em subtarefas acionáveis de forma inteligente e pragmática.
Crie de 4 a 5 subtarefas curtas, claras e sequenciais que facilitem começar imediatamente para evitar procrastinação. Escreva em Português do Brasil.
Retorne no formato JSON com uma única chave 'subtasks' contendo a lista de strings.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subtasks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Lista de subtarefas acionáveis.",
                }
              },
              required: ["subtasks"],
            }
          }
        });
        
        let textResult = response.text || "{}";
        textResult = textResult.trim();
        if (textResult.startsWith("```")) {
          textResult = textResult.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        const data = JSON.parse(textResult);
        return res.json({ plan: "premium", subtasks: data.subtasks || premiumSubtasks });
      } else {
        // Full Advanced Insights (Adaptive goals, recommendations, predictive tracking)
        const prompt = `Você é o assistente neural avançado do aplicativo Momentum. O usuário é ${username || "Guest"} (Plano Premium) e tem estas tarefas atuais: ${JSON.stringify(tasks || [])}.
Gere recomendações inteligentes personalizadas em Português do Brasil para este usuário:
1. Uma recomendação adaptativa de metas (propor reduzir ou agrupar metas caso a lista de tarefas seja grande ou complexa).
2. Uma recomendação personalizada de rotina para melhor foco diário.
3. Um breve feedback preditivo fictício baseado em histórico simulado (ex: "Seu foco é 40% melhor pela manhã", "Mantenha o ritmo de Pomodoros para completar 100% de hoje").
Retorne exatamente no formato JSON com as chaves:
- 'subtasks': uma lista genérica de 3 subtarefas de foco sugeridas para combater procrastinação.
- 'routineRecommendations': uma lista de pelo menos 3 sugestões personalizadas de metas/rotinas.
- 'predictiveReport': uma frase resumindo a análise comportamental preditiva do usuário.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subtasks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                routineRecommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                predictiveReport: {
                  type: Type.STRING
                }
              },
              required: ["subtasks", "routineRecommendations", "predictiveReport"],
            }
          }
        });
        
        let textResult = response.text || "{}";
        textResult = textResult.trim();
        if (textResult.startsWith("```")) {
          textResult = textResult.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        const data = JSON.parse(textResult);
        return res.json({
          plan: "premium",
          subtasks: data.subtasks || premiumInsights.subtasks,
          routineRecommendations: data.routineRecommendations || premiumInsights.routineRecommendations,
          predictiveReport: data.predictiveReport || premiumInsights.predictiveReport
        });
      }
    }
  } catch (error) {
    console.error("Erro na rota de IA:", error);
    // Return graceful fallbacks
    if (!isPremium) {
      return res.json({ plan: "free", suggestions: freeSuggestions, error: true });
    } else {
      return res.json({ plan: "premium", ...premiumInsights, error: true });
    }
  }
});

// Setup Vite & App Server routes
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Momentum] Servidor rodando com sucesso em http://localhost:${PORT}`);
  });
}

startServer();
