import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  CalendarRange, 
  TrendingUp, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  CreditCard,
  Building
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { formatBRL, formatDateBR } from '../utils/formatters';
import { addMonths, format, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FutureProjectionView: React.FC = () => {
  const { 
    transactions, 
    setSelectedDate, 
    setActiveTab, 
    openTransactionModal 
  } = useFinance();

  const [projectionHorizon, setProjectionHorizon] = useState<6 | 12>(6);

  // Generate monthly forecast data for next N months from current date
  const projectionData = useMemo(() => {
    const today = new Date();
    const list: {
      monthKey: string;
      formattedMonth: string;
      rawDate: Date;
      projectedIncome: number;
      projectedExpense: number;
      projectedNet: number;
      installmentsCount: number;
      fixedCount: number;
    }[] = [];

    for (let i = 0; i < projectionHorizon; i++) {
      const targetMonth = addMonths(today, i);
      const rawMonthName = format(targetMonth, 'MMM/yy', { locale: ptBR });
      const formattedMonth = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

      // Filter transactions matching this month
      const monthTx = transactions.filter(t => {
        try {
          const d = parseISO(t.date);
          return isSameMonth(d, targetMonth);
        } catch {
          return false;
        }
      });

      const income = monthTx
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTx
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const installmentsCount = monthTx.filter(t => t.isInstallment).length;
      const fixedCount = monthTx.filter(t => t.isRecurring).length;

      list.push({
        monthKey: format(targetMonth, 'yyyy-MM'),
        formattedMonth,
        rawDate: targetMonth,
        projectedIncome: income,
        projectedExpense: expense,
        projectedNet: income - expense,
        installmentsCount,
        fixedCount
      });
    }

    return list;
  }, [transactions, projectionHorizon]);

  // Aggregate active installment plans
  const installmentPlans = useMemo(() => {
    const map: Record<string, {
      title: string;
      categoryColor: string;
      totalInstallments: number;
      amountPerMonth: number;
      items: typeof transactions;
    }> = {};

    transactions.filter(t => t.isInstallment && t.installmentGroupId).forEach(t => {
      const grp = t.installmentGroupId!;
      if (!map[grp]) {
        // Clean title (remove (X/Y))
        const cleanTitle = t.description.replace(/\s*\(\d+\/\d+\)/, '');
        map[grp] = {
          title: cleanTitle,
          categoryColor: t.categoryColor || '#8B5CF6',
          totalInstallments: t.totalInstallments || 1,
          amountPerMonth: t.amount,
          items: []
        };
      }
      map[grp].items.push(t);
    });

    return Object.values(map);
  }, [transactions]);

  // Jump to specific month
  const handleJumpToMonth = (d: Date) => {
    setSelectedDate(d);
    setActiveTab('dashboard');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#21C25E]/15 text-[#169445] flex items-center justify-center border border-[#21C25E]/30">
              <CalendarRange className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
                Projeção Financeira dos Próximos Meses
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Visualize com clareza todo o fluxo de parcelas, boletos futuros e saldo previsto.
              </p>
            </div>
          </div>

          {/* Horizon toggle: 6 vs 12 months */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/60 self-start sm:self-center">
            <button
              onClick={() => setProjectionHorizon(6)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                projectionHorizon === 6
                  ? 'bg-[#21C25E] text-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Próximos 6 Meses
            </button>
            <button
              onClick={() => setProjectionHorizon(12)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                projectionHorizon === 12
                  ? 'bg-[#21C25E] text-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Próximos 12 Meses
            </button>
          </div>
        </div>
      </div>

      {/* Projection Bar Chart: Incomes vs Expenses per Future Month */}
      <div className="rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
              Fluxo Mensal Previsto (Entradas x Saídas)
            </h3>
            <p className="text-xs text-slate-500">Planejamento futuro automático com base em seus parcelamentos e rendas</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#21C25E]" />
              <span className="text-slate-700">Receitas Previstas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-700">Despesas Previstas</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="formattedMonth" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false}
                tickFormatter={(val) => `R$${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  color: '#0f172a',
                  fontSize: '12px'
                }}
                formatter={(value: number | string | Array<number | string> | undefined) => {
                  const num = typeof value === 'number' ? value : Number(value || 0);
                  return [formatBRL(num), ''];
                }}
              />
              <Bar dataKey="projectedIncome" name="Entradas" fill="#21C25E" radius={[6, 6, 0, 0]} />
              <Bar dataKey="projectedExpense" name="Saídas" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month-by-Month Future Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {projectionData.map((m) => (
          <motion.div
            key={m.monthKey}
            whileHover={{ y: -2 }}
            className="rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 shadow-sm hover:border-[#21C25E]/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#169445]" />
                  <span className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                    {m.formattedMonth}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  m.projectedNet >= 0 
                    ? 'bg-[#21C25E]/15 text-[#169445] border border-[#21C25E]/30' 
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {m.projectedNet >= 0 ? `+${formatBRL(m.projectedNet)}` : formatBRL(m.projectedNet)}
                </span>
              </div>

              {/* Incomes & Expenses Breakdown */}
              <div className="space-y-2 py-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Entradas Previstas:</span>
                  <span className="font-bold text-[#169445] font-mono">{formatBRL(m.projectedIncome)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Despesas Previstas:</span>
                  <span className="font-bold text-rose-600 font-mono">{formatBRL(m.projectedExpense)}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>{m.installmentsCount} parcelas ativas</span>
                  <span>{m.fixedCount} despesas fixas</span>
                </div>
              </div>
            </div>

            {/* Quick jump to this month button */}
            <button
              onClick={() => handleJumpToMonth(m.rawDate)}
              className="w-full mt-2 py-2.5 rounded-xl bg-slate-100 hover:bg-[#21C25E]/15 hover:text-[#169445] text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Abrir este Mês</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Active Installment Contracts / Purchases Section */}
      <div className="rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Compras Parceladas Ativas no Cartão / Boleto
              </h3>
              <p className="text-xs text-slate-500">Acompanhe a liquidação e o progresso de cada parcelamento</p>
            </div>
          </div>

          <button
            onClick={() => openTransactionModal('expense')}
            className="px-3 py-1.5 rounded-xl bg-[#21C25E]/15 hover:bg-[#21C25E]/25 text-[#169445] border border-[#21C25E]/30 text-xs font-bold transition-all cursor-pointer"
          >
            + Parcelar Compra
          </button>
        </div>

        {/* Installment Plans List */}
        <div className="space-y-3">
          {installmentPlans.length > 0 ? (
            installmentPlans.map((plan, i) => {
              const paidCount = plan.items.filter(item => item.status === 'completed').length;
              const progress = Math.round((paidCount / plan.totalInstallments) * 100);
              const totalCost = plan.amountPerMonth * plan.totalInstallments;

              return (
                <div 
                  key={i} 
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{plan.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                          {paidCount}/{plan.totalInstallments} pagas
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Parcela mensal: <strong className="text-slate-800 font-mono">{formatBRL(plan.amountPerMonth)}</strong> • Total: <strong className="text-slate-700">{formatBRL(totalCost)}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#169445]">{progress}% quitado</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-[#21C25E] rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Nenhum parcelamento ativo</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Ao adicionar uma despesa, você pode marcar a opção de parcelar em até 48x.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
