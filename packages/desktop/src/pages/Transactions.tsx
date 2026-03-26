import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";

interface Txn {
  id: number; name: string; cat: string; iconId: string; color: string;
  amount: string; sign: "+" | "-" | ""; symbol: string; account: string;
}

const groups: { label: string; total: string; items: Txn[] }[] = [
  {
    label: "今天 · 3月26日",
    total: "-NT$520",
    items: [
      { id: 1, name: "午餐 — 鼎泰豐", cat: "餐飲", iconId: "food", color: "#c27258", amount: "385", sign: "-", symbol: "NT$", account: "台幣活存" },
      { id: 2, name: "捷運儲值", cat: "交通", iconId: "transport", color: "#6588a8", amount: "100", sign: "-", symbol: "NT$", account: "台幣活存" },
      { id: 3, name: "咖啡", cat: "餐飲", iconId: "food", color: "#c27258", amount: "35", sign: "-", symbol: "NT$", account: "台幣活存" },
    ],
  },
  {
    label: "昨天 · 3月25日",
    total: "+NT$51,485",
    items: [
      { id: 4, name: "三月薪資", cat: "薪資", iconId: "salary", color: "#6b9a6b", amount: "52,000", sign: "+", symbol: "NT$", account: "台幣活存" },
      { id: 5, name: "Netflix", cat: "訂閱", iconId: "subscriptions", color: "#7a78a8", amount: "15.99", sign: "-", symbol: "$", account: "USD Checking" },
      { id: 6, name: "日圓換匯", cat: "轉帳", iconId: "transfer", color: "#8a7eb8", amount: "NT$10,000 → ¥45,200", sign: "", symbol: "", account: "台幣 → 日圓" },
    ],
  },
  {
    label: "3月24日",
    total: "-NT$2,180",
    items: [
      { id: 7, name: "超市採買", cat: "食材雜貨", iconId: "groceries", color: "#c9944a", amount: "680", sign: "-", symbol: "NT$", account: "台幣活存" },
      { id: 8, name: "電影票", cat: "娛樂", iconId: "entertainment", color: "#9878a8", amount: "600", sign: "-", symbol: "NT$", account: "信用卡" },
      { id: 9, name: "Spotify", cat: "訂閱", iconId: "subscriptions", color: "#7a78a8", amount: "149", sign: "-", symbol: "NT$", account: "信用卡" },
      { id: 10, name: "加油", cat: "交通", iconId: "transport", color: "#6588a8", amount: "751", sign: "-", symbol: "NT$", account: "台幣活存" },
    ],
  },
];

export function Transactions() {
  return (
    <div className="p-8 max-w-[700px] animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">交易紀錄</h2>
          <p className="text-text-tertiary text-[12px] mt-1">3月 · 10 筆</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-primary text-white text-[13px] font-medium hover:opacity-90 transition-opacity">
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
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] text-text-tertiary font-medium">{g.label}</span>
              <span className={`text-[11px] amount-large ${g.total.startsWith("+") ? "text-income" : "text-text-tertiary"}`}>{g.total}</span>
            </div>
            <div className="glass-card overflow-hidden divide-y divide-border">
              {g.items.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-bg-card-hover transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CategoryIcon iconId={txn.iconId} color={txn.color} size="sm" />
                    <div>
                      <p className="text-[13px] text-text-primary">{txn.name}</p>
                      <p className="text-[11px] text-text-tertiary mt-0.5">{txn.cat} · {txn.account}</p>
                    </div>
                  </div>
                  <p className={`text-[13px] font-medium amount-large ${txn.sign === "+" ? "text-income" : txn.sign === "" ? "text-transfer" : "text-text-primary"}`}>
                    {txn.sign}{txn.symbol}{txn.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
