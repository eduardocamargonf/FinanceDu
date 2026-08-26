import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Barcode, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Wallet,
  AlertTriangle,
  ChevronRight,
  Edit3
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatBRL, formatDateBR, renderCategoryIcon } from '../utils/formatters';
import { Account } from '../types/finance';

export const CardsAccountsView: React.FC = () => {
  const { 
    accounts, 
    addAccount, 
    monthlyTransactions, 
    toggleTransactionStatus, 
    openTransactionModal,
    formattedSelectedMonth 
  } = useFinance();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  
  // New Card Form State
  const [newCardName, setNewCardName] = useState('');
  const [newCardLimit, setNewCardLimit] = useState('');
  const [newCardClosing, setNewCardClosing] = useState('5');
  const [newCardDue, setNewCardDue] = useState('15');
  const [newCardLast4, setNewCardLast4] = useState('');

  // Filter credit cards
  const creditCards = useMemo(() => {
    return accounts.filter(a => a.type === 'credit_card');
  }, [accounts]);

  // Filter all boletos in the selected month
  const boletos = useMemo(() => {
    return monthlyTransactions.filter(t => t.paymentMethod === 'boleto');
  }, [monthlyTransactions]);

  const handleCopyBarcode = (barcode: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(barcode);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;

    addAccount({
      name: newCardName.trim(),
      type: 'credit_card',
      balance: 0,
      cardLimit: parseFloat(newCardLimit) || 5000,
      cardClosingDay: parseInt(newCardClosing) || 5,
      cardDueDay: parseInt(newCardDue) || 15,
      cardNumberLast4: newCardLast4.trim() || '1234',
      color: '#0F172A',
      icon: 'CreditCard',
      brand: 'picpay'
    });

    setIsAddCardModalOpen(false);
    setNewCardName('');
    setNewCardLimit('');
    setNewCardLast4('');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <CreditCard className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
              Cartões de Crédito & Boletos
            </h2>
            <p className="text-xs text-slate-500">
              Controle limites, faturas e vencimentos de boletos em <strong className="text-slate-800 font-semibold">{formattedSelectedMonth}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddCardModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#21C25E] hover:bg-[#1ca650] text-black font-bold text-xs shadow-md shadow-[#21C25E]/20 hover:scale-[1.02] transition-all cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Novo Cartão</span>
        </button>
      </div>

      {/* Credit Cards Visual Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {creditCards.map(card => {
          // Calculate card expenses in selected month
          const cardExpenses = monthlyTransactions
            .filter(t => t.paymentMethod === 'credit_card' && (t.accountId === card.id || !t.accountId))
            .reduce((sum, t) => sum + t.amount, 0);

          const limit = card.cardLimit || 10000;
          const availableLimit = Math.max(0, limit - cardExpenses);
          const limitUsagePercent = Math.min(100, Math.round((cardExpenses / limit) * 100));

          return (
            <motion.div
              key={card.id}
              whileHover={{ y: -3 }}
              className="rounded-[28px] bg-slate-900 text-white border border-slate-800 p-6 shadow-md relative overflow-hidden flex flex-col justify-between"
            >
              {/* Card Hologram Chip & Logo */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-200 shadow-sm border border-amber-300/40" />
                  <span className="text-xs font-bold text-slate-300 font-['Outfit',sans-serif]">
                    DuCard Platinum
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#21C25E] font-['Outfit',sans-serif] tracking-wider">
                    PICPAY
                  </span>
                </div>
              </div>

              {/* Card Number Mask */}
              <div className="my-3">
                <span className="text-sm sm:text-base font-mono tracking-widest text-slate-200 font-bold">
                  •••• •••• •••• {card.cardNumberLast4 || '4092'}
                </span>
                <p className="text-xs text-slate-400 mt-1 font-semibold">{card.name}</p>
              </div>

              {/* Invoice & Limits */}
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Fatura Atual ({formattedSelectedMonth})</span>
                    <p className="text-lg font-black text-rose-400 font-mono mt-0.5">{formatBRL(cardExpenses)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Limite Disponível</span>
                    <p className="text-lg font-black text-[#21C25E] font-mono mt-0.5">{formatBRL(availableLimit)}</p>
                  </div>
                </div>

                {/* Limit Gauge */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Limite Total: {formatBRL(limit)}</span>
                    <span className="font-bold text-white">{limitUsagePercent}% usado</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        limitUsagePercent > 85 ? 'bg-rose-500' : limitUsagePercent > 60 ? 'bg-amber-400' : 'bg-[#21C25E]'
                      }`}
                      style={{ width: `${limitUsagePercent}%` }}
                    />
                  </div>
                </div>

                {/* Dates Info */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Fechamento: <strong>Dia {card.cardClosingDay || 5}</strong></span>
                  <span>Melhor dia de compra: <strong>Dia {(card.cardClosingDay || 5) + 1}</strong></span>
                  <span>Vencimento: <strong>Dia {card.cardDueDay || 15}</strong></span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Boletos Section */}
      <div className="rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Central de Boletos do Mês
              </h3>
              <p className="text-xs text-slate-500">Copie o código de barras ou pague diretamente</p>
            </div>
          </div>

          <button
            onClick={() => openTransactionModal('expense')}
            className="px-3 py-1.5 rounded-xl bg-[#21C25E]/15 hover:bg-[#21C25E]/25 text-[#169445] border border-[#21C25E]/30 text-xs font-bold transition-all cursor-pointer"
          >
            + Cadastrar Boleto
          </button>
        </div>

        {/* Boletos List */}
        <div className="space-y-3">
          {boletos.length > 0 ? (
            boletos.map(boleto => {
              const isPaid = boleto.status === 'completed';

              return (
                <div
                  key={boleto.id}
                  className={`p-4 rounded-2xl bg-slate-50 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPaid ? 'border-slate-200/80' : 'border-amber-300 bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: boleto.categoryColor || '#3B82F6' }}
                    >
                      {renderCategoryIcon(boleto.categoryIcon, 'w-5 h-5')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{boleto.description}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid 
                            ? 'bg-[#21C25E]/15 text-[#169445] border border-[#21C25E]/30' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isPaid ? 'Boleto Pago' : 'Aguardando Pagamento'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Vencimento: <strong className="text-slate-700">{formatDateBR(boleto.date)}</strong></span>
                        {boleto.barcode && (
                          <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                            {boleto.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <span className="text-base font-black text-rose-600 font-mono">
                      {formatBRL(boleto.amount)}
                    </span>

                    {boleto.barcode && (
                      <button
                        onClick={() => handleCopyBarcode(boleto.barcode!, boleto.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedId === boleto.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#169445]" />
                            <span className="text-[#169445]">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Linha</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => openTransactionModal('expense', boleto)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Editar boleto"
                    >
                      <Edit3 className="w-4 h-4 text-slate-600" />
                    </button>

                    <button
                      onClick={() => toggleTransactionStatus(boleto.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isPaid
                          ? 'bg-[#21C25E]/15 text-[#169445] border border-[#21C25E]/30'
                          : 'bg-[#21C25E] hover:bg-[#1ca650] text-black shadow-sm'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{isPaid ? 'Pago' : 'Marcar Pago'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Barcode className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Nenhum boleto cadastrado neste mês</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Cadastre suas contas com código de barras para pagar sem atraso.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Card Modal */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[28px] p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Cadastrar Novo Cartão</h3>
            <form onSubmit={handleCreateCard} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Cartão</label>
                <input
                  type="text"
                  placeholder="Ex: Nubank Ultravioleta, C6 Carbon..."
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Limite Total (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 8000"
                  value={newCardLimit}
                  onChange={(e) => setNewCardLimit(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Dia Fecha</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newCardClosing}
                    onChange={(e) => setNewCardClosing(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Dia Vence</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newCardDue}
                    onChange={(e) => setNewCardDue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Últimos 4 Dig.</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="9999"
                    value={newCardLast4}
                    onChange={(e) => setNewCardLast4(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCardModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#21C25E] hover:bg-[#1ca650] text-black text-xs font-bold cursor-pointer shadow-xs"
                >
                  Salvar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
