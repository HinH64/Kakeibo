import { create } from "zustand";

interface ModalStore {
  transactionFormOpen: boolean;
  editingTransactionId: string | null;
  defaultDate: string | null;
  openTransactionForm: (transactionId?: string, defaultDate?: string) => void;
  closeTransactionForm: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  transactionFormOpen: false,
  editingTransactionId: null,
  defaultDate: null,

  openTransactionForm: (transactionId, defaultDate) => {
    set({
      transactionFormOpen: true,
      editingTransactionId: transactionId ?? null,
      defaultDate: defaultDate ?? null,
    });
  },

  closeTransactionForm: () => {
    set({ transactionFormOpen: false, editingTransactionId: null, defaultDate: null });
  },
}));
