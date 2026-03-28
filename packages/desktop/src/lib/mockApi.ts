// Mock API for browser preview (no Electron IPC available)
// Uses in-memory arrays seeded with demo data

import type { AccountWithBalance } from "../types/electron";

// ─── Currency data (subset of seed) ──────────────────────────────────────────

const currencyData = [
  { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar", nameZh: "新台幣", nameJa: "台湾ドル", decimalPlaces: 0, isActive: true },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", nameZh: "日圓", nameJa: "日本円", decimalPlaces: 0, isActive: true },
  { code: "USD", symbol: "$", name: "US Dollar", nameZh: "美元", nameJa: "米ドル", decimalPlaces: 2, isActive: true },
  { code: "EUR", symbol: "€", name: "Euro", nameZh: "歐元", nameJa: "ユーロ", decimalPlaces: 2, isActive: true },
  { code: "GBP", symbol: "£", name: "British Pound", nameZh: "英鎊", nameJa: "英ポンド", decimalPlaces: 2, isActive: false },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", nameZh: "人民幣", nameJa: "中国元", decimalPlaces: 2, isActive: false },
  { code: "KRW", symbol: "₩", name: "South Korean Won", nameZh: "韓圜", nameJa: "韓国ウォン", decimalPlaces: 0, isActive: false },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", nameZh: "港幣", nameJa: "香港ドル", decimalPlaces: 2, isActive: false },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", nameZh: "新加坡幣", nameJa: "シンガポールドル", decimalPlaces: 2, isActive: false },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", nameZh: "澳幣", nameJa: "豪ドル", decimalPlaces: 2, isActive: false },
];

const currencyMap = new Map(currencyData.map((c) => [c.code, c]));

// ─── Category data (from seed) ───────────────────────────────────────────────

const categoryData = [
  { id: "cat-food", name: "Food & Dining", nameZh: "餐飲", nameJa: "食費", icon: "food", color: "#c27258", type: "expense" as const, sortOrder: 1, parentId: null, isArchived: false },
  { id: "cat-groceries", name: "Groceries", nameZh: "食材雜貨", nameJa: "食料品", icon: "groceries", color: "#c9944a", type: "expense" as const, sortOrder: 2, parentId: null, isArchived: false },
  { id: "cat-transport", name: "Transportation", nameZh: "交通", nameJa: "交通費", icon: "transport", color: "#6588a8", type: "expense" as const, sortOrder: 3, parentId: null, isArchived: false },
  { id: "cat-housing", name: "Housing", nameZh: "居住", nameJa: "住居費", icon: "housing", color: "#5e9a9a", type: "expense" as const, sortOrder: 4, parentId: null, isArchived: false },
  { id: "cat-utilities", name: "Utilities", nameZh: "水電瓦斯", nameJa: "光熱費", icon: "utilities", color: "#b8a44e", type: "expense" as const, sortOrder: 5, parentId: null, isArchived: false },
  { id: "cat-entertainment", name: "Entertainment", nameZh: "娛樂", nameJa: "娯楽費", icon: "entertainment", color: "#9878a8", type: "expense" as const, sortOrder: 6, parentId: null, isArchived: false },
  { id: "cat-shopping", name: "Shopping", nameZh: "購物", nameJa: "買い物", icon: "shopping", color: "#c9944a", type: "expense" as const, sortOrder: 7, parentId: null, isArchived: false },
  { id: "cat-health", name: "Health & Medical", nameZh: "醫療健康", nameJa: "医療費", icon: "health", color: "#b06880", type: "expense" as const, sortOrder: 8, parentId: null, isArchived: false },
  { id: "cat-education", name: "Education", nameZh: "教育", nameJa: "教育費", icon: "education", color: "#7a78a8", type: "expense" as const, sortOrder: 9, parentId: null, isArchived: false },
  { id: "cat-personal", name: "Personal Care", nameZh: "個人護理", nameJa: "身だしなみ", icon: "personal", color: "#b06880", type: "expense" as const, sortOrder: 10, parentId: null, isArchived: false },
  { id: "cat-clothing", name: "Clothing", nameZh: "服飾", nameJa: "衣服", icon: "clothing", color: "#9878a8", type: "expense" as const, sortOrder: 11, parentId: null, isArchived: false },
  { id: "cat-insurance", name: "Insurance", nameZh: "保險", nameJa: "保険", icon: "insurance", color: "#7a756b", type: "expense" as const, sortOrder: 12, parentId: null, isArchived: false },
  { id: "cat-gifts", name: "Gifts & Donations", nameZh: "禮物捐款", nameJa: "贈答・寄付", icon: "gifts", color: "#c9944a", type: "expense" as const, sortOrder: 13, parentId: null, isArchived: false },
  { id: "cat-travel", name: "Travel", nameZh: "旅遊", nameJa: "旅行", icon: "travel", color: "#6b9a6b", type: "expense" as const, sortOrder: 14, parentId: null, isArchived: false },
  { id: "cat-pets", name: "Pets", nameZh: "寵物", nameJa: "ペット", icon: "pets", color: "#b8a44e", type: "expense" as const, sortOrder: 15, parentId: null, isArchived: false },
  { id: "cat-subscriptions", name: "Subscriptions", nameZh: "訂閱服務", nameJa: "サブスク", icon: "subscriptions", color: "#7a78a8", type: "expense" as const, sortOrder: 16, parentId: null, isArchived: false },
  { id: "cat-other-expense", name: "Other Expense", nameZh: "其他支出", nameJa: "その他支出", icon: "other-expense", color: "#7a756b", type: "expense" as const, sortOrder: 99, parentId: null, isArchived: false },
  { id: "cat-salary", name: "Salary", nameZh: "薪資", nameJa: "給与", icon: "salary", color: "#6b9a6b", type: "income" as const, sortOrder: 1, parentId: null, isArchived: false },
  { id: "cat-freelance", name: "Freelance", nameZh: "接案收入", nameJa: "フリーランス", icon: "freelance", color: "#5e9a9a", type: "income" as const, sortOrder: 2, parentId: null, isArchived: false },
  { id: "cat-investment-income", name: "Investment", nameZh: "投資收入", nameJa: "投資収入", icon: "investment", color: "#6588a8", type: "income" as const, sortOrder: 3, parentId: null, isArchived: false },
  { id: "cat-bonus", name: "Bonus", nameZh: "獎金", nameJa: "ボーナス", icon: "bonus", color: "#9878a8", type: "income" as const, sortOrder: 4, parentId: null, isArchived: false },
  { id: "cat-refund", name: "Refund", nameZh: "退款", nameJa: "返金", icon: "refund", color: "#b8a44e", type: "income" as const, sortOrder: 5, parentId: null, isArchived: false },
  { id: "cat-other-income", name: "Other Income", nameZh: "其他收入", nameJa: "その他収入", icon: "other-income", color: "#7a756b", type: "income" as const, sortOrder: 99, parentId: null, isArchived: false },
];

// ─── Demo account data ───────────────────────────────────────────────────────

const accountData: AccountWithBalance[] = [
  { id: "acc-1", name: "台幣活存", currencyCode: "TWD", type: "asset", subtype: "checking", icon: "landmark", color: "#6588a8", initialBalance: 125800, sortOrder: 1, isArchived: false, createdAt: "2026-01-01", updatedAt: "2026-01-01", balance: 125800 },
  { id: "acc-2", name: "日圓現金", currencyCode: "JPY", type: "asset", subtype: "cash", icon: "banknote", color: "#c27258", initialBalance: 45200, sortOrder: 2, isArchived: false, createdAt: "2026-01-01", updatedAt: "2026-01-01", balance: 45200 },
  { id: "acc-3", name: "USD Checking", currencyCode: "USD", type: "asset", subtype: "checking", icon: "dollar-sign", color: "#6b9a6b", initialBalance: 235000, sortOrder: 3, isArchived: false, createdAt: "2026-01-01", updatedAt: "2026-01-01", balance: 235000 },
  { id: "acc-4", name: "EUR 旅遊基金", currencyCode: "EUR", type: "asset", subtype: "savings", icon: "euro", color: "#9878a8", initialBalance: 50000, sortOrder: 4, isArchived: false, createdAt: "2026-01-01", updatedAt: "2026-01-01", balance: 50000 },
  { id: "acc-5", name: "信用卡", currencyCode: "TWD", type: "liability", subtype: "credit_card", icon: "credit-card", color: "#c9944a", initialBalance: 0, sortOrder: 5, isArchived: false, createdAt: "2026-01-01", updatedAt: "2026-01-01", balance: 8200 },
];

// ─── Demo transaction data ───────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const dayBefore = new Date(Date.now() - 172800000).toISOString().slice(0, 10);

const transactionData: any[] = [
  { id: "txn-1", type: "expense", amount: 385, date: today, accountId: "acc-1", categoryId: "cat-food", note: "午餐 — 鼎泰豐", toAccountId: null, toAmount: null, exchangeRate: null, createdAt: today, updatedAt: today, accountName: "台幣活存", accountCurrency: "TWD", categoryName: "餐飲", categoryIcon: "food", tagNames: [] },
  { id: "txn-2", type: "expense", amount: 100, date: today, accountId: "acc-1", categoryId: "cat-transport", note: "捷運儲值", toAccountId: null, toAmount: null, exchangeRate: null, createdAt: today, updatedAt: today, accountName: "台幣活存", accountCurrency: "TWD", categoryName: "交通", categoryIcon: "transport", tagNames: [] },
  { id: "txn-3", type: "expense", amount: 35, date: today, accountId: "acc-1", categoryId: "cat-food", note: "咖啡", toAccountId: null, toAmount: null, exchangeRate: null, createdAt: today, updatedAt: today, accountName: "台幣活存", accountCurrency: "TWD", categoryName: "餐飲", categoryIcon: "food", tagNames: [] },
  { id: "txn-4", type: "income", amount: 52000, date: yesterday, accountId: "acc-1", categoryId: "cat-salary", note: "三月薪資", toAccountId: null, toAmount: null, exchangeRate: null, createdAt: yesterday, updatedAt: yesterday, accountName: "台幣活存", accountCurrency: "TWD", categoryName: "薪資", categoryIcon: "salary", tagNames: [] },
  { id: "txn-5", type: "expense", amount: 1599, date: yesterday, accountId: "acc-3", categoryId: "cat-subscriptions", note: "Netflix", toAccountId: null, toAmount: null, exchangeRate: null, createdAt: yesterday, updatedAt: yesterday, accountName: "USD Checking", accountCurrency: "USD", categoryName: "訂閱服務", categoryIcon: "subscriptions", tagNames: [] },
  { id: "txn-6", type: "transfer", amount: 10000, date: yesterday, accountId: "acc-1", categoryId: null, note: "日圓換匯", toAccountId: "acc-2", toAmount: 45200, exchangeRate: 4.52, createdAt: yesterday, updatedAt: yesterday, accountName: "台幣活存", accountCurrency: "TWD", toAccountName: "日圓現金", toAccountCurrency: "JPY", tagNames: [] },
  { id: "txn-7", type: "expense", amount: 680, date: dayBefore, accountId: "acc-1", categoryId: "cat-groceries", note: "超市採買", toAccountId: null, toAmount: null, exchangeRate: null, createdAt: dayBefore, updatedAt: dayBefore, accountName: "台幣活存", accountCurrency: "TWD", categoryName: "食材雜貨", categoryIcon: "groceries", tagNames: [] },
  { id: "txn-8", type: "expense", amount: 600, date: dayBefore, accountId: "acc-5", categoryId: "cat-entertainment", note: "電影票", toAccountId: null, toAmount: null, exchangeRate: null, createdAt: dayBefore, updatedAt: dayBefore, accountName: "信用卡", accountCurrency: "TWD", categoryName: "娛樂", categoryIcon: "entertainment", tagNames: [] },
  { id: "txn-9", type: "expense", amount: 149, date: dayBefore, accountId: "acc-5", categoryId: "cat-subscriptions", note: "Spotify", toAccountId: null, toAmount: null, exchangeRate: null, createdAt: dayBefore, updatedAt: dayBefore, accountName: "信用卡", accountCurrency: "TWD", categoryName: "訂閱服務", categoryIcon: "subscriptions", tagNames: [] },
  { id: "txn-10", type: "expense", amount: 751, date: dayBefore, accountId: "acc-1", categoryId: "cat-transport", note: "加油", toAccountId: null, toAmount: null, exchangeRate: null, createdAt: dayBefore, updatedAt: dayBefore, accountName: "台幣活存", accountCurrency: "TWD", categoryName: "交通", categoryIcon: "transport", tagNames: [] },
];

// ─── Budgets ─────────────────────────────────────────────────────────────────

const budgetData: any[] = [
  { id: "bud-1", categoryId: "cat-food", currencyCode: "TWD", amount: 8000, period: "monthly", startDate: "2026-01-01", isActive: true },
  { id: "bud-2", categoryId: "cat-transport", currencyCode: "TWD", amount: 3000, period: "monthly", startDate: "2026-01-01", isActive: true },
  { id: "bud-3", categoryId: "cat-shopping", currencyCode: "TWD", amount: 5000, period: "monthly", startDate: "2026-01-01", isActive: true },
  { id: "bud-4", categoryId: "cat-entertainment", currencyCode: "TWD", amount: 3000, period: "monthly", startDate: "2026-01-01", isActive: true },
  { id: "bud-5", categoryId: "cat-subscriptions", currencyCode: "TWD", amount: 1000, period: "monthly", startDate: "2026-01-01", isActive: true },
  { id: "bud-6", categoryId: "cat-salary", currencyCode: "TWD", amount: 55000, period: "monthly", startDate: "2026-01-01", isActive: true },
  { id: "bud-7", categoryId: "cat-freelance", currencyCode: "TWD", amount: 8000, period: "monthly", startDate: "2026-01-01", isActive: true },
];

// ─── Settings ────────────────────────────────────────────────────────────────

const settingsData: Record<string, string> = {
  reporting_currency: "TWD",
  theme: "dark",
  locale: "zh-TW",
  first_day_of_week: "1",
};

// ─── Helper: format amounts ──────────────────────────────────────────────────

function formatAmount(amount: number, code: string): string {
  const c = currencyMap.get(code);
  if (!c) return String(amount);
  const divisor = Math.pow(10, c.decimalPlaces);
  const value = amount / divisor;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: c.decimalPlaces,
    maximumFractionDigits: c.decimalPlaces,
  });
}

function formatWithSymbol(amount: number, code: string): string {
  const c = currencyMap.get(code);
  if (!c) return String(amount);
  return `${c.symbol}${formatAmount(amount, code)}`;
}

function toSmallestUnit(displayAmount: number, code: string): number {
  const c = currencyMap.get(code);
  if (!c) return Math.round(displayAmount);
  return Math.round(displayAmount * Math.pow(10, c.decimalPlaces));
}

// ─── Mock API ────────────────────────────────────────────────────────────────

let nextTxnId = 11;

export const mockApi = {
  accounts: {
    list: async (_opts?: any) => [...accountData],
    getById: async (id: string) => accountData.find((a) => a.id === id),
    create: async (data: any) => {
      const acc = { ...data, id: `acc-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), balance: data.initialBalance || 0 };
      accountData.push(acc);
      return acc;
    },
    update: async (id: string, data: any) => {
      const idx = accountData.findIndex((a) => a.id === id);
      if (idx >= 0) { Object.assign(accountData[idx], data); return accountData[idx]; }
      return undefined;
    },
    archive: async (id: string) => mockApi.accounts.update(id, { isArchived: true }),
  },

  transactions: {
    list: async (_filter?: any) => transactionData.map(({ accountName, accountCurrency, categoryName, categoryIcon, toAccountName, toAccountCurrency, tagNames, ...t }) => t),
    listWithDetails: async (_filter?: any) => [...transactionData],
    getWithDetails: async (id: string) => transactionData.find((t) => t.id === id),
    create: async (data: any) => {
      const txn = { ...data, id: `txn-${nextTxnId++}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const acc = accountData.find((a) => a.id === txn.accountId);
      const cat = categoryData.find((c) => c.id === txn.categoryId);
      const toAcc = txn.toAccountId ? accountData.find((a) => a.id === txn.toAccountId) : undefined;
      const detailed = { ...txn, accountName: acc?.name ?? "", accountCurrency: acc?.currencyCode ?? "", categoryName: cat?.nameZh, categoryIcon: cat?.icon, toAccountName: toAcc?.name, toAccountCurrency: toAcc?.currencyCode, tagNames: [] };
      transactionData.unshift(detailed);
      return txn;
    },
    update: async (id: string, data: any) => {
      const idx = transactionData.findIndex((t) => t.id === id);
      if (idx >= 0) { Object.assign(transactionData[idx], data, { updatedAt: new Date().toISOString() }); return transactionData[idx]; }
      return undefined;
    },
    delete: async (id: string) => {
      const idx = transactionData.findIndex((t) => t.id === id);
      if (idx >= 0) transactionData.splice(idx, 1);
    },
    spendingByCategory: async (_from: string, _to: string) => {
      const map = new Map<string, { categoryId: string; categoryName: string; categoryIcon: string; categoryColor: string; total: number }>();
      for (const t of transactionData) {
        if (t.type !== "expense" || !t.categoryId) continue;
        const existing = map.get(t.categoryId);
        const cat = categoryData.find((c) => c.id === t.categoryId);
        if (existing) { existing.total += t.amount; }
        else { map.set(t.categoryId, { categoryId: t.categoryId, categoryName: cat?.nameZh ?? "", categoryIcon: cat?.icon ?? "", categoryColor: cat?.color ?? "", total: t.amount }); }
      }
      return [...map.values()].sort((a, b) => b.total - a.total);
    },
    monthlyTrend: async (_accountId?: string, months: number = 6) => {
      const result: { month: string; income: number; expense: number }[] = [];
      const now = new Date();
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        let income = 0, expense = 0;
        for (const t of transactionData) {
          if (!t.date.startsWith(month)) continue;
          if (t.type === "income") income += t.amount;
          else if (t.type === "expense") expense += t.amount;
        }
        result.push({ month, income, expense });
      }
      return result;
    },
    monthStats: async (from: string, to: string) => {
      let income = 0, expense = 0;
      for (const t of transactionData) {
        if (t.date < from || t.date > to) continue;
        if (t.type === "income") income += t.amount;
        else if (t.type === "expense") expense += t.amount;
      }
      return { income, expense };
    },
  },

  categories: {
    list: async (opts?: { type?: "income" | "expense"; includeArchived?: boolean }) => {
      let result = [...categoryData];
      if (opts?.type) result = result.filter((c) => c.type === opts.type);
      if (!opts?.includeArchived) result = result.filter((c) => !c.isArchived);
      return result;
    },
    listAsTree: async (opts?: { type?: "income" | "expense" }) => {
      const all = await mockApi.categories.list(opts);
      const top = all.filter((c) => !c.parentId);
      return top.map((p) => ({ ...p, children: all.filter((c) => c.parentId === p.id) }));
    },
    create: async (data: any) => { const cat = { ...data, id: `cat-${Date.now()}` }; categoryData.push(cat); return cat; },
    update: async (id: string, data: any) => { const idx = categoryData.findIndex((c) => c.id === id); if (idx >= 0) { Object.assign(categoryData[idx], data); return categoryData[idx]; } return undefined; },
    archive: async (id: string) => mockApi.categories.update(id, { isArchived: true }),
  },

  currencies: {
    listActive: async () => currencyData.filter((c) => c.isActive),
    listAll: async () => [...currencyData],
    getByCode: async (code: string) => currencyMap.get(code),
    formatAmount: async (amount: number, code: string) => formatAmount(amount, code),
    formatWithSymbol: async (amount: number, code: string) => formatWithSymbol(amount, code),
    toSmallestUnit: async (displayAmount: number, code: string) => toSmallestUnit(displayAmount, code),
  },

  budgets: {
    list: async () => [...budgetData],
    getById: async (id: string) => budgetData.find((b) => b.id === id),
    create: async (data: any) => {
      const b = { ...data, id: `bud-${Date.now()}` };
      budgetData.push(b);
      return b;
    },
    update: async (id: string, data: any) => {
      const idx = budgetData.findIndex((b) => b.id === id);
      if (idx >= 0) { Object.assign(budgetData[idx], data); return budgetData[idx]; }
      return undefined;
    },
    delete: async (id: string) => {
      const idx = budgetData.findIndex((b) => b.id === id);
      if (idx >= 0) budgetData.splice(idx, 1);
    },
  },

  settings: {
    get: async (key: string) => settingsData[key] ? { key, value: settingsData[key] } : undefined,
    set: async (key: string, value: string) => { settingsData[key] = value; return { key, value }; },
  },
};
