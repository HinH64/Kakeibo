import { create } from "zustand";

// Rates are expressed as "units of currency per 1 USD"
// e.g. rates["EUR"] = 0.92 means 1 USD = 0.92 EUR
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.93,
  GBP: 0.79,
  JPY: 151.0,
  TWD: 32.8,
  HKD: 7.82,
  SGD: 1.35,
  AUD: 1.55,
  CNY: 7.25,
  KRW: 1340.0,
};

const CACHE_KEY = "kakeibo_fx_rates";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface RatesCache {
  rates: Record<string, number>;
  fetchedAt: number;
}

function loadCache(): RatesCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: RatesCache = JSON.parse(raw);
    if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) return null;
    return cache;
  } catch {
    return null;
  }
}

function saveCache(rates: Record<string, number>) {
  try {
    const cache: RatesCache = { rates, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

interface ExchangeRateStore {
  rates: Record<string, number>;
  loading: boolean;
  fetchedAt: number | null;
  fetchRates: () => Promise<void>;
  convert: (amount: number, from: string, to: string) => number;
  getRate: (from: string, to: string) => number;
}

export const useExchangeRateStore = create<ExchangeRateStore>((set, get) => ({
  rates: FALLBACK_RATES,
  loading: false,
  fetchedAt: null,

  fetchRates: async () => {
    // Use cache if fresh
    const cached = loadCache();
    if (cached) {
      set({ rates: { ...FALLBACK_RATES, ...cached.rates }, fetchedAt: cached.fetchedAt });
      return;
    }

    set({ loading: true });
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rates = json.rates as Record<string, number>;
      saveCache(rates);
      set({ rates: { ...FALLBACK_RATES, ...rates }, loading: false, fetchedAt: Date.now() });
    } catch {
      // Silently use fallback rates — don't block the UI
      set({ loading: false, fetchedAt: Date.now() });
    }
  },

  // Convert `amount` (in smallest unit) from one currency to another
  convert: (amount, from, to) => {
    if (from === to) return amount;
    const { rates } = get();
    const rateFrom = rates[from];
    const rateTo = rates[to];
    if (!rateFrom || !rateTo) return amount;
    // amount_in_to = amount_in_from * rates[to] / rates[from]
    return Math.round(amount * rateTo / rateFrom);
  },

  getRate: (from, to) => {
    if (from === to) return 1;
    const { rates } = get();
    const rateFrom = rates[from];
    const rateTo = rates[to];
    if (!rateFrom || !rateTo) return 1;
    return rateTo / rateFrom;
  },
}));
