import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CategoryIcon } from "../components/CategoryIcon";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { useModalStore } from "../stores/modalStore";
import { useSettingsStore } from "../stores/settingsStore";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function buildGrid(year: number, month: number): string[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthNum = month === 0 ? 12 : month;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonthNum = month === 11 ? 1 : month + 2;

  const cells: string[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push(`${prevYear}-${String(prevMonthNum).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  let nd = 1;
  while (cells.length < 42) {
    cells.push(`${nextYear}-${String(nextMonthNum).padStart(2, "0")}-${String(nd++).padStart(2, "0")}`);
  }

  return cells;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function Calendar() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { transactions, fetch, remove } = useTransactionStore();
  const { formatWithSymbol, fetchAll: fetchCurrencies } = useCurrencyStore();
  const { openTransactionForm } = useModalStore();
  const { reportingCurrency } = useSettingsStore();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const dateFrom = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const dateTo = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  useEffect(() => {
    fetchCurrencies();
    fetch({ dateFrom, dateTo });
  }, [year, month]);

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

  const byDate = useMemo(() => {
    const map = new Map<string, typeof transactions>();
    for (const txn of transactions) {
      if (!map.has(txn.date)) map.set(txn.date, []);
      map.get(txn.date)!.push(txn);
    }
    return map;
  }, [transactions]);

  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0, expense = 0;
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    for (const txn of transactions) {
      if (!txn.date.startsWith(prefix)) continue;
      if (txn.type === "income") income += txn.amount;
      else if (txn.type === "expense") expense += txn.amount;
    }
    return { totalIncome: income, totalExpense: expense };
  }, [transactions, year, month]);

  const selectedTxns = byDate.get(selectedDate) ?? [];
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-8 max-w-[760px] animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">行事曆</h2>
          <p className="text-text-tertiary text-[12px] mt-1">
            {selectedDate === today ? "今天" : formatDate(selectedDate)} 已選取
          </p>
        </div>
        <button
          onClick={() => openTransactionForm(undefined, selectedDate)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-light transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新增交易
        </button>
      </div>

      {/* Calendar card */}
      <div className="glass-card p-5 mb-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-card-hover transition-colors text-text-secondary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[15px] font-semibold text-text-primary">
            {year}年{month + 1}月
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-card-hover transition-colors text-text-secondary"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Month summary */}
        <div className="flex gap-0 mb-5 rounded-xl bg-bg-elevated overflow-hidden">
          <div className="flex-1 text-center py-3">
            <p className="text-[10px] text-text-tertiary mb-0.5 uppercase tracking-wider">收入</p>
            <p className="text-[13px] font-semibold text-income">+{formatWithSymbol(totalIncome, reportingCurrency)}</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center py-3">
            <p className="text-[10px] text-text-tertiary mb-0.5 uppercase tracking-wider">支出</p>
            <p className="text-[13px] font-semibold text-expense">-{formatWithSymbol(totalExpense, reportingCurrency)}</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center py-3">
            <p className="text-[10px] text-text-tertiary mb-0.5 uppercase tracking-wider">結餘</p>
            <p className={`text-[13px] font-semibold ${totalIncome - totalExpense >= 0 ? "text-income" : "text-expense"}`}>
              {totalIncome - totalExpense >= 0 ? "+" : "-"}
              {formatWithSymbol(Math.abs(totalIncome - totalExpense), reportingCurrency)}
            </p>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[11px] text-text-muted font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {grid.map((date) => {
            const isCurrentMonth = date.startsWith(currentMonthPrefix);
            const isToday = date === today;
            const isSelected = date === selectedDate;
            const dayTxns = byDate.get(date) ?? [];
            const hasIncome = dayTxns.some((t) => t.type === "income");
            const hasExpense = dayTxns.some((t) => t.type === "expense");
            const dayNum = parseInt(date.slice(8), 10);

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`
                  flex flex-col items-center pt-2 pb-2.5 px-1 rounded-xl transition-all min-h-[58px]
                  ${isSelected ? "bg-accent/12 ring-1 ring-accent/30" : "hover:bg-bg-card-hover"}
                  ${!isCurrentMonth ? "opacity-25" : ""}
                `}
              >
                <span
                  className={`
                    text-[13px] font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1
                    ${isToday ? "bg-accent text-white" : isSelected ? "text-accent-light" : "text-text-primary"}
                  `}
                >
                  {dayNum}
                </span>
                <div className="flex gap-0.5 h-2 items-center">
                  {hasIncome && <span className="w-1.5 h-1.5 rounded-full bg-income" />}
                  {hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-expense" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day transactions */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-[14px] font-semibold text-text-primary">
              {selectedDate === today ? "今天" : formatDate(selectedDate)}
            </p>
            <p className="text-[11px] text-text-tertiary mt-0.5">{selectedTxns.length} 筆交易</p>
          </div>
          <button
            onClick={() => openTransactionForm(undefined, selectedDate)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] text-accent-light hover:bg-accent/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            新增
          </button>
        </div>

        {selectedTxns.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-text-tertiary text-[13px] mb-2">這天沒有交易記錄</p>
            <button
              onClick={() => openTransactionForm(undefined, selectedDate)}
              className="text-accent-light text-[12px] hover:text-accent transition-colors"
            >
              新增第一筆交易
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {selectedTxns.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-card-hover transition-colors cursor-pointer group"
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
        )}
      </div>

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
