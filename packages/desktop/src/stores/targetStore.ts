import { create } from "zustand";
import { api } from "../lib/api";

export interface FinancialTarget {
  id: string;
  name: string;
  type: "floor" | "milestone";
  amount: number;
  currencyCode: string;
  targetMonth?: string | null; // YYYY-MM, only for milestone
}

export interface PlannedEvent {
  id: string;
  name: string;
  amount: number; // positive = income, negative = expense
  currencyCode: string;
  month: string; // YYYY-MM
}

interface TargetStore {
  targets: FinancialTarget[];
  events: PlannedEvent[];
  loading: boolean;
  fetchTargets: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  addTarget: (t: Omit<FinancialTarget, "id">) => Promise<void>;
  updateTarget: (id: string, data: Partial<FinancialTarget>) => Promise<void>;
  removeTarget: (id: string) => Promise<void>;
  addEvent: (e: Omit<PlannedEvent, "id">) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
}

export const useTargetStore = create<TargetStore>((set, get) => ({
  targets: [],
  events: [],
  loading: false,

  fetchTargets: async () => {
    const data = await api.targets.list();
    set({ targets: data as FinancialTarget[] });
  },

  fetchEvents: async () => {
    const data = await api.plannedEvents.list();
    set({ events: data as PlannedEvent[] });
  },

  addTarget: async (t) => {
    await api.targets.create(t);
    await get().fetchTargets();
  },

  updateTarget: async (id, data) => {
    await api.targets.update(id, data);
    await get().fetchTargets();
  },

  removeTarget: async (id) => {
    await api.targets.delete(id);
    await get().fetchTargets();
  },

  addEvent: async (e) => {
    await api.plannedEvents.create(e);
    await get().fetchEvents();
  },

  removeEvent: async (id) => {
    await api.plannedEvents.delete(id);
    await get().fetchEvents();
  },
}));
