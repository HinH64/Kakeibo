import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  currencies,
  accounts,
  categories,
  transactions,
  tags,
  exchangeRates,
  budgets,
  settings,
} from "../db/schema.js";

// Select types (what you get back from queries)
export type Currency = InferSelectModel<typeof currencies>;
export type Account = InferSelectModel<typeof accounts>;
export type Category = InferSelectModel<typeof categories>;
export type Transaction = InferSelectModel<typeof transactions>;
export type Tag = InferSelectModel<typeof tags>;
export type ExchangeRate = InferSelectModel<typeof exchangeRates>;
export type Budget = InferSelectModel<typeof budgets>;
export type Setting = InferSelectModel<typeof settings>;

// Insert types (what you pass to create)
export type NewCurrency = InferInsertModel<typeof currencies>;
export type NewAccount = InferInsertModel<typeof accounts>;
export type NewCategory = InferInsertModel<typeof categories>;
export type NewTransaction = InferInsertModel<typeof transactions>;
export type NewTag = InferInsertModel<typeof tags>;
export type NewExchangeRate = InferInsertModel<typeof exchangeRates>;
export type NewBudget = InferInsertModel<typeof budgets>;

// ─── View Models ─────────────────────────────────────────────────────────────

export interface AccountWithBalance extends Account {
  balance: number; // computed current balance in smallest currency unit
  balanceInReportingCurrency?: number; // converted to reporting currency
}

export interface TransactionWithDetails extends Transaction {
  accountName: string;
  accountCurrency: string;
  categoryName?: string;
  categoryIcon?: string;
  toAccountName?: string;
  toAccountCurrency?: string;
  tagNames: string[];
}

export interface NetWorthSummary {
  reportingCurrency: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  byAccount: AccountWithBalance[];
}

export interface SpendingSummary {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number; // in reporting currency
  percentage: number;
}

export interface MonthlyTrend {
  month: string; // "2026-03"
  income: number;
  expense: number;
  net: number;
}
