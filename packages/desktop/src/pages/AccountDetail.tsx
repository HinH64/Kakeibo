import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Pencil, Archive, ArrowLeftRight } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";
import { useAccountStore } from "../stores/accountStore";
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { useModalStore } from "../stores/modalStore";

export function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accounts, fetch: fetchAccounts } = useAccountStore();
  const { transactions, fetch: fetchTransactions } = useTransactionStore();
  const { formatWithSymbol, fetchAll: fetchCurrencies } = useCurrencyStore();
  const { openTransactionForm } = useModalStore();

  useEffect(() => {
    fetchCurrencies();
    fetchAccounts();
    if (id) fetchTransactions({ accountId: id });
  }, [id]);

  const account = accounts.find((a) => a.id === id);

  if (!account) {
    return (
      <div className="p-8 animate-fade-in">
        <p className="text-text-muted text-[14px]">帳戶不存在</p>
        <button onClick={() => navigate("/accounts")} className="text-accent-light text-[13px] mt-2 hover:text-accent transition-colors">
          返回帳戶列表
        </button>
      </div>
    );
  }

  const accountTxns = transactions.filter(
    (t) => t.accountId === id || t.toAccountId === id
  );

  const income = accountTxns
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = accountTxns
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-8 max-w-[700px] animate-fade-in">
      {/* Back */}
      <Link
        to="/accounts"
        className="inline-flex items-center gap-1 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors mb-6"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        帳戶
      </Link>

      {/* Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center">
              <span className="text-[16px] text-text-secondary font-semibold">{account.currencyCode.slice(0, 2)}</span>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-text-primary">{account.name}</h2>
              <p className="text-[12px] text-text-tertiary">
                {account.currencyCode} · {account.type === "asset" ? "資產" : "負債"}{account.subtype ? ` · ${subtypeLabel(account.subtype)}` : ""}
              </p>
            </div>
          </div>
        </div>

        <p className="text-[36px] font-bold text-text-primary amount-large leading-none">
          {formatWithSymbol(account.balance, account.currencyCode)}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-1">收入</p>
          <p className="text-[20px] font-bold text-income amount-large">
            +{formatWithSymbol(income, account.currencyCode).replace(/^[^0-9]*/, "")}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-1">支出</p>
          <p className="text-[20px] font-bold text-expense amount-large">
            -{formatWithSymbol(expense, account.currencyCode).replace(/^[^0-9]*/, "")}
          </p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-medium text-text-secondary">交易紀錄</h3>
        <span className="text-[12px] text-text-tertiary">{accountTxns.length} 筆</span>
      </div>

      {accountTxns.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-text-muted text-[13px]">此帳戶尚無交易</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden divide-y divide-border">
          {accountTxns.map((txn) => (
            <div
              key={txn.id}
              onClick={() => navigate(`/transactions/${txn.id}`)}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-bg-card-hover transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {txn.type === "transfer" ? (
                  <div className="w-8 h-8 rounded-xl bg-transfer/10 flex items-center justify-center shrink-0">
                    <ArrowLeftRight className="w-4 h-4 text-transfer" strokeWidth={1.8} />
                  </div>
                ) : (
                  <CategoryIcon iconId={txn.categoryIcon ?? "other-expense"} color="#7a756b" size="sm" />
                )}
                <div>
                  <p className="text-[13px] text-text-primary">{txn.note || txn.categoryName || "轉帳"}</p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    {txn.type === "transfer" ? `轉帳${txn.toAccountId === id ? " (入)" : " (出)"}` : txn.categoryName} · {txn.date}
                  </p>
                </div>
              </div>
              <p className={`text-[13px] font-medium amount-large ${
                txn.type === "income" ? "text-income" : txn.type === "transfer" ? "text-transfer" : "text-text-primary"
              }`}>
                {txn.type === "income" ? "+" : txn.type === "expense" ? "-" : ""}
                {formatWithSymbol(txn.amount, txn.accountCurrency)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function subtypeLabel(subtype: string): string {
  const map: Record<string, string> = {
    checking: "活存",
    savings: "儲蓄",
    cash: "現金",
    credit_card: "信用卡",
    investment: "投資",
  };
  return map[subtype] ?? subtype;
}
