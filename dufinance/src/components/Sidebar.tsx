import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowDownRight, 
  ArrowUpRight, 
  CalendarRange, 
  CreditCard, 
  Target, 
  FolderTree, 
  Plus, 
  Volume2, 
  VolumeX, 
  User, 
  LogOut, 
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab } from '../types/finance';
import { motion, AnimatePresence } from 'motion/react';
import { DuMascotModal } from './DuMascotModal';
import { dopamineAudio } from '../lib/audio';
import duMascotImg from '../assets/images/du_mascot_avatar_1787750972812.jpg';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { 
    activeTab, 
    setActiveTab, 
    openTransactionModal, 
    isMuted, 
    toggleSound, 
    user, 
    logout,
    monthlyTransactions,
    goals,
    duScore
  } = useFinance();

  const [profileExpanded, setProfileExpanded] = useState(false);
  const [isDuModalOpen, setIsDuModalOpen] = useState(false);
  const [duModalTab, setDuModalTab] = useState<'chat' | 'report' | 'simulator' | 'tips'>('chat');

  const openDuAssistant = (tab: 'chat' | 'report' | 'simulator' | 'tips' = 'chat') => {
    setDuModalTab(tab);
    setIsDuModalOpen(true);
    dopamineAudio.playDuGreeting();
  };

  const incomeCount = monthlyTransactions.filter(t => t.type === 'income').length;
  const expenseCount = monthlyTransactions.filter(t => t.type === 'expense').length;

  const navItems: { 
    id: ActiveTab; 
    label: string; 
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'incomes', label: 'Entradas', icon: ArrowDownRight },
    { id: 'expenses', label: 'Saídas', icon: ArrowUpRight },
    { id: 'projection', label: 'Projeção Futura', icon: CalendarRange },
    { id: 'cards', label: 'Cartões & Boletos', icon: CreditCard },
    { id: 'goals', label: 'Metas', icon: Target },
  ];

  const handleNavClick = (id: ActiveTab) => {
    setActiveTab(id);
    onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 select-none">
      
      {/* Brand & Logo Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
        <div 
          onClick={() => handleNavClick('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#21C25E] flex items-center justify-center shadow-md shadow-[#21C25E]/30 group-hover:scale-105 transition-transform">
            <span className="text-xl font-black text-black font-['Outfit',sans-serif]">D</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
                Du<span className="text-[#21C25E]">Finance</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-[#21C25E]/15 text-[#21C25E] text-[10px] font-bold tracking-wider uppercase border border-[#21C25E]/30">
                CRM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Gestão Financeira Inteligente</p>
          </div>
        </div>

        {/* Close button for mobile drawer */}
        <button
          onClick={onClose}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
          Menu Principal
        </div>
        
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-[#21C25E] text-black shadow-xs font-black' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-black stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}

        {/* Du Mascot Interactive Mini Card in Sidebar */}
        <div className="pt-3">
          <div 
            onClick={() => openDuAssistant('chat')}
            className="group/du relative p-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-[#21C25E]/30 hover:border-[#21C25E] shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 p-0.5 border border-[#21C25E] overflow-hidden flex-shrink-0 group-hover/du:rotate-3 transition-transform">
                <img 
                  src={duMascotImg} 
                  alt="DU Mascote" 
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-['Outfit',sans-serif]">Consultor Du</span>
                  <span className="w-2 h-2 rounded-full bg-[#21C25E] animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400 truncate">Consultoria Financeira</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#21C25E] font-bold mt-0.5">
                  <MessageSquare className="w-3 h-3" />
                  <span>Falar com o Du</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: Controls & Profile */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
        
        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#21C25E]" />
            )}
            <span>Efeitos Sonoros</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isMuted ? 'bg-slate-800 text-slate-500' : 'bg-[#21C25E]/15 text-[#21C25E]'
          }`}>
            {isMuted ? 'Mudo' : 'Ativo'}
          </span>
        </button>

        {/* User Card */}
        <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-2.5">
          {user ? (
            <div>
              <div 
                onClick={() => setProfileExpanded(!profileExpanded)}
                className="flex items-center justify-between cursor-pointer hover:opacity-90"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#21C25E] to-emerald-400 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email || 'Conta Conectada'}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${profileExpanded ? 'rotate-90' : ''}`} />
              </div>

              {profileExpanded && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-1">
                  <button
                    onClick={() => {
                      setProfileExpanded(false);
                      onOpenAuth();
                      onClose();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#21C25E]" />
                    <span>Trocar de Conta</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileExpanded(false);
                      logout();
                      onClose();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#21C25E]" />
                <span className="text-xs font-semibold text-slate-300">Minha Conta</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-3 py-1 rounded-xl bg-[#21C25E] text-black text-xs font-bold hover:bg-[#1ca650] transition-colors cursor-pointer"
              >
                Entrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sidebar drawer content */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
      {/* Du Assistant Modal Dialog */}
      <DuMascotModal
        isOpen={isDuModalOpen}
        onClose={() => setIsDuModalOpen(false)}
        initialTab={duModalTab}
      />
    </>
  );
};
