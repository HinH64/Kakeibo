import { create } from "zustand";
import { api } from "../lib/api";

interface CategoryInfo {
  id: string;
  name: string;
  nameZh?: string | null;
  nameJa?: string | null;
  icon: string;
  color: string;
  type: "income" | "expense";
  sortOrder: number;
  parentId: string | null;
  isArchived: boolean;
}

interface CategoryStore {
  categories: CategoryInfo[];
  expenseCategories: CategoryInfo[];
  incomeCategories: CategoryInfo[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  archive: (id: string) => Promise<void>;
  getById: (id: string) => CategoryInfo | undefined;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  expenseCategories: [],
  incomeCategories: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const data = await api.categories.list();
    set({
      categories: data as CategoryInfo[],
      expenseCategories: (data as CategoryInfo[]).filter((c) => c.type === "expense"),
      incomeCategories: (data as CategoryInfo[]).filter((c) => c.type === "income"),
      loading: false,
    });
  },

  create: async (data) => {
    const result = await api.categories.create(data);
    await get().fetch();
    return result;
  },

  update: async (id, data) => {
    const result = await api.categories.update(id, data);
    await get().fetch();
    return result;
  },

  archive: async (id) => {
    await api.categories.archive(id);
    await get().fetch();
  },

  getById: (id) => get().categories.find((c) => c.id === id),
}));
