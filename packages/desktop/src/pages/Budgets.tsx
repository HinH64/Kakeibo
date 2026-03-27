import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, TrendingUp, TrendingDown } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useBudgetStore } from "../stores/budgetStore";
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { useSettingsStore } from "../stores/settingsStore";
import { api } from "../lib/api";

interface Category {
  id: string;
  nameZh: string | null;
  icon: string | null;
  color: string | null;
  type: "income" | "expense";
}

interface BudgetFormState {
  categoryId: string;
  amount: string;
  currencyCode: string;
}

const EMPTY_FORM: BudgetFormState = { categoryId: "", amount: "", currencyCode: "" };

type Tab = "expense" | "income";

export function Budgets() {
  const { budgets, loading, fetch: fetchBudgets, create, update, remove } = useBudgetStore();
  const { spendingByCategory, fetchSpending } = useTransactionStore();
  const { formatWithSymbol, fetchAll: fetchCurrencies } = useCurrencyStore();
  const { reportingCurrency } = useSettingsStore();

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("expense");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BudgetFormState>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = now.toISOString().slice(0, 10);

  useEffect(() => {
    fetchBudgets();
    fetchCurrencies();
    fetchSpending(monthStart, monthEnd);
    Promise.all([
      api.categories.list({ type: "expense" }),
      api.categories.list({ type: "income" }),
    ]).then(([exp, inc]) => {
      setAllCategories([...(exp ?? []), ...(inc ?? [])] as Category[]);
    });
  }, []);

  const catMap = new Map(allCategories.map((c) => [c.id, c]));
  const spentMap = new Map(spendingByCategory.map((s) => [s.categoryId, s]));

  // Enrich budgets with category info
  const enrichedAll = budgets
    .filter((b) => b.isActive)
    .map((b) => {
      const cat = catMap.get(b.categoryId);
      const catType = cat?.type ?? "expense";
      const spending = spentMap.get(b.categoryId);
      return {
        ...b,
        categoryName: cat?.nameZh ?? b.categoryId,
        categoryIcon: cat?.icon ?? "other-expense",
        categoryColor: cat?.color ?? "#7a756b",
        categoryType: catType,
        spent: catType === "expense" ? (spending?.total ?? 0) : 0,
        // For income budgets, "spent" = actual income received this month
        actual: catType === "income" ? (spending?.total ?? 0) : 0,
      };
    });

  const expenseBudgets = enrichedAll.filter((b) => b.categoryType === "expense");
  const incomeBudgets = enrichedAll.filter((b) => b.categoryType === "income");

  const totalExpenseBudget = expenseBudgets.reduce((s, b) => s + b.amount, 0);
  const totalExpenseSpent = expenseBudgets.reduce((s, b) => s + b.spent, 0);
  const totalIncomeBudget = incomeBudgets.reduce((s, b) => s + b.amount, 0);
  const monthlySurplus = totalIncomeBudget - totalExpenseBudget;

  const activeBudgets = activeTab === "expense" ? expenseBudgets : incomeBudgets;

  // Categories not yet budgeted for current tab
  const budgetedIds = new Set(budgets.filter((b) => b.isActive).map((b) => b.categoryId));
  const availableCategories = allCategories.filter(
    (c) => c.type === activeTab && (!budgetedIds.has(c.id) || c.id === form.categoryId)
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, currencyCode: reportingCurrency });
    setShowForm(true);
  };

  const openEdit = (b: typeof enrichedAll[0]) => {
    setEditingId(b.id);
    setForm({ categoryId: b.categoryId, amount: String(b.amount), currencyCode: b.currencyCode });
    setShowForm(true);
  };

  const handleSave = async () => {
    const amount = parseInt(form.amount, 10);
    if (!form.categoryId || isNaN(amount) || amount <= 0) return;
    setSaving(true);
    try {
      if (editingId) {
        await update(editingId, { categoryId: form.categoryId, amount, currencyCode: form.currencyCode });
      } else {
        await create({
          categoryId: form.categoryId,
          amount,
          currencyCode: form.currencyCode,
          period: "monthly",
          startDate: monthStart,
          isActive: true,
        });
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId) { await remove(deleteId); setDeleteId(null); }
  };

  return (
    <div className="p-8 max-w-[760px] animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">預算</h2>
          <p className="text-text-tertiary text-[12px] mt-1">{monthLabel} · 每月計畫</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-light transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新增{activeTab === "expense" ? "預算" : "預期收入"}
        </button>
      </div>

      {/* Monthly Surplus Summary */}
      <div className={`glass-card p-5 mb-5 border ${monthlySurplus >= 0 ? "border-income/20" : "border-expense/20"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-1">每月預計結餘</p>
            <p className={`text-[28px] font-bold amount-large ${monthlySurplus >= 0 ? "text-income" : "text-expense"}`}>
              {monthlySurplus >= 0 ? "+" : ""}{formatWithSymbol(monthlySurplus, reportingCurrency)}
            </p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 flex items-center gap-1 justify-end">
                <TrendingUp className="w-3 h-3" />預期收入
              </p>
              <p className="text-[15px] font-semibold text-income amount-large">
                +{formatWithSymbol(totalIncomeBudget, reportingCurrency)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1 flex items-center gap-1 justify-end">
                <TrendingDown className="w-3 h-3" />支出預算
              </p>
              <p className="text-[15px] font-semibold text-expense amount-large">
                -{formatWithSymbol(totalExpenseBudget, reportingCurrency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 glass-card rounded-xl w-fit">
        {(["expense", "income"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
              activeTab === tab
                ? "bg-accent text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab === "expense" ? "支出預算" : "預期收入"}
            <span className="ml-1.5 text-[10px] opacity-70">
              ({tab === "expense" ? expenseBudgets.length : incomeBudgets.length})
            </span>
          </button>
        ))}
      </div>

      {/* Expense tab: total usage bar */}
      {activeTab === "expense" && expenseBudgets.length > 0 && (
        <div className="glass-card p-4 mb-4">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider">總支出使用</p>
            <p className="text-[13px] text-text-secondary amount-large">
              {formatWithSymbol(totalExpenseSpent, reportingCurrency)} / {formatWithSymbol(totalExpenseBudget, reportingCurrency)}
            </p>
          </div>
          <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, totalExpenseBudget > 0 ? Math.round((totalExpenseSpent / totalExpenseBudget) * 100) : 0)}%`,
                backgroundColor: totalExpenseSpent > totalExpenseBudget ? "#c27258" : totalExpenseSpent / totalExpenseBudget > 0.7 ? "#c9944a" : "#6b9a6b",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-text-tertiary">
              {totalExpenseBudget > 0 ? Math.round((totalExpenseSpent / totalExpenseBudget) * 100) : 0}% 已使用
            </span>
            <span className={`text-[11px] amount-large ${totalExpenseSpent > totalExpenseBudget ? "text-expense" : "text-income"}`}>
              {totalExpenseSpent > totalExpenseBudget ? "超支 " : "剩餘 "}
              {formatWithSymbol(Math.abs(totalExpenseBudget - totalExpenseSpent), reportingCurrency)}
            </span>
          </div>
        </div>
      )}

      {/* Budget Items */}
      {loading ? (
        <div className="glass-card p-12 text-center">
          <p className="text-text-tertiary text-[13px]">載入中...</p>
        </div>
      ) : activeBudgets.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-text-tertiary text-[14px] mb-3">
            {activeTab === "expense" ? "尚未設定支出預算" : "尚未設定預期收入"}
          </p>
          <button onClick={openCreate} className="text-accent-light text-[13px] hover:text-accent transition-colors">
            {activeTab === "expense" ? "新增第一筆預算" : "新增預期收入"}
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden divide-y divide-border">
          {activeBudgets.map((b) => {
            if (activeTab === "expense") {
              const pct = b.amount > 0 ? Math.min(100, Math.round((b.spent / b.amount) * 100)) : 0;
              const barColor = pct >= 90 ? "#c27258" : pct >= 70 ? "#c9944a" : b.categoryColor;
              return (
                <div key={b.id} className="px-4 py-4 hover:bg-bg-card-hover transition-colors group">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon iconId={b.categoryIcon} color={b.categoryColor} size="sm" />
                      <span className="text-[13px] text-text-primary font-medium">{b.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[13px] font-semibold text-text-primary amount-large">{pct}%</span>
                        <span className="text-[11px] text-text-tertiary ml-2">
                          {formatWithSymbol(b.spent, reportingCurrency)} / {formatWithSymbol(b.amount, reportingCurrency)}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(b)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-bg-elevated transition-colors">
                          <Pencil className="w-3 h-3 text-text-tertiary" />
                        </button>
                        <button onClick={() => setDeleteId(b.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-expense/10 transition-colors">
                          <Trash2 className="w-3 h-3 text-expense" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor, opacity: 0.8 }} />
                  </div>
                  {pct >= 90 && <p className="text-[11px] text-expense mt-1.5">{pct >= 100 ? "已超支！" : "即將達到上限"}</p>}
                </div>
              );
            } else {
              // Income budget row
              return (
                <div key={b.id} className="px-4 py-4 hover:bg-bg-card-hover transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon iconId={b.categoryIcon} color={b.categoryColor} size="sm" />
                      <div>
                        <p className="text-[13px] text-text-primary font-medium">{b.categoryName}</p>
                        <p className="text-[11px] text-text-tertiary mt-0.5">每月預期</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-income amount-large">
                        +{formatWithSymbol(b.amount, reportingCurrency)}
                      </p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(b)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-bg-elevated transition-colors">
                          <Pencil className="w-3 h-3 text-text-tertiary" />
                        </button>
                        <button onClick={() => setDeleteId(b.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-expense/10 transition-colors">
                          <Trash2 className="w-3 h-3 text-expense" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-[400px] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-text-primary">
                {editingId ? "編輯" : "新增"}{activeTab === "expense" ? "支出預算" : "預期收入"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-secondary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-text-tertiary uppercase tracking-wider block mb-1.5">類別</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-[13px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                >
                  <option value="">選擇類別...</option>
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nameZh}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-text-tertiary uppercase tracking-wider block mb-1.5">
                  {activeTab === "expense" ? "每月上限" : "每月預期金額"}
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border text-[13px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-bg-elevated text-text-secondary text-[13px] hover:bg-bg-card-hover transition-colors">
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.categoryId || !form.amount}
                className="flex-1 py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-light transition-colors disabled:opacity-50"
              >
                {saving ? "儲存中..." : "儲存"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="刪除項目"
        message="確定要刪除嗎？"
        confirmLabel="刪除"
        variant="danger"
      />
    </div>
  );
}
