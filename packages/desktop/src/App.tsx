import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { TransactionForm } from "./components/TransactionForm";
import { useModalStore } from "./stores/modalStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useExchangeRateStore } from "./stores/exchangeRateStore";
import { Dashboard } from "./pages/Dashboard";
import { Accounts } from "./pages/Accounts";
import { AccountDetail } from "./pages/AccountDetail";
import { Transactions } from "./pages/Transactions";
import { TransactionDetail } from "./pages/TransactionDetail";
import { Categories } from "./pages/Categories";
import { CategoryDetail } from "./pages/CategoryDetail";
import { Budgets } from "./pages/Budgets";
import { Goals } from "./pages/Goals";
import { Settings } from "./pages/Settings";
import { Calendar } from "./pages/Calendar";

export function App() {
  const { transactionFormOpen, editingTransactionId, closeTransactionForm } = useModalStore();
  const { load } = useSettingsStore();
  const { fetchRates } = useExchangeRateStore();

  useEffect(() => { load(); fetchRates(); }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/:id" element={<AccountDetail />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:id" element={<CategoryDetail />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <TransactionForm
        isOpen={transactionFormOpen}
        onClose={closeTransactionForm}
        editTransactionId={editingTransactionId}
      />
    </div>
  );
}
