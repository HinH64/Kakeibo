import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Pencil, Trash2, ArrowRight, ArrowLeftRight } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { useModalStore } from "../stores/modalStore";

export function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, fetch: fetchTransactions, remove } = useTransactionStore();
  const { formatWithSymbol, fetchAll: fetchCurrencies } = useCurrencyStore();
  const { openTransactionForm } = useModalStore();
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    fetchCurrencies();
    fetchTransactions();
  }, []);

  const txn = transactions.find((t) => t.id === id);

  if (!txn) {
    return (
      <div className="p-8 animate-fade-in">
        <p className="text-text-muted text-[14px]">交易不存在</p>
        <button onClick={() => navigate("/transactions")} className="text-accent-light text-[13px] mt-2 hover:text-accent transition-colors">
          返回交易列表
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    await remove(txn.id);
    navigate("/transactions");
  };

  const typeLabel = txn.type === "income" ? "收入" : txn.type === "expense" ? "支出" : "轉帳";
  const typeColor = txn.type === "income" ? "text-income" : txn.type === "expense" ? "text-expense" : "text-transfer";

  return (
    <div className="p-8 max-w-[700px] animate-fade-in">
      {/* Back */}
      <Link
        to="/transactions"
        className="inline-flex items-center gap-1 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors mb-6"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        交易紀錄
      </Link>

      {/* Main card */}
      <div className="glass-card p-6 mb-6">
        {/* Type + amount */}
        <div className="flex items-center justify-between mb-6">
          <span className={`text-[12px] font-medium px-2.5 py-1 rounded-lg ${
            txn.type === "income" ? "bg-income/10 text-income" :
            txn.type === "expense" ? "bg-expense/10 text-expense" :
            "bg-transfer/10 text-transfer"
          }`}>
            {typeLabel}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openTransactionForm(txn.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg-elevated transition-colors"
            >
              <Pencil className="w-4 h-4 text-text-tertiary" />
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-expense/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-expense" />
            </button>
          </div>
        </div>

        {/* Amount display */}
        <p className={`text-[36px] font-bold amount-large leading-none mb-2 ${typeColor}`}>
          {txn.type === "income" ? "+" : txn.type === "expense" ? "-" : ""}
          {formatWithSymbol(txn.amount, txn.accountCurrency)}
        </p>

        {/* Transfer destination amount */}
        {txn.type === "transfer" && txn.toAmount && txn.toAccountCurrency && (
          <div className="flex items-center gap-2 mt-3">
            <ArrowRight className="w-4 h-4 text-text-muted" />
            <p className="text-[20px] font-semibold text-transfer amount-large">
              {formatWithSymbol(txn.toAmount, txn.toAccountCurrency)}
            </p>
          </div>
        )}

        {/* Exchange rate */}
        {txn.exchangeRate && (
          <p className="text-[11px] text-text-tertiary mt-2">
            匯率: 1 {txn.accountCurrency} = {txn.exchangeRate.toFixed(4)} {txn.toAccountCurrency}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="glass-card overflow-hidden divide-y divide-border">
        {/* Date */}
        <DetailRow label="日期" value={txn.date} />

        {/* Account */}
        <DetailRow
          label={txn.type === "transfer" ? "從" : "帳戶"}
          value={txn.accountName}
          sub={txn.accountCurrency}
          linkTo={`/accounts/${txn.accountId}`}
        />

        {/* To Account (transfer) */}
        {txn.type === "transfer" && txn.toAccountId && (
          <DetailRow
            label="到"
            value={txn.toAccountName ?? ""}
            sub={txn.toAccountCurrency}
            linkTo={`/accounts/${txn.toAccountId}`}
          />
        )}

        {/* Category */}
        {txn.categoryId && (
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[12px] text-text-tertiary">類別</span>
            <Link
              to={`/categories/${txn.categoryId}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <CategoryIcon iconId={txn.categoryIcon ?? "other-expense"} color="#7a756b" size="sm" />
              <span className="text-[13px] text-text-primary">{txn.categoryName}</span>
            </Link>
          </div>
        )}

        {/* Note */}
        {txn.note && <DetailRow label="備註" value={txn.note} />}

        {/* Tags */}
        {txn.tagNames && txn.tagNames.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[12px] text-text-tertiary">標籤</span>
            <div className="flex gap-1.5">
              {txn.tagNames.map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-bg-elevated text-text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        title="刪除交易"
        message="確定要刪除這筆交易嗎？此操作無法復原。"
        confirmLabel="刪除"
        variant="danger"
      />
    </div>
  );
}

function DetailRow({ label, value, sub, linkTo }: { label: string; value: string; sub?: string; linkTo?: string }) {
  const content = (
    <div className="text-right">
      <span className="text-[13px] text-text-primary">{value}</span>
      {sub && <span className="text-[11px] text-text-tertiary ml-1.5">{sub}</span>}
    </div>
  );

  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[12px] text-text-tertiary">{label}</span>
      {linkTo ? (
        <Link to={linkTo} className="hover:opacity-80 transition-opacity">{content}</Link>
      ) : content}
    </div>
  );
}
