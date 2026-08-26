import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { FutureProjectionView } from './components/FutureProjectionView';
import { CardsAccountsView } from './components/CardsAccountsView';
import { GoalsView } from './components/GoalsView';
import { CategoriesView } from './components/CategoriesView';
import { TransactionModal } from './components/TransactionModal';
import { LoginPage } from './components/LoginPage';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MainContent: React.FC = () => {
  const { user, activeTab, openTransactionModal } = useFinance();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If not logged in, render the dedicated LoginPage
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left Sidebar Navigation (Desktop fixed + Mobile Drawer) */}
      <Sidebar 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onOpenAuth={() => {}}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-h-screen min-w-0 transition-all">
        
        {/* Top Header Bar */}
        <TopHeader 
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Main Content View Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'incomes' && <TransactionsView type="income" />}
              {activeTab === 'expenses' && <TransactionsView type="expense" />}
              {activeTab === 'projection' && <FutureProjectionView />}
              {activeTab === 'cards' && <CardsAccountsView />}
              {activeTab === 'goals' && <GoalsView />}
              {activeTab === 'categories' && <CategoriesView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 py-5 mt-auto bg-white/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#21C25E]" />
              <span className="font-bold text-slate-700 font-['Outfit',sans-serif]">DuFinance CRM</span>
              <span>• Gestão Financeira Inteligente</span>
            </div>
            <p>© 2026 DuFinance — Inteligência Financeira e Gestão de Fluxo.</p>
          </div>
        </footer>
      </div>

      {/* Unified Transaction Add/Edit Modal */}
      <TransactionModal />

      {/* Floating Action Button (FAB) for quick mobile adding on Incomes & Expenses */}
      {(activeTab === 'incomes' || activeTab === 'expenses') && (
        <div className="fixed bottom-6 right-6 z-30 md:hidden">
          <button
            onClick={() => openTransactionModal(activeTab === 'incomes' ? 'income' : 'expense')}
            className="w-14 h-14 rounded-full bg-[#21C25E] hover:bg-[#1ca650] text-black flex items-center justify-center shadow-2xl shadow-[#21C25E]/40 active:scale-95 transition-transform cursor-pointer"
            title={activeTab === 'incomes' ? 'Nova Entrada' : 'Nova Despesa'}
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}

