import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FinancialTarget {
  id: string;
  name: string;
  type: "floor" | "milestone";
  amount: number;
  currencyCode: string;
  targetMonth?: string; // YYYY-MM, only for milestone
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
  addTarget: (t: Omit<FinancialTarget, "id">) => void;
  updateTarget: (id: string, data: Partial<FinancialTarget>) => void;
  removeTarget: (id: string) => void;
  addEvent: (e: Omit<PlannedEvent, "id">) => void;
  removeEvent: (id: string) => void;
}

export const useTargetStore = create<TargetStore>()(
  persist(
    (set, get) => ({
      targets: [],
      events: [],

      addTarget: (t) =>
        set({ targets: [...get().targets, { ...t, id: `tgt-${Date.now()}` }] }),

      updateTarget: (id, data) =>
        set({ targets: get().targets.map((t) => (t.id === id ? { ...t, ...data } : t)) }),

      removeTarget: (id) =>
        set({ targets: get().targets.filter((t) => t.id !== id) }),

      addEvent: (e) =>
        set({ events: [...get().events, { ...e, id: `evt-${Date.now()}` }] }),

      removeEvent: (id) =>
        set({ events: get().events.filter((e) => e.id !== id) }),
    }),
    { name: "kakeibo-targets" }
  )
);
