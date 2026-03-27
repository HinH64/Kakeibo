// API abstraction layer
// In Electron: delegates to window.electronAPI (IPC)
// In browser preview: returns mock/seed data

import type { IpcResult } from "../types/electron";
import { mockApi } from "./mockApi";

function isElectron(): boolean {
  return typeof window !== "undefined" && !!window.electronAPI;
}

// Unwrap IpcResult — throw on error, return data on success
async function unwrap<T>(result: IpcResult<T>): Promise<T> {
  if (!result.success) {
    throw new Error(result.error || "Unknown IPC error");
  }
  return result.data as T;
}

export const api = {
  accounts: {
    list: async (opts?: { includeArchived?: boolean }) => {
      if (isElectron()) return unwrap(await window.electronAPI!.accounts.list(opts));
      return mockApi.accounts.list(opts);
    },
    getById: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.accounts.getById(id));
      return mockApi.accounts.getById(id);
    },
    create: async (data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.accounts.create(data));
      return mockApi.accounts.create(data);
    },
    update: async (id: string, data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.accounts.update(id, data));
      return mockApi.accounts.update(id, data);
    },
    archive: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.accounts.archive(id));
      return mockApi.accounts.archive(id);
    },
  },

  transactions: {
    list: async (filter?: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.list(filter));
      return mockApi.transactions.list(filter);
    },
    listWithDetails: async (filter?: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.listWithDetails(filter));
      return mockApi.transactions.listWithDetails(filter);
    },
    getWithDetails: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.getWithDetails(id));
      return mockApi.transactions.getWithDetails(id);
    },
    create: async (data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.create(data));
      return mockApi.transactions.create(data);
    },
    update: async (id: string, data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.update(id, data));
      return mockApi.transactions.update(id, data);
    },
    delete: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.delete(id));
      return mockApi.transactions.delete(id);
    },
    spendingByCategory: async (from: string, to: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.spendingByCategory(from, to));
      return mockApi.transactions.spendingByCategory(from, to);
    },
    monthlyTrend: async (accountId?: string, months?: number) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.monthlyTrend(accountId, months));
      return mockApi.transactions.monthlyTrend(accountId, months);
    },
    monthStats: async (from: string, to: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.monthStats(from, to));
      return mockApi.transactions.monthStats(from, to);
    },
  },

  categories: {
    list: async (opts?: { type?: "income" | "expense"; includeArchived?: boolean }) => {
      if (isElectron()) return unwrap(await window.electronAPI!.categories.list(opts));
      return mockApi.categories.list(opts);
    },
    listAsTree: async (opts?: { type?: "income" | "expense" }) => {
      if (isElectron()) return unwrap(await window.electronAPI!.categories.listAsTree(opts));
      return mockApi.categories.listAsTree(opts);
    },
    create: async (data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.categories.create(data));
      return mockApi.categories.create(data);
    },
    update: async (id: string, data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.categories.update(id, data));
      return mockApi.categories.update(id, data);
    },
    archive: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.categories.archive(id));
      return mockApi.categories.archive(id);
    },
  },

  currencies: {
    listActive: async () => {
      if (isElectron()) return unwrap(await window.electronAPI!.currencies.listActive());
      return mockApi.currencies.listActive();
    },
    listAll: async () => {
      if (isElectron()) return unwrap(await window.electronAPI!.currencies.listAll());
      return mockApi.currencies.listAll();
    },
    getByCode: async (code: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.currencies.getByCode(code));
      return mockApi.currencies.getByCode(code);
    },
    formatAmount: async (amount: number, code: string) => {
      // Do formatting client-side for performance
      return mockApi.currencies.formatAmount(amount, code);
    },
    formatWithSymbol: async (amount: number, code: string) => {
      return mockApi.currencies.formatWithSymbol(amount, code);
    },
    toSmallestUnit: async (displayAmount: number, code: string) => {
      return mockApi.currencies.toSmallestUnit(displayAmount, code);
    },
  },

  budgets: {
    list: async () => {
      if (isElectron()) return unwrap(await window.electronAPI!.budgets.list());
      return mockApi.budgets.list();
    },
    getById: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.budgets.getById(id));
      return mockApi.budgets.getById(id);
    },
    create: async (data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.budgets.create(data));
      return mockApi.budgets.create(data);
    },
    update: async (id: string, data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.budgets.update(id, data));
      return mockApi.budgets.update(id, data);
    },
    delete: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.budgets.delete(id));
      return mockApi.budgets.delete(id);
    },
  },

  settings: {
    get: async (key: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.settings.get(key));
      return mockApi.settings.get(key);
    },
    set: async (key: string, value: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.settings.set(key, value));
      return mockApi.settings.set(key, value);
    },
  },
};
