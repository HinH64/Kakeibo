import { create } from "zustand";
import { api } from "../lib/api";

interface SettingsStore {
  reportingCurrency: string;
  locale: string;
  theme: string;
  firstDayOfWeek: number;
  loaded: boolean;
  load: () => Promise<void>;
  setSetting: (key: string, value: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  reportingCurrency: "TWD",
  locale: "zh-TW",
  theme: "dark",
  firstDayOfWeek: 1,
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    const [rc, loc, th, fdow] = await Promise.all([
      api.settings.get("reporting_currency"),
      api.settings.get("locale"),
      api.settings.get("theme"),
      api.settings.get("first_day_of_week"),
    ]);
    set({
      reportingCurrency: (rc as any)?.value ?? "TWD",
      locale: (loc as any)?.value ?? "zh-TW",
      theme: (th as any)?.value ?? "dark",
      firstDayOfWeek: parseInt((fdow as any)?.value ?? "1", 10),
      loaded: true,
    });
  },

  setSetting: async (key, value) => {
    await api.settings.set(key, value);
    if (key === "reporting_currency") set({ reportingCurrency: value });
    else if (key === "locale") set({ locale: value });
    else if (key === "theme") set({ theme: value });
    else if (key === "first_day_of_week") set({ firstDayOfWeek: parseInt(value, 10) });
  },
}));
