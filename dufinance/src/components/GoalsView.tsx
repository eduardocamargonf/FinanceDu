import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  History, 
  Calendar, 
  Edit3, 
  Check, 
  X, 
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatBRL, formatDateBR } from '../utils/formatters';
import { FinancialGoal, GoalContribution } from '../types/finance';
import { format } from 'date-fns';

export const GoalsView: React.FC = () => {
  const { 
    goals, 
    addGoal, 
    depositGoal, 
    updateGoalContribution, 
    deleteGoalContribution, 
    deleteGoal 
  } = useFinance();

  // Add Goal Modal State
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTargetStr, setNewTargetStr] = useState('');
  const [newInitialStr, setNewInitialStr] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newCategory, setNewCategory] = useState('Sonhos');

  // Quick Deposit Modal State
  const [depositModalGoalId, setDepositModalGoalId] = useState<string | null>(null);
  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [depositDate, setDepositDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [depositNote, setDepositNote] = useState('');

  // History & Contributions Modal State
  const [historyGoalId, setHistoryGoalId] = useState<string | null>(null);
  const [isHistoryAddExpanded, setIsHistoryAddExpanded] = useState(false);
  const [historyAddAmountStr, setHistoryAddAmountStr] = useState('');
  const [historyAddDate, setHistoryAddDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [historyAddNote, setHistoryAddNote] = useState('');

  // Editing single contribution state
  const [editingContributionId, setEditingContributionId] = useState<string | null>(null);
  const [editContribAmountStr, setEditContribAmountStr] = useState('');
  const [editContribDate, setEditContribDate] = useState('');
  const [editContribNote, setEditContribNote] = useState('');

  const activeHistoryGoal = goals.find(g => g.id === historyGoalId);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTargetStr.replace(',', '.')) || 0;
    const initial = parseFloat(newInitialStr.replace(',', '.')) || 0;
    if (!newTitle.trim() || target <= 0) return;

    addGoal({
      title: newTitle.trim(),
      targetAmount: target,
      currentAmount: initial,
      deadline: newDeadline || undefined,
      category: newCategory,
      icon: 'Target',
      color: '#11C76F'
    });

    setIsAddGoalModalOpen(false);
    setNewTitle('');
    setNewTargetStr('');
    setNewInitialStr('');
    setNewDeadline('');
  };

  const handleQuickDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoalId) return;
    const amt = parseFloat(depositAmountStr.replace(',', '.')) || 0;
    if (amt > 0) {
      depositGoal(depositModalGoalId, amt, depositDate, depositNote);
    }
    setDepositModalGoalId(null);
    setDepositAmountStr('');
    setDepositNote('');
  };

  const handleHistoryAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!historyGoalId) return;
    const amt = parseFloat(historyAddAmountStr.replace(',', '.')) || 0;
    if (amt > 0) {
      depositGoal(historyGoalId, amt, historyAddDate, historyAddNote);
      setHistoryAddAmountStr('');
      setHistoryAddNote('');
      setIsHistoryAddExpanded(false);
    }
  };

  const handleStartEditContribution = (contrib: GoalContribution) => {
    setEditingContributionId(contrib.id);
    setEditContribAmountStr(String(contrib.amount));
    setEditContribDate(contrib.date);
    setEditContribNote(contrib.note || '');
  };

  const handleSaveEditContribution = (goalId: string, contribId: string) => {
    const amt = parseFloat(editContribAmountStr.replace(',', '.')) || 0;
    if (amt <= 0 || !editContribDate) return;

    updateGoalContribution(goalId, contribId, {
      amount: amt,
      date: editContribDate,
      note: editContribNote.trim() || undefined
    });

    setEditingContributionId(null);
  };

  const handleDeleteContribution = (goalId: string, contribId: string) => {
    if (window.confirm('Deseja realmente excluir este aporte? O saldo guardado da meta será recalculado.')) {
      deleteGoalContribution(goalId, contribId);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#21C25E]/15 text-[#169445] flex items-center justify-center border border-[#21C25E]/30">
            <Target className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
              Metas & Sonhos Financeiros
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhe suas economias, aportes detalhados por data e conquistas financeiras.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddGoalModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#21C25E] hover:bg-[#1ca650] text-black font-bold text-sm shadow-md shadow-[#21C25E]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Nova Meta</span>
        </button>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isComplete = goal.currentAmount >= goal.targetAmount;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const contribCount = goal.contributions?.length || 0;

          return (
            <motion.div
              key={goal.id}
              whileHover={{ y: -3 }}
              className={`rounded-[28px] bg-white/90 backdrop-blur-md border p-6 shadow-sm flex flex-col justify-between transition-all ${
                isComplete ? 'border-[#21C25E] bg-[#21C25E]/[0.03]' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                    {goal.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isComplete ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#21C25E]/15 text-[#169445] text-xs font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Conquistada! 🎉
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        {progress}%
                      </span>
                    )}
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="my-4">
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                    {goal.title}
                  </h3>
                  {goal.deadline && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prazo desejado: <strong className="text-slate-700 font-semibold">{formatDateBR(goal.deadline)}</strong>
                    </p>
                  )}
                </div>

                {/* Amount Progress */}
                <div className="space-y-2 my-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-500">Guardado:</span>
                      <p className="text-xl font-black text-[#169445] font-mono">{formatBRL(goal.currentAmount)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Objetivo:</span>
                      <p className="text-base font-bold text-slate-700 font-mono">{formatBRL(goal.targetAmount)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#21C25E] shadow-xs"
                    />
                  </div>

                  {!isComplete && (
                    <p className="text-[11px] text-slate-500 text-right pt-0.5">
                      Falta apenas <strong className="text-slate-800 font-mono">{formatBRL(remaining)}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    setDepositModalGoalId(goal.id);
                    setDepositAmountStr('');
                    setDepositDate(format(new Date(), 'yyyy-MM-dd'));
                    setDepositNote('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#21C25E] hover:bg-[#1ca650] text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Guardar Dinheiro</span>
                </button>

                <button
                  onClick={() => {
                    setHistoryGoalId(goal.id);
                    setIsHistoryAddExpanded(false);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ver Aportes ({contribCount})</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Goal Contributions History Modal */}
      <AnimatePresence>
        {activeHistoryGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-white border border-slate-200 rounded-[28px] p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#169445] text-xs font-bold border border-emerald-200">
                      {activeHistoryGoal.category}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                      {activeHistoryGoal.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Histórico detalhado de aportes • Total Guardado:{' '}
                    <strong className="text-[#169445] font-mono font-bold text-sm">
                      {formatBRL(activeHistoryGoal.currentAmount)}
                    </strong>{' '}
                    de {formatBRL(activeHistoryGoal.targetAmount)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setHistoryGoalId(null);
                    setEditingContributionId(null);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Add Form in History Modal */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                {!isHistoryAddExpanded ? (
                  <button
                    onClick={() => setIsHistoryAddExpanded(true)}
                    className="w-full py-2 px-3 rounded-xl bg-[#21C25E]/20 hover:bg-[#21C25E]/30 text-[#169445] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Registrar Novo Aporte Nesta Meta</span>
                  </button>
                ) : (
                  <form onSubmit={handleHistoryAddSubmit} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Novo Aporte</span>
                      <button
                        type="button"
                        onClick={() => setIsHistoryAddExpanded(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Valor do Aporte (R$) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: 500,00"
                          value={historyAddAmountStr}
                          onChange={(e) => setHistoryAddAmountStr(e.target.value.replace(/[^0-9.,]/g, ''))}
                          autoFocus
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Data do Aporte *
                        </label>
                        <input
                          type="date"
                          required
                          value={historyAddDate}
                          onChange={(e) => setHistoryAddDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Observação / Descrição (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Sobra do salário, Venda OLX, Bônus..."
                        value={historyAddNote}
                        onChange={(e) => setHistoryAddNote(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs text-slate-900 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#21C25E] hover:bg-[#1ca650] text-black font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Salvar Aporte 💸
                    </button>
                  </form>
                )}
              </div>

              {/* Contributions List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1 max-h-[360px]">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Aportes Realizados ({activeHistoryGoal.contributions?.length || 0})
                </span>

                {(!activeHistoryGoal.contributions || activeHistoryGoal.contributions.length === 0) ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <History className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
                    <p className="text-xs">Nenhum aporte registrado nesta meta ainda.</p>
                  </div>
                ) : (
                  activeHistoryGoal.contributions.map((contrib) => {
                    const isEditing = editingContributionId === contrib.id;

                    return (
                      <div
                        key={contrib.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500">Valor (R$)</label>
                                <input
                                  type="text"
                                  value={editContribAmountStr}
                                  onChange={(e) => setEditContribAmountStr(e.target.value.replace(/[^0-9.,]/g, ''))}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500">Data</label>
                                <input
                                  type="date"
                                  value={editContribDate}
                                  onChange={(e) => setEditContribDate(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500">Nota</label>
                              <input
                                type="text"
                                value={editContribNote}
                                onChange={(e) => setEditContribNote(e.target.value)}
                                placeholder="Observação..."
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                              />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingContributionId(null)}
                                className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditContribution(activeHistoryGoal.id, contrib.id)}
                                className="px-3 py-1 rounded-lg bg-[#21C25E] text-black text-xs font-bold cursor-pointer"
                              >
                                Salvar Alteração
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#169445] flex items-center justify-center border border-emerald-200 shrink-0">
                                <DollarSign className="w-4 h-4 stroke-[2.5]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-[#169445] font-mono">
                                    + {formatBRL(contrib.amount)}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {formatDateBR(contrib.date)}
                                  </span>
                                </div>
                                {contrib.note && (
                                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                                    {contrib.note}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEditContribution(contrib)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Editar valor ou data deste aporte"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteContribution(activeHistoryGoal.id, contrib.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Excluir este aporte"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Deposit Modal */}
      {depositModalGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-[28px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Guardar Dinheiro na Meta</h3>
              <button
                onClick={() => setDepositModalGoalId(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickDepositSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Valor do Aporte (R$) *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={depositAmountStr}
                  onChange={(e) => setDepositAmountStr(e.target.value.replace(/[^0-9.,]/g, ''))}
                  autoFocus
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xl font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Data do Aporte *
                </label>
                <input
                  type="date"
                  required
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Observação / Motivo (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Salário mensal, Extra, Pix recebido..."
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoalId(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#21C25E] hover:bg-[#1ca650] text-black text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirmar Aporte 💸
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[28px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Criar Nova Meta Financeira</h3>
              <button
                onClick={() => setIsAddGoalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome da Meta / Conquista</label>
                <input
                  type="text"
                  placeholder="Ex: Viagem Europa, Reserva 6 Meses, Carro Novo..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Alvo (R$)</label>
                  <input
                    type="text"
                    placeholder="Ex: 10000"
                    value={newTargetStr}
                    onChange={(e) => setNewTargetStr(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Inicial Guardado</label>
                  <input
                    type="text"
                    placeholder="Ex: 1500"
                    value={newInitialStr}
                    onChange={(e) => setNewInitialStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  >
                    <option value="Segurança">Segurança</option>
                    <option value="Lazer">Lazer & Viagens</option>
                    <option value="Trabalho">Trabalho & Equipamentos</option>
                    <option value="Bens">Veículos & Imóveis</option>
                    <option value="Sonhos">Outros Sonhos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Prazo Estimado</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#21C25E] hover:bg-[#1ca650] text-black text-xs font-bold cursor-pointer shadow-xs"
                >
                  Salvar Meta 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
