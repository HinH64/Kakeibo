import { useCategoryStore } from "../stores/categoryStore";
import { CategoryIcon } from "./CategoryIcon";

interface CategoryPickerProps {
  type: "income" | "expense";
  selectedId?: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategoryPicker({ type, selectedId, onSelect }: CategoryPickerProps) {
  const { expenseCategories, incomeCategories } = useCategoryStore();
  const categories = type === "expense" ? expenseCategories : incomeCategories;

  return (
    <div className="grid grid-cols-4 gap-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex items-center gap-2 px-2.5 py-2 rounded-xl transition-colors ${
            selectedId === cat.id
              ? "bg-accent/15 ring-1 ring-accent/30"
              : "hover:bg-bg-card-hover"
          }`}
        >
          <CategoryIcon iconId={cat.icon} color={cat.color} size="sm" />
          <span className="text-[12px] text-text-primary truncate">{cat.nameZh || cat.name}</span>
        </button>
      ))}
    </div>
  );
}
