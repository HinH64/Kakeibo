import { create } from "zustand";
import { api } from "../lib/api";

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  nameZh?: string;
  nameJa?: string;
  decimalPlaces: number;
  isActive?: boolean;
}

interface CurrencyStore {
  currencies: CurrencyInfo[];
  activeCurrencies: CurrencyInfo[];
  currencyMap: Map<string, CurrencyInfo>;
  loading: boolean;
  fetchAll: () => Promise<void>;
  fetchActive: () => Promise<void>;
  getCurrency: (code: string) => CurrencyInfo | undefined;
  formatAmount: (amount: number, code: string) => string;
  formatWithSymbol: (amount: number, code: string) => string;
  toSmallestUnit: (displayAmount: number, code: string) => number;
  toDisplayAmount: (amount: number, code: string) => number;
}

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  currencies: [],
  activeCurrencies: [],
  currencyMap: new Map(),
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    const data = await api.currencies.listAll();
    const map = new Map<string, CurrencyInfo>(data.map((c: any) => [c.code, c]));
    set({ currencies: data, currencyMap: map, loading: false });
  },

  fetchActive: async () => {
    set({ loading: true });
    const data = await api.currencies.listActive();
    const all = get().currencies;
    const map: Map<string, CurrencyInfo> = all.length > 0 ? get().currencyMap : new Map(data.map((c: any) => [c.code, c]));
    set({ activeCurrencies: data, currencyMap: map, loading: false });
  },

  getCurrency: (code) => get().currencyMap.get(code),

  // Client-side formatting (no IPC needed)
  formatAmount: (amount, code) => {
    const c = get().currencyMap.get(code);
    if (!c) return String(amount);
    const divisor = Math.pow(10, c.decimalPlaces);
    const value = amount / divisor;
    return value.toLocaleString(undefined, {
      minimumFractionDigits: c.decimalPlaces,
      maximumFractionDigits: c.decimalPlaces,
    });
  },

  formatWithSymbol: (amount, code) => {
    const c = get().currencyMap.get(code);
    if (!c) return String(amount);
    return `${c.symbol}${get().formatAmount(amount, code)}`;
  },

  toSmallestUnit: (displayAmount, code) => {
    const c = get().currencyMap.get(code);
    if (!c) return Math.round(displayAmount);
    return Math.round(displayAmount * Math.pow(10, c.decimalPlaces));
  },

  toDisplayAmount: (amount, code) => {
    const c = get().currencyMap.get(code);
    if (!c) return amount;
    return amount / Math.pow(10, c.decimalPlaces);
  },
}));
