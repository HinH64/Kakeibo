import { Plus } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";

const budgets = [
  { cat: "餐飲", iconId: "food", color: "#FF3B30", spent: 4200, limit: 8000 },
  { cat: "交通", iconId: "transport", color: "#007AFF", spent: 2100, limit: 3000 },
  { cat: "購物", iconId: "shopping", color: "#FF9500", spent: 1800, limit: 5000 },
  { cat: "娛樂", iconId: "entertainment", color: "#AF52DE", spent: 1200, limit: 3000 },
  { cat: "訂閱服務", iconId: "subscriptions", color: "#5856D6", spent: 680, limit: 1000 },
];

export function Budgets() {
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalPct = Math.round((totalSpent / totalLimit) * 100);

  return (
    <div className="p-8 max-w-[700px] fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">預算</h2>
          <p className="text-text-quaternary text-[12px] mt-1">3月 · 每月支出上限</p>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors">
          <Plus className="w-3.5 h-3.5" />
          新增預算
        </button>
      </div>

      {/* Total */}
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider">總預算</p>
          <p className="text-[12px] text-text-secondary amt">
            NT${totalSpent.toLocaleString()} / {totalLimit.toLocaleString()}
          </p>
        </div>
        <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${totalPct}%`,
              backgroundColor: totalPct > 80 ? "#FF3B30" : "#007AFF",
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-text-quaternary">{totalPct}%</span>
          <span className="text-[11px] text-income amt">剩餘 NT${(totalLimit - totalSpent).toLocaleString()}</span>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl bg-bg-card overflow-hidden divide-y divide-border">
        {budgets.map((b) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          return (
            <div key={b.cat} className="px-4 py-4 hover:bg-bg-hover transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <CategoryIcon iconId={b.iconId} color={b.color} size="sm" />
                  <span className="text-[13px] text-text-primary">{b.cat}</span>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-medium text-text-primary amt">{pct}%</span>
                  <span className="text-[11px] text-text-quaternary ml-2">
                    NT${b.spent.toLocaleString()} / {b.limit.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "#FF3B30" : b.color, opacity: 0.85 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
