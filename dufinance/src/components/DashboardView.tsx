import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Calendar,
  Layers,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  Target,
  Percent,
  SlidersHorizontal,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { formatBRL, formatDateBR, renderCategoryIcon, getPaymentMethodLabel } from '../utils/formatters';
import { DuMascot } from './DuMascot';
import { parseISO, format, getDaysInMonth, getDate, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const DashboardView: React.FC = () => {
  const {
    selectedDate,
    formattedSelectedMonth,
    transactions,
    monthlyTransactions,
    monthlyIncomes,
    monthlyExpenses,
    categories,
    totalIncomeRealized,
    totalIncomePending,
    totalIncomeProjected,
    totalExpenseRealized,
    totalExpensePending,
    totalExpenseProjected,
    balanceRealized,
    balanceProjected,
    savingsRate,
    duScore,
    setActiveTab
  } = useFinance();

  // Chart toggles and interactive states
  const [cashflowViewMode, setCashflowViewMode] = useState<'cumulative' | 'daily'>('cumulative');
  const [activeExpenseCategoryIndex, setActiveExpenseCategoryIndex] = useState<number | null>(null);

  // 1. Cashflow Evolution Chart Data (Daily & Cumulative)
  const cashflowChartData = useMemo(() => {
    const daysCount = getDaysInMonth(selectedDate);
    const data: { day: string; dayNum: number; income: number; expense: number; net: number; dailyIncome: number; dailyExpense: number }[] = [];
    
    const incomeByDay: Record<number, number> = {};
    const expenseByDay: Record<number, number> = {};

    monthlyTransactions.forEach(t => {
      try {
        const d = getDate(parseISO(t.date));
        if (t.type === 'income') {
          incomeByDay[d] = (incomeByDay[d] || 0) + t.amount;
        } else {
          expenseByDay[d] = (expenseByDay[d] || 0) + t.amount;
        }
      } catch {
        // ignore
      }
    });

    let runningIncome = 0;
    let runningExpense = 0;

    for (let day = 1; day <= daysCount; day++) {
      const dInc = incomeByDay[day] || 0;
      const dExp = expenseByDay[day] || 0;

      runningIncome += dInc;
      runningExpense += dExp;

      // Sample every 2-3 days or days with activity for smooth graph
      if (day === 1 || day % 3 === 0 || day === daysCount || dInc > 0 || dExp > 0) {
        data.push({
          day: `Dia ${day}`,
          dayNum: day,
          income: runningIncome,
          expense: runningExpense,
          net: runningIncome - runningExpense,
          dailyIncome: dInc,
          dailyExpense: dExp
        });
      }
    }

    return data;
  }, [monthlyTransactions, selectedDate]);

  // 2. Expense Category Breakdown for Pie/Donut Chart
  const expenseCategoryData = useMemo(() => {
    const map: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

    monthlyExpenses.forEach(t => {
      if (!map[t.categoryId]) {
        map[t.categoryId] = {
          name: t.categoryName,
          amount: 0,
          color: t.categoryColor || '#EF4444',
          icon: t.categoryIcon
        };
      }
      map[t.categoryId].amount += t.amount;
    });

    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [monthlyExpenses]);

  // 3. Income Category Breakdown (Sources of Revenue)
  const incomeCategoryData = useMemo(() => {
    const map: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

    monthlyIncomes.forEach(t => {
      if (!map[t.categoryId]) {
        map[t.categoryId] = {
          name: t.categoryName,
          amount: 0,
          color: t.categoryColor || '#21C25E',
          icon: t.categoryIcon
        };
      }
      map[t.categoryId].amount += t.amount;
    });

    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [monthlyIncomes]);

  // 4. 6-Month Historical Comparison (Receitas vs Despesas vs Saldo Líquido)
  const historical6MonthsData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(selectedDate, i);
      const monthLabel = format(monthDate, 'MMM/yy', { locale: ptBR });
      const fullLabel = format(monthDate, 'MMMM yyyy', { locale: ptBR });

      // Calculate totals from transactions matching this month
      let inc = 0;
      let exp = 0;

      transactions.forEach(t => {
        try {
          if (isSameMonth(parseISO(t.date), monthDate)) {
            if (t.type === 'income') inc += t.amount;
            else exp += t.amount;
          }
        } catch {
          // ignore
        }
      });

      // Fallback base values for demonstration if month had no recorded items
      if (inc === 0 && exp === 0) {
        inc = Math.round(totalIncomeProjected * (0.85 + (5 - i) * 0.03));
        exp = Math.round(totalExpenseProjected * (0.82 + (5 - i) * 0.035));
      }

      months.push({
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        fullMonth: fullLabel,
        receitas: inc,
        despesas: exp,
        saldo: inc - exp,
        isCurrent: i === 0
      });
    }
    return months;
  }, [transactions, selectedDate, totalIncomeProjected, totalExpenseProjected]);

  // 5. Payment Methods Breakdown (Pix, Cartão, Boleto, etc.)
  const paymentMethodData = useMemo(() => {
    const map: Record<string, { label: string; amount: number; count: number; color: string }> = {
      pix: { label: 'Pix', amount: 0, count: 0, color: '#06B6D4' },
      credit_card: { label: 'Cartão Crédito', amount: 0, count: 0, color: '#8B5CF6' },
      boleto: { label: 'Boleto', amount: 0, count: 0, color: '#F59E0B' },
      debit_card: { label: 'Cartão Débito', amount: 0, count: 0, color: '#3B82F6' },
      cash: { label: 'Dinheiro', amount: 0, count: 0, color: '#10B981' },
      transfer: { label: 'Transferência', amount: 0, count: 0, color: '#6366F1' },
    };

    monthlyExpenses.forEach(t => {
      const pm = t.paymentMethod || 'pix';
      if (map[pm]) {
        map[pm].amount += t.amount;
        map[pm].count += 1;
      }
    });

    return Object.values(map)
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyExpenses]);

  // 6. Category Budget Health (Gasto vs Teto Orçamentário)
  const budgetHealthData = useMemo(() => {
    return categories
      .filter(c => c.type === 'expense' && c.monthlyBudget && c.monthlyBudget > 0)
      .map(cat => {
        const spent = monthlyExpenses
          .filter(e => e.categoryId === cat.id)
          .reduce((sum, e) => sum + e.amount, 0);
        const budget = cat.monthlyBudget || 1;
        const percentage = Math.round((spent / budget) * 100);
        const remaining = budget - spent;

        return {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          spent,
          budget,
          percentage,
          remaining,
          status: percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : 'safe'
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [categories, monthlyExpenses]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* DU Mascot Banner with Executive Insights */}
      <DuMascot />

      {/* KPI Bento Grid - Frosted Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Saldo Realizado */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-[26px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Saldo Realizado
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#21C25E]/15 text-[#169445] flex items-center justify-center border border-[#21C25E]/30">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight">
              {formatBRL(balanceRealized)}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-[#169445] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmado em conta</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Saldo Previsto no Fechamento */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-[26px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Saldo Previsto
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              balanceProjected >= 0 
                ? 'bg-[#21C25E]/15 text-[#169445] border-[#21C25E]/30' 
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className={`text-xl sm:text-2xl font-black font-['Outfit',sans-serif] tracking-tight ${
              balanceProjected >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}>
              {formatBRL(balanceProjected)}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{formattedSelectedMonth}</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Total Entradas */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-[26px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Entradas
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#21C25E]/15 text-[#169445] flex items-center justify-center border border-[#21C25E]/30">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-[#169445] font-['Outfit',sans-serif] tracking-tight">
              {formatBRL(totalIncomeProjected)}
            </h3>
            <div className="text-[11px] text-slate-500 font-medium truncate">
              Realizado: <strong className="text-slate-800">{formatBRL(totalIncomeRealized)}</strong>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Total Saídas */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-[26px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Saídas
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-rose-600 font-['Outfit',sans-serif] tracking-tight">
              {formatBRL(totalExpenseProjected)}
            </h3>
            <div className="text-[11px] text-slate-500 font-medium truncate">
              Pago: <strong className="text-slate-800">{formatBRL(totalExpenseRealized)}</strong>
            </div>
          </div>
        </motion.div>

        {/* Card 5: Taxa de Poupança & Saúde */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-[26px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 shadow-xs group sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Taxa Poupança
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-purple-700 font-['Outfit',sans-serif] tracking-tight">
              {savingsRate}%
            </h3>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

      </div>

      {/* SEÇÃO 1 DE GRÁFICOS: Fluxo de Caixa Dinâmico + Composição de Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico 1: Evolução Temporal do Fluxo de Caixa (2 colunas) */}
        <div className="lg:col-span-2 rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#169445]" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
                  Evolução do Fluxo de Caixa
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#21C25E]/15 text-[#169445] text-xs font-bold">
                  {formattedSelectedMonth}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Curva de receitas, despesas e saldo líquido consolidado ao longo dos dias
              </p>
            </div>

            {/* View Mode Toggle: Acumulado vs Diário */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto border border-slate-200/60">
              <button
                type="button"
                onClick={() => setCashflowViewMode('cumulative')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  cashflowViewMode === 'cumulative'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Acumulado
              </button>
              <button
                type="button"
                onClick={() => setCashflowViewMode('daily')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  cashflowViewMode === 'daily'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Dia
              </button>
            </div>
          </div>

          {/* Chart Rendering */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#21C25E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#21C25E" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                />
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
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: number | string | Array<number | string> | undefined) => {
                    const num = typeof value === 'number' ? value : Number(value || 0);
                    return [formatBRL(num), ''];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey={cashflowViewMode === 'cumulative' ? "income" : "dailyIncome"} 
                  name="Entradas"
                  stroke="#21C25E" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#incomeGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey={cashflowViewMode === 'cumulative' ? "expense" : "dailyExpense"} 
                  name="Saídas"
                  stroke="#EF4444" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#expenseGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#21C25E]" />
              <span>Receitas ({formatBRL(totalIncomeProjected)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Despesas ({formatBRL(totalExpenseProjected)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-900" />
              <span>Saldo Previsto ({formatBRL(balanceProjected)})</span>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Composição de Despesas por Categoria (1 coluna) */}
        <div className="rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                  Gastos por Categoria
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {expenseCategoryData.length} categorias
              </span>
            </div>

            {/* Donut Chart */}
            <div className="h-44 w-full relative my-3">
              {expenseCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={74}
                      paddingAngle={3}
                      onMouseEnter={(_, index) => setActiveExpenseCategoryIndex(index)}
                      onMouseLeave={() => setActiveExpenseCategoryIndex(null)}
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke={activeExpenseCategoryIndex === index ? '#0f172a' : 'transparent'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      formatter={(value: number | string | Array<number | string> | undefined) => {
                        const num = typeof value === 'number' ? value : Number(value || 0);
                        return [formatBRL(num), ''];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Nenhuma despesa registrada neste mês
                </div>
              )}
            </div>

            {/* Top Categories List with percentages */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {expenseCategoryData.slice(0, 5).map((cat, i) => {
                const percent = totalExpenseProjected > 0 
                  ? Math.round((cat.amount / totalExpenseProjected) * 100) 
                  : 0;
                return (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold text-slate-700 truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-slate-900 font-mono">{formatBRL(cat.amount)}</span>
                      <span className="text-[11px] text-slate-500 font-bold px-1.5 py-0.5 rounded-md bg-slate-100">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className="w-full mt-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Ver Detalhes das Saídas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* SEÇÃO 2 DE GRÁFICOS: Comparativo Semestral + Formas de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfico 3: Comparativo Histórico Semestral (7 colunas) */}
        <div className="lg:col-span-7 rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                  Comparativo Histórico Semestral
                </h3>
                <p className="text-xs text-slate-500">
                  Performance de Receitas vs Despesas nos últimos 6 meses
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
              Últimos 6 meses
            </span>
          </div>

          {/* Bar Chart 6 months */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historical6MonthsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                />
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
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: number | string | Array<number | string> | undefined) => {
                    const num = typeof value === 'number' ? value : Number(value || 0);
                    return [formatBRL(num), ''];
                  }}
                />
                <Bar 
                  dataKey="receitas" 
                  name="Receitas" 
                  fill="#21C25E" 
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={32}
                />
                <Bar 
                  dataKey="despesas" 
                  name="Despesas" 
                  fill="#EF4444" 
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-4 font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md bg-[#21C25E]" />
                <span>Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-md bg-[#EF4444]" />
                <span>Despesas</span>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              💡 Mantenha a barra verde consistentemente superior à vermelha
            </span>
          </div>
        </div>

        {/* Gráfico 4: Distribuição por Forma de Pagamento (5 colunas) */}
        <div className="lg:col-span-5 rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                    Gastos por Forma de Pagamento
                  </h3>
                  <p className="text-xs text-slate-500">Distribuição financeira por meio utilizado</p>
                </div>
              </div>
            </div>

            {/* List with Progress Bars */}
            <div className="space-y-3 pt-2">
              {paymentMethodData.map((item, i) => {
                const percent = totalExpenseProjected > 0
                  ? Math.round((item.amount / totalExpenseProjected) * 100)
                  : 0;

                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-slate-800">{item.label}</span>
                        <span className="text-[11px] text-slate-400">({item.count} transações)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">{formatBRL(item.amount)}</span>
                        <span className="text-[11px] font-bold text-slate-500">({percent}%)</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}

              {paymentMethodData.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum método de pagamento registrado neste mês.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Transacionado:</span>
            <strong className="text-slate-900 font-mono">{formatBRL(totalExpenseProjected)}</strong>
          </div>
        </div>

      </div>

      {/* SEÇÃO 3 DE GRÁFICOS: Origem das Receitas + Acompanhamento de Tetos Orçamentários */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfico 5: Origem das Receitas / Entradas (5 colunas) */}
        <div className="lg:col-span-5 rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#21C25E]/15 text-[#169445] flex items-center justify-center border border-[#21C25E]/30">
                  <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                    Origem das Receitas
                  </h3>
                  <p className="text-xs text-slate-500">Fontes de faturamento no mês</p>
                </div>
              </div>

              <span className="text-xs font-bold text-[#169445] bg-[#21C25E]/15 px-2.5 py-1 rounded-xl">
                {formatBRL(totalIncomeProjected)}
              </span>
            </div>

            {/* Income Donut */}
            <div className="h-40 w-full relative my-2">
              {incomeCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeCategoryData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {incomeCategoryData.map((entry, index) => (
                        <Cell key={`inc-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      formatter={(value: number | string | Array<number | string> | undefined) => {
                        const num = typeof value === 'number' ? value : Number(value || 0);
                        return [formatBRL(num), ''];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Nenhuma receita registrada neste mês
                </div>
              )}
            </div>

            {/* Income Sources List */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
              {incomeCategoryData.map((cat, i) => {
                const percent = totalIncomeProjected > 0 
                  ? Math.round((cat.amount / totalIncomeProjected) * 100) 
                  : 0;
                return (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold text-slate-800 truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-[#169445] font-mono">{formatBRL(cat.amount)}</span>
                      <span className="text-[11px] text-slate-500 font-bold px-1.5 py-0.5 rounded-md bg-slate-100">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('incomes')}
            className="w-full mt-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Ver Detalhes das Entradas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Gráfico 6: Tetos Orçamentários e Saúde de Metas (7 colunas) */}
        <div className="lg:col-span-7 rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                  Controle de Tetos Orçamentários
                </h3>
                <p className="text-xs text-slate-500">
                  Acompanhe limites de gastos por categoria para não estourar o orçamento
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className="text-xs font-bold text-[#169445] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ajustar Tetos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Budget Gauges List */}
          <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {budgetHealthData.map(cat => (
              <div 
                key={cat.id} 
                className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      {renderCategoryIcon(cat.icon, 'w-3.5 h-3.5')}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        Teto: {formatBRL(cat.budget)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-bold ${
                      cat.status === 'danger' 
                        ? 'text-rose-600' 
                        : cat.status === 'warning' 
                          ? 'text-amber-600' 
                          : 'text-[#169445]'
                    }`}>
                      {formatBRL(cat.spent)}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.status === 'danger' 
                        ? 'bg-rose-500' 
                        : cat.status === 'warning' 
                          ? 'bg-amber-500' 
                          : 'bg-[#21C25E]'
                    }`}
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    {cat.status === 'danger' 
                      ? '⚠️ Teto estourado!' 
                      : cat.status === 'warning' 
                        ? '⚡ Quase no limite' 
                        : '✅ Dentro do planejado'}
                  </span>
                  <span>
                    {cat.remaining >= 0 ? `Resta: ${formatBRL(cat.remaining)}` : `Excedido: ${formatBRL(Math.abs(cat.remaining))}`}
                  </span>
                </div>
              </div>
            ))}

            {budgetHealthData.length === 0 && (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Nenhum teto orçamentário configurado</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Vá na aba de Saídas & Despesas e clique em "Categorias" para definir tetos mensais.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
