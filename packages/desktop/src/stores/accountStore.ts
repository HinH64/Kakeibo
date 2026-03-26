import { create } from "zustand";
import { api } from "../lib/api";

interface AccountInfo {
  id: string;
  name: string;
  currencyCode: string;
  type: string;
  subtype: string | null;
  icon: string | null;
  color: string | null;
  initialBalance: number;
  balance: number;
  sortOrder: number;
  isArchived: boolean;
}

interface AccountStore {
  accounts: AccountInfo[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  archive: (id: string) => Promise<void>;
  getById: (id: string) => AccountInfo | undefined;
}

export const useAccountStore = create<AccountStore>((set, get) => ({
  accounts: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const data = await api.accounts.list();
    set({ accounts: data as AccountInfo[], loading: false });
  },

  create: async (data) => {
    const result = await api.accounts.create(data);
    await get().fetch();
    return result;
  },

  update: async (id, data) => {
    const result = await api.accounts.update(id, data);
    await get().fetch();
    return result;
  },

  archive: async (id) => {
    await api.accounts.archive(id);
    await get().fetch();
  },

  getById: (id) => get().accounts.find((a) => a.id === id),
}));
