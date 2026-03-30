import { pgTable, text, integer, doublePrecision, boolean, uniqueIndex } from "drizzle-orm/pg-core";

// ─── Currencies ──────────────────────────────────────────────────────────────

export const currencies = pgTable("currencies", {
  code: text("code").primaryKey(), // ISO 4217: "USD", "JPY", "TWD"
  symbol: text("symbol").notNull(), // "$", "¥", "NT$"
  name: text("name").notNull(), // "US Dollar"
  nameZh: text("name_zh"), // "美元"
  nameJa: text("name_ja"), // "米ドル"
  decimalPlaces: integer("decimal_places").notNull().default(2), // JPY=0, most=2
  isActive: boolean("is_active").notNull().default(true),
});

// ─── Accounts ────────────────────────────────────────────────────────────────

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  type: text("type", {
    enum: ["asset", "liability", "income", "expense"],
  }).notNull(),
  subtype: text("subtype", {
    enum: ["checking", "savings", "credit_card", "cash", "investment", "loan", "other"],
  }),
  currencyCode: text("currency_code")
    .notNull()
    .references(() => currencies.code),
  icon: text("icon"), // emoji or icon identifier
  color: text("color"), // hex color
  sortOrder: integer("sort_order").notNull().default(0),
  isArchived: boolean("is_archived").notNull().default(false),
  initialBalance: integer("initial_balance").notNull().default(0), // smallest currency unit
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ─── Categories ──────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameZh: text("name_zh"),
  nameJa: text("name_ja"),
  icon: text("icon"), // emoji
  color: text("color"), // hex
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  parentId: text("parent_id").references((): any => categories.id),
  sortOrder: integer("sort_order").notNull().default(0),
  isArchived: boolean("is_archived").notNull().default(false),
});

// ─── Transactions ────────────────────────────────────────────────────────────

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // ISO date: "2026-03-26"
  type: text("type", { enum: ["expense", "income", "transfer"] }).notNull(),
  note: text("note"),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  amount: integer("amount").notNull(), // smallest currency unit, always positive
  categoryId: text("category_id").references(() => categories.id),
  // For transfers between accounts
  toAccountId: text("to_account_id").references(() => accounts.id),
  toAmount: integer("to_amount"), // amount received (may differ for cross-currency)
  exchangeRate: doublePrecision("exchange_rate"), // 1 unit of source = X units of target
  // Metadata
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringId: text("recurring_id"),
  locationLat: doublePrecision("location_lat"),
  locationLon: doublePrecision("location_lon"),
  photoPath: text("photo_path"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ─── Tags ────────────────────────────────────────────────────────────────────

export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const transactionTags = pgTable(
  "transaction_tags",
  {
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id),
  },
);

// ─── Exchange Rates ──────────────────────────────────────────────────────────

export const exchangeRates = pgTable(
  "exchange_rates",
  {
    id: text("id").primaryKey(),
    date: text("date").notNull(),
    fromCurrency: text("from_currency")
      .notNull()
      .references(() => currencies.code),
    toCurrency: text("to_currency")
      .notNull()
      .references(() => currencies.code),
    rate: doublePrecision("rate").notNull(),
    source: text("source").default("manual"), // "manual", "ecb"
  },
  (table) => [
    uniqueIndex("exchange_rates_unique").on(
      table.date,
      table.fromCurrency,
      table.toCurrency,
    ),
  ],
);

// ─── Budgets ─────────────────────────────────────────────────────────────────

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").references(() => categories.id), // NULL = total budget
  currencyCode: text("currency_code")
    .notNull()
    .references(() => currencies.code),
  amount: integer("amount").notNull(), // budget limit in smallest unit
  period: text("period", { enum: ["monthly", "weekly", "yearly"] }).notNull(),
  startDate: text("start_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// ─── Financial Targets ──────────────────────────────────────────────────────

export const financialTargets = pgTable("financial_targets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["floor", "milestone"] }).notNull(),
  amount: integer("amount").notNull(), // smallest currency unit
  currencyCode: text("currency_code")
    .notNull()
    .references(() => currencies.code),
  targetMonth: text("target_month"), // YYYY-MM, only for milestone
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ─── Planned Events ─────────────────────────────────────────────────────────

export const plannedEvents = pgTable("planned_events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(), // positive = income, negative = expense
  currencyCode: text("currency_code")
    .notNull()
    .references(() => currencies.code),
  month: text("month").notNull(), // YYYY-MM
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ─── Settings ────────────────────────────────────────────────────────────────

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
