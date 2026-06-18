import React, { useState } from "react";
import { UserProfile, NoteTask } from "../types";
import { LineChart as RechartsLineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Calendar, Award, CheckCircle2, ChevronLeft, ChevronRight, BarChart2 } from "lucide-react";

interface AcompanhamentoTabProps {
  user: UserProfile;
  tasks: NoteTask[];
}

export default function AcompanhamentoTab({ user, tasks }: AcompanhamentoTabProps) {
  const [chartView, setChartView] = useState<"weekly" | "monthly">("weekly");
  const completedTasks = tasks.filter((t) => t.completed);

  // 1. Interactive Calendar calculations
  // Let's build a simulation of the current calendar month (e.g., June 2026/current year)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const startDayOffset = 1; // Simulation offset to start on a Tuesday

  // Pick some calendar days that we pretend the user completed tasks on.
  // We'll also dynamically mark days based on tasks completion dates where possible!
  const mockCompletedDays = [2, 5, 8, 9, 12, 15, 16, 21, 22, 23, 26, 28];

  // Pick live days from completed tasks as well
  completedTasks.forEach((t) => {
    if (t.completed_at) {
      const day = new Date(t.completed_at).getDate();
      if (!mockCompletedDays.includes(day)) {
        mockCompletedDays.push(day);
      }
    }
  });

  // 2. Charts Data
  const weeklyData = [
    { name: "Seg", XP: 45, Tarefas: 3 },
    { name: "Ter", XP: 80, Tarefas: 5 },
    { name: "Qua", XP: 35, Tarefas: 2 },
    { name: "Qui", XP: 90, Tarefas: 6 },
    { name: "Sex", XP: 60, Tarefas: 4 },
    { name: "Sáb", XP: 20, Tarefas: 1 },
    { name: "Dom", XP: 15, Tarefas: 0 },
  ];

  // Adjust current day's XP inside weekly chart based on live XP if possible!
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const liveXpToday = completedTasks.length * 15; // Estimate 15XP per task for simulation
  if (liveXpToday > 0) {
    weeklyData[todayIndex].XP += liveXpToday;
    weeklyData[todayIndex].Tarefas += completedTasks.length;
  }

  const monthlyData = [
    { name: "Sem 1", XP: 180 },
    { name: "Sem 2", XP: 240 },
    { name: "Sem 3", XP: 120 },
    { name: "Sem 4", XP: 290 },
  ];

  // 3. Owl Productivity Summary text depending oncompleted tasks length
  const getOwlSummary = () => {
    const totalCount = completedTasks.length;
    if (totalCount === 0) {
      return "🦉 *Huu-Huu!* Vejo que você ainda não voou hoje! Seu histórico de asas está esperando seu primeiro batito. Complete uma tarefa da lista hoje mesmo para desbloquear seus primeiros pontos de XP e decolar rumo às alturas de foco vertical!";
    }
    if (totalCount <= 2) {
      return `🦉 *Flap Flap!* Excelente decolagem, **${user.username}**! Você já riscou **${totalCount} tarefas** esta semana. Seus picos de foco foram curtos, mas sólidos. O Pomodoro da tarde rendeu cerca de 30% mais energia do que o do período matutino. Mantenha o sapo engasgado!`;
    }
    return `🦉 *Huu-Huu Maravilhoso!* Você está voando alto, **${user.username}**! Com **${totalCount} conclusões**, você dobrou o ritmo. Na terça-feira seu foco atingiu o pico supremo! Sua perseverança nos ciclos do Pomodoro impediram a dispersão de atenção em 85%. Excelente instinto de caçador focado!`;
  };

  return (
    <div id="analytics-tab-view" className="space-y-5 text-left font-sans animate-scaleUp">
      
      {/* Overview stats header banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-purple-50 border border-purple-150 rounded-2xl p-3 text-center">
          <Calendar size={15} className="text-purple-600 mx-auto mb-1" />
          <span className="text-[14px] font-black text-purple-950 block">30 Dias</span>
          <span className="text-[8px] text-[#888] font-bold uppercase tracking-wider">Acompanhamento</span>
        </div>
        <div className="bg-purple-50 border border-purple-150 rounded-2xl p-3 text-center">
          <Award size={15} className="text-purple-600 mx-auto mb-1" />
          <span className="text-[14px] font-black text-purple-950 block">{user.xp} XP</span>
          <span className="text-[8px] text-[#888] font-bold uppercase tracking-wider">Total Acumulado</span>
        </div>
        <div className="bg-purple-50 border border-purple-150 rounded-2xl p-3 text-center">
          <CheckCircle2 size={15} className="text-purple-600 mx-auto mb-1" />
          <span className="text-[14px] font-black text-purple-950 block">{completedTasks.length}</span>
          <span className="text-[8px] text-[#888] font-bold uppercase tracking-wider">Tarefas Feitas</span>
        </div>
      </div>

      {/* 2. Monthly Focus Calendar */}
      <div className="bg-white rounded-3xl p-4 border border-purple-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b pb-2.5 border-purple-50">
          <span className="text-xs font-black text-purple-950 flex items-center space-x-1.5">
            <Calendar size={14} className="text-purple-600" />
            <span>Calendário de Consistência</span>
          </span>
          <div className="text-[10px] text-[#888] font-bold uppercase">Junho 2026</div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] font-bold text-purple-400 font-mono uppercase">
          <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {/* Calendar padding offset days */}
          {Array.from({ length: startDayOffset }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-6 w-full" />
          ))}

          {daysInMonth.map((day) => {
            const isCompleted = mockCompletedDays.includes(day);
            return (
              <div
                key={day}
                className={`h-6.5 w-full flex items-center justify-center text-[10px] font-bold rounded-lg relative ${
                  isCompleted
                    ? "bg-purple-100 text-[#5D3A8C] border border-purple-300 font-black"
                    : "bg-[#FBF9FE] text-purple-950/60 hover:bg-purple-50 border border-purple-100/50"
                }`}
              >
                <span>{day}</span>
                {isCompleted && (
                  <span className="absolute top-[1.5px] right-[1.5px] w-1 h-1 bg-purple-600 rounded-full" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center space-x-4 text-[9px] font-bold text-[#888] pt-1.5 justify-center">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded" />
            <span>Tarefas concluídas</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-[#FBF9FE] border border-purple-100/50 rounded" />
            <span>Sem atividade</span>
          </div>
        </div>
      </div>

      {/* 3. Productivity XP Charts (Recharts) */}
      <div className="bg-white rounded-3xl p-4 border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-2.5 border-purple-50">
          <span className="text-xs font-black text-purple-950 flex items-center space-x-1.5">
            <BarChart2 size={14} className="text-purple-600" />
            <span>Progresso de Foco & XP</span>
          </span>
          <div className="flex space-x-1 bg-purple-50 p-0.5 rounded-lg border border-purple-100">
            <button
              id="chart-weekly-btn"
              onClick={() => setChartView("weekly")}
              className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                chartView === "weekly" ? "bg-white text-purple-950 shadow-xs" : "text-purple-400"
              }`}
            >
              Semanal
            </button>
            <button
              id="chart-monthly-btn"
              onClick={() => setChartView("monthly")}
              className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                chartView === "monthly" ? "bg-white text-purple-950 shadow-xs" : "text-purple-400"
              }`}
            >
              Mensal
            </button>
          </div>
        </div>

        {/* Recharts responsive render */}
        <div className="h-44 w-full text-xs font-mono select-none">
          {chartView === "weekly" ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={weeklyData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EFF7" />
                <XAxis dataKey="name" stroke="#A78BFA" fontSize={9} tickLine={false} />
                <YAxis stroke="#A78BFA" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FBF9FE", borderRadius: "12px", borderWidth: "1px", borderColor: "#DDD" }}
                  labelStyle={{ fontWeight: "bold", fontSize: "10px" }}
                  itemStyle={{ color: "#5D3A8C" }}
                />
                <Line type="monotone" dataKey="XP" stroke="#5D3A8C" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EFF7" />
                <XAxis dataKey="name" stroke="#A78BFA" fontSize={9} tickLine={false} />
                <YAxis stroke="#A78BFA" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FBF9FE", borderRadius: "12px", borderWidth: "1px", borderColor: "#DDD" }}
                  labelStyle={{ fontWeight: "bold", fontSize: "10px" }}
                  itemStyle={{ color: "#5D3A8C" }}
                />
                <Bar dataKey="XP" fill="#5D3A8C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Resumo Semanal da Coruja Sábia */}
      <div className="bg-[#FBF9FE] border border-purple-100 p-4 rounded-3xl space-y-2 relative text-left">
        <div className="flex items-center space-x-2 text-xs font-extrabold text-[#5D3A8C]">
          <span>🦉 Resumo da Coruja</span>
          <TrendingUp size={12} className="text-purple-600 animate-pulse" />
        </div>
        <p className="text-[11px] text-purple-950/85 leading-relaxed font-sans italic">
          {getOwlSummary()}
        </p>
        <div className="absolute bottom-2 right-3 opacity-[0.06] select-none text-4xl pointer-events-none">
          📈
        </div>
      </div>

    </div>
  );
}
