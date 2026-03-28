export { createDatabase, type KakeiboDB } from "./db/index.js";
export { runMigrations, seedDatabase } from "./db/migrate.js";
export * from "./db/schema.js";
export { seedCurrencies, seedCategories, seedSettings } from "./db/seed.js";

// Models
export { AccountModel } from "./models/account.js";
export { TransactionModel, type TransactionFilter } from "./models/transaction.js";
export { CategoryModel } from "./models/category.js";
export { CurrencyModel } from "./models/currency.js";

// Types
export type * from "./types/index.js";

// Re-export drizzle utilities so consumers use the same instance
export { eq, and, or, desc, asc, sql, between, like, inArray } from "drizzle-orm";
