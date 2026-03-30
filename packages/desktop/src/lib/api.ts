// API abstraction layer
// In Electron: delegates to window.electronAPI (IPC)
// In browser: calls REST API server via /api/*

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

// REST API helper
async function fetchApi(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function qs(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export const api = {
  accounts: {
    list: async (opts?: { includeArchived?: boolean }) => {
      if (isElectron()) return unwrap(await window.electronAPI!.accounts.list(opts));
      return fetchApi(`/api/accounts${qs({ includeArchived: opts?.includeArchived })}`);
    },
    getById: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.accounts.getById(id));
      return fetchApi(`/api/accounts/${id}`);
    },
    create: async (data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.accounts.create(data));
      return fetchApi("/api/accounts", { method: "POST", body: JSON.stringify(data) });
    },
    update: async (id: string, data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.accounts.update(id, data));
      return fetchApi(`/api/accounts/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    archive: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.accounts.archive(id));
      return fetchApi(`/api/accounts/${id}`, { method: "DELETE" });
    },
  },

  transactions: {
    list: async (filter?: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.list(filter));
      return fetchApi(`/api/transactions${qs(filter ?? {})}`);
    },
    listWithDetails: async (filter?: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.listWithDetails(filter));
      return fetchApi(`/api/transactions/with-details${qs(filter ?? {})}`);
    },
    getWithDetails: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.getWithDetails(id));
      return fetchApi(`/api/transactions/${id}`);
    },
    create: async (data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.create(data));
      return fetchApi("/api/transactions", { method: "POST", body: JSON.stringify(data) });
    },
    update: async (id: string, data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.update(id, data));
      return fetchApi(`/api/transactions/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    delete: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.delete(id));
      return fetchApi(`/api/transactions/${id}`, { method: "DELETE" });
    },
    spendingByCategory: async (from: string, to: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.spendingByCategory(from, to));
      return fetchApi(`/api/transactions/spending-by-category${qs({ from, to })}`);
    },
    monthlyTrend: async (accountId?: string, months?: number) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.monthlyTrend(accountId, months));
      return fetchApi(`/api/transactions/monthly-trend${qs({ accountId, months })}`);
    },
    monthStats: async (from: string, to: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.transactions.monthStats(from, to));
      return fetchApi(`/api/transactions/month-stats${qs({ from, to })}`);
    },
  },

  categories: {
    list: async (opts?: { type?: "income" | "expense"; includeArchived?: boolean }) => {
      if (isElectron()) return unwrap(await window.electronAPI!.categories.list(opts));
      return fetchApi(`/api/categories${qs(opts ?? {})}`);
    },
    listAsTree: async (opts?: { type?: "income" | "expense" }) => {
      if (isElectron()) return unwrap(await window.electronAPI!.categories.listAsTree(opts));
      return fetchApi(`/api/categories/tree${qs(opts ?? {})}`);
    },
    create: async (data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.categories.create(data));
      return fetchApi("/api/categories", { method: "POST", body: JSON.stringify(data) });
    },
    update: async (id: string, data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.categories.update(id, data));
      return fetchApi(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    archive: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.categories.archive(id));
      return fetchApi(`/api/categories/${id}`, { method: "DELETE" });
    },
  },

  currencies: {
    listActive: async () => {
      if (isElectron()) return unwrap(await window.electronAPI!.currencies.listActive());
      return fetchApi("/api/currencies");
    },
    listAll: async () => {
      if (isElectron()) return unwrap(await window.electronAPI!.currencies.listAll());
      return fetchApi("/api/currencies?all=true");
    },
    getByCode: async (code: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.currencies.getByCode(code));
      return fetchApi(`/api/currencies/${code}`);
    },
    formatAmount: async (amount: number, code: string) => {
      // Client-side formatting for performance
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
      return fetchApi("/api/budgets");
    },
    getById: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.budgets.getById(id));
      return fetchApi(`/api/budgets/${id}`);
    },
    create: async (data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.budgets.create(data));
      return fetchApi("/api/budgets", { method: "POST", body: JSON.stringify(data) });
    },
    update: async (id: string, data: any) => {
      if (isElectron()) return unwrap(await window.electronAPI!.budgets.update(id, data));
      return fetchApi(`/api/budgets/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    delete: async (id: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.budgets.delete(id));
      return fetchApi(`/api/budgets/${id}`, { method: "DELETE" });
    },
  },

  targets: {
    list: async () => {
      return fetchApi("/api/targets");
    },
    create: async (data: any) => {
      return fetchApi("/api/targets", { method: "POST", body: JSON.stringify(data) });
    },
    update: async (id: string, data: any) => {
      return fetchApi(`/api/targets/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    delete: async (id: string) => {
      return fetchApi(`/api/targets/${id}`, { method: "DELETE" });
    },
  },

  plannedEvents: {
    list: async () => {
      return fetchApi("/api/planned-events");
    },
    create: async (data: any) => {
      return fetchApi("/api/planned-events", { method: "POST", body: JSON.stringify(data) });
    },
    delete: async (id: string) => {
      return fetchApi(`/api/planned-events/${id}`, { method: "DELETE" });
    },
  },

  settings: {
    get: async (key: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.settings.get(key));
      return fetchApi(`/api/settings/${key}`);
    },
    set: async (key: string, value: string) => {
      if (isElectron()) return unwrap(await window.electronAPI!.settings.set(key, value));
      return fetchApi(`/api/settings/${key}`, { method: "PUT", body: JSON.stringify({ value }) });
    },
  },
};
