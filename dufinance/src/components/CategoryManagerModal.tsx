import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderTree, 
  Plus, 
  Trash2, 
  Edit3, 
  Tag, 
  Sparkles, 
  Check, 
  X,
  AlertCircle,
  Layers,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Category, TransactionType } from '../types/finance';
import { formatBRL, renderCategoryIcon, CATEGORY_ICONS_MAP } from '../utils/formatters';
import { dopamineAudio } from '../lib/audio';

const PRESET_COLORS = [
  '#21C25E', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', 
  '#8B5CF6', '#EC4899', '#F43F5E', '#EF4444', '#F59E0B', 
  '#84CC16', '#64748B'
];

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense'
}) => {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    monthlyExpenses 
  } = useFinance();

  const isIncome = initialType === 'income';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState(isIncome ? '#21C25E' : '#EF4444');
  const [budgetStr, setBudgetStr] = useState('');

  // Strictly filter categories to initialType
  const filteredCategories = categories.filter(c => c.type === initialType);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setIcon('Tag');
    setColor(isIncome ? '#21C25E' : '#EF4444');
    setBudgetStr('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setBudgetStr(cat.monthlyBudget ? String(cat.monthlyBudget) : '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const budget = budgetStr ? parseFloat(budgetStr.replace(',', '.')) : undefined;

    if (editingCat) {
      updateCategory(editingCat.id, {
        name: name.trim(),
        icon,
        color,
        monthlyBudget: !isIncome ? budget : undefined
      });
      dopamineAudio.playPop();
    } else {
      addCategory({
        name: name.trim(),
        type: initialType,
        icon,
        color,
        monthlyBudget: !isIncome ? budget : undefined
      });
      dopamineAudio.playCash();
    }

    setIsFormOpen(false);
    setEditingCat(null);
  };

  const handleDeleteCategory = (cat: Category) => {
    if (confirm(`Deseja realmente excluir a categoria "${cat.name}"?`)) {
      dopamineAudio.playPop();
      deleteCategory(cat.id);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[28px] p-5 sm:p-7 shadow-2xl z-10 my-auto overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                isIncome 
                  ? 'bg-[#21C25E]/15 text-[#169445] border-[#21C25E]/30' 
                  : 'bg-rose-100 text-rose-700 border-rose-200'
              }`}>
                {isIncome ? (
                  <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <FolderTree className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                  {isIncome ? 'Categorias de Entrada' : 'Categorias de Saída (Despesa)'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isIncome 
                    ? 'Gerencie e personalize as fontes de receita e faturamento' 
                    : 'Personalize suas categorias de gastos e tetos orçamentários'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 pt-4 pb-3 flex-shrink-0">
            <span className="text-xs font-bold text-slate-500">
              {filteredCategories.length} categorias cadastradas
            </span>

            {!isFormOpen && (
              <button
                onClick={handleOpenAdd}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                  isIncome 
                    ? 'bg-[#21C25E] hover:bg-[#1ca650] text-black shadow-[#21C25E]/20' 
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Nova Categoria de {isIncome ? 'Entrada' : 'Despesa'}</span>
              </button>
            )}
          </div>

          {/* Content Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            
            {/* Inline Add / Edit Category Form */}
            {isFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#169445]" />
                    {editingCat 
                      ? `Editar Categoria: ${editingCat.name}` 
                      : `Nova Categoria de ${isIncome ? 'Entrada' : 'Despesa'}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setIsFormOpen(false); setEditingCat(null); }}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Fechar formulário
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Nome da Categoria
                      </label>
                      <input
                        type="text"
                        placeholder={isIncome ? "Ex: Salário, Rendimentos, Bônus..." : "Ex: Mercado, Aluguel, Combustível..."}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>

                    {!isIncome && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Teto Orçamentário Mensal (R$)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="Ex: 800,00 (Opcional)"
                          value={budgetStr}
                          onChange={(e) => setBudgetStr(e.target.value.replace(/[^0-9.,]/g, ''))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Escolha o Ícone
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-slate-200 max-h-32 overflow-y-auto">
                      {Object.keys(CATEGORY_ICONS_MAP).map(iconKey => {
                        const isSelected = icon === iconKey;
                        return (
                          <button
                            key={iconKey}
                            type="button"
                            onClick={() => setIcon(iconKey)}
                            className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                              isSelected 
                                ? 'bg-slate-900 text-white shadow-xs scale-105' 
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                            title={iconKey}
                          >
                            {renderCategoryIcon(iconKey, 'w-4 h-4')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Cor de Identificação
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className="w-7 h-7 rounded-full transition-transform cursor-pointer relative flex items-center justify-center"
                          style={{ backgroundColor: c }}
                        >
                          {color === c && <Check className="w-4 h-4 text-white drop-shadow-sm stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setIsFormOpen(false); setEditingCat(null); }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-transform hover:scale-105 ${
                        isIncome 
                          ? 'bg-[#21C25E] hover:bg-[#1ca650] text-black' 
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      {editingCat ? 'Salvar Categoria' : 'Criar Categoria'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Categories List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredCategories.map(cat => {
                // Calculate monthly expense for this category if budget set
                const totalSpentInCat = monthlyExpenses
                  .filter(e => e.categoryId === cat.id)
                  .reduce((sum, e) => sum + e.amount, 0);

                const hasBudget = Boolean(cat.monthlyBudget && cat.monthlyBudget > 0);
                const percentSpent = hasBudget ? Math.round((totalSpentInCat / cat.monthlyBudget!) * 100) : 0;

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-2.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        >
                          {renderCategoryIcon(cat.icon, 'w-4 h-4')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{cat.name}</p>
                          <span className={`text-[10px] font-semibold ${isIncome ? 'text-[#169445]' : 'text-slate-500'}`}>
                            {isIncome ? 'Receita / Entrada' : 'Despesa / Saída'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
                          title="Editar Categoria"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir Categoria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Monthly budget indicator (for expenses only) */}
                    {!isIncome && hasBudget && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                          <span className="text-slate-500">Gasto / Teto:</span>
                          <span className={percentSpent > 100 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                            {formatBRL(totalSpentInCat)} / {formatBRL(cat.monthlyBudget!)} ({percentSpent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              percentSpent > 100 
                                ? 'bg-rose-500' 
                                : percentSpent > 80 
                                  ? 'bg-amber-500' 
                                  : 'bg-[#21C25E]'
                            }`}
                            style={{ width: `${Math.min(percentSpent, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredCategories.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhuma categoria de {isIncome ? 'entrada' : 'saída'} cadastrada.
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end flex-shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Concluir
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
