import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";
import { useCategoryStore } from "../stores/categoryStore";

export function Categories() {
  const navigate = useNavigate();
  const { expenseCategories, incomeCategories, fetch } = useCategoryStore();

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="p-8 max-w-[700px] animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">類別</h2>
          <p className="text-text-tertiary text-[12px] mt-1">管理支出與收入分類</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-light transition-colors">
          <Plus className="w-3.5 h-3.5" />
          新增類別
        </button>
      </div>

      <section className="mb-8">
        <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3 px-1">支出</p>
        <div className="glass-card p-3">
          <div className="grid grid-cols-4 gap-1">
            {expenseCategories.map((c) => (
              <div key={c.id} onClick={() => navigate(`/categories/${c.id}`)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-bg-card-hover transition-colors cursor-pointer">
                <CategoryIcon iconId={c.icon} color={c.color} size="sm" />
                <span className="text-[13px] text-text-primary truncate">{c.nameZh || c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3 px-1">收入</p>
        <div className="glass-card p-3">
          <div className="grid grid-cols-4 gap-1">
            {incomeCategories.map((c) => (
              <div key={c.id} onClick={() => navigate(`/categories/${c.id}`)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-bg-card-hover transition-colors cursor-pointer">
                <CategoryIcon iconId={c.icon} color={c.color} size="sm" />
                <span className="text-[13px] text-text-primary truncate">{c.nameZh || c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
