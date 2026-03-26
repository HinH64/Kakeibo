import { useEffect, useState } from "react";
import { Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { useModalStore } from "../stores/modalStore";

export function Transactions() {
  const { transactions, fetch, remove, setFilter } = useTransactionStore();
  const { formatWithSymbol, fetchAll: fetchCurrencies } = useCurrencyStore();
  const { openTransactionForm } = useModalStore();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrencies();
    fetch();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    // Simple debounce via timeout
    const timeout = setTimeout(() => {
      setFilter({ search: value || undefined });
    }, 300);
    return () => clearTimeout(timeout);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId);
      setDeleteId(null);
    }
  };

  // Group transactions by date
  const groups = groupByDate(transactions);

  return (
    <div className="p-8 max-w-[700px] animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">交易紀錄</h2>
          <p className="text-text-tertiary text-[12px] mt-1">{transactions.length} 筆</p>
        </div>
        <button
          onClick={() => openTransactionForm()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-light transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新增交易
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜尋..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl glass-card text-[13px] text-text-secondary hover:bg-bg-card-hover transition-colors">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          篩選
        </button>
      </div>

      {/* List */}
      {transactions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-text-tertiary text-[14px] mb-3">尚無交易紀錄</p>
          <button
            onClick={() => openTransactionForm()}
            className="text-accent-light text-[13px] hover:text-accent transition-colors"
          >
            新增第一筆交易
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] text-text-tertiary font-medium">{g.label}</span>
                <span className={`text-[11px] amount-large ${g.net >= 0 ? "text-income" : "text-text-tertiary"}`}>
                  {g.net >= 0 ? "+" : ""}{formatWithSymbol(Math.abs(g.net), "TWD")}
                </span>
              </div>
              <div className="glass-card overflow-hidden divide-y divide-border">
                {g.items.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-bg-card-hover transition-colors cursor-pointer group"
                    onClick={() => openTransactionForm(txn.id)}
                  >
                    <div className="flex items-center gap-3">
                      <CategoryIcon iconId={txn.categoryIcon ?? "other-expense"} color="#7a756b" size="sm" />
                      <div>
                        <p className="text-[13px] text-text-primary">{txn.note || txn.categoryName || "交易"}</p>
                        <p className="text-[11px] text-text-tertiary mt-0.5">
                          {txn.categoryName ?? "轉帳"} · {txn.accountName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-[13px] font-medium amount-large ${txn.type === "income" ? "text-income" : txn.type === "transfer" ? "text-transfer" : "text-text-primary"}`}>
                        {txn.type === "income" ? "+" : txn.type === "expense" ? "-" : ""}
                        {formatWithSymbol(txn.amount, txn.accountCurrency)}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(txn.id); }}
                        className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-expense/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-expense" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="刪除交易"
        message="確定要刪除這筆交易嗎？此操作無法復原。"
        confirmLabel="刪除"
        variant="danger"
      />
    </div>
  );
}

function groupByDate(transactions: any[]) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const map = new Map<string, { label: string; items: any[]; net: number }>();

  for (const txn of transactions) {
    const dateKey = txn.date;
    if (!map.has(dateKey)) {
      let label = dateKey;
      if (dateKey === today) label = "今天";
      else if (dateKey === yesterday) label = "昨天";
      else {
        const d = new Date(dateKey);
        label = `${d.getMonth() + 1}月${d.getDate()}日`;
      }
      map.set(dateKey, { label, items: [], net: 0 });
    }
    const group = map.get(dateKey)!;
    group.items.push(txn);
    if (txn.type === "income") group.net += txn.amount;
    else if (txn.type === "expense") group.net -= txn.amount;
  }

  return [...map.values()];
}
