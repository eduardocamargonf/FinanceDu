import React from 'react';
import { 
  Menu, 
  Plus, 
  LayoutDashboard, 
  ArrowDownRight, 
  ArrowUpRight, 
  CalendarRange, 
  CreditCard, 
  Target, 
  FolderTree
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { MonthSelector } from './MonthSelector';
import { ActiveTab } from '../types/finance';

interface TopHeaderProps {
  onOpenSidebar: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
  dashboard: {
    title: 'Visão Geral',
    subtitle: 'Painel executivo com métricas consolidadas e fluxo financeiro',
    icon: LayoutDashboard
  },
  incomes: {
    title: 'Entradas & Receitas',
    subtitle: 'Gestão de salários, transferências, vendas e faturamento',
    icon: ArrowDownRight
  },
  expenses: {
    title: 'Saídas & Despesas',
    subtitle: 'Controle rigoroso de gastos diários, custos fixos e variáveis',
    icon: ArrowUpRight
  },
  projection: {
    title: 'Projeção Futura',
    subtitle: 'Previsão de caixa para os próximos 6 meses com faturas e parcelas',
    icon: CalendarRange
  },
  cards: {
    title: 'Cartões & Boletos',
    subtitle: 'Acompanhamento de limites de crédito, faturas e vencimentos',
    icon: CreditCard
  },
  goals: {
    title: 'Metas & Sonhos',
    subtitle: 'Reserva de emergência, aquisições e metas de poupança',
    icon: Target
  },
  categories: {
    title: 'Gerenciador de Categorias',
    subtitle: 'Personalização completa de tetos orçamentários, cores e ícones',
    icon: FolderTree
  }
};

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenSidebar }) => {
  const { 
    activeTab, 
    openTransactionModal 
  } = useFinance();

  const currentTabInfo = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;
  const Icon = currentTabInfo.icon;

  const handleActionClick = () => {
    if (activeTab === 'incomes') {
      openTransactionModal('income');
    } else {
      openTransactionModal('expense');
    }
  };

  const getActionButtonText = () => {
    if (activeTab === 'incomes') return '+ Nova Entrada';
    if (activeTab === 'expenses') return '+ Nova Despesa';
    return '+ Novo Lançamento';
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Mobile hamburger & Page Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onOpenSidebar}
                className="md:hidden p-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center cursor-pointer flex-shrink-0"
                title="Abrir Menu Lateral"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 min-w-0">
                <div className="hidden sm:flex w-10 h-10 rounded-2xl bg-[#21C25E]/15 text-[#169445] items-center justify-center border border-[#21C25E]/30 flex-shrink-0">
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight truncate">
                    {currentTabInfo.title}
                  </h1>
                  <p className="text-xs text-slate-500 hidden lg:block truncate">
                    {currentTabInfo.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Month Selector & Unified Action Button */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              {/* Month Selector in Header */}
              <MonthSelector />

              {/* Action Button only on Incomes and Expenses tabs */}
              {(activeTab === 'incomes' || activeTab === 'expenses') && (
                <button
                  onClick={handleActionClick}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-[#21C25E] hover:bg-[#1ca650] text-black font-bold text-xs sm:text-sm shadow-md shadow-[#21C25E]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span className="font-['Outfit',sans-serif] tracking-wide whitespace-nowrap">
                    {getActionButtonText()}
                  </span>
                </button>
              )}

            </div>
          </div>
        </div>
      </header>
    </>
  );
};
