import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ArrowLeftRight } from "lucide-react";
import { CategoryIcon } from "../components/CategoryIcon";
import { useCategoryStore } from "../stores/categoryStore";
import { useTransactionStore } from "../stores/transactionStore";
import { useCurrencyStore } from "../stores/currencyStore";

export function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const { transactions, fetch: fetchTransactions } = useTransactionStore();
  const { formatWithSymbol, fetchAll: fetchCurrencies } = useCurrencyStore();

  useEffect(() => {
    fetchCurrencies();
    fetchCategories();
    if (id) fetchTransactions({ categoryId: id });
  }, [id]);

  const category = categories.find((c) => c.id === id);

  if (!category) {
    return (
      <div className="p-8 animate-fade-in">
        <p className="text-text-muted text-[14px]">類別不存在</p>
        <button onClick={() => navigate("/categories")} className="text-accent-light text-[13px] mt-2 hover:text-accent transition-colors">
          返回類別列表
        </button>
      </div>
    );
  }

  const categoryTxns = transactions.filter((t) => t.categoryId === id);
  const total = categoryTxns.reduce((s, t) => s + t.amount, 0);
  const typeLabel = category.type === "income" ? "收入" : "支出";

  // Group by month for a simple breakdown
  const monthlyMap = new Map<string, number>();
  for (const txn of categoryTxns) {
    const month = txn.date.slice(0, 7); // "2026-03"
    monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + txn.amount);
  }
  const monthlyBreakdown = [...monthlyMap.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, amount]) => ({ month, amount }));

  return (
    <div className="p-8 max-w-[700px] animate-fade-in">
      {/* Back */}
      <Link
        to="/categories"
        className="inline-flex items-center gap-1 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors mb-6"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        類別
      </Link>

      {/* Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <CategoryIcon iconId={category.icon} color={category.color} size="lg" />
          <div>
            <h2 className="text-[20px] font-bold text-text-primary">{category.nameZh || category.name}</h2>
            <p className="text-[12px] text-text-tertiary">
              {typeLabel} · {categoryTxns.length} 筆交易
            </p>
          </div>
        </div>

        <p className={`text-[32px] font-bold amount-large leading-none ${
          category.type === "income" ? "text-income" : "text-expense"
        }`}>
          {category.type === "income" ? "+" : "-"}{formatWithSymbol(total, "TWD").replace(/^[^0-9]*/, "")}
        </p>
        <p className="text-[11px] text-text-tertiary mt-1.5">累計（以新台幣顯示）</p>
      </div>

      {/* Monthly breakdown */}
      {monthlyBreakdown.length > 0 && (
        <section className="mb-6">
          <h3 className="text-[13px] font-medium text-text-secondary mb-3">月度統計</h3>
          <div className="glass-card overflow-hidden divide-y divide-border">
            {monthlyBreakdown.map(({ month, amount }) => {
              const maxAmount = monthlyBreakdown[0]?.amount ?? 1;
              const [y, m] = month.split("-");
              return (
                <div key={month} className="px-4 py-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-text-primary">{y}年{parseInt(m)}月</span>
                    <span className={`text-[13px] font-medium amount-large ${
                      category.type === "income" ? "text-income" : "text-text-primary"
                    }`}>
                      {formatWithSymbol(amount, "TWD")}
                    </span>
                  </div>
                  <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(amount / maxAmount) * 100}%`,
                        backgroundColor: category.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Transaction list */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-medium text-text-secondary">交易紀錄</h3>
        <span className="text-[12px] text-text-tertiary">{categoryTxns.length} 筆</span>
      </div>

      {categoryTxns.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-text-muted text-[13px]">此類別尚無交易</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden divide-y divide-border">
          {categoryTxns.map((txn) => (
            <div
              key={txn.id}
              onClick={() => navigate(`/transactions/${txn.id}`)}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-bg-card-hover transition-colors cursor-pointer"
            >
              <div>
                <p className="text-[13px] text-text-primary">{txn.note || txn.accountName}</p>
                <p className="text-[11px] text-text-tertiary mt-0.5">{txn.accountName} · {txn.date}</p>
              </div>
              <p className={`text-[13px] font-medium amount-large ${
                txn.type === "income" ? "text-income" : "text-text-primary"
              }`}>
                {txn.type === "income" ? "+" : "-"}
                {formatWithSymbol(txn.amount, txn.accountCurrency)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
