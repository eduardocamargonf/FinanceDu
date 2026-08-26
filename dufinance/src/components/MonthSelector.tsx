import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const MonthSelector: React.FC = () => {
  const { 
    nextMonth, 
    prevMonth, 
    goToCurrentMonth, 
    formattedSelectedMonth, 
    isCurrentMonthSelected,
    monthlyTransactions
  } = useFinance();

  return (
    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-1.5 shadow-sm">
      <button
        onClick={prevMonth}
        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center active:scale-95"
        title="Mês anterior"
      >
        <ChevronLeft className="w-4 h-4 text-slate-600 hover:text-[#21C25E] transition-colors" />
      </button>

      <div className="flex items-center gap-2 px-2 py-0.5">
        <CalendarIcon className="w-4 h-4 text-[#21C25E]" />
        <span className="text-sm font-bold text-slate-900 tracking-wide font-['Outfit',sans-serif] whitespace-nowrap min-w-[120px] text-center">
          {formattedSelectedMonth}
        </span>
      </div>

      <button
        onClick={nextMonth}
        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center active:scale-95"
        title="Próximo mês"
      >
        <ChevronRight className="w-4 h-4 text-slate-600 hover:text-[#21C25E] transition-colors" />
      </button>

      {!isCurrentMonthSelected && (
        <button
          onClick={goToCurrentMonth}
          className="ml-1 px-3 py-1.5 rounded-xl bg-[#21C25E]/10 hover:bg-[#21C25E]/20 text-[#21C25E] border border-[#21C25E]/30 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap"
          title="Ir para o mês atual"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Hoje</span>
        </button>
      )}
    </div>
  );
};

