import { useAccountStore } from "../stores/accountStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface AccountPickerProps {
  selectedId?: string | null;
  onSelect: (accountId: string) => void;
  excludeId?: string;
  label?: string;
}

export function AccountPicker({ selectedId, onSelect, excludeId, label }: AccountPickerProps) {
  const { accounts } = useAccountStore();
  const { formatWithSymbol } = useCurrencyStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = accounts.filter((a) => !a.isArchived && a.id !== excludeId);
  const selected = accounts.find((a) => a.id === selectedId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5">{label}</p>}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] hover:bg-bg-card-hover transition-colors"
      >
        <span className={selected ? "text-text-primary" : "text-text-muted"}>
          {selected ? `${selected.name} (${selected.currencyCode})` : "選擇帳戶"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-10 glass-card overflow-hidden divide-y divide-border">
          {filtered.map((acc) => (
            <button
              key={acc.id}
              onClick={() => { onSelect(acc.id); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-[13px] hover:bg-bg-card-hover transition-colors ${
                acc.id === selectedId ? "bg-accent/10" : ""
              }`}
            >
              <div>
                <span className="text-text-primary">{acc.name}</span>
                <span className="text-text-tertiary ml-1.5">{acc.currencyCode}</span>
              </div>
              <span className="text-text-tertiary amount-large text-[12px]">
                {formatWithSymbol(acc.balance, acc.currencyCode)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
