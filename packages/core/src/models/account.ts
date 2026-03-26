import { eq, and, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { accounts, transactions } from "../db/schema.js";
import type { KakeiboDB } from "../db/index.js";
import type { Account, NewAccount, AccountWithBalance } from "../types/index.js";

export class AccountModel {
  constructor(private db: KakeiboDB) {}

  create(data: Omit<NewAccount, "id" | "createdAt" | "updatedAt">): Account {
    const id = uuid();
    const now = new Date().toISOString();
    const result = this.db
      .insert(accounts)
      .values({ ...data, id, createdAt: now, updatedAt: now })
      .returning()
      .get();
    return result;
  }

  getById(id: string): Account | undefined {
    return this.db.select().from(accounts).where(eq(accounts.id, id)).get();
  }

  list(options?: { includeArchived?: boolean }): Account[] {
    if (options?.includeArchived) {
      return this.db
        .select()
        .from(accounts)
        .orderBy(accounts.sortOrder)
        .all();
    }
    return this.db
      .select()
      .from(accounts)
      .where(eq(accounts.isArchived, false))
      .orderBy(accounts.sortOrder)
      .all();
  }

  update(
    id: string,
    data: Partial<Omit<NewAccount, "id" | "createdAt" | "updatedAt">>,
  ): Account | undefined {
    const now = new Date().toISOString();
    return this.db
      .update(accounts)
      .set({ ...data, updatedAt: now })
      .where(eq(accounts.id, id))
      .returning()
      .get();
  }

  archive(id: string): Account | undefined {
    return this.update(id, { isArchived: true });
  }

  /**
   * Calculate the current balance for an account.
   * Balance = initialBalance
   *   + SUM(income to this account)
   *   - SUM(expenses from this account)
   *   + SUM(transfers IN to this account)
   *   - SUM(transfers OUT from this account)
   */
  getBalance(accountId: string): number {
    const account = this.getById(accountId);
    if (!account) return 0;

    // Income to this account
    const incomeResult = this.db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, accountId),
          eq(transactions.type, "income"),
        ),
      )
      .get();

    // Expenses from this account
    const expenseResult = this.db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, accountId),
          eq(transactions.type, "expense"),
        ),
      )
      .get();

    // Transfers OUT from this account
    const transferOutResult = this.db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, accountId),
          eq(transactions.type, "transfer"),
        ),
      )
      .get();

    // Transfers IN to this account (use toAmount for cross-currency)
    const transferInResult = this.db
      .select({
        total: sql<number>`COALESCE(SUM(${transactions.toAmount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.toAccountId, accountId),
          eq(transactions.type, "transfer"),
        ),
      )
      .get();

    return (
      account.initialBalance +
      (incomeResult?.total ?? 0) -
      (expenseResult?.total ?? 0) -
      (transferOutResult?.total ?? 0) +
      (transferInResult?.total ?? 0)
    );
  }

  getWithBalance(accountId: string): AccountWithBalance | undefined {
    const account = this.getById(accountId);
    if (!account) return undefined;
    return { ...account, balance: this.getBalance(accountId) };
  }

  listWithBalances(options?: {
    includeArchived?: boolean;
  }): AccountWithBalance[] {
    const accountsList = this.list(options);
    return accountsList.map((account) => ({
      ...account,
      balance: this.getBalance(account.id),
    }));
  }
}
