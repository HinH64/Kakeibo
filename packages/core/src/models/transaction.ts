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

  create(
    data: Omit<NewTransaction, "id" | "createdAt" | "updatedAt">,
  ): Transaction {
    this.validate(data);
    const id = uuid();
    const now = new Date().toISOString();
    const result = this.db
      .insert(transactions)
      .values({ ...data, id, createdAt: now, updatedAt: now })
      .returning()
      .get();
    return result;
  }

  getById(id: string): Transaction | undefined {
    return this.db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .get();
  }

  list(filter?: TransactionFilter): Transaction[] {
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

    return query.all();
  }

  listWithDetails(filter?: TransactionFilter): TransactionWithDetails[] {
    const txns = this.list(filter);
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
      const acc = this.db.select().from(accounts).where(eq(accounts.id, id)).get();
      if (acc) accountMap.set(id, { name: acc.name, currencyCode: acc.currencyCode });
    }

    const categoryMap = new Map<string, { name: string; icon: string | null; color: string | null }>();
    for (const id of categoryIds) {
      const cat = this.db.select().from(categories).where(eq(categories.id, id)).get();
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

  getWithDetails(id: string): TransactionWithDetails | undefined {
    const txn = this.getById(id);
    if (!txn) return undefined;

    const account = this.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, txn.accountId))
      .get();

    const category = txn.categoryId
      ? this.db
          .select()
          .from(categories)
          .where(eq(categories.id, txn.categoryId))
          .get()
      : undefined;

    const toAccount = txn.toAccountId
      ? this.db
          .select()
          .from(accounts)
          .where(eq(accounts.id, txn.toAccountId))
          .get()
      : undefined;

    const tagRows = this.db
      .select({ name: tags.name })
      .from(transactionTags)
      .innerJoin(tags, eq(transactionTags.tagId, tags.id))
      .where(eq(transactionTags.transactionId, id))
      .all();

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

  update(
    id: string,
    data: Partial<Omit<NewTransaction, "id" | "createdAt" | "updatedAt">>,
  ): Transaction | undefined {
    const now = new Date().toISOString();
    return this.db
      .update(transactions)
      .set({ ...data, updatedAt: now })
      .where(eq(transactions.id, id))
      .returning()
      .get();
  }

  delete(id: string): void {
    this.db.delete(transactions).where(eq(transactions.id, id)).run();
  }

  /**
   * Get spending totals grouped by category for a date range.
   */
  getSpendingByCategory(dateFrom: string, dateTo: string) {
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
      .groupBy(transactions.categoryId)
      .all();
  }

  /**
   * Get monthly income/expense totals for an account.
   */
  getMonthlyTrend(accountId?: string, months: number = 6) {
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
      .orderBy(sql`substr(${transactions.date}, 1, 7)`)
      .all();
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
