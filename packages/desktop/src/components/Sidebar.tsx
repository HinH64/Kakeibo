import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tags,
  PiggyBank,
  Settings,
  Plus,
} from "lucide-react";
import { useModalStore } from "../stores/modalStore";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "總覽" },
  { to: "/accounts", icon: Wallet, label: "帳戶" },
  { to: "/transactions", icon: ArrowLeftRight, label: "交易" },
  { to: "/categories", icon: Tags, label: "類別" },
  { to: "/budgets", icon: PiggyBank, label: "預算" },
  { to: "/settings", icon: Settings, label: "設定" },
];

export function Sidebar() {
  const { openTransactionForm } = useModalStore();
  return (
    <aside className="w-[220px] h-screen bg-bg-sidebar flex flex-col border-r border-border">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-accent rounded-[10px] flex items-center justify-center">
            <span className="text-white text-lg font-bold">K</span>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-text-primary tracking-tight">
              Kakeibo
            </h1>
            <p className="text-[11px] text-text-tertiary">多幣別記帳</p>
          </div>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="px-4 mb-2">
        <button
          onClick={() => openTransactionForm()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增記錄
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent/12 text-accent-light"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4">
        <p className="text-[11px] text-text-muted">v0.1.0</p>
      </div>
    </aside>
  );
}
