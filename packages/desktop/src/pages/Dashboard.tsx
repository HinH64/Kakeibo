import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";
import { useAccountStore } from "../stores/accountStore";
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from "../stores/currencyStore";

export function Dashboard() {
  const navigate = useNavigate();
  const { accounts, fetch: fetchAccounts } = useAccountStore();
  const { transactions, spendingByCategory, fetch: fetchTransactions, fetchSpending } = useTransactionStore();
  const { formatWithSymbol, fetchAll: fetchCurrencies } = useCurrencyStore();

  useEffect(() => {
    fetchCurrencies();
    fetchAccounts();
    fetchTransactions({ limit: 5 });
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const monthEnd = now.toISOString().slice(0, 10);
    fetchSpending(monthStart, monthEnd);
  }, []);

  const assets = accounts.filter((a) => a.type === "asset" && !a.isArchived);
  const liabilities = accounts.filter((a) => a.type === "liability" && !a.isArchived);

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);

  const monthIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const monthExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-8 max-w-[900px] animate-fade-in">
      {/* Net Worth Hero */}
      <div className="glass-card glow-accent p-6 mb-8">
        <p className="text-text-tertiary text-[12px] uppercase tracking-wider mb-2">淨資產</p>
        <p className="text-[40px] font-bold text-text-primary amount-large leading-none">
          {formatWithSymbol(totalAssets - totalLiabilities, "TWD")}
        </p>
        <p className="text-text-tertiary text-[12px] mt-3">
          {accounts.filter((a) => !a.isArchived).length} 個帳戶 · 以新台幣計算
        </p>
      </div>

      {/* Month Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div
          onClick={() => navigate("/transactions?type=income")}
          className="glass-card p-5 cursor-pointer hover:bg-bg-card-hover transition-colors"
        >
          <p className="text-text-tertiary text-[11px] uppercase tracking-wider mb-1.5">收入</p>
          <p className="text-[24px] font-bold text-income amount-large">
            +{formatWithSymbol(monthIncome, "TWD").replace("NT$", "")}
          </p>
        </div>
        <div
          onClick={() => navigate("/transactions?type=expense")}
          className="glass-card p-5 cursor-pointer hover:bg-bg-card-hover transition-colors"
        >
          <p className="text-text-tertiary text-[11px] uppercase tracking-wider mb-1.5">支出</p>
          <p className="text-[24px] font-bold text-expense amount-large">
            -{formatWithSymbol(monthExpense, "TWD").replace("NT$", "")}
          </p>
        </div>
        <div
          onClick={() => navigate("/transactions")}
          className="glass-card p-5 cursor-pointer hover:bg-bg-card-hover transition-colors"
        >
          <p className="text-text-tertiary text-[11px] uppercase tracking-wider mb-1.5">結餘</p>
          <p className="text-[24px] font-bold text-text-primary amount-large">
            {monthIncome - monthExpense >= 0 ? "+" : ""}{formatWithSymbol(monthIncome - monthExpense, "TWD").replace("NT$", "")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Accounts + Spending */}
        <div className="col-span-3 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-medium text-text-secondary">帳戶</h3>
              <button onClick={() => navigate("/accounts")} className="text-[12px] text-accent-light hover:text-accent flex items-center gap-0.5 transition-colors">
                全部 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="glass-card overflow-hidden divide-y divide-border">
              {accounts.filter((a) => !a.isArchived).length === 0 ? (
                <p className="py-8 text-center text-[13px] text-text-muted">尚未建立帳戶</p>
              ) : (
                accounts.filter((a) => !a.isArchived).map((acc) => (
                  <div key={acc.id} onClick={() => navigate(`/accounts/${acc.id}`)} className="flex items-center justify-between py-3.5 px-4 hover:bg-bg-card-hover transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center">
                        <span className="text-[13px] text-text-secondary font-medium">{acc.currencyCode.slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-[13px] text-text-primary font-medium">{acc.name}</p>
                        <p className="text-[11px] text-text-tertiary">{acc.currencyCode}</p>
                      </div>
                    </div>
                    <p className="text-[15px] font-semibold text-text-primary amount-large">
                      {formatWithSymbol(acc.balance, acc.currencyCode)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Spending by category */}
          <section>
            <h3 className="text-[13px] font-medium text-text-secondary mb-3">本月支出</h3>
            <div className="glass-card p-4 space-y-4">
              {spendingByCategory.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-text-muted">本月尚無支出</p>
              ) : (
                spendingByCategory.map((cat) => {
                  const maxTotal = spendingByCategory[0]?.total ?? 1;
                  return (
                    <div key={cat.categoryId} onClick={() => navigate(`/categories/${cat.categoryId}`)} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                      <CategoryIcon iconId={cat.categoryIcon} color={cat.categoryColor} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[12px] text-text-secondary">{cat.categoryName}</span>
                          <span className="text-[12px] font-medium text-text-primary amount-large">
                            {formatWithSymbol(cat.total, "TWD")}
                          </span>
                        </div>
                        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(cat.total / maxTotal) * 100}%`, backgroundColor: cat.categoryColor, opacity: 0.7 }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Right: Recent */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-text-secondary">近期交易</h3>
            <button onClick={() => navigate("/transactions")} className="text-[12px] text-accent-light hover:text-accent flex items-center gap-0.5 transition-colors">
              全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="glass-card overflow-hidden divide-y divide-border">
            {transactions.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-text-muted">尚無交易紀錄</p>
            ) : (
              transactions.slice(0, 5).map((txn) => (
                <div key={txn.id} onClick={() => navigate(`/transactions/${txn.id}`)} className="flex items-center justify-between py-3 px-4 hover:bg-bg-card-hover transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon iconId={txn.categoryIcon ?? "other-expense"} color="#7a756b" size="sm" />
                    <div>
                      <p className="text-[13px] text-text-primary">{txn.note || txn.categoryName || "交易"}</p>
                      <p className="text-[11px] text-text-tertiary">{txn.categoryName} · {txn.date}</p>
                    </div>
                  </div>
                  <p className={`text-[13px] font-medium amount-large ${txn.type === "income" ? "text-income" : "text-text-primary"}`}>
                    {txn.type === "income" ? "+" : txn.type === "expense" ? "-" : ""}
                    {formatWithSymbol(txn.amount, txn.accountCurrency)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
