import { ArrowRight, Landmark, Banknote, DollarSign } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";
import type { LucideIcon } from "lucide-react";

const accounts: { name: string; currency: string; symbol: string; balance: string; Icon: LucideIcon }[] = [
  { name: "台幣活存", currency: "TWD", symbol: "NT$", balance: "125,800", Icon: Landmark },
  { name: "日圓現金", currency: "JPY", symbol: "¥", balance: "45,200", Icon: Banknote },
  { name: "USD Checking", currency: "USD", symbol: "$", balance: "2,350.00", Icon: DollarSign },
];

const recent = [
  { id: 1, name: "午餐", cat: "餐飲", iconId: "food", color: "#FF3B30", amount: "185", sign: "-", symbol: "NT$", date: "今天" },
  { id: 2, name: "捷運", cat: "交通", iconId: "transport", color: "#007AFF", amount: "35", sign: "-", symbol: "NT$", date: "今天" },
  { id: 3, name: "薪資", cat: "薪資", iconId: "salary", color: "#34C759", amount: "52,000", sign: "+", symbol: "NT$", date: "昨天" },
  { id: 4, name: "Netflix", cat: "訂閱", iconId: "subscriptions", color: "#5856D6", amount: "15.99", sign: "-", symbol: "$", date: "3/24" },
  { id: 5, name: "超市", cat: "食材", iconId: "groceries", color: "#FF9500", amount: "680", sign: "-", symbol: "NT$", date: "3/24" },
];

const spending = [
  { name: "餐飲", iconId: "food", color: "#FF3B30", amount: 4200, pct: 34 },
  { name: "交通", iconId: "transport", color: "#007AFF", amount: 2100, pct: 17 },
  { name: "購物", iconId: "shopping", color: "#FF9500", amount: 1800, pct: 15 },
  { name: "娛樂", iconId: "entertainment", color: "#AF52DE", amount: 1200, pct: 10 },
  { name: "訂閱", iconId: "subscriptions", color: "#5856D6", amount: 680, pct: 5 },
];

export function Dashboard() {
  return (
    <div className="p-8 max-w-[900px] fade-in">
      {/* Balance hero — big number, minimal chrome */}
      <div className="mb-8">
        <p className="text-text-tertiary text-[13px] mb-1">淨資產</p>
        <p className="text-[42px] font-bold text-text-primary amt leading-none">
          NT$198,550
        </p>
        <p className="text-text-quaternary text-[12px] mt-2">
          3 個帳戶 · 以新台幣計算
        </p>
      </div>

      {/* Month summary — clean inline, not cards */}
      <div className="flex items-baseline gap-8 mb-10 pb-6 border-b border-border">
        <div>
          <p className="text-text-tertiary text-[11px] uppercase tracking-wider mb-1">收入</p>
          <p className="text-[22px] font-semibold text-income amt">+52,000</p>
        </div>
        <div>
          <p className="text-text-tertiary text-[11px] uppercase tracking-wider mb-1">支出</p>
          <p className="text-[22px] font-semibold text-expense amt">-12,450</p>
        </div>
        <div>
          <p className="text-text-tertiary text-[11px] uppercase tracking-wider mb-1">結餘</p>
          <p className="text-[22px] font-semibold text-text-primary amt">+39,550</p>
        </div>
        <p className="text-text-quaternary text-[12px] ml-auto">3月 2026</p>
      </div>

      <div className="grid grid-cols-5 gap-8">
        {/* Left: Accounts + Spending */}
        <div className="col-span-3 space-y-8">
          {/* Accounts */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-medium text-text-secondary">帳戶</h3>
              <button className="text-[12px] text-text-tertiary hover:text-text-secondary flex items-center gap-0.5">
                全部 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              {accounts.map((acc) => (
                <div key={acc.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <acc.Icon className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
                    <div>
                      <p className="text-[13px] text-text-primary">{acc.name}</p>
                      <p className="text-[11px] text-text-quaternary">{acc.currency}</p>
                    </div>
                  </div>
                  <p className="text-[14px] font-medium text-text-primary amt">
                    {acc.symbol}{acc.balance}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Spending by category */}
          <section>
            <h3 className="text-[13px] font-medium text-text-secondary mb-4">本月支出</h3>
            <div className="space-y-3">
              {spending.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <CategoryIcon iconId={cat.iconId} color={cat.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-text-secondary">{cat.name}</span>
                      <span className="text-[12px] text-text-primary amt">NT${cat.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${cat.pct * 2.5}%`, backgroundColor: cat.color, opacity: 0.8 }}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-medium text-text-secondary">近期交易</h3>
            <button className="text-[12px] text-text-tertiary hover:text-text-secondary flex items-center gap-0.5">
              全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div>
            {recent.map((txn, i) => (
              <div key={txn.id} className={`flex items-center justify-between py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                <div className="flex items-center gap-2.5">
                  <CategoryIcon iconId={txn.iconId} color={txn.color} size="sm" />
                  <div>
                    <p className="text-[13px] text-text-primary">{txn.name}</p>
                    <p className="text-[11px] text-text-quaternary">{txn.cat} · {txn.date}</p>
                  </div>
                </div>
                <p className={`text-[13px] font-medium amt ${txn.sign === "+" ? "text-income" : "text-text-primary"}`}>
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
