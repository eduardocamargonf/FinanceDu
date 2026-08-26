import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import duMascotImg from '../assets/images/du_mascot_avatar_1787750972812.jpg';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginDemo, isLoadingAuth } = useFinance();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name || email.split('@')[0]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao realizar autenticação';
      setErrorMsg(msg);
    }
  };

  const handleQuickDemo = async () => {
    setErrorMsg(null);
    try {
      await loginDemo();
    } catch {
      setErrorMsg('Não foi possível iniciar a demonstração.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-[#21C25E] selection:text-black">
      
      {/* Ambient background glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#21C25E]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial from-[#21C25E]/5 to-transparent blur-[160px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="inline-flex items-center justify-center relative"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#169445] to-[#21C25E] flex items-center justify-center shadow-xl shadow-[#21C25E]/20 border border-[#21C25E]/40 overflow-hidden p-1">
              <img src={duMascotImg} alt="Du Mascote" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#21C25E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#21C25E] border-2 border-slate-950"></span>
            </span>
          </motion.div>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-white font-['Outfit',sans-serif]">
              Du<span className="text-[#21C25E]">Finance</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Controle financeiro inteligente, projeções futuras e assistente executivo Du.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-[28px] bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#21C25E] text-slate-950 shadow-md shadow-[#21C25E]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#21C25E] text-slate-950 shadow-md shadow-[#21C25E]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-semibold text-slate-300">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-[#21C25E] rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-[#21C25E] rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Senha
                </label>
                {mode === 'login' && (
                  <span className="text-[11px] text-[#21C25E]/80 hover:text-[#21C25E] cursor-pointer">
                    Esqueceu?
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/70 border border-slate-800 focus:border-[#21C25E] rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAuth}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#21C25E] to-emerald-400 hover:from-[#1ca650] hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#21C25E]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoadingAuth ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar no DuFinance' : 'Criar Minha Conta'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider">ou teste instantâneo</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Quick Demo Access */}
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={isLoadingAuth}
            className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#21C25E] group-hover:rotate-12 transition-transform" />
            <span>Acessar Demonstração com Dados Reais</span>
          </button>
        </motion.div>

        {/* Security footer */}
        <div className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#21C25E]" />
          <span>Ambiente Seguro • Dados Criptografados & Isolados</span>
        </div>

      </div>
    </div>
  );
};
