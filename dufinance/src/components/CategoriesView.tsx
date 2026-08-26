import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FolderTree, 
  Plus, 
  Trash2, 
  Edit3, 
  Tag, 
  Sparkles, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Category } from '../types/finance';
import { formatBRL, renderCategoryIcon, CATEGORY_ICONS_MAP } from '../utils/formatters';

const PRESET_COLORS = [
  '#11C76F', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', 
  '#8B5CF6', '#EC4899', '#F43F5E', '#EF4444', '#F59E0B', 
  '#84CC16', '#64748B'
];

export const CategoriesView: React.FC = () => {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    monthlyExpenses,
    formattedSelectedMonth 
  } = useFinance();

  const [activeTypeTab, setActiveTypeTab] = useState<'expense' | 'income'>('expense');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#11C76F');
  const [budgetStr, setBudgetStr] = useState('');

  const filteredCategories = categories.filter(c => c.type === activeTypeTab || c.type === 'both');

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setIcon('Tag');
    setColor('#11C76F');
    setBudgetStr('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setBudgetStr(cat.monthlyBudget ? String(cat.monthlyBudget) : '');
    setIsAddModalOpen(true);
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
        monthlyBudget: budget
      });
    } else {
      addCategory({
        name: name.trim(),
        type: activeTypeTab,
        icon,
        color,
        monthlyBudget: budget
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#21C25E]/15 text-[#169445] flex items-center justify-center border border-[#21C25E]/30">
            <FolderTree className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
              Gerenciador de Categorias
            </h2>
            <p className="text-xs text-slate-500">
              Personalize suas categorias, orçamentos mensais, ícones e cores com 100% de flexibilidade.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#21C25E] hover:bg-[#1ca650] text-black font-bold text-sm shadow-md shadow-[#21C25E]/20 hover:scale-[1.02] transition-all cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Criar Categoria</span>
        </button>
      </div>

      {/* Tabs Switcher: Despesas vs Receitas */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 w-fit">
        <button
          onClick={() => setActiveTypeTab('expense')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTypeTab === 'expense'
              ? 'bg-white text-rose-600 border border-slate-200/80 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Categorias de Despesas ({categories.filter(c => c.type === 'expense' || c.type === 'both').length})
        </button>

        <button
          onClick={() => setActiveTypeTab('income')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTypeTab === 'income'
              ? 'bg-white text-[#169445] border border-slate-200/80 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Categorias de Receitas ({categories.filter(c => c.type === 'income' || c.type === 'both').length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredCategories.map(cat => {
          // Calculate spend on this category in current month
          const spentThisMonth = monthlyExpenses
            .filter(t => t.categoryId === cat.id)
            .reduce((sum, t) => sum + t.amount, 0);

          const budget = cat.monthlyBudget || 0;
          const budgetPercent = budget > 0 ? Math.round((spentThisMonth / budget) * 100) : 0;
          const isOverBudget = budget > 0 && spentThisMonth > budget;

          return (
            <motion.div
              key={cat.id}
              whileHover={{ y: -2 }}
              className="p-5 rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      {renderCategoryIcon(cat.icon, 'w-5 h-5')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                      {cat.isCustom && (
                        <span className="text-[10px] text-[#169445] font-bold">Personalizada</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Editar Categoria"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {cat.isCustom && (
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir a categoria "${cat.name}"?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Excluir Categoria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expense details & budget progress */}
                {cat.type === 'expense' && (
                  <div className="pt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Gasto em {formattedSelectedMonth}:</span>
                      <span className="font-bold text-slate-900 font-mono">{formatBRL(spentThisMonth)}</span>
                    </div>

                    {budget > 0 ? (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Teto mensal: {formatBRL(budget)}</span>
                          <span className={`font-bold font-mono ${isOverBudget ? 'text-rose-600' : 'text-[#169445]'}`}>
                            {budgetPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isOverBudget ? 'bg-rose-500' : budgetPercent > 80 ? 'bg-amber-400' : 'bg-[#21C25E]'
                            }`}
                            style={{ width: `${Math.min(100, budgetPercent)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic pt-1">Sem limite mensal definido</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[28px] p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingCat ? 'Editar Categoria' : 'Criar Nova Categoria'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome da Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Investimentos, Cripto, Academia..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cor de Destaque</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ícone Representativo</label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {Object.keys(CATEGORY_ICONS_MAP).map(iconKey => {
                    const isSel = icon === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setIcon(iconKey)}
                        className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isSel ? 'bg-[#21C25E] text-black shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        {renderCategoryIcon(iconKey, 'w-5 h-5')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly budget target (optional) */}
              {activeTypeTab === 'expense' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Orçamento / Teto Mensal Desejado (R$ - Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 800"
                    value={budgetStr}
                    onChange={(e) => setBudgetStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#21C25E] rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#21C25E] hover:bg-[#1ca650] text-black text-xs font-bold shadow-xs cursor-pointer"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
