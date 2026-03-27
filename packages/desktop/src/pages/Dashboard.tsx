import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, ReferenceLine, ReferenceDot,
} from "recharts";
import { CategoryIcon } from "../components/CategoryIcon";
import { useAccountStore } from "../stores/accountStore";
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useExchangeRateStore } from "../stores/exchangeRateStore";
import { useBudgetStore } from "../stores/budgetStore";
import { useTargetStore } from "../stores/targetStore";
import { api } from "../lib/api";

export function Dashboard() {
  const navigate = useNavigate();
  const { accounts, fetch: fetchAccounts } = useAccountStore();
  const { transactions, spendingByCategory, fetch: fetchTransactions, fetchSpending } = useTransactionStore();
  const { formatWithSymbol, fetchAll: fetchCurrencies } = useCurrencyStore();
  const { reportingCurrency } = useSettingsStore();
  const { convert } = useExchangeRateStore();
  const { budgets, fetch: fetchBudgets } = useBudgetStore();
  const { targets, events } = useTargetStore();

  const [allCategories, setAllCategories] = useState<{ id: string; type: string }[]>([]);
  const [monthIncome, setMonthIncome] = useState(0);
  const [monthExpense, setMonthExpense] = useState(0);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; income: number; expense: number }[]>([]);


  useEffect(() => {
    fetchCurrencies();
    fetchAccounts();
    fetchTransactions({ limit: 10 });

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const monthEnd = now.toISOString().slice(0, 10);

    fetchSpending(monthStart, monthEnd);
    api.transactions.monthStats(monthStart, monthEnd).then(({ income, expense }) => {
      setMonthIncome(income);
      setMonthExpense(expense);
    });
    api.transactions.monthlyTrend(undefined, 6).then((trend) => {
      setMonthlyTrend(trend as { month: string; income: number; expense: number }[]);
    });
    fetchBudgets();
    Promise.all([
      api.categories.list({ type: "income" }),
      api.categories.list({ type: "expense" }),
    ]).then(([inc, exp]) => {
      setAllCategories([...(inc ?? []), ...(exp ?? [])] as { id: string; type: string }[]);
    });
  }, []);

  // Net worth
  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const totalAssets = accounts
    .filter((a) => a.type === "asset" && !a.isArchived)
    .reduce((s, a) => s + convert(a.balance, a.currencyCode, reportingCurrency), 0);
  const totalLiabilities = accounts
    .filter((a) => a.type === "liability" && !a.isArchived)
    .reduce((s, a) => s + convert(a.balance, a.currencyCode, reportingCurrency), 0);
  const netWorth = totalAssets - totalLiabilities;

  // Budget-based monthly surplus
  const catTypeMap = new Map(allCategories.map((c) => [c.id, c.type]));
  const activeBudgets = budgets.filter((b) => b.isActive);
  const monthlyIncomeBudget = activeBudgets
    .filter((b) => catTypeMap.get(b.categoryId) === "income")
    .reduce((s, b) => s + b.amount, 0);
  const monthlyExpenseBudget = activeBudgets
    .filter((b) => catTypeMap.get(b.categoryId) === "expense")
    .reduce((s, b) => s + b.amount, 0);
  const monthlySurplus = monthlyIncomeBudget - monthlyExpenseBudget;

  // Forecast horizon: cover furthest milestone + 2, minimum 12 months
  const now = new Date();
  const milestoneOffsets = targets
    .filter((t) => t.type === "milestone" && t.targetMonth)
    .map((t) => {
      const [y, m] = t.targetMonth!.split("-").map(Number);
      return (y - now.getFullYear()) * 12 + (m - (now.getMonth() + 1));
    })
    .filter((m) => m >= 0);
  const horizon = Math.max(12, ...milestoneOffsets) + 2;

  // Build cumulative monthly forecast (with planned events)
  const monthlyForecast = Array.from({ length: horizon + 1 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    let value = netWorth + monthlySurplus * i;
    // Add all planned events up to and including this month
    for (const evt of events) {
      if (evt.month <= monthKey) {
        value += convert(evt.amount, evt.currencyCode, reportingCurrency);
      }
    }
    const label = i === 0 ? "現在" : `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { label, month: monthKey, value, i };
  });

  // Targets converted to reporting currency
  const floorTargets = targets
    .filter((t) => t.type === "floor")
    .map((t) => ({ ...t, converted: convert(t.amount, t.currencyCode, reportingCurrency) }));
  const milestoneTargets = targets
    .filter((t) => t.type === "milestone" && t.targetMonth)
    .map((t) => {
      const point = monthlyForecast.find((p) => p.month === t.targetMonth);
      return { ...t, converted: convert(t.amount, t.currencyCode, reportingCurrency), point };
    });

  // Chart data (monthly, for smooth curve)
  const chartData = monthlyForecast.map((p) => ({ label: p.label, value: p.value }));

  const formatMonth = (m: string) => `${parseInt(m.split("-")[1])}月`;
  const trendData = monthlyTrend.map((d) => ({
    month: formatMonth(d.month),
    income: d.income,
    expense: d.expense,
  }));
  const pieData = spendingByCategory.slice(0, 6).map((cat) => ({
    name: cat.categoryName,
    value: cat.total,
    color: cat.categoryColor,
  }));
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  const lowestFloor = floorTargets.length > 0
    ? Math.min(...floorTargets.map((t) => t.converted))
    : null;

  return (
    <div className="p-8 animate-fade-in">

      {/* ── Row 1: Net Worth + Month Stats (left) | Charts (right) ── */}
      <div className="grid grid-cols-5 gap-6 mb-6">

        {/* Left 2/5: Net worth hero + month summary */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="glass-card glow-accent p-6 flex-1">
            <p className="text-text-tertiary text-[11px] uppercase tracking-wider mb-2">淨資產</p>
            <p className="text-[36px] font-bold text-text-primary amount-large leading-none mb-1">
              {formatWithSymbol(netWorth, reportingCurrency)}
            </p>
            <p className="text-text-tertiary text-[11px] mt-2">
              {activeAccounts.length} 個帳戶 · 以 {reportingCurrency} 計算
            </p>
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">資產</p>
                <p className="text-[15px] font-semibold text-income amount-large">
                  {formatWithSymbol(totalAssets, reportingCurrency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">負債</p>
                <p className="text-[15px] font-semibold text-expense amount-large">
                  {formatWithSymbol(totalLiabilities, reportingCurrency)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "本月收入", value: monthIncome, color: "text-income", prefix: "+" },
              { label: "本月支出", value: monthExpense, color: "text-expense", prefix: "-" },
              { label: "本月結餘", value: Math.abs(monthIncome - monthExpense), color: monthIncome >= monthExpense ? "text-income" : "text-expense", prefix: monthIncome >= monthExpense ? "+" : "-" },
            ].map((card) => (
              <div key={card.label} onClick={() => navigate("/transactions")}
                className="glass-card p-4 cursor-pointer hover:bg-bg-card-hover transition-colors">
                <p className="text-text-tertiary text-[10px] uppercase tracking-wider mb-1.5">{card.label}</p>
                <p className={`text-[14px] font-bold amount-large ${card.color}`}>
                  {card.prefix}{formatWithSymbol(card.value, reportingCurrency)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 3/5: Pie + Bar charts */}
        <div className="col-span-3 grid grid-cols-2 gap-6">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-medium text-text-secondary">本月支出分布</h3>
              <span className="text-[11px] text-text-tertiary">{monthLabel}</span>
            </div>
            {pieData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center">
                <p className="text-[13px] text-text-muted">本月尚無支出</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                      paddingAngle={2} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatWithSymbol(v, reportingCurrency)}
                      contentStyle={{ background: "#1e1c1a", border: "1px solid #3a3530", borderRadius: 8, fontSize: 12 }}
                      itemStyle={{ color: "#c8b8a8" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-[11px] text-text-tertiary truncate flex-1">{d.name}</span>
                      <span className="text-[11px] font-medium text-text-secondary amount-large shrink-0">
                        {formatWithSymbol(d.value, reportingCurrency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-5">
            <h3 className="text-[13px] font-medium text-text-secondary mb-4">近 6 個月趨勢</h3>
            {trendData.every((d) => d.income === 0 && d.expense === 0) ? (
              <div className="h-[180px] flex items-center justify-center">
                <p className="text-[13px] text-text-muted">暫無資料</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={trendData} barCategoryGap="28%" barGap={2}>
                    <CartesianGrid vertical={false} stroke="#3a3530" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a756b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#7a756b" }} axisLine={false} tickLine={false} width={40}
                      tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)} />
                    <Tooltip formatter={(v: number) => formatWithSymbol(v, reportingCurrency)}
                      contentStyle={{ background: "#1e1c1a", border: "1px solid #3a3530", borderRadius: 8, fontSize: 12 }}
                      itemStyle={{ color: "#c8b8a8" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <Bar dataKey="income" name="收入" fill="#6b9a6b" radius={[3, 3, 0, 0]} opacity={0.85} />
                    <Bar dataKey="expense" name="支出" fill="#c27258" radius={[3, 3, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                    <span className="w-2 h-2 rounded-full bg-income" />收入
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                    <span className="w-2 h-2 rounded-full bg-expense" />支出
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Forecast Card (above 帳戶) ── */}
      {monthlySurplus !== 0 && (
        <div className="glass-card p-5 mb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-medium text-text-secondary">資產預測</h3>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                每月預計結餘{" "}
                <span className={`font-medium amount-large ${monthlySurplus >= 0 ? "text-income" : "text-expense"}`}>
                  {monthlySurplus >= 0 ? "+" : ""}{formatWithSymbol(monthlySurplus, reportingCurrency)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/goals")}
                className="text-[12px] text-accent-light hover:text-accent flex items-center gap-0.5 transition-colors">
                管理目標 <ArrowRight className="w-3 h-3" />
              </button>
              <button onClick={() => navigate("/budgets")}
                className="text-[12px] text-text-tertiary hover:text-text-secondary flex items-center gap-0.5 transition-colors">
                調整預算 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 3-stat summary row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "現在", value: netWorth, sub: null },
              { label: "+12 個月", value: monthlyForecast[12]?.value ?? netWorth + monthlySurplus * 12, sub: null },
              ...(lowestFloor !== null
                ? [{ label: "距底線（現在）", value: netWorth - lowestFloor, sub: formatWithSymbol(lowestFloor, reportingCurrency) }]
                : []),
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-bg-elevated/60 px-4 py-3">
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-[14px] font-semibold amount-large ${
                  s.label === "距底線（現在）"
                    ? s.value >= 0 ? "text-income" : "text-expense"
                    : "text-text-primary"
                }`}>
                  {s.label === "距底線（現在）" && s.value >= 0 ? "+" : ""}
                  {formatWithSymbol(s.value, reportingCurrency)}
                </p>
                {s.sub && <p className="text-[10px] text-text-muted mt-0.5">底線 {s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Area Chart with Y axis */}
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={monthlySurplus >= 0 ? "#6b9a6b" : "#c27258"} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={monthlySurplus >= 0 ? "#6b9a6b" : "#c27258"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#7a756b" }} axisLine={false} tickLine={false}
                interval={Math.floor(chartData.length / 6)} />
              <YAxis
                tick={{ fontSize: 10, fill: "#7a756b" }} axisLine={false} tickLine={false} width={58}
                tickFormatter={(v) => {
                  const abs = Math.abs(v);
                  if (abs >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                  if (abs >= 1000) return `${Math.round(v / 1000)}k`;
                  return String(v);
                }}
              />
              <Tooltip formatter={(v: number) => formatWithSymbol(v, reportingCurrency)}
                contentStyle={{ background: "#1e1c1a", border: "1px solid #3a3530", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "#c8b8a8" }} />
              {floorTargets.map((t) => (
                <ReferenceLine key={t.id} y={t.converted} stroke="#c27258" strokeDasharray="4 2" strokeWidth={1.5}
                  label={{ value: `${t.name} ${formatWithSymbol(t.converted, reportingCurrency)}`, fill: "#c27258", fontSize: 10, position: "insideBottomRight" }} />
              ))}
              {milestoneTargets.map((t) =>
                t.point ? (
                  <ReferenceDot key={t.id} x={t.point.label} y={t.converted}
                    r={5} fill="#f0b429" stroke="#1e1c1a" strokeWidth={1.5} />
                ) : null
              )}
              <Area type="monotone" dataKey="value" name="預測資產"
                stroke={monthlySurplus >= 0 ? "#6b9a6b" : "#c27258"} strokeWidth={2}
                fill="url(#forecastGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Row 2: Accounts + Spending bars (left) | Recent Transactions (right) ── */}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-medium text-text-secondary">帳戶</h3>
              <button onClick={() => navigate("/accounts")}
                className="text-[12px] text-accent-light hover:text-accent flex items-center gap-0.5 transition-colors">
                全部 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="glass-card overflow-hidden divide-y divide-border">
              {activeAccounts.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-text-muted">尚未建立帳戶</p>
              ) : (
                activeAccounts.map((acc) => (
                  <div key={acc.id} onClick={() => navigate(`/accounts/${acc.id}`)}
                    className="flex items-center justify-between py-3.5 px-4 hover:bg-bg-card-hover transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center">
                        <span className="text-[13px] text-text-secondary font-medium">{acc.currencyCode.slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-[13px] text-text-primary font-medium">{acc.name}</p>
                        <p className="text-[11px] text-text-tertiary">{acc.currencyCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-semibold text-text-primary amount-large">
                        {formatWithSymbol(acc.balance, acc.currencyCode)}
                      </p>
                      {acc.currencyCode !== reportingCurrency && (
                        <p className="text-[11px] text-text-tertiary">
                          ≈ {formatWithSymbol(convert(acc.balance, acc.currencyCode, reportingCurrency), reportingCurrency)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[13px] font-medium text-text-secondary mb-3">本月支出</h3>
            <div className="glass-card p-4 space-y-4">
              {spendingByCategory.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-text-muted">本月尚無支出</p>
              ) : (
                spendingByCategory.map((cat) => {
                  const maxTotal = spendingByCategory[0]?.total ?? 1;
                  return (
                    <div key={cat.categoryId} onClick={() => navigate(`/categories/${cat.categoryId}`)}
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                      <CategoryIcon iconId={cat.categoryIcon} color={cat.categoryColor} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[12px] text-text-secondary">{cat.categoryName}</span>
                          <span className="text-[12px] font-medium text-text-primary amount-large">
                            {formatWithSymbol(cat.total, reportingCurrency)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(cat.total / maxTotal) * 100}%`, backgroundColor: cat.categoryColor, opacity: 0.7 }} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-text-secondary">近期交易</h3>
            <button onClick={() => navigate("/transactions")}
              className="text-[12px] text-accent-light hover:text-accent flex items-center gap-0.5 transition-colors">
              全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="glass-card overflow-hidden divide-y divide-border">
            {transactions.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-text-muted">尚無交易紀錄</p>
            ) : (
              transactions.slice(0, 10).map((txn) => (
                <div key={txn.id} onClick={() => navigate(`/transactions/${txn.id}`)}
                  className="flex items-center justify-between py-3 px-4 hover:bg-bg-card-hover transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CategoryIcon iconId={txn.categoryIcon ?? "other-expense"} color="#7a756b" size="sm" />
                    <div className="min-w-0">
                      <p className="text-[13px] text-text-primary truncate">{txn.note || txn.categoryName || "交易"}</p>
                      <p className="text-[11px] text-text-tertiary">{txn.categoryName ?? "轉帳"} · {txn.date}</p>
                    </div>
                  </div>
                  <p className={`text-[13px] font-medium amount-large shrink-0 ml-2 ${txn.type === "income" ? "text-income" : txn.type === "transfer" ? "text-transfer" : "text-text-primary"}`}>
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
