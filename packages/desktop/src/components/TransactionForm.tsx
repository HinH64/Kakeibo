import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { AmountInput } from "./AmountInput";
import { CategoryPicker } from "./CategoryPicker";
import { AccountPicker } from "./AccountPicker";
import { useAccountStore } from "../stores/accountStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { useCategoryStore } from "../stores/categoryStore";
import { useTransactionStore } from "../stores/transactionStore";
import { useModalStore } from "../stores/modalStore";
import { useSettingsStore } from "../stores/settingsStore";
import { ArrowRight } from "lucide-react";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTransactionId?: string | null;
}

type TxnType = "expense" | "income" | "transfer";

export function TransactionForm({ isOpen, onClose, editTransactionId }: TransactionFormProps) {
  const { accounts, fetch: fetchAccounts } = useAccountStore();
  const { toSmallestUnit, getCurrency, fetchAll: fetchCurrencies } = useCurrencyStore();
  const { fetch: fetchCategories } = useCategoryStore();
  const { create, update, transactions } = useTransactionStore();
  const { defaultDate } = useModalStore();

  // Ensure stores are loaded when form opens
  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      fetchCurrencies();
      fetchCategories();
    }
  }, [isOpen]);

  const [type, setType] = useState<TxnType>("expense");
  const [amount, setAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [accountId, setAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);
  const { reportingCurrency } = useSettingsStore();
  const currencyCode = selectedAccount?.currencyCode ?? reportingCurrency;
  const toCurrencyCode = toAccount?.currencyCode ?? reportingCurrency;
  const isCrossCurrency = type === "transfer" && currencyCode !== toCurrencyCode;

  // Load edit data
  useEffect(() => {
    if (editTransactionId && isOpen) {
      const txn = transactions.find((t) => t.id === editTransactionId);
      if (txn) {
        setType(txn.type as TxnType);
        const c = getCurrency(txn.accountCurrency);
        const divisor = Math.pow(10, c?.decimalPlaces ?? 0);
        setAmount(txn.amount / divisor);
        setAccountId(txn.accountId);
        setCategoryId(txn.categoryId ?? "");
        setDate(txn.date);
        setNote(txn.note ?? "");
        if (txn.toAccountId) setToAccountId(txn.toAccountId);
        if (txn.toAmount) {
          const tc = getCurrency(txn.toAccountCurrency ?? "");
          const tdivisor = Math.pow(10, tc?.decimalPlaces ?? 0);
          setToAmount(txn.toAmount / tdivisor);
        }
      }
    } else if (isOpen) {
      // Reset form
      setType("expense");
      setAmount(0);
      setToAmount(0);
      setAccountId(accounts[0]?.id ?? "");
      setToAccountId("");
      setCategoryId("");
      setDate(defaultDate ?? new Date().toISOString().slice(0, 10));
      setNote("");
    }
  }, [editTransactionId, isOpen, accounts, transactions, getCurrency, defaultDate]);

  const handleSave = async () => {
    if (!accountId || amount <= 0) return;
    if (type !== "transfer" && !categoryId) return;
    if (type === "transfer" && !toAccountId) return;

    setSaving(true);
    const amountSmallest = toSmallestUnit(amount, currencyCode);

    const data: any = {
      type,
      amount: amountSmallest,
      date,
      accountId,
      categoryId: type === "transfer" ? null : categoryId,
      note: note || null,
      toAccountId: type === "transfer" ? toAccountId : null,
      toAmount: type === "transfer" && isCrossCurrency ? toSmallestUnit(toAmount, toCurrencyCode) : type === "transfer" ? amountSmallest : null,
      exchangeRate: isCrossCurrency && toAmount > 0 && amount > 0 ? toAmount / amount : null,
    };

    if (editTransactionId) {
      await update(editTransactionId, data);
    } else {
      await create(data);
    }

    setSaving(false);
    onClose();
  };

  const typeButtons: { value: TxnType; label: string }[] = [
    { value: "expense", label: "支出" },
    { value: "income", label: "收入" },
    { value: "transfer", label: "轉帳" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTransactionId ? "編輯交易" : "新增交易"} size="md">
      <div className="space-y-5">
        {/* Type tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-bg-elevated">
          {typeButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setType(btn.value)}
              className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                type === btn.value
                  ? "bg-bg-card text-text-primary shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="py-3 border-b border-border">
          <AmountInput
            value={amount}
            onChange={setAmount}
            currencyCode={currencyCode}
            autoFocus
          />
        </div>

        {/* Transfer: destination amount (cross-currency) */}
        {isCrossCurrency && (
          <div className="py-3 border-b border-border">
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">目標金額</p>
            <AmountInput
              value={toAmount}
              onChange={setToAmount}
              currencyCode={toCurrencyCode}
            />
            {amount > 0 && toAmount > 0 && (
              <p className="text-[11px] text-text-muted mt-1">
                匯率: 1 {currencyCode} = {(toAmount / amount).toFixed(4)} {toCurrencyCode}
              </p>
            )}
          </div>
        )}

        {/* Account */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <AccountPicker
              label={type === "transfer" ? "從" : "帳戶"}
              selectedId={accountId}
              onSelect={setAccountId}
              excludeId={type === "transfer" ? toAccountId : undefined}
            />
          </div>
          {type === "transfer" && (
            <>
              <ArrowRight className="w-4 h-4 text-text-muted mb-3" />
              <div className="flex-1">
                <AccountPicker
                  label="到"
                  selectedId={toAccountId}
                  onSelect={setToAccountId}
                  excludeId={accountId}
                />
              </div>
            </>
          )}
        </div>

        {/* Category (not for transfers) */}
        {type !== "transfer" && (
          <div>
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">類別</p>
            <CategoryPicker
              type={type}
              selectedId={categoryId}
              onSelect={setCategoryId}
            />
          </div>
        )}

        {/* Date */}
        <div>
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5">日期</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Note */}
        <div>
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5">備註</p>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="選填..."
            className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || amount <= 0 || !accountId}
          className="w-full py-3 rounded-xl bg-accent text-white text-[14px] font-medium hover:bg-accent-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "儲存中..." : editTransactionId ? "更新" : "儲存"}
        </button>
      </div>
    </Modal>
  );
}
