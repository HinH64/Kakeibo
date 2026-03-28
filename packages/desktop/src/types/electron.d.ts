// Inline types to avoid cross-package dependency issues on Vercel
export interface Account {
  id: string;
  name: string;
  type: string;
  subtype: string | null;
  currencyCode: string;
  icon: string | null;
  color: string | null;
  initialBalance: number;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountWithBalance extends Account {
  balance: number;
  balanceInReportingCurrency?: number;
}

export interface Category {
  id: string;
  name: string;
  nameZh: string | null;
  nameJa: string | null;
  type: string;
  icon: string;
  color: string;
  parentId: string | null;
  isArchived: boolean;
  sortOrder: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  nameZh: string | null;
  nameJa: string | null;
  decimalPlaces: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: string;
  amount: number;
  categoryId: string | null;
  toAccountId: string | null;
  toAmount: number | null;
  exchangeRate: number | null;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionWithDetails extends Transaction {
  accountName: string;
  accountCurrency: string;
  categoryName?: string;
  categoryIcon?: string;
  toAccountName?: string;
  toAccountCurrency?: string;
  tagNames: string[];
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface TransactionFilter {
  accountId?: string;
  categoryId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ElectronAPI {
  platform: string;

  accounts: {
    list: (opts?: { includeArchived?: boolean }) => Promise<IpcResult<AccountWithBalance[]>>;
    getById: (id: string) => Promise<IpcResult<AccountWithBalance | undefined>>;
    create: (data: Omit<Account, "id" | "createdAt" | "updatedAt">) => Promise<IpcResult<Account>>;
    update: (id: string, data: Partial<Account>) => Promise<IpcResult<Account | undefined>>;
    archive: (id: string) => Promise<IpcResult<Account | undefined>>;
  };

  transactions: {
    list: (filter?: TransactionFilter) => Promise<IpcResult<Transaction[]>>;
    listWithDetails: (filter?: TransactionFilter) => Promise<IpcResult<TransactionWithDetails[]>>;
    getWithDetails: (id: string) => Promise<IpcResult<TransactionWithDetails | undefined>>;
    create: (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => Promise<IpcResult<Transaction>>;
    update: (id: string, data: Partial<Transaction>) => Promise<IpcResult<Transaction | undefined>>;
    delete: (id: string) => Promise<IpcResult<void>>;
    spendingByCategory: (from: string, to: string) => Promise<IpcResult<unknown[]>>;
    monthlyTrend: (accountId?: string, months?: number) => Promise<IpcResult<unknown[]>>;
    monthStats: (from: string, to: string) => Promise<IpcResult<{ income: number; expense: number }>>;
  };

  categories: {
    list: (opts?: { type?: "income" | "expense"; includeArchived?: boolean }) => Promise<IpcResult<Category[]>>;
    listAsTree: (opts?: { type?: "income" | "expense" }) => Promise<IpcResult<(Category & { children: Category[] })[]>>;
    create: (data: Omit<Category, "id">) => Promise<IpcResult<Category>>;
    update: (id: string, data: Partial<Category>) => Promise<IpcResult<Category | undefined>>;
    archive: (id: string) => Promise<IpcResult<Category | undefined>>;
  };

  currencies: {
    listActive: () => Promise<IpcResult<Currency[]>>;
    listAll: () => Promise<IpcResult<Currency[]>>;
    getByCode: (code: string) => Promise<IpcResult<Currency | undefined>>;
    toggleActive: (code: string, isActive: boolean) => Promise<IpcResult<Currency | undefined>>;
    formatAmount: (amount: number, code: string) => Promise<IpcResult<string>>;
    formatWithSymbol: (amount: number, code: string) => Promise<IpcResult<string>>;
    toSmallestUnit: (displayAmount: number, code: string) => Promise<IpcResult<number>>;
    getLatestRate: (from: string, to: string) => Promise<IpcResult<ExchangeRate | undefined>>;
    saveRate: (data: Omit<ExchangeRate, "id">) => Promise<IpcResult<ExchangeRate>>;
    convert: (amount: number, from: string, to: string) => Promise<IpcResult<number | undefined>>;
  };

  budgets: {
    list: () => Promise<IpcResult<unknown[]>>;
    getById: (id: string) => Promise<IpcResult<unknown>>;
    create: (data: any) => Promise<IpcResult<unknown>>;
    update: (id: string, data: any) => Promise<IpcResult<unknown>>;
    delete: (id: string) => Promise<IpcResult<void>>;
  };

  settings: {
    get: (key: string) => Promise<IpcResult<Setting | undefined>>;
    set: (key: string, value: string) => Promise<IpcResult<{ key: string; value: string }>>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
