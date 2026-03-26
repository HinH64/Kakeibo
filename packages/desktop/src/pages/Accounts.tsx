import { Plus, Landmark, Banknote, DollarSign, Euro, CreditCard, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Acc {
  id: string; name: string; type: "asset" | "liability";
  currency: string; symbol: string; balance: string;
  sub?: string; Icon: LucideIcon;
}

const demo: Acc[] = [
  { id: "1", name: "台幣活存", type: "asset", currency: "TWD", symbol: "NT$", balance: "125,800", Icon: Landmark },
  { id: "2", name: "日圓現金", type: "asset", currency: "JPY", symbol: "¥", balance: "45,200", sub: "≈ NT$9,450", Icon: Banknote },
  { id: "3", name: "USD Checking", type: "asset", currency: "USD", symbol: "$", balance: "2,350.00", sub: "≈ NT$63,300", Icon: DollarSign },
  { id: "4", name: "EUR 旅遊基金", type: "asset", currency: "EUR", symbol: "€", balance: "500.00", sub: "≈ NT$17,200", Icon: Euro },
  { id: "5", name: "信用卡", type: "liability", currency: "TWD", symbol: "NT$", balance: "8,200", Icon: CreditCard },
];

export function Accounts() {
  const assets = demo.filter((a) => a.type === "asset");
  const liabilities = demo.filter((a) => a.type === "liability");

  return (
    <div className="p-8 max-w-[700px] fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">帳戶</h2>
          <p className="text-text-quaternary text-[12px] mt-1">4 個帳戶 · 4 種幣別</p>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors">
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
        <span className={`text-[12px] font-medium amt ${totalColor}`}>{total}</span>
      </div>
      <div className="rounded-xl bg-bg-card overflow-hidden divide-y divide-border">
        {accounts.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-bg-hover transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <a.Icon className="w-[18px] h-[18px] text-text-tertiary" strokeWidth={1.5} />
              <div>
                <p className="text-[14px] text-text-primary">{a.name}</p>
                <p className="text-[11px] text-text-quaternary mt-0.5">{a.currency}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[15px] font-medium text-text-primary amt">{a.symbol}{a.balance}</p>
                {a.sub && <p className="text-[11px] text-text-quaternary mt-0.5">{a.sub}</p>}
              </div>
              <MoreHorizontal className="w-4 h-4 text-text-quaternary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
