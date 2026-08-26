import React from 'react';
import { 
  Utensils, 
  Home, 
  Car, 
  Smile, 
  HeartPulse, 
  GraduationCap, 
  ShoppingBag, 
  Tv, 
  MoreHorizontal, 
  Briefcase, 
  Laptop, 
  TrendingUp, 
  Tag, 
  PlusCircle, 
  CreditCard, 
  Wallet, 
  PiggyBank, 
  ShieldCheck, 
  Plane, 
  DollarSign, 
  Zap,
  Building,
  Smartphone,
  Gift,
  Coffee,
  HelpCircle
} from 'lucide-react';
import { PaymentMethod, TransactionStatus } from '../types/finance';

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDateBR(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function getPaymentMethodLabel(method: PaymentMethod): { label: string; icon: string } {
  switch (method) {
    case 'pix':
      return { label: 'Pix', icon: 'Zap' };
    case 'credit_card':
      return { label: 'Cartão de Crédito', icon: 'CreditCard' };
    case 'debit_card':
      return { label: 'Cartão de Débito', icon: 'CreditCard' };
    case 'boleto':
      return { label: 'Boleto Bancário', icon: 'Barcode' };
    case 'cash':
      return { label: 'Dinheiro', icon: 'DollarSign' };
    case 'transfer':
      return { label: 'TED / Transferência', icon: 'ArrowRightLeft' };
    default:
      return { label: 'Outro', icon: 'Wallet' };
  }
}

export const CATEGORY_ICONS_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  Home,
  Car,
  Smile,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Tv,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Tag,
  PlusCircle,
  CreditCard,
  Wallet,
  PiggyBank,
  ShieldCheck,
  Plane,
  DollarSign,
  Zap,
  Building,
  Smartphone,
  Gift,
  Coffee
};

export function renderCategoryIcon(iconName: string, className = 'w-5 h-5'): React.ReactNode {
  const IconComponent = CATEGORY_ICONS_MAP[iconName] || HelpCircle;
  return React.createElement(IconComponent, { className });
}
