import { useEffect, useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { useAccountStore } from "../stores/accountStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { Modal } from "../components/Modal";

export function Accounts() {
  const { accounts, fetch, create } = useAccountStore();
  const { formatWithSymbol, activeCurrencies, fetchActive } = useCurrencyStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch();
    fetchActive();
  }, []);

  const assets = accounts.filter((a) => a.type === "asset" && !a.isArchived);
  const liabilities = accounts.filter((a) => a.type === "liability" && !a.isArchived);
  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="p-8 max-w-[700px] animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">帳戶</h2>
          <p className="text-text-tertiary text-[12px] mt-1">
            {accounts.filter((a) => !a.isArchived).length} 個帳戶
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-light transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新增帳戶
        </button>
      </div>

      {accounts.filter((a) => !a.isArchived).length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-text-tertiary text-[14px] mb-3">尚未建立帳戶</p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-accent-light text-[13px] hover:text-accent transition-colors"
          >
            建立第一個帳戶
          </button>
        </div>
      ) : (
        <>
          {assets.length > 0 && (
            <Section label="資產" total={formatWithSymbol(totalAssets, "TWD")} totalColor="text-income" accounts={assets} formatBalance={formatWithSymbol} />
          )}
          {liabilities.length > 0 && (
            <Section label="負債" total={formatWithSymbol(totalLiabilities, "TWD")} totalColor="text-expense" accounts={liabilities} formatBalance={formatWithSymbol} />
          )}
        </>
      )}

      <CreateAccountModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        currencies={activeCurrencies}
        onCreate={create}
      />
    </div>
  );
}

function Section({ label, total, totalColor, accounts, formatBalance }: {
  label: string;
  total: string;
  totalColor: string;
  accounts: any[];
  formatBalance: (amount: number, code: string) => string;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">{label}</span>
        <span className={`text-[12px] font-medium amount-large ${totalColor}`}>{total}</span>
      </div>
      <div className="glass-card overflow-hidden divide-y divide-border">
        {accounts.map((a: any) => (
          <div key={a.id} className="flex items-center justify-between px-4 py-4 hover:bg-bg-card-hover transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center">
                <span className="text-[13px] text-text-secondary font-medium">{a.currencyCode.slice(0, 2)}</span>
              </div>
              <div>
                <p className="text-[14px] text-text-primary font-medium">{a.name}</p>
                <p className="text-[11px] text-text-tertiary mt-0.5">{a.currencyCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[15px] font-semibold text-text-primary amount-large">
                {formatBalance(a.balance, a.currencyCode)}
              </p>
              <MoreHorizontal className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CreateAccountModal({ isOpen, onClose, currencies, onCreate }: {
  isOpen: boolean;
  onClose: () => void;
  currencies: any[];
  onCreate: (data: any) => Promise<any>;
}) {
  const [name, setName] = useState("");
  const [currencyCode, setCurrencyCode] = useState("TWD");
  const [type, setType] = useState<"asset" | "liability">("asset");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onCreate({
      name: name.trim(),
      currencyCode,
      type,
      subtype: type === "asset" ? "checking" : "credit_card",
      initialBalance: 0,
      sortOrder: 0,
    });
    setSaving(false);
    setName("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增帳戶" size="sm">
      <div className="space-y-4">
        <div>
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5">名稱</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="帳戶名稱"
            autoFocus
            className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
          />
        </div>

        <div>
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5">幣別</p>
          <select
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary focus:outline-none focus:border-accent/50"
          >
            {currencies.map((c: any) => (
              <option key={c.code} value={c.code}>{c.code} — {c.nameZh || c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5">類型</p>
          <div className="flex gap-2">
            {(["asset", "liability"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  type === t ? "bg-accent/15 text-accent-light ring-1 ring-accent/30" : "bg-bg-elevated text-text-tertiary"
                }`}
              >
                {t === "asset" ? "資產" : "負債"}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="w-full py-3 rounded-xl bg-accent text-white text-[14px] font-medium hover:bg-accent-light transition-colors disabled:opacity-40"
        >
          {saving ? "建立中..." : "建立"}
        </button>
      </div>
    </Modal>
  );
}
