import { create } from "zustand";
import { api } from "../lib/api";

interface TransactionDetail {
  id: string;
  type: string;
  amount: number;
  date: string;
  accountId: string;
  categoryId: string | null;
  note: string | null;
  toAccountId: string | null;
  toAmount: number | null;
  exchangeRate: number | null;
  accountName: string;
  accountCurrency: string;
  categoryName?: string;
  categoryIcon?: string;
  toAccountName?: string;
  toAccountCurrency?: string;
  tagNames: string[];
}

interface SpendingByCategory {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
}

interface TransactionFilter {
  accountId?: string;
  categoryId?: string;
  type?: "expense" | "income" | "transfer";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

interface TransactionStore {
  transactions: TransactionDetail[];
  spendingByCategory: SpendingByCategory[];
  filter: TransactionFilter;
  loading: boolean;
  fetch: (filter?: TransactionFilter) => Promise<void>;
  fetchSpending: (from: string, to: string) => Promise<void>;
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  remove: (id: string) => Promise<void>;
  setFilter: (partial: Partial<TransactionFilter>) => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  spendingByCategory: [],
  filter: {},
  loading: false,

  fetch: async (filter) => {
    set({ loading: true });
    const f = filter ?? get().filter;
    const data = await api.transactions.listWithDetails(f);
    set({ transactions: data as TransactionDetail[], filter: f, loading: false });
  },

  fetchSpending: async (from, to) => {
    const data = await api.transactions.spendingByCategory(from, to);
    set({ spendingByCategory: data as SpendingByCategory[] });
  },

  create: async (data) => {
    const result = await api.transactions.create(data);
    await get().fetch();
    return result;
  },

  update: async (id, data) => {
    const result = await api.transactions.update(id, data);
    await get().fetch();
    return result;
  },

  remove: async (id) => {
    await api.transactions.delete(id);
    await get().fetch();
  },

  setFilter: (partial) => {
    const newFilter = { ...get().filter, ...partial };
    set({ filter: newFilter });
    get().fetch(newFilter);
  },
}));
