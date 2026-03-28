import { eq, and, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { accounts, transactions } from "../db/schema.js";
import type { KakeiboDB } from "../db/index.js";
import type { Account, NewAccount, AccountWithBalance } from "../types/index.js";

export class AccountModel {
  constructor(private db: KakeiboDB) {}

  async create(data: Omit<NewAccount, "id" | "createdAt" | "updatedAt">): Promise<Account> {
    const id = uuid();
    const now = new Date().toISOString();
    const [result] = await this.db
      .insert(accounts)
      .values({ ...data, id, createdAt: now, updatedAt: now })
      .returning();
    return result;
  }

  async getById(id: string): Promise<Account | undefined> {
    const rows = await this.db.select().from(accounts).where(eq(accounts.id, id));
    return rows[0];
  }

  async list(options?: { includeArchived?: boolean }): Promise<Account[]> {
    if (options?.includeArchived) {
      return this.db
        .select()
        .from(accounts)
        .orderBy(accounts.sortOrder);
    }
    return this.db
      .select()
      .from(accounts)
      .where(eq(accounts.isArchived, false))
      .orderBy(accounts.sortOrder);
  }

  async update(
    id: string,
    data: Partial<Omit<NewAccount, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Account | undefined> {
    const now = new Date().toISOString();
    const [result] = await this.db
      .update(accounts)
      .set({ ...data, updatedAt: now })
      .where(eq(accounts.id, id))
      .returning();
    return result;
  }

  async archive(id: string): Promise<Account | undefined> {
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
  async getBalance(accountId: string): Promise<number> {
    const account = await this.getById(accountId);
    if (!account) return 0;

    // Income to this account
    const [incomeResult] = await this.db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, accountId),
          eq(transactions.type, "income"),
        ),
      );

    // Expenses from this account
    const [expenseResult] = await this.db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, accountId),
          eq(transactions.type, "expense"),
        ),
      );

    // Transfers OUT from this account
    const [transferOutResult] = await this.db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, accountId),
          eq(transactions.type, "transfer"),
        ),
      );

    // Transfers IN to this account (use toAmount for cross-currency)
    const [transferInResult] = await this.db
      .select({
        total: sql<number>`COALESCE(SUM(${transactions.toAmount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.toAccountId, accountId),
          eq(transactions.type, "transfer"),
        ),
      );

    return (
      account.initialBalance +
      (incomeResult?.total ?? 0) -
      (expenseResult?.total ?? 0) -
      (transferOutResult?.total ?? 0) +
      (transferInResult?.total ?? 0)
    );
  }

  async getWithBalance(accountId: string): Promise<AccountWithBalance | undefined> {
    const account = await this.getById(accountId);
    if (!account) return undefined;
    return { ...account, balance: await this.getBalance(accountId) };
  }

  async listWithBalances(options?: {
    includeArchived?: boolean;
  }): Promise<AccountWithBalance[]> {
    const accountsList = await this.list(options);
    const results: AccountWithBalance[] = [];
    for (const account of accountsList) {
      results.push({ ...account, balance: await this.getBalance(account.id) });
    }
    return results;
  }
}
