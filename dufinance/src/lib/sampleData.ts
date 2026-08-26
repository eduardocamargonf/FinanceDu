import { Category, Account, Transaction, FinancialGoal } from '../types/finance';
import { format, addMonths, subMonths, setDate } from 'date-fns';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: 'cat-alimentacao', name: 'Alimentação & Mercado', type: 'expense', icon: 'Utensils', color: '#F59E0B', monthlyBudget: 1500 },
  { id: 'cat-moradia', name: 'Moradia & Contas', type: 'expense', icon: 'Home', color: '#6366F1', monthlyBudget: 2200 },
  { id: 'cat-transporte', name: 'Transporte & Combustível', type: 'expense', icon: 'Car', color: '#3B82F6', monthlyBudget: 800 },
  { id: 'cat-lazer', name: 'Lazer & Restaurantes', type: 'expense', icon: 'Smile', color: '#EC4899', monthlyBudget: 700 },
  { id: 'cat-saude', name: 'Saúde & Farmácia', type: 'expense', icon: 'HeartPulse', color: '#EF4444', monthlyBudget: 500 },
  { id: 'cat-educacao', name: 'Educação & Cursos', type: 'expense', icon: 'GraduationCap', color: '#8B5CF6', monthlyBudget: 400 },
  { id: 'cat-compras', name: 'Compras & Vestuário', type: 'expense', icon: 'ShoppingBag', color: '#10B981', monthlyBudget: 900 },
  { id: 'cat-assinaturas', name: 'Assinaturas & Serviços', type: 'expense', icon: 'Tv', color: '#06B6D4', monthlyBudget: 250 },
  { id: 'cat-outros-gastos', name: 'Outros Gastos', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', monthlyBudget: 300 },
  
  // Income categories
  { id: 'cat-salario', name: 'Salário Principal', type: 'income', icon: 'Briefcase', color: '#11C76F' },
  { id: 'cat-freelance', name: 'Freelance & Extras', type: 'income', icon: 'Laptop', color: '#10B981' },
  { id: 'cat-rendimentos', name: 'Rendimentos & Dividendos', type: 'income', icon: 'TrendingUp', color: '#3B82F6' },
  { id: 'cat-vendas', name: 'Vendas & Desapegos', type: 'income', icon: 'Tag', color: '#F59E0B' },
  { id: 'cat-outras-receitas', name: 'Outras Entradas', type: 'income', icon: 'PlusCircle', color: '#8B5CF6' },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-picpay',
    name: 'Conta DuFinance (PicPay)',
    type: 'wallet',
    balance: 4850.70,
    color: '#11C76F',
    icon: 'Wallet',
    brand: 'picpay'
  },
  {
    id: 'acc-card-picpay',
    name: 'Cartão Du Card Black',
    type: 'credit_card',
    balance: 0,
    cardLimit: 12500,
    cardClosingDay: 5,
    cardDueDay: 15,
    cardNumberLast4: '4092',
    color: '#0F172A',
    icon: 'CreditCard',
    brand: 'picpay'
  },
  {
    id: 'acc-card-gold',
    name: 'Cartão Platinum Rewards',
    type: 'credit_card',
    balance: 0,
    cardLimit: 8000,
    cardClosingDay: 12,
    cardDueDay: 22,
    cardNumberLast4: '8831',
    color: '#F59E0B',
    icon: 'CreditCard',
    brand: 'mastercard'
  },
  {
    id: 'acc-reserva',
    name: 'Cofre Rendimento 102% CDI',
    type: 'investment',
    balance: 15420.00,
    color: '#10B981',
    icon: 'PiggyBank'
  }
];

export const DEFAULT_GOALS: FinancialGoal[] = [
  {
    id: 'goal-reserva',
    title: 'Reserva de Emergência (6 meses)',
    targetAmount: 25000,
    currentAmount: 15420,
    deadline: '2026-12-31',
    category: 'Segurança',
    icon: 'ShieldCheck',
    color: '#11C76F',
    contributions: [
      { id: 'c-res-1', amount: 5000, date: '2026-06-05', note: 'Aporte inicial da reserva', createdAt: Date.now() - 80 * 86400000 },
      { id: 'c-res-2', amount: 4000, date: '2026-07-05', note: 'Aporte mensal do salário', createdAt: Date.now() - 50 * 86400000 },
      { id: 'c-res-3', amount: 4000, date: '2026-08-05', note: 'Aporte mensal do salário', createdAt: Date.now() - 20 * 86400000 },
      { id: 'c-res-4', amount: 2420, date: '2026-08-20', note: 'Rendimento CDI + sobra de caixa', createdAt: Date.now() - 6 * 86400000 }
    ]
  },
  {
    id: 'goal-viagem',
    title: 'Viagem dos Sonhos ✈️',
    targetAmount: 8000,
    currentAmount: 5200,
    deadline: '2026-11-20',
    category: 'Lazer',
    icon: 'Plane',
    color: '#3B82F6',
    contributions: [
      { id: 'c-via-1', amount: 2000, date: '2026-06-15', note: 'Primeira parcela da viagem', createdAt: Date.now() - 70 * 86400000 },
      { id: 'c-via-2', amount: 2000, date: '2026-07-15', note: 'Economia com restaurantes', createdAt: Date.now() - 40 * 86400000 },
      { id: 'c-via-3', amount: 1200, date: '2026-08-10', note: 'Venda de itens usados', createdAt: Date.now() - 15 * 86400000 }
    ]
  },
  {
    id: 'goal-notebook',
    title: 'MacBook Pro M3 / Setup Novo',
    targetAmount: 14000,
    currentAmount: 9800,
    deadline: '2026-09-30',
    category: 'Trabalho',
    icon: 'Laptop',
    color: '#8B5CF6',
    contributions: [
      { id: 'c-not-1', amount: 4000, date: '2026-06-25', note: 'Projeto freelance front-end', createdAt: Date.now() - 60 * 86400000 },
      { id: 'c-not-2', amount: 3500, date: '2026-07-20', note: 'Consultoria técnica', createdAt: Date.now() - 35 * 86400000 },
      { id: 'c-not-3', amount: 2300, date: '2026-08-18', note: 'Bônus semestral', createdAt: Date.now() - 8 * 86400000 }
    ]
  }
];

export function generateSampleTransactions(): Transaction[] {
  const now = new Date();
  const currentMonthStr = (d: Date) => format(d, 'yyyy-MM');
  
  const cur = now;
  const next1 = addMonths(now, 1);
  const next2 = addMonths(now, 2);
  const prev1 = subMonths(now, 1);

  const t: Transaction[] = [
    // Previous Month transactions
    {
      id: 'tx-prev-1',
      description: 'Salário Mensal',
      amount: 8500.00,
      type: 'income',
      categoryId: 'cat-salario',
      categoryName: 'Salário Principal',
      categoryIcon: 'Briefcase',
      categoryColor: '#11C76F',
      date: `${currentMonthStr(prev1)}-05`,
      paymentMethod: 'pix',
      status: 'completed',
      accountId: 'acc-picpay',
      isRecurring: true,
      createdAt: Date.now() - 40 * 86400000
    },
    {
      id: 'tx-prev-2',
      description: 'Aluguel do Apartamento',
      amount: 1950.00,
      type: 'expense',
      categoryId: 'cat-moradia',
      categoryName: 'Moradia & Contas',
      categoryIcon: 'Home',
      categoryColor: '#6366F1',
      date: `${currentMonthStr(prev1)}-10`,
      paymentMethod: 'boleto',
      status: 'completed',
      accountId: 'acc-picpay',
      createdAt: Date.now() - 35 * 86400000
    },

    // Current Month Transactions (Completed & Pending)
    {
      id: 'tx-cur-1',
      description: 'Salário Mensal Depositado',
      amount: 8500.00,
      type: 'income',
      categoryId: 'cat-salario',
      categoryName: 'Salário Principal',
      categoryIcon: 'Briefcase',
      categoryColor: '#11C76F',
      date: `${currentMonthStr(cur)}-05`,
      paymentMethod: 'transfer',
      status: 'completed',
      accountId: 'acc-picpay',
      isRecurring: true,
      createdAt: Date.now() - 15 * 86400000
    },
    {
      id: 'tx-cur-2',
      description: 'Projeto Freelance Design & App',
      amount: 2400.00,
      type: 'income',
      categoryId: 'cat-freelance',
      categoryName: 'Freelance & Extras',
      categoryIcon: 'Laptop',
      categoryColor: '#10B981',
      date: `${currentMonthStr(cur)}-14`,
      paymentMethod: 'pix',
      status: 'completed',
      accountId: 'acc-picpay',
      createdAt: Date.now() - 10 * 86400000
    },
    {
      id: 'tx-cur-3',
      description: 'Consultoria Financeira B2B (A Receber)',
      amount: 1800.00,
      type: 'income',
      categoryId: 'cat-freelance',
      categoryName: 'Freelance & Extras',
      categoryIcon: 'Laptop',
      categoryColor: '#10B981',
      date: `${currentMonthStr(cur)}-28`,
      paymentMethod: 'pix',
      status: 'pending',
      accountId: 'acc-picpay',
      createdAt: Date.now() - 2 * 86400000
    },
    {
      id: 'tx-cur-4',
      description: 'Aluguel + Condomínio',
      amount: 1950.00,
      type: 'expense',
      categoryId: 'cat-moradia',
      categoryName: 'Moradia & Contas',
      categoryIcon: 'Home',
      categoryColor: '#6366F1',
      date: `${currentMonthStr(cur)}-10`,
      paymentMethod: 'boleto',
      status: 'completed',
      accountId: 'acc-picpay',
      barcode: '23793.38128 60032.891234 56000.093201 1 98450000195000',
      createdAt: Date.now() - 12 * 86400000
    },
    {
      id: 'tx-cur-5',
      description: 'Supermercado do Mês (Pão de Açúcar)',
      amount: 842.30,
      type: 'expense',
      categoryId: 'cat-alimentacao',
      categoryName: 'Alimentação & Mercado',
      categoryIcon: 'Utensils',
      categoryColor: '#F59E0B',
      date: `${currentMonthStr(cur)}-08`,
      paymentMethod: 'debit_card',
      status: 'completed',
      accountId: 'acc-picpay',
      createdAt: Date.now() - 14 * 86400000
    },
    {
      id: 'tx-cur-6',
      description: 'iPhone 16 Pro Max (Parcela 3/10)',
      amount: 749.90,
      type: 'expense',
      categoryId: 'cat-compras',
      categoryName: 'Compras & Vestuário',
      categoryIcon: 'ShoppingBag',
      categoryColor: '#10B981',
      date: `${currentMonthStr(cur)}-15`,
      paymentMethod: 'credit_card',
      status: 'completed',
      accountId: 'acc-card-picpay',
      isInstallment: true,
      currentInstallment: 3,
      totalInstallments: 10,
      installmentGroupId: 'inst-iphone-16',
      createdAt: Date.now() - 60 * 86400000
    },
    {
      id: 'tx-cur-7',
      description: 'Energia Elétrica (Enel)',
      amount: 218.40,
      type: 'expense',
      categoryId: 'cat-moradia',
      categoryName: 'Moradia & Contas',
      categoryIcon: 'Home',
      categoryColor: '#6366F1',
      date: `${currentMonthStr(cur)}-22`,
      paymentMethod: 'boleto',
      status: 'completed',
      accountId: 'acc-picpay',
      barcode: '84600.00000 21840.010203 04050.607080 1 00000000021840',
      createdAt: Date.now() - 5 * 86400000
    },
    {
      id: 'tx-cur-8',
      description: 'Internet Fibra 600MB',
      amount: 129.90,
      type: 'expense',
      categoryId: 'cat-assinaturas',
      categoryName: 'Assinaturas & Serviços',
      categoryIcon: 'Tv',
      categoryColor: '#06B6D4',
      date: `${currentMonthStr(cur)}-25`,
      paymentMethod: 'pix',
      status: 'pending',
      accountId: 'acc-picpay',
      isRecurring: true,
      createdAt: Date.now() - 1 * 86400000
    },
    {
      id: 'tx-cur-9',
      description: 'Jantar Restaurante Fogo de Chão',
      amount: 320.00,
      type: 'expense',
      categoryId: 'cat-lazer',
      categoryName: 'Lazer & Restaurantes',
      categoryIcon: 'Smile',
      categoryColor: '#EC4899',
      date: `${currentMonthStr(cur)}-16`,
      paymentMethod: 'credit_card',
      status: 'completed',
      accountId: 'acc-card-picpay',
      createdAt: Date.now() - 7 * 86400000
    },
    {
      id: 'tx-cur-10',
      description: 'Combustível Posto Shell',
      amount: 260.00,
      type: 'expense',
      categoryId: 'cat-transporte',
      categoryName: 'Transporte & Combustível',
      categoryIcon: 'Car',
      categoryColor: '#3B82F6',
      date: `${currentMonthStr(cur)}-18`,
      paymentMethod: 'pix',
      status: 'completed',
      accountId: 'acc-picpay',
      createdAt: Date.now() - 4 * 86400000
    },
    {
      id: 'tx-cur-11',
      description: 'Plano de Saúde Familiar (A Pagar)',
      amount: 480.00,
      type: 'expense',
      categoryId: 'cat-saude',
      categoryName: 'Saúde & Farmácia',
      categoryIcon: 'HeartPulse',
      categoryColor: '#EF4444',
      date: `${currentMonthStr(cur)}-30`,
      paymentMethod: 'boleto',
      status: 'pending',
      accountId: 'acc-picpay',
      barcode: '34191.79001 01043.510047 91020.150008 5 99340000048000',
      createdAt: Date.now()
    },

    // Next Month Projected Installments & Scheduled Incomes/Expenses
    {
      id: 'tx-next1-1',
      description: 'Salário Mensal Previsto',
      amount: 8500.00,
      type: 'income',
      categoryId: 'cat-salario',
      categoryName: 'Salário Principal',
      categoryIcon: 'Briefcase',
      categoryColor: '#11C76F',
      date: `${currentMonthStr(next1)}-05`,
      paymentMethod: 'transfer',
      status: 'pending',
      accountId: 'acc-picpay',
      isRecurring: true,
      createdAt: Date.now()
    },
    {
      id: 'tx-next1-2',
      description: 'Aluguel + Condomínio',
      amount: 1950.00,
      type: 'expense',
      categoryId: 'cat-moradia',
      categoryName: 'Moradia & Contas',
      categoryIcon: 'Home',
      categoryColor: '#6366F1',
      date: `${currentMonthStr(next1)}-10`,
      paymentMethod: 'boleto',
      status: 'pending',
      accountId: 'acc-picpay',
      createdAt: Date.now()
    },
    {
      id: 'tx-next1-3',
      description: 'iPhone 16 Pro Max (Parcela 4/10)',
      amount: 749.90,
      type: 'expense',
      categoryId: 'cat-compras',
      categoryName: 'Compras & Vestuário',
      categoryIcon: 'ShoppingBag',
      categoryColor: '#10B981',
      date: `${currentMonthStr(next1)}-15`,
      paymentMethod: 'credit_card',
      status: 'pending',
      accountId: 'acc-card-picpay',
      isInstallment: true,
      currentInstallment: 4,
      totalInstallments: 10,
      installmentGroupId: 'inst-iphone-16',
      createdAt: Date.now()
    },
    {
      id: 'tx-next1-4',
      description: 'Internet Fibra 600MB',
      amount: 129.90,
      type: 'expense',
      categoryId: 'cat-assinaturas',
      categoryName: 'Assinaturas & Serviços',
      categoryIcon: 'Tv',
      categoryColor: '#06B6D4',
      date: `${currentMonthStr(next1)}-25`,
      paymentMethod: 'pix',
      status: 'pending',
      accountId: 'acc-picpay',
      isRecurring: true,
      createdAt: Date.now()
    },

    // Month +2 Projected Installments
    {
      id: 'tx-next2-1',
      description: 'Salário Mensal Previsto',
      amount: 8500.00,
      type: 'income',
      categoryId: 'cat-salario',
      categoryName: 'Salário Principal',
      categoryIcon: 'Briefcase',
      categoryColor: '#11C76F',
      date: `${currentMonthStr(next2)}-05`,
      paymentMethod: 'transfer',
      status: 'pending',
      accountId: 'acc-picpay',
      isRecurring: true,
      createdAt: Date.now()
    },
    {
      id: 'tx-next2-2',
      description: 'iPhone 16 Pro Max (Parcela 5/10)',
      amount: 749.90,
      type: 'expense',
      categoryId: 'cat-compras',
      categoryName: 'Compras & Vestuário',
      categoryIcon: 'ShoppingBag',
      categoryColor: '#10B981',
      date: `${currentMonthStr(next2)}-15`,
      paymentMethod: 'credit_card',
      status: 'pending',
      accountId: 'acc-card-picpay',
      isInstallment: true,
      currentInstallment: 5,
      totalInstallments: 10,
      installmentGroupId: 'inst-iphone-16',
      createdAt: Date.now()
    },
  ];

  return t;
}
