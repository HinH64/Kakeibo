import { Plus } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";

const expense = [
  { iconId: "food", name: "餐飲", color: "#FF3B30" },
  { iconId: "groceries", name: "食材雜貨", color: "#FF9500" },
  { iconId: "transport", name: "交通", color: "#007AFF" },
  { iconId: "housing", name: "居住", color: "#5AC8FA" },
  { iconId: "utilities", name: "水電瓦斯", color: "#FFCC00" },
  { iconId: "entertainment", name: "娛樂", color: "#AF52DE" },
  { iconId: "shopping", name: "購物", color: "#FF9500" },
  { iconId: "health", name: "醫療", color: "#FF2D55" },
  { iconId: "education", name: "教育", color: "#5856D6" },
  { iconId: "personal", name: "個人護理", color: "#FF2D55" },
  { iconId: "clothing", name: "服飾", color: "#AF52DE" },
  { iconId: "insurance", name: "保險", color: "#8E8E93" },
  { iconId: "gifts", name: "禮物捐款", color: "#FF9500" },
  { iconId: "travel", name: "旅遊", color: "#34C759" },
  { iconId: "pets", name: "寵物", color: "#FFCC00" },
  { iconId: "subscriptions", name: "訂閱服務", color: "#5856D6" },
];

const income = [
  { iconId: "salary", name: "薪資", color: "#34C759" },
  { iconId: "freelance", name: "接案收入", color: "#5AC8FA" },
  { iconId: "investment", name: "投資收入", color: "#007AFF" },
  { iconId: "bonus", name: "獎金", color: "#AF52DE" },
  { iconId: "refund", name: "退款", color: "#FFCC00" },
];

export function Categories() {
  return (
    <div className="p-8 max-w-[700px] fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">類別</h2>
          <p className="text-text-quaternary text-[12px] mt-1">管理支出與收入分類</p>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-bg-card border border-border text-[13px] text-text-secondary hover:bg-bg-hover transition-colors">
          <Plus className="w-3.5 h-3.5" />
          新增類別
        </button>
      </div>

      <section className="mb-8">
        <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3 px-1">支出</p>
        <div className="grid grid-cols-4 gap-1.5">
          {expense.map((c) => (
            <div key={c.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer">
              <CategoryIcon iconId={c.iconId} color={c.color} size="sm" />
              <span className="text-[13px] text-text-primary truncate">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3 px-1">收入</p>
        <div className="grid grid-cols-4 gap-1.5">
          {income.map((c) => (
            <div key={c.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer">
              <CategoryIcon iconId={c.iconId} color={c.color} size="sm" />
              <span className="text-[13px] text-text-primary truncate">{c.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
