export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'pix'
  | 'credit_card'
  | 'debit_card'
  | 'boleto'
  | 'cash'
  | 'transfer';

export type TransactionStatus = 'completed' | 'pending';

export interface Transaction {
  id: string;
  userId?: string;
  description: string;
  amount: number; // in BRL, e.g. 150.50
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  status: TransactionStatus; // completed = Realizado, pending = Previsto
  accountId?: string;
  
  // Installments & Recurring
  isInstallment?: boolean;
  currentInstallment?: number;
  totalInstallments?: number;
  installmentGroupId?: string;
  
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly';
  
  notes?: string;
  barcode?: string; // for boletos
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string; // Lucide icon name
  color: string; // Hex or Tailwind color class
  monthlyBudget?: number; // Target max budget for expenses
  isCustom?: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'wallet' | 'credit_card' | 'investment';
  balance: number;
  color: string;
  icon: string;
  
  // Credit card specific fields
  cardLimit?: number;
  cardClosingDay?: number; // Day of month invoice closes (e.g. 10)
  cardDueDay?: number; // Day of month invoice is due (e.g. 18)
  cardNumberLast4?: string;
  brand?: 'mastercard' | 'visa' | 'elo' | 'picpay';
}

export interface GoalContribution {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  icon: string;
  color: string;
  contributions?: GoalContribution[];
}

export type ActiveTab = 
  | 'dashboard'
  | 'incomes'
  | 'expenses'
  | 'projection'
  | 'cards'
  | 'goals'
  | 'categories';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
  theme?: 'dark' | 'light';
  monthlyIncomeGoal?: number;
  monthlyExpenseLimit?: number;
}
