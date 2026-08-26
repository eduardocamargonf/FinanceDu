import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Calculator, 
  Lightbulb, 
  Copy, 
  Check, 
  Flame, 
  TrendingUp, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  ShieldAlert,
  Award,
  Zap
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatBRL } from '../utils/formatters';
import { fireDopamineConfetti } from '../utils/confetti';
import { dopamineAudio } from '../lib/audio';
import { 
  DuPersonality, 
  DuChatMessage, 
  generateDuExecutiveReport, 
  generateDuRoast, 
  answerDuQuestion 
} from '../utils/duBrain';
import duMascotImg from '../assets/images/du_mascot_avatar_1787750972812.jpg';

interface DuMascotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'chat' | 'report' | 'simulator' | 'tips';
}

export const DuMascotModal: React.FC<DuMascotModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'chat'
}) => {
  const finance = useFinance();
  const { 
    formattedSelectedMonth, 
    totalIncomeProjected, 
    totalExpenseProjected, 
    balanceProjected, 
    savingsRate, 
    duScore,
    monthlyExpenses,
    monthlyIncomes,
    categories,
    upcomingBills,
    accounts,
    goals,
    setActiveTab,
    isMuted,
    toggleSound
  } = finance;

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'report' | 'simulator' | 'tips'>(initialTab);
  const [personality, setPersonality] = useState<DuPersonality>('sincere_squirrel');
  const [inputQuery, setInputQuery] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);
  const [simCutPercent, setSimCutPercent] = useState<number>(15);

  // Chat message history
  const [messages, setMessages] = useState<DuChatMessage[]>([
    {
      id: 'init-1',
      sender: 'du',
      text: `Olá! Eu sou o **DU**, o esquilo executivo do DuFinance! 🐿️👔\n\nEstou analisando seu mês de **${formattedSelectedMonth}** em tempo real. Seu saldo previsto é de **${formatBRL(balanceProjected)}** com taxa de poupança de **${savingsRate}%**!\n\nEm que posso te ajudar hoje? Peça um relatório executivo, dicas de corte de gastos ou mande um choque de realidade (roast)!`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      dopamineAudio.playDuGreeting();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Executive Report calculation
  const executiveReport = generateDuExecutiveReport({
    monthName: formattedSelectedMonth,
    incomeProjected: totalIncomeProjected,
    expenseProjected: totalExpenseProjected,
    balanceProjected: balanceProjected,
    savingsRate,
    duScore,
    monthlyExpenses,
    categories,
    upcomingBills,
    accounts,
    goals
  });

  // Handle user submitting a question
  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    dopamineAudio.playPop();

    const userMsg: DuChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    // Answer calculation
    setTimeout(() => {
      dopamineAudio.playDuNut();
      const response = answerDuQuestion(query, personality, {
        monthName: formattedSelectedMonth,
        incomeProjected: totalIncomeProjected,
        expenseProjected: totalExpenseProjected,
        balanceProjected: balanceProjected,
        savingsRate,
        duScore,
        monthlyExpenses,
        monthlyIncomes,
        categories,
        upcomingBills,
        goals,
        accounts
      });

      const duMsg: DuChatMessage = {
        id: String(Date.now() + 1),
        sender: 'du',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        actionPayload: response.actionPayload
      };

      setMessages(prev => [...prev, duMsg]);
    }, 450);
  };

  // Copy full executive report as clean markdown
  const handleCopyReport = () => {
    const md = `
# 🐿️ Relatório Executivo DuFinance — ${executiveReport.title}
Data: ${executiveReport.generatedAt}
Score Du: ${executiveReport.overallScore}/100 — ${executiveReport.verdict}

## 📊 Resumo do Mês:
- Receitas Previstas: ${formatBRL(executiveReport.summary.totalIncome)}
- Despesas Previstas: ${formatBRL(executiveReport.summary.totalExpense)}
- Saldo Final Previsto: ${formatBRL(executiveReport.summary.projectedBalance)}
- Taxa de Poupança: ${executiveReport.summary.savingsRate}%

## 🚨 Maiores Gastos por Categoria:
${executiveReport.topCategories.map(c => `- ${c.name}: ${formatBRL(c.amount)} (${c.percent}% do total)`).join('\n')}

## 💡 Recomendações Estratégicas do Du:
${executiveReport.strategicTips.map(t => `- ${t}`).join('\n')}

---
${executiveReport.squirrelWisdom}
    `.trim();

    navigator.clipboard.writeText(md);
    setCopiedReport(true);
    dopamineAudio.playCash();
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Quick prompt suggestions
  const promptSuggestions = [
    { label: '📊 Diagnóstico 360°', text: 'Como está minha saúde financeira geral este mês?' },
    { label: '🔥 Roast Sincero', text: 'Faz um roast sincero e engraçado dos meus gastos!' },
    { label: '🧐 Onde gasto mais?', text: 'Onde estou gastando mais dinheiro este mês?' },
    { label: '🌰 Dica para Poupar', text: 'Como posso economizar mais nozes (dinheiro) hoje?' },
    { label: '💳 Radar de Cartões', text: 'Como estão minhas faturas de cartão e boletos a vencer?' },
    { label: '🎯 Minhas Metas', text: 'Como posso acelerar minhas metas de poupança?' },
  ];

  // Simulator savings math
  const largestCat = executiveReport.topCategories[0];
  const monthlySavingsSim = largestCat ? (largestCat.amount * (simCutPercent / 100)) : 0;
  const annualSavingsSim = monthlySavingsSim * 12;
  const cdiGainSim = annualSavingsSim * 1.1075; // ~10.75% a.a.

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      {/* Main Assistant Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-[32px] shadow-2xl z-10 my-auto overflow-hidden flex flex-col max-h-[92vh]"
      >
        
        {/* Header with Mascot Avatar & Personality Picker */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            {/* 3D Du Avatar with green ring */}
            <div 
              onClick={() => {
                fireDopamineConfetti();
                dopamineAudio.playDuNut();
              }}
              title="Clique no DU para ganhar dopamina!"
              className="relative cursor-pointer group flex-shrink-0"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 p-0.5 border-2 border-[#21C25E] shadow-md shadow-[#21C25E]/30 overflow-hidden group-hover:scale-105 group-hover:rotate-2 transition-transform">
                <img 
                  src={duMascotImg} 
                  alt="DU o Mascote Esquilo" 
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-[#21C25E] text-black font-black text-[9px] px-1.5 py-0.5 rounded-full border border-black shadow-xs">
                DU IA
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit',sans-serif]">
                  Du, o Mascote Consultor
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#21C25E]/20 text-[#21C25E] text-[10px] font-bold border border-[#21C25E]/30 uppercase">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Seu esquilo executivo com IA financeira, sarcasmo refinado e dicas práticas.
              </p>
            </div>
          </div>

          {/* Right Controls: Personality Selector & Close */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Personality Mood Selector */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => { setPersonality('sincere_squirrel'); dopamineAudio.playPop(); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] cursor-pointer ${
                  personality === 'sincere_squirrel' 
                    ? 'bg-[#21C25E] text-black shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Esquilo Poupador Sincero (Foco em economizar nozes)"
              >
                🐿️ Sincero
              </button>
              <button
                type="button"
                onClick={() => { setPersonality('executive_ceo'); dopamineAudio.playPop(); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] cursor-pointer ${
                  personality === 'executive_ceo' 
                    ? 'bg-[#21C25E] text-black shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Du CEO de Wall Street (Foco em ROI e métricas corporativas)"
              >
                🎩 Wall Street
              </button>
              <button
                type="button"
                onClick={() => { setPersonality('dopamine_coach'); dopamineAudio.playPop(); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] cursor-pointer ${
                  personality === 'dopamine_coach' 
                    ? 'bg-[#21C25E] text-black shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Du Coach da Dopamina (Empolgado e motivacional)"
              >
                🚀 Coach
              </button>
            </div>

            {/* Sound Mute */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMuted ? 'Ativar Som' : 'Mudo'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#21C25E]" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-100/90 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => { setActiveSubTab('chat'); dopamineAudio.playPop(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'chat'
                ? 'bg-white text-slate-900 border border-slate-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#169445]" />
            <span>Chat com o Du</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('report'); dopamineAudio.playPop(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'report'
                ? 'bg-white text-slate-900 border border-slate-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-[#169445]" />
            <span>Relatório Executivo 360°</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('simulator'); dopamineAudio.playPop(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'simulator'
                ? 'bg-white text-slate-900 border border-slate-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-[#169445]" />
            <span>Simulador de Nozes</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('tips'); dopamineAudio.playPop(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'tips'
                ? 'bg-white text-slate-900 border border-slate-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-[#169445]" />
            <span>Dicas & Sabedoria</span>
          </button>
        </div>

        {/* Body Content by Tab */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50/50">

          {/* TAB 1: INTERACTIVE CHAT */}
          {activeSubTab === 'chat' && (
            <div className="flex flex-col h-full space-y-4">
              
              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {promptSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s.text)}
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 space-y-3.5 min-h-[260px] max-h-[380px] overflow-y-auto p-3 bg-slate-100/60 rounded-2xl border border-slate-200/80">
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'du' && (
                      <div className="w-8 h-8 rounded-xl bg-[#21C25E] flex items-center justify-center text-black font-black text-xs flex-shrink-0 shadow-xs overflow-hidden">
                        <img 
                          src={duMascotImg} 
                          alt="Du" 
                          className="w-full h-full object-cover object-top"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#21C25E] text-black font-medium rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                    }`}>
                      <div className="whitespace-pre-line font-['Plus_Jakarta_Sans',sans-serif]">
                        {msg.text}
                      </div>

                      {/* Optional Interactive CTA Button inside message */}
                      {msg.actionPayload && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/80">
                          {msg.actionPayload.type === 'confetti' && (
                            <button
                              onClick={() => {
                                fireDopamineConfetti();
                                dopamineAudio.playFanfare();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#21C25E] text-black font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{msg.actionPayload.buttonLabel || 'Soltar Confetes!'}</span>
                            </button>
                          )}

                          {msg.actionPayload.type === 'switch_tab' && (
                            <button
                              onClick={() => {
                                setActiveTab(msg.actionPayload?.data);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-slate-800 transition-colors"
                            >
                              <span>{msg.actionPayload.buttonLabel || 'Ir para o Módulo'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {msg.actionPayload.type === 'open_modal' && (
                            <button
                              onClick={() => setActiveSubTab('report')}
                              className="px-3 py-1.5 rounded-xl bg-[#21C25E] text-black font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-[#1ca650] transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{msg.actionPayload.buttonLabel || 'Ver Relatório 📊'}</span>
                            </button>
                          )}
                        </div>
                      )}

                      <span className={`block text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-black/60' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2 pt-2"
              >
                <input
                  type="text"
                  placeholder="Pergunte ao Du: 'Posso comprar algo de R$ 500?', 'Como cortar despesas?', etc..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 focus:border-[#21C25E] focus:ring-1 focus:ring-[#21C25E] rounded-2xl text-xs sm:text-sm text-slate-900 outline-none shadow-xs placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className="p-3.5 rounded-2xl bg-[#21C25E] hover:bg-[#1ca650] text-black font-bold disabled:opacity-40 shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                  title="Enviar mensagem"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: EXECUTIVE REPORT 360° */}
          {activeSubTab === 'report' && (
            <div className="space-y-6">
              
              {/* Report Header Card */}
              <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#169445]" />
                    <span className="text-xs font-bold text-[#169445] uppercase tracking-wider">
                      Diagnóstico Oficial DuFinance
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit',sans-serif] mt-0.5">
                    {executiveReport.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gerado em {executiveReport.generatedAt} • Cálculos com base em dados em tempo real
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyReport}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {copiedReport ? <Check className="w-4 h-4 text-[#169445]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedReport ? 'Copiado!' : 'Copiar Relatório'}</span>
                  </button>

                  <button
                    onClick={() => {
                      fireDopamineConfetti();
                      dopamineAudio.playFanfare();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#21C25E] hover:bg-[#1ca650] text-black text-xs font-black shadow-xs transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Celebrar Conquistas</span>
                  </button>
                </div>
              </div>

              {/* KPI Score Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">Saúde Financeira</span>
                  <span className="text-2xl font-black text-slate-900 font-['Outfit',sans-serif] font-mono">
                    {executiveReport.overallScore >= 70 ? 'Ótima 🌟' : 'Atenção ⚠️'}
                  </span>
                  <span className="text-[10px] text-[#169445] font-bold block mt-0.5">Poupança: {executiveReport.summary.savingsRate}%</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">Receitas Previstas</span>
                  <span className="text-lg sm:text-xl font-bold text-emerald-600 font-mono">
                    {formatBRL(executiveReport.summary.totalIncome)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Entradas totais</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">Despesas Previstas</span>
                  <span className="text-lg sm:text-xl font-bold text-rose-600 font-mono">
                    {formatBRL(executiveReport.summary.totalExpense)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Saídas totais</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">Saldo Projetado</span>
                  <span className={`text-lg sm:text-xl font-bold font-mono ${executiveReport.summary.projectedBalance >= 0 ? 'text-[#169445]' : 'text-rose-600'}`}>
                    {formatBRL(executiveReport.summary.projectedBalance)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Taxa Poupança: {executiveReport.summary.savingsRate}%</span>
                </div>
              </div>

              {/* Du's Verdict */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#21C25E]/10 to-teal-500/10 border border-[#21C25E]/30 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#21C25E] flex items-center justify-center text-black font-black text-xs flex-shrink-0">
                  🐿️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#169445] uppercase tracking-wider">Veredito do Du</h4>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    "{executiveReport.verdict}"
                  </p>
                </div>
              </div>

              {/* Top Categories Breakdown */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Maiores Categorias de Despesa ({formattedSelectedMonth})
                </h4>
                <div className="space-y-2.5">
                  {executiveReport.topCategories.map((c, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <span className="font-mono text-slate-600">
                          {formatBRL(c.amount)} <strong className="text-slate-900">({c.percent}%)</strong>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ width: `${c.percent}%`, backgroundColor: c.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic 3-Step Action Plan */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#169445]" />
                  <span>Plano Estratégico Recomendado pelo Du</span>
                </h4>
                <div className="space-y-2">
                  {executiveReport.strategicTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-[#21C25E]/20 text-[#169445] font-black flex items-center justify-center text-[10px] flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SQUIRREL NUT SIMULATOR */}
          {activeSubTab === 'simulator' && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#21C25E]/15 text-[#169445] flex items-center justify-center border border-[#21C25E]/30">
                    <Calculator className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
                      Simulador de Economia de Nozes
                    </h3>
                    <p className="text-xs text-slate-500">
                      Descubra quanto você acumula ao otimizar sua maior despesa ({largestCat?.name || 'Geral'}).
                    </p>
                  </div>
                </div>

                {/* Slider */}
                <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Porcentagem de Redução Desejada:</span>
                    <span className="px-3 py-1 rounded-xl bg-[#21C25E] text-black font-black text-sm">
                      {simCutPercent}% de corte
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={simCutPercent}
                    onChange={(e) => setSimCutPercent(Number(e.target.value))}
                    className="w-full accent-[#21C25E] cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>5% (Fácil)</span>
                    <span>15% (Ideal)</span>
                    <span>30% (Agressivo)</span>
                    <span>50% (Hardcore)</span>
                  </div>
                </div>

                {/* Simulated Results */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[11px] font-semibold text-emerald-800 block">Economia Mensal</span>
                    <span className="text-xl font-black text-emerald-700 font-mono">
                      +{formatBRL(monthlySavingsSim)}
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Sobra extra todo mês</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                    <span className="text-[11px] font-semibold text-teal-800 block">Acúmulo em 1 Ano</span>
                    <span className="text-xl font-black text-teal-700 font-mono">
                      +{formatBRL(annualSavingsSim)}
                    </span>
                    <span className="text-[10px] text-teal-600 block mt-0.5">12 meses guardando</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[11px] font-semibold text-amber-800 block">Rendimento CDI (10,75% a.a.)</span>
                    <span className="text-xl font-black text-amber-700 font-mono">
                      +{formatBRL(cdiGainSim)}
                    </span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">Dinheiro gerando nozes</span>
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveTab('goals');
                      onClose();
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#21C25E] hover:bg-[#1ca650] text-black font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    <span>Transformar Economia em Meta de Investimento</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DU'S TIPS & ROASTS */}
          {activeSubTab === 'tips' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Roast Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 space-y-3">
                  <div className="flex items-center gap-2 text-rose-700">
                    <Flame className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Choque de Realidade do Du</h4>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-800 font-medium whitespace-pre-line">
                    {generateDuRoast({
                      monthName: formattedSelectedMonth,
                      incomeProjected: totalIncomeProjected,
                      expenseProjected: totalExpenseProjected,
                      balanceProjected: balanceProjected,
                      monthlyExpenses,
                      categories,
                      upcomingBills
                    })}
                  </p>
                </div>

                {/* Philosophy Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Lightbulb className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-wider">A Sabedoria do Esquilo</h4>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-700 font-medium">
                    <li>🌰 <strong>Regra 50/30/20:</strong> 50% para necessidades, 30% para desejos pessoais e 20% para acumular nozes.</li>
                    <li>🐿️ <strong>Fundo de Inverno:</strong> Tenha de 3 a 6 meses do seu custo fixo intocado em liquidez diária.</li>
                    <li>💳 <strong>Cartão não é renda extra:</strong> Use apenas o que já tem em conta para não sofrer com a fatura.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};
