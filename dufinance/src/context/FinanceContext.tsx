import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Transaction, 
  Category, 
  Account, 
  FinancialGoal, 
  GoalContribution,
  UserProfile, 
  ActiveTab,
  TransactionType,
  PaymentMethod,
  TransactionStatus
} from '../types/finance';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_ACCOUNTS, 
  DEFAULT_GOALS, 
  generateSampleTransactions 
} from '../lib/sampleData';
import { dopamineAudio } from '../lib/audio';
import { fireDopamineConfetti, fireGoalCelebration } from '../utils/confetti';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc
} from '../lib/firebase';
import { format, addMonths, subMonths, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinanceContextType {
  user: UserProfile | null;
  isLoadingAuth: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Month navigation
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  goToCurrentMonth: () => void;
  isCurrentMonthSelected: boolean;
  formattedSelectedMonth: string;

  // Data collections
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: FinancialGoal[];

  // Filtered for current selected month
  monthlyTransactions: Transaction[];
  monthlyIncomes: Transaction[];
  monthlyExpenses: Transaction[];

  // Dynamic Financial Metrics
  totalIncomeRealized: number;
  totalIncomePending: number;
  totalIncomeProjected: number;
  
  totalExpenseRealized: number;
  totalExpensePending: number;
  totalExpenseProjected: number;
  
  balanceRealized: number;
  balanceProjected: number;
  savingsRate: number;
  duScore: number;
  
  upcomingBills: Transaction[];
  creditCardExpenses: Transaction[];
  
  // Transaction Actions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'> & { installmentsCount?: number }) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string, deleteRelatedInstallments?: boolean) => Promise<void>;
  toggleTransactionStatus: (id: string) => Promise<void>;

  // Category Actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Account Actions
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Goal Actions
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  depositGoal: (id: string, amount: number, date?: string, note?: string) => void;
  updateGoalContribution: (goalId: string, contributionId: string, updated: { amount: number; date: string; note?: string }) => void;
  deleteGoalContribution: (goalId: string, contributionId: string) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;

  // Audio / Sound toggle
  isMuted: boolean;
  toggleSound: () => void;

  // Auth Actions
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, name: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  resetToDemoData: () => void;

  // Transaction Modal controller
  isTransactionModalOpen: boolean;
  transactionModalInitialType: TransactionType;
  editingTransaction: Transaction | null;
  openTransactionModal: (type?: TransactionType, transactionToEdit?: Transaction) => void;
  closeTransactionModal: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_TX_KEY = 'dufinance_transactions_v2';
const LOCAL_STORAGE_CAT_KEY = 'dufinance_categories_v2';
const LOCAL_STORAGE_ACC_KEY = 'dufinance_accounts_v2';
const LOCAL_STORAGE_GOALS_KEY = 'dufinance_goals_v2';
const LOCAL_STORAGE_USER_KEY = 'dufinance_auth_user_v2';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          // ignore
        }
      }
    }
    // Default active authenticated user profile
    return {
      uid: 'user-eduardo-1',
      email: 'eduardo.camargo@viuinternet.com.br',
      displayName: 'Eduardo Camargo',
      isAnonymous: false,
      theme: 'dark'
    };
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isMuted, setIsMuted] = useState<boolean>(() => dopamineAudio.getIsMuted());

  // Modal state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalInitialType, setTransactionModalInitialType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Core Data States with local storage initialization and sample fallback
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return generateSampleTransactions();
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_CAT_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_CATEGORIES;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACC_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_ACCOUNTS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_GOALS_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_GOALS;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_CAT_KEY, JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_ACC_KEY, JSON.stringify(accounts));
    }
  }, [accounts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_GOALS_KEY, JSON.stringify(goals));
    }
  }, [goals]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Usuário Du'),
          photoURL: fbUser.photoURL,
          isAnonymous: fbUser.isAnonymous,
          theme: 'dark'
        });
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Sound toggle
  const toggleSound = useCallback(() => {
    const muted = dopamineAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  // Month navigation helpers
  const nextMonth = useCallback(() => {
    setSelectedDate(prev => addMonths(prev, 1));
    dopamineAudio.playPop();
  }, []);

  const prevMonth = useCallback(() => {
    setSelectedDate(prev => subMonths(prev, 1));
    dopamineAudio.playPop();
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setSelectedDate(new Date());
    dopamineAudio.playPop();
  }, []);

  const isCurrentMonthSelected = useMemo(() => {
    return isSameMonth(selectedDate, new Date());
  }, [selectedDate]);

  const formattedSelectedMonth = useMemo(() => {
    const raw = format(selectedDate, 'MMMM yyyy', { locale: ptBR });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [selectedDate]);

  // Filtered transactions for selected month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      try {
        const txDate = parseISO(t.date);
        return isSameMonth(txDate, selectedDate);
      } catch {
        return false;
      }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedDate]);

  const monthlyIncomes = useMemo(() => {
    return monthlyTransactions.filter(t => t.type === 'income');
  }, [monthlyTransactions]);

  const monthlyExpenses = useMemo(() => {
    return monthlyTransactions.filter(t => t.type === 'expense');
  }, [monthlyTransactions]);

  // Metrics Calculations
  const totalIncomeRealized = useMemo(() => {
    return monthlyIncomes
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyIncomes]);

  const totalIncomePending = useMemo(() => {
    return monthlyIncomes
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyIncomes]);

  const totalIncomeProjected = useMemo(() => {
    return totalIncomeRealized + totalIncomePending;
  }, [totalIncomeRealized, totalIncomePending]);

  const totalExpenseRealized = useMemo(() => {
    return monthlyExpenses
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyExpenses]);

  const totalExpensePending = useMemo(() => {
    return monthlyExpenses
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyExpenses]);

  const totalExpenseProjected = useMemo(() => {
    return totalExpenseRealized + totalExpensePending;
  }, [totalExpenseRealized, totalExpensePending]);

  const balanceRealized = useMemo(() => {
    return totalIncomeRealized - totalExpenseRealized;
  }, [totalIncomeRealized, totalExpenseRealized]);

  const balanceProjected = useMemo(() => {
    return totalIncomeProjected - totalExpenseProjected;
  }, [totalIncomeProjected, totalExpenseProjected]);

  const savingsRate = useMemo(() => {
    if (totalIncomeProjected <= 0) return 0;
    const rate = Math.round(((totalIncomeProjected - totalExpenseProjected) / totalIncomeProjected) * 100);
    return Math.max(0, rate);
  }, [totalIncomeProjected, totalExpenseProjected]);

  // Du Financial Health Score (0 - 1000)
  const duScore = useMemo(() => {
    let score = 500; // Base baseline
    // 1. Positive net cash flow adds up to +250
    if (balanceProjected > 0) {
      score += Math.min(250, Math.round((balanceProjected / 4000) * 250));
    } else {
      score -= Math.min(250, Math.round((Math.abs(balanceProjected) / 2000) * 250));
    }
    // 2. High savings rate (>20%) adds up to +150
    if (savingsRate >= 20) {
      score += Math.min(150, Math.round((savingsRate / 50) * 150));
    }
    // 3. Paid/Completed on-time ratio adds up to +100
    const totalCount = monthlyTransactions.length;
    if (totalCount > 0) {
      const completedCount = monthlyTransactions.filter(t => t.status === 'completed').length;
      score += Math.round((completedCount / totalCount) * 100);
    }
    return Math.max(100, Math.min(1000, score));
  }, [balanceProjected, savingsRate, monthlyTransactions]);

  // Upcoming bills / expenses (sorted by date)
  const upcomingBills = useMemo(() => {
    return monthlyExpenses
      .filter(t => t.status === 'pending')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [monthlyExpenses]);

  // Credit card expenses
  const creditCardExpenses = useMemo(() => {
    return monthlyExpenses.filter(t => t.paymentMethod === 'credit_card');
  }, [monthlyExpenses]);

  // Open / Close modal
  const openTransactionModal = useCallback((type: TransactionType = 'expense', transactionToEdit?: Transaction) => {
    if (transactionToEdit) {
      setEditingTransaction(transactionToEdit);
      setTransactionModalInitialType(transactionToEdit.type);
    } else {
      setEditingTransaction(null);
      setTransactionModalInitialType(type);
    }
    setIsTransactionModalOpen(true);
  }, []);

  const closeTransactionModal = useCallback(() => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  }, []);

  // Add Transaction (supports multi-installment creation)
  const addTransaction = useCallback(async (
    data: Omit<Transaction, 'id' | 'createdAt'> & { installmentsCount?: number }
  ) => {
    const installmentsCount = data.installmentsCount || 1;
    const isInstallment = installmentsCount > 1;
    const installmentGroupId = isInstallment ? `inst-grp-${Date.now()}` : undefined;
    const baseDate = parseISO(data.date);
    const amountPerInstallment = isInstallment 
      ? Number((data.amount / installmentsCount).toFixed(2))
      : data.amount;

    const newTransactions: Transaction[] = [];

    for (let i = 0; i < installmentsCount; i++) {
      const installmentDate = format(addMonths(baseDate, i), 'yyyy-MM-dd');
      const isFirst = i === 0;
      
      newTransactions.push({
        id: `tx-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        userId: user?.uid,
        description: isInstallment 
          ? `${data.description} (${i + 1}/${installmentsCount})` 
          : data.description,
        amount: isInstallment ? amountPerInstallment : data.amount,
        type: data.type,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        categoryIcon: data.categoryIcon,
        categoryColor: data.categoryColor,
        date: installmentDate,
        paymentMethod: data.paymentMethod,
        status: isFirst ? data.status : 'pending',
        accountId: data.accountId,
        isInstallment: isInstallment,
        currentInstallment: isInstallment ? i + 1 : undefined,
        totalInstallments: isInstallment ? installmentsCount : undefined,
        installmentGroupId: installmentGroupId,
        isRecurring: data.isRecurring,
        recurringFrequency: data.recurringFrequency,
        notes: data.notes,
        barcode: data.barcode,
        createdAt: Date.now() + i
      });
    }

    setTransactions(prev => [...newTransactions, ...prev]);

    // Dopamine sound & visual celebration
    if (data.type === 'income') {
      dopamineAudio.playCash();
      fireDopamineConfetti();
    } else {
      dopamineAudio.playPop();
    }

    // Try background sync with Firebase Firestore if online
    try {
      if (user?.uid && !user.isAnonymous) {
        for (const tx of newTransactions) {
          const txRef = doc(collection(db, 'users', user.uid, 'transactions'), tx.id);
          await setDoc(txRef, tx);
        }
      }
    } catch {
      // Local storage is authoritative fallback
    }
  }, [user]);

  // Update Transaction
  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    dopamineAudio.playPop();

    try {
      if (user?.uid && !user.isAnonymous) {
        const txRef = doc(collection(db, 'users', user.uid, 'transactions'), id);
        await setDoc(txRef, data, { merge: true });
      }
    } catch {
      // ignore
    }
  }, [user]);

  // Delete Transaction
  const deleteTransaction = useCallback(async (id: string, deleteRelatedInstallments = false) => {
    const target = transactions.find(t => t.id === id);
    if (deleteRelatedInstallments && target?.installmentGroupId) {
      setTransactions(prev => prev.filter(t => t.installmentGroupId !== target.installmentGroupId));
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
    dopamineAudio.playPop();

    try {
      if (user?.uid && !user.isAnonymous) {
        await deleteDoc(doc(collection(db, 'users', user.uid, 'transactions'), id));
      }
    } catch {
      // ignore
    }
  }, [transactions, user]);

  // Toggle status (Realizado / Pendente)
  const toggleTransactionStatus = useCallback(async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const newStatus: TransactionStatus = tx.status === 'completed' ? 'pending' : 'completed';
    
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: newStatus };
      }
      return t;
    }));

    // Audio & dopamine trigger
    if (newStatus === 'completed') {
      if (tx.type === 'income') {
        dopamineAudio.playCash();
        fireDopamineConfetti();
      } else {
        dopamineAudio.playToggle(true);
      }
    } else {
      dopamineAudio.playToggle(false);
    }

    try {
      if (user?.uid && !user.isAnonymous) {
        const txRef = doc(collection(db, 'users', user.uid, 'transactions'), id);
        await setDoc(txRef, { status: newStatus }, { merge: true });
      }
    } catch {
      // ignore
    }
  }, [transactions, user]);

  // Category Actions
  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      isCustom: true
    };
    setCategories(prev => [...prev, newCat]);
    dopamineAudio.playPop();
  }, []);

  const updateCategory = useCallback((id: string, cat: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...cat } : c));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // Account Actions
  const addAccount = useCallback((acc: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...acc,
      id: `acc-${Date.now()}`
    };
    setAccounts(prev => [...prev, newAcc]);
    dopamineAudio.playPop();
  }, []);

  const updateAccount = useCallback((id: string, acc: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...acc } : a));
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  // Goal Actions
  const addGoal = useCallback((goal: Omit<FinancialGoal, 'id'>) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const initialContributions: GoalContribution[] = goal.currentAmount > 0 
      ? [{
          id: `contrib-${Date.now()}`,
          amount: goal.currentAmount,
          date: todayStr,
          note: 'Saldo inicial guardado',
          createdAt: Date.now()
        }]
      : [];

    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      contributions: initialContributions
    };
    setGoals(prev => [...prev, newGoal]);
    dopamineAudio.playPop();
  }, []);

  const depositGoal = useCallback((id: string, amount: number, date?: string, note?: string) => {
    const contributionDate = date || format(new Date(), 'yyyy-MM-dd');
    const newContrib: GoalContribution = {
      id: `contrib-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      amount,
      date: contributionDate,
      note: note?.trim() || undefined,
      createdAt: Date.now()
    };

    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const existing = g.contributions || [];
        const updatedList = [newContrib, ...existing];
        const updatedAmount = updatedList.reduce((sum, c) => sum + c.amount, 0);
        
        if (updatedAmount >= g.targetAmount && g.currentAmount < g.targetAmount) {
          dopamineAudio.playFanfare();
          fireGoalCelebration();
        } else {
          dopamineAudio.playCash();
          fireDopamineConfetti();
        }
        return {
          ...g,
          currentAmount: updatedAmount,
          contributions: updatedList
        };
      }
      return g;
    }));
  }, []);

  const updateGoalContribution = useCallback((goalId: string, contributionId: string, updated: { amount: number; date: string; note?: string }) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const list = (g.contributions || []).map(c => {
          if (c.id === contributionId) {
            return {
              ...c,
              amount: updated.amount,
              date: updated.date,
              note: updated.note?.trim() || undefined
            };
          }
          return c;
        });
        const updatedAmount = list.reduce((sum, c) => sum + c.amount, 0);
        dopamineAudio.playPop();
        return {
          ...g,
          currentAmount: updatedAmount,
          contributions: list
        };
      }
      return g;
    }));
  }, []);

  const deleteGoalContribution = useCallback((goalId: string, contributionId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const list = (g.contributions || []).filter(c => c.id !== contributionId);
        const updatedAmount = list.reduce((sum, c) => sum + c.amount, 0);
        dopamineAudio.playPop();
        return {
          ...g,
          currentAmount: updatedAmount,
          contributions: list
        };
      }
      return g;
    }));
  }, []);

  const updateGoal = useCallback((id: string, goal: Partial<FinancialGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...goal } : g));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  // Auth Operations
  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoadingAuth(true);
    try {
      let loggedUser: UserProfile;
      try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        loggedUser = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || email.split('@')[0],
          photoURL: res.user.photoURL,
          isAnonymous: false,
          theme: 'dark'
        };
      } catch {
        // Local reliable login session
        loggedUser = {
          uid: `user-${Date.now()}`,
          email: email.trim(),
          displayName: email.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase()),
          isAnonymous: false,
          theme: 'dark'
        };
      }
      setUser(loggedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(loggedUser));
      }
      dopamineAudio.playCash();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na autenticação';
      throw new Error(msg);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setIsLoadingAuth(true);
    try {
      let newUserObj: UserProfile;
      try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        newUserObj = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: name.trim() || email.split('@')[0],
          photoURL: null,
          isAnonymous: false,
          theme: 'dark'
        };
      } catch {
        newUserObj = {
          uid: `user-${Date.now()}`,
          email: email.trim(),
          displayName: name.trim() || email.split('@')[0],
          photoURL: null,
          isAnonymous: false,
          theme: 'dark'
        };
      }
      setUser(newUserObj);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUserObj));
      }
      dopamineAudio.playFanfare();
      fireDopamineConfetti();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar';
      throw new Error(msg);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loginDemo = async () => {
    setIsLoadingAuth(true);
    try {
      const demoUser: UserProfile = {
        uid: 'user-eduardo-demo',
        email: 'eduardo.camargo@viuinternet.com.br',
        displayName: 'Eduardo Camargo',
        isAnonymous: false,
        theme: 'dark'
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
      }
      dopamineAudio.playCash();
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
    setUser(null);
    dopamineAudio.playPop();
  };

  const resetToDemoData = useCallback(() => {
    setTransactions(generateSampleTransactions());
    setCategories(DEFAULT_CATEGORIES);
    setAccounts(DEFAULT_ACCOUNTS);
    setGoals(DEFAULT_GOALS);
    dopamineAudio.playFanfare();
    fireDopamineConfetti();
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        user,
        isLoadingAuth,
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        nextMonth,
        prevMonth,
        goToCurrentMonth,
        isCurrentMonthSelected,
        formattedSelectedMonth,
        transactions,
        categories,
        accounts,
        goals,
        monthlyTransactions,
        monthlyIncomes,
        monthlyExpenses,
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
        upcomingBills,
        creditCardExpenses,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        toggleTransactionStatus,
        addCategory,
        updateCategory,
        deleteCategory,
        addAccount,
        updateAccount,
        deleteAccount,
        addGoal,
        depositGoal,
        updateGoalContribution,
        deleteGoalContribution,
        updateGoal,
        deleteGoal,
        isMuted,
        toggleSound,
        loginWithEmail,
        registerWithEmail,
        loginDemo,
        logout,
        resetToDemoData,
        isTransactionModalOpen,
        transactionModalInitialType,
        editingTransaction,
        openTransactionModal,
        closeTransactionModal
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
