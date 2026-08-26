import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  CreditCard, 
  Tag, 
  Layers, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Barcode, 
  Plus,
  Edit3
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType, PaymentMethod, TransactionStatus } from '../types/finance';
import { formatBRL, renderCategoryIcon } from '../utils/formatters';
import { format } from 'date-fns';

export const TransactionModal: React.FC = () => {
  const { 
    isTransactionModalOpen, 
    closeTransactionModal, 
    transactionModalInitialType,
    editingTransaction,
    categories,
    accounts,
    addTransaction,
    updateTransaction
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [accountId, setAccountId] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('completed');
  
  // Installments & Recurring
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState(2);
  const [isRecurring, setIsRecurring] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [notes, setNotes] = useState('');

  // Reset or populate form when modal opens
  useEffect(() => {
    if (isTransactionModalOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setDescription(editingTransaction.description);
        setAmountStr(String(editingTransaction.amount));
        setDate(editingTransaction.date);
        setCategoryId(editingTransaction.categoryId);
        setPaymentMethod(editingTransaction.paymentMethod);
        setAccountId(editingTransaction.accountId || (accounts.length > 0 ? accounts[0].id : ''));
        setStatus(editingTransaction.status);
        setIsInstallment(Boolean(editingTransaction.isInstallment));
        setInstallmentsCount(editingTransaction.totalInstallments || 2);
        setIsRecurring(Boolean(editingTransaction.isRecurring));
        setBarcode(editingTransaction.barcode || '');
        setNotes(editingTransaction.notes || '');
      } else {
        const currentType = transactionModalInitialType || 'expense';
        setType(currentType);
        setDescription('');
        setAmountStr('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setIsInstallment(false);
        setInstallmentsCount(2);
        setIsRecurring(false);
        setBarcode('');
        setNotes('');
        setStatus('completed');
        
        // Filter strictly to this type
        const filteredCats = categories.filter(c => c.type === currentType);
        if (filteredCats.length > 0) {
          setCategoryId(filteredCats[0].id);
        }
        if (accounts.length > 0) {
          setAccountId(accounts[0].id);
        }
      }
    }
  }, [isTransactionModalOpen, transactionModalInitialType, editingTransaction, categories, accounts]);

  // Strictly filter categories to this transaction's type
  const filteredCategories = categories.filter(c => c.type === type);

  // Amount parsing helper
  const parsedAmount = parseFloat(amountStr.replace(',', '.')) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || parsedAmount <= 0) return;

    const selectedCategory = categories.find(c => c.id === categoryId) || filteredCategories[0];

    if (editingTransaction) {
      // Update existing transaction
      await updateTransaction(editingTransaction.id, {
        description: description.trim(),
        amount: parsedAmount,
        type,
        categoryId: selectedCategory ? selectedCategory.id : editingTransaction.categoryId,
        categoryName: selectedCategory ? selectedCategory.name : editingTransaction.categoryName,
        categoryIcon: selectedCategory ? selectedCategory.icon : editingTransaction.categoryIcon,
        categoryColor: selectedCategory ? selectedCategory.color : editingTransaction.categoryColor,
        date,
        paymentMethod,
        status,
        accountId: accountId || undefined,
        isRecurring,
        notes: notes.trim() || undefined,
        barcode: barcode.trim() || undefined
      });
    } else {
      // Add new transaction
      await addTransaction({
        description: description.trim(),
        amount: parsedAmount,
        type,
        categoryId: selectedCategory ? selectedCategory.id : 'cat-custom',
        categoryName: selectedCategory ? selectedCategory.name : (type === 'income' ? 'Outras Entradas' : 'Outras Despesas'),
        categoryIcon: selectedCategory ? selectedCategory.icon : 'Tag',
        categoryColor: selectedCategory ? selectedCategory.color : (type === 'income' ? '#21C25E' : '#EF4444'),
        date,
        paymentMethod,
        status,
        accountId: accountId || undefined,
        isRecurring,
        notes: notes.trim() || undefined,
        barcode: barcode.trim() || undefined,
        installmentsCount: isInstallment && type === 'expense' ? installmentsCount : 1
      });
    }

    closeTransactionModal();
  };

  if (!isTransactionModalOpen) return null;

  const isIncome = type === 'income';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeTransactionModal}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-[28px] p-5 sm:p-7 shadow-2xl z-10 my-auto overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          {/* Top Title & Close */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                editingTransaction 
                  ? 'bg-amber-100 text-amber-800'
                  : isIncome 
                    ? 'bg-[#21C25E]/15 text-[#169445] border border-[#21C25E]/30' 
                    : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}>
                {editingTransaction ? (
                  <Edit3 className="w-5 h-5" />
                ) : isIncome ? (
                  <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                  {editingTransaction 
                    ? (isIncome ? 'Editar Entrada' : 'Editar Saída / Despesa') 
                    : (isIncome ? 'Nova Entrada (Receita)' : 'Nova Saída (Despesa)')}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingTransaction 
                    ? 'Atualize os dados e confirme para salvar as alterações' 
                    : isIncome 
                      ? 'Adicione uma nova receita ao seu faturamento' 
                      : 'Registre uma despesa para controle do orçamento'}
                </p>
              </div>
            </div>

            <button
              onClick={closeTransactionModal}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">

            {/* Big Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Valor {isIncome ? 'da Entrada' : 'da Despesa'} (R$)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9.,]/g, ''))}
                  required
                  autoFocus
                  className={`w-full pl-13 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-2xl font-black font-['Outfit',sans-serif] outline-none transition-all placeholder:text-slate-400 ${
                    isIncome 
                      ? 'focus:border-[#21C25E] focus:ring-1 focus:ring-[#21C25E] text-[#169445]' 
                      : 'focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Descrição / Título
              </label>
              <input
                type="text"
                placeholder={isIncome ? "Ex: Salário, Rendimento, Freelance, Venda..." : "Ex: Supermercado, Aluguel, Internet, Combustível..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Category and Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Categoria de {isIncome ? 'Entrada' : 'Saída'}
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all cursor-pointer"
                >
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-white text-slate-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {isIncome ? 'Data de Recebimento' : 'Data de Vencimento / Pagamento'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Payment Method & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {isIncome ? 'Forma de Recebimento' : 'Forma de Pagamento'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all cursor-pointer"
                >
                  <option value="pix">Pix Instantâneo</option>
                  <option value="transfer">Transferência / TED</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="cash">Dinheiro em Espécie</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Status da Operação
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setStatus('completed')}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      status === 'completed'
                        ? 'bg-white text-[#169445] border border-slate-200/80 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isIncome ? 'Recebido' : 'Pago'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('pending')}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      status === 'pending'
                        ? 'bg-white text-amber-600 border border-slate-200/80 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Previsto</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Installments Option (ONLY for Expenses / Purchases) */}
            {!isIncome && !editingTransaction && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#169445]" />
                    <span className="text-xs font-bold text-slate-800">Parcelamento no Cartão/Boleto</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInstallment}
                      onChange={(e) => setIsInstallment(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#21C25E]"></div>
                  </label>
                </div>

                {isInstallment && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="pt-2 border-t border-slate-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-600">Número de Parcelas:</span>
                      <select
                        value={installmentsCount}
                        onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      >
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 18, 24, 36, 48].map(n => (
                          <option key={n} value={n}>
                            {n}x {parsedAmount > 0 ? `de ${formatBRL(parsedAmount / n)}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[11px] text-[#169445] mt-2 font-medium">
                      ✨ As próximas {installmentsCount} parcelas serão automaticamente geradas nos meses seguintes na Projeção Futura!
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* If editing an installment item */}
            {editingTransaction?.isInstallment && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800 flex items-center gap-2 font-medium">
                <Layers className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>Esta é a parcela <strong>{editingTransaction.currentInstallment}/{editingTransaction.totalInstallments}</strong> de uma compra parcelada.</span>
              </div>
            )}

            {/* Boleto Barcode input if boleto is selected */}
            {paymentMethod === 'boleto' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-[#169445]" />
                  <span>Código de Barras / Linha Digitável (Opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="23793.38128 60032.891234..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs font-mono text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Observações / Notas (Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Nota fiscal nº 1092, rendimento extra, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={closeTransactionModal}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={`w-2/3 py-3 rounded-2xl font-black text-sm transition-all shadow-xs cursor-pointer ${
                  editingTransaction
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 hover:scale-[1.01]'
                    : isIncome
                      ? 'bg-[#21C25E] hover:bg-[#1ca650] text-black shadow-[#21C25E]/20 hover:scale-[1.01]'
                      : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 hover:scale-[1.01]'
                }`}
              >
                {editingTransaction 
                  ? 'Salvar Alterações 💾' 
                  : isIncome ? 'Salvar Entrada 🚀' : 'Salvar Despesa 💸'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
