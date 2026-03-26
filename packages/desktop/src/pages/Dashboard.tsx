import { ArrowRight, Landmark, Banknote, DollarSign } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";
import type { LucideIcon } from "lucide-react";

const accounts: { name: string; currency: string; symbol: string; balance: string; Icon: LucideIcon }[] = [
  { name: "台幣活存", currency: "TWD", symbol: "NT$", balance: "125,800", Icon: Landmark },
  { name: "日圓現金", currency: "JPY", symbol: "¥", balance: "45,200", Icon: Banknote },
  { name: "USD Checking", currency: "USD", symbol: "$", balance: "2,350.00", Icon: DollarSign },
];

const recent = [
  { id: 1, name: "午餐", cat: "餐飲", iconId: "food", color: "#c27258", amount: "185", sign: "-", symbol: "NT$", date: "今天" },
  { id: 2, name: "捷運", cat: "交通", iconId: "transport", color: "#6588a8", amount: "35", sign: "-", symbol: "NT$", date: "今天" },
  { id: 3, name: "薪資", cat: "薪資", iconId: "salary", color: "#6b9a6b", amount: "52,000", sign: "+", symbol: "NT$", date: "昨天" },
  { id: 4, name: "Netflix", cat: "訂閱", iconId: "subscriptions", color: "#7a78a8", amount: "15.99", sign: "-", symbol: "$", date: "3/24" },
  { id: 5, name: "超市", cat: "食材", iconId: "groceries", color: "#c9944a", amount: "680", sign: "-", symbol: "NT$", date: "3/24" },
];

const spending = [
  { name: "餐飲", iconId: "food", color: "#c27258", amount: 4200, pct: 34 },
  { name: "交通", iconId: "transport", color: "#6588a8", amount: 2100, pct: 17 },
  { name: "購物", iconId: "shopping", color: "#c9944a", amount: 1800, pct: 15 },
  { name: "娛樂", iconId: "entertainment", color: "#9878a8", amount: 1200, pct: 10 },
  { name: "訂閱", iconId: "subscriptions", color: "#7a78a8", amount: 680, pct: 5 },
];

export function Dashboard() {
  return (
    <div className="p-8 max-w-[900px] animate-fade-in">
      {/* Net Worth Hero */}
      <div className="glass-card glow-accent p-6 mb-8">
        <p className="text-text-tertiary text-[12px] uppercase tracking-wider mb-2">淨資產</p>
        <p className="text-[40px] font-bold text-text-primary amount-large leading-none">
          NT$198,550
        </p>
        <p className="text-text-tertiary text-[12px] mt-3">
          3 個帳戶 · 以新台幣計算
        </p>
      </div>

      {/* Month Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-text-tertiary text-[11px] uppercase tracking-wider mb-1.5">收入</p>
          <p className="text-[24px] font-bold text-income amount-large">+52,000</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-text-tertiary text-[11px] uppercase tracking-wider mb-1.5">支出</p>
          <p className="text-[24px] font-bold text-expense amount-large">-12,450</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-text-tertiary text-[11px] uppercase tracking-wider mb-1.5">結餘</p>
          <p className="text-[24px] font-bold text-text-primary amount-large">+39,550</p>
          <p className="text-text-muted text-[11px] mt-1">3月 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Accounts + Spending */}
        <div className="col-span-3 space-y-6">
          {/* Accounts */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-medium text-text-secondary">帳戶</h3>
              <button className="text-[12px] text-accent-light hover:text-accent flex items-center gap-0.5 transition-colors">
                全部 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="glass-card overflow-hidden divide-y divide-border">
              {accounts.map((acc) => (
                <div key={acc.name} className="flex items-center justify-between py-3.5 px-4 hover:bg-bg-card-hover transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center">
                      <acc.Icon className="w-[18px] h-[18px] text-text-secondary" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[13px] text-text-primary font-medium">{acc.name}</p>
                      <p className="text-[11px] text-text-tertiary">{acc.currency}</p>
                    </div>
                  </div>
                  <p className="text-[15px] font-semibold text-text-primary amount-large">
                    {acc.symbol}{acc.balance}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Spending by category */}
          <section>
            <h3 className="text-[13px] font-medium text-text-secondary mb-3">本月支出</h3>
            <div className="glass-card p-4 space-y-4">
              {spending.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <CategoryIcon iconId={cat.iconId} color={cat.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-text-secondary">{cat.name}</span>
                      <span className="text-[12px] font-medium text-text-primary amount-large">NT${cat.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${cat.pct * 2.5}%`, backgroundColor: cat.color, opacity: 0.7 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Recent */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-text-secondary">近期交易</h3>
            <button className="text-[12px] text-accent-light hover:text-accent flex items-center gap-0.5 transition-colors">
              全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="glass-card overflow-hidden divide-y divide-border">
            {recent.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-3 px-4 hover:bg-bg-card-hover transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <CategoryIcon iconId={txn.iconId} color={txn.color} size="sm" />
                  <div>
                    <p className="text-[13px] text-text-primary">{txn.name}</p>
                    <p className="text-[11px] text-text-tertiary">{txn.cat} · {txn.date}</p>
                  </div>
                </div>
                <p className={`text-[13px] font-medium amount-large ${txn.sign === "+" ? "text-income" : "text-text-primary"}`}>
                  {txn.sign}{txn.symbol}{txn.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
