import { formatBRL } from './formatters';
import { Transaction, Category, FinancialGoal, Account } from '../types/finance';

export type DuPersonality = 'sincere_squirrel' | 'executive_ceo' | 'dopamine_coach';

export interface DuReport {
  title: string;
  generatedAt: string;
  overallScore: number;
  verdict: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    projectedBalance: number;
    savingsRate: number;
  };
  topCategories: { name: string; amount: number; percent: number; color: string }[];
  overBudgetCategories: { name: string; spent: number; budget: number; excess: number }[];
  pendingBills: { count: number; total: number };
  creditCardLoad: { total: number; limitTotal: number; usagePercent: number };
  strategicTips: string[];
  squirrelWisdom: string;
}

export interface DuChatMessage {
  id: string;
  sender: 'du' | 'user';
  text: string;
  timestamp: string;
  actionPayload?: {
    type: 'open_modal' | 'switch_tab' | 'confetti' | 'copy_report';
    data?: any;
    buttonLabel?: string;
  };
}

export function generateDuExecutiveReport(data: {
  monthName: string;
  incomeProjected: number;
  expenseProjected: number;
  balanceProjected: number;
  savingsRate: number;
  duScore: number;
  monthlyExpenses: Transaction[];
  categories: Category[];
  upcomingBills: Transaction[];
  accounts: Account[];
  goals: FinancialGoal[];
}): DuReport {
  const {
    monthName,
    incomeProjected,
    expenseProjected,
    balanceProjected,
    savingsRate,
    duScore,
    monthlyExpenses,
    categories,
    upcomingBills,
    accounts,
  } = data;

  // Aggregate expenses by category
  const catTotals: Record<string, number> = {};
  monthlyExpenses.forEach(t => {
    catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + t.amount;
  });

  const totalExp = expenseProjected > 0 ? expenseProjected : 1;
  const topCategories = Object.entries(catTotals)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat?.name || 'Outros',
        amount,
        percent: Math.round((amount / totalExp) * 100),
        color: cat?.color || '#10B981',
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  // Check over-budget
  const overBudgetCategories: { name: string; spent: number; budget: number; excess: number }[] = [];
  categories.forEach(cat => {
    if (cat.type === 'expense' && cat.monthlyBudget && cat.monthlyBudget > 0) {
      const spent = catTotals[cat.id] || 0;
      if (spent > cat.monthlyBudget) {
        overBudgetCategories.push({
          name: cat.name,
          spent,
          budget: cat.monthlyBudget,
          excess: spent - cat.monthlyBudget,
        });
      }
    }
  });

  // Credit cards
  const creditCards = accounts.filter(a => a.type === 'credit_card');
  const cardDebt = creditCards.reduce((sum, c) => sum + Math.abs(c.balance), 0);
  const cardLimits = creditCards.reduce((sum, c) => sum + (c.cardLimit || 0), 0);
  const usagePercent = cardLimits > 0 ? Math.round((cardDebt / cardLimits) * 100) : 0;

  // Pending bills
  const pendingTotal = upcomingBills.reduce((sum, b) => sum + b.amount, 0);

  // Strategic Tips
  const tips: string[] = [];
  if (savingsRate >= 30) {
    tips.push(`🚀 Taxa de poupança espetacular de ${savingsRate}%! Seu futuro financeiro está blindado. Aloque o excedente em Metas ou Renda Fixa.`);
  } else if (savingsRate >= 15) {
    tips.push(`🌱 Você está guardando ${savingsRate}% da renda. Boa margem! Se cortar 5% da categoria "${topCategories[0]?.name || 'Geral'}", chega nos 20%.`);
  } else if (balanceProjected > 0) {
    tips.push(`⚠️ Saldo positivo, mas taxa de poupança modesta (${savingsRate}%). Cuidado com pequenos gastos diários que viram tempestade.`);
  } else {
    tips.push(`🚨 ALERTA DE DÉFICIT: Seus gastos previstos superam suas receitas em ${formatBRL(Math.abs(balanceProjected))}. Bloqueie compras no cartão imediatamente!`);
  }

  if (overBudgetCategories.length > 0) {
    tips.push(`🛑 Você estourou o teto em ${overBudgetCategories.length} categoria(s), especialmente em ${overBudgetCategories[0].name} (excesso de ${formatBRL(overBudgetCategories[0].excess)}).`);
  }

  if (upcomingBills.length > 0) {
    tips.push(`📅 Há ${upcomingBills.length} pagamentos pendentes (${formatBRL(pendingTotal)}). Programe o débito ou Pix para evitar multas de atraso.`);
  }

  if (usagePercent > 70) {
    tips.push(`💳 Seus cartões estão com ${usagePercent}% do limite comprometido. Tente usar débito/Pix para despesas imediatas para não sufocar seu fluxo.`);
  }

  // Verdict
  let verdict = '';
  if (duScore >= 80) {
    verdict = 'Nível Esquilo Lendário! Sua gestão está impecável. As nozes estão seguras no cofre e rendendo dividendos.';
  } else if (duScore >= 60) {
    verdict = 'Boa Gestão com Oportunidades! Você tem fluxo controlado, mas pode otimizar a categoria que mais drena suas economias.';
  } else if (duScore >= 40) {
    verdict = 'Atenção Necessária! Há risco de fechar no aperto se os vencimentos do mês não forem estritamente acompanhados.';
  } else {
    verdict = 'Modo Emergência Ativado! Hora de cortar supérfluos, congelar compras parceladas e estancar o sangramento do caixa.';
  }

  return {
    title: `Diagnóstico Executivo do Du — ${monthName}`,
    generatedAt: new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    overallScore: duScore,
    verdict,
    summary: {
      totalIncome: incomeProjected,
      totalExpense: expenseProjected,
      projectedBalance: balanceProjected,
      savingsRate,
    },
    topCategories,
    overBudgetCategories,
    pendingBills: {
      count: upcomingBills.length,
      total: pendingTotal,
    },
    creditCardLoad: {
      total: cardDebt,
      limitTotal: cardLimits,
      usagePercent,
    },
    strategicTips: tips,
    squirrelWisdom: '“Um esquilo que não guarda nozes no verão, passa frio no inverno financeiro!” — Du, seu Consultor',
  };
}

export function generateDuRoast(data: {
  monthName: string;
  incomeProjected: number;
  expenseProjected: number;
  balanceProjected: number;
  monthlyExpenses: Transaction[];
  categories: Category[];
  upcomingBills: Transaction[];
}): string {
  const { balanceProjected, expenseProjected, monthlyExpenses, categories } = data;
  
  // Find largest expense
  const largestTx = [...monthlyExpenses].sort((a, b) => b.amount - a.amount)[0];
  
  // Find largest category
  const catTotals: Record<string, number> = {};
  monthlyExpenses.forEach(t => {
    catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + t.amount;
  });
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCatName = categories.find(c => c.id === sortedCats[0]?.[0])?.name || 'Geral';
  const topCatAmount = sortedCats[0]?.[1] || 0;

  if (balanceProjected < 0) {
    return `🔥 *ROAST DO DU:* Amigo(a), olhei seus números de ${data.monthName} e quase caí do galho! Você está com saldo negativo em ${formatBRL(Math.abs(balanceProjected))}! Você está gastando dinheiro como se brotasse em árvore genealógica de bilionário! Só com **${topCatName}** foram ${formatBRL(topCatAmount)}. Se você continuar assim, até minhas nozes de brinquedo vão ser penhoradas pelo banco! 🐿️💥 Guarde o cartão na gaveta agora mesmo!`;
  }

  if (largestTx && largestTx.amount > 500) {
    return `🔥 *ROAST DO DU:* Parabéns pelo saldo positivo, MAS... o que foi aquele lançamento de "${largestTx.description}" de ${formatBRL(largestTx.amount)}?! Meus bigodes de esquilo tremeram de susto! Isso compra literalmente 120 quilos de castanha-do-pará de primeira linha! Tá achando que é sócio da Faria Lima? Otimize essa categoria antes que o Du tenha que confiscar seus privilégios de compras noturnas! 🌰☕`;
  }

  return `🔥 *ROAST DO DU:* Você tá com a conta arrumadinha com saldo de ${formatBRL(balanceProjected)}, mas ainda gasta ${formatBRL(topCatAmount)} em **${topCatName}**! Eu sei que é tentador aquele cafezinho gourmet de 25 reais todo dia, mas se você investisse isso no CDI, no fim do ano dava pra comprar um bosque inteiro! Não se acomode! 🎩🧐`;
}

export function answerDuQuestion(
  question: string,
  personality: DuPersonality,
  data: {
    monthName: string;
    incomeProjected: number;
    expenseProjected: number;
    balanceProjected: number;
    savingsRate: number;
    duScore: number;
    monthlyExpenses: Transaction[];
    monthlyIncomes: Transaction[];
    categories: Category[];
    upcomingBills: Transaction[];
    goals: FinancialGoal[];
    accounts: Account[];
  }
): { text: string; actionPayload?: DuChatMessage['actionPayload'] } {
  const q = question.toLowerCase().trim();
  const {
    monthName,
    incomeProjected,
    expenseProjected,
    balanceProjected,
    savingsRate,
    duScore,
    monthlyExpenses,
    categories,
    upcomingBills,
    goals,
  } = data;

  // Cat totals
  const catTotals: Record<string, number> = {};
  monthlyExpenses.forEach(t => {
    catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + t.amount;
  });
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCatName = categories.find(c => c.id === sortedCats[0]?.[0])?.name || 'Geral';
  const topCatAmount = sortedCats[0]?.[1] || 0;

  // Personality flavor prefixes
  const isSquirrel = personality === 'sincere_squirrel';
  const isCeo = personality === 'executive_ceo';
  const isCoach = personality === 'dopamine_coach';

  // 1. Health / Overview
  if (q.includes('saúde') || q.includes('como est') || q.includes('resumo') || q.includes('geral') || q.includes('saldo')) {
    if (isSquirrel) {
      return {
        text: `🐿️ Olá! Aqui é o Du! Em ${monthName}, suas entradas estão em ${formatBRL(incomeProjected)} e os gastos em ${formatBRL(expenseProjected)}. Seu saldo previsto é de **${formatBRL(balanceProjected)}** com Score de **${duScore} pts** (${savingsRate}% de taxa de poupança)! ${balanceProjected >= 0 ? 'Minhas nozes estão seguras no seu cofre!' : 'Estamos no vermelho, socorro!'}`
      };
    } else if (isCeo) {
      return {
        text: `🎩 *Relatório Executivo DuFinance:* Em ${monthName}, nossa receita líquida projetada totaliza ${formatBRL(incomeProjected)} contra OPEX de ${formatBRL(expenseProjected)}, resultando em margem líquida de ${formatBRL(balanceProjected)} (${savingsRate}% de retenção de capital). Recomendo manter o compliance orçamentário rígido.`
      };
    } else {
      return {
        text: `🚀 *ENERGIA PURA!* Você está com ${formatBRL(incomeProjected)} de faturamento e saldo previsto de **${formatBRL(balanceProjected)}**! O Score Du está em ${duScore} pontos! Vamos quebrar a banca e fazer esse dinheiro render o dobro! 💥🎉`,
        actionPayload: { type: 'confetti', buttonLabel: 'Soltar Dopamina Confete 🎊' }
      };
    }
  }

  // 2. Where am I spending the most / Category
  if (q.includes('gastando mais') || q.includes('categoria') || q.includes('ralo') || q.includes('maior gasto')) {
    const percent = expenseProjected > 0 ? Math.round((topCatAmount / expenseProjected) * 100) : 0;
    return {
      text: `🧐 Analisei seus lançamentos: seu maior dreno financeiro neste mês é a categoria **${topCatName}**, totalizando **${formatBRL(topCatAmount)}** (${percent}% de todas as suas saídas)! ${
        topCatAmount > 800 ? 'Se você apertar esse cinto em apenas 15%, já sobram ' + formatBRL(topCatAmount * 0.15) + ' livres todo mês!' : 'Está sob relativo controle, continue monitorando.'
      }`,
      actionPayload: { type: 'switch_tab', data: 'categories', buttonLabel: 'Ver Tetos de Categorias' }
    };
  }

  // 3. How to save money / Tips
  if (q.includes('economizar') || q.includes('guardar') || q.includes('dica') || q.includes('como poupar') || q.includes('noz')) {
    return {
      text: `🌰 *O Método das Nozes de Ouro do Du:*\n1. **Corte Invisível:** Reduza 10% dos gastos em ${topCatName} (economia direta de ${formatBRL(topCatAmount * 0.1)}).\n2. **Regra dos 3 Dias:** Antes de qualquer compra acima de R$ 150, espere 72 horas para esfriar o impulso.\n3. **Pix vs Cartão:** Transfira para sua conta de investimentos no dia em que o salário cair, não o que sobrar no fim do mês!`,
      actionPayload: { type: 'switch_tab', data: 'goals', buttonLabel: 'Criar Nova Meta de Economia' }
    };
  }

  // 4. Credit Card / Boletos / Bills
  if (q.includes('cartão') || q.includes('boleto') || q.includes('vencimento') || q.includes('fatura') || q.includes('dívida')) {
    const billsTotal = upcomingBills.reduce((s, b) => s + b.amount, 0);
    return {
      text: `💳 *Radar de Obrigações do Du:*\nVocê tem **${upcomingBills.length} contas/faturas pendentes** somando **${formatBRL(billsTotal)}** em ${monthName}.\n💡 *Dica de Ouro:* Nunca pague apenas o mínimo da fatura do cartão de crédito; os juros rotativos no Brasil comem qualquer patrimônio vivo! Pague 100% no dia do vencimento.`,
      actionPayload: { type: 'switch_tab', data: 'cards', buttonLabel: 'Conferir Cartões & Faturas' }
    };
  }

  // 5. Goals / Metas
  if (q.includes('meta') || q.includes('sonho') || q.includes('reserva') || q.includes('investir')) {
    const totalGoalsSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
    const totalGoalsTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    return {
      text: `🎯 *Painel de Metas do Du:*\nVocê tem ${goals.length} metas cadastradas! Já guardou **${formatBRL(totalGoalsSaved)}** de um objetivo total de ${formatBRL(totalGoalsTarget)}.\n🌰 *Conselho do Esquilo:* Se você destinar seu saldo previsto de ${formatBRL(balanceProjected > 0 ? balanceProjected : 0)} deste mês para suas metas, vai acelerar a conquista do seu objetivo em semanas!`,
      actionPayload: { type: 'switch_tab', data: 'goals', buttonLabel: 'Acessar Painel de Metas' }
    };
  }

  // 6. Roast request
  if (q.includes('roast') || q.includes('sincero') || q.includes('bronca') || q.includes('fala a verdade')) {
    return {
      text: generateDuRoast(data)
    };
  }

  // 7. General question / Financial advice fallback
  return {
    text: `🐿️ *Du Responde:* Analisando sua situação em ${monthName}:\n- Saldo Previsto: **${formatBRL(balanceProjected)}**\n- Taxa de Poupança: **${savingsRate}%**\n- Maior Categoria: **${topCatName} (${formatBRL(topCatAmount)})**\n\nMinha recomendação executiva para sua pergunta é: priorize sempre pagar as dívidas com juros altos primeiro, construa 6 meses de reserva de emergência e depois reinvista o lucro em ativos que paguem nozes (dividendos) todo mês! Quer que eu gere um relatório completo para você?`,
    actionPayload: { type: 'open_modal', buttonLabel: 'Gerar Relatório Completo 📊' }
  };
}
