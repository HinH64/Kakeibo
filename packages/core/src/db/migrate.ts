import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";
import { seedCurrencies, seedCategories, seedSettings } from "./seed.js";
import { currencies, categories, settings } from "./schema.js";

export function runMigrations(dbPath: string) {
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });

  // Run schema migrations
  migrate(db, { migrationsFolder: "./drizzle" });

  return db;
}

export function seedDatabase(db: ReturnType<typeof drizzle>) {
  // Seed currencies
  for (const currency of seedCurrencies) {
    db.insert(currencies)
      .values(currency)
      .onConflictDoNothing()
      .run();
  }

  // Seed categories
  for (const category of seedCategories) {
    db.insert(categories)
      .values(category)
      .onConflictDoNothing()
      .run();
  }

  // Seed settings
  for (const setting of seedSettings) {
    db.insert(settings)
      .values(setting)
      .onConflictDoNothing()
      .run();
  }
}
