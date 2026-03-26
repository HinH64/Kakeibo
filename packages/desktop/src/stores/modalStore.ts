import { create } from "zustand";

interface ModalStore {
  transactionFormOpen: boolean;
  editingTransactionId: string | null;
  openTransactionForm: (transactionId?: string) => void;
  closeTransactionForm: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  transactionFormOpen: false,
  editingTransactionId: null,

  openTransactionForm: (transactionId) => {
    set({ transactionFormOpen: true, editingTransactionId: transactionId ?? null });
  },

  closeTransactionForm: () => {
    set({ transactionFormOpen: false, editingTransactionId: null });
  },
}));
