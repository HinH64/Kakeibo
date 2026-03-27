import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useTransactionStore } from "../stores/transactionStore";
import { useAccountStore } from "../stores/accountStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { useModalStore } from "../stores/modalStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useExchangeRateStore } from "../stores/exchangeRateStore";

const PAGE_SIZE = 50;

type TxnType = "expense" | "income" | "transfer";

interface ActiveFilter {
  type?: TxnType;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function Transactions() {
  const navigate = useNavigate();
  const { transactions, fetch, remove, setFilter } = useTransactionStore();
  const { accounts, fetch: fetchAccounts } = useAccountStore();
  const { formatWithSymbol, fetchAll: fetchCurrencies } = useCurrencyStore();
  const { openTransactionForm } = useModalStore();
  const { reportingCurrency } = useSettingsStore();
  const { convert } = useExchangeRateStore();

  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({});
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchCurrencies();
    fetchAccounts();
    fetch();
  }, []);

  // Reset display limit when transactions change
  useEffect(() => { setDisplayLimit(PAGE_SIZE); }, [transactions.length]);

  const handleSearch = (value: string) => {
    setSearch(value);
    const timeout = setTimeout(() => {
      applyFilters({ search: value || undefined });
    }, 300);
    return () => clearTimeout(timeout);
  };

  const applyFilters = (extra: Record<string, any> = {}) => {
    const filter: Record<string, any> = { ...activeFilter, ...extra };
    if (search && !("search" in extra)) filter.search = search;
    setFilter(filter);
  };

  const setTypeFilter = (type: TxnType | undefined) => {
    const next = { ...activeFilter, type };
    if (!type) delete next.type;
    setActiveFilter(next);
    setFilter({ ...next, search: search || undefined });
  };

  const setAccountFilter = (accountId: string | undefined) => {
    const next = { ...activeFilter, accountId };
    if (!accountId) delete next.accountId;
    setActiveFilter(next);
    setFilter({ ...next, search: search || undefined });
  };

  const setDateFrom = (dateFrom: string) => {
    const next = { ...activeFilter, dateFrom: dateFrom || undefined };
    if (!dateFrom) delete next.dateFrom;
    setActiveFilter(next);
    setFilter({ ...next, search: search || undefined });
  };

  const setDateTo = (dateTo: string) => {
    const next = { ...activeFilter, dateTo: dateTo || undefined };
    if (!dateTo) delete next.dateTo;
    setActiveFilter(next);
    setFilter({ ...next, search: search || undefined });
  };

  const clearFilters = () => {
    setActiveFilter({});
    setFilter({ search: search || undefined });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId);
      setDeleteId(null);
    }
  };

  const activeFilterCount = Object.keys(activeFilter).length;
  const displayedTxns = transactions.slice(0, displayLimit);
  const hasMore = transactions.length > displayLimit;
  const groups = groupByDate(displayedTxns);

  const TYPE_OPTIONS: { value: TxnType; label: string }[] = [
    { value: "expense", label: "支出" },
    { value: "income", label: "收入" },
    { value: "transfer", label: "轉帳" },
  ];

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

      {/* Search + Filter */}
      <div className="flex items-center gap-2 mb-3">
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
        <button
          onClick={() => setFilterOpen((v) => !v)}
          className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] transition-colors ${
            filterOpen || activeFilterCount > 0
              ? "bg-accent/15 text-accent-light border border-accent/30"
              : "glass-card text-text-secondary hover:bg-bg-card-hover"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          篩選
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="glass-card p-4 mb-4 space-y-4">
          {/* Type */}
          <div>
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">類型</p>
            <div className="flex gap-1.5">
              {TYPE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setTypeFilter(activeFilter.type === o.value ? undefined : o.value)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                    activeFilter.type === o.value
                      ? "bg-accent text-white"
                      : "bg-bg-elevated text-text-secondary hover:bg-bg-card-hover"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">帳戶</p>
            <select
              value={activeFilter.accountId ?? ""}
              onChange={(e) => setAccountFilter(e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-[13px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
            >
              <option value="">全部帳戶</option>
              {accounts.filter((a) => !a.isArchived).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div>
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">日期範圍</p>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={activeFilter.dateFrom ?? ""}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-bg-input border border-border text-[13px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
              />
              <span className="text-text-muted text-[12px]">到</span>
              <input
                type="date"
                value={activeFilter.dateTo ?? ""}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-bg-input border border-border text-[13px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
          </div>

          {/* Clear */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              清除篩選
            </button>
          )}
        </div>
      )}

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
                  {g.net >= 0 ? "+" : ""}{formatWithSymbol(Math.abs(g.net), reportingCurrency)}
                </span>
              </div>
              <div className="glass-card overflow-hidden divide-y divide-border">
                {g.items.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-bg-card-hover transition-colors cursor-pointer group"
                    onClick={() => navigate(`/transactions/${txn.id}`)}
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
                      <div className="text-right">
                        <p className={`text-[13px] font-medium amount-large ${txn.type === "income" ? "text-income" : txn.type === "transfer" ? "text-transfer" : "text-text-primary"}`}>
                          {txn.type === "income" ? "+" : txn.type === "expense" ? "-" : ""}
                          {formatWithSymbol(txn.amount, txn.accountCurrency)}
                        </p>
                        {txn.accountCurrency !== reportingCurrency && txn.type !== "transfer" && (
                          <p className="text-[11px] text-text-tertiary">
                            ≈ {formatWithSymbol(convert(txn.amount, txn.accountCurrency, reportingCurrency), reportingCurrency)}
                          </p>
                        )}
                      </div>
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

          {/* Load more */}
          {hasMore && (
            <button
              onClick={() => setDisplayLimit((n) => n + PAGE_SIZE)}
              className="w-full py-3 rounded-xl glass-card text-[13px] text-text-secondary hover:bg-bg-card-hover transition-colors"
            >
              顯示更多（剩 {transactions.length - displayLimit} 筆）
            </button>
          )}
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
