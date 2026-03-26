import {
  Utensils,
  ShoppingCart,
  Car,
  Home,
  Lightbulb,
  Film,
  ShoppingBag,
  Heart,
  BookOpen,
  Sparkles,
  Shirt,
  Shield,
  Gift,
  Plane,
  PawPrint,
  Smartphone,
  Package,
  Wallet,
  Briefcase,
  TrendingUp,
  PartyPopper,
  RotateCcw,
  Banknote,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "food": Utensils,
  "groceries": ShoppingCart,
  "transport": Car,
  "housing": Home,
  "utilities": Lightbulb,
  "entertainment": Film,
  "shopping": ShoppingBag,
  "health": Heart,
  "education": BookOpen,
  "personal": Sparkles,
  "clothing": Shirt,
  "insurance": Shield,
  "gifts": Gift,
  "travel": Plane,
  "pets": PawPrint,
  "subscriptions": Smartphone,
  "other-expense": Package,
  "salary": Wallet,
  "freelance": Briefcase,
  "investment": TrendingUp,
  "bonus": PartyPopper,
  "refund": RotateCcw,
  "other-income": Banknote,
  "transfer": ArrowLeftRight,
};

interface CategoryIconProps {
  iconId: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { box: "w-8 h-8", icon: "w-4 h-4" },
  md: { box: "w-10 h-10", icon: "w-[18px] h-[18px]" },
  lg: { box: "w-12 h-12", icon: "w-5 h-5" },
};

export function CategoryIcon({ iconId, color, size = "md" }: CategoryIconProps) {
  const Icon = iconMap[iconId] || Package;
  const s = sizes[size];

  return (
    <div
      className={`${s.box} rounded-xl flex items-center justify-center shrink-0`}
      style={{ backgroundColor: color + "18" }}
    >
      <Icon className={s.icon} style={{ color }} strokeWidth={1.8} />
    </div>
  );
}

export { iconMap };
