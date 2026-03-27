import { create } from "zustand";
import { api } from "../lib/api";

export interface Budget {
  id: string;
  categoryId: string;
  currencyCode: string;
  amount: number;
  period: string;
  startDate: string;
  isActive: boolean;
}

interface BudgetStore {
  budgets: Budget[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (data: Omit<Budget, "id">) => Promise<void>;
  update: (id: string, data: Partial<Budget>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  budgets: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const budgets = await api.budgets.list();
    set({ budgets: budgets ?? [], loading: false });
  },

  create: async (data) => {
    const b = await api.budgets.create(data);
    if (b) set({ budgets: [...get().budgets, b] });
  },

  update: async (id, data) => {
    await api.budgets.update(id, data);
    set({ budgets: get().budgets.map((b) => b.id === id ? { ...b, ...data } : b) });
  },

  remove: async (id) => {
    await api.budgets.delete(id);
    set({ budgets: get().budgets.filter((b) => b.id !== id) });
  },
}));
