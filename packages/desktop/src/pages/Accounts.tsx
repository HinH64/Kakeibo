import { Plus, Landmark, Banknote, DollarSign, Euro, CreditCard, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Acc {
  id: string; name: string; type: "asset" | "liability";
  currency: string; symbol: string; balance: string;
  balanceInReporting?: string; Icon: LucideIcon;
}

const demo: Acc[] = [
  { id: "1", name: "台幣活存", type: "asset", currency: "TWD", symbol: "NT$", balance: "125,800", Icon: Landmark },
  { id: "2", name: "日圓現金", type: "asset", currency: "JPY", symbol: "¥", balance: "45,200", balanceInReporting: "≈ NT$9,450", Icon: Banknote },
  { id: "3", name: "USD Checking", type: "asset", currency: "USD", symbol: "$", balance: "2,350.00", balanceInReporting: "≈ NT$63,300", Icon: DollarSign },
  { id: "4", name: "EUR 旅遊基金", type: "asset", currency: "EUR", symbol: "€", balance: "500.00", balanceInReporting: "≈ NT$17,200", Icon: Euro },
  { id: "5", name: "信用卡", type: "liability", currency: "TWD", symbol: "NT$", balance: "8,200", Icon: CreditCard },
];

export function Accounts() {
  const assets = demo.filter((a) => a.type === "asset");
  const liabilities = demo.filter((a) => a.type === "liability");

  return (
    <div className="p-8 max-w-[700px] animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">帳戶</h2>
          <p className="text-text-tertiary text-[12px] mt-1">4 個帳戶 · 4 種幣別</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-primary text-white text-[13px] font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" />
          新增帳戶
        </button>
      </div>

      <Section label="資產" total="NT$215,750" totalColor="text-income" accounts={assets} />
      <Section label="負債" total="NT$8,200" totalColor="text-expense" accounts={liabilities} />
    </div>
  );
}

function Section({ label, total, totalColor, accounts }: { label: string; total: string; totalColor: string; accounts: Acc[] }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">{label}</span>
        <span className={`text-[12px] font-medium amount-large ${totalColor}`}>{total}</span>
      </div>
      <div className="glass-card overflow-hidden divide-y divide-border">
        {accounts.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-4 py-4 hover:bg-bg-card-hover transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center">
                <a.Icon className="w-[18px] h-[18px] text-text-secondary" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[14px] text-text-primary font-medium">{a.name}</p>
                <p className="text-[11px] text-text-tertiary mt-0.5">{a.currency}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[15px] font-semibold text-text-primary amount-large">{a.symbol}{a.balance}</p>
                {a.balanceInReporting && <p className="text-[11px] text-text-tertiary mt-0.5">{a.balanceInReporting}</p>}
              </div>
              <MoreHorizontal className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
