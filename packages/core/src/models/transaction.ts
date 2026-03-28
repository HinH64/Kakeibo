import { eq, and, gte, lte, like, desc, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { transactions, accounts, categories, tags, transactionTags } from "../db/schema.js";
import type { KakeiboDB } from "../db/index.js";
import type { Transaction, NewTransaction, TransactionWithDetails } from "../types/index.js";

export interface TransactionFilter {
  accountId?: string;
  categoryId?: string;
  type?: "expense" | "income" | "transfer";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class TransactionModel {
  constructor(private db: KakeiboDB) {}

  async create(
    data: Omit<NewTransaction, "id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction> {
    this.validate(data);
    const id = uuid();
    const now = new Date().toISOString();
    const [result] = await this.db
      .insert(transactions)
      .values({ ...data, id, createdAt: now, updatedAt: now })
      .returning();
    return result;
  }

  async getById(id: string): Promise<Transaction | undefined> {
    const rows = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return rows[0];
  }

  async list(filter?: TransactionFilter): Promise<Transaction[]> {
    const conditions = [];

    if (filter?.accountId) {
      conditions.push(eq(transactions.accountId, filter.accountId));
    }
    if (filter?.categoryId) {
      conditions.push(eq(transactions.categoryId, filter.categoryId));
    }
    if (filter?.type) {
      conditions.push(eq(transactions.type, filter.type));
    }
    if (filter?.dateFrom) {
      conditions.push(gte(transactions.date, filter.dateFrom));
    }
    if (filter?.dateTo) {
      conditions.push(lte(transactions.date, filter.dateTo));
    }
    if (filter?.search) {
      conditions.push(like(transactions.note, `%${filter.search}%`));
    }

    let query = this.db
      .select()
      .from(transactions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .$dynamic();

    if (filter?.limit) {
      query = query.limit(filter.limit);
    }
    if (filter?.offset) {
      query = query.offset(filter.offset);
    }

    return query;
  }

  async listWithDetails(filter?: TransactionFilter): Promise<TransactionWithDetails[]> {
    const txns = await this.list(filter);
    if (txns.length === 0) return [];

    // Build lookup maps to avoid N+1
    const accountIds = new Set<string>();
    const categoryIds = new Set<string>();
    for (const t of txns) {
      accountIds.add(t.accountId);
      if (t.toAccountId) accountIds.add(t.toAccountId);
      if (t.categoryId) categoryIds.add(t.categoryId);
    }

    const accountMap = new Map<string, { name: string; currencyCode: string }>();
    for (const id of accountIds) {
      const rows = await this.db.select().from(accounts).where(eq(accounts.id, id));
      const acc = rows[0];
      if (acc) accountMap.set(id, { name: acc.name, currencyCode: acc.currencyCode });
    }

    const categoryMap = new Map<string, { name: string; icon: string | null; color: string | null }>();
    for (const id of categoryIds) {
      const rows = await this.db.select().from(categories).where(eq(categories.id, id));
      const cat = rows[0];
      if (cat) categoryMap.set(id, { name: cat.name, icon: cat.icon, color: cat.color });
    }

    return txns.map((t) => {
      const acc = accountMap.get(t.accountId);
      const cat = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
      const toAcc = t.toAccountId ? accountMap.get(t.toAccountId) : undefined;
      return {
        ...t,
        accountName: acc?.name ?? "",
        accountCurrency: acc?.currencyCode ?? "",
        categoryName: cat?.name,
        categoryIcon: cat?.icon ?? undefined,
        toAccountName: toAcc?.name,
        toAccountCurrency: toAcc?.currencyCode,
        tagNames: [],
      };
    });
  }

  async getWithDetails(id: string): Promise<TransactionWithDetails | undefined> {
    const txn = await this.getById(id);
    if (!txn) return undefined;

    const accountRows = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, txn.accountId));
    const account = accountRows[0];

    const category = txn.categoryId
      ? (await this.db
          .select()
          .from(categories)
          .where(eq(categories.id, txn.categoryId)))[0]
      : undefined;

    const toAccount = txn.toAccountId
      ? (await this.db
          .select()
          .from(accounts)
          .where(eq(accounts.id, txn.toAccountId)))[0]
      : undefined;

    const tagRows = await this.db
      .select({ name: tags.name })
      .from(transactionTags)
      .innerJoin(tags, eq(transactionTags.tagId, tags.id))
      .where(eq(transactionTags.transactionId, id));

    return {
      ...txn,
      accountName: account?.name ?? "",
      accountCurrency: account?.currencyCode ?? "",
      categoryName: category?.name,
      categoryIcon: category?.icon ?? undefined,
      toAccountName: toAccount?.name,
      toAccountCurrency: toAccount?.currencyCode,
      tagNames: tagRows.map((r) => r.name),
    };
  }

  async update(
    id: string,
    data: Partial<Omit<NewTransaction, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Transaction | undefined> {
    const now = new Date().toISOString();
    const [result] = await this.db
      .update(transactions)
      .set({ ...data, updatedAt: now })
      .where(eq(transactions.id, id))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(transactions).where(eq(transactions.id, id));
  }

  /**
   * Get spending totals grouped by category for a date range.
   */
  async getSpendingByCategory(dateFrom: string, dateTo: string) {
    return this.db
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
        total: sql<number>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.type, "expense"),
          gte(transactions.date, dateFrom),
          lte(transactions.date, dateTo),
        ),
      )
      .groupBy(transactions.categoryId, categories.name, categories.icon, categories.color);
  }

  /**
   * Get monthly income/expense totals for an account.
   */
  async getMonthlyTrend(accountId?: string, months: number = 6) {
    const conditions = [
      sql`${transactions.type} IN ('income', 'expense')`,
    ];
    if (accountId) {
      conditions.push(eq(transactions.accountId, accountId));
    }

    return this.db
      .select({
        month: sql<string>`substr(${transactions.date}, 1, 7)`,
        type: transactions.type,
        total: sql<number>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(sql`substr(${transactions.date}, 1, 7)`, transactions.type)
      .orderBy(sql`substr(${transactions.date}, 1, 7)`);
  }

  private validate(
    data: Omit<NewTransaction, "id" | "createdAt" | "updatedAt">,
  ) {
    if (data.amount <= 0) {
      throw new Error("Transaction amount must be positive");
    }

    if (data.type === "transfer") {
      if (!data.toAccountId) {
        throw new Error("Transfer must have a destination account");
      }
      if (data.accountId === data.toAccountId) {
        throw new Error("Cannot transfer to the same account");
      }
      if (data.toAmount !== undefined && data.toAmount !== null && data.toAmount <= 0) {
        throw new Error("Transfer destination amount must be positive");
      }
    }
  }
}
