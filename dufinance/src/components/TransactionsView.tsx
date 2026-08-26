import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Calendar, 
  CreditCard, 
  Layers, 
  Barcode, 
  Copy, 
  Check, 
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  X,
  FolderTree
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType, PaymentMethod, TransactionStatus, Transaction } from '../types/finance';
import { formatBRL, formatDateBR, renderCategoryIcon, getPaymentMethodLabel } from '../utils/formatters';
import { dopamineAudio } from '../lib/audio';
import { CategoryManagerModal } from './CategoryManagerModal';

interface TransactionsViewProps {
  type: TransactionType;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ type }) => {
  const {
    monthlyTransactions,
    categories,
    formattedSelectedMonth,
    openTransactionModal,
    toggleTransactionStatus,
    deleteTransaction,
    totalIncomeRealized,
    totalIncomePending,
    totalIncomeProjected,
    totalExpenseRealized,
    totalExpensePending,
    totalExpenseProjected
  } = useFinance();

  const isIncome = type === 'income';

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all' | 'completed' | 'pending'
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Filter and sort items
  const filteredList = useMemo(() => {
    return monthlyTransactions
      .filter(t => t.type === type)
      .filter(t => {
        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchDesc = t.description.toLowerCase().includes(term);
          const matchCat = t.categoryName.toLowerCase().includes(term);
          if (!matchDesc && !matchCat) return false;
        }
        // Category
        if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) {
          return false;
        }
        // Status
        if (statusFilter !== 'all' && t.status !== statusFilter) {
          return false;
        }
        // Payment Method
        if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [monthlyTransactions, type, searchTerm, selectedCategory, statusFilter, paymentFilter, sortBy]);

  const totalRealized = isIncome ? totalIncomeRealized : totalExpenseRealized;
  const totalPending = isIncome ? totalIncomePending : totalExpensePending;
  const totalProjected = isIncome ? totalIncomeProjected : totalExpenseProjected;

  const handleCopyBarcode = (barcode: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(barcode);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* 3 Key Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-5 rounded-[24px] bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {isIncome ? 'Total Recebido (Realizado)' : 'Total Pago (Realizado)'}
          </span>
          <p className={`text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] mt-1.5 ${
            isIncome ? 'text-[#169445]' : 'text-slate-900'
          }`}>
            {formatBRL(totalRealized)}
          </p>
        </div>

        <div className="p-5 rounded-[24px] bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {isIncome ? 'A Receber (Previsto)' : 'A Vencer / Pendente'}
          </span>
          <p className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] text-amber-600 mt-1.5">
            {formatBRL(totalPending)}
          </p>
        </div>

        <div className="p-5 rounded-[24px] bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Previsto do Mês
          </span>
          <p className={`text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] mt-1.5 ${
            isIncome ? 'text-[#169445]' : 'text-rose-600'
          }`}>
            {formatBRL(totalProjected)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar with Category Manager button */}
      <div className="rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          
          {/* Search (5 cols) */}
          <div className="relative sm:col-span-2 lg:col-span-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar lançamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter + Manage Button (3 cols) */}
          <div className="flex items-center gap-2 sm:col-span-1 lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer truncate"
            >
              <option value="all">Todas Categorias</option>
              {categories.filter(c => c.type === type).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex-shrink-0 transition-colors cursor-pointer"
              title="Gerenciar Categorias"
            >
              <FolderTree className="w-4 h-4 text-[#169445]" />
            </button>
          </div>

          {/* Status Filter (2 cols) */}
          <div className="sm:col-span-1 lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="completed">Apenas Realizados</option>
              <option value="pending">Apenas Previstos</option>
            </select>
          </div>

          {/* Sort By (3 cols) */}
          <div className="sm:col-span-2 lg:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="date_desc">Mais Recentes Primeiro</option>
              <option value="date_asc">Mais Antigas Primeiro</option>
              <option value="amount_desc">Maior Valor (R$)</option>
              <option value="amount_asc">Menor Valor (R$)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredList.length > 0 ? (
          filteredList.map((tx) => {
            const isDone = tx.status === 'completed';
            const payInfo = getPaymentMethodLabel(tx.paymentMethod);

            return (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-2xl bg-white/90 backdrop-blur-md border transition-all ${
                  isDone 
                    ? 'border-slate-200/80 hover:border-slate-300 shadow-sm' 
                    : 'border-amber-300/80 bg-amber-50/50 shadow-sm'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Category Icon & Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-xs"
                      style={{ backgroundColor: tx.categoryColor || '#21C25E' }}
                    >
                      {renderCategoryIcon(tx.categoryIcon, 'w-5 h-5')}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {tx.description}
                        </span>

                        {/* Installment Badge */}
                        {tx.isInstallment && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200 flex-shrink-0">
                            Parcela {tx.currentInstallment}/{tx.totalInstallments}
                          </span>
                        )}

                        {/* Recurring badge */}
                        {tx.isRecurring && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 flex-shrink-0">
                            Recorrente
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateBR(tx.date)}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600">{tx.categoryName}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                          {payInfo.label}
                        </span>
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 italic truncate max-w-[200px]">"{tx.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions (Edit, Pay/Status, Barcode, Delete) */}
                  <div className="flex items-center justify-between lg:justify-end gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-wrap sm:flex-nowrap">
                    
                    <div className="text-left sm:text-right mr-2">
                      <p className={`text-base sm:text-lg font-black font-['Outfit',sans-serif] ${
                        isIncome ? 'text-[#169445]' : 'text-rose-600'
                      }`}>
                        {isIncome ? `+ ${formatBRL(tx.amount)}` : `- ${formatBRL(tx.amount)}`}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {isDone ? (isIncome ? 'Recebido' : 'Pago') : 'Pendente'}
                      </p>
                    </div>

                    {/* Barcode copy if available */}
                    {tx.barcode && (
                      <button
                        onClick={() => handleCopyBarcode(tx.barcode!, tx.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Copiar linha digitável do boleto"
                      >
                        {copiedId === tx.id ? <Check className="w-4 h-4 text-[#169445]" /> : <Barcode className="w-4 h-4" />}
                      </button>
                    )}

                    {/* Toggle Status Button */}
                    <button
                      onClick={() => {
                        if (!isDone) {
                          dopamineAudio.playCash();
                        } else {
                          dopamineAudio.playPop();
                        }
                        toggleTransactionStatus(tx.id);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap ${
                        isDone
                          ? 'bg-[#21C25E]/15 text-[#169445] border border-[#21C25E]/30 hover:bg-[#21C25E]/25'
                          : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                      }`}
                      title="Clique para alternar entre Realizado e Pendente"
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          <span>{isIncome ? 'Recebido' : 'Pago'}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>Marcar {isIncome ? 'Recebido' : 'Pago'}</span>
                        </>
                      )}
                    </button>

                    {/* Full Edit Button */}
                    <button
                      onClick={() => openTransactionModal(tx.type, tx)}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 whitespace-nowrap"
                      title="Editar todos os dados deste lançamento"
                    >
                      <Edit3 className="w-4 h-4 text-slate-600" />
                      <span>Editar</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir "${tx.description}"?`)) {
                          dopamineAudio.playPop();
                          deleteTransaction(tx.id, tx.isInstallment);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir Lançamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-14 text-center bg-white/90 backdrop-blur-md rounded-3xl border border-dashed border-slate-200">
            <SlidersHorizontal className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">Nenhum lançamento encontrado</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Nenhuma {isIncome ? 'entrada' : 'despesa'} registrada para os filtros selecionados em {formattedSelectedMonth}.
            </p>
            <button
              onClick={() => openTransactionModal(type)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                isIncome ? 'bg-[#21C25E] hover:bg-[#1ca650] text-black' : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {isIncome ? '+ Adicionar Entrada Agora' : '+ Adicionar Despesa Agora'}
            </button>
          </div>
        )}
      </div>

      {/* Categories Management Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        initialType={type}
      />

    </div>
  );
};
