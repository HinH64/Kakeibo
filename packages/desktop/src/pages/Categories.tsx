import { Plus } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";

const expense = [
  { iconId: "food", name: "餐飲", color: "#c27258" },
  { iconId: "groceries", name: "食材雜貨", color: "#c9944a" },
  { iconId: "transport", name: "交通", color: "#6588a8" },
  { iconId: "housing", name: "居住", color: "#5e9a9a" },
  { iconId: "utilities", name: "水電瓦斯", color: "#b8a44e" },
  { iconId: "entertainment", name: "娛樂", color: "#9878a8" },
  { iconId: "shopping", name: "購物", color: "#c9944a" },
  { iconId: "health", name: "醫療", color: "#b06880" },
  { iconId: "education", name: "教育", color: "#7a78a8" },
  { iconId: "personal", name: "個人護理", color: "#b06880" },
  { iconId: "clothing", name: "服飾", color: "#9878a8" },
  { iconId: "insurance", name: "保險", color: "#7a756b" },
  { iconId: "gifts", name: "禮物捐款", color: "#c9944a" },
  { iconId: "travel", name: "旅遊", color: "#6b9a6b" },
  { iconId: "pets", name: "寵物", color: "#b8a44e" },
  { iconId: "subscriptions", name: "訂閱服務", color: "#7a78a8" },
];

const income = [
  { iconId: "salary", name: "薪資", color: "#6b9a6b" },
  { iconId: "freelance", name: "接案收入", color: "#5e9a9a" },
  { iconId: "investment", name: "投資收入", color: "#6588a8" },
  { iconId: "bonus", name: "獎金", color: "#9878a8" },
  { iconId: "refund", name: "退款", color: "#b8a44e" },
];

export function Categories() {
  return (
    <div className="p-8 max-w-[700px] animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">類別</h2>
          <p className="text-text-tertiary text-[12px] mt-1">管理支出與收入分類</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-primary text-white text-[13px] font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" />
          新增類別
        </button>
      </div>

      <section className="mb-8">
        <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3 px-1">支出</p>
        <div className="glass-card p-3">
          <div className="grid grid-cols-4 gap-1">
            {expense.map((c) => (
              <div key={c.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-bg-card-hover transition-colors cursor-pointer">
                <CategoryIcon iconId={c.iconId} color={c.color} size="sm" />
                <span className="text-[13px] text-text-primary truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3 px-1">收入</p>
        <div className="glass-card p-3">
          <div className="grid grid-cols-4 gap-1">
            {income.map((c) => (
              <div key={c.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-bg-card-hover transition-colors cursor-pointer">
                <CategoryIcon iconId={c.iconId} color={c.color} size="sm" />
                <span className="text-[13px] text-text-primary truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
