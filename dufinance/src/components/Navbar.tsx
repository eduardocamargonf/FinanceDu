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
  Menu, 
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab } from '../types/finance';
import { MonthSelector } from './MonthSelector';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { 
    activeTab, 
    setActiveTab, 
    openTransactionModal, 
    isMuted, 
    toggleSound, 
    user, 
    logout 
  } = useFinance();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'incomes', label: 'Entradas', icon: ArrowDownRight },
    { id: 'expenses', label: 'Saídas', icon: ArrowUpRight },
    { id: 'projection', label: 'Projeção Futura', icon: CalendarRange },
    { id: 'cards', label: 'Cartões & Boletos', icon: CreditCard },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'categories', label: 'Categorias', icon: FolderTree },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#111111] text-white border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#21C25E] flex items-center justify-center shadow-md shadow-[#21C25E]/30 group-hover:scale-105 transition-transform">
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
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Finanças em Alta Performance</p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-[#21C25E]/15 text-[#21C25E] border border-[#21C25E]/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#21C25E]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Center: Month Selector */}
          <div className="hidden md:flex items-center">
            <MonthSelector />
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Add Button */}
            <button
              onClick={() => openTransactionModal('expense')}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#21C25E] hover:bg-[#1ca650] text-black font-bold text-xs sm:text-sm shadow-lg shadow-[#21C25E]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="font-['Outfit',sans-serif] tracking-wide">Novo Lançamento</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isMuted 
                  ? 'border-slate-800 text-slate-500 hover:text-slate-300 bg-slate-900/60'
                  : 'border-[#21C25E]/30 text-[#21C25E] bg-[#21C25E]/10 hover:bg-[#21C25E]/20'
              }`}
              title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Sons'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* User Profile / Auth */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-[#1A1A1A] border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#21C25E] to-emerald-400 flex items-center justify-center text-black text-xs font-bold">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 hidden lg:inline-block max-w-[100px] truncate">
                    {user.displayName}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                >
                  Entrar
                </button>
              )}

              {/* Profile Dropdown */}
              {profileDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#181818] border border-white/10 p-2 shadow-2xl z-50">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email || 'Modo Convidado'}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-[#21C25E]" />
                      <span>Trocar de Conta / Firebase</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden py-2.5 border-t border-white/10 flex items-center justify-center">
          <MonthSelector />
        </div>

        {/* Mobile menu expandable */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-3 border-t border-white/10 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-[#21C25E]/15 text-[#21C25E] border-l-4 border-[#21C25E]'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#21C25E]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
};

